'use client';

import React, { useRef, useState } from 'react';
import { Upload, X, Link as LinkIcon, CheckCircle2, Loader2 } from 'lucide-react';
import { uploadImageAsWebP } from '@/lib/utils/image-webp';

interface WebPImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  multiple?: boolean;
  folder?: 'products' | 'categories';
  label?: string;
}

export function WebPImageUploader({
  images,
  onChange,
  multiple = true,
  folder = 'products',
  label = 'Imágenes (.webp automático)',
}: WebPImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastConversionInfo, setLastConversionInfo] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [externalUrl, setExternalUrl] = useState('');

  const handleFiles = async (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    setIsProcessing(true);
    setLastConversionInfo(null);

    try {
      const filesArray = Array.from(fileList).filter((f) => f.type.startsWith('image/'));
      if (filesArray.length === 0) return;

      const filesToProcess = multiple ? filesArray : [filesArray[0]];
      const newUrls: string[] = [];
      let totalOriginalKB = 0;
      let totalWebpKB = 0;

      for (const file of filesToProcess) {
        const result = await uploadImageAsWebP(file, folder);
        newUrls.push(result.url);
        totalOriginalKB += result.originalSizeKB;
        totalWebpKB += result.webpSizeKB;
      }

      if (multiple) {
        onChange([...images, ...newUrls]);
      } else {
        onChange(newUrls);
      }

      const savedPercent =
        totalOriginalKB > totalWebpKB
          ? Math.round(((totalOriginalKB - totalWebpKB) / totalOriginalKB) * 100)
          : 0;

      setLastConversionInfo(
        `Optimizado a .webp (${totalWebpKB} KB${savedPercent > 0 ? ` • -${savedPercent}% de peso` : ''})`
      );
    } catch {
      setLastConversionInfo('No se pudo procesar la imagen seleccionada.');
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleAddExternalUrl = () => {
    if (!externalUrl.trim()) return;
    if (multiple) {
      onChange([...images, externalUrl.trim()]);
    } else {
      onChange([externalUrl.trim()]);
    }
    setExternalUrl('');
    setShowUrlInput(false);
  };

  const handleRemoveImage = (index: number) => {
    onChange(images.filter((_, idx) => idx !== index));
  };

  return (
    <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-[11px] font-extrabold uppercase tracking-wider text-slate-700">
          {label} {multiple && `(${images.length})`}
        </label>

        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors"
        >
          <LinkIcon className="w-3 h-3" />
          {showUrlInput ? 'Ocultar campo URL' : 'Pegar URL externa'}
        </button>
      </div>

      {/* Zona Drag & Drop para Subir y Convertir a .webp */}
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`cursor-pointer rounded-xl border-2 border-dashed p-4 text-center transition-all ${
          isDragging
            ? 'border-slate-900 bg-slate-900/5'
            : 'border-slate-300 bg-white hover:border-slate-400'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple={multiple}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center gap-1.5">
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 text-slate-900 animate-spin" />
              <span className="text-xs font-bold text-slate-900">
                Convirtiendo a formato .webp y optimizando...
              </span>
            </>
          ) : (
            <>
              <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                <Upload className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-slate-800">
                Haz clic para subir o arrastra {multiple ? 'tus imágenes' : 'una imagen'} aquí
              </p>
              <span className="text-[11px] text-slate-400 font-medium">
                JPG, PNG o WEBP — Se convierte y comprime a <strong className="text-slate-600">.webp</strong> automáticamente
              </span>
            </>
          )}
        </div>
      </div>

      {/* Notificación de compresión WebP */}
      {lastConversionInfo && (
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-xl">
          <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
          <span>{lastConversionInfo}</span>
        </div>
      )}

      {/* Opción secundaria: Pegar URL externa */}
      {showUrlInput && (
        <div className="flex gap-2 pt-1">
          <input
            type="text"
            placeholder="https://..."
            value={externalUrl}
            onChange={(e) => setExternalUrl(e.target.value)}
            className="flex-1 h-10 px-3.5 rounded-xl bg-white border border-slate-200 text-xs font-semibold text-slate-900 placeholder:text-slate-400 outline-none focus:border-slate-900"
          />
          <button
            type="button"
            onClick={handleAddExternalUrl}
            className="px-4 h-10 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shrink-0"
          >
            Agregar
          </button>
        </div>
      )}

      {/* Previsualización de Miniaturas */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2.5 pt-1">
          {images.map((imgUrl, idx) => (
            <div
              key={idx}
              className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-200 bg-white group shadow-2xs"
            >
              <img
                src={imgUrl}
                alt={`Imagen ${idx + 1}`}
                className="w-full h-full object-cover"
              />
              <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-slate-900/80 text-white font-mono font-bold text-[8px] uppercase">
                WEBP
              </span>
              <button
                type="button"
                onClick={() => handleRemoveImage(idx)}
                className="absolute top-1 right-1 p-1 rounded-full bg-slate-900/85 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                title="Quitar imagen"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
