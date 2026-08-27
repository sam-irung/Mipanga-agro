// frontend/src/pages/SaisonAgricole.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CloudRain,
  Thermometer,
  Wind,
  Droplet,
  Sprout,
  ChevronRight,
  Loader2,
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Info,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { saisonsService } from "@/api/saisons";
import { cn } from "@/lib/utils";

// Types
interface CultureScore {
  id: number;
  culture: number;
  culture_details: {
    id: number;
    nom: string;
    emoji: string;
    description: string;
  };
  score_pluie: number;
  score_temperature: number;
  score_global: number;
  niveau: "favorable" | "attention" | "defavorable";
  details: {
    pluie: { min: number; max: number };
    temperature: { min: number; max: number; opt_min: number; opt_max: number };
    duree_cycle: { min: number; max: number };
  };
}

interface SaisonData {
  id: number;
  zone: number;
  zone_nom: string;
  nom: string;
  saison: string;
  pluie_tendance: string;
  temperature_tendance: string;
  vent_tendance: string;
  pluie_probabilite: number | null;
  niveau_confiance: string;
  source: string;
}

// Composant de tendance
const TendanceBadge = ({ tendance }: { tendance: string }) => {
  const config: Record<string, { icon: React.ReactNode; label: string; color: string }> = {
    au_dessus: {
      icon: <TrendingUp className="h-4 w-4" />,
      label: "Au-dessus",
      color: "text-red-600 bg-red-50 dark:bg-red-950/30",
    },
    en_dessous: {
      icon: <TrendingDown className="h-4 w-4" />,
      label: "En dessous",
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/30",
    },
    normal: {
      icon: <Minus className="h-4 w-4" />,
      label: "Normal",
      color: "text-gray-600 bg-gray-50 dark:bg-gray-800/50",
    },
  };

  const c = config[tendance] || config.normal;

  return (
    <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium", c.color)}>
      {c.icon}
      {c.label}
    </span>
  );
};

// Composant de carte culture
const CultureCard = ({
  culture,
  onClick,
}: {
  culture: CultureScore;
  onClick: () => void;
}) => {
  const getNiveauColor = (niveau: string) => {
    if (niveau === "favorable") return "border-green-200 bg-green-50 dark:bg-green-950/20";
    if (niveau === "attention") return "border-yellow-200 bg-yellow-50 dark:bg-yellow-950/20";
    return "border-red-200 bg-red-50 dark:bg-red-950/20";
  };

  const getNiveauLabel = (niveau: string) => {
    if (niveau === "favorable") return "🟢 Favorable";
    if (niveau === "attention") return "🟡 Avec précautions";
    return "🔴 Défavorable";
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full rounded-xl border p-4 text-left transition-all hover:shadow-md",
        getNiveauColor(culture.niveau)
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{culture.culture_details.emoji}</span>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-foreground">{culture.culture_details.nom}</p>
              <span className="text-xs text-muted-foreground">
                {getNiveauLabel(culture.niveau)}
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>Indice: {Math.round(culture.score_global)}/100</span>
              <span>•</span>
              <span>Cycle: {culture.details.duree_cycle.min}-{culture.details.duree_cycle.max}j</span>
            </div>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground" />
      </div>
    </button>
  );
};

// Modal de détails
const CultureDetailModal = ({
  culture,
  onClose,
  onCreateParcelle,
}: {
  culture: CultureScore;
  onClose: () => void;
  onCreateParcelle: () => void;
}) => {
  const getNiveauColor = (niveau: string) => {
    if (niveau === "favorable") return "text-green-600";
    if (niveau === "attention") return "text-yellow-600";
    return "text-red-600";
  };

  const getNiveauLabel = (niveau: string) => {
    if (niveau === "favorable") return "🟢 Favorable";
    if (niveau === "attention") return "🟡 Avec précautions";
    return "🔴 Défavorable";
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-card p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{culture.culture_details.emoji}</span>
            <div>
              <h3 className="text-xl font-bold text-foreground">
                {culture.culture_details.nom}
              </h3>
              <span className={cn("text-sm font-medium", getNiveauColor(culture.niveau))}>
                {getNiveauLabel(culture.niveau)}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 transition-colors hover:bg-muted"
          >
            ✕
          </button>
        </div>

        {/* Score */}
        <div className="mt-4 rounded-xl bg-muted/30 p-4 text-center">
          <p className="text-3xl font-bold text-foreground">
            {Math.round(culture.score_global)}/100
          </p>
          <p className="text-xs text-muted-foreground">Indice d'adéquation climatique</p>
        </div>

        {/* Détails des scores */}
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-xl bg-muted/30 p-3 text-center">
            <p className="text-lg font-bold text-foreground">{Math.round(culture.score_pluie)}%</p>
            <p className="text-xs text-muted-foreground">Pluie</p>
          </div>
          <div className="rounded-xl bg-muted/30 p-3 text-center">
            <p className="text-lg font-bold text-foreground">{Math.round(culture.score_temperature)}%</p>
            <p className="text-xs text-muted-foreground">Température</p>
          </div>
        </div>

        {/* Période de semis */}
        <div className="mt-4 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Calendar className="h-4 w-4 text-primary" />
            Période recommandée de semis
          </div>
          <p className="mt-1 text-sm text-foreground">
            Novembre → Décembre
          </p>
          <p className="text-xs text-muted-foreground">
            Cycle estimé: {culture.details.duree_cycle.min}-{culture.details.duree_cycle.max} jours
          </p>
        </div>

        {/* Pourquoi */}
        <div className="mt-4 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
            <Info className="h-4 w-4 text-primary" />
            Pourquoi cette culture ?
          </div>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-green-500" />
              Température compatible
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle className="h-3.5 w-3.5 text-green-500" />
              Saison suffisamment longue
            </li>
            {culture.score_pluie < 60 && (
              <li className="flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
                Risque de déficit pluviométrique
              </li>
            )}
            {culture.niveau === "attention" && (
              <li className="flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-yellow-500" />
                Conditions à surveiller
              </li>
            )}
          </ul>
        </div>

        {/* Actions */}
        <button
          onClick={onCreateParcelle}
          className="mt-4 w-full rounded-xl bg-primary py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          🌱 Créer une parcelle avec cette culture
        </button>
      </div>
    </div>
  );
};

export default function SaisonAgricole() {
  const navigate = useNavigate();
  const { user, parcelles } = useApp();
  const [loading, setLoading] = useState(true);
  const [saison, setSaison] = useState<SaisonData | null>(null);
  const [cultures, setCultures] = useState<{
    favorables: CultureScore[];
    attention: CultureScore[];
    defavorables: CultureScore[];
  }>({ favorables: [], attention: [], defavorables: [] });
  const [selectedCulture, setSelectedCulture] = useState<CultureScore | null>(null);
  const [error, setError] = useState<string | null>(null);

  // ✅ Zone dynamique - déterminée à partir des parcelles
  const getZoneId = (): number => {
    // Par défaut: Lubumbashi (zone 1)
    let zoneId = 1;

    // Si l'utilisateur a des parcelles, utiliser la première
    if (parcelles && parcelles.length > 0) {
      // TODO: Récupérer la zone à partir de la parcelle
      // Pour l'instant, on utilise la zone 1
      zoneId = 1;
    }

    return zoneId;
  };

  const zoneId = getZoneId();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [saisonRes, culturesRes] = await Promise.all([
          saisonsService.getSaisonActuelle(zoneId),
          saisonsService.getCulturesRecommandees(zoneId),
        ]);

        setSaison(saisonRes.data);
        setCultures({
          favorables: culturesRes.data.favorables || [],
          attention: culturesRes.data.attention || [],
          defavorables: culturesRes.data.defavorables || [],
        });
      } catch (err) {
        console.error("❌ Erreur chargement saison:", err);
        setError("Impossible de charger les données de la saison");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [zoneId]);

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
          onClick={() => window.location.reload()}
          className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
        >
          Réessayer
        </button>
      </div>
    );
  }

  if (!saison) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center">
        <p className="text-muted-foreground">Aucune donnée de saison disponible</p>
      </div>
    );
  }

  const userName = user?.first_name || "Agriculteur";

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </button>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
            <CloudRain className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">🌦️ Saison agricole</h1>
            <p className="text-sm text-muted-foreground">
              Bonjour {userName} · {saison.zone_nom} · {saison.nom}
            </p>
          </div>
        </div>
      </div>

      {/* Profil climatique */}
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="text-sm font-semibold text-foreground">📊 Profil climatique</h3>
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-muted/30 p-4">
            <div className="flex items-center gap-2">
              <Droplet className="h-5 w-5 text-blue-500" />
              <span className="text-sm font-medium text-foreground">Pluviométrie</span>
            </div>
            <div className="mt-2">
              <TendanceBadge tendance={saison.pluie_tendance} />
            </div>
          </div>

          <div className="rounded-xl bg-muted/30 p-4">
            <div className="flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-orange-500" />
              <span className="text-sm font-medium text-foreground">Température</span>
            </div>
            <div className="mt-2">
              <TendanceBadge tendance={saison.temperature_tendance} />
            </div>
          </div>

          <div className="rounded-xl bg-muted/30 p-4">
            <div className="flex items-center gap-2">
              <Wind className="h-5 w-5 text-gray-500" />
              <span className="text-sm font-medium text-foreground">Vent</span>
            </div>
            <div className="mt-2">
              <TendanceBadge tendance={saison.vent_tendance} />
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="rounded-full bg-muted px-2 py-0.5">
            Confiance: {saison.niveau_confiance}
          </span>
          <span>Source: {saison.source || "Open-Meteo"}</span>
        </div>
      </div>

      {/* Cultures recommandées */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-foreground">
          🌱 Cultures recommandées pour cette saison
        </h3>

        {cultures.favorables.length === 0 &&
          cultures.attention.length === 0 &&
          cultures.defavorables.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border bg-card p-8 text-center">
              <Sprout className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-sm text-muted-foreground">
                Aucune culture disponible pour cette saison
              </p>
            </div>
          )}

        {/* Favorables */}
        {cultures.favorables.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 text-xs font-medium text-green-600">
              🟢 Favorables ({cultures.favorables.length})
            </p>
            <div className="space-y-2">
              {cultures.favorables.map((c) => (
                <CultureCard
                  key={c.id}
                  culture={c}
                  onClick={() => setSelectedCulture(c)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Attention */}
        {cultures.attention.length > 0 && (
          <div className="mb-4">
            <p className="mb-2 text-xs font-medium text-yellow-600">
              🟡 Avec précautions ({cultures.attention.length})
            </p>
            <div className="space-y-2">
              {cultures.attention.map((c) => (
                <CultureCard
                  key={c.id}
                  culture={c}
                  onClick={() => setSelectedCulture(c)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Défavorables */}
        {cultures.defavorables.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium text-red-600">
              🔴 Défavorables ({cultures.defavorables.length})
            </p>
            <div className="space-y-2">
              {cultures.defavorables.map((c) => (
                <CultureCard
                  key={c.id}
                  culture={c}
                  onClick={() => setSelectedCulture(c)}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Modal Détails */}
      {selectedCulture && (
        <CultureDetailModal
          culture={selectedCulture}
          onClose={() => setSelectedCulture(null)}
          onCreateParcelle={() => {
            setSelectedCulture(null);
            navigate(`/parcelles/ajouter?culture=${selectedCulture.culture}`);
          }}
        />
      )}
    </div>
  );
}