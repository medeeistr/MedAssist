using MedAssistB.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace MedAssistB.Controllers
{
    [ApiController]
    [Route("api/admin")]
    [Authorize(Roles = "2,3")]
    public class AdminController : ControllerBase
    {
        private readonly PostgresContext _context;

        public AdminController(PostgresContext context) => _context = context;

        [HttpGet("concedii")]
        public async Task<IActionResult> GetConcedii()
        {
            var result = await _context.CereriConcediu
                .AsNoTracking()
                .Join(_context.Utilizatori,
                    c => c.UserId,
                    u => u.Id,
                    (c, u) => new
                    {
                        c.Id,
                        c.UserId,
                        u.Nume,
                        u.Prenume,
                        c.TipConcediu,
                        c.DataInceput,
                        c.DataSfarsit,
                        ZileCerute = (c.DataSfarsit.DayNumber - c.DataInceput.DayNumber) + 1,
                        c.Motiv,
                        c.Status,
                        c.CreatedAt
                    })
                .OrderBy(c => c.Status == "In asteptare" ? 0 : 1)
                .ThenByDescending(c => c.CreatedAt)
                .ToListAsync();

            return Ok(result);
        }

        [HttpGet("cereri-resetare")]
        public async Task<IActionResult> GetCereriResetare()
        {
            var result = await _context.CereriResetareParola
                .AsNoTracking()
                .Join(_context.Utilizatori,
                    c => c.UtilizatorId,
                    u => u.Id,
                    (c, u) => new
                    {
                        c.Id,
                        c.UtilizatorId,
                        u.Nume,
                        u.Prenume,
                        u.Email,
                        u.Functie,
                        u.Sectie,
                        c.DataCerere,
                        c.Status
                    })
                .OrderByDescending(c => c.DataCerere)
                .ToListAsync();

            return Ok(result);
        }

        [HttpPut("cereri-resetare/{id:int}")]
        public async Task<IActionResult> ResolveResetRequest(int id)
        {
            var cerere = await _context.CereriResetareParola.FirstOrDefaultAsync(c => c.Id == id);
            if (cerere == null)
                return NotFound(new { message = "Cererea de resetare nu există." });

            cerere.Status = "Rezolvata";
            await _context.SaveChangesAsync();

            return Ok(new { message = "Cererea a fost marcată ca rezolvată." });
        }

        [HttpPut("concedii/{id:int}")]
        public async Task<IActionResult> DecideConcediu(int id, [FromBody] LeaveDecisionDto dto)
        {
            if (dto.Status != "Aprobat" && dto.Status != "Respins")
                return BadRequest(new { message = "Status invalid." });

            var cerere = await _context.CereriConcediu.FirstOrDefaultAsync(c => c.Id == id);
            if (cerere == null)
                return NotFound(new { message = "Cererea de concediu nu există." });

            cerere.Status = dto.Status;

            if (dto.Status == "Aprobat")
            {
                try
                {
                    for (var targetDate = cerere.DataInceput; targetDate <= cerere.DataSfarsit; targetDate = targetDate.AddDays(1))
                    {
                        var targetDateTime = targetDate.ToDateTime(TimeOnly.MinValue, DateTimeKind.Utc);

                        await _context.Database.ExecuteSqlRawAsync(
                            @"INSERT INTO grafic_ture (user_id, data, tura, tip) 
                              VALUES ({0}, {1}, 'Concediu', 'concediu') 
                              ON CONFLICT (user_id, data) 
                              DO UPDATE SET tura = 'Concediu', tip = 'concediu';",
                            cerere.UserId, targetDateTime);
                    }
                }
                catch (Exception ex)
                {
                    return BadRequest(new { message = "Eroare la actualizarea turelor pentru concediu: " + ex.Message });
                }
            }

            await _context.SaveChangesAsync();
            return Ok(new { message = $"Cererea a fost {dto.Status.ToLower()}." });
        }

        [HttpGet("cursuri")]
        public async Task<IActionResult> GetCursuri()
        {
            var result = await _context.CursuriAngajati
                .AsNoTracking()
                .Join(_context.Utilizatori,
                    c => c.UserId,
                    u => u.Id,
                    (c, u) => new
                    {
                        c.Id,
                        c.UserId,
                        u.Nume,
                        u.Prenume,
                        c.TitluCurs,
                        c.Status,
                        c.DataFinalizare,
                        c.MaterialUrl
                    })
                .OrderByDescending(c => c.Id)
                .ToListAsync();

            return Ok(result);
        }

        [HttpPost("cursuri")]
        public async Task<IActionResult> AssignCourse([FromBody] AssignCourseDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.TitluCurs))
                return BadRequest(new { message = "Titlul cursului este obligatoriu." });

            if (dto.UserId == 0)
            {
                var allEmployees = await _context.Utilizatori.Select(u => u.Id).ToListAsync();
                if (!allEmployees.Any())
                    return BadRequest(new { message = "Nu există angajați în sistem." });

                foreach (var empId in allEmployees)
                {
                    var courseForAll = new CursAngajat
                    {
                        UserId = empId,
                        TitluCurs = dto.TitluCurs.Trim(),
                        Status = "Neînceput",
                        MaterialUrl = dto.MaterialUrl
                    };
                    _context.CursuriAngajati.Add(courseForAll);
                }

                await _context.SaveChangesAsync();
                return Ok(new { message = "Cursul a fost atribuit cu succes tuturor angajaților!" });
            }

            var employeeExists = await _context.Utilizatori.AnyAsync(u => u.Id == dto.UserId);
            if (!employeeExists)
                return NotFound(new { message = "Angajatul selectat nu există." });

            var course = new CursAngajat
            {
                UserId = dto.UserId,
                TitluCurs = dto.TitluCurs.Trim(),
                Status = "Neînceput",
                MaterialUrl = dto.MaterialUrl
            };

            _context.CursuriAngajati.Add(course);
            await _context.SaveChangesAsync();

            return Ok(course);
        }
    }

    public class LeaveDecisionDto
    {
        public string Status { get; set; } = string.Empty;
    }

    public class AssignCourseDto
    {
        public int UserId { get; set; }
        public string TitluCurs { get; set; } = string.Empty;
        public string? MaterialUrl { get; set; }
    }
}