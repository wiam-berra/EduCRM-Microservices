import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [form, setForm] = useState({ username: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
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
              <span className="feature-icon">📊</span>
              <span>Analyse des performances</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🤖</span>
              <span>Détection IA des étudiants à risque</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">🔒</span>
              <span>Sécurité JWT & RBAC</span>
            </div>
          </div>
        </div>

        <div className="auth-right">
          <form className="auth-form" onSubmit={handleSubmit}>
            <h2>Connexion</h2>
            <p className="auth-subtitle">Bienvenue ! Connectez-vous à votre compte</p>

            {error && <div className="alert alert-error">{error}</div>}

            <div className="form-group">
              <label htmlFor="username">Nom d'utilisateur</label>
              <input
                id="username"
                type="text"
                placeholder="Entrez votre nom d'utilisateur"
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <input
                id="password"
                type="password"
                placeholder="Entrez votre mot de passe"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>

            <p className="auth-link">
              Pas de compte ? <Link to="/register">Créer un compte</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
