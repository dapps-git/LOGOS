'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
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
  Star,
  LogOut
} from 'lucide-react';
import { useStoreData } from '@/context/StoreDataContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();
  const { showToast } = useToast();
  const { orders = [], returnsList = [], books = [] } = useStoreData();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const pendingOrdersCount = orders.filter((o) => o.orderStatus === 'Pending' || o.orderStatus === 'Processing').length;
  const pendingReturnsCount = returnsList.filter((r) => r.status === 'Pending Review').length;
  const lowStockCount = books.filter((b) => b.stock <= 5).length;

  const navigation = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Products', href: '/products', icon: Package },
    { name: 'Banners', href: '/banners', icon: ImageIcon },
    { name: 'Inventory', href: '/inventory', icon: Boxes, badge: lowStockCount > 0 ? lowStockCount : null, badgeColor: 'bg-amber-50 text-amber-800 border border-amber-200' },
    { name: 'Orders', href: '/orders', icon: ShoppingBag, badge: pendingOrdersCount > 0 ? pendingOrdersCount : null, badgeColor: 'bg-rose-50 text-rose-800 border border-rose-200' },
    { name: 'Coupons', href: '/coupons', icon: Ticket },
    { name: 'Referrals & Rewards', href: '/referrals', icon: Gift },
    { name: 'Returns & Refunds', href: '/returns', icon: RotateCcw, badge: pendingReturnsCount > 0 ? pendingReturnsCount : null, badgeColor: 'bg-blue-50 text-blue-800 border border-blue-200' },
    { name: 'Invoices', href: '/invoices', icon: FileText },
    { name: 'Reviews', href: '/reviews', icon: Star },
    { name: 'Customers', href: '/customers', icon: Users },
    { name: 'Reports', href: '/reports', icon: BarChart3 },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  const handleLinkClick = () => {
    if (setIsMobileOpen) setIsMobileOpen(false);
  };

  const handleSignOut = () => {
    logout();
    showToast('Signed out of Admin Portal', 'info');
    router.push('/login');
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header Brand with LOGOS Logo */}
          <div className="p-4 sm:p-5 flex items-center justify-between border-b border-slate-100">
            <Link href="/" className="flex items-center gap-2.5">
              <img
                src="/logo.png"
                alt="LOGOS Admin"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = '/book1.jpg';
                }}
                className="h-9 w-auto object-contain"
              />
            </Link>
            <span className="text-[11px] font-mono font-medium px-2 py-0.5 bg-blue-50 text-[#1E3A8A] rounded-full border border-blue-100">
              Admin
            </span>
          </div>

          {/* Navigation Links with Refined Font Size & Weight */}
          <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
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
                  className={`group flex items-center justify-between px-3 py-2 text-[12.5px] rounded-md transition-all border ${
                    isActive
                      ? 'bg-blue-50/85 text-[#1E3A8A] border-blue-200/90 font-semibold shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 border-transparent font-medium'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon
                      className={`w-4 h-4 transition-colors ${
                        isActive ? 'text-[#1E3A8A]' : 'text-slate-400 group-hover:text-slate-600'
                      }`}
                    />
                    <span className="tracking-tight">{item.name}</span>
                  </div>

                  {mounted && item.badge ? (
                    <span
                      className={`px-1.5 py-0.5 text-[10px] font-mono font-semibold rounded-full ${
                        item.badgeColor || 'bg-blue-50 text-[#1E3A8A]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </Link>
              );
            })}
          </nav>

          {/* Bottom Info Box with LOGOS Branding & Quick Sign Out */}
          <div className="p-3 border-t border-slate-100 bg-[#F8FAFC]">
            <div className="flex items-center justify-between p-2.5 bg-white border border-slate-200/80 rounded-md shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <img
                  src="/logo.png"
                  alt="LOGOS"
                  className="w-7 h-7 object-contain"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <div className="min-w-0">
                  <p className="text-xs font-medium text-slate-800 truncate">LOGOS Central</p>
                  <p className="text-[10px] text-slate-400 font-normal truncate">Connected</p>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

