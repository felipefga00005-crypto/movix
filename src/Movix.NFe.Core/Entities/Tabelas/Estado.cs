using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Movix.NFe.Core.Entities;

/// <summary>
/// Tabela de Estados (UF)
/// </summary>
[Table("Estados")]
public class Estado
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(2)]
    public string UF { get; set; } = string.Empty;

    [Required]
    [MaxLength(50)]
    public string Nome { get; set; } = string.Empty;

    /// <summary>
    /// Código IBGE do estado
    /// </summary>
    public int CodigoIBGE { get; set; }

    // Navegação
    public virtual ICollection<Municipio> Municipios { get; set; } = new List<Municipio>();
}

