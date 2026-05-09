import { useState, useEffect } from 'react';
import { aiAPI } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, ReferenceLine
} from 'recharts';

// ── Traduction des recommandations backend → français ──
const translateRecommendation = (text) => {
  if (!text) return '—';

  const translations = [
    { en: /URGENT.*low grades.*avg:\s*([\d.]+)\/20.*excessive absences.*(\d+).*Immediate academic counseling required\./i,
      fr: (m) => `Notes insuffisantes (moy. : ${m[1]}/20) et ${m[2]} absences. Conseil académique urgent.` },
    { en: /student has low academic performance \(avg:\s*([\d.]+)\/20\)\.\s*consider tutoring or additional support\./i,
      fr: (m) => `Résultats faibles (moy. : ${m[1]}/20). Tutorat recommandé.` },
    { en: /student has very low academic performance \(avg:\s*([\d.]+)\/20\)\.\s*immediate intervention required\./i,
      fr: (m) => `Très faibles résultats (moy. : ${m[1]}/20). Intervention immédiate.` },
    { en: /student has acceptable academic performance \(avg:\s*([\d.]+)\/20\)/i,
      fr: (m) => `Résultats acceptables (moy. : ${m[1]}/20).` },
    { en: /student is performing well \(avg:\s*([\d.]+)\/20\)/i,
      fr: (m) => `Bons résultats (moy. : ${m[1]}/20).` },
    { en: /high absence rate \(([\d.]+)%\)\.\s*contact student and parents\./i,
      fr: (m) => `Taux d'absence élevé (${m[1]}%). Contacter l'étudiant et les parents.` },
    { en: /critical absence rate \(([\d.]+)%\)\.\s*immediate action required\./i,
      fr: (m) => `Taux d'absence critique (${m[1]}%). Action immédiate requise.` },
    { en: /moderate absence rate \(([\d.]+)%\)\.\s*monitor closely\./i,
      fr: (m) => `Taux d'absence modéré (${m[1]}%). À surveiller.` },
    { en: /absence rate is acceptable \(([\d.]+)%\)/i,
      fr: (m) => `Taux d'absence acceptable (${m[1]}%).` },
    { en: /student is at critical risk due to both low grades and high absences\./i,
      fr: () => `Risque critique : faibles notes et absences élevées.` },
    { en: /student shows improvement but needs continued support\./i,
      fr: () => `Amélioration en cours, suivi continu nécessaire.` },
    { en: /no significant issues detected\.\s*keep monitoring\./i,
      fr: () => `Aucun problème détecté. Continuer le suivi.` },
    { en: /student performance is satisfactory\./i,
      fr: () => `Résultats satisfaisants.` },
    { en: /consider tutoring or additional support\./i,
      fr: () => `Tutorat ou soutien supplémentaire recommandé.` },
    { en: /immediate intervention required\./i,
      fr: () => `Intervention immédiate nécessaire.` },
    { en: /contact student and parents\./i,
      fr: () => `Contacter l'étudiant et ses parents.` },
    { en: /monitor closely\./i,
      fr: () => `À surveiller de près.` },
    { en: /keep monitoring\./i,
      fr: () => `Continuer le suivi.` },
  ];

  for (const { en, fr } of translations) {
    const match = text.match(en);
    if (match) return fr(match);
  }
  return text;
};

const riskBadge = (level) => {
  switch (level) {
    case 'CRITICAL': return 'badge-critical';
    case 'HIGH':     return 'badge-high';
    case 'MEDIUM':   return 'badge-medium';
    default:         return 'badge-low';
  }
};

const riskLabel = (level) => {
  switch (level) {
    case 'CRITICAL': return '🔴 Critique';
    case 'HIGH':     return '🟠 Élevé';
    case 'MEDIUM':   return '🟡 Moyen';
    default:         return '🟢 Faible';
  }
};

// Couleur de la barre selon la moyenne
const getBarColor = (average) => {
  if (average >= 14) return '#10b981';
  if (average >= 10) return '#3b82f6';
  if (average >= 7)  return '#f59e0b';
  return '#ef4444';
};

// Tooltip personnalisé pour le BarChart
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        background: '#ffffff', border: '1px solid #e0d9f7',
        borderRadius: '10px', padding: '0.75rem 1rem',
        boxShadow: '0 4px 12px rgba(37,99,235,0.1)',
        fontSize: '13px',
      }}>
        <p style={{ fontWeight: 700, color: '#1a1040', marginBottom: '0.4rem' }}>{label}</p>
        {payload.map((p, i) => (
          <p key={i} style={{ color: p.color, margin: '2px 0' }}>
            {p.name} : <strong>{p.value}</strong>
            {p.name === 'Moyenne' ? '/20' : ''}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const AiAnalysis = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('table');
  const [filterRisk, setFilterRisk] = useState('ALL');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const res = await aiAPI.analyzeAll();
      if (res.status === 200) setResults(res.data);
    } catch {} finally { setLoading(false); }
  };

  // Filtrage par niveau de risque
  const filteredResults = filterRisk === 'ALL'
    ? results
    : results.filter(r => r.riskLevel === filterRisk);

  // Données pour le BarChart — top 20 pour lisibilité
  const chartData = filteredResults.slice(0, 20).map(r => ({
    name: r.studentName?.split(' ')[0] || `#${r.studentId}`,
    fullName: r.studentName,
    Moyenne: parseFloat(r.average) || 0,
    Absences: r.totalAbsences || 0,
    risk: r.riskLevel,
  }));

  if (loading) return <div className="page-loading"><div className="spinner"></div></div>;

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>🤖 Analyse IA</h1>
          <p>Détection intelligente des étudiants à risque</p>
        </div>
        <div className="header-actions">
          <button
            className={`btn ${view === 'table' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setView('table')}
          >
            Tableau
          </button>
          <button
            className={`btn ${view === 'chart' ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setView('chart')}
          >
            Graphique
          </button>
        </div>
      </div>

      {/* ── Résumé des risques ── */}
      <div className="risk-summary">
        {[
          { key: 'CRITICAL', label: 'Critique', cls: 'critical' },
          { key: 'HIGH',     label: 'Élevé',    cls: 'high' },
          { key: 'MEDIUM',   label: 'Moyen',    cls: 'medium' },
          { key: 'LOW',      label: 'Faible',   cls: 'low' },
        ].map(({ key, label, cls }) => (
          <div
            key={key}
            className={`risk-stat ${cls}`}
            onClick={() => setFilterRisk(filterRisk === key ? 'ALL' : key)}
            style={{
              cursor: 'pointer',
              outline: filterRisk === key ? `2px solid currentColor` : 'none',
              outlineOffset: '2px',
              transition: 'all 0.2s',
            }}
            title={`Filtrer par : ${label}`}
          >
            <span className="risk-count">{results.filter(r => r.riskLevel === key).length}</span>
            <span className="risk-label">{label}</span>
          </div>
        ))}
      </div>

      {/* Indicateur de filtre actif */}
      {filterRisk !== 'ALL' && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          marginBottom: '1rem', padding: '0.5rem 1rem',
          background: 'var(--bg-secondary)', borderRadius: '8px',
          border: '1px solid var(--border)', fontSize: '0.85rem',
          color: 'var(--text-secondary)',
        }}>
          Filtre actif : <strong style={{ color: 'var(--text-primary)' }}>{riskLabel(filterRisk)}</strong>
          <button
            onClick={() => setFilterRisk('ALL')}
            style={{
              marginLeft: 'auto', background: 'none', border: 'none',
              cursor: 'pointer', color: 'var(--accent-red)', fontSize: '0.82rem',
              fontWeight: 600,
            }}
          >
            ✕ Effacer le filtre
          </button>
        </div>
      )}

      {/* ── Vue Graphique ── */}
      {view === 'chart' && chartData.length > 0 && (
        <div className="card" style={{ marginBottom: '1.5rem' }}>
          <h3 className="card-title">Performances par étudiant</h3>
          <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Affichage des {Math.min(filteredResults.length, 20)} premiers étudiants
          </p>
          <ResponsiveContainer width="100%" height={380}>
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 20, left: 0, bottom: 60 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0d9f7" />
              <XAxis
                dataKey="name"
                stroke="#9487c0"
                angle={-35}
                textAnchor="end"
                interval={0}
                tick={{ fontSize: 11 }}
              />
              <YAxis stroke="#9487c0" tick={{ fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                wrapperStyle={{ paddingTop: '16px', fontSize: '13px' }}
              />
              {/* Ligne de référence à 10/20 */}
              <ReferenceLine
                y={10} stroke="#ef4444" strokeDasharray="5 5"
                label={{ value: 'Seuil 10/20', fill: '#ef4444', fontSize: 11, position: 'right' }}
              />
              <Bar
                dataKey="Moyenne"
                name="Moyenne /20"
                fill="#3b82f6"
                radius={[4, 4, 0, 0]}
                maxBarSize={30}
              />
              <Bar
                dataKey="Absences"
                name="Nb absences"
                fill="#f59e0b"
                radius={[4, 4, 0, 0]}
                maxBarSize={30}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* ── Vue Tableau ── */}
      {view === 'table' && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Étudiant</th>
                <th>Moyenne</th>
                <th>Absences</th>
                <th>Taux absence</th>
                <th>Risque</th>
                <th>Recommandation</th>
              </tr>
            </thead>
            <tbody>
              {filteredResults.map((r, i) => (
                <tr key={i} className={r.riskLevel === 'CRITICAL' ? 'row-critical' : ''}>
                  <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {r.studentName}
                  </td>
                  <td>
                    <span className={`badge ${r.average >= 10 ? 'badge-success' : 'badge-danger'}`}>
                      {r.average}/20
                    </span>
                  </td>
                  <td style={{ color: r.totalAbsences > 5 ? '#dc2626' : 'var(--text-secondary)', fontWeight: r.totalAbsences > 5 ? 600 : 400 }}>
                    {r.totalAbsences}
                  </td>
                  <td>
                    <span className={`badge ${parseFloat(r.absenceRate) > 30 ? 'badge-danger' : parseFloat(r.absenceRate) > 15 ? 'badge-warning' : 'badge-success'}`}>
                      {r.absenceRate}%
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${riskBadge(r.riskLevel)}`}>
                      {riskLabel(r.riskLevel)}
                    </span>
                  </td>
                  <td className="recommendation-cell" style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                    {translateRecommendation(r.recommendation)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredResults.length === 0 && (
            <div className="empty-state">
              <p>Aucun étudiant dans cette catégorie</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AiAnalysis;