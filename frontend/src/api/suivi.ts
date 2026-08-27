// frontend/src/api/suivi.ts

import api from './client';

export const suiviService = {
  // Marquer une étape comme réalisée
  marquerEtape: (
    parcelleId: number, 
    etapeId: number, 
    commentaire: string = '', 
    latitude: number | null = null, 
    longitude: number | null = null
  ) =>
    api.post('/suivi/actions/marquer/', {
      parcelle_id: parcelleId,
      etape_id: etapeId,
      commentaire,
      latitude,
      longitude
    }),
  
  // Récupérer l'historique
  getHistorique: (parcelleId: number) => 
    api.get(`/suivi/actions/historique/?parcelle_id=${parcelleId}`),
  
  // Récupérer les statistiques
  getStats: (parcelleId: number) => 
    api.get(`/suivi/actions/stats/?parcelle_id=${parcelleId}`),
  
  // Ajouter une note
  ajouterNote: (data: {
    parcelle: number;
    type: string;
    titre: string;
    contenu: string;
    image?: File;
  }) => api.post('/suivi/notes/', data),
  
  // Récupérer les notes
  getNotes: (parcelleId: number, type: string | null = null) => {
    let url = `/suivi/notes/pour_parcelle/?parcelle_id=${parcelleId}`;
    if (type) url += `&type=${type}`;
    return api.get(url);
  },
};