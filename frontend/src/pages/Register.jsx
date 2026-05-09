import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [form, setForm] = useState({
    username: '', email: '', password: '', role: 'STUDENT'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await register(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-left">
          <div className="auth-brand">
            <div className="brand-icon">🎓</div>
            <h1>EduCRM</h1>
            <p>Plateforme CRM Éducatif Intelligent</p>
          </div>
          <div className="auth-features">
            <div className="feature-item">
              <span className="feature-icon">👤</span>
              <span>Gestion multi-rôles</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📚</span>
              <span>Suivi académique complet</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📅</span>
              <span>Gestion des absences</span>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <form className="auth-form" onSubmit={handleSubmit}>
            <h2>Inscription</h2>
            <p className="auth-subtitle">Créez votre compte EduCRM</p>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-group">
              <label htmlFor="reg-username">Nom d'utilisateur</label>
              <input
                id="reg-username"
                type="text"
                placeholder="Choisissez un nom d'utilisateur"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-email">Email</label>
              <input
                id="reg-email"
                type="email"
                placeholder="votre@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-password">Mot de passe</label>
              <input
                id="reg-password"
                type="password"
                placeholder="Minimum 6 caractères"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label htmlFor="reg-role">Rôle</label>
              <select
                id="reg-role"
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value })}
              >
                <option value="STUDENT">Étudiant</option>
                <option value="PROF">Professeur</option>
                <option value="ADMIN">Administrateur</option>
              </select>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Inscription...' : "S'inscrire"}
            </button>

            <p className="auth-link">
              Déjà un compte ? <Link to="/login">Se connecter</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
