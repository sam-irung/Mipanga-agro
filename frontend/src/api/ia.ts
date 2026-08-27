// frontend/src/api/ia.ts

import api from './client';

interface Message {
  role: "user" | "assistant";
  content: string;
}

export const iaService = {
  // Analyser une parcelle avec l'IA
  analyserParcelle: (parcelleId: number) => 
    api.get(`/ia/analyser/?parcelle_id=${parcelleId}`),
  
  // Analyser une image de plante
  analyserImage: (formData: FormData) => 
    api.post('/ia/analyser-image/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  // Récupérer l'historique des analyses
  getHistorique: (parcelleId: number) => 
    api.get(`/ia/historique/?parcelle_id=${parcelleId}`),

  // Assistant IA conversationnel
  chat: (data: { parcelle_id: number; question: string; historique?: Message[] }) =>
    api.post('/ia/chat/', data),
};