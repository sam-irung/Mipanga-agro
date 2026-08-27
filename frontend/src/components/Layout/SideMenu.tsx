// frontend/src/components/Layout/SideMenu.tsx

import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  MapPinned,
  CalendarDays,
  Lightbulb,
  User as UserIcon,
  LogOut,
  CloudRain,
  Sprout,
  Sparkles,
  ChevronLeft,
  Bot,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useApp } from "@/context/AppContext";
import { Calendar } from "lucide-react";

interface SideMenuProps {
  isOpen: boolean;
  isMobileOpen: boolean;
  onToggle: () => void;
  onMobileClose: () => void;
}

const NAV_ITEMS = [
  { label: "Tableau de bord", icon: LayoutDashboard, path: "/dashboard" },
  { label: "Mes parcelles", icon: MapPinned, path: "/parcelles" },
  { label: "Calendrier", icon: CalendarDays, path: "/calendrier" },
  { label: "Recommandations", icon: Lightbulb, path: "/recommandations" },
  { label: "Météo", icon: CloudRain, path: "/meteo" },
  { label: "Saison agricole", icon: CloudRain, path: "/saison" },
  { label: "Diagnostic IA", icon: Sparkles, path: "/diagnostic" },
  { label: "Assistant IA", icon: Bot, path: "/assistant" },
  { label: "Historique IA", icon: Calendar, path: "/historique-ia" },
  { label: "Profil", icon: UserIcon, path: "/profil" },
];

export default function SideMenu({
  isOpen,
  isMobileOpen,
  onToggle,
  onMobileClose,
}: SideMenuProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useApp();
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ top: number; left: number } | null>(null);

  // Debug
  console.log("📱 SideMenu - isMobileOpen:", isMobileOpen);
  console.log("📱 SideMenu - isOpen:", isOpen);

  // Gestion du scroll body
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  // Fermer le menu mobile quand on navigue
  useEffect(() => {
    if (isMobileOpen) {
      onMobileClose();
    }
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const getInitiales = () => {
    if (!user) return "?";
    const first = user.first_name?.charAt(0) || "";
    const last = user.last_name?.charAt(0) || "";
    return `${first}${last}`.toUpperCase() || "?";
  };

  const getNomComplet = () => {
    if (!user) return "Utilisateur";
    return `${user.first_name || ""} ${user.last_name || ""}`.trim() || "Utilisateur";
  };

  const handleMouseEnter = (e: React.MouseEvent, path: string) => {
    if (!isOpen) {
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setTooltipPosition({
        top: rect.top + rect.height / 2,
        left: rect.right + 8,
      });
      setHoveredItem(path);
    }
  };

  const handleMouseLeave = () => {
    setHoveredItem(null);
    setTooltipPosition(null);
  };

  return (
    <>
      {/* Overlay mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-50 flex h-full flex-col bg-card shadow-xl transition-all duration-300 ease-out",
          // ✅ Toujours visible sur desktop, pas sur mobile sauf si isMobileOpen
          "lg:translate-x-0",
          isOpen ? "lg:w-64" : "lg:w-16",
          // ✅ Mobile : translation selon isMobileOpen
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          // ✅ Largeur fixe pour mobile
          "w-64"
        )}
      >
        {/* Header */}
        <div
          className={cn(
            "flex items-center border-b border-border bg-primary p-4 text-primary-foreground transition-all duration-300",
            isOpen ? "justify-between" : "justify-center"
          )}
        >
          {isOpen ? (
            <>
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/15">
                  <Sprout className="h-5 w-5" />
                </div>
                <div>
                  <h1 className="text-base font-bold leading-tight">Mipanga Agro</h1>
                  <p className="text-[10px] text-primary-foreground/80">
                    Assistant agricole
                  </p>
                </div>
              </div>
              <button
                onClick={onToggle}
                className="rounded-lg p-1.5 transition-colors hover:bg-white/15"
                title="Réduire le menu"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
            </>
          ) : (
            <button
              onClick={onToggle}
              className="rounded-lg p-2 transition-colors hover:bg-white/15"
              title="Agrandir le menu"
            >
              <Sprout className="h-6 w-6" />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {NAV_ITEMS.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <li key={item.path} className="relative">
                  <Link
                    to={item.path}
                    onMouseEnter={(e) => handleMouseEnter(e, item.path)}
                    onMouseLeave={handleMouseLeave}
                    className={cn(
                      "group flex items-center rounded-xl transition-all duration-200",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "text-foreground hover:bg-accent hover:text-accent-foreground",
                      isOpen ? "gap-3 px-4 py-3" : "justify-center px-2 py-3"
                    )}
                  >
                    <Icon className={cn("h-5 w-5 shrink-0", isOpen ? "" : "mx-auto")} />
                    {isOpen && <span className="text-sm font-medium">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User footer */}
        <div className="border-t border-border p-3">
          <Link
            to="/profil"
            className={cn(
              "flex items-center rounded-xl p-2 transition-colors hover:bg-accent",
              isOpen ? "gap-3" : "justify-center"
            )}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
              {getInitiales()}
            </div>
            {isOpen && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{getNomComplet()}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {user?.telephone || "Utilisateur"}
                </p>
              </div>
            )}
          </Link>

          <button
            onClick={handleLogout}
            className={cn(
              "mt-2 flex w-full items-center rounded-xl text-sm font-medium text-destructive transition-colors hover:bg-destructive/10",
              isOpen ? "gap-3 px-4 py-3" : "justify-center px-2 py-3"
            )}
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {isOpen && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Tooltip */}
      {!isOpen && hoveredItem && tooltipPosition && (
        <div
          className="fixed z-[60] rounded-lg bg-foreground px-3 py-1.5 text-xs font-medium text-background shadow-lg whitespace-nowrap pointer-events-none"
          style={{
            top: tooltipPosition.top - 12,
            left: tooltipPosition.left,
            transform: 'translateY(-50%)',
          }}
        >
          {NAV_ITEMS.find(item => item.path === hoveredItem)?.label}
        </div>
      )}
    </>
  );
}