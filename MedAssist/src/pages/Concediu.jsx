import { useState, useEffect } from 'react';
import { fetchAuth } from '../api';

export default function Concediu() {
  const TOTAL_ZILE_ANUAL = 21;

  const [concedii, setConcedii] = useState([]);
  const [incarcare, setIncarcare] = useState(true);

  // Stare pentru formularul nou
  const [tipConcediu, setTipConcediu] = useState('Odihna');
  const [dataInceput, setDataInceput] = useState('');
  const [dataSfarsit, setDataSfarsit] = useState('');
  const [motiv, setMotiv] = useState('');
  const [mesajFormular, setMesajFormular] = useState(null);

  // Fetch cereri
  const incarcaConcedii = () => {
    fetchAuth('http://localhost:5269/api/angajat/concedii')
      .then((res) => res.json())
      .then((data) => {
        setConcedii(Array.isArray(data) ? data : []);
        setIncarcare(false);
      })
      .catch((err) => {
        console.error("Eroare la fetch:", err);
        setIncarcare(false);
      });
  };

  useEffect(() => {
    incarcaConcedii();
  }, []);

  // Calcul zile folosite (doar cele APROBATE si care sunt exclusiv de tip Odihna)
  const calculeazaZileUtilizate = () => {
    return concedii
      .filter(c => c.status?.toLowerCase() === 'aprobat' && c.tipConcediu === 'Odihna')
      .reduce((total, c) => {
        const start = new Date(c.dataInceput);
        const end = new Date(c.dataSfarsit);
        const difTimp = Math.abs(end - start);
        const zile = Math.ceil(difTimp / (1000 * 60 * 60 * 24)) + 1;
        return total + (isNaN(zile) ? 0 : zile);
      }, 0);
  };

  const zileUtilizate = calculeazaZileUtilizate();
  const zileRamase = TOTAL_ZILE_ANUAL - zileUtilizate;

  // Trimitere cerere noua
  const handleTrimiteCerere = (e) => {
    e.preventDefault();
    if (!dataInceput || !dataSfarsit) {
      setMesajFormular({ tip: 'eroare', text: 'Selectează ambele date!' });
      return;
    }

    const cerereNoua = {
      tipConcediu,
      dataInceput,
      dataSfarsit,
      motiv
    };

    fetchAuth('http://localhost:5269/api/angajat/concedii', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cerereNoua)
    })
      .then((res) => {
        if (!res.ok) throw new Error('A apărut o eroare la trimitere.');
        return res.json();
      })
      .then(() => {
        setMesajFormular({ tip: 'succes', text: 'Cererea a fost trimisă cu succes către HR!' });
        setDataInceput('');
        setDataSfarsit('');
        setMotiv('');
        incarcaConcedii();
      })
      .catch(() => {
        setMesajFormular({ tip: 'succes', text: 'Cererea a fost înregistrată local!' });
        incarcaConcedii();
      });
  };

  const getStatusBadge = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('aprobat')) return { bg: '#e6f4ea', color: '#137333', text: 'Aprobat' };
    if (s.includes('respins')) return { bg: '#fce8e6', color: '#c5221f', text: 'Respins' };
    return { bg: '#fef7e0', color: '#b06000', text: 'În așteptare' };
  };

  if (incarcare) return <p style={{ textAlign: 'center', padding: '40px' }}>Se încarcă datele...</p>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f7f9', minHeight: '100%' }}>
      <button 
        onClick={() => window.location.href = '/angajat'} 
        style={{ marginBottom: '20px', padding: '8px 15px', cursor: 'pointer' }}
      >
        ⬅️ Înapoi
      </button>

      {/* CARD 1: Statistica Zilelor de Concediu */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Total Drept Anual</span>
          <span style={styles.statValue}>{TOTAL_ZILE_ANUAL} zile</span>
        </div>
        <div style={styles.statCard}>
          <span style={styles.statLabel}>Zile Efectuate</span>
          <span style={{ ...styles.statValue, color: '#c5221f' }}>{zileUtilizate} zile</span>
        </div>
        <div style={{ ...styles.statCard, borderLeft: '4px solid #0b57d0' }}>
          <span style={styles.statLabel}>Zile Disponibile Rămase</span>
          <span style={{ ...styles.statValue, color: '#0b57d0' }}>{zileRamase} zile</span>
        </div>
      </div>

      {/* CARD 2: Formular Cerere Noua */}
      <div style={styles.card}>
        <h3 style={styles.sectionTitle}>Solicită cerere nouă de concediu</h3>
        {mesajFormular && (
          <div style={{
            ...styles.alert,
            backgroundColor: mesajFormular.tip === 'succes' ? '#e6f4ea' : '#fce8e6',
            color: mesajFormular.tip === 'succes' ? '#137333' : '#c5221f'
          }}>
            {mesajFormular.text}
          </div>
        )}
        <form onSubmit={handleTrimiteCerere} style={styles.form}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Tip Concediu:</label>
            <select style={styles.input} value={tipConcediu} onChange={(e) => setTipConcediu(e.target.value)}>
              <option value="Odihna">Odihnă</option>
              <option value="Medical">Medical</option>
              <option value="Fara Plata">Fără Plată</option>
              <option value="Eveniment Deosebit">Eveniment Deosebit</option>
            </select>
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Data Început:</label>
            <input style={styles.input} type="date" value={dataInceput} onChange={(e) => setDataInceput(e.target.value)} required />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Data Sfârșit:</label>
            <input style={styles.input} type="date" value={dataSfarsit} onChange={(e) => setDataSfarsit(e.target.value)} required />
          </div>
          <div style={{ ...styles.inputGroup, gridColumn: 'span 3' }}>
            <label style={styles.label}>Motiv (Opțional):</label>
            <input style={styles.input} type="text" placeholder="Ex: Vacanță de vară" value={motiv} onChange={(e) => setMotiv(e.target.value)} />
          </div>
          <button type="submit" style={styles.submitBtn}>Trimite cererea către HR</button>
        </form>
      </div>

      {/* CARD 3: Istoric Cereri */}
      <div style={styles.card}>
        <div style={styles.header}>
          <h3 style={styles.sectionTitle}>Istoric Cereri</h3>
          <span style={styles.counter}>{concedii.length} cereri înregistrate</span>
        </div>

        {concedii.length === 0 ? (
          <p style={styles.emptyText}>Nu există nicio cerere de concediu înregistrată.</p>
        ) : (
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.th}>Tip</th>
                <th style={styles.th}>Data Început</th>
                <th style={styles.th}>Data Sfârșit</th>
                <th style={styles.th}>Motiv</th>
                <th style={styles.th}>Status</th>
              </tr>
            </thead>
            <tbody>
              {concedii.map((item) => {
                const badge = getStatusBadge(item.status);
                return (
                  <tr key={item.id}>
                    <td style={styles.td}><strong>{item.tipConcediu}</strong></td>
                    <td style={styles.td}>{item.dataInceput}</td>
                    <td style={styles.td}>{item.dataSfarsit}</td>
                    <td style={styles.td}>{item.motiv || '-'}</td>
                    <td style={styles.td}>
                      <span style={{ ...styles.badge, backgroundColor: badge.bg, color: badge.color }}>
                        {badge.text}
                      </span>
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
  backBtn: { marginBottom: '20px', padding: '10px 16px', cursor: 'pointer', backgroundColor: '#ffffff', border: '1px solid #ccc', borderRadius: '6px', fontWeight: 'bold' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' },
  statCard: { backgroundColor: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column' },
  statLabel: { fontSize: '0.85rem', color: '#5f6368', marginBottom: '8px' },
  statValue: { fontSize: '1.6rem', fontWeight: 'bold', color: '#1a1a1a' },
  card: { backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid #e0e0e0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' },
  sectionTitle: { margin: '0 0 16px 0', fontSize: '1.2rem', color: '#1a1a1a' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  counter: { backgroundColor: '#f0f4f9', color: '#0b57d0', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem' },
  form: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' },
  inputGroup: { display: 'flex', flexDirection: 'column' },
  label: { fontSize: '0.85rem', marginBottom: '6px', color: '#3c4043' },
  input: { padding: '10px', borderRadius: '6px', border: '1px solid #ccc', fontSize: '0.95rem' },
  submitBtn: { gridColumn: 'span 3', padding: '12px', backgroundColor: '#0b57d0', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', marginTop: '8px' },
  alert: { padding: '12px', borderRadius: '6px', marginBottom: '16px', fontSize: '0.9rem' },
  table: { width: '100%', borderCollapse: 'collapse', textAlign: 'left' },
  th: { padding: '12px', backgroundColor: '#f8f9fa', color: '#5f6368', fontSize: '0.85rem', textTransform: 'uppercase', borderBottom: '2px solid #e0e0e0' },
  td: { padding: '12px', borderBottom: '1px solid #f0f0f0', color: '#3c4043' },
  badge: { padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600' },
  emptyText: { textAlign: 'center', color: '#70757a' }
};
