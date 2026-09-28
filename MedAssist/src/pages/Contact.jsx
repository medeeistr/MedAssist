import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAuth } from '../api';

// Ordinea de prioritate pentru sortare
const prioritateCategorii = {
  'Medic': 1,
  'Asistent': 2,
  'Infirmier': 3,
  'Brancardier': 4,
  'Îngrijitor': 5
};

function Contact() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('Toti');
  const [angajati, setAngajati] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eroare, setEroare] = useState('');

  // Preluarea datelor de la Backend
  useEffect(() => {
    const fetchAngajati = async () => {
      try {
        setLoading(true);
        const response = await fetchAuth('http://localhost:5269/api/registru');
        
        if (!response.ok) {
          throw new Error('Nu s-au putut prelua datele din baza de date.');
        }

        const data = await response.json();

        const angajatiMapati = data.map((u) => ({
          id: u.id,
          nume: u.nume,
          prenume: u.prenume,
          categorie: extrageCategorie(u.functie),
          detaliiRol: u.functie || 'Nespecificat',
          functieConducere: u.functieConducere || null,
          email: u.email,
          telefon: u.telefon || '-'
        }));

        setAngajati(angajatiMapati);
      } catch (err) {
        setEroare(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAngajati();
  }, []);

  const extrageCategorie = (functie) => {
    if (!functie) return 'Altul';
    const fLower = functie.toLowerCase();
    
    // Verificam mai intai asistentul, pentru a evita conflictul cu "medic" din "asistent medical"
    if (fLower.includes('asistent')) return 'Asistent';
    if (fLower.includes('medic') || fLower.includes('dr.')) return 'Medic';
    if (fLower.includes('infirmier')) return 'Infirmier';
    if (fLower.includes('brancardier')) return 'Brancardier';
    if (fLower.includes('îngrijitor') || fLower.includes('ingrijitor')) return 'Îngrijitor';
    
    return 'Altul';
  };

  // Filtrare angajati
  const angajatiFiltrati = angajati.filter((angajat) => {
    if (filter === 'Toti') return true;
    return angajat.categorie === filter;
  });

  // Sortare dupa ordinea ceruta: Medici -> Asistenți -> Infirmieri -> Brancardieri -> Ingrijitori
  const angajatiSortati = [...angajatiFiltrati].sort((a, b) => {
    const prioritateA = prioritateCategorii[a.categorie] || 99;
    const prioritateB = prioritateCategorii[b.categorie] || 99;
    return prioritateA - prioritateB;
  });

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f7f9', minHeight: '100%' }}>
      <button 
        onClick={() => navigate('/mainpage')} 
        style={{ marginBottom: '20px', padding: '8px 15px', cursor: 'pointer' }}
      >
        ⬅️ Înapoi la Meniu
      </button>

      {/* Bara de filtrare */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px', backgroundColor: '#ffffff', padding: '15px', borderRadius: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontWeight: 'bold' }}>Filtrează după categorie:</span>
        
        {['Toti', 'Medic', 'Asistent', 'Infirmier', 'Brancardier', 'Îngrijitor'].map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              padding: '6px 14px',
              borderRadius: '20px',
              border: filter === cat ? 'none' : '1px solid #ccc',
              backgroundColor: filter === cat ? '#0077b6' : '#ffffff',
              color: filter === cat ? '#ffffff' : '#333333',
              cursor: 'pointer',
              fontWeight: filter === cat ? 'bold' : 'normal',
              margin: '0 2px'
            }}
          >
            {cat === 'Toti' ? 'Toți' : `${cat}i`}
          </button>
        ))}
      </div>

      {eroare && <p style={{ color: 'red', textAlign: 'center' }}>{eroare}</p>}

      {/* Tabel Personal */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', backgroundColor: '#ffffff', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
        <thead>
          <tr style={{ backgroundColor: '#1976d2', color: 'white', textAlign: 'left' }}>
            <th style={thStyle}>Nume & Prenume</th>
            <th style={thStyle}>Categorie / Rol</th>
            <th style={thStyle}>Funcție Conducere</th>
            <th style={thStyle}>Email Serviciu</th>
            <th style={thStyle}>Telefon</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#555' }}>
                Se încarcă datele din baza de date...
              </td>
            </tr>
          ) : angajatiSortati.length > 0 ? (
            angajatiSortati.map((ang) => (
              <tr key={ang.id} style={{ borderBottom: '1px solid #ddd' }}>
                <td style={tdStyle}>
                  <strong>{ang.nume} {ang.prenume}</strong>
                </td>
                <td style={tdStyle}>
                  <span style={getBadgeStyle(ang.categorie)}>
                    {ang.categorie}
                  </span>
                  <div style={{ fontSize: '13px', color: '#555', marginTop: '4px' }}>
                    {ang.detaliiRol}
                  </div>
                </td>
                <td style={tdStyle}>
                  {ang.functieConducere ? (
                    <span style={directorBadgeStyle}>
                      ⭐ {ang.functieConducere}
                    </span>
                  ) : (
                    <span style={{ color: '#aaa', fontSize: '13px' }}>—</span>
                  )}
                </td>
                <td style={tdStyle}>
                  <a href={`mailto:${ang.email}`} style={{ color: '#0077b6', textDecoration: 'none' }}>
                    {ang.email}
                  </a>
                </td>
                <td style={tdStyle}>{ang.telefon}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" style={{ textAlign: 'center', padding: '20px', color: '#777' }}>
                Nu există angajați în această categorie.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

const thStyle = { padding: '12px', border: '1px solid #ddd' };
const tdStyle = { padding: '12px', border: '1px solid #ddd', verticalAlign: 'middle' };

const directorBadgeStyle = {
  backgroundColor: '#fff8e1',
  color: '#b78103',
  border: '1px solid #ffe082',
  padding: '4px 8px',
  borderRadius: '6px',
  fontWeight: 'bold',
  fontSize: '12px',
  display: 'inline-block'
};

const getBadgeStyle = (categorie) => {
  const base = {
    padding: '3px 8px',
    borderRadius: '12px',
    fontWeight: 'bold',
    fontSize: '12px',
    display: 'inline-block'
  };

  switch (categorie) {
    case 'Medic':
      return { ...base, backgroundColor: '#e3f2fd', color: '#1565c0', border: '1px solid #90caf9' };
    case 'Asistent':
      return { ...base, backgroundColor: '#e8f5e9', color: '#2e7d32', border: '1px solid #a5d6a7' };
    case 'Infirmier':
      return { ...base, backgroundColor: '#fff3e0', color: '#ef6c00', border: '1px solid #ffcc80' };
    case 'Brancardier':
      return { ...base, backgroundColor: '#f3e5f5', color: '#7b1fa2', border: '1px solid #ce93d8' };
    case 'Îngrijitor':
      return { ...base, backgroundColor: '#eceff1', color: '#455a64', border: '1px solid #b0bec5' };
    default:
      return { ...base, backgroundColor: '#f5f5f5', color: '#616161' };
  }
};

export default Contact;