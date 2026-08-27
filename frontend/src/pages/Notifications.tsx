// frontend/src/pages/Notifications.tsx

import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, AlertTriangle, Info, Brain, CloudRain } from "lucide-react";
import { useNotifications } from "@/context/NotificationContext";
import { cn } from "@/lib/utils";

export default function Notifications() {
  const navigate = useNavigate();
  const { notifications, loading, refresh, marquerToutesLues } = useNotifications();

  const fetchNotifications = useCallback(() => {
    refresh();
  }, []);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'alerte':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'info':
        return <Info className="h-5 w-5 text-blue-500" />;
      case 'rappel':
        return <Bell className="h-5 w-5 text-yellow-500" />;
      case 'ia':
        return <Brain className="h-5 w-5 text-purple-500" />;
      case 'meteo':
        return <CloudRain className="h-5 w-5 text-blue-400" />;
      default:
        return <Bell className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </button>
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <Bell className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Notifications</h1>
              <p className="text-sm text-muted-foreground">
                {notifications.filter(n => !n.lue).length} non lues
              </p>
            </div>
          </div>
        </div>
        {notifications.some(n => !n.lue) && (
          <button
            onClick={marquerToutesLues}
            className="rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            Tout marquer lu
          </button>
        )}
      </div>

      {/* Liste */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
          <Bell className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-3 text-sm font-medium text-foreground">Aucune notification</p>
          <p className="text-xs text-muted-foreground">Les notifications apparaîtront ici</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={cn(
                "rounded-2xl border p-4 transition-colors",
                !notif.lue ? "border-primary/20 bg-primary/5" : "border-border bg-card"
              )}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getIcon(notif.type)}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-foreground">{notif.titre}</h3>
                    {!notif.lue && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">
                        Nouvelle
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{notif.message}</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{notif.type_label}</span>
                    {notif.parcelle_nom && <span>• {notif.parcelle_nom}</span>}
                    <span>• {new Date(notif.date_creation).toLocaleDateString()}</span>
                  </div>
                  {notif.lien && (
                    <button
                      onClick={() => navigate(notif.lien)}
                      className="mt-2 text-xs font-medium text-primary hover:text-primary/80"
                    >
                      Voir →
                    </button>
                  )}
                </div>
                {!notif.lue && (
                  <div className="h-2 w-2 shrink-0 rounded-full bg-primary" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}