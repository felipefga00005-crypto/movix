using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Movix.NFe.Core.Entities;

/// <summary>
/// Tabela Natureza de Operação
/// </summary>
[Table("NaturezasOperacao")]
public class NaturezaOperacao
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Descricao { get; set; } = string.Empty;

    public int CFOPPadraoId { get; set; }

    [ForeignKey(nameof(CFOPPadraoId))]
    public virtual CFOP CFOPPadrao { get; set; } = null!;

    /// <summary>
    /// Finalidade (1=Normal, 2=Complementar, 3=Ajuste, 4=Devolução)
    /// </summary>
    public int Finalidade { get; set; } = 1;

    public bool Ativo { get; set; } = true;

    public DateTime DataCadastro { get; set; } = DateTime.Now;

    // Navegação
    public virtual ICollection<NotaFiscal> NotasFiscais { get; set; } = new List<NotaFiscal>();
}

