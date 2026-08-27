import type { DetailScore, NiveauRisque } from "@/types";
import { cn } from "@/lib/utils";
import { emojiNiveauRisque } from "@/utils/helpers";

interface RiskScoreWidgetProps {
  score: number;
  niveau: NiveauRisque;
  details?: DetailScore[];
  label?: string;
}

function couleurBarre(niveau: NiveauRisque): string {
  switch (niveau) {
    case "Faible":
      return "bg-success";
    case "Moyen":
      return "bg-warning";
    case "Élevé":
      return "bg-destructive";
  }
}

function couleurBg(niveau: NiveauRisque): string {
  switch (niveau) {
    case "Faible":
      return "bg-success/10";
    case "Moyen":
      return "bg-warning/10";
    case "Élevé":
      return "bg-destructive/10";
  }
}

export default function RiskScoreWidget({
  score,
  niveau,
  details,
  label = "Score de risque",
}: RiskScoreWidgetProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <h3 className="mb-4 text-base font-semibold text-foreground">{label}</h3>

      <div className="flex items-center gap-5">
        {/* Score circulaire */}
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
          <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              className="text-muted/30"
            />
            <circle
              cx="50"
              cy="50"
              r="42"
              fill="none"
              stroke="currentColor"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${(score / 100) * 264} 264`}
              className={cn(
                niveau === "Faible" && "text-success",
                niveau === "Moyen" && "text-warning",
                niveau === "Élevé" && "text-destructive"
              )}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-2xl font-bold text-foreground">{score}</span>
            <span className="text-[10px] text-muted-foreground">/ 100</span>
          </div>
        </div>

        {/* Niveau */}
        <div className="flex-1">
          <div
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold",
              couleurBg(niveau)
            )}
          >
            <span>{emojiNiveauRisque(niveau)}</span>
            <span
              className={cn(
                niveau === "Faible" && "text-success",
                niveau === "Moyen" && "text-warning",
                niveau === "Élevé" && "text-destructive"
              )}
            >
              Risque {niveau}
            </span>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={cn("h-full rounded-full transition-all duration-500", couleurBarre(niveau))}
              style={{ width: `${score}%` }}
            />
          </div>
        </div>
      </div>

      {details && details.length > 0 && (
        <div className="mt-5 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Détail des points
          </p>
          {details.map((d, i) => (
            <div key={i}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="text-foreground">{d.label}</span>
                <span className="font-medium text-muted-foreground">
                  {d.points}/{d.max}
                </span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-500"
                  style={{ width: `${(d.points / d.max) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
