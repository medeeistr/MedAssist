using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MedAssistB.Models
{
    [Table("cereri_concediu")]
    public class CerereConcediu
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("user_id")]
        public int UserId { get; set; }

        [Column("tip_concediu")]
        public string TipConcediu { get; set; } = string.Empty;

        [Column("data_inceput")]
        public DateOnly DataInceput { get; set; }

        [Column("data_sfarsit")]
        public DateOnly DataSfarsit { get; set; } 

        [Column("motiv")]
        public string? Motiv { get; set; }

        [Column("status")]
        public string Status { get; set; } = "In asteptare";

        [Column("created_at")]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    }
}
