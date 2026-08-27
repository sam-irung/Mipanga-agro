import { useNavigate } from "react-router-dom";
import { Plus, MapPin, CalendarDays, Sprout } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { formatDate } from "@/utils/helpers";
import { cn } from "@/lib/utils";

// Statuts possibles depuis le backend
type StatutParcelle = "planifiee" | "en_cours" | "recoltee" | "suspendue";

function statutColor(statut: StatutParcelle): string {
  switch (statut) {
    case "en_cours":
      return "bg-info/10 text-info";
    case "recoltee":
      return "bg-success/10 text-success";
    case "suspendue":
      return "bg-destructive/10 text-destructive";
    case "planifiee":
      return "bg-warning/10 text-warning";
    default:
      return "bg-muted/10 text-muted-foreground";
  }
}

function statutLabel(statut: StatutParcelle): string {
  switch (statut) {
    case "planifiee":
      return "Planifiée";
    case "en_cours":
      return "En cours";
    case "recoltee":
      return "Récoltée";
    case "suspendue":
      return "Suspendue";
    default:
      return statut;
  }
}

export default function Parcelles() {
  const navigate = useNavigate();
  const { parcelles } = useApp();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mes parcelles</h1>
          <p className="text-sm text-muted-foreground">
            {parcelles.length} parcelle{parcelles.length > 1 ? "s" : ""} enregistrée{parcelles.length > 1 ? "s" : ""}
          </p>
        </div>
        <button
          onClick={() => navigate("/parcelles/ajouter")}
          className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-95"
        >
          <Plus className="h-5 w-5" />
          <span className="hidden sm:inline">Ajouter une parcelle</span>
          <span className="sm:hidden">Ajouter</span>
        </button>
      </div>

      {/* Cards */}
      <div className="grid gap-4 sm:grid-cols-2">
        {parcelles.map((p) => {
          // Utiliser la progression du backend
          const progression = p.progression || 0;
          
          return (
            <button
              key={p.id}
              onClick={() => navigate(`/parcelles/${p.id}`)}
              className="group flex flex-col rounded-2xl border border-border bg-card p-5 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
            >
              {/* Top row */}
              <div className="mb-3 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Sprout className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-foreground">{p.nom}</h3>
                    <p className="text-xs text-muted-foreground">
                      {p.culture_details?.nom || p.culture || "Culture inconnue"}
                      {p.variete ? ` · ${p.variete}` : ""}
                    </p>
                  </div>
                </div>
                <span
                  className={cn(
                    "rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide",
                    statutColor(p.statut as StatutParcelle)
                  )}
                >
                  {statutLabel(p.statut as StatutParcelle)}
                </span>
              </div>

              {/* Info grid */}
              <div className="mb-3 grid grid-cols-3 gap-2 text-xs">
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground">Superficie</span>
                  <span className="font-semibold text-foreground">{p.superficie} ha</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground">Semis</span>
                  <span className="font-semibold text-foreground">{formatDate(p.date_semis)}</span>
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-muted-foreground">Âge</span>
                  <span className="font-semibold text-foreground">{p.age || 0} jours</span>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-3">
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Progression</span>
                  <span className="font-medium text-foreground">
                    {Math.round(progression)}%
                  </span>
                </div>
                <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-500"
                    style={{ width: `${Math.min(100, progression)}%` }}
                  />
                </div>
              </div>

              {/* Bottom row */}
              <div className="mt-auto flex items-center justify-between border-t border-border pt-3 text-xs">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {p.latitude && p.longitude 
                    ? `${Number(p.latitude).toFixed(3)}, ${Number(p.longitude).toFixed(3)}`
                    : "Position non définie"}
                </span>
                <span className="flex items-center gap-1.5 font-medium text-foreground">
                  <CalendarDays className="h-3.5 w-3.5 text-secondary" />
                  {p.statut === "recoltee" ? "✅ Récoltée" : "En cours"}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {parcelles.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-card py-16 text-center">
          <Sprout className="mb-3 h-12 w-12 text-muted-foreground" />
          <p className="text-sm font-medium text-foreground">Aucune parcelle pour le moment</p>
          <p className="mb-4 text-xs text-muted-foreground">Commencez par en ajouter une</p>
          <button
            onClick={() => navigate("/parcelles/ajouter")}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-md hover:bg-primary/90"
          >
            <Plus className="h-5 w-5" />
            Ajouter une parcelle
          </button>
        </div>
      )}
    </div>
  );
}