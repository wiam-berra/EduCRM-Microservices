import { useState, useEffect } from 'react';
import { studentsAPI, coursesAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { FiPlus, FiEdit2, FiTrash2, FiEye, FiX, FiSearch, FiBook, FiAward, FiUser } from 'react-icons/fi';

const Students = () => {
  const { isAdmin, isProf } = useAuth();
  const canEdit = isAdmin() || isProf();

  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(null);
  const [grades, setGrades] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', dateOfBirth: '', level: ''
  });
  const [gradeForm, setGradeForm] = useState({ courseId: '', value: '', semester: '' });
  const [addingGrade, setAddingGrade] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const [sRes, cRes] = await Promise.allSettled([
        studentsAPI.getAll(),
        coursesAPI.getAll(),
      ]);
      if (sRes.status === 'fulfilled') setStudents(sRes.value.data);
      if (cRes.status === 'fulfilled') setCourses(cRes.value.data);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await studentsAPI.update(editing, form);
      } else {
        await studentsAPI.create(form);
      }
      setShowModal(false);
      setEditing(null);
      setForm({ firstName: '', lastName: '', email: '', dateOfBirth: '', level: '' });
      loadData();
    } catch (err) { alert(err.response?.data?.message || 'Erreur'); }
  };

  const handleEdit = (student) => {
    setEditing(student.id);
    setForm({
      firstName: student.firstName, lastName: student.lastName,
      email: student.email, dateOfBirth: student.dateOfBirth || '',
      level: student.level || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cet étudiant ?')) return;
    try {
      await studentsAPI.delete(id);
      loadData();
    } catch { alert('Erreur lors de la suppression'); }
  };

  const viewDetail = async (student) => {
    // Réinitialiser grades ET gradeForm AVANT d'ouvrir le modal pour éviter
    // que les grades de l'étudiant précédent filtrent les cours disponibles
    setGrades([]);
    setGradeForm({ courseId: '', value: '', semester: '' });
    setShowDetail(student);
    try {
      // Recharger les cours si la liste est vide (ex: échec initial de l'API)
      if (courses.length === 0) {
        try {
          const cRes = await coursesAPI.getAll();
          setCourses(cRes.data);
        } catch { /* silencieux */ }
      }
      const res = await studentsAPI.getGrades(student.id);
      setGrades(res.data);
    } catch { setGrades([]); }
  };

  const addGrade = async (e) => {
    e.preventDefault();
    setAddingGrade(true);
    try {
      await studentsAPI.addGrade(showDetail.id, {
        courseId: parseInt(gradeForm.courseId),
        value: parseFloat(gradeForm.value),
        semester: gradeForm.semester
      });
      const res = await studentsAPI.getGrades(showDetail.id);
      setGrades(res.data);
      setGradeForm({ courseId: '', value: '', semester: '' });
    } catch { alert('Erreur lors de l\'ajout de la note'); }
    finally { setAddingGrade(false); }
  };

  // Trouve le nom du cours par ID (normaliser les types pour éviter mismatch string/number)
  const getCourseName = (courseId) => {
    const course = courses.find(c => Number(c.id) === Number(courseId));
    return course ? course.name : `Cours #${courseId}`;
  };

  // Semestres disponibles
  const semesters = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6'];

  // Afficher TOUS les cours dans le dropdown (le backend autorise plusieurs notes par cours,
  // une par semestre - pas de filtrage côté client)
  const availableCourses = courses;

  const filteredStudents = students.filter(s =>
    !search ||
    s.firstName?.toLowerCase().includes(search.toLowerCase()) ||
    s.lastName?.toLowerCase().includes(search.toLowerCase()) ||
    s.email?.toLowerCase().includes(search.toLowerCase()) ||
    s.level?.toLowerCase().includes(search.toLowerCase())
  );

  // Calcule la moyenne des notes
  const getAverage = (gradesList) => {
    if (!gradesList || gradesList.length === 0) return null;
    const avg = gradesList.reduce((sum, g) => sum + g.value, 0) / gradesList.length;
    return avg.toFixed(2);
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
            Gestion des Étudiants
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            {filteredStudents.length} étudiant(s)
            {search ? ` trouvé(s) pour "${search}"` : ' enregistré(s)'}
          </p>
        </div>

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
              placeholder="Rechercher un étudiant..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                padding: '0.6rem 2.2rem 0.6rem 2.2rem',
                background: 'var(--bg-card)', border: '1px solid var(--border)',
                borderRadius: '50px', color: 'var(--text-primary)',
                fontFamily: 'inherit', fontSize: '0.85rem', width: '240px',
                outline: 'none', transition: 'border 0.2s, box-shadow 0.2s',
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--accent-purple-light)'; e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.12)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--border)'; e.target.style.boxShadow = 'none'; }}
            />
            {search && (
              <button onClick={() => setSearch('')} style={{
                position: 'absolute', right: '0.75rem', top: '50%',
                transform: 'translateY(-50%)', background: 'none', border: 'none',
                cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', padding: 0,
              }}>
                <FiX size={13} />
              </button>
            )}
          </div>

          {canEdit && (
            <button className="btn btn-primary" onClick={() => {
              setEditing(null);
              setForm({ firstName: '', lastName: '', email: '', dateOfBirth: '', level: '' });
              setShowModal(true);
            }}>
              <FiPlus /> Ajouter
            </button>
          )}
        </div>
      </div>

      {/* ── Table ── */}
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Prénom</th>
              <th>Nom</th>
              <th>Email</th>
              <th>Niveau</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map(s => (
              <tr key={s.id}>
                <td style={{ color: 'var(--accent-purple)', fontWeight: 600 }}>{s.id}</td>
                <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{s.firstName}</td>
                <td>{s.lastName}</td>
                <td style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{s.email}</td>
                <td><span className="badge badge-info">{s.level || '—'}</span></td>
                <td className="actions-cell">
                  <button className="btn-icon btn-view" onClick={() => viewDetail(s)} title="Voir les notes"><FiEye /></button>
                  {canEdit && (
                    <>
                      <button className="btn-icon btn-edit" onClick={() => handleEdit(s)} title="Modifier"><FiEdit2 /></button>
                      <button className="btn-icon btn-delete" onClick={() => handleDelete(s.id)} title="Supprimer"><FiTrash2 /></button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredStudents.length === 0 && (
          <div className="empty-state">
            <p>{search ? `Aucun résultat pour "${search}"` : 'Aucun étudiant'}</p>
            {!search && canEdit && <span>Ajoutez votre premier étudiant</span>}
          </div>
        )}
      </div>

      {/* ── Add/Edit Modal ── */}
      {showModal && canEdit && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editing ? 'Modifier' : 'Ajouter'} un étudiant</h3>
              <button className="btn-close" onClick={() => setShowModal(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Prénom</label>
                  <input value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Nom</label>
                  <input value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} required />
                </div>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date de naissance</label>
                  <input type="date" value={form.dateOfBirth} onChange={e => setForm({ ...form, dateOfBirth: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Niveau</label>
                  <select value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
                    <option value="">— Choisir —</option>
                    <option value="L1">L1</option>
                    <option value="L2">L2</option>
                    <option value="L3">L3</option>
                    <option value="M1">M1</option>
                    <option value="M2">M2</option>
                  </select>
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

      {/* ── Detail Modal ── */}
      {showDetail && (
        <div className="modal-overlay" onClick={() => setShowDetail(null)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()} style={{ maxWidth: '680px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'white', fontWeight: 700, fontSize: '1rem',
                }}>
                  {showDetail.firstName?.[0]}{showDetail.lastName?.[0]}
                </div>
                <div>
                  <h3 style={{ fontSize: '1.1rem' }}>{showDetail.firstName} {showDetail.lastName}</h3>
                  <span className="badge badge-info" style={{ fontSize: '0.7rem' }}>{showDetail.level || '—'}</span>
                </div>
              </div>
              <button className="btn-close" onClick={() => setShowDetail(null)}><FiX /></button>
            </div>

            {/* Info étudiant */}
            <div style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem',
              marginBottom: '1.25rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <FiUser size={14} style={{ color: 'var(--accent-purple)' }} />
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{showDetail.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: 'var(--bg-secondary)', borderRadius: '10px', border: '1px solid var(--border)' }}>
                <FiAward size={14} style={{ color: 'var(--accent-blue)' }} />
                <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  Moyenne : <strong style={{ color: getAverage(grades) >= 10 ? 'var(--accent-green)' : 'var(--accent-red)' }}>
                    {getAverage(grades) ? `${getAverage(grades)}/20` : '—'}
                  </strong>
                </span>
              </div>
            </div>

            {/* Tableau des notes */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <FiBook size={14} style={{ color: 'var(--accent-purple)' }} />
                Notes ({grades.length})
              </h4>
            </div>

            {grades.length > 0 ? (
              <div className="table-container" style={{ marginBottom: '1.25rem' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Cours</th>
                      <th>Note</th>
                      <th>Semestre</th>
                    </tr>
                  </thead>
                  <tbody>
                    {grades.map(g => (
                      <tr key={g.id}>
                        <td style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                          {getCourseName(g.courseId)}
                        </td>
                        <td>
                          <span className={`badge ${g.value >= 10 ? 'badge-success' : 'badge-danger'}`}>
                            {g.value}/20
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-info">{g.semester || '—'}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{
                textAlign: 'center', padding: '1.5rem',
                background: 'var(--bg-secondary)', borderRadius: '10px',
                border: '1px solid var(--border)', marginBottom: '1.25rem',
              }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Aucune note enregistrée</p>
              </div>
            )}

            {/* Formulaire ajout note — seulement pour Admin et Prof */}
            {canEdit && (
              <div style={{
                background: 'var(--bg-secondary)', borderRadius: '12px',
                border: '1px solid var(--border)', padding: '1rem',
              }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <FiPlus size={14} style={{ color: 'var(--accent-purple)' }} />
                  Ajouter une note
                </h4>
                <form onSubmit={addGrade}>
                  <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '0.75rem', alignItems: 'flex-end' }}>

                    {/* Menu déroulant Cours */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Cours</label>
                      <select
                        value={gradeForm.courseId}
                        onChange={e => setGradeForm({ ...gradeForm, courseId: e.target.value })}
                        required
                      >
                        <option value="">— Sélectionner un cours —</option>
                        {availableCourses.map(c => (
                          <option key={c.id} value={c.id}>
                            {c.name} {c.module?.name ? `(${c.module.name})` : ''}
                          </option>
                        ))}
                        {availableCourses.length === 0 && (
                          <option disabled>Aucun cours disponible</option>
                        )}
                      </select>
                    </div>

                    {/* Note */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Note /20</label>
                      <input
                        type="number" step="0.5" min="0" max="20"
                        placeholder="ex: 14.5"
                        value={gradeForm.value}
                        onChange={e => setGradeForm({ ...gradeForm, value: e.target.value })}
                        required
                      />
                    </div>

                    {/* Semestre menu déroulant */}
                    <div className="form-group" style={{ marginBottom: 0 }}>
                      <label>Semestre</label>
                      <select
                        value={gradeForm.semester}
                        onChange={e => setGradeForm({ ...gradeForm, semester: e.target.value })}
                        required
                      >
                        <option value="">— Semestre —</option>
                        {semesters.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    {/* Bouton */}
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={addingGrade}
                      style={{ alignSelf: 'flex-end' }}
                    >
                      {addingGrade ? '...' : <><FiPlus /> Ajouter</>}
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Students;