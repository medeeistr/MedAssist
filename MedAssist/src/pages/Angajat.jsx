import React from 'react';
import { useNavigate } from 'react-router-dom';

function Angajat() {
  const navigate = useNavigate();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <button onClick={() => navigate('/mainpage')} className="btn-back">
        ⬅️ Înapoi la Meniu
      </button>

      <h2>Panou Angajat</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Alegeți o opțiune pentru a vă gestiona dosarul:</p>

      <div className="employee-menu-grid">
        <button className="employee-card-btn" onClick={() => navigate('/concediu')}>🏖️ Concediu</button>
        <button className="employee-card-btn" onClick={() => navigate('/datepersonale')}>👤 Date personale</button>
        <button className="employee-card-btn" onClick={() => navigate('/payroll')}>💰 Payroll / Fluturaș</button>
        <button className="employee-card-btn" onClick={() => navigate('/fisapostului')}>📜 Fișa Postului</button>
        <button className="employee-card-btn" onClick={() => navigate('/cursuri')}>🎓 Cursuri</button>
        <button className="employee-card-btn" onClick={() => navigate('/evaluare')}>📝 Autoevaluare</button>
      </div>
    </div>
  );
}

export default Angajat;