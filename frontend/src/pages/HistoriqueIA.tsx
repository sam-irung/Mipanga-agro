// frontend/src/pages/HistoriqueIA.tsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Calendar, Image, Loader2, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils"; // ✅ Ajout de cn
import { useApp } from "@/context/AppContext";
import { iaService } from "@/api/ia";

// ✅ Types explicites
interface AnalyseResultat {
  etat: string;
  maladie?: string;
  carence?: string;
  ravageur?: string;
  confiance?: number;
  score_sante?: number;
  description?: string;
  conseil?: string;
  actions_recommandees?: string[];
}

interface Analyse {
  id: number;
  date: string;
  image: string;
  resultat: AnalyseResultat;
  score_sante: number;
  niveau_risque: string;
  conseils: string;
  parcelle: string;
  parcelle_id: number;
}

interface Statistiques {
  total: number;
  score_moyen: number;
  repartition_etats: Array<{ niveau_risque: string; count: number }>;
}

export default function HistoriqueIA() {
  const navigate = useNavigate();
  const { parcelles } = useApp();
  const [selectedParcelle, setSelectedParcelle] = useState<number | null>(null);
  const [analyses, setAnalyses] = useState<Analyse[]>([]);
  const [stats, setStats] = useState<Statistiques | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistorique = async () => {
      if (!selectedParcelle) return;
      
      try {
        setLoading(true);
        const response = await iaService.getHistorique(selectedParcelle);
        setAnalyses(response.data.analyses || []);
        setStats(response.data.statistiques);
      } catch (error) {
        console.error("❌ Erreur historique:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistorique();
  }, [selectedParcelle]);

  // Auto-sélectionner la première parcelle
  useEffect(() => {
    if (parcelles.length > 0 && !selectedParcelle) {
      setSelectedParcelle(parcelles[0].id);
    }
  }, [parcelles, selectedParcelle]);

  const getEtatColor = (etat: string) => {
    if (etat === "sain" || etat === "bon") return "text-green-500";
    if (etat === "anormal" || etat === "moyen") return "text-yellow-500";
    return "text-red-500";
  };

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
            <Calendar className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">📊 Historique IA</h1>
            <p className="text-sm text-muted-foreground">
              Suivez l'évolution de vos cultures dans le temps
            </p>
          </div>
        </div>
      </div>

      {/* Sélection parcelle */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
        <label className="text-sm font-medium text-foreground">Parcelle</label>
        <select
          value={selectedParcelle || ""}
          onChange={(e) => setSelectedParcelle(Number(e.target.value))}
          className="mt-1.5 h-11 w-full rounded-xl border border-input bg-background px-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        >
          <option value="">Sélectionner une parcelle</option>
          {parcelles.map((p) => (
            <option key={p.id} value={p.id}>
              {p.nom} - {p.culture_details?.nom || "Culture inconnue"}
            </option>
          ))}
        </select>
      </div>

      {/* Statistiques */}
      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="rounded-2xl border border-border bg-card p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-foreground">{stats.total}</p>
            <p className="text-xs text-muted-foreground">Total analyses</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-primary">{stats.score_moyen}%</p>
            <p className="text-xs text-muted-foreground">Score moyen</p>
          </div>
          <div className="rounded-2xl border border-border bg-card p-4 text-center shadow-sm">
            <p className="text-2xl font-bold text-foreground">
              {stats.repartition_etats?.length || 0}
            </p>
            <p className="text-xs text-muted-foreground">États différents</p>
          </div>
        </div>
      )}

      {/* Liste des analyses */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : analyses.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <Image className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium text-foreground">Aucune analyse</p>
          <p className="text-xs text-muted-foreground">
            Lancez une première analyse IA depuis le Diagnostic
          </p>
          <button
            onClick={() => navigate("/diagnostic")}
            className="mt-4 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Analyser une culture
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {analyses.map((analyse, index) => (
            <div
              key={analyse.id}
              className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-colors hover:bg-muted/30"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    {index === 0 ? (
                      <TrendingUp className="h-6 w-6 text-green-500" />
                    ) : analyse.score_sante > (analyses[index-1]?.score_sante || 0) ? (
                      <TrendingUp className="h-6 w-6 text-green-500" />
                    ) : (
                      <TrendingDown className="h-6 w-6 text-red-500" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-foreground">
                      {new Date(analyse.date).toLocaleDateString()} à {new Date(analyse.date).toLocaleTimeString()}
                    </p>
                    <p className="text-sm text-muted-foreground">{analyse.parcelle}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-foreground">{analyse.score_sante}%</p>
                  <p className={cn("text-xs font-medium", getEtatColor(analyse.niveau_risque))}>
                    {analyse.niveau_risque === "sain" || analyse.niveau_risque === "bon" ? "🟢 Sain" :
                     analyse.niveau_risque === "anormal" || analyse.niveau_risque === "moyen" ? "🟡 Attention" : "🔴 Critique"}
                  </p>
                </div>
              </div>
              {analyse.conseils && (
                <p className="mt-2 text-sm text-muted-foreground">
                  💡 {analyse.conseils.slice(0, 100)}...
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}