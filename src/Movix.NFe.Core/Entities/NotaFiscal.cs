using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Movix.NFe.Core.Entities;

/// <summary>
/// Entidade Nota Fiscal Eletrônica
/// </summary>
[Table("NotasFiscais")]
public class NotaFiscal
{
    [Key]
    public int Id { get; set; }

    public int EmitenteId { get; set; }

    [ForeignKey(nameof(EmitenteId))]
    public virtual Emitente Emitente { get; set; } = null!;

    public int ClienteId { get; set; }

    [ForeignKey(nameof(ClienteId))]
    public virtual Cliente Cliente { get; set; } = null!;

    public int NaturezaOperacaoId { get; set; }

    [ForeignKey(nameof(NaturezaOperacaoId))]
    public virtual NaturezaOperacao NaturezaOperacao { get; set; } = null!;

    /// <summary>
    /// Modelo da NFe (55=NFe, 65=NFCe)
    /// </summary>
    public int Modelo { get; set; } = 55;

    /// <summary>
    /// Série da NFe
    /// </summary>
    public int Serie { get; set; } = 1;

    /// <summary>
    /// Número da NFe
    /// </summary>
    public long Numero { get; set; }

    /// <summary>
    /// Data e hora de emissão
    /// </summary>
    public DateTime DataEmissao { get; set; } = DateTime.Now;

    /// <summary>
    /// Data e hora de saída/entrada
    /// </summary>
    public DateTime? DataSaidaEntrada { get; set; }

    /// <summary>
    /// Tipo de operação (0=Entrada, 1=Saída)
    /// </summary>
    public int TipoOperacao { get; set; } = 1;

    /// <summary>
    /// Finalidade (1=Normal, 2=Complementar, 3=Ajuste, 4=Devolução)
    /// </summary>
    public int Finalidade { get; set; } = 1;

    /// <summary>
    /// Tipo de atendimento (0=Não se aplica, 1=Operação presencial, 2=Não presencial Internet, etc.)
    /// </summary>
    public int TipoAtendimento { get; set; } = 1;

    /// <summary>
    /// Chave de acesso da NFe (44 dígitos)
    /// </summary>
    [MaxLength(44)]
    public string? ChaveAcesso { get; set; }

    /// <summary>
    /// Protocolo de autorização
    /// </summary>
    [MaxLength(20)]
    public string? Protocolo { get; set; }

    /// <summary>
    /// Data e hora de autorização
    /// </summary>
    public DateTime? DataAutorizacao { get; set; }

    /// <summary>
    /// Status da NFe (1=Digitação, 2=Validada, 3=Assinada, 4=Autorizada, 5=Cancelada, 6=Inutilizada, 7=Denegada, 8=Rejeitada)
    /// </summary>
    public int Status { get; set; } = 1;

    /// <summary>
    /// Mensagem de retorno da SEFAZ
    /// </summary>
    [MaxLength(500)]
    public string? MensagemRetorno { get; set; }

    // Valores Totais
    [Column(TypeName = "decimal(18,2)")]
    public decimal ValorProdutos { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal ValorFrete { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal ValorSeguro { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal ValorDesconto { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal ValorOutrasDespesas { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal ValorTotal { get; set; }

    // Valores Tributários
    [Column(TypeName = "decimal(18,2)")]
    public decimal BaseCalculoICMS { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal ValorICMS { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal ValorICMSST { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal ValorPIS { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal ValorCOFINS { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal ValorIPI { get; set; }

    /// <summary>
    /// Informações complementares
    /// </summary>
    [MaxLength(5000)]
    public string? InformacoesComplementares { get; set; }

    /// <summary>
    /// Informações adicionais de interesse do Fisco
    /// </summary>
    [MaxLength(2000)]
    public string? InformacoesFisco { get; set; }

    /// <summary>
    /// XML da NFe
    /// </summary>
    public string? XmlNFe { get; set; }

    /// <summary>
    /// XML do protocolo de autorização
    /// </summary>
    public string? XmlProtocolo { get; set; }

    /// <summary>
    /// Caminho do PDF do DANFE
    /// </summary>
    [MaxLength(500)]
    public string? CaminhoPDF { get; set; }

    public DateTime DataCadastro { get; set; } = DateTime.Now;

    public DateTime? DataAlteracao { get; set; }

    // Navegação
    public virtual ICollection<NotaFiscalItem> Itens { get; set; } = new List<NotaFiscalItem>();
    public virtual ICollection<NotaFiscalEvento> Eventos { get; set; } = new List<NotaFiscalEvento>();
}

