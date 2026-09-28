import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchAuth } from '../api';

function AdminDashboard() {
  const navigate = useNavigate();
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [resetRequests, setResetRequests] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [evaluations, setEvaluations] = useState([]);
  const [courseStatus, setCourseStatus] = useState([]);

  const [newCourseTitle, setNewCourseTitle] = useState('');
  const [newCourseLink, setNewCourseLink] = useState('');
  const [newCourseTarget, setNewCourseTarget] = useState('');

  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);

      const [leaveRes, resetRes, employeeRes, evalRes, courseRes] = await Promise.all([
        fetchAuth('http://localhost:5269/api/admin/concedii'),
        fetchAuth('http://localhost:5269/api/admin/cereri-resetare'),
        fetchAuth('http://localhost:5269/api/graficture/angajati'),
        fetchAuth('http://localhost:5269/api/evaluari'),
        fetchAuth('http://localhost:5269/api/admin/cursuri')
      ]);

      if (!leaveRes.ok || !resetRes.ok || !employeeRes.ok || !evalRes.ok || !courseRes.ok) {
        throw new Error('Nu s-au putut încărca toate datele de management.');
      }

      setLeaveRequests(await leaveRes.json());
      setResetRequests(await resetRes.json());
      setEmployees(await employeeRes.json());
      setEvaluations(await evalRes.json());
      setCourseStatus(await courseRes.json());

      const current = JSON.parse(localStorage.getItem('user') || 'null');
      if (current?.rolId === 2 || current?.rolId === 3) {
        setNewCourseTarget('');
      }
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLeaveDecision = async (id, status) => {
    try {
      const response = await fetchAuth(`http://localhost:5269/api/admin/concedii/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      const textResponse = await response.text();
      let data = null;
      try {
        data = JSON.parse(textResponse);
      } catch {
        data = { message: textResponse };
      }

      if (!response.ok) throw new Error(data?.message || 'Cererea nu a putut fi actualizată.');

      await loadData();
    } catch (err) {
      console.error("Eroare detaliată:", err);
      alert("Eroare de la server: " + err.message);
    }
  };

  const handleResolveReset = async (id) => {
    try {
      const response = await fetchAuth(`http://localhost:5269/api/admin/cereri-resetare/${id}`, {
        method: 'PUT',
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.message || 'Eroare la actualizarea cererii.');
      }

      await loadData();
      alert("✅ Cererea de resetare a fost marcată ca rezolvată!");
    } catch (err) {
      alert(err.message);
    }
  };

  const handleAddCourse = async (e) => {
    e.preventDefault();
    if (!newCourseTitle || !newCourseTarget) {
      alert('Selectează angajatul și completează titlul cursului.');
      return;
    }

    try {
      const response = await fetchAuth('http://localhost:5269/api/admin/cursuri', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: Number(newCourseTarget),
          titluCurs: newCourseTitle,
          materialUrl: newCourseLink || null
        })
      });

      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.message || 'Cursul nu a putut fi atribuit.');

      setNewCourseTitle('');
      setNewCourseLink('');
      setNewCourseTarget('');
      await loadData();
      
      const successMessage = data?.message || `✅ Cursul "${newCourseTitle}" a fost atribuit!`;
      alert(successMessage);

    } catch (err) {
      alert(err.message);
    }
  };

  if (loading) return <p style={{ textAlign: 'center', padding: '40px' }}>Se încarcă panoul de management...</p>;

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto' }}>
      <button onClick={() => navigate('/mainpage')} className="btn-back">⬅️ Înapoi la Meniu</button>

      <h1 style={{ marginBottom: '1.5rem' }}>Panou Administrare HR</h1>

      <section className="dashboard-card">
        <h2>🔑 Cereri Resetare Parolă</h2>
        {resetRequests.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>Nu există cereri de resetare.</p>
        ) : (
          <ul className="data-list">
            {resetRequests.map(req => (
              <li key={req.id} className="data-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{req.nume} {req.prenume}</strong> ({req.email})
                  <div style={{ fontSize: '13px', color: '#666' }}>
                    Funcție: {req.functie || '-'} | Secție: {req.sectie || '-'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#888' }}>
                    Data: {new Date(req.dataCerere).toLocaleString()}
                  </div>
                  <span style={{ fontWeight: 'bold', color: req.status === 'Rezolvata' ? '#2e7d32' : '#b06000' }}>
                    Status: {req.status}
                  </span>
                </div>
                {req.status !== 'Rezolvata' && (
                  <button 
                    onClick={() => handleResolveReset(req.id)}
                    style={{ backgroundColor: '#2e7d32', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Marchează Rezolvată
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="dashboard-card">
        <h2>🏖️ Cereri Concediu în Așteptare</h2>
        {leaveRequests.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>Nu există cereri.</p>
        ) : (
          <ul className="data-list">
            {leaveRequests.map(req => (
              <li key={req.id} className="data-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>{req.nume} {req.prenume}</strong> — <em>{req.tipConcediu}</em>
                  <div style={{ fontSize: '13px', color: '#555', marginTop: '3px' }}>
                    Perioada: {req.dataInceput} ➡️ {req.dataSfarsit} ({req.zileCerute} zile)
                  </div>
                  {req.motiv && <div style={{ fontSize: '12px', color: '#777' }}>Motiv: {req.motiv}</div>}
                  <span style={{ fontWeight: 'bold', color: req.status === 'Aprobat' ? '#2e7d32' : req.status === 'Respins' ? '#d32f2f' : '#b06000' }}>
                    Status: {req.status}
                  </span>
                </div>
                {req.status === 'In asteptare' && (
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button onClick={() => handleLeaveDecision(req.id, 'Aprobat')} style={{ backgroundColor: '#2e7d32', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Aprobă</button>
                    <button onClick={() => handleLeaveDecision(req.id, 'Respins')} style={{ backgroundColor: '#d32f2f', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}>Respinge</button>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="dashboard-card">
        <h2>🎓 Adaugă & Monitorizează Cursuri Anuale</h2>
        <form onSubmit={handleAddCourse}>
          <strong>➕ Atribuie un Curs:</strong>
          <input
            type="text"
            placeholder="Titlu Curs (ex: SSM / Protecția Muncii 2026)"
            value={newCourseTitle}
            onChange={(e) => setNewCourseTitle(e.target.value)}
            required
          />
          <input
            type="url"
            placeholder="Link Material Curs (opțional)"
            value={newCourseLink}
            onChange={(e) => setNewCourseLink(e.target.value)}
            required
          />
          <select value={newCourseTarget} onChange={(e) => setNewCourseTarget(e.target.value)} required>
            <option value="">Selectează angajatul</option>
            <option value="0">👥 Toți angajații (Atribuire masivă)</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                {emp.nume} {emp.prenume} ({emp.functie} - {emp.sectie})
                </option>
              ))}
          </select>
          <button type="submit">📢 Atribuie Cursul</button>
        </form>

        <strong style={{ display: 'block', margin: '1.5rem 0 0.5rem' }}>📊 Stadiu Parcurgere Cursuri:</strong>
        <ul className="data-list">
          {courseStatus.map(c => (
            <li key={c.id} className="data-item">
              <div><strong>{c.nume} {c.prenume}</strong> — {c.titluCurs}</div>
              <span>{c.status}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="dashboard-card">
        <h2>📋 Autoevaluări Primite</h2>
        {evaluations.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>Nu există autoevaluări trimise.</p>
        ) : (
          <ul className="data-list">
            {evaluations.map(ev => (
              <li key={ev.id} className="data-item">
                <div>
                  <strong>{ev.nume} {ev.prenume}</strong> — {ev.submittedAt}
                  <div>Scor: <strong>{ev.scorMediu}/5</strong></div>
                  <div style={{ marginTop: '6px' }}>{ev.progresViitor}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

export default AdminDashboard;