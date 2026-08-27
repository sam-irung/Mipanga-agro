// frontend/src/components/Layout/AppLayout.tsx

import { useState } from "react";
import { Outlet } from "react-router-dom";
import SideMenu from "./SideMenu";
import Header from "./Header";
import { cn } from "@/lib/utils";

export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // ✅ Fonctions de gestion du menu mobile
  const openMobileMenu = () => {
    console.log("📱 Ouverture menu mobile"); // Debug
    setIsMobileMenuOpen(true);
  };

  const closeMobileMenu = () => {
    console.log("📱 Fermeture menu mobile"); // Debug
    setIsMobileMenuOpen(false);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <SideMenu
        isOpen={isSidebarOpen}
        isMobileOpen={isMobileMenuOpen}
        onToggle={toggleSidebar}
        onMobileClose={closeMobileMenu}
      />

      <div
        className={cn(
          "flex-1 transition-all duration-300",
          isSidebarOpen ? "lg:ml-64" : "lg:ml-16"
        )}
      >
        <Header
          onMenuClick={openMobileMenu}
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={isSidebarOpen}
        />
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}