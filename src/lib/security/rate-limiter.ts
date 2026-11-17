/**
 * Rate Limiter con algoritmo Sliding Window para protección contra DDoS y Fuerza Bruta.
 */

interface RateLimitTracker {
  count: number;
  resetTime: number;
}

const memoryStore = new Map<string, RateLimitTracker>();

export interface RateLimitOptions {
  limit: number;      // Número máximo de peticiones
  windowMs: number;   // Ventana de tiempo en milisegundos
}

export function checkRateLimit(key: string, options: RateLimitOptions = { limit: 10, windowMs: 60000 }): { success: boolean; limit: number; remaining: number; resetTime: number } {
  const now = Date.now();
  const record = memoryStore.get(key);

  if (!record || now > record.resetTime) {
    const newRecord: RateLimitTracker = {
      count: 1,
      resetTime: now + options.windowMs,
    };
    memoryStore.set(key, newRecord);
    return {
      success: true,
      limit: options.limit,
      remaining: options.limit - 1,
      resetTime: newRecord.resetTime,
    };
  }

  if (record.count >= options.limit) {
    return {
      success: false,
      limit: options.limit,
      remaining: 0,
      resetTime: record.resetTime,
    };
  }

  record.count += 1;
  memoryStore.set(key, record);

  return {
    success: true,
    limit: options.limit,
    remaining: options.limit - record.count,
    resetTime: record.resetTime,
  };
}
