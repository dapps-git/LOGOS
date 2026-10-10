import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { StoreDataProvider } from '@/context/StoreDataContext';

export const metadata = {
  title: 'LOGOS | Bookstore Admin Panel',
  description: 'Enterprise Malayalam & English Bookstore Administration System',
  icons: {
    icon: '/logo.png',
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#F8FAFC] text-slate-900 font-sans antialiased selection:bg-blue-100 selection:text-[#1E3A8A]" suppressHydrationWarning>
        <ToastProvider>
          <AuthProvider>
            <StoreDataProvider>
              {children}
            </StoreDataProvider>
          </AuthProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
