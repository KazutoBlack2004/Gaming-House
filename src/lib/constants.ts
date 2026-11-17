import { Product, Category, ShippingCarrierId } from './types';

export const SITE_CONFIG = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "Tienda Demo",
  description: "Plantilla estándar de comercio electrónico.",
  currency: process.env.NEXT_PUBLIC_CURRENCY || "CLP",
  currencySymbol: "$",
  adminRoute: process.env.NEXT_PUBLIC_ADMIN_ROUTE_PATH || "/portal-admin-secure",
};

/**
 * Formatea cualquier monto numérico al estándar de Peso Chileno (CLP):
 * sin decimales y con separador de miles con punto (ej: $24.990).
 */
export function formatPrice(amount: number | undefined | null): string {
  const safeAmount = typeof amount === 'number' && !isNaN(amount) ? Math.round(amount) : 0;
  return `${SITE_CONFIG.currencySymbol}${safeAmount.toLocaleString('es-CL')}`;
}

export const PAYMENT_METHODS = [
  {
    id: "webpay",
    name: "Webpay Plus (Transbank)",
    description: "Tarjetas de débito Redcompra y crédito bancarias",
  },
  {
    id: "flow",
    name: "Flow Chile",
    description: "Webpay, Mach, Klap, Servipag y transferencias",
  },
  {
    id: "mercadopago",
    name: "Mercado Pago",
    description: "Tarjetas de crédito, débito y saldo en cuenta",
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Tarjetas internacionales, Apple Pay y Google Pay",
  },
];

/**
 * SERVICIOS DE ENVÍO BLUE EXPRESS CHILE (TARIFAS EN PESOS CHILENOS CLP)
 */
export const SHIPPING_CARRIERS_CHILE: {
  id: ShippingCarrierId;
  name: string;
  badge: string;
  description: string;
  estimatedDays: string;
  price: number;
  getTrackingUrl: (trackingNumber: string) => string;
}[] = [
  {
    id: 'bluexpress',
    name: 'Blue Express a Domicilio',
    badge: 'Cobertura Todo Chile',
    description: 'Entrega directa en tu domicilio con código de seguimiento OT en línea.',
    estimatedDays: '2 a 4 días hábiles',
    price: 3990,
    getTrackingUrl: (code) =>
      `https://www.blue.cl/seguimiento/?n_seguimiento=${encodeURIComponent(code)}`,
  },
  {
    id: 'bluexpress_punto',
    name: 'Blue Express — Punto Blue / Copec',
    badge: 'Tarifa Más Económica',
    description: 'Retira en el Punto Blue o estación Copec habilitada más cercana a tu comuna.',
    estimatedDays: '2 a 3 días hábiles',
    price: 2990,
    getTrackingUrl: (code) =>
      `https://www.blue.cl/seguimiento/?n_seguimiento=${encodeURIComponent(code)}`,
  },
  {
    id: 'retiro',
    name: 'Retiro Presencial en Tienda',
    badge: 'Gratis',
    description: 'Retira tu compra sin costo de envío previa coordinación.',
    estimatedDays: 'Listo en 24 horas',
    price: 0,
    getTrackingUrl: () => '',
  },
];

export const CHILE_REGIONS = [
  'Región Metropolitana',
  'Valparaíso',
  'Biobío',
  'Coquimbo',
  'Maule',
  'Araucanía',
  'Los Lagos',
  "O'Higgins",
  'Antofagasta',
  'Ñuble',
  'Los Ríos',
  'Tarapacá',
  'Atacama',
  'Arica y Parinacota',
  'Magallanes',
  'Aysén',
];

export const SAMPLE_CATEGORIES: Category[] = [
  {
    id: 'cat-1',
    name: 'Categoría 1',
    slug: 'categoria-1',
    description: 'Descripción de la categoría 1',
    image_url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    active: true,
    created_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-2',
    name: 'Categoría 2',
    slug: 'categoria-2',
    description: 'Descripción de la categoría 2',
    image_url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    active: true,
    created_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-3',
    name: 'Categoría 3',
    slug: 'categoria-3',
    description: 'Descripción de la categoría 3',
    image_url: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
    active: true,
    created_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-4',
    name: 'Categoría 4',
    slug: 'categoria-4',
    description: 'Descripción de la categoría 4',
    image_url: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80',
    active: true,
    created_at: '2025-01-01T00:00:00.000Z',
  },
];

export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'p1',
    category_id: 'cat-1',
    title: 'Producto de Ejemplo 1',
    slug: 'producto-ejemplo-1',
    sku: 'SKU-001',
    description: 'Descripción detallada del producto de ejemplo 1. Edita este contenido desde el panel de administración o conectando tu base de datos.',
    price: 24990,
    compare_at_price: 34990,
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80',
    ],
    featured: true,
    active: true,
    has_variants: true,
    variants: [
      { id: 'v1', title: 'Versión Estándar', stock: 15, attributes: { version: 'Estándar' } },
      { id: 'v2', title: 'Versión Plus', stock: 10, attributes: { version: 'Plus' } },
    ],
    created_at: '2025-01-08T00:00:00.000Z',
    category: SAMPLE_CATEGORIES[0],
  },
  {
    id: 'p2',
    category_id: 'cat-2',
    title: 'Producto de Ejemplo 2',
    slug: 'producto-ejemplo-2',
    sku: 'SKU-002',
    description: 'Descripción detallada del producto de ejemplo 2. Ideal para mostrar las características principales del artículo.',
    price: 49990,
    compare_at_price: 64990,
    stock: 15,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80',
    ],
    featured: true,
    active: true,
    has_variants: true,
    variants: [
      { id: 'v3', title: 'Opción A', stock: 8, attributes: { opcion: 'A' } },
      { id: 'v4', title: 'Opción B', stock: 7, attributes: { opcion: 'B' } },
    ],
    created_at: '2025-01-07T00:00:00.000Z',
    category: SAMPLE_CATEGORIES[1],
  },
  {
    id: 'p3',
    category_id: 'cat-3',
    title: 'Producto de Ejemplo 3',
    slug: 'producto-ejemplo-3',
    sku: 'SKU-003',
    description: 'Descripción detallada del producto de ejemplo 3. Personaliza imágenes, precios y stock fácilmente.',
    price: 19990,
    stock: 40,
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
    ],
    featured: false,
    active: true,
    has_variants: false,
    created_at: '2025-01-06T00:00:00.000Z',
    category: SAMPLE_CATEGORIES[2],
  },
  {
    id: 'p4',
    category_id: 'cat-4',
    title: 'Producto de Ejemplo 4',
    slug: 'producto-ejemplo-4',
    sku: 'SKU-004',
    description: 'Descripción detallada del producto de ejemplo 4. Plantilla adaptable a cualquier rubro o catálogo.',
    price: 29990,
    compare_at_price: 39990,
    stock: 10,
    images: [
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    ],
    featured: true,
    active: true,
    has_variants: false,
    created_at: '2025-01-05T00:00:00.000Z',
    category: SAMPLE_CATEGORIES[3],
  },
  {
    id: 'p5',
    category_id: 'cat-1',
    title: 'Producto de Ejemplo 5',
    slug: 'producto-ejemplo-5',
    sku: 'SKU-005',
    description: 'Descripción detallada del producto de ejemplo 5. Artículo estándar de demostración para el catálogo.',
    price: 79990,
    compare_at_price: 99990,
    stock: 8,
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
    ],
    featured: false,
    active: true,
    has_variants: false,
    created_at: '2025-01-04T00:00:00.000Z',
    category: SAMPLE_CATEGORIES[0],
  },
  {
    id: 'p6',
    category_id: 'cat-2',
    title: 'Producto de Ejemplo 6',
    slug: 'producto-ejemplo-6',
    sku: 'SKU-006',
    description: 'Descripción detallada del producto de ejemplo 6. Diseño limpio y neutro para cualquier tienda.',
    price: 14990,
    stock: 30,
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80',
    ],
    featured: false,
    active: true,
    has_variants: false,
    created_at: '2025-01-03T00:00:00.000Z',
    category: SAMPLE_CATEGORIES[1],
  },
  {
    id: 'p7',
    category_id: 'cat-3',
    title: 'Producto de Ejemplo 7',
    slug: 'producto-ejemplo-7',
    sku: 'SKU-007',
    description: 'Descripción detallada del producto de ejemplo 7. Configura tus propios atributos y categorías.',
    price: 44990,
    compare_at_price: 54990,
    stock: 18,
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80',
    ],
    featured: true,
    active: true,
    has_variants: false,
    created_at: '2025-01-02T00:00:00.000Z',
    category: SAMPLE_CATEGORIES[2],
  },
  {
    id: 'p8',
    category_id: 'cat-4',
    title: 'Producto de Ejemplo 8',
    slug: 'producto-ejemplo-8',
    sku: 'SKU-008',
    description: 'Descripción detallada del producto de ejemplo 8. Ideal para pruebas de filtrado y paginación.',
    price: 12990,
    stock: 50,
    images: [
      'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80',
    ],
    featured: false,
    active: true,
    has_variants: false,
    created_at: '2025-01-01T00:00:00.000Z',
    category: SAMPLE_CATEGORIES[3],
  },
];
