'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  Image as ImageIcon,
  Boxes,
  ShoppingBag,
  RotateCcw,
  FileText,
  Users,
  BarChart3,
  Settings,
  Ticket,
  Gift,
  BookOpen
} from 'lucide-react';
import { useStoreData } from '@/context/StoreDataContext';

export const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const pathname = usePathname();
  const { orders = [], returnsList = [], books = [] } = useStoreData();

  const pendingOrdersCount = orders.filter((o) => o.orderStatus === 'Pending' || o.orderStatus === 'Processing').length;
  const pendingReturnsCount = returnsList.filter((r) => r.status === 'Pending Review').length;
  const lowStockCount = books.filter((b) => b.stock <= 5).length;

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Banners', href: '/banners', icon: ImageIcon },
    { name: 'Inventory', href: '/inventory', icon: Boxes, badge: lowStockCount > 0 ? lowStockCount : null, badgeColor: 'bg-amber-100 text-amber-900 border border-amber-300' },
    { name: 'Orders', href: '/orders', icon: ShoppingBag, badge: pendingOrdersCount > 0 ? pendingOrdersCount : null, badgeColor: 'bg-rose-100 text-rose-800 border border-rose-300' },
    { name: 'Coupons', href: '/coupons', icon: Ticket },
    { name: 'Referrals & Rewards', href: '/referrals', icon: Gift },
    { name: 'Returns & Refunds', href: '/returns', icon: RotateCcw, badge: pendingReturnsCount > 0 ? pendingReturnsCount : null, badgeColor: 'bg-pink-100 text-pink-800 border border-pink-300' },
    { name: 'Invoices', href: '/invoices', icon: FileText },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleLinkClick = () => {
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#fbfcfb] border-r border-slate-200 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header Brand */}
          <div className="p-5 flex items-center gap-3 border-b border-slate-200">
            <div className="w-10 h-10 rounded-md bg-emerald-50 border border-emerald-300 flex items-center justify-center text-emerald-800">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-black text-slate-900 leading-tight uppercase tracking-tight">LOGOS Books</h1>
              <p className="text-[11px] font-semibold text-slate-500">Admin Control Panel</p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/'
                  ? pathname === '/'
                  : pathname === item.href || pathname?.startsWith(`${item.href}/`);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={handleLinkClick}
                  className={`group flex items-center justify-between px-3.5 py-2.5 text-xs font-semibold rounded-md transition-all border ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-900 border-emerald-300 font-bold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-emerald-800' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>

                  {item.badge && (
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-bold rounded-sm ${
                        item.badgeColor || 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Info Box */}
          <div className="p-4 border-t border-slate-200 bg-slate-50">
            <div className="flex flex-col items-center text-center p-3 bg-white border border-slate-200 rounded-md">
              <div className="w-8 h-8 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800 mb-2">
                <BookOpen className="w-4 h-4" />
              </div>
              <p className="text-[11px] font-bold text-slate-800 uppercase tracking-tight">LOGOS E-Commerce</p>
              <p className="text-[10px] font-medium text-slate-500 mt-0.5">Secure Cloud Admin</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

