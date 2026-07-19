'use client';

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { apiRequest } from '@/utils/api';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import {
  Plus,
  FolderPlus,
  Users,
  Briefcase,
  TrendingUp,
  CheckCircle,
  ChevronRight,
  X,
  UploadCloud,
  MoreHorizontal,
  Search,
  Bell,
  LayoutGrid,
  List,
  FileSpreadsheet,
  Image as ImageIcon,
} from 'lucide-react';

interface Project {
  _id: string;
  name: string;
  batch: string;
  description?: string;
  totalStudents: number;
  avgAttendanceRate: number;
  totalHired: number;
  status?: string;
  startedDate?: string;
  bannerImage?: string;
}

export default function ProjectsIndexPage() {
  const pathname = usePathname();
  const prefix = pathname?.startsWith('/admin') ? '/admin' : '/mentor';
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mounted, setMounted] = useState(false);

  const [stats, setStats] = useState({
    totalProjects: 0,
    totalStudents: 0,
    totalHired: 0,
    placementRate: '0%',
    totalActive: 0,
  });

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [batch, setBatch] = useState('');
  const [description, setDescription] = useState('');
  const [studentsList, setStudentsList] = useState<any[]>([]);
  const [fileName, setFileName] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });
  const [sheetUrl, setSheetUrl] = useState('');
  const [importLoading, setImportLoading] = useState(false);

  // Banner image state
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [bannerPreview, setBannerPreview] = useState<string>('');
  const bannerInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/projects');
      const data = res.data || [];
      setProjects(data);

      let totalStudents = 0;
      let totalHired = 0;
      data.forEach((p: Project) => {
        totalStudents += p.totalStudents;
        totalHired += p.totalHired;
      });

      const placementRate =
        totalStudents > 0
          ? ((totalHired / totalStudents) * 100).toFixed(0) + '%'
          : '0%';

      setStats({
        totalProjects: data.length,
        totalStudents,
        totalHired,
        placementRate,
        totalActive: totalStudents - totalHired,
      });
    } catch (err: any) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };
  const formatRows = (rows: any[]) =>
    rows.map((row: any) => ({
      name:
        row.name ||
        row.Name ||
        row['Student Name'] ||
        'Unnamed Student',
      email:
        row.email ||
        row.Email ||
        row['Email Address'] ||
        '',
      phoneNumber:
        row.phone ||
        row.Phone ||
        row['Phone Number'] ||
        '',
      tier: row.tier || row.Tier || 'Tier C',
      riskStatus: row.risk || row.Risk || 'On Track',
      activeStatus: 'Active',
      hiredStatus: row.hired || row.Hired || 'Looking',
      profiles: {
        resume: row.resume || row.Resume || '',
        github: row.github || row.Github || '',
        linkedin: row.linkedin || row.Linkedin || '',
        resumeReady: !!(row.resume || row.Resume),
        githubReady: !!(row.github || row.Github),
        linkedinReady: !!(row.linkedin || row.Linkedin),
      },
    }));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setMsg({ type: '', text: '' });
    setSheetUrl('');

    const isExcel =
      file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = new Uint8Array(evt.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const ws = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(ws);
          setStudentsList(formatRows(jsonData));
        } catch (err: any) {
          setMsg({ type: 'error', text: `Failed to parse Excel: ${err.message}` });
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => setStudentsList(formatRows(results.data as any[])),
        error: (err) =>
          setMsg({ type: 'error', text: `Failed to parse CSV: ${err.message}` }),
      });
    }
  };

  const handleBannerSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBannerFile(file);
    const url = URL.createObjectURL(file);
    setBannerPreview(url);
  };

  const handleGoogleSheetImport = async () => {
    if (!sheetUrl) return;
    setImportLoading(true);
    setMsg({ type: '', text: '' });
    setStudentsList([]);
    setFileName('');
    try {
      const res = await apiRequest('/projects/import-sheet', {
        method: 'POST',
        body: JSON.stringify({ url: sheetUrl }),
      });
      if (res.csvData) {
        Papa.parse(res.csvData, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const formatted = formatRows(results.data as any[]);
            setStudentsList(formatted);
            setFileName('Google Sheet (Synced)');
            setMsg({
              type: 'success',
              text: `Successfully loaded ${formatted.length} students from Google Sheet!`,
            });
          },
          error: (err) =>
            setMsg({ type: 'error', text: `Parse error: ${err.message}` }),
        });
      } else {
        throw new Error('No spreadsheet data returned.');
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to connect Google Sheet.' });
    } finally {
      setImportLoading(false);
    }
  };

  const handleCreateProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !batch) return;
    setCreateLoading(true);
    setMsg({ type: '', text: '' });
    try {
      const projRes = await apiRequest('/projects', {
        method: 'POST',
        body: JSON.stringify({ name, batch, description }),
      });

      if (studentsList.length > 0 && projRes.data?._id) {
        await apiRequest(`/projects/${projRes.data._id}/students/bulk`, {
          method: 'POST',
          body: JSON.stringify({ students: studentsList }),
        });
      }

      setMsg({ type: 'success', text: 'Project created successfully!' });
      setTimeout(() => {
        setShowModal(false);
        resetForm();
        fetchDashboardData();
      }, 1500);
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to create project.' });
    } finally {
      setCreateLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setBatch('');
    setDescription('');
    setStudentsList([]);
    setFileName('');
    setSheetUrl('');
    setBannerFile(null);
    setBannerPreview('');
    setMsg({ type: '', text: '' });
  };

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.batch.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const BANNER_COLORS = [
    'linear-gradient(135deg,#6C3AE0 0%,#9B6DFF 100%)',
    'linear-gradient(135deg,#1a1a2e 0%,#6C3AE0 100%)',
    'linear-gradient(135deg,#0f0c29 0%,#302b63 50%,#24243e 100%)',
  ];

  return (
    <div className="space-y-6 relative z-10 page-enter" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* ── Top Bar ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        {/* Title */}
        <h1
          className="text-xl font-black uppercase tracking-widest"
          style={{ color: '#7C3AED', letterSpacing: '0.12em' }}
        >
          PROJECT DIRECTORY
        </h1>

        {/* Search */}
        <div className="flex-1 max-w-md relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search projects, batches, or candidates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-full border border-gray-200 bg-white text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-200 shadow-sm"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button className="h-9 w-9 rounded-full border border-gray-200 bg-white flex items-center justify-center text-gray-400 hover:text-gray-600 shadow-sm transition-colors">
            <Bell className="h-4 w-4" />
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold text-white shadow-md transition-all hover:scale-105 active:scale-95"
            style={{ background: 'linear-gradient(135deg,#7C3AED,#A855F7)' }}
          >
            <Plus className="h-4 w-4" />
            CREATE PROJECT
          </button>
        </div>
      </div>

      {/* ── Stats Row ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Active Batches */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="h-9 w-9 rounded-xl bg-purple-50 flex items-center justify-center">
              <Briefcase className="h-4.5 w-4.5 text-purple-600" />
            </div>
            <span className="text-xs font-bold text-emerald-500">+0 new</span>
          </div>
          <p className="text-xs text-gray-400 font-semibold mt-1">Active Batches</p>
          <p className="text-2xl font-black text-gray-900">{stats.totalProjects}</p>
        </div>

        {/* Total Enrolled */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="h-9 w-9 rounded-xl bg-purple-50 flex items-center justify-center">
              <Users className="h-4.5 w-4.5 text-purple-600" />
            </div>
            <span className="text-xs font-bold text-purple-500">Overall</span>
          </div>
          <p className="text-xs text-gray-400 font-semibold mt-1">Total Enrolled Students</p>
          <p className="text-2xl font-black text-gray-900">{stats.totalStudents.toLocaleString()}</p>
        </div>

        {/* Placed Ratio */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="h-9 w-9 rounded-xl bg-yellow-50 flex items-center justify-center">
              <CheckCircle className="h-4.5 w-4.5 text-yellow-500" />
            </div>
            <span className="text-xs font-bold text-yellow-500">Target 85%</span>
          </div>
          <p className="text-xs text-gray-400 font-semibold mt-1">Placed Ratio</p>
          <p className="text-2xl font-black text-gray-900">{stats.placementRate}</p>
        </div>

        {/* Active Enrolled */}
        <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="h-9 w-9 rounded-xl bg-purple-50 flex items-center justify-center">
              <TrendingUp className="h-4.5 w-4.5 text-purple-600" />
            </div>
            <span className="text-xs font-bold text-purple-500">Active</span>
          </div>
          <p className="text-xs text-gray-400 font-semibold mt-1">Active Enrolled</p>
          <p className="text-2xl font-black text-gray-900">{stats.totalActive?.toLocaleString() || 0}</p>
        </div>
      </div>

      {/* ── Section Header ──────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-black text-gray-900">Active Projects</h2>
          <span className="px-3 py-1 rounded-full text-xs font-black bg-gray-100 text-gray-600">
            {filteredProjects.length} Total
          </span>
        </div>
        <div className="flex items-center gap-1 border border-gray-200 rounded-xl p-1 bg-white shadow-sm">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'grid'
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <LayoutGrid className="h-3.5 w-3.5" />
            Grid View
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              viewMode === 'list'
                ? 'bg-gray-900 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <List className="h-3.5 w-3.5" />
            List View
          </button>
        </div>
      </div>

      {/* ── Projects ─────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-44 rounded-2xl bg-gray-100 animate-pulse" />
          ))}
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="bg-white border border-gray-100 p-16 text-center rounded-3xl shadow-sm">
          <div className="h-16 w-16 mx-auto rounded-3xl mb-4 flex items-center justify-center bg-purple-50 border border-purple-100">
            <FolderPlus className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-bold mb-1.5 text-gray-900">No projects found</h3>
          <p className="text-xs text-gray-500 font-medium mb-6">
            Create your first project to start tracking placement progress.
          </p>
          <button
            onClick={() => setShowModal(true)}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#7C3AED,#A855F7)' }}
          >
            Create First Project
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filteredProjects.map((project, idx) => {
            const isCompleted =
              project.status === 'Completed' ||
              (project.totalStudents > 0 &&
                project.totalHired === project.totalStudents);
            const placementPct =
              project.totalStudents > 0
                ? Math.round((project.totalHired / project.totalStudents) * 100)
                : 0;

            return (
              <div
                key={project._id}
                className="bg-white border border-gray-100 rounded-2xl flex overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 group"
              >
                {/* Banner */}
                <div
                  className="w-44 shrink-0 relative overflow-hidden"
                  style={{
                    background: project.bannerImage
                      ? undefined
                      : BANNER_COLORS[idx % BANNER_COLORS.length],
                  }}
                >
                  {project.bannerImage && (
                    <img
                      src={project.bannerImage}
                      alt={project.name}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                  {/* Batch badge */}
                  <div className="absolute top-3 left-3 right-3">
                    <span
                      className="text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md text-white"
                      style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)' }}
                    >
                      {project.batch}
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="flex-1 p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="text-base font-black text-gray-900">{project.name}</h3>
                      <span
                        className={`flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                          isCompleted
                            ? 'text-blue-600 bg-blue-50'
                            : 'text-emerald-600 bg-emerald-50'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isCompleted ? 'bg-blue-500' : 'bg-emerald-500 animate-pulse'
                          }`}
                        />
                        {isCompleted ? 'COMPLETED' : 'ACTIVE'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 font-medium line-clamp-2">
                      {project.description}
                    </p>
                  </div>

                  {/* Metrics */}
                  <div className="flex items-center gap-5 my-3">
                    <div>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Candidates</p>
                      <p className="text-sm font-black text-gray-900">{project.totalStudents}</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Placement</p>
                      <p className="text-sm font-black text-purple-600">{placementPct}%</p>
                    </div>
                    <div>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Phase</p>
                      <p className="text-sm font-black text-gray-900">Phase {idx + 2}</p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mb-3">
                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${placementPct}%`,
                          background: 'linear-gradient(90deg,#7C3AED,#A855F7)',
                        }}
                      />
                    </div>
                  </div>

                  {/* Link */}
                  <Link
                    href={`${prefix}/projects/${project._id}`}
                    className="text-xs font-black text-purple-600 hover:text-purple-800 flex items-center gap-1 self-end transition-colors"
                  >
                    Manage Project
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="space-y-3">
          {filteredProjects.map((project, idx) => {
            const isCompleted =
              project.status === 'Completed' ||
              (project.totalStudents > 0 &&
                project.totalHired === project.totalStudents);
            const placementPct =
              project.totalStudents > 0
                ? Math.round((project.totalHired / project.totalStudents) * 100)
                : 0;
            return (
              <div
                key={project._id}
                className="bg-white border border-gray-100 rounded-2xl p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-all"
              >
                <div
                  className="h-12 w-20 rounded-xl shrink-0"
                  style={{
                    background: project.bannerImage
                      ? undefined
                      : BANNER_COLORS[idx % BANNER_COLORS.length],
                  }}
                >
                  {project.bannerImage && (
                    <img src={project.bannerImage} alt="" className="h-full w-full object-cover rounded-xl" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-gray-900 text-sm truncate">{project.name}</h3>
                    <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 shrink-0">{project.batch}</span>
                  </div>
                  <p className="text-xs text-gray-400 truncate">{project.description}</p>
                </div>
                <div className="hidden md:flex items-center gap-6 shrink-0">
                  <div className="text-center">
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Students</p>
                    <p className="text-sm font-black text-gray-900">{project.totalStudents}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">Placement</p>
                    <p className="text-sm font-black text-purple-600">{placementPct}%</p>
                  </div>
                </div>
                <span className={`shrink-0 flex items-center gap-1 text-[9px] font-black uppercase tracking-wider px-2 py-1 rounded-full ${isCompleted ? 'text-blue-600 bg-blue-50' : 'text-emerald-600 bg-emerald-50'}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${isCompleted ? 'bg-blue-500' : 'bg-emerald-500 animate-pulse'}`} />
                  {isCompleted ? 'Completed' : 'Active'}
                </span>
                  <Link
                    href={`${prefix}/projects/${project._id}`}
                    className="flex items-center justify-center gap-1.5 w-full bg-gray-50 hover:bg-purple-50 text-gray-700 hover:text-purple-700 font-bold text-xs py-2 rounded-xl transition-colors border border-gray-100 hover:border-purple-200"
                  >Manage <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Create Project Modal ──────────────────────────────── */}
      {mounted && showModal && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
          <div
            onClick={() => { setShowModal(false); resetForm(); }}
            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
          />

          <div
            className="w-full max-w-4xl rounded-2xl shadow-2xl relative z-10 bg-white border border-gray-100 flex flex-col overflow-hidden animate-slide-in-up max-h-[90vh]"
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {/* Modal Header */}
            <div className="px-8 py-6 border-b border-gray-100 flex items-start justify-between bg-white shrink-0">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Create New Project</h2>
                <p className="text-sm text-gray-500 mt-1">
                  Initialize a new training batch and candidate roster.
                </p>
              </div>
              <button
                onClick={() => { setShowModal(false); resetForm(); }}
                className="text-gray-400 hover:text-gray-600 transition-colors p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProjectSubmit} className="flex flex-col overflow-hidden">
              {/* Scrollable Body */}
              <div className="px-8 py-6 overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  
                  {/* ── Left: Project Details ── */}
                  <div className="space-y-5">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-purple-600">
                      PROJECT DETAILS
                    </h3>

                    {msg.text && (
                      <div
                        className={`p-3 rounded-lg text-sm border ${
                          msg.type === 'success'
                            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                            : 'bg-rose-50 border-rose-200 text-rose-700'
                        }`}
                      >
                        {msg.text}
                      </div>
                    )}

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                          Project Name
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Fullstack Engineering 2024"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                          Batch Number
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. BATCH-001"
                          value={batch}
                          onChange={(e) => setBatch(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                          Description
                        </label>
                        <textarea
                          placeholder="Briefly describe the project scope and goals..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors resize-none h-24"
                        />
                      </div>

                      {/* Banner Image Upload */}
                      <div>
                        <label className="block text-sm font-semibold text-gray-800 mb-1.5">
                          Project Banner Image
                        </label>
                        <div
                          onClick={() => bannerInputRef.current?.click()}
                          className="relative border-2 border-dashed border-gray-300 hover:border-purple-400 rounded-lg cursor-pointer transition-colors overflow-hidden group"
                          style={{ minHeight: '100px' }}
                        >
                          <input
                            ref={bannerInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleBannerSelect}
                            className="hidden"
                          />
                          {bannerPreview ? (
                            <div className="relative h-28 w-full">
                              <img
                                src={bannerPreview}
                                alt="Banner preview"
                                className="w-full h-full object-cover"
                              />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <p className="text-white text-sm font-medium flex items-center gap-2">
                                  <UploadCloud className="h-4 w-4" /> Change Image
                                </p>
                              </div>
                            </div>
                          ) : (
                            <div className="flex flex-col items-center justify-center py-6 px-4 text-center">
                              <ImageIcon className="h-8 w-8 text-purple-300 mb-2" />
                              <p className="text-sm font-medium text-gray-700">
                                Drag & drop image or click to browse
                              </p>
                              <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP (Max 5MB)</p>
                            </div>
                          )}
                        </div>
                        {bannerFile && (
                          <p className="text-xs text-purple-600 font-medium mt-2 truncate flex items-center gap-1">
                            <CheckCircle className="h-3.5 w-3.5" /> {bannerFile.name}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ── Right: Roster Import ── */}
                  <div className="space-y-5">
                    <h3 className="text-[11px] font-bold uppercase tracking-wider text-purple-600">
                      ROSTER IMPORT
                    </h3>

                    {/* Drag & Drop Zone */}
                    <div className="relative border-2 border-dashed border-gray-300 hover:border-purple-400 rounded-xl transition-colors bg-white">
                      <input
                        type="file"
                        accept=".csv,.xlsx,.xls"
                        onChange={handleFileUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                        <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center mb-4">
                          <FileSpreadsheet className="h-6 w-6 text-indigo-500" />
                        </div>
                        <p className="text-base font-bold text-gray-900 mb-1">
                          Drag & drop spreadsheets
                        </p>
                        <p className="text-sm text-gray-500">.csv, .xlsx, .xls or click to browse</p>
                      </div>
                    </div>

                    {/* Parsed Success */}
                    {studentsList.length > 0 && (
                      <div className="flex items-center justify-between bg-emerald-50 rounded-lg px-5 py-4 border border-emerald-100">
                        <div className="flex items-center gap-3">
                          <div className="h-6 w-6 rounded-full bg-emerald-500 flex items-center justify-center">
                            <CheckCircle className="h-4 w-4 text-white" />
                          </div>
                          <span className="text-sm font-medium text-emerald-800">
                            Successfully Parsed Students
                          </span>
                        </div>
                        <span className="text-lg font-bold text-emerald-600">
                          {studentsList.length}
                        </span>
                      </div>
                    )}

                    {/* Google Sheet */}
                    <div className="pt-2">
                      <p className="text-sm font-semibold text-gray-800 mb-2">
                        Or Connect Google Sheet Link
                      </p>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          placeholder="https://docs.google.com/spreadsheets/..."
                          value={sheetUrl}
                          onChange={(e) => setSheetUrl(e.target.value)}
                          className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={handleGoogleSheetImport}
                          disabled={importLoading || !sheetUrl}
                          className="px-5 py-2.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-sm font-medium disabled:opacity-50 transition-colors whitespace-nowrap"
                        >
                          {importLoading ? 'Loading...' : 'Load Sheet'}
                        </button>
                      </div>
                    </div>

                    {fileName && studentsList.length === 0 && (
                      <p className="text-sm text-purple-600 font-medium">📄 {fileName}</p>
                    )}
                  </div>
                  
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-8 py-5 border-t border-gray-100 bg-gray-50/30 shrink-0 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); resetForm(); }}
                  className="px-6 py-2.5 rounded-lg border border-purple-600 bg-white text-purple-700 hover:bg-purple-50 text-sm font-bold transition-colors shadow-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading || !name || !batch}
                  className="px-6 py-2.5 rounded-lg bg-[#5b21b6] hover:bg-[#4c1d95] text-white text-sm font-bold transition-colors disabled:opacity-50 shadow-sm"
                >
                  {createLoading ? 'Creating...' : 'Create Project'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
