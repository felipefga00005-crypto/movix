using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Movix.NFe.Core.Entities;

/// <summary>
/// Tabela CEST - Código Especificador da Substituição Tributária
/// </summary>
[Table("CEST")]
public class CEST
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(7)]
    public string Codigo { get; set; } = string.Empty;

    [Required]
    [MaxLength(500)]
    public string Descricao { get; set; } = string.Empty;

    [MaxLength(8)]
    public string? NCM { get; set; }

    public bool Ativo { get; set; } = true;

    // Navegação
    public virtual ICollection<Produto> Produtos { get; set; } = new List<Produto>();
    public virtual ICollection<NotaFiscalItem> ItensNotaFiscal { get; set; } = new List<NotaFiscalItem>();
}

