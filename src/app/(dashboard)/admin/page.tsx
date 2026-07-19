'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { apiRequest } from '@/utils/api';
import Link from 'next/link';
import {
  ShieldCheck, Users, Trash2, Edit3, X, Check, Plus,
  Search, SlidersHorizontal, AlertTriangle, UserCheck, UserX, Clock, FolderOpen,
  Activity, Zap, TrendingUp, ArrowRight
} from 'lucide-react';

export default function AdminUsersPage() {
  const [activeTab, setActiveTab] = useState<'users' | 'students'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Edit states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});

  // View Profile Modal State
  const [viewProfileUser, setViewProfileUser] = useState<any>(null);

  // Add User modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [addName, setAddName] = useState('');
  const [addEmail, setAddEmail] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [addRole, setAddRole] = useState('mentor');
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState('');

  const [mounted, setMounted] = useState(false);
  const [userName, setUserName] = useState('Admin');

  useEffect(() => {
    setMounted(true);
    try {
      const u = JSON.parse(sessionStorage.getItem('user') || '{}');
      if (u && u.name) setUserName(u.name);
    } catch (e) {}
  }, []);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch all projects to map mentors
      const projRes = await apiRequest('/projects');
      setProjects(projRes.data || []);

      if (activeTab === 'users') {
        const res = await apiRequest('/admin/users');
        setUsers(res.data || []);
      } else {
        const res = await apiRequest('/admin/students');
        setStudents(res.data || []);
      }
    } catch {
      setError('Failed to load data. Please check your backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (record: any) => {
    setEditingId(record._id);
    setEditFormData({ ...record });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditFormData({});
  };

  const handleSave = async (id: string) => {
    try {
      if (activeTab === 'users') {
        await apiRequest(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(editFormData) });
        setUsers(users.map(u => u._id === id ? { ...u, ...editFormData } : u));
      } else {
        await apiRequest(`/admin/students/${id}`, { method: 'PUT', body: JSON.stringify(editFormData) });
        setStudents(students.map(s => s._id === id ? { ...s, ...editFormData } : s));
      }
      setEditingId(null);
    } catch {
      alert('Failed to update record.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record? This action cannot be undone.')) return;
    try {
      if (activeTab === 'users') {
        await apiRequest(`/admin/users/${id}`, { method: 'DELETE' });
        setUsers(users.filter(u => u._id !== id));
      } else {
        await apiRequest(`/admin/students/${id}`, { method: 'DELETE' });
        setStudents(students.filter(s => s._id !== id));
      }
    } catch {
      alert('Failed to delete record.');
    }
  };

  const handleApproveUser = async (id: string, nextStatus: 'approved' | 'rejected') => {
    try {
      await apiRequest(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify({ status: nextStatus }) });
      setUsers(users.map(u => u._id === id ? { ...u, status: nextStatus } : u));
    } catch {
      alert('Failed to update status.');
    }
  };

  const handleCreateUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName || !addEmail || !addPassword) return;
    setAddLoading(true);
    setAddError('');
    try {
      const res = await apiRequest('/admin/users', {
        method: 'POST',
        body: JSON.stringify({
          name: addName,
          email: addEmail,
          password: addPassword,
          role: addRole
        })
      });
      if (res.success) {
        setUsers(prev => [res.data, ...prev]);
        setShowAddModal(false);
        setAddName('');
        setAddEmail('');
        setAddPassword('');
        setAddRole('mentor');
      } else {
        setAddError(res.message || 'Failed to create user.');
      }
    } catch (err: any) {
      setAddError(err.message || 'Failed to create user. Email might already exist.');
    } finally {
      setAddLoading(false);
    }
  };

  const filteredUsers = users.filter(u =>
    u.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStudents = students.filter(s =>
    s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const pendingCount = users.filter(u => u.status === 'pending').length;

  return (
    <div className="space-y-8 relative z-10 page-enter">
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            Welcome, <span className="text-purple-600">{userName}</span> 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-medium">
            Manage platform access, roles, and student records.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {pendingCount > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl text-xs font-bold text-amber-700">
              <Clock className="h-4 w-4" />
              {pendingCount} Pending Approval{pendingCount > 1 ? 's' : ''}
            </div>
          )}
          {activeTab === 'users' && (
            <button
              onClick={() => { setShowAddModal(true); setAddError(''); }}
              className="px-5 py-2.5 bg-gradient-to-r from-[#7c3aed] to-[#d946ef] hover:opacity-95 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-md"
            >
              <Plus className="h-4 w-4" />
              Add User
            </button>
          )}
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

      {/* ── Top Controls (Filters / Search) ── */}
      <div className="flex items-center justify-between flex-wrap gap-4 pt-2 border-b border-gray-100 pb-6">
        <div className="flex items-center gap-3">
          <div className="bg-white p-1 rounded-full flex gap-1 border border-gray-200/60 shadow-sm">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-5 py-2 text-xs font-black uppercase tracking-wider rounded-full transition-all duration-200 flex items-center gap-1.5 ${activeTab === 'users' ? 'bg-purple-50 text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
            >
              Admins & Mentors
              {pendingCount > 0 && activeTab !== 'users' && (
                <span className="h-4 w-4 rounded-full bg-amber-500 text-white text-[8px] flex items-center justify-center">{pendingCount}</span>
              )}
            </button>
            <button
              onClick={() => setActiveTab('students')}
              className={`px-5 py-2 text-xs font-black uppercase tracking-wider rounded-full transition-all duration-200 ${activeTab === 'students' ? 'bg-purple-50 text-purple-700 shadow-sm' : 'text-gray-500 hover:text-gray-800'}`}
            >
              Students
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-10 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500/20 text-gray-800 shadow-sm"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-colors shadow-sm text-xs font-bold">
            <SlidersHorizontal className="h-3.5 w-3.5" /> Filter
          </button>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-600 transition-colors shadow-sm text-xs font-bold">
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Export
          </button>
        </div>
      </div>

      {/* ── List Headers ── */}
      <div className="hidden md:grid grid-cols-12 gap-4 px-6 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
        <div className="col-span-5">Profile & Projects</div>
        <div className="col-span-3">Role</div>
        <div className="col-span-2">Status</div>
        <div className="col-span-2 text-right pr-4">Actions</div>
      </div>

      {/* ── Cards List ── */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-12 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
            <div className="h-6 w-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : activeTab === 'users' ? (
          filteredUsers.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-2xl border border-gray-100 shadow-sm text-gray-500 text-xs font-bold">
              {searchTerm ? 'No users match your search.' : 'No users found.'}
            </div>
          ) : filteredUsers.map(user => {
            const initials = user.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
            const isPending = user.status === 'pending';

            // Filter projects assigned to this user/mentor
            const userProjects = projects.filter((p: any) => p.mentor === user._id || p.mentor?._id === user._id);

            return (
              <div key={user._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 p-4 md:px-6 md:py-5">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">

                  {/* Profile & Projects */}
                  <div className="col-span-1 md:col-span-5 flex items-start gap-4">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-black text-sm shrink-0 ${isPending ? 'bg-gray-100 text-gray-600' : (user.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-pink-100 text-pink-700')}`}>
                      {initials}
                    </div>
                    <div>
                      {editingId === user._id ? (
                        <input type="text" value={editFormData.name} onChange={e => setEditFormData({ ...editFormData, name: e.target.value })} className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 outline-none text-sm text-gray-900 font-extrabold w-full max-w-[200px]" />
                      ) : (
                        <h4 className="font-extrabold text-gray-900 text-sm leading-tight">{user.name}</h4>
                      )}

                      {editingId === user._id ? (
                        <input type="email" value={editFormData.email} onChange={e => setEditFormData({ ...editFormData, email: e.target.value })} className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 outline-none text-xs text-gray-500 mt-1 font-medium w-full max-w-[200px]" />
                      ) : (
                        <p className="text-xs text-gray-500 font-medium mt-0.5 mb-2">{user.email}</p>
                      )}

                      {/* Projects Tags */}
                      {user.role === 'mentor' ? (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          {userProjects.map((p: any) => (
                            <span key={p._id} className="px-2 py-0.5 bg-pink-50 text-pink-600 text-[9px] font-black uppercase tracking-wider rounded-md border border-pink-100">
                              {p.name}
                            </span>
                          ))}
                          {userProjects.length === 0 && (
                            <span className="text-[10px] text-gray-400 font-medium italic">No Active Projects</span>
                          )}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-1.5 mt-1">
                          <span className="px-2 py-0.5 bg-purple-50 text-purple-600 text-[9px] font-black uppercase tracking-wider rounded-md border border-purple-100">
                            System Access
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Role */}
                  <div className="col-span-1 md:col-span-3">
                    <span className="md:hidden text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Role:</span>
                    {editingId === user._id ? (
                      <select value={editFormData.role} onChange={e => setEditFormData({ ...editFormData, role: e.target.value })} className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 outline-none text-xs text-gray-900 font-extrabold">
                        <option value="mentor">Mentor</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest inline-flex items-center border ${user.role === 'admin' ? 'bg-purple-50 text-purple-600 border-purple-200' : 'bg-pink-50 text-pink-600 border-pink-200'}`}>
                        {user.role}
                      </span>
                    )}
                  </div>

                  {/* Status */}
                  <div className="col-span-1 md:col-span-2">
                    <span className="md:hidden text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Status:</span>
                    {isPending ? (
                      <span className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 bg-gray-100 text-gray-500 border border-gray-200">
                        <span className="h-1.5 w-1.5 rounded-full bg-gray-400" /> IN REVIEW
                      </span>
                    ) : (
                      <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 border ${user.status === 'approved' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-rose-50 text-rose-600 border-rose-200'}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${user.status === 'approved' ? 'bg-green-500' : 'bg-rose-500'}`} />
                        {user.status}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 md:col-span-2 flex items-center md:justify-end gap-4 mt-2 md:mt-0 pr-2">
                    {editingId === user._id ? (
                      <>
                        <button onClick={() => handleSave(user._id)} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-colors"><Check className="h-4 w-4" /></button>
                        <button onClick={handleCancelEdit} className="p-2 bg-gray-50 text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"><X className="h-4 w-4" /></button>
                      </>
                    ) : isPending ? (
                      <div className="flex items-center gap-4">
                        <button onClick={() => handleApproveUser(user._id, 'approved')} className="px-4 py-1.5 bg-purple-100 hover:bg-purple-200 text-purple-700 text-[10px] font-black tracking-widest uppercase rounded-lg transition-colors border border-purple-200">
                          Approve Now
                        </button>
                        <button onClick={() => handleEditClick(user)} className="text-[10px] font-black text-purple-600 hover:text-purple-800 flex items-center gap-1">
                          Details <ArrowRight className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleDelete(user._id)} className="p-1.5 text-gray-400 hover:text-rose-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                          <button onClick={() => handleEditClick(user)} className="p-1.5 text-gray-400 hover:text-purple-600 transition-colors"><Edit3 className="h-4 w-4" /></button>
                        </div>
                        <button onClick={() => setViewProfileUser(user)} className="text-[10px] font-black text-purple-600 hover:text-purple-800 flex items-center gap-1 whitespace-nowrap ml-2">
                          See Profile <ArrowRight className="h-3 w-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          filteredStudents.length === 0 ? (
            <div className="py-12 text-center bg-white rounded-2xl border border-gray-100 shadow-sm text-gray-500 text-xs font-bold">
              {searchTerm ? 'No students match your search.' : 'No students found across any projects.'}
            </div>
          ) : filteredStudents.map(student => {
            const initials = student.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'S';
            const batchCode = student.project ? (student.project.batch || student.project.name) : 'N/A';
            return (
              <div key={student._id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 p-4 md:px-6 md:py-5">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Profile & Projects */}
                  <div className="col-span-1 md:col-span-5 flex items-start gap-4">
                    <div className="h-12 w-12 rounded-xl bg-slate-900 flex items-center justify-center font-black text-white text-sm shrink-0 border border-slate-700">
                      {initials}
                    </div>
                    <div>
                      {editingId === student._id ? (
                        <input type="text" value={editFormData.name} onChange={e => setEditFormData({ ...editFormData, name: e.target.value })} className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 outline-none text-sm text-gray-900 font-extrabold w-full max-w-[200px]" />
                      ) : (
                        <h4 className="font-extrabold text-gray-900 text-sm leading-tight">{student.name}</h4>
                      )}

                      {editingId === student._id ? (
                        <input type="email" value={editFormData.email} onChange={e => setEditFormData({ ...editFormData, email: e.target.value })} className="bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 outline-none text-xs text-gray-500 mt-1 font-medium w-full max-w-[200px]" />
                      ) : (
                        <p className="text-xs text-gray-500 font-medium mt-0.5 mb-2">{student.email}</p>
                      )}
                    </div>
                  </div>

                  {/* Role (Batch Code for student) */}
                  <div className="col-span-1 md:col-span-3">
                    <span className="md:hidden text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Batch:</span>
                    <span className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest inline-flex items-center border bg-blue-50 text-blue-600 border-blue-200">
                      {batchCode}
                    </span>
                  </div>

                  {/* Status */}
                  <div className="col-span-1 md:col-span-2">
                    <span className="md:hidden text-[10px] font-black uppercase tracking-widest text-gray-400 block mb-1">Status:</span>
                    <span className="px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest inline-flex items-center gap-1.5 border bg-green-50 text-green-600 border-green-200">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-500" /> ACTIVE
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-1 md:col-span-2 flex items-center md:justify-end gap-2 pr-2">
                    {editingId === student._id ? (
                      <>
                        <button onClick={() => handleSave(student._id)} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-colors"><Check className="h-4 w-4" /></button>
                        <button onClick={handleCancelEdit} className="p-2 bg-gray-50 text-gray-600 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors"><X className="h-4 w-4" /></button>
                      </>
                    ) : (
                      <>
                        <button onClick={() => handleDelete(student._id)} className="p-1.5 text-gray-400 hover:text-rose-500 transition-colors"><Trash2 className="h-4 w-4" /></button>
                        <button onClick={() => handleEditClick(student)} className="p-1.5 text-gray-400 hover:text-purple-600 transition-colors"><Edit3 className="h-4 w-4" /></button>
                        <Link href="/admin" className="text-[10px] font-black text-purple-600 hover:text-purple-800 flex items-center gap-1 whitespace-nowrap ml-2">
                          See Profile <ArrowRight className="h-3 w-3" />
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ── Pagination Footer ── */}
      <div className="flex flex-wrap items-center justify-between gap-4 py-4 text-xs font-bold text-gray-400">
        <div>
          Showing {activeTab === 'users' ? filteredUsers.length : filteredStudents.length} of {activeTab === 'users' ? users.length : students.length} active users
        </div>
        <div className="flex items-center gap-1.5">
          <button className="h-8 w-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50">&lt;</button>
          <button className="h-8 w-8 rounded-lg bg-purple-700 text-white flex items-center justify-center shadow-md">1</button>
          <button className="h-8 w-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50">2</button>
          <button className="h-8 w-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50">3</button>
          <button className="h-8 w-8 rounded-lg border border-gray-200 bg-white flex items-center justify-center hover:bg-gray-50">&gt;</button>
        </div>
      </div>

      {/* ── Add User Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div className="w-full max-w-md rounded-3xl shadow-2xl relative z-10 overflow-hidden bg-white border border-gray-100 animate-slide-in-up">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-gray-900">Add New User</h3>
                <p className="text-xs text-gray-400 font-semibold mt-0.5">Manually create and approve an account</p>
              </div>
              <button onClick={() => setShowAddModal(false)} className="h-8 w-8 rounded-xl flex items-center justify-center border border-gray-100 hover:bg-gray-50 text-gray-400 cursor-pointer">
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateUserSubmit} className="p-6 space-y-4 font-medium">
              {addError && (
                <div className="p-3 bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{addError}</span>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 font-bold outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. mentor@pulse.com"
                  value={addEmail}
                  onChange={(e) => setAddEmail(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 font-bold outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Password</label>
                <input
                  type="password"
                  required
                  placeholder="Min 6 characters"
                  value={addPassword}
                  onChange={(e) => setAddPassword(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 font-bold outline-none focus:border-purple-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5">Platform Role</label>
                <select
                  value={addRole}
                  onChange={(e) => setAddRole(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 font-bold outline-none focus:border-purple-500 transition-colors cursor-pointer"
                >
                  <option value="mentor">Mentor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <div className="pt-4 flex gap-3">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 border border-gray-200 text-gray-600 hover:bg-gray-50 py-3 rounded-xl text-xs font-bold transition-colors cursor-pointer">Cancel</button>
                <button type="submit" disabled={addLoading} className="flex-1 bg-gradient-to-r from-[#7c3aed] to-[#d946ef] py-3 rounded-xl text-xs font-bold text-white disabled:opacity-50 cursor-pointer shadow-md">
                  {addLoading ? 'Adding...' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ── View Profile Modal ── */}
      {mounted && viewProfileUser && typeof document !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div onClick={() => setViewProfileUser(null)} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-all" />
          <div className="w-full max-w-4xl rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative z-10 overflow-hidden bg-white border border-gray-100 animate-slide-in-up flex flex-col max-h-[90vh]">

            <div className="overflow-y-auto p-8 pb-4 custom-scrollbar flex-1">
              {/* Header */}
              <div className="flex items-start justify-between mb-8">
                <div className="flex items-center gap-5">
                  <div className="relative">
                    <div className="h-24 w-24 rounded-full bg-slate-900 border-4 border-white shadow-lg overflow-hidden flex items-center justify-center text-white text-3xl font-black">
                      {viewProfileUser.name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                    </div>
                    <div className="absolute bottom-1 right-1 h-4 w-4 bg-green-500 rounded-full border-2 border-white shadow-sm" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-2xl font-extrabold text-gray-900">{viewProfileUser.name}</h2>
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 text-[9px] font-black uppercase tracking-widest rounded-full">
                        {viewProfileUser.role === 'admin' ? 'SYSTEM ADMINISTRATOR' : 'SENIOR MENTOR & PLACEMENT LEAD'}
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="mt-1 flex-shrink-0">
                        <svg className="h-4 w-4 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                      </div>
                      <p className="text-sm text-gray-500 font-medium max-w-md leading-relaxed">
                        Managing {projects.filter((p: any) => p.mentor === viewProfileUser._id || p.mentor?._id === viewProfileUser._id).length || 3} core cohorts and leading the placement strategy for the 2024 tech cycle.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button className="px-5 py-2.5 bg-[#6d28d9] hover:bg-[#5b21b6] text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-colors shadow-md">
                    EDIT PROFILE
                  </button>
                  <button className="h-9 w-12 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors">
                    <span className="font-bold text-lg mb-2">...</span>
                  </button>
                  <button onClick={() => setViewProfileUser(null)} className="ml-2 h-8 w-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                {/* Total Students */}
                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)] relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">TOTAL STUDENTS</h4>
                    <div className="h-8 w-8 bg-purple-100 rounded-lg flex items-center justify-center text-purple-600">
                      <Users className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-4xl font-extrabold text-gray-900">96</span>
                    <span className="text-sm text-gray-500 font-medium">Students Enrolled</span>
                  </div>
                  <div className="text-[10px] font-bold text-emerald-500 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> +4.2% from last month
                  </div>
                </div>

                {/* Avg Attendance */}
                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)] relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">AVG ATTENDANCE</h4>
                    <div className="h-8 w-8 bg-pink-100 rounded-lg flex items-center justify-center text-pink-600">
                      <Clock className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="flex items-baseline gap-2 mb-4">
                    <span className="text-4xl font-extrabold text-gray-900">88.5%</span>
                    <span className="text-sm text-gray-500 font-medium">Daily Avg</span>
                  </div>
                  <div className="text-[10px] font-bold text-purple-600 flex items-center gap-1">
                    <Activity className="h-3 w-3" /> Stable vs prev week
                  </div>
                </div>

                {/* Placed Rate */}
                <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-[0_2px_10px_rgb(0,0,0,0.02)] relative overflow-hidden flex items-center gap-5">
                  <div className="relative h-20 w-20 flex-shrink-0">
                    <svg className="h-full w-full" viewBox="0 0 36 36">
                      <path
                        className="text-gray-100"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        className="text-[#6d28d9]"
                        stroke="currentColor"
                        strokeWidth="4"
                        strokeDasharray="78, 100"
                        strokeLinecap="round"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-sm font-extrabold text-gray-900">
                      78%
                    </div>
                  </div>
                  <div>
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">PLACED RATE</h4>
                    <div className="text-lg font-extrabold text-gray-900">78% Placed</div>
                    <div className="text-[10px] text-gray-500 font-medium mt-0.5">75 / 96 Students</div>
                  </div>
                </div>
              </div>

              {/* Assigned Cohorts Health */}
              <div className="mb-4">
                <div className="flex justify-between items-end mb-4">
                  <div>
                    <h3 className="text-lg font-extrabold text-gray-900">Assigned Cohorts Health</h3>
                    <p className="text-xs text-gray-500 font-medium mt-0.5">Deep-dive into performance across all active batches.</p>
                  </div>
                  <button className="text-[10px] font-black text-[#6d28d9] uppercase tracking-widest flex items-center gap-1 hover:text-purple-800 transition-colors">
                    VIEW ALL COHORTS <ArrowRight className="h-3 w-3" />
                  </button>
                </div>

                <div className="space-y-3">
                  {/* Cohort Card 1 */}
                  <div className="bg-[#f8f9fc] rounded-2xl p-4 flex items-center justify-between border border-transparent hover:border-gray-200 transition-colors">
                    <div className="flex items-center gap-4 min-w-[200px]">
                      <div className="h-12 w-12 rounded-xl bg-[#6d28d9] flex items-center justify-center shadow-[0_4px_15px_rgba(109,40,217,0.3)] shrink-0">
                        <FolderOpen className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-gray-900">Kaizen 2.0</h4>
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">LAUNCHED 6MO AGO</span>
                      </div>
                    </div>

                    <div className="flex-1 max-w-xs px-4">
                      <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-2">
                        <span>Present Today</span>
                        <span className="text-gray-900">42 / 48</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-[#6d28d9] rounded-full" style={{ width: '87%' }} />
                      </div>
                    </div>

                    <div className="w-[100px] flex justify-center">
                      <span className="px-3 py-1 bg-amber-50 text-amber-500 text-[9px] font-bold rounded-full border border-amber-100">6 Absent</span>
                    </div>

                    <div className="flex items-center gap-3 w-[120px]">
                      <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                        <TrendingUp className="h-3 w-3" />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-green-600">12 Hired</div>
                        <div className="text-[9px] text-gray-400 font-medium mt-0.5">This Week</div>
                      </div>
                    </div>

                    <div className="w-[80px] text-right">
                      <div className="text-sm font-extrabold text-[#6d28d9]">92%</div>
                      <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-0.5">TURN-IN</div>
                    </div>
                  </div>

                  {/* Cohort Card 2 */}
                  <div className="bg-[#f8f9fc] rounded-2xl p-4 flex items-center justify-between border border-transparent hover:border-gray-200 transition-colors">
                    <div className="flex items-center gap-4 min-w-[200px]">
                      <div className="h-12 w-12 rounded-xl bg-[#d946ef] flex items-center justify-center shadow-[0_4px_15px_rgba(217,70,239,0.3)] shrink-0">
                        <Activity className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-gray-900">Fintech 101</h4>
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">LAUNCHED 3MO AGO</span>
                      </div>
                    </div>

                    <div className="flex-1 max-w-xs px-4">
                      <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-2">
                        <span>Present Today</span>
                        <span className="text-gray-900">36 / 38</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-[#d946ef] rounded-full" style={{ width: '94%' }} />
                      </div>
                    </div>

                    <div className="w-[100px] flex justify-center">
                      <span className="px-3 py-1 bg-blue-50 text-blue-500 text-[9px] font-bold rounded-full border border-blue-100">2 Absent</span>
                    </div>

                    <div className="flex items-center gap-3 w-[120px]">
                      <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                        <TrendingUp className="h-3 w-3" />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-green-600">5 Hired</div>
                        <div className="text-[9px] text-gray-400 font-medium mt-0.5">This Week</div>
                      </div>
                    </div>

                    <div className="w-[80px] text-right">
                      <div className="text-sm font-extrabold text-[#d946ef]">88%</div>
                      <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-0.5">TURN-IN</div>
                    </div>
                  </div>

                  {/* Cohort Card 3 */}
                  <div className="bg-[#f8f9fc] rounded-2xl p-4 flex items-center justify-between border border-transparent hover:border-gray-200 transition-colors">
                    <div className="flex items-center gap-4 min-w-[200px]">
                      <div className="h-12 w-12 rounded-xl bg-[#0f172a] flex items-center justify-center shadow-[0_4px_15px_rgba(15,23,42,0.3)] shrink-0">
                        <Zap className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h4 className="text-sm font-extrabold text-gray-900">Nexus Pilot</h4>
                        <span className="text-[8px] font-black text-gray-400 uppercase tracking-widest">LAUNCHED 1MO AGO</span>
                      </div>
                    </div>

                    <div className="flex-1 max-w-xs px-4">
                      <div className="flex justify-between text-[10px] font-bold text-gray-500 mb-2">
                        <span>Present Today</span>
                        <span className="text-gray-900">10 / 10</span>
                      </div>
                      <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-[#0f172a] rounded-full" style={{ width: '100%' }} />
                      </div>
                    </div>

                    <div className="w-[100px] flex justify-center">
                      <span className="px-3 py-1 bg-gray-100 text-gray-500 text-[9px] font-bold rounded-full border border-gray-200">Perfect Attendance</span>
                    </div>

                    <div className="flex items-center gap-3 w-[120px]">
                      <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                        <TrendingUp className="h-3 w-3" />
                      </div>
                      <div>
                        <div className="text-[10px] font-black text-green-600">0 Hired</div>
                        <div className="text-[9px] text-gray-400 font-medium mt-0.5">Early Stage</div>
                      </div>
                    </div>

                    <div className="w-[80px] text-right">
                      <div className="text-sm font-extrabold text-gray-900">100%</div>
                      <div className="text-[8px] font-black text-gray-400 uppercase tracking-widest mt-0.5">TURN-IN</div>
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 px-8 bg-[#eef2f9] border-t border-gray-100 flex justify-end items-center gap-4 mt-auto">
              <button onClick={() => setViewProfileUser(null)} className="text-[10px] font-black uppercase tracking-widest text-gray-500 hover:text-gray-800 transition-colors">
                CANCEL
              </button>
              <button onClick={() => setViewProfileUser(null)} className="px-6 py-2.5 bg-[#0f172a] hover:bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-md transition-colors">
                SAVE CHANGES
              </button>
            </div>
          </div>
        </div>
        , document.body)}
    </div>
  );
}
