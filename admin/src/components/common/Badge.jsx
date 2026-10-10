'use client';

import React from 'react';

export const Badge = ({ children, variant = 'default', size = 'md', className = '' }) => {
  const variantStyles = {
    delivered: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    success: 'bg-emerald-50 text-emerald-800 border border-emerald-200',
    processing: 'bg-amber-50 text-amber-800 border border-amber-200',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
    shipped: 'bg-indigo-50 text-indigo-800 border border-indigo-200',
    out_for_delivery: 'bg-blue-50 text-blue-800 border border-blue-200',
    return_requested: 'bg-amber-100 text-amber-900 border border-amber-300',
    return_accepted: 'bg-teal-50 text-teal-800 border border-teal-200',
    return_scheduled: 'bg-cyan-50 text-cyan-800 border border-cyan-200',
    returned: 'bg-purple-50 text-purple-800 border border-purple-200',
    refunded: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
    exchanged: 'bg-blue-50 text-blue-800 border border-blue-200',
    replacement_dispatched: 'bg-blue-50 text-blue-800 border border-blue-200',
    return_rejected: 'bg-rose-50 text-rose-800 border border-rose-200',
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
