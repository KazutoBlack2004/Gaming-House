'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Chip,
  Button,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from '@heroui/react';
import {
  Truck,
  Eye,
  Search,
  MapPin,
  User,
  Mail,
  Phone,
  Package,
  X,
  RefreshCw,
  ExternalLink,
  Printer,
  CheckCircle2,
  Clock,
  Zap,
  ChevronDown,
} from 'lucide-react';
import { Order, ShippingCarrierId } from '@/lib/types';
import { SITE_CONFIG, SHIPPING_CARRIERS_CHILE, formatPrice } from '@/lib/constants';
import { useAdminStore } from '@/lib/store/useAdminStore';
import {
  BlueExpressTrackingResponse,
  buildBlueExpressCheckpoints,
  getBlueExpressOfficialUrl,
} from '@/lib/shipping/bluexpress';

const FIELD_LABEL_CLASS =
  'block text-[11px] font-extrabold uppercase tracking-wider text-slate-500 mb-1.5';
const FIELD_INPUT_CLASS =
  'w-full h-11 px-3.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900 focus:ring-2 focus:ring-slate-900/10 transition-all';

export default function AdminOrdersPage() {
  const { orders, updateOrderStatus } = useAdminStore();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [carrierSelect, setCarrierSelect] = useState<ShippingCarrierId>('bluexpress');
  const [shippingSelect, setShippingSelect] = useState<Order['shipping_status']>('unfulfilled');

  const [blueTracking, setBlueTracking] = useState<BlueExpressTrackingResponse | null>(null);
  const [isSyncingBlue, setIsSyncingBlue] = useState(false);
  const [isGeneratingOt, setIsGeneratingOt] = useState(false);
  const [showShippingLabel, setShowShippingLabel] = useState(false);

  const filteredOrders = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return orders.filter((o) => {
      if (
        q &&
        !o.order_number.toString().includes(q) &&
        !(o.tracking_number && o.tracking_number.toLowerCase().includes(q)) &&
        !o.payer_name.toLowerCase().includes(q) &&
        !o.payer_email.toLowerCase().includes(q)
      ) {
        return false;
      }
      if (statusFilter !== 'all' && o.shipping_status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [orders, searchQuery, statusFilter]);

  const fetchBlueExpressStatus = async (
    ot: string,
    status: Order['shipping_status'],
    city: string,
    region: string,
    createdAt?: string
  ) => {
    if (!ot.trim()) {
      setBlueTracking(null);
      return;
    }
    setIsSyncingBlue(true);
    try {
      const res = await fetch(
        `/api/shipping/bluexpress?ot=${encodeURIComponent(ot)}&status=${status}&city=${encodeURIComponent(
          city
        )}&region=${encodeURIComponent(region)}`
      );
      if (res.ok) {
        const data = await res.json();
        setBlueTracking(data.tracking);
      } else {
        setBlueTracking(buildBlueExpressCheckpoints(ot, status, city, region, createdAt));
      }
    } catch {
      setBlueTracking(buildBlueExpressCheckpoints(ot, status, city, region, createdAt));
    } finally {
      setIsSyncingBlue(false);
    }
  };

  useEffect(() => {
    if (selectedOrder && trackingInput.trim()) {
      fetchBlueExpressStatus(
        trackingInput,
        shippingSelect,
        selectedOrder.shipping_address.city,
        selectedOrder.shipping_address.state,
        selectedOrder.created_at
      );
    } else {
      setBlueTracking(null);
    }
  }, [selectedOrder, shippingSelect]);

  const handleOpenDetail = (order: Order) => {
    setSelectedOrder(order);
    setTrackingInput(order.tracking_number || '');
    setCarrierSelect(order.shipping_carrier || 'bluexpress');
    setShippingSelect(order.shipping_status);
    setShowShippingLabel(false);
    onOpen();
  };

  const handleGenerateBlueOt = async () => {
    if (!selectedOrder) return;
    setIsGeneratingOt(true);
    try {
      const res = await fetch('/api/shipping/bluexpress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: selectedOrder.order_number,
          recipientName: selectedOrder.payer_name,
          street: selectedOrder.shipping_address.street,
          city: selectedOrder.shipping_address.city,
          region: selectedOrder.shipping_address.state,
        }),
      });
      const data = await res.json();
      if (data.otNumber) {
        const nextStatus: Order['shipping_status'] =
          shippingSelect === 'unfulfilled' ? 'processing' : shippingSelect;
        setTrackingInput(data.otNumber);
        setShippingSelect(nextStatus);
        updateOrderStatus(selectedOrder.id, {
          tracking_number: data.otNumber,
          shipping_status: nextStatus,
          shipping_carrier: carrierSelect,
        });
        fetchBlueExpressStatus(
          data.otNumber,
          nextStatus,
          selectedOrder.shipping_address.city,
          selectedOrder.shipping_address.state,
          selectedOrder.created_at
        );
      }
    } finally {
      setIsGeneratingOt(false);
    }
  };

  const handleSaveOrderChanges = () => {
    if (!selectedOrder) return;
    updateOrderStatus(selectedOrder.id, {
      shipping_status: shippingSelect,
      shipping_carrier: carrierSelect,
      tracking_number: trackingInput.trim(),
    });
    onClose();
  };

  const handleQuickAdvance = (order: Order) => {
    const nextStatus: Order['shipping_status'] =
      order.shipping_status === 'unfulfilled'
        ? 'processing'
        : order.shipping_status === 'processing'
        ? 'shipped'
        : 'delivered';
    const autoOt =
      !order.tracking_number && nextStatus === 'shipped'
        ? '7100' + Math.floor(100000 + Math.random() * 900000).toString()
        : order.tracking_number;

    updateOrderStatus(order.id, {
      shipping_status: nextStatus,
      tracking_number: autoOt,
    });
  };

  const renderShippingBadge = (status: Order['shipping_status']) => {
    const map: Record<
      Order['shipping_status'],
      { label: string; color: 'warning' | 'primary' | 'success' | 'default' | 'danger' }
    > = {
      unfulfilled: { label: 'Pendiente OT', color: 'warning' },
      processing: { label: 'Admitido Blue Express', color: 'primary' },
      shipped: { label: 'En Tránsito Blue', color: 'primary' },
      delivered: { label: 'Entregado', color: 'success' },
      returned: { label: 'Devuelto', color: 'danger' },
    };
    const current = map[status] || map.unfulfilled;
    return (
      <Chip color={current.color} variant="flat" size="sm" className="font-bold text-xs">
        {current.label}
      </Chip>
    );
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Pedidos y Despachos Blue Express
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Emite Órdenes de Transporte (OT), imprime etiquetas de envío y consulta en vivo el rastreo de Blue Express Chile.
          </p>
        </div>

        <a
          href="https://www.blue.cl/pyme/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-2xs"
        >
          <Truck className="w-4 h-4" />
          <span>Portal Blue Express PyME</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Buscador y Filtros de Estado */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-2xs">
        <div className="flex items-center gap-2.5 flex-1 max-w-md bg-slate-50 border border-slate-200 focus-within:border-slate-900 focus-within:bg-white rounded-xl px-3.5 h-10 transition-all">
          <Search className="w-4 h-4 text-slate-400 shrink-0" />
          <input
            type="text"
            placeholder="Buscar por # pedido, N° OT Blue Express o cliente..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-transparent border-none outline-none text-xs font-medium text-slate-800 placeholder:text-slate-400"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-slate-400 hover:text-slate-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-1 bg-slate-100 p-1 rounded-xl">
          {[
            { id: 'all', label: 'Todos' },
            { id: 'unfulfilled', label: 'Sin OT / Pendientes' },
            { id: 'processing', label: 'Admitidos' },
            { id: 'shipped', label: 'En Tránsito' },
            { id: 'delivered', label: 'Entregados' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === tab.id
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla de Pedidos */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <Table
          aria-label="Tabla de gestión de pedidos"
          shadow="none"
          classNames={{
            wrapper: 'bg-white p-0 shadow-none',
            th: 'bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider text-[11px] py-4 border-b border-slate-100',
            td: 'py-4 border-b border-slate-50',
          }}
        >
          <TableHeader>
            <TableColumn>PEDIDO #</TableColumn>
            <TableColumn>CLIENTE / DESTINO</TableColumn>
            <TableColumn>TOTAL (CLP)</TableColumn>
            <TableColumn>OT BLUE EXPRESS</TableColumn>
            <TableColumn>ESTADO DE SEGUIMIENTO</TableColumn>
            <TableColumn align="end">ACCIONES</TableColumn>
          </TableHeader>
          <TableBody emptyContent="No se encontraron pedidos en este estado.">
            {filteredOrders.map((order) => (
              <TableRow key={order.id} className="hover:bg-slate-50/60 transition">
                <TableCell>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    #{order.order_number}
                  </span>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {new Date(order.created_at).toLocaleString()}
                  </p>
                </TableCell>
                <TableCell>
                  <div>
                    <h5 className="font-bold text-slate-800 text-xs">{order.payer_name}</h5>
                    <span className="text-[11px] text-slate-500">{order.payer_email}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {order.shipping_address.city}, {order.shipping_address.state}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-extrabold text-slate-900 text-sm">
                    {formatPrice(order.total_amount)}
                  </span>
                  <p className="text-[10px] text-emerald-600 font-bold uppercase">
                    {order.payment_status === 'approved' ? 'Pagado' : order.payment_status}
                  </p>
                </TableCell>
                <TableCell>
                  {order.tracking_number ? (
                    <div className="space-y-0.5">
                      <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200 inline-block">
                        OT: {order.tracking_number}
                      </span>
                      <span className="block text-[10px] text-slate-400 font-medium">
                        {order.shipping_carrier === 'bluexpress_punto'
                          ? 'Punto Blue / Copec'
                          : 'Blue Express Domicilio'}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-400 font-medium">Sin OT asignada</span>
                  )}
                </TableCell>
                <TableCell>{renderShippingBadge(order.shipping_status)}</TableCell>
                <TableCell align="right">
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      size="sm"
                      variant="bordered"
                      onPress={() => handleOpenDetail(order)}
                      startContent={<Eye className="w-3.5 h-3.5" />}
                      className="border-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                    >
                      Seguimiento y OT
                    </Button>
                    {order.shipping_status !== 'delivered' && (
                      <Button
                        size="sm"
                        onPress={() => handleQuickAdvance(order)}
                        startContent={<Truck className="w-3.5 h-3.5" />}
                        className="bg-slate-900 text-white font-bold text-xs rounded-xl"
                      >
                        Avanzar
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Modal Estandarizado de Ficha de Pedido y Seguimiento Blue Express */}
      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="3xl" scrollBehavior="inside">
        <ModalContent className="bg-white text-slate-900 border border-slate-200/80 shadow-2xl rounded-2xl">
          {(onCloseModal) =>
            selectedOrder && (
              <>
                <ModalHeader className="flex flex-col gap-0.5 border-b border-slate-100 px-6 py-4">
                  <span className="font-extrabold text-base text-slate-900">
                    Gestión de Pedido #{selectedOrder.order_number}
                  </span>
                  <span className="text-xs font-normal text-slate-400">
                    Registrado el {new Date(selectedOrder.created_at).toLocaleString()}
                  </span>
                </ModalHeader>

                <ModalBody className="p-6 space-y-6">
                  {/* 1. Sección Logística Blue Express (Alineada y sin recortes de overflow) */}
                  <div className="shrink-0 rounded-2xl border border-slate-200 bg-slate-50/70 p-5 space-y-5">
                    {/* Cabecera de la sección */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200/80 pb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0">
                          <Truck className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900">
                            Despacho y Seguimiento Blue Express
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            Asigna o genera la Orden de Transporte (OT) y revisa los movimientos del paquete.
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {trackingInput.trim() ? (
                          <>
                            <button
                              type="button"
                              onClick={() => setShowShippingLabel(!showShippingLabel)}
                              className="inline-flex items-center gap-1.5 px-3.5 h-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold transition-colors"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>{showShippingLabel ? 'Ocultar Etiqueta' : 'Ver Etiqueta'}</span>
                            </button>
                            <a
                              href={getBlueExpressOfficialUrl(trackingInput)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3.5 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors"
                            >
                              <span>Abrir en Blue.cl</span>
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          </>
                        ) : (
                          <button
                            type="button"
                            disabled={isGeneratingOt}
                            onClick={handleGenerateBlueOt}
                            className="inline-flex items-center gap-1.5 px-4 h-9 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-2xs"
                          >
                            <Zap className="w-3.5 h-3.5 text-amber-400" />
                            <span>
                              {isGeneratingOt ? 'Generando OT...' : 'Generar OT Blue Express'}
                            </span>
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Fila de Controles Estandarizados */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <label className={FIELD_LABEL_CLASS}>Modalidad de Envío</label>
                        <div className="relative">
                          <select
                            value={carrierSelect}
                            onChange={(e) => setCarrierSelect(e.target.value as ShippingCarrierId)}
                            className={`${FIELD_INPUT_CLASS} appearance-none pr-9 cursor-pointer`}
                          >
                            {SHIPPING_CARRIERS_CHILE.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>

                      <div>
                        <label className={FIELD_LABEL_CLASS}>N° Orden de Transporte (OT)</label>
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            placeholder="Ej: 7100293841"
                            value={trackingInput}
                            onChange={(e) => setTrackingInput(e.target.value)}
                            className={`${FIELD_INPUT_CLASS} font-mono`}
                          />
                          {trackingInput.trim() && (
                            <button
                              type="button"
                              onClick={() =>
                                fetchBlueExpressStatus(
                                  trackingInput,
                                  shippingSelect,
                                  selectedOrder.shipping_address.city,
                                  selectedOrder.shipping_address.state,
                                  selectedOrder.created_at
                                )
                              }
                              className="w-11 h-11 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 transition-colors"
                              title="Actualizar eventos de seguimiento"
                            >
                              <RefreshCw
                                className={`w-4 h-4 ${isSyncingBlue ? 'animate-spin' : ''}`}
                              />
                            </button>
                          )}
                        </div>
                      </div>

                      <div>
                        <label className={FIELD_LABEL_CLASS}>Estado del Envío</label>
                        <div className="relative">
                          <select
                            value={shippingSelect}
                            onChange={(e) =>
                              setShippingSelect(e.target.value as Order['shipping_status'])
                            }
                            className={`${FIELD_INPUT_CLASS} appearance-none pr-9 cursor-pointer`}
                          >
                            <option value="unfulfilled">1. Pre-admisión / Sin enviar</option>
                            <option value="processing">2. Admitido en Punto Blue</option>
                            <option value="shipped">3. En Tránsito / En Reparto</option>
                            <option value="delivered">4. Entregado en Destino</option>
                            <option value="returned">Devuelto al Remitente</option>
                          </select>
                          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    {/* Etiqueta Imprimible Blue Express */}
                    {showShippingLabel && trackingInput.trim() && (
                      <div className="p-5 rounded-2xl bg-white border-2 border-dashed border-slate-300 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                          <div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block">
                              ETIQUETA DE ENCOMIENDA
                            </span>
                            <h4 className="text-base font-black text-slate-900">
                              BLUE EXPRESS CHILE
                            </h4>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-bold text-slate-400 block">
                              ORDEN DE TRANSPORTE
                            </span>
                            <span className="font-mono text-sm font-black text-slate-900">
                              OT {trackingInput}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                          <div>
                            <span className="text-[10px] font-bold uppercase text-slate-400 block">
                              DESTINATARIO
                            </span>
                            <p className="font-black text-slate-900">{selectedOrder.payer_name}</p>
                            <p className="text-slate-600">{selectedOrder.shipping_address.phone}</p>
                          </div>
                          <div>
                            <span className="text-[10px] font-bold uppercase text-slate-400 block">
                              DIRECCIÓN Y COMUNA
                            </span>
                            <p className="font-bold text-slate-900">
                              {selectedOrder.shipping_address.street}
                            </p>
                            <p className="font-black text-slate-900 uppercase">
                              {selectedOrder.shipping_address.city} —{' '}
                              {selectedOrder.shipping_address.state}
                            </p>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                          <span>Pedido #{selectedOrder.order_number}</span>
                          <span>Remitente: {SITE_CONFIG.name}</span>
                        </div>
                      </div>
                    )}

                    {/* Historial de Movimientos Blue Express */}
                    {blueTracking ? (
                      <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-100 pb-2.5">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-xs font-extrabold text-slate-900 uppercase tracking-wider">
                              {blueTracking.statusLabel}
                            </span>
                          </div>
                          <span className="text-[11px] font-mono font-semibold text-slate-400">
                            Destino: {blueTracking.destinationCity}
                          </span>
                        </div>

                        <div className="space-y-2.5 pt-1">
                          {blueTracking.checkpoints.map((chk, idx) => (
                            <div key={chk.id} className="flex items-start gap-3 text-xs">
                              <div className="mt-0.5">
                                {idx === 0 ? (
                                  <CheckCircle2 className="w-4 h-4 text-slate-900 shrink-0" />
                                ) : (
                                  <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                  <span
                                    className={`font-bold ${
                                      idx === 0 ? 'text-slate-900' : 'text-slate-600'
                                    }`}
                                  >
                                    {chk.status}{' '}
                                    <span className="text-slate-400 font-medium">
                                      • {chk.location}
                                    </span>
                                  </span>
                                  <span className="text-[11px] font-mono text-slate-400">
                                    {chk.date}
                                  </span>
                                </div>
                                <p className="text-slate-500 text-[11px] mt-0.5">
                                  {chk.description}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="p-3.5 rounded-xl bg-white border border-slate-200/80 text-xs text-slate-500 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span>
                          Aún no se ha asignado una Orden de Transporte (OT) a este pedido.
                        </span>
                        <span className="font-bold text-slate-900">
                          Presiona &ldquo;Generar OT Blue Express&rdquo; o ingresa el código manualmente.
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 2. Datos del Comprador y Dirección */}
                  <div className="shrink-0 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" /> Datos del Cliente
                      </h4>
                      <p className="text-sm font-bold text-slate-900">
                        {selectedOrder.payer_name}
                      </p>
                      <p className="text-xs text-slate-600 flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {selectedOrder.payer_email}
                      </p>
                      {selectedOrder.shipping_address.phone && (
                        <p className="text-xs text-slate-600 flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-slate-400" />
                          {selectedOrder.shipping_address.phone}
                        </p>
                      )}
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5" /> Dirección de Despacho
                      </h4>
                      <p className="text-xs font-bold text-slate-900">
                        {selectedOrder.shipping_address.street}
                      </p>
                      <p className="text-xs text-slate-600">
                        {selectedOrder.shipping_address.city},{' '}
                        {selectedOrder.shipping_address.state}
                      </p>
                      {selectedOrder.shipping_address.notes && (
                        <p className="text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200/70">
                          Nota: {selectedOrder.shipping_address.notes}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 3. Productos Comprados en formato CLP */}
                  <div className="shrink-0 space-y-3">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5" /> Ítems del Pedido
                    </h4>

                    <div className="rounded-2xl border border-slate-200 overflow-hidden divide-y divide-slate-100">
                      {(selectedOrder.items && selectedOrder.items.length > 0
                        ? selectedOrder.items
                        : [
                            {
                              id: 'default-item',
                              order_id: selectedOrder.id,
                              title: 'Productos de la Orden',
                              quantity: 1,
                              unit_price: selectedOrder.total_amount,
                              total_price: selectedOrder.total_amount,
                            },
                          ]
                      ).map((item) => (
                        <div
                          key={item.id}
                          className="p-3.5 flex items-center justify-between text-xs bg-white"
                        >
                          <div>
                            <span className="font-bold text-slate-900 block">
                              {item.title}{' '}
                              {item.variant_title ? `— ${item.variant_title}` : ''}
                            </span>
                            <span className="text-slate-400">
                              Cantidad: {item.quantity} x {formatPrice(item.unit_price)}
                            </span>
                          </div>
                          <span className="font-black text-slate-900">
                            {formatPrice(item.total_price)}
                          </span>
                        </div>
                      ))}

                      {selectedOrder.shipping_cost !== undefined && (
                        <div className="px-3.5 py-2.5 bg-slate-50/50 flex items-center justify-between text-xs text-slate-600">
                          <span>Costo de Despacho Blue Express</span>
                          <span className="font-bold text-slate-900">
                            {selectedOrder.shipping_cost === 0
                              ? 'Gratis'
                              : formatPrice(selectedOrder.shipping_cost)}
                          </span>
                        </div>
                      )}

                      <div className="p-3.5 bg-slate-50 flex items-center justify-between text-sm font-black text-slate-900">
                        <span>Total Pagado (CLP)</span>
                        <span>{formatPrice(selectedOrder.total_amount)}</span>
                      </div>
                    </div>
                  </div>
                </ModalBody>

                <ModalFooter className="border-t border-slate-100 px-6 py-4">
                  <Button variant="light" onPress={onCloseModal} className="font-bold text-xs">
                    Cerrar
                  </Button>
                  <Button
                    onPress={handleSaveOrderChanges}
                    className="bg-slate-900 text-white font-bold text-xs px-6 rounded-xl"
                  >
                    Guardar Cambios del Pedido
                  </Button>
                </ModalFooter>
              </>
            )
          }
        </ModalContent>
      </Modal>
    </div>
  );
}
