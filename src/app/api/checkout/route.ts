import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/security/rate-limiter';
import { CheckoutSchema } from '@/lib/security/schemas';
import { sanitizeObject } from '@/lib/security/sanitizer';

export async function POST(req: NextRequest) {
  // 1. Rate limiting por IP (Max 10 solicitudes por minuto)
  const clientIp = req.headers.get('x-forwarded-for') || '127.0.0.1';
  const rateLimit = checkRateLimit(`checkout-${clientIp}`, { limit: 10, windowMs: 60000 });

  if (!rateLimit.success) {
    return NextResponse.json(
      { message: 'Demasiadas solicitudes de checkout. Espere un minuto antes de reintentar.' },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const { shippingDetails, cartItems, totalAmount } = body;

    // 2. Desinfectar campos contra XSS
    const sanitizedDetails = sanitizeObject(shippingDetails);

    // 3. Validar con Zod en servidor
    const validation = CheckoutSchema.safeParse(sanitizedDetails);
    if (!validation.success) {
      return NextResponse.json(
        { message: 'Datos de envío no válidos', errors: validation.error.errors },
        { status: 400 }
      );
    }

    // 4. Generar ID único de orden
    const orderId = 'ORD-' + Math.floor(100000 + Math.random() * 900000);

    // Aquí se generaría la preferencia de pago de Mercado Pago usando su SDK oficial
    // Si la integración con Mercado Pago está configurada en env:
    /*
    const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });
    const preference = new Preference(client);
    const result = await preference.create({ body: { ... } });
    */

    return NextResponse.json({
      success: true,
      orderId,
      message: 'Orden creada exitosamente para Guest Checkout',
    });
  } catch {
    return NextResponse.json(
      { message: 'Error interno del servidor al procesar la orden' },
      { status: 500 }
    );
  }
}
