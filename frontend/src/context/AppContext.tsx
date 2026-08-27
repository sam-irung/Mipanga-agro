// frontend/src/context/AppContext.tsx

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { 
  authService, 
  parcellesService, 
  recommandationsService,
} from '@/api';

// Types
interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  telephone: string;
  email: string;
  province: string;
  territoire: string;
  date_inscription: string;
}

interface Parcelle {
  id: number;
  nom: string;
  culture: number;
  culture_details?: {
    id: number;
    code: string;
    nom: string;
  };
  variete: string;
  superficie: number;
  latitude: string;
  longitude: string;
  date_semis: string;
  date_recolte_prevue: string;
  statut: string;
  date_creation: string;
  agriculteur: number;
  agriculteur_nom: string;
  age: number;
  progression: number;
}

interface Recommandation {
  id: number;
  parcelle: number;
  regle: number | null;
  message: string;
  niveau: string;
  source: string;
  date: string;
  lue: boolean;
  appliquee: boolean;
  active: boolean;
}

interface RegisterData {
  username: string;
  first_name: string;
  last_name: string;
  telephone: string;
  email?: string;
  province: string;
  territoire: string;
  password: string;
  password_confirm: string;
}

interface ParcelleFormData {
  nom: string;
  culture: string;
  variete?: string;
  superficie: number;
  dateSemis: string;
  latitude?: number;
  longitude?: number;
}

interface AppContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  parcelles: Parcelle[];
  setParcelles: React.Dispatch<React.SetStateAction<Parcelle[]>>;
  recommandations: Recommandation[];
  setRecommandations: React.Dispatch<React.SetStateAction<Recommandation[]>>;
  loading: boolean;
  isAuthenticated: boolean;
  login: (identifier: string, password: string) => Promise<unknown>;
  register: (userData: RegisterData) => Promise<unknown>;
  logout: () => void;
  refreshParcelles: () => Promise<unknown>;
  refreshRecommandations: (parcelleId: number) => Promise<unknown>;
  addParcelle: (parcelleData: ParcelleFormData) => Promise<unknown>;
  dashboardVersion: number;
  incrementDashboardVersion: () => void;
  deleteParcelle: (id: number) => Promise<unknown>; // ✅ AJOUTER
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [parcelles, setParcelles] = useState<Parcelle[]>([]);
  const [recommandations, setRecommandations] = useState<Recommandation[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  const [dashboardVersion, setDashboardVersion] = useState(0);

  const incrementDashboardVersion = () => {
    setDashboardVersion(prev => prev + 1);
  };

  const loadUserData = async () => {
    try {
      setLoading(true);
      const profileRes = await authService.getProfile();
      setUser(profileRes.data);
      setIsAuthenticated(true);

      const parcellesRes = await parcellesService.getAll();
      setParcelles(parcellesRes.data);

      if (parcellesRes.data.length > 0) {
        const recosRes = await recommandationsService.getPourParcelle(parcellesRes.data[0].id);
        setRecommandations(recosRes.data);
      }
    } catch (error) {
      console.error('Erreur chargement données:', error);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      loadUserData();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (identifier: string, password: string) => {
    try {
      const response = await authService.login({ 
        identifier: identifier, 
        password: password 
      });
      const { access, refresh, user } = response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      setUser(user);
      setIsAuthenticated(true);
      await loadUserData();
      return response;
    } catch (error) {
      console.error('Erreur connexion:', error);
      throw error;
    }
  };

  const register = async (userData: RegisterData) => {
    try {
      const response = await authService.register(userData);
      const { access, refresh, user } = response.data;
      localStorage.setItem('access_token', access);
      localStorage.setItem('refresh_token', refresh);
      setUser(user);
      setIsAuthenticated(true);
      await loadUserData();
      return response;
    } catch (error) {
      console.error('Erreur inscription:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setUser(null);
    setIsAuthenticated(false);
    setParcelles([]);
    setRecommandations([]);
  };

  const refreshParcelles = async () => {
    try {
      const response = await parcellesService.getAll();
      setParcelles(response.data);
      return response;
    } catch (error) {
      console.error('Erreur refresh parcelles:', error);
      throw error;
    }
  };

  const refreshRecommandations = async (parcelleId: number) => {
    try {
      const response = await recommandationsService.getPourParcelle(parcelleId);
      setRecommandations(response.data);
      return response;
    } catch (error) {
      console.error('Erreur refresh recommandations:', error);
      throw error;
    }
  };

  const addParcelle = async (parcelleData: ParcelleFormData) => {
    try {
      let dateSemis = parcelleData.dateSemis;
      
      if (dateSemis && dateSemis.includes('/')) {
        const parts = dateSemis.split('/');
        dateSemis = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }

      let cultureId: number;
      const cultureValue = parcelleData.culture;
      
      if (typeof cultureValue === 'string') {
        const parsed = parseInt(cultureValue);
        if (!isNaN(parsed)) {
          cultureId = parsed;
        } else {
          const cultureMap: Record<string, number> = {
            'Maïs': 1,
            'Manioc': 2,
            'Haricot': 3,
            'Arachide': 4,
          };
          cultureId = cultureMap[cultureValue] || 1;
          console.log(`⚠️ Culture "${cultureValue}" convertie en ID: ${cultureId}`);
        }
      } else {
        cultureId = cultureValue as number;
      }

      const data = {
        nom: parcelleData.nom,
        culture: cultureId,
        variete: parcelleData.variete || "",
        superficie: Number(parcelleData.superficie),
        date_semis: dateSemis,
        latitude: parcelleData.latitude !== undefined && parcelleData.latitude !== null 
          ? String(Number(parcelleData.latitude).toFixed(7)) 
          : undefined,
        longitude: parcelleData.longitude !== undefined && parcelleData.longitude !== null 
          ? String(Number(parcelleData.longitude).toFixed(7)) 
          : undefined,
      };
      
      console.log("📦 Données envoyées:", data);

      const response = await parcellesService.create(data);
      await refreshParcelles();
      
      incrementDashboardVersion();
      
      return response;
    } catch (error) {
      console.error('Erreur création parcelle:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response: { data: unknown } };
        console.error('📄 Détails de l\'erreur:', axiosError.response.data);
      }
      throw error;
    }
  };

  // ✅ Fonction deleteParcelle - DÉPLACÉE À L'INTÉRIEUR DU PROVIDER
  const deleteParcelle = async (id: number) => {
    try {
      const response = await parcellesService.delete(id);
      await refreshParcelles(); // ✅ Maintenant accessible
      incrementDashboardVersion(); // ✅ Rafraîchir le Dashboard après suppression
      return response;
    } catch (error) {
      console.error('Erreur suppression parcelle:', error);
      throw error;
    }
  };

  const value: AppContextType = {
    user,
    setUser,
    parcelles,
    setParcelles,
    recommandations,
    setRecommandations,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshParcelles,
    refreshRecommandations,
    addParcelle,
    dashboardVersion,
    incrementDashboardVersion,
    deleteParcelle, // ✅ AJOUTÉ
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};