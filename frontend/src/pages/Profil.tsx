// frontend/src/pages/Profil.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  MapPin,
  Sprout,
  TrendingUp,
  Shield,
  LogOut,
  Key,
  ChevronRight,
  Loader2,
  Settings,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { authService } from "@/api/auth";

interface ProfileStats {
  total_parcelles: number;
  surface_totale: number;
  culture_principale: string;
  etapes_total: number;
  etapes_realisees: number;
  progression: number;
  recommandations_total: number;
  recommandations_appliquees: number;
}

export default function Profil() {
  const navigate = useNavigate();
  const { user, logout } = useApp();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ProfileStats | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await authService.getStats();
        setStats(response.data);
      } catch (error) {
        console.error("❌ Erreur chargement statistiques:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (!user) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <p className="text-muted-foreground">Utilisateur non trouvé</p>
        <button
          onClick={() => navigate("/login")}
          className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Se connecter
        </button>
      </div>
    );
  }

  const getInitials = (first: string, last: string) => {
    return `${first?.charAt(0) || ""}${last?.charAt(0) || ""}`.toUpperCase() || "?";
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* En-tête */}
      <div className="flex flex-col items-center rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 text-3xl font-bold text-primary">
          {getInitials(user.first_name, user.last_name)}
        </div>
        <h2 className="mt-3 text-xl font-bold text-foreground">
          {user.first_name} {user.last_name}
        </h2>
        <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          🌾 Agriculteur
        </span>
        <button
          onClick={() => navigate("/profil/modifier")}
          className="mt-3 inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <User className="h-4 w-4" />
          Modifier le profil
        </button>
      </div>

      {/* Informations personnelles */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <User className="h-4 w-4 text-primary" />
          Informations personnelles
        </h3>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Nom</p>
            <p className="font-medium text-foreground">{user.first_name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Prénom</p>
            <p className="font-medium text-foreground">{user.last_name}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Téléphone</p>
            <p className="font-medium text-foreground">{user.telephone}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Email</p>
            <p className="font-medium text-foreground">{user.email || "Non renseigné"}</p>
          </div>
        </div>
      </div>

      {/* Localisation */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <MapPin className="h-4 w-4 text-primary" />
          Localisation
        </h3>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Province</p>
            <p className="font-medium text-foreground">{user.province}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Territoire</p>
            <p className="font-medium text-foreground">{user.territoire}</p>
          </div>
        </div>
      </div>

      {/* Statistiques agricoles */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <TrendingUp className="h-4 w-4 text-primary" />
          Statistiques agricoles
        </h3>
        {loading ? (
          <div className="flex justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : stats ? (
          <div className="mt-3 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-muted/30 p-3 text-center">
              <p className="text-2xl font-bold text-primary">{stats.total_parcelles}</p>
              <p className="text-xs text-muted-foreground">🌱 Parcelles</p>
            </div>
            <div className="rounded-xl bg-muted/30 p-3 text-center">
              <p className="text-2xl font-bold text-primary">{stats.surface_totale} ha</p>
              <p className="text-xs text-muted-foreground">📐 Surface totale</p>
            </div>
            <div className="rounded-xl bg-muted/30 p-3 text-center">
              <p className="text-2xl font-bold text-primary">{stats.culture_principale}</p>
              <p className="text-xs text-muted-foreground">🌽 Culture principale</p>
            </div>
            <div className="rounded-xl bg-muted/30 p-3 text-center">
              <p className="text-2xl font-bold text-primary">{stats.progression}%</p>
              <p className="text-xs text-muted-foreground">📈 Progression moyenne</p>
            </div>
            <div className="rounded-xl bg-muted/30 p-3 text-center">
              <p className="text-2xl font-bold text-primary">{stats.etapes_realisees}</p>
              <p className="text-xs text-muted-foreground">✅ Étapes réalisées</p>
            </div>
            <div className="rounded-xl bg-muted/30 p-3 text-center">
              <p className="text-2xl font-bold text-primary">{stats.recommandations_appliquees}</p>
              <p className="text-xs text-muted-foreground">💡 Recommandations suivies</p>
            </div>
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground py-4">
            Aucune statistique disponible
          </p>
        )}
      </div>

      {/* Paramètres */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Settings className="h-4 w-4 text-primary" />
          Paramètres
        </h3>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">Notifications dans l'application</span>
            <label className="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" className="peer sr-only" defaultChecked />
              <div className="peer h-5 w-9 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full" />
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">Alertes météo</span>
            <label className="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" className="peer sr-only" defaultChecked />
              <div className="peer h-5 w-9 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full" />
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground">Recommandations</span>
            <label className="relative inline-flex cursor-pointer items-center">
              <input type="checkbox" className="peer sr-only" defaultChecked />
              <div className="peer h-5 w-9 rounded-full bg-muted after:absolute after:left-[2px] after:top-[2px] after:h-4 after:w-4 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all peer-checked:bg-primary peer-checked:after:translate-x-full" />
            </label>
          </div>
        </div>
      </div>

      {/* Sécurité */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Shield className="h-4 w-4 text-primary" />
          Sécurité
        </h3>
        <div className="mt-3 space-y-2">
          <button className="flex w-full items-center justify-between rounded-xl border border-border px-4 py-3 text-sm transition-colors hover:bg-muted/30">
            <span className="flex items-center gap-2">
              <Key className="h-4 w-4 text-muted-foreground" />
              Changer le mot de passe
            </span>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
          <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm">
            <span className="text-muted-foreground">Dernière connexion</span>
            <span className="text-sm text-foreground">Aujourd'hui</span>
          </div>
        </div>
      </div>

      {/* À propos */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Sprout className="h-4 w-4 text-primary" />
          À propos
        </h3>
        <div className="mt-3 space-y-1 text-sm">
          <p className="font-medium text-foreground">Mipanga Agro</p>
          <p className="text-muted-foreground">Version 1.0</p>
          <p className="text-muted-foreground text-xs">
            Développé pour les agriculteurs de la RDC
          </p>
          <p className="text-muted-foreground text-xs">
            Inscrit depuis le {new Date(user.date_inscription).toLocaleDateString()}
          </p>
        </div>
      </div>

      {/* Déconnexion */}
      <button
        onClick={() => setShowConfirm(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-destructive/10 py-4 text-sm font-semibold text-destructive transition-colors hover:bg-destructive/20"
      >
        <LogOut className="h-5 w-5" />
        Déconnexion
      </button>

      {/* Modal de confirmation */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-foreground">Confirmer la déconnexion</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Êtes-vous sûr de vouloir vous déconnecter ?
            </p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  logout();
                  navigate("/login");
                }}
                className="flex-1 rounded-xl bg-destructive px-4 py-2.5 text-sm font-semibold text-destructive-foreground transition-colors hover:bg-destructive/90"
              >
                Se déconnecter
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}