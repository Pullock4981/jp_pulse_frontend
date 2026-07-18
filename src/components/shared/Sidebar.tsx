'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  FolderKanban,
  Trophy,
  Sparkles,
  LogOut,
  User,
  BookOpen,
  ShieldCheck,
  Zap,
  ChevronRight
} from 'lucide-react';

interface SidebarProps {
  userRole?: string;
  userName?: string;
}

export default function Sidebar({ userRole = 'mentor', userName = 'Mentor' }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: 'Dashboard', href: '/', icon: LayoutDashboard, desc: 'Overview & stats' },
    { name: 'Projects', href: '/projects', icon: FolderKanban, desc: 'Batch management' },
    { name: 'Quiz System', href: '/quiz', icon: BookOpen, desc: 'Assessments' },
    { name: 'Placement AI', href: '/placement', icon: Sparkles, desc: 'AI insights' },
  ];

  if (userRole === 'admin') {
    navItems.push({ name: 'Admin Panel', href: '/admin', icon: ShieldCheck, desc: 'System control' });
  }

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    router.push('/login');
  };

  const initials = userName
    ? userName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'U';

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 z-50 flex flex-col"
      style={{
        background: 'var(--surface-1)',
        borderRight: '1px solid var(--surface-border)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
      }}
    >
      {/* ── Brand Logo ─────────────────────────────── */}
      <div className="p-5 border-b flex items-center gap-3" style={{ borderColor: 'var(--surface-border)' }}>
        <div className="relative h-10 w-10 shrink-0">
          <div className="h-10 w-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #d946ef)' }}
          >
            <Zap className="h-5 w-5 text-white" fill="white" />
          </div>
          {/* Glow ring */}
          <div className="absolute inset-0 rounded-2xl opacity-40 blur-md"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #d946ef)', zIndex: -1 }}
          />
        </div>
        <div className="min-w-0">
          <h1 className="font-extrabold text-sm leading-tight tracking-tight" style={{ color: 'var(--foreground)' }}>
            Placement Pulse
          </h1>
          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--brand-primary)' }}>
            Cohort Tracker
          </span>
        </div>
      </div>

      {/* ── Navigation ─────────────────────────────── */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <p className="text-[9px] font-black uppercase tracking-widest px-3 py-2 mt-1 mb-1"
          style={{ color: 'var(--text-faint)' }}>
          Navigation
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href + '/')) || (item.href !== '/' && pathname === item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className="group flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-semibold transition-all duration-200 relative"
              style={{
                color: isActive ? 'var(--brand-primary)' : 'var(--text-muted)',
                background: isActive ? 'var(--brand-gradient-soft)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--brand-primary)' : '3px solid transparent',
              }}
            >
              <div className={`h-8 w-8 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0 ${isActive ? '' : 'group-hover:scale-110'
                }`}
                style={{
                  background: isActive
                    ? 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(217,70,239,0.15))'
                    : 'transparent',
                  color: isActive ? 'var(--brand-primary)' : 'var(--text-muted)',
                }}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <span className="block text-xs font-bold">{item.name}</span>
                <span className="block text-[10px] font-medium opacity-70">{item.desc}</span>
              </div>
              {isActive && (
                <ChevronRight className="h-3 w-3 shrink-0" style={{ color: 'var(--brand-primary)' }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── User Profile Footer ─────────────────────── */}
      <div className="p-3 border-t space-y-2" style={{ borderColor: 'var(--surface-border)' }}>
        {/* User card */}
        <div className="flex items-center gap-3 px-3 py-3 rounded-xl"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--surface-border)' }}
        >
          <div className="h-9 w-9 rounded-xl flex items-center justify-center font-extrabold text-sm shrink-0 text-white"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #d946ef)' }}
          >
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="text-xs font-bold truncate" style={{ color: 'var(--foreground)' }}>{userName}</h4>
            <span className="text-[9px] font-black uppercase tracking-widest capitalize"
              style={{ color: 'var(--brand-primary)' }}>
              {userRole}
            </span>
          </div>
          {/* Online indicator */}
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer"
          style={{ color: 'var(--text-muted)' }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#f43f5e';
            e.currentTarget.style.background = 'rgba(244,63,94,0.08)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
