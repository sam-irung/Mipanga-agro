import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import {
  Sprout,
  User as UserIcon,
  Phone,
  Mail,
  Lock,
  MapPin,
  ArrowLeft,
  Eye,
  EyeOff,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { PROVINCES_RDC } from "@/types";
import MiniMap from "@/components/common/MiniMap";

// ✅ Interface corrigée - correspond au backend
interface RegisterForm {
  username: string;      // ← AJOUTÉ
  first_name: string;    // ← AJOUTÉ (remplace prenom)
  last_name: string;     // ← AJOUTÉ (remplace nom)
  telephone: string;
  email?: string;
  password: string;      // ← AJOUTÉ (remplace motDePasse)
  password_confirm: string; // ← AJOUTÉ (confirmation)
  province: string;
  territoire: string;
}

export default function Register() {
  const navigate = useNavigate();
  const { register: registerUser } = useApp(); // ✅ Utiliser registerUser
  const [showPassword, setShowPassword] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number }>({
    lat: -11.6645,
    lng: 27.4824,
  });

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>();

  const territoires = useMemo(() => {
    const prov = PROVINCES_RDC.find((p) => p.nom === selectedProvince);
    return prov ? prov.territoires : [];
  }, [selectedProvince]);

  const password = watch("password");

  const onSubmit = async (data: RegisterForm) => {
    try {
      console.log("📦 Données d'inscription:", data);
      
      // ✅ Utiliser registerUser de useApp
      await registerUser({
        username: data.username,
        first_name: data.first_name,
        last_name: data.last_name,
        telephone: data.telephone,
        email: data.email || "",
        province: data.province,
        territoire: data.territoire,
        password: data.password,
        password_confirm: data.password_confirm,
      });
      
      navigate("/dashboard");
    } catch (error) {
      console.error("❌ Erreur inscription:", error);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top banner */}
      <div className="relative bg-gradient-to-br from-primary to-success px-6 pt-10 pb-12 text-primary-foreground">
        <Link
          to="/login"
          className="inline-flex items-center gap-1 text-sm text-primary-foreground/90 transition-colors hover:text-primary-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Link>
        <div className="mt-6 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15">
            <Sprout className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Mipanga Agro</h1>
            <p className="text-xs text-primary-foreground/80">Créez votre compte</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="-mt-6 flex-1 rounded-t-3xl bg-background px-6 pt-8 pb-12">
        <div className="mx-auto max-w-md space-y-5">
          <h2 className="text-2xl font-bold text-foreground">Inscription</h2>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Nom d'utilisateur */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Nom d'utilisateur <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  placeholder="jeankasongo"
                  className="h-11 w-full rounded-xl border border-input bg-card pl-9 pr-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  {...register("username", { 
                    required: "Nom d'utilisateur obligatoire",
                    minLength: { value: 3, message: "Minimum 3 caractères" }
                  })}
                />
              </div>
              {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
            </div>

            {/* Nom & Prénom */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Nom</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    placeholder="Kasongo"
                    className="h-11 w-full rounded-xl border border-input bg-card pl-9 pr-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    {...register("last_name", { required: "Nom requis" })}
                  />
                </div>
                {errors.last_name && <p className="text-xs text-destructive">{errors.last_name.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Prénom</label>
                <div className="relative">
                  <UserIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    placeholder="Jean"
                    className="h-11 w-full rounded-xl border border-input bg-card pl-9 pr-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                    {...register("first_name", { required: "Prénom requis" })}
                  />
                </div>
                {errors.first_name && <p className="text-xs text-destructive">{errors.first_name.message}</p>}
              </div>
            </div>

            {/* Téléphone */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Téléphone <span className="text-destructive">*</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="tel"
                  placeholder="+243 812 345 678"
                  className="h-11 w-full rounded-xl border border-input bg-card pl-9 pr-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  {...register("telephone", {
                    required: "Téléphone obligatoire",
                    minLength: { value: 8, message: "Numéro invalide" },
                  })}
                />
              </div>
              {errors.telephone && <p className="text-xs text-destructive">{errors.telephone.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">
                Email <span className="text-muted-foreground">(optionnel)</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="jean@email.com"
                  className="h-11 w-full rounded-xl border border-input bg-card pl-9 pr-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  {...register("email")}
                />
              </div>
            </div>

            {/* Mot de passe */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimum 8 caractères"
                  className="h-11 w-full rounded-xl border border-input bg-card pl-9 pr-10 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  {...register("password", {
                    required: "Mot de passe obligatoire",
                    minLength: { value: 8, message: "Minimum 8 caractères" },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {password && password.length < 8 && (
                <p className="text-xs text-muted-foreground">Minimum 8 caractères</p>
              )}
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            {/* Confirmation mot de passe */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-foreground">Confirmer le mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirmez votre mot de passe"
                  className="h-11 w-full rounded-xl border border-input bg-card pl-9 pr-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  {...register("password_confirm", {
                    required: "Confirmation requise",
                    validate: (value) => value === watch("password") || "Les mots de passe ne correspondent pas"
                  })}
                />
              </div>
              {errors.password_confirm && <p className="text-xs text-destructive">{errors.password_confirm.message}</p>}
            </div>

            {/* Province & Territoire */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Province</label>
                <select
                  className="h-11 w-full rounded-xl border border-input bg-card px-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  {...register("province", { required: "Requis" })}
                  onChange={(e) => setSelectedProvince(e.target.value)}
                >
                  <option value="">Sélectionner</option>
                  {PROVINCES_RDC.map((p) => (
                    <option key={p.nom} value={p.nom}>{p.nom}</option>
                  ))}
                </select>
                {errors.province && <p className="text-xs text-destructive">{errors.province.message}</p>}
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-foreground">Territoire</label>
                <select
                  className="h-11 w-full rounded-xl border border-input bg-card px-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-50"
                  disabled={!selectedProvince}
                  {...register("territoire", { required: "Requis" })}
                >
                  <option value="">Sélectionner</option>
                  {territoires.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                {errors.territoire && <p className="text-xs text-destructive">{errors.territoire.message}</p>}
              </div>
            </div>

            {/* Carte localisation */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                Localisation (cliquez sur la carte)
              </label>
              <MiniMap
                latitude={coords.lat}
                longitude={coords.lng}
                height="220px"
                interactive
                onClick={(lat, lng) => setCoords({ lat, lng })}
              />
              <p className="text-xs text-muted-foreground">
                {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-12 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60"
            >
              {isSubmitting ? "Création..." : "Créer mon compte"}
            </button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            Déjà inscrit ?{" "}
            <Link to="/login" className="font-semibold text-primary hover:text-primary/80">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}