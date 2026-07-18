'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  ClipboardCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Mail,
  Send,
  Clock,
  Calendar,
  Loader2,
  Sun,
  Moon,
  BookOpen,
  Zap
} from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export default function AttendanceFormPage() {
  const { formId } = useParams() as { formId: string };

  const [formData, setFormData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [jobsApplied, setJobsApplied] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitResult, setSubmitResult] = useState<any>(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [isExpired, setIsExpired] = useState(false);

  // Dark mode sync
  useEffect(() => {
    document.documentElement.classList.add('dark');
    setIsDarkMode(true);
  }, []);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    }
  };

  // Fetch form info
  useEffect(() => {
    if (!formId) return;
    async function fetchForm() {
      try {
        const res = await fetch(`${API_URL}/public/attendance-forms/${formId}`);
        const result = await res.json();
        if (result.success && result.data) {
          setFormData(result.data);
          setIsExpired(!result.data.isActive);
        } else {
          setError(result.message || 'This attendance form could not be found.');
        }
      } catch {
        setError('Unable to connect to the server. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    fetchForm();
  }, [formId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    if (!email.trim() || !name.trim()) {
      setSubmitError('Please enter your name and course email address.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`${API_URL}/public/attendance-forms/${formId}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: email.trim(),
          name: name.trim(),
          jobsApplied: jobsApplied ? Number(jobsApplied) : 0
        }),
      });
      const result = await res.json();
      if (result.success) {
        setSubmitted(true);
        setSubmitResult(result.data);
      } else {
        setSubmitError(result.message || 'Submission failed. Please try again.');
      }
    } catch {
      setSubmitError('Network error. Please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formattedDate = formData?.date
    ? new Date(formData.date + 'T00:00:00').toLocaleDateString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      })
    : '';

  return (
    <div className="min-h-screen transition-colors duration-500" style={{ background: 'var(--background)' }}>
      {/* Background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="dark-bg-layer" />
        <div className="app-bg-layer1" />
        <div className="app-glow-purple" />
        <div className="app-glow-orange" />
      </div>

      {/* Topbar */}
      <header className="relative z-10 h-14 px-6 flex items-center justify-between backdrop-blur-xl"
        style={{ background: 'var(--surface-1)', borderBottom: '1px solid var(--surface-border)' }}>
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl flex items-center justify-center shadow-lg"
            style={{ background: 'linear-gradient(135deg, #7c3aed, #d946ef)' }}>
            <Zap className="h-5 w-5 text-white" fill="white" />
          </div>
          <div>
            <span className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>Placement Pulse</span>
            <p className="text-[10px] uppercase tracking-widest font-bold" style={{ color: 'var(--text-faint)' }}>Daily Attendance</p>
          </div>
        </div>
        <button
          onClick={toggleTheme}
          className="h-9 w-9 rounded-xl flex items-center justify-center transition-colors cursor-pointer"
          style={{ border: '1px solid var(--surface-border)', color: 'var(--text-muted)' }}
        >
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>
      </header>

      <main className="relative z-10 flex min-h-[calc(100vh-65px)] items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">

          {/* Loading State */}
          {loading && (
            <div className="text-center space-y-4">
              <div className="h-14 w-14 mx-auto rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                <Loader2 className="h-7 w-7 text-indigo-400 animate-spin" />
              </div>
              <p className="text-slate-400 text-sm">Loading form details…</p>
            </div>
          )}

          {/* Fatal Error */}
          {!loading && error && (
            <div className="glass-card p-8 text-center space-y-4">
              <div className="h-16 w-16 mx-auto rounded-2xl flex items-center justify-center"
                style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)' }}>
                <XCircle className="h-8 w-8 text-rose-500" />
              </div>
              <h2 className="text-lg font-bold" style={{ color: 'var(--foreground)' }}>Form Not Found</h2>
              <p className="text-sm leading-relaxed" style={{ color: 'var(--text-muted)' }}>{error}</p>
            </div>
          )}

          {/* Success State */}
          {!loading && !error && submitted && submitResult && (
            <div className="glass-card p-8 text-center space-y-5">
              <div className="h-20 w-20 mx-auto rounded-full flex items-center justify-center"
                style={{ background: 'rgba(16,185,129,0.12)', border: '2px solid rgba(16,185,129,0.3)' }}>
                <CheckCircle2 className="h-10 w-10 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-xl font-black" style={{ color: 'var(--foreground)' }}>Attendance Marked! 🎉</h2>
                <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Your attendance has been recorded successfully.</p>
              </div>
              <div className="rounded-2xl p-4 space-y-2 text-sm"
                style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                <div className="flex justify-between items-center">
                  <span style={{ color: 'var(--text-muted)' }}>Student</span>
                  <span className="font-bold text-emerald-500">{submitResult.studentName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span style={{ color: 'var(--text-muted)' }}>Date</span>
                  <span className="font-semibold" style={{ color: 'var(--foreground)' }}>{submitResult.date}</span>
                </div>
                <div className="flex justify-between items-center pt-2" style={{ borderTop: '1px solid rgba(16,185,129,0.15)' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Mark Earned</span>
                  <span className="font-black text-emerald-500 text-xl">+{submitResult.mark}</span>
                </div>
              </div>
              <p className="text-xs" style={{ color: 'var(--text-faint)' }}>You may now close this tab.</p>
            </div>
          )}

          {/* Main Form */}
          {!loading && !error && !submitted && formData && (
            <div className="space-y-5">
              {/* Header card */}
              <div className="glass-card p-6 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="h-12 w-12 rounded-2xl flex items-center justify-center shrink-0"
                    style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15), rgba(217,70,239,0.1))', border: '1px solid var(--surface-border)' }}>
                    <ClipboardCheck className="h-6 w-6" style={{ color: 'var(--brand-primary)' }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h1 className="text-lg font-black leading-tight" style={{ color: 'var(--foreground)' }}>Daily Attendance</h1>
                    {formData.project && (
                      <p className="text-sm font-semibold mt-0.5" style={{ color: 'var(--brand-primary)' }}>
                        {formData.project.name} {formData.project.batch && `· ${formData.project.batch}`}
                      </p>
                    )}
                  </div>
                  {isExpired || !formData.isActive ? (
                    <span className="shrink-0 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full"
                      style={{ background: 'rgba(244,63,94,0.1)', border: '1px solid rgba(244,63,94,0.2)', color: '#f43f5e' }}>
                      Closed
                    </span>
                  ) : (
                    <span className="shrink-0 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1"
                      style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981' }}>
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Live
                    </span>
                  )}
                </div>

                {/* Date & countdown */}
                <div className="grid grid-cols-1 gap-3">
                  <div className="rounded-2xl p-3" style={{ background: 'var(--surface-2)', border: '1px solid var(--surface-border)' }}>
                    <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest mb-1" style={{ color: 'var(--text-faint)' }}>
                      <Calendar className="h-3 w-3" />
                      Date
                    </div>
                    <p className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>{formattedDate}</p>
                  </div>
                </div>

                {/* Marks info */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 rounded-xl p-3 text-center"
                    style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.15)' }}>
                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>Present Mark</p>
                    <p className="text-xl font-black text-emerald-500 mt-0.5">+{formData.presentMark}</p>
                  </div>
                  <div className="flex-1 rounded-xl p-3 text-center"
                    style={{ background: 'rgba(244,63,94,0.06)', border: '1px solid rgba(244,63,94,0.15)' }}>
                    <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>Absent Mark</p>
                    <p className="text-xl font-black text-rose-500 mt-0.5">{formData.absentMark}</p>
                  </div>
                </div>
              </div>

              {/* Expired / Closed Warning */}
              {(isExpired || !formData.isActive) && (
                <div className="bg-rose-500/5 border border-rose-500/20 rounded-2xl p-4 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-rose-300">Form No Longer Accepting Responses</p>
                    <p className="text-xs text-rose-400/70 mt-0.5">This attendance form has expired or been closed by your mentor. Contact your mentor if you believe this is an error.</p>
                  </div>
                </div>
              )}

              {/* Submission Form */}
              {!isExpired && formData.isActive && (
                <form onSubmit={handleSubmit} className="glass-card p-6 space-y-5">
                  <div>
                    <h2 className="text-sm font-black" style={{ color: 'var(--foreground)' }}>Mark Your Attendance</h2>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>Enter your details to register as Present for today.</p>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest block" style={{ color: 'var(--text-muted)' }}>
                      Full Name
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. John Doe"
                        required
                        className="input-field"
                        style={{ paddingLeft: '1rem' }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest block" style={{ color: 'var(--text-muted)' }}>
                      Course Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: 'var(--text-faint)' }} />
                      <input
                        type="email"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="your@course-email.com"
                        required
                        className="input-field"
                        style={{ paddingLeft: '2.5rem' }}
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-widest block" style={{ color: 'var(--text-muted)' }}>
                      How many Jobs You Apply Today?
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="0"
                        value={jobsApplied}
                        onChange={e => setJobsApplied(e.target.value)}
                        placeholder="0"
                        className="input-field"
                        style={{ paddingLeft: '1rem' }}
                      />
                    </div>
                  </div>

                  {submitError && (
                    <div className="rounded-xl p-3 flex items-start gap-2.5"
                      style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)' }}>
                      <XCircle className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                      <p className="text-xs leading-relaxed text-rose-500">{submitError}</p>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={submitting}
                    className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{ padding: '12px', borderRadius: '12px' }}
                  >
                    {submitting ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {submitting ? 'Submitting…' : 'Submit Attendance'}
                  </button>

                  <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-faint)' }}>
                    <BookOpen className="h-3.5 w-3.5 shrink-0" />
                    <span>Your email identifies you within this program. Submitting marks you as <strong style={{ color: 'var(--text-muted)' }}>Present</strong>.</span>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
