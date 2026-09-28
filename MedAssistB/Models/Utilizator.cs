using System.ComponentModel.DataAnnotations.Schema;

namespace MedAssistB.Models;

[Table("utilizatori")]
public class Utilizator
{
    [Column("id")]
    public int Id { get; set; }

    [Column("nume")]
    public string Nume { get; set; } = string.Empty;

    [Column("prenume")]
    public string Prenume { get; set; } = string.Empty;

    [Column("email")]
    public string Email { get; set; } = string.Empty;

    [Column("parola_hash")]
    public string ParolaHash { get; set; } = string.Empty;

    [Column("telefon")]
    public string? Telefon { get; set; }

    [Column("functie")]
    public string? Functie { get; set; }

    [Column("functie_conducere")]
    public string? FunctieConducere { get; set; }

    [Column("sectie")]
    public string? Sectie { get; set; }

    [Column("rol_id")]
    public int RolId { get; set; }
}
