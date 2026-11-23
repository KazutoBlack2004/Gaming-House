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
} from '@heroui/react';
import { ShoppingBag } from 'lucide-react';
import { useCartStore } from '@/lib/store/useCartStore';
import { formatPrice } from '@/lib/constants';

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
      maxWidth="full"
      height="4.5rem"
      className="bg-[#0c0e11]/90 backdrop-blur-2xl sticky top-0 z-40 border-b border-white/10"
      classNames={{
        wrapper: 'px-4 sm:px-8 lg:px-12 h-[4.5rem]',
      }}
    >
      {/* Izquierda: Toggle Móvil + Logo Directo (Sin caja cápsula) */}
      <NavbarContent justify="start" className="gap-3">
        <NavbarMenuToggle
          aria-label={isMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
          className="sm:hidden text-[#e2e2e6] w-10 h-10 hover:bg-white/5"
        />
        <NavbarBrand>
          <Link href="/" className="flex items-center gap-3 group">
            <svg
              viewBox="0 0 80 90"
              className="w-8 h-8 shrink-0 transition-transform duration-300 group-hover:scale-105 drop-shadow-[0_0_10px_rgba(0,255,136,0.35)]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="navNeonGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00FF88" />
                  <stop offset="100%" stopColor="#00E5FF" />
                </linearGradient>
              </defs>
              <path
                d="M 40 5 L 75 25 L 75 65 L 40 85 L 5 65 L 5 25 Z"
                fill="#111317"
                stroke="url(#navNeonGlow)"
                strokeWidth="4.5"
              />
              <path
                d="M 40 22 L 60 33 L 60 57 L 40 68 L 20 57 L 20 40 L 38 40 L 38 48 L 28 48 L 28 53 L 40 60 L 52 53 L 52 37 L 40 30 Z"
                fill="url(#navNeonGlow)"
              />
              <circle cx="40" cy="12" r="3" fill="#00FF88" />
            </svg>

            <span className="text-lg sm:text-xl font-black tracking-tight text-white uppercase leading-none font-heading">
              GAMING{' '}
              <span className="bg-gradient-to-r from-[#00ff88] to-[#00e5ff] bg-clip-text text-transparent">
                HOUSE
              </span>
            </span>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      {/* Centro: Enlaces Arquitectónicos a Altura Completa con Línea Inferior Neón (Sin Cápsulas) */}
      <NavbarContent className="hidden sm:flex gap-1 h-full" justify="center">
        {navLinks.map((link) => {
          const isActive =
            link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
          return (
            <NavbarItem key={link.href} className="h-full flex items-center">
              <Link
                href={link.href}
                className={`relative h-full px-6 flex items-center text-xs font-mono font-bold uppercase tracking-[0.18em] transition-colors ${
                  isActive
                    ? 'text-[#00ff88] bg-gradient-to-t from-[#00ff88]/[0.08] to-transparent after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-[#00ff88] after:shadow-[0_0_12px_#00ff88]'
                    : 'text-[#849585] hover:text-white after:content-[""] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-white/30 after:scale-x-0 hover:after:scale-x-100 after:transition-transform after:duration-200'
                }`}
              >
                {link.label}
              </Link>
            </NavbarItem>
          );
        })}
      </NavbarContent>

      {/* Derecha: Trigger de Carrito Integrado a la Barra (Sin Cápsulas Redondeadas) */}
      <NavbarContent justify="end" className="h-full">
        <NavbarItem className="h-full flex items-center">
          <button
            type="button"
            onClick={toggleCart}
            aria-label="Ver Carrito"
            className="group h-full pl-6 pr-2 border-l border-white/10 hover:bg-white/[0.03] flex items-center gap-3.5 transition-colors cursor-pointer"
          >
            <div className="relative flex items-center justify-center text-[#00ff88] group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>

            <div className="hidden sm:flex flex-col items-start leading-none text-left">
              <span className="text-[9px] font-mono font-bold uppercase tracking-[0.18em] text-[#849585] group-hover:text-[#b9cbb9] transition-colors">
                Carrito
              </span>
              <span className="text-xs font-mono font-bold text-white mt-1">
                {totalItems > 0 ? formatPrice(totalPrice) : 'Vacío'}
              </span>
            </div>

            <span className="min-w-6 h-6 px-1.5 bg-[#00ff88] text-[#003919] font-mono text-xs font-black flex items-center justify-center shadow-[0_0_12px_rgba(0,255,136,0.4)]">
              {totalItems}
            </span>
          </button>
        </NavbarItem>
      </NavbarContent>

      {/* Menú Móvil */}
      <NavbarMenu className="pt-4 pb-8 px-6 bg-[#0c0e11]/95 backdrop-blur-2xl border-t border-white/10 divide-y divide-white/5">
        {navLinks.map((link) => {
          const isActive =
            link.href === '/' ? pathname === '/' : pathname.startsWith(link.href);
          return (
            <NavbarMenuItem key={link.href}>
              <Link
                href={link.href}
                onClick={() => setIsMenuOpen(false)}
                className={`w-full flex items-center justify-between py-4 text-sm font-mono font-bold uppercase tracking-widest transition-colors ${
                  isActive
                    ? 'text-[#00ff88] border-l-2 border-[#00ff88] pl-3'
                    : 'text-[#b9cbb9] hover:text-white'
                }`}
              >
                <span>{link.label}</span>
              </Link>
            </NavbarMenuItem>
          );
        })}
      </NavbarMenu>
    </HeroNavbar>
  );
}
