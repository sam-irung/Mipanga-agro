// frontend/src/context/NotificationContext.tsx

import { createContext, useState, useContext, useEffect, ReactNode} from 'react';
import { notificationsService } from '@/api/notifications';
import { useApp } from './AppContext';

interface Notification {
  id: number;
  titre: string;
  message: string;
  type: string;
  type_label: string;
  parcelle_nom: string | null;
  lien: string;
  lue: boolean;
  date_creation: string;
}

interface NotificationContextType {
  notifications: Notification[];
  nonLues: number;
  loading: boolean;
  refresh: () => Promise<void>;
  marquerToutesLues: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { isAuthenticated } = useApp();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [nonLues, setNonLues] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    try {
      setLoading(true);
      console.log("🔄 Chargement des notifications...");
      const [notifsRes, nonLuesRes] = await Promise.all([
        notificationsService.getAll(),
        notificationsService.getNonLues(),
      ]);
      console.log("✅ Notifications reçues:", notifsRes.data.length);
      setNotifications(notifsRes.data || []);
      setNonLues(nonLuesRes.data?.total || 0);
    } catch (error) {
      console.error("❌ Erreur chargement notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const marquerToutesLues = async () => {
    try {
      await notificationsService.marquerToutesLues();
      await refresh();
    } catch (error) {
      console.error('❌ Erreur marquage lues:', error);
    }
  };

  useEffect(() => {
    // ✅ Vérifier l'authentification à chaque changement
    if (isAuthenticated) {
      refresh();
    } else {
      setLoading(false);
      setNotifications([]);
      setNonLues(0);
    }

    // ✅ Rafraîchir toutes les 5 minutes si authentifié
    const interval = setInterval(() => {
      if (isAuthenticated) {
        refresh();
      }
    }, 300000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  return (
    <NotificationContext.Provider value={{ notifications, nonLues, loading, refresh, marquerToutesLues }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};