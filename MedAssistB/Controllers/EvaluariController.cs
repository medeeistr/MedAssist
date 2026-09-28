using MedAssistB.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace MedAssistB.Controllers
{
    [ApiController]
    [Route("api/evaluari")]
    [Authorize]
    public class EvaluariController : ControllerBase
    {
        private readonly PostgresContext _context;

        public EvaluariController(PostgresContext context) => _context = context;

        [HttpPost]
        public async Task<IActionResult> Submit([FromBody] EvaluareDto dto)
        {
            var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(value, out var userId))
                return Unauthorized();

            if (dto.Note == null || !int.TryParse(dto.Note.PunctajProfesional, out var prof) ||
                !int.TryParse(dto.Note.PunctajEchipa, out var echipa) ||
                !int.TryParse(dto.Note.PunctajComunicare, out var comunicare) ||
                !int.TryParse(dto.Note.PunctajResponsabilitate, out var responsabilitate) ||
                string.IsNullOrWhiteSpace(dto.ProgresViitor))
                return BadRequest(new { message = "Completează toate câmpurile evaluării." });

            if (new[] { prof, echipa, comunicare, responsabilitate }.Any(x => x < 1 || x > 5))
                return BadRequest(new { message = "Notele trebuie să fie între 1 și 5." });

            var punctajTotal = prof + echipa + comunicare + responsabilitate;
            var scorMediu = Math.Round(punctajTotal / 4.0m, 2);

            var evaluare = new EvaluareAngajat
            {
                UserId = userId,
                PunctajProfesional = prof,
                PunctajEchipa = echipa,
                PunctajComunicare = comunicare,
                PunctajResponsabilitate = responsabilitate,
                PunctajTotal = punctajTotal,
                ScorMediu = scorMediu,
                ProgresViitor = dto.ProgresViitor.Trim(),
                SubmittedAt = DateTime.UtcNow,
                CreatedAt = DateTime.UtcNow,
                Status = "Trimis"
            };

            _context.EvaluariAngajati.Add(evaluare);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Evaluarea a fost salvată.", id = evaluare.Id });
        }

        [HttpGet]
        [Authorize(Roles = "2,3")]
        public async Task<IActionResult> GetAll()
        {
            var result = await _context.EvaluariAngajati
                .AsNoTracking()
                .Join(_context.Utilizatori,
                    e => e.UserId,
                    u => u.Id,
                    (e, u) => new
                    {
                        e.Id,
                        u.Nume,
                        u.Prenume,
                        e.ProgresViitor,
                        SubmittedAt = e.SubmittedAt != null ? e.SubmittedAt.Value.ToString("yyyy-MM-dd HH:mm") : string.Empty,
                        ScorMediu = e.ScorMediu ?? Math.Round(((e.PunctajProfesional ?? 0) + (e.PunctajEchipa ?? 0) + (e.PunctajComunicare ?? 0) + (e.PunctajResponsabilitate ?? 0)) / 4.0m, 2)
                    })
                .OrderByDescending(e => e.Id)
                .ToListAsync();

            return Ok(result);
        }
    }

    public class EvaluareDto
    {
        public NoteDto? Note { get; set; }
        public string ProgresViitor { get; set; } = string.Empty;
    }

    public class NoteDto
    {
        public string PunctajProfesional { get; set; } = string.Empty;
        public string PunctajEchipa { get; set; } = string.Empty;
        public string PunctajComunicare { get; set; } = string.Empty;
        public string PunctajResponsabilitate { get; set; } = string.Empty;
    }
}