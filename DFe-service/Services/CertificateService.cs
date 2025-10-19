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
            // Carregar certificado com senha (Content já é byte[])
            var certificate = new X509Certificate2(
                certificateData.Content,
                certificateData.Password,
                X509KeyStorageFlags.MachineKeySet | X509KeyStorageFlags.Exportable
            );

            _logger.LogInformation("Certificado carregado: {Subject}, Válido até: {NotAfter}",
                certificate.Subject, certificate.NotAfter);

            // Verificar validade
            if (certificate.NotAfter < DateTime.Now)
            {
                throw new InvalidOperationException("Certificado digital vencido!");
            }

            if (certificate.NotBefore > DateTime.Now)
            {
                throw new InvalidOperationException("Certificado digital ainda não é válido!");
            }

            // Verificar se tem chave privada
            if (!certificate.HasPrivateKey)
            {
                throw new InvalidOperationException("Certificado não possui chave privada!");
            }

            return certificate;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao carregar certificado");
            throw new InvalidOperationException($"Falha ao carregar certificado: {ex.Message}", ex);
        }
    }
}

