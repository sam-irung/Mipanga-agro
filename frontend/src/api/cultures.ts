// frontend/src/api/cultures.ts

import api from './client';

export const culturesService = {
  // Récupérer toutes les cultures
  getAll: () => api.get('/cultures/'),
  
  // Récupérer une culture par ID
  getOne: (id: number) => api.get(`/cultures/${id}/`),
};