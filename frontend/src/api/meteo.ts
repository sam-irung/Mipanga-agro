// frontend/src/api/meteo.ts

import api from './client';

export const meteoService = {
  // Récupérer la météo pour une parcelle
  getMeteo: (parcelleId: number, jours: number = 7) => 
    api.get(`/meteo/?parcelle_id=${parcelleId}&jours=${jours}`),
  
  // Récupérer la météo pour une parcelle via l'URL directe
  getMeteoByParcelle: (parcelleId: number) => 
    api.get(`/meteo/parcelle/${parcelleId}/`),
};