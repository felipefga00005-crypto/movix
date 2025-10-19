using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Movix.NFe.Core.Entities;

/// <summary>
/// Entidade Item da Nota Fiscal
/// </summary>
[Table("NotasFiscaisItens")]
public class NotaFiscalItem
{
    [Key]
    public int Id { get; set; }

    public int NotaFiscalId { get; set; }

    [ForeignKey(nameof(NotaFiscalId))]
    public virtual NotaFiscal NotaFiscal { get; set; } = null!;

    public int ProdutoId { get; set; }

    [ForeignKey(nameof(ProdutoId))]
    public virtual Produto Produto { get; set; } = null!;

    /// <summary>
    /// Número do item na NFe
    /// </summary>
    public int NumeroItem { get; set; }

    [Required]
    [MaxLength(60)]
    public string CodigoProduto { get; set; } = string.Empty;

    [MaxLength(14)]
    public string? CodigoBarras { get; set; }

    [Required]
    [MaxLength(300)]
    public string Descricao { get; set; } = string.Empty;

    public int NCMId { get; set; }

    [ForeignKey(nameof(NCMId))]
    public virtual NCM NCM { get; set; } = null!;

    public int? CESTId { get; set; }

    [ForeignKey(nameof(CESTId))]
    public virtual CEST? CEST { get; set; }

    public int CFOPId { get; set; }

    [ForeignKey(nameof(CFOPId))]
    public virtual CFOP CFOP { get; set; } = null!;

    [Required]
    [MaxLength(10)]
    public string Unidade { get; set; } = "UN";

    [Column(TypeName = "decimal(18,4)")]
    public decimal Quantidade { get; set; }

    [Column(TypeName = "decimal(18,4)")]
    public decimal ValorUnitario { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal ValorTotal { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal ValorDesconto { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal ValorFrete { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal ValorSeguro { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal ValorOutrasDespesas { get; set; }

    [MaxLength(500)]
    public string? InformacoesAdicionais { get; set; }

    // ICMS
    public int Origem { get; set; }

    public int? CSTICMSId { get; set; }

    [ForeignKey(nameof(CSTICMSId))]
    public virtual CSTICMS? CSTICMS { get; set; }

    public int? CSOSNId { get; set; }

    [ForeignKey(nameof(CSOSNId))]
    public virtual CSOSN? CSOSN { get; set; }

    public int? ModalidadeBCICMS { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? BaseCalculoICMS { get; set; }

    [Column(TypeName = "decimal(5,2)")]
    public decimal? AliquotaICMS { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? ValorICMS { get; set; }

    // IPI
    public int? CSTIPIId { get; set; }

    [ForeignKey(nameof(CSTIPIId))]
    public virtual CSTIPI? CSTIPI { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? BaseCalculoIPI { get; set; }

    [Column(TypeName = "decimal(5,2)")]
    public decimal? AliquotaIPI { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? ValorIPI { get; set; }

    // PIS
    public int? CSTPISId { get; set; }

    [ForeignKey(nameof(CSTPISId))]
    public virtual CSTPIS? CSTPIS { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? BaseCalculoPIS { get; set; }

    [Column(TypeName = "decimal(5,2)")]
    public decimal? AliquotaPIS { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? ValorPIS { get; set; }

    // COFINS
    public int? CSTCOFINSId { get; set; }

    [ForeignKey(nameof(CSTCOFINSId))]
    public virtual CSTCOFINS? CSTCOFINS { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? BaseCalculoCOFINS { get; set; }

    [Column(TypeName = "decimal(5,2)")]
    public decimal? AliquotaCOFINS { get; set; }

    [Column(TypeName = "decimal(18,2)")]
    public decimal? ValorCOFINS { get; set; }
}

