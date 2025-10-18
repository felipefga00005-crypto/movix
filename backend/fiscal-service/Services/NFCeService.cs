using FiscalService.Models;
using System.Security.Cryptography.X509Certificates;
using System.Text;
using System.Xml;

namespace FiscalService.Services;

public interface INFCeService
{
    Task<DocumentoFiscalResponse> EmitirNFCeAsync(EmitirNFCeRequest request);
    Task<DocumentoFiscalResponse> CancelarNFCeAsync(CancelarDocumentoRequest request);
    Task<StatusDocumentoResponse> ConsultarStatusAsync(ConsultarStatusRequest request);
}

public class NFCeService : INFCeService
{
    private readonly ILogger<NFCeService> _logger;
    private readonly ICertificadoService _certificadoService;
    private readonly IConfigService _configService;

    public NFCeService(
        ILogger<NFCeService> logger,
        ICertificadoService certificadoService,
        IConfigService configService)
    {
        _logger = logger;
        _certificadoService = certificadoService;
        _configService = configService;
    }

    public async Task<DocumentoFiscalResponse> EmitirNFCeAsync(EmitirNFCeRequest request)
    {
        var response = new DocumentoFiscalResponse();
        
        try
        {
            _logger.LogInformation("Iniciando emissão de NFCe para venda {VendaId}", request.VendaId);

            // 1. Validar dados da requisição
            var validationErrors = ValidarRequest(request);
            if (validationErrors.Any())
            {
                response.Sucesso = false;
                response.Mensagem = "Dados inválidos para emissão da NFCe";
                response.Erros = validationErrors;
                return response;
            }

            // 2. Carregar certificado digital
            var certificado = _certificadoService.CarregarCertificado(
                request.Empresa.CertificadoA1, 
                request.Empresa.SenhaCertificado);
            
            if (certificado == null)
            {
                response.Sucesso = false;
                response.Mensagem = "Erro ao carregar certificado digital";
                response.Erros.Add("Certificado digital inválido ou senha incorreta");
                return response;
            }

            // 3. Gerar número da NFCe
            var numeroNFCe = await GerarProximoNumeroNFCeAsync(request.Empresa);
            
            // 4. Gerar chave de acesso
            var chaveAcesso = GerarChaveAcesso(request.Empresa, numeroNFCe, request.Empresa.SerieNFCe);

            // 5. Montar XML da NFCe
            var xmlNFCe = MontarXMLNFCe(request, numeroNFCe, chaveAcesso);
            
            // 6. Assinar XML
            var xmlAssinado = AssinarXML(xmlNFCe, certificado);
            if (string.IsNullOrEmpty(xmlAssinado))
            {
                response.Sucesso = false;
                response.Mensagem = "Erro ao assinar XML da NFCe";
                response.Erros.Add("Falha na assinatura digital do XML");
                return response;
            }

            // 7. Salvar XML se configurado
            if (_configService.SalvarXML())
            {
                await SalvarXMLAsync(xmlAssinado, chaveAcesso, "enviado");
            }

            // 8. Transmitir para SEFAZ
            var resultadoTransmissao = await TransmitirNFCeAsync(xmlAssinado, request.Empresa);
            
            // 9. Processar retorno
            response.Sucesso = resultadoTransmissao.Autorizada;
            response.Mensagem = resultadoTransmissao.Mensagem;
            response.ChaveAcesso = chaveAcesso;
            response.Numero = numeroNFCe.ToString();
            response.Serie = request.Empresa.SerieNFCe.ToString();
            response.XML = xmlAssinado;
            response.XMLRetorno = resultadoTransmissao.XMLRetorno;
            response.ProtocoloAutorizacao = resultadoTransmissao.Protocolo;
            response.DataAutorizacao = resultadoTransmissao.DataAutorizacao;
            response.Status = resultadoTransmissao.Status;
            response.Erros = resultadoTransmissao.Erros;
            response.Avisos = resultadoTransmissao.Avisos;

            if (response.Sucesso)
            {
                _logger.LogInformation("NFCe emitida com sucesso. Chave: {ChaveAcesso}", chaveAcesso);
            }
            else
            {
                _logger.LogWarning("Falha na emissão da NFCe. Erros: {Erros}", string.Join(", ", response.Erros));
            }

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro inesperado ao emitir NFCe");
            response.Sucesso = false;
            response.Mensagem = "Erro interno do serviço fiscal";
            response.Erros.Add($"Erro técnico: {ex.Message}");
            return response;
        }
    }

    public async Task<DocumentoFiscalResponse> CancelarNFCeAsync(CancelarDocumentoRequest request)
    {
        var response = new DocumentoFiscalResponse();
        
        try
        {
            _logger.LogInformation("Iniciando cancelamento de NFCe. Chave: {ChaveAcesso}", request.ChaveAcesso);

            // Implementar lógica de cancelamento
            // Por enquanto, retorna não implementado
            response.Sucesso = false;
            response.Mensagem = "Cancelamento de NFCe não implementado ainda";
            response.Erros.Add("Funcionalidade em desenvolvimento");

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao cancelar NFCe");
            response.Sucesso = false;
            response.Mensagem = "Erro interno do serviço fiscal";
            response.Erros.Add($"Erro técnico: {ex.Message}");
            return response;
        }
    }

    public async Task<StatusDocumentoResponse> ConsultarStatusAsync(ConsultarStatusRequest request)
    {
        var response = new StatusDocumentoResponse();
        
        try
        {
            _logger.LogInformation("Consultando status da NFCe. Chave: {ChaveAcesso}", request.ChaveAcesso);

            // Implementar lógica de consulta
            // Por enquanto, retorna não implementado
            response.Sucesso = false;
            response.Mensagem = "Consulta de status não implementada ainda";
            response.Erros.Add("Funcionalidade em desenvolvimento");

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao consultar status da NFCe");
            response.Sucesso = false;
            response.Mensagem = "Erro interno do serviço fiscal";
            response.Erros.Add($"Erro técnico: {ex.Message}");
            return response;
        }
    }

    // ============================================
    // MÉTODOS PRIVADOS
    // ============================================

    private List<string> ValidarRequest(EmitirNFCeRequest request)
    {
        var erros = new List<string>();

        if (request.VendaId == 0)
            erros.Add("ID da venda é obrigatório");

        if (string.IsNullOrWhiteSpace(request.NumeroVenda))
            erros.Add("Número da venda é obrigatório");

        if (string.IsNullOrWhiteSpace(request.Empresa.CNPJ))
            erros.Add("CNPJ da empresa é obrigatório");

        if (string.IsNullOrWhiteSpace(request.Empresa.CertificadoA1))
            erros.Add("Certificado digital é obrigatório");

        if (!request.Itens.Any())
            erros.Add("Pelo menos um item deve ser informado");

        if (request.TotalVenda <= 0)
            erros.Add("Total da venda deve ser maior que zero");

        // Validar itens
        for (int i = 0; i < request.Itens.Count; i++)
        {
            var item = request.Itens[i];
            if (string.IsNullOrWhiteSpace(item.Nome))
                erros.Add($"Nome do item {i + 1} é obrigatório");
            
            if (item.Quantidade <= 0)
                erros.Add($"Quantidade do item {i + 1} deve ser maior que zero");
            
            if (item.ValorUnitario <= 0)
                erros.Add($"Valor unitário do item {i + 1} deve ser maior que zero");
        }

        return erros;
    }

    private async Task<int> GerarProximoNumeroNFCeAsync(EmpresaData empresa)
    {
        // Por enquanto, gera um número baseado no timestamp
        // Em produção, deveria consultar o último número usado no banco
        var timestamp = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        var numero = (int)(timestamp % 999999999);
        
        _logger.LogInformation("Número NFCe gerado: {Numero}", numero);
        return numero;
    }

    private string GerarChaveAcesso(EmpresaData empresa, int numero, int serie)
    {
        try
        {
            var codigoUF = GetCodigoUF(empresa.UF);
            var dataEmissao = DateTime.Now.ToString("yyMM");
            var cnpj = empresa.CNPJ.Replace(".", "").Replace("/", "").Replace("-", "");
            var modelo = "65"; // NFCe
            var serieFormatada = serie.ToString("D3");
            var numeroFormatado = numero.ToString("D9");
            var tipoEmissao = "1"; // Normal
            var codigoNumerico = new Random().Next(10000000, 99999999).ToString();

            // Monta chave sem DV
            var chaveSemDV = $"{codigoUF}{dataEmissao}{cnpj}{modelo}{serieFormatada}{numeroFormatado}{tipoEmissao}{codigoNumerico}";
            
            // Calcula dígito verificador
            var dv = CalcularDigitoVerificador(chaveSemDV);
            
            var chaveCompleta = chaveSemDV + dv;
            
            _logger.LogInformation("Chave de acesso gerada: {ChaveAcesso}", chaveCompleta);
            return chaveCompleta;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao gerar chave de acesso");
            throw;
        }
    }

    private string CalcularDigitoVerificador(string chave)
    {
        var sequencia = "4329876543298765432987654329876543298765432";
        var soma = 0;

        for (int i = 0; i < chave.Length; i++)
        {
            soma += int.Parse(chave[i].ToString()) * int.Parse(sequencia[i].ToString());
        }

        var resto = soma % 11;
        var dv = resto < 2 ? 0 : 11 - resto;

        return dv.ToString();
    }

    private string MontarXMLNFCe(EmitirNFCeRequest request, int numero, string chaveAcesso)
    {
        try
        {
            _logger.LogInformation("Montando XML da NFCe");

            // Esta é uma implementação simplificada
            // Em produção, deveria usar a biblioteca DFe.NET para montar o XML corretamente
            var xml = new StringBuilder();
            xml.AppendLine("<?xml version=\"1.0\" encoding=\"UTF-8\"?>");
            xml.AppendLine("<nfeProc xmlns=\"http://www.portalfiscal.inf.br/nfe\" versao=\"4.00\">");
            xml.AppendLine("  <NFe xmlns=\"http://www.portalfiscal.inf.br/nfe\">");
            xml.AppendLine($"    <infNFe Id=\"NFe{chaveAcesso}\" versao=\"4.00\">");
            
            // Identificação
            xml.AppendLine("      <ide>");
            xml.AppendLine($"        <cUF>{GetCodigoUF(request.Empresa.UF)}</cUF>");
            xml.AppendLine($"        <cNF>{chaveAcesso.Substring(35, 8)}</cNF>");
            xml.AppendLine("        <natOp>Venda</natOp>");
            xml.AppendLine("        <mod>65</mod>");
            xml.AppendLine($"        <serie>{request.Empresa.SerieNFCe}</serie>");
            xml.AppendLine($"        <nNF>{numero}</nNF>");
            xml.AppendLine($"        <dhEmi>{DateTime.Now:yyyy-MM-ddTHH:mm:sszzz}</dhEmi>");
            xml.AppendLine("        <tpNF>1</tpNF>");
            xml.AppendLine($"        <idDest>{(request.Cliente != null ? "1" : "0")}</idDest>");
            xml.AppendLine($"        <cMunFG>{request.Empresa.CidadeId}</cMunFG>");
            xml.AppendLine("        <tpImp>4</tpImp>");
            xml.AppendLine("        <tpEmis>1</tpEmis>");
            xml.AppendLine($"        <cDV>{chaveAcesso.Substring(43, 1)}</cDV>");
            xml.AppendLine($"        <tpAmb>{request.Empresa.AmbienteNFe}</tpAmb>");
            xml.AppendLine("        <finNFe>1</finNFe>");
            xml.AppendLine("        <indFinal>1</indFinal>");
            xml.AppendLine("        <indPres>1</indPres>");
            xml.AppendLine("        <procEmi>0</procEmi>");
            xml.AppendLine("        <verProc>1.0.0</verProc>");
            xml.AppendLine("      </ide>");

            // Emitente
            xml.AppendLine("      <emit>");
            xml.AppendLine($"        <CNPJ>{request.Empresa.CNPJ.Replace(".", "").Replace("/", "").Replace("-", "")}</CNPJ>");
            xml.AppendLine($"        <xNome>{request.Empresa.RazaoSocial}</xNome>");
            if (!string.IsNullOrEmpty(request.Empresa.NomeFantasia))
                xml.AppendLine($"        <xFant>{request.Empresa.NomeFantasia}</xFant>");
            xml.AppendLine("        <enderEmit>");
            xml.AppendLine($"          <xLgr>{request.Empresa.Logradouro}</xLgr>");
            xml.AppendLine($"          <nro>{request.Empresa.Numero}</nro>");
            if (!string.IsNullOrEmpty(request.Empresa.Complemento))
                xml.AppendLine($"          <xCpl>{request.Empresa.Complemento}</xCpl>");
            xml.AppendLine($"          <xBairro>{request.Empresa.Bairro}</xBairro>");
            xml.AppendLine($"          <cMun>{request.Empresa.CidadeId}</cMun>");
            xml.AppendLine($"          <xMun>Cidade</xMun>");
            xml.AppendLine($"          <UF>{request.Empresa.UF}</UF>");
            xml.AppendLine($"          <CEP>{request.Empresa.CEP.Replace("-", "")}</CEP>");
            xml.AppendLine("          <cPais>1058</cPais>");
            xml.AppendLine("          <xPais>BRASIL</xPais>");
            xml.AppendLine("        </enderEmit>");
            xml.AppendLine($"        <IE>{request.Empresa.InscricaoEstadual}</IE>");
            xml.AppendLine($"        <CRT>{request.Empresa.RegimeTributario}</CRT>");
            xml.AppendLine("      </emit>");

            // Destinatário (se houver)
            if (request.Cliente != null && !string.IsNullOrEmpty(request.Cliente.CPF))
            {
                xml.AppendLine("      <dest>");
                xml.AppendLine($"        <CPF>{request.Cliente.CPF.Replace(".", "").Replace("-", "")}</CPF>");
                xml.AppendLine($"        <xNome>{request.Cliente.Nome}</xNome>");
                xml.AppendLine($"        <indIEDest>{request.Cliente.IndIEDest}</indIEDest>");
                xml.AppendLine("      </dest>");
            }

            // Itens
            for (int i = 0; i < request.Itens.Count; i++)
            {
                var item = request.Itens[i];
                xml.AppendLine($"      <det nItem=\"{i + 1}\">");
                xml.AppendLine("        <prod>");
                xml.AppendLine($"          <cProd>{item.Codigo}</cProd>");
                xml.AppendLine($"          <cEAN></cEAN>");
                xml.AppendLine($"          <xProd>{item.Nome}</xProd>");
                xml.AppendLine($"          <NCM>{item.NCM ?? "00000000"}</NCM>");
                xml.AppendLine($"          <CFOP>{request.NaturezaOperacao.CFOPDentroEstado}</CFOP>");
                xml.AppendLine($"          <uCom>{item.Unidade}</uCom>");
                xml.AppendLine($"          <qCom>{item.Quantidade:F4}</qCom>");
                xml.AppendLine($"          <vUnCom>{item.ValorUnitario:F2}</vUnCom>");
                xml.AppendLine($"          <vProd>{item.ValorTotal:F2}</vProd>");
                xml.AppendLine($"          <cEANTrib></cEANTrib>");
                xml.AppendLine($"          <uTrib>{item.Unidade}</uTrib>");
                xml.AppendLine($"          <qTrib>{item.Quantidade:F4}</qTrib>");
                xml.AppendLine($"          <vUnTrib>{item.ValorUnitario:F2}</vUnTrib>");
                xml.AppendLine($"          <indTot>1</indTot>");
                xml.AppendLine("        </prod>");
                xml.AppendLine("        <imposto>");
                xml.AppendLine("          <ICMS>");
                xml.AppendLine("            <ICMSSN102>");
                xml.AppendLine($"              <orig>{item.OrigemProduto}</orig>");
                xml.AppendLine($"              <CSOSN>{item.CSOSN ?? "102"}</CSOSN>");
                xml.AppendLine("            </ICMSSN102>");
                xml.AppendLine("          </ICMS>");
                xml.AppendLine("        </imposto>");
                xml.AppendLine("      </det>");
            }

            // Total
            xml.AppendLine("      <total>");
            xml.AppendLine("        <ICMSTot>");
            xml.AppendLine($"          <vBC>0.00</vBC>");
            xml.AppendLine($"          <vICMS>0.00</vICMS>");
            xml.AppendLine($"          <vICMSDeson>0.00</vICMSDeson>");
            xml.AppendLine($"          <vBCST>0.00</vBCST>");
            xml.AppendLine($"          <vST>0.00</vST>");
            xml.AppendLine($"          <vProd>{request.TotalProdutos:F2}</vProd>");
            xml.AppendLine($"          <vFrete>0.00</vFrete>");
            xml.AppendLine($"          <vSeg>0.00</vSeg>");
            xml.AppendLine($"          <vDesc>{request.TotalDesconto:F2}</vDesc>");
            xml.AppendLine($"          <vII>0.00</vII>");
            xml.AppendLine($"          <vIPI>0.00</vIPI>");
            xml.AppendLine($"          <vPIS>0.00</vPIS>");
            xml.AppendLine($"          <vCOFINS>0.00</vCOFINS>");
            xml.AppendLine($"          <vOutro>0.00</vOutro>");
            xml.AppendLine($"          <vNF>{request.TotalVenda:F2}</vNF>");
            xml.AppendLine("        </ICMSTot>");
            xml.AppendLine("      </total>");

            // Pagamento
            xml.AppendLine("      <pag>");
            xml.AppendLine("        <detPag>");
            xml.AppendLine($"          <tPag>{request.FormaPagamento.FormaPagamento:D2}</tPag>");
            xml.AppendLine($"          <vPag>{request.FormaPagamento.Valor:F2}</vPag>");
            xml.AppendLine("        </detPag>");
            xml.AppendLine("      </pag>");

            xml.AppendLine("    </infNFe>");
            xml.AppendLine("  </NFe>");
            xml.AppendLine("</nfeProc>");

            var xmlString = xml.ToString();
            _logger.LogInformation("XML da NFCe montado com sucesso");
            return xmlString;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao montar XML da NFCe");
            throw;
        }
    }

    private string AssinarXML(string xml, X509Certificate2 certificado)
    {
        try
        {
            _logger.LogInformation("Assinando XML da NFCe");
            
            // Implementação simplificada - em produção usar DFe.NET
            // Por enquanto, retorna o XML sem assinatura
            _logger.LogWarning("Assinatura digital não implementada - usando XML sem assinatura");
            return xml;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao assinar XML");
            return string.Empty;
        }
    }

    private async Task<bool> SalvarXMLAsync(string xml, string chaveAcesso, string tipo)
    {
        try
        {
            var pasta = tipo == "enviado" ? _configService.GetPastaXMLEnviados() : _configService.GetPastaXMLRetornos();
            var nomeArquivo = $"{chaveAcesso}-{tipo}.xml";
            var caminhoCompleto = Path.Combine(pasta, nomeArquivo);

            await File.WriteAllTextAsync(caminhoCompleto, xml, Encoding.UTF8);
            _logger.LogInformation("XML salvo: {Caminho}", caminhoCompleto);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao salvar XML");
            return false;
        }
    }

    private async Task<ResultadoTransmissao> TransmitirNFCeAsync(string xml, EmpresaData empresa)
    {
        try
        {
            _logger.LogInformation("Transmitindo NFCe para SEFAZ");

            // Implementação simplificada - em produção usar DFe.NET
            // Por enquanto, simula uma resposta de sucesso
            await Task.Delay(1000); // Simula tempo de transmissão

            return new ResultadoTransmissao
            {
                Autorizada = true,
                Mensagem = "NFCe autorizada com sucesso (simulação)",
                Status = "Autorizada",
                Protocolo = "123456789012345",
                DataAutorizacao = DateTime.Now,
                XMLRetorno = "<retorno>Simulação de retorno SEFAZ</retorno>",
                Erros = new List<string>(),
                Avisos = new List<string> { "Esta é uma simulação - implementar DFe.NET" }
            };
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao transmitir NFCe");
            return new ResultadoTransmissao
            {
                Autorizada = false,
                Mensagem = "Erro na transmissão",
                Status = "Erro",
                Erros = new List<string> { ex.Message }
            };
        }
    }

    // Método para obter código da UF
    private int GetCodigoUF(string uf)
    {
        var codigosUF = new Dictionary<string, int>
        {
            ["RO"] = 11, ["AC"] = 12, ["AM"] = 13, ["RR"] = 14,
            ["PA"] = 15, ["AP"] = 16, ["TO"] = 17, ["MA"] = 21,
            ["PI"] = 22, ["CE"] = 23, ["RN"] = 24, ["PB"] = 25,
            ["PE"] = 26, ["AL"] = 27, ["SE"] = 28, ["BA"] = 29,
            ["MG"] = 31, ["ES"] = 32, ["RJ"] = 33, ["SP"] = 35,
            ["PR"] = 41, ["SC"] = 42, ["RS"] = 43, ["MS"] = 50,
            ["MT"] = 51, ["GO"] = 52, ["DF"] = 53
        };

        return codigosUF.ContainsKey(uf) ? codigosUF[uf] : 35; // Default SP
    }

    // Classe auxiliar para resultado da transmissão
    private class ResultadoTransmissao
    {
        public bool Autorizada { get; set; }
        public string Mensagem { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string? Protocolo { get; set; }
        public DateTime? DataAutorizacao { get; set; }
        public string? XMLRetorno { get; set; }
        public List<string> Erros { get; set; } = new();
        public List<string> Avisos { get; set; } = new();
    }
}
