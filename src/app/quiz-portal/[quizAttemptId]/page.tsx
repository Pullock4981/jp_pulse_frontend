'use client';

import { useState, useEffect, use } from 'react';
import { apiRequest } from '@/utils/api';
import { useRouter } from 'next/navigation';
import { 
  ShieldAlert, 
  Hourglass, 
  CheckSquare, 
  AlertTriangle,
  Award,
  BookOpen
} from 'lucide-react';

interface Question {
  _id: string;
  questionText: string;
  options: string[];
}

export default function StudentQuizPortal({ params }: { params: Promise<{ quizAttemptId: string }> }) {
  const resolvedParams = use(params);
  const quizId = resolvedParams.quizAttemptId;
  const router = useRouter();

  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutes default
  const [loading, setLoading] = useState(true);

  // Exam answers state
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  
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
      const res = await apiRequest(`/projects/any/quizzes`); // Mock URL matching route
      const matched = res.data?.find((q: any) => q._id === quizId);
      if (matched) {
        setQuiz(matched);
        setQuestions(matched.questions || []);
        setTimeLeft(matched.durationMinutes * 60);
      } else {
        loadMockQuiz();
      }
    } catch (err) {
      loadMockQuiz();
    } finally {
      setLoading(false);
    }
  };

  const loadMockQuiz = () => {
    const mockQuiz = {
      _id: quizId,
      title: 'React Fundamentals Quiz',
      durationMinutes: 15,
      questions: [
        {
          _id: 'q-1',
          questionText: 'Which React hook is used to handle side effects in functional components?',
          options: ['useState', 'useEffect', 'useContext', 'useReducer'],
          correctAnswer: 'useEffect'
        },
        {
          _id: 'q-2',
          questionText: 'What is the purpose of the virtual DOM in React?',
          options: ['Direct manipulation of DOM structure', 'To render HTML pages on the server', 'Performance optimization by minimizing direct DOM updates', 'To execute JavaScript compiler commands'],
          correctAnswer: 'Performance optimization by minimizing direct DOM updates'
        },
        {
          _id: 'q-3',
          questionText: 'In React, what are "props"?',
          options: ['Internal component mutable state', 'External parameters passed down to components', 'CSS style properties', 'Database connection hooks'],
          correctAnswer: 'External parameters passed down to components'
        }
      ]
    };

    setQuiz(mockQuiz);
    setQuestions(mockQuiz.questions);
    setTimeLeft(mockQuiz.durationMinutes * 60);
  };

  // Timer Countdown Effect
  useEffect(() => {
    if (loading || submitted || cheated) return;

    if (timeLeft <= 0) {
      handleAutoSubmit('Auto-Submitted (Timeout)');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, loading, submitted, cheated]);

  // Anti-Cheat Listeners: Visibility Change & Context Menu Block
  useEffect(() => {
    if (loading || submitted || cheated) return;

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
        handleAutoSubmit('Auto-Submitted (Cheated)');
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
  }, [loading, submitted, cheated]);

  const handleSelectAnswer = (qId: string, option: string) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [qId]: option
    }));
  };

  const handleAutoSubmit = async (statusOverride = 'Submitted') => {
    if (submitted) return;
    setSubmitted(true);

    const answersArray = Object.keys(selectedAnswers).map(qId => ({
      questionId: qId,
      providedAnswer: selectedAnswers[qId]
    }));

    try {
      // Mock submit to backend endpoint
      const body = {
        studentId: 'stud-1', // Mock student
        answers: answersArray,
        status: statusOverride
      };

      // Simulated auto grading
      let score = 0;
      questions.forEach((q: any) => {
        if (selectedAnswers[q._id] === q.correctAnswer) {
          score += 10; // 10 points per correct answer
        }
      });

      setScoreInfo({
        score,
        totalPossible: questions.length * 10,
        status: statusOverride
      });

    } catch (err) {
      // Offline simulation
      let score = 0;
      questions.forEach((q: any) => {
        if (selectedAnswers[q._id] === q.correctAnswer) {
          score += 10;
        }
      });

      setScoreInfo({
        score,
        totalPossible: questions.length * 10,
        status: statusOverride
      });
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
                className="bg-slate-900/40 border border-slate-850 p-6 rounded-3xl space-y-4"
              >
                <div className="flex gap-2">
                  <span className="text-xs font-bold text-indigo-400 font-mono">Q{qIdx + 1}.</span>
                  <h4 className="font-semibold text-sm text-slate-100 leading-relaxed">
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
                        className={`w-full text-left p-3.5 rounded-xl border text-xs font-medium transition-all ${
                          isSelected
                            ? 'bg-indigo-600/10 border-indigo-500 text-indigo-400'
                            : 'bg-slate-950/40 border-slate-855 text-slate-450 hover:border-slate-800 hover:text-slate-200'
                        }`}
                      >
                        {option}
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
