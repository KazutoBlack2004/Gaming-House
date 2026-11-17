'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Navbar as HeroNavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenuToggle,
  NavbarMenu,
  NavbarMenuItem,
  Button,
} from '@heroui/react';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/lib/store/useCartStore';
import { SITE_CONFIG, formatPrice } from '@/lib/constants';
import { THEME_CONFIG } from '@/lib/theme';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const { getTotalItems, getTotalPrice, toggleCart } = useCartStore();
  const totalItems = getTotalItems();
  const totalPrice = getTotalPrice();

  const navLinks = [
    { label: 'Inicio', href: '/' },
    { label: 'Catálogo', href: '/productos' },
    { label: 'Seguimiento', href: '/seguimiento' },
  ];

  return (
    <HeroNavbar
      onMenuOpenChange={setIsMenuOpen}
      isMenuOpen={isMenuOpen}
      isBordered
      maxWidth="xl"
      height="5rem"
      className="bg-white/95 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200/80 shadow-xs"
      classNames={{
        wrapper: 'px-4 sm:px-6 lg:px-8 h-20',
      }}
    >
      {/* Izquierda: Toggle Móvil + Marca */}
      <NavbarContent justify="start" className="gap-3">
        <NavbarMenuToggle
          aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          className="sm:hidden text-slate-700 w-10 h-10 rounded-xl hover:bg-slate-100"
        />
        <NavbarBrand>
          <Link href="/" className="flex items-center gap-3 group">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-base shadow-sm transition-transform group-hover:scale-105"
              style={{ backgroundColor: THEME_CONFIG.colors.primary }}
            >
              {SITE_CONFIG.name.substring(0, 1).toUpperCase()}
            </div>
            <span className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 uppercase">
              {SITE_CONFIG.name}
            </span>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      {/* Centro: Enlaces de Navegación */}
      <NavbarContent className="hidden sm:flex gap-2" justify="center">
        {navLinks.map((link) => {
          const isActive =
            link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
          return (
            <NavbarItem key={link.href}>
              <Link
                href={link.href}
                className={`px-4 py-2.5 rounded-xl text-xs font-extrabold uppercase tracking-widest transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </Link>
            </NavbarItem>
          );
        })}
      </NavbarContent>

      {/* Derecha: Botón de Carrito Mejorado */}
      <NavbarContent justify="end">
        <NavbarItem>
          <Button
            onPress={toggleCart}
            aria-label="Ver Carrito"
            className="h-12 px-4 sm:px-5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition-all shadow-sm flex items-center gap-3"
          >
            <div className="relative flex items-center justify-center">
              <ShoppingBag className="w-5 h-5" />
            </div>

            <div className="hidden sm:flex flex-col items-start leading-none text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                Carrito
              </span>
              <span className="text-xs font-black text-white mt-0.5">
                {totalItems > 0 ? formatPrice(totalPrice) : 'Vacío'}
              </span>
            </div>

            <span className="min-w-6 h-6 px-2 rounded-full bg-white text-slate-950 text-xs font-black flex items-center justify-center">
              {totalItems}
            </span>
          </Button>
        </NavbarItem>
      </NavbarContent>

      {/* Menú Móvil */}
      <NavbarMenu className="pt-6 pb-8 px-6 bg-white/98 backdrop-blur-md border-t border-slate-100 space-y-2">
        {navLinks.map((link) => {
          const isActive =
            link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
          return (
            <NavbarMenuItem key={link.href}>
              <Link
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`w-full block px-4 py-3.5 rounded-xl text-sm font-black uppercase tracking-wider transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                {link.label}
              </Link>
            </NavbarMenuItem>
          );
        })}
      </NavbarMenu>
    </HeroNavbar>
  );
}
