import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAuth } from '../api';

const formatDateToISO = (dateStr) => {
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const getSectieStyle = (sectie) => {
  switch (sectie) {
    case 'Cardiologie':
      return { backgroundColor: '#ffebee', color: '#c62828', borderColor: '#ef9a9a' };
    case 'Ortopedie':
      return { backgroundColor: '#e8f5e9', color: '#2e7d32', borderColor: '#a5d6a7' };
    case 'Neurologie':
      return { backgroundColor: '#e3f2fd', color: '#1565c0', borderColor: '#90caf9' };
    case 'Chirurgie Generală':
      return { backgroundColor: '#fff3e0', color: '#ef6c00', borderColor: '#ffcc80' };
    default:
      return { backgroundColor: '#f5f5f5', color: '#616161', borderColor: '#e0e0e0' };
  }
};

function Program() {
  const navigate = useNavigate();
  const [selectedDate, setSelectedDate] = useState(formatDateToISO(new Date()));
  const [operations, setOperations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eroare, setEroare] = useState('');

  useEffect(() => {
    const fetchOperations = async () => {
      try {
        setLoading(true);
        setEroare('');

        const formattedDate = formatDateToISO(selectedDate);
        const response = await fetchAuth(
          `http://localhost:5269/api/programoperator?data=${formattedDate}`
        );
        
        if (!response.ok) {
          const errData = await response.json().catch(() => null);
          const detail = errData?.inner || errData?.message || response.statusText;
          throw new Error(`Eroare server (${response.status}): ${detail}`);
        }
        
        const data = await response.json();

        const opMapate = data.map((op) => ({
          id: op.id,
          data: op.data || selectedDate,
          ora: op.ora || '',
          sectie: op.sectie || 'Nespecificat',
          numeOperatie: op.numeOperatie || '',
          pacient: op.pacient || '',
          chirurg: op.chirurg || 'Nespecificat',
          anestezist: op.anestezist || 'Nespecificat',
          asistenti: op.asistenti ? op.asistenti.split(',').map(a => a.trim()).filter(Boolean) : [],
          areFisaPdf: op.areFisaPdf
        }));

        setOperations(opMapate);
      } catch (err) {
        setEroare(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOperations();
  }, [selectedDate]);

  const changeDate = (days) => {
    const currentDate = new Date(selectedDate);
    currentDate.setDate(currentDate.getDate() + days);
    const newDateStr = formatDateToISO(currentDate);
    setSelectedDate(newDateStr);
  };

  const handleDownloadFisa = async (id, numePacient) => {
    try {
      const response = await fetchAuth(`http://localhost:5269/api/programoperator/download-pdf/${id}`);
      
      if (!response.ok) {
        throw new Error("Nu s-a putut descărca fișa PDF.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `Fisa_Pacient_${numePacient || id}.pdf`;
      document.body.appendChild(a);
      a.click();
      
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert(`Eroare la descărcare: ${err.message}`);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f7f9', minHeight: '100vh' }}>
      <button onClick={() => navigate('/mainpage')} style={{ marginBottom: '20px', padding: '8px 15px', cursor: 'pointer' }}>
        ⬅️ Înapoi la Meniu
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px', backgroundColor: '#ffffff', padding: '15px', borderRadius: '8px' }}>
        <button onClick={() => changeDate(-1)} style={btnDateStyle}>◀ Ziua Anterioară</button>
        
        <label style={{ fontWeight: 'bold' }}>
          Data afișată: {' '}
          <input 
            type="date" 
            value={selectedDate} 
            onChange={(e) => setSelectedDate(e.target.value)} 
            style={{ padding: '5px', fontSize: '16px' }}
          />
        </label>

        <button onClick={() => changeDate(1)} style={btnDateStyle}>Ziua Următoare ▶</button>
      </div>

      {eroare && (
        <div style={{ padding: '10px', backgroundColor: '#ffebee', color: '#c62828', borderRadius: '4px', marginBottom: '15px', textAlign: 'center' }}>
          {eroare}
        </div>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px', backgroundColor: '#ffffff', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
        <thead>
          <tr style={{ backgroundColor: '#1976d2', color: 'white', textAlign: 'left' }}>
            <th style={thStyle}>Ora</th>
            <th style={thStyle}>Secția</th>
            <th style={thStyle}>Nume Operație</th>
            <th style={thStyle}>Pacient</th>
            <th style={thStyle}>Chirurg</th>
            <th style={thStyle}>Anestezist</th>
            <th style={thStyle}>Asistenți</th>
            <th style={thStyle}>Fișă Medicală</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan="8" style={{ textAlign: 'center', padding: '20px', color: '#555' }}>
                Se încarcă programul operator...
              </td>
            </tr>
          ) : operations.length > 0 ? (
            operations.map((op) => {
              const sectieStyle = getSectieStyle(op.sectie);
              return (
                <tr key={op.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={tdStyle}><strong>{op.ora}</strong></td>
                  <td style={tdStyle}>
                    <span style={{
                      padding: '4px 10px',
                      borderRadius: '12px',
                      fontWeight: 'bold',
                      fontSize: '13px',
                      border: `1px solid ${sectieStyle.borderColor}`,
                      ...sectieStyle
                    }}>
                      {op.sectie}
                    </span>
                  </td>
                  <td style={tdStyle}>{op.numeOperatie}</td>
                  <td style={tdStyle}><strong>{op.pacient}</strong></td>
                  <td style={tdStyle}>{op.chirurg}</td>
                  <td style={tdStyle}>{op.anestezist}</td>
                  <td style={tdStyle}>
                    <ul style={{ margin: 0, paddingLeft: '15px', fontSize: '13px' }}>
                      {op.asistenti.map((asistent, index) => (
                        <li key={index}>{asistent}</li>
                      ))}
                    </ul>
                  </td>
                  <td style={tdStyle}>
                    {op.areFisaPdf ? (
                      <button 
                        onClick={() => handleDownloadFisa(op.id, op.pacient)}
                        style={btnFisaStyle}
                      >
                        📥 Descarcă Fișa
                      </button>
                    ) : (
                      <span style={{ color: '#888', fontStyle: 'italic', fontSize: '13px' }}>Fără fișă</span>
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="8" style={{ textAlign: 'center', padding: '20px', color: '#777' }}>
                Nu există operații programate pentru această dată.
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
const btnDateStyle = { padding: '8px 12px', cursor: 'pointer', backgroundColor: '#ffffff', color: '#333', border: '1px solid #ccc', borderRadius: '4px' };
const btnFisaStyle = { backgroundColor: '#4caf50', color: 'white', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' };

export default Program;