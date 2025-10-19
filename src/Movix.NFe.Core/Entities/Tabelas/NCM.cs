using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Movix.NFe.Core.Entities;

/// <summary>
/// Tabela NCM - Nomenclatura Comum do Mercosul
/// </summary>
[Table("NCM")]
public class NCM
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(8)]
    public string Codigo { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string Descricao { get; set; } = string.Empty;

    /// <summary>
    /// Alíquota nacional (%)
    /// </summary>
    [Column(TypeName = "decimal(5,2)")]
    public decimal? AliquotaNacional { get; set; }

    /// <summary>
    /// Alíquota importação (%)
    /// </summary>
    [Column(TypeName = "decimal(5,2)")]
    public decimal? AliquotaImportacao { get; set; }

    public bool Ativo { get; set; } = true;

    // Navegação
    public virtual ICollection<Produto> Produtos { get; set; } = new List<Produto>();
    public virtual ICollection<NotaFiscalItem> ItensNotaFiscal { get; set; } = new List<NotaFiscalItem>();
}

