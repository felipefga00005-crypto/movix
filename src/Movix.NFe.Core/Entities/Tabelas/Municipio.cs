using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Movix.NFe.Core.Entities;

/// <summary>
/// Tabela de Municípios
/// </summary>
[Table("Municipios")]
public class Municipio
{
    [Key]
    public int Id { get; set; }

    public int EstadoId { get; set; }

    [ForeignKey(nameof(EstadoId))]
    public virtual Estado Estado { get; set; } = null!;

    [Required]
    [MaxLength(100)]
    public string Nome { get; set; } = string.Empty;

    /// <summary>
    /// Código IBGE do município (7 dígitos)
    /// </summary>
    public int CodigoIBGE { get; set; }

    // Navegação
    public virtual ICollection<Emitente> Emitentes { get; set; } = new List<Emitente>();
    public virtual ICollection<Cliente> Clientes { get; set; } = new List<Cliente>();
}

