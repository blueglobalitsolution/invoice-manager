'use client';

import React from 'react';
import { WatermarkConfig } from '@/types/document';

interface WatermarkOverlayProps {
  config?: WatermarkConfig;
}

/**
 * Global Industries Stylized 'G' SVG Logo
 * Matches the green and navy blue curved monogram emblem from official corporate letterheads and invoices.
 */
export const GlobalLogoEmblemSvg: React.FC<{ className?: string }> = ({ className = 'w-full h-full' }) => (
  <svg
    viewBox="0 0 200 200"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Outer Navy Blue Sweep */}
    <path
      d="M 100 20 C 145 20 180 55 180 100 C 180 145 145 180 100 180 C 55 180 20 145 20 100 C 20 75 31 52 49 37 L 61 51 C 47 63 38 81 38 100 C 38 134 66 162 100 162 C 134 162 162 134 162 100 C 162 66 134 38 100 38 C 91 38 83 40 75 44 L 69 27 C 79 22 89 20 100 20 Z"
      fill="#133d83"
    />
    
    {/* Inner Lime / Olive Green Swoosh & Crossbar */}
    <path
      d="M 100 58 C 77 58 58 77 58 100 C 58 123 77 142 100 142 C 121 142 138 127 141 107 L 95 107 L 95 91 L 158 91 C 160 94 160 97 160 100 C 160 133 133 160 100 160 C 67 160 40 133 40 100 C 40 67 67 40 100 40 C 117 40 132 47 143 59 L 130 72 C 122 63 112 58 100 58 Z"
      fill="#8da742"
    />
    
    {/* Dynamic accent arc */}
    <path
      d="M 98 75 C 84 75 73 86 73 100 C 73 114 84 125 98 125 C 110 125 120 117 122 106 L 98 106 L 98 94 L 136 94 C 137 96 137 98 137 100 C 137 122 120 139 98 139 C 76 139 58 122 58 100 C 58 78 76 61 98 61 C 109 61 119 66 126 74 L 116 84 C 111 78 105 75 98 75 Z"
      fill="#28569c"
      opacity="0.9"
    />
  </svg>
);

export const WatermarkOverlay: React.FC<WatermarkOverlayProps> = ({ config }) => {
  // Default is enabled if not explicitly set to false
  const isEnabled = config ? config.enabled !== false : true;
  if (!isEnabled) return null;

  const opacity = config?.opacity ?? 0.14; // Default ~14% matching physical invoice
  const scale = config?.scale ?? 58; // Default ~58% width of sheet
  const rotation = config?.rotation ?? 0;
  const watermarkType = config?.type || 'default_logo';

  return (
    <div
      className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0 overflow-hidden"
      style={{
        zIndex: 0,
      }}
      aria-hidden="true"
    >
      <div
        className="flex items-center justify-center transition-all duration-300"
        style={{
          width: `${scale}%`,
          maxWidth: '520px',
          opacity: opacity,
          transform: `rotate(${rotation}deg)`,
          filter: 'grayscale(15%)',
        }}
      >
        {watermarkType === 'custom_image' && config?.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={config.imageUrl}
            alt="Watermark"
            className="w-full h-auto object-contain max-h-[500px]"
          />
        ) : watermarkType === 'text' && config?.text ? (
          <div className="text-center font-black text-6xl tracking-widest text-[#0d3479] uppercase border-4 border-[#0d3479] px-8 py-4 rounded-3xl whitespace-nowrap">
            {config.text}
          </div>
        ) : (
          <GlobalLogoEmblemSvg className="w-full h-auto max-h-[460px]" />
        )}
      </div>
    </div>
  );
};
