'use client';

import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'md', className = '' }) => {
  const variantStyles = {
    delivered: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    processing: 'bg-amber-50 text-amber-800 border border-amber-200',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
    shipped: 'bg-indigo-50 text-indigo-800 border border-indigo-200',
    pending: 'bg-rose-50 text-rose-800 border border-rose-200',
    danger: 'bg-rose-50 text-rose-800 border border-rose-200',
    cancelled: 'bg-slate-100 text-slate-600 border border-slate-200',
    info: 'bg-sky-50 text-sky-800 border border-sky-200',
    default: 'bg-slate-50 text-slate-700 border border-slate-200',
    in_stock: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    low_stock: 'bg-amber-50 text-amber-800 border border-amber-200',
    out_of_stock: 'bg-rose-50 text-rose-800 border border-rose-200'
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[11px] font-semibold',
    md: 'px-2.5 py-1 text-xs font-semibold',
    lg: 'px-3 py-1.5 text-xs font-bold'
  };

  const normalizedVariant = variant?.toLowerCase()?.replace(/\s+/g, '_') || 'default';
  const badgeClass = variantStyles[normalizedVariant] || variantStyles.default;

  return (
    <span className={`inline-flex items-center justify-center whitespace-nowrap leading-none rounded transition-colors ${badgeClass} ${sizeStyles[size] || sizeStyles.md} ${className}`}>
      {children}
    </span>
  );
};
