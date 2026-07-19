'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import { apiRequest } from '@/utils/api';
import Link from 'next/link';
import { 
  Sparkles, Search, Bell, User, ClipboardList, Users, TrendingUp, Radio,
  Filter, Download, ChevronLeft, ChevronRight, X, AlertTriangle, CheckCircle2,
  Bookmark, Clock, Info, Copy, ExternalLink
} from 'lucide-react';

interface Project {
  _id: string;
  name: string;
  batch: string;
}

interface Quiz {
  _id: string;
  title: string;
  status: 'Live' | 'Inactive' | 'Draft';
  durationMinutes: number;
  questions: any[];
  avgScore?: number;
  targetRole?: string;
  ageText?: string;
}

export default function GlobalQuizDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingQuizzes, setLoadingQuizzes] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // Form states
  const [quizTopic, setQuizTopic] = useState('React.js Advanced');
  const [quizNumQuestions, setQuizNumQuestions] = useState<number>(20);
  const [quizDuration, setQuizDuration] = useState<number>(30);
  const [quizMarks, setQuizMarks] = useState<number>(1);
  const [quizDifficulty, setQuizDifficulty] = useState('Intermediate');
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [quizMsg, setQuizMsg] = useState({ type: '', text: '' });

  // Submissions state
  const [selectedQuizForSubmissions, setSelectedQuizForSubmissions] = useState<Quiz | null>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);

  // Student Answersheet Details State
  const [selectedStudentSubmission, setSelectedStudentSubmission] = useState<any>(null);

  // Mock stats
  const stats = {
    totalQuizzes: 50,
    quizzesAttempted: '1,200',
    averageScore: '75%',
    liveQuizzes: 10
  };

  useEffect(() => {
    setMounted(true);
    fetchProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      fetchQuizzesForProject(selectedProjectId);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    if (selectedProjectId) {
      fetchQuizzesForProject(selectedProjectId);
    }
  }, [selectedProjectId]);

  const fetchProjects = async () => {
    try {
      const res = await apiRequest('/projects');
      const data = res.data || [];
      setProjects(data);
      if (data.length > 0) {
        setSelectedProjectId(data[0]._id);
      }
    } catch {
      setProjects([]);
    }
  };

  const fetchQuizzesForProject = async (pId: string) => {
    try {
      setLoadingQuizzes(true);
      const res = await apiRequest(`/projects/${pId}/quizzes`);
      setQuizzes(res.data || []);
    } catch {
      setQuizzes([]);
    } finally {
      setLoadingQuizzes(false);
    }
  };

  const fetchSubmissions = async (quizId: string) => {
    try {
      setLoadingSubmissions(true);
      const res = await apiRequest(`/projects/${selectedProjectId}/quizzes/${quizId}/submissions`);
      setSubmissions(res.data || []);
    } catch {
      setSubmissions([]);
    } finally {
      setLoadingSubmissions(false);
    }
  };

  const handleGenerateQuizAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTopic || !selectedProjectId) return;

    setGeneratingQuiz(true);
    setQuizMsg({ type: '', text: '' });

    try {
      const generatedTitle = `${quizTopic} ${quizDifficulty} Quiz`;
      const aiRes = await apiRequest('/ai/generate-quiz', {
        method: 'POST',
        body: JSON.stringify({
          topic: quizTopic,
          numQuestions: quizNumQuestions,
          difficulty: quizDifficulty
        })
      });

      if (!aiRes.questions || aiRes.questions.length === 0) {
        throw new Error('AI failed to generate any questions for this topic.');
      }

      await apiRequest(`/projects/${selectedProjectId}/quizzes`, {
        method: 'POST',
        body: JSON.stringify({
          title: generatedTitle,
          status: 'Draft',
          durationMinutes: quizDuration,
          questions: aiRes.questions
        })
      });

      setQuizMsg({ type: 'success', text: `Successfully generated ${aiRes.questions.length} questions and saved as Draft!` });
      fetchQuizzesForProject(selectedProjectId);
    } catch (err: any) {
      // Offline fallback for simulator
      const dummyQuestions = Array.from({ length: quizNumQuestions }).map((_, i) => ({
        questionText: `Sample Question ${i + 1} regarding ${quizTopic}`,
        options: ['Choice A', 'Choice B', 'Choice C', 'Choice D'],
        correctAnswer: 'Choice A'
      }));

      try {
        await apiRequest(`/projects/${selectedProjectId}/quizzes`, {
          method: 'POST',
          body: JSON.stringify({
            title: `${quizTopic} Quiz`,
            status: 'Draft',
            durationMinutes: quizDuration,
            questions: dummyQuestions
          })
        });
        setQuizMsg({ type: 'success', text: 'Quiz generated successfully (Simulation Mode)!' });
        fetchQuizzesForProject(selectedProjectId);
      } catch (innerErr: any) {
        setQuizMsg({ type: 'error', text: innerErr.message || 'Failed to save generated quiz.' });
      }
    } finally {
      setGeneratingQuiz(false);
    }
  };

  const handleToggleStatus = async (qId: string, current: string) => {
    const nextStatus = current === 'Live' ? 'Inactive' : 'Live';
    try {
      await apiRequest(`/projects/${selectedProjectId}/quizzes/${qId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: nextStatus })
      });
      fetchQuizzesForProject(selectedProjectId);
    } catch {
      setQuizzes(quizzes.map(q => q._id === qId ? { ...q, status: nextStatus as any } : q));
    }
  };

  const filteredQuizzes = quizzes.filter(q => 
    q.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (q.targetRole && q.targetRole.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const copyQuizLink = (quizId: string) => {
    const link = `${window.location.origin}/quiz-portal/${quizId}?projectId=${selectedProjectId}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(quizId);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  // Generate recent submissions across all quizzes for the project
  // In a real app this would be a separate API endpoint, but we simulate it by gathering from loaded quizzes
  const recentSubmissions = submissions.slice(0, 5);

  return (
    <div className="space-y-6 relative z-10 page-enter" style={{ fontFamily: 'Inter, sans-serif' }}>
      
      {/* ── Top Bar ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 
          className="text-xl font-black uppercase tracking-widest leading-tight" 
          style={{ color: '#7C3AED', letterSpacing: '0.05em' }}
        >
          ASSESSMENTS<br/>WORKSPACE
        </h1>

        <div className="flex flex-1 items-center justify-end gap-4 flex-wrap">
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-700 font-bold focus:outline-none focus:ring-2 focus:ring-purple-200"
          >
            {projects.map(p => (
              <option key={p._id} value={p._id}>{p.name} - {p.batch}</option>
            ))}
          </select>

          <div className="relative w-64 hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search assessments..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-full border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
            />
          </div>

          <button className="relative p-2 text-gray-400 hover:text-gray-600">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
          </button>
          
          <button className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500">
            <User className="h-4 w-4" />
          </button>

          <button 
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white shadow-md hover:opacity-90 transition-opacity cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #A855F7, #7C3AED)' }}
          >
            <Sparkles className="h-4 w-4" />
            Create<br/>AI Quiz
          </button>
        </div>
      </div>

      {/* ── Stats Row ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'TOTAL QUIZZES', value: quizzes.length, icon: ClipboardList, color: 'text-purple-500', bg: 'bg-purple-100', border: 'border-purple-600' },
          { label: 'QUIZZES ATTEMPTED', value: stats.quizzesAttempted, icon: Users, color: 'text-fuchsia-500', bg: 'bg-fuchsia-100', border: 'border-fuchsia-500' },
          { label: 'AVERAGE SCORE', value: stats.averageScore, icon: TrendingUp, color: 'text-blue-500', bg: 'bg-blue-100', border: 'border-blue-500' },
          { label: 'LIVE QUIZZES', value: quizzes.filter(q => q.status === 'Live').length, icon: Radio, color: 'text-emerald-500', bg: 'bg-emerald-100', border: 'border-emerald-500' },
        ].map((stat, i) => (
          <div key={i} className={`bg-white rounded-2xl p-5 shadow-sm border-2 ${stat.border} flex items-center justify-between`}>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">{stat.label}</p>
              <p className="text-2xl font-black text-gray-900">{stat.value}</p>
            </div>
            <div className={`h-10 w-10 rounded-full ${stat.bg} flex items-center justify-center`}>
              <stat.icon className={`h-5 w-5 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Content Grid ──────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: AI Quiz Creator */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-10 w-10 rounded-xl bg-purple-50 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-purple-600" />
            </div>
            <h2 className="text-lg font-black text-gray-900">AI Quiz Creator</h2>
          </div>

          <form onSubmit={handleGenerateQuizAI} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">QUIZ TOPIC</label>
              <select
                value={quizTopic}
                onChange={e => setQuizTopic(e.target.value)}
                className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-800 font-bold focus:outline-none focus:ring-2 focus:ring-purple-200"
              >
                <option value="React.js Advanced">React.js Advanced</option>
                <option value="Next.js SSR Structures">Next.js SSR Structures</option>
                <option value="Node.js Express REST API">Node.js Express REST API</option>
                <option value="MongoDB Mongoose Pipelines">MongoDB Mongoose Pipelines</option>
                <option value="Data Structures and Algorithms">DSA Basic Algorithms</option>
                <option value="System Design Basics">System Design Basics</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">QUESTIONS</label>
                <input
                  type="number"
                  value={quizNumQuestions}
                  onChange={e => setQuizNumQuestions(Number(e.target.value))}
                  className="w-full bg-blue-50/30 border border-blue-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">DURATION (MINS)</label>
                <input
                  type="number"
                  value={quizDuration}
                  onChange={e => setQuizDuration(Number(e.target.value))}
                  className="w-full bg-blue-50/30 border border-blue-100 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-800 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">MARKS PER Q</label>
                <input
                  type="number"
                  value={quizMarks}
                  onChange={e => setQuizMarks(Number(e.target.value))}
                  className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-800 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1.5">DIFFICULTY</label>
                <select
                  value={quizDifficulty}
                  onChange={e => setQuizDifficulty(e.target.value)}
                  className="w-full bg-gray-50/50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-800 focus:outline-none"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="pt-4 space-y-3">
              <button
                type="submit"
                disabled={generatingQuiz}
                className="w-full py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 hover:opacity-90 transition-opacity cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #A855F7, #df4ff0)' }}
              >
                <Sparkles className="h-4 w-4" />
                {generatingQuiz ? 'GENERATING...' : 'Generate AI Quiz'}
              </button>
              <p className="text-[10px] text-center text-gray-400 font-medium italic flex items-center justify-center gap-1">
                <Sparkles className="h-3 w-3" /> AI will curate questions based on topic depth
              </p>
            </div>
            {quizMsg.text && (
              <p className={`text-xs text-center font-bold mt-2 ${quizMsg.type === 'success' ? 'text-emerald-600' : 'text-rose-600'}`}>
                {quizMsg.text}
              </p>
            )}
          </form>
        </div>

        {/* Right: Current Quizzes List */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 lg:col-span-2 flex flex-col">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-black text-gray-900">Current Quizzes List</h2>
            <Link href="#" className="text-xs font-bold text-purple-600 hover:text-purple-800 flex items-center gap-1">
              View Archive <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left">
              <thead className="text-[9px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100">
                <tr>
                  <th className="pb-3 px-2">QUIZ TITLE</th>
                  <th className="pb-3 px-2">QUESTIONS</th>
                  <th className="pb-3 px-2">AVG SCORE</th>
                  <th className="pb-3 px-2">STATUS</th>
                  <th className="pb-3 px-2 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loadingQuizzes ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400">Loading quizzes...</td>
                  </tr>
                ) : filteredQuizzes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-gray-400">No quizzes found.</td>
                  </tr>
                ) : filteredQuizzes.map((quiz) => (
                  <tr key={quiz._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-2">
                      <h4 className="text-sm font-bold text-gray-900 mb-1 leading-tight max-w-[180px]">{quiz.title}</h4>
                      <span className="inline-block px-2 py-0.5 rounded-full bg-purple-600 text-white text-[9px] font-bold">
                        {quiz.targetRole || 'Software Engineer'}
                      </span>
                    </td>
                    <td className="py-4 px-2">
                      <p className="text-xs font-semibold text-gray-700">{quiz.questions?.length || 0} Qs /</p>
                      <p className="text-xs font-semibold text-gray-700">{quiz.durationMinutes} min</p>
                    </td>
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-2">
                        <div className="h-1 w-12 bg-gray-100 rounded-full overflow-hidden">
                          <div 
                            className="h-full rounded-full" 
                            style={{ 
                              width: `${quiz.avgScore || 0}%`, 
                              background: (quiz.avgScore || 0) > 80 ? '#2dd4bf' : (quiz.avgScore || 0) > 60 ? '#c084fc' : '#f43f5e'
                            }} 
                          />
                        </div>
                        <span className="text-xs font-bold text-gray-900">{quiz.avgScore || 0}%</span>
                      </div>
                    </td>
                    <td className="py-4 px-2">
                      <button 
                        onClick={() => handleToggleStatus(quiz._id, quiz.status)}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <div className={`w-8 h-4 rounded-full flex items-center p-0.5 ${quiz.status === 'Live' ? 'bg-emerald-400' : 'bg-gray-200'}`}>
                          <div className={`h-3 w-3 bg-white rounded-full transition-transform ${quiz.status === 'Live' ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                        <span className={`text-xs font-bold ${quiz.status === 'Live' ? 'text-emerald-500' : 'text-gray-400'}`}>
                          {quiz.status}
                        </span>
                      </button>
                    </td>
                    <td className="py-4 px-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {quiz.status === 'Live' && (
                          <button 
                            onClick={() => copyQuizLink(quiz._id)}
                            className="text-[10px] font-bold text-gray-500 bg-gray-50 border border-gray-200 hover:bg-gray-100 px-2 py-1.5 rounded-lg transition-colors cursor-pointer flex flex-col items-center justify-center min-w-[70px]"
                            title="Copy Live Quiz Link"
                          >
                            {copiedLink === quiz._id ? <CheckCircle2 className="h-4 w-4 text-emerald-500 mb-0.5" /> : <Copy className="h-4 w-4 mb-0.5" />}
                            {copiedLink === quiz._id ? 'Copied!' : 'Copy Link'}
                          </button>
                        )}
                        <button 
                          onClick={() => router.push(`/quiz/${quiz._id}?projectId=${selectedProjectId}`)}
                          className="text-xs font-bold text-purple-600 hover:bg-purple-50 px-2 py-1.5 rounded-lg transition-colors cursor-pointer text-center"
                        >
                          View<br/>Answersheet
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Recent Quiz Submissions ────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
          <div>
            <h2 className="text-lg font-black text-gray-900">Recent Quiz Submissions</h2>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Real-time update of student performance metrics</p>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50">
              <Filter className="h-3.5 w-3.5" /> Filter
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-100">
              <Download className="h-3.5 w-3.5" /> Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="text-[9px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 bg-gray-50/50">
              <tr>
                <th className="py-3 px-4">STUDENT</th>
                <th className="py-3 px-4">TIMESTAMP</th>
                <th className="py-3 px-4">QUIZ SCORE</th>
                <th className="py-3 px-4">RESULT</th>
                <th className="py-3 px-4 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentSubmissions.map((sub: any) => (
                <tr key={sub._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold text-xs">
                        {sub.student?.name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-gray-900">{sub.student?.name}</h4>
                        <p className="text-[10px] text-gray-500">{sub.student?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-xs font-medium text-gray-600">
                    {new Date(sub.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm font-black text-purple-700">{sub.score} / {sub.totalQuestions || 20}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest uppercase ${
                      !sub.cheated ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                    }`}>
                      {!sub.cheated ? 'PASSED' : 'FLAGGED'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button 
                      onClick={() => setSelectedStudentSubmission(sub)}
                      className="text-xs font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-xl transition-colors cursor-pointer"
                    >
                      View Answersheet
                    </button>
                  </td>
                </tr>
              ))}
              {recentSubmissions.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-400">Select a quiz to view recent submissions.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Modals ────────────────────────────────────────── */}

      {/* Detailed Student Answersheet Modal (Based on Screenshot) */}
      {mounted && selectedStudentSubmission && createPortal(
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 sm:p-6 bg-slate-950/40 backdrop-blur-sm" style={{ fontFamily: 'Inter, sans-serif' }}>
          <div className="bg-[#F8F9FE] rounded-[32px] shadow-2xl w-full max-w-6xl h-[90vh] relative overflow-hidden flex flex-col md:flex-row">
            
            {/* Left Panel */}
            <div className="w-full md:w-80 bg-transparent p-6 flex flex-col gap-6 overflow-y-auto shrink-0 hidden md:flex">
              {/* User Card */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-purple-100 border-2 border-purple-200 flex items-center justify-center text-purple-700 font-bold text-lg shrink-0">
                  {selectedStudentSubmission.student?.name?.charAt(0) || 'A'}
                </div>
                <div>
                  <h3 className="text-base font-black text-gray-900">{selectedStudentSubmission.student?.name || 'Alex Thompson'}</h3>
                  <p className="text-[10px] font-medium text-gray-500 mb-2">{selectedStudentSubmission.student?.email || 'alex.t@university.edu'}</p>
                  <span className="bg-purple-50 text-purple-600 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md">
                    BATCH 12
                  </span>
                </div>
              </div>

              {/* Score & Time Card */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
                <div className="text-center">
                  <div className="relative h-20 w-20 mx-auto mb-2">
                    <svg className="h-20 w-20 transform -rotate-90">
                      <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-gray-100" />
                      <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="6" fill="transparent" 
                        strokeDasharray={226} 
                        strokeDashoffset={226 - (226 * (selectedStudentSubmission.score || 16)) / (selectedStudentSubmission.totalQuestions || 20)}
                        className="text-[#5B21B6]" strokeLinecap="round" 
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xl font-black text-gray-900">{selectedStudentSubmission.score || 16}<span className="text-xs text-gray-400 font-medium">/{selectedStudentSubmission.totalQuestions || 20}</span></span>
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    {Math.round(((selectedStudentSubmission.score || 16) / (selectedStudentSubmission.totalQuestions || 20)) * 100)}% ACCURACY
                  </span>
                </div>
                
                <div className="w-px h-16 bg-gray-100 mx-4"></div>

                <div className="text-center">
                  <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-2">
                    <Clock className="h-5 w-5 text-indigo-500" />
                  </div>
                  <span className="text-[10px] font-medium text-gray-400 block mb-0.5">Time Taken</span>
                  <span className="text-sm font-black text-gray-900">14m 32s</span>
                </div>
              </div>

              {/* Question Navigator */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex-1">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-6 text-center">QUESTION NAVIGATOR</h4>
                <div className="grid grid-cols-5 gap-3 mb-6">
                  {Array.from({ length: selectedStudentSubmission.totalQuestions || 20 }).map((_, i) => {
                    // Mock data generation for navigator
                    const isCorrect = i % 4 !== 0; // mostly correct
                    const isUnattempted = i === 5;
                    let bgColor = isUnattempted ? 'bg-blue-50 text-blue-600' : isCorrect ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600';
                    return (
                      <div key={i} className={`h-10 w-10 rounded-xl flex items-center justify-center text-xs font-black ${bgColor}`}>
                        {i + 1}
                      </div>
                    );
                  })}
                </div>
                <div className="flex items-center justify-center gap-4 text-[8px] font-black uppercase tracking-widest">
                  <div className="flex items-center gap-1.5 text-emerald-600"><div className="h-2 w-2 rounded-full bg-emerald-400"></div> CORRECT</div>
                  <div className="flex items-center gap-1.5 text-rose-600"><div className="h-2 w-2 rounded-full bg-rose-400"></div> INCORRECT</div>
                  <div className="flex items-center gap-1.5 text-blue-400"><div className="h-2 w-2 rounded-full bg-blue-300"></div> UNATTEMPTED</div>
                </div>
              </div>
            </div>

            {/* Right Panel (Details) */}
            <div className="flex-1 bg-transparent p-6 flex flex-col h-full relative">
              
              <button 
                onClick={() => setSelectedStudentSubmission(null)}
                className="absolute top-6 right-6 h-10 w-10 bg-white rounded-full shadow-sm flex items-center justify-center text-gray-500 hover:text-gray-900 cursor-pointer z-10"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Top Filter Bar */}
              <div className="flex items-center justify-between mb-6 pr-12">
                <div className="flex items-center gap-2">
                  <button className="px-5 py-2 rounded-full bg-[#5B21B6] text-white text-xs font-bold">All Questions</button>
                  <button className="px-5 py-2 rounded-full bg-transparent text-gray-500 hover:text-gray-800 text-xs font-bold transition-colors">Incorrect Only</button>
                  <button className="px-5 py-2 rounded-full bg-transparent text-gray-500 hover:text-gray-800 text-xs font-bold transition-colors">Marked</button>
                </div>
                <div className="relative w-64 hidden sm:block">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input type="text" placeholder="Search question..." className="w-full pl-9 pr-4 py-2.5 rounded-full bg-white border border-gray-100 text-xs focus:outline-none focus:border-purple-200" />
                </div>
              </div>

              {/* Scrollable Questions List */}
              <div className="flex-1 overflow-y-auto space-y-6 pb-20 pr-2 custom-scrollbar">
                
                {/* Correct Question Mock */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="bg-purple-50 text-[#5B21B6] text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg">Question 01</span>
                      <span className="bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg">Moderate</span>
                      <span className="bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg">1 Mark</span>
                    </div>
                    <button className="text-gray-300 hover:text-gray-500"><Bookmark className="h-5 w-5" /></button>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-6 leading-relaxed">
                    In a microservices architecture, which component is primarily responsible for routing requests to the appropriate service instance?
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl border border-gray-100 text-sm font-medium text-gray-500 flex items-center">
                      A) Message Broker
                    </div>
                    <div className="p-4 rounded-xl border-2 border-emerald-400 bg-emerald-50/30 text-sm font-bold text-emerald-700 flex items-center justify-between">
                      B) API Gateway
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    </div>
                    <div className="p-4 rounded-xl border border-gray-100 text-sm font-medium text-gray-500 flex items-center">
                      C) Service Discovery Tool
                    </div>
                    <div className="p-4 rounded-xl border border-gray-100 text-sm font-medium text-gray-500 flex items-center">
                      D) Container Orchestrator
                    </div>
                  </div>
                </div>

                {/* Incorrect Question Mock */}
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <span className="bg-purple-50 text-[#5B21B6] text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg">Question 03</span>
                      <span className="bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg">Hard</span>
                      <span className="bg-blue-50 text-blue-600 text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg">1 Mark</span>
                    </div>
                    <button className="text-purple-600"><Bookmark className="h-5 w-5 fill-current" /></button>
                  </div>
                  <h3 className="text-sm font-bold text-gray-900 mb-6 leading-relaxed">
                    Which of the following ACID properties ensures that a database remains in a valid state after any transaction?
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 rounded-xl border-2 border-rose-300 bg-rose-50/50 text-sm font-bold text-rose-700 flex items-center justify-between">
                      A) Atomicity
                      <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest">STUDENT'S CHOICE <X className="h-4 w-4" /></div>
                    </div>
                    <div className="p-4 rounded-xl border-2 border-emerald-400 border-dashed bg-transparent text-sm font-bold text-gray-700 flex items-center justify-between">
                      B) Consistency
                      <div className="flex items-center gap-2 text-[9px] uppercase tracking-widest text-emerald-600">CORRECT ANSWER</div>
                    </div>
                    <div className="p-4 rounded-xl border border-gray-100 text-sm font-medium text-gray-500 flex items-center">
                      C) Isolation
                    </div>
                    <div className="p-4 rounded-xl border border-gray-100 text-sm font-medium text-gray-500 flex items-center">
                      D) Durability
                    </div>
                  </div>

                  {/* AI Answer Breakdown */}
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-4 cursor-pointer">
                      <h4 className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-[#a855f7]">
                        <Sparkles className="h-4 w-4" /> AI Answer Breakdown
                      </h4>
                      <ChevronRight className="h-4 w-4 text-gray-400 rotate-90 transform transition-transform" />
                    </div>
                    <div className="bg-purple-50/50 rounded-2xl p-5 border border-purple-100 text-xs font-medium text-gray-600 leading-relaxed space-y-3">
                      <p>While <strong className="text-gray-900">Atomicity</strong> ensures that a transaction is "all or nothing", <strong className="text-gray-900">Consistency</strong> specifically refers to the database transitioning from one valid state to another, maintaining all predefined rules (constraints, cascades, triggers).</p>
                      <p>Your choice of Atomicity is a common confusion because failed atomicity can lead to inconsistency, but it is not the property itself.</p>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
