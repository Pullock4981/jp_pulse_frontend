'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { apiRequest } from '@/utils/api';
import { User, Mail, Lock, ArrowRight, Zap, Eye, EyeOff, ShieldCheck, Users, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'mentor' | 'admin'>('mentor');
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
      const res = await apiRequest('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password, role }),
      });
      if (res.pending) {
        setSuccess(true);
        alert(res.message || 'Registration successful! Please wait for admin approval to login.');
        setTimeout(() => router.push('/login'), 2000);
      } else {
        sessionStorage.setItem('token', res.token);
        sessionStorage.setItem('user', JSON.stringify(res.user));
        setSuccess(true);
        setTimeout(() => router.push('/'), 600);
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
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
        <div className="absolute inset-0 z-0"
          style={{ background: 'linear-gradient(135deg, rgba(217,70,239,0.9) 0%, rgba(124,58,237,0.95) 40%, rgba(15,40,120,0.98) 100%)' }} />
        <div className="absolute inset-0 opacity-10 z-1"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '32px 32px' }} />

        {/* Floating shapes */}
        <div className="absolute top-1/4 left-1/4 w-48 h-48 rounded-full opacity-20 animate-float"
          style={{ background: 'rgba(255,255,255,0.1)', filter: 'blur(40px)' }} />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 rounded-full opacity-15 animate-float-delayed"
          style={{ background: 'rgba(255,255,255,0.08)', filter: 'blur(60px)' }} />

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

          <div className="space-y-5">
            <h1 className="text-4xl font-black text-white leading-tight">
              Join the<br />
              <span className="text-white/80">Mentor Community</span>
            </h1>
            <p className="text-white/70 text-sm leading-relaxed max-w-sm">
              Create your account to start managing student cohorts, tracking placement progress, and using our AI-powered tools.
            </p>

            {/* Feature list */}
            <div className="space-y-3 pt-4">
              {[
                'Real-time cohort analytics dashboard',
                'AI-powered placement matching',
                'Automated attendance & quiz system',
                'Smart risk flagging & alerts',
              ].map(feat => (
                <div key={feat} className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="h-3 w-3 text-white" />
                  </div>
                  <span className="text-white/80 text-xs font-medium">{feat}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 rounded-2xl p-5"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
          <p className="text-white/60 text-xs italic leading-relaxed">
            "Placement Pulse helped us place 95% of our batch within 3 months. The real-time tracking is a game changer."
          </p>
          <div className="flex items-center gap-2 mt-3">
            <div className="h-7 w-7 rounded-full bg-white/20 flex items-center justify-center text-white text-xs font-bold">J</div>
            <div>
              <span className="text-white text-xs font-bold">Jerin Ahmed</span>
              <span className="block text-white/50 text-[10px]">Lead Mentor, Batch 4</span>
            </div>
          </div>
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

          <div className="glass-card p-8">
            <div className="mb-7">
              <h2 className="text-2xl font-extrabold mb-1" style={{ color: 'var(--foreground)' }}>
                Create account ✨
              </h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
                Join the placement management platform
              </p>
            </div>

            {success && (
              <div className="mb-5 p-4 rounded-xl flex items-center gap-3 text-sm font-semibold"
                style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#10b981' }}>
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                Account created! Redirecting...
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full name */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest block" style={{ color: 'var(--text-muted)' }}>
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: 'var(--text-faint)' }} />
                  <input
                    type="text"
                    required
                    placeholder="John Doe"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: '2.5rem' }}
                  />
                </div>
              </div>

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
                    className="input-field"
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
                    minLength={6}
                    placeholder="Min. 6 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="input-field"
                    style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer hover:opacity-70 transition-opacity"
                    style={{ color: 'var(--text-faint)' }}>
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* Role selector */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest block" style={{ color: 'var(--text-muted)' }}>
                  Role Type
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'mentor', label: 'Mentor', icon: Users, desc: 'Batch management' },
                    { value: 'admin', label: 'Admin', icon: ShieldCheck, desc: 'Full access' },
                  ].map(opt => {
                    const Icon = opt.icon;
                    const isSelected = role === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setRole(opt.value as 'mentor' | 'admin')}
                        className="flex flex-col items-center gap-1.5 py-4 rounded-xl cursor-pointer transition-all duration-200"
                        style={{
                          background: isSelected ? 'var(--brand-gradient-soft)' : 'var(--surface-2)',
                          border: isSelected ? '2px solid var(--brand-primary)' : '2px solid var(--surface-border)',
                          color: isSelected ? 'var(--brand-primary)' : 'var(--text-muted)',
                        }}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-xs font-bold">{opt.label}</span>
                        <span className="text-[9px] opacity-70">{opt.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || success}
                className="btn-primary w-full flex items-center justify-center gap-2 mt-1 disabled:opacity-60"
                style={{ padding: '12px 20px', borderRadius: '12px' }}
              >
                {loading ? (
                  <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 text-center border-t" style={{ borderColor: 'var(--surface-border)' }}>
              <p className="text-xs" style={{ color: 'var(--text-faint)' }}>
                Already have an account?{' '}
                <Link href="/login" className="font-bold transition-colors hover:underline" style={{ color: 'var(--brand-primary)' }}>
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
