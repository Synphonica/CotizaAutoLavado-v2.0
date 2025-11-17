"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Droplets, Search, Home, DollarSign, Bell,
  TrendingUp, Heart, Wallet, MessageSquare,
  LogOut, Settings, Moon, Sun, Menu, X, GitCompare, Sparkles, MapPin
} from "lucide-react";
import { useState, useEffect } from "react";

export function ModernNavbar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const navItems = [
    { href: "/", label: "Dashboard", icon: Home },
    { href: "/results", label: "Buscar", icon: Search },
    { href: "/compare", label: "Comparar", icon: GitCompare },
    { href: "/map", label: "Mapa", icon: MapPin },
    { href: "/notifications", label: "Notificaciones", icon: Bell, protected: true },
    { href: "/analytics", label: "Analytics", icon: TrendingUp, protected: true },
    { href: "/favorites", label: "Favoritos", icon: Heart, protected: true },
    { href: "/wallet", label: "Wallet", icon: Wallet, protected: true },
    { href: "/messages", label: "Mensajes", icon: MessageSquare, protected: true },
  ];

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

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between p-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-[#0F9D58] to-[#2B8EAD] rounded-lg flex items-center justify-center">
              <Droplets className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">Alto Carwash</span>
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
                  <Link href="/settings" onClick={() => setIsMobileOpen(false)}>
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
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B35] to-[#F9C74F] rounded-xl flex items-center justify-center flex-shrink-0">
                  <Droplets className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">Alto Carwash</span>
              </Link>
            )}

            {isCollapsed && (
              <div className="w-10 h-10 bg-gradient-to-br from-[#FF6B35] to-[#F9C74F] rounded-xl flex items-center justify-center mx-auto">
                <Droplets className="h-5 w-5 text-white" />
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

          {/* Search Bar */}
          {!isCollapsed && (
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="Search..."
                className="pl-10 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl"
              />
            </div>
          )}

          {isCollapsed && (
            <button className="mb-6 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 flex items-center justify-center">
              <Search className="h-5 w-5 text-gray-400" />
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
                href="/settings"
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

      {/* Spacer for content (when sidebar is present) */}
      <div className={`hidden lg:block transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-72'}`}></div>

      {/* Mobile spacer */}
      <div className="h-16 lg:hidden"></div>
    </>
  );
}
