import { useState, useEffect } from 'react';
import { attendanceAPI, studentsAPI, coursesAPI } from '../services/api';
import { FiPlus, FiX, FiCheckCircle, FiXCircle, FiClock, FiActivity } from 'react-icons/fi';

const Attendance = () => {
  const [records, setRecords] = useState([]);
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [filter, setFilter] = useState({ type: 'course', id: '' });
  const [form, setForm] = useState({
    studentId: '', courseId: '', date: new Date().toISOString().split('T')[0],
    status: 'PRESENT', justification: ''
  });

  useEffect(() => { loadLists(); }, []);

  const loadLists = async () => {
    try {
      const [sRes, cRes] = await Promise.all([studentsAPI.getAll(), coursesAPI.getAll()]);
      setStudents(sRes.data);
      setCourses(cRes.data);
    } catch {} finally { setLoading(false); }
  };

  const loadRecords = async () => {
    if (!filter.id) return;
    try {
      const res = filter.type === 'student'
        ? await attendanceAPI.getByStudent(filter.id)
        : await attendanceAPI.getByCourse(filter.id);
      setRecords(res.data);
    } catch { setRecords([]); }
  };

  useEffect(() => { if (filter.id) loadRecords(); }, [filter]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await attendanceAPI.record({
        ...form,
        studentId: parseInt(form.studentId),
        courseId: parseInt(form.courseId)
      });
      setShowModal(false);
      if (filter.id) loadRecords();
    } catch { alert('Error'); }
  };

  const statusBadge = (status) => {
    switch (status) {
      case 'PRESENT': return 'badge-success';
      case 'ABSENT':  return 'badge-danger';
      case 'LATE':    return 'badge-warning';
      default:        return 'badge-info';
    }
  };

  const statusLabel = (status) => {
    switch (status) {
      case 'PRESENT': return 'Présent';
      case 'ABSENT':  return 'Absent';
      case 'LATE':    return 'En retard';
      default:        return status;
    }
  };

  const totalPresent = records.filter(r => r.status === 'PRESENT').length;
  const totalAbsent  = records.filter(r => r.status === 'ABSENT').length;
  const totalLate    = records.filter(r => r.status === 'LATE').length;
  const avgRate      = records.length > 0
    ? Math.round((totalPresent / records.length) * 100)
    : 0;

  const selectStyle = {
    padding: '0.62rem 2.4rem 0.62rem 1.1rem',
    background: 'var(--bg-card)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    color: 'var(--text-primary)',
    fontFamily: 'inherit',
    fontSize: '0.88rem',
    fontWeight: 500,
    cursor: 'pointer',
    outline: 'none',
    transition: 'border 0.2s, box-shadow 0.2s',
    appearance: 'none',
    WebkitAppearance: 'none',
    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239487c0' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'right 0.85rem center',
    boxShadow: '0 1px 3px rgba(37,99,235,0.06)',
  };

  if (loading) return <div className="page-loading"><div className="spinner"></div></div>;

  return (
    <div className="page">

      {/* ── Header ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap',
      }}>
        <div>
          <h1 style={{
            fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.5px',
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: '0.15rem',
          }}>
            Suivi des Absences
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Suivi de la présence des étudiants
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <FiPlus /> Enregistrer
        </button>
      </div>

      {/* ── Filters inline (sans label "Filtrer par") ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        marginBottom: '1.5rem', flexWrap: 'wrap',
      }}>

        {/* Toggle pills Étudiant / Cours */}
        <div style={{
          display: 'flex', background: 'var(--bg-secondary)',
          borderRadius: '10px', padding: '4px', border: '1px solid var(--border)',
        }}>
          {['student', 'course'].map(type => (
            <button key={type} onClick={() => setFilter({ type, id: '' })} style={{
              padding: '0.55rem 1.3rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '0.88rem',
              fontWeight: 600,
              transition: 'all 0.2s',
              background: filter.type === type
                ? 'linear-gradient(135deg, #2563eb, #7c3aed)'
                : 'transparent',
              color: filter.type === type ? '#fff' : 'var(--text-muted)',
              boxShadow: filter.type === type ? '0 2px 8px rgba(37,99,235,0.2)' : 'none',
            }}>
              {type === 'student' ? '👤 Étudiant' : '📚 Cours'}
            </button>
          ))}
        </div>

        {/* Select dropdown */}
        <select
          value={filter.id}
          onChange={e => setFilter({ ...filter, id: e.target.value })}
          style={selectStyle}
          onFocus={e => {
            e.target.style.borderColor = 'var(--accent-purple-light)';
            e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.12)';
          }}
          onBlur={e => {
            e.target.style.borderColor = 'var(--border)';
            e.target.style.boxShadow = '0 1px 3px rgba(37,99,235,0.06)';
          }}
        >
          <option value="">— Sélectionner —</option>
          {filter.type === 'student'
            ? students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)
            : courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
          }
        </select>

        {/* Badge compteur */}
        {records.length > 0 && (
          <span style={{
            padding: '0.42rem 1rem',
            borderRadius: '50px',
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border)',
            fontSize: '0.82rem',
            fontWeight: 600,
            color: 'var(--text-muted)',
          }}>
            {records.length} enregistrement{records.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* ── Stat Cards ── */}
      {records.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}>
          {[
            { label: 'Présents',         value: totalPresent, icon: FiCheckCircle, gradient: 'linear-gradient(135deg, #16a34a, #15803d)', glow: 'rgba(22,163,74,0.12)' },
            { label: 'Absents',          value: totalAbsent,  icon: FiXCircle,     gradient: 'linear-gradient(135deg, #dc2626, #b91c1c)', glow: 'rgba(220,38,38,0.12)' },
            { label: 'En retard',        value: totalLate,    icon: FiClock,       gradient: 'linear-gradient(135deg, #f59e0b, #d97706)', glow: 'rgba(245,158,11,0.12)' },
            { label: 'Taux de présence', value: `${avgRate}%`,icon: FiActivity,    gradient: 'linear-gradient(135deg, #2563eb, #7c3aed)', glow: 'rgba(37,99,235,0.12)' },
          ].map(({ label, value, icon: Icon, gradient, glow }) => (
            <div key={label}
              style={{
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: '16px', padding: '1.25rem',
                display: 'flex', alignItems: 'center', gap: '1rem',
                boxShadow: '0 2px 8px rgba(124,58,237,0.07)',
                transition: 'all 0.2s', cursor: 'default',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = `0 8px 24px ${glow}`;
                e.currentTarget.style.borderColor = 'var(--border-light)';
              }}
              onMouseLeave={e => {
                e.currentTarget.style.transform = '';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(124,58,237,0.07)';
                e.currentTarget.style.borderColor = 'var(--border)';
              }}
            >
              <div style={{
                width: 48, height: 48, borderRadius: 12, background: gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon size={22} color="#fff" />
              </div>
              <div>
                <div style={{
                  fontSize: '1.7rem', fontWeight: 800, letterSpacing: '-1px',
                  color: 'var(--text-primary)', lineHeight: 1,
                }}>
                  {value}
                </div>
                <div style={{
                  fontSize: '0.75rem', color: 'var(--text-muted)',
                  fontWeight: 500, marginTop: '0.2rem',
                }}>
                  {label}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Table ── */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Étudiant ID</th>
              <th>Cours ID</th>
              <th>Statut</th>
              <th>Justification</th>
            </tr>
          </thead>
          <tbody>
            {records.map(r => (
              <tr key={r.id}>
                <td>{r.date}</td>
                <td>{r.studentId}</td>
                <td>{r.courseId}</td>
                <td>
                  <span className={`badge ${statusBadge(r.status)}`}>
                    {statusLabel(r.status)}
                  </span>
                </td>
                <td>{r.justification || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {records.length === 0 && (
          <div className="empty-state">
            <p>Sélectionnez un filtre pour voir les enregistrements</p>
          </div>
        )}
      </div>

      {/* ── Record Modal ── */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Enregistrer la présence</h3>
              <button className="btn-close" onClick={() => setShowModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Étudiant</label>
                  <select value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })} required>
                    <option value="">— Sélectionner —</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Cours</label>
                  <select value={form.courseId} onChange={e => setForm({ ...form, courseId: e.target.value })} required>
                    <option value="">— Sélectionner —</option>
                    {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Statut</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    <option value="PRESENT">Présent</option>
                    <option value="ABSENT">Absent</option>
                    <option value="LATE">En retard</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Justification</label>
                <input
                  placeholder="Optionnel"
                  value={form.justification}
                  onChange={e => setForm({ ...form, justification: e.target.value })}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Attendance;