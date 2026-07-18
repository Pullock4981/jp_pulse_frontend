'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/utils/api';
import Link from 'next/link';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
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
  const [sheetUrl, setSheetUrl] = useState('');
  const [importLoading, setImportLoading] = useState(false);

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

  // Helper to normalize rows from CSV/Excel/Google Sheet
  const formatRows = (rows: any[]) => {
    return rows.map((row: any) => {
      const name = row.name || row.Name || row['Student Name'] || row['student name'] || row['Name'] || 'Unnamed Student';
      const email = row.email || row.Email || row['Email Address'] || row['email address'] || row['Mail'] || row['mail'] || '';
      const phoneNumber = row.phone || row.Phone || row.phoneNumber || row.PhoneNumber || row['Phone Number'] || row['phone number'] || row['Contact'] || row['contact'] || '';

      return {
        name,
        email,
        phoneNumber,
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
          linkedinReady: !!(row.linkedin || row.Linkedin)
        }
      };
    });
  };

  // CSV / Excel file reading
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setMsg({ type: '', text: '' });
    setSheetUrl(''); // Reset Google sheet URL if file uploaded

    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = new Uint8Array(evt.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          const formatted = formatRows(jsonData);
          setStudentsList(formatted);
        } catch (err: any) {
          setMsg({ type: 'error', text: `Failed to parse Excel sheet: ${err.message}` });
        }
      };
      reader.onerror = () => {
        setMsg({ type: 'error', text: 'Failed to read Excel file.' });
      };
      reader.readAsArrayBuffer(file);
    } else {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const formatted = formatRows(results.data);
          setStudentsList(formatted);
        },
        error: (err) => {
          setMsg({ type: 'error', text: `Failed to parse CSV sheet: ${err.message}` });
        }
      });
    }
  };

  // Google Sheets integration via backend proxy
  const handleGoogleSheetImport = async () => {
    if (!sheetUrl) return;
    setImportLoading(true);
    setMsg({ type: '', text: '' });
    setStudentsList([]);
    setFileName('');

    try {
      const res = await apiRequest('/projects/import-sheet', {
        method: 'POST',
        body: JSON.stringify({ url: sheetUrl })
      });

      if (res.csvData) {
        Papa.parse(res.csvData, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const formatted = formatRows(results.data);
            setStudentsList(formatted);
            setFileName('Google Sheet (Synced)');
            setMsg({ type: 'success', text: `Successfully loaded ${formatted.length} students from Google Sheet!` });
          },
          error: (err) => {
            setMsg({ type: 'error', text: `Failed to parse Google Sheet content: ${err.message}` });
          }
        });
      } else {
        throw new Error('No spreadsheet data returned from backend.');
      }
    } catch (err: any) {
      setMsg({ type: 'error', text: err.message || 'Failed to connect/download Google Sheet. Double check sheet share settings.' });
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight gradient-text">Cohort Projects</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Manage active batches and training projects</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          Create Project
        </button>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active Batches', value: stats.totalProjects, color: 'linear-gradient(135deg, #7c3aed, #a78bfa)' },
          { label: 'Total Students', value: stats.totalStudents, color: 'linear-gradient(135deg, #d946ef, #e879f9)' },
          { label: 'Placed Ratio', value: stats.placementRate, color: 'linear-gradient(135deg, #10b981, #34d399)' },
          { label: 'Active Enrolled', value: stats.totalActive, color: 'linear-gradient(135deg, #f97316, #fb923c)' },
        ].map(stat => (
          <div key={stat.label} className="stat-card">
            <span className="text-[10px] font-black uppercase tracking-widest block mb-2" style={{ color: 'var(--text-faint)' }}>{stat.label}</span>
            <h3 className="text-3xl font-black" style={{ background: stat.color, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              {stat.value}
            </h3>
          </div>
        ))}
      </div>

      {/* Projects List Section */}
      <div className="space-y-4">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="h-52 rounded-3xl skeleton" />
            <div className="h-52 rounded-3xl skeleton" />
          </div>
        ) : projects.length === 0 ? (
          <div className="glass-card p-16 text-center">
            <div className="h-16 w-16 mx-auto rounded-3xl mb-4 flex items-center justify-center"
              style={{ background: 'var(--brand-gradient-soft)', border: '1px solid var(--surface-border)' }}>
              <FolderPlus className="h-8 w-8" style={{ color: 'var(--brand-primary)' }} />
            </div>
            <h3 className="text-lg font-bold mb-2" style={{ color: 'var(--foreground)' }}>No projects yet</h3>
            <p className="text-sm mb-6" style={{ color: 'var(--text-muted)' }}>Create your first cohort project to get started tracking placement progress.</p>
            <button onClick={() => setShowModal(true)} className="btn-primary">Create First Project</button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {projects.map((project, idx) => {
              const placementRate = project.totalStudents > 0
                ? ((project.totalHired / project.totalStudents) * 100).toFixed(0) + '%' : '0%';
              const gradients = [
                'linear-gradient(135deg, #7c3aed, #d946ef)',
                'linear-gradient(135deg, #d946ef, #f97316)',
                'linear-gradient(135deg, #f97316, #7c3aed)',
              ];
              const cardGrad = gradients[idx % gradients.length];
              return (
                <div
                  key={project._id}
                  className="glass-card p-6 flex flex-col justify-between group transition-all duration-300 hover:-translate-y-1"
                >
                  <div>
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 text-white font-black text-lg shadow-lg"
                          style={{ background: cardGrad }}>
                          {project.name[0]}
                        </div>
                        <div>
                          <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                            style={{ color: 'var(--brand-primary)', background: 'var(--brand-gradient-soft)', border: '1px solid var(--surface-border)' }}>
                            {project.batch}
                          </span>
                          <h3 className="text-base font-black mt-1" style={{ color: 'var(--foreground)' }}>{project.name}</h3>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs leading-relaxed line-clamp-2 mb-5" style={{ color: 'var(--text-muted)' }}>
                      {project.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="border-t pt-4 grid grid-cols-4 gap-2 text-center mb-5" style={{ borderColor: 'var(--surface-border)' }}>
                    {[
                      { label: 'Students', value: project.totalStudents, color: 'var(--foreground)' },
                      { label: 'Attendance', value: project.avgAttendanceRate.toFixed(0) + '%', color: '#3b82f6' },
                      { label: 'Placed', value: placementRate, color: '#10b981' },
                      { label: 'Active', value: project.totalStudents > 0 ? (((project.totalStudents - project.totalHired) / project.totalStudents) * 100).toFixed(0) + '%' : '100%', color: 'var(--brand-primary)' },
                    ].map(stat => (
                      <div key={stat.label}>
                        <span className="text-[9px] font-black uppercase tracking-widest block" style={{ color: 'var(--text-faint)' }}>{stat.label}</span>
                        <p className="text-sm font-black mt-1" style={{ color: stat.color }}>{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  <Link
                    href={`/projects/${project._id}`}
                    className="flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-200"
                    style={{
                      background: 'var(--brand-gradient-soft)',
                      color: 'var(--brand-primary)',
                      border: '1px solid var(--surface-border)',
                    }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = cardGrad; (e.currentTarget as HTMLElement).style.color = 'white'; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--brand-gradient-soft)'; (e.currentTarget as HTMLElement).style.color = 'var(--brand-primary)'; }}
                  >
                    <span>Manage Cohort</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowModal(false)} className="absolute inset-0 backdrop-blur-md"
            style={{ background: 'rgba(0,0,0,0.5)' }} />

          <div className="w-full max-w-lg rounded-3xl shadow-2xl relative z-10 overflow-hidden"
            style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)' }}>
            <div className="p-6 border-b flex items-center justify-between"
              style={{ borderColor: 'var(--surface-border)' }}>
              <div>
                <h3 className="text-lg font-black" style={{ color: 'var(--foreground)' }}>Create New Project</h3>
                <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Initialize a new training cohort batch</p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="h-8 w-8 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--surface-border)', color: 'var(--text-muted)' }}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProjectSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {msg.text && (
                <div className={`p-4 rounded-xl text-xs font-semibold border ${
                  msg.type === 'success' ? 'bg-emerald-50 border-emerald-150 text-emerald-700' : 'bg-rose-50 border-rose-150 text-rose-700'
                }`}>
                  {msg.text}
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Project Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EJP - Albatross Boot-camp"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Batch Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Batch 4"
                  value={batch}
                  onChange={(e) => setBatch(e.target.value)}
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Description</label>
                <textarea
                  placeholder="Write a brief overview..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field resize-none"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Roster Spreadsheet Upload (CSV/Excel)</label>
                <div className="relative border-2 border-dashed border-slate-800 hover:border-slate-650 bg-slate-850/10 rounded-2xl p-6 text-center transition-all duration-200 cursor-pointer">
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  <div className="flex flex-col items-center gap-2">
                    <FileText className="h-8 w-8 text-fuchsia-500" />
                    <p className="text-xs text-slate-650 font-bold">{fileName || 'Choose CSV/Excel file or drag here'}</p>
                    <span className="text-[9px] text-slate-400">Columns: Name, Email, Phone, Tier, Hired, Resume, Github, Linkedin</span>
                  </div>
                </div>
                {studentsList.length > 0 && (
                  <p className="text-[10px] text-emerald-600 font-bold mt-2">✓ Parsed {studentsList.length} students from the sheet.</p>
                )}
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-800/60"></div>
                <span className="flex-shrink mx-4 text-[9px] text-slate-550 font-bold uppercase tracking-wider">Or Connect Google Sheet</span>
                <div className="flex-grow border-t border-slate-800/60"></div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Google Sheet URL</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    placeholder="https://docs.google.com/spreadsheets/d/.../edit"
                    value={sheetUrl}
                    onChange={(e) => setSheetUrl(e.target.value)}
                    className="flex-1 bg-slate-850/30 border border-slate-800 focus:border-purple-400 text-slate-700 px-4 py-3 rounded-xl outline-none text-xs placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    onClick={handleGoogleSheetImport}
                    disabled={importLoading || !sheetUrl}
                    className="bg-slate-850 hover:bg-slate-800 text-purple-700 border border-slate-700 px-4 rounded-xl text-xs font-bold tracking-wide transition-all duration-200 disabled:opacity-40 cursor-pointer"
                  >
                    {importLoading ? 'Loading...' : 'Load Sheet'}
                  </button>
                </div>
                {sheetUrl && (
                  <p className="text-[9px] text-slate-500 mt-1">Make sure sheet sharing is set to "Anyone with the link can view".</p>
                )}
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-slate-850 border border-slate-800 text-slate-650 hover:bg-slate-800 py-3 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading || !name || !batch}
                  className="flex-1 bg-gradient-to-r from-fuchsia-600 to-orange-550 hover:from-fuchsia-500 hover:to-orange-450 text-white py-3 rounded-xl text-xs font-bold transition-all shadow-lg shadow-fuchsia-500/10 disabled:opacity-50 cursor-pointer"
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
