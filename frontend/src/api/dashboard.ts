// frontend/src/api/dashboard.ts

import api from './client';

export const dashboardService = {
  getDashboard: () => api.get('/dashboard/'),
};