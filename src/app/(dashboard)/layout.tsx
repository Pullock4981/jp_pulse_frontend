'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/shared/Sidebar';
import TopNav from '@/components/shared/TopNav';
import { Zap } from 'lucide-react';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<any>({ name: 'Loading...', role: 'mentor' });
  const pathname = usePathname();

  useEffect(() => {
    let token = sessionStorage.getItem('token');
    let storedUser = sessionStorage.getItem('user');

    if (!token || !storedUser) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      // Route guard: mentor cannot access /admin routes
      if (parsedUser.role !== 'admin' && pathname.startsWith('/admin')) {
        router.push('/mentor');
        return;
      }

      // Route guard: redirect mentor from root / to role-based home
      if (pathname === '/') {
        if (parsedUser.role !== 'admin') {
          router.push('/mentor');
          return;
        }
      }

    } catch {
      router.push('/login');
      return;
    }

    setAuthenticated(true);
  }, [router, pathname]);

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-white">
        <div className="absolute inset-0 z-0 pointer-events-none">
          <div
            className="absolute inset-0 z-0"
            style={{
              background: '#ffffff',
              backgroundImage: `radial-gradient(circle at top center, rgba(173, 109, 244, 0.4), transparent 70%)`,
              filter: 'blur(80px)',
              backgroundRepeat: 'no-repeat',
            }}
          />
          <div
            className="absolute inset-0 z-0 opacity-75"
            style={{
              backgroundImage: `linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)`,
              backgroundSize: '32px 32px',
              WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 100% 0%, #000 50%, transparent 90%)',
              maskImage: 'radial-gradient(ellipse 80% 80% at 100% 0%, #000 50%, transparent 90%)',
            }}
          />
        </div>

        <div className="relative z-10 flex flex-col items-center gap-5">
          <div className="relative">
            <div className="h-16 w-16 rounded-3xl flex items-center justify-center shadow-2xl"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #d946ef)' }}>
              <Zap className="h-8 w-8 text-white" fill="white" />
            </div>
            <div className="absolute -inset-2 rounded-3xl blur-xl opacity-40"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #d946ef)', zIndex: -1 }} />
          </div>
          <div className="text-center">
            <div className="h-6 w-6 border-[3px] border-t-transparent rounded-full animate-spin mx-auto mb-3"
              style={{ borderColor: 'var(--brand-primary)', borderTopColor: 'transparent' }} />
            <p className="text-sm font-semibold" style={{ color: 'var(--text-muted)' }}>Authenticating...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen relative overflow-hidden transition-colors duration-500 bg-white">
      {/* Premium Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div
          className="absolute inset-0 z-0"
          style={{
            background: '#ffffff',
            backgroundImage: `radial-gradient(circle at top center, rgba(173, 109, 244, 0.4), transparent 70%)`,
            filter: 'blur(80px)',
            backgroundRepeat: 'no-repeat',
          }}
        />
        <div
          className="absolute inset-0 z-0 opacity-75"
          style={{
            backgroundImage: `linear-gradient(to right, #e2e8f0 1px, transparent 1px), linear-gradient(to bottom, #e2e8f0 1px, transparent 1px)`,
            backgroundSize: '32px 32px',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 100% 0%, #000 50%, transparent 90%)',
            maskImage: 'radial-gradient(ellipse 80% 80% at 100% 0%, #000 50%, transparent 90%)',
          }}
        />
      </div>

      <Sidebar userRole={user?.role} userName={user?.name} />

      <div className="flex-1 flex flex-col min-w-0 relative z-10">
        <TopNav />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8" style={{ background: 'transparent' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
