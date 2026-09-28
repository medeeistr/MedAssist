import React from 'react';
import { useNavigate } from 'react-router-dom';
import GraficTure from './GraficTure';

function MainPage({ user }) {
  const navigate = useNavigate();
  const isManagement = user?.rolId === 2 || user?.rolId === 3;

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    navigate('/');
    window.location.reload();
};

  return (
    <div className="main-menu-container">
      <div>
        <h1>Meniu Principal - Panou Spital</h1>
        <p style={{ color: 'var(--text-muted)' }}>Selectați opțiunea dorită din meniu:</p>
      </div>

      {isManagement && (
        <div className="management-box">
          <span className="management-title">👑 Meniu Management</span>
          <div className="action-buttons-grid">
            <button onClick={() => navigate('/admin')}>🔑 Administrare HR</button>
            <button onClick={() => navigate('/editprogram')}>✏️ Editează Program Operații</button>
            <button onClick={() => navigate('/editture')}>📅 Editează Ture Angajați</button>
          </div>
        </div>
      )}

      <div className="action-buttons-grid">
        <button onClick={() => navigate('/program')} className="btn-secondary">📅 Program Operator</button>
        <button onClick={() => navigate('/angajat')} className="btn-secondary">📋 Panou Angajat</button>
        <button onClick={() => navigate('/contact')} className="btn-secondary">👨‍⚕️ Registru Personal</button>
      </div>

      <GraficTure userId={user?.id} />

      <div>
        <button onClick={handleLogout} className="btn-danger">Deconectare</button>
      </div>
    </div>
  );
}

export default MainPage;
