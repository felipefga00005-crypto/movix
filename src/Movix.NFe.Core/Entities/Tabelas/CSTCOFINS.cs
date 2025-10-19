using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Movix.NFe.Core.Entities;

/// <summary>
/// Tabela CST COFINS - Código de Situação Tributária do COFINS
/// </summary>
[Table("CSTCOFINS")]
public class CSTCOFINS
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

