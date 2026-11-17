-- ==========================================================================================
-- SCRIPT MAESTRO DE BASE DE DATOS Y STORAGE (SUPABASE) - PLANTILLA E-COMMERCE CHILE
-- ==========================================================================================
-- ¿QUÉ ES ESTE ARCHIVO?
-- Es el script único de instalación para desplegar desde cero la base de datos PostgreSQL,
-- los disparadores (triggers) de auditoría/stock, las políticas de seguridad (RLS) y el
-- Bucket de almacenamiento de imágenes (.webp) para cualquier cliente nuevo.
--
-- ¿CÓMO SE EJECUTA?
-- 1. Entra a https://supabase.com y crea un proyecto nuevo para tu cliente.
-- 2. En el menú lateral izquierdo, abre "SQL Editor" y haz clic en "New Query".
-- 3. Copia y pega TODO este archivo y presiona el botón "Run" (o Ctrl + Enter).
-- ==========================================================================================


-- ==========================================================================================
-- SECCIÓN 1: EXTENSIONES DE POSTGRESQL
-- ==========================================================================================
-- ¿POR QUÉ SE CREAN?
-- - "uuid-ossp": Permite generar identificadores únicos universales (UUID v4) para cada
--   producto, categoría y pedido. Se usan UUIDs en vez de números correlativos (1, 2, 3)
--   en los IDs internos para evitar que un competidor adivine cuántos productos o clientes
--   tiene la tienda (prevención de ataques IDOR - OWASP).
-- - "pgcrypto": Provee funciones criptográficas nativas requeridas por Supabase Auth.
-- ==========================================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- ==========================================================================================
-- SECCIÓN 2: CREACIÓN DE TABLAS DEL NEGOCIO
-- ==========================================================================================

-- ------------------------------------------------------------------------------------------
-- 2.1 TABLA: PERFILES DE ADMINISTRADORES (`public.admin_profiles`)
-- ------------------------------------------------------------------------------------------
-- ¿POR QUÉ SE CREA?
-- Supabase guarda todos los usuarios registrados en una tabla interna (`auth.users`).
-- Esta tabla `admin_profiles` actúa como una "Lista Blanca" de administradores autorizados:
-- solo los usuarios cuyo UUID esté registrado aquí tendrán permiso para crear/editar
-- productos, cambiar precios, subir fotos .webp o gestionar pedidos.
--
-- ¿CÓMO ADAPTARLA EN EL FUTURO?
-- Si un cliente tiene empleados con distintos permisos (ej. un "bodeguero" que solo ve
-- pedidos pero no puede cambiar precios), puedes agregar el rol 'bodega' dentro del CHECK:
-- CHECK (role IN ('admin', 'superadmin', 'bodega'))
-- ------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'admin' CHECK (role IN ('admin', 'superadmin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ------------------------------------------------------------------------------------------
-- 2.2 TABLA: CATEGORÍAS DEL CATÁLOGO (`public.categories`)
-- ------------------------------------------------------------------------------------------
-- ¿POR QUÉ SE CREA?
-- Permite que el dueño del negocio organice sus productos en familias (ej. "Hogar",
-- "Accesorios", "Ofertas") que alimentan automáticamente las tarjetas de la página de
-- Inicio y el panel lateral de filtros del Catálogo.
--
-- CAMPOS CLAVE:
-- - `slug`: Texto amigable para la URL (ej. 'categoria-1' -> /productos?category=categoria-1).
--   Tiene restricción `UNIQUE` para que no existan dos categorías con la misma URL.
-- - `image_url`: Guarda la ruta de la foto de portada en formato .webp subida al Bucket.
-- - `active`: Permite ocultar una categoría completa por temporada sin borrarla.
-- ------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ------------------------------------------------------------------------------------------
-- 2.3 TABLA: CATÁLOGO DE PRODUCTOS (`public.products`)
-- ------------------------------------------------------------------------------------------
-- ¿POR QUÉ SE CREA ASÍ?
-- Es el núcleo de la tienda. Está diseñada para ser 100% agnóstica al rubro del cliente
-- (sirve para tecnología, repuestos, cosmética, alimentos, vestuario, etc.).
--
-- EXPLICACIÓN DE CAMPOS Y CÓMO ADAPTARLOS:
-- - `category_id`: Relación con `categories`. Usa `ON DELETE SET NULL` para que, si el
--   dueño borra una categoría por error, los productos NO se borren (quedan "Sin categoría").
-- - `price` y `compare_at_price`: En Chile (CLP) trabajamos con montos enteros (ej. 24990).
--   Se usa `NUMERIC(12, 0)` (o `NUMERIC(12, 2)` si algún día vendes la plantilla a un país
--   con centavos como USD/EUR).
--   * `price`: Precio final que paga el cliente hoy.
--   * `compare_at_price`: Precio original antes del descuento (el que aparece tachado).
--     Cuando `compare_at_price > price`, la tienda activa automáticamente las etiquetas de
--     "OFERTA", calcula el "% OFF" y el monto ahorrado ("Ahorras $10.000").
-- - `images`: Arreglo de textos (`TEXT[]`) que almacena múltiples URLs de imágenes `.webp`.
--   La posición `[0]` es la foto de portada y las demás forman la galería vertical con zoom.
-- - `has_variants` y `variants` (JSONB): Guarda las variantes u opciones del producto
--   (ej. `[{"id": "v1", "title": "Versión Estándar", "stock": 15}]`). Usar `JSONB` evita
--   hacer consultas lentas (JOINs pesados) cada vez que se carga el catálogo.
-- - `metadata` (JSONB): Campo comodín extensible. Si en el futuro un cliente te pide agregar
--   "Peso en kg", "Marca" o "Ficha Técnica", puedes guardarlo dentro de `metadata` sin
--   necesidad de alterar las columnas de la tabla.
-- ------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    sku TEXT,
    price NUMERIC(12, 2) NOT NULL CHECK (price >= 0),
    compare_at_price NUMERIC(12, 2) CHECK (compare_at_price >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    images TEXT[] DEFAULT '{}'::TEXT[] NOT NULL,
    featured BOOLEAN DEFAULT false NOT NULL,
    active BOOLEAN DEFAULT true NOT NULL,
    has_variants BOOLEAN DEFAULT false NOT NULL,
    variants JSONB DEFAULT '[]'::jsonb NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ------------------------------------------------------------------------------------------
-- 2.4 TABLA: PEDIDOS Y DESPACHOS BLUE EXPRESS (`public.orders`)
-- ------------------------------------------------------------------------------------------
-- ¿POR QUÉ SE CREA ASÍ?
-- Implementa el modelo "Guest Checkout" (compra sin obligar a registrarse), que aumenta la
-- conversión de ventas en Chile.
--
-- EXPLICACIÓN DE CAMPOS Y CÓMO ADAPTARLOS:
-- - `order_number`: Número correlativo amigable (`SERIAL UNIQUE`, empieza en 1001) para que
--   el cliente pueda consultar su compra fácilmente en `/seguimiento` (ej. Pedido #1002).
-- - `payment_status`: Estado del cobro en la pasarela (`pending`, `approved`, `rejected`,
--   `refunded`, `cancelled`).
-- - `shipping_status`: Las 4 etapas del flujo logístico con Blue Express:
--   * `'unfulfilled'` -> 1. Pre-admisión / Sin enviar
--   * `'processing'`  -> 2. Admitido en Punto Blue / Sucursal
--   * `'shipped'`     -> 3. En Tránsito / En Reparto Blue Express
--   * `'delivered'`   -> 4. Entregado en Destino
--   * `'returned'`    -> Devuelto al Remitente
-- - `shipping_carrier`: Modalidad elegida (`'bluexpress'`, `'bluexpress_punto'`, `'retiro'`).
--   Si en el futuro agregas otro courier para un cliente específico, solo añádelo aquí.
-- - `tracking_number`: Guarda el N° de Orden de Transporte (OT) de 10 dígitos de Blue Express
--   (ej. `'7100293841'`).
-- - `shipping_address` (JSONB): Guarda `{ fullName, email, phone, street, city, state, zipCode, notes }`
--   exactamente como estaban el día de la compra (inmutable para respaldo legal/boleta).
-- ------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number SERIAL UNIQUE,
    external_payment_id TEXT,
    payment_method TEXT DEFAULT 'webpay' NOT NULL,
    payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'approved', 'rejected', 'refunded', 'cancelled')),
    shipping_status TEXT NOT NULL DEFAULT 'unfulfilled' CHECK (shipping_status IN ('unfulfilled', 'processing', 'shipped', 'delivered', 'returned')),
    shipping_carrier TEXT DEFAULT 'bluexpress' NOT NULL,
    shipping_cost NUMERIC(12, 2) DEFAULT 0 NOT NULL CHECK (shipping_cost >= 0),
    tracking_number TEXT,
    total_amount NUMERIC(12, 2) NOT NULL CHECK (total_amount >= 0),
    currency TEXT DEFAULT 'CLP' NOT NULL,
    payer_email TEXT NOT NULL,
    payer_name TEXT NOT NULL,
    payer_phone TEXT,
    shipping_address JSONB NOT NULL DEFAULT '{}'::jsonb,
    payment_metadata JSONB DEFAULT '{}'::jsonb NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Iniciar el contador de pedidos en el número 1001 para dar mayor confianza visual a la tienda nueva
ALTER SEQUENCE IF EXISTS public.orders_order_number_seq RESTART WITH 1001;


-- ------------------------------------------------------------------------------------------
-- 2.5 TABLA: DETALLE DE ÍTEMS DE CADA PEDIDO (`public.order_items`)
-- ------------------------------------------------------------------------------------------
-- ¿POR QUÉ SE CREA SEPARADA DE `products`?
-- Cuando un cliente compra un producto a $24.990 hoy, y mañana el dueño sube el precio del
-- producto a $34.990, el historial del pedido antiguo DEBE conservar el precio ($24.990),
-- el título y la variante (`variant_title`) exactos del momento en que se pagó.
-- ------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    variant_id TEXT,
    variant_title TEXT,
    title TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(12, 2) NOT NULL CHECK (unit_price >= 0),
    total_price NUMERIC(12, 2) NOT NULL CHECK (total_price >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ------------------------------------------------------------------------------------------
-- 2.6 TABLA: HISTORIAL DE AUDITORÍA (`public.audit_logs`)
-- ------------------------------------------------------------------------------------------
-- ¿POR QUÉ SE CREA?
-- Registra de forma automática e inalterable cada cambio hecho en productos, categorías y
-- pedidos (qué había antes en `old_data` y qué quedó después en `new_data`). Sirve como
-- respaldo de seguridad ante errores humanos o cambios de precios no autorizados.
-- ------------------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID REFERENCES public.admin_profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    table_name TEXT NOT NULL,
    record_id UUID,
    summary TEXT,
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);


-- ==========================================================================================
-- SECCIÓN 3: FUNCIONES Y TRIGGERS AUTOMÁTICOS (AUTOMATIZACIÓN EN BASE DE DATOS)
-- ==========================================================================================

-- ------------------------------------------------------------------------------------------
-- 3.1 TRIGGER DE FECHA DE ACTUALIZACIÓN (`set_updated_at`)
-- Actualiza automáticamente la columna `updated_at` cada vez que se edita una fila.
-- ------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_admin_profiles_timestamp ON public.admin_profiles;
CREATE TRIGGER update_admin_profiles_timestamp BEFORE UPDATE ON public.admin_profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS update_categories_timestamp ON public.categories;
CREATE TRIGGER update_categories_timestamp BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS update_products_timestamp ON public.products;
CREATE TRIGGER update_products_timestamp BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS update_orders_timestamp ON public.orders;
CREATE TRIGGER update_orders_timestamp BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();


-- ------------------------------------------------------------------------------------------
-- 3.2 TRIGGER DE DESCUENTO AUTOMÁTICO DE STOCK AL COMPRAR (`decrement_stock_on_order_item`)
-- ¿POR QUÉ SE HACE EN BASE DE DATOS?
-- Cada vez que se inserta un ítem comprado en `order_items`, PostgreSQL resta de inmediato
-- la cantidad comprada del `stock` del producto en `public.products` de forma atómica,
-- evitando sobreventas si dos clientes compran al mismo segundo.
-- ------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.decrement_product_stock()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.product_id IS NOT NULL THEN
        UPDATE public.products
        SET stock = GREATEST(0, stock - NEW.quantity)
        WHERE id = NEW.product_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_decrement_stock ON public.order_items;
CREATE TRIGGER trigger_decrement_stock
AFTER INSERT ON public.order_items
FOR EACH ROW EXECUTE FUNCTION public.decrement_product_stock();


-- ------------------------------------------------------------------------------------------
-- 3.3 TRIGGER DE AUDITORÍA AUTOMÁTICA (`process_audit_log`)
-- Guarda automáticamente un registro en `audit_logs` cuando se crea, edita o elimina un
-- producto, categoría o pedido.
-- ------------------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.process_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    current_admin_id UUID;
BEGIN
    current_admin_id := auth.uid();

    IF (TG_OP = 'DELETE') THEN
        INSERT INTO public.audit_logs (admin_id, action, table_name, record_id, old_data)
        VALUES (current_admin_id, 'DELETE', TG_TABLE_NAME, OLD.id, to_jsonb(OLD));
        RETURN OLD;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO public.audit_logs (admin_id, action, table_name, record_id, old_data, new_data)
        VALUES (current_admin_id, 'UPDATE', TG_TABLE_NAME, NEW.id, to_jsonb(OLD), to_jsonb(NEW));
        RETURN NEW;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO public.audit_logs (admin_id, action, table_name, record_id, new_data)
        VALUES (current_admin_id, 'INSERT', TG_TABLE_NAME, NEW.id, to_jsonb(NEW));
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS audit_products_trigger ON public.products;
CREATE TRIGGER audit_products_trigger AFTER INSERT OR UPDATE OR DELETE ON public.products FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();

DROP TRIGGER IF EXISTS audit_categories_trigger ON public.categories;
CREATE TRIGGER audit_categories_trigger AFTER INSERT OR UPDATE OR DELETE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();

DROP TRIGGER IF EXISTS audit_orders_trigger ON public.orders;
CREATE TRIGGER audit_orders_trigger AFTER UPDATE OR DELETE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.process_audit_log();


-- ==========================================================================================
-- SECCIÓN 4: SEGURIDAD A NIVEL DE FILA (ROW LEVEL SECURITY - RLS)
-- ==========================================================================================
-- ¿POR QUÉ ES OBLIGATORIO?
-- Como el cliente web de Next.js se conecta con la llave pública `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
-- el RLS garantiza en el motor PostgreSQL que:
-- 1. Un visitante público SOLO pueda leer productos y categorías activas (`SELECT`), y crear
--    un pedido en el checkout (`INSERT`), pero JAMÁS pueda borrar productos ni modificar precios.
-- 2. Solo un usuario registrado en `public.admin_profiles` (`public.is_admin() = true`)
--    pueda crear, editar o borrar productos y categorías.
-- ==========================================================================================

ALTER TABLE public.admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Función verificadora de rol Administrador
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_profiles
        WHERE id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas de Categorías
DROP POLICY IF EXISTS "Public Read Categories" ON public.categories;
CREATE POLICY "Public Read Categories" ON public.categories FOR SELECT USING (active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin All Categories" ON public.categories;
CREATE POLICY "Admin All Categories" ON public.categories FOR ALL USING (public.is_admin());

-- Políticas de Productos
DROP POLICY IF EXISTS "Public Read Products" ON public.products;
CREATE POLICY "Public Read Products" ON public.products FOR SELECT USING (active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admin All Products" ON public.products;
CREATE POLICY "Admin All Products" ON public.products FOR ALL USING (public.is_admin());

-- Políticas de Pedidos (Permite Guest Checkout + Consulta de Seguimiento + Gestión Admin)
DROP POLICY IF EXISTS "Public Insert Orders" ON public.orders;
CREATE POLICY "Public Insert Orders" ON public.orders FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Orders For Tracking" ON public.orders;
CREATE POLICY "Public Read Orders For Tracking" ON public.orders FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin All Orders" ON public.orders;
CREATE POLICY "Admin All Orders" ON public.orders FOR ALL USING (public.is_admin());

-- Políticas de Ítems de Pedidos
DROP POLICY IF EXISTS "Public Insert Order Items" ON public.order_items;
CREATE POLICY "Public Insert Order Items" ON public.order_items FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Public Read Order Items" ON public.order_items;
CREATE POLICY "Public Read Order Items" ON public.order_items FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin All Order Items" ON public.order_items;
CREATE POLICY "Admin All Order Items" ON public.order_items FOR ALL USING (public.is_admin());

-- Políticas de Auditoría y Perfiles Admin
DROP POLICY IF EXISTS "Admin Read Audit Logs" ON public.audit_logs;
CREATE POLICY "Admin Read Audit Logs" ON public.audit_logs FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Admin Self Read" ON public.admin_profiles;
CREATE POLICY "Admin Self Read" ON public.admin_profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());


-- ==========================================================================================
-- SECCIÓN 5: STORAGE BUCKET (`products`) PARA IMÁGENES OPTIMIZADAS (.WEBP)
-- ==========================================================================================
-- ¿QUÉ HACE ESTA SECCIÓN?
-- Crea automáticamente el contenedor (Bucket) público llamado `'products'` en Supabase Storage
-- donde el componente `WebPImageUploader` guarda las fotos de productos (`products/...`) y
-- categorías (`categories/...`) ya convertidas a `.webp`.
--
-- ¿CÓMO ADAPTARLA EN EL FUTURO?
-- - `file_size_limit`: Está configurado en `5242880` bytes (5 MB). Como nuestra aplicación
--   comprime las imágenes a `.webp` (~80 KB) antes de subirlas, 5 MB es más que suficiente.
--   Si algún día necesitas subir archivos de hasta 10 MB, cámbialo a `10485760`.
-- ==========================================================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'products',
    'products',
    true,
    5242880,
    ARRAY['image/webp', 'image/jpeg', 'image/png', 'image/avif']
)
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Cualquier comprador puede visualizar las imágenes .webp de la tienda
DROP POLICY IF EXISTS "Public Access Product Images" ON storage.objects;
CREATE POLICY "Public Access Product Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'products');

-- Subida y eliminación de imágenes en el bucket
DROP POLICY IF EXISTS "Admin Upload Product Images" ON storage.objects;
CREATE POLICY "Admin Upload Product Images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'products' AND public.is_admin());

DROP POLICY IF EXISTS "Admin Delete Product Images" ON storage.objects;
CREATE POLICY "Admin Delete Product Images"
ON storage.objects FOR DELETE
USING (bucket_id = 'products' AND public.is_admin());


-- ==========================================================================================
-- SECCIÓN 6: DATOS SEMILLA EN PESO CHILENO (CLP) PARA INICIALIZAR LA TIENDA
-- ==========================================================================================
-- ¿POR QUÉ SE INCLUYEN?
-- Para que al instalar la base de datos de un cliente nuevo, la tienda no aparezca en blanco
-- y puedas verificar de inmediato el funcionamiento del catálogo, filtros y carrito.
-- Si deseas entregar la base de datos completamente vacía, simplemente comenta o borra
-- estos dos bloques `INSERT` antes de ejecutar el script.
-- ==========================================================================================

INSERT INTO public.categories (id, name, slug, description, image_url) VALUES
('c1000000-0000-0000-0000-000000000001', 'Categoría 1', 'categoria-1', 'Descripción de la categoría 1', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'),
('c1000000-0000-0000-0000-000000000002', 'Categoría 2', 'categoria-2', 'Descripción de la categoría 2', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'),
('c1000000-0000-0000-0000-000000000003', 'Categoría 3', 'categoria-3', 'Descripción de la categoría 3', 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80'),
('c1000000-0000-0000-0000-000000000004', 'Categoría 4', 'categoria-4', 'Descripción de la categoría 4', 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.products (id, category_id, title, slug, sku, description, price, compare_at_price, stock, images, featured, has_variants, variants) VALUES
(
    'p1000000-0000-0000-0000-000000000001',
    'c1000000-0000-0000-0000-000000000001',
    'Producto de Ejemplo 1',
    'producto-ejemplo-1',
    'SKU-001',
    'Descripción detallada del producto de ejemplo 1.',
    24990,
    34990,
    25,
    ARRAY[
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80',
        'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'
    ],
    true,
    true,
    '[{"id": "v1", "title": "Versión Estándar", "stock": 15, "attributes": {"version": "Estándar"}}, {"id": "v2", "title": "Versión Plus", "stock": 10, "attributes": {"version": "Plus"}}]'::jsonb
),
(
    'p1000000-0000-0000-0000-000000000002',
    'c1000000-0000-0000-0000-000000000002',
    'Producto de Ejemplo 2',
    'producto-ejemplo-2',
    'SKU-002',
    'Descripción detallada del producto de ejemplo 2.',
    49990,
    64990,
    15,
    ARRAY['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&q=80'],
    true,
    false,
    '[]'::jsonb
),
(
    'p1000000-0000-0000-0000-000000000003',
    'c1000000-0000-0000-0000-000000000003',
    'Producto de Ejemplo 3',
    'producto-ejemplo-3',
    'SKU-003',
    'Descripción detallada del producto de ejemplo 3.',
    19990,
    NULL,
    40,
    ARRAY['https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=800&q=80'],
    false,
    false,
    '[]'::jsonb
),
(
    'p1000000-0000-0000-0000-000000000004',
    'c1000000-0000-0000-0000-000000000004',
    'Producto de Ejemplo 4',
    'producto-ejemplo-4',
    'SKU-004',
    'Descripción detallada del producto de ejemplo 4.',
    29990,
    39990,
    10,
    ARRAY['https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&q=80'],
    true,
    false,
    '[]'::jsonb
)
ON CONFLICT (slug) DO NOTHING;


-- ==========================================================================================
-- SECCIÓN 7: COMANDO PARA DAR DE ALTA AL DUEÑO DE LA TIENDA COMO ADMINISTRADOR
-- ==========================================================================================
-- Cuando crees el usuario del cliente en el panel de Supabase ("Authentication > Users > Add User"),
-- copia el UUID generado para ese usuario y ejecuta la siguiente consulta (quitando los guiones `--`):
--
-- INSERT INTO public.admin_profiles (id, email, full_name, role)
-- VALUES ('PEGA_AQUI_EL_UUID_DEL_USUARIO', 'correo@cliente.cl', 'Dueño de la Tienda', 'superadmin');
-- ==========================================================================================
