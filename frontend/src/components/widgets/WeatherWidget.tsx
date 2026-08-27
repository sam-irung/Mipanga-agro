import { CloudRain, Sun, Droplets, Wind, CloudDrizzle } from "lucide-react";
import type { MeteoJour } from "@/types";
import { cn } from "@/lib/utils";

interface WeatherWidgetProps {
  meteo: MeteoJour[];
  label?: string;
  compact?: boolean;
}

function conditionIcon(condition: string) {
  if (condition.includes("forte")) return <CloudRain className="h-6 w-6 text-info" />;
  if (condition.includes("modérée")) return <CloudDrizzle className="h-6 w-6 text-info" />;
  if (condition.includes("légère")) return <CloudDrizzle className="h-6 w-6 text-info/70" />;
  if (condition.includes("Ensoleillé")) return <Sun className="h-6 w-6 text-warning" />;
  return <CloudRain className="h-6 w-6 text-info" />;
}

export default function WeatherWidget({ meteo, label = "Météo", compact = false }: WeatherWidgetProps) {
  const aujourdhui = meteo[0];
  const demain = meteo[1];

  if (compact) {
    return (
      <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4 shadow-sm">
        {conditionIcon(aujourdhui.condition)}
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground">Aujourd'hui</p>
          <p className="text-sm font-semibold text-foreground">
            {aujourdhui.temperature}°C · {aujourdhui.pluie}mm
          </p>
        </div>
        {demain && (
          <div className="text-right">
            <p className="text-xs font-medium text-muted-foreground">Demain</p>
            <p className="text-sm font-semibold text-foreground">
              {demain.temperature}°C · {demain.pluie}mm
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-foreground">{label}</h3>
        <span className="text-xs text-muted-foreground">7 jours</span>
      </div>

      <div className="mb-4 grid grid-cols-2 gap-3">
        {[aujourdhui, demain].filter(Boolean).map((jour, i) => (
          <div
            key={i}
            className={cn(
              "rounded-xl p-4",
              i === 0 ? "bg-info/10" : "bg-accent"
            )}
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">
                {i === 0 ? "Aujourd'hui" : "Demain"}
              </span>
              {conditionIcon(jour.condition)}
            </div>
            <p className="text-2xl font-bold text-foreground">
              {jour.temperature}°C
            </p>
            <div className="mt-2 space-y-1 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <CloudRain className="h-3.5 w-3.5" /> {jour.pluie} mm
              </div>
              <div className="flex items-center gap-1.5">
                <Droplets className="h-3.5 w-3.5" /> {jour.humidite}%
              </div>
              <div className="flex items-center gap-1.5">
                <Wind className="h-3.5 w-3.5" /> {jour.vent} km/h
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {meteo.slice(2).map((jour, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-1 rounded-lg p-2 text-center transition-colors hover:bg-accent"
          >
            <span className="text-[10px] font-medium text-muted-foreground">
              {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"][(i + 2) % 7]}
            </span>
            {conditionIcon(jour.condition)}
            <span className="text-xs font-semibold text-foreground">
              {jour.temperature}°
            </span>
            <span className="text-[10px] text-info">{jour.pluie}mm</span>
          </div>
        ))}
      </div>
    </div>
  );
}
