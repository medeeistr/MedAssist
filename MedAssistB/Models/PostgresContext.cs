using Microsoft.EntityFrameworkCore;

namespace MedAssistB.Models;

public partial class PostgresContext : DbContext
{
    public PostgresContext() { }

    public PostgresContext(DbContextOptions<PostgresContext> options) : base(options) { }

    public DbSet<Utilizator> Utilizatori { get; set; } = null!;
    public DbSet<ProgramOperator> ProgrameOperatoare { get; set; } = null!;
    public DbSet<CerereResetareParola> CereriResetareParola { get; set; } = null!;
    public DbSet<CerereConcediu> CereriConcediu { get; set; }
    public DbSet<CursAngajat> CursuriAngajati { get; set; }
    public DbSet<FluturasSalariu> FluturasiSalariu { get; set; }
    public DbSet<GraficTura> GraficeTure { get; set; } = null!;
    public DbSet<EvaluareAngajat> EvaluariAngajati { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
