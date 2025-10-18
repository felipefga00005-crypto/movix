using Microsoft.AspNetCore.Mvc;
using FiscalService.Models;
using FiscalService.Services;
using FluentValidation;

namespace FiscalService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FiscalController : ControllerBase
{
    private readonly ILogger<FiscalController> _logger;
    private readonly INFCeService _nfceService;
    private readonly INFeService _nfeService;
    private readonly ICertificadoService _certificadoService;
    private readonly IConfigService _configService;

    public FiscalController(
        ILogger<FiscalController> logger,
        INFCeService nfceService,
        INFeService nfeService,
        ICertificadoService certificadoService,
        IConfigService configService)
    {
        _logger = logger;
        _nfceService = nfceService;
        _nfeService = nfeService;
        _certificadoService = certificadoService;
        _configService = configService;
    }

    // ============================================
    // ENDPOINTS NFCe
    // ============================================

    /// <summary>
    /// Emite uma NFCe
    /// </summary>
    /// <param name="request">Dados da NFCe a ser emitida</param>
    /// <returns>Resultado da emissão</returns>
    [HttpPost("nfce")]
    public async Task<ActionResult<DocumentoFiscalResponse>> EmitirNFCe([FromBody] EmitirNFCeRequest request)
    {
        try
        {
            _logger.LogInformation("Recebida solicitação de emissão de NFCe para venda {VendaId}", request.VendaId);

            var resultado = await _nfceService.EmitirNFCeAsync(request);
            
            if (resultado.Sucesso)
            {
                _logger.LogInformation("NFCe emitida com sucesso. Chave: {ChaveAcesso}", resultado.ChaveAcesso);
                return Ok(resultado);
            }
            else
            {
                _logger.LogWarning("Falha na emissão da NFCe. Erros: {Erros}", string.Join(", ", resultado.Erros));
                return BadRequest(resultado);
            }
        }
        catch (ValidationException ex)
        {
            _logger.LogWarning("Dados inválidos para emissão de NFCe: {Erros}", ex.Message);
            return BadRequest(new DocumentoFiscalResponse
            {
                Sucesso = false,
                Mensagem = "Dados inválidos",
                Erros = ex.Errors.Select(e => e.ErrorMessage).ToList()
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro inesperado ao emitir NFCe");
            return StatusCode(500, new DocumentoFiscalResponse
            {
                Sucesso = false,
                Mensagem = "Erro interno do servidor",
                Erros = new List<string> { "Erro técnico interno" }
            });
        }
    }

    /// <summary>
    /// Cancela uma NFCe
    /// </summary>
    /// <param name="request">Dados do cancelamento</param>
    /// <returns>Resultado do cancelamento</returns>
    [HttpPost("nfce/cancelar")]
    public async Task<ActionResult<DocumentoFiscalResponse>> CancelarNFCe([FromBody] CancelarDocumentoRequest request)
    {
        try
        {
            _logger.LogInformation("Recebida solicitação de cancelamento de NFCe. Chave: {ChaveAcesso}", request.ChaveAcesso);

            var resultado = await _nfceService.CancelarNFCeAsync(request);
            
            if (resultado.Sucesso)
            {
                return Ok(resultado);
            }
            else
            {
                return BadRequest(resultado);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao cancelar NFCe");
            return StatusCode(500, new DocumentoFiscalResponse
            {
                Sucesso = false,
                Mensagem = "Erro interno do servidor",
                Erros = new List<string> { ex.Message }
            });
        }
    }

    // ============================================
    // ENDPOINTS NFe
    // ============================================

    /// <summary>
    /// Emite uma NFe
    /// </summary>
    /// <param name="request">Dados da NFe a ser emitida</param>
    /// <returns>Resultado da emissão</returns>
    [HttpPost("nfe")]
    public async Task<ActionResult<DocumentoFiscalResponse>> EmitirNFe([FromBody] EmitirNFeRequest request)
    {
        try
        {
            _logger.LogInformation("Recebida solicitação de emissão de NFe para venda {VendaId}", request.VendaId);

            var resultado = await _nfeService.EmitirNFeAsync(request);
            
            if (resultado.Sucesso)
            {
                return Ok(resultado);
            }
            else
            {
                return BadRequest(resultado);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao emitir NFe");
            return StatusCode(500, new DocumentoFiscalResponse
            {
                Sucesso = false,
                Mensagem = "Erro interno do servidor",
                Erros = new List<string> { ex.Message }
            });
        }
    }

    /// <summary>
    /// Cancela uma NFe
    /// </summary>
    /// <param name="request">Dados do cancelamento</param>
    /// <returns>Resultado do cancelamento</returns>
    [HttpPost("nfe/cancelar")]
    public async Task<ActionResult<DocumentoFiscalResponse>> CancelarNFe([FromBody] CancelarDocumentoRequest request)
    {
        try
        {
            _logger.LogInformation("Recebida solicitação de cancelamento de NFe. Chave: {ChaveAcesso}", request.ChaveAcesso);

            var resultado = await _nfeService.CancelarNFeAsync(request);
            
            if (resultado.Sucesso)
            {
                return Ok(resultado);
            }
            else
            {
                return BadRequest(resultado);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao cancelar NFe");
            return StatusCode(500, new DocumentoFiscalResponse
            {
                Sucesso = false,
                Mensagem = "Erro interno do servidor",
                Erros = new List<string> { ex.Message }
            });
        }
    }

    // ============================================
    // ENDPOINTS DE CONSULTA
    // ============================================

    /// <summary>
    /// Consulta o status de um documento fiscal
    /// </summary>
    /// <param name="request">Dados da consulta</param>
    /// <returns>Status do documento</returns>
    [HttpPost("consultar-status")]
    public async Task<ActionResult<StatusDocumentoResponse>> ConsultarStatus([FromBody] ConsultarStatusRequest request)
    {
        try
        {
            _logger.LogInformation("Consultando status do documento. Chave: {ChaveAcesso}", request.ChaveAcesso);

            // Por enquanto usa o serviço de NFCe para consulta
            var resultado = await _nfceService.ConsultarStatusAsync(request);
            
            if (resultado.Sucesso)
            {
                return Ok(resultado);
            }
            else
            {
                return BadRequest(resultado);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao consultar status");
            return StatusCode(500, new StatusDocumentoResponse
            {
                Sucesso = false,
                Mensagem = "Erro interno do servidor",
                Erros = new List<string> { ex.Message }
            });
        }
    }

    // ============================================
    // ENDPOINTS DE CONFIGURAÇÃO
    // ============================================

    /// <summary>
    /// Obtém a configuração fiscal atual
    /// </summary>
    /// <returns>Configuração fiscal</returns>
    [HttpGet("configuracao")]
    public ActionResult<ConfiguracaoFiscal> GetConfiguracao()
    {
        try
        {
            var config = _configService.GetConfiguracaoFiscal();
            return Ok(config);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao obter configuração");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Atualiza a configuração fiscal
    /// </summary>
    /// <param name="config">Nova configuração</param>
    /// <returns>Resultado da atualização</returns>
    [HttpPost("configuracao")]
    public ActionResult SetConfiguracao([FromBody] ConfiguracaoFiscal config)
    {
        try
        {
            _configService.SetConfiguracaoFiscal(config);
            return Ok(new { message = "Configuração atualizada com sucesso" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao atualizar configuração");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Testa a conectividade com os webservices SEFAZ
    /// </summary>
    /// <param name="uf">UF para teste</param>
    /// <param name="ambiente">Ambiente (1=Produção, 2=Homologação)</param>
    /// <returns>Resultado do teste</returns>
    [HttpGet("testar-conectividade")]
    public ActionResult TestarConectividade([FromQuery] string uf = "SP", [FromQuery] int ambiente = 2)
    {
        try
        {
            var urlNFe = _configService.GetURLWebService(uf, TipoDocumento.NFe, ambiente);
            var urlNFCe = _configService.GetURLWebService(uf, TipoDocumento.NFCe, ambiente);

            return Ok(new
            {
                uf = uf,
                ambiente = ambiente,
                urls = new
                {
                    nfe = urlNFe,
                    nfce = urlNFCe
                },
                status = "URLs obtidas com sucesso"
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao testar conectividade");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    /// <summary>
    /// Valida um certificado digital
    /// </summary>
    /// <param name="request">Dados do certificado</param>
    /// <returns>Resultado da validação</returns>
    [HttpPost("validar-certificado")]
    public ActionResult ValidarCertificado([FromBody] ValidarCertificadoRequest request)
    {
        try
        {
            var certificado = _certificadoService.CarregarCertificado(request.CertificadoBase64, request.Senha);
            
            if (certificado == null)
            {
                return BadRequest(new
                {
                    valido = false,
                    erro = "Certificado inválido ou senha incorreta"
                });
            }

            return Ok(new
            {
                valido = true,
                subject = certificado.Subject,
                issuer = certificado.Issuer,
                validoAte = certificado.NotAfter,
                temChavePrivada = certificado.HasPrivateKey
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao validar certificado");
            return BadRequest(new
            {
                valido = false,
                erro = ex.Message
            });
        }
    }
}

// ============================================
// MODELOS AUXILIARES
// ============================================

public class ValidarCertificadoRequest
{
    public string CertificadoBase64 { get; set; } = string.Empty;
    public string Senha { get; set; } = string.Empty;
}
