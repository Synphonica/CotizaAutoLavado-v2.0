"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Droplets, Search, Home, Bell, Heart, History,
  LogOut, Settings, Moon, Sun, Menu, X, GitCompare, Sparkles, MapPin,
  LayoutDashboard, Users, Building2, FileText, Wrench, MessageSquare,
  Package, Calendar, Image as ImageIcon, Clock, Tag, Shield, Briefcase, Bot
} from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { SearchWithAI } from "@/components/ai/SearchWithAI";
import { AIStatusIndicator } from "@/components/ai/AIStatusIndicator";

export function ModernNavbar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showAISearch, setShowAISearch] = useState(false);
  const { role, isLoading } = useAuth();

  // Menús según rol
  const customerNavItems: Array<{ href: string; label: string; icon: any; protected?: boolean }> = [
    { href: "/", label: "Inicio", icon: Home },
    { href: "/ai-assistant", label: "Asistente IA", icon: Sparkles, protected: true },
    { href: "/results", label: "Buscar", icon: Search },
    { href: "/compare", label: "Comparar", icon: GitCompare },
    { href: "/map", label: "Mapa", icon: MapPin },
    { href: "/notifications", label: "Notificaciones", icon: Bell, protected: true },
    { href: "/history", label: "Historial", icon: History, protected: true },
    { href: "/favorites", label: "Favoritos", icon: Heart, protected: true },
    { href: "/provider/onboarding", label: "Registrar mi negocio", icon: Briefcase, protected: true },
  ];

  const providerNavItems: Array<{ href: string; label: string; icon: any; protected?: boolean }> = [
    { href: "/provider/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/provider/dashboard/services", label: "Servicios", icon: Package },
    { href: "/provider/dashboard/bookings", label: "Reservas", icon: Calendar },
    { href: "/provider/dashboard/schedule", label: "Horarios", icon: Clock },
    { href: "/provider/dashboard/promotions", label: "Promociones", icon: Tag },
    { href: "/provider/dashboard/gallery", label: "Galería", icon: ImageIcon },
    { href: "/provider/dashboard/ai-insights", label: "Análisis IA", icon: Sparkles },
    { href: "/provider/settings", label: "Configuración", icon: Settings },
  ];

  const adminNavItems: Array<{ href: string; label: string; icon: any; protected?: boolean }> = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/users", label: "Usuarios", icon: Users },
    { href: "/admin/providers", label: "Proveedores", icon: Building2 },
    { href: "/admin/requests", label: "Solicitudes", icon: FileText },
    { href: "/admin/services", label: "Servicios", icon: Wrench },
    { href: "/admin/reviews", label: "Reseñas", icon: MessageSquare },
  ];

  // Seleccionar menú según rol
  const getNavItems = () => {
    switch (role) {
      case 'ADMIN':
        return adminNavItems;
      case 'PROVIDER':
        return providerNavItems;
      case 'CUSTOMER':
      default:
        return customerNavItems;
    }
  };

  const navItems = getNavItems();

  // No renderizar hasta que el rol esté cargado para evitar parpadeo
  if (isLoading) {
    return null;
  }

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  useEffect(() => {
    if (isCollapsed) {
      document.documentElement.classList.add('sidebar-collapsed');
    } else {
      document.documentElement.classList.remove('sidebar-collapsed');
    }
  }, [isCollapsed]);

  // Obtener título según rol
  const getTitle = () => {
    switch (role) {
      case 'ADMIN':
        return 'Panel Admin';
      case 'PROVIDER':
        return 'Panel Proveedor';
      case 'CUSTOMER':
      default:
        return 'CotizaAutoLavado';
    }
  };

  // Obtener color de gradiente según rol
  const getGradientColors = () => {
    switch (role) {
      case 'ADMIN':
        return 'from-red-500 to-pink-500';
      case 'PROVIDER':
        return 'from-blue-500 to-cyan-500';
      case 'CUSTOMER':
      default:
        return 'from-[#0F9D58] to-[#2B8EAD]';
    }
  };

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between p-4">
          <Link href="/" className="flex items-center gap-3">
            <div className={`w-8 h-8 bg-gradient-to-br ${getGradientColors()} rounded-lg flex items-center justify-center`}>
              {role === 'ADMIN' ? <Shield className="h-5 w-5 text-white" /> :
                role === 'PROVIDER' ? <Building2 className="h-5 w-5 text-white" /> :
                  <Droplets className="h-5 w-5 text-white" />}
            </div>
            <div>
              <span className="text-xl font-bold text-gray-900 dark:text-white block">{getTitle()}</span>
              {role && role !== 'CUSTOMER' && (
                <span className="text-xs text-gray-500 dark:text-gray-400 block">
                  {role === 'ADMIN' ? 'Administrador' : 'Proveedor'}
                </span>
              )}
            </div>
          </Link>

          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            {isMobileOpen ? (
              <X className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700 dark:text-gray-300" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileOpen && (
          <div className="absolute top-full left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-lg max-h-[80vh] overflow-y-auto">
            <div className="p-4 space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;

                if (item.protected) {
                  return (
                    <SignedIn key={item.href}>
                      <Link
                        href={item.href}
                        onClick={() => setIsMobileOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                          ? "bg-[#2F80ED] text-white shadow-lg shadow-[#2F80ED]/30"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                          }`}
                      >
                        <Icon className="h-5 w-5" />
                        {item.label}
                      </Link>
                    </SignedIn>
                  );
                }

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                      ? "bg-[#2F80ED] text-white shadow-lg shadow-[#2F80ED]/30"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                      }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                );
              })}

              <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
                <SignedIn>
                  <Link href={role === 'PROVIDER' ? '/provider/settings' : '/settings'} onClick={() => setIsMobileOpen(false)}>
                    <button className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 w-full">
                      <Settings className="h-5 w-5" />
                      Settings
                    </button>
                  </Link>
                </SignedIn>

                <SignedOut>
                  <Link href="/sign-in" onClick={() => setIsMobileOpen(false)}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start border-2 border-gray-200 dark:border-gray-700 hover:border-[#2F80ED] dark:hover:border-[#2F80ED] hover:bg-blue-50 dark:hover:bg-blue-950"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Ingresar
                    </Button>
                  </Link>
                  <Link href="/sign-up" onClick={() => setIsMobileOpen(false)}>
                    <Button
                      size="sm"
                      className="w-full bg-[#2F80ED] hover:bg-[#2F80ED]/90 text-white shadow-lg shadow-[#2F80ED]/30"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Crear Cuenta
                    </Button>
                  </Link>
                </SignedOut>

                <button
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <span className="flex items-center gap-3">
                    {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                    {isDarkMode ? "Light Mode" : "Dark Mode"}
                  </span>
                  <div className={`w-12 h-6 rounded-full transition-colors ${isDarkMode ? 'bg-[#2F80ED]' : 'bg-gray-300'} relative`}>
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform ${isDarkMode ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Desktop Sidebar */}
      <aside className={`hidden lg:block fixed left-0 top-0 h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-all duration-300 z-50 ${isCollapsed ? 'w-20' : 'w-72'
        }`}>
        <div className="flex flex-col h-full p-4">
          {/* Logo & Collapse Button */}
          <div className="flex items-center justify-between mb-6">
            {!isCollapsed && (
              <Link href={role === 'ADMIN' ? '/admin' : role === 'PROVIDER' ? '/provider/dashboard' : '/'} className="flex items-center gap-3">
                <div className={`w-10 h-10 bg-gradient-to-br ${getGradientColors()} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  {role === 'ADMIN' ? <Shield className="h-5 w-5 text-white" /> :
                    role === 'PROVIDER' ? <Building2 className="h-5 w-5 text-white" /> :
                      <Droplets className="h-5 w-5 text-white" />}
                </div>
                <div>
                  <span className="text-xl font-bold text-gray-900 dark:text-white block">{getTitle()}</span>
                  {role && role !== 'CUSTOMER' && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {role === 'ADMIN' ? 'Administrador' : 'Proveedor'}
                    </span>
                  )}
                </div>
              </Link>
            )}

            {isCollapsed && (
              <div className={`w-10 h-10 bg-gradient-to-br ${getGradientColors()} rounded-xl flex items-center justify-center mx-auto`}>
                {role === 'ADMIN' ? <Shield className="h-5 w-5 text-white" /> :
                  role === 'PROVIDER' ? <Building2 className="h-5 w-5 text-white" /> :
                    <Droplets className="h-5 w-5 text-white" />}
              </div>
            )}

            {!isCollapsed && (
              <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-blue-600"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="rotate-180">
                  <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            )}
          </div>
          {/* AI Search Toggle - Solo para clientes */}
          {!isCollapsed && role === 'CUSTOMER' && (
            <div className="mb-6 space-y-2">
              <button
                onClick={() => setShowAISearch(!showAISearch)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 border-2 border-purple-200 dark:border-purple-800 hover:border-purple-300 dark:hover:border-purple-700 transition-all group"
              >
                <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400 group-hover:rotate-12 transition-transform" />
                <span className="text-purple-700 dark:text-purple-300">Buscar con IA</span>
                <Bot className="h-4 w-4 ml-auto text-purple-500" />
              </button>
              <div className="px-4">
                <AIStatusIndicator />
              </div>
            </div>
          )}

          {isCollapsed && role === 'CUSTOMER' && (
            <button
              onClick={() => setShowAISearch(!showAISearch)}
              className="mb-6 p-3 rounded-xl bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 hover:from-purple-200 hover:to-blue-200 dark:hover:from-purple-900/50 dark:hover:to-blue-900/50 flex items-center justify-center transition-all"
              title="Buscar con IA"
            >
              <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            </button>
          )}

          {/* Navigation Items */}
          <nav className="flex-1 space-y-1 overflow-y-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              if (item.protected) {
                return (
                  <SignedIn key={item.href}>
                    <Link
                      href={item.href}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                        ? "bg-[#2F80ED] text-white shadow-lg shadow-[#2F80ED]/30"
                        : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                        } ${isCollapsed ? 'justify-center' : ''}`}
                      title={isCollapsed ? item.label : undefined}
                    >
                      <Icon className="h-5 w-5 flex-shrink-0" />
                      {!isCollapsed && <span>{item.label}</span>}
                    </Link>
                  </SignedIn>
                );
              }

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${isActive
                    ? "bg-[#2F80ED] text-white shadow-lg shadow-[#2F80ED]/30"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    } ${isCollapsed ? 'justify-center' : ''}`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <Icon className="h-5 w-5 flex-shrink-0" />
                  {!isCollapsed && <span>{item.label}</span>}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Section */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-800 space-y-2">
            <SignedOut>
              {!isCollapsed && (
                <div className="space-y-2 mb-3">
                  <Link href="/sign-in" className="block">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full justify-start border-2 border-gray-200 dark:border-gray-700 hover:border-[#2F80ED] dark:hover:border-[#2F80ED] hover:bg-blue-50 dark:hover:bg-blue-950 transition-all"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Ingresar
                    </Button>
                  </Link>
                  <Link href="/sign-up" className="block">
                    <Button
                      size="sm"
                      className="w-full bg-[#2F80ED] hover:bg-[#2F80ED]/90 text-white shadow-lg shadow-[#2F80ED]/30 hover:shadow-xl hover:shadow-[#2F80ED]/40 transition-all"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      Crear Cuenta
                    </Button>
                  </Link>
                </div>
              )}

              {isCollapsed && (
                <div className="space-y-2 mb-3">
                  <Link href="/sign-in" className="block">
                    <button
                      className="w-full p-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-[#2F80ED] dark:hover:border-[#2F80ED] hover:bg-blue-50 dark:hover:bg-blue-950 flex items-center justify-center transition-all"
                      title="Ingresar"
                    >
                      <LogOut className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                    </button>
                  </Link>
                  <Link href="/sign-up" className="block">
                    <button
                      className="w-full p-3 rounded-xl bg-[#2F80ED] hover:bg-[#2F80ED]/90 flex items-center justify-center shadow-lg shadow-[#2F80ED]/30 hover:shadow-xl transition-all"
                      title="Crear Cuenta"
                    >
                      <Sparkles className="h-5 w-5 text-white" />
                    </button>
                  </Link>
                </div>
              )}
            </SignedOut>

            <SignedIn>
              <Link
                href={role === 'PROVIDER' ? '/provider/settings' : '/settings'}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all ${isCollapsed ? 'justify-center' : ''}`}
                title={isCollapsed ? "Settings" : undefined}
              >
                <Settings className="h-5 w-5 flex-shrink-0" />
                {!isCollapsed && <span>Settings</span>}
              </Link>

              {!isCollapsed && (
                <div className="pt-3 px-2">
                  <div className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all cursor-pointer">
                    <UserButton
                      afterSignOutUrl="/"
                      appearance={{
                        elements: {
                          avatarBox: "h-10 w-10 rounded-xl",
                          userButtonPopoverCard: "shadow-2xl",
                        },
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">Mi Cuenta</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">Ver perfil</p>
                    </div>
                  </div>
                </div>
              )}

              {isCollapsed && (
                <div className="flex justify-center pt-2">
                  <UserButton
                    afterSignOutUrl="/"
                    appearance={{
                      elements: {
                        avatarBox: "h-10 w-10 rounded-xl",
                      },
                    }}
                  />
                </div>
              )}
            </SignedIn>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} w-full px-4 py-3 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800`}
              title={isCollapsed ? (isDarkMode ? "Light Mode" : "Dark Mode") : undefined}
            >
              {!isCollapsed && (
                <span className="flex items-center gap-3">
                  {isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  <span>{isDarkMode ? "Light Mode" : "Dark Mode"}</span>
                </span>
              )}

              {isCollapsed && (
                isDarkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />
              )}

              {!isCollapsed && (
                <div className={`w-12 h-6 rounded-full transition-colors ${isDarkMode ? 'bg-[#2F80ED]' : 'bg-gray-300'} relative`}>
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-transform duration-300 ${isDarkMode ? 'translate-x-6' : 'translate-x-0.5'}`}></div>
                </div>
              )}
            </button>
          </div>
        </div>

        {/* Expand Button (when collapsed) */}
        {isCollapsed && (
          <button
            onClick={() => setIsCollapsed(false)}
            className="absolute -right-3 top-8 w-6 h-6 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full flex items-center justify-center text-[#FF6B35] hover:bg-gray-50 dark:hover:bg-gray-700 shadow-md"
          >
            <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
              <path d="M6 12L10 8L6 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </aside>

      {/* AI Search Modal */}
      {showAISearch && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowAISearch(false)}
          />

          {/* Modal */}
          <div className="relative z-10 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 w-full max-w-2xl mx-4 p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="bg-gradient-to-br from-purple-500 to-blue-500 rounded-full p-2">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Búsqueda con IA</h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Describe lo que buscas en lenguaje natural</p>
                </div>
              </div>
              <button
                onClick={() => setShowAISearch(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <SearchWithAI />
          </div>
        </div>
      )}

      {/* Spacer for content (when sidebar is present) */}
      <div className={`hidden lg:block transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-72'}`}></div>

      {/* Mobile spacer */}
      <div className="h-16 lg:hidden"></div>
    </>
  );
}
