import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Auth API ──
export const authAPI = {
  login: (data) => api.post('/api/auth/login', data),
  register: (data) => api.post('/api/auth/register', data),
};

// ── Users API ──
export const usersAPI = {
  getAll: () => api.get('/api/users'),
  getById: (id) => api.get(`/api/users/${id}`),
  update: (id, data) => api.put(`/api/users/${id}`, data),
  delete: (id) => api.delete(`/api/users/${id}`),
};

// ── Students API ──
export const studentsAPI = {
  getAll: () => api.get('/api/students'),
  getById: (id) => api.get(`/api/students/${id}`),
  create: (data) => api.post('/api/students', data),
  update: (id, data) => api.put(`/api/students/${id}`, data),
  delete: (id) => api.delete(`/api/students/${id}`),
  getGrades: (id) => api.get(`/api/students/${id}/grades`),
  addGrade: (id, data) => api.post(`/api/students/${id}/grades`, data),
  getAverage: (id) => api.get(`/api/students/${id}/average`),
};

// ── Courses API ──
export const coursesAPI = {
  getAll: () => api.get('/api/courses'),
  getById: (id) => api.get(`/api/courses/${id}`),
  create: (data) => api.post('/api/courses', data),
  update: (id, data) => api.put(`/api/courses/${id}`, data),
  delete: (id) => api.delete(`/api/courses/${id}`),
  getByProfessor: (profId) => api.get(`/api/courses/professor/${profId}`),
};

// ── Modules API ──
export const modulesAPI = {
  getAll: () => api.get('/api/modules'),
  create: (data) => api.post('/api/modules', data),
  delete: (id) => api.delete(`/api/modules/${id}`),
};

// ── Attendance API ──
export const attendanceAPI = {
  record: (data) => api.post('/api/attendance', data),
  getByStudent: (studentId) => api.get(`/api/attendance/student/${studentId}`),
  getByCourse: (courseId) => api.get(`/api/attendance/course/${courseId}`),
  getStudentStats: (studentId) => api.get(`/api/attendance/student/${studentId}/stats`),
  update: (id, data) => api.put(`/api/attendance/${id}`, data),
};

// ── AI API ──
export const aiAPI = {
  analyzeAll: () => api.get('/api/ai/risk-analysis'),
  analyzeStudent: (id) => api.get(`/api/ai/risk-analysis/${id}`),
  getAlerts: () => api.get('/api/ai/alerts'),
  getDashboard: () => api.get('/api/ai/dashboard'),
};

export default api;
