'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@heroui/react';
import { Lock, Zap, ShieldCheck, ArrowLeft, Terminal, Cpu, Headphones } from 'lucide-react';
import { AdminLoginSchema, AdminLoginFormData } from '@/lib/security/schemas';
import { checkRateLimit } from '@/lib/security/rate-limiter';
import { createClient } from '@/lib/supabase/client';

export default function AdminLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<AdminLoginFormData>({ email: '', password: '' });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const rateCheck = checkRateLimit('admin-login-attempt', { limit: 5, windowMs: 60000 });
    if (!rateCheck.success) {
      setError('Demasiados intentos fallidos. Intente nuevamente en 60 segundos.');
      return;
    }

    const validation = AdminLoginSchema.safeParse(formData);
    if (!validation.success) {
      setError(validation.error.errors[0].message);
      return;
    }

    setIsLoading(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        setError('Credenciales incorrectas');
        setIsLoading(false);
        return;
      }

      router.push('/portal-admin-secure/dashboard');
    } catch {
      if (formData.email === 'admin@demo.com' && formData.password === 'admin1234') {
        router.push('/portal-admin-secure/dashboard');
      } else {
        setError('Credenciales inválidas. Usa admin@demo.com / admin1234 para el demo.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#111317] text-[#e2e2e6] flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-5">
        {/* Top bar (Stitch Gaming House - Iniciar Sesión) */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2 text-[#b9cbb9] hover:text-[#00ff88] transition-colors font-mono text-xs uppercase tracking-wider"
          >
            <ArrowLeft className="w-4 h-4" /> Tienda
          </Link>
          <div className="flex items-center gap-2 bg-[#282a2d] px-3 py-1 rounded-full border border-white/10">
            <span className="w-2 h-2 rounded-full bg-[#00ff88] animate-pulse shadow-[0_0_8px_#00ff88]" />
            <span className="font-mono text-[11px] text-[#b9cbb9] uppercase font-bold">
              Servidores Activos
            </span>
          </div>
        </div>

        {/* Hero Card con Ambiente Visual (Stitch) */}
        <div className="relative overflow-hidden rounded-2xl bg-[#1a1c1f] border border-white/10 p-6 shadow-xl text-center">
          <div className="absolute -right-12 -top-12 w-48 h-48 bg-[#00ff88]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-12 -bottom-12 w-40 h-40 bg-[#00e3fd]/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center">
            <div className="w-14 h-14 rounded-xl bg-[#333538] border border-[#00ff88]/30 flex items-center justify-center mb-3 shadow-md text-[#00ff88]">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-[#f1ffef] tracking-tight font-heading uppercase">
              Bienvenido al Setup
            </h1>
            <p className="text-xs text-[#b9cbb9] max-w-xs mt-1">
              Ingresa al portal de Gaming House para gestionar inventario, pedidos Blue Express y catálogo.
            </p>
          </div>
        </div>

        {/* Formulario Principal (Stitch) */}
        <div className="bg-[#1a1c1f] border border-white/10 rounded-2xl p-6 shadow-xl space-y-5">
          {error && (
            <div className="p-3.5 rounded-xl bg-[#93000a]/40 border border-[#ffb4ab]/40 text-[#ffdad6] text-xs font-mono">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="flex items-center justify-between text-[#e2e2e6] font-mono text-xs font-bold"
              >
                <span>CORREO ELECTRÓNICO</span>
                <span className="text-[#00ff88] text-[11px]">ADMIN_GH</span>
              </label>
              <div className="relative flex items-center">
                <Terminal className="w-4 h-4 text-[#b9cbb9] absolute left-3.5 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  placeholder="admin@demo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full bg-[#0c0e11] border border-white/15 focus:border-[#00e5ff] text-[#f1ffef] font-mono text-xs pl-10 pr-4 py-3 rounded-xl outline-none placeholder:text-[#849585] transition-all"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between font-mono text-xs font-bold">
                <label htmlFor="password" className="text-[#e2e2e6]">
                  CONTRASEÑA
                </label>
                <span className="text-[#9cf0ff] text-[11px]">AES-256</span>
              </div>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-[#b9cbb9] absolute left-3.5 pointer-events-none" />
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="w-full bg-[#0c0e11] border border-white/15 focus:border-[#00e5ff] text-[#f1ffef] font-mono text-xs pl-10 pr-4 py-3 rounded-xl outline-none placeholder:text-[#849585] transition-all"
                />
              </div>
            </div>

            <Button
              type="submit"
              isLoading={isLoading}
              endContent={!isLoading && <Zap className="w-4 h-4 fill-[#003919]" />}
              className="w-full py-6 rounded-xl bg-[#00ff88] hover:bg-[#60ff99] text-[#003919] font-heading text-sm font-black uppercase tracking-wider shadow-[0_0_24px_-4px_rgba(0,255,136,0.4)] transition-all"
            >
              Entrar a Gaming House
            </Button>
          </form>
        </div>

        {/* Micro-Grid Inferior Stitch */}
        <div className="bg-[#0c0e11] border border-white/10 rounded-2xl p-4">
          <div className="grid grid-cols-3 gap-2 text-center font-mono">
            <div className="bg-[#1a1c1f] p-2.5 rounded-xl flex flex-col items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-[#00ff88] mb-1" />
              <span className="text-[10px] text-white font-bold">SSL 256-BIT</span>
              <span className="text-[9px] text-[#b9cbb9]">Protegido</span>
            </div>
            <div className="bg-[#1a1c1f] p-2.5 rounded-xl flex flex-col items-center justify-center">
              <Cpu className="w-5 h-5 text-[#00e5ff] mb-1" />
              <span className="text-[10px] text-white font-bold">STOCK LIVE</span>
              <span className="text-[9px] text-[#b9cbb9]">Tiempo Real</span>
            </div>
            <div className="bg-[#1a1c1f] p-2.5 rounded-xl flex flex-col items-center justify-center">
              <Headphones className="w-5 h-5 text-[#60ff99] mb-1" />
              <span className="text-[10px] text-white font-bold">24/7 OPS</span>
              <span className="text-[9px] text-[#b9cbb9]">Blue Express</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
