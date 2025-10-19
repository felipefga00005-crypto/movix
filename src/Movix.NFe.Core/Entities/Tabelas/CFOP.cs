using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Movix.NFe.Core.Entities;

/// <summary>
/// Tabela CFOP - Código Fiscal de Operações e Prestações
/// </summary>
[Table("CFOP")]
public class CFOP
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(4)]
    public string Codigo { get; set; } = string.Empty;

    [Required]
    [MaxLength(300)]
    public string Descricao { get; set; } = string.Empty;

    /// <summary>
    /// Tipo de operação (E=Entrada, S=Saída)
    /// </summary>
    [Required]
    [MaxLength(1)]
    public string TipoOperacao { get; set; } = "S";

    /// <summary>
    /// Aplicação (D=Dentro do Estado, F=Fora do Estado, X=Exterior)
    /// </summary>
    [Required]
    [MaxLength(1)]
    public string Aplicacao { get; set; } = "D";

    public bool Ativo { get; set; } = true;

    // Navegação
    public virtual ICollection<NotaFiscalItem> ItensNotaFiscal { get; set; } = new List<NotaFiscalItem>();
}

