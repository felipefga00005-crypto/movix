using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Movix.NFe.Core.Entities;

/// <summary>
/// Entidade Produto
/// </summary>
[Table("Produtos")]
public class Produto
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(60)]
    public string Codigo { get; set; } = string.Empty;

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

    [Required]
    [MaxLength(10)]
    public string Unidade { get; set; } = "UN";

    [Column(TypeName = "decimal(18,4)")]
    public decimal ValorUnitario { get; set; }

    /// <summary>
    /// Origem da mercadoria (0 a 8)
    /// </summary>
    public int Origem { get; set; } = 0;

    // ICMS Padrão
    public int? CSTICMSId { get; set; }

    [ForeignKey(nameof(CSTICMSId))]
    public virtual CSTICMS? CSTICMS { get; set; }

    public int? CSOSNId { get; set; }

    [ForeignKey(nameof(CSOSNId))]
    public virtual CSOSN? CSOSN { get; set; }

    [Column(TypeName = "decimal(5,2)")]
    public decimal? AliquotaICMS { get; set; }

    // PIS Padrão
    public int? CSTPISId { get; set; }

    [ForeignKey(nameof(CSTPISId))]
    public virtual CSTPIS? CSTPIS { get; set; }

    [Column(TypeName = "decimal(5,2)")]
    public decimal? AliquotaPIS { get; set; }

    // COFINS Padrão
    public int? CSTCOFINSId { get; set; }

    [ForeignKey(nameof(CSTCOFINSId))]
    public virtual CSTCOFINS? CSTCOFINS { get; set; }

    [Column(TypeName = "decimal(5,2)")]
    public decimal? AliquotaCOFINS { get; set; }

    // IPI (se aplicável)
    public int? CSTIPIId { get; set; }

    [ForeignKey(nameof(CSTIPIId))]
    public virtual CSTIPI? CSTIPI { get; set; }

    [Column(TypeName = "decimal(5,2)")]
    public decimal? AliquotaIPI { get; set; }

    public bool Ativo { get; set; } = true;

    public DateTime DataCadastro { get; set; } = DateTime.Now;

    public DateTime? DataAlteracao { get; set; }

    // Navegação
    public virtual ICollection<NotaFiscalItem> ItensNotaFiscal { get; set; } = new List<NotaFiscalItem>();
}

