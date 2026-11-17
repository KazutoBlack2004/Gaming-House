# Guía de Cumplimiento de Seguridad (ISO/IEC 27001 & OWASP Top 10)

Esta plantilla monolítica de E-Commerce está construida aplicando principios de **Defensa en Profundidad (Defense in Depth)** y cumplimiento de estándares internacionales de seguridad cibernética.

---

## 1. Mapeo con Controles ISO/IEC 27001

| Código de Control ISO 27001 | Nombre del Control | Implementación en la Plantilla E-Commerce |
| :--- | :--- | :--- |
| **A.9.1.1** | Política de Control de Acceso | Modelo **Guest Checkout** para clientes (cero almacenamiento de credenciales de usuario). Autenticación de Administración aislada mediante Supabase Auth y RLS. |
| **A.9.4.2** | Inicio de Sesión Seguro | La ruta administrativa (personalizable vía `NEXT_PUBLIC_ADMIN_ROUTE_PATH`) cuenta con protección por Rate Limiting contra ataques de fuerza bruta y sanitización estricta de credenciales. |
| **A.10.1.1** | Política de Criptografía | Todas las conexiones se realizan sobre HTTPS (HSTS forzado en `next.config.ts`). La llave `SUPABASE_SERVICE_ROLE_KEY` jamás se expone al cliente web. |
| **A.12.1.3** | Gestión de Capacidad y Recursos | Middleware de Rate Limiting por IP para prevenir ataques de denegación de servicio (DDoS) o saturación de búsquedas y checkout. |
| **A.12.4.1** | Registro de Eventos (Audit Logs) | Trigger automático en PostgreSQL que registra en `audit_logs` toda creación, actualización o eliminación de productos, precios y stocks realizada por administradores. |
| **A.14.1.2** | Servicios de Aplicaciones en Redes | Encabezados de seguridad HTTP configurados activamente: Content-Security-Policy (CSP), Strict-Transport-Security (HSTS), X-Frame-Options, X-Content-Type-Options y Referrer-Policy. |
| **A.14.2.5** | Principios de Ingeniería de Sistemas Seguros | Validación bidireccional (Cliente/Servidor) mediante esquemas rígidos de **Zod** y desinfección HTML/XSS mediante **DOMPurify**. |

---

## 2. Mitigación de OWASP Top 10

### A01: Broken Access Control (Control de Acceso Defectuoso)
* **Solución**: Se activa **Row Level Security (RLS)** en PostgreSQL a nivel de tabla. Los clientes solo pueden consultar productos marcados como `active = true`. Los endpoints de administración validan el token JWT del usuario contra la tabla `admin_profiles` antes de procesar solicitudes.

### A03: Injection (Inyecciones SQL, XSS, Command Injection)
* **Solución**:
  * **SQL Injection**: Uso exclusivo del cliente parametrizado de Supabase JS / ORM de PostgreSQL. Cero concatenación de cadenas SQL en el código.
  * **XSS (Cross-Site Scripting)**: Desinfección activa con `DOMPurify.sanitize()` en todos los inputs de búsqueda y comentarios.

### A04: Unrestricted Resource Consumption (Consumo de Recursos sin Restricción / Rate Limit)
* **Solución**: Implementación de Middleware Edge en Next.js para limitar la frecuencia de peticiones a endpoints sensibles (login admin, confirmación de carrito, webhooks).

### A05: Security Misconfiguration (Mala Configuración de Seguridad)
* **Solución**: Configuración estándar de encabezados HTTP en `next.config.ts`:
```typescript
{
  key: "X-Frame-Options",
  value: "DENY" // Previene ataques de Clickjacking
},
{
  key: "X-Content-Type-Options",
  value: "nosniff" // Previene desbordamientos por mime-sniffing
}
```

### A07: Identification and Authentication Failures (Fallos de Autenticación)
* **Solución**: Los clientes no requieren crear cuenta para comprar (reduciendo el vector de ataque y fuga de contraseñas de usuarios). La ruta del panel de control de administración se encuentra oculta de los crawlers y buscadores.

---

## 3. Checklist de Despliegue Seguro para Nuevos Clientes

- [ ] Definir una ruta administrativa personalizada única en `NEXT_PUBLIC_ADMIN_ROUTE_PATH`.
- [ ] Ejecutar el script `SUPABASE_SETUP.sql` en la consola SQL de Supabase.
- [ ] Configurar las variables de entorno de producción sin exponer `SUPABASE_SERVICE_ROLE_KEY`.
- [ ] Configurar el secreto de firma de webhook de Mercado Pago / Pasarela de pago.
- [ ] Habilitar SSL/HTTPS forzado en el dominio del cliente final.
