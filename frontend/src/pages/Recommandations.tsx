// frontend/src/pages/Recommandations.tsx

import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { 
  ArrowLeft, 
  Lightbulb, 
  CheckCircle, 
  Clock,
  AlertTriangle,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { recommandationsService } from "@/api/recommandations";

// Interface complète pour les données de l'API
interface RecommandationData {
  id: number;
  parcelle: number;
  parcelle_nom: string;
  titre: string;
  message: string;
  solution: string;
  niveau: "critique" | "important" | "conseil" | string;
  priorite?: string; // Peut être présent en alternative à niveau
  source: string;
  date: string;
  lue: boolean;
  appliquee: boolean;
}

interface StatsData {
  total: number;
  critiques: number;
  importants: number;
  conseils: number;
}

export default function Recommandations() {
  const navigate = useNavigate();
  const location = useLocation();
  const { parcelles } = useApp();
  const [recommandations, setRecommandations] = useState<RecommandationData[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [stats, setStats] = useState<StatsData>({ total: 0, critiques: 0, importants: 0, conseils: 0 });
  const [filter, setFilter] = useState<"all" | "critique" | "important" | "conseil">("all");

  const searchParams = new URLSearchParams(location.search);
  const parcelleId = searchParams.get('parcelle');
  const parcelle = parcelles.find(p => p.id === Number(parcelleId));

  // Fonction pour normaliser le niveau
  const normalizeNiveau = (niveau: string): "critique" | "important" | "conseil" => {
    const normalized = niveau?.toLowerCase() || '';
    if (normalized.includes('critique') || normalized === 'critical') return 'critique';
    if (normalized.includes('important') || normalized === 'high') return 'important';
    if (normalized.includes('conseil') || normalized === 'low' || normalized === 'info') return 'conseil';
    return 'conseil';
  };

  // Fonction pour normaliser une recommandation
  const normalizeRecommandation = (rec: Partial<RecommandationData>): RecommandationData => {
    return {
      id: rec.id || 0,
      parcelle: rec.parcelle || 0,
      parcelle_nom: rec.parcelle_nom || '',
      titre: rec.titre || '',
      message: rec.message || '',
      solution: rec.solution || '',
      niveau: normalizeNiveau(rec.niveau || rec.priorite || 'conseil'),
      source: rec.source || 'Système',
      date: rec.date || new Date().toISOString(),
      lue: rec.lue || false,
      appliquee: rec.appliquee || false,
    };
  };

  // Charger les recommandations
  const fetchRecommandations = useCallback(async () => {
    if (!parcelleId) return;

    try {
      setLoading(true);
      const [recsRes, statsRes] = await Promise.all([
        recommandationsService.getPriorisees(Number(parcelleId)),
        recommandationsService.getStats(Number(parcelleId))
      ]);
      
      // Normaliser les données reçues avec un type sécurisé
      const normalizedRecs = (recsRes.data || []).map((rec: Partial<RecommandationData>) => 
        normalizeRecommandation(rec)
      );
      
      setRecommandations(normalizedRecs);
      setStats({
        total: statsRes.data?.total || 0,
        critiques: statsRes.data?.critiques || 0,
        importants: statsRes.data?.importants || 0,
        conseils: statsRes.data?.conseils || 0,
      });
    } catch (error) {
      console.error("❌ Erreur chargement recommandations:", error);
      setRecommandations([]);
      setStats({ total: 0, critiques: 0, importants: 0, conseils: 0 });
    } finally {
      setLoading(false);
    }
  }, [parcelleId]);

  // Générer des recommandations
  const handleGenerer = async () => {
    if (!parcelleId) return;

    try {
      setGenerating(true);
      await recommandationsService.generer(Number(parcelleId));
      await fetchRecommandations();
    } catch (error) {
      console.error("❌ Erreur génération:", error);
    } finally {
      setGenerating(false);
    }
  };

  // Marquer comme lue
  const handleMarquerLue = async (id: number) => {
    try {
      await recommandationsService.marquerLue(id);
      setRecommandations(prev => 
        prev.map(r => r.id === id ? { ...r, lue: true } : r)
      );
    } catch (error) {
      console.error("❌ Erreur:", error);
    }
  };

  // Marquer comme appliquée
  const handleMarquerAppliquee = async (id: number) => {
    try {
      await recommandationsService.marquerAppliquee(id);
      setRecommandations(prev => 
        prev.map(r => r.id === id ? { ...r, lue: true, appliquee: true } : r)
      );
    } catch (error) {
      console.error("❌ Erreur:", error);
    }
  };

  useEffect(() => {
    fetchRecommandations();
  }, [fetchRecommandations]);

  // Filtrer les recommandations
  const filteredRecos = recommandations.filter(r => {
    const niveau = normalizeNiveau(r.niveau);
    return filter === "all" || niveau === filter;
  });

  // Niveaux avec couleurs - Version sécurisée
  const getNiveauConfig = (niveau: string) => {
    const normalized = normalizeNiveau(niveau);
    const configs = {
      critique: { 
        label: "🔴 Critique", 
        color: "bg-red-500/10 text-red-700 border-red-300" 
      },
      important: { 
        label: "🟠 Important", 
        color: "bg-orange-500/10 text-orange-700 border-orange-300" 
      },
      conseil: { 
        label: "🟢 Conseil", 
        color: "bg-green-500/10 text-green-700 border-green-300" 
      }
    };
    return configs[normalized] || configs.conseil;
  };

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

  return (
    <div className="space-y-6 animate-fade-in">
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
              Recommandations - {parcelle.nom}
            </h1>
            <p className="text-sm text-muted-foreground">
              {parcelle.culture_details?.nom || parcelle.culture || "Culture inconnue"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleGenerer}
              disabled={generating}
              className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
            >
              {generating ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Générer
            </button>
          </div>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-4 gap-4">
        <div className="rounded-2xl border border-border bg-card p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
          <p className="text-xs text-muted-foreground">Total</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-red-500">{stats.critiques}</p>
          <p className="text-xs text-muted-foreground">🔴 Critiques</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-orange-500">{stats.importants}</p>
          <p className="text-xs text-muted-foreground">🟠 Importants</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-4 text-center shadow-sm">
          <p className="text-2xl font-bold text-green-500">{stats.conseils}</p>
          <p className="text-xs text-muted-foreground">🟢 Conseils</p>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            filter === "all" 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          Toutes
        </button>
        <button
          onClick={() => setFilter("critique")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            filter === "critique" 
              ? "bg-red-500 text-white" 
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          🔴 Critiques
        </button>
        <button
          onClick={() => setFilter("important")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            filter === "important" 
              ? "bg-orange-500 text-white" 
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          🟠 Importants
        </button>
        <button
          onClick={() => setFilter("conseil")}
          className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
            filter === "conseil" 
              ? "bg-green-500 text-white" 
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          }`}
        >
          🟢 Conseils
        </button>
      </div>

      {/* Liste des recommandations */}
      <div className="rounded-2xl border border-border bg-card shadow-sm">
        <div className="divide-y divide-border">
          {loading ? (
            <div className="flex h-[200px] items-center justify-center">
              <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : filteredRecos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Lightbulb className="h-12 w-12 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium text-foreground">
                Aucune recommandation
              </p>
              <p className="text-xs text-muted-foreground">
                Cliquez sur "Générer" pour obtenir des conseils personnalisés.
              </p>
            </div>
          ) : (
            filteredRecos.map((rec) => {
              const config = getNiveauConfig(rec.niveau);
              const isRealise = rec.appliquee;
              const normalizedNiveau = normalizeNiveau(rec.niveau);
              
              return (
                <div
                  key={rec.id}
                  className={`p-4 transition-colors hover:bg-muted/30 ${
                    !rec.lue ? "bg-primary/5" : ""
                  } ${isRealise ? "bg-green-50 dark:bg-green-950/10" : ""}`}
                >
                  <div className="flex flex-wrap items-start gap-4">
                    {/* Icône */}
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                      {isRealise ? (
                        <CheckCircle className="h-6 w-6 text-green-500" />
                      ) : normalizedNiveau === "critique" ? (
                        <AlertTriangle className="h-6 w-6 text-red-500" />
                      ) : normalizedNiveau === "important" ? (
                        <Clock className="h-6 w-6 text-orange-500" />
                      ) : (
                        <Lightbulb className="h-6 w-6 text-green-500" />
                      )}
                    </div>

                    {/* Contenu */}
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-foreground">
                          {rec.titre || rec.message.slice(0, 50)}
                        </h3>
                        <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${config.color}`}>
                          {config.label}
                        </span>
                        {!rec.lue && (
                          <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-xs font-medium text-blue-500">
                            Nouvelle
                          </span>
                        )}
                        {isRealise && (
                          <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-500">
                            ✅ Appliquée
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-foreground">{rec.message}</p>
                      {rec.solution && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          💡 {rec.solution}
                        </p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                        <span>Source: {rec.source}</span>
                        <span>•</span>
                        <span>{new Date(rec.date).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{rec.parcelle_nom}</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2">
                      {!rec.lue && (
                        <button
                          onClick={() => handleMarquerLue(rec.id)}
                          className="rounded-full bg-blue-500/10 px-3 py-1 text-xs font-medium text-blue-500 transition-colors hover:bg-blue-500/20"
                        >
                          Marquer lue
                        </button>
                      )}
                      {!rec.appliquee && (
                        <button
                          onClick={() => handleMarquerAppliquee(rec.id)}
                          className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-medium text-green-500 transition-colors hover:bg-green-500/20"
                        >
                          ✅ Appliquer
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}