'use client';

import React from 'react';
import { AlertTriangle, Trash2, Archive, HelpCircle, X } from 'lucide-react';

export interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
}

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'info';
  onConfirm: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
  onConfirm,
}) => {
  if (!isOpen) return null;

  const getVariantStyles = () => {
    switch (variant) {
      case 'danger':
        return {
          icon: <Trash2 className="w-5 h-5 text-[#8a3b2f]" />,
          iconBg: 'bg-[#fff3f0] border-[#f4c6bf]',
          confirmBtn: 'bg-[#8a3b2f] hover:bg-[#6e2b20] text-white',
        };
      case 'info':
        return {
          icon: <Archive className="w-5 h-5 text-[#0d3479]" />,
          iconBg: 'bg-[#dfe7f4] border-[#b9c7de]',
          confirmBtn: 'bg-[#002057] hover:bg-[#0d3479] text-white',
        };
      case 'warning':
      default:
        return {
          icon: <AlertTriangle className="w-5 h-5 text-[#b45309]" />,
          iconBg: 'bg-[#fef3c7] border-[#fde68a]',
          confirmBtn: 'bg-[#002057] hover:bg-[#0d3479] text-white',
        };
    }
  };

  const style = getVariantStyles();

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 select-none animate-in fade-in duration-150">
      <div className="bg-[#f4f3eb] border border-[#cccccc] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-150 text-black">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#cccccc] flex items-center justify-between bg-[#f0efe6]">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-xl border ${style.iconBg} shadow-2xs`}>
              {style.icon}
            </div>
            <h3 className="font-bold text-sm text-black">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#666666] hover:text-black rounded-lg hover:bg-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message */}
        <div className="p-5 bg-white">
          <p className="text-xs font-semibold text-black leading-relaxed">
            {message}
          </p>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-[#f0efe6] border-t border-[#cccccc] flex items-center justify-end space-x-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-white hover:bg-slate-50 text-black border border-[#cccccc] rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-xs"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-5 py-2 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer ${style.confirmBtn}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
