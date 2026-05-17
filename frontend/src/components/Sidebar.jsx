import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  FiHome, FiUsers, FiBook, FiCalendar,
  FiActivity, FiLogOut, FiUser, FiSettings, FiTrendingUp,
  FiSun, FiMoon
} from 'react-icons/fi';

const Sidebar = () => {
  const { user, logout, isAdmin, isProf, isStudent } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navItems = [
    { path: '/dashboard',  icon: <FiHome />,      label: 'Dashboard',    show: true },
    { path: '/students',   icon: <FiUsers />,     label: 'Étudiants',    show: isAdmin() || isProf() },
    { path: '/courses',    icon: <FiBook />,      label: 'Cours',        show: true },
    { path: '/attendance', icon: <FiCalendar />,  label: 'Absences',     show: isAdmin() || isProf() },
    { path: '/ai',         icon: <FiActivity />,  label: 'Analyse IA',   show: isAdmin() || isProf() },
    { path: '/my-progress',icon: <FiTrendingUp />,label: 'Mon Parcours', show: isStudent() },
    { path: '/users',      icon: <FiSettings />,  label: 'Utilisateurs', show: isAdmin() },
  ];

  const roleLabel = {
    ADMIN:   'Administrateur',
    PROF:    'Professeur',
    STUDENT: 'Étudiant',
  };

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="logo-icon">🎓</div>
          <div className="logo-text">
            <h2>EduCRM</h2>
            <span>Intelligent</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.filter(item => item.show).map(item => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        {/* Clic sur le profil → page /profile */}
        <div
          className="user-info"
          onClick={() => navigate('/profile')}
          title="Voir mon profil"
          style={{ cursor: 'pointer', borderRadius: '10px', transition: 'background 0.2s' }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
          <div className="user-avatar">
            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'white' }}>
              {user?.username?.[0]?.toUpperCase()}
            </span>
          </div>
          <div className="user-details">
            <span className="user-name">{user?.username}</span>
            <span className="user-role">{roleLabel[user?.role] || user?.role}</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            className="logout-btn" 
            onClick={toggleTheme}
            style={{ 
              background: 'rgba(255,255,255,0.1)', 
              borderColor: 'transparent', 
              color: '#fff',
              flex: 1,
              justifyContent: 'center'
            }}
            title={theme === 'light' ? 'Passer au mode sombre' : 'Passer au mode clair'}
          >
            {theme === 'light' ? <FiMoon /> : <FiSun />}
          </button>

          <button className="logout-btn" onClick={handleLogout} style={{ flex: 3 }}>
            <FiLogOut />
            <span>Déconnexion</span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;