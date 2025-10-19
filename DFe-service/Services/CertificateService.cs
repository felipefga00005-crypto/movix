using System.Security.Cryptography.X509Certificates;
using DFeService.Models;

namespace DFeService.Services;

public class CertificateService : ICertificateService
{
    private readonly ILogger<CertificateService> _logger;

    public CertificateService(ILogger<CertificateService> logger)
    {
        _logger = logger;
    }

    public X509Certificate2 LoadCertificate(CertificateData certificateData)
    {
        try
        {
            _logger.LogInformation("Carregando certificado digital...");
            
            var certificate = new X509Certificate2(
                certificateData.Content,
                certificateData.Password,
                X509KeyStorageFlags.MachineKeySet | X509KeyStorageFlags.Exportable
            );

            if (!ValidateCertificate(certificate))
            {
                throw new InvalidOperationException("Certificado inválido ou expirado");
            }

            _logger.LogInformation("Certificado carregado com sucesso. Válido até: {ExpiryDate}", 
                certificate.NotAfter);

            return certificate;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao carregar certificado digital");
            throw new InvalidOperationException("Erro ao carregar certificado: " + ex.Message, ex);
        }
    }

    public bool ValidateCertificate(X509Certificate2 certificate)
    {
        if (certificate == null)
        {
            _logger.LogWarning("Certificado é nulo");
            return false;
        }

        if (DateTime.Now > certificate.NotAfter)
        {
            _logger.LogWarning("Certificado expirado em: {ExpiryDate}", certificate.NotAfter);
            return false;
        }

        if (DateTime.Now < certificate.NotBefore)
        {
            _logger.LogWarning("Certificado ainda não é válido. Válido a partir de: {StartDate}", 
                certificate.NotBefore);
            return false;
        }

        if (!certificate.HasPrivateKey)
        {
            _logger.LogWarning("Certificado não possui chave privada");
            return false;
        }

        return true;
    }
}

