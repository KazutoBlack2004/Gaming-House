import { Order, ShippingCarrierId } from '@/lib/types';

export interface BlueExpressCheckpoint {
  id: string;
  date: string;
  location: string;
  status: string;
  description: string;
}

export interface BlueExpressTrackingResponse {
  otNumber: string;
  serviceName: string;
  currentStatus: Order['shipping_status'];
  statusLabel: string;
  estimatedDelivery: string;
  destinationCity: string;
  destinationRegion: string;
  officialTrackingUrl: string;
  checkpoints: BlueExpressCheckpoint[];
}

/**
 * Calcula la tarifa de envío de Blue Express en Pesos Chilenos (CLP) según la modalidad y la Región.
 */
export function calculateBlueExpressRate(
  carrierId: ShippingCarrierId,
  region: string
): number {
  if (carrierId === 'retiro') return 0;

  const isExtremeRegion = ['Arica y Parinacota', 'Tarapacá', 'Antofagasta', 'Aysén', 'Magallanes'].includes(
    region
  );
  const isMetro = region === 'Región Metropolitana';

  if (carrierId === 'bluexpress_punto') {
    if (isMetro) return 2990;
    if (isExtremeRegion) return 4990;
    return 3690;
  }

  // bluexpress (Domicilio)
  if (isMetro) return 3990;
  if (isExtremeRegion) return 6990;
  return 4990;
}

/**
 * Genera la URL oficial de seguimiento en el portal público de Blue Express Chile.
 */
export function getBlueExpressOfficialUrl(otNumber: string): string {
  if (!otNumber) return 'https://www.blue.cl/seguimiento/';
  return `https://www.blue.cl/seguimiento/?n_seguimiento=${encodeURIComponent(otNumber.trim())}`;
}

/**
 * Construye el historial de eventos de seguimiento (Checkpoints) de Blue Express
 * según el estado logístico de la Orden de Transporte (OT).
 */
export function buildBlueExpressCheckpoints(
  otNumber: string,
  shippingStatus: Order['shipping_status'],
  city = 'Santiago',
  region = 'Región Metropolitana',
  createdAt?: string
): BlueExpressTrackingResponse {
  const baseTime = createdAt ? new Date(createdAt).getTime() : Date.now() - 7200000;
  const checkpoints: BlueExpressCheckpoint[] = [];

  // Paso 1: Siempre presente cuando existe OT
  checkpoints.push({
    id: 'chk-1',
    date: new Date(baseTime).toLocaleString(),
    location: 'Plataforma Digital Blue Express',
    status: 'Orden de Transporte Emitida',
    description: `Pre-admisión electrónica registrada con OT N° ${otNumber}.`,
  });

  if (
    shippingStatus === 'processing' ||
    shippingStatus === 'shipped' ||
    shippingStatus === 'delivered'
  ) {
    checkpoints.push({
      id: 'chk-2',
      date: new Date(baseTime + 3600000).toLocaleString(),
      location: 'Punto Blue / Sucursal de Origen',
      status: 'Recepcionado por Blue Express',
      description: 'Encomienda admitida físicamente y en ruta hacia Centro de Clasificación.',
    });
  }

  if (shippingStatus === 'shipped' || shippingStatus === 'delivered') {
    checkpoints.push({
      id: 'chk-3',
      date: new Date(baseTime + 14400000).toLocaleString(),
      location: 'Hub Logístico Pudahuel (Santiago)',
      status: 'En Tránsito a Destino',
      description: `Paquete clasificado y despachado hacia agencia de destino en ${city} (${region}).`,
    });
    checkpoints.push({
      id: 'chk-4',
      date: new Date(baseTime + 28800000).toLocaleString(),
      location: `Centro de Distribución ${city}`,
      status: 'En Reparto a Domicilio',
      description: 'Asignado a courier Blue Express para entrega en dirección del destinatario.',
    });
  }

  if (shippingStatus === 'delivered') {
    checkpoints.push({
      id: 'chk-5',
      date: new Date(baseTime + 43200000).toLocaleString(),
      location: `${city}, ${region}`,
      status: 'Entregado',
      description: 'Entrega finalizada con éxito en destino. Recepción conforme.',
    });
  }

  const statusMap: Record<Order['shipping_status'], string> = {
    unfulfilled: 'Pre-admisión (Esperando entrega en Punto Blue)',
    processing: 'Admitido en Sucursal Blue Express',
    shipped: 'En Tránsito / En Reparto Blue Express',
    delivered: 'Entregado en Destino',
    returned: 'Devuelto al Remitente',
  };

  return {
    otNumber,
    serviceName: 'Blue Express PyME Chile',
    currentStatus: shippingStatus,
    statusLabel: statusMap[shippingStatus] || statusMap.unfulfilled,
    estimatedDelivery: '24 a 72 horas hábiles',
    destinationCity: city,
    destinationRegion: region,
    officialTrackingUrl: getBlueExpressOfficialUrl(otNumber),
    checkpoints: checkpoints.reverse(), // Más reciente primero
  };
}
