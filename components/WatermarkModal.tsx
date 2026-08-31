'use client';

import React, { useState } from 'react';
import {
  Image as ImageIcon,
  Sliders,
  Type,
  Upload,
  Trash2,
  Check,
  X,
  RotateCw,
  Eye,
  Layers,
  Sparkles,
} from 'lucide-react';
import { WatermarkConfig } from '@/types/document';
import { WatermarkOverlay, GlobalLogoEmblemSvg } from './WatermarkOverlay';

interface WatermarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  config?: WatermarkConfig;
  onSave: (updatedConfig: WatermarkConfig) => void;
}

export const WatermarkModal: React.FC<WatermarkModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [enabled, setEnabled] = useState<boolean>(config ? config.enabled !== false : true);
  const [type, setType] = useState<'default_logo' | 'custom_image' | 'text'>(config?.type || 'default_logo');
  const [imageUrl, setImageUrl] = useState<string>(config?.imageUrl || '');
  const [text, setText] = useState<string>(config?.text || 'ORIGINAL');
  const [opacity, setOpacity] = useState<number>(config?.opacity ?? 0.14);
  const [scale, setScale] = useState<number>(config?.scale ?? 58);
  const [rotation, setRotation] = useState<number>(config?.rotation ?? 0);

  if (!isOpen) return null;

  const currentPreviewConfig: WatermarkConfig = {
    enabled,
    type,
    imageUrl: type === 'custom_image' ? imageUrl : undefined,
    text: type === 'text' ? text : undefined,
    opacity,
    scale,
    rotation,
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const result = evt.target?.result as string;
      setImageUrl(result);
      setType('custom_image');
    };
    reader.readAsDataURL(file);
  };

  const handleApply = () => {
    onSave(currentPreviewConfig);
    onClose();
  };

  const handleResetToDefault = () => {
    setEnabled(true);
    setType('default_logo');
    setImageUrl('');
    setText('ORIGINAL');
    setOpacity(0.14);
    setScale(58);
    setRotation(0);
  };

  return (
    <div className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="bg-[#f4f3eb] rounded-[28px] border border-[#cccccc] shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden text-black select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-[#f0efe6] border-b border-[#cccccc] flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-[14px] bg-[#002057] flex items-center justify-center text-white shadow-xs">
              <ImageIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-black tracking-tight flex items-center space-x-2">
                <span>Center Watermark Settings</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#dfe7f4] text-[#002057] border border-[#b9c7de]">
                  Background Layer
                </span>
              </h2>
              <p className="text-xs text-[#666666] mt-0.5">
                Configure the semi-transparent corporate watermark rendered behind document tables
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#666666] hover:text-black hover:bg-black/5 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body: Split 2-Column Layout */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column: Settings & Sliders (7 cols) */}
          <div className="md:col-span-7 space-y-5">
            {/* Enable/Disable Toggle */}
            <div className="bg-white rounded-[20px] p-4 border border-[#cccccc] shadow-xs flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-black block">Enable Background Watermark</span>
                <span className="text-[11px] text-[#666666]">Show semi-transparent emblem on every document sheet</span>
              </div>
              <button
                type="button"
                onClick={() => setEnabled(!enabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  enabled ? 'bg-[#002057]' : 'bg-[#cccccc]'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    enabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Watermark Type Selector Tabs */}
            <div className="bg-white rounded-[20px] p-4 border border-[#cccccc] shadow-xs space-y-3.5">
              <span className="text-xs font-bold text-[#002057] uppercase tracking-wider block">
                Watermark Type
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setType('default_logo')}
                  className={`py-2.5 px-3 rounded-[14px] text-xs font-bold border transition-all flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                    type === 'default_logo'
                      ? 'bg-[#002057] text-white border-[#002057] shadow-sm'
                      : 'bg-[#f4f3eb] text-black border-[#cccccc] hover:bg-white'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Corporate (G)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setType('custom_image')}
                  className={`py-2.5 px-3 rounded-[14px] text-xs font-bold border transition-all flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                    type === 'custom_image'
                      ? 'bg-[#002057] text-white border-[#002057] shadow-sm'
                      : 'bg-[#f4f3eb] text-black border-[#cccccc] hover:bg-white'
                  }`}
                >
                  <Upload className="w-4 h-4" />
                  <span>Custom Logo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setType('text')}
                  className={`py-2.5 px-3 rounded-[14px] text-xs font-bold border transition-all flex flex-col items-center justify-center space-y-1 cursor-pointer ${
                    type === 'text'
                      ? 'bg-[#002057] text-white border-[#002057] shadow-sm'
                      : 'bg-[#f4f3eb] text-black border-[#cccccc] hover:bg-white'
                  }`}
                >
                  <Type className="w-4 h-4" />
                  <span>Custom Text</span>
                </button>
              </div>

              {/* Custom Image Upload Dropzone */}
              {type === 'custom_image' && (
                <div className="pt-2">
                  {imageUrl ? (
                    <div className="flex items-center space-x-3 p-3 bg-[#f4f3eb] rounded-[16px] border border-[#cccccc]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageUrl} alt="Uploaded logo" className="w-12 h-12 object-contain bg-white rounded-lg p-1 border" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-black truncate">Custom Logo Uploaded</p>
                        <p className="text-[10px] text-[#666666]">Ready for watermark rendering</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setImageUrl('')}
                        className="p-1.5 text-red-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                        title="Remove Image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="border-2 border-dashed border-[#002057]/30 hover:border-[#002057] bg-[#f4f3eb]/60 hover:bg-white rounded-[16px] p-4 flex flex-col items-center justify-center cursor-pointer transition-all">
                      <Upload className="w-6 h-6 text-[#002057] mb-1.5" />
                      <span className="text-xs font-bold text-black">Click to upload company logo</span>
                      <span className="text-[10px] text-[#666666] mt-0.5">Supports PNG, SVG, JPG (Transparent recommended)</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                  )}
                </div>
              )}

              {/* Custom Text Input */}
              {type === 'text' && (
                <div className="pt-2 space-y-2">
                  <input
                    type="text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="e.g. ORIGINAL, DRAFT, CONFIDENTIAL"
                    className="w-full bg-[#f4f3eb] border border-[#cccccc] focus:border-[#002057] rounded-[12px] px-3.5 py-2 text-xs font-bold text-black outline-none uppercase"
                  />
                  <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                    {['ORIGINAL', 'DUPLICATE', 'DRAFT', 'PAID', 'GLOBAL INDUSTRIES'].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setText(preset)}
                        className="px-2 py-0.5 text-[10px] font-semibold bg-[#f4f3eb] hover:bg-[#dfe7f4] text-[#002057] rounded-md border border-[#cccccc] transition-colors cursor-pointer"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sliders Card: Opacity, Size, Rotation */}
            <div className="bg-white rounded-[20px] p-4.5 border border-[#cccccc] shadow-xs space-y-4">
              <span className="text-xs font-bold text-[#002057] uppercase tracking-wider block">
                Appearance Adjustments
              </span>

              {/* Opacity Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-black flex items-center space-x-1">
                    <Eye className="w-3.5 h-3.5 text-[#002057]" />
                    <span>Transparency (Opacity)</span>
                  </span>
                  <span className="font-mono font-bold text-[#002057] px-2 py-0.5 bg-[#dfe7f4] rounded-md text-[11px]">
                    {Math.round(opacity * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0.05"
                  max="0.40"
                  step="0.01"
                  value={opacity}
                  onChange={(e) => setOpacity(parseFloat(e.target.value))}
                  className="w-full accent-[#002057] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-[#888888]">
                  <span>Very Subtle (5%)</span>
                  <span>Photo Match (14%)</span>
                  <span>Prominent (40%)</span>
                </div>
              </div>

              {/* Size / Scale Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-black flex items-center space-x-1">
                    <Sliders className="w-3.5 h-3.5 text-[#002057]" />
                    <span>Watermark Scale</span>
                  </span>
                  <span className="font-mono font-bold text-[#002057] px-2 py-0.5 bg-[#dfe7f4] rounded-md text-[11px]">
                    {scale}%
                  </span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="90"
                  step="2"
                  value={scale}
                  onChange={(e) => setScale(parseInt(e.target.value, 10))}
                  className="w-full accent-[#002057] cursor-pointer"
                />
              </div>

              {/* Rotation Slider */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-black flex items-center space-x-1">
                    <RotateCw className="w-3.5 h-3.5 text-[#002057]" />
                    <span>Rotation Angle</span>
                  </span>
                  <span className="font-mono font-bold text-[#002057] px-2 py-0.5 bg-[#dfe7f4] rounded-md text-[11px]">
                    {rotation}°
                  </span>
                </div>
                <input
                  type="range"
                  min="-45"
                  max="45"
                  step="5"
                  value={rotation}
                  onChange={(e) => setRotation(parseInt(e.target.value, 10))}
                  className="w-full accent-[#002057] cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Right Column: Live Miniature A4 Preview (5 cols) */}
          <div className="md:col-span-5 flex flex-col space-y-3">
            <span className="text-xs font-bold text-[#002057] uppercase tracking-wider block">
              Live A4 Sheet Preview
            </span>

            <div className="flex-1 bg-[#2b2b2b] rounded-[24px] p-4 flex items-center justify-center min-h-[360px] shadow-inner">
              {/* Miniature A4 Sheet Simulator */}
              <div className="w-[240px] h-[330px] bg-white rounded-lg shadow-xl relative overflow-hidden flex flex-col justify-between p-3.5 text-[6px] border border-black/10 select-none">
                {/* Watermark rendered in background */}
                {enabled && <WatermarkOverlay config={currentPreviewConfig} />}

                {/* Simulated Foreground Invoice Header & Tables (Relative z-10) */}
                <div className="relative z-10 space-y-1">
                  <div className="flex justify-between items-start border-b border-black/40 pb-1">
                    <div>
                      <div className="font-black text-[8px] text-black tracking-tight">GLOBAL INDUSTRIES</div>
                      <div className="text-[5px] text-black">Vadodara, Gujarat</div>
                    </div>
                    <div className="text-right text-[5px] text-black font-semibold">
                      <div>TAX-INVOICE</div>
                      <div>TI/26-27/00013</div>
                    </div>
                  </div>

                  {/* Simulated Table */}
                  <div className="border border-black mt-2">
                    <div className="bg-black/5 font-bold border-b border-black flex justify-between p-0.5">
                      <span>Description</span>
                      <span>Total</span>
                    </div>
                    <div className="p-0.5 text-black/80 flex justify-between">
                      <span>Supply, Fabrication & Erection</span>
                      <span>₹ 3,99,772.23</span>
                    </div>
                    <div className="p-0.5 text-black/80 flex justify-between border-t border-black/10">
                      <span>SGST + CGST (18%)</span>
                      <span>₹ 71,958.77</span>
                    </div>
                  </div>
                </div>

                {/* Simulated Footer */}
                <div className="relative z-10 flex justify-between items-end border-t border-black/40 pt-1">
                  <div>
                    <div className="font-bold text-[5px] text-black">Bank of Baroda</div>
                    <div className="text-[4px] text-black/70">A/C: 05730400000392</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-[5px] text-black">For, GLOBAL INDUSTRIES</div>
                    <div className="text-[4px] text-black/70">(Authorized Signatory)</div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-center text-[#666666]">
              Real-time preview of how the watermark will look behind table text
            </p>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-[#f0efe6] border-t border-[#cccccc] flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={handleResetToDefault}
            className="px-4 py-2 text-xs font-semibold text-[#666666] hover:text-black hover:bg-white rounded-[12px] border border-[#cccccc] transition-colors cursor-pointer"
          >
            Reset to Photo Defaults
          </button>

          <div className="flex items-center space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-black bg-white hover:bg-gray-100 rounded-[12px] border border-[#cccccc] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleApply}
              className="brand-button px-5 py-2 text-xs font-bold text-white rounded-[12px] shadow-sm flex items-center space-x-1.5 cursor-pointer active:scale-95 transition-all"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Watermark</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
