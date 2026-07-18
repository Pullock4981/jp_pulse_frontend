'use client';

import { usePathname } from 'next/navigation';
import { ChevronRight, Bell, Search, Sun, Moon, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function TopNav() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [hasNotif, setHasNotif] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
    const preferred = saved || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    setTheme(preferred);
    if (preferred === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('theme', next);
    if (next === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  // Build breadcrumbs
  const paths = pathname.split('/').filter(Boolean);

  const breadcrumbLabels: Record<string, string> = {
    projects: 'Projects',
    quiz: 'Quiz System',
    placement: 'Placement AI',
    admin: 'Admin Panel',
    students: 'Students',
    forms: 'Forms',
  };

  const getLabel = (segment: string) => {
    // UUID-like segments → show "Details"
    if (segment.length === 24 || segment.length === 36) return 'Details';
    return breadcrumbLabels[segment] || (segment.charAt(0).toUpperCase() + segment.slice(1));
  };

  return (
    <header
      className="h-14 sticky top-0 z-40 px-6 flex items-center justify-between gap-4"
      style={{
        background: 'var(--surface-1)',
        borderBottom: '1px solid var(--surface-border)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
    >
      {/* ── Breadcrumbs ──────────────────────────── */}
      <div className="flex items-center gap-1.5 text-xs font-semibold min-w-0">
        <div className="flex items-center gap-1.5" style={{ color: 'var(--text-faint)' }}>
          <Zap className="h-3.5 w-3.5 shrink-0" style={{ color: 'var(--brand-primary)' }} />
          <span className="hidden sm:block">Portal</span>
        </div>
        {paths.length === 0 ? (
          <>
            <ChevronRight className="h-3 w-3 shrink-0" style={{ color: 'var(--text-faint)' }} />
            <span className="font-bold" style={{ color: 'var(--brand-primary)' }}>Dashboard</span>
          </>
        ) : (
          paths.map((segment, idx) => {
            const isLast = idx === paths.length - 1;
            return (
              <div key={idx} className="flex items-center gap-1.5 min-w-0">
                <ChevronRight className="h-3 w-3 shrink-0" style={{ color: 'var(--text-faint)' }} />
                <span
                  className={`truncate ${isLast ? 'font-bold' : 'font-medium'}`}
                  style={{ color: isLast ? 'var(--brand-primary)' : 'var(--text-muted)' }}
                >
                  {getLabel(segment)}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* ── Right Actions ────────────────────────── */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Search bar */}
        <div className="relative hidden md:flex items-center w-52">
          <Search className="absolute left-3 h-3.5 w-3.5 pointer-events-none" style={{ color: 'var(--text-faint)' }} />
          <input
            type="text"
            placeholder="Search..."
            className="w-full text-xs pl-9 pr-4 py-2 rounded-xl outline-none transition-all duration-200"
            style={{
              background: 'var(--surface-2)',
              border: '1px solid var(--surface-border)',
              color: 'var(--foreground)',
            }}
            onFocus={e => {
              e.target.style.borderColor = 'var(--brand-primary)';
              e.target.style.boxShadow = '0 0 0 3px rgba(124,58,237,0.12)';
            }}
            onBlur={e => {
              e.target.style.borderColor = 'var(--surface-border)';
              e.target.style.boxShadow = 'none';
            }}
          />
          <span className="absolute right-3 text-[9px] font-bold opacity-40 hidden lg:block" style={{ color: 'var(--text-muted)' }}>⌘K</span>
        </div>

        {/* Divider */}
        <div className="h-5 w-px mx-1 hidden md:block" style={{ background: 'var(--surface-border)' }} />

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="h-8 w-8 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer"
          style={{ color: 'var(--text-muted)', border: '1px solid var(--surface-border)' }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--brand-primary)';
            e.currentTarget.style.color = 'var(--brand-primary)';
            e.currentTarget.style.background = 'var(--brand-gradient-soft)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--surface-border)';
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.background = 'transparent';
          }}
          title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
          {theme === 'dark'
            ? <Sun className="h-4 w-4" />
            : <Moon className="h-4 w-4" />
          }
        </button>

        {/* Notification bell */}
        <button
          className="relative h-8 w-8 rounded-xl flex items-center justify-center transition-all duration-200 cursor-pointer"
          style={{ color: 'var(--text-muted)', border: '1px solid var(--surface-border)' }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--brand-primary)';
            e.currentTarget.style.color = 'var(--brand-primary)';
            e.currentTarget.style.background = 'var(--brand-gradient-soft)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = 'var(--surface-border)';
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.background = 'transparent';
          }}
          onClick={() => setHasNotif(false)}
        >
          <Bell className="h-4 w-4" />
          {hasNotif && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-rose-500 border-2 animate-pulse"
              style={{ borderColor: 'var(--surface-1)' }}
            />
          )}
        </button>

        {/* Live status */}
        <div className="hidden lg:flex items-center gap-2 pl-1">
          <div className="h-px w-4" style={{ background: 'var(--surface-border)' }} />
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-semibold" style={{ color: 'var(--text-faint)' }}>Live</span>
          </div>
        </div>
      </div>
    </header>
  );
}
