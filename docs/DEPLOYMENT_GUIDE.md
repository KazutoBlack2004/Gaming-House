# Manual Maestro de Venta, Adaptación y Despliegue (Plantilla E-Commerce Chile)

Esta guía está diseñada para que puedas **vender, personalizar y desplegar esta plantilla para nuevos clientes en menos de 15 minutos**, además de comprender exactamente cómo funciona cada archivo y cada sección del script SQL en caso de que un cliente solicite modificaciones a medida.

---

## Índice Rápido

1. [Arquitectura del Proyecto y Mapa de Archivos Clave](#1-arquitectura-del-proyecto-y-mapa-de-archivos-clave)
2. [Paso 1: Creación y Configuración de Supabase (SQL + Bucket `.webp`)](#2-paso-1-creación-y-configuración-de-supabase-sql--bucket-webp)
3. [Guía para Entender y Adaptar Manualmente el Script SQL](#3-guía-para-entender-y-adaptar-manualmente-el-script-sql)
4. [Paso 2: Configuración de Variables de Entorno (`.env.local`)](#4-paso-2-configuración-de-variables-de-entorno-envlocal)
5. [Paso 3: Personalización Rápida para el Cliente (Colores, Textos y Tarifas)](#5-paso-3-personalización-rápida-para-el-cliente-colores-textos-y-tarifas)
6. [Paso 4: Integración Logística con Blue Express Chile](#6-paso-4-integración-logística-con-blue-express-chile)
7. [Paso 5: Cómo Activar la Seguridad Definitiva del Admin Oculto](#7-paso-5-cómo-activar-la-seguridad-definitiva-del-admin-oculto)
8. [Paso 6: Despliegue en Producción (Vercel)](#8-paso-6-despliegue-en-producción-vercel)

---

## 1. Arquitectura del Proyecto y Mapa de Archivos Clave

Cuando vendas la plantilla a un nuevo cliente, estos son los únicos archivos que tocarás para adaptarla a su negocio:

| Archivo | Qué controla | Cuándo modificarlo |
| :--- | :--- | :--- |
| [`src/lib/constants.ts`](file:///c:/Users/chrys/Documents/Github/Plantilla%20Ecomerce/src/lib/constants.ts) | Nombre de la tienda, formateador de Peso Chileno (`formatPrice`), medios de pago, regiones de Chile y productos de respaldo. | Cuando quieras cambiar los métodos de pago visibles o los datos iniciales de prueba. |
| [`src/lib/theme.ts`](file:///c:/Users/chrys/Documents/Github/Plantilla%20Ecomerce/src/lib/theme.ts) | Paleta de colores, bordes redondeados, textos e imagen del **Banner Principal (Hero)** y barra de propuestas de valor. | En cada venta para adaptar los colores e imagen principal a la identidad del cliente. |
| [`src/lib/shipping/bluexpress.ts`](file:///c:/Users/chrys/Documents/Github/Plantilla%20Ecomerce/src/lib/shipping/bluexpress.ts) | Tarifas de envío de **Blue Express** por Región (RM, Zona Centro, Extremos) y estados de seguimiento (Checkpoints). | Si el cliente quiere cobrar tarifas distintas de envío o dar envío gratis en su región. |
| [`src/lib/utils/image-webp.ts`](file:///c:/Users/chrys/Documents/Github/Plantilla%20Ecomerce/src/lib/utils/image-webp.ts) | Conversor automático de imágenes (`JPG/PNG` → `.webp` al `82%` de calidad, máx `1200x1200px`) y subida al Bucket `products`. | Si deseas cambiar la resolución máxima o el porcentaje de compresión de las fotos. |
| [`src/middleware.ts`](file:///c:/Users/chrys/Documents/Github/Plantilla%20Ecomerce/src/middleware.ts) | Protección de la ruta administrativa oculta, cabeceras `noindex` para Google y punto central para activar autenticación. | Cuando definas el método de seguridad final (JWT/Cookies/Token) para el panel admin. |
| [`docs/SUPABASE_SETUP.sql`](file:///c:/Users/chrys/Documents/Github/Plantilla%20Ecomerce/docs/SUPABASE_SETUP.sql) | Script completo de base de datos, triggers automáticos, políticas RLS y creación del Bucket de imágenes `.webp`. | Se copia y pega una sola vez en el proyecto Supabase de cada cliente nuevo. |

---

## 2. Paso 1: Creación y Configuración de Supabase (SQL + Bucket `.webp`)

1. Crea una cuenta o proyecto gratuito en [https://supabase.com](https://supabase.com) (ej. `tienda-cliente-chile`).
2. En el menú lateral izquierdo de Supabase, entra a **SQL Editor** y haz clic en **New Query**.
3. Abre el archivo [`docs/SUPABASE_SETUP.sql`](file:///c:/Users/chrys/Documents/Github/Plantilla%20Ecomerce/docs/SUPABASE_SETUP.sql), copia **todo su contenido**, pégalo en el editor y presiona **Run**.
4. **Dar de alta al dueño de la tienda como Administrador**:
   - En el menú izquierdo de Supabase, ve a **Authentication > Users** y haz clic en **Add User > Create New User**.
   - Ingresa el correo y contraseña del dueño de la tienda y copia el **`User UID` (UUID)** que se generó.
   - Vuelve a **SQL Editor** y ejecuta:
     ```sql
     INSERT INTO public.admin_profiles (id, email, full_name, role)
     VALUES ('PEGA_AQUI_EL_UUID_DEL_USUARIO', 'admin@tienda.cl', 'Dueño Tienda', 'superadmin');
     ```
5. Ve a **Project Settings > API** y copia las 3 credenciales para tu archivo `.env.local`:
   - `Project URL` (`NEXT_PUBLIC_SUPABASE_URL`)
   - `anon public key` (`NEXT_PUBLIC_SUPABASE_ANON_KEY`)
   - `service_role secret key` (`SUPABASE_SERVICE_ROLE_KEY`)

---

## 3. Guía para Entender y Adaptar Manualmente el Script SQL

El archivo [`docs/SUPABASE_SETUP.sql`](file:///c:/Users/chrys/Documents/Github/Plantilla%20Ecomerce/docs/SUPABASE_SETUP.sql) está dividido en **7 secciones comentadas**. Aquí tienes cómo funciona cada una y cómo modificarla manualmente si un cliente te pide algo específico en futuras ventas:

### A. Cómo agregar un campo nuevo a los Productos (Sección 2.3)
* **Opción recomendada (Sin modificar el SQL)**: La tabla `public.products` ya incluye la columna `metadata JSONB DEFAULT '{}'::jsonb`. Ahí puedes guardar cualquier dato extra (ej. `{"peso_kg": 1.5, "marca": "Genérica", "garantia": "6 meses"}`) sin alterar la estructura SQL.
* **Opción agregando columna SQL**: Si prefieres crear una columna dedicada (por ejemplo, `weight_grams INTEGER` para calcular envíos por peso), solo ejecuta en el SQL Editor:
  ```sql
  ALTER TABLE public.products ADD COLUMN IF NOT EXISTS weight_grams INTEGER DEFAULT 500;
  ```

### B. Cómo funciona el Descuento Automático de Stock en Base de Datos (Sección 3.2)
* El script incluye la función `public.decrement_product_stock()` conectada mediante el trigger `trigger_decrement_stock` a la tabla `public.order_items`.
* **¿Por qué se hace así?**: Cada vez que se inserta un producto comprado en `order_items`, PostgreSQL resta automáticamente `stock - NEW.quantity` usando `GREATEST(0, ...)` para que el stock jamás quede en números negativos ni ocurran sobreventas si dos clientes compran al mismo tiempo.

### C. Cómo funcionan las Políticas de Seguridad RLS (Sección 4)
* **Visitantes públicos (`anon`)**: Solo tienen permiso `SELECT` sobre categorías y productos donde `active = true`, y permiso `INSERT` sobre `orders` y `order_items` (para poder comprar sin registrarse).
* **Administradores (`public.is_admin()`)**: La función `public.is_admin()` verifica si el usuario autenticado (`auth.uid()`) existe dentro de `public.admin_profiles`. Solo si devuelve `true`, PostgreSQL permite hacer `UPDATE` o `DELETE` en productos, categorías y pedidos.
* **Tip para pruebas rápidas sin login en Supabase**: Si durante una prueba quieres permitir que el panel suba productos a Supabase sin haber iniciado sesión en Supabase Auth todavía, puedes cambiar temporalmente la política de productos a:
  ```sql
  DROP POLICY IF EXISTS "Admin All Products" ON public.products;
  CREATE POLICY "Admin All Products" ON public.products FOR ALL USING (true);
  ```
  *(Recuerda restaurarla a `USING (public.is_admin())` al pasar a producción).*

### D. Cómo funciona el Bucket de Imágenes `.webp` (Sección 5)
* El bloque `INSERT INTO storage.buckets` crea el bucket público llamado `'products'` con límite de `5 MB` por foto y tipos MIME permitidos `['image/webp', 'image/jpeg', 'image/png', 'image/avif']`.
* Cuando el dueño arrastra una foto en el Admin, [`src/lib/utils/image-webp.ts`](file:///c:/Users/chrys/Documents/Github/Plantilla%20Ecomerce/src/lib/utils/image-webp.ts) la convierte primero en el navegador a `.webp` (~70 KB) y luego la sube a este bucket en la carpeta `products/` o `categories/`.

---

## 4. Paso 2: Configuración de Variables de Entorno (`.env.local`)

Duplica el archivo [`.env.example`](file:///c:/Users/chrys/Documents/Github/Plantilla%20Ecomerce/.env.example) y renómbralo a `.env.local`:

```bash
# 1. Conexión a Supabase
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# 2. Ruta Oculta del Panel de Administración (Personalízala por cliente)
# Ejemplo: /admin-tienda-sur-99 -> el dueño entrará en https://sutienda.cl/admin-tienda-sur-99
NEXT_PUBLIC_ADMIN_ROUTE_PATH=/portal-admin-secure

# 3. Blue Express Chile (Opcional para emisión vía API corporativa)
BLUEXPRESS_API_URL=https://api.blue.cl/v1
BLUEXPRESS_API_KEY=tu_api_key_bluexpress
BLUEXPRESS_CLIENT_CODE=tu_codigo_cliente_pyme

# 4. Pasarela de Pago
MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxxxxxx
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxxxxxx
MERCADOPAGO_WEBHOOK_SECRET=tu_secreto_webhook

# 5. Datos de la Tienda
NEXT_PUBLIC_SITE_NAME="Nombre de la Tienda"
NEXT_PUBLIC_SITE_URL=https://mitienda.cl
NEXT_PUBLIC_CURRENCY=CLP
```

---

## 5. Paso 3: Personalización Rápida para el Cliente (Colores, Textos y Tarifas)

1. **Cambiar Textos del Banner Principal y Colores**:
   - Abre [`src/lib/theme.ts`](file:///c:/Users/chrys/Documents/Github/Plantilla%20Ecomerce/src/lib/theme.ts).
   - Modifica `hero.title`, `hero.subtitle`, `hero.bgImage` y `colors.primary`.
2. **Modificar Tarifas de Envío de Blue Express**:
   - Abre [`src/lib/shipping/bluexpress.ts`](file:///c:/Users/chrys/Documents/Github/Plantilla%20Ecomerce/src/lib/shipping/bluexpress.ts) y ajusta los valores en `calculateBlueExpressRate`:
     - Por defecto: **Punto Blue / Copec** (`$2.990` RM / `$3.690` Regiones / `$4.990` Extremos) y **Domicilio** (`$3.990` RM / `$4.990` Regiones / `$6.990` Extremos).

---

## 6. Paso 4: Integración Logística con Blue Express Chile

El flujo de envíos está pensado para las dos etapas de cualquier emprendedor en Chile:

1. **Etapa Inicial (Cuenta PyME Gratuita en [blue.cl/pyme](https://www.blue.cl/pyme/))**:
   - El dueño no necesita pagar ni contratar API. Recibe el pedido en `/portal-admin-secure/dashboard/ordenes`, presiona **"Seguimiento y OT"**, copia la dirección del cliente, genera el envío en su portal de Blue Express (o usa el generador incluido), pega el N° de OT de 10 dígitos y presiona **Guardar Cambios**.
   - Puede imprimir la **Etiqueta de Encomienda** desde el mismo modal y el comprador puede rastrear su pedido en `/seguimiento`.
2. **Etapa Avanzada (API Convenio Blue Express)**:
   - Al completar `BLUEXPRESS_API_KEY` y `BLUEXPRESS_CLIENT_CODE` en `.env.local`, el botón **"Generar OT Blue Express"** se comunica directamente con la API de Blue Express para emitir la OT sin salir del panel.

---

## 7. Paso 5: Cómo Activar la Seguridad Definitiva del Admin Oculto

Actualmente, el acceso a `/portal-admin-secure` está oculto de la tienda pública y bloqueado para buscadores (`X-Robots-Tag: noindex, nofollow`), permitiendo acceso directo en desarrollo.

Cuando quieras activar el bloqueo de seguridad definitivo para un cliente, abre [`src/middleware.ts`](file:///c:/Users/chrys/Documents/Github/Plantilla%20Ecomerce/src/middleware.ts#L22-L33) y descomenta el bloque **Security Guard** (o conecta allí el método de verificación que elijas: Cookie firmada, Supabase Session o Token de acceso).

---

## 8. Paso 6: Despliegue en Producción (Vercel)

1. Sube el repositorio a tu cuenta de GitHub.
2. Entra a [https://vercel.com](https://vercel.com) y haz clic en **Add New > Project**.
3. Importa el repositorio, pega las variables de entorno de tu `.env.local` y presiona **Deploy**.
4. ¡Listo! Entrega al cliente la URL pública de su tienda y su URL privada de administración (`https://dominio.cl/portal-admin-secure`).
