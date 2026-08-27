import { useNavigate } from "react-router-dom";
import { Sprout, ArrowRight } from "lucide-react";

export default function Splash() {
  const navigate = useNavigate();

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-primary via-primary to-success px-6 text-center text-primary-foreground">
      {/* Decorative shapes */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-32 -left-20 h-80 w-80 rounded-full bg-secondary/20 blur-3xl" />

      <div className="relative z-10 flex flex-col items-center animate-fade-in-up">
        {/* Logo */}
        <div className="mb-8 flex h-28 w-28 items-center justify-center rounded-3xl bg-white/15 shadow-2xl backdrop-blur-sm">
          <Sprout className="h-14 w-14" />
        </div>

        {/* Title */}
        <h1 className="mb-3 text-4xl font-extrabold tracking-tight">Mipanga Agro</h1>
        <p className="mb-12 max-w-xs text-base text-primary-foreground/90">
          Votre assistant agricole intelligent
        </p>

        {/* CTA */}
        <button
          onClick={() => navigate("/login")}
          className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-primary shadow-xl transition-all hover:scale-105 active:scale-95"
        >
          Commencer
          <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
        </button>

        {/* Footer */}
        <p className="mt-16 text-xs text-primary-foreground/70">
          République Démocratique du Congo
        </p>
      </div>
    </div>
  );
}
