using MedAssistB.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace MedAssistB.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public class AngajatController : ControllerBase
    {
        private readonly PostgresContext _context;

        public AngajatController(PostgresContext context)
        {
            _context = context;
        }

        private int GetUserId()
        {
            var value = User.FindFirstValue(ClaimTypes.NameIdentifier);
            if (!int.TryParse(value, out var userId))
                throw new UnauthorizedAccessException("Utilizatorul autentificat nu are un ID valid.");
            return userId;
        }

        [HttpGet("concedii")]
        public IActionResult GetConcedii()
        {
            var userId = GetUserId();

            var concedii = _context.CereriConcediu
                .AsNoTracking()
                .Where(c => c.UserId == userId)
                .OrderByDescending(c => c.CreatedAt)
                .ToList();

            return Ok(concedii);
        }

        [HttpPost("concedii")]
        public async Task<IActionResult> SalveazaConcediu([FromBody] CerereConcediu cerere)
        {
            var userId = GetUserId();

            cerere.Id = 0;
            cerere.UserId = userId;

            // Dacă este Medical sau Fără Plată, se aprobă automat din oficiu
            bool esteAutoAprobat = cerere.TipConcediu == "Medical" ||
                                   cerere.TipConcediu == "Fara Plata" ||
                                   cerere.TipConcediu == "FaraPlata";

            cerere.Status = esteAutoAprobat ? "Aprobat" : "In asteptare";
            cerere.CreatedAt = DateTime.UtcNow;

            _context.CereriConcediu.Add(cerere);
            await _context.SaveChangesAsync();

            // Dacă este auto-aprobat, populăm automat și graficul de ture
            if (esteAutoAprobat)
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
                            userId, targetDateTime);
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine("Eroare la actualizarea automată a turelor: " + ex.Message);
                }
            }

            return Ok(cerere);
        }

        [HttpGet("cursuri")]
        public IActionResult GetCursuri()
        {
            var userId = GetUserId();

            var cursuri = _context.CursuriAngajati
                .AsNoTracking()
                .Where(c => c.UserId == userId)
                .OrderByDescending(c => c.Id)
                .ToList();

            return Ok(cursuri);
        }

        [HttpGet("payroll")]
        public IActionResult GetPayroll()
        {
            var userId = GetUserId();

            var fluturasi = _context.FluturasiSalariu
                .AsNoTracking()
                .Where(f => f.UserId == userId)
                .OrderByDescending(f => f.An)
                .ThenByDescending(f => f.Luna)
                .ToList();

            return Ok(fluturasi);
        }

        [HttpPut("cursuri/{id:int}/status")]
        public async Task<IActionResult> UpdateCourseStatus(int id, [FromBody] CourseStatusDto dto)
        {
            var userId = GetUserId();

            if (dto.Status != "În curs" && dto.Status != "Finalizat")
                return BadRequest(new { message = "Status invalid." });

            var course = await _context.CursuriAngajati
                .FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);

            if (course == null)
                return NotFound(new { message = "Cursul nu a fost găsit." });

            course.Status = dto.Status;
            course.DataFinalizare = dto.Status == "Finalizat" ? DateTime.UtcNow : null;

            await _context.SaveChangesAsync();
            return Ok(course);
        }

        [HttpGet("profil")]
        public IActionResult GetProfil()
        {
            var userId = GetUserId();

            var angajat = _context.Utilizatori
                .AsNoTracking()
                .Where(u => u.Id == userId)
                .Select(u => new
                {
                    nume = u.Nume,
                    prenume = u.Prenume,
                    dataNasterii = "1990-05-15",
                    cnp = "1900515123456",
                    dataAngajarii = "2021-03-01",
                    tipContract = "Perioadă Nedeterminată",
                    iban = "RO98BTRL12345678901234XX",
                    asigurareSanatate = "Activă (CAS MB)",
                    asigurareMalpraxis = "Polița NR. 987654",
                    stareCivila = "Nespecificat",
                    partener = "",
                    copii = 0,
                    functie = u.Functie ?? "Fără funcție",
                    sectie = u.Sectie ?? "Fără secție",
                    telefon = u.Telefon ?? "-"
                })
                .FirstOrDefault();

            if (angajat == null)
                return NotFound(new { mesaj = "Angajatul nu a fost găsit." });

            return Ok(angajat);
        }
    }

    public class CourseStatusDto
    {
        public string Status { get; set; } = string.Empty;
    }
}
