// frontend/src/api/saisons.ts

import api from './client';

export const saisonsService = {
  // Récupérer la saison actuelle pour une zone
  getSaisonActuelle: (zoneId: number) =>
    api.get(`/saisons/actuelle/?zone_id=${zoneId}`),

  // Récupérer les cultures recommandées
  getCulturesRecommandees: (zoneId: number) =>
    api.get(`/saisons/recommandations/?zone_id=${zoneId}`),
};