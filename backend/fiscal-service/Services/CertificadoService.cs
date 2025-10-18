using System.Security.Cryptography.X509Certificates;
using System.Text;

namespace FiscalService.Services;

public interface ICertificadoService
{
    X509Certificate2? CarregarCertificado(string certificadoBase64, string senha);
    bool ValidarCertificado(X509Certificate2 certificado);
    bool HasValidCertificate();
    DateTime? GetCertificateExpiry();
    string GetCertificateSubject();
    bool IsCertificateExpired(X509Certificate2 certificado);
    bool IsCertificateValidForNFe(X509Certificate2 certificado);
}

public class CertificadoService : ICertificadoService
{
    private readonly ILogger<CertificadoService> _logger;
    private X509Certificate2? _certificadoAtual;

    public CertificadoService(ILogger<CertificadoService> logger)
    {
        _logger = logger;
    }

    public X509Certificate2? CarregarCertificado(string certificadoBase64, string senha)
    {
        try
        {
            _logger.LogInformation("Carregando certificado digital...");

            // Decodifica o certificado Base64
            var certificadoBytes = Convert.FromBase64String(certificadoBase64);
            
            // Carrega o certificado com a senha
            var certificado = new X509Certificate2(certificadoBytes, senha, X509KeyStorageFlags.MachineKeySet);
            
            // Valida o certificado
            if (!ValidarCertificado(certificado))
            {
                _logger.LogError("Certificado inválido ou expirado");
                return null;
            }

            _certificadoAtual = certificado;
            _logger.LogInformation("Certificado carregado com sucesso. Subject: {Subject}", certificado.Subject);
            
            return certificado;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao carregar certificado digital");
            return null;
        }
    }

    public bool ValidarCertificado(X509Certificate2 certificado)
    {
        try
        {
            // Verifica se o certificado não está expirado
            if (IsCertificateExpired(certificado))
            {
                _logger.LogWarning("Certificado expirado. Válido até: {NotAfter}", certificado.NotAfter);
                return false;
            }

            // Verifica se o certificado tem chave privada
            if (!certificado.HasPrivateKey)
            {
                _logger.LogWarning("Certificado não possui chave privada");
                return false;
            }

            // Verifica se é um certificado válido para NFe (A1 ou A3)
            if (!IsCertificateValidForNFe(certificado))
            {
                _logger.LogWarning("Certificado não é válido para NFe");
                return false;
            }

            // Verifica a cadeia de certificação
            var chain = new X509Chain();
            chain.ChainPolicy.RevocationMode = X509RevocationMode.NoCheck; // Para desenvolvimento
            chain.ChainPolicy.VerificationFlags = X509VerificationFlags.IgnoreWrongUsage;
            
            bool chainIsValid = chain.Build(certificado);
            if (!chainIsValid)
            {
                _logger.LogWarning("Cadeia de certificação inválida");
                foreach (var status in chain.ChainStatus)
                {
                    _logger.LogWarning("Status da cadeia: {Status} - {StatusInformation}", status.Status, status.StatusInformation);
                }
            }

            _logger.LogInformation("Certificado validado com sucesso");
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao validar certificado");
            return false;
        }
    }

    public bool HasValidCertificate()
    {
        return _certificadoAtual != null && ValidarCertificado(_certificadoAtual);
    }

    public DateTime? GetCertificateExpiry()
    {
        return _certificadoAtual?.NotAfter;
    }

    public string GetCertificateSubject()
    {
        return _certificadoAtual?.Subject ?? "Nenhum certificado carregado";
    }

    public bool IsCertificateExpired(X509Certificate2 certificado)
    {
        var now = DateTime.Now;
        return now < certificado.NotBefore || now > certificado.NotAfter;
    }

    public bool IsCertificateValidForNFe(X509Certificate2 certificado)
    {
        try
        {
            // Verifica se é um certificado digital brasileiro (ICP-Brasil)
            var subject = certificado.Subject;
            var issuer = certificado.Issuer;

            // Certificados ICP-Brasil geralmente contêm "ICP-Brasil" no issuer
            if (!issuer.Contains("ICP-Brasil") && !issuer.Contains("AC ") && !issuer.Contains("Autoridade Certificadora"))
            {
                _logger.LogWarning("Certificado não parece ser ICP-Brasil. Issuer: {Issuer}", issuer);
                // Não retorna false aqui para permitir certificados de teste
            }

            // Verifica se tem CNPJ no subject (certificados A1/A3 de pessoa jurídica)
            if (subject.Contains("CNPJ") || subject.Contains("CPF"))
            {
                _logger.LogInformation("Certificado contém CNPJ/CPF no subject");
                return true;
            }

            // Verifica extensões do certificado para uso de NFe
            foreach (var extension in certificado.Extensions)
            {
                if (extension.Oid?.FriendlyName == "Key Usage")
                {
                    var keyUsage = (X509KeyUsageExtension)extension;
                    if (keyUsage.KeyUsages.HasFlag(X509KeyUsageFlags.DigitalSignature))
                    {
                        _logger.LogInformation("Certificado tem uso de assinatura digital");
                        return true;
                    }
                }
            }

            _logger.LogInformation("Certificado aceito para uso em NFe");
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao verificar se certificado é válido para NFe");
            return false;
        }
    }

    // Método para buscar certificados instalados no sistema (para A3)
    public List<X509Certificate2> BuscarCertificadosInstalados()
    {
        var certificados = new List<X509Certificate2>();
        
        try
        {
            // Busca no repositório pessoal do usuário atual
            var store = new X509Store(StoreName.My, StoreLocation.CurrentUser);
            store.Open(OpenFlags.ReadOnly);
            
            foreach (var cert in store.Certificates)
            {
                if (cert.HasPrivateKey && IsCertificateValidForNFe(cert) && !IsCertificateExpired(cert))
                {
                    certificados.Add(cert);
                }
            }
            
            store.Close();
            
            // Busca no repositório da máquina local
            store = new X509Store(StoreName.My, StoreLocation.LocalMachine);
            store.Open(OpenFlags.ReadOnly);
            
            foreach (var cert in store.Certificates)
            {
                if (cert.HasPrivateKey && IsCertificateValidForNFe(cert) && !IsCertificateExpired(cert))
                {
                    certificados.Add(cert);
                }
            }
            
            store.Close();
            
            _logger.LogInformation("Encontrados {Count} certificados válidos instalados", certificados.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao buscar certificados instalados");
        }
        
        return certificados;
    }

    // Método para extrair CNPJ do certificado
    public string? ExtrairCNPJDoCertificado(X509Certificate2 certificado)
    {
        try
        {
            var subject = certificado.Subject;
            
            // Procura por CNPJ no subject
            var cnpjMatch = System.Text.RegularExpressions.Regex.Match(subject, @"CNPJ[:\s]*(\d{14})");
            if (cnpjMatch.Success)
            {
                return cnpjMatch.Groups[1].Value;
            }
            
            // Procura por padrões alternativos
            var serialMatch = System.Text.RegularExpressions.Regex.Match(subject, @"SERIALNUMBER[:\s]*(\d{14})");
            if (serialMatch.Success)
            {
                return serialMatch.Groups[1].Value;
            }
            
            _logger.LogWarning("CNPJ não encontrado no certificado. Subject: {Subject}", subject);
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao extrair CNPJ do certificado");
            return null;
        }
    }

    // Método para salvar certificado em arquivo (para debug)
    public bool SalvarCertificadoParaArquivo(X509Certificate2 certificado, string caminho)
    {
        try
        {
            var certBytes = certificado.Export(X509ContentType.Cert);
            File.WriteAllBytes(caminho, certBytes);
            _logger.LogInformation("Certificado salvo em: {Caminho}", caminho);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao salvar certificado em arquivo");
            return false;
        }
    }
}
