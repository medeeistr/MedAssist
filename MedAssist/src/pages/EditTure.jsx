import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAuth } from '../api';

function EditTure({ onUpdateSchedule }) {
  const navigate = useNavigate();

  const storedUser = JSON.parse(localStorage.getItem('user') || 'null');
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

  const [employees, setEmployees] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  
  const [selectedMonth, setSelectedMonth] = useState('2026-08');

  const API_URL = 'http://localhost:5269/api/graficture';

  // Preluare angajati din baza de date
  useEffect(() => {
    fetchAuth(`${API_URL}/angajati`)
      .then(res => res.json())
      .then(data => {
        setEmployees(data);
        if (data.length > 0) setSelectedUserId(data[0].id);
      })
      .catch(err => console.error('Eroare la preluarea angajaților:', err));
  }, []);

  const [monthSchedule, setMonthSchedule] = useState([]);
  const [loadingSchedule, setLoadingSchedule] = useState(false);

  // Functie care calculeaza zilele lunii selectate (28, 30 sau 31)
  const buildDefaultScheduleForMonth = (yearMonth) => {
    const [year, month] = yearMonth.split('-').map(Number);
    const daysInMonth = new Date(year, month, 0).getDate();

    return Array.from({ length: daysInMonth }, (_, index) => {
      const day = index + 1;
      const formattedDay = String(day).padStart(2, '0');
      const formattedMonth = String(month).padStart(2, '0');
      return {
        data: `${year}-${formattedMonth}-${formattedDay}`,
        ziua: day,
        tura: 'Liber',
        tip: 'liber'
      };
    });
  };

  useEffect(() => {
    if (!selectedUserId || !selectedMonth) return;

    setLoadingSchedule(true);
    fetchAuth(`${API_URL}/user/${selectedUserId}?month=${selectedMonth}`)
      .then(res => {
        if (!res.ok) throw new Error('Nu s-a putut încărca programul angajatului.');
        return res.json();
      })
      .then(data => {
        const defaults = buildDefaultScheduleForMonth(selectedMonth);
        const merged = defaults.map(day => {
          const saved = (Array.isArray(data) ? data : []).find(item => item.data === day.data);
          return saved ? { ...day, ...saved, ziua: day.ziua } : day;
        });
        setMonthSchedule(merged);
      })
      .catch(err => {
        console.error(err);
        setMonthSchedule(buildDefaultScheduleForMonth(selectedMonth));
        alert(err.message);
      })
      .finally(() => setLoadingSchedule(false));
  }, [selectedUserId, selectedMonth]);

  const handleShiftChange = (dayIndex, newShift) => {
    let tip = 'zi';
    if (newShift === 'Schimbul 2') tip = 'dupa-amiaza';
    if (newShift === 'Gardă de Noapte') tip = 'noapte';
    if (newShift === 'Gardă de Zi') tip = 'garda-zi';
    if (newShift === 'Liber') tip = 'liber';
    if (newShift === 'Concediu') tip = 'concediu';

    const updatedSchedule = [...monthSchedule];
    updatedSchedule[dayIndex] = {
      ...updatedSchedule[dayIndex],
      tura: newShift,
      tip: tip
    };

    setMonthSchedule(updatedSchedule);
  };

  const handleSaveAll = async () => {
    if (!selectedUserId) {
      alert('Selectează un angajat!');
      return;
    }

    try {
      const response = await fetchAuth(`${API_URL}/salveaza`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: parseInt(selectedUserId),
          schedule: monthSchedule
        })
      });

      if (response.ok) {
        alert(`✅ Programul pe luna ${selectedMonth} a fost salvat cu succes!`);
      } else {
        alert('❌ Eroare la salvarea programului în baza de date!');
      }
    } catch (err) {
      console.error('Eroare:', err);
      alert('❌ Nu s-a putut conecta la serverul backend!');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1000px', margin: '0 auto' }}>
      <button 
        onClick={() => navigate('/mainpage')} 
        style={{ marginBottom: '15px', padding: '8px 15px', cursor: 'pointer', borderRadius: '5px' }}
      >
        ⬅️ Înapoi la Meniu
      </button>

      <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '10px', border: '1px solid #e0e0e0', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
        <h2 style={{ marginTop: 0, color: '#1976d2' }}>🗓️ Calendar Interactiv - Editare Ture</h2>
        
        {/* SELECTARE ANGAJAT SI LUNA */}
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', flexWrap: 'wrap' }}>
          <div style={{ flex: '1', minWidth: '250px' }}>
            <label><strong>👤 Selectează Angajatul:</strong></label>
            <select 
              value={selectedUserId} 
              onChange={(e) => setSelectedUserId(e.target.value)}
              style={{ width: '100%', padding: '10px', marginTop: '5px', borderRadius: '6px', border: '1px solid #1976d2', fontWeight: 'bold' }}
            >
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.nume} {emp.prenume} ({emp.functie} - {emp.sectie})
                </option>
              ))}
            </select>
          </div>

          <div style={{ width: '200px' }}>
            <label><strong>📅 Selectează Luna:</strong></label>
            <input 
              type="month" 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value)}
              style={{ width: '100%', padding: '9px', marginTop: '5px', borderRadius: '6px', border: '1px solid #1976d2', fontWeight: 'bold', boxSizing: 'border-box' }}
            />
          </div>
        </div>

        {loadingSchedule && <p>Se încarcă programul angajatului...</p>}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '10px',
          maxHeight: '500px',
          overflowY: 'auto',
          padding: '5px',
          backgroundColor: '#f9f9f9',
          borderRadius: '8px',
          border: '1px solid #eee'
        }}>
          {monthSchedule.map((item, index) => (
            <div key={index} style={{
              backgroundColor: '#ffffff',
              border: '1px solid #ccc',
              borderRadius: '6px',
              padding: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}>
              <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#1976d2' }}>
                Ziua {item.ziua} ({item.data})
              </div>

              <select 
                value={item.tura} 
                onChange={(e) => handleShiftChange(index, e.target.value)}
                style={{ 
                  padding: '6px', 
                  fontSize: '12px', 
                  borderRadius: '4px', 
                  border: '1px solid #888',
                  cursor: 'pointer' 
                }}
              >
                <option value="Schimbul 1">Schimbul 1 (07-15)</option>
                <option value="Schimbul 2">Schimbul 2 (15-23)</option>
                <option value="Gardă de Zi">Gardă de Zi</option>
                <option value="Gardă de Noapte">Gardă de Noapte</option>
                <option value="Liber">Liber</option>
                <option value="Concediu">Concediu</option>
              </select>
            </div>
          ))}
        </div>

        <button 
          handleSaveAll={handleSaveAll}
          onClick={handleSaveAll}
          style={{
            marginTop: '20px',
            width: '100%',
            padding: '12px',
            backgroundColor: '#2e7d32',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            fontWeight: 'bold',
            fontSize: '16px',
            cursor: 'pointer'
          }}
        >
          💾 Salvează Programul în Baza de Date
        </button>
      </div>
    </div>
  );
}

export default EditTure;