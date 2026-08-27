// frontend/src/hooks/useZone.ts

import { useApp } from "@/context/AppContext";

export const useZone = () => {
  const { parcelles } = useApp(); // ✅ Supprimé 'user' inutilisé

  // Récupérer la zone à partir des parcelles
  const getZone = () => {
    // Par défaut : zone 1 (Lubumbashi)
    let zoneId = 1;

    // Si l'utilisateur a des parcelles, utiliser la première
    if (parcelles && parcelles.length > 0) {
      // TODO: Récupérer la zone à partir de la parcelle
      // Pour l'instant, on utilise la zone par défaut
      zoneId = 1;
    }

    return zoneId;
  };

  return { zoneId: getZone() };
};