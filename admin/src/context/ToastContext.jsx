'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'success', duration = 3500) => {
    const id = Date.now() + Math.random().toString(36).substring(2, 6);
    setToasts((prev) => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, duration);
    }
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none max-w-sm w-full">
        {toasts.map((toast) => {
          const isSuccess = toast.type === 'success';
          const isError = toast.type === 'error';
          const isWarning = toast.type === 'warning';

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center justify-between gap-3 p-4 rounded-xl shadow-lg border backdrop-blur-md transition-all animate-in slide-in-from-bottom-3 duration-200 ${
                isSuccess
                  ? 'bg-emerald-50/95 border-emerald-200 text-emerald-900'
                  : isError
                  ? 'bg-rose-50/95 border-rose-200 text-rose-900'
                  : isWarning
                  ? 'bg-amber-50/95 border-amber-200 text-amber-900'
                  : 'bg-slate-50/95 border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />}
                {isError && <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />}
                {isWarning && <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />}
                {!isSuccess && !isError && !isWarning && <Info className="w-5 h-5 text-blue-600 flex-shrink-0" />}
                <p className="text-sm font-medium leading-tight">{toast.message}</p>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 hover:bg-black/5 rounded-md transition-colors text-current opacity-70 hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
