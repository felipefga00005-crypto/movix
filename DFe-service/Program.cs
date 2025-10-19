using Serilog;
using DFeService.Services;

var builder = WebApplication.CreateBuilder(args);

// Configurar Serilog
Log.Logger = new LoggerConfiguration()
    .WriteTo.Console()
    .CreateLogger();

builder.Host.UseSerilog();

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { 
        Title = "DFe Service API", 
        Version = "v1",
        Description = "Microserviço para emissão de NFe/NFCe usando DFe.NET"
    });
});

// Registrar serviços
builder.Services.AddScoped<INFeService, NFeService>();
builder.Services.AddScoped<ICertificateService, CertificateService>();

// Configurar CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowBackend", policy =>
    {
        policy.WithOrigins(
            builder.Configuration["AllowedOrigins:Backend"] ?? "http://localhost:8080"
        )
        .AllowAnyMethod()
        .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseSerilogRequestLogging();

app.UseCors("AllowBackend");

app.UseAuthorization();

app.MapControllers();

// Health check endpoint
app.MapGet("/health", () => Results.Ok(new { 
    status = "healthy", 
    service = "DFe-service",
    timestamp = DateTime.UtcNow 
}));

Log.Information("DFe Service iniciado com sucesso");

app.Run();

