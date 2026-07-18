'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/utils/api';
import Link from 'next/link';
import Papa from 'papaparse';
import { 
  Plus, 
  FolderPlus,
  Users, 
  Briefcase, 
  TrendingUp, 
  Activity, 
  CheckCircle,
  ChevronRight,
  X,
  FileText
} from 'lucide-react';

interface Project {
  _id: string;
  name: string;
  batch: string;
  description?: string;
  totalStudents: number;
  avgAttendanceRate: number;
  totalHired: number;
}

export default function ProjectsIndexPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  // Stats summary for projects page header
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalStudents: 0,
    totalHired: 0,
    placementRate: '0%',
    totalActive: 0
  });

  // Create Project Form State
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [batch, setBatch] = useState('');
  const [description, setDescription] = useState('');
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [fileName, setFileName] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/projects');
      const data = res.data || [];
      setProjects(data);

      // Summarize stats
      let totalStudents = 0;
      let totalHired = 0;
      data.forEach((p: Project) => {
        totalStudents += p.totalStudents;
        totalHired += p.totalHired;
      });

      const placementRate = totalStudents > 0 ? ((totalHired / totalStudents) * 100).toFixed(1) + '%' : '0%';

      setStats({
        totalProjects: data.length,
        totalStudents,
        totalHired,
        placementRate,
        totalActive: totalStudents - totalHired
      });

    } catch (err: any) {
      console.warn('Backend failed, loading mock projects index data:', err.message);
      loadMockProjects();
    } finally {
      setLoading(false);
    }
  };

  const loadMockProjects = () => {
    const mockProjects: Project[] = [
      {
        _id: 'proj-1',
        name: 'Albatross Boot-camp',
        batch: 'Batch 4',
        description: 'Full stack web development intensive training course',
        totalStudents: 3,
        avgAttendanceRate: 84.5,
        totalHired: 1
      }
    ];

    setProjects(mockProjects);
    setStats({
      totalProjects: 1,
      totalStudents: 3,
      totalHired: 1,
      placementRate: '33.3%',
      totalActive: 2
    });
  };

  // CSV Drag and drop file reading
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        // Map headers or fallback
        const formatted = results.data.map((row: any) => ({
          name: row.name || row.Name || 'Unnamed Student',
          email: row.email || row.Email || '',
          phoneNumber: row.phone || row.Phone || '',
          tier: row.tier || row.Tier || 'Tier C',
          riskStatus: row.risk || row.Risk || 'Low',
          activeStatus: 'Active',
          hiredStatus: row.hired || row.Hired || 'Looking',
          profiles: {
            resume: row.resume || row.Resume || '',
            github: row.github || row.Github || '',
            linkedin: row.linkedin || row.Linkedin || '',
            resumeReady: !!row.resume,
            githubReady: !!row.github,
            linkedinReady: !!row.linkedin
          }
        }));
        setStudentsList(formatted);
      },
      error: (err) => {
        setMsg({ type: 'error', text: `Failed to parse sheet: ${err.message}` });
      }
    });
  };

  const handleCreateProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !batch) return;

    setCreateLoading(true);
    setMsg({ type: '', text: '' });

    try {
      const projRes = await apiRequest('/projects', {
        method: 'POST',
        body: JSON.stringify({
          name,
          batch,
          description
        })
      });

      if (studentsList.length > 0 && projRes.data?._id) {
        await apiRequest(`/projects/${projRes.data._id}/students/bulk`, {
          method: 'POST',
          body: JSON.stringify({ students: studentsList })
        });
      }

      setMsg({ type: 'success', text: 'Project created and synced successfully!' });
      setTimeout(() => {
        setShowModal(false);
        // Reset form
        setName('');
        setBatch('');
        setDescription('');
        setStudentsList([]);
        setFileName('');
        fetchDashboardData();
      }, 1500);

    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to create project.' });
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Cohort Projects</h1>
          <p className="text-slate-400 text-sm mt-1">Manage active batches and training projects</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-2xl text-sm font-semibold tracking-wide transition-all duration-200 flex items-center gap-2 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30"
        >
          <Plus className="h-4 w-4" />
          Create Project
        </button>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl backdrop-blur-sm">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Active Batches</span>
          <h3 className="text-3xl font-bold text-white mt-2">{stats.totalProjects}</h3>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl backdrop-blur-sm">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Total Students</span>
          <h3 className="text-3xl font-bold text-white mt-2">{stats.totalStudents}</h3>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl backdrop-blur-sm">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Placed Ratio</span>
          <h3 className="text-3xl font-bold text-emerald-450 mt-2">{stats.placementRate}</h3>
        </div>
        <div className="bg-slate-900/40 border border-slate-800/80 p-6 rounded-3xl backdrop-blur-sm">
          <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider block">Active Enrolled</span>
          <h3 className="text-3xl font-bold text-white mt-2">{stats.totalActive}</h3>
        </div>
      </div>

      {/* Projects List Section */}
      <div className="space-y-4">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-48 bg-slate-900/20 border border-slate-800 animate-pulse rounded-3xl"></div>
            <div className="h-48 bg-slate-900/20 border border-slate-800 animate-pulse rounded-3xl"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project) => (
              <div 
                key={project._id}
                className="bg-slate-900/30 border border-slate-800/80 hover:border-slate-800 rounded-3xl p-6 flex flex-col justify-between hover:bg-slate-900/50 hover:shadow-xl transition-all duration-300"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 bg-indigo-600/15 border border-indigo-500/20 px-2.5 py-1 rounded-full">
                        {project.batch}
                      </span>
                      <h3 className="text-xl font-bold text-white mt-3">{project.name}</h3>
                    </div>
                  </div>
                  <p className="text-slate-400 text-xs mt-2 line-clamp-2 leading-relaxed">
                    {project.description || 'No description provided.'}
                  </p>
                </div>

                <div className="border-t border-slate-800/60 mt-6 pt-6 grid grid-cols-4 gap-2 text-center">
                  <div>
                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 block">Students</span>
                    <p className="text-sm font-extrabold text-slate-200 mt-1">{project.totalStudents}</p>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 block">Avg. Attendance</span>
                    <p className="text-sm font-extrabold text-slate-200 mt-1">{project.avgAttendanceRate.toFixed(1)}%</p>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 block">Placed Rate</span>
                    <p className="text-sm font-extrabold text-emerald-400 mt-1">
                      {project.totalStudents > 0 ? ((project.totalHired / project.totalStudents) * 100).toFixed(0) + '%' : '0%'}
                    </p>
                  </div>
                  <div>
                    <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500 block">Active Ratio</span>
                    <p className="text-sm font-extrabold text-indigo-400 mt-1">
                      {project.totalStudents > 0 ? (((project.totalStudents - project.totalHired) / project.totalStudents) * 100).toFixed(0) + '%' : '100%'}
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-end gap-3">
                  <Link
                    href={`/projects/${project._id}`}
                    className="flex items-center gap-1.5 bg-slate-850 hover:bg-slate-800 text-indigo-400 text-xs font-semibold px-4 py-2.5 rounded-xl border border-slate-800 hover:border-slate-700 transition-all duration-200"
                  >
                    <span>Manage Cohort</span>
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowModal(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>

          <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-3xl shadow-2xl relative z-10 overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Create New Project</h3>
                <p className="text-xs text-slate-400 mt-0.5">Initialize a new training cohort batch</p>
              </div>
              <button 
                onClick={() => setShowModal(false)}
                className="h-8 w-8 rounded-lg bg-slate-950/40 text-slate-450 hover:text-slate-100 flex items-center justify-center border border-slate-850 hover:border-slate-750 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProjectSubmit} className="p-6 space-y-4">
              {msg.text && (
                <div className={`p-4 rounded-xl text-xs font-medium border ${
                  msg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                }`}>
                  {msg.text}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EJP - Albatross Boot-camp"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-650 text-slate-100 px-4 py-3 rounded-xl outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Batch Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Batch 4"
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-650 text-slate-100 px-4 py-3 rounded-xl outline-none text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Description</label>
                <textarea
                  placeholder="Write a brief overview..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-650 text-slate-100 px-4 py-3 rounded-xl outline-none text-xs resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Roster Spreadsheet Upload (CSV)</label>
                <div className="relative border-2 border-dashed border-slate-850 hover:border-slate-750 bg-slate-950/40 rounded-2xl p-6 text-center transition-all duration-200 cursor-pointer">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="h-8 w-8 text-indigo-500" />
                    <p className="text-xs text-slate-350 font-semibold">{fileName || 'Choose CSV file or drag here'}</p>
                    <span className="text-[9px] text-slate-500">Columns: Name, Email, Phone, Tier, Hired, Resume, Github, Linkedin</span>
                  </div>
                </div>
                {studentsList.length > 0 && (
                  <p className="text-[10px] text-emerald-400 font-semibold mt-2">✓ Parsed {studentsList.length} students from the sheet.</p>
                )}
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-850 border border-slate-800 text-slate-350 hover:text-white py-3 rounded-xl text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading || !name || !batch}
                  className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/20 disabled:opacity-50"
                >
                  {createLoading ? 'Synchronizing...' : 'Sync Cohort'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
