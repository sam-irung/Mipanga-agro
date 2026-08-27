import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, MapPin, CalendarDays, Sprout, Trash2, AlertTriangle } from "lucide-react";
import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { formatDate } from "@/utils/helpers";

export default function ParcelleDetail() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { parcelles, deleteParcelle } = useApp();
  const [showConfirm, setShowConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const parcelle = parcelles.find(p => p.id === Number(id));

  if (!parcelle) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Parcelle non trouvée</p>
      </div>
    );
  }

  const progression = parcelle.progression || 0;
  const age = parcelle.age || 0;

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteParcelle(parcelle.id);
      navigate("/parcelles");
    } catch (error) {
      console.error("Erreur suppression:", error);
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button
            onClick={() => navigate("/parcelles")}
            className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux parcelles
          </button>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{parcelle.nom}</h1>
            <p className="text-sm text-muted-foreground">
              {parcelle.culture_details?.nom || parcelle.culture || "Culture inconnue"}
              {parcelle.variete ? ` · ${parcelle.variete}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-primary/10 px-4 py-2 text-sm font-medium text-primary">
            {parcelle.statut === "en_cours" && "🟢 En cours"}
            {parcelle.statut === "planifiee" && "🟡 Planifiée"}
            {parcelle.statut === "recoltee" && "✅ Récoltée"}
            {parcelle.statut === "suspendue" && "⏸️ Suspendue"}
          </span>
          {/* ✅ Bouton Supprimer */}
          <button
            onClick={() => setShowConfirm(true)}
            className="rounded-full bg-destructive/10 p-2 text-destructive transition-colors hover:bg-destructive/20"
            title="Supprimer la parcelle"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Modal de confirmation */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-xl">
            <div className="flex items-center gap-3 text-destructive">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-lg font-semibold">Confirmer la suppression</h3>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Êtes-vous sûr de vouloir supprimer la parcelle{" "}
              <span className="font-semibold text-foreground">"{parcelle.nom}"</span> ?
              <br />
              Cette action est irréversible.
            </p>
            <div className="mt-4 flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-xl border border-input bg-background px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 rounded-xl bg-destructive px-4 py-2.5 text-sm font-semibold text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:opacity-50"
              >
                {isDeleting ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Superficie</p>
          <p className="text-xl font-bold text-foreground">{parcelle.superficie} ha</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Âge</p>
          <p className="text-xl font-bold text-foreground">{age} jours</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Progression</p>
          <p className="text-xl font-bold text-foreground">{Math.round(progression)}%</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs text-muted-foreground">Semis</p>
          <p className="text-xl font-bold text-foreground">{formatDate(parcelle.date_semis)}</p>
        </div>
      </div>

      {/* Progression bar */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-foreground">Progression</h3>
          <span className="text-sm font-medium text-foreground">{Math.round(progression)}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${Math.min(100, progression)}%` }}
          />
        </div>
      </div>

      {/* Localisation */}
      {parcelle.latitude && parcelle.longitude && (
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            Localisation
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Latitude: {Number(parcelle.latitude).toFixed(6)} - Longitude: {Number(parcelle.longitude).toFixed(6)}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => navigate(`/calendrier?parcelle=${parcelle.id}`)}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/90"
        >
          <CalendarDays className="h-4 w-4" />
          Voir le calendrier
        </button>
        <button
          onClick={() => navigate(`/recommandations?parcelle=${parcelle.id}`)}
          className="flex items-center gap-2 rounded-xl bg-secondary px-4 py-2.5 text-sm font-semibold text-secondary-foreground shadow-md hover:bg-secondary/90"
        >
          <Sprout className="h-4 w-4" />
          Voir les recommandations
        </button>
        {/* ✅ Bouton Supprimer alternatif */}
        <button
          onClick={() => setShowConfirm(true)}
          className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-sm font-semibold text-destructive hover:bg-destructive/20"
        >
          <Trash2 className="h-4 w-4" />
          Supprimer la parcelle
        </button>
      </div>
    </div>
  );
}