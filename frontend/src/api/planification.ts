// frontend/src/api/planification.ts

import api from './client';

export const planificationService = {
  // Récupérer le calendrier d'une parcelle
  getCalendrier: (parcelleId: number) => 
    api.get(`/planification/?parcelle_id=${parcelleId}`),
  
  // Obtenir la prochaine étape
  getProchaineEtape: (parcelleId: number) => 
    api.get(`/planification/prochaine/?parcelle_id=${parcelleId}`),
  
  // Obtenir les statistiques
  getStats: (parcelleId: number) => 
    api.get(`/planification/stats/?parcelle_id=${parcelleId}`),
  
  // Générer le calendrier
  generer: (parcelleId: number) => 
    api.post('/planification/generer/', { parcelle_id: parcelleId }),
  
  // Régénérer le calendrier
  regenerer: (parcelleId: number) => 
    api.post('/planification/regenerer/', { parcelle_id: parcelleId }),

  // ✅ Ajuster automatiquement le calendrier
  ajuster: (parcelleId: number) => 
    api.post('/planification/ajuster/', { parcelle_id: parcelleId }),

  // ✅ Marquer une étape comme réalisée
  marquerRealisee: (parcelleId: number, etapeId: number) =>
    api.post('/planification/marquer_realisee/', { 
      parcelle_id: parcelleId, 
      etape_id: etapeId 
    }),

  // ✅ Historique des ajustements
  getHistoriqueAjustements: (parcelleId: number) =>
    api.get(`/planification/historique_ajustements/?parcelle_id=${parcelleId}`),
};