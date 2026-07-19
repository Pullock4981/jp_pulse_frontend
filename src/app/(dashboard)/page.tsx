'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiRequest } from '@/utils/api';
import {
  Users,
  FolderOpen,
  CheckCircle,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  ArrowRight,
  Clock,
  UserCheck,
  UserX,
  TrendingUp,
  Activity,
  Zap,
  Target
} from 'lucide-react';

const StatCard = ({ label, value, icon: Icon, color, sub, gradient }: {
  label: string; value: string | number; icon: any; color: string; sub?: string; gradient?: string;
}) => {
  if (gradient) {
    return (
      <div className="rounded-3xl p-6 flex flex-col justify-between text-white shadow-xl relative overflow-hidden h-36" style={{ background: gradient }}>
        <div className="flex items-start justify-between z-10">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-white/80 mb-1">{label}</p>
            <h3 className="text-3xl font-black tracking-tight">{value}</h3>
          </div>
          <div className="h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 bg-white/20 text-white">
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <div className="text-[10px] font-bold text-white/90 z-10">{sub}</div>
        <div className="absolute -right-5 -bottom-5 w-24 h-24 bg-white/10 rounded-full blur-xl pointer-events-none" />
      </div>
    );
  }
  return (
    <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col justify-between h-36">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">{label}</p>
          <h3 className="text-3xl font-black tracking-tight text-gray-900">{value}</h3>
        </div>
        <div className="h-10 w-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm" style={{ background: `${color}15`, color: color }}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="text-[10px] font-bold text-gray-400">{sub}</div>
    </div>
  );
};

export default function DashboardRoot() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const storedUser = sessionStorage.getItem('user');
    if (!storedUser) {
      router.push('/login');
      return;
    }
    try {
      const user = JSON.parse(storedUser);
      if (user.role === 'admin') {
        setIsAdmin(true);
        setIsChecking(false);
      } else {
        router.push('/mentor');
      }
    } catch {
      router.push('/login');
    }
  }, [router]);

  if (isChecking) return null;

  return <AdminOverviewContent />;
}

function AdminOverviewContent() {
  const [stats, setStats] = useState({
    totalProjects: 0, totalStudents: 0, totalMentors: 0, totalHired: 0,
    placementRate: '0%', totalActive: 0, totalRiskCount: 0,
    recentActivities: [] as { text: string; time: string; batch: string }[],
    priorityTasks: [] as string[]
  });
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');
      const [dashRes, usersRes] = await Promise.all([
        apiRequest('/dashboard'),
        apiRequest('/admin/users')
      ]);
      const d = dashRes.data || {};
      setStats({
        totalProjects: d.totalProjects || 0,
        totalStudents: d.totalStudents || 0,
        totalMentors: d.totalMentors || 0,
        totalHired: d.totalHired || 0,
        placementRate: d.placementRate || '0%',
        totalActive: d.totalActive || 0,
        totalRiskCount: d.totalRiskCount || 0,
        recentActivities: d.recentActivities || [],
        priorityTasks: d.priorityTasks || []
      });
      const allUsers = usersRes.data || [];
      setPendingUsers(allUsers.filter((u: any) => u.status === 'pending'));
    } catch {
      setError('Failed to load admin data. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (userId: string) => {
    setApprovingId(userId);
    try {
      await apiRequest(`/admin/users/${userId}`, { method: 'PUT', body: JSON.stringify({ status: 'approved' }) });
      setPendingUsers(prev => prev.filter(u => u._id !== userId));
    } catch {
      alert('Failed to approve user.');
    } finally {
      setApprovingId(null);
    }
  };

  const handleReject = async (userId: string) => {
    setApprovingId(userId);
    try {
      await apiRequest(`/admin/users/${userId}`, { method: 'PUT', body: JSON.stringify({ status: 'rejected' }) });
      setPendingUsers(prev => prev.filter(u => u._id !== userId));
    } catch {
      alert('Failed to reject user.');
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <div className="space-y-8 page-enter relative z-10">
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-7 w-7 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7c3aed, #d946ef)' }}>
              <ShieldCheck className="h-4 w-4 text-white" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-purple-600">Admin Control Center</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">Admin Overview</h1>
          <p className="text-sm mt-1 text-gray-500 font-medium">System-wide analytics and management controls.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-rose-50 border border-rose-100 text-rose-600">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
            Admin Access
          </div>
          <button onClick={fetchData} className="btn-gradient px-5 py-2.5 rounded-xl text-xs flex items-center gap-1.5 shadow-md">
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
            <button onClick={fetchData} className="text-xs text-rose-600 underline mt-1 font-semibold">Try again</button>
          </div>
        </div>
      )}

      {/* ── Pending Mentor Approvals Banner ── */}
      {!loading && pendingUsers.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center shrink-0">
              <Clock className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-black text-amber-800">{pendingUsers.length} Mentor{pendingUsers.length > 1 ? 's' : ''} Awaiting Approval</p>
              <p className="text-xs text-amber-600 font-medium mt-0.5">New registrations need your review before they can access the platform.</p>
            </div>
          </div>
          <Link href="/admin" className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5">
            Review Now <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* ── Stats Grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => <div key={i} className="rounded-3xl h-36 bg-gray-50 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard label="Total Mentors" value={stats.totalMentors} icon={Users} color="#7c3aed" sub="Active platform users" />
          <StatCard label="Total Students" value={stats.totalStudents} icon={UserCheck} color="#3b82f6" sub="Across all projects" />
          <StatCard label="Total Projects" value={stats.totalProjects} icon={FolderOpen} color="#d97706" sub="All mentor batches" />
          <StatCard
            label="AI Risk Alerts"
            value={stats.totalRiskCount}
            icon={ShieldAlert}
            color=""
            sub="System-wide high-risk students"
            gradient="linear-gradient(135deg, #f43f5e 0%, #fb923c 100%)"
          />
        </div>
      )}

      {/* ── Main Content Grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left: Global Placement Rate + Recent Activity */}
        <div className="lg:col-span-2 space-y-6">

          {/* Global Placement Summary */}
          <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900">Global Placement Summary</h3>
                <p className="text-sm text-gray-500 font-medium mt-1">System-wide student performance overview.</p>
              </div>
              <span className="px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                LIVE DATA
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Placement Rate', value: stats.placementRate, color: '#7c3aed', icon: TrendingUp },
                { label: 'Active Students', value: stats.totalActive, color: '#10b981', icon: Activity },
                { label: 'Hired', value: stats.totalHired, color: '#f59e0b', icon: CheckCircle },
                { label: 'At Risk', value: stats.totalRiskCount, color: '#ef4444', icon: AlertTriangle },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center">
                    <div className="h-8 w-8 mx-auto rounded-xl flex items-center justify-center mb-2" style={{ background: `${item.color}15`, color: item.color }}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <p className="text-lg font-black text-gray-900">{loading ? '—' : item.value}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-gray-400 mt-1">{item.label}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-gray-50 pb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Recent System Activity</h3>
                <p className="text-xs text-gray-400 font-medium">Latest operations across all projects</p>
              </div>
              <Link href="/admin" className="flex items-center gap-1 text-[10px] font-black uppercase tracking-widest text-purple-600 hover:text-purple-700 transition-colors">
                Manage Users <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="space-y-3">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 rounded-2xl bg-gray-50 animate-pulse" />)
              ) : stats.recentActivities.length > 0 ? (
                stats.recentActivities.map((activity, idx) => (
                  <div key={idx} className="flex items-start justify-between p-4 rounded-2xl border border-gray-50 bg-gray-50/50 hover:bg-gray-50 transition-colors">
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
                  <p className="text-[10px] text-gray-300 mt-1">Activity will appear here as mentors add and update students.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="space-y-6">

          {/* Pending Approvals Card */}
          <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2.5 border-b border-gray-50 pb-4">
              <div className="h-8 w-8 rounded-xl flex items-center justify-center bg-amber-50 border border-amber-100 text-amber-500">
                <Clock className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">Pending Approvals</h3>
                <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Mentor access requests</p>
              </div>
            </div>

            <div className="space-y-3">
              {loading ? (
                Array.from({ length: 2 }).map((_, i) => <div key={i} className="h-14 rounded-xl bg-gray-50 animate-pulse" />)
              ) : pendingUsers.length === 0 ? (
                <div className="py-6 text-center">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2 text-emerald-400" />
                  <p className="text-xs font-bold text-gray-500">No pending requests</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">All mentors have been reviewed.</p>
                </div>
              ) : (
                pendingUsers.slice(0, 4).map(user => {
                  const initials = user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
                  return (
                    <div key={user._id} className="flex items-center justify-between p-3 rounded-xl bg-amber-50/50 border border-amber-100">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-xl bg-amber-100 flex items-center justify-center font-extrabold text-amber-700 text-xs shrink-0">
                          {initials}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900 leading-none">{user.name}</p>
                          <span className="text-[10px] text-gray-400 block mt-0.5 truncate max-w-28">{user.email}</span>
                        </div>
                      </div>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => handleApprove(user._id)}
                          disabled={approvingId === user._id}
                          className="p-1.5 bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
                        >
                          <UserCheck className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => handleReject(user._id)}
                          disabled={approvingId === user._id}
                          className="p-1.5 bg-rose-50 text-rose-500 border border-rose-100 rounded-lg hover:bg-rose-100 transition-colors disabled:opacity-50"
                        >
                          <UserX className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
              {pendingUsers.length > 4 && (
                <Link href="/admin" className="w-full text-center text-[10px] font-black uppercase tracking-wider text-purple-600 pt-2 block hover:text-purple-700 transition-colors">
                  View all {pendingUsers.length} pending →
                </Link>
              )}
            </div>
          </div>

          {/* Quick Admin Links */}
          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Quick Actions</h3>
            {[
              { label: 'Manage Users', href: '/admin', icon: Users, color: '#7c3aed', desc: 'Mentors & approvals' },
              { label: 'All Projects', href: '/admin/projects', icon: FolderOpen, color: '#3b82f6', desc: 'Every mentor batch' },
              { label: 'Global Leaderboard', href: '/admin/leaderboard', icon: TrendingUp, color: '#d97706', desc: 'Top students' },
            ].map(link => {
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href}
                  className="flex items-center gap-3 p-3 rounded-xl text-xs font-bold transition-all duration-150 border border-gray-50 hover:border-gray-200 bg-gray-50/50 hover:bg-gray-50 text-gray-700 group"
                >
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center shrink-0 text-white" style={{ background: link.color }}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="block">{link.label}</span>
                    <span className="text-[10px] text-gray-400 font-medium">{link.desc}</span>
                  </div>
                  <ArrowRight className="h-3.5 w-3.5 opacity-40 group-hover:opacity-100 transition-opacity" />
                </Link>
              );
            })}
          </div>

          {/* Priority Actions */}
          {stats.priorityTasks.length > 0 && (
            <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Priority Actions</h3>
              {stats.priorityTasks.map((task, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 border border-gray-100 text-xs">
                  <Target className="h-3.5 w-3.5 shrink-0 mt-0.5 text-amber-500" />
                  <span className="text-gray-700 font-bold leading-normal">{task}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
