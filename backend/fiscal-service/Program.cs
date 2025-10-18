using FiscalService.Services;
using FiscalService.Models;
using Serilog;
using System.Text.Json;
using FluentValidation;

var builder = WebApplication.CreateBuilder(args);

// ============================================
// CONFIGURAÇÃO DO SERILOG
// ============================================
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .WriteTo.File("Logs/fiscal-service-.txt", rollingInterval: RollingInterval.Day)
    .CreateLogger();

builder.Host.UseSerilog();

// ============================================
// CONFIGURAÇÃO DOS SERVICES
// ============================================
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.PropertyNamingPolicy = JsonNamingPolicy.CamelCase;
        options.JsonSerializerOptions.WriteIndented = true;
    });

// Swagger/OpenAPI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { 
        Title = "Movix Fiscal Service", 
        Version = "v1",
        Description = "Serviço fiscal para emissão de NFe, NFCe, CTe e MDFe usando DFe.NET"
    });
});

// CORS para permitir chamadas do backend Go
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowGoBackend", policy =>
    {
        policy.WithOrigins("http://localhost:8080", "https://localhost:8080")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Registrar services
builder.Services.AddScoped<INFCeService, NFCeService>();
builder.Services.AddScoped<INFeService, NFeService>();
builder.Services.AddScoped<ICertificadoService, CertificadoService>();
builder.Services.AddScoped<IConfigService, ConfigService>();

// Validadores
builder.Services.AddValidatorsFromAssemblyContaining<Program>();

// ============================================
// CONFIGURAÇÃO DA APLICAÇÃO
// ============================================
var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Movix Fiscal Service v1");
        c.RoutePrefix = string.Empty; // Swagger na raiz
    });
}

app.UseCors("AllowGoBackend");
app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

// ============================================
// ENDPOINTS DE SAÚDE
// ============================================
app.MapGet("/health", () => new { 
    Status = "OK", 
    Service = "Movix Fiscal Service",
    Version = "1.0.0",
    Timestamp = DateTime.UtcNow,
    Environment = app.Environment.EnvironmentName
});

app.MapGet("/health/detailed", (IServiceProvider services) => {
    var certificadoService = services.GetRequiredService<ICertificadoService>();
    var configService = services.GetRequiredService<IConfigService>();
    
    return new {
        Status = "OK",
        Service = "Movix Fiscal Service",
        Version = "1.0.0",
        Timestamp = DateTime.UtcNow,
        Environment = app.Environment.EnvironmentName,
        Certificates = new {
            HasValidCertificate = certificadoService.HasValidCertificate(),
            CertificateExpiry = certificadoService.GetCertificateExpiry()
        },
        Configuration = new {
            Environment = configService.GetAmbiente(),
            UF = configService.GetUF()
        }
    };
});

// ============================================
// LOGGING DE INICIALIZAÇÃO
// ============================================
Log.Information("=== Movix Fiscal Service Iniciando ===");
Log.Information("Ambiente: {Environment}", app.Environment.EnvironmentName);
Log.Information("URLs: {Urls}", string.Join(", ", builder.WebHost.GetSetting("urls")?.Split(';') ?? new[] { "http://localhost:8081" }));

try
{
    Log.Information("Iniciando servidor HTTP...");
    app.Run("http://localhost:8081");
}
catch (Exception ex)
{
    Log.Fatal(ex, "Erro fatal ao iniciar o serviço");
    throw;
}
finally
{
    Log.CloseAndFlush();
}
