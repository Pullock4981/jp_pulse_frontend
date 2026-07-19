'use client';

import { useState, useEffect, use } from 'react';
import { createPortal } from 'react-dom';
import { apiRequest } from '@/utils/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ChevronLeft, Search, Filter, Download, X, Bookmark, 
  CheckCircle2, Clock, Sparkles, ChevronRight, AlertTriangle
} from 'lucide-react';

export default function QuizSubmissionsPage({ params }: { params: Promise<{ quizId: string }> }) {
  const resolvedParams = use(params);
  const quizId = resolvedParams.quizId;
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [mounted, setMounted] = useState(false);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [quizDetails, setQuizDetails] = useState<any>(null);
  
  // Detailed Modal State
  const [selectedStudentSubmission, setSelectedStudentSubmission] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    if (quizId && projectId) {
      fetchData();
    }
  }, [quizId, projectId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch quiz details
      const quizRes = await apiRequest(`/projects/${projectId}/quizzes`);
      const allQuizzes = quizRes.data || [];
      const currentQuiz = allQuizzes.find((q: any) => q._id === quizId);
      setQuizDetails(currentQuiz);

      // Fetch submissions
      const subRes = await apiRequest(`/projects/${projectId}/quizzes/${quizId}/submissions`);
      setSubmissions(subRes.data || []);
    } catch {
      setSubmissions([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 relative z-10 page-enter" style={{ fontFamily: 'Inter, sans-serif' }}>
      
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-center gap-4 mb-6">
        <button 
          onClick={() => router.back()}
          className="h-10 w-10 bg-white border border-gray-200 rounded-xl flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-2xl font-black text-gray-900 leading-tight">Quiz Submissions</h1>
          <p className="text-sm font-medium text-gray-500">{quizDetails?.title || 'Loading quiz details...'}</p>
        </div>
      </div>

      {/* ── Main Content ───────────────────────────────────── */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col min-h-[60vh]">
        <div className="flex items-center justify-between mb-6">
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search students..."
              className="w-full pl-9 pr-4 py-2 rounded-full border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-200"
            />
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

        <div className="flex-1 overflow-x-auto">
          {loading ? (
            <div className="text-center py-12 text-gray-400 font-medium">Loading submissions...</div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12 text-gray-400 font-medium">No submissions recorded for this quiz yet.</div>
          ) : (
            <table className="w-full text-left">
              <thead className="text-[9px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 bg-gray-50/50">
                <tr>
                  <th className="py-4 px-4">STUDENT</th>
                  <th className="py-4 px-4">SCORE</th>
                  <th className="py-4 px-4">SUBMITTED AT</th>
                  <th className="py-4 px-4">AI FLAG</th>
                  <th className="py-4 px-4 text-right">ACTION</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {submissions.map((sub: any) => (
                  <tr key={sub._id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-4">
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
                    <td className="py-4 px-4">
                      <span className="text-sm font-black text-purple-700">{sub.score} / {sub.totalQuestions || 20}</span>
                    </td>
                    <td className="py-4 px-4 text-xs font-medium text-gray-600">
                      {new Date(sub.createdAt).toLocaleString()}
                    </td>
                    <td className="py-4 px-4">
                      {sub.cheated ? (
                        <span className="bg-rose-50 text-rose-700 px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest uppercase flex items-center gap-1 w-max">
                          <AlertTriangle className="h-3 w-3" /> FLAGGED
                        </span>
                      ) : (
                        <span className="bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-full text-[9px] font-black tracking-widest uppercase w-max block">
                          CLEAN
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button 
                        onClick={() => setSelectedStudentSubmission(sub)}
                        className="text-xs font-bold text-purple-600 bg-purple-50 hover:bg-purple-100 px-4 py-2 rounded-xl transition-colors cursor-pointer"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

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
                    const isCorrect = i % 4 !== 0; 
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
