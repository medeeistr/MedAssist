import React, { useState, useEffect } from 'react';
import { fetchAuth } from '../api';

function GraficTure({ userId }) {
  const [dbSchedule, setDbSchedule] = useState([]);
  const [loading, setLoading] = useState(true);

  const getCurrentYearMonth = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  };

  const [selectedMonth, setSelectedMonth] = useState(getCurrentYearMonth());

  const API_URL = 'http://localhost:5269/api/graficture';

  useEffect(() => {
    if (!userId || !selectedMonth) return;

    setLoading(true);
    fetchAuth(`${API_URL}/user/${userId}?month=${selectedMonth}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! Status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        setDbSchedule(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Eroare la preluarea programului:', err);
        setLoading(false);
      });
  }, [userId, selectedMonth]);

  const [yearNum, monthNum] = selectedMonth.split('-').map(Number);
  const daysInMonth = new Date(yearNum, monthNum, 0).getDate();

  const fullMonthSchedule = Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    const formattedDay = String(day).padStart(2, '0');
    const formattedMonth = String(monthNum).padStart(2, '0');
    const dateStr = `${yearNum}-${formattedMonth}-${formattedDay}`;
    const dbItem = dbSchedule.find(item => item.data === dateStr);

    return dbItem || { data: dateStr, tura: 'Liber', tip: 'liber' };
  });

  return (
    <div className="dashboard-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', flexWrap: 'wrap', gap: '10px' }}>
        <h3 style={{ margin: 0 }}>📅 Program Lucru - {selectedMonth}</h3>
        
        {/* Selector de lună pentru angajat */}
        <div>
          <label style={{ marginRight: '8px', fontSize: '14px', fontWeight: 'bold' }}>Schimbă luna:</label>
          <input 
            type="month" 
            value={selectedMonth} 
            onChange={(e) => setSelectedMonth(e.target.value)}
            style={{ padding: '6px', borderRadius: '4px', border: '1px solid #ccc', fontWeight: 'bold' }}
          />
        </div>
      </div>

      <div className="schedule-grid">
        {loading ? (
          <p style={{ padding: '10px' }}>Se încarcă programul din baza de date...</p>
        ) : (
          fullMonthSchedule.map((item, index) => (
            <div key={index} className={`schedule-badge shift-${item.tip}`}>
              <span className="badge-date">{item.data}</span>
              <span className="badge-shift">
                {item.tip === 'concediu' ? '🏖️ CONCEDIU' : item.tura}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default GraficTure;