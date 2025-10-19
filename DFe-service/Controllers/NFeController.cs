using Microsoft.AspNetCore.Mvc;
using DFeService.Models;
using DFeService.Services;

namespace DFeService.Controllers;

[ApiController]
[Route("api/[controller]")]
public class NFeController : ControllerBase
{
    private readonly ILogger<NFeController> _logger;
    private readonly INFeService _nfeService;

    public NFeController(ILogger<NFeController> logger, INFeService nfeService)
    {
        _logger = logger;
        _nfeService = nfeService;
    }

    /// <summary>
    /// Autoriza uma NFe na SEFAZ
    /// </summary>
    [HttpPost("authorize")]
    [ProducesResponseType(typeof(NFeResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<NFeResponse>> AuthorizeNFe([FromBody] NFeRequest request)
    {
        try
        {
            _logger.LogInformation("Recebida requisição de autorização de NFe");

            if (request == null)
            {
                return BadRequest(new NFeResponse
                {
                    Success = false,
                    Message = "Requisição inválida",
                    Errors = new List<string> { "Request body não pode ser nulo" }
                });
            }

            var response = await _nfeService.AuthorizeNFeAsync(request);
            
            if (response.Success)
            {
                return Ok(response);
            }
            else
            {
                return BadRequest(response);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao processar autorização de NFe");
            return StatusCode(500, new NFeResponse
            {
                Success = false,
                Message = "Erro interno do servidor",
                Errors = new List<string> { ex.Message }
            });
        }
    }

    /// <summary>
    /// Cancela uma NFe autorizada
    /// </summary>
    [HttpPost("cancel")]
    [ProducesResponseType(typeof(CancelNFeResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<CancelNFeResponse>> CancelNFe([FromBody] CancelNFeRequest request)
    {
        try
        {
            _logger.LogInformation("Recebida requisição de cancelamento de NFe");

            if (request == null)
            {
                return BadRequest(new CancelNFeResponse
                {
                    Success = false,
                    Message = "Requisição inválida",
                    Errors = new List<string> { "Request body não pode ser nulo" }
                });
            }

            var response = await _nfeService.CancelNFeAsync(request);
            
            if (response.Success)
            {
                return Ok(response);
            }
            else
            {
                return BadRequest(response);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao processar cancelamento de NFe");
            return StatusCode(500, new CancelNFeResponse
            {
                Success = false,
                Message = "Erro interno do servidor",
                Errors = new List<string> { ex.Message }
            });
        }
    }

    /// <summary>
    /// Consulta o status do serviço SEFAZ
    /// </summary>
    [HttpPost("status")]
    [ProducesResponseType(typeof(StatusServiceResponse), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<ActionResult<StatusServiceResponse>> CheckServiceStatus([FromBody] StatusServiceRequest request)
    {
        try
        {
            _logger.LogInformation("Recebida requisição de consulta de status do serviço");

            if (request == null)
            {
                return BadRequest(new StatusServiceResponse
                {
                    Success = false,
                    Message = "Requisição inválida"
                });
            }

            var response = await _nfeService.CheckServiceStatusAsync(request);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao consultar status do serviço");
            return StatusCode(500, new StatusServiceResponse
            {
                Success = false,
                Message = "Erro interno do servidor"
            });
        }
    }

    /// <summary>
    /// Gera DANFE (PDF ou HTML) a partir do XML da NFe
    /// </summary>
    [HttpPost("danfe")]
    [ProducesResponseType(typeof(FileContentResult), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> GenerateDanfe([FromBody] DanfeRequest request)
    {
        try
        {
            _logger.LogInformation("Recebida requisição de geração de DANFE");

            if (request == null || string.IsNullOrWhiteSpace(request.XML))
            {
                return BadRequest(new DanfeResponse
                {
                    Success = false,
                    Message = "Requisição inválida",
                    Errors = new List<string> { "XML não pode ser vazio" }
                });
            }

            var response = await _nfeService.GenerateDanfeAsync(request);
            
            if (response.Success && response.Content != null)
            {
                return File(response.Content, response.ContentType ?? "application/pdf", "danfe.pdf");
            }
            else
            {
                return BadRequest(response);
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao gerar DANFE");
            return StatusCode(500, new DanfeResponse
            {
                Success = false,
                Message = "Erro interno do servidor",
                Errors = new List<string> { ex.Message }
            });
        }
    }
}

