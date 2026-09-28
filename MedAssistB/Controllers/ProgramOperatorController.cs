using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MedAssistB.Models;

namespace MedAssistB.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProgramOperatorController : ControllerBase
{
    private readonly PostgresContext _context;

    public ProgramOperatorController(PostgresContext context)
    {
        _context = context;
    }

    // GET - afiseaza programul operator pentru o anumita data
    [HttpGet]
    public async Task<IActionResult> GetProgramPerData([FromQuery] string? data)
    {
        try
        {
            DateOnly targetDate;

            if (!string.IsNullOrWhiteSpace(data) && DateOnly.TryParse(data, out var parsedDate))
            {
                targetDate = parsedDate;
            }
            else
            {
                targetDate = DateOnly.FromDateTime(DateTime.Today);
            }

            var operatii = await _context.ProgrameOperatoare
                .AsNoTracking()
                .Where(p => p.DataOperatie == targetDate)
                .ToListAsync();

            var utilizatori = await _context.Utilizatori
                .AsNoTracking()
                .ToListAsync();

            var rezultat = operatii.Select(p =>
            {
                var chirurg = utilizatori.FirstOrDefault(u => u.Id == p.ChirurgId);
                var anestezist = utilizatori.FirstOrDefault(u => u.Id == p.AnestezistId);
                var asistInstrumentar = utilizatori.FirstOrDefault(u => u.Id == p.AsistentInstrumentarId);
                var asistAnestezie = utilizatori.FirstOrDefault(u => u.Id == p.AsistentAnestezieId);

                var asistenti = new List<string>();

                if (asistInstrumentar != null)
                {
                    asistenti.Add($"{asistInstrumentar.Nume} {asistInstrumentar.Prenume} (Inst.)");
                }

                if (asistAnestezie != null)
                {
                    asistenti.Add($"{asistAnestezie.Nume} {asistAnestezie.Prenume} (Anest.)");
                }

                return new
                {
                    id = p.Id,
                    data = p.DataOperatie.ToString("yyyy-MM-dd"),
                    ora = p.OraInceput.ToString(@"hh\:mm"),
                    sectie = p.Sectie,
                    numeOperatie = p.NumeOperatie,
                    pacient = p.NumePacient,
                    chirurg = chirurg != null ? $"{chirurg.Nume} {chirurg.Prenume}" : "Nespecificat",
                    anestezist = anestezist != null ? $"{anestezist.Nume} {anestezist.Prenume}" : "Nespecificat",
                    asistenti = string.Join(", ", asistenti),
                    areFisaPdf = p.FisaMedicalaPdf != null && p.FisaMedicalaPdf.Length > 0
                };
            }).ToList();

            return Ok(rezultat);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                message = "Eroare la încărcarea programului operator.",
                error = ex.Message,
                innerError = ex.InnerException?.Message
            });
        }
    }

    // GET - descarca fisa PDF dupa ID-ul operatiei
    [HttpGet("download-pdf/{id:int}")]
    public async Task<IActionResult> DownloadFisa(int id)
    {
        var operatie = await _context.ProgrameOperatoare.FindAsync(id);

        if (operatie == null || operatie.FisaMedicalaPdf == null || operatie.FisaMedicalaPdf.Length == 0)
        {
            return NotFound(new { message = "Fișa PDF nu a fost găsită." });
        }

        return File(operatie.FisaMedicalaPdf, "application/pdf", $"Fisa_Pacient_{operatie.NumePacient}.pdf");
    }

    // POST - adauga o operatie
    [HttpPost]
    [Authorize(Roles = "2,3")]
    public async Task<IActionResult> CreateProgram([FromForm] ProgramOperatorDto dto)
    {
        try
        {
            if (dto == null)
                return BadRequest(new { message = "Datele operației sunt obligatorii." });

            var operation = await BuildOperation(dto);

            if (dto.FisaPdf != null && dto.FisaPdf.Length > 0)
            {
                using (var memoryStream = new MemoryStream())
                {
                    await dto.FisaPdf.CopyToAsync(memoryStream);
                    operation.FisaMedicalaPdf = memoryStream.ToArray();
                }
            }

            _context.ProgrameOperatoare.Add(operation);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Operația a fost adăugată cu succes.",
                operation
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                message = "Eroare la adăugarea operației.",
                error = ex.Message,
                innerError = ex.InnerException?.Message
            });
        }
    }

    // PUT - modifica o operatie
    [HttpPut("{id:int}")]
    [Authorize(Roles = "2,3")]
    public async Task<IActionResult> UpdateProgram(int id, [FromForm] ProgramOperatorDto dto)
    {
        try
        {
            if (dto == null)
                return BadRequest(new { message = "Datele operației sunt obligatorii." });

            var operation = await _context.ProgrameOperatoare.FindAsync(id);

            if (operation == null)
            {
                return NotFound(new { message = "Operația nu a fost găsită." });
            }

            var updated = await BuildOperation(dto);

            operation.DataOperatie = updated.DataOperatie;
            operation.OraInceput = updated.OraInceput;
            operation.Sectie = updated.Sectie;
            operation.NumeOperatie = updated.NumeOperatie;
            operation.NumePacient = updated.NumePacient;
            operation.ChirurgId = updated.ChirurgId;
            operation.AnestezistId = updated.AnestezistId;
            operation.AsistentInstrumentarId = updated.AsistentInstrumentarId;
            operation.AsistentAnestezieId = updated.AsistentAnestezieId;

            if (dto.FisaPdf != null && dto.FisaPdf.Length > 0)
            {
                using (var memoryStream = new MemoryStream())
                {
                    await dto.FisaPdf.CopyToAsync(memoryStream);
                    operation.FisaMedicalaPdf = memoryStream.ToArray();
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Operația a fost modificată cu succes.",
                operation
            });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new
            {
                message = "Eroare la modificarea operației.",
                error = ex.Message,
                innerError = ex.InnerException?.Message
            });
        }
    }

    private async Task<ProgramOperator> BuildOperation(ProgramOperatorDto dto)
    {
        var users = await _context.Utilizatori.AsNoTracking().ToListAsync();

        DateOnly parsedDate = DateOnly.FromDateTime(DateTime.Today);
        if (!string.IsNullOrWhiteSpace(dto.Data) && DateOnly.TryParse(dto.Data.Trim(), out var resultDate))
        {
            parsedDate = resultDate;
        }

        return new ProgramOperator
        {
            DataOperatie = parsedDate,
            OraInceput = TimeSpan.TryParse(dto.Ora, out var ora) ? ora : TimeSpan.Zero,
            Sectie = dto.Sectie?.Trim() ?? string.Empty,
            NumeOperatie = dto.NumeOperatie?.Trim() ?? string.Empty,
            NumePacient = dto.Pacient?.Trim() ?? string.Empty,
            ChirurgId = FindUserId(users, dto.Chirurg),
            AnestezistId = FindUserId(users, dto.Anestezist),
            AsistentInstrumentarId = FindFirstAssistantId(users, dto.Asistenti, true),
            AsistentAnestezieId = FindFirstAssistantId(users, dto.Asistenti, false)
        };
    }

    private static int? FindUserId(List<Utilizator> users, string? fullName)
    {
        if (string.IsNullOrWhiteSpace(fullName)) return null;
        var clean = fullName.Trim();

        var user = users.FirstOrDefault(u =>
            $"{u.Nume} {u.Prenume}".Equals(clean, StringComparison.OrdinalIgnoreCase) ||
            $"{u.Prenume} {u.Nume}".Equals(clean, StringComparison.OrdinalIgnoreCase)
        );

        return user?.Id;
    }

    private static int? FindFirstAssistantId(List<Utilizator> users, string? assistants, bool isInstrumentar)
    {
        if (string.IsNullOrWhiteSpace(assistants)) return null;

        var names = assistants.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries);

        // Dacă e primul asistent menționat, îl considerăm instrumentar. Dacă e al doilea, anestezie.
        int indexToTake = isInstrumentar ? 0 : 1;

        if (names.Length <= indexToTake) return null;

        var cleanName = names[indexToTake]
            .Replace("(Inst.)", "", StringComparison.OrdinalIgnoreCase)
            .Replace("(Anest.)", "", StringComparison.OrdinalIgnoreCase)
            .Trim();

        return FindUserId(users, cleanName);
    }
}

public class ProgramOperatorDto
{
    public string Data { get; set; } = string.Empty;
    public string Ora { get; set; } = string.Empty;
    public string Sectie { get; set; } = string.Empty;
    public string NumeOperatie { get; set; } = string.Empty;
    public string Pacient { get; set; } = string.Empty;
    public string Chirurg { get; set; } = string.Empty;
    public string Anestezist { get; set; } = string.Empty;
    public string Asistenti { get; set; } = string.Empty;
    public IFormFile? FisaPdf { get; set; }
}