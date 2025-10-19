using DFeService.Models;

namespace DFeService.Services;

public interface INFeService
{
    Task<NFeResponse> AuthorizeNFeAsync(NFeRequest request);
    Task<CancelNFeResponse> CancelNFeAsync(CancelNFeRequest request);
    Task<StatusServiceResponse> CheckServiceStatusAsync(StatusServiceRequest request);
    Task<DanfeResponse> GenerateDanfeAsync(DanfeRequest request);
}

