import { useState, useEffect } from 'react';
import { fetchAuth } from '../api';

export default function Cursuri() {
  const [cursuri, setCursuri] = useState([]);
  const [incarcare, setIncarcare] = useState(true);

  const incarcaCursuri = () => {
    fetchAuth('http://localhost:5269/api/angajat/cursuri')
      .then((res) => res.json())
      .then((data) => {
        const lista = Array.isArray(data) ? data : (data?.$values || []);
        setCursuri(lista);
        setIncarcare(false);
      })
      .catch((err) => {
        console.error("Eroare la fetch cursuri:", err);
        setIncarcare(false);
      });
  };

  useEffect(() => {
    incarcaCursuri();
  }, []);

  const actualizeazaStatusSiDeschide = async (item, statusDorit) => {
    try {
      const linkMaterial = item.materialUrl;
      
      // Dacă utilizatorul incepe cursul sau apasa pe el, deschidem materialul daca exista
      if (linkMaterial && (statusDorit === 'În curs')) {
        window.open(linkMaterial, '_blank');
      }

      const response = await fetchAuth(`http://localhost:5269/api/angajat/cursuri/${item.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: statusDorit })
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.message || 'Nu s-a putut actualiza cursul.');

      incarcaCursuri();
    } catch (err) {
      alert(err.message);
    }
  };

  const finalizate = cursuri.filter(c => {
    const st = (c.status || c.stare || '').toLowerCase();
    return st.includes('finalizat') || st.includes('completat') || st.includes('aprobat');
  }).length;

  const inCurs = cursuri.length - finalizate;

  const getStatusBadge = (statusParam) => {
    const s = (statusParam || '').toLowerCase();
    if (s.includes('finalizat') || s.includes('completat')) {
      return { bg: '#e6f4ea', color: '#137333', text: 'Finalizat' };
    }
    if (s.includes('in curs') || s.includes('parcurs') || s.includes('╬n curs')) {
      return { bg: '#fef7e0', color: '#b06000', text: 'În Curs' };
    }
    return { bg: '#fce8e6', color: '#c5221f', text: 'Nefinalizat' };
  };

  if (incarcare) return <p style={{ textAlign: 'center', padding: '40px' }}>Se încarcă cursurile...</p>;

  return (
    <div style={styles.container}>
      <button 
        onClick={() => window.location.href = '/angajat'} 
        style={{ marginBottom: '20px', padding: '8px 15px', cursor: 'pointer' }}
      >
        ⬅️ Înapoi
      </button>

      {/* CARD 1: Statistica Cursuri */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Total Cursuri Alocate</span>
          <span style={styles.statValue}>{cursuri.length}</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Cursuri Finalizate</span>
          <span style={{ ...styles.statValue, color: '#137333' }}>{finalizate}</span>
        </div>
        <div style={{ ...styles.statCard, borderLeft: '4px solid #b06000' }}>
          <span style={styles.statLabel}>Cursuri În Curs / Neîncepute</span>
          <span style={{ ...styles.statValue, color: '#b06000' }}>{inCurs}</span>
        </div>
      </div>

      {/* CARD 2: Lista Cursuri */}
      <div style={styles.card}>
        <div style={styles.header}>
          <h3 style={styles.sectionTitle}>Instruiri SSM și Cursuri de Dezvoltare</h3>
          <span style={styles.counter}>{cursuri.length} cursuri înregistrate</span>
        </div>

        {cursuri.length === 0 ? (
          <p style={styles.emptyText}>Nu există niciun curs sau instruire asignată în acest moment.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Titlu Curs</th>
                <th style={styles.th}>Status</th>
                <th style={styles.th}>Acțiune</th>
              </tr>
            </thead>
            <tbody>
              {cursuri.map((item, index) => {
                const titluCurs = item.titluCurs || item.titlu || item.nume || `Curs #${index + 1}`;
                const statusText = item.status || item.stare || 'Neînceput';
                const badge = getStatusBadge(statusText);
                const hasLink = Boolean(item.materialUrl);

                return (
                  <tr key={item.id || index}>
                    <td style={styles.td}>
                      <strong>{titluCurs}</strong>
                    </td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, backgroundColor: badge.bg, color: badge.color }}>
                        {badge.text}
                      </span>
                    </td>
                    <td style={styles.td}>
                      {badge.text === 'Finalizat' ? (
                        
                        <p>Nu necesită alte acțiuni.</p>
                      ) : badge.text === 'În Curs' ? (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {hasLink && (
                            <button
                              onClick={() => window.open(item.materialUrl, '_blank')}
                              style={styles.startBtn}
                            >
                              🔗 Deschide Material
                            </button>
                          )}
                          <button
                            onClick={() => actualizeazaStatusSiDeschide(item, 'Finalizat')}
                            style={styles.secondaryBtn}
                          >
                            ✅ Finalizează
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {hasLink && (
                            <button
                              onClick={() => actualizeazaStatusSiDeschide(item, 'În curs')}
                              style={styles.startBtn}
                            >
                              ▶️ Începe Cursul
                            </button>
                          )}
                          <p></p><p> sau </p><p></p>
                          <button
                            onClick={() => actualizeazaStatusSiDeschide(item, 'Finalizat')}
                            style={styles.secondaryBtn}
                          >
                            ✅ Finalizează
                          </button>
                        </div>
                      )}
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
  startBtn: { padding: '6px 12px', backgroundColor: '#0b57d0', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' },
  secondaryBtn: { padding: '6px 12px', backgroundColor: '#f0f4f9', color: '#3c4043', border: '1px solid #ccc', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { padding: '12px', backgroundColor: '#f8f9fa', color: '#5f6368', fontSize: '0.85rem', textTransform: 'uppercase', borderBottom: '2px solid #e0e0e0' },
  td: { padding: '12px', borderBottom: '1px solid #f0f0f0', color: '#3c4043' },
  badge: { padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600' },
  emptyText: { textAlign: 'center', color: '#70757a' }
};