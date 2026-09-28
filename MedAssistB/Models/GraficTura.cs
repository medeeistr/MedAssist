using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MedAssistB.Models
{
    [Table("grafic_ture")]
    public class GraficTura
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("user_id")]
        public int UserId { get; set; }

        [Column("data")]
        public DateTime Data { get; set; }

        [Column("tura")]
        public string Tura { get; set; } = string.Empty;

        [Column("tip")]
        public string Tip { get; set; } = string.Empty;
    }
}
