import { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';
import { FiTrash2, FiEdit2, FiX, FiUsers, FiShield, FiUser, FiSearch } from 'react-icons/fi';

const ROLE_CONFIG = {
  ADMIN:   { color: '#dc2626', bg: '#fee2e2', border: '#fecaca', gradient: 'linear-gradient(135deg, #dc2626, #b91c1c)', icon: '🛡️', label: 'Admin' },
  PROF:    { color: '#2563eb', bg: '#dbeafe', border: '#bfdbfe', gradient: 'linear-gradient(135deg, #2563eb, #1d4ed8)', icon: '👨‍🏫', label: 'Professeur' },
  STUDENT: { color: '#16a34a', bg: '#dcfce7', border: '#bbf7d0', gradient: 'linear-gradient(135deg, #16a34a, #15803d)', icon: '🎓', label: 'Étudiant' },
};

const getInitials = (username) =>
  username ? username.slice(0, 2).toUpperCase() : '??';

const Users = () => {
  const [users, setUsers]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [editModal, setEditModal] = useState(null);
  const [search, setSearch]       = useState('');
  const [form, setForm]           = useState({ username: '', email: '', role: '', password: '' });

  useEffect(() => { loadUsers(); }, []);

  const loadUsers = async () => {
    try {
      const res = await usersAPI.getAll();
      setUsers(res.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleEdit = (user) => {
    setEditModal(user.id);
    setForm({ username: user.username, email: user.email, role: user.role, password: '' });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await usersAPI.update(editModal, form);
      setEditModal(null);
      loadUsers();
    } catch (err) { alert(err.response?.data?.message || 'Erreur'); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    try { await usersAPI.delete(id); loadUsers(); } catch { alert('Erreur'); }
  };

  const filtered = users.filter(u =>
    !search ||
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase()) ||
    u.role?.toLowerCase().includes(search.toLowerCase())
  );

  const countByRole = (role) => users.filter(u => u.role === role).length;

  if (loading) return <div className="page-loading"><div className="spinner"></div></div>;

  return (
    <div className="page">

      {/* ── Header ── */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        alignItems: 'flex-start', marginBottom: '1.75rem', gap: '1rem', flexWrap: 'wrap',
      }}>
        <div>
          <h1 style={{
            fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.5px',
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: '0.15rem',
          }}>
            Gestion des Utilisateurs
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {filtered.length} utilisateur{filtered.length > 1 ? 's' : ''}
            {search ? ` trouvé(s) pour "${search}"` : ' enregistré(s)'}
          </p>
        </div>

        {/* Search */}
        <div style={{ position: 'relative' }}>
          <FiSearch style={{
            position: 'absolute', left: '0.85rem', top: '50%',
            transform: 'translateY(-50%)', color: 'var(--text-muted)',
            fontSize: '0.9rem', pointerEvents: 'none',
          }} />
          <input
            type="text"
            placeholder="Rechercher un utilisateur..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              padding: '0.6rem 2.2rem 0.6rem 2.2rem',
              background: 'var(--bg-card)',
              border: '1px solid var(--border)',
              borderRadius: '50px',
              color: 'var(--text-primary)',
              fontFamily: 'inherit',
              fontSize: '0.85rem',
              width: '240px',
              outline: 'none',
              transition: 'border 0.2s, box-shadow 0.2s',
            }}
            onFocus={e => { e.target.style.borderColor = 'var(--accent-purple-light)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.12)'; }}
            onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
          />
          {search && (
            <button onClick={() => setSearch('')} style={{
              position: 'absolute', right: '0.75rem', top: '50%',
              transform: 'translateY(-50%)', background: 'none', border: 'none',
              cursor: 'pointer', color: 'var(--text-muted)',
              display: 'flex', alignItems: 'center', padding: 0,
            }}>
              <FiX size={13} />
            </button>
          )}
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '1rem',
        marginBottom: '1.75rem',
      }}>
        {[
          { label: 'Total',       value: users.length,           gradient: 'linear-gradient(135deg, #2563eb, #7c3aed)', icon: FiUsers,  glow: 'rgba(37,99,235,0.12)' },
          { label: 'Admins',      value: countByRole('ADMIN'),   gradient: 'linear-gradient(135deg, #dc2626, #b91c1c)', icon: FiShield, glow: 'rgba(220,38,38,0.12)' },
          { label: 'Professeurs', value: countByRole('PROF'),    gradient: 'linear-gradient(135deg, #2563eb, #1d4ed8)', icon: FiUser,   glow: 'rgba(37,99,235,0.12)' },
          { label: 'Étudiants',   value: countByRole('STUDENT'), gradient: 'linear-gradient(135deg, #16a34a, #15803d)', icon: FiUser,   glow: 'rgba(22,163,74,0.12)' },
        ].map(({ label, value, gradient, icon: Icon, glow }) => (
          <div key={label}
            style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)',
              borderRadius: '16px', padding: '1.1rem 1.25rem',
              display: 'flex', alignItems: 'center', gap: '1rem',
              boxShadow: '0 2px 8px rgba(124,58,237,0.07)',
              transition: 'all 0.2s', cursor: 'default',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${glow}`; e.currentTarget.style.borderColor = 'var(--border-light)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 8px rgba(124,58,237,0.07)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: 12, background: gradient,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <Icon size={20} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-1px', color: 'var(--text-primary)', lineHeight: 1 }}>
                {value}
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 500, marginTop: '0.2rem' }}>
                {label}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Modern Table ── */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(37,99,235,0.06)',
      }}>
        {/* Table header bar */}
        <div style={{
          padding: '1rem 1.5rem',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          <FiUsers size={15} style={{ color: 'var(--text-muted)' }} />
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)' }}>
            Liste des utilisateurs
          </span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--bg-secondary)' }}>
              {['Utilisateur', 'Email', 'Rôle', 'Créé le', 'Actions'].map(h => (
                <th key={h} style={{
                  padding: '0.85rem 1.5rem',
                  textAlign: 'left',
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  color: 'var(--text-muted)',
                  borderBottom: '1px solid var(--border)',
                  whiteSpace: 'nowrap',
                }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  {search ? `Aucun résultat pour "${search}"` : 'Aucun utilisateur'}
                </td>
              </tr>
            ) : filtered.map((u, idx) => {
              const role = ROLE_CONFIG[u.role] || ROLE_CONFIG.STUDENT;
              return (
                <tr key={u.id}
                  style={{
                    borderBottom: idx < filtered.length - 1 ? '1px solid var(--border)' : 'none',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-secondary)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Utilisateur — avatar + nom + id */}
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                      <div style={{
                        width: 40, height: 40, borderRadius: '12px',
                        background: role.gradient,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.82rem', fontWeight: 800, color: '#fff',
                        flexShrink: 0,
                        boxShadow: `0 3px 8px ${role.bg}`,
                      }}>
                        {getInitials(u.username)}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                          {u.username}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                          ID #{u.id}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {u.email}
                    </span>
                  </td>

                  {/* Rôle */}
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                      fontSize: '0.72rem', fontWeight: 700,
                      padding: '0.25rem 0.75rem', borderRadius: '50px',
                      background: role.bg, color: role.color,
                      border: `1px solid ${role.border}`,
                      whiteSpace: 'nowrap',
                    }}>
                      {role.icon} {role.label}
                    </span>
                  </td>

                  {/* Créé le */}
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString('fr-FR') : '—'}
                    </span>
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      <button className="btn-icon btn-edit" onClick={() => handleEdit(u)} title="Modifier">
                        <FiEdit2 size={13} />
                      </button>
                      <button className="btn-icon btn-delete" onClick={() => handleDelete(u.id)} title="Supprimer">
                        <FiTrash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Table footer */}
        {filtered.length > 0 && (
          <div style={{
            padding: '0.85rem 1.5rem',
            borderTop: '1px solid var(--border)',
            background: 'var(--bg-secondary)',
            fontSize: '0.78rem', color: 'var(--text-muted)',
          }}>
            {filtered.length} utilisateur{filtered.length > 1 ? 's' : ''} affiché{filtered.length > 1 ? 's' : ''}
            {search && ` · filtre : "${search}"`}
          </div>
        )}
      </div>

      {/* ── Edit Modal ── */}
      {editModal && (
        <div className="modal-overlay" onClick={() => setEditModal(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Modifier l'utilisateur</h3>
              <button className="btn-close" onClick={() => setEditModal(null)}><FiX /></button>
            </div>
            <form onSubmit={handleUpdate}>
              <div className="form-group">
                <label>Username</label>
                <input value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Rôle</label>
                <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
                  <option value="STUDENT">🎓 Étudiant</option>
                  <option value="PROF">👨‍🏫 Professeur</option>
                  <option value="ADMIN">🛡️ Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label>
                  Nouveau mot de passe{' '}
                  <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optionnel)</span>
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="Laisser vide pour ne pas changer"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setEditModal(null)}>Annuler</button>
                <button type="submit" className="btn btn-primary">Modifier</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;