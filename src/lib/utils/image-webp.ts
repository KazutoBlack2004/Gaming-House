import { createClient } from '@/lib/supabase/client';

export interface WebPConversionResult {
  blob: Blob;
  file: File;
  dataUrl: string;
  width: number;
  height: number;
  originalSizeKB: number;
  webpSizeKB: number;
  savingsPercent: number;
}

export interface UploadedWebPImage {
  url: string;
  fileName: string;
  originalSizeKB: number;
  webpSizeKB: number;
  savingsPercent: number;
  source: 'supabase' | 'local-webp';
}

/**
 * Convierte y redimensiona cualquier archivo de imagen (JPG, PNG, WEBP)
 * al formato estándar .webp optimizado directamente en el navegador.
 */
export async function convertFileToWebP(
  inputFile: File,
  options: { maxWidth?: number; maxHeight?: number; quality?: number } = {}
): Promise<WebPConversionResult> {
  const { maxWidth = 1200, maxHeight = 1200, quality = 0.82 } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error('No se pudo leer el archivo de imagen.'));
    reader.onload = (event) => {
      const img = new window.Image();
      img.onerror = () => reject(new Error('Formato de imagen no válido.'));

      img.onload = () => {
        let { width, height } = img;

        // Redimensionar manteniendo la proporción sin agrandar imágenes pequeñas
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('No se pudo inicializar el procesador gráfico WebP.'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        const dataUrl = canvas.toDataURL('image/webp', quality);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Error al codificar la imagen en formato .webp'));
              return;
            }

            const baseName = inputFile.name
              .replace(/\.[^/.]+$/, '')
              .toLowerCase()
              .normalize('NFD')
              .replace(/[\u0300-\u036f]/g, '')
              .replace(/[^a-z0-9]+/g, '-')
              .replace(/(^-|-$)/g, '');

            const webpFileName = `${baseName || 'imagen'}-${Date.now()}.webp`;
            const webpFile = new File([blob], webpFileName, { type: 'image/webp' });

            const originalSizeKB = Math.max(1, Math.round(inputFile.size / 1024));
            const webpSizeKB = Math.max(1, Math.round(blob.size / 1024));
            const savingsPercent =
              originalSizeKB > webpSizeKB
                ? Math.round(((originalSizeKB - webpSizeKB) / originalSizeKB) * 100)
                : 0;

            resolve({
              blob,
              file: webpFile,
              dataUrl,
              width,
              height,
              originalSizeKB,
              webpSizeKB,
              savingsPercent,
            });
          },
          'image/webp',
          quality
        );
      };

      img.src = event.target?.result as string;
    };

    reader.readAsDataURL(inputFile);
  });
}

/**
 * Convierte la imagen a .webp y la sube al Bucket `products` de Supabase Storage.
 * Si Supabase aún no está configurado (modo plantilla/demo), retorna el DataURL .webp optimizado.
 */
export async function uploadImageAsWebP(
  inputFile: File,
  folder: 'products' | 'categories' = 'products'
): Promise<UploadedWebPImage> {
  const converted = await convertFileToWebP(inputFile, {
    maxWidth: folder === 'categories' ? 900 : 1200,
    maxHeight: folder === 'categories' ? 900 : 1200,
    quality: 0.82,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const isSupabaseConfigured =
    supabaseUrl.startsWith('https://') && !supabaseUrl.includes('tu-proyecto.supabase.co');

  if (isSupabaseConfigured) {
    try {
      const supabase = createClient();
      const filePath = `${folder}/${converted.file.name}`;

      const { data, error } = await supabase.storage
        .from('products')
        .upload(filePath, converted.file, {
          contentType: 'image/webp',
          cacheControl: '31536000',
          upsert: false,
        });

      if (!error && data?.path) {
        const { data: publicUrlData } = supabase.storage
          .from('products')
          .getPublicUrl(data.path);

        return {
          url: publicUrlData.publicUrl,
          fileName: converted.file.name,
          originalSizeKB: converted.originalSizeKB,
          webpSizeKB: converted.webpSizeKB,
          savingsPercent: converted.savingsPercent,
          source: 'supabase',
        };
      }
    } catch {
      // Fallback a imagen WebP local si el bucket aún no fue creado
    }
  }

  return {
    url: converted.dataUrl,
    fileName: converted.file.name,
    originalSizeKB: converted.originalSizeKB,
    webpSizeKB: converted.webpSizeKB,
    savingsPercent: converted.savingsPercent,
    source: 'local-webp',
  };
}
