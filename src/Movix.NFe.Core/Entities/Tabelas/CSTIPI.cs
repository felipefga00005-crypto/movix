using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Movix.NFe.Core.Entities;

/// <summary>
/// Tabela CST IPI - Código de Situação Tributária do IPI
/// </summary>
[Table("CSTIPI")]
public class CSTIPI
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(2)]
    public string Codigo { get; set; } = string.Empty;

    [Required]
    [MaxLength(300)]
    public string Descricao { get; set; } = string.Empty;

    public bool Ativo { get; set; } = true;

    // Navegação
    public virtual ICollection<Produto> Produtos { get; set; } = new List<Produto>();
    public virtual ICollection<NotaFiscalItem> ItensNotaFiscal { get; set; } = new List<NotaFiscalItem>();
}

