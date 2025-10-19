using Microsoft.EntityFrameworkCore;
using Movix.NFe.Core.Data;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() {
        Title = "Movix NFe API",
        Version = "v1",
        Description = "API para emissão de Nota Fiscal Eletrônica (NFe) usando DFe.NET"
    });
});

// Configurar DbContext
builder.Services.AddDbContext<NFeDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection"),
        b => b.MigrationsAssembly("Movix.NFe.Core")
    )
);

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Movix NFe API v1");
        c.RoutePrefix = string.Empty; // Swagger na raiz
    });
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseAuthorization();
app.MapControllers();

// Endpoint de health check
app.MapGet("/health", () => Results.Ok(new {
    status = "healthy",
    timestamp = DateTime.Now,
    version = "1.0.0"
}))
.WithName("HealthCheck")
.WithOpenApi();

app.Run();
