// frontend/src/pages/Calendrier.tsx

import { useNavigate, useLocation } from "react-router-dom";
import { 
  ArrowLeft, 
  CalendarCheck, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Sparkles,
  History,
  RefreshCw,
  AlertTriangle
} from "lucide-react";
import { useEffect, useState, useCallback } from "react";
import { useApp } from "@/context/AppContext";
import { planificationService } from "@/api/planification";
import { formatDate } from "@/utils/helpers";

interface EtapeCalendrier {
  id: number;
  etape: number;
  etape_details: {
    id: number;
    nom: string;
    jour_relatif: number;
    type_etape: string;
    description: string;
  };
  date_prevue: string;
  date_originale?: string;
  date_realisation: string | null;
  realise: boolean;
  statut: "a_venir" | "en_retard" | "realise" | "reporte";
  report_count?: number;
  est_ajustee?: boolean;
  raison_report?: string;
}

export default function Calendrier() {
  const navigate = useNavigate();
  const location = useLocation();
  const { parcelles } = useApp();
  const [etapes, setEtapes] = useState<EtapeCalendrier[]>([]);
  const [loading, setLoading] = useState(true);
  const [ajustementLoading, setAjustementLoading] = useState(false);
  const [showHistorique, setShowHistorique] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const searchParams = new URLSearchParams(location.search);
  const parcelleId = searchParams.get('parcelle');
  const parcelle = parcelles.find(p => p.id === Number(parcelleId));

  // Fonction pour afficher un toast
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  // Charger le calendrier
  const fetchCalendrier = useCallback(async () => {
    if (!parcelleId) {
      setError("Aucune parcelle sélectionnée");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const response = await planificationService.getCalendrier(Number(parcelleId));
      console.log("📅 Calendrier reçu:", response.data);
      
      if (Array.isArray(response.data)) {
        setEtapes(response.data);
      } else {
        setEtapes([]);
        console.warn("⚠️ Les données du calendrier ne sont pas un tableau:", response.data);
      }
      setError(null);
    } catch (err) {
      console.error("❌ Erreur chargement calendrier:", err);
      setError("Impossible de charger le calendrier");
    } finally {
      setLoading(false);
    }
  }, [parcelleId]);

  useEffect(() => {
    fetchCalendrier();
  }, [fetchCalendrier]);

  // Générer le calendrier
  const handleGenerer = async () => {
    if (!parcelle) return;
    try {
      setLoading(true);
      await planificationService.generer(parcelle.id);
      showToast("Calendrier généré avec succès !", "success");
      await fetchCalendrier();
    } catch (err) {
      console.error("Erreur génération:", err);
      showToast("Erreur lors de la génération du calendrier", "error");
    } finally {
      setLoading(false);
    }
  };

  // Ajustement automatique
  const handleAjustement = async () => {
    if (!parcelle) return;
    try {
      setAjustementLoading(true);
      const response = await planificationService.ajuster(parcelle.id);
      console.log("🔧 Ajustements effectués:", response.data);
      
      const ajustements = response.data.ajustements || {};
      const totalAjustements = (ajustements.ajustements_meteo?.length || 0) + (ajustements.ajustements_retard?.length || 0);
      
      if (totalAjustements > 0) {
        showToast(`${totalAjustements} ajustement(s) effectués`, "success");
        await fetchCalendrier();
      } else {
        showToast("Aucun ajustement nécessaire", "info");
      }
    } catch (err) {
      console.error("❌ Erreur ajustement:", err);
      showToast("Erreur lors de l'ajustement", "error");
    } finally {
      setAjustementLoading(false);
    }
  };

  // Marquer une étape comme réalisée
  const handleMarquerRealisee = async (etapeId: number) => {
    if (!parcelle) return;
    try {
      await planificationService.marquerRealisee(parcelle.id, etapeId);
      showToast("Étape marquée comme réalisée ✅", "success");
      await fetchCalendrier();
    } catch (err) {
      console.error("❌ Erreur:", err);
      showToast("Erreur lors du marquage", "error");
    }
  };

  // Voir l'historique des ajustements
  const handleVoirHistorique = async () => {
    if (!parcelle) return;
    try {
      const response = await planificationService.getHistoriqueAjustements(parcelle.id);
      console.log("📜 Historique:", response.data);
      if (response.data.length === 0) {
        showToast("Aucun ajustement effectué", "info");
      } else {
        showToast(`${response.data.length} ajustement(s) dans l'historique`, "info");
        setShowHistorique(!showHistorique);
      }
    } catch (err) {
      console.error("❌ Erreur:", err);
      showToast("Erreur lors du chargement de l'historique", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="mt-4 text-sm text-muted-foreground">Chargement du calendrier...</p>
        </div>
      </div>
    );
  }

  if (!parcelle) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <p className="text-muted-foreground">Parcelle non trouvée</p>
        <button
          onClick={() => navigate("/parcelles")}
          className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Voir mes parcelles
        </button>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <p className="text-destructive">{error}</p>
        <button
          onClick={() => navigate(`/parcelles/${parcelle.id}`)}
          className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Retour à la parcelle
        </button>
      </div>
    );
  }

  const etapesList = Array.isArray(etapes) ? etapes : [];

  // Statistiques
  const total = etapesList.length;
  const realisees = etapesList.filter(e => e.statut === 'realise' || e.realise).length;
  const enRetard = etapesList.filter(e => e.statut === 'en_retard').length;
  const reportees = etapesList.filter(e => e.statut === 'reporte' || e.est_ajustee).length;
  const progression = total > 0 ? Math.round((realisees / total) * 100) : 0;

  // Toast
  const ToastComponent = () => {
    if (!toast) return null;
    const colors = {
      success: 'bg-green-500',
      error: 'bg-red-500',
      info: 'bg-blue-500'
    };
    return (
      <div className={`fixed bottom-4 right-4 z-50 rounded-xl ${colors[toast.type]} px-6 py-3 text-white shadow-lg`}>
        {toast.message}
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Toast */}
      <ToastComponent />

      {/* Header */}
      <div>
        <button
          onClick={() => navigate(`/parcelles/${parcelle.id}`)}
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour à la parcelle
        </button>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              Calendrier - {parcelle.nom}
            </h1>
            <p className="text-sm text-muted-foreground">
              {parcelle.culture_details?.nom || parcelle.culture || "Culture inconnue"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleAjustement}
              disabled={ajustementLoading || etapesList.length === 0}
              className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-2 text-sm font-semibold text-secondary-foreground transition-colors hover:bg-secondary/80 disabled:opacity-50"
            >
              {ajustementLoading ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Ajuster
            </button>
            <button
              onClick={handleVoirHistorique}
              className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm font-semibold text-muted-foreground transition-colors hover:bg-muted"
            >
              <History className="h-4 w-4" />
              Historique
            </button>
            <span className="rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
              {progression}% complété
            </span>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-foreground">{total}</p>
          <p className="text-xs text-muted-foreground">Total étapes</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-success">{realisees}</p>
          <p className="text-xs text-muted-foreground">Réalisées</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-destructive">{enRetard}</p>
          <p className="text-xs text-muted-foreground">En retard</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-warning">{reportees}</p>
          <p className="text-xs text-muted-foreground">Reportées</p>
        </div>
      </div>

      {/* Liste des étapes */}
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="divide-y divide-border">
          {etapesList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CalendarCheck className="h-12 w-12 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium text-foreground">Aucune étape</p>
              <p className="text-xs text-muted-foreground">
                Le calendrier n'a pas encore été généré pour cette parcelle.
              </p>
              <button
                onClick={handleGenerer}
                className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Générer le calendrier
              </button>
            </div>
          ) : (
            etapesList.map((etape) => {
              const isRealise = etape.statut === 'realise' || etape.realise;
              const isEnRetard = etape.statut === 'en_retard';
              const isReportee = etape.statut === 'reporte' || etape.est_ajustee;
              
              let bgColor = "";
              if (isRealise) bgColor = "bg-success/5";
              else if (isEnRetard) bgColor = "bg-destructive/5";
              else if (isReportee) bgColor = "bg-warning/5";
              
              return (
                <div
                  key={etape.id}
                  className={`flex flex-wrap items-center gap-4 p-4 transition-colors hover:bg-muted/30 ${bgColor}`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                    {isRealise ? (
                      <CheckCircle className="h-6 w-6 text-success" />
                    ) : isEnRetard ? (
                      <AlertCircle className="h-6 w-6 text-destructive" />
                    ) : isReportee ? (
                      <AlertTriangle className="h-6 w-6 text-warning" />
                    ) : (
                      <Clock className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>

                  <div className="flex-1 min-w-[200px]">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground">
                        {etape.etape_details?.nom || `Étape ${etape.id}`}
                      </p>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        J+{etape.etape_details?.jour_relatif || 0}
                      </span>
                      {etape.etape_details?.type_etape && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                          {etape.etape_details.type_etape}
                        </span>
                      )}
                      {etape.est_ajustee && (
                        <span className="rounded-full bg-warning/10 px-2 py-0.5 text-xs text-warning">
                          ⚡ Ajustée
                        </span>
                      )}
                      {etape.report_count && etape.report_count > 0 && (
                        <span className="rounded-full bg-destructive/10 px-2 py-0.5 text-xs text-destructive">
                          Reportée {etape.report_count}x
                        </span>
                      )}
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                      <span>Prévue le {formatDate(etape.date_prevue)}</span>
                      {etape.date_originale && etape.date_originale !== etape.date_prevue && (
                        <span className="text-muted-foreground line-through">
                          (initialement {formatDate(etape.date_originale)})
                        </span>
                      )}
                      {etape.date_realisation && (
                        <span className="text-success">
                          ✓ Réalisée le {formatDate(etape.date_realisation)}
                        </span>
                      )}
                      {isEnRetard && (
                        <span className="text-destructive font-medium">⚠️ En retard</span>
                      )}
                      {etape.raison_report && (
                        <span className="text-muted-foreground text-[10px]">
                          📝 {etape.raison_report}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {!isRealise && (
                      <button
                        onClick={() => handleMarquerRealisee(etape.id)}
                        className="rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
                      >
                        ✅ Marquer réalisée
                      </button>
                    )}
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                      isRealise ? "bg-success/10 text-success" :
                      isEnRetard ? "bg-destructive/10 text-destructive" :
                      isReportee ? "bg-warning/10 text-warning" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      {isRealise ? "Réalisée" :
                       isEnRetard ? "En retard" :
                       isReportee ? "Reportée" :
                       "À venir"}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Légende */}
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-4 text-xs">
        <span className="font-medium text-foreground">Légende :</span>
        <span className="flex items-center gap-1 text-muted-foreground">
          <CheckCircle className="h-4 w-4 text-success" /> Réalisée
        </span>
        <span className="flex items-center gap-1 text-muted-foreground">
          <Clock className="h-4 w-4 text-muted-foreground" /> À venir
        </span>
        <span className="flex items-center gap-1 text-muted-foreground">
          <AlertCircle className="h-4 w-4 text-destructive" /> En retard
        </span>
        <span className="flex items-center gap-1 text-muted-foreground">
          <AlertTriangle className="h-4 w-4 text-warning" /> Reportée/Ajustée
        </span>
        <span className="flex items-center gap-1 text-muted-foreground">
          <Sparkles className="h-4 w-4 text-secondary" /> Ajustement automatique disponible
        </span>
      </div>
    </div>
  );
}