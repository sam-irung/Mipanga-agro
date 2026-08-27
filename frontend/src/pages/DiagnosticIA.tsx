// frontend/src/pages/DiagnosticIA.tsx

import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  Image,
  Loader2,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Leaf,
  ArrowLeft,
  Sparkles,
  Shield,
  Droplet,
  Bug,
  Sprout,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { iaService } from "@/api/ia";
import { cn } from "@/lib/utils";

// Types pour l'erreur Axios
interface AxiosError {
  response?: {
    data?: {
      error?: string;
    };
  };
}

interface AnalyseResultat {
  etat: string;
  maladie: string;
  carence: string;
  ravageur: string;
  confiance: number;
  score_sante: number;
  description: string;
  conseil: string;
  actions_recommandees: string[];
}

export default function DiagnosticIA() {
  const navigate = useNavigate();
  const { parcelles } = useApp();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [selectedParcelle, setSelectedParcelle] = useState<number | null>(null);
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resultat, setResultat] = useState<AnalyseResultat | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Gestion du drag and drop
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        handleFile(file);
      } else {
        setError("Veuillez déposer une image uniquement");
      }
    }
  };

  const handleFile = (file: File) => {
    setImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setError(null);
    setResultat(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleAnalyser = async () => {
    if (!image) {
      setError("Veuillez sélectionner une image");
      return;
    }

    if (!selectedParcelle) {
      setError("Veuillez sélectionner une parcelle");
      return;
    }

    setLoading(true);
    setError(null);
    setResultat(null);

    try {
      const formData = new FormData();
      formData.append('image', image);
      formData.append('parcelle_id', String(selectedParcelle));

      const response = await iaService.analyserImage(formData);
      
      if (response.data?.resultat) {
        setResultat(response.data.resultat);
      } else {
        setError("L'analyse n'a pas retourné de résultat");
      }
    } catch (err) {
      console.error("❌ Erreur analyse:", err);
      const axiosError = err as AxiosError;
      setError(axiosError.response?.data?.error || "Erreur lors de l'analyse de l'image");
    } finally {
      setLoading(false);
    }
    
  };

  const resetAnalyse = () => {
    setImage(null);
    setImagePreview(null);
    setResultat(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Fonction pour déterminer l'icône de l'état
  const getEtatIcon = (etat: string) => {
    if (etat === "sain" || etat === "bon") {
      return <CheckCircle className="h-6 w-6 text-green-500" />;
    } else if (etat === "anormal" || etat === "moyen") {
      return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
    }
    return <XCircle className="h-6 w-6 text-red-500" />;
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
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">🧠 Diagnostic intelligent</h1>
            <p className="text-sm text-muted-foreground">
              Analysez vos cultures avec l'IA en quelques secondes
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

      {/* Upload image */}
      <div
        className={cn(
          "rounded-2xl border-2 border-dashed p-8 text-center transition-colors",
          dragActive ? "border-primary bg-primary/5" : "border-border bg-card",
          imagePreview ? "border-solid" : ""
        )}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        {imagePreview ? (
          <div className="space-y-4">
            <div className="relative mx-auto max-w-md">
              <img
                src={imagePreview}
                alt="Aperçu de la plante"
                className="max-h-64 w-full rounded-xl object-contain border border-border"
              />
              <button
                onClick={resetAnalyse}
                className="absolute -right-2 -top-2 rounded-full bg-destructive p-1.5 text-destructive-foreground hover:bg-destructive/90"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              {image?.name} ({(image?.size && (image.size / 1024).toFixed(0)) || "?"} KB)
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="rounded-full bg-primary/10 p-4">
                <Upload className="h-8 w-8 text-primary" />
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">
                Glissez votre image ici
              </p>
              <p className="text-xs text-muted-foreground">
                ou cliquez sur le bouton pour choisir un fichier
              </p>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
            >
              <Image className="h-4 w-4" />
              Choisir une image
            </button>
            <p className="text-xs text-muted-foreground">
              Formats : JPG, PNG, WEBP (max 5 MB)
            </p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* Actions */}
      {image && (
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleAnalyser}
            disabled={loading || !selectedParcelle}
            className="flex items-center gap-2 rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 disabled:opacity-50"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Sparkles className="h-5 w-5" />
            )}
            Analyser avec l'IA
          </button>
          <button
            onClick={resetAnalyse}
            className="rounded-xl border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-muted/30"
          >
            Changer d'image
          </button>
        </div>
      )}

      {/* Erreur */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 dark:bg-red-950/20 p-5">
          <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Résultat */}
      {loading && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-12 shadow-sm">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-sm font-medium text-foreground">Analyse en cours...</p>
          <p className="text-xs text-muted-foreground">
            L'IA étudie votre plante avec précision
          </p>
        </div>
      )}

      {resultat && !loading && (
        <div className="space-y-6 animate-fade-in">
          {/* Résumé */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Sprout className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-foreground">Diagnostic complet</h3>
                <p className="text-xs text-muted-foreground">
                  Analyse basée sur {resultat.confiance}% de confiance
                </p>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3">
              <div className="rounded-xl bg-muted/30 p-3 text-center">
                <p className="text-2xl font-bold text-foreground">{resultat.score_sante}%</p>
                <p className="text-xs text-muted-foreground">Score santé</p>
              </div>
              <div className="rounded-xl bg-muted/30 p-3 text-center">
                <p className="text-2xl font-bold">{resultat.confiance}%</p>
                <p className="text-xs text-muted-foreground">Confiance</p>
              </div>
              <div className="rounded-xl bg-muted/30 p-3 text-center col-span-2 sm:col-span-1">
                <div className="flex items-center justify-center gap-1">
                  {getEtatIcon(resultat.etat)}
                  <span className="text-sm font-medium text-foreground">
                    {resultat.etat === "sain" || resultat.etat === "bon" ? "Sain" :
                     resultat.etat === "anormal" || resultat.etat === "moyen" ? "Attention" : "Critique"}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">État général</p>
              </div>
            </div>
          </div>

          {/* Détails */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                Maladie
              </div>
              <p className="mt-1 text-sm">{resultat.maladie || "Aucune détectée"}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Droplet className="h-4 w-4 text-blue-500" />
                Carence
              </div>
              <p className="mt-1 text-sm">{resultat.carence || "Aucune détectée"}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Bug className="h-4 w-4 text-red-500" />
                Ravageurs
              </div>
              <p className="mt-1 text-sm">{resultat.ravageur || "Aucun détecté"}</p>
            </div>
            <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Shield className="h-4 w-4 text-primary" />
                Niveau de confiance
              </div>
              <p className="mt-1 text-sm font-medium">{resultat.confiance}%</p>
            </div>
          </div>

          {/* Description et conseil */}
          <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <h4 className="text-sm font-semibold text-foreground">📝 Analyse détaillée</h4>
            <p className="mt-2 text-sm text-muted-foreground">
              {resultat.description || "L'IA n'a pas fourni de description détaillée."}
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-primary/5 p-5 shadow-sm">
            <h4 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Leaf className="h-4 w-4 text-primary" />
              Conseils recommandés
            </h4>
            <ul className="mt-2 space-y-1.5">
              {(resultat.actions_recommandees?.length > 0 ? resultat.actions_recommandees : [resultat.conseil || "Aucun conseil disponible"]).map((action, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="text-primary">•</span>
                  {action}
                </li>
              ))}
            </ul>
          </div>

          <button
            onClick={resetAnalyse}
            className="w-full rounded-xl border border-border py-3 text-sm font-medium text-foreground hover:bg-muted/30"
          >
            Nouvelle analyse
          </button>
        </div>
      )}
    </div>
  );
}