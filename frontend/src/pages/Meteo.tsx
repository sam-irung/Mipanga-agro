// frontend/src/pages/Meteo.tsx

import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  Cloud,
  CloudRain,
  Wind,
  Droplet,
  Thermometer,
  AlertTriangle,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { meteoService } from "@/api/meteo";
import { formatDate } from "@/utils/helpers";
import { cn } from "@/lib/utils";

interface PrevisionJour {
  date: string;
  temp_min: number;
  temp_max: number;
  pluie: number;
  humidite: number;
  vent: number;
}

interface MeteoData {
  aujourd_hui: PrevisionJour;
  previsions: PrevisionJour[];
  source: string;
  mise_a_jour: string;
}

// Emojis météo selon les conditions
const getWeatherEmoji = (pluie: number, temp: number) => {
  if (pluie > 30) return "🌧️";
  if (pluie > 10) return "🌦️";
  if (pluie > 0) return "⛅";
  if (temp > 35) return "☀️🔥";
  return "☀️";
};

// Couleur selon la température
const getTempColor = (temp: number) => {
  if (temp > 35) return "text-red-500";
  if (temp > 30) return "text-orange-500";
  if (temp > 25) return "text-yellow-500";
  if (temp > 20) return "text-green-500";
  return "text-blue-500";
};

export default function Meteo() {
  const navigate = useNavigate();
  const location = useLocation();
  const { parcelles } = useApp();
  const [meteo, setMeteo] = useState<MeteoData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedParcelle, setSelectedParcelle] = useState<number | null>(null);

  const searchParams = new URLSearchParams(location.search);
  const parcelleId = searchParams.get('parcelle');
  const parcelle = parcelles.find(p => p.id === Number(parcelleId));

  // Charger la météo
  const fetchMeteo = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      const response = await meteoService.getMeteo(id, 7);
      setMeteo(response.data);
      setSelectedParcelle(id);
    } catch (err) {
      console.error("❌ Erreur météo:", err);
      setError("Impossible de charger les données météo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (parcelleId) {
      fetchMeteo(Number(parcelleId));
    } else if (parcelles.length > 0) {
      fetchMeteo(parcelles[0].id);
    } else {
      setLoading(false);
      setError("Aucune parcelle trouvée");
    }
  }, [parcelleId, parcelles]);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <p className="text-destructive">{error}</p>
        <button
          onClick={() => navigate("/parcelles")}
          className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Voir mes parcelles
        </button>
      </div>
    );
  }

  if (!meteo || !meteo.aujourd_hui) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <p className="text-muted-foreground">Aucune donnée météo disponible</p>
      </div>
    );
  }

  const aujourd = meteo.aujourd_hui;

  return (
    <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">🌤 Météo agricole</h1>
            <p className="text-sm text-muted-foreground">
              {parcelle?.nom || "Parcelle sélectionnée"}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              Dernière mise à jour: {meteo.mise_a_jour}
            </span>
            <button
              onClick={() => fetchMeteo(selectedParcelle || (parcelles[0]?.id || 0))}
              className="rounded-full p-2 hover:bg-muted"
            >
              <RefreshCw className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
      </div>

      {/* Conditions actuelles */}
      <div className="rounded-2xl border border-border bg-gradient-to-br from-primary/5 to-primary/10 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-6xl">
              {getWeatherEmoji(aujourd.pluie, aujourd.temp_max)}
            </div>
            <div>
              <p className="text-3xl font-bold text-foreground">
                {aujourd.temp_max}°C
              </p>
              <p className="text-sm text-muted-foreground">
                Min: {aujourd.temp_min}°C
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            <div className="flex items-center gap-2">
              <Droplet className="h-4 w-4 text-blue-500" />
              <span className="text-muted-foreground">Humidité:</span>
              <span className="font-medium text-foreground">{aujourd.humidite}%</span>
            </div>
            <div className="flex items-center gap-2">
              <CloudRain className="h-4 w-4 text-blue-500" />
              <span className="text-muted-foreground">Pluie:</span>
              <span className="font-medium text-foreground">{aujourd.pluie} mm</span>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="h-4 w-4 text-gray-500" />
              <span className="text-muted-foreground">Vent:</span>
              <span className="font-medium text-foreground">{aujourd.vent} km/h</span>
            </div>
            <div className="flex items-center gap-2">
              <Thermometer className={cn("h-4 w-4", getTempColor(aujourd.temp_max))} />
              <span className="text-muted-foreground">Ressenti:</span>
              <span className={cn("font-medium", getTempColor(aujourd.temp_max))}>
                {Math.round(aujourd.temp_max)}°C
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Prévisions 7 jours */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">📅 Prévisions 7 jours</h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
          {meteo.previsions.map((jour, index) => {
            const isToday = index === 0;
            const jourSemaine = new Date(jour.date).toLocaleDateString('fr-FR', { weekday: 'short' });
            
            return (
              <div
                key={jour.date}
                className={`rounded-xl border p-3 text-center ${
                  isToday ? 'border-primary bg-primary/5' : 'border-border bg-card'
                }`}
              >
                <p className="text-xs font-medium text-muted-foreground">
                  {isToday ? "Aujourd'hui" : jourSemaine}
                </p>
                <p className="text-2xl my-1">{getWeatherEmoji(jour.pluie, jour.temp_max)}</p>
                <p className="text-sm font-bold text-foreground">{jour.temp_max}°</p>
                <p className="text-xs text-muted-foreground">{jour.pluie} mm</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Alertes météo */}
      {meteo.previsions.some(j => j.pluie > 30 || j.temp_max > 35) && (
        <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/20 p-5 shadow-sm">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-red-700 dark:text-red-400">
            <AlertTriangle className="h-5 w-5" />
            Alertes météo
          </h3>
          <div className="mt-2 space-y-2">
            {meteo.previsions.filter(j => j.pluie > 30).slice(0, 2).map((j) => (
              <div key={j.date} className="flex items-center justify-between rounded-xl bg-red-100/50 dark:bg-red-950/30 px-4 py-2">
                <div>
                  <p className="text-sm font-medium text-red-800 dark:text-red-300">
                    🌧️ Forte pluie prévue le {formatDate(j.date)}
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-400">
                    {j.pluie} mm attendus · Risque de lessivage des engrais
                  </p>
                </div>
              </div>
            ))}
            {meteo.previsions.filter(j => j.temp_max > 35).slice(0, 2).map((j) => (
              <div key={j.date} className="flex items-center justify-between rounded-xl bg-orange-100/50 dark:bg-orange-950/30 px-4 py-2">
                <div>
                  <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
                    ☀️ Forte chaleur prévue le {formatDate(j.date)}
                  </p>
                  <p className="text-xs text-orange-600 dark:text-orange-400">
                    {j.temp_max}°C · Prévoir une irrigation
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conseils agricoles du jour */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Cloud className="h-4 w-4 text-primary" />
          Conseils agricoles du jour
        </h3>
        <div className="mt-3 space-y-2">
          {aujourd.pluie < 5 && aujourd.vent < 15 && (
            <div className="flex items-start gap-2 rounded-xl bg-success/10 p-3">
              <span className="text-green-500">✅</span>
              <div>
                <p className="text-sm text-foreground">Conditions favorables au sarclage</p>
                <p className="text-xs text-muted-foreground">Pas de pluie importante, vent faible</p>
              </div>
            </div>
          )}
          {aujourd.pluie > 20 && (
            <div className="flex items-start gap-2 rounded-xl bg-destructive/10 p-3">
              <span className="text-red-500">❌</span>
              <div>
                <p className="text-sm text-foreground">Reporter la fertilisation</p>
                <p className="text-xs text-muted-foreground">Risque de lessivage des engrais</p>
              </div>
            </div>
          )}
          {aujourd.vent > 20 && (
            <div className="flex items-start gap-2 rounded-xl bg-destructive/10 p-3">
              <span className="text-red-500">❌</span>
              <div>
                <p className="text-sm text-foreground">Reporter le traitement phytosanitaire</p>
                <p className="text-xs text-muted-foreground">Vent trop fort</p>
              </div>
            </div>
          )}
          {aujourd.pluie < 5 && aujourd.temp_max < 30 && (
            <div className="flex items-start gap-2 rounded-xl bg-success/10 p-3">
              <span className="text-green-500">✅</span>
              <div>
                <p className="text-sm text-foreground">Bon moment pour les semis</p>
                <p className="text-xs text-muted-foreground">Température et humidité favorables</p>
              </div>
            </div>
          )}
          {aujourd.temp_max > 35 && (
            <div className="flex items-start gap-2 rounded-xl bg-warning/10 p-3">
              <span className="text-yellow-500">⚠️</span>
              <div>
                <p className="text-sm text-foreground">Chaleur excessive</p>
                <p className="text-xs text-muted-foreground">Prévoir une irrigation des cultures</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}