using MedAssistB.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace MedAssistB.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly PostgresContext _context;

    private const string JwtSecret = "MedAssistJwtSecret_2026_ChangeThisToYourOwnLongSecretKey_AtLeast32Chars!";

    public AuthController(PostgresContext context)
    {
        _context = context;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto request)
    {
        if (request == null || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Parola))
            return BadRequest(new { message = "Emailul și parola sunt obligatorii." });

        var emailClean = request.Email.Trim().ToLower();

        var user = await _context.Utilizatori
            .FirstOrDefaultAsync(u => u.Email.ToLower() == emailClean);

        if (user == null || user.ParolaHash != request.Parola)
            return Unauthorized(new { message = "Email sau parolă incorectă." });

        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Email),
            new Claim(ClaimTypes.Role, user.RolId.ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(JwtSecret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            claims: claims,
            expires: DateTime.UtcNow.AddHours(8),
            signingCredentials: credentials
        );

        return Ok(new
        {
            id = user.Id,
            nume = user.Nume,
            prenume = user.Prenume,
            email = user.Email,
            functie = user.Functie,
            sectie = user.Sectie,
            rolId = user.RolId,
            token = new JwtSecurityTokenHandler().WriteToken(token)
        });
    }

    [HttpPost("request-password-reset")]
    public async Task<IActionResult> RequestPasswordReset([FromBody] ResetPasswordRequestDto request)
    {
        var user = await _context.Utilizatori
            .FirstOrDefaultAsync(u => u.Email.ToLower() == request.Email.ToLower());

        if (user == null)
            return NotFound(new { message = "Nu a fost găsit niciun cont cu acest email." });

        var cerere = new CerereResetareParola
        {
            UtilizatorId = user.Id,
            DataCerere = DateTime.UtcNow,
            Status = "Pornita"
        };

        _context.CereriResetareParola.Add(cerere);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Cererea de resetare a fost trimisă către HR și Șeful de secție." });
    }
}
