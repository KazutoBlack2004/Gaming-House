/**
 * CONFIGURACIÓN MAESTRA DE TEMA Y ESTILOS GLOBALES
 *
 * Modifica las propiedades de este archivo para personalizar los colores,
 * bordes y textos principales de la plantilla.
 */

export const THEME_CONFIG = {
  colors: {
    primary: '#0f172a',
    primaryHover: '#1e293b',
    primaryText: '#ffffff',
    accent: '#2563eb',
    accentLight: '#eff6ff',
    background: '#ffffff',
    surface: '#f8fafc',
    border: '#e2e8f0',
    textDark: '#0f172a',
    textMuted: '#64748b',
    badgeSale: '#ef4444',
  },

  borderRadius: {
    button: '0.75rem',
    card: '1rem',
    pill: '9999px',
  },

  hero: {
    badge: "BIENVENIDO",
    title: "CATÁLOGO DE PRODUCTOS",
    subtitle: "Encuentra nuestros productos disponibles con compra rápida y envío a domicilio.",
    ctaPrimaryText: "Ver Catálogo",
    bgImage: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&q=80",
  },

  valueProps: [
    { title: "ENVÍO A DOMICILIO", desc: "Despacho a todo el país", icon: "Truck" },
    { title: "GARANTÍA", desc: "Cambios y devoluciones simples", icon: "RotateCcw" },
    { title: "PAGO SEGURO", desc: "Transacción 100% protegida", icon: "ShieldCheck" },
    { title: "SOPORTE", desc: "Atención al cliente", icon: "Headphones" },
  ],
};
