// frontend/src/pages/Dashboard.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  MapPinned,
  CalendarClock,
  CloudRain,
  Lightbulb,
  TrendingUp,
  Loader2,
  Bell,
  User,
  Plus,
  AlertTriangle,
  CheckCircle,
  Sprout,
  Droplet,
  Wind,
  Thermometer,
  Calendar,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { useDashboard } from "@/context/DashboardContext";
import { Activity, Brain } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user, parcelles, dashboardVersion } = useApp();
  const { data: dashboardData, loading: dashboardLoading, refetch } = useDashboard();
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    refetch();
  }, [dashboardVersion, refetch]);

  // Données du Dashboard
  const parcelleCount = dashboardData?.resume?.parcelles_actives ?? parcelles.filter((p) => p.statut === "en_cours").length;
  const scoreGlobal = dashboardData?.resume?.progression_moyenne ?? Math.round(
    parcelles.reduce((sum, p) => sum + (p.progression || 0), 0) / (parcelles.length || 1)
  );

  const prochaineEtape = dashboardData?.calendrier?.prochaines_etapes?.[0];
  const alerteMeteo = dashboardData?.alerte_meteo?.[0];
  const recommandationsPrioritaires = dashboardData?.recommandations || [];
  const parcellesAvecProgression = dashboardData?.parcelles ?? parcelles;

  // Notifications fictives (à remplacer par des données réelles plus tard)
  const notifications = [
    { id: 1, message: "Pluie forte prévue demain", type: "alerte", lu: false },
    { id: 2, message: "Sarclage terminé pour Parcelle A", type: "info", lu: false },
    { id: 3, message: "Nouvelle recommandation disponible", type: "info", lu: true },
  ];

  const notificationsNonLues = notifications.filter(n => !n.lu).length;

  // Alertes critiques
  const alertesCritiques = recommandationsPrioritaires.filter(r => r.niveau === 'critique');

  if (dashboardLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ==================== HEADER ==================== */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            Bonjour {user?.first_name ?? "Sam"} 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            Bon retour sur Mipanga Agro
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative rounded-full p-2 transition-colors hover:bg-muted"
            >
              <Bell className="h-5 w-5 text-muted-foreground" />
              {notificationsNonLues > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[8px] font-bold text-destructive-foreground">
                  {notificationsNonLues}
                </span>
              )}
            </button>
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl border border-border bg-card p-3 shadow-lg z-50">
                <p className="mb-2 text-sm font-semibold text-foreground">Notifications</p>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {notifications.map(n => (
                    <div key={n.id} className={`rounded-xl p-2 text-sm ${!n.lu ? 'bg-primary/5' : ''}`}>
                      <p className="text-foreground">{n.message}</p>
                      <p className="text-xs text-muted-foreground">Il y a 2h</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          {/* Profil */}
          <button
            onClick={() => navigate("/profil")}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary"
          >
            <User className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* ==================== RÉSUMÉ (4 cartes) ==================== */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <button
          onClick={() => navigate("/parcelles")}
          className="group flex flex-col gap-1 rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition-all hover:shadow-md"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <MapPinned className="h-5 w-5 text-primary" />
          </div>
          <p className="text-2xl font-bold text-foreground">{parcelleCount}</p>
          <p className="text-xs text-muted-foreground">🌱 Parcelles actives</p>
        </button>

        <button
          onClick={() => navigate("/calendrier")}
          className="group flex flex-col gap-1 rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition-all hover:shadow-md"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary/15">
            <CalendarClock className="h-5 w-5 text-secondary" />
          </div>
          <p className="text-2xl font-bold text-foreground">
            {dashboardData?.calendrier?.prochaines_etapes?.length || 0}
          </p>
          <p className="text-xs text-muted-foreground">📅 Étapes aujourd'hui</p>
        </button>

        <button
          onClick={() => navigate("/recommandations")}
          className="group flex flex-col gap-1 rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition-all hover:shadow-md"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-destructive/10">
            <AlertTriangle className="h-5 w-5 text-destructive" />
          </div>
          <p className="text-2xl font-bold text-foreground">{alertesCritiques.length}</p>
          <p className="text-xs text-muted-foreground">⚠️ Alertes</p>
        </button>

        <div className="flex flex-col gap-1 rounded-2xl border border-border bg-card p-4 shadow-sm">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10">
            <TrendingUp className="h-5 w-5 text-success" />
          </div>
          <p className="text-2xl font-bold text-foreground">{scoreGlobal}%</p>
          <p className="text-xs text-muted-foreground">📈 Progression globale</p>
        </div>
      </div>

      {/* ==================== MÉTÉO ==================== */}
      {alerteMeteo && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-info/20">
                <CloudRain className="h-6 w-6 text-info" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">🌤 Lubumbashi</p>
                <p className="text-xs text-muted-foreground">
                  {alerteMeteo.message}
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-foreground">29°C</p>
              <p className="text-xs text-muted-foreground">Humidité: 70%</p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Droplet className="h-3 w-3" /> Pluie: 15mm</span>
            <span className="flex items-center gap-1"><Wind className="h-3 w-3" /> Vent: 12 km/h</span>
            <span className="flex items-center gap-1"><Thermometer className="h-3 w-3" /> Temp: 29°C</span>
          </div>
        </div>
      )}

      {/* ==================== ALERTES PRIORITAIRES ==================== */}
      {alertesCritiques.length > 0 && (
        <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/20 p-5 shadow-sm">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-red-700 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
            Alertes urgentes
          </h3>
          <div className="mt-2 space-y-2">
            {alertesCritiques.slice(0, 3).map((alerte) => (
              <div key={alerte.id} className="flex items-center justify-between rounded-xl bg-red-100/50 dark:bg-red-950/30 px-4 py-2">
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">
                    {alerte.message || "Alerte critique"}
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {alerte.parcelle || "Parcelle"} · {alerte.source || "Système"}
                  </p>
                </div>
                <button
                  onClick={() => navigate(`/recommandations?parcelle=${alerte.parcelle || ''}`)}
                  className="rounded-lg bg-red-200 dark:bg-red-800 px-3 py-1 text-xs font-medium text-red-800 dark:text-red-200 hover:bg-red-300"
                >
                  Voir
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ==================== PROCHAINE TÂCHE ==================== */}
      {prochaineEtape && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Calendar className="h-5 w-5 text-primary" />
            Prochaine tâche
          </h3>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">
                {prochaineEtape.parcelle} · {prochaineEtape.etape}
              </p>
              <p className="text-xs text-muted-foreground">
                {prochaineEtape.jours_restants === 0 ? "Aujourd'hui" : `Dans ${prochaineEtape.jours_restants} jours`}
              </p>
            </div>
            <button
              onClick={() => navigate(`/calendrier?parcelle=${prochaineEtape.parcelle || ''}`)}
              className="rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Marquer réalisée
            </button>
          </div>
        </div>
      )}

      {/* ==================== MES PARCELLES ==================== */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Mes parcelles</h3>
          <button
            onClick={() => navigate("/parcelles")}
            className="text-xs font-medium text-primary hover:text-primary/80"
          >
            Tout voir →
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {parcellesAvecProgression.slice(0, 4).map((p) => {
            const progression = p.progression || 0;
            return (
              <button
                key={p.id}
                onClick={() => navigate(`/parcelles/${p.id}`)}
                className="flex items-center justify-between rounded-xl border border-border bg-card p-3 text-left transition-colors hover:bg-muted/30"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{p.nom}</p>
                  <p className="text-xs text-muted-foreground">{p.culture || "Culture"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{ width: `${Math.min(100, progression)}%` }}
                    />
                  </div>
                  <span className="text-xs font-medium text-foreground">{Math.round(progression)}%</span>
                </div>
              </button>
            );
          })}
        </div>
        {parcellesAvecProgression.length === 0 && (
          <div className="rounded-xl border border-dashed border-border bg-card p-6 text-center">
            <Sprout className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">Aucune parcelle</p>
            <button
              onClick={() => navigate("/parcelles/ajouter")}
              className="mt-2 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground hover:bg-primary/90"
            >
              Créer ma première parcelle
            </button>
          </div>
        )}
      </div>

      {/* ==================== RECOMMANDATIONS ==================== */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Lightbulb className="h-4 w-4 text-secondary" />
            Recommandations
          </h3>
          <button
            onClick={() => navigate("/recommandations")}
            className="text-xs font-medium text-primary hover:text-primary/80"
          >
            Tout voir →
          </button>
        </div>
        <div className="space-y-2">
          {recommandationsPrioritaires.slice(0, 3).map((reco) => {
            let bgColor = "border-green-200 bg-green-50 dark:bg-green-950/20";
            let icon = "🟢";
            if (reco.niveau === 'critique') {
              bgColor = "border-red-200 bg-red-50 dark:bg-red-950/20";
              icon = "🔴";
            } else if (reco.niveau === 'important') {
              bgColor = "border-orange-200 bg-orange-50 dark:bg-orange-950/20";
              icon = "🟠";
            }
            return (
              <div key={reco.id} className={`rounded-xl border p-3 ${bgColor}`}>
                <p className="text-sm text-foreground">
                  <span className="mr-1">{icon}</span>
                  {reco.message || "Recommandation"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {reco.parcelle || "Parcelle"} · {reco.source || "Système"}
                </p>
              </div>
            );
          })}
          {recommandationsPrioritaires.length === 0 && (
            <div className="rounded-xl border border-border bg-card p-4 text-center">
              <CheckCircle className="mx-auto h-6 w-6 text-success" />
              <p className="mt-1 text-sm text-muted-foreground">Aucune recommandation pour le moment</p>
            </div>
          )}
        </div>
      </div>

      {/* ==================== IA - Score santé ==================== */}
      {dashboardData?.ia && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Brain className="h-4 w-4 text-primary" />
              Santé des cultures (IA)
            </h3>
            <span className="text-xs text-muted-foreground">
              {dashboardData.ia.total_analyses} analyses
            </span>
          </div>
          
          <div className="mt-3 grid grid-cols-2 gap-4">
            {/* Score santé global */}
            <div className="rounded-xl bg-primary/5 p-4 text-center">
              <p className="text-3xl font-bold text-primary">
                {dashboardData.ia.score_moyen}%
              </p>
              <p className="text-xs text-muted-foreground">Score santé moyen</p>
            </div>
            
            {/* Dernière analyse */}
            {dashboardData.ia.derniere_analyse && (
              <div className="rounded-xl bg-muted/30 p-4 text-center">
                <p className="text-2xl font-bold text-foreground">
                  {dashboardData.ia.derniere_analyse.score}%
                </p>
                <p className="text-xs text-muted-foreground">
                  {dashboardData.ia.derniere_analyse.parcelle}
                </p>
                <p className="text-[10px] text-muted-foreground">
                  {new Date(dashboardData.ia.derniere_analyse.date).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
          
          {/* Évolution */}
          {dashboardData.ia.evolution.length > 1 && (
            <div className="mt-3">
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Activity className="h-3 w-3" />
                Évolution des scores
              </div>
              <div className="mt-1 flex items-end gap-1 h-12">
                {dashboardData.ia.evolution.map((score: number, index: number) => (
                  <div
                    key={index}
                    className="flex-1 rounded-sm bg-primary transition-all"
                    style={{
                      height: `${Math.max(10, score)}%`,
                      opacity: 0.6 + (index / dashboardData.ia.evolution.length) * 0.4,
                    }}
                  />
                ))}
              </div>
            </div>
          )}
          
          <button
            onClick={() => navigate("/diagnostic")}
            className="mt-3 w-full rounded-xl border border-border py-2 text-center text-xs font-medium text-primary transition-colors hover:bg-primary/5"
          >
            Analyser une culture avec l'IA →
          </button>
        </div>
      )}




      {/* ==================== BOUTON D'ACTION RAPIDE ==================== */}
      <button
        onClick={() => navigate("/parcelles/ajouter")}
        className="fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-primary shadow-lg transition-all hover:scale-105 hover:bg-primary/90"
      >
        <Plus className="h-7 w-7 text-primary-foreground" />
      </button>
    </div>
  );
} 