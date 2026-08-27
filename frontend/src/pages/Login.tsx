// frontend/src/pages/Login.tsx

import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Sprout, User, Lock, ArrowLeft, Eye, EyeOff } from "lucide-react";
import { useApp } from "@/context/AppContext";

interface LoginForm {
  identifier: string;  // ✅ Changé de 'telephone' à 'identifier'
  motDePasse: string;
}

// Type pour l'erreur de l'API
interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
  message?: string;
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useApp();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    setError("");
    try {
      // ✅ Envoyer identifier et motDePasse
      await login(data.identifier, data.motDePasse);
      navigate("/dashboard");
    } catch (err: unknown) {
      if (err && typeof err === 'object') {
        const apiError = err as ApiError;
        setError(apiError.response?.data?.error || "Échec de la connexion. Vérifiez vos identifiants.");
      } else {
        setError("Échec de la connexion. Vérifiez vos identifiants.");
      }
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top banner */}
      <div className="relative h-48 bg-gradient-to-br from-primary to-success px-6 pt-10 text-primary-foreground">
        <Link
          to="/"
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
            <p className="text-xs text-primary-foreground/80">Connexion à votre compte</p>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="-mt-6 flex-1 rounded-t-3xl bg-background px-6 pt-8">
        <div className="mx-auto max-w-md">
          <h2 className="mb-1 text-2xl font-bold text-foreground">Bon retour</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            Connectez-vous avec votre nom d'utilisateur, téléphone ou email
          </p>

          {error && (
            <div className="mb-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Identifiant */}
            <div className="space-y-2">
              <label htmlFor="identifier" className="text-sm font-medium text-foreground">
                Nom d'utilisateur, téléphone ou email
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="identifier"
                  type="text"
                  placeholder="Nom d'utilisateur, téléphone ou email"
                  className="h-12 w-full rounded-xl border border-input bg-card pl-10 pr-4 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  {...register("identifier", {
                    required: "L'identifiant est obligatoire",
                  })}
                />
              </div>
              {errors.identifier && (
                <p className="text-xs text-destructive">{errors.identifier.message}</p>
              )}
            </div>

            {/* Mot de passe */}
            <div className="space-y-2">
              <label htmlFor="motDePasse" className="text-sm font-medium text-foreground">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="motDePasse"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className="h-12 w-full rounded-xl border border-input bg-card pl-10 pr-10 text-sm text-foreground shadow-sm transition-colors placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  {...register("motDePasse", {
                    required: "Le mot de passe est obligatoire",
                    minLength: { value: 8, message: "Minimum 8 caractères" },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPassword ? "Masquer" : "Afficher"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {errors.motDePasse && (
                <p className="text-xs text-destructive">{errors.motDePasse.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-12 w-full rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-md transition-all hover:bg-primary/90 active:scale-[0.98] disabled:opacity-60"
            >
              {isSubmitting ? "Connexion..." : "Se connecter"}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Pas encore de compte ?{" "}
            <Link
              to="/register"
              className="font-semibold text-primary transition-colors hover:text-primary/80"
            >
              Créer un compte
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}