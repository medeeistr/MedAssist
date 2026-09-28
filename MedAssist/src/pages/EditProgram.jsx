import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAuth } from '../api';

function EditProgram() {
  const navigate = useNavigate();

  // Verificare rol (2 = HR, 3 = SefSectie)
  const storedUser = JSON.parse(localStorage.getItem('user'));
  const rolId = storedUser?.rolId;

  if (rolId !== 2 && rolId !== 3) {
    return (
      <div style={{ padding: '40px', fontFamily: 'Arial, sans-serif', textAlign: 'center' }}>
        <h3 style={{ color: 'red' }}>Nu ai permisiunea să accesezi această pagină!</h3>
        <button onClick={() => navigate('/mainpage')} style={{ padding: '8px 15px', cursor: 'pointer' }}>
          ⬅️ Înapoi la Meniu
        </button>
      </div>
    );
  }

  const [operationData, setOperationData] = useState({
    data: '2026-03-10',
    ora: '',
    sectie: 'Cardiologie',
    numeOperatie: '',
    pacient: '',
    chirurg: '',
    anestezist: '',
    asistenti: '',
    fisaPdf: null
  });

  const [saving, setSaving] = useState(false);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'fisaPdf') {
      setOperationData({ ...operationData, fisaPdf: files[0] });
    } else {
      setOperationData({ ...operationData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append('Data', operationData.data); // AICI TREBUIE 'Data' cu D mare!
      formData.append('Ora', operationData.ora);
      formData.append('Sectie', operationData.sectie);
      formData.append('NumeOperatie', operationData.numeOperatie);
      formData.append('Pacient', operationData.pacient);
      formData.append('Chirurg', operationData.chirurg);
      formData.append('Anestezist', operationData.anestezist);
      formData.append('Asistenti', operationData.asistenti);
      
      if (operationData.fisaPdf) {
        formData.append('FisaPdf', operationData.fisaPdf);
      }

      const response = await fetchAuth('http://localhost:5269/api/programoperator', {
        method: 'POST',
        body: formData 
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) {
        throw new Error(data?.message || 'Eroare la salvarea operației.');
      }

      alert(`Operația și fișa PDF au fost salvate cu succes!`);

      setOperationData({
        data: '2026-03-10',
        ora: '',
        sectie: 'Cardiologie',
        numeOperatie: '',
        pacient: '',
        chirurg: '',
        anestezist: '',
        asistenti: '',
        fisaPdf: null
      });
    } catch (err) {
      alert(`Eroare: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', backgroundColor: '#f4f7f9', minHeight: '100%' }}>
      <button onClick={() => navigate('/mainpage')} style={{ marginBottom: '20px', padding: '8px 15px', cursor: 'pointer' }}>
        ⬅️ Înapoi la Meniu
      </button>

      <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px', backgroundColor: '#ffffff', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}>
        <h2>Editare / Adăugare Program Operații</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          <label>
            Data:
            <input type="date" name="data" value={operationData.data} onChange={handleChange} required style={inputStyle} />
          </label>

          <label>
            Ora:
            <input type="time" name="ora" value={operationData.ora} onChange={handleChange} required style={inputStyle} />
          </label>

          <label>
            Secția:
            <select name="sectie" value={operationData.sectie} onChange={handleChange} style={inputStyle}>
              <option value="Cardiologie">Cardiologie</option>
              <option value="Ortopedie">Ortopedie</option>
              <option value="Neurologie">Neurologie</option>
              <option value="Chirurgie Generală">Chirurgie Generală</option>
            </select>
          </label>

          <label>
            Nume Operație:
            <input type="text" name="numeOperatie" placeholder="ex: Bypass Aortocoronarian" value={operationData.numeOperatie} onChange={handleChange} required style={inputStyle} />
          </label>

          <label>
            Pacient:
            <input type="text" name="pacient" placeholder="Nume Pacient" value={operationData.pacient} onChange={handleChange} required style={inputStyle} />
          </label>

          <label>
            Chirurg:
            <input type="text" name="chirurg" placeholder="ex: Dr. Popescu Adrian" value={operationData.chirurg} onChange={handleChange} required style={inputStyle} />
          </label>

          <label>
            Anestezist:
            <input type="text" name="anestezist" placeholder="ex: Dr. Marin Elena" value={operationData.anestezist} onChange={handleChange} required style={inputStyle} />
          </label>

          <label>
            Asistenți (separați prin virgulă):
            <input type="text" name="asistenti" placeholder="ex: As. Radu Maria, As. Vlad Ion" value={operationData.asistenti} onChange={handleChange} style={inputStyle} />
          </label>

          <label style={{ backgroundColor: '#eef2f7', padding: '10px', borderRadius: '4px' }}>
            📁 Atașază Fișa Pacientului (PDF):
            <input type="file" name="fisaPdf" accept="application/pdf" onChange={handleChange} style={{ display: 'block', marginTop: '6px' }} />
          </label>

          <button 
            type="submit" 
            disabled={saving}
            style={{ padding: '10px', backgroundColor: '#1976d2', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {saving ? 'Se salvează...' : '💾 Salvează în Program'}
          </button>
        </form>
      </div>
    </div>
  );
}

const inputStyle = { width: '100%', padding: '8px', marginTop: '4px', boxSizing: 'border-box' };

export default EditProgram;