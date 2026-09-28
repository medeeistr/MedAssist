using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace MedAssistB.Models;

[Table("program_operator")]
public class ProgramOperator
{
    [Key]
    [Column("id")]
    public int Id { get; set; }

    [Column("data_operatie")]
    public DateOnly DataOperatie { get; set; }

    [Column("ora_inceput")]
    public TimeSpan OraInceput { get; set; }

    [Column("sectie")]
    public string Sectie { get; set; } = string.Empty;

    [Column("nume_operatie")]
    public string NumeOperatie { get; set; } = string.Empty;

    [Column("nume_pacient")]
    public string NumePacient { get; set; } = string.Empty;

    [Column("chirurg_id")]
    public int? ChirurgId { get; set; }

    [Column("anestezist_id")]
    public int? AnestezistId { get; set; }

    [Column("asistent_instrumentar_id")]
    public int? AsistentInstrumentarId { get; set; }

    [Column("asistent_anestezie_id")]
    public int? AsistentAnestezieId { get; set; }

    [Column("fisa_medicala_pdf")]
    public byte[]? FisaMedicalaPdf { get; set; }
}