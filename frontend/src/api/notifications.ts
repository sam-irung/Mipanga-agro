// frontend/src/api/notifications.ts

import api from './client';

export const notificationsService = {
  // Récupérer les notifications
  getAll: () => api.get('/notifications/'),

  // Récupérer le nombre de notifications non lues
  getNonLues: () => api.get('/notifications/non-lues/'),

  // Marquer toutes comme lues
  marquerToutesLues: () => api.post('/notifications/marquer-lues/'),
};