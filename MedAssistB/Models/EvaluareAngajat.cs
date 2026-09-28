using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MedAssistB.Models
{
    [Table("evaluari_angajati")]
    public class EvaluareAngajat
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("user_id")]
        public int UserId { get; set; }

        [Column("perioada")]
        public string? Perioada { get; set; }

        [Column("punctaj_profesional")]
        public int? PunctajProfesional { get; set; }

        [Column("punctaj_echipa")]
        public int? PunctajEchipa { get; set; }

        [Column("punctaj_comunicare")]
        public int? PunctajComunicare { get; set; }

        [Column("punctaj_responsabilitate")]
        public int? PunctajResponsabilitate { get; set; }

        [Column("punctaj_total")]
        public int? PunctajTotal { get; set; }

        [Column("comentarii")]
        public string? Comentarii { get; set; }

        [Column("status")]
        public string? Status { get; set; }

        [Column("created_at")]
        public DateTime? CreatedAt { get; set; }

        [Column("updated_at")]
        public DateTime? UpdatedAt { get; set; }

        [Column("progres_viitor")]
        public string? ProgresViitor { get; set; }

        [Column("submitted_at")]
        public DateTime? SubmittedAt { get; set; }

        [Column("scor_mediu")]
        public decimal? ScorMediu { get; set; }
    }
}