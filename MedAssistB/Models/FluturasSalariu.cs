using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace MedAssistB.Models
{
    [Table("fluturasi_salariu")]
    public class FluturasSalariu
    {
        [Key]
        [Column("id")]
        public int Id { get; set; }

        [Column("user_id")]
        public int UserId { get; set; }

        [Column("luna")]
        public int Luna { get; set; }

        [Column("an")]  
        public int An { get; set; }

        [Column("salariu_brut")]
        public decimal SalariuBrut { get; set; }

        [Column("salariu_net")] 
        public decimal SalariuNet { get; set; }

        [Column("pdf_url")]
        public string? PdfUrl { get; set; }
    }
}
