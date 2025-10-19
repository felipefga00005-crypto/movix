using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Movix.NFe.Core.Entities;

/// <summary>
/// Entidade Emitente - Empresa que emite a NFe
/// </summary>
[Table("Emitentes")]
public class Emitente
{
    [Key]
    public int Id { get; set; }

    [Required]
    [MaxLength(14)]
    public string CNPJ { get; set; } = string.Empty;

    [Required]
    [MaxLength(200)]
    public string RazaoSocial { get; set; } = string.Empty;

    [MaxLength(200)]
    public string? NomeFantasia { get; set; }

    [Required]
    [MaxLength(20)]
    public string InscricaoEstadual { get; set; } = string.Empty;

    [MaxLength(20)]
    public string? InscricaoMunicipal { get; set; }

    [MaxLength(10)]
    public string? CNAE { get; set; }

    /// <summary>
    /// 1=Simples Nacional, 2=Simples Nacional - excesso, 3=Regime Normal
    /// </summary>
    public int RegimeTributario { get; set; } = 1;

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

    /// <summary>
    /// Caminho do certificado digital
    /// </summary>
    [MaxLength(500)]
    public string? CertificadoCaminho { get; set; }

    /// <summary>
    /// Senha do certificado digital (criptografada)
    /// </summary>
    [MaxLength(500)]
    public string? CertificadoSenha { get; set; }

    /// <summary>
    /// Número de série do certificado
    /// </summary>
    [MaxLength(100)]
    public string? CertificadoSerial { get; set; }

    /// <summary>
    /// Série padrão para emissão de NFe
    /// </summary>
    public int SeriePadrao { get; set; } = 1;

    /// <summary>
    /// Último número de NFe emitida
    /// </summary>
    public long UltimoNumeroNFe { get; set; } = 0;

    public bool Ativo { get; set; } = true;

    public DateTime DataCadastro { get; set; } = DateTime.Now;

    public DateTime? DataAlteracao { get; set; }

    // Navegação
    public virtual ICollection<NotaFiscal> NotasFiscais { get; set; } = new List<NotaFiscal>();
}

