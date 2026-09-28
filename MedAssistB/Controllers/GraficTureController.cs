using Dapper;
using MedAssistB.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Npgsql;
using System.Data;
using System.Security.Claims;

namespace MedAssistB.Controllers
{
    [ApiController]
    [Route("api/graficture")]
    [Authorize]
    public class GraficTureController : ControllerBase
    {
        private readonly string _connectionString;

        public GraficTureController(IConfiguration configuration)
        {
            _connectionString = configuration.GetConnectionString("DefaultConnection")!;
        }

        private IDbConnection CreateConnection() => new NpgsqlConnection(_connectionString);

        [HttpGet("angajati")]
        [Authorize(Roles = "2,3")]
        public async Task<IActionResult> GetAngajati()
        {
            using var db = CreateConnection();
            var sql = @"SELECT id, nume, prenume, functie, sectie
                        FROM utilizatori
                        ORDER BY sectie, nume;";
            var angajati = await db.QueryAsync(sql);
            return Ok(angajati);
        }

        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetTureUser(int userId, [FromQuery] string month)
        {
            var currentUserId = int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            var role = User.FindFirstValue(ClaimTypes.Role);

            if (currentUserId != userId && role != "2" && role != "3")
                return Forbid();

            using var db = CreateConnection();
            var sql = @"SELECT TO_CHAR(data, 'YYYY-MM-DD') AS data, tura, tip
                        FROM grafic_ture
                        WHERE user_id = @UserId AND TO_CHAR(data, 'YYYY-MM') = @Month
                        ORDER BY data ASC;";

            var ture = await db.QueryAsync(sql, new { UserId = userId, Month = month });
            return Ok(ture);
        }

        [HttpPost("salveaza")]
        [Authorize(Roles = "2,3")]
        public async Task<IActionResult> SaveSchedule([FromBody] SaveScheduleDto dto)
        {
            if (dto.UserId <= 0 || dto.Schedule == null || dto.Schedule.Count == 0)
                return BadRequest(new { message = "Programul primit este invalid." });

            using var db = CreateConnection();
            db.Open();
            using var transaction = db.BeginTransaction();

            try
            {
                var sql = @"
                INSERT INTO grafic_ture (user_id, data, tura, tip)
                VALUES (@UserId, @Data, @Tura, @Tip)
                ON CONFLICT (user_id, data)
                DO UPDATE SET tura = EXCLUDED.tura, tip = EXCLUDED.tip;";

                foreach (var item in dto.Schedule)
                {
                    await db.ExecuteAsync(sql, new
                    {
                        UserId = dto.UserId,
                        Data = item.Data,
                        Tura = item.Tura,
                        Tip = item.Tip
                    }, transaction);
                }

                transaction.Commit();
                return Ok(new { message = "Programul a fost salvat cu succes în PostgreSQL!" });
            }
            catch (Exception ex)
            {
                transaction.Rollback();
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}
