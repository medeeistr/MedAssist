using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace MedAssistB.Models
{
    [Table("cursuri_angajati")]
    public class CursAngajat
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("user_id")]
        public int UserId { get; set; }

        [Column("titlu_curs")]
        public string TitluCurs { get; set; } = string.Empty;

        [Column("data_finalizare")]
        public DateTime? DataFinalizare { get; set; }

        [Column("status")]
        public string Status { get; set; } = "In curs";

        [Column("material_url")]
        public string? MaterialUrl { get; set; }
    }
}