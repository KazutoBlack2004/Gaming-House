# Plantilla Estándar de E-Commerce (Next.js + HeroUI + Supabase + Blue Express Chile)

Plantilla reutilizable de comercio electrónico lista para personalizar y desplegar para nuevos clientes en Chile. Construida con diseño minimalista y neutro (100% libre de marcas), precios en **Peso Chileno (`CLP`)**, conversión automática de imágenes a **`.webp`**, logística integrada con **Blue Express Chile** y **Portal de Administración Oculto por URL**.

---

## Características Principales

### Tienda Pública (`Storefront`)
- **Inicio Dinámico (`/`)**: Banner Hero configurable, grilla de Categorías activas y Productos Destacados.
- **Catálogo Avanzado (`/productos`)**: Filtros laterales colapsables (Categorías con contador, Rango de precios en CLP, Disponibilidad y Ofertas), barra de búsqueda en tiempo real, selector moderno de ordenamiento y paginación doble.
- **Detalle de Producto de Alta Conversión (`/productos/[slug]`)**:
  - Galería fija (*Sticky*) con tira vertical de miniaturas, **efecto lupa (Hover Zoom)** y **modal Lightbox a pantalla completa**.
  - Bloque destacado de Oferta Especial con cálculo automático de porcentaje y monto ahorrado en CLP.
  - Indicador visual de nivel de stock con barra de progreso e íconos.
  - Selector de variantes con miniaturas y stock individual.
- **Carrito Lateral (`CartDrawer`) y Checkout Sin Registro (`/checkout`)**:
  - Carrito persistente con soporte de variantes y fondo difuminado (`backdrop-blur`).
  - Cálculo de envío por Región de Chile con **Blue Express a Domicilio**, **Punto Blue / Copec** y **Retiro Presencial**.
  - Descuento automático de stock al confirmar la compra.
- **Seguimiento de Pedido en Línea (`/seguimiento`)**:
  - Búsqueda por **N° de Pedido** (`#1002`) o por **N° de Orden de Transporte (OT)** de Blue Express (`7100293841`), con línea de tiempo de 4 etapas, historial de eventos por sucursal/hub y enlace directo a `blue.cl`.
- **Páginas Legales para Validación de Pasarelas (`/terminos` y `/devoluciones`)**:
  - Adaptadas a la Ley del Consumidor en Chile (Ley N° 19.496, Garantía Legal 6 meses y Ley N° 19.628).

### Backoffice Administrativo Oculto (`/portal-admin-secure`)
- **Acceso exclusivo por URL directa**: Sin enlaces en la tienda pública, protegido con cabeceras `X-Robots-Tag: noindex, nofollow` y [`src/middleware.ts`](file:///c:/Users/chrys/Documents/Github/Plantilla%20Ecomerce/src/middleware.ts) preparado para futura autenticación.
- **Sidebar Lateral Desplegable**: Modo expandido (`w-64`) y modo compacto de íconos fijo a la izquierda (`w-20`).
- **5 Módulos Operativos**:
  1. **Dashboard Ejecutivo (`/dashboard`)**: KPIs en vivo (Ingresos aprobados, Ticket promedio, Pedidos por despachar, Alertas de bajo stock) y gráfico semanal.
  2. **Productos e Inventario (`/dashboard/productos`)**: Control rápido de stock (`-`/`+`), **descuentos rápidos de temporada en 1 clic** (`-10%` a `-50%`) y subida de imágenes con **conversión automática a `.webp`** ([`WebPImageUploader.tsx`](file:///c:/Users/chrys/Documents/Github/Plantilla%20Ecomerce/src/components/admin/WebPImageUploader.tsx)).
  3. **Categorías (`/dashboard/categorias`)**: Creación, edición, portada en `.webp` y visibilidad en tienda.
  4. **Pedidos y Despachos Blue Express (`/dashboard/ordenes`)**: Emisión de OT Blue Express, etiqueta de encomienda imprimible y consulta en vivo de eventos de seguimiento.
  5. **Historial de Auditoría (`/dashboard/auditoria`)**: Registro cronológico automático de todas las acciones realizadas.

---

## Inicio Rápido en Desarrollo

```bash
# 1. Instalar dependencias
npm install

# 2. Iniciar servidor local
npm run dev
```

- **Tienda Pública**: [http://localhost:3000](http://localhost:3000)
- **Seguimiento de Clientes**: [http://localhost:3000/seguimiento](http://localhost:3000/seguimiento)
- **Panel de Administración Oculto**: [http://localhost:3000/portal-admin-secure](http://localhost:3000/portal-admin-secure)

---

## Documentación Maestra (`/docs`)

- [**`docs/DEPLOYMENT_GUIDE.md`**](file:///c:/Users/chrys/Documents/Github/Plantilla%20Ecomerce/docs/DEPLOYMENT_GUIDE.md): Manual paso a paso para vender, adaptar y desplegar la plantilla para nuevos clientes (Supabase, Bucket `.webp`, Blue Express y cómo modificar el SQL).
- [**`docs/SUPABASE_SETUP.sql`**](file:///c:/Users/chrys/Documents/Github/Plantilla%20Ecomerce/docs/SUPABASE_SETUP.sql): Script SQL maestro completamente comentado sección por sección (Tablas, Triggers de Stock y Auditoría, Políticas RLS y Bucket Storage `.webp`).
- [**`docs/SECURITY_ISO27001_OWASP.md`**](file:///c:/Users/chrys/Documents/Github/Plantilla%20Ecomerce/docs/SECURITY_ISO27001_OWASP.md): Resumen de controles de seguridad, sanitización XSS, validación Zod y cabeceras HTTP.
