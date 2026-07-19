'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { 
  User, LogOut, LayoutDashboard, FolderKanban, 
  FileCheck2, Sparkles, Trophy, Shield
} from 'lucide-react';

interface SidebarProps {
  userRole?: string;
  userName?: string;
}

export default function Sidebar({ userRole = 'mentor', userName = 'Mentor' }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const prefix = userRole === 'admin' ? '/admin' : '/mentor';

  const navItems = [
    { name: 'Dashboard', href: userRole === 'admin' ? '/' : '/mentor', icon: LayoutDashboard },
  ];

  if (userRole === 'admin') {
    navItems.push({ name: 'Admin Panel', href: '/admin', icon: Shield });
  }

  navItems.push(
    { name: 'Projects', href: `${prefix}/projects`, icon: FolderKanban },
    { name: 'Quiz System', href: `${prefix}/quiz`, icon: FileCheck2 },
    { name: 'Placement AI', href: `${prefix}/placement`, icon: Sparkles },
    { name: 'Leaderboard', href: `${prefix}/leaderboard`, icon: Trophy }
  );

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    router.push('/login');
  };

  return (
    <aside className="w-64 shrink-0 h-screen sticky top-0 z-50 flex py-4 pl-4 pr-0">
      
      {/* Outer White Wrapper */}
      <div className="w-full h-full bg-white rounded-l-[40px] rounded-r-none flex py-3 pl-3 shadow-[10px_0_30px_rgba(0,0,0,0.02)]">
        
        {/* Inner Purple Container */}
        <div className="w-full h-full bg-[#5B21B6] rounded-l-[32px] rounded-r-none flex flex-col relative overflow-hidden">
          
          {/* Logo Area */}
          <div className="flex flex-col items-center justify-center pt-10 pb-12 relative z-20">
            <div className="relative flex items-center justify-center w-14 h-14 rounded-full border border-white/20 mb-2">
              <svg className="w-8 h-8 text-white" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="50" cy="24" r="8.5" fill="white" />
                <path d="M26 45C33 42.5 41.5 46.5 50 46.5C58.5 46.5 67 42.5 74 45C78.5 46.5 80 50.5 80 54.5V57H20V54.5C20 50.5 21.5 46.5 26 45Z" fill="white" opacity="0.25" />
                <path d="M18 70C28 64 42 64 50 70C58 64 72 64 82 70V46C72 40 58 40 50 46C42 40 28 40 18 46Z" fill="white" stroke="white" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="50" y1="46" x2="50" y2="70" stroke="white" strokeWidth="4.5" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 flex flex-col gap-2 overflow-y-auto w-full relative z-20">
            {navItems.map((item) => {
              const isActive = item.href === '/' || item.href === '/mentor' || item.href === '/admin'
                ? pathname === item.href
                : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group w-[calc(100%-12px)] ml-auto py-3.5 pl-6 block text-sm font-bold transition-all duration-300 relative ${
                    isActive 
                      ? 'sidebar-active-item text-[#5B21B6]' 
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`h-5 w-5 ${isActive ? 'text-[#5B21B6]' : ''}`} />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Logout */}
          <div className="mt-auto mb-6 flex flex-col items-center px-4 w-full relative z-20">
            <div className="flex flex-col items-center justify-center mb-6 text-center border-t border-white/10 pt-6 w-full">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center mb-2">
                <User className="h-5 w-5 text-white/80" />
              </div>
              <p className="text-white font-bold text-sm truncate max-w-[150px]">{userName}</p>
              <p className="text-white/50 text-xs mt-0.5 capitalize">{userRole}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-white/70 hover:text-white text-xs font-bold transition-colors justify-center py-2"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
          
        </div>
      </div>
    </aside>
  );
}
