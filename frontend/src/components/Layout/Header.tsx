// frontend/src/components/Layout/Header.tsx

import { useState } from "react";
import { Menu, PanelLeftClose, PanelLeftOpen, Bell, User, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "@/context/NotificationContext";
import { cn } from "@/lib/utils";


interface HeaderProps {
  onMenuClick: () => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
}

export default function Header({ onMenuClick, onToggleSidebar, isSidebarOpen }: HeaderProps) {
  const navigate = useNavigate();
  const { notifications, nonLues, marquerToutesLues, loading } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);

  const handleToggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  const handleNotificationClick = (lien: string) => {
    setShowNotifications(false);
    if (lien) {
      navigate(lien);
    }
  };

  const handleMarquerToutesLues = async () => {
    await marquerToutesLues();
  };
  
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-sm">
      <div className="flex h-14 items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-3">
          {/* Menu mobile */}
          <button
            onClick={onMenuClick}
            className="rounded-lg p-2 transition-colors hover:bg-muted lg:hidden"
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5 text-foreground" />
          </button>

          {/* Toggle sidebar desktop */}
          <button
            onClick={onToggleSidebar}
            className="hidden rounded-lg p-2 transition-colors hover:bg-muted lg:block"
            aria-label={isSidebarOpen ? "Réduire le menu" : "Agrandir le menu"}
          >
            {isSidebarOpen ? (
              <PanelLeftClose className="h-5 w-5 text-foreground" />
            ) : (
              <PanelLeftOpen className="h-5 w-5 text-foreground" />
            )}
          </button>

          <span className="text-sm font-medium text-foreground lg:hidden">Mipanga Agro</span>
        </div>

        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={handleToggleNotifications}
              className="relative rounded-full p-2 transition-colors hover:bg-muted"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5 text-muted-foreground" />
              {nonLues > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
                  {nonLues > 9 ? '9+' : nonLues}
                </span>
              )}
            </button>

            {/* Dropdown des notifications */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 max-h-[400px] overflow-y-auto rounded-2xl border border-border bg-card shadow-lg z-50">
                <div className="sticky top-0 flex items-center justify-between border-b border-border bg-card p-3">
                  <h3 className="text-sm font-semibold text-foreground">Notifications</h3>
                  <div className="flex items-center gap-2">
                    {nonLues > 0 && (
                      <button
                        onClick={handleMarquerToutesLues}
                        className="text-xs text-primary hover:text-primary/80"
                      >
                        Tout marquer lu
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="rounded-lg p-1 hover:bg-muted"
                    >
                      <X className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>

                <div className="p-2 space-y-1">
                  {loading ? (
                    <div className="flex justify-center py-6">
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="py-6 text-center">
                      <Bell className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">Aucune notification</p>
                    </div>
                  ) : (
                    notifications.slice(0, 10).map((notif) => (
                      <button
                        key={notif.id}
                        onClick={() => handleNotificationClick(notif.lien)}
                        className={cn(
                          "w-full rounded-xl p-3 text-left transition-colors hover:bg-muted/50",
                          !notif.lue ? "bg-primary/5" : ""
                        )}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-base">{notif.type_label}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {notif.titre}
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {notif.message}
                            </p>
                            <p className="mt-1 text-[10px] text-muted-foreground">
                              {new Date(notif.date_creation).toLocaleDateString()} à {new Date(notif.date_creation).toLocaleTimeString()}
                            </p>
                          </div>
                          {!notif.lue && (
                            <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                          )}
                        </div>
                      </button>
                    ))
                  )}
                </div>

                {notifications.length > 0 && (
                  <div className="border-t border-border p-2">
                    <button
                      onClick={() => {
                        setShowNotifications(false);
                        navigate("/notifications");
                      }}
                      className="w-full rounded-xl py-2 text-center text-xs font-medium text-primary hover:bg-primary/5"
                    >
                      Voir toutes les notifications
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Profil */}
          <button
            onClick={() => navigate("/profil")}
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary"
          >
            <User className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}