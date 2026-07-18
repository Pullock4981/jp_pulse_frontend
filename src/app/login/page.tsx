'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiRequest } from '@/utils/api';
import { Mail, Lock, ArrowRight, Zap, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';

const FloatingOrb = ({ className, style }: { className?: string; style?: React.CSSProperties }) => (
  <div className={`absolute rounded-full pointer-events-none ${className}`} style={style} />
);

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
    if (token) router.push('/');
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      sessionStorage.setItem('token', res.token);
      sessionStorage.setItem('user', JSON.stringify(res.user));
      setSuccess(true);
      setTimeout(() => router.push('/'), 600);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex relative overflow-hidden transition-colors duration-500"
      style={{ background: 'var(--background)' }}>

      {/* Background layers */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="dark-bg-layer" />
        <div className="app-glow-purple" />
        <div className="app-glow-orange" />
        <div className="app-bg-layer1" />
      </div>

      {/* ── Left Brand Panel ──────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 relative overflow-hidden p-12">
        {/* Gradient overlay */}
        <div className="absolute inset-0 z-0"
          style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.95) 0%, rgba(217,70,239,0.85) 50%, rgba(249,115,22,0.8) 100%)' }} />
        <div className="absolute inset-0 z-1 opacity-20"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
            backgroundSize: '32px 32px'
          }} />

        {/* Floating orbs */}
        <FloatingOrb className="animate-float" style={{
          top: '10%', left: '15%', width: '200px', height: '200px',
          background: 'rgba(255,255,255,0.06)', filter: 'blur(40px)'
        }} />
        <FloatingOrb className="animate-float-delayed" style={{
          bottom: '20%', right: '10%', width: '280px', height: '280px',
          background: 'rgba(255,255,255,0.04)', filter: 'blur(60px)'
        }} />

        {/* Content */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="h-10 w-10 rounded-2xl bg-white/15 backdrop-blur-sm flex items-center justify-center border border-white/20">
              <Zap className="h-5 w-5 text-white" fill="white" />
            </div>
            <div>
              <span className="font-extrabold text-white text-base">Placement Pulse</span>
              <span className="block text-[10px] font-bold uppercase tracking-widest text-white/60">Cohort Tracker</span>
            </div>
          </div>

          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/60 bg-white/10 px-3 py-1.5 rounded-full border border-white/15">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Platform Active
            </div>
            <h1 className="text-5xl font-black text-white leading-tight">
              Track. Train.<br />
              <span className="text-white/80">Place.</span>
            </h1>
            <p className="text-white/70 text-base leading-relaxed max-w-sm">
              The complete placement intelligence platform for managing cohorts, tracking progress, and accelerating student careers.
            </p>
          </div>
        </div>

        {/* Stats row */}
        <div className="relative z-10 grid grid-cols-3 gap-4">
          {[
            { value: '500+', label: 'Students Placed' },
            { value: '98%', label: 'Satisfaction Rate' },
            { value: '30+', label: 'Active Batches' },
          ].map(stat => (
            <div key={stat.label} className="rounded-2xl p-4 text-center"
              style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
              <div className="text-2xl font-black text-white">{stat.value}</div>
              <div className="text-[10px] font-bold text-white/60 uppercase tracking-wide mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right Form Panel ──────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-8 relative z-10">
        <div className="w-full max-w-md animate-slide-in-up">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-2xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #d946ef)' }}>
              <Zap className="h-5 w-5 text-white" fill="white" />
            </div>
            <span className="font-extrabold text-lg" style={{ color: 'var(--foreground)' }}>Placement Pulse</span>
          </div>

          {/* Card */}
          <div className="glass-card p-8">
            <div className="mb-8">
              <h2 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--foreground)' }}>
                Welcome back 👋
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Sign in to your mentor portal
              </p>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-5 p-4 rounded-xl flex items-center gap-3 text-sm font-semibold"
                style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: '#f43f5e' }}>
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div className="mb-5 p-4 rounded-xl flex items-center gap-3 text-sm font-semibold"
                style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981' }}>
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                Signed in! Redirecting...
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest block" style={{ color: 'var(--text-muted)' }}>
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: 'var(--text-faint)' }} />
                  <input
                    type="email"
                    required
                    placeholder="name@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="input-field pl-10"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest block" style={{ color: 'var(--text-muted)' }}>
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: 'var(--text-faint)' }} />
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70 cursor-pointer"
                    style={{ color: 'var(--text-faint)' }}>
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading || success}
                className="btn-primary w-full flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ padding: '12px 20px', borderRadius: '12px', fontSize: '14px' }}
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="mt-6 pt-6 text-center border-t" style={{ borderColor: 'var(--surface-border)' }}>
              <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
                Don&apos;t have an account?{' '}
                <Link href="/register" className="font-bold transition-colors hover:underline" style={{ color: 'var(--brand-primary)' }}>
                  Create account
                </Link>
              </p>
            </div>
          </div>

          {/* Demo hint */}
          <div className="mt-4 p-3.5 rounded-xl text-xs text-center"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--surface-border)', color: 'var(--text-muted)' }}>
            💡 Use any email to log in demo mode. Include &quot;admin&quot; for admin access.
          </div>
        </div>
      </div>
    </main>
  );
}
