using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace FiscalService.Models;

// ============================================
// MODELOS DE REQUEST
// ============================================

public class EmitirNFCeRequest
{
    [Required]
    public uint VendaId { get; set; }
    
    [Required]
    public string NumeroVenda { get; set; } = string.Empty;
    
    [Required]
    public EmpresaData Empresa { get; set; } = new();
    
    public ClienteData? Cliente { get; set; }
    
    [Required]
    public List<ItemVendaData> Itens { get; set; } = new();
    
    [Required]
    public decimal TotalProdutos { get; set; }
    
    public decimal TotalDesconto { get; set; }
    
    [Required]
    public decimal TotalVenda { get; set; }
    
    [Required]
    public NaturezaOperacaoData NaturezaOperacao { get; set; } = new();
    
    public string? InformacoesAdicionais { get; set; }
    
    public FormaPagamentoData FormaPagamento { get; set; } = new();
}

public class EmitirNFeRequest
{
    [Required]
    public uint VendaId { get; set; }
    
    [Required]
    public string NumeroVenda { get; set; } = string.Empty;
    
    [Required]
    public EmpresaData Empresa { get; set; } = new();
    
    [Required]
    public ClienteData Cliente { get; set; } = new();
    
    [Required]
    public List<ItemVendaData> Itens { get; set; } = new();
    
    [Required]
    public decimal TotalProdutos { get; set; }
    
    public decimal TotalDesconto { get; set; }
    
    [Required]
    public decimal TotalVenda { get; set; }
    
    [Required]
    public NaturezaOperacaoData NaturezaOperacao { get; set; } = new();
    
    public string? InformacoesAdicionais { get; set; }
    
    public TransporteData? Transporte { get; set; }
}

public class CancelarDocumentoRequest
{
    [Required]
    public string ChaveAcesso { get; set; } = string.Empty;
    
    [Required]
    public string Justificativa { get; set; } = string.Empty;
    
    [Required]
    public EmpresaData Empresa { get; set; } = new();
}

public class ConsultarStatusRequest
{
    [Required]
    public string ChaveAcesso { get; set; } = string.Empty;
    
    [Required]
    public EmpresaData Empresa { get; set; } = new();
}

// ============================================
// MODELOS DE RESPONSE
// ============================================

public class DocumentoFiscalResponse
{
    public bool Sucesso { get; set; }
    public string Mensagem { get; set; } = string.Empty;
    public string? ChaveAcesso { get; set; }
    public string? Numero { get; set; }
    public string? Serie { get; set; }
    public string? XML { get; set; }
    public string? XMLRetorno { get; set; }
    public string? ProtocoloAutorizacao { get; set; }
    public DateTime? DataAutorizacao { get; set; }
    public string Status { get; set; } = string.Empty;
    public List<string> Erros { get; set; } = new();
    public List<string> Avisos { get; set; } = new();
    public Dictionary<string, object> DadosAdicionais { get; set; } = new();
}

public class StatusDocumentoResponse
{
    public bool Sucesso { get; set; }
    public string Mensagem { get; set; } = string.Empty;
    public string ChaveAcesso { get; set; } = string.Empty;
    public string Status { get; set; } = string.Empty;
    public string? ProtocoloAutorizacao { get; set; }
    public DateTime? DataConsulta { get; set; }
    public string? XMLRetorno { get; set; }
    public List<string> Erros { get; set; } = new();
}

// ============================================
// MODELOS DE DADOS
// ============================================

public class EmpresaData
{
    [Required]
    public string RazaoSocial { get; set; } = string.Empty;
    
    public string? NomeFantasia { get; set; }
    
    [Required]
    public string CNPJ { get; set; } = string.Empty;
    
    public string? InscricaoEstadual { get; set; }
    
    public string? InscricaoMunicipal { get; set; }
    
    [Required]
    public string Logradouro { get; set; } = string.Empty;
    
    [Required]
    public string Numero { get; set; } = string.Empty;
    
    public string? Complemento { get; set; }
    
    [Required]
    public string Bairro { get; set; } = string.Empty;
    
    [Required]
    public string CEP { get; set; } = string.Empty;
    
    [Required]
    public string UF { get; set; } = string.Empty;
    
    [Required]
    public uint CidadeId { get; set; }
    
    public string? Telefone { get; set; }
    
    public string? Email { get; set; }
    
    [Required]
    public int RegimeTributario { get; set; } // 1=SN, 2=SN Excesso, 3=Normal
    
    [Required]
    public int AmbienteNFe { get; set; } // 1=Produção, 2=Homologação
    
    [Required]
    public int SerieNFe { get; set; }
    
    [Required]
    public int SerieNFCe { get; set; }
    
    [Required]
    public string CertificadoA1 { get; set; } = string.Empty; // Base64
    
    [Required]
    public string SenhaCertificado { get; set; } = string.Empty;
}

public class ClienteData
{
    public string? Nome { get; set; }
    public string? Email { get; set; }
    public string? CPF { get; set; }
    public string? CNPJ { get; set; }
    public string? InscricaoEstadual { get; set; }
    public string? Telefone { get; set; }
    public string? Logradouro { get; set; }
    public string? Numero { get; set; }
    public string? Complemento { get; set; }
    public string? Bairro { get; set; }
    public string? CEP { get; set; }
    public string? UF { get; set; }
    public uint? CidadeId { get; set; }
    public int IndIEDest { get; set; } = 9; // 1=Contribuinte, 2=Isento, 9=Não contribuinte
}

public class ItemVendaData
{
    [Required]
    public uint ProdutoId { get; set; }
    
    [Required]
    public string Nome { get; set; } = string.Empty;
    
    [Required]
    public string Codigo { get; set; } = string.Empty;
    
    [Required]
    public decimal Quantidade { get; set; }
    
    [Required]
    public string Unidade { get; set; } = string.Empty;
    
    [Required]
    public decimal ValorUnitario { get; set; }
    
    public decimal ValorDesconto { get; set; }
    
    [Required]
    public decimal ValorTotal { get; set; }
    
    // Dados Fiscais
    public string? NCM { get; set; }
    public string? CEST { get; set; }
    public int OrigemProduto { get; set; }
    public string? CSTICMS { get; set; }
    public string? CSOSN { get; set; }
    public decimal AliquotaICMS { get; set; }
    public decimal AliquotaIPI { get; set; }
    public decimal AliquotaPIS { get; set; }
    public decimal AliquotaCOFINS { get; set; }
    public bool CalculaICMS { get; set; } = true;
    public bool CalculaIPI { get; set; }
    public bool CalculaPIS { get; set; } = true;
    public bool CalculaCOFINS { get; set; } = true;
}

public class NaturezaOperacaoData
{
    [Required]
    public string Codigo { get; set; } = string.Empty;
    
    [Required]
    public string Descricao { get; set; } = string.Empty;
    
    [Required]
    public string CFOPDentroEstado { get; set; } = string.Empty;
    
    [Required]
    public string CFOPForaEstado { get; set; } = string.Empty;
    
    public string? CFOPExterior { get; set; }
    
    public int FinalidadeNFe { get; set; } = 1; // 1=Normal, 2=Complementar, 3=Ajuste, 4=Devolução
}

public class FormaPagamentoData
{
    public int FormaPagamento { get; set; } = 1; // 01=Dinheiro, 02=Cheque, 03=Cartão Crédito, etc
    public decimal Valor { get; set; }
    public string? Descricao { get; set; }
}

public class TransporteData
{
    public int ModalidadeFrete { get; set; } = 9; // 0=Emitente, 1=Destinatário, 9=Sem frete
    public string? TransportadoraCNPJ { get; set; }
    public string? TransportadoraNome { get; set; }
    public string? Veiculo { get; set; }
    public string? Placa { get; set; }
    public string? UF { get; set; }
}

// ============================================
// MODELOS DE CONFIGURAÇÃO
// ============================================

public class ConfiguracaoFiscal
{
    public int Ambiente { get; set; } = 2; // 1=Produção, 2=Homologação
    public string UF { get; set; } = "SP";
    public string PastaXMLEnviados { get; set; } = "XML/Enviados";
    public string PastaXMLRetornos { get; set; } = "XML/Retornos";
    public bool SalvarXML { get; set; } = true;
    public int TimeoutWebService { get; set; } = 30000; // 30 segundos
    public bool ValidarSchema { get; set; } = true;
}

// ============================================
// ENUMS
// ============================================

public enum TipoDocumento
{
    NFe = 55,
    NFCe = 65,
    CTe = 57,
    MDFe = 58
}

public enum StatusDocumento
{
    NaoEmitido,
    Processando,
    Autorizado,
    Rejeitado,
    Cancelado,
    Denegado
}
