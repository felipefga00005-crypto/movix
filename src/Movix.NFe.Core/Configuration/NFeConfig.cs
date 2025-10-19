using DFe.Classes.Entidades;
using DFe.Classes.Flags;

namespace Movix.NFe.Core.Configuration;

/// <summary>
/// Configurações para emissão de NFe
/// </summary>
public class NFeConfig
{
    /// <summary>
    /// Ambiente de emissão (Homologação ou Produção)
    /// </summary>
    public TipoAmbiente Ambiente { get; set; } = TipoAmbiente.Homologacao;

    /// <summary>
    /// UF do emitente
    /// </summary>
    public Estado UF { get; set; } = Estado.SP;

    /// <summary>
    /// Caminho do certificado digital (.pfx)
    /// </summary>
    public string CertificadoCaminho { get; set; } = string.Empty;

    /// <summary>
    /// Senha do certificado digital
    /// </summary>
    public string CertificadoSenha { get; set; } = string.Empty;

    /// <summary>
    /// Número de série do certificado (alternativa ao caminho do arquivo)
    /// </summary>
    public string? CertificadoSerial { get; set; }

    /// <summary>
    /// Série da NFe
    /// </summary>
    public int Serie { get; set; } = 1;

    /// <summary>
    /// Número da última NFe emitida
    /// </summary>
    public long UltimoNumero { get; set; } = 0;

    /// <summary>
    /// Diretório para salvar XMLs
    /// </summary>
    public string DiretorioXml { get; set; } = "XMLs";

    /// <summary>
    /// Diretório para salvar PDFs
    /// </summary>
    public string DiretorioPdf { get; set; } = "PDFs";

    /// <summary>
    /// Timeout para requisições aos webservices (em segundos)
    /// </summary>
    public int TimeoutSegundos { get; set; } = 30;

    /// <summary>
    /// Salvar XMLs automaticamente
    /// </summary>
    public bool SalvarXmlAutomaticamente { get; set; } = true;

    /// <summary>
    /// Validar schema XML antes de enviar
    /// </summary>
    public bool ValidarSchema { get; set; } = true;
}

