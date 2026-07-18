'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/utils/api';
import { ShieldCheck, Users, Trash2, Edit3, X, Check } from 'lucide-react';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'users' | 'students'>('users');
  const [users, setUsers] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit states
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      setLoading(true);
      if (activeTab === 'users') {
        const res = await apiRequest('/admin/users');
        setUsers(res.data || []);
      } else {
        const res = await apiRequest('/admin/students');
        setStudents(res.data || []);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
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
        await apiRequest(`/admin/users/${id}`, {
          method: 'PUT',
          body: JSON.stringify(editFormData),
        });
        setUsers(users.map(u => u._id === id ? { ...u, ...editFormData } : u));
      } else {
        await apiRequest(`/admin/students/${id}`, {
          method: 'PUT',
          body: JSON.stringify(editFormData),
        });
        setStudents(students.map(s => s._id === id ? { ...s, ...editFormData } : s));
      }
      setEditingId(null);
    } catch (err) {
      console.error('Error saving record:', err);
      alert('Failed to update record');
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
    } catch (err) {
      console.error('Error deleting record:', err);
      alert('Failed to delete record');
    }
  };

  return (
    <div className="space-y-8 relative">
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Header */}
      <div className="flex items-center gap-3">
        <ShieldCheck className="h-8 w-8 text-emerald-500" />
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">Admin Management Panel</h1>
          <p className="text-slate-400 text-sm mt-1">Manage all platform users, mentors, and students</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex bg-slate-950 p-1 border border-slate-850 rounded-2xl w-fit gap-1">
        <button
          onClick={() => setActiveTab('users')}
          className={`px-6 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'users' ? 'bg-emerald-600 text-white' : 'text-slate-450 hover:text-slate-200'
          }`}
        >
          Mentors / Admins
        </button>
        <button
          onClick={() => setActiveTab('students')}
          className={`px-6 py-2 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'students' ? 'bg-emerald-600 text-white' : 'text-slate-450 hover:text-slate-200'
          }`}
        >
          Students
        </button>
      </div>

      {/* Data Table */}
      <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-400">
            <thead className="bg-slate-950/50 text-xs uppercase font-bold text-slate-300 border-b border-slate-800">
              <tr>
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">{activeTab === 'users' ? 'Role' : 'Batch/Project'}</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-850">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-slate-500">
                    <div className="h-6 w-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                  </td>
                </tr>
              ) : activeTab === 'users' ? (
                users.map(user => (
                  <tr key={user._id} className="hover:bg-slate-850/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-200">
                      {editingId === user._id ? (
                        <input type="text" value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} className="bg-slate-950 border border-slate-700 rounded px-2 py-1 outline-none text-xs w-full" />
                      ) : user.name}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === user._id ? (
                        <input type="email" value={editFormData.email} onChange={e => setEditFormData({...editFormData, email: e.target.value})} className="bg-slate-950 border border-slate-700 rounded px-2 py-1 outline-none text-xs w-full" />
                      ) : user.email}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === user._id ? (
                        <select value={editFormData.role} onChange={e => setEditFormData({...editFormData, role: e.target.value})} className="bg-slate-950 border border-slate-700 rounded px-2 py-1 outline-none text-xs w-full">
                          <option value="mentor">Mentor</option>
                          <option value="admin">Admin</option>
                        </select>
                      ) : (
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider ${user.role === 'admin' ? 'bg-amber-500/20 text-amber-500 border border-amber-500/20' : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/20'}`}>
                          {user.role}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 flex items-center justify-end gap-2">
                      {editingId === user._id ? (
                        <>
                          <button onClick={() => handleSave(user._id)} className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/40 transition-colors"><Check className="h-4 w-4" /></button>
                          <button onClick={handleCancelEdit} className="p-1.5 bg-slate-700/50 text-slate-300 rounded hover:bg-slate-700 transition-colors"><X className="h-4 w-4" /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEditClick(user)} className="p-1.5 bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500/20 transition-colors"><Edit3 className="h-4 w-4" /></button>
                          <button onClick={() => handleDelete(user._id)} className="p-1.5 bg-rose-500/10 text-rose-500 rounded hover:bg-rose-500/20 transition-colors"><Trash2 className="h-4 w-4" /></button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                students.map(student => (
                  <tr key={student._id} className="hover:bg-slate-850/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-200">
                      {editingId === student._id ? (
                        <input type="text" value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} className="bg-slate-950 border border-slate-700 rounded px-2 py-1 outline-none text-xs w-full" />
                      ) : student.name}
                    </td>
                    <td className="px-6 py-4">
                      {editingId === student._id ? (
                        <input type="email" value={editFormData.email} onChange={e => setEditFormData({...editFormData, email: e.target.value})} className="bg-slate-950 border border-slate-700 rounded px-2 py-1 outline-none text-xs w-full" />
                      ) : student.email}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                        {student.project ? (student.project.batch || student.project.name) : 'No Batch'}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex items-center justify-end gap-2">
                      {editingId === student._id ? (
                        <>
                          <button onClick={() => handleSave(student._id)} className="p-1.5 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/40 transition-colors"><Check className="h-4 w-4" /></button>
                          <button onClick={handleCancelEdit} className="p-1.5 bg-slate-700/50 text-slate-300 rounded hover:bg-slate-700 transition-colors"><X className="h-4 w-4" /></button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => handleEditClick(student)} className="p-1.5 bg-blue-500/10 text-blue-400 rounded hover:bg-blue-500/20 transition-colors"><Edit3 className="h-4 w-4" /></button>
                          <button onClick={() => handleDelete(student._id)} className="p-1.5 bg-rose-500/10 text-rose-500 rounded hover:bg-rose-500/20 transition-colors"><Trash2 className="h-4 w-4" /></button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {(!loading && activeTab === 'users' && users.length === 0) || (!loading && activeTab === 'students' && students.length === 0) ? (
            <div className="p-8 text-center text-slate-500">No records found.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
