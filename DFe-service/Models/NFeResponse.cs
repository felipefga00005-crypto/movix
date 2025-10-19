namespace DFeService.Models;

public class NFeResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? AccessKey { get; set; }
    public string? Protocol { get; set; }
    public string? XML { get; set; }
    public string? StatusCode { get; set; }
    public DateTime? AuthorizedAt { get; set; }
    public List<string> Errors { get; set; } = new();
}

public class CancelNFeRequest
{
    public string AccessKey { get; set; } = null!;
    public string Reason { get; set; } = null!;
    public string Protocol { get; set; } = null!;
    public CertificateData Certificate { get; set; } = null!;
    public string Environment { get; set; } = "homologacao";
}

public class CancelNFeResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? CancellationProtocol { get; set; }
    public string? XML { get; set; }
    public DateTime? CancelledAt { get; set; }
    public List<string> Errors { get; set; } = new();
}

public class StatusServiceRequest
{
    public string State { get; set; } = null!; // UF
    public string Environment { get; set; } = "homologacao";
    public CertificateData Certificate { get; set; } = null!;
}

public class StatusServiceResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public string? StatusCode { get; set; }
    public string? StatusDescription { get; set; }
    public DateTime? ResponseTime { get; set; }
}

public class DanfeRequest
{
    public string XML { get; set; } = null!;
    public string Format { get; set; } = "pdf"; // "pdf" ou "html"
}

public class DanfeResponse
{
    public bool Success { get; set; }
    public string Message { get; set; } = string.Empty;
    public byte[]? Content { get; set; }
    public string? ContentType { get; set; }
    public List<string> Errors { get; set; } = new();
}

