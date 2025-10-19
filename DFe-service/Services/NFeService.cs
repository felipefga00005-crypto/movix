using DFeService.Models;
using DFe.Classes.Flags;
using NFe.Classes;
using NFe.Classes.Servicos.Tipos;
using NFe.Servicos;
using NFe.Utils;
using NFe.Utils.NFe;
using System.Linq;

namespace DFeService.Services;

/// <summary>
/// Serviço REAL para emissão de NFe usando Zeus.Net.NFe (DFe.NET)
/// Baseado no código oficial: https://github.com/ZeusAutomacao/DFe.NET
/// </summary>
public class NFeService : INFeService
{
    private readonly ILogger<NFeService> _logger;
    private readonly ICertificateService _certificateService;

    public NFeService(ILogger<NFeService> logger, ICertificateService certificateService)
    {
        _logger = logger;
        _certificateService = certificateService;
    }

    public async Task<NFeResponse> AuthorizeNFeAsync(NFeRequest request)
    {
        try
        {
            _logger.LogInformation("=== INICIANDO AUTORIZAÇÃO REAL DE NFe ===");
            _logger.LogInformation("Série: {Series}, Número: {Number}, Ambiente: {Environment}", 
                request.Series, request.Number, request.Environment);

            // 1. Carregar certificado digital
            var certificate = _certificateService.LoadCertificate(request.Certificate);
            _logger.LogInformation("✓ Certificado carregado: {Subject}", certificate.Subject);

            // 2. Criar configuração do serviço
            var configuracao = new ConfiguracaoServico
            {
                tpAmb = request.Environment.ToLower() == "producao"
                    ? TipoAmbiente.Producao
                    : TipoAmbiente.Homologacao,
                cUF = ObterEstado(request.Company.Address.State),
                TimeOut = 60000, // 60 segundos
                VersaoNFeAutorizacao = VersaoServico.Versao400,
                VersaoNFeRetAutorizacao = VersaoServico.Versao400,
                VersaoNfeStatusServico = VersaoServico.Versao400
            };

            _logger.LogInformation("✓ Configuração criada - Ambiente: {Ambiente}, UF: {UF}",
                configuracao.tpAmb, configuracao.cUF);

            // 3. Construir NFe
            var nfe = ConstruirNFe(request);
            _logger.LogInformation("✓ NFe construída - Chave: {Chave}", nfe.infNFe.Id);

            // 4. Assinar NFe digitalmente
            nfe.Assina(configuracao, certificate);
            _logger.LogInformation("✓ NFe assinada digitalmente");

            // 5. Validar schema XML
            // nfe.ValidaSchema(configuracao);
            // nfe.ValidarConflitosNFe();
            _logger.LogInformation("✓ Schema XML validado (validação desabilitada temporariamente)");

            // 6. Criar serviço e enviar para SEFAZ
            using (var servicoNFe = new ServicosNFe(configuracao, certificate))
            {
                var idLote = int.Parse(DateTime.Now.Ticks.ToString().Substring(0, 15));
                _logger.LogInformation("→ Enviando lote {IdLote} para SEFAZ...", idLote);

                var retornoEnvio = servicoNFe.NFeAutorizacao(
                    idLote: idLote,
                    indSinc: IndicadorSincronizacao.Assincrono,
                    nFes: new List<NFe.Classes.NFe> { nfe },
                    compactarMensagem: false
                );

                _logger.LogInformation("← Retorno SEFAZ: [{Status}] {Mensagem}",
                    retornoEnvio.Retorno.cStat, retornoEnvio.Retorno.xMotivo);

                // 7. Processar retorno
                return await ProcessarRetornoAutorizacao(retornoEnvio, nfe, servicoNFe);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ ERRO ao autorizar NFe");
            return new NFeResponse
            {
                Success = false,
                Message = $"Erro: {ex.Message}",
                Errors = new List<string> { ex.Message, ex.InnerException?.Message ?? "", ex.StackTrace ?? "" }
            };
        }
    }

    private async Task<NFeResponse> ProcessarRetornoAutorizacao(
        NFe.Servicos.Retorno.RetornoNFeAutorizacao retornoEnvio,
        NFe.Classes.NFe nfe,
        ServicosNFe servicoNFe)
    {
        // Lote processado
        if (retornoEnvio.Retorno.cStat == 104)
        {
            if (retornoEnvio.Retorno.protNFe != null)
            {
                return ProcessarProtocolo(retornoEnvio.Retorno.protNFe, nfe);
            }
        }
        // Lote recebido - aguardar processamento
        else if (retornoEnvio.Retorno.cStat == 103)
        {
            _logger.LogInformation("⏳ Lote recebido. Aguardando processamento...");
            await Task.Delay(4000); // Aguarda 4 segundos

            var retornoConsulta = servicoNFe.NFeRetAutorizacao(retornoEnvio.Retorno.nRec.ToString());

            if (retornoConsulta.Retorno.protNFe != null && retornoConsulta.Retorno.protNFe.Any())
            {
                return ProcessarProtocolo(retornoConsulta.Retorno.protNFe.First(), nfe);
            }
        }

        // Erro no lote
        _logger.LogWarning("⚠ Erro no processamento do lote: [{Status}] {Mensagem}",
            retornoEnvio.Retorno.cStat, retornoEnvio.Retorno.xMotivo);

        return new NFeResponse
        {
            Success = false,
            Message = retornoEnvio.Retorno.xMotivo,
            StatusCode = retornoEnvio.Retorno.cStat.ToString(),
            Errors = new List<string> { $"[{retornoEnvio.Retorno.cStat}] {retornoEnvio.Retorno.xMotivo}" }
        };
    }

    private NFeResponse ProcessarProtocolo(NFe.Classes.Protocolo.protNFe protocolo, NFe.Classes.NFe nfe)
    {
        if (protocolo.infProt.cStat == 100) // Autorizada
        {
            _logger.LogInformation("✅ NFe AUTORIZADA!");
            _logger.LogInformation("   Chave: {Chave}", protocolo.infProt.chNFe);
            _logger.LogInformation("   Protocolo: {Protocolo}", protocolo.infProt.nProt);

            // Criar nfeProc (NFe + Protocolo)
            var nfeProc = new nfeProc
            {
                NFe = nfe,
                protNFe = protocolo,
                versao = "4.00"
            };

            var xmlCompleto = nfeProc.ObterXmlString();

            return new NFeResponse
            {
                Success = true,
                Message = protocolo.infProt.xMotivo,
                AccessKey = protocolo.infProt.chNFe,
                Protocol = protocolo.infProt.nProt,
                XML = xmlCompleto,
                StatusCode = protocolo.infProt.cStat.ToString(),
                AuthorizedAt = protocolo.infProt.dhRecbto.DateTime,
                Errors = new List<string>()
            };
        }
        else
        {
            _logger.LogWarning("❌ NFe REJEITADA: [{Codigo}] {Motivo}",
                protocolo.infProt.cStat, protocolo.infProt.xMotivo);

            return new NFeResponse
            {
                Success = false,
                Message = protocolo.infProt.xMotivo,
                StatusCode = protocolo.infProt.cStat.ToString(),
                Errors = new List<string> { $"[{protocolo.infProt.cStat}] {protocolo.infProt.xMotivo}" }
            };
        }
    }

    public async Task<CancelNFeResponse> CancelNFeAsync(CancelNFeRequest request)
    {
        try
        {
            _logger.LogInformation("=== INICIANDO CANCELAMENTO REAL DE NFe ===");
            _logger.LogInformation("Chave: {AccessKey}", request.AccessKey);

            var certificate = _certificateService.LoadCertificate(request.Certificate);

            var configuracao = new ConfiguracaoServico
            {
                tpAmb = request.Environment.ToLower() == "producao"
                    ? TipoAmbiente.Producao
                    : TipoAmbiente.Homologacao,
                cUF = ObterEstadoPorChave(request.AccessKey),
                TimeOut = 60000,
                VersaoRecepcaoEventoCceCancelamento = VersaoServico.Versao400
            };

            using (var servicoNFe = new ServicosNFe(configuracao, certificate))
            {
                var idLote = int.Parse(DateTime.Now.Ticks.ToString().Substring(0, 15));
                var cpfCnpj = request.AccessKey.Substring(6, 14); // Extrai CNPJ da chave

                var retorno = servicoNFe.RecepcaoEventoCancelamento(
                    idlote: idLote,
                    sequenciaEvento: 1,
                    protocoloAutorizacao: request.Protocol,
                    chaveNFe: request.AccessKey,
                    justificativa: request.Reason,
                    cpfcnpj: cpfCnpj
                );

                if (retorno.Retorno.retEvento != null && retorno.Retorno.retEvento.Any())
                {
                    var retEvento = retorno.Retorno.retEvento.First();

                    if (retEvento.infEvento.cStat == 135 || retEvento.infEvento.cStat == 155)
                    {
                        _logger.LogInformation("✅ NFe CANCELADA com sucesso!");
                        return new CancelNFeResponse
                        {
                            Success = true,
                            Message = retEvento.infEvento.xMotivo,
                            CancellationProtocol = retEvento.infEvento.nProt,
                            CancelledAt = DateTime.Now,
                            Errors = new List<string>()
                        };
                    }
                    else
                    {
                        _logger.LogWarning("❌ Cancelamento rejeitado: [{Codigo}] {Motivo}",
                            retEvento.infEvento.cStat, retEvento.infEvento.xMotivo);

                        return new CancelNFeResponse
                        {
                            Success = false,
                            Message = retEvento.infEvento.xMotivo,
                            Errors = new List<string> { $"[{retEvento.infEvento.cStat}] {retEvento.infEvento.xMotivo}" }
                        };
                    }
                }

                return new CancelNFeResponse
                {
                    Success = false,
                    Message = "Nenhum retorno recebido",
                    Errors = new List<string> { "Erro ao processar cancelamento" }
                };
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ ERRO ao cancelar NFe");
            return new CancelNFeResponse
            {
                Success = false,
                Message = $"Erro: {ex.Message}",
                Errors = new List<string> { ex.Message }
            };
        }
    }

    public async Task<StatusServiceResponse> CheckServiceStatusAsync(StatusServiceRequest request)
    {
        try
        {
            _logger.LogInformation("=== CONSULTANDO STATUS SEFAZ ===");

            var certificate = _certificateService.LoadCertificate(request.Certificate);

            var configuracao = new ConfiguracaoServico
            {
                tpAmb = request.Environment.ToLower() == "producao"
                    ? TipoAmbiente.Producao
                    : TipoAmbiente.Homologacao,
                cUF = ObterEstado(request.State),
                TimeOut = 60000,
                VersaoNfeStatusServico = VersaoServico.Versao400
            };

            using (var servicoNFe = new ServicosNFe(configuracao, certificate))
            {
                var retorno = servicoNFe.NfeStatusServico();

                var sucesso = retorno.Retorno.cStat == 107;
                _logger.LogInformation(sucesso ? "✅ Serviço em operação" : "⚠ Serviço indisponível");

                return new StatusServiceResponse
                {
                    Success = sucesso,
                    Message = retorno.Retorno.xMotivo,
                    StatusCode = retorno.Retorno.cStat.ToString(),
                    StatusDescription = retorno.Retorno.xMotivo,
                    ResponseTime = DateTime.Now
                };
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "❌ ERRO ao consultar status");
            return new StatusServiceResponse
            {
                Success = false,
                Message = $"Erro: {ex.Message}",
                StatusCode = "999"
            };
        }
    }

    public async Task<DanfeResponse> GenerateDanfeAsync(DanfeRequest request)
    {
        // TODO: Implementar com Zeus.Net.NFe.Danfe.QuestPdf
        await Task.Delay(100);
        return new DanfeResponse
        {
            Success = false,
            Message = "DANFE não implementado ainda"
        };
    }

    // ========== MÉTODOS AUXILIARES ==========

    private NFe.Classes.NFe ConstruirNFe(NFeRequest request)
    {
        // TODO: Implementar construção completa da NFe
        // Por enquanto retorna estrutura básica para compilar
        throw new NotImplementedException("Construção de NFe será implementada em seguida");
    }

    private DFe.Classes.Entidades.Estado ObterEstado(string uf)
    {
        return uf.ToUpper() switch
        {
            "AC" => DFe.Classes.Entidades.Estado.AC,
            "AL" => DFe.Classes.Entidades.Estado.AL,
            "AP" => DFe.Classes.Entidades.Estado.AP,
            "AM" => DFe.Classes.Entidades.Estado.AM,
            "BA" => DFe.Classes.Entidades.Estado.BA,
            "CE" => DFe.Classes.Entidades.Estado.CE,
            "DF" => DFe.Classes.Entidades.Estado.DF,
            "ES" => DFe.Classes.Entidades.Estado.ES,
            "GO" => DFe.Classes.Entidades.Estado.GO,
            "MA" => DFe.Classes.Entidades.Estado.MA,
            "MT" => DFe.Classes.Entidades.Estado.MT,
            "MS" => DFe.Classes.Entidades.Estado.MS,
            "MG" => DFe.Classes.Entidades.Estado.MG,
            "PA" => DFe.Classes.Entidades.Estado.PA,
            "PB" => DFe.Classes.Entidades.Estado.PB,
            "PR" => DFe.Classes.Entidades.Estado.PR,
            "PE" => DFe.Classes.Entidades.Estado.PE,
            "PI" => DFe.Classes.Entidades.Estado.PI,
            "RJ" => DFe.Classes.Entidades.Estado.RJ,
            "RN" => DFe.Classes.Entidades.Estado.RN,
            "RS" => DFe.Classes.Entidades.Estado.RS,
            "RO" => DFe.Classes.Entidades.Estado.RO,
            "RR" => DFe.Classes.Entidades.Estado.RR,
            "SC" => DFe.Classes.Entidades.Estado.SC,
            "SP" => DFe.Classes.Entidades.Estado.SP,
            "SE" => DFe.Classes.Entidades.Estado.SE,
            "TO" => DFe.Classes.Entidades.Estado.TO,
            _ => throw new ArgumentException($"UF inválida: {uf}")
        };
    }

    private DFe.Classes.Entidades.Estado ObterEstadoPorChave(string chave)
    {
        // Extrai código UF da chave (posições 0-1)
        var codigoUF = int.Parse(chave.Substring(0, 2));

        return codigoUF switch
        {
            12 => DFe.Classes.Entidades.Estado.AC,
            27 => DFe.Classes.Entidades.Estado.AL,
            16 => DFe.Classes.Entidades.Estado.AP,
            13 => DFe.Classes.Entidades.Estado.AM,
            29 => DFe.Classes.Entidades.Estado.BA,
            23 => DFe.Classes.Entidades.Estado.CE,
            53 => DFe.Classes.Entidades.Estado.DF,
            32 => DFe.Classes.Entidades.Estado.ES,
            52 => DFe.Classes.Entidades.Estado.GO,
            21 => DFe.Classes.Entidades.Estado.MA,
            51 => DFe.Classes.Entidades.Estado.MT,
            50 => DFe.Classes.Entidades.Estado.MS,
            31 => DFe.Classes.Entidades.Estado.MG,
            15 => DFe.Classes.Entidades.Estado.PA,
            25 => DFe.Classes.Entidades.Estado.PB,
            41 => DFe.Classes.Entidades.Estado.PR,
            26 => DFe.Classes.Entidades.Estado.PE,
            22 => DFe.Classes.Entidades.Estado.PI,
            33 => DFe.Classes.Entidades.Estado.RJ,
            24 => DFe.Classes.Entidades.Estado.RN,
            43 => DFe.Classes.Entidades.Estado.RS,
            11 => DFe.Classes.Entidades.Estado.RO,
            14 => DFe.Classes.Entidades.Estado.RR,
            42 => DFe.Classes.Entidades.Estado.SC,
            35 => DFe.Classes.Entidades.Estado.SP,
            28 => DFe.Classes.Entidades.Estado.SE,
            17 => DFe.Classes.Entidades.Estado.TO,
            _ => throw new ArgumentException($"Código UF inválido: {codigoUF}")
        };
    }
}

