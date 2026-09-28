import { useState, useEffect } from 'react';
import { fetchAuth } from '../api';

export default function Payroll() {
  const [fluturasi, setFluturasi] = useState([]);
  const [incarcare, setIncarcare] = useState(true);

  const incarcaFluturasi = async () => {
    try {
      setIncarcare(true);
      const res = await fetchAuth('http://localhost:5269/api/angajat/payroll');
      
      if (!res.ok) {
        throw new Error(`Eroare server: ${res.status}`);
      }

      const data = await res.json();
      console.log("DATE PROCESATE:", data);
      
      const lista = Array.isArray(data) ? data : (data?.$values || []);
      setFluturasi(lista);
    } catch (err) {
      console.error("Eroare la fetch payroll:", err);
    } finally {
      setIncarcare(false);
    }
  };

  useEffect(() => {
    incarcaFluturasi();
  }, []);

  const primul = fluturasi[0] || {};
  const salariuBrut = primul.salariuBrut || primul.SalariuBrut || 0;
  const salariuNet = primul.salariuNet || primul.SalariuNet || 0;
  const taxe = primul.taxe || primul.Taxe || (salariuBrut - salariuNet);

  if (incarcare) return <p style={{ textAlign: 'center', padding: '40px' }}>Se încarcă datele salariale...</p>;

  return (
    <div style={styles.container}>
      <button 
        onClick={() => window.location.href = '/angajat'} 
        style={{ marginBottom: '20px', padding: '8px 15px', cursor: 'pointer' }}
      >
        ⬅️ Înapoi
      </button>

      {/* CARD 1: Statistica Fluturas Salariu Curent */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Salariu Brut (Ultima Lună)</span>
          <span style={styles.statValue}>{salariuBrut} RON</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Impozite & Contribuții (Estimat)</span>
          <span style={{ ...styles.statValue, color: '#c5221f' }}>{taxe} RON</span>
        </div>
        <div style={{ ...styles.statCard, borderLeft: '4px solid #137333' }}>
          <span style={styles.statLabel}>Salariu Net Încasat</span>
          <span style={{ ...styles.statValue, color: '#137333' }}>{salariuNet} RON</span>
        </div>
      </div>

      {/* CARD 2: Solicitare Adeverinta */}
      <div style={styles.card}>
        <h3 style={styles.sectionTitle}>Documente Salariale și Solicitări</h3>
        <p style={{ color: '#5f6368', fontSize: '0.9rem', marginBottom: '16px' }}>
          Poți solicita o adeverință de salariu generată automat pentru bănci sau alte instituții.
        </p>
        <button 
          onClick={() => alert('Cererea pentru adeverință a fost trimisă către HR.')} 
          style={styles.submitBtn}
        >
          📄 Solicită Adeverință de Salariu
        </button>
      </div>

      {/* CARD 3: Istoric Fluturasi */}
      <div style={styles.card}>
        <div style={styles.header}>
          <h3 style={styles.sectionTitle}>Istoric Fluturași de Salariu</h3>
          <span style={styles.counter}>{fluturasi.length} fluturași disponibili</span>
        </div>

        {fluturasi.length === 0 ? (
          <p style={styles.emptyText}>Nu există fluturași de salariu înregistrați.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Luna / An</th>
                <th style={styles.th}>Salariu Brut</th>
                <th style={styles.th}>Rețineri / Taxe</th>
                <th style={styles.th}>Salariu Net</th>
                <th style={styles.th}>Acțiune</th>
              </tr>
            </thead>
            <tbody>
              {fluturasi.map((item, index) => {
                const lunaVal = item.luna || item.Luna;
                const anVal = item.an || item.An;
                const lunaAfișată = (lunaVal && anVal) ? `Luna ${lunaVal} / ${anVal}` : `Luna ${index + 1}`;
                
                const brut = item.salariuBrut || item.SalariuBrut || 0;
                const net = item.salariuNet || item.SalariuNet || 0;
                const retineri = item.taxe || item.Taxe || (brut - net);

                return (
                  <tr key={item.id || item.Id || index}>
                    <td style={styles.td}><strong>{lunaAfișată}</strong></td>
                    <td style={styles.td}>{brut} RON</td>
                    <td style={styles.td}>{retineri} RON</td>
                    <td style={{ ...styles.td, fontWeight: 'bold', color: '#137333' }}>
                      {net} RON
                    </td>
                    <td style={styles.td}>
                      <button 
                        onClick={() => alert(`Se descarcă fluturașul pentru: ${lunaAfișată}`)} 
                        style={styles.actionBtn}
                      >
                        📥 Descarcă PDF
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '24px', maxWidth: '1000px', margin: '0 auto', fontFamily: "'Segoe UI', sans-serif" },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' },
  statCard: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column' },
  statLabel: { fontSize: '0.85rem', color: '#5f6368', marginBottom: '8px' },
  statValue: { fontSize: '1.6rem', fontWeight: 'bold', color: '#1a1a1a' },
  card: { backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid #e0e0e0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
  sectionTitle: { margin: '0 0 16px 0', fontSize: '1.2rem', color: '#1a1a1a' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  counter: { backgroundColor: '#f0f4f9', color: '#0b57d0', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem' },
  submitBtn: { padding: '12px 20px', backgroundColor: '#0b57d0', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.95rem' },
  actionBtn: { padding: '6px 12px', backgroundColor: '#f0f4f9', color: '#0b57d0', border: '1px solid #0b57d0', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { padding: '12px', backgroundColor: '#f8f9fa', color: '#5f6368', fontSize: '0.85rem', textTransform: 'uppercase', borderBottom: '2px solid #e0e0e0' },
  td: { padding: '12px', borderBottom: '1px solid #f0f0f0', color: '#3c4043' },
  emptyText: { textAlign: 'center', color: '#70757a' }
};