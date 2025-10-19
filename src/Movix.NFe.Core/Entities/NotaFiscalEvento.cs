using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Movix.NFe.Core.Entities;

/// <summary>
/// Entidade para eventos da NFe (Cancelamento, Carta de Correção, etc.)
/// </summary>
[Table("NotasFiscaisEventos")]
public class NotaFiscalEvento
{
    [Key]
    public int Id { get; set; }

    public int NotaFiscalId { get; set; }

    [ForeignKey(nameof(NotaFiscalId))]
    public virtual NotaFiscal NotaFiscal { get; set; } = null!;

    /// <summary>
    /// Tipo de evento (110110=Carta de Correção, 110111=Cancelamento, etc.)
    /// </summary>
    [Required]
    [MaxLength(10)]
    public string TipoEvento { get; set; } = string.Empty;

    /// <summary>
    /// Descrição do evento
    /// </summary>
    [Required]
    [MaxLength(100)]
    public string DescricaoEvento { get; set; } = string.Empty;

    /// <summary>
    /// Sequência do evento
    /// </summary>
    public int Sequencia { get; set; } = 1;

    /// <summary>
    /// Justificativa/Correção
    /// </summary>
    [MaxLength(1000)]
    public string? Justificativa { get; set; }

    /// <summary>
    /// Protocolo do evento
    /// </summary>
    [MaxLength(20)]
    public string? Protocolo { get; set; }

    /// <summary>
    /// Data e hora do evento
    /// </summary>
    public DateTime DataEvento { get; set; } = DateTime.Now;

    /// <summary>
    /// Data e hora de registro do evento
    /// </summary>
    public DateTime? DataRegistro { get; set; }

    /// <summary>
    /// Status do evento (1=Pendente, 2=Registrado, 3=Rejeitado)
    /// </summary>
    public int Status { get; set; } = 1;

    /// <summary>
    /// Mensagem de retorno da SEFAZ
    /// </summary>
    [MaxLength(500)]
    public string? MensagemRetorno { get; set; }

    /// <summary>
    /// XML do evento
    /// </summary>
    public string? XmlEvento { get; set; }

    /// <summary>
    /// XML do protocolo do evento
    /// </summary>
    public string? XmlProtocolo { get; set; }

    public DateTime DataCadastro { get; set; } = DateTime.Now;
}

