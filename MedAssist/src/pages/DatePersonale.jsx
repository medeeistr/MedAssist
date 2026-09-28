import { useState, useEffect } from 'react';
import { fetchAuth } from '../api';
import { useNavigate } from 'react-router-dom';

const DatePersonale = () => {
  const navigate = useNavigate();

  // Initializam cu valori default pana vin datele de la server
  const [dateAngajat, setDateAngajat] = useState(null);
  const [incarcare, setIncarcare] = useState(true);

  // Preluam datele reale din backend prin useEffect
  useEffect(() => {
    fetchAuth('http://localhost:5269/api/angajat/profil')
      .then((res) => {
        if (!res.ok) throw new Error(`Eroare HTTP: ${res.status}`);
        return res.json();
      })
      .then((data) => {
        console.log("PROFIL PRIMIT DE LA BACKEND:", data);
        setDateAngajat(data);
        setIncarcare(false);
      })
      .catch((err) => {
        console.error("Eroare la fetch profil:", err);
        setIncarcare(false);
      });
  }, []);

  if (incarcare) {
    return <p style={{ textAlign: 'center', padding: '40px', fontFamily: 'Arial' }}>Se încarcă datele personale...</p>;
  }

  if (!dateAngajat) {
    return <p style={{ textAlign: 'center', padding: '40px', fontFamily: 'Arial', color: 'red' }}>Nu s-au putut încărca datele angajatului.</p>;
  }

  return (
    <div style={styles.container}>
      <button 
        onClick={() => navigate('/angajat')} 
        style={{ marginBottom: '20px', padding: '8px 15px', cursor: 'pointer' }}
      >
        ⬅️ Înapoi
      </button>

      <h2>Profil Angajat - Date Personale</h2>

      {/* Tabel cu date personale */}
      <div style={styles.card}>
        <table style={styles.table}>
          <tbody>
            <tr>
              <td style={styles.labelTd}>Nume:</td>
              <td style={styles.valueTd}>{dateAngajat.nume}</td>
            </tr>
            <tr>
              <td style={styles.labelTd}>Prenume:</td>
              <td style={styles.valueTd}>{dateAngajat.prenume}</td>
            </tr>
            <tr>
              <td style={styles.labelTd}>Data Nașterii:</td>
              <td style={styles.valueTd}>{dateAngajat.dataNasterii ? dateAngajat.dataNasterii.split('T')[0] : '-'}</td>
            </tr>
            <tr>
              <td style={styles.labelTd}>CNP:</td>
              <td style={styles.valueTd}>{dateAngajat.cnp}</td>
            </tr>
            <tr>
              <td style={styles.labelTd}>Data Angajării:</td>
              <td style={styles.valueTd}>{dateAngajat.dataAngajarii ? dateAngajat.dataAngajarii.split('T')[0] : '-'}</td>
            </tr>
            <tr>
              <td style={styles.labelTd}>Tip Contract:</td>
              <td style={styles.valueTd}>
                <span style={styles.badge}>{dateAngajat.tipContract}</span>
              </td>
            </tr>
            <tr>
              <td style={styles.labelTd}>IBAN Salariu:</td>
              <td style={styles.valueTd}>{dateAngajat.iban}</td>
            </tr>
            <tr>
              <td style={styles.labelTd}>Asigurare Sănătate:</td>
              <td style={styles.valueTd}>{dateAngajat.asigurareSanatate}</td>
            </tr>
            <tr>
              <td style={styles.labelTd}>Asigurare Malpraxis:</td>
              <td style={styles.valueTd}>{dateAngajat.asigurareMalpraxis}</td>
            </tr>
            <tr>
              <td style={styles.labelTd}>Familie & Dependenți:</td>
              <td style={styles.valueTd}>
                {dateAngajat.stareCivila || 'Nespecificat'} 
                {dateAngajat.partener ? ` (${dateAngajat.partener})` : ''} | 
                Copii: {dateAngajat.copii ?? 0}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  container: { 
    maxWidth: '700px', 
    margin: '20px auto', 
    padding: '20px', 
    fontFamily: 'Arial, sans-serif',
    backgroundColor: '#f4f7f9',
    minHeight: '100vh',
    borderRadius: '8px'
  },
  backButton: { 
    marginBottom: '20px', 
    padding: '8px 15px', 
    cursor: 'pointer', 
    borderRadius: '4px', 
    border: '1px solid #ccc', 
    backgroundColor: '#fff',
    fontWeight: 'bold'
  },
  card: { 
    backgroundColor: '#fff', 
    borderRadius: '8px', 
    padding: '20px', 
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    marginBottom: '20px' 
  },
  table: { 
    width: '100%', 
    borderCollapse: 'collapse' 
  },
  labelTd: { 
    padding: '12px 8px', 
    fontWeight: 'bold', 
    color: '#555', 
    borderBottom: '1px solid #eee',
    width: '35%'
  },
  valueTd: { 
    padding: '12px 8px', 
    color: '#222', 
    borderBottom: '1px solid #eee' 
  },
  badge: { 
    backgroundColor: '#e3f2fd', 
    color: '#0d47a1', 
    padding: '4px 8px', 
    borderRadius: '4px', 
    fontSize: '14px', 
    fontWeight: '500' 
  },
  downloadContainer: { 
    backgroundColor: '#fff', 
    padding: '20px', 
    borderRadius: '8px', 
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    textAlign: 'center'
  },
  downloadButton: { 
    padding: '12px 24px', 
    backgroundColor: '#0b57d0', 
    color: '#fff', 
    border: 'none', 
    borderRadius: '6px', 
    cursor: 'pointer', 
    fontSize: '16px',
    fontWeight: 'bold' 
  }
};

export default DatePersonale;
