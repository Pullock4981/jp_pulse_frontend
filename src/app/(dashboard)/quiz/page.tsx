'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/utils/api';
import Link from 'next/link';
import { 
  Sparkles,
  BookOpen,
  Pause,
  Play,
  ExternalLink,
  ChevronDown,
  CheckCircle2,
  Info
} from 'lucide-react';

interface Project {
  _id: string;
  name: string;
  batch: string;
}

interface Quiz {
  _id: string;
  title: string;
  status: 'Draft' | 'Live' | 'Inactive';
  durationMinutes: number;
  questions: any[];
  avgScore?: number;
}

export default function GlobalQuizDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);

  // Form states
  const [quizTopic, setQuizTopic] = useState('');
  const [quizTitle, setQuizTitle] = useState('');
  const [quizNumQuestions, setQuizNumQuestions] = useState<number | ''>(5);
  const [quizDuration, setQuizDuration] = useState<number | ''>(15);
  const [quizMarksPerQ, setQuizMarksPerQ] = useState<number | ''>(2);
  const [quizDifficulty, setQuizDifficulty] = useState('Moderate');
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [quizMsg, setQuizMsg] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchQuizzesForProject(selectedProjectId);
    }
  }, [selectedProjectId]);

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      const res = await apiRequest('/projects');
      const data = res.data || [];
      setProjects(data);
      if (data.length > 0) {
        setSelectedProjectId(data[0]._id);
      } else {
        // Mock default values if empty database
        loadMockProjects();
      }
    } catch (err) {
      loadMockProjects();
    } finally {
      setLoadingProjects(false);
    }
  };

  const loadMockProjects = () => {
    const mockProjs = [
      { _id: 'proj-1', name: 'Albatross Boot-camp', batch: 'Batch 4' },
      { _id: 'proj-2', name: 'Falcon Engineering Program', batch: 'Batch 1' }
    ];
    setProjects(mockProjs);
    setSelectedProjectId(mockProjs[0]._id);
  };

  const fetchQuizzesForProject = async (pId: string) => {
    try {
      setLoadingQuizzes(true);
      const res = await apiRequest(`/projects/${pId}/quizzes`);
      setQuizzes(res.data || []);
    } catch (err) {
      // Load offline simulator quizzes
      loadMockQuizzes(pId);
    } finally {
      setLoadingQuizzes(false);
    }
  };

  const loadMockQuizzes = (pId: string) => {
    if (pId === 'proj-1' || pId.startsWith('mock')) {
      setQuizzes([
        {
          _id: 'quiz-1',
          title: 'React Fundamentals Quiz',
          status: 'Live',
          durationMinutes: 15,
          questions: [
            { questionText: 'What is JSX?', options: ['JavaScript XML', 'JSON XML', 'Java Syntax Extension'], correctAnswer: 'JavaScript XML' }
          ],
          avgScore: 78.5
        },
        {
          _id: 'quiz-2',
          title: 'JavaScript Async Operations',
          status: 'Draft',
          durationMinutes: 20,
          questions: [],
          avgScore: 0
        }
      ]);
    } else {
      setQuizzes([
        {
          _id: 'quiz-3',
          title: 'Node.js Basic Routing Roster',
          status: 'Live',
          durationMinutes: 10,
          questions: [],
          avgScore: 82.0
        }
      ]);
    }
  };

  // AI Quiz Creator prompt submit
  const handleGenerateQuizAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTopic || !selectedProjectId) return;

    setGeneratingQuiz(true);
    setQuizMsg({ type: '', text: '' });

    try {
      // 1. Fetch AI generated questions from our new endpoint
      const aiRes = await apiRequest('/ai/generate-quiz', {
        method: 'POST',
        body: JSON.stringify({
          topic: quizTopic,
          numQuestions: quizNumQuestions,
          marksPerQuestion: quizMarksPerQ,
          difficulty: quizDifficulty
        })
      });

      const generatedQuestions = aiRes.data || [];

      // 2. Format and send to project quizzes endpoint
      const title = quizTitle || `${quizTopic.charAt(0).toUpperCase() + quizTopic.slice(1)} AI Quiz (${quizDifficulty})`;
      const newQuizBody = {
        title,
        status: 'Draft' as const,
        durationMinutes: Number(quizDuration) || 0,
        questions: generatedQuestions.map((q: any) => ({
          questionText: q.questionText,
          options: q.options,
          correctAnswer: q.correctAnswer,
          marks: q.marks || (Number(quizMarksPerQ) || 2)
        }))
      };

      const res = await apiRequest(`/projects/${selectedProjectId}/quizzes`, {
        method: 'POST',
        body: JSON.stringify(newQuizBody)
      });
      setQuizzes(prev => [res.data, ...prev]);
      setQuizMsg({ type: 'success', text: `AI generated "${title}" successfully!` });
      setQuizTopic('');
      setQuizTitle('');
    } catch (err) {
      const title = quizTitle || `${quizTopic.charAt(0).toUpperCase() + quizTopic.slice(1)} AI Quiz`;
      const mockQ: Quiz = {
        _id: `mock-q-${Date.now()}`,
        title,
        status: 'Draft',
        durationMinutes: Number(quizDuration) || 0,
        questions: Array.from({ length: Number(quizNumQuestions) || 0 }).map((_, idx) => ({
          questionText: `Which concept of ${quizTopic} represents element ${idx + 1}?`,
          options: ['Virtual DOM', 'Reconciliation', 'State isolation', 'All of the above'],
          correctAnswer: 'All of the above'
        })),
        avgScore: 0
      };
      setQuizzes(prev => [mockQ, ...prev]);
      setQuizMsg({ type: 'success', text: `AI generated "${title}" (Simulated Offline)!` });
      setQuizTopic('');
      setQuizTitle('');
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const handleToggleQuizStatus = async (quizId: string, currentStatus: Quiz['status']) => {
    const nextStatus = currentStatus === 'Live' ? 'Inactive' : 'Live';
    // Optimistic UI update
    setQuizzes(prev => prev.map(q => q._id === quizId ? { ...q, status: nextStatus } : q));
    
    try {
      await apiRequest(`/projects/${selectedProjectId}/quizzes/${quizId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus })
      });
    } catch (err) {
      // Revert on error
      setQuizzes(prev => prev.map(q => q._id === quizId ? { ...q, status: currentStatus } : q));
    }
  };

  const selectedProject = projects.find(p => p._id === selectedProjectId);

  return (
    <div className="space-y-8 relative">
      {/* Ambient Background Blobs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-20 left-10 w-72 h-72 bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* Page Header with project dropdown selection */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <div className="h-7 w-7 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #d946ef)' }}>
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>
              Assessments
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight gradient-text">AI Quiz System</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Formulate assessment quizzes with predictive AI helper</p>
        </div>

        {/* Project Selector Dropdown */}
        <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl w-fit"
          style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)' }}>
          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>Active Batch:</span>
          {loadingProjects ? (
            <div className="h-4 w-28 rounded skeleton" />
          ) : (
            <div className="relative flex items-center">
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="text-xs font-bold outline-none cursor-pointer pr-6 appearance-none"
                style={{ background: 'transparent', color: 'var(--foreground)' }}
              >
                {projects.map(p => (
                  <option key={p._id} value={p._id} style={{ background: 'var(--surface-1)', color: 'var(--foreground)' }}>
                    {p.name} ({p.batch})
                  </option>
                ))}
              </select>
              <ChevronDown className="h-4 w-4 absolute right-0 pointer-events-none" style={{ color: 'var(--text-faint)' }} />
            </div>
          )}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form: AI Creator */}
        <div className="glass-card p-6 space-y-6 relative overflow-hidden">
          <div className="flex items-center gap-2 border-b pb-4" style={{ borderColor: 'var(--surface-border)' }}>
            <Sparkles className="h-5 w-5" style={{ color: 'var(--brand-primary)' }} />
            <h3 className="text-sm font-black uppercase tracking-widest" style={{ color: 'var(--foreground)' }}>AI Prompt Assistant</h3>
          </div>

          <form onSubmit={handleGenerateQuizAI} className="space-y-5">
            {quizMsg.text && (
              <div className={`p-4 rounded-xl text-xs font-semibold border flex items-center gap-2 ${
                quizMsg.type === 'success'
                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                  : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
              }`}>
                {quizMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <Info className="h-4 w-4 shrink-0" />}
                <span>{quizMsg.text}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'var(--brand-primary)' }}>Target Batch / Project</label>
                <div className="relative">
                  <select
                    value={selectedProjectId}
                    onChange={(e) => setSelectedProjectId(e.target.value)}
                    className="input-field cursor-pointer appearance-none bg-indigo-500/5 border-indigo-500/20"
                    style={{ colorScheme: 'dark' }}
                  >
                    {projects.map(p => (
                      <option key={p._id} value={p._id} style={{ background: 'var(--surface-1)', color: 'var(--foreground)' }}>
                        {p.name} ({p.batch})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="h-4 w-4 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: 'var(--brand-primary)' }} />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Quiz Title / Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. React JS Final Exam"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  className="input-field mb-4"
                />

                <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Syllabus / Concept</label>
                <textarea
                  required
                  placeholder="e.g. React hooks rules, state handling and async side effects."
                  value={quizTopic}
                  onChange={(e) => setQuizTopic(e.target.value)}
                  rows={3}
                  className="input-field resize-none focus:border-indigo-500/50 transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Question Count</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={quizNumQuestions}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').replace(/^0+/, '');
                      setQuizNumQuestions(val === '' ? '' : parseInt(val, 10));
                    }}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Duration (Mins)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={quizDuration}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').replace(/^0+/, '');
                      setQuizDuration(val === '' ? '' : parseInt(val, 10));
                    }}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Marks / Question</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={quizMarksPerQ}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').replace(/^0+/, '');
                      setQuizMarksPerQ(val === '' ? '' : parseInt(val, 10));
                    }}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-widest mb-1.5" style={{ color: 'var(--text-muted)' }}>Difficulty</label>
                  <div className="relative">
                    <select
                      value={quizDifficulty}
                      onChange={(e) => setQuizDifficulty(e.target.value)}
                      className="input-field cursor-pointer appearance-none"
                      style={{ colorScheme: 'dark' }}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Easy to Moderate">Easy to Moderate</option>
                      <option value="Moderate">Moderate</option>
                      <option value="Moderate to Hard">Moderate to Hard</option>
                      <option value="Hard">Hard</option>
                    </select>
                    <ChevronDown className="h-4 w-4 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500" />
                  </div>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={generatingQuiz || !quizTopic || !selectedProjectId}
              className="btn-primary w-full cursor-pointer flex items-center justify-center gap-2"
              style={{ padding: '12px 20px', borderRadius: '12px' }}
            >
              {generatingQuiz ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
              <span>{generatingQuiz ? 'AI Formulating Quiz...' : 'Generate AI Quiz'}</span>
            </button>
          </form>
        </div>

        {/* Right list: Quizzes lists */}
        <div className="lg:col-span-2 space-y-4">
          <div className="border-b pb-4" style={{ borderColor: 'var(--surface-border)' }}>
            <h3 className="text-sm font-bold" style={{ color: 'var(--foreground)' }}>
              Quizzes in {selectedProject?.name || 'Selected Cohort'}
            </h3>
            <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Control draft/active states, or open live student examinations.</p>
          </div>

          {loadingQuizzes ? (
            <div className="space-y-4">
              <div className="h-20 skeleton rounded-2xl" />
              <div className="h-20 skeleton rounded-2xl" />
            </div>
          ) : quizzes.length > 0 ? (
            <div className="space-y-4">
              {quizzes.map((quiz) => (
                <div key={quiz._id}
                  className="glass-card p-5 flex items-center justify-between gap-4 transition-all duration-300 hover:-translate-y-1">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-xs" style={{ color: 'var(--foreground)' }}>{quiz.title}</h4>
                      <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded"
                        style={{
                          background: quiz.status === 'Live' ? 'rgba(16,185,129,0.1)' : 'var(--surface-2)',
                          color: quiz.status === 'Live' ? '#10b981' : 'var(--text-muted)',
                          border: `1px solid ${quiz.status === 'Live' ? 'rgba(16,185,129,0.2)' : 'var(--surface-border)'}`
                        }}>
                        {quiz.status}
                      </span>
                    </div>
                    <span className="text-[10px] mt-1.5 block" style={{ color: 'var(--text-faint)' }}>
                      Duration: {quiz.durationMinutes} minutes | Questions: {quiz.questions?.length || 5} {quiz.avgScore ? `| Avg Grade: ${quiz.avgScore}%` : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {quiz.status === 'Live' && (
                      <Link
                        href={`/quiz-portal/${quiz._id}?projectId=${selectedProjectId}`}
                        target="_blank"
                        className="flex items-center gap-1 text-[10px] px-3.5 py-2 rounded-xl font-bold uppercase tracking-wider transition-all"
                        style={{
                          background: 'var(--brand-gradient-soft)',
                          color: 'var(--brand-primary)',
                          border: '1px solid var(--surface-border)'
                        }}
                        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'linear-gradient(135deg, #7c3aed, #d946ef)'; (e.currentTarget as HTMLElement).style.color = 'white'; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'var(--brand-gradient-soft)'; (e.currentTarget as HTMLElement).style.color = 'var(--brand-primary)'; }}
                      >
                        <span>Live Portal</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    )}

                    <Link
                      href={`/quiz/${quiz._id}?projectId=${selectedProjectId}`}
                      className="p-2.5 rounded-xl border transition-colors cursor-pointer flex items-center justify-center bg-blue-500/10 text-blue-600 border-blue-500/20 hover:bg-blue-500/20"
                      title="View Submissions"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    </Link>

                    <button
                      onClick={() => handleToggleQuizStatus(quiz._id, quiz.status)}
                      className="p-2.5 rounded-xl border transition-colors cursor-pointer"
                      style={{
                        background: quiz.status === 'Live' ? 'rgba(245,158,11,0.06)' : 'rgba(16,185,129,0.06)',
                        borderColor: quiz.status === 'Live' ? 'rgba(245,158,11,0.2)' : 'rgba(16,185,129,0.2)',
                        color: quiz.status === 'Live' ? '#f59e0b' : '#10b981'
                      }}
                    >
                      {quiz.status === 'Live' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-40 border border-dashed rounded-2xl flex items-center justify-center text-xs text-center p-6"
              style={{ borderColor: 'var(--surface-border)', color: 'var(--text-faint)' }}>
              No quizzes created for this cohort yet. Use the prompt generator on the left to start!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
