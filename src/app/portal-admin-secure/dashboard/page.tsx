'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardBody, Button } from '@heroui/react';
import {
  DollarSign,
  ShoppingBag,
  Package,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  FolderTree,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { SITE_CONFIG, formatPrice } from '@/lib/constants';
import { useAdminStore } from '@/lib/store/useAdminStore';

const SALES_DATA = [
  { day: 'Lun', sales: 120000 },
  { day: 'Mar', sales: 210000 },
  { day: 'Mié', sales: 185000 },
  { day: 'Jue', sales: 290000 },
  { day: 'Vie', sales: 340000 },
  { day: 'Sáb', sales: 460000 },
  { day: 'Dom', sales: 390000 },
];

export default function AdminDashboardPage() {
  const { products, categories, orders } = useAdminStore();

  const approvedOrders = orders.filter((o) => o.payment_status === 'approved');
  const totalRevenue = approvedOrders.reduce((acc, o) => acc + o.total_amount, 0);
  const averageTicket =
    approvedOrders.length > 0 ? totalRevenue / approvedOrders.length : 0;

  const pendingShipmentCount = orders.filter(
    (o) => o.shipping_status === 'unfulfilled' || o.shipping_status === 'processing'
  ).length;

  const activeProductsCount = products.filter((p) => p.active).length;
  const lowStockProducts = products.filter((p) => p.stock <= 10);

  return (
    <div className="space-y-8">
      {/* Encabezado y Acciones Rápidas */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Resumen del Negocio
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Métricas en tiempo real de ventas, inventario y pedidos pendientes de despacho.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            as={Link}
            href="/portal-admin-secure/dashboard/categorias"
            variant="bordered"
            startContent={<FolderTree className="w-4 h-4" />}
            className="border-slate-200 bg-white text-slate-800 font-bold text-xs px-4 rounded-xl"
          >
            Categorías
          </Button>
          <Button
            as={Link}
            href="/portal-admin-secure/dashboard/productos"
            startContent={<Plus className="w-4 h-4" />}
            className="bg-slate-900 text-white font-bold shadow-xs text-xs px-4 rounded-xl"
          >
            Nuevo Producto
          </Button>
        </div>
      </div>

      {/* Tarjetas KPI Conectadas al Estado Real */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* KPI 1: Ventas Totales */}
        <Card shadow="none" className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs">
          <CardBody className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                Ingresos Aprobados
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900">
                {formatPrice(totalRevenue)}
              </h3>
              <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Ticket prom: {formatPrice(averageTicket)}
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-slate-100 text-slate-900 border border-slate-200">
              <DollarSign className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>

        {/* KPI 2: Pedidos */}
        <Card shadow="none" className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs">
          <CardBody className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                Pedidos Totales
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900">{orders.length}</h3>
              <span className="text-xs text-blue-600 font-semibold">
                {pendingShipmentCount} por despachar
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100">
              <ShoppingBag className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>

        {/* KPI 3: Catálogo Activo */}
        <Card shadow="none" className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs">
          <CardBody className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                Catálogo Activo
              </span>
              <h3 className="text-2xl font-extrabold text-slate-900">
                {activeProductsCount}
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                En {categories.length} categorías
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-100">
              <Package className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>

        {/* KPI 4: Alerta de Stock */}
        <Card shadow="none" className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs">
          <CardBody className="p-5 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                Alerta de Stock
              </span>
              <h3 className="text-2xl font-extrabold text-amber-600">
                {lowStockProducts.length} {lowStockProducts.length === 1 ? 'ítem' : 'ítems'}
              </h3>
              <span className="text-xs text-amber-600/80 font-medium">
                Stock igual o menor a 10 un.
              </span>
            </div>
            <div className="p-3 rounded-2xl bg-amber-50 text-amber-600 border border-amber-100">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Gráfico + Alertas de Inventario */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <Card
          shadow="none"
          className="lg:col-span-8 bg-white border border-slate-200/80 rounded-2xl shadow-2xs p-6"
        >
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div>
              <h3 className="font-bold text-base text-slate-900">Actividad Semanal de Ventas</h3>
              <p className="text-xs text-slate-400">
                Evolución de ingresos en los últimos 7 días.
              </p>
            </div>
            <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-600 rounded-full">
              Últimos 7 días
            </span>
          </div>

          <div className="h-64 pt-6">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={SALES_DATA}>
                <defs>
                  <linearGradient id="salesGradLight" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00ff88" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#00ff88" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" vertical={false} />
                <XAxis
                  dataKey="day"
                  stroke="#b9cbb9"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#b9cbb9"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(val) => formatPrice(Number(val))}
                />
                <Tooltip
                  formatter={(val: any) => [formatPrice(Number(val)), 'Ventas']}
                  contentStyle={{
                    backgroundColor: '#161920',
                    borderColor: '#00ff88',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,255,136,0.2)',
                    color: '#f1ffef',
                    fontWeight: '700',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#00ff88"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#salesGradLight)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Columna de Productos con Bajo Stock */}
        <Card
          shadow="none"
          className="lg:col-span-4 bg-white border border-slate-200/80 rounded-2xl shadow-2xs p-6 flex flex-col justify-between"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Reposición de Stock</h3>
                <p className="text-[11px] text-slate-400">
                  Productos con pocas unidades disponibles.
                </p>
              </div>
              <AlertTriangle className="w-4 h-4 text-amber-500" />
            </div>

            {lowStockProducts.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-400">
                Todo el catálogo cuenta con stock saludable.
              </div>
            ) : (
              <div className="space-y-3">
                {lowStockProducts.slice(0, 4).map((prod) => (
                  <div
                    key={prod.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/70"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-bold text-slate-900 truncate">{prod.title}</p>
                      <span className="text-[11px] text-slate-400 font-mono">
                        {prod.sku || prod.slug}
                      </span>
                    </div>
                    <span
                      className={`px-2.5 py-1 rounded-lg text-xs font-black shrink-0 ${prod.stock === 0
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-800'
                        }`}
                    >
                      {prod.stock} un.
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link
            href="/portal-admin-secure/dashboard/productos"
            className="mt-4 pt-3 border-t border-slate-100 text-xs font-bold text-slate-700 hover:text-slate-950 flex items-center justify-between"
          >
            <span>Gestionar inventario</span>
            <ArrowUpRight className="w-4 h-4" />
          </Link>
        </Card>
      </div>

      {/* Órdenes Recientes */}
      <Card
        shadow="none"
        className="bg-white border border-slate-200/80 rounded-2xl shadow-2xs overflow-hidden"
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-base text-slate-900">Últimos Pedidos Recibidos</h3>
            <p className="text-xs text-slate-400">
              Órdenes registradas recientemente listas para preparación y envío.
            </p>
          </div>
          <Link
            href="/portal-admin-secure/dashboard/ordenes"
            className="text-xs font-bold text-slate-900 hover:underline flex items-center gap-1"
          >
            Ver todos <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-b border-slate-100">
              <tr>
                <th className="px-6 py-3.5">Pedido</th>
                <th className="px-6 py-3.5">Cliente</th>
                <th className="px-6 py-3.5">Total</th>
                <th className="px-6 py-3.5">Medio de Pago</th>
                <th className="px-6 py-3.5">Estado de Envío</th>
                <th className="px-6 py-3.5 text-right">Fecha</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.slice(0, 5).map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/60 transition">
                  <td className="px-6 py-4 font-bold text-slate-900 font-mono">
                    #{order.order_number}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-semibold text-slate-800 block">{order.payer_name}</span>
                    <span className="text-[11px] text-slate-400">{order.payer_email}</span>
                  </td>
                  <td className="px-6 py-4 font-bold text-slate-900">
                    {formatPrice(order.total_amount)}
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-medium text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md text-[11px]">
                      {order.payment_method || 'Pasarela Online'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${order.shipping_status === 'delivered'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : order.shipping_status === 'shipped'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                    >
                      {order.shipping_status === 'unfulfilled'
                        ? 'Pendiente'
                        : order.shipping_status === 'processing'
                          ? 'En Preparación'
                          : order.shipping_status === 'shipped'
                            ? 'En Camino'
                            : 'Entregado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-slate-400 font-medium">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
