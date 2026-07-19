'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { apiRequest } from '@/utils/api';
import {
  Users,
  FolderOpen,
  CheckCircle,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Award,
  Target,
  Activity,
  Bell
} from 'lucide-react';

const SemiCircleGauge = ({ value }: { value: number }) => {
  const strokeDash = 110;
  const strokeOffset = strokeDash - (value / 100) * strokeDash;

  return (
    <div className="relative flex flex-col items-center justify-center">
      <svg className="w-44 h-28" viewBox="0 0 100 60">
        <path d="M 15 50 A 35 35 0 0 1 85 50" fill="none" stroke="#f1f5f9" strokeWidth="9" strokeLinecap="round" />
        <path
          d="M 15 50 A 35 35 0 0 1 85 50"
          fill="none"
          stroke="url(#gaugePurpleGradient)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={strokeDash}
          strokeDashoffset={strokeOffset}
          style={{ transition: 'stroke-dashoffset 0.8s ease-in-out' }}
        />
        <defs>
          <linearGradient id="gaugePurpleGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#d946ef" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute bottom-2 flex flex-col items-center">
        <span className="text-3xl font-black text-gray-900">{value}%</span>
        <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Predicted</span>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color, sub, isAlert }: {
  label: string; value: string | number; icon: any; color: string; sub?: string; isAlert?: boolean;
}) => {
  if (isAlert) {
    return (
      <div
        className="rounded-3xl p-6 flex flex-col justify-between text-white shadow-xl relative overflow-hidden h-36"
        style={{ background: 'linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)' }}
      >
        <div className="flex items-start justify-between z-10">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/80 mb-1">{label}</p>
            <h3 className="text-3xl font-black tracking-tight">{value}</h3>
          </div>
          <div className="h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 bg-white/20 text-white">
            <Icon className="h-5 w-5 fill-white" />
          </div>
        </div>
        <div className="text-[10px] font-bold text-white/90 z-10">{sub}</div>
        <div className="absolute -right-5 -bottom-5 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
      </div>
    );
  }
  return (
    <div className="stat-card group bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-36">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{label}</p>
          <h3 className="text-3xl font-black tracking-tight text-gray-900">{value}</h3>
        </div>
        <div
          className="h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
          style={{ background: `${color}15`, color: color }}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="text-[10px] font-bold text-gray-400">{sub}</div>
    </div>
  );
};

export default function MentorOverview() {
  const [stats, setStats] = useState<{
    totalProjects: number; totalStudents: number; totalHired: number;
    placementRate: string; totalActive: number; totalRiskCount: number;
    recentActivities: { text: string; time: string; batch: string }[];
    priorityTasks: string[];
  }>({
    totalProjects: 0, totalStudents: 0, totalHired: 0,
    placementRate: '0%', totalActive: 0, totalRiskCount: 0,
    recentActivities: [], priorityTasks: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [userName, setUserName] = useState('Mentor');

  useEffect(() => {
    try {
      const u = JSON.parse(sessionStorage.getItem('user') || '{}');
      if (u && u.name) setUserName(u.name);
    } catch (e) {}
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await apiRequest('/dashboard');
      const d = res.data || {};
      setStats({
        totalProjects: d.totalProjects || 0,
        totalStudents: d.totalStudents || 0,
        totalHired: d.totalHired || 0,
        placementRate: d.placementRate || '0%',
        totalActive: d.totalActive || 0,
        totalRiskCount: d.totalRiskCount || 0,
        recentActivities: d.recentActivities || [],
        priorityTasks: d.priorityTasks || []
      });
    } catch {
      setError('Could not connect to the backend. Please make sure the server is running.');
    } finally {
      setLoading(false);
    }
  };

  const numericRate = parseFloat(stats.placementRate) || 0;

  return (
    <div className="space-y-8 page-enter relative z-10">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            Welcome, <span className="text-purple-600">{userName}</span> 👋
          </h1>
          <p className="text-sm mt-1 text-gray-500 font-medium">AI-powered insights for the current placement cycle.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-50 border border-emerald-100 text-emerald-600">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Systems Operational
          </div>
          <button
            onClick={fetchDashboardData}
            className="btn-gradient px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md"
          >
            <span>REFRESH</span>
          </button>
        </div>
      </div>

      {/* ── Error State ── */}
      {error && !loading && (
        <div className="bg-rose-50 border border-rose-100 rounded-2xl p-5 flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-bold text-rose-700">{error}</p>
            <button onClick={fetchDashboardData} className="text-xs text-rose-600 underline mt-1 font-semibold">
              Try again
            </button>
          </div>
        </div>
      )}

      {/* ── Stats Grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-3xl p-6 h-36 bg-gray-50 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Total Students" value={stats.totalStudents} icon={Users} color="#7c3aed" sub="Enrolled in your projects" />
          <StatCard label="Active Projects" value={stats.totalProjects} icon={FolderOpen} color="#7c3aed" sub="Currently monitoring" />
          <StatCard label="Hired Candidates" value={stats.totalHired} icon={CheckCircle} color="#d97706" sub="Successfully placed" />
          <StatCard label="AI Alerts" value={stats.totalRiskCount} icon={Bell} color="" sub="Requires immediate review" isAlert={true} />
        </div>
      )}

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Side */}
        <div className="lg:col-span-2 space-y-6">
          {/* Placement Rate Card */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm flex items-center justify-between gap-6 flex-wrap md:flex-nowrap">
            <div className="space-y-4 max-w-md">
              <h3 className="text-xl font-bold text-gray-900">Overall Placement Rate</h3>
              <p className="text-sm text-gray-500 leading-relaxed font-medium">
                AI prediction models track your batch performance and hiring cycle trends in real-time.
              </p>
              <div className="flex items-center gap-3.5 pt-1">
                <span className="px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                  ON TRACK
                </span>
              </div>
            </div>
            <div className="shrink-0 mx-auto md:mx-0">
              <SemiCircleGauge value={numericRate} />
            </div>
          </div>

          {/* Recent Batch Activity */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-gray-50 pb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Recent Batch Activity</h3>
                <p className="text-xs text-gray-400 font-medium">Latest project operations</p>
              </div>
              <Link href="/mentor/projects" className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-purple-600 hover:text-purple-700 transition-colors">
                All Projects <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 rounded-2xl bg-gray-50 animate-pulse" />)
              ) : stats.recentActivities.length > 0 ? (
                stats.recentActivities.map((activity, idx) => (
                  <div key={idx} className="flex items-start justify-between p-4 rounded-2xl border border-gray-50 bg-gray-50/50 hover:bg-gray-50 transition-colors duration-150">
                    <div className="flex items-start gap-3.5 min-w-0 flex-1">
                      <div className="h-8 w-8 rounded-xl shrink-0 text-purple-700 bg-purple-50 flex items-center justify-center text-xs font-black">
                        {activity.text[0]}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-800 leading-relaxed truncate">{activity.text}</p>
                        <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider block mt-0.5">{activity.time}</span>
                      </div>
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg shrink-0 ml-3 bg-purple-50 text-purple-700 border border-purple-100">
                      {activity.batch}
                    </span>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center rounded-2xl border border-dashed border-gray-100">
                  <Activity className="h-8 w-8 mx-auto mb-2 text-gray-300" />
                  <p className="text-xs font-bold text-gray-400">No recent activity</p>
                  <p className="text-[10px] text-gray-300 mt-1">Add students to your projects to see activity here.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side Column */}
        <div className="space-y-6">
          {/* AI Risk Alerts */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-gray-50 pb-4">
              <div className="h-8 w-8 rounded-xl flex items-center justify-center bg-rose-50 border border-rose-100 text-rose-500">
                <ShieldAlert className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">AI Risk Alerts</h3>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Predictive flagging</p>
              </div>
            </div>

            {stats.totalRiskCount > 0 && (
              <div className="p-4 rounded-2xl bg-rose-50/50 border border-rose-100 border-l-4 border-l-rose-500 space-y-2.5">
                <div className="flex items-center gap-2 text-rose-600 font-bold text-xs">
                  <AlertTriangle className="h-4 w-4 shrink-0" />
                  <span>Dropout Warning: {stats.totalRiskCount} flagged</span>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <p className="text-[9px] font-black uppercase tracking-widest text-gray-400">Priority Actions</p>
              {loading ? (
                Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-10 rounded-xl bg-gray-50 animate-pulse" />)
              ) : stats.priorityTasks.length > 0 ? (
                stats.priorityTasks.map((task, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                    <Target className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-500" />
                    <span className="text-gray-700 font-bold leading-normal">{task}</span>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-xs rounded-xl text-gray-400 font-bold">
                  ✅ All caught up!
                </div>
              )}
            </div>
          </div>

          {/* Quick Access */}
          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Quick Access</h3>
            {[
              { label: 'View All Projects', href: '/mentor/projects', icon: FolderOpen, color: '#7c3aed' },
              { label: 'Placement AI', href: '/mentor/placement', icon: Sparkles, color: '#d946ef' },
              { label: 'Quiz System', href: '/mentor/quiz', icon: Award, color: '#f97316' },
            ].map(link => {
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href}
                  className="flex items-center gap-3 p-3 rounded-xl text-xs font-bold transition-all duration-150 border border-gray-50 hover:border-gray-200 bg-gray-50/50 hover:bg-gray-50 text-gray-700 group"
                >
                  <div className="h-7 w-7 rounded-lg flex items-center justify-center shrink-0 text-white" style={{ background: link.color }}>
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
