import DOMPurify from 'dompurify';

/**
 * Desinfecta cualquier entrada de texto del usuario para prevenir ataques XSS.
 * Funciona de forma segura tanto en cliente como en servidor Node.
 */
export function sanitizeInput(input: string): string {
  if (!input) return '';
  if (typeof window !== 'undefined') {
    return DOMPurify.sanitize(input.trim());
  }
  // En servidor Node, limpiar etiquetas HTML peligrosas manualmente o mediante regex de protección
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/script/gi, '')
    .trim();
}

/**
 * Sanitiza campos de un objeto dinámico
 */
export function sanitizeObject<T extends Record<string, any>>(obj: T): T {
  const sanitized = { ...obj };
  for (const key in sanitized) {
    if (typeof sanitized[key] === 'string') {
      sanitized[key] = sanitizeInput(sanitized[key]) as any;
    }
  }
  return sanitized;
}
