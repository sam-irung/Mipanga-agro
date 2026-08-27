// frontend/src/api/parcelles.ts

import api from './client';

interface ParcelleData {
  nom: string;
  culture: number;
  variete?: string;
  superficie: number;
  latitude?: string;
  longitude?: string;
  date_semis: string;
  date_recolte_prevue?: string;
}

export const parcellesService = {
  getAll: () => api.get('/parcelles/'),
  getOne: (id: number) => api.get(`/parcelles/${id}/`),
  create: (data: ParcelleData) => api.post('/parcelles/', data),
  update: (id: number, data: Partial<ParcelleData>) => api.put(`/parcelles/${id}/`, data),
  delete: (id: number) => api.delete(`/parcelles/${id}/`),
};