// frontend/src/context/DashboardContext.tsx

import { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';

import { dashboardService } from '@/api';

// Types
interface DashboardData {
  resume: {
    total_parcelles: number;
    parcelles_actives: number;
    parcelles_recoltees: number;
    progression_moyenne: number;
    recommandations_non_lues: number;
  };
  parcelles: Array<{
    id: number;
    nom: string;
    culture: string;
    statut: string;
    statut_code: string;
    superficie: number;
    progression: number;
    prochaine_etape: string | null;
    age: number;
  }>;
  calendrier: {
    prochaines_etapes: Array<{
      parcelle: string;
      etape: string;
      date_prevue: string;
      jours_restants: number;
    }>;
    etapes_en_retard: number;
  };
  recommandations: Array<{
    id: number;
    parcelle: string;
    message: string;
    niveau: string;
    source: string;
    date: string;
    lue: boolean;
  }>;
  activites: Array<{
    parcelle: string;
    etape: string;
    date: string;
    commentaire: string;
  }>;
  statistiques: {
    repartition_cultures: Array<{ culture__nom: string; count: number }>;
    repartition_statuts: Array<{ statut: string; count: number }>;
    total_superficie: number;
    graphiques: {
      cultures: { labels: string[]; values: number[] };
      statuts: { labels: string[]; values: number[] };
    };
  };
  alerte_meteo: Array<{
    parcelle: string;
    type: string;
    categorie: string;
    message: string;
    niveau: string;
  }>;
  ia: {
    total_analyses: number;
    score_moyen: number;
    derniere_analyse: {
      date: string;
      score: number;
      etat: string;
      parcelle: string;
    } | null;
    evolution: number[];
    repartition_etats: Array<{ niveau_risque: string; count: number }>;
  };
}

interface DashboardContextType {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Utiliser useCallback pour mémoriser la fonction
  const fetchDashboard = useCallback(async () => {
    try {
      setLoading(true);
      console.log("🔄 Fetching dashboard...");
      const response = await dashboardService.getDashboard();
      console.log("✅ Dashboard data received:", response.data);
      setData(response.data);
      setError(null);
    } catch (err: unknown) {
      console.error('❌ Erreur dashboard:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Erreur lors du chargement du dashboard');
      }
    } finally {
      setLoading(false);
    }
  }, []); // ✅ Tableau de dépendances vide

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      fetchDashboard();
    } else {
      setLoading(false);
    }
  }, [fetchDashboard]);

  return (
    <DashboardContext.Provider value={{ data, loading, error, refetch: fetchDashboard }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = (): DashboardContextType => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};