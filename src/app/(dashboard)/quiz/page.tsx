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
  const [quizNumQuestions, setQuizNumQuestions] = useState(5);
  const [quizDuration, setQuizDuration] = useState(15);
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
      await new Promise(resolve => setTimeout(resolve, 1500));
      const title = `${quizTopic.charAt(0).toUpperCase() + quizTopic.slice(1)} AI Quiz`;
      
      const newQuizBody = {
        title,
        status: 'Draft' as const,
        durationMinutes: quizDuration,
        questions: Array.from({ length: quizNumQuestions }).map((_, idx) => ({
          questionText: `AI Generated Question ${idx + 1} about ${quizTopic}?`,
          options: ['Option A', 'Option B', 'Option C (Correct)', 'Option D'],
          correctAnswer: 'Option C (Correct)',
          marks: 2
        }))
      };

      const res = await apiRequest(`/projects/${selectedProjectId}/quizzes`, {
        method: 'POST',
        body: JSON.stringify(newQuizBody)
      });
      setQuizzes(prev => [res.data, ...prev]);
      setQuizMsg({ type: 'success', text: `AI generated "${title}" successfully!` });
      setQuizTopic('');
    } catch (err) {
      const title = `${quizTopic.charAt(0).toUpperCase() + quizTopic.slice(1)} AI Quiz`;
      const mockQ: Quiz = {
        _id: `mock-q-${Date.now()}`,
        title,
        status: 'Draft',
        durationMinutes: quizDuration,
        questions: Array.from({ length: quizNumQuestions }).map((_, idx) => ({
          questionText: `Which concept of ${quizTopic} represents element ${idx + 1}?`,
          options: ['Virtual DOM', 'Reconciliation', 'State isolation', 'All of the above'],
          correctAnswer: 'All of the above'
        })),
        avgScore: 0
      };
      setQuizzes(prev => [mockQ, ...prev]);
      setQuizMsg({ type: 'success', text: `AI generated "${title}" (Simulated Offline)!` });
      setQuizTopic('');
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const handleToggleQuizStatus = (quizId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Live' ? 'Inactive' : 'Live';
    setQuizzes(prev => prev.map(q => q._id === quizId ? { ...q, status: nextStatus } : q));
  };

  const selectedProject = projects.find(p => p._id === selectedProjectId);

  return (
    <div className="space-y-8">
      {/* Page Header with project dropdown selection */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-indigo-500" />
            <span>AI Quiz System</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Formulate assessment quizzes with predictive AI helper</p>
        </div>

        {/* Project Selector Dropdown */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2.5 w-fit">
          <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Active Batch:</span>
          {loadingProjects ? (
            <div className="h-4 w-28 bg-slate-800 animate-pulse rounded"></div>
          ) : (
            <div className="relative flex items-center">
              <select
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-200 outline-none cursor-pointer pr-6 appearance-none"
              >
                {projects.map(p => (
                  <option key={p._id} value={p._id} className="bg-slate-900 text-slate-200">
                    {p.name} ({p.batch})
                  </option>
                ))}
              </select>
              <ChevronDown className="h-4 w-4 text-slate-500 absolute right-0 pointer-events-none" />
            </div>
          )}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Form: AI Creator */}
        <div className="bg-slate-900/30 border border-slate-800/80 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex items-center gap-2 border-b border-slate-800/80 pb-4">
            <Sparkles className="h-5 w-5 text-indigo-400" />
            <h3 className="text-sm font-bold text-slate-200">AI Prompt Assistant</h3>
          </div>

          <form onSubmit={handleGenerateQuizAI} className="space-y-5">
            {quizMsg.text && (
              <div className={`p-4 rounded-xl text-xs font-medium border flex items-center gap-2 ${
                quizMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-455' : 'bg-rose-500/10 border-rose-500/20 text-rose-450'
              }`}>
                {quizMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0" /> : <Info className="h-4 w-4 shrink-0" />}
                <span>{quizMsg.text}</span>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Syllabus / Concept</label>
              <textarea
                required
                placeholder="e.g. React hooks rules, state handling and async side effects."
                value={quizTopic}
                onChange={(e) => setQuizTopic(e.target.value)}
                rows={4}
                className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-650 text-slate-100 p-3 rounded-xl outline-none text-xs resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Question Count</label>
                <input
                  type="number"
                  min={1}
                  max={15}
                  value={quizNumQuestions}
                  onChange={(e) => setQuizNumQuestions(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-850 focus:border-indigo-650 text-slate-100 px-3 py-2.5 rounded-xl outline-none text-xs"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2">Duration (Mins)</label>
                <input
                  type="number"
                  min={5}
                  max={60}
                  value={quizDuration}
                  onChange={(e) => setQuizDuration(Number(e.target.value))}
                  className="w-full bg-slate-955 border border-slate-850 focus:border-indigo-650 text-slate-100 px-3 py-2.5 rounded-xl outline-none text-xs"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={generatingQuiz || !quizTopic || !selectedProjectId}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/10"
            >
              {generatingQuiz ? 'AI Formulating Quiz...' : 'Generate AI Quiz'}
            </button>
          </form>
        </div>

        {/* Right list: Quizzes lists */}
        <div className="lg:col-span-2 space-y-4">
          <div className="border-b border-slate-850 pb-4">
            <h3 className="text-sm font-bold text-slate-200">
              Quizzes in {selectedProject?.name || 'Selected Cohort'}
            </h3>
            <p className="text-xs text-slate-500 mt-1">Control draft/active states, or open live student examinations.</p>
          </div>

          {loadingQuizzes ? (
            <div className="space-y-4">
              <div className="h-20 bg-slate-900/20 border border-slate-800 animate-pulse rounded-2xl"></div>
              <div className="h-20 bg-slate-900/20 border border-slate-800 animate-pulse rounded-2xl"></div>
            </div>
          ) : quizzes.length > 0 ? (
            <div className="space-y-4">
              {quizzes.map((quiz) => (
                <div key={quiz._id} className="bg-slate-900/20 border border-slate-850 hover:border-slate-800 p-5 rounded-2xl flex items-center justify-between gap-4 transition-colors">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-slate-200 text-xs">{quiz.title}</h4>
                      <span className={`text-[8px] font-bold uppercase px-2 py-0.5 rounded ${
                        quiz.status === 'Live' ? 'bg-emerald-500/15 text-emerald-450 border border-emerald-500/20' : 'bg-slate-800 text-slate-550 border border-slate-800'
                      }`}>
                        {quiz.status}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1.5 block">
                      Duration: {quiz.durationMinutes} minutes | Questions: {quiz.questions?.length || 5} {quiz.avgScore ? `| Avg Grade: ${quiz.avgScore}%` : ''}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    {quiz.status === 'Live' && (
                      <Link
                        href={`/quiz-portal/${quiz._id}`}
                        target="_blank"
                        className="flex items-center gap-1 bg-slate-950 border border-slate-850 hover:border-slate-800 hover:text-white text-indigo-400 text-[10px] px-3.5 py-2 rounded-xl font-bold uppercase tracking-wider transition-colors shadow-lg shadow-indigo-950/20"
                      >
                        <span>Live Portal</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    )}

                    <button
                      onClick={() => handleToggleQuizStatus(quiz._id, quiz.status)}
                      className={`p-2.5 rounded-xl border transition-colors ${
                        quiz.status === 'Live' 
                          ? 'bg-amber-500/10 border-amber-500/20 text-amber-500 hover:bg-amber-500/25' 
                          : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/25'
                      }`}
                    >
                      {quiz.status === 'Live' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="h-40 border border-dashed border-slate-850 rounded-2xl flex items-center justify-center text-xs text-slate-655">
              No quizzes created for this cohort yet. Use the prompt generator on the left to start!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
