'use client';

import React, { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number; // milliseconds, defaults to 5000
}

interface ToastContextValue {
  showToast: (type: ToastType, message: string, title?: string, duration?: number) => void;
  success: (message: string, title?: string, duration?: number) => void;
  error: (message: string, title?: string, duration?: number) => void;
  warning: (message: string, title?: string, duration?: number) => void;
  info: (message: string, title?: string, duration?: number) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// Global event bus for calling toast from anywhere (even outside React tree)
type ToastEventDetail = {
  type: ToastType;
  message: string;
  title?: string;
  duration?: number;
};

export const toast = {
  success: (message: string, title?: string, duration: number = 5000) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent<ToastEventDetail>('app-toast', {
          detail: { type: 'success', message, title, duration },
        })
      );
    }
  },
  error: (message: string, title?: string, duration: number = 5000) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent<ToastEventDetail>('app-toast', {
          detail: { type: 'error', message, title, duration },
        })
      );
    }
  },
  warning: (message: string, title?: string, duration: number = 5000) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent<ToastEventDetail>('app-toast', {
          detail: { type: 'warning', message, title, duration },
        })
      );
    }
  },
  info: (message: string, title?: string, duration: number = 5000) => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent<ToastEventDetail>('app-toast', {
          detail: { type: 'info', message, title, duration },
        })
      );
    }
  },
};

export const useToast = (): ToastContextValue => {
  const context = useContext(ToastContext);
  if (!context) {
    // Fallback to global toast object if rendered outside Provider
    return {
      showToast: (type, msg, title, dur) => toast[type](msg, title, dur),
      success: (msg, title, dur) => toast.success(msg, title, dur),
      error: (msg, title, dur) => toast.error(msg, title, dur),
      warning: (msg, title, dur) => toast.warning(msg, title, dur),
      info: (msg, title, dur) => toast.info(msg, title, dur),
      dismissToast: () => {},
    };
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, message: string, title?: string, duration: number = 5000) => {
      const id = `toast_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
      const newToast: ToastItem = {
        id,
        type,
        message,
        title: title || (type === 'success' ? 'Success' : type === 'error' ? 'Error' : type === 'warning' ? 'Notice' : 'Information'),
        duration,
      };

      setToasts((prev) => [...prev, newToast]);
    },
    []
  );

  // Listen for global custom events
  useEffect(() => {
    const handleGlobalToast = (e: Event) => {
      const customEvent = e as CustomEvent<ToastEventDetail>;
      if (customEvent.detail) {
        showToast(
          customEvent.detail.type,
          customEvent.detail.message,
          customEvent.detail.title,
          customEvent.detail.duration || 5000
        );
      }
    };

    window.addEventListener('app-toast', handleGlobalToast);
    return () => window.removeEventListener('app-toast', handleGlobalToast);
  }, [showToast]);

  const value: ToastContextValue = {
    showToast,
    success: (msg, title, dur) => showToast('success', msg, title, dur),
    error: (msg, title, dur) => showToast('error', msg, title, dur),
    warning: (msg, title, dur) => showToast('warning', msg, title, dur),
    info: (msg, title, dur) => showToast('info', msg, title, dur),
    dismissToast,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      {/* Toast Notification Container in Bottom-Right Corner */}
      <div className="fixed bottom-6 right-6 z-[999999] flex flex-col space-y-3 max-w-sm sm:max-w-md w-[calc(100vw-3rem)] pointer-events-none select-none">
        {toasts.map((t) => (
          <SingleToast key={t.id} item={t} onDismiss={() => dismissToast(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const SingleToast: React.FC<{
  item: ToastItem;
  onDismiss: () => void;
}> = ({ item, onDismiss }) => {
  const duration = item.duration || 5000;
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (elapsed >= duration) {
        clearInterval(interval);
        onDismiss();
      }
    }, 50);

    return () => clearInterval(interval);
  }, [duration, onDismiss]);

  const getStyle = () => {
    switch (item.type) {
      case 'success':
        return {
          icon: <CheckCircle2 className="w-5 h-5 text-[#0d3479]" />,
          iconBg: 'bg-[#dfe7f4] border-[#b9c7de]',
          borderColor: 'border-[#b9c7de]',
          progressBarColor: 'bg-[#0d3479]',
          titleColor: 'text-[#0d3479]',
        };
      case 'error':
        return {
          icon: <AlertCircle className="w-5 h-5 text-[#8a3b2f]" />,
          iconBg: 'bg-[#fff3f0] border-[#f4c6bf]',
          borderColor: 'border-[#f4c6bf]',
          progressBarColor: 'bg-[#8a3b2f]',
          titleColor: 'text-[#8a3b2f]',
        };
      case 'warning':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-[#b45309]" />,
          iconBg: 'bg-[#fef3c7] border-[#fde68a]',
          borderColor: 'border-[#fde68a]',
          progressBarColor: 'bg-[#b45309]',
          titleColor: 'text-[#b45309]',
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-5 h-5 text-[#0d3479]" />,
          iconBg: 'bg-[#dfe7f4] border-[#b9c7de]',
          borderColor: 'border-[#b9c7de]',
          progressBarColor: 'bg-[#0d3479]',
          titleColor: 'text-[#0d3479]',
        };
    }
  };

  const style = getStyle();

  return (
    <div
      className={`pointer-events-auto bg-white rounded-2xl shadow-2xl border ${style.borderColor} overflow-hidden p-4 flex items-start space-x-3.5 relative animate-in slide-in-from-bottom-5 fade-in duration-200`}
      role="alert"
    >
      {/* Icon Badge */}
      <div className={`p-2 rounded-xl border ${style.iconBg} shrink-0 shadow-2xs`}>
        {style.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 pr-6">
        {item.title && (
          <h4 className={`text-xs font-bold ${style.titleColor} uppercase tracking-wider mb-0.5`}>
            {item.title}
          </h4>
        )}
        <p className="text-xs font-semibold text-black leading-snug break-words">
          {item.message}
        </p>
      </div>

      {/* Close Button */}
      <button
        type="button"
        onClick={onDismiss}
        className="absolute top-3 right-3 p-1 rounded-lg text-[#666666] hover:text-black hover:bg-[#f0efe6] transition-colors cursor-pointer"
        title="Dismiss notification"
      >
        <X className="w-4 h-4" />
      </button>

      {/* 5-Second Progress Indicator Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#f0efe6]">
        <div
          className={`h-full ${style.progressBarColor} transition-all duration-75 ease-linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};
