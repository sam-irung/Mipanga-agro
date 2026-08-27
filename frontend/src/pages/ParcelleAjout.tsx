// frontend/src/pages/ParcelleAjout.tsx

import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ArrowLeft, MapPin, Sprout, Loader2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import MiniMap from "@/components/common/MiniMap";
import { culturesService } from "@/api/cultures";

interface ParcelleForm {
  nom: string;
  culture: string;
  variete?: string;
  superficie: number;
  dateSemis: string;
}

interface Culture {
  id: number;
  nom: string;
  emoji: string;
  description?: string;
  type?: string;
}

export default function ParcelleAjout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addParcelle } = useApp();
  const [cultures, setCultures] = useState<Culture[]>([]);
  const [loadingCultures, setLoadingCultures] = useState(true);
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: -11.6645,
    lng: 27.4824,
  });

  const searchParams = new URLSearchParams(location.search);
  const preselectedCulture = searchParams.get('culture');

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ParcelleForm>();

  useEffect(() => {
    const fetchCultures = async () => {
      try {
        setLoadingCultures(true);
        const response = await culturesService.getAll();
        console.log("🌱 Cultures reçues:", response.data);
        setCultures(response.data);
        
        if (preselectedCulture) {
          // ✅ CORRECTION : Ajouter le type explicite
          const found = response.data.find((c: Culture) => c.id === Number(preselectedCulture));
          if (found) {
            setValue('culture', String(found.id));
          }
        }
      } catch (error) {
        console.error("❌ Erreur chargement cultures:", error);
      } finally {
        setLoadingCultures(false);
      }
    };

    fetchCultures();
  }, [preselectedCulture, setValue]);

  const onSubmit = (data: ParcelleForm) => {
    console.log("📍 Coordonnées:", coords);
    console.log("🌱 Culture sélectionnée:", data.culture);
    addParcelle({
      nom: data.nom,
      culture: data.culture,
      variete: data.variete,
      superficie: Number(data.superficie),
      dateSemis: data.dateSemis,
      latitude: coords.lat,
      longitude: coords.lng,
    });
    navigate("/parcelles");
  };

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Header */}
      <div>
        <button
          onClick={() => navigate("/parcelles")}
          className="mb-3 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux parcelles
        </button>
        <h1 className="text-2xl font-bold text-foreground">Ajouter une parcelle</h1>
        <p className="text-sm text-muted-foreground">Renseignez les informations de votre nouvelle culture</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-lg space-y-5">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
          {/* Nom */}
          <div className="space-y-1.5">
            <label className="text-sm font-medium text-foreground">Nom de la parcelle</label>
            <input
              placeholder="Ex: Parcelle A"
              className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              {...register("nom", { required: "Nom obligatoire" })}
            />
            {errors.nom && <p className="text-xs text-destructive">{errors.nom.message}</p>}
          </div>

          {/* Culture & Variété */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Culture</label>
              <div className="relative">
                <Sprout className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <select
                  className="h-11 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  {...register("culture", { required: "Veuillez sélectionner une culture" })}
                  disabled={loadingCultures}
                >
                  <option value="">Sélectionner une culture</option>
                  {loadingCultures ? (
                    <option disabled>Chargement des cultures...</option>
                  ) : cultures.length === 0 ? (
                    <option disabled>Aucune culture disponible</option>
                  ) : (
                    cultures.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.emoji || "🌱"} {c.nom}
                      </option>
                    ))
                  )}
                </select>
              </div>
              {loadingCultures && (
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Chargement des cultures...
                </p>
              )}
              {errors.culture && <p className="text-xs text-destructive">{errors.culture.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Variété <span className="text-muted-foreground">(optionnel)</span>
              </label>
              <input
                placeholder="Ex: Babungo"
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                {...register("variete")}
              />
            </div>
          </div>

          {/* Superficie & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Superficie (ha)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                placeholder="0.5"
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                {...register("superficie", {
                  required: "Requis",
                  min: { value: 0.1, message: "Min 0.1 ha" },
                })}
              />
              {errors.superficie && <p className="text-xs text-destructive">{errors.superficie.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Date de semis</label>
              <input
                type="date"
                className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                {...register("dateSemis", { required: "Requis" })}
              />
              {errors.dateSemis && <p className="text-xs text-destructive">{errors.dateSemis.message}</p>}
            </div>
          </div>
        </div>

        {/* Carte */}
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-3">
          <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            <MapPin className="h-4 w-4 text-primary" />
            Localisation de la parcelle
          </label>
          <MiniMap
            latitude={coords.lat}
            longitude={coords.lng}
            height="240px"
            interactive
            onClick={(lat, lng) => setCoords({ lat, lng })}
          />
          <p className="text-xs text-muted-foreground">
            Cliquez sur la carte pour positionner votre parcelle — {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isSubmitting || loadingCultures}
          className="h-12 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60"
        >
          {isSubmitting ? "Création..." : "Créer la parcelle"}
        </button>
      </form>
    </div>
  );
}