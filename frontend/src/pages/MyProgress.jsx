import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { studentsAPI, coursesAPI } from '../services/api';
import api from '../services/api';
import {
  FiTrendingUp, FiBook, FiCalendar, FiAlertTriangle,
  FiAward, FiCheckCircle, FiXCircle, FiClock, FiUser
} from 'react-icons/fi';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip
} from 'recharts';

const MyProgress = () => {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [grades, setGrades] = useState([]);
  const [absences, setAbsences] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      // Cherche l'étudiant correspondant à l'utilisateur connecté
      const [studentsRes, coursesRes] = await Promise.allSettled([
        studentsAPI.getAll(),
        coursesAPI.getAll(),
      ]);

      if (coursesRes.status === 'fulfilled') setCourses(coursesRes.value.data);

      if (studentsRes.status === 'fulfilled') {
        const students = studentsRes.value.data;
        // Trouve l'étudiant par username ou email
        const me = students.find(s =>
          s.email?.toLowerCase().includes(user?.username?.toLowerCase()) ||
          `${s.firstName} ${s.lastName}`.toLowerCase().includes(user?.username?.toLowerCase())
        ) || students[0]; // fallback au premier si pas trouvé

        if (me) {
          setStudent(me);
          // Charge ses notes
          const gradesRes = await studentsAPI.getGrades(me.id);
          setGrades(gradesRes.data || []);

          // Charge ses absences via l'API attendance
          try {
            const absRes = await api.get(`/api/attendance/student/${me.id}`);
            setAbsences(absRes.data || []);
          } catch { setAbsences([]); }
        }
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  // Calculs
  const average = grades.length > 0
    ? (grades.reduce((s, g) => s + g.value, 0) / grades.length).toFixed(2)
    : null;

  const totalSessions = absences.length;
  const absentCount = absences.filter(a => a.status === 'ABSENT').length;
  const presentCount = absences.filter(a => a.status === 'PRESENT').length;
  const lateCount = absences.filter(a => a.status === 'LATE').length;
  const absenceRate = totalSessions > 0 ? ((absentCount / totalSessions) * 100).toFixed(1) : 0;

  // Niveau de risque
  const getRiskLevel = () => {
    if (!average) return null;
    const avg = parseFloat(average);
    const rate = parseFloat(absenceRate);
    if (avg < 10 && rate > 30) return 'CRITICAL';
    if (avg < 10) return 'HIGH';
    if (rate > 30) return 'MEDIUM';
    return 'LOW';
  };

  const risk = getRiskLevel();

  const riskConfig = {
    CRITICAL: { label: 'Critique', color: '#dc2626', bg: '#fee2e2', border: '#fecaca', icon: '🔴', msg: 'Votre situation nécessite une attention urgente. Consultez votre professeur responsable.' },
    HIGH:     { label: 'Élevé',    color: '#f59e0b', bg: '#fef9c3', border: '#fde68a', icon: '🟠', msg: 'Vos résultats académiques sont insuffisants. Un soutien pédagogique est recommandé.' },
    MEDIUM:   { label: 'Moyen',    color: '#2563eb', bg: '#dbeafe', border: '#bfdbfe', icon: '🔵', msg: 'Votre taux d\'absence est trop élevé. Veillez à être plus assidu.' },
    LOW:      { label: 'Faible',   color: '#16a34a', bg: '#dcfce7', border: '#bbf7d0', icon: '🟢', msg: 'Vous êtes en bonne voie ! Continuez vos efforts.' },
  };

  const getCourseName = (courseId) => {
    const c = courses.find(c => c.id === courseId);
    return c ? c.name : `Cours #${courseId}`;
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'PRESENT':  return <FiCheckCircle size={14} style={{ color: '#16a34a' }} />;
      case 'ABSENT':   return <FiXCircle size={14} style={{ color: '#dc2626' }} />;
      case 'LATE':     return <FiClock size={14} style={{ color: '#f59e0b' }} />;
      case 'EXCUSED':  return <FiCheckCircle size={14} style={{ color: '#2563eb' }} />;
      default:         return null;
    }
  };

  if (loading) return <div className="page-loading"><div className="spinner"></div></div>;

  return (
    <div className="page">

      {/* ── Header ── */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{
          fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.5px',
          background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          marginBottom: '0.15rem',
        }}>
          Mon Parcours Académique
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          {student ? `${student.firstName} ${student.lastName} — Niveau ${student.level}` : user?.username}
        </p>
      </div>

      {/* ── Alerte de risque ── */}
      {risk && (
        <div style={{
          background: riskConfig[risk].bg,
          border: `1px solid ${riskConfig[risk].border}`,
          borderRadius: '14px', padding: '1rem 1.25rem',
          marginBottom: '1.5rem',
          display: 'flex', alignItems: 'center', gap: '0.75rem',
        }}>
          <span style={{ fontSize: '1.5rem' }}>{riskConfig[risk].icon}</span>
          <div>
            <div style={{ fontWeight: 700, color: riskConfig[risk].color, fontSize: '0.9rem', marginBottom: '0.2rem' }}>
              Niveau de risque : {riskConfig[risk].label}
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {riskConfig[risk].msg}
            </div>
          </div>
        </div>
      )}

      {/* ── Stats Cards ── */}
      <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
        <div className="stat-card stat-purple">
          <div className="stat-icon"><FiAward /></div>
          <div className="stat-info">
            <span className="stat-value">{average ? `${average}/20` : '—'}</span>
            <span className="stat-label">Moyenne générale</span>
          </div>
        </div>
        <div className="stat-card stat-blue">
          <div className="stat-icon"><FiBook /></div>
          <div className="stat-info">
            <span className="stat-value">{grades.length}</span>
            <span className="stat-label">Cours notés</span>
          </div>
        </div>
        <div className="stat-card stat-green">
          <div className="stat-icon"><FiCheckCircle /></div>
          <div className="stat-info">
            <span className="stat-value">{presentCount}</span>
            <span className="stat-label">Présences</span>
          </div>
        </div>
        <div className="stat-card stat-red">
          <div className="stat-icon"><FiAlertTriangle /></div>
          <div className="stat-info">
            <span className="stat-value">{absenceRate}%</span>
            <span className="stat-label">Taux d'absence</span>
          </div>
        </div>
      </div>

      {/* ── Grille Notes + Absences ── */}
      <div className="dashboard-grid">

        {/* Notes */}
        <div className="card">
          <h3 className="card-title"><FiBook size={15} style={{ color: '#7c3aed' }} /> Mes Notes ({grades.length})</h3>
          {grades.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: '320px', overflowY: 'auto' }}>
              {grades.map(g => (
                <div key={g.id} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.65rem 0.75rem', borderRadius: '10px',
                  background: g.value >= 10 ? 'rgba(22,163,74,0.05)' : 'rgba(220,38,38,0.05)',
                  border: `1px solid ${g.value >= 10 ? 'rgba(22,163,74,0.15)' : 'rgba(220,38,38,0.15)'}`,
                }}>
                  <div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {getCourseName(g.courseId)}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{g.semester}</div>
                  </div>
                  <span className={`badge ${g.value >= 10 ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.82rem', fontWeight: 700 }}>
                    {g.value}/20
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state"><p>Aucune note disponible</p></div>
          )}
        </div>

        {/* Absences */}
        <div className="card">
          <h3 className="card-title"><FiCalendar size={15} style={{ color: '#2563eb' }} /> Mes Absences ({absences.length})</h3>

          {/* Mini stats absences */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
            {[
              { label: 'Présent', count: presentCount, color: '#16a34a', bg: '#dcfce7' },
              { label: 'Absent',  count: absentCount,  color: '#dc2626', bg: '#fee2e2' },
              { label: 'Retard',  count: lateCount,    color: '#f59e0b', bg: '#fef9c3' },
            ].map(s => (
              <div key={s.label} style={{ textAlign: 'center', padding: '0.6rem', borderRadius: '10px', background: s.bg, border: `1px solid ${s.color}22` }}>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: s.color }}>{s.count}</div>
                <div style={{ fontSize: '0.7rem', color: s.color, fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>

          {absences.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '220px', overflowY: 'auto' }}>
              {absences.slice(0, 15).map((a, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '0.5rem 0.75rem', borderRadius: '8px',
                  background: 'var(--bg-secondary)', border: '1px solid var(--border)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {getStatusIcon(a.status)}
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                        {getCourseName(a.courseId)}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{a.date}</div>
                    </div>
                  </div>
                  <span style={{
                    fontSize: '0.68rem', fontWeight: 600, padding: '0.15rem 0.55rem', borderRadius: '50px',
                    background: a.status === 'PRESENT' ? '#dcfce7' : a.status === 'ABSENT' ? '#fee2e2' : a.status === 'LATE' ? '#fef9c3' : '#dbeafe',
                    color: a.status === 'PRESENT' ? '#15803d' : a.status === 'ABSENT' ? '#b91c1c' : a.status === 'LATE' ? '#a16207' : '#1d4ed8',
                  }}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state"><p>Aucune absence enregistrée</p><span>Vous êtes très assidu ! ✅</span></div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyProgress;