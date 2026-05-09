import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Courses from './pages/Courses';
import Attendance from './pages/Attendance';
import AiAnalysis from './pages/AiAnalysis';
import Users from './pages/Users';
import Profile from './pages/Profile';
import MyProgress from './pages/MyProgress';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />

            <Route path="students" element={
              <ProtectedRoute roles={['ADMIN', 'PROF']}>
                <Students />
              </ProtectedRoute>
            } />

            <Route path="courses" element={<Courses />} />

            <Route path="attendance" element={
              <ProtectedRoute roles={['ADMIN', 'PROF']}>
                <Attendance />
              </ProtectedRoute>
            } />

            <Route path="ai" element={
              <ProtectedRoute roles={['ADMIN', 'PROF']}>
                <AiAnalysis />
              </ProtectedRoute>
            } />

            <Route path="users" element={
              <ProtectedRoute roles={['ADMIN']}>
                <Users />
              </ProtectedRoute>
            } />

            {/* Profil — accessible à tous les rôles */}
            <Route path="profile" element={<Profile />} />

            {/* Mon Parcours — accessible uniquement aux étudiants */}
            <Route path="my-progress" element={
              <ProtectedRoute roles={['STUDENT']}>
                <MyProgress />
              </ProtectedRoute>
            } />

          </Route>

          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;