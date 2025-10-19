using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Movix.NFe.Core.Entities;

/// <summary>
/// Tabela CSOSN - Código de Situação da Operação no Simples Nacional
/// </summary>
[Table("CSOSN")]
public class CSOSN
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(3)]
    public string Codigo { get; set; } = string.Empty;

    [Required]
    [MaxLength(300)]
    public string Descricao { get; set; } = string.Empty;

    public bool Ativo { get; set; } = true;

    // Navegação
    public virtual ICollection<Produto> Produtos { get; set; } = new List<Produto>();
    public virtual ICollection<NotaFiscalItem> ItensNotaFiscal { get; set; } = new List<NotaFiscalItem>();
}

