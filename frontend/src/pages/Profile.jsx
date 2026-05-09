import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  FiUser, FiMail, FiShield, FiCalendar,
  FiEdit2, FiSave, FiX, FiTrendingUp, FiLogOut
} from 'react-icons/fi';

const Profile = () => {
  const { user, logout, isAdmin, isProf, isStudent } = useAuth();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);

  const roleLabel = { ADMIN: 'Administrateur', PROF: 'Professeur', STUDENT: 'Étudiant' };
  const roleColor = { ADMIN: '#dc2626', PROF: '#2563eb', STUDENT: '#16a34a' };
  const roleBg   = { ADMIN: '#fee2e2', PROF: '#dbeafe', STUDENT: '#dcfce7' };

  const initials = user?.username?.slice(0, 2).toUpperCase();
  const role = user?.role;

  return (
    <div className="page" style={{ maxWidth: '700px', margin: '0 auto' }}>

      {/* ── Header ── */}
      <h1 style={{
        fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.5px',
        background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        marginBottom: '1.5rem',
      }}>
        Mon Profil
      </h1>

      {/* ── Avatar Card ── */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '20px', overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(37,99,235,0.08)', marginBottom: '1.25rem',
      }}>
        {/* Banner gradient */}
        <div style={{
          height: '90px',
          background: 'linear-gradient(135deg, #1e3a8a, #3730a3, #7c3aed)',
        }} />

        <div style={{ padding: '0 2rem 2rem', marginTop: '-45px' }}>
          {/* Avatar circle */}
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.75rem', fontWeight: 800, color: 'white',
            border: '4px solid var(--bg-card)',
            boxShadow: '0 4px 12px rgba(37,99,235,0.3)',
            marginBottom: '1rem',
          }}>
            {initials}
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                {user?.username}
              </h2>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                padding: '0.25rem 0.9rem', borderRadius: '50px',
                background: roleBg[role], color: roleColor[role],
                fontSize: '0.78rem', fontWeight: 700,
              }}>
                <FiShield size={12} />
                {roleLabel[role]}
              </span>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {isStudent() && (
                <button
                  onClick={() => navigate('/my-progress')}
                  className="btn btn-secondary"
                  style={{ fontSize: '0.82rem' }}
                >
                  <FiTrendingUp size={14} /> Mon Parcours
                </button>
              )}
              <button
                onClick={() => { logout(); navigate('/login'); }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                  padding: '0.55rem 1rem', borderRadius: '8px',
                  background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)',
                  color: '#dc2626', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                }}
              >
                <FiLogOut size={14} /> Déconnexion
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Info Cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>

        <InfoCard icon={<FiUser size={16} style={{ color: '#7c3aed' }} />}
          label="Nom d'utilisateur" value={user?.username} bg="#ede9fe" />

        <InfoCard icon={<FiMail size={16} style={{ color: '#2563eb' }} />}
          label="Email" value={user?.email || `${user?.username}@educrm.ma`} bg="#dbeafe" />

        <InfoCard icon={<FiShield size={16} style={{ color: roleColor[role] }} />}
          label="Rôle" value={roleLabel[role]} bg={roleBg[role]} />

        <InfoCard icon={<FiCalendar size={16} style={{ color: '#16a34a' }} />}
          label="Membre depuis" value="2026" bg="#dcfce7" />
      </div>

      {/* ── Permissions Card ── */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '16px', padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(124,58,237,0.06)',
      }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FiShield size={15} style={{ color: '#7c3aed' }} />
          Mes accès dans l'application
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          <PermRow label="Tableau de bord" allowed={true} />
          <PermRow label="Catalogue des cours" allowed={true} />
          <PermRow label="Gestion des étudiants" allowed={isAdmin() || isProf()} />
          <PermRow label="Gestion des absences" allowed={isAdmin() || isProf()} />
          <PermRow label="Analyse IA des risques" allowed={isAdmin() || isProf()} />
          <PermRow label="Gestion des utilisateurs" allowed={isAdmin()} />
          <PermRow label="Mon parcours académique" allowed={isStudent()} />
        </div>
      </div>
    </div>
  );
};

const InfoCard = ({ icon, label, value, bg }) => (
  <div style={{
    background: 'var(--bg-card)', border: '1px solid var(--border)',
    borderRadius: '14px', padding: '1.1rem',
    boxShadow: '0 2px 8px rgba(124,58,237,0.05)',
  }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
      <div style={{ width: '30px', height: '30px', borderRadius: '8px', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {icon}
      </div>
      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
        {label}
      </span>
    </div>
    <div style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)' }}>
      {value || '—'}
    </div>
  </div>
);

const PermRow = ({ label, allowed }) => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '0.55rem 0.75rem', borderRadius: '8px',
    background: allowed ? 'rgba(22,163,74,0.05)' : 'rgba(156,163,175,0.05)',
    border: `1px solid ${allowed ? 'rgba(22,163,74,0.15)' : 'rgba(156,163,175,0.1)'}`,
  }}>
    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</span>
    <span style={{
      fontSize: '0.72rem', fontWeight: 700, padding: '0.15rem 0.65rem',
      borderRadius: '50px',
      background: allowed ? '#dcfce7' : '#f3f4f6',
      color: allowed ? '#15803d' : '#9ca3af',
    }}>
      {allowed ? '✓ Autorisé' : '✗ Restreint'}
    </span>
  </div>
);

export default Profile;