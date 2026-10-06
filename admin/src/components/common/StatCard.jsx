'use client';

import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export const StatCard = ({
  title,
  value,
  trend,
  trendType = 'up',
  icon: Icon,
  variant = 'blue',
  className = ''
}) => {
  const variantStyles = {
    blue: {
      cardBg: 'bg-white',
      borderColor: 'border-blue-100',
      iconBg: 'bg-blue-50 text-[#1E3A8A]',
      iconColor: 'text-[#1E3A8A]',
      trendColor: 'text-blue-700'
    },
    royal: {
      cardBg: 'bg-white',
      borderColor: 'border-slate-200/80',
      iconBg: 'bg-indigo-50 text-indigo-700',
      iconColor: 'text-indigo-700',
      trendColor: 'text-indigo-700'
    },
    amber: {
      cardBg: 'bg-white',
      borderColor: 'border-amber-100',
      iconBg: 'bg-amber-50 text-amber-700',
      iconColor: 'text-amber-700',
      trendColor: 'text-amber-700'
    },
    pink: {
      cardBg: 'bg-white',
      borderColor: 'border-rose-100',
      iconBg: 'bg-rose-50 text-rose-700',
      iconColor: 'text-rose-700',
      trendColor: 'text-rose-700'
    },
    green: {
      cardBg: 'bg-white',
      borderColor: 'border-blue-100',
      iconBg: 'bg-blue-50 text-[#1E3A8A]',
      iconColor: 'text-[#1E3A8A]',
      trendColor: 'text-[#1E3A8A]'
    }
  };

  const style = variantStyles[variant] || variantStyles.blue;

  return (
    <div className={`p-5 rounded-lg border ${style.cardBg} ${style.borderColor} shadow-xs hover:shadow-md transition-all duration-200 ${className}`}>
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-[11px] font-normal uppercase tracking-wider text-slate-400">{title}</p>
          <h3 suppressHydrationWarning className="text-2xl sm:text-3xl font-medium tracking-tight text-slate-900">{value}</h3>
        </div>
        <div className={`w-11 h-11 rounded-md flex items-center justify-center ${style.iconBg} ${style.iconColor} border ${style.borderColor} shadow-2xs`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {trend && (
        <div className="mt-3.5 flex items-center gap-1.5 text-xs font-light">
          <span className={`inline-flex items-center gap-0.5 font-medium ${style.trendColor}`}>
            {trendType === 'up' ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            {trend}
          </span>
          <span className="text-slate-400">vs last month</span>
        </div>
      )}
    </div>
  );
};
