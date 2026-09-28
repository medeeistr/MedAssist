import { useState } from 'react'
import { Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom'
import Home from './pages/Home'
import LogIn from './pages/LogIn'
import MainPage from './pages/MainPage'
import Program from './pages/Program'
import Angajat from './pages/Angajat'
import Contact from './pages/Contact'
import Concediu from './pages/Concediu'
import DatePersonale from './pages/DatePersonale'
import Payroll from './pages/Payroll'
import FisaPostului from './pages/FisaPostului'
import Cursuri from './pages/Cursuri'
import Evaluare from './pages/Evaluare'
import Admin from './pages/Admin'
import EditProgram from './pages/EditProgram'
import GraficTure from './pages//GraficTure';
import EditTure from './pages/EditTure'
import './App.css'

function App() {
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('user') || 'null');
    } catch {
      return null;
    }
  });

  const isManagement = user?.rolId === 2 || user?.rolId === 3;

  const handleLogin = (userData) => {
    if (!userData?.id || !userData?.email) {
      console.error('Date de autentificare invalide:', userData);
      return;
    }

    const cleanEmail = userData.email.toLowerCase().trim();
    const normalizedUser = {
      ...userData,
      email: cleanEmail,
      role: isManagementRole(userData.rolId) ? 'hr' : 'employee'
    };

    localStorage.setItem('user', JSON.stringify(normalizedUser));
    setUser(normalizedUser);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
};

  return (
    <div className="app-container">
      <header className="navbar">
        <div className="logo">
          <Link to="/">MedAssist</Link>
        </div>
      </header>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<LogIn onLogin={handleLogin} />} />
        <Route path="/mainpage" element={user ? <MainPage user={user} /> : <Navigate to="/login" />} />
        <Route path="/program" element={<Program />} />
        <Route path="/angajat" element={user ? <Angajat /> : <Navigate to="/login" />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/concediu" element={user ? <Concediu /> : <Navigate to="/login" />} />
        <Route path="/datepersonale" element={user ? <DatePersonale /> : <Navigate to="/login" />} />
        <Route path="/payroll" element={user ? <Payroll /> : <Navigate to="/login" />} />
        <Route path="/fisapostului" element={user ? <FisaPostului /> : <Navigate to="/login" />} />
        <Route path="/cursuri" element={user ? <Cursuri /> : <Navigate to="/login" />} />
        <Route path="/evaluare" element={user ? <Evaluare /> : <Navigate to="/login" />} />

        <Route path="/admin" element={isManagement ? <Admin /> : <Navigate to="/mainpage" />} />
        <Route path="/editprogram" element={isManagement ? <EditProgram /> : <Navigate to="/mainpage" />} />
        <Route
          path="/editture"
          element={isManagement ? <EditTure /> : <Navigate to="/mainpage" />}
        />
      </Routes>

      <footer>
        <p>© 2026 MedAssist. Toate drepturile rezervate.</p>
      </footer>
    </div>
  )
}

const isManagementRole = (rolId) => rolId === 2 || rolId === 3;

export default App
