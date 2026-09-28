using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using MedAssistB.Models;

namespace MedAssistB.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Accesibil doar pe bază de token
    public class RegistruController : ControllerBase
    {
        private readonly PostgresContext _context;

        public RegistruController(PostgresContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetRegistru()
        {
            try
            {
                var utilizatori = await _context.Utilizatori
                    .AsNoTracking()
                    .ToListAsync();

                // Format așteaptat de frontend
                var rezultat = utilizatori.Select(u => new
                {
                    id = u.Id,
                    nume = u.Nume,
                    prenume = u.Prenume,
                    functie = u.Functie,
                    functieConducere = u.FunctieConducere, 
                    email = u.Email,
                    telefon = u.Telefon
                });

                return Ok(rezultat);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Eroare la preluarea registrului.", error = ex.Message });
            }
        }
    }
}