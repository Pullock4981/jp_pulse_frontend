'use client';

import { usePathname } from 'next/navigation';
import { ChevronRight, Bell, Search, GraduationCap } from 'lucide-react';

interface TopNavProps {
  title?: string;
}

export default function TopNav({ title }: TopNavProps) {
  const pathname = usePathname();
  
  // Simple breadcrumbs generator from pathname
  const paths = pathname.split('/').filter(Boolean);
  
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-slate-100 h-16 sticky top-0 z-40 px-8 flex items-center justify-between">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <span className="text-slate-400">Portal</span>
        {paths.map((path, idx) => {
          const isLast = idx === paths.length - 1;
          const label = path.charAt(0).toUpperCase() + path.slice(1);
          return (
            <div key={path} className="flex items-center gap-2">
              <ChevronRight className="h-3 w-3 text-slate-600" />
              <span className={isLast ? 'text-indigo-400 font-semibold' : 'text-slate-400 hover:text-slate-300 capitalize'}>
                {decodeURIComponent(label)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-4">
        {/* Search */}
        <div className="relative w-64 hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search students or projects..."
            className="w-full text-xs bg-slate-800/50 border border-slate-800 hover:border-slate-700 focus:border-indigo-600 text-slate-200 pl-9 pr-4 py-2 rounded-xl outline-none transition-all duration-200 placeholder:text-slate-600"
          />
        </div>

        {/* Notifications */}
        <button className="h-9 w-9 rounded-xl hover:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-100 transition-colors border border-transparent hover:border-slate-800">
          <Bell className="h-4 w-4" />
        </button>

        {/* User status info */}
        <div className="h-6 w-[1px] bg-slate-800"></div>

        <div className="flex items-center gap-2 text-xs">
          <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-slate-400 font-medium">Live Server Connected</span>
        </div>
      </div>
    </header>
  );
}
