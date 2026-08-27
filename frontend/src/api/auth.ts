// frontend/src/api/auth.ts

import api from './client';

interface LoginCredentials {
  identifier: string;  // ✅ Changé de 'username' à 'identifier'
  password: string;
}

interface RegisterData {
  username: string;
  first_name: string;
  last_name: string;
  telephone: string;
  email?: string;
  province: string;
  territoire: string;
  password: string;
  password_confirm: string;
}

export const authService = {
  register: (userData: RegisterData) => api.post('/auth/register/', userData),
  login: (credentials: LoginCredentials) => api.post('/auth/login/', credentials),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data: Record<string, unknown>) => api.put('/auth/profile/', data),
  getStats: () => api.get('/auth/profile/stats/'),
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
  }
};