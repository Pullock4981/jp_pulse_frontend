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
  FolderOpen
} from 'lucide-react';

export default function GlobalDashboard() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalStudents: 0,
    totalHired: 0,
    placementRate: '0%',
    totalActive: 0,
    totalRiskCount: 0,
    recentActivities: [] as { text: string, time: string, batch: string }[],
    priorityTasks: [] as string[]
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch stats from backend API
      const statsRes = await apiRequest('/dashboard');
      const fetchedStats = statsRes.data || {};
      
      setStats({
        totalProjects: fetchedStats.totalProjects || 0,
        totalStudents: fetchedStats.totalStudents || 0,
        totalHired: fetchedStats.totalHired || 0,
        placementRate: fetchedStats.placementRate || '0%',
        totalActive: fetchedStats.totalActive || 0,
        totalRiskCount: fetchedStats.totalRiskCount || 0,
        recentActivities: fetchedStats.recentActivities || [],
        priorityTasks: fetchedStats.priorityTasks || []
      });
    } catch (err: any) {
      console.warn('Backend connection failed, using mockup data:', err.message);
      // Fallback Mock Data
      setStats({
        totalProjects: 2,
        totalStudents: 60,
        totalHired: 16,
        placementRate: '26.7%',
        totalActive: 44,
        totalRiskCount: 3,
        recentActivities: [
          { text: 'Jane Doe scored 87% in React Fundamentals Quiz', time: '2 hours ago', batch: 'Batch 4' },
          { text: 'Moutushi uploaded spreadsheet roster for Albatross Boot-camp', time: '4 hours ago', batch: 'Batch 4' },
        ],
        priorityTasks: [
          'Contact Bob Miller regarding consecutive class absences',
          'Verify github repository sync for Batch 4 students'
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Global Dashboard</h1>
          <p className="text-slate-400 text-sm mt-1">High-level placement metrics and cohort oversight</p>
        </div>
      </div>

      {/* Global Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Total Projects */}
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl relative overflow-hidden backdrop-blur-sm group hover:border-slate-700/60 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Projects</p>
              <h3 className="text-3xl font-bold text-white mt-2">{stats.totalProjects}</h3>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <FolderOpen className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-indigo-400 font-medium">
            <Activity className="h-3.5 w-3.5" />
            <span>Active monitoring</span>
          </div>
        </div>

        {/* Total Students */}
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl relative overflow-hidden backdrop-blur-sm group hover:border-slate-700/60 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Total Enrolled</p>
              <h3 className="text-3xl font-bold text-white mt-2">{stats.totalStudents}</h3>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Users className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-slate-450">
            <span className="font-semibold text-emerald-400">{stats.totalActive}</span>
            <span>currently active</span>
          </div>
        </div>

        {/* Hired Count */}
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl relative overflow-hidden backdrop-blur-sm group hover:border-slate-700/60 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Placed Students</p>
              <h3 className="text-3xl font-bold text-white mt-2">{stats.totalHired}</h3>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Briefcase className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <CheckCircle className="h-3.5 w-3.5 animate-pulse" />
            <span>Successfully placed</span>
          </div>
        </div>

        {/* Placement Rate */}
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl relative overflow-hidden backdrop-blur-sm group hover:border-slate-700/60 transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Placement Rate</p>
              <h3 className="text-3xl font-bold text-white mt-2">{stats.placementRate}</h3>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-1.5 text-xs text-indigo-400 font-medium">
            <span>Overall tracking health</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Activity Feed */}
        <div className="lg:col-span-2 bg-slate-900/30 border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-slate-850 pb-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-indigo-400 animate-pulse" />
              <h3 className="text-sm font-bold text-slate-200">Recent Batch Operations Activity</h3>
            </div>
            <Link href="/projects" className="text-[10px] text-indigo-400 hover:text-indigo-300 font-bold uppercase tracking-wider flex items-center gap-1">
              <span>View Projects</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="space-y-4">
            {stats.recentActivities.length > 0 ? stats.recentActivities.map((activity, idx) => (
              <div key={idx} className="flex items-start justify-between p-4 rounded-2xl bg-slate-950/40 border border-slate-850">
                <div className="space-y-1">
                  <p className="text-xs text-slate-300 font-medium">{activity.text}</p>
                  <span className="text-[10px] text-slate-500 block">{activity.time}</span>
                </div>
                <span className="text-[9px] uppercase font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/10 shrink-0">
                  {activity.batch}
                </span>
              </div>
            )) : (
              <div className="p-8 text-center text-xs text-slate-500 border border-slate-850 border-dashed rounded-2xl">
                No recent activity found.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Predictive Action Center */}
        <div className="bg-slate-900/30 border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-5">
          <h3 className="text-sm font-bold text-slate-200 border-b border-slate-850 pb-3 flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-rose-500" />
            <span>AI Risk Action Items</span>
          </h3>

          <div className="space-y-4">
            <div className="bg-rose-500/5 border border-rose-500/10 p-4 rounded-2xl space-y-2">
              <div className="flex items-center gap-2 text-rose-450 font-bold text-xs">
                <AlertTriangle className="h-4 w-4" />
                <span>Dropout Warning: {stats.totalRiskCount} flagged</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Risk predictions show high absence streaks in Albatross Boot-camp batch. Action checklist recommended.
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider">Priority Tasks</span>
              {stats.priorityTasks.length > 0 ? stats.priorityTasks.map((task, idx) => (
                <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-400 p-2 border-b border-slate-850/40">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 mt-1.5"></span>
                  <span>{task}</span>
                </div>
              )) : (
                <div className="p-4 text-center text-xs text-slate-500 italic">
                  All caught up! No priority tasks.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
