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
  ShieldCheck
} from 'lucide-react';

interface SidebarProps {
  userRole?: string;
  userName?: string;
}

export default function Sidebar({ userRole = 'mentor', userName = 'Mentor' }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const navItems = [
    { name: 'Global Dashboard', href: '/', icon: LayoutDashboard },
    { name: 'Projects', href: '/projects', icon: FolderKanban },
    { name: 'Quiz System', href: '/quiz', icon: BookOpen },
    { name: 'Placement AI', href: '/placement', icon: Sparkles },
  ];

  if (userRole === 'admin') {
    navItems.push({ name: 'Admin Panel', href: '/admin', icon: ShieldCheck });
  }

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-100 flex flex-col justify-between h-screen sticky top-0">
      <div>
        {/* Brand/Logo */}
        <div className="p-6 border-b border-slate-800 flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/30">
            H
          </div>
          <div>
            <h1 className="font-bold text-base leading-tight tracking-tight text-white">Hackathon Portal</h1>
            <span className="text-xs text-indigo-400 font-medium">Placement Tracker</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-100 border border-transparent'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-400' : 'text-slate-400 group-hover:text-slate-100'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer Profile & Logout */}
      <div className="p-4 border-t border-slate-800 space-y-4">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-800/40 border border-slate-800/60">
          <div className="h-10 w-10 rounded-full bg-slate-700 flex items-center justify-center text-slate-300 font-semibold border border-slate-600">
            <User className="h-5 w-5" />
          </div>
          <div className="overflow-hidden">
            <h4 className="text-sm font-semibold text-slate-200 truncate">{userName}</h4>
            <span className="text-xs text-slate-500 capitalize">{userRole}</span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 hover:text-rose-400 hover:bg-rose-500/5 border border-transparent rounded-xl text-sm font-medium transition-all duration-200"
        >
          <LogOut className="h-5 w-5" />
          Log Out
        </button>
      </div>
    </aside>
  );
}
