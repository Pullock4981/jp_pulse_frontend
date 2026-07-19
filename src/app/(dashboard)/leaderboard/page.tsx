'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/utils/api';
import { 
  Trophy, 
  Search, 
  SlidersHorizontal, 
  FileText, 
  MoreVertical,
  Briefcase
} from 'lucide-react';

interface Student {
  _id: string;
  name: string;
  email: string;
  totalMark: number;
  totalAttendanceMark: number;
  totalTaskMark: number;
  tier?: string;
  project?: {
    _id?: string;
    name: string;
    batch: string;
  };
  projectId?: string;
  trend?: 'up' | 'flat' | 'down';
}

interface Project {
  _id: string;
  name: string;
  batch: string;
}

export default function LeaderboardPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchProjects();
    fetchData();
  }, []);

  const fetchProjects = async () => {
    try {
      const res = await apiRequest('/projects');
      setProjects(res.data || []);
    } catch {
      // No mock data — projects will be empty
      setProjects([]);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/admin/students');
      const data = res.data || [];

      const mapped = data.map((student: any) => ({
        ...student,
        totalAttendanceMark: student.totalAttendanceMark ?? 0,
        totalTaskMark: student.totalTaskMark ?? 0,
        totalMark: student.totalMark ?? 0,
        projectId: student.project?._id || student.projectId || '',
        trend: 'flat' as const
      }));

      setStudents(mapped);
    } catch {
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };



  // Filter students based on selected project
  const projectFilteredStudents = selectedProjectId === 'all'
    ? students
    : students.filter(student => student.projectId === selectedProjectId || student.project?._id === selectedProjectId);

  const sortedLeaderboard = [...projectFilteredStudents].sort((a, b) => b.totalMark - a.totalMark);

  const filteredLeaderboard = sortedLeaderboard.filter(student => 
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.project && student.project.name.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const first = filteredLeaderboard[0];
  const second = filteredLeaderboard[1];
  const third = filteredLeaderboard[2];
  const rest = filteredLeaderboard.slice(3);

  const getInitial = (name: string) => name.split(' ').map(x => x[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="space-y-8 relative z-10 page-enter">
      {/* ── Page Header ───────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">Leaderboard</h1>
          <p className="text-sm mt-1 text-gray-500 font-medium">
            Monitor and track top performers, attendance ratios, and task submission streaks.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search student..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 text-gray-800"
            />
          </div>
          
          <button className="p-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-colors">
            <SlidersHorizontal className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Filter Dropdown Selector (Global vs Specific Projects) ───────────────── */}
      <div className="flex items-center gap-3 bg-white p-4 border border-gray-100 rounded-2xl shadow-sm max-w-md">
        <Briefcase className="h-4.5 w-4.5 text-purple-650 shrink-0" />
        <div className="flex-1">
          <label className="block text-[9px] font-black uppercase tracking-wider text-gray-400 mb-0.5">Filter by Project</label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="w-full bg-transparent text-xs font-black text-gray-800 outline-none cursor-pointer"
          >
            <option value="all">All Projects (Global Leaderboard)</option>
            {projects.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name} ({p.batch})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Main Content Grid ────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Side: Top 3 Podium and list */}
        <div className="lg:col-span-5 space-y-6">
          {/* Elevated Podium Cards — only show when there are students */}
          {!loading && filteredLeaderboard.length === 0 ? (
            <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center shadow-sm">
              <Trophy className="h-10 w-10 mx-auto mb-3 text-gray-300" />
              <p className="text-sm font-bold text-gray-500">No students yet</p>
              <p className="text-xs text-gray-400 mt-1">Add students to your projects to see the leaderboard.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 pt-6 items-end">
              {/* #2 */}
              <div className="bg-white border border-gray-100 rounded-3xl p-4 text-center shadow-sm flex flex-col items-center justify-between h-44 relative">
                <div className="h-10 w-10 rounded-full bg-blue-100 border border-blue-200 flex items-center justify-center font-extrabold text-blue-700 text-xs shadow-sm select-none mb-2">
                  {second ? getInitial(second.name) : '—'}
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">#2</span>
                  <h4 className="font-extrabold text-gray-900 text-xs leading-tight line-clamp-1 mt-0.5">{second?.name || '—'}</h4>
                </div>
                <span className="text-xs font-black text-purple-700 mt-2">{second?.totalMark?.toLocaleString() || '—'}</span>
              </div>

              {/* #1 */}
              <div className="bg-white border-2 border-yellow-400 rounded-3xl p-5 text-center shadow-md flex flex-col items-center justify-between h-52 relative -translate-y-2">
                <div className="absolute -top-3.5 -right-2 h-7 w-7 rounded-full bg-yellow-400 border-2 border-white flex items-center justify-center text-xs shadow-md select-none">🏆</div>
                <div className="h-12 w-12 rounded-full bg-yellow-50 border border-yellow-200 flex items-center justify-center font-extrabold text-yellow-700 text-sm shadow-sm select-none mb-3">
                  {first ? getInitial(first.name) : '—'}
                </div>
                <div>
                  <span className="text-[10px] text-yellow-600 font-extrabold uppercase tracking-widest flex items-center justify-center gap-0.5">#1</span>
                  <h4 className="font-black text-gray-900 text-sm leading-tight line-clamp-1 mt-0.5">{first?.name || '—'}</h4>
                </div>
                <span className="text-sm font-black text-orange-600 mt-2">{first?.totalMark?.toLocaleString() || '—'}</span>
              </div>

              {/* #3 */}
              <div className="bg-white border border-gray-100 rounded-3xl p-4 text-center shadow-sm flex flex-col items-center justify-between h-40 relative">
                <div className="h-10 w-10 rounded-full bg-pink-100 border border-pink-200 flex items-center justify-center font-extrabold text-pink-700 text-xs shadow-sm select-none mb-2">
                  {third ? getInitial(third.name) : '—'}
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">#3</span>
                  <h4 className="font-extrabold text-gray-900 text-xs leading-tight line-clamp-1 mt-0.5">{third?.name || '—'}</h4>
                </div>
                <span className="text-xs font-black text-purple-700 mt-2">{third?.totalMark?.toLocaleString() || '—'}</span>
              </div>
            </div>
          )}


          {/* Ranks 4+ List */}
          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-3.5">
            {loading ? (
              <div className="text-center py-8 text-xs text-gray-400">Loading leaderboard...</div>
            ) : rest.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-400">No other students registered yet.</div>
            ) : (
              rest.map((student, idx) => {
                const rankNum = idx + 4;
                const initial = getInitial(student.name);
                const subText = student.project ? `${student.project.name} (${student.project.batch})` : student.tier || 'Software Engineer';
                const trendType = student.trend || 'flat';

                return (
                  <div key={student._id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-extrabold text-gray-400 w-4">{rankNum}</span>
                      <div className="h-8 w-8 rounded-full bg-black flex items-center justify-center text-xs font-bold text-white select-none">
                        {initial}
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-gray-900 leading-tight">{student.name}</h4>
                        <span className="text-[9px] text-gray-400 font-semibold block mt-0.5">{subText}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-gray-800">{student.totalMark.toLocaleString()}</span>
                      {trendType === 'up' && <span className="text-[10px] text-emerald-600 font-bold">▲</span>}
                      {trendType === 'flat' && <span className="text-[10px] text-gray-400 font-bold">-</span>}
                      {trendType === 'down' && <span className="text-[10px] text-rose-500 font-bold">▼</span>}
                    </div>
                  </div>
                );
              })
            )}

            <button className="w-full text-center text-[10px] font-black uppercase tracking-wider text-purple-600 pt-3 border-t border-gray-50 hover:text-purple-700 transition-colors">
              View Full Leaderboard
            </button>
          </div>
        </div>

        {/* Right Side: Points Breakdown Table */}
        <div className="lg:col-span-7 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-gray-900">Points Breakdown</h3>
            <div className="flex gap-2">
              <button className="p-2 border border-gray-100 bg-white hover:bg-gray-50 rounded-xl text-gray-400 hover:text-gray-700 transition-colors">
                <FileText className="h-4 w-4" />
              </button>
              <button className="p-2 border border-gray-100 bg-white hover:bg-gray-50 rounded-xl text-gray-400 hover:text-gray-700 transition-colors">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-500">
              <thead className="bg-gray-50 text-[9px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3">Student</th>
                  <th className="px-4 py-3">Attendance</th>
                  <th className="px-4 py-3">Tasks</th>
                  <th className="px-4 py-3">Distribution & Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-semibold text-xs text-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-400">Loading breakdown...</td>
                  </tr>
                ) : filteredLeaderboard.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-400">No records found.</td>
                  </tr>
                ) : (
                  filteredLeaderboard.slice(0, 5).map((student: any) => {
                    const total = student.totalAttendanceMark + student.totalTaskMark || student.totalMark || 1;
                    const attPercent = Math.max(15, Math.min(85, Math.round((student.totalAttendanceMark / total) * 100)));
                    const tskPercent = 100 - attPercent;
                    const initial = getInitial(student.name);

                    return (
                      <tr key={student._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-full bg-black flex items-center justify-center text-[10px] font-bold text-white select-none">
                              {initial}
                            </div>
                            <span className="font-extrabold text-gray-900 text-xs">{student.name}</span>
                          </div>
                        </td>
                        <td className="px-4 py-4 text-gray-500 font-bold">
                          {student.totalAttendanceMark?.toLocaleString() || "0"} pts
                        </td>
                        <td className="px-4 py-4 text-gray-500 font-bold">
                          {student.totalTaskMark?.toLocaleString() || "0"} pts
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-28 h-2 bg-gray-100 rounded-full overflow-hidden flex shrink-0">
                              <div className="bg-blue-400 h-full" style={{ width: `${attPercent}%` }} />
                              <div className="bg-purple-600 h-full" style={{ width: `${tskPercent}%` }} />
                            </div>
                            <span className="font-extrabold text-gray-900 text-xs">
                              {(student.totalMark || total).toLocaleString()}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Legend & footer */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 flex-wrap gap-4">
            <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-wider text-gray-400">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-blue-400" />
                <span>Attendance</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-purple-600" />
                <span>Tasks</span>
              </div>
            </div>
            
            <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
              Showing top 5 of {filteredLeaderboard.length} students
            </span>
          </div>
        </div>

      </div>
    </div>
  );
}
