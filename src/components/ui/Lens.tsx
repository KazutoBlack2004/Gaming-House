'use client';

import React, { useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface LensProps {
  children: React.ReactNode;
  zoomFactor?: number;
  lensSize?: number;
  position?: {
    x: number;
    y: number;
  };
  isStatic?: boolean;
  isFocusing?: () => void;
  hovering?: boolean;
  setHovering?: (hovering: boolean) => void;
  className?: string;
}

export function Lens({
  children,
  zoomFactor = 1.75,
  lensSize = 185,
  isStatic = false,
  position = { x: 200, y: 150 },
  hovering,
  setHovering,
  className = '',
}: LensProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [localIsHovering, setLocalIsHovering] = useState(false);
  const isHovering = hovering !== undefined ? hovering : localIsHovering;
  const setIsHovering = setHovering || setLocalIsHovering;

  const [mousePosition, setMousePosition] = useState<{ x: number; y: number }>({
    x: 100,
    y: 100,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePosition({ x, y });
  };

  const activePos = isStatic ? position : mousePosition;
  const radius = lensSize / 2;

  return (
    <div
      ref={containerRef}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={handleMouseMove}
      className={`relative overflow-hidden z-20 ${className}`}
    >
      {children}

      {isStatic ? (
        <div>
          <motion.div
            initial={{ opacity: 0, scale: 0.58 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.25, ease: [0.23, 1, 0.32, 1] }}
            className="absolute inset-0 overflow-hidden pointer-events-none"
            style={{
              maskImage: `radial-gradient(circle ${radius}px at ${activePos.x}px ${activePos.y}px, black 100%, transparent 100%)`,
              WebkitMaskImage: `radial-gradient(circle ${radius}px at ${activePos.x}px ${activePos.y}px, black 100%, transparent 100%)`,
              transformOrigin: `${activePos.x}px ${activePos.y}px`,
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                transform: `scale(${zoomFactor})`,
                transformOrigin: `${activePos.x}px ${activePos.y}px`,
              }}
            >
              {children}
            </div>
          </motion.div>
        </div>
      ) : (
        <AnimatePresence>
          {isHovering && (
            <>
              {/* Capa ampliada con máscara circular radial-gradient (Aceternity UI Lens) */}
              <motion.div
                initial={{ opacity: 0, scale: 0.58 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                className="absolute inset-0 overflow-hidden pointer-events-none z-30"
                style={{
                  maskImage: `radial-gradient(circle ${radius}px at ${activePos.x}px ${activePos.y}px, black 100%, transparent 100%)`,
                  WebkitMaskImage: `radial-gradient(circle ${radius}px at ${activePos.x}px ${activePos.y}px, black 100%, transparent 100%)`,
                  transformOrigin: `${activePos.x}px ${activePos.y}px`,
                }}
              >
                <div
                  className="absolute inset-0"
                  style={{
                    transform: `scale(${zoomFactor})`,
                    transformOrigin: `${activePos.x}px ${activePos.y}px`,
                  }}
                >
                  {children}
                </div>
              </motion.div>

              {/* Anillo óptico de la lente que sigue al cursor */}
              <motion.div
                initial={{ opacity: 0, scale: 0.75 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.75 }}
                transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
                style={{
                  width: lensSize,
                  height: lensSize,
                  left: activePos.x - radius,
                  top: activePos.y - radius,
                }}
                className="pointer-events-none absolute z-40 rounded-full border border-[#00ff88]/70 shadow-[0_0_24px_rgba(0,255,136,0.35),inset_0_0_16px_rgba(0,255,136,0.2)]"
              />
            </>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}
