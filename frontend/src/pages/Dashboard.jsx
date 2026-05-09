import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { aiAPI, studentsAPI, coursesAPI } from '../services/api';
import { FiUsers, FiBook, FiAlertTriangle, FiTrendingUp, FiArrowRight, FiCheckCircle, FiXCircle, FiClock, FiAward } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981'];

const translateAlert = (text) => {
  if (!text) return '—';
  const translations = [
    { en: /URGENT.*low grades.*avg:\s*([\d.]+)\/20.*excessive absences.*(\d+).*Immediate academic counseling required\./i,
      fr: (m) => `Notes insuffisantes (moyenne : ${m[1]}/20) et ${m[2]} absences excessives. Conseil académique urgent recommandé.` },
    { en: /student has low academic performance \(avg:\s*([\d.]+)\/20\)\.\s*consider tutoring or additional support\./i,
      fr: (m) => `Résultats faibles (moyenne : ${m[1]}/20). Un soutien pédagogique est recommandé.` },
    { en: /student has very low academic performance \(avg:\s*([\d.]+)\/20\)\.\s*immediate intervention required\./i,
      fr: (m) => `Très faibles résultats (moyenne : ${m[1]}/20). Une intervention immédiate est nécessaire.` },
    { en: /student has acceptable academic performance \(avg:\s*([\d.]+)\/20\)/i,
      fr: (m) => `Résultats acceptables (moyenne : ${m[1]}/20).` },
    { en: /student is performing well \(avg:\s*([\d.]+)\/20\)/i,
      fr: (m) => `Bons résultats (moyenne : ${m[1]}/20).` },
    { en: /high absence rate \(([\d.]+)%\)\.\s*contact student and parents\./i,
      fr: (m) => `Taux d'absence élevé (${m[1]}%). Contacter l'étudiant et ses parents.` },
    { en: /critical absence rate \(([\d.]+)%\)\.\s*immediate action required\./i,
      fr: (m) => `Taux d'absence critique (${m[1]}%). Action immédiate requise.` },
    { en: /moderate absence rate \(([\d.]+)%\)\.\s*monitor closely\./i,
      fr: (m) => `Taux d'absence modéré (${m[1]}%). À surveiller.` },
    { en: /absence rate is acceptable \(([\d.]+)%\)/i,
      fr: (m) => `Taux d'absence acceptable (${m[1]}%).` },
    { en: /student is at critical risk due to both low grades and high absences\./i,
      fr: () => `Risque critique : faibles notes et absences élevées.` },
    { en: /no significant issues detected\.\s*keep monitoring\./i,
      fr: () => `Aucun problème détecté. Continuer le suivi.` },
    { en: /student performance is satisfactory\./i,
      fr: () => `Résultats satisfaisants.` },
  ];
  for (const { en, fr } of translations) {
    const match = text.match(en);
    if (match) return fr(match);
  }
  return text;
};

const severityLabel = (s) => ({ CRITICAL: 'Critique', HIGH: 'Élevé', MEDIUM: 'Moyen', LOW: 'Faible' }[s] || s);
const severityClass = (s) => ({ CRITICAL: 'badge-critical', HIGH: 'badge-high', MEDIUM: 'badge-medium' }[s] || 'badge-low');

const CustomLabel = ({ cx, cy, midAngle, outerRadius, name, value }) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 32;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#5b4f8a" textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central" style={{ fontSize: '12px', fontWeight: 600 }}>
      {`${name} : ${value}`}
    </text>
  );
};

const riskConfig = {
  CRITICAL: { label: 'Critique', color: '#b91c1c', bg: '#fee2e2', border: '#fecaca', icon: '🔴', msg: 'Situation critique : notes insuffisantes et absences excessives. Consultez votre responsable pédagogique urgemment.' },
  HIGH:     { label: 'Élevé',    color: '#d97706', bg: '#fef9c3', border: '#fde68a', icon: '🟠', msg: 'Vos résultats académiques sont insuffisants. Un soutien pédagogique est recommandé.' },
  MEDIUM:   { label: 'Moyen',    color: '#1d4ed8', bg: '#dbeafe', border: '#bfdbfe', icon: '🔵', msg: "Votre taux d'absence est trop élevé. Veillez à être plus assidu." },
  LOW:      { label: 'Faible',   color: '#15803d', bg: '#dcfce7', border: '#bbf7d0', icon: '🟢', msg: 'Vous êtes en bonne voie ! Continuez vos efforts.' },
};

// ── Dashboard ÉTUDIANT ──
const StudentDashboard = ({ user, courseCount }) => {
  const navigate = useNavigate();
  const [student,  setStudent]  = useState(null);
  const [grades,   setGrades]   = useState([]);
  const [absences, setAbsences] = useState([]);
  const [courses,  setCourses]  = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => { loadStudentData(); }, []);

  const loadStudentData = async () => {
    try {
      const [studentsRes, coursesRes] = await Promise.allSettled([
        studentsAPI.getAll(),
        coursesAPI.getAll(),
      ]);
      if (coursesRes.status === 'fulfilled') setCourses(coursesRes.value.data);
      if (studentsRes.status === 'fulfilled') {
        const students = studentsRes.value.data;
        const me = students.find(s =>
          s.email?.toLowerCase().includes(user?.username?.toLowerCase()) ||
          `${s.firstName} ${s.lastName}`.toLowerCase().includes(user?.username?.toLowerCase())
        ) || students[0];
        if (me) {
          setStudent(me);
          const [gradesRes, absRes] = await Promise.allSettled([
            studentsAPI.getGrades(me.id),
            api.get(`/api/attendance/student/${me.id}`),
          ]);
          if (gradesRes.status === 'fulfilled') setGrades(gradesRes.value.data || []);
          if (absRes.status === 'fulfilled')    setAbsences(absRes.value.data || []);
        }
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const average = grades.length > 0
    ? (grades.reduce((s, g) => s + g.value, 0) / grades.length).toFixed(2)
    : null;

  const absentCount  = absences.filter(a => a.status === 'ABSENT').length;
  const presentCount = absences.filter(a => a.status === 'PRESENT').length;
  const lateCount    = absences.filter(a => a.status === 'LATE').length;
  const absenceRate  = absences.length > 0
    ? ((absentCount / absences.length) * 100).toFixed(0) : 0;

  const getRisk = () => {
    if (!average) return null;
    const avg = parseFloat(average), rate = parseFloat(absenceRate);
    if (avg < 10 && rate > 30) return 'CRITICAL';
    if (avg < 10)  return 'HIGH';
    if (rate > 30) return 'MEDIUM';
    return 'LOW';
  };
  const risk = getRisk();

  const getCourseName = (id) => {
    const c = courses.find(c => c.id === id);
    return c ? c.name : `Cours #${id}`;
  };

  const getStatusIcon = (status) => ({
    PRESENT: <FiCheckCircle size={13} style={{ color: '#16a34a', flexShrink: 0 }} />,
    ABSENT:  <FiXCircle     size={13} style={{ color: '#dc2626', flexShrink: 0 }} />,
    LATE:    <FiClock       size={13} style={{ color: '#f59e0b', flexShrink: 0 }} />,
  }[status] || <FiCheckCircle size={13} style={{ color: '#2563eb', flexShrink: 0 }} />);

  const getStatusBadge = (status) => {
    const map = { PRESENT: ['Présent','badge-success'], ABSENT: ['Absent','badge-danger'], LATE: ['Retard','badge-warning'], EXCUSED: ['Excusé','badge-info'] };
    const [label, cls] = map[status] || [status, 'badge-info'];
    return <span className={`badge ${cls}`}>{label}</span>;
  };

  if (loading) return <div className="page-loading"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Tableau de bord</h1>
          <p>Bienvenue, <strong>{user?.username}</strong> 👋
            {student && <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}> — {student.firstName} {student.lastName} · Niveau {student.level}</span>}
          </p>
        </div>
      </div>

      {/* Alerte risque */}
      {risk && (
        <div style={{ background: riskConfig[risk].bg, border: `1px solid ${riskConfig[risk].border}`, borderRadius: '14px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.4rem' }}>{riskConfig[risk].icon}</span>
          <div>
            <div style={{ fontWeight: 700, color: riskConfig[risk].color, fontSize: '0.9rem', marginBottom: '0.2rem' }}>Niveau de risque : {riskConfig[risk].label}</div>
            <div style={{ fontSize: '0.83rem', color: 'var(--text-secondary)' }}>{riskConfig[risk].msg}</div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card stat-purple">
          <div className="stat-icon"><FiAward /></div>
          <div className="stat-info">
            <span className="stat-value">{average ? `${average}/20` : '—'}</span>
            <span className="stat-label">Ma moyenne</span>
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

      <div className="dashboard-grid" style={{ marginBottom: '1.25rem' }}>
        {/* Notes */}
        <div className="card">
          <h3 className="card-title"><FiAward size={14} style={{ color: '#7c3aed' }} /> Mes dernières notes ({grades.length})</h3>
          {grades.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', maxHeight: '240px', overflowY: 'auto' }}>
              {grades.slice(0, 8).map((g, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.75rem', borderRadius: '10px', background: g.value >= 10 ? 'rgba(22,163,74,0.05)' : 'rgba(220,38,38,0.05)', border: `1px solid ${g.value >= 10 ? 'rgba(22,163,74,0.15)' : 'rgba(220,38,38,0.15)'}` }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-primary)' }}>{getCourseName(g.courseId)}</span>
                  <span className={`badge ${g.value >= 10 ? 'badge-success' : 'badge-danger'}`} style={{ fontWeight: 700 }}>{g.value}/20</span>
                </div>
              ))}
            </div>
          ) : <div className="empty-state"><p>Aucune note disponible</p></div>}
          <button onClick={() => navigate('/my-progress')} style={{ marginTop: '0.75rem', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.6rem', borderRadius: '8px', background: 'linear-gradient(135deg, #1e3a8a, #7c3aed)', border: 'none', color: 'white', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer' }}>
            Voir mon parcours complet <FiArrowRight size={13} />
          </button>
        </div>

        {/* Absences */}
        <div className="card">
          <h3 className="card-title"><FiCheckCircle size={14} style={{ color: '#2563eb' }} /> Mes absences récentes</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '0.75rem' }}>
            {[['Présent', presentCount, '#16a34a', '#dcfce7'], ['Absent', absentCount, '#dc2626', '#fee2e2'], ['Retard', lateCount, '#f59e0b', '#fef9c3']].map(([label, count, color, bg]) => (
              <div key={label} style={{ textAlign: 'center', padding: '0.5rem', borderRadius: '10px', background: bg }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color }}>{count}</div>
                <div style={{ fontSize: '0.68rem', color, fontWeight: 600 }}>{label}</div>
              </div>
            ))}
          </div>
          {absences.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '190px', overflowY: 'auto' }}>
              {absences.slice(0, 8).map((a, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 0.75rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--border)' }}>
                  {getStatusIcon(a.status)}
                  <span style={{ flex: 1, fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 500 }}>{getCourseName(a.courseId)}</span>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{a.date}</span>
                  {getStatusBadge(a.status)}
                </div>
              ))}
            </div>
          ) : <div className="empty-state"><p>Aucune absence enregistrée</p><span>Excellente assiduité ! ✅</span></div>}
        </div>
      </div>

      {/* Accès cours */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>📚 Catalogue des cours</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{courseCount} cours disponibles — Mathématiques, Informatique, Physique...</p>
        </div>
        <button onClick={() => navigate('/courses')} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', padding: '0.6rem 1.2rem', borderRadius: '8px', background: 'linear-gradient(135deg, #1e3a8a, #7c3aed)', border: 'none', color: 'white', fontWeight: 600, fontSize: '0.82rem', cursor: 'pointer', whiteSpace: 'nowrap' }}>
          Voir les cours <FiArrowRight size={13} />
        </button>
      </div>
    </div>
  );
};

// ── Dashboard ADMIN / PROF ──
const AdminDashboard = ({ user, stats, alerts, studentCount, courseCount }) => {
  const riskPieData = stats?.riskBreakdown ? [
    { name: 'Critique', value: stats.riskBreakdown.critical || 0 },
    { name: 'Élevé',    value: stats.riskBreakdown.high     || 0 },
    { name: 'Moyen',    value: stats.riskBreakdown.medium   || 0 },
    { name: 'Faible',   value: stats.riskBreakdown.low      || 0 },
  ].filter(d => d.value > 0) : [];

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Tableau de bord</h1>
          <p>Bienvenue, <strong>{user?.username}</strong> 👋</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-blue"><div className="stat-icon"><FiUsers /></div><div className="stat-info"><span className="stat-value">{studentCount}</span><span className="stat-label">Étudiants</span></div></div>
        <div className="stat-card stat-purple"><div className="stat-icon"><FiBook /></div><div className="stat-info"><span className="stat-value">{courseCount}</span><span className="stat-label">Cours</span></div></div>
        <div className="stat-card stat-green"><div className="stat-icon"><FiTrendingUp /></div><div className="stat-info"><span className="stat-value">{stats?.classAverage ?? '—'}</span><span className="stat-label">Moyenne générale</span></div></div>
        <div className="stat-card stat-red"><div className="stat-icon"><FiAlertTriangle /></div><div className="stat-info"><span className="stat-value">{stats?.atRiskCount || 0}</span><span className="stat-label">À risque</span></div></div>
      </div>

      {riskPieData.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Critique', value: stats?.riskBreakdown?.critical || 0, color: '#ef4444', bg: '#fee2e2', border: '#fecaca' },
            { label: 'Élevé',    value: stats?.riskBreakdown?.high     || 0, color: '#f59e0b', bg: '#fef9c3', border: '#fde68a' },
            { label: 'Moyen',    value: stats?.riskBreakdown?.medium   || 0, color: '#3b82f6', bg: '#dbeafe', border: '#bfdbfe' },
            { label: 'Faible',   value: stats?.riskBreakdown?.low      || 0, color: '#10b981', bg: '#dcfce7', border: '#bbf7d0' },
          ].map(({ label, value, color, bg, border }) => (
            <div key={label} style={{ background: bg, border: `1px solid ${border}`, borderRadius: '12px', padding: '0.9rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, flexShrink: 0 }} />
              <div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
                <div style={{ fontSize: '0.72rem', color, fontWeight: 600, marginTop: '2px' }}>{label}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="dashboard-grid">
        <div className="card">
          <h3 className="card-title">Répartition des risques</h3>
          {riskPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart margin={{ top: 10, right: 50, left: 50, bottom: 10 }}>
                <Pie data={riskPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value" labelLine={false} label={CustomLabel}>
                  {riskPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={(v, n) => [`${v} étudiant(s)`, n]} contentStyle={{ background: '#fff', border: '1px solid #e0d9f7', borderRadius: '8px', fontSize: '13px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="empty-state"><p>Aucune donnée de risque disponible</p><span>Ajoutez des étudiants et des notes</span></div>}
        </div>

        <div className="card">
          <h3 className="card-title">Alertes récentes {alerts.length > 0 && <span className="badge badge-count">{alerts.length}</span>}</h3>
          {alerts.length > 0 ? (
            <div className="alerts-list">
              {alerts.slice(0, 5).map((alert, i) => (
                <div key={i} className="alert-item">
                  <span className={`badge ${severityClass(alert.severity)}`}>{severityLabel(alert.severity)}</span>
                  <div className="alert-content"><strong>{alert.studentName}</strong><p>{translateAlert(alert.message)}</p></div>
                </div>
              ))}
              {alerts.length > 5 && <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>+ {alerts.length - 5} autres alertes — voir Analyse IA</p>}
            </div>
          ) : <div className="empty-state"><p>Aucune alerte</p><span>Tous les étudiants sont en bonne voie ✅</span></div>}
        </div>
      </div>
    </div>
  );
};

// ── Composant principal ──
const Dashboard = () => {
  const { user, isStudent } = useAuth();
  const [stats, setStats]               = useState(null);
  const [alerts, setAlerts]             = useState([]);
  const [studentCount, setStudentCount] = useState(0);
  const [courseCount, setCourseCount]   = useState(0);
  const [loading, setLoading]           = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      if (isStudent()) {
        const res = await coursesAPI.getAll();
        setCourseCount(res.data.length);
      } else {
        const [coursesRes, dashRes, alertsRes, studentsRes] = await Promise.allSettled([
          coursesAPI.getAll(), aiAPI.getDashboard(), aiAPI.getAlerts(), studentsAPI.getAll(),
        ]);
        if (coursesRes.status === 'fulfilled')  setCourseCount(coursesRes.value.data.length);
        if (dashRes.status === 'fulfilled')     setStats(dashRes.value.data);
        if (alertsRes.status === 'fulfilled')   setAlerts(alertsRes.value.data);
        if (studentsRes.status === 'fulfilled') setStudentCount(studentsRes.value.data.length);
      }
    } catch (err) { console.error('Dashboard load error:', err); }
    finally { setLoading(false); }
  };

  if (loading) return <div className="page-loading"><div className="spinner"></div></div>;

  if (isStudent()) return <StudentDashboard user={user} courseCount={courseCount} />;
  return <AdminDashboard user={user} stats={stats} alerts={alerts} studentCount={studentCount} courseCount={courseCount} />;
};

export default Dashboard;