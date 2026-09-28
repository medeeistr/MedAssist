using System.ComponentModel.DataAnnotations.Schema;

namespace MedAssistB.Models;

[Table("cereri_resetare_parola")]
public class CerereResetareParola
{
    [Column("id")]
    public int Id { get; set; }

    [Column("utilizator_id")]
    public int UtilizatorId { get; set; }

    [Column("data_cerere")]
    public DateTime DataCerere { get; set; } = DateTime.UtcNow;

    [Column("status")]
    public string Status { get; set; } = "Pornita";
}
