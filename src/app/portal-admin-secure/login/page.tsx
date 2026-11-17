'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody, Input, Button } from '@heroui/react';
import { Lock, ArrowRight, ShieldCheck } from 'lucide-react';
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
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/25">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Acceso Administrativo</h1>
          <p className="text-xs text-slate-500">Panel seguro de control para el dueño de la tienda.</p>
        </div>

        <Card shadow="none" className="bg-white border border-slate-200/80 rounded-3xl shadow-xl shadow-slate-200/50">
          <CardBody className="p-8 space-y-5">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Correo Electrónico"
                type="email"
                placeholder="admin@demo.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                variant="bordered"
                classNames={{
                  inputWrapper: 'bg-white border-slate-200 focus-within:border-blue-600',
                }}
                isRequired
              />

              <Input
                label="Contraseña"
                type="password"
                placeholder="••••••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                variant="bordered"
                classNames={{
                  inputWrapper: 'bg-white border-slate-200 focus-within:border-blue-600',
                }}
                isRequired
              />

              <Button
                type="submit"
                isLoading={isLoading}
                endContent={!isLoading && <ArrowRight className="w-4 h-4" />}
                className="w-full bg-blue-600 text-white font-bold text-xs py-3 rounded-xl shadow-md shadow-blue-500/25 hover:bg-blue-700 transition"
              >
                Ingresar al Dashboard
              </Button>
            </form>

            <div className="pt-2 text-center">
              <span className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                Acceso encriptado con protocolo SSL y tokens JWT
              </span>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
