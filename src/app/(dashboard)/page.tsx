'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/utils/api';
import {
  Users,
  Briefcase,
  TrendingUp,
  Activity,
  CheckCircle,
  AlertTriangle,
  Clock,
  ShieldAlert,
  ArrowRight,
  FolderOpen,
  Sparkles,
  Zap,
  Target,
  Award
} from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, color, sub, trend }: {
  label: string;
  value: string | number;
  icon: any;
  color: string;
  sub?: string;
  trend?: string;
}) => (
  <div className="stat-card group">
    <div className="flex items-start justify-between mb-4">
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--text-faint)' }}>
          {label}
        </p>
        <h3 className="text-3xl font-black tracking-tight" style={{ color: 'var(--foreground)' }}>
          {value}
        </h3>
      </div>
      <div className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 text-white ml-3 shadow-lg"
        style={{ background: color }}>
        <Icon className="h-5 w-5" />
      </div>
    </div>
    {(sub || trend) && (
      <div className="flex items-center gap-1.5 text-xs font-semibold mt-1">
        {trend && <span className="text-emerald-500">{trend}</span>}
        {sub && <span style={{ color: 'var(--text-faint)' }}>{sub}</span>}
      </div>
    )}
    {/* Bottom accent bar */}
    <div className="mt-4 h-1 rounded-full overflow-hidden" style={{ background: 'var(--surface-border)' }}>
      <div className="h-full rounded-full" style={{ background: color, width: '60%', opacity: 0.6 }} />
    </div>
  </div>
);

export default function GlobalDashboard() {
  const [stats, setStats] = useState({
    totalProjects: 0, totalMentors: 0, totalStudents: 0, totalHired: 0,
    placementRate: '0%', totalActive: 0, totalRiskCount: 0,
    recentActivities: [] as { text: string; time: string; batch: string }[],
    priorityTasks: [] as string[]
  });
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState('mentor');

  useEffect(() => {
    fetchDashboardData();
    const storedUser = sessionStorage.getItem('user');
    if (storedUser) {
      try { setUserRole(JSON.parse(storedUser).role || 'mentor'); } catch { }
    }
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/dashboard');
      const d = res.data || {};
      setStats({
        totalProjects: d.totalProjects || 0, totalMentors: d.totalMentors || 0,
        totalStudents: d.totalStudents || 0, totalHired: d.totalHired || 0,
        placementRate: d.placementRate || '0%', totalActive: d.totalActive || 0,
        totalRiskCount: d.totalRiskCount || 0, recentActivities: d.recentActivities || [],
        priorityTasks: d.priorityTasks || []
      });
    } catch {
      setStats({
        totalProjects: 3, totalMentors: 6, totalStudents: 85, totalHired: 23,
        placementRate: '27.1%', totalActive: 61, totalRiskCount: 4,
        recentActivities: [
          { text: 'Rahim scored 92% in React Fundamentals Quiz', time: '2 hours ago', batch: 'Batch 5' },
          { text: 'Moutushi uploaded roster spreadsheet for Albatross Boot-camp', time: '4 hours ago', batch: 'Batch 4' },
          { text: 'Karim marked attendance for 18 students', time: '6 hours ago', batch: 'Batch 3' },
        ],
        priorityTasks: [
          'Contact Bob Miller regarding 5 consecutive absences',
          'Review GitHub repositories for Batch 4 final project',
          'Schedule mock interviews for Tier A students',
        ]
      });
    } finally { setLoading(false); }
  };

  const statsData = [
    ...(userRole === 'admin' ? [{ label: 'Total Mentors', value: stats.totalMentors, icon: ShieldAlert, color: 'linear-gradient(135deg, #7c3aed, #a78bfa)', sub: 'Platform staff' }] : []),
    { label: 'Total Projects', value: stats.totalProjects, icon: FolderOpen, color: 'linear-gradient(135deg, #6d28d9, #7c3aed)', sub: 'Active monitoring' },
    { label: 'Total Enrolled', value: stats.totalStudents, icon: Users, color: 'linear-gradient(135deg, #d946ef, #e879f9)', sub: `${stats.totalActive} currently active` },
    { label: 'Students Placed', value: stats.totalHired, icon: Briefcase, color: 'linear-gradient(135deg, #10b981, #34d399)', sub: 'Successfully placed', trend: '↑' },
    { label: 'Placement Rate', value: stats.placementRate, icon: TrendingUp, color: 'linear-gradient(135deg, #f97316, #fb923c)', sub: 'Overall health' },
  ];

  const activityColors = [
    'linear-gradient(135deg, #7c3aed, #d946ef)',
    'linear-gradient(135deg, #10b981, #34d399)',
    'linear-gradient(135deg, #f97316, #fb923c)',
  ];

  return (
    <div className="space-y-8 page-enter">
      {/* ── Page Header ───────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-6 w-6 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #d946ef)' }}>
              <Zap className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>
              {userRole === 'admin' ? 'Admin View' : 'Mentor View'}
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight gradient-text">
            {userRole === 'admin' ? 'Admin Global Dashboard' : 'Global Dashboard'}
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
            High-level placement metrics and cohort oversight
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981' }}>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Systems Operational
          </div>
        </div>
      </div>

      {/* ── Stats Grid ─────────────────────────────────────── */}
      {loading ? (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${userRole === 'admin' ? '5' : '4'} gap-5`}>
          {Array.from({ length: userRole === 'admin' ? 5 : 4 }).map((_, i) => (
            <div key={i} className="rounded-3xl p-6 h-36 skeleton" />
          ))}
        </div>
      ) : (
        <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-${userRole === 'admin' ? '5' : '4'} gap-5`}>
          {statsData.map(stat => (
            <StatCard key={stat.label} {...stat} />
          ))}
        </div>
      )}

      {/* ── Main Content Grid ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Activity Feed */}
        <div className="lg:col-span-2 glass-card p-6 space-y-5">
          <div className="flex items-center justify-between border-b pb-4" style={{ borderColor: 'var(--surface-border)' }}>
            <div className="flex items-center gap-2.5">
              <div className="h-8 w-8 rounded-xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(217,70,239,0.1))' }}>
                <Clock className="h-4 w-4" style={{ color: 'var(--brand-primary)' }} />
              </div>
              <div>
                <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Recent Batch Activity</h3>
                <p className="text-[10px] font-medium" style={{ color: 'var(--text-faint)' }}>Latest cohort operations</p>
              </div>
            </div>
            <Link href="/projects"
              className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest transition-colors hover:opacity-80"
              style={{ color: 'var(--brand-primary)' }}>
              All Projects <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-3">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-16 rounded-2xl skeleton" />
              ))
            ) : stats.recentActivities.length > 0 ? (
              stats.recentActivities.map((activity, idx) => (
                <div key={idx}
                  className="flex items-start justify-between p-4 rounded-2xl transition-all duration-200 group cursor-default"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--surface-border)' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--surface-border-hover)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--surface-border)'; }}
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="h-8 w-8 rounded-xl shrink-0 text-white flex items-center justify-center text-xs font-black"
                      style={{ background: activityColors[idx % activityColors.length] }}>
                      {activity.text[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold leading-relaxed truncate" style={{ color: 'var(--foreground)' }}>
                        {activity.text}
                      </p>
                      <span className="text-[10px] font-medium" style={{ color: 'var(--text-faint)' }}>
                        {activity.time}
                      </span>
                    </div>
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-lg shrink-0 ml-3"
                    style={{ background: 'var(--brand-gradient-soft)', color: 'var(--brand-primary)', border: '1px solid var(--surface-border)' }}>
                    {activity.batch}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-10 text-center rounded-2xl" style={{ border: '1px dashed var(--surface-border)' }}>
                <Activity className="h-8 w-8 mx-auto mb-2" style={{ color: 'var(--text-faint)' }} />
                <p className="text-sm font-medium" style={{ color: 'var(--text-faint)' }}>No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-5">

          {/* Risk Alert Card */}
          <div className="glass-card p-6 space-y-4">
            <div className="flex items-center gap-2.5 border-b pb-4" style={{ borderColor: 'var(--surface-border)' }}>
              <div className="h-8 w-8 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)' }}>
                <ShieldAlert className="h-4 w-4 text-rose-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>AI Risk Alerts</h3>
                <p className="text-[10px]" style={{ color: 'var(--text-faint)' }}>Predictive flagging</p>
              </div>
            </div>

            <div className="p-4 rounded-2xl space-y-2"
              style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.15)', borderLeft: '4px solid #f43f5e' }}>
              <div className="flex items-center gap-2 text-rose-500 font-bold text-xs">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>Dropout Warning: {stats.totalRiskCount} flagged</span>
              </div>
              <p className="text-[11px] leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                High absence streaks detected. Immediate follow-up recommended.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>
                Priority Actions
              </p>
              {loading ? (
                Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-8 rounded-xl skeleton" />)
              ) : stats.priorityTasks.length > 0 ? (
                stats.priorityTasks.map((task, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl text-xs"
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--surface-border)' }}>
                    <Target className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-500" />
                    <span style={{ color: 'var(--foreground)' }}>{task}</span>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs rounded-xl" style={{ color: 'var(--text-faint)' }}>
                  ✅ All caught up!
                </div>
              )}
            </div>
          </div>

          {/* Quick links */}
          <div className="glass-card p-5 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>
              Quick Access
            </h3>
            {[
              { label: 'View All Projects', href: '/projects', icon: FolderOpen, color: '#7c3aed' },
              { label: 'Placement AI', href: '/placement', icon: Sparkles, color: '#d946ef' },
              { label: 'Quiz System', href: '/quiz', icon: Award, color: '#f97316' },
            ].map(link => {
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href}
                  className="flex items-center gap-3 p-3 rounded-xl text-xs font-semibold transition-all duration-200 group"
                  style={{ color: 'var(--foreground)', border: '1px solid var(--surface-border)' }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = link.color;
                    (e.currentTarget as HTMLElement).style.background = `${link.color}10`;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = 'var(--surface-border)';
                    (e.currentTarget as HTMLElement).style.background = 'transparent';
                  }}
                >
                  <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 text-white"
                    style={{ background: link.color }}>
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="flex-1">{link.label}</span>
                  <ArrowRight className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
