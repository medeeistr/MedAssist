import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAuth } from '../api'; 

const Evaluare = () => {
  const navigate = useNavigate();

  const intrebariNotare = [
    {
      id: 'punctajProfesional',
      text: '1. Cum îți evaluezi capacitatea de a-ți îndeplini sarcinile profesionale zilnice la timp?'
    },
    {
      id: 'punctajEchipa',
      text: '2. Cât de eficient colaborezi cu echipa și colegii din spital?'
    },
    {
      id: 'punctajComunicare',
      text: '3. Cât de clară și eficientă este comunicarea ta cu pacienții și personalul?'
    },
    {
      id: 'punctajResponsabilitate',
      text: '4. În ce măsură dai dovadă de responsabilitate și respecți procedurile interne?'
    }
  ];

  const [formData, setFormData] = useState({
    note: {
      punctajProfesional: '5',
      punctajEchipa: '5',
      punctajComunicare: '5',
      punctajResponsabilitate: '5'
    },
    progresViitor: ''
  });

  const [mesaj, setMesaj] = useState('');

  // Schimbarea notelor (1-5)
  const handleRatingChange = (idIntrebare, valoare) => {
    setFormData((prev) => ({
      ...prev,
      note: {
        ...prev.note,
        [idIntrebare]: valoare
      }
    }));
  };

  // Schimbarea campului text
  const handleTextChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Trimiterea evaluarii in baza de date
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.progresViitor.trim()) {
      setMesaj('Te rugăm să completezi secțiunea despre progresul tău în spital.');
      return;
    }

    try {
      const response = await fetchAuth('http://localhost:5269/api/evaluari', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.message || 'Evaluarea nu a putut fi salvată.');
      }

      setMesaj('Evaluarea ta a fost trimisă cu succes!');

      setFormData({
        note: {
          punctajProfesional: '5',
          punctajEchipa: '5',
          punctajComunicare: '5',
          punctajResponsabilitate: '5'
        },
        progresViitor: ''
      });
    } catch (err) {
      setMesaj(`Eroare: ${err.message}`);
    }
  };

  return (
    <div style={styles.container}>
      <button 
        onClick={() => navigate('/angajat')} 
        style={{ marginBottom: '20px', padding: '8px 15px', cursor: 'pointer' }}
      >
        ⬅️ Înapoi
      </button>

      <h2>Evaluare Performanță & Progres</h2>

      {/* Mesaj de feedback */}
      {mesaj && <p style={styles.mesaj}>{mesaj}</p>}

      <form onSubmit={handleSubmit} style={styles.formContainer}>
        <h3>Autoevaluare Activitate (1 = Slab, 5 = Excelent)</h3>

        {/* Intrebari cu note 1-5 */}
        {intrebariNotare.map((q) => (
          <div key={q.id} style={styles.fieldNotare}>
            <p style={styles.intrebareText}>{q.text}</p>
            <div style={styles.optiuniNote}>
              {[1, 2, 3, 4, 5].map((nota) => (
                <label key={nota} style={styles.radioLabel}>
                  <input
                    type="radio"
                    name={q.id}
                    value={nota}
                    checked={formData.note[q.id] === String(nota)}
                    onChange={() => handleRatingChange(q.id, String(nota))}
                  />
                  <span>{nota}</span>
                </label>
              ))}
            </div>
          </div>
        ))}

        <hr style={styles.separator} />

        {/* Intrebare deschisa despre progresul in spital */}
        <div style={styles.field}>
          <label style={styles.labelHeader}>
            Cum îți vezi progresul și dezvoltarea în spital în următoarea perioadă (ex: 1-3 ani)?
          </label>
          <textarea
            name="progresViitor"
            value={formData.progresViitor}
            onChange={handleTextChange}
            rows="5"
            placeholder="Descrie obiectivele tale, cursurile pe care dorești să le urmezi sau rolul în care te vezi..."
            style={styles.textarea}
            required
          />
        </div>

        <button type="submit" style={styles.buttonSubmit}>
          Trimite Evaluarea 🚀
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: { maxWidth: '650px', margin: '20px auto', padding: '20px', fontFamily: 'Arial, sans-serif' },
  backButton: { marginBottom: '20px', padding: '8px 15px', cursor: 'pointer', borderRadius: '4px', border: '1px solid #ccc', backgroundColor: '#fff' },
  separator: { margin: '25px 0', border: '0', borderTop: '1px solid #ddd' },
  formContainer: { backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', border: '1px solid #e0e0e0' },
  fieldNotare: { marginBottom: '20px', backgroundColor: '#fff', padding: '12px', borderRadius: '6px', border: '1px solid #eee' },
  intrebareText: { margin: '0 0 10px 0', fontWeight: 'bold', color: '#333' },
  optiuniNote: { display: 'flex', gap: '20px', alignItems: 'center' },
  radioLabel: { display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontSize: '14px' },
  field: { display: 'flex', flexDirection: 'column', gap: '8px' },
  labelHeader: { fontWeight: 'bold', color: '#333' },
  textarea: { padding: '10px', borderRadius: '4px', border: '1px solid #ccc', fontSize: '14px', fontFamily: 'sans-serif' },
  buttonSubmit: { marginTop: '20px', padding: '12px', backgroundColor: '#0066cc', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', width: '100%' },
  mesaj: { padding: '10px', backgroundColor: '#d4edda', color: '#155724', borderRadius: '4px', marginBottom: '15px' }
};

export default Evaluare;