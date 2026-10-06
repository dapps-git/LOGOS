'use client';

import React, { useState } from 'react';
import { Bell, QrCode, Menu, LogOut, ChevronDown, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export const Topbar = ({ onMenuClick }) => {
  const router = useRouter();
  const { admin, logout } = useAuth();
  const { showToast } = useToast();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const notifications = [
    { id: 1, title: 'New order received from reader', time: '5 mins ago', read: false },
    { id: 2, title: 'Low inventory alert: 4 copies left', time: '25 mins ago', read: false },
    { id: 3, title: 'Customer review submitted', time: '1 hr ago', read: true },
  ];

  const handleLogout = () => {
    logout();
    showToast('Signed out of Admin Portal successfully', 'info');
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8 bg-white/95 backdrop-blur-md border-b border-slate-200/80">
      {/* Left Mobile Menu Button & Brand/Indicator */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="p-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 lg:hidden border border-slate-200 rounded-md"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#1E3A8A] animate-pulse"></div>
          <span className="text-xs font-medium text-slate-800 tracking-tight">
            LOGOS Central Bookstore Console
          </span>
        </div>
      </div>

      {/* Right Controls (Notifications, Shortcuts, Admin Avatar) */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            className="relative p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 rounded-md transition-colors"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#1E3A8A] ring-2 ring-white" />
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-1.5 w-80 bg-white shadow-xl border border-slate-200 rounded-lg p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 px-1">
                <span className="text-xs font-semibold text-slate-900">Notifications</span>
                <span className="text-[10px] font-mono font-medium text-[#1E3A8A] bg-blue-50 px-2 py-0.5 border border-blue-100 rounded-full">
                  3 New
                </span>
              </div>
              <div className="space-y-1 py-2">
                {notifications.map((n) => (
                  <div
                    key={n.id}
                    className="p-2 hover:bg-slate-50 rounded-md transition-colors cursor-pointer border border-transparent hover:border-slate-100"
                  >
                    <p className="text-xs font-normal text-slate-800 leading-tight">{n.title}</p>
                    <span className="text-[10px] text-slate-400 font-light mt-0.5 block">{n.time}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Shortcut / QR Icon */}
        <Link
          href="/invoices"
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200/80 rounded-md transition-colors hidden sm:flex"
          title="Quick Invoices & Tax Receipts"
        >
          <QrCode className="w-4 h-4" />
        </Link>

        {/* Divider */}
        <div className="h-6 w-px bg-slate-200" />

        {/* Admin Profile Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 p-1.5 hover:bg-slate-50 border border-slate-200/80 rounded-md transition-colors"
          >
            <div className="w-7 h-7 rounded-md bg-blue-100 text-[#1E3A8A] text-xs font-bold flex items-center justify-center border border-blue-200">
              {mounted && admin?.name ? admin.name.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="hidden sm:block text-left">
              <p className="text-xs font-medium text-slate-900 leading-tight truncate max-w-[120px]">
                {mounted ? (admin?.name || 'Administrator') : 'Administrator'}
              </p>
              <p className="text-[10px] text-slate-400 font-light capitalize">
                {mounted ? (admin?.role || 'Super Admin') : 'Super Admin'}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-1.5 w-56 bg-white shadow-xl border border-slate-200 rounded-lg p-2 z-50 animate-in fade-in zoom-in-95 duration-150">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-medium text-slate-900 truncate">{mounted ? (admin?.name || 'Admin') : 'Admin'}</p>
                <p className="text-[11px] text-slate-400 font-light truncate">{mounted ? (admin?.email || 'logosadmin@gmail.com') : 'logosadmin@gmail.com'}</p>
              </div>

              <Link
                href="/settings"
                onClick={() => setProfileOpen(false)}
                className="flex items-center gap-2.5 px-3 py-2 text-xs font-light text-slate-700 hover:bg-blue-50/60 hover:text-[#1E3A8A] rounded-md transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-[#1E3A8A]" />
                Store Settings
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-light text-rose-600 hover:bg-rose-50 rounded-md transition-colors text-left"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

