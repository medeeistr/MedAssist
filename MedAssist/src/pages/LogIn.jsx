import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function LogIn({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [eroare, setEroare] = useState('');
  const [mesajReset, setMesajReset] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEroare('');
    setMesajReset('');

    if (!email || typeof email !== 'string') {
      setEroare('Te rugăm să introduci o adresă de email validă.');
      return;
    }

    const cleanEmail = email.trim().toLowerCase();

    try {
      const response = await fetch('http://localhost:5269/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: cleanEmail, parola: password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Email sau parolă incorectă.');
      }

      if (!data.token) {
    throw new Error("Serverul nu a returnat tokenul de autentificare.");
}

localStorage.setItem('token', data.token);
if (!data.token) {
    throw new Error('Serverul nu a primit tokenul de autentificare.');
}

localStorage.setItem('token', data.token);
localStorage.setItem('user', JSON.stringify(data));

if (onLogin) onLogin(data);

navigate('/mainpage');
    } catch (err) {
      setEroare(err.message);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setEroare('Te rugăm să introduci adresa de email mai întâi.');
      return;
    }

    setEroare('');
    setMesajReset('');

    try {
      const response = await fetch('http://localhost:5269/api/auth/request-password-reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'A apărut o eroare la trimiterea cererii.');
      }

      setMesajReset(data.message);
    } catch (err) {
      setEroare(err.message);
    }
  };

  return (
    <main className="hero">
      <h2>Intrați în contul MedAssist:</h2>

      {eroare && <p style={{ color: 'red', textAlign: 'center' }}>{eroare}</p>}
      {mesajReset && <p style={{ color: 'green', textAlign: 'center' }}>{mesajReset}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px', margin: '20px auto' }}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Parolă" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">Log in</button>

        <button
          type="button"
          onClick={handleForgotPassword}
          style={{
            background: 'none',
            border: 'none',
            color: '#0066cc',
            textDecoration: 'underline',
            cursor: 'pointer',
            fontSize: '14px',
            marginTop: '5px'
          }}
        >
          Am uitat parola
        </button>
      </form>
    </main>
  );
}

export default LogIn;
