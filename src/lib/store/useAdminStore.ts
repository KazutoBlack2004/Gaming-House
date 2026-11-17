import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Product, Category, Order, AuditLog } from '@/lib/types';
import { SAMPLE_PRODUCTS, SAMPLE_CATEGORIES, formatPrice } from '@/lib/constants';

const INITIAL_ORDERS: Order[] = [
  {
    id: 'ord-1003',
    order_number: 1003,
    external_payment_id: 'TRX-883192',
    payment_method: 'Webpay Plus (Transbank)',
    payment_status: 'approved',
    shipping_status: 'unfulfilled',
    shipping_carrier: 'bluexpress',
    shipping_cost: 3990,
    tracking_number: '',
    total_amount: 78970,
    currency: 'CLP',
    payer_email: 'cliente1@ejemplo.com',
    payer_name: 'Cliente Ejemplo 1',
    payer_phone: '+56 9 9988 7766',
    shipping_address: {
      fullName: 'Cliente Ejemplo 1',
      email: 'cliente1@ejemplo.com',
      phone: '+56 9 9988 7766',
      street: 'Av. Principal 1240, Depto 402',
      city: 'Santiago',
      state: 'Región Metropolitana',
      zipCode: '7500000',
      notes: 'Entregar en conserjería.',
    },
    items: [
      {
        id: 'item-1',
        order_id: 'ord-1003',
        product_id: 'p1',
        variant_id: 'v1',
        variant_title: 'Versión Estándar',
        title: 'Producto de Ejemplo 1',
        quantity: 1,
        unit_price: 24990,
        total_price: 24990,
      },
      {
        id: 'item-2',
        order_id: 'ord-1003',
        product_id: 'p2',
        variant_id: 'v3',
        variant_title: 'Opción A',
        title: 'Producto de Ejemplo 2',
        quantity: 1,
        unit_price: 49990,
        total_price: 49990,
      },
    ],
    created_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: 'ord-1002',
    order_number: 1002,
    external_payment_id: 'TRX-998125',
    payment_method: 'Mercado Pago',
    payment_status: 'approved',
    shipping_status: 'shipped',
    shipping_carrier: 'bluexpress',
    shipping_cost: 3990,
    tracking_number: '7100293841',
    total_amount: 33980,
    currency: 'CLP',
    payer_email: 'cliente2@ejemplo.com',
    payer_name: 'Cliente Ejemplo 2',
    payer_phone: '+56 9 4455 6677',
    shipping_address: {
      fullName: 'Cliente Ejemplo 2',
      email: 'cliente2@ejemplo.com',
      phone: '+56 9 4455 6677',
      street: 'Calle Central 450',
      city: 'Viña del Mar',
      state: 'Valparaíso',
      zipCode: '2520000',
    },
    items: [
      {
        id: 'item-3',
        order_id: 'ord-1002',
        product_id: 'p4',
        title: 'Producto de Ejemplo 4',
        quantity: 1,
        unit_price: 29990,
        total_price: 29990,
      },
    ],
    created_at: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: 'ord-1001',
    order_number: 1001,
    external_payment_id: 'TRX-55120',
    payment_method: 'Flow Chile',
    payment_status: 'approved',
    shipping_status: 'delivered',
    shipping_carrier: 'bluexpress_punto',
    shipping_cost: 2990,
    tracking_number: '7100441029',
    total_amount: 42970,
    currency: 'CLP',
    payer_email: 'cliente3@ejemplo.com',
    payer_name: 'Cliente Ejemplo 3',
    payer_phone: '+56 9 1122 3344',
    shipping_address: {
      fullName: 'Cliente Ejemplo 3',
      email: 'cliente3@ejemplo.com',
      phone: '+56 9 1122 3344',
      street: 'Av. Norte 1920',
      city: 'Concepción',
      state: 'Biobío',
      zipCode: '4030000',
    },
    items: [
      {
        id: 'item-4',
        order_id: 'ord-1001',
        product_id: 'p3',
        title: 'Producto de Ejemplo 3',
        quantity: 2,
        unit_price: 19990,
        total_price: 39980,
      },
    ],
    created_at: new Date(Date.now() - 172800000).toISOString(),
  },
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    admin_id: 'Administrador',
    action: 'UPDATE',
    table_name: 'products',
    record_id: 'p1',
    summary: 'Descuento de temporada aplicado en Producto de Ejemplo 1 ($34.990 -> $24.990)',
    old_data: { title: 'Producto de Ejemplo 1', price: 34990 },
    new_data: { title: 'Producto de Ejemplo 1', price: 24990 },
    ip_address: '127.0.0.1',
    created_at: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: 'log-2',
    admin_id: 'Administrador',
    action: 'INSERT',
    table_name: 'categories',
    record_id: 'cat-1',
    summary: 'Creación de Categoría 1',
    new_data: { name: 'Categoría 1', slug: 'categoria-1' },
    ip_address: '127.0.0.1',
    created_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: 'log-3',
    admin_id: 'Administrador',
    action: 'UPDATE',
    table_name: 'orders',
    record_id: 'ord-1002',
    summary: 'Despacho enviado por Blue Express en Pedido #1002 (OT: 7100293841)',
    old_data: { shipping_status: 'unfulfilled' },
    new_data: { shipping_status: 'shipped', tracking_number: '7100293841' },
    ip_address: '127.0.0.1',
    created_at: new Date(Date.now() - 14400000).toISOString(),
  },
];

interface AdminStoreState {
  products: Product[];
  categories: Category[];
  orders: Order[];
  auditLogs: AuditLog[];

  upsertProduct: (product: Product) => void;
  deleteProduct: (id: string) => void;
  adjustStock: (id: string, delta: number) => void;
  applyProductDiscount: (id: string, discountPercent: number | null) => void;

  upsertCategory: (category: Category) => void;
  deleteCategory: (id: string) => void;

  updateOrderStatus: (
    orderId: string,
    updates: Partial<
      Pick<Order, 'shipping_status' | 'payment_status' | 'tracking_number' | 'shipping_carrier'>
    >
  ) => void;
  addOrder: (order: Order) => void;
}

export const useAdminStore = create<AdminStoreState>()(
  persist(
    (set, get) => ({
      products: SAMPLE_PRODUCTS,
      categories: SAMPLE_CATEGORIES,
      orders: INITIAL_ORDERS,
      auditLogs: INITIAL_AUDIT_LOGS,

      upsertProduct: (product) => {
        const currentProducts = get().products;
        const categories = get().categories;
        const matchedCat = categories.find((c) => c.id === product.category_id);
        const enrichedProduct: Product = {
          ...product,
          price: Math.round(product.price),
          compare_at_price: product.compare_at_price
            ? Math.round(product.compare_at_price)
            : undefined,
          category: matchedCat || product.category,
        };

        const existing = currentProducts.find((p) => p.id === product.id);
        const updatedProducts = existing
          ? currentProducts.map((p) => (p.id === product.id ? enrichedProduct : p))
          : [enrichedProduct, ...currentProducts];

        const newLog: AuditLog = {
          id: 'log-' + Date.now(),
          admin_id: 'Administrador',
          action: existing ? 'UPDATE' : 'INSERT',
          table_name: 'products',
          record_id: product.id,
          summary: existing
            ? `Producto editado: ${product.title} (${formatPrice(enrichedProduct.price)} | Stock: ${
                product.stock
              })`
            : `Nuevo producto creado: ${product.title} (${formatPrice(enrichedProduct.price)})`,
          old_data: existing
            ? { title: existing.title, price: existing.price, stock: existing.stock }
            : undefined,
          new_data: { title: product.title, price: enrichedProduct.price, stock: product.stock },
          ip_address: '127.0.0.1',
          created_at: new Date().toISOString(),
        };

        set({
          products: updatedProducts,
          auditLogs: [newLog, ...get().auditLogs],
        });
      },

      deleteProduct: (id) => {
        const target = get().products.find((p) => p.id === id);
        if (!target) return;

        const newLog: AuditLog = {
          id: 'log-' + Date.now(),
          admin_id: 'Administrador',
          action: 'DELETE',
          table_name: 'products',
          record_id: id,
          summary: `Producto eliminado: ${target.title}`,
          old_data: { title: target.title, price: target.price },
          ip_address: '127.0.0.1',
          created_at: new Date().toISOString(),
        };

        set({
          products: get().products.filter((p) => p.id !== id),
          auditLogs: [newLog, ...get().auditLogs],
        });
      },

      adjustStock: (id, delta) => {
        const target = get().products.find((p) => p.id === id);
        if (!target) return;
        const newStock = Math.max(0, target.stock + delta);
        if (newStock === target.stock) return;

        const updatedProducts = get().products.map((p) =>
          p.id === id ? { ...p, stock: newStock } : p
        );

        const newLog: AuditLog = {
          id: 'log-' + Date.now(),
          admin_id: 'Administrador',
          action: 'UPDATE',
          table_name: 'products',
          record_id: id,
          summary: `Ajuste rápido de stock en ${target.title} (${target.stock} -> ${newStock} un.)`,
          old_data: { stock: target.stock },
          new_data: { stock: newStock },
          ip_address: '127.0.0.1',
          created_at: new Date().toISOString(),
        };

        set({
          products: updatedProducts,
          auditLogs: [newLog, ...get().auditLogs],
        });
      },

      applyProductDiscount: (id, discountPercent) => {
        const target = get().products.find((p) => p.id === id);
        if (!target) return;

        const baseOriginalPrice =
          target.compare_at_price && target.compare_at_price > target.price
            ? target.compare_at_price
            : target.price;

        let newPrice = baseOriginalPrice;
        let newCompareAt: number | undefined = undefined;

        if (discountPercent && discountPercent > 0 && discountPercent < 100) {
          newPrice = Math.round(baseOriginalPrice * (1 - discountPercent / 100));
          newCompareAt = baseOriginalPrice;
        }

        const updatedProducts = get().products.map((p) =>
          p.id === id
            ? { ...p, price: newPrice, compare_at_price: newCompareAt }
            : p
        );

        const newLog: AuditLog = {
          id: 'log-' + Date.now(),
          admin_id: 'Administrador',
          action: 'UPDATE',
          table_name: 'products',
          record_id: id,
          summary:
            discountPercent && discountPercent > 0
              ? `Oferta de -${discountPercent}% activada en ${target.title} (${formatPrice(
                  baseOriginalPrice
                )} -> ${formatPrice(newPrice)})`
              : `Oferta desactivada en ${target.title} (Precio restaurado a ${formatPrice(
                  baseOriginalPrice
                )})`,
          old_data: { price: target.price, compare_at_price: target.compare_at_price },
          new_data: { price: newPrice, compare_at_price: newCompareAt },
          ip_address: '127.0.0.1',
          created_at: new Date().toISOString(),
        };

        set({
          products: updatedProducts,
          auditLogs: [newLog, ...get().auditLogs],
        });
      },

      upsertCategory: (category) => {
        const currentCategories = get().categories;
        const existing = currentCategories.find((c) => c.id === category.id);
        const updatedCategories = existing
          ? currentCategories.map((c) => (c.id === category.id ? category : c))
          : [...currentCategories, category];

        const updatedProducts = get().products.map((p) =>
          p.category_id === category.id || p.category?.id === category.id
            ? { ...p, category_id: category.id, category }
            : p
        );

        const newLog: AuditLog = {
          id: 'log-' + Date.now(),
          admin_id: 'Administrador',
          action: existing ? 'UPDATE' : 'INSERT',
          table_name: 'categories',
          record_id: category.id,
          summary: existing
            ? `Categoría actualizada: ${category.name} (/${category.slug})`
            : `Nueva categoría creada: ${category.name} (/${category.slug})`,
          old_data: existing ? { name: existing.name, slug: existing.slug } : undefined,
          new_data: { name: category.name, slug: category.slug },
          ip_address: '127.0.0.1',
          created_at: new Date().toISOString(),
        };

        set({
          categories: updatedCategories,
          products: updatedProducts,
          auditLogs: [newLog, ...get().auditLogs],
        });
      },

      deleteCategory: (id) => {
        const target = get().categories.find((c) => c.id === id);
        if (!target) return;

        const newLog: AuditLog = {
          id: 'log-' + Date.now(),
          admin_id: 'Administrador',
          action: 'DELETE',
          table_name: 'categories',
          record_id: id,
          summary: `Categoría eliminada: ${target.name}`,
          old_data: { name: target.name, slug: target.slug },
          ip_address: '127.0.0.1',
          created_at: new Date().toISOString(),
        };

        set({
          categories: get().categories.filter((c) => c.id !== id),
          auditLogs: [newLog, ...get().auditLogs],
        });
      },

      updateOrderStatus: (orderId, updates) => {
        const target = get().orders.find((o) => o.id === orderId);
        if (!target) return;

        const updatedOrders = get().orders.map((o) =>
          o.id === orderId ? { ...o, ...updates } : o
        );

        const newLog: AuditLog = {
          id: 'log-' + Date.now(),
          admin_id: 'Administrador',
          action: 'UPDATE',
          table_name: 'orders',
          record_id: orderId,
          summary: `Pedido #${target.order_number} actualizado (${
            updates.shipping_status || target.shipping_status
          }${updates.tracking_number ? ` • OT: ${updates.tracking_number}` : ''})`,
          old_data: {
            shipping_status: target.shipping_status,
            tracking_number: target.tracking_number,
          },
          new_data: updates,
          ip_address: '127.0.0.1',
          created_at: new Date().toISOString(),
        };

        set({
          orders: updatedOrders,
          auditLogs: [newLog, ...get().auditLogs],
        });
      },

      addOrder: (order) => {
        const updatedProducts = get().products.map((prod) => {
          const matchingItems = (order.items || []).filter(
            (item) => item.product_id === prod.id
          );
          if (matchingItems.length === 0) return prod;

          const totalQtyBought = matchingItems.reduce((sum, i) => sum + i.quantity, 0);
          const updatedVariants = prod.variants?.map((v) => {
            const variantItem = matchingItems.find((i) => i.variant_id === v.id);
            if (!variantItem) return v;
            return {
              ...v,
              stock: Math.max(0, v.stock - variantItem.quantity),
            };
          });

          return {
            ...prod,
            stock: Math.max(0, prod.stock - totalQtyBought),
            variants: updatedVariants,
          };
        });

        const newLog: AuditLog = {
          id: 'log-' + Date.now(),
          admin_id: 'Sistema Checkout',
          action: 'INSERT',
          table_name: 'orders',
          record_id: order.id,
          summary: `Nuevo Pedido #${order.order_number} recibido de ${
            order.payer_name
          } (${formatPrice(order.total_amount)}) — Stock descontado automáticamente`,
          new_data: { order_number: order.order_number, total: order.total_amount },
          ip_address: '127.0.0.1',
          created_at: new Date().toISOString(),
        };

        set({
          products: updatedProducts,
          orders: [order, ...get().orders],
          auditLogs: [newLog, ...get().auditLogs],
        });
      },
    }),
    {
      name: 'ecommerce-template-admin-store-clp',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
