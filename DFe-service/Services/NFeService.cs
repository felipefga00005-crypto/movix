using System.Security.Cryptography.X509Certificates;
using DFeService.Models;
using DFe.Classes.Entidades;
using DFe.Classes.Flags;
using NFe.Classes;
using NFe.Classes.Informacoes;
using NFe.Classes.Informacoes.Destinatario;
using NFe.Classes.Informacoes.Emitente;
using NFe.Classes.Informacoes.Identificacao;
using NFe.Classes.Informacoes.Identificacao.Tipos;
using NFe.Classes.Informacoes.Detalhe;
using NFe.Classes.Informacoes.Detalhe.Tributacao;
using NFe.Classes.Informacoes.Detalhe.Tributacao.Estadual;
using NFe.Classes.Informacoes.Detalhe.Tributacao.Federal;
using NFe.Classes.Informacoes.Pagamento;
using NFe.Classes.Informacoes.Transporte;
using NFe.Classes.Servicos.Autorizacao;
using NFe.Classes.Servicos.Evento;
using NFe.Classes.Servicos.Status;
using NFe.Servicos;
using NFe.Utils;
using NFe.Utils.NFe;

namespace DFeService.Services;

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
            _logger.LogInformation("Iniciando autorização de NFe - Série: {Series}, Número: {Number}", 
                request.Series, request.Number);

            // 1. Carregar certificado digital
            var certificate = _certificateService.LoadCertificate(request.Certificate);

            // 2. Determinar ambiente (homologação ou produção)
            var ambiente = request.Environment.ToLower() == "producao" 
                ? TipoAmbiente.Producao 
                : TipoAmbiente.Homologacao;

            // 3. Determinar UF do emitente
            var ufEmitente = ObterUF(request.Company.Address.State);

            // 4. Construir NFe
            var nfe = ConstruirNFe(request);

            // 5. Assinar NFe
            var nfeAssinada = AssinarNFe(nfe, certificate);

            // 6. Validar schema XML
            ValidarSchema(nfeAssinada);

            // 7. Enviar para autorização
            var servicoNFe = new ServicosNFe(certificate, ambiente, ufEmitente);
            var retornoAutorizacao = servicoNFe.NFeAutorizacao(
                idLote: DateTime.Now.Ticks.ToString().Substring(0, 15),
                versaoNFe: VersaoServico.Versao400,
                listaEnvio: new List<Classes.NFe> { nfeAssinada }
            );

            // 8. Processar retorno
            if (retornoAutorizacao.Retorno.cStat == "103" || retornoAutorizacao.Retorno.cStat == "104")
            {
                // Aguardar processamento
                _logger.LogInformation("Lote em processamento. Aguardando retorno...");
                await Task.Delay(2000); // Aguarda 2 segundos

                // Consultar recibo
                var retornoConsulta = servicoNFe.NFeRetAutorizacao(retornoAutorizacao.Retorno.infRec.nRec);

                if (retornoConsulta.Retorno.protNFe != null && retornoConsulta.Retorno.protNFe.Any())
                {
                    var protocolo = retornoConsulta.Retorno.protNFe.First();

                    if (protocolo.infProt.cStat == "100") // Autorizada
                    {
                        // Criar nfeProc (NFe + Protocolo)
                        var nfeProc = new Classes.Servicos.Tipos.nfeProc
                        {
                            NFe = nfeAssinada,
                            protNFe = protocolo,
                            versao = "4.00"
                        };

                        var xmlCompleto = FuncoesXml.ClasseParaXmlString(nfeProc);

                        return new NFeResponse
                        {
                            Success = true,
                            Message = protocolo.infProt.xMotivo,
                            AccessKey = protocolo.infProt.chNFe,
                            Protocol = protocolo.infProt.nProt,
                            XML = xmlCompleto,
                            StatusCode = protocolo.infProt.cStat,
                            AuthorizedAt = DateTime.Now,
                            Errors = new List<string>()
                        };
                    }
                    else
                    {
                        // Rejeitada
                        return new NFeResponse
                        {
                            Success = false,
                            Message = $"NFe rejeitada: {protocolo.infProt.xMotivo}",
                            StatusCode = protocolo.infProt.cStat,
                            Errors = new List<string> { $"{protocolo.infProt.cStat} - {protocolo.infProt.xMotivo}" }
                        };
                    }
                }
            }

            // Erro no processamento
            return new NFeResponse
            {
                Success = false,
                Message = $"Erro ao processar NFe: {retornoAutorizacao.Retorno.xMotivo}",
                StatusCode = retornoAutorizacao.Retorno.cStat,
                Errors = new List<string> { $"{retornoAutorizacao.Retorno.cStat} - {retornoAutorizacao.Retorno.xMotivo}" }
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao autorizar NFe");
            return new NFeResponse
            {
                Success = false,
                Message = "Erro interno ao processar NFe",
                Errors = new List<string> { ex.Message, ex.StackTrace ?? "" }
            };
        }
    }

    public async Task<CancelNFeResponse> CancelNFeAsync(CancelNFeRequest request)
    {
        try
        {
            _logger.LogInformation("Iniciando cancelamento de NFe - Chave: {AccessKey}", request.AccessKey);

            // 1. Carregar certificado
            var certificate = _certificateService.LoadCertificate(request.Certificate);

            // 2. Determinar ambiente
            var ambiente = request.Environment.ToLower() == "producao" 
                ? TipoAmbiente.Producao 
                : TipoAmbiente.Homologacao;

            // 3. Extrair UF da chave de acesso (posição 0-1)
            var ufString = request.AccessKey.Substring(0, 2);
            var ufEmitente = ObterUF(ufString);

            // 4. Criar evento de cancelamento
            var servicoNFe = new ServicosNFe(certificate, ambiente, ufEmitente);

            var eventoCancelamento = new Classes.Servicos.Evento.evento(
                versao: "1.00",
                infEvento: new infEventoEnv
                {
                    cOrgao = ufEmitente,
                    tpAmb = ambiente,
                    CNPJ = request.AccessKey.Substring(6, 14), // CNPJ do emitente
                    chNFe = request.AccessKey,
                    dhEvento = DateTime.Now,
                    tpEvento = NFeTipoEvento.teCancelamento,
                    nSeqEvento = 1,
                    verEvento = "1.00",
                    detEvento = new detEvento
                    {
                        versao = "1.00",
                        descEvento = "Cancelamento",
                        nProt = request.Protocol,
                        xJust = request.Reason
                    }
                }
            );

            // 5. Assinar evento
            var eventoAssinado = servicoNFe.RecepcaoEvento(
                idLote: DateTime.Now.Ticks.ToString().Substring(0, 15),
                eventos: new List<Classes.Servicos.Evento.evento> { eventoCancelamento }
            );

            // 6. Processar retorno
            if (eventoAssinado.Retorno.retEvento != null && eventoAssinado.Retorno.retEvento.Any())
            {
                var retorno = eventoAssinado.Retorno.retEvento.First();

                if (retorno.infEvento.cStat == "135" || retorno.infEvento.cStat == "155") // Cancelamento homologado
                {
                    return new CancelNFeResponse
                    {
                        Success = true,
                        Message = retorno.infEvento.xMotivo,
                        CancellationProtocol = retorno.infEvento.nProt,
                        CancelledAt = DateTime.Now,
                        Errors = new List<string>()
                    };
                }
                else
                {
                    return new CancelNFeResponse
                    {
                        Success = false,
                        Message = $"Cancelamento rejeitado: {retorno.infEvento.xMotivo}",
                        Errors = new List<string> { $"{retorno.infEvento.cStat} - {retorno.infEvento.xMotivo}" }
                    };
                }
            }

            return new CancelNFeResponse
            {
                Success = false,
                Message = "Erro ao processar cancelamento",
                Errors = new List<string> { "Nenhum retorno recebido" }
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao cancelar NFe");
            return new CancelNFeResponse
            {
                Success = false,
                Message = "Erro interno ao cancelar NFe",
                Errors = new List<string> { ex.Message }
            };
        }
    }

    public async Task<StatusServiceResponse> CheckServiceStatusAsync(StatusServiceRequest request)
    {
        try
        {
            _logger.LogInformation("Consultando status do serviço SEFAZ - UF: {State}", request.State);

            var certificate = _certificateService.LoadCertificate(request.Certificate);
            var ambiente = request.Environment.ToLower() == "producao" 
                ? TipoAmbiente.Producao 
                : TipoAmbiente.Homologacao;
            var uf = ObterUF(request.State);

            var servicoNFe = new ServicosNFe(certificate, ambiente, uf);
            var retorno = servicoNFe.NFeStatusServico();

            return new StatusServiceResponse
            {
                Success = retorno.Retorno.cStat == "107",
                Message = retorno.Retorno.xMotivo,
                StatusCode = retorno.Retorno.cStat,
                StatusDescription = retorno.Retorno.xMotivo,
                ResponseTime = DateTime.Now
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao consultar status do serviço");
            return new StatusServiceResponse
            {
                Success = false,
                Message = "Erro ao consultar status",
                StatusCode = "999"
            };
        }
    }

    public async Task<DanfeResponse> GenerateDanfeAsync(DanfeRequest request)
    {
        try
        {
            _logger.LogInformation("Gerando DANFE");

            // Desserializar XML
            var nfeProc = FuncoesXml.ArquivoXmlParaClasse<Classes.Servicos.Tipos.nfeProc>(request.XML);

            // TODO: Implementar geração de DANFE com QuestPDF ou FastReport
            // Por enquanto, retorna erro
            return new DanfeResponse
            {
                Success = false,
                Message = "Geração de DANFE não implementada ainda",
                Errors = new List<string> { "Funcionalidade em desenvolvimento" }
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao gerar DANFE");
            return new DanfeResponse
            {
                Success = false,
                Message = "Erro ao gerar DANFE",
                Errors = new List<string> { ex.Message }
            };
        }
    }

    // Métodos auxiliares privados

    private Classes.NFe ConstruirNFe(NFeRequest request)
    {
        var nfe = new Classes.NFe
        {
            infNFe = new infNFe
            {
                versao = "4.00",
                ide = ConstruirIdentificacao(request),
                emit = ConstruirEmitente(request.Company),
                dest = ConstruirDestinatario(request.Customer),
                det = ConstruirItens(request.Items),
                total = ConstruirTotais(request.Items),
                transp = ConstruirTransporte(request.Transport),
                pag = ConstruirPagamento(request.Payment),
                infAdic = string.IsNullOrWhiteSpace(request.AdditionalInfo)
                    ? null
                    : new infAdic { infCpl = request.AdditionalInfo }
            }
        };

        return nfe;
    }

    private ide ConstruirIdentificacao(NFeRequest request)
    {
        var uf = ObterUF(request.Company.Address.State);
        var codigoMunicipio = request.Company.Address.CityCode;

        return new ide
        {
            cUF = uf,
            cNF = GerarCodigoNumerico(),
            natOp = request.OperationNature,
            mod = request.Model == "65" ? ModeloDocumento.NFCe : ModeloDocumento.NFe,
            serie = request.Series,
            nNF = request.Number,
            dhEmi = DateTime.Now,
            dhSaiEnt = DateTime.Now,
            tpNF = (TipoNFe)request.OperationType,
            idDest = DeterminarDestinoOperacao(request.Company.Address.State, request.Customer.Address.State),
            cMunFG = codigoMunicipio,
            tpImp = TipoImpressao.tiRetrato,
            tpEmis = TipoEmissao.teNormal,
            cDV = 0, // Será calculado automaticamente
            tpAmb = request.Environment.ToLower() == "producao" ? TipoAmbiente.Producao : TipoAmbiente.Homologacao,
            finNFe = (FinalidadeNFe)request.Purpose,
            indFinal = (ConsumidorFinal)request.ConsumerOperation,
            indPres = (PresencaComprador)request.PresenceIndicator,
            procEmi = ProcessoEmissao.peAplicativoContribuinte,
            verProc = "1.0.0"
        };
    }

    private emit ConstruirEmitente(CompanyData company)
    {
        return new emit
        {
            CNPJ = company.Document,
            xNome = company.Name,
            xFant = company.TradeName,
            enderEmit = new enderEmit
            {
                xLgr = company.Address.Street,
                nro = company.Address.Number,
                xCpl = company.Address.Complement,
                xBairro = company.Address.District,
                cMun = company.Address.CityCode,
                xMun = company.Address.City,
                UF = company.Address.State,
                CEP = company.Address.ZipCode.Replace("-", ""),
                cPais = int.Parse(company.Address.CountryCode),
                xPais = company.Address.Country,
                fone = company.Phone?.Replace("(", "").Replace(")", "").Replace("-", "").Replace(" ", "")
            },
            IE = company.StateRegistration,
            IM = company.MunicipalRegistration,
            CRT = (CRT)company.TaxRegime
        };
    }

    private dest ConstruirDestinatario(CustomerData customer)
    {
        var dest = new dest
        {
            enderDest = new enderDest
            {
                xLgr = customer.Address.Street,
                nro = customer.Address.Number,
                xCpl = customer.Address.Complement,
                xBairro = customer.Address.District,
                cMun = customer.Address.CityCode,
                xMun = customer.Address.City,
                UF = customer.Address.State,
                CEP = customer.Address.ZipCode.Replace("-", ""),
                cPais = int.Parse(customer.Address.CountryCode),
                xPais = customer.Address.Country,
                fone = customer.Phone?.Replace("(", "").Replace(")", "").Replace("-", "").Replace(" ", "")
            },
            email = customer.Email
        };

        // CPF ou CNPJ
        if (customer.PersonType.ToLower() == "fisica")
        {
            dest.CPF = customer.Document;
            dest.xNome = customer.Name;
        }
        else
        {
            dest.CNPJ = customer.Document;
            dest.xNome = customer.Name;
            dest.xFant = customer.TradeName;
        }

        // Indicador IE
        if (customer.StateRegistrationType.ToLower() == "contribuinte")
        {
            dest.indIEDest = indIEDest.Contribuinte;
            dest.IE = customer.StateRegistration;
        }
        else if (customer.StateRegistrationType.ToLower() == "isento")
        {
            dest.indIEDest = indIEDest.Isento;
        }
        else
        {
            dest.indIEDest = indIEDest.NaoContribuinte;
        }

        return dest;
    }

    private List<det> ConstruirItens(List<NFeItemData> items)
    {
        var detalhes = new List<det>();

        foreach (var item in items)
        {
            var detalhe = new det
            {
                nItem = item.ItemNumber,
                prod = new prod
                {
                    cProd = item.Code,
                    cEAN = item.Barcode ?? "SEM GTIN",
                    xProd = item.Description,
                    NCM = item.NCM,
                    CFOP = item.CFOP,
                    uCom = item.Unit,
                    qCom = item.Quantity,
                    vUnCom = item.UnitValue,
                    vProd = item.TotalValue,
                    cEANTrib = item.Barcode ?? "SEM GTIN",
                    uTrib = item.Unit,
                    qTrib = item.Quantity,
                    vUnTrib = item.UnitValue,
                    indTot = IndicadorTotal.ValorDoItemCompoeTotalNF,
                    CEST = item.CEST
                },
                imposto = new imposto
                {
                    vTotTrib = 0, // Calcular se necessário
                    ICMS = ConstruirICMS(item.Tax.ICMS, item.Origin),
                    PIS = ConstruirPIS(item.Tax.PIS),
                    COFINS = ConstruirCOFINS(item.Tax.COFINS)
                }
            };

            // IPI se informado
            if (item.Tax.IPI != null)
            {
                detalhe.imposto.IPI = ConstruirIPI(item.Tax.IPI);
            }

            detalhes.Add(detalhe);
        }

        return detalhes;
    }

    private ICMS ConstruirICMS(ICMSData icmsData, int origem)
    {
        // Simples Nacional (CSOSN)
        if (icmsData.CSOSN > 0)
        {
            return new ICMS
            {
                TipoICMS = Detalhe.TipoICMS.ICMSSN102,
                ICMSSN102 = new ICMSSN102
                {
                    orig = (OrigemMercadoria)origem,
                    CSOSN = (Csosnicms)icmsData.CSOSN
                }
            };
        }

        // Regime Normal (CST)
        return new ICMS
        {
            TipoICMS = Detalhe.TipoICMS.ICMS00,
            ICMS00 = new ICMS00
            {
                orig = (OrigemMercadoria)origem,
                CST = CSTICMS.Cst00,
                modBC = DeterminacaoBaseIcms.DbiValorOperacao,
                vBC = icmsData.BaseCalc,
                pICMS = icmsData.Rate,
                vICMS = icmsData.Value
            }
        };
    }

    private PIS ConstruirPIS(PISData pisData)
    {
        return new PIS
        {
            TipoPIS = Detalhe.TipoPIS.PISOutr,
            PISOutr = new PISOutr
            {
                CST = CSTPIS.pis99,
                vBC = pisData.BaseCalc,
                pPIS = pisData.Rate,
                vPIS = pisData.Value
            }
        };
    }

    private COFINS ConstruirCOFINS(COFINSData cofinsData)
    {
        return new COFINS
        {
            TipoCOFINS = Detalhe.TipoCOFINS.COFINSOutr,
            COFINSOutr = new COFINSOutr
            {
                CST = CSTCOFINS.cof99,
                vBC = cofinsData.BaseCalc,
                pCOFINS = cofinsData.Rate,
                vCOFINS = cofinsData.Value
            }
        };
    }

    private IPI? ConstruirIPI(IPIData ipiData)
    {
        return new IPI
        {
            cEnq = "999",
            IPITrib = new IPITrib
            {
                CST = CSTIPI.ipi99,
                vBC = ipiData.BaseCalc,
                pIPI = ipiData.Rate,
                vIPI = ipiData.Value
            }
        };
    }

    private ICMSTot ConstruirTotais(List<NFeItemData> items)
    {
        var totalProdutos = items.Sum(i => i.TotalValue);
        var totalICMS = items.Sum(i => i.Tax.ICMS.Value);
        var totalPIS = items.Sum(i => i.Tax.PIS.Value);
        var totalCOFINS = items.Sum(i => i.Tax.COFINS.Value);
        var totalIPI = items.Where(i => i.Tax.IPI != null).Sum(i => i.Tax.IPI!.Value);

        return new ICMSTot
        {
            vBC = items.Sum(i => i.Tax.ICMS.BaseCalc),
            vICMS = totalICMS,
            vICMSDeson = 0,
            vFCP = 0,
            vBCST = 0,
            vST = 0,
            vFCPST = 0,
            vFCPSTRet = 0,
            vProd = totalProdutos,
            vFrete = 0,
            vSeg = 0,
            vDesc = 0,
            vII = 0,
            vIPI = totalIPI,
            vIPIDevol = 0,
            vPIS = totalPIS,
            vCOFINS = totalCOFINS,
            vOutro = 0,
            vNF = totalProdutos + totalIPI,
            vTotTrib = totalICMS + totalPIS + totalCOFINS + totalIPI
        };
    }

    private transp? ConstruirTransporte(TransportData? transport)
    {
        if (transport == null)
        {
            return new transp
            {
                modFrete = ModalidadeFrete.mfSemFrete
            };
        }

        var transp = new transp
        {
            modFrete = (ModalidadeFrete)transport.Modality
        };

        if (transport.Carrier != null)
        {
            transp.transporta = new transporta
            {
                CNPJ = transport.Carrier.Document,
                xNome = transport.Carrier.Name,
                IE = transport.Carrier.StateRegistration,
                xEnder = transport.Carrier.Address,
                xMun = transport.Carrier.City,
                UF = transport.Carrier.State
            };
        }

        if (transport.Volumes != null && transport.Volumes.Any())
        {
            transp.vol = transport.Volumes.Select(v => new vol
            {
                qVol = v.Quantity,
                esp = v.Species,
                marca = v.Brand,
                nVol = v.Numbering,
                pesoB = v.GrossWeight,
                pesoL = v.NetWeight
            }).ToList();
        }

        return transp;
    }

    private pag? ConstruirPagamento(PaymentData? payment)
    {
        if (payment == null || payment.Methods == null || !payment.Methods.Any())
        {
            return null;
        }

        return new pag
        {
            detPag = payment.Methods.Select(m => new detPag
            {
                indPag = (IndicadorPagamento)payment.Indicator,
                tPag = m.Type,
                vPag = m.Value
            }).ToList()
        };
    }

    private Classes.NFe AssinarNFe(Classes.NFe nfe, X509Certificate2 certificate)
    {
        try
        {
            return new Classes.NFe().Assina(nfe, certificate);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao assinar NFe");
            throw new InvalidOperationException("Falha ao assinar NFe digitalmente", ex);
        }
    }

    private void ValidarSchema(Classes.NFe nfe)
    {
        try
        {
            nfe.ValidarSchema();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro de validação de schema");
            throw new InvalidOperationException("NFe não passou na validação do schema XML", ex);
        }
    }

    private Estado ObterUF(string uf)
    {
        return uf.ToUpper() switch
        {
            "AC" => Estado.AC,
            "AL" => Estado.AL,
            "AP" => Estado.AP,
            "AM" => Estado.AM,
            "BA" => Estado.BA,
            "CE" => Estado.CE,
            "DF" => Estado.DF,
            "ES" => Estado.ES,
            "GO" => Estado.GO,
            "MA" => Estado.MA,
            "MT" => Estado.MT,
            "MS" => Estado.MS,
            "MG" => Estado.MG,
            "PA" => Estado.PA,
            "PB" => Estado.PB,
            "PR" => Estado.PR,
            "PE" => Estado.PE,
            "PI" => Estado.PI,
            "RJ" => Estado.RJ,
            "RN" => Estado.RN,
            "RS" => Estado.RS,
            "RO" => Estado.RO,
            "RR" => Estado.RR,
            "SC" => Estado.SC,
            "SP" => Estado.SP,
            "SE" => Estado.SE,
            "TO" => Estado.TO,
            _ => throw new ArgumentException($"UF inválida: {uf}")
        };
    }

    private DestinoOperacao DeterminarDestinoOperacao(string ufEmitente, string ufDestinatario)
    {
        if (ufEmitente == ufDestinatario)
            return DestinoOperacao.doInterna;

        return DestinoOperacao.doInterestadual;
    }

    private string GerarCodigoNumerico()
    {
        var random = new Random();
        return random.Next(10000000, 99999999).ToString();
    }
}

