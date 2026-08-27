// frontend/src/api/recommandations.ts

import api from './client';

export const recommandationsService = {
  // Générer des recommandations
  generer: (parcelleId: number) => 
    api.post('/recommandations/generer/', { parcelle_id: parcelleId }),
  
  // Récupérer les recommandations pour une parcelle
  getPourParcelle: (parcelleId: number) => 
    api.get(`/recommandations/pour_parcelle/?parcelle_id=${parcelleId}`),
  
  // ✅ Récupérer les recommandations priorisées
  getPriorisees: (parcelleId: number) => 
    api.get(`/recommandations/priorisees/?parcelle_id=${parcelleId}`),
  
  // ✅ Statistiques des recommandations
  getStats: (parcelleId: number) => 
    api.get(`/recommandations/stats/?parcelle_id=${parcelleId}`),
  
  // Récupérer l'historique
  getHistorique: (parcelleId: number) => 
    api.get(`/recommandations/historique/?parcelle_id=${parcelleId}`),
  
  // Marquer comme lue
  marquerLue: (recommandationId: number) => 
    api.post('/recommandations/marquer_lue/', { recommandation_id: recommandationId }),
  
  // Marquer comme appliquée
  marquerAppliquee: (recommandationId: number) => 
    api.post('/recommandations/marquer_appliquee/', { recommandation_id: recommandationId }),
};