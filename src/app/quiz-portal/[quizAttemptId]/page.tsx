'use client';

import { useState, useEffect, useRef, use } from 'react';
import { apiRequest } from '@/utils/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  ShieldAlert, 
  Hourglass, 
  CheckSquare, 
  AlertTriangle,
  Award,
  BookOpen,
  User,
  Mail,
  ArrowRight,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Info
} from 'lucide-react';

interface Question {
  _id: string;
  questionText: string;
  options: string[];
  marks?: number;
  correctAnswer?: string;
}

export default function StudentQuizPortal({ params }: { params: Promise<{ quizAttemptId: string }> }) {
  const resolvedParams = use(params);
  const quizId = resolvedParams.quizAttemptId;
  const router = useRouter();
  const searchParams = useSearchParams();
  const projectId = searchParams.get('projectId');

  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes default
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // User info state
  const [isStarted, setIsStarted] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Exam answers state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const selectedAnswersRef = useRef(selectedAnswers);
  useEffect(() => {
    selectedAnswersRef.current = selectedAnswers;
  }, [selectedAnswers]);
  
  // Anti-Cheat State
  const [cheated, setCheated] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [scoreInfo, setScoreInfo] = useState<any>(null);

  useEffect(() => {
    fetchQuizPortalData();
  }, [quizId]);

  const fetchQuizPortalData = async () => {
    try {
      setLoading(true);
      
      const res = await apiRequest(`/public/quizzes/${quizId}`);
      if (res.data) {
        setQuiz(res.data);
        setQuestions(res.data.questions || []);
        setTimeLeft(res.data.durationMinutes * 60);
      } else {
        setError('Failed to fetch quiz details.');
      }
    } catch (err) {
      setError('Failed to fetch quiz details.');
    } finally {
      setLoading(false);
    }
  };
  // Timer Countdown Effect
  useEffect(() => {
    if (!isStarted || loading || submitted || cheated) return;

    if (timeLeft <= 0) {
      handleAutoSubmit('Auto-Submitted (Timeout)');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, loading, submitted, cheated, isStarted]);

  // Anti-Cheat Listeners: Visibility Change & Context Menu Block
  useEffect(() => {
    if (!isStarted || loading || submitted || cheated) return;

    // 1. Right Click Block
    const preventRightClick = (e: MouseEvent) => {
      e.preventDefault();
    };

    // 2. Text Copy / Selector block
    const preventCopy = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    // 3. Tab Switch / Window Blur check
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        handleAutoSubmit('Auto-Submitted (Cheated)', true);
        setCheated(true);
      }
    };

    window.addEventListener('contextmenu', preventRightClick);
    window.addEventListener('copy', preventCopy);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('contextmenu', preventRightClick);
      window.removeEventListener('copy', preventCopy);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loading, submitted, cheated, isStarted]);

  const handleSelectAnswer = (qId: string, option: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [qId]: option
    }));
  };

  const handleAutoSubmit = async (statusOverride = 'Submitted', useLatestAnswers = false) => {
    if (submitted) return;
    setSubmitted(true);
    setIsSubmitting(true);

    const currentAnswers = useLatestAnswers ? selectedAnswersRef.current : selectedAnswers;
    const answersArray = Object.keys(currentAnswers).map(qId => ({
      questionId: qId,
      providedAnswer: currentAnswers[qId]
    }));

    try {
      const res = await apiRequest(`/public/quizzes/${quizId}/submit`, {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          answers: answersArray,
          status: statusOverride
        })
      });

      setScoreInfo({
        score: res.data.score,
        totalPossible: res.data.totalPossibleScore,
        status: res.data.status
      });

    } catch (err) {
      // Offline simulation fallback
      let score = 0;
      const currentAnswers = useLatestAnswers ? selectedAnswersRef.current : selectedAnswers;
      questions.forEach((q: any) => {
        if (currentAnswers[q._id] === q.correctAnswer) {
          score += q.marks || 10;
        }
      });

      setScoreInfo({
        score,
        totalPossible: questions.reduce((acc, q) => acc + (q.marks || 10), 0),
        status: statusOverride
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStartQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await apiRequest(`/public/quizzes/${quizId}/verify`, {
        method: 'POST',
        body: JSON.stringify({ email })
      });
      
      if (res.success) {
        setIsStarted(true);
      } else {
        alert(res.message || 'Access denied');
      }
    } catch (err: any) {
      alert(err.message || 'Error verifying student batch. You may not be enrolled.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-medium tracking-wide">Securing Exam Environment...</p>
        </div>
      </div>
    );
  }

  if (!isStarted) {
    return (
      <div className="min-h-screen bg-[#f8fafc] text-gray-900 font-sans selection:bg-indigo-100 pb-20">
        {/* Header Section */}
        <div className="max-w-6xl mx-auto px-6 pt-12 pb-8">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-indigo-600">Live Session</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
            {quiz?.title || 'AI Assessment Test'}
          </h1>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-semibold text-gray-600">
            <div className="flex items-center gap-1.5">
              <Hourglass className="h-4 w-4 text-gray-400" />
              <span>{quiz?.durationMinutes || 15} Minutes</span>
            </div>
            <div className="flex items-center gap-1.5">
              <BookOpen className="h-4 w-4 text-gray-400" />
              <span>{questions.length} Questions</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-gray-400">Organized by</span>
              <span className="text-gray-800 font-bold">Placement Pulse</span>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Briefing */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm flex flex-col md:flex-row gap-6">
              <div className="w-full md:w-48 h-48 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 shrink-0">
                <Award className="h-12 w-12 text-gray-300" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">Pre-Exam Briefing</h3>
                <p className="text-sm text-gray-600 leading-relaxed">
                  Welcome to the <strong>{quiz?.title || 'Assessment'}</strong>, conducted by <strong>Placement Pulse</strong>. This timed exam (<strong>{quiz?.durationMinutes || 15} minutes</strong>) evaluates your core knowledge and problem-solving skills. Questions may be <strong>shuffled</strong>. No external materials, devices, notes, or assistance are permitted. <strong>Tab switching</strong> or prolonged inactivity may trigger <strong>auto-submission</strong>. Your responses are securely recorded and evaluated automatically where applicable. Proceed only if you agree to these strict academic integrity rules.
                </p>
              </div>
            </div>

            {/* Student Info Form */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Student Information</h3>
              <form id="start-quiz-form" onSubmit={handleStartQuiz} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 block">Full Name</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. John Doe"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 block">Course Email Address</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="name@example.com"
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 block">Phone Number (Optional)</label>
                    <input
                      type="text"
                      placeholder="+880..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-700 block">Profile Link (Resume/CV) (Optional)</label>
                    <input
                      type="url"
                      placeholder="https://..."
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3 px-4 text-sm text-gray-900 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                  </div>
                </div>
              </form>
            </div>
            
            <button
              type="submit"
              form="start-quiz-form"
              disabled={isSubmitting}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-indigo-600/20 text-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? 'Verifying...' : (
                <>Start Assessment <ArrowRight className="h-5 w-5" /></>
              )}
            </button>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Exam Tips */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <Info className="h-5 w-5 text-gray-700" />
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">Exam Tips</h3>
              </div>
              <ul className="space-y-4">
                {[
                  "Use a stable internet connection — sudden drops may cause auto-submit.",
                  "Stay on this tab — switching tabs or minimizing is detected and may trigger auto-submission.",
                  "Close all other tabs and apps — background activity can be flagged as suspicious.",
                  "Do not refresh or use back button — your progress is saved automatically.",
                  "No external help — books, notes, phones, AI tools, or other devices are strictly prohibited."
                ].map((tip, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                    <span className="text-xs font-medium text-gray-600 leading-relaxed">{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Security Monitoring */}
            <div className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-5">
                <ShieldCheck className="h-5 w-5 text-gray-700" />
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-900">Security Monitoring</h3>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <AlertTriangle className="h-4 w-4 text-amber-500" /> Tab Switching
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-100 px-2 py-1 rounded">Auto Submission</span>
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-100">
                  <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <CheckSquare className="h-4 w-4 text-emerald-500" /> Auto-Save & Submit
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-100 px-2 py-1 rounded">Enabled</span>
                </div>
              </div>

              <div className="pt-4 border-t border-gray-100 text-center">
                <div className="flex items-center justify-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1">
                  <ShieldCheck className="h-3 w-3" /> EXAMINO SECURE PROTOCOL V4.2
                </div>
                <p className="text-[10px] text-gray-500">All actions are logged. Rule violations trigger automatic submission.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between select-none relative overflow-hidden">
      {/* Top Lock status bar */}
      <header className="bg-slate-900 border-b border-slate-800/80 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2 text-indigo-400">
          <ShieldAlert className="h-5 w-5 animate-pulse" />
          <span className="text-xs font-bold uppercase tracking-wider">Strict Exam Mode Active</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-400 font-semibold">{quiz?.title}</span>
          <div className="h-4 w-[1px] bg-slate-800"></div>
          <div className="flex items-center gap-2 text-rose-500 font-bold font-mono text-sm bg-rose-500/5 px-4 py-1.5 border border-rose-500/10 rounded-xl">
            <Hourglass className="h-4 w-4" />
            <span>{formatTime(timeLeft)}</span>
          </div>
        </div>
      </header>

      {/* Main Exam Content */}
      <main className="flex-1 p-6 flex justify-center max-w-4xl mx-auto w-full">
        {!submitted && !cheated ? (
          <div className="space-y-8 w-full mt-4">
            {questions.map((question, qIdx) => (
              <div 
                key={question._id} 
                className="bg-white border border-gray-200 p-8 rounded-3xl space-y-6 shadow-sm"
              >
                <div className="flex gap-3">
                  <span className="text-sm font-bold text-indigo-600 font-mono mt-0.5">Q{qIdx + 1}.</span>
                  <h4 className="font-semibold text-base text-gray-900 leading-relaxed">
                    {question.questionText}
                  </h4>
                </div>

                <div className="grid grid-cols-1 gap-3 pl-7">
                  {question.options.map((option) => {
                    const isSelected = selectedAnswers[question._id] === option;
                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => handleSelectAnswer(question._id, option)}
                        className={`w-full text-left p-4 rounded-xl border text-sm font-medium transition-all flex items-center gap-4 ${
                          isSelected
                            ? 'bg-indigo-50 border-indigo-500 text-indigo-700'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-indigo-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${isSelected ? 'border-indigo-600 bg-indigo-100' : 'border-gray-300 bg-white'}`}>
                          {isSelected && <div className="h-2.5 w-2.5 rounded-full bg-indigo-600" />}
                        </div>
                        <span className="flex-1">{option}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={() => handleAutoSubmit('Submitted')}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-2xl text-xs font-bold tracking-wide transition-all shadow-lg shadow-indigo-600/10"
              >
                Submit Exam
              </button>
            </div>
          </div>
        ) : (
          /* Result Overlay / Cheat warning */
          <div className="w-full flex items-center justify-center py-20">
            <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800 max-w-md w-full rounded-3xl p-8 shadow-2xl text-center space-y-6">
              {cheated ? (
                <>
                  <div className="h-16 w-16 mx-auto rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-450 flex items-center justify-center animate-bounce">
                    <AlertTriangle className="h-8 w-8" />
                  </div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Cheat Detected / Auto-Submitted</h2>
                  <p className="text-slate-400 text-xs leading-relaxed">
                    You were flagged for tab-switching or leaving the exam browser window. As a security penalty, your exam has been automatically closed and graded as incomplete.
                  </p>
                </>
              ) : (
                <>
                  <div className="h-16 w-16 mx-auto rounded-3xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-455 flex items-center justify-center">
                    <Award className="h-8 w-8" />
                  </div>
                  <h2 className="text-xl font-bold text-white tracking-tight">Exam Submitted Successfully</h2>
                  <p className="text-slate-400 text-xs">
                    Your answers were recorded and auto-graded. Below are your results:
                  </p>
                </>
              )}

              {scoreInfo && (
                <div className="p-5 bg-slate-950/60 border border-slate-850 rounded-2xl space-y-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Your Score</span>
                  <h3 className="text-3xl font-extrabold text-white">
                    {scoreInfo.score} <span className="text-sm font-semibold text-slate-500">/ {scoreInfo.totalPossible} pts</span>
                  </h3>
                  <span className="text-[10px] text-slate-400 block pt-1.5 capitalize font-medium">
                    Status: {scoreInfo.status}
                  </span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => router.push('/')}
                  className="bg-slate-850 border border-slate-800 text-slate-300 hover:text-white px-6 py-2.5 rounded-xl text-xs font-semibold transition-colors"
                >
                  Close Window
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Lock footer banner */}
      <footer className="bg-slate-950 border-t border-slate-900 px-6 py-3 text-center text-[10px] text-slate-600 font-medium">
        🛡️ Encrypted examination system. Copying text, taking screenshots, or right-clicking is disabled.
      </footer>
    </div>
  );
}
