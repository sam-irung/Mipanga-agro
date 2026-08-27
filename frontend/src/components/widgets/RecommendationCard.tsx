import { Bell, Check, CheckCheck, Calendar, CloudRain, BookOpen } from "lucide-react";
import type { Recommandation } from "@/types";
import { cn } from "@/lib/utils";
import { couleurNiveauReco, emojiNiveauReco, formatDate } from "@/utils/helpers";

interface RecommendationCardProps {
  reco: Recommandation;
  onMarquerLue?: (id: number) => void;
  onAppliquer?: (id: number) => void;
  compact?: boolean;
}

function sourceIcon(source: Recommandation["source"]) {
  switch (source) {
    case "Météo":
      return <CloudRain className="h-3.5 w-3.5" />;
    case "Calendrier":
      return <Calendar className="h-3.5 w-3.5" />;
    case "Règle agronomique":
      return <BookOpen className="h-3.5 w-3.5" />;
  }
}

export default function RecommendationCard({
  reco,
  onMarquerLue,
  onAppliquer,
  compact = false,
}: RecommendationCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border bg-card p-4 shadow-sm transition-all hover:shadow-md",
        reco.statut === "Non lue" && "ring-1 ring-primary/30"
      )}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
            couleurNiveauReco(reco.niveau)
          )}
        >
          {emojiNiveauReco(reco.niveau)}
        </span>

        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                couleurNiveauReco(reco.niveau)
              )}
            >
              {reco.niveau}
            </span>
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              {sourceIcon(reco.source)}
              {reco.source}
            </span>
            <span className="text-xs text-muted-foreground">·</span>
            <span className="text-xs text-muted-foreground">{formatDate(reco.date)}</span>
          </div>

          <p className={cn("text-foreground", compact ? "text-sm" : "text-sm leading-relaxed")}>
            {reco.message}
          </p>

          {!compact && (
            <div className="mt-3 flex items-center gap-2">
              {reco.statut === "Non lue" && onMarquerLue && (
                <button
                  onClick={() => onMarquerLue(reco.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-accent px-3 py-1.5 text-xs font-medium text-accent-foreground transition-colors hover:bg-accent/80"
                >
                  <Check className="h-3.5 w-3.5" />
                  Marquer comme lue
                </button>
              )}
              {reco.statut !== "Appliquée" && onAppliquer && (
                <button
                  onClick={() => onAppliquer(reco.id)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  <CheckCheck className="h-3.5 w-3.5" />
                  Appliquer
                </button>
              )}
              {reco.statut === "Appliquée" && (
                <span className="inline-flex items-center gap-1.5 rounded-lg bg-success/10 px-3 py-1.5 text-xs font-medium text-success">
                  <CheckCheck className="h-3.5 w-3.5" />
                  Appliquée
                </span>
              )}
              {reco.statut === "Lue" && (
                <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Bell className="h-3.5 w-3.5" />
                  Lue
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
