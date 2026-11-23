import { Product, Category, ShippingCarrierId } from './types';

export const SITE_CONFIG = {
  name: process.env.NEXT_PUBLIC_SITE_NAME || "Gaming House",
  description:
    "Tu setup listo para ganar. PCs de escritorio armadas para gaming, streaming, estudio y trabajo profesional con envío a todo Chile.",
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
    description: "Tarjetas de débito Redcompra, crédito bancarias y prepago",
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
    name: 'PC Gamer Entrada',
    slug: 'pc-gamer-entrada',
    description:
      'PCs de escritorio armadas y optimizadas para iniciarse en el gaming competitivo con excelente fluidez y relación precio-rendimiento.',
    image_url: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1000&q=80',
    active: true,
    created_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-2',
    name: 'PC Gamer Gama Media',
    slug: 'pc-gamer-gama-media',
    description:
      'Equipos de escritorio ensamblados con gráficas dedicadas de última generación para jugar títulos actuales y eSports al máximo nivel.',
    image_url: 'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=1000&q=80',
    active: true,
    created_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-3',
    name: 'PC Gamer Gama Alta',
    slug: 'pc-gamer-gama-alta',
    description:
      'Torres de alto rendimiento con refrigeración avanzada, diseñadas para máxima calidad gráfica, streaming simultáneo y exigencia extrema.',
    image_url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1000&q=80',
    active: true,
    created_at: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'cat-4',
    name: 'PC Trabajo & Workstation',
    slug: 'pc-trabajo-workstation',
    description:
      'PCs de escritorio armadas para productividad, programación, arquitectura, edición de video, renderizado 3D y estudio.',
    image_url: 'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=1000&q=80',
    active: true,
    created_at: '2025-01-01T00:00:00.000Z',
  },
];

export const SAMPLE_PRODUCTS: Product[] = [
  {
    id: 'p1',
    category_id: 'cat-1',
    title: 'PC Gamer Pulse — Ryzen 5 5600GT',
    slug: 'pc-gamer-pulse-ryzen-5-5600gt',
    sku: 'GH-PC-001',
    description:
      'PC de escritorio armada lista para enchufar y jugar. Equipada con procesador AMD Ryzen 5 5600GT con gráficos Radeon Vega integrados, placa madre B550, gabinete con flujo de aire frontal mesh, fuente certificada 80 Plus y Windows instalado.',
    price: 429990,
    compare_at_price: 499990,
    stock: 14,
    images: [
      'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1000&q=80',
      'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=1000&q=80',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1000&q=80',
    ],
    featured: true,
    active: true,
    has_variants: true,
    variants: [
      {
        id: 'v1',
        title: '16GB RAM + 500GB SSD NVMe',
        stock: 9,
        attributes: { configuracion: '16GB / 500GB NVMe' },
      },
      {
        id: 'v2',
        title: '32GB RAM + 1TB SSD NVMe',
        stock: 5,
        attributes: { configuracion: '32GB / 1TB NVMe' },
      },
    ],
    created_at: '2025-01-08T00:00:00.000Z',
    category: SAMPLE_CATEGORIES[0],
  },
  {
    id: 'p2',
    category_id: 'cat-2',
    title: 'PC Gamer Striker — Core i5 + RTX 4060',
    slug: 'pc-gamer-striker-core-i5-rtx-4060',
    sku: 'GH-PC-002',
    description:
      'PC de escritorio armada de gama media con procesador Intel Core i5-12400F, tarjeta gráfica NVIDIA GeForce RTX 4060 8GB GDDR6, memoria Dual Channel de alta velocidad, almacenamiento SSD NVMe M.2 Gen4 y fuente 650W 80 Plus Bronze.',
    price: 849990,
    compare_at_price: 969990,
    stock: 10,
    images: [
      'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=1000&q=80',
      'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1000&q=80',
      'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=1000&q=80',
    ],
    featured: true,
    active: true,
    has_variants: true,
    variants: [
      {
        id: 'v3',
        title: '16GB RAM + 1TB SSD NVMe',
        stock: 6,
        attributes: { configuracion: '16GB / 1TB NVMe' },
      },
      {
        id: 'v4',
        title: '32GB RAM + 1TB SSD NVMe',
        stock: 4,
        attributes: { configuracion: '32GB / 1TB NVMe' },
      },
    ],
    created_at: '2025-01-07T00:00:00.000Z',
    category: SAMPLE_CATEGORIES[1],
  },
  {
    id: 'p3',
    category_id: 'cat-3',
    title: 'PC Gamer Apex Pro — Ryzen 7 + RTX 4070 Super',
    slug: 'pc-gamer-apex-pro-ryzen-7-rtx-4070-super',
    sku: 'GH-PC-003',
    description:
      'PC de escritorio armada de gama alta para máximo rendimiento y streaming. Equipada con AMD Ryzen 7 7700X, tarjeta gráfica NVIDIA GeForce RTX 4070 Super 12GB, 32GB RAM DDR5 6000MHz, refrigeración líquida 240mm y fuente 750W 80 Plus Gold.',
    price: 1549990,
    compare_at_price: 1729990,
    stock: 6,
    images: [
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1000&q=80',
      'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=1000&q=80',
    ],
    featured: true,
    active: true,
    has_variants: true,
    variants: [
      {
        id: 'v5',
        title: '32GB DDR5 + 1TB SSD NVMe Gen4',
        stock: 4,
        attributes: { configuracion: '32GB DDR5 / 1TB Gen4' },
      },
      {
        id: 'v6',
        title: '32GB DDR5 + 2TB SSD NVMe Gen4',
        stock: 2,
        attributes: { configuracion: '32GB DDR5 / 2TB Gen4' },
      },
    ],
    created_at: '2025-01-06T00:00:00.000Z',
    category: SAMPLE_CATEGORIES[2],
  },
  {
    id: 'p4',
    category_id: 'cat-4',
    title: 'PC Workstation Creator — Core i7 + RTX 4060 Ti',
    slug: 'pc-workstation-creator-core-i7-rtx-4060-ti',
    sku: 'GH-PC-004',
    description:
      'Estación de trabajo de escritorio armada para arquitectura, edición de video 4K, diseño CAD y modelado 3D. Procesador Intel Core i7-14700, gráfica RTX 4060 Ti, 32GB RAM, gabinete silencioso minimalista y almacenamiento NVMe ultrarrápido.',
    price: 1249990,
    compare_at_price: 1389990,
    stock: 7,
    images: [
      'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=1000&q=80',
      'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1000&q=80',
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
    title: 'PC Gamer Vortex — Core i3 + RX 6600',
    slug: 'pc-gamer-vortex-core-i3-rx-6600',
    sku: 'GH-PC-005',
    description:
      'PC gamer de escritorio armada de entrada con tarjeta de video dedicada AMD Radeon RX 6600 8GB, procesador Intel Core i3-12100F, 16GB RAM Dual Channel y 500GB SSD NVMe. Ideal para jugar todos tus títulos favoritos con gráfica dedicada.',
    price: 599990,
    compare_at_price: 679990,
    stock: 11,
    images: [
      'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1000&q=80',
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1000&q=80',
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
    title: 'PC Gamer Nitro — Ryzen 5 7600 + RTX 4060 Ti',
    slug: 'pc-gamer-nitro-ryzen-5-7600-rtx-4060-ti',
    sku: 'GH-PC-006',
    description:
      'PC de escritorio armada sobre plataforma AM5 DDR5 de última generación. Procesador AMD Ryzen 5 7600, NVIDIA GeForce RTX 4060 Ti 8GB, 32GB RAM DDR5, 1TB SSD NVMe Gen4 y gabinete templado con ventilación ARGB.',
    price: 1099990,
    compare_at_price: 1219990,
    stock: 8,
    images: [
      'https://images.unsplash.com/photo-1591488320449-011701bb6704?w=1000&q=80',
    ],
    featured: true,
    active: true,
    has_variants: false,
    created_at: '2025-01-03T00:00:00.000Z',
    category: SAMPLE_CATEGORIES[1],
  },
  {
    id: 'p7',
    category_id: 'cat-3',
    title: 'PC Gamer Titan Extreme — Ryzen 7 7800X3D + RTX 4080 Super',
    slug: 'pc-gamer-titan-extreme-ryzen-7-7800x3d-rtx-4080-super',
    sku: 'GH-PC-007',
    description:
      'Nuestra PC de escritorio armada tope de línea. Procesador gaming AMD Ryzen 7 7800X3D con tecnología 3D V-Cache, gráfica NVIDIA RTX 4080 Super 16GB, 32GB DDR5, 2TB SSD NVMe Gen4, refrigeración líquida 360mm y fuente 850W 80 Plus Gold.',
    price: 2399990,
    compare_at_price: 2649990,
    stock: 4,
    images: [
      'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1000&q=80',
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
    title: 'PC Escritorio Office & Estudio — Ryzen 5 Pro',
    slug: 'pc-escritorio-office-estudio-ryzen-5-pro',
    sku: 'GH-PC-008',
    description:
      'PC de escritorio armada silenciosa y veloz para oficina, teletrabajo, programación y estudios universitarios. Equipada con AMD Ryzen 5, 16GB RAM, 500GB SSD NVMe de arranque instantáneo, Wi-Fi integrado y gabinete compacto.',
    price: 389990,
    compare_at_price: 449990,
    stock: 18,
    images: [
      'https://images.unsplash.com/photo-1593640408182-31c70c8268f5?w=1000&q=80',
    ],
    featured: false,
    active: true,
    has_variants: false,
    created_at: '2025-01-01T00:00:00.000Z',
    category: SAMPLE_CATEGORIES[3],
  },
];
