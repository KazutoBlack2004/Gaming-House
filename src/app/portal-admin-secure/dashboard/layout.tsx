'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Avatar } from '@heroui/react';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  LogOut,
  Store,
  FileText,
  PanelLeftClose,
  PanelLeftOpen,
  Menu,
  X,
  ExternalLink,
} from 'lucide-react';
import { Providers } from '@/app/providers';
import { useAdminStore } from '@/lib/store/useAdminStore';

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const { products, categories, orders } = useAdminStore();
  const pendingOrdersCount = orders.filter((o) => o.shipping_status === 'unfulfilled').length;

  const navItems = [
    {
      name: 'Dashboard',
      href: '/portal-admin-secure/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Productos',
      href: '/portal-admin-secure/dashboard/productos',
      icon: Package,
      badge: products.length,
    },
    {
      name: 'Categorías',
      href: '/portal-admin-secure/dashboard/categorias',
      icon: FolderTree,
      badge: categories.length,
    },
    {
      name: 'Pedidos',
      href: '/portal-admin-secure/dashboard/ordenes',
      icon: ShoppingCart,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined,
      badgeHighlight: pendingOrdersCount > 0,
    },
    {
      name: 'Historial',
      href: '/portal-admin-secure/dashboard/auditoria',
      icon: FileText,
    },
  ];

  const currentSectionTitle =
    navItems.find((item) => item.href === pathname)?.name || 'Panel de Control';

  const handleLogout = () => {
    router.push('/portal-admin-secure/login');
  };

  return (
    <Providers>
      <div className="min-h-screen bg-slate-50 text-slate-800 flex overflow-x-hidden relative">
        {/* Backdrop para móviles */}
        {isMobileOpen && (
          <div
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 md:hidden transition-opacity duration-300"
          />
        )}

        {/* Sidebar Lateral Izquierdo (Siempre visible en desktop: Expandido w-64 o Modo Iconos w-20) */}
        <aside
          className={`fixed md:sticky top-0 h-screen z-50 bg-white border-r border-slate-200/80 flex flex-col justify-between shrink-0 shadow-2xs transition-all duration-300 ease-in-out ${
            isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
          } ${isExpanded ? 'md:w-64' : 'md:w-20'}`}
        >
          <div className="p-3.5 space-y-6">
            {/* Cabecera del Sidebar con Botón de Colapsar/Expandir Integrado */}
            <div
              className={`flex items-center ${
                isExpanded ? 'justify-between px-1.5' : 'justify-center'
              } h-10`}
            >
              {isExpanded && (
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-slate-900 flex items-center justify-center font-bold text-white shrink-0 shadow-2xs">
                    <Store className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <h3 className="font-extrabold text-sm text-slate-900 tracking-tight leading-none">
                      Backoffice
                    </h3>
                    <span className="text-[11px] text-slate-400 font-medium">
                      Administración
                    </span>
                  </div>
                </div>
              )}

              {/* Botón Desktop para alternar entre Expandido e Iconos */}
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="hidden md:flex w-9 h-9 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-slate-100 text-slate-600 hover:text-slate-900 items-center justify-center transition-colors shrink-0"
                title={isExpanded ? 'Contraer menú lateral' : 'Expandir menú lateral'}
              >
                {isExpanded ? (
                  <PanelLeftClose className="w-4 h-4" />
                ) : (
                  <PanelLeftOpen className="w-4 h-4" />
                )}
              </button>

              {/* Botón Cerrar en Móvil */}
              <button
                type="button"
                onClick={() => setIsMobileOpen(false)}
                className="md:hidden p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                title="Cerrar menú"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navegación Lateral */}
            <nav className="space-y-1.5">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={!isExpanded ? item.name : undefined}
                    onClick={() => setIsMobileOpen(false)}
                    className={`relative flex items-center ${
                      isExpanded ? 'justify-between px-3.5' : 'justify-center px-0'
                    } h-11 rounded-xl text-xs font-semibold transition-all ${
                      isActive
                        ? 'bg-slate-900 text-white shadow-xs font-bold'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
                    }`}
                  >
                    <div className={`flex items-center ${isExpanded ? 'gap-3 min-w-0' : ''}`}>
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-white' : 'text-slate-500'
                        }`}
                      />
                      {isExpanded && <span className="truncate">{item.name}</span>}
                    </div>

                    {/* Badge en modo expandido */}
                    {isExpanded && item.badge !== undefined && (
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.badgeHighlight
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}

                    {/* Punto indicador en modo contraído (solo iconos) */}
                    {!isExpanded && item.badge !== undefined && (
                      <span
                        className={`absolute top-1.5 right-2 w-2 h-2 rounded-full ${
                          item.badgeHighlight ? 'bg-amber-500' : 'bg-slate-400'
                        }`}
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Pie del Sidebar */}
          <div className="p-3.5 border-t border-slate-100 space-y-2 bg-slate-50/50">
            <Link
              href="/"
              target="_blank"
              title={!isExpanded ? 'Ver Tienda Pública' : undefined}
              className={`flex items-center justify-center gap-2 h-10 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 shadow-2xs hover:bg-slate-50 hover:text-slate-950 transition-colors ${
                isExpanded ? 'px-3' : 'px-0'
              }`}
            >
              <ExternalLink className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              {isExpanded && <span className="truncate">Ver Tienda Pública</span>}
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              title={!isExpanded ? 'Cerrar Sesión' : undefined}
              className={`w-full flex items-center ${
                isExpanded ? 'justify-start gap-2.5 px-3.5' : 'justify-center px-0'
              } h-10 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors`}
            >
              <LogOut className="w-4 h-4 shrink-0" />
              {isExpanded && <span className="truncate">Cerrar Sesión</span>}
            </button>
          </div>
        </aside>

        {/* Contenido Principal */}
        <div className="flex-1 flex flex-col min-w-0 transition-all duration-300">
          <header className="h-16 bg-white border-b border-slate-200/80 px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
            <div className="flex items-center gap-3">
              {/* Botón Menú solo en Móvil */}
              <button
                type="button"
                onClick={() => setIsMobileOpen(true)}
                className="md:hidden p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition flex items-center justify-center"
                title="Abrir menú"
              >
                <Menu className="w-4 h-4" />
              </button>

              <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
                {currentSectionTitle}
              </span>
            </div>

            {/* Perfil Administrativo */}
            <div className="flex items-center gap-3">
              <Avatar
                size="sm"
                name="Admin"
                className="bg-slate-900 text-white text-xs font-bold shadow-2xs"
              />
              <div className="hidden sm:block text-left">
                <span className="block text-xs font-bold text-slate-900 leading-tight">
                  Administrador
                </span>
                <span className="block text-[10px] text-slate-400">
                  Gestión de Tienda
                </span>
              </div>
            </div>
          </header>

          <main className="p-4 sm:p-8 flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </Providers>
  );
}
