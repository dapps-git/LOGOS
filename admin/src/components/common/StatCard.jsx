'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  trend,
  trendType = 'up',
  icon: Icon,
  variant = 'green',
  className = ''
}) => {
  const variantStyles = {
    green: {
      cardBg: 'bg-[#f0fdf4]',
      borderColor: 'border-[#bbf7d0]',
      iconBg: 'bg-[#dcfce7]',
      iconColor: 'text-[#15803d]',
      trendColor: 'text-[#15803d]'
    },
    blue: {
      cardBg: 'bg-[#f0f9ff]',
      borderColor: 'border-[#bae6fd]',
      iconBg: 'bg-[#e0f2fe]',
      iconColor: 'text-[#0284c7]',
      trendColor: 'text-[#0284c7]'
    },
    amber: {
      cardBg: 'bg-[#fffbeb]',
      borderColor: 'border-[#fde68a]',
      iconBg: 'bg-[#fef3c7]',
      iconColor: 'text-[#b45309]',
      trendColor: 'text-[#15803d]'
    },
    pink: {
      cardBg: 'bg-[#fff1f2]',
      borderColor: 'border-[#fecdd3]',
      iconBg: 'bg-[#ffe4e6]',
      iconColor: 'text-[#e11d48]',
      trendColor: 'text-[#e11d48]'
    }
  };

  const style = variantStyles[variant] || variantStyles.green;

  return (
    <div className={`p-5 rounded-md border ${style.cardBg} ${style.borderColor} transition-all duration-150 hover:shadow-sm ${className}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">{title}</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">{value}</h3>
        </div>
        <div className={`w-10 h-10 rounded-md flex items-center justify-center ${style.iconBg} ${style.iconColor} border ${style.borderColor}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {trend && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-medium">
          <span className={`inline-flex items-center gap-0.5 font-bold ${style.trendColor}`}>
            {trendType === 'up' ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            {trend}
          </span>
          <span className="text-slate-500">from last month</span>
        </div>
      )}
    </div>
  );
};
