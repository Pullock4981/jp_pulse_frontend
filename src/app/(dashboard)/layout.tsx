'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '@/components/shared/Sidebar';
import TopNav from '@/components/shared/TopNav';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<any>({ name: 'Demo Mentor', role: 'mentor' });

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');

    if (!token) {
      router.push('/login');
      return;
    }

    setAuthenticated(true);

    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        // Ignore
      }
    }
  }, [router]);

  if (!authenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium tracking-wide">Authenticating...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-slate-950 text-slate-100 min-h-screen">
      <Sidebar userRole={user?.role} userName={user?.name} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopNav />
        <main className="flex-1 overflow-y-auto bg-slate-950/40 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
