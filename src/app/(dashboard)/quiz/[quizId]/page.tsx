'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { apiRequest } from '@/utils/api';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

function QuizDetailsContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const quizId = params.quizId as string;
  const projectId = searchParams.get('projectId');

  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  useEffect(() => {
    fetchSubmissions();
  }, [quizId]);

  const fetchSubmissions = async () => {
    if (!projectId) return;
    try {
      const res = await apiRequest(`/projects/${projectId}/quizzes/${quizId}/submissions`);
      setSubmissions(res.data || []);
    } catch (err) {
      console.error('Failed to fetch submissions', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleRow = (id: string) => {
    if (expandedRow === id) {
      setExpandedRow(null);
    } else {
      setExpandedRow(id);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center gap-4 mb-8">
        <button 
          onClick={() => router.back()} 
          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quiz Submissions</h1>
          <p className="text-sm text-gray-500">View all student attempts and scores.</p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-2xl shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center">
            <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : submissions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No submissions yet for this quiz.
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Score</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {submissions.map((sub) => (
                <React.Fragment key={sub._id}>
                  <tr className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {sub.student?.name || 'Unknown Student'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sub.student?.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className="font-bold text-gray-900">{sub.score}</span>
                      <span className="text-gray-400 text-xs"> / {sub.totalPossibleScore}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {sub.status === 'Submitted' ? (
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 flex items-center w-fit gap-1">
                          <CheckCircle className="w-3 h-3" /> Submitted
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 flex items-center w-fit gap-1">
                          <AlertTriangle className="w-3 h-3" /> {sub.status}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <button 
                        onClick={() => toggleRow(sub._id)}
                        className="text-indigo-600 hover:text-indigo-900 font-medium text-sm flex items-center justify-end w-full gap-1"
                      >
                        {expandedRow === sub._id ? 'Hide Answers' : 'View Answers'}
                        {expandedRow === sub._id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                  
                  {expandedRow === sub._id && (
                    <tr className="bg-slate-50 border-b border-gray-200">
                      <td colSpan={5} className="px-6 py-6">
                        <h4 className="text-sm font-bold text-gray-800 mb-4">Detailed Answers</h4>
                        <div className="space-y-4">
                          {sub.answers?.map((ans: any, idx: number) => (
                            <div key={idx} className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm flex items-start gap-4">
                              <div className="mt-0.5">
                                {ans.isCorrect ? (
                                  <CheckCircle className="w-5 h-5 text-green-500" />
                                ) : (
                                  <XCircle className="w-5 h-5 text-red-500" />
                                )}
                              </div>
                              <div className="flex-1">
                                <p className="text-xs font-semibold text-gray-500 mb-1">Question ID: {ans.questionId}</p>
                                <div className="mt-2 space-y-1">
                                  <p className="text-sm">
                                    <span className="font-semibold text-gray-700">Provided Answer: </span>
                                    <span className={ans.isCorrect ? 'text-green-700 font-medium' : 'text-red-700 font-medium'}>
                                      {ans.providedAnswer || <span className="italic text-gray-400">Skipped/No Answer</span>}
                                    </span>
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                          {(!sub.answers || sub.answers.length === 0) && (
                            <p className="text-sm text-gray-500 italic">No answers recorded.</p>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default function QuizDetailsPage() {
  return (
    <Suspense fallback={<div className="p-8 flex justify-center"><div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div></div>}>
      <QuizDetailsContent />
    </Suspense>
  );
}
