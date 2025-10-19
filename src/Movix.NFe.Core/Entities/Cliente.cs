using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Movix.NFe.Core.Entities;

/// <summary>
/// Entidade Cliente - Destinatário da NFe
/// </summary>
[Table("Clientes")]
public class Cliente
{
    [Key]
    public int Id { get; set; }

    /// <summary>
    /// 1=Pessoa Física (CPF), 2=Pessoa Jurídica (CNPJ)
    /// </summary>
    public int TipoPessoa { get; set; } = 1;

    [Required]
    [MaxLength(14)]
    public string CpfCnpj { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string Nome { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? InscricaoEstadual { get; set; }

    /// <summary>
    /// 1=Contribuinte ICMS, 2=Isento, 9=Não Contribuinte
    /// </summary>
    public int IndicadorIE { get; set; } = 9;

    [Required]
    [MaxLength(200)]
    public string Logradouro { get; set; } = string.Empty;

    [Required]
    [MaxLength(20)]
    public string Numero { get; set; } = string.Empty;

    [MaxLength(100)]
    public string? Complemento { get; set; }

    [Required]
    [MaxLength(100)]
    public string Bairro { get; set; } = string.Empty;

    public int MunicipioId { get; set; }

    [ForeignKey(nameof(MunicipioId))]
    public virtual Municipio Municipio { get; set; } = null!;

    [Required]
    [MaxLength(8)]
    public string CEP { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? Telefone { get; set; }

    [MaxLength(100)]
    public string? Email { get; set; }

    public bool Ativo { get; set; } = true;

    public DateTime DataCadastro { get; set; } = DateTime.Now;

    public DateTime? DataAlteracao { get; set; }

    // Navegação
    public virtual ICollection<NotaFiscal> NotasFiscais { get; set; } = new List<NotaFiscal>();
}

