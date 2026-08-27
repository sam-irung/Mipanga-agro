// frontend/src/App.tsx

import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider, useApp } from "@/context/AppContext";
import { DashboardProvider } from "@/context/DashboardContext";
import AppLayout from "@/components/Layout/AppLayout";
import Splash from "@/pages/Splash";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Parcelles from "@/pages/Parcelles";
import ParcelleAjout from "@/pages/ParcelleAjout";
import ParcelleDetail from "@/pages/ParcelleDetail";
import Calendrier from "@/pages/Calendrier";
import Recommandations from "@/pages/Recommandations";
import Profil from "@/pages/Profil";
import Meteo from "@/pages/Meteo";
import AssistantIA from "@/pages/AssistantIA";
import DiagnosticIA from "@/pages/DiagnosticIA";
import HistoriqueIA from "@/pages/HistoriqueIA";
import { NotificationProvider } from "@/context/NotificationContext";
import Notifications from "@/pages/Notifications";
import SaisonAgricole from "@/pages/SaisonAgricole";
import type { JSX } from "react";

function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { isAuthenticated, loading } = useApp();
  if (loading) {
    return <div className="flex h-screen items-center justify-center">Chargement...</div>;
  }
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Splash />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/parcelles" element={<Parcelles />} />
        <Route path="/parcelles/ajouter" element={<ParcelleAjout />} />
        <Route path="/parcelles/:id" element={<ParcelleDetail />} />
        <Route path="/calendrier" element={<Calendrier />} />
        <Route path="/recommandations" element={<Recommandations />} />
        <Route path="/profil" element={<Profil />} />
        <Route path="/meteo" element={<Meteo />} />
        <Route path="/diagnostic" element={<DiagnosticIA />} />
        <Route path="/assistant" element={<AssistantIA />} />
        <Route path="/historique-ia" element={<HistoriqueIA />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/saison" element={<SaisonAgricole />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AppProvider>
      <DashboardProvider>
        <NotificationProvider>
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </NotificationProvider>
      </DashboardProvider>
    </AppProvider>
  );
}

export default App;