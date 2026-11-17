import { NextRequest, NextResponse } from 'next/server';

/**
 * MIDDLEWARE CENTRALIZADO PARA EL PORTAL DE ADMINISTRACIÓN OCULTO
 *
 * Responsabilidades estándar:
 * 1. Soportar ruta administrativa personalizada (NEXT_PUBLIC_ADMIN_ROUTE_PATH).
 * 2. Inyectar cabeceras `X-Robots-Tag: noindex, nofollow` para evitar indexación en buscadores.
 * 3. Punto único de control (Guard) preparado para activar autenticación futura (JWT, Cookies, 2FA o IP).
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const customAdminPath = process.env.NEXT_PUBLIC_ADMIN_ROUTE_PATH || '/portal-admin-secure';

  const isCustomAdminRoute =
    customAdminPath !== '/portal-admin-secure' && pathname.startsWith(customAdminPath);
  const isInternalAdminRoute = pathname.startsWith('/portal-admin-secure');

  if (!isCustomAdminRoute && !isInternalAdminRoute) {
    return NextResponse.next();
  }

  // =========================================================================
  // PUNTO DE SEGURIDAD PREPARADO PARA FUTURA AUTENTICACIÓN (SECURITY GUARD)
  // =========================================================================
  // Cuando se active el método de seguridad definitivo (Supabase Session, JWT o Token),
  // descomentar o habilitar la validación aquí sin modificar ninguna página del dashboard:
  //
  // const isEnforced = process.env.ENFORCE_ADMIN_AUTH === 'true';
  // const sessionToken = req.cookies.get('admin_session_token')?.value;
  // if (isEnforced && !sessionToken && !pathname.endsWith('/login')) {
  //   return NextResponse.redirect(new URL(`${customAdminPath}/login`, req.url));
  // }
  // =========================================================================

  let response = NextResponse.next();

  // Si el cliente definió una URL oculta personalizada en .env, reescribir internamente
  if (isCustomAdminRoute) {
    const internalPath = pathname.replace(customAdminPath, '/portal-admin-secure');
    const rewriteUrl = req.nextUrl.clone();
    rewriteUrl.pathname = internalPath || '/portal-admin-secure';
    response = NextResponse.rewrite(rewriteUrl);
  }

  // Impedir que motores de búsqueda indexen cualquier ruta administrativa
  response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive');

  return response;
}

export const config = {
  matcher: ['/portal-admin-secure/:path*'],
};
