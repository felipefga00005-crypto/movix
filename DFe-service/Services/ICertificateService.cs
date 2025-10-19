using System.Security.Cryptography.X509Certificates;
using DFeService.Models;

namespace DFeService.Services;

public interface ICertificateService
{
    X509Certificate2 LoadCertificate(CertificateData certificateData);
}

