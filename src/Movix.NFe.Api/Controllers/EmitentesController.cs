using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Movix.NFe.Core.Data;
using Movix.NFe.Core.Entities;

namespace Movix.NFe.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmitentesController : ControllerBase
{
    private readonly NFeDbContext _context;
    private readonly ILogger<EmitentesController> _logger;

    public EmitentesController(NFeDbContext context, ILogger<EmitentesController> logger)
    {
        _context = context;
        _logger = logger;
    }

    /// <summary>
    /// Lista todos os emitentes
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Emitente>>> GetEmitentes()
    {
        return await _context.Emitentes
            .Include(e => e.Municipio)
                .ThenInclude(m => m.Estado)
            .Where(e => e.Ativo)
            .ToListAsync();
    }

    /// <summary>
    /// Busca um emitente por ID
    /// </summary>
    [HttpGet("{id}")]
    public async Task<ActionResult<Emitente>> GetEmitente(int id)
    {
        var emitente = await _context.Emitentes
            .Include(e => e.Municipio)
                .ThenInclude(m => m.Estado)
            .FirstOrDefaultAsync(e => e.Id == id);

        if (emitente == null)
        {
            return NotFound(new { message = "Emitente não encontrado" });
        }

        return emitente;
    }

    /// <summary>
    /// Cria um novo emitente
    /// </summary>
    [HttpPost]
    public async Task<ActionResult<Emitente>> PostEmitente(Emitente emitente)
    {
        try
        {
            // Validar se CNPJ já existe
            if (await _context.Emitentes.AnyAsync(e => e.CNPJ == emitente.CNPJ))
            {
                return BadRequest(new { message = "CNPJ já cadastrado" });
            }

            emitente.DataCadastro = DateTime.Now;
            _context.Emitentes.Add(emitente);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetEmitente), new { id = emitente.Id }, emitente);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao criar emitente");
            return StatusCode(500, new { message = "Erro ao criar emitente", error = ex.Message });
        }
    }

    /// <summary>
    /// Atualiza um emitente
    /// </summary>
    [HttpPut("{id}")]
    public async Task<IActionResult> PutEmitente(int id, Emitente emitente)
    {
        if (id != emitente.Id)
        {
            return BadRequest(new { message = "ID não corresponde" });
        }

        try
        {
            emitente.DataAlteracao = DateTime.Now;
            _context.Entry(emitente).State = EntityState.Modified;
            await _context.SaveChangesAsync();

            return NoContent();
        }
        catch (DbUpdateConcurrencyException)
        {
            if (!await _context.Emitentes.AnyAsync(e => e.Id == id))
            {
                return NotFound(new { message = "Emitente não encontrado" });
            }
            throw;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Erro ao atualizar emitente");
            return StatusCode(500, new { message = "Erro ao atualizar emitente", error = ex.Message });
        }
    }

    /// <summary>
    /// Desativa um emitente (soft delete)
    /// </summary>
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteEmitente(int id)
    {
        var emitente = await _context.Emitentes.FindAsync(id);
        if (emitente == null)
        {
            return NotFound(new { message = "Emitente não encontrado" });
        }

        emitente.Ativo = false;
        emitente.DataAlteracao = DateTime.Now;
        await _context.SaveChangesAsync();

        return NoContent();
    }

    /// <summary>
    /// Obtém o próximo número de NFe para o emitente
    /// </summary>
    [HttpGet("{id}/proximo-numero")]
    public async Task<ActionResult<object>> GetProximoNumero(int id)
    {
        var emitente = await _context.Emitentes.FindAsync(id);
        if (emitente == null)
        {
            return NotFound(new { message = "Emitente não encontrado" });
        }

        return Ok(new
        {
            emitenteId = emitente.Id,
            serie = emitente.SeriePadrao,
            proximoNumero = emitente.UltimoNumeroNFe + 1
        });
    }
}

