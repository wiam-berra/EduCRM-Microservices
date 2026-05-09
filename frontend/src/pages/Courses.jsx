import { useState, useEffect } from 'react';
import { coursesAPI, modulesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiBook, FiAward, FiUser, FiSearch, FiArrowLeft, FiCalendar, FiLayers, FiInfo } from 'react-icons/fi';

const MODULE_COLORS = [
  { bg: '#dbeafe', color: '#1d4ed8', border: '#bfdbfe' },
  { bg: '#ede9fe', color: '#6d28d9', border: '#ddd6fe' },
  { bg: '#dcfce7', color: '#15803d', border: '#bbf7d0' },
  { bg: '#fef9c3', color: '#a16207', border: '#fde68a' },
  { bg: '#fee2e2', color: '#b91c1c', border: '#fecaca' },
  { bg: '#f0fdf4', color: '#166534', border: '#86efac' },
];

const getModuleColor = (moduleId) => {
  if (!moduleId) return MODULE_COLORS[0];
  return MODULE_COLORS[moduleId % MODULE_COLORS.length];
};

// ── Course Detail Page ──
const CourseDetail = ({ course, onBack }) => {
  const clr = getModuleColor(course.module?.id);
  return (
    <div className="page" style={{ animation: 'fadeIn 0.3s ease' }}>
      {/* Back button */}
      <button
        onClick={onBack}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
          padding: '0.5rem 1rem', marginBottom: '1.5rem',
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: '50px', cursor: 'pointer', fontFamily: 'inherit',
          fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = clr.color; e.currentTarget.style.color = clr.color; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
      >
        <FiArrowLeft size={14} /> Retour aux cours
      </button>

      {/* Header card */}
      <div style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border)',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: '0 4px 20px rgba(37,99,235,0.08)',
        marginBottom: '1.5rem',
      }}>
        {/* Color banner */}
        <div style={{
          height: '8px',
          background: `linear-gradient(to right, ${clr.color}, #7c3aed)`,
        }} />

        <div style={{ padding: '2rem' }}>
          {/* Module badge + Semester */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            {course.module && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                padding: '0.3rem 0.9rem', borderRadius: '50px',
                background: clr.bg, color: clr.color, border: `1px solid ${clr.border}`,
                fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
              }}>
                <FiLayers size={11} /> {course.module.name}
              </span>
            )}
            {course.semester && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                padding: '0.3rem 0.9rem', borderRadius: '50px',
                background: 'var(--bg-secondary)', color: 'var(--text-secondary)',
                border: '1px solid var(--border)',
                fontSize: '0.72rem', fontWeight: 600,
              }}>
                <FiCalendar size={11} /> {course.semester}
              </span>
            )}
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: '1.9rem', fontWeight: 800, letterSpacing: '-0.5px',
            background: `linear-gradient(135deg, ${clr.color}, #7c3aed)`,
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            marginBottom: '0.75rem',
          }}>
            {course.name}
          </h1>

          {/* Description */}
          <p style={{
            fontSize: '1rem', color: 'var(--text-secondary)', lineHeight: 1.7,
            maxWidth: '700px',
          }}>
            {course.description || 'Aucune description disponible pour ce cours.'}
          </p>
        </div>
      </div>

      {/* Info cards grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
        {/* Credits */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: '14px', padding: '1.25rem',
          boxShadow: '0 2px 8px rgba(124,58,237,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '10px',
              background: clr.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FiAward size={16} style={{ color: clr.color }} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Crédits</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {course.credits || '—'}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>ECTS</div>
        </div>

        {/* Semestre */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: '14px', padding: '1.25rem',
          boxShadow: '0 2px 8px rgba(124,58,237,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '10px',
              background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FiCalendar size={16} style={{ color: '#7c3aed' }} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Semestre</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {course.semester || '—'}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Période</div>
        </div>

        {/* Module */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: '14px', padding: '1.25rem',
          boxShadow: '0 2px 8px rgba(124,58,237,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '10px',
              background: '#dbeafe', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FiLayers size={16} style={{ color: '#1d4ed8' }} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Module</span>
          </div>
          <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {course.module?.name || '—'}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Unité d'enseignement</div>
        </div>

        {/* Professeur */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border)',
          borderRadius: '14px', padding: '1.25rem',
          boxShadow: '0 2px 8px rgba(124,58,237,0.06)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
            <div style={{
              width: '34px', height: '34px', borderRadius: '10px',
              background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <FiUser size={16} style={{ color: '#15803d' }} />
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Professeur</span>
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            {course.professorId ? `#${course.professorId}` : '—'}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Responsable</div>
        </div>
      </div>

      {/* Objectifs / Contenu du cours */}
      <div style={{
        background: 'var(--bg-card)', border: '1px solid var(--border)',
        borderRadius: '16px', padding: '1.75rem',
        boxShadow: '0 2px 8px rgba(124,58,237,0.06)',
      }}>
        <h3 style={{
          fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)',
          marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
        }}>
          <FiInfo size={16} style={{ color: clr.color }} />
          À propos de ce cours
        </h3>
        <div style={{
          background: 'var(--bg-secondary)', borderRadius: '12px',
          padding: '1.25rem', border: '1px solid var(--border)',
        }}>
          <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.8 }}>
            {course.description
              ? course.description
              : `Ce cours fait partie du module ${course.module?.name || 'général'} et couvre les fondamentaux de la matière. Les étudiants inscrits à ce cours acquerront les compétences nécessaires dans le domaine enseigné.`
            }
          </p>
          {course.credits && (
            <div style={{
              marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
            }}>
              <FiAward size={14} style={{ color: clr.color }} />
              <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Ce cours vaut <strong style={{ color: clr.color }}>{course.credits} crédits ECTS</strong>
                {course.semester && <> — dispensé au <strong style={{ color: clr.color }}>{course.semester}</strong></>}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Main Courses Component ──
const Courses = () => {
  const { isAdmin, isProf, isStudent } = useAuth();
  const canEdit = isAdmin() || isProf();
  const studentOnly = isStudent();

  const [courses, setCourses] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeModule, setActiveModule] = useState('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [form, setForm] = useState({
    name: '', description: '', professorId: '', credits: '', semester: '', module: null
  });
  const [moduleForm, setModuleForm] = useState({ name: '', description: '' });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [cRes, mRes] = await Promise.all([coursesAPI.getAll(), modulesAPI.getAll()]);
      setCourses(cRes.data);
      setModules(mRes.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      professorId: form.professorId ? parseInt(form.professorId) : null,
      credits: form.credits ? parseInt(form.credits) : null,
      module: form.module ? { id: parseInt(form.module) } : null
    };
    try {
      if (editing) await coursesAPI.update(editing, payload);
      else await coursesAPI.create(payload);
      setShowModal(false); setEditing(null); loadData();
    } catch { alert('Erreur'); }
  };

  const handleEdit = (course) => {
    setEditing(course.id);
    setForm({
      name: course.name, description: course.description || '',
      professorId: course.professorId || '', credits: course.credits || '',
      semester: course.semester || '', module: course.module?.id || null
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce cours ?')) return;
    try { await coursesAPI.delete(id); loadData(); } catch { alert('Erreur'); }
  };

  const addModule = async (e) => {
    e.preventDefault();
    try {
      await modulesAPI.create(moduleForm);
      setShowModuleModal(false);
      setModuleForm({ name: '', description: '' });
      loadData();
    } catch (err) { alert(err.response?.data?.message || 'Erreur'); }
  };

  const filteredCourses = courses
    .filter(c => activeModule === 'all' || String(c.module?.id) === String(activeModule))
    .filter(c => !search ||
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description?.toLowerCase().includes(search.toLowerCase())
    );

  const grouped = activeModule === 'all'
    ? modules.reduce((acc, m) => {
        const moduleCourses = filteredCourses.filter(c => c.module?.id === m.id);
        if (moduleCourses.length > 0) acc[m.name] = { courses: moduleCourses, id: m.id };
        return acc;
      }, {})
    : null;

  const noModuleCourses = filteredCourses.filter(c => !c.module);

  // Show course detail
  if (selectedCourse) {
    return <CourseDetail course={selectedCourse} onBack={() => setSelectedCourse(null)} />;
  }

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
            Catalogue des Cours
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {studentOnly ? 'Explorez le catalogue disponible' : 'Explorez et gérez le catalogue disponible'}
          </p>
        </div>

        {/* Search + Boutons — cachés pour les étudiants */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Search bar */}
          <div style={{ position: 'relative' }}>
            <FiSearch style={{
              position: 'absolute', left: '0.85rem', top: '50%',
              transform: 'translateY(-50%)', color: 'var(--text-muted)',
              fontSize: '0.9rem', pointerEvents: 'none',
            }} />
            <input
              type="text"
              placeholder="Rechercher un cours..."
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
              onFocus={e => {
                e.target.style.borderColor = 'var(--accent-purple-light)';
                e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.12)';
              }}
              onBlur={e => {
                e.target.style.borderColor = 'var(--border)';
                e.target.style.boxShadow = 'none';
              }}
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

          {/* Boutons visibles seulement pour ADMIN et PROF */}
          {canEdit && (
            <>
              <button className="btn btn-secondary" onClick={() => setShowModuleModal(true)}>
                <FiPlus /> Module
              </button>
              <button className="btn btn-primary" onClick={() => {
                setEditing(null);
                setForm({ name: '', description: '', professorId: '', credits: '', semester: '', module: null });
                setShowModal(true);
              }}>
                <FiPlus /> Nouveau cours
              </button>
            </>
          )}
        </div>
      </div>

      {/* ── Module filter pills ── */}
      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
        <button
          onClick={() => setActiveModule('all')}
          style={{
            padding: '0.45rem 1.2rem', borderRadius: '50px',
            cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: 600,
            transition: 'all 0.2s',
            background: activeModule === 'all' ? 'linear-gradient(135deg, #2563eb, #7c3aed)' : 'var(--bg-card)',
            color: activeModule === 'all' ? '#fff' : 'var(--text-secondary)',
            border: activeModule === 'all' ? 'none' : '1px solid var(--border)',
            boxShadow: activeModule === 'all' ? '0 2px 10px rgba(37,99,235,0.25)' : 'none',
          }}
        >
          Tous les cours
        </button>
        {modules.map(m => {
          const clr = getModuleColor(m.id);
          const isActive = String(activeModule) === String(m.id);
          return (
            <button key={m.id} onClick={() => setActiveModule(String(m.id))} style={{
              padding: '0.45rem 1.2rem', borderRadius: '50px',
              border: isActive ? 'none' : `1px solid ${clr.border}`,
              cursor: 'pointer', fontFamily: 'inherit', fontSize: '0.85rem', fontWeight: 600,
              transition: 'all 0.2s',
              background: isActive ? clr.color : clr.bg,
              color: isActive ? '#fff' : clr.color,
              boxShadow: isActive ? `0 2px 10px ${clr.border}` : 'none',
            }}>
              {m.name}
            </button>
          );
        })}
      </div>

      {/* ── Courses Grid ── */}
      {activeModule === 'all' ? (
        <div>
          {Object.entries(grouped).map(([moduleName, data]) => {
            const clr = getModuleColor(data.id);
            return (
              <div key={moduleName} style={{ marginBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.4rem',
                    padding: '0.3rem 0.9rem', borderRadius: '50px',
                    background: clr.bg, color: clr.color, border: `1px solid ${clr.border}`,
                    fontSize: '0.78rem', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.5px',
                  }}>
                    <FiBook size={12} /> {moduleName}
                  </span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {data.courses.length} cours
                  </span>
                </div>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
                  gap: '1rem',
                }}>
                  {data.courses.map(c => (
                    <CourseCard
                      key={c.id} course={c} clr={clr}
                      onEdit={handleEdit} onDelete={handleDelete}
                      onView={() => setSelectedCourse(c)}
                      canEdit={canEdit}
                    />
                  ))}
                </div>
              </div>
            );
          })}

          {noModuleCourses.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
                <span style={{
                  padding: '0.3rem 0.9rem', borderRadius: '50px',
                  background: 'var(--bg-secondary)', color: 'var(--text-muted)',
                  border: '1px solid var(--border)', fontSize: '0.78rem', fontWeight: 700,
                  textTransform: 'uppercase', letterSpacing: '0.5px',
                }}>
                  Sans module
                </span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {noModuleCourses.map(c => (
                  <CourseCard
                    key={c.id} course={c} clr={MODULE_COLORS[0]}
                    onEdit={handleEdit} onDelete={handleDelete}
                    onView={() => setSelectedCourse(c)}
                    canEdit={canEdit}
                  />
                ))}
              </div>
            </div>
          )}

          {filteredCourses.length === 0 && (
            <div className="empty-state">
              <p>{search ? `Aucun résultat pour "${search}"` : 'Aucun cours'}</p>
              {!search && !studentOnly && <span>Ajoutez votre premier cours</span>}
            </div>
          )}
        </div>
      ) : (
        <div>
          {filteredCourses.length === 0
            ? <div className="empty-state">
                <p>{search ? `Aucun résultat pour "${search}"` : 'Aucun cours dans ce module'}</p>
              </div>
            : <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                {filteredCourses.map(c => {
                  const clr = getModuleColor(c.module?.id);
                  return (
                    <CourseCard
                      key={c.id} course={c} clr={clr}
                      onEdit={handleEdit} onDelete={handleDelete}
                      onView={() => setSelectedCourse(c)}
                      canEdit={canEdit}
                    />
                  );
                })}
              </div>
          }
        </div>
      )}

      {/* ── Course Modal (ADMIN/PROF only) ── */}
      {showModal && canEdit && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Modifier' : 'Ajouter'} un cours</h3>
              <button className="btn-close" onClick={() => setShowModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Nom</label>
                <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Module</label>
                  <select value={form.module || ''} onChange={e => setForm({ ...form, module: e.target.value || null })}>
                    <option value="">— Aucun —</option>
                    {modules.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Crédits</label>
                  <input type="number" value={form.credits} onChange={e => setForm({ ...form, credits: e.target.value })} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Semestre</label>
                  <input placeholder="S1, S2..." value={form.semester} onChange={e => setForm({ ...form, semester: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>ID Professeur</label>
                  <input type="number" value={form.professorId} onChange={e => setForm({ ...form, professorId: e.target.value })} />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Modifier' : 'Ajouter'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Module Modal (ADMIN/PROF only) ── */}
      {showModuleModal && canEdit && (
        <div className="modal-overlay" onClick={() => setShowModuleModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Ajouter un module</h3>
              <button className="btn-close" onClick={() => setShowModuleModal(false)}><FiX /></button>
            </div>
            <form onSubmit={addModule}>
              <div className="form-group">
                <label>Nom</label>
                <input value={moduleForm.name} onChange={e => setModuleForm({ ...moduleForm, name: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={moduleForm.description} onChange={e => setModuleForm({ ...moduleForm, description: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModuleModal(false)}>Annuler</button>
                <button type="submit" className="btn btn-primary">Ajouter</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Course Card ──
const CourseCard = ({ course, clr, onEdit, onDelete, onView, canEdit }) => (
  <div
    onClick={onView}
    style={{
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderRadius: '16px',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(124,58,237,0.07)',
      transition: 'all 0.2s',
      display: 'flex',
      flexDirection: 'column',
      cursor: 'pointer',
    }}
    onMouseEnter={e => {
      e.currentTarget.style.transform = 'translateY(-3px)';
      e.currentTarget.style.boxShadow = '0 8px 24px rgba(37,99,235,0.12)';
      e.currentTarget.style.borderColor = 'var(--border-light)';
    }}
    onMouseLeave={e => {
      e.currentTarget.style.transform = '';
      e.currentTarget.style.boxShadow = '0 2px 8px rgba(124,58,237,0.07)';
      e.currentTarget.style.borderColor = 'var(--border)';
    }}
  >
    {/* Color band */}
    <div style={{ height: '6px', background: `linear-gradient(to right, ${clr.color}, ${clr.border})` }} />

    <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
      {/* Module label + semester */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <span style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: clr.color }}>
          {course.module?.name || 'Sans module'}
        </span>
        {course.semester && (
          <span style={{
            fontSize: '0.7rem', fontWeight: 600,
            padding: '0.15rem 0.6rem', borderRadius: '50px',
            background: clr.bg, color: clr.color, border: `1px solid ${clr.border}`,
          }}>
            {course.semester}
          </span>
        )}
      </div>

      {/* Name */}
      <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: 1.3 }}>
        {course.name}
      </h3>

      {/* Description */}
      {course.description && (
        <p style={{
          fontSize: '0.82rem', color: 'var(--text-muted)', lineHeight: 1.5,
          marginBottom: '1rem', flex: 1,
          display: '-webkit-box', WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {course.description}
        </p>
      )}

      {/* Meta */}
      <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
        {course.credits && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <FiAward size={12} style={{ color: clr.color }} /> {course.credits} crédits
          </span>
        )}
        {course.professorId && (
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            <FiUser size={12} style={{ color: clr.color }} /> Prof {course.professorId}
          </span>
        )}
      </div>
    </div>

    {/* Actions — visibles seulement pour ADMIN et PROF */}
    {canEdit && (
      <div
        style={{
          display: 'flex', justifyContent: 'flex-end', gap: '0.35rem',
          padding: '0.75rem 1.25rem',
          borderTop: '1px solid var(--bg-secondary)',
          background: 'var(--bg-secondary)',
        }}
        onClick={e => e.stopPropagation()} // empêche l'ouverture du détail au clic sur les boutons
      >
        <button className="btn-icon btn-edit" onClick={() => onEdit(course)} title="Modifier"><FiEdit2 size={13} /></button>
        <button className="btn-icon btn-delete" onClick={() => onDelete(course.id)} title="Supprimer"><FiTrash2 size={13} /></button>
      </div>
    )}
  </div>
);

export default Courses;