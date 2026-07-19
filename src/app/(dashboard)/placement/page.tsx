'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/utils/api';
import { 
  Sparkles,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  Paperclip,
  RotateCcw,
  ChevronDown,
  Copy,
  Download,
  Calendar,
  FileText,
  User,
  ArrowRight,
  Plus,
  Sliders
} from 'lucide-react';

export default function GlobalPlacementDashboard() {
  const [activeTab, setActiveTab] = useState<'scorer' | 'matchmaker' | 'synthesizer'>('scorer');
  
  // Scorer States
  const [resumeUrl, setResumeUrl] = useState('');
  const [isScoring, setIsScoring] = useState(false);
  const [scoreResult, setScoreResult] = useState<any>(null);

  // Matchmaker States
  const [jobDescription, setJobDescription] = useState('');
  const [isMatching, setIsMatching] = useState(false);
  const [matchResult, setMatchResult] = useState(false);

  // Synthesizer States
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [reportResult, setReportResult] = useState(false);

  const handleScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeUrl) return;
    setIsScoring(true);
    try {
      const res = await apiRequest('/ai/resume-score', {
        method: 'POST',
        body: JSON.stringify({ resumeUrl })
      });
      setScoreResult(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setIsScoring(false);
    }
  };

  const handleMatch = () => {
    if (!jobDescription) return;
    setIsMatching(true);
    setTimeout(() => {
      setIsMatching(false);
      setMatchResult(true);
    }, 1500);
  };

  const handleSynthesize = () => {
    setIsSynthesizing(true);
    setTimeout(() => {
      setIsSynthesizing(false);
      setReportResult(true);
    }, 1500);
  };

  return (
    <div className="min-h-screen p-8 bg-transparent" style={{ fontFamily: 'Inter, sans-serif' }}>
      
      {/* ── Top Navigation Tabs ────────────────────────────────────────────── */}
      <div className="flex justify-center mb-10">
        <div className="bg-white p-1.5 rounded-full flex gap-2 shadow-sm border border-gray-100">
          <button 
            onClick={() => setActiveTab('scorer')}
            className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'scorer' ? 'bg-[#5B21B6] text-white shadow-md' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Resume Scorer
          </button>
          <button 
            onClick={() => setActiveTab('matchmaker')}
            className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'matchmaker' ? 'bg-[#5B21B6] text-white shadow-md' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Candidate Matchmaker
          </button>
          <button 
            onClick={() => setActiveTab('synthesizer')}
            className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all ${
              activeTab === 'synthesizer' ? 'bg-[#5B21B6] text-white shadow-md' : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            Report Synthesizer
          </button>
        </div>
      </div>

      {/* ── Tab 1: Resume Scorer ──────────────────────────────────────────── */}
      {activeTab === 'scorer' && (
        <div className="max-w-5xl mx-auto space-y-6 animate-fadeIn">
          {/* Input Bar */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
            <div className="flex-1 flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-gray-200 focus-within:border-purple-300 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
              <LinkIcon className="h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Paste Student Resume PDF URL (e.g., Drive, Dropbox, Portfolio)..."
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
                className="flex-1 bg-transparent border-none outline-none text-sm font-medium text-gray-700 placeholder:text-gray-400"
              />
            </div>
            <button 
              onClick={handleScore}
              disabled={isScoring || !resumeUrl}
              className="bg-[#0D9488] hover:bg-[#0f766e] text-white px-6 py-3.5 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors disabled:opacity-70"
            >
              <Sparkles className="h-4 w-4" />
              {isScoring ? 'Scoring...' : 'Score Resume'}
            </button>
          </div>

          {/* Results Area */}
          {scoreResult && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Left Card - Score */}
              <div className="md:col-span-5 bg-white rounded-[32px] p-10 shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-64 h-64 bg-purple-50 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 opacity-50"></div>
                
                <div className="relative w-48 h-48 mb-6">
                  {/* Circular Progress (Mock) */}
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="45" stroke="#F1F5F9" strokeWidth="8" fill="none" />
                    <circle cx="50" cy="50" r="45" stroke="#5B21B6" strokeWidth="8" fill="none" 
                      strokeDasharray="283" strokeDashoffset={283 - (283 * (scoreResult.score || 0)) / 100} strokeLinecap="round" className="text-[#0D9488]" 
                      style={{ stroke: 'url(#gradient)', transition: 'stroke-dashoffset 1s ease-out' }}
                    />
                    <defs>
                      <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#5B21B6" />
                        <stop offset="100%" stopColor="#0D9488" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-black text-[#5B21B6] leading-none mb-1">{scoreResult.score || 0}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">OUT OF 100</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mb-3">{scoreResult.feedback || "Needs Review"}</h3>
                <p className="text-xs text-gray-500 font-medium leading-relaxed max-w-[240px]">
                  Based on AI analysis, this resume has been scored according to ATS standards.
                </p>
              </div>

              {/* Right Card - Details */}
              <div className="md:col-span-7 bg-white rounded-[32px] p-10 shadow-sm border border-gray-100 flex flex-col relative">
                <div className="grid grid-cols-2 gap-8 flex-1">
                  
                  {/* Strengths */}
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="h-6 w-6 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      </div>
                      <h4 className="text-[11px] font-black uppercase tracking-widest text-emerald-600">KEY STRENGTHS</h4>
                    </div>
                    <ul className="space-y-5">
                      {scoreResult.strengths?.map((str: string, i: number) => (
                        <li key={i} className="flex gap-3 text-sm text-gray-600 font-medium leading-relaxed">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0 mt-2"></span>
                          {str}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Areas to Refine */}
                  <div>
                    <div className="flex items-center gap-2 mb-6">
                      <div className="h-6 w-6 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center">
                        <AlertCircle className="h-4 w-4 text-amber-500" />
                      </div>
                      <h4 className="text-[11px] font-black uppercase tracking-widest text-amber-600">AREAS TO REFINE</h4>
                    </div>
                    <ul className="space-y-5">
                      {scoreResult.issues?.map((issue: any, i: number) => (
                        <li key={i} className="flex gap-3 text-sm text-gray-600 font-medium leading-relaxed">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 shrink-0 mt-2"></span>
                          {issue.problem}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Bottom Action Bar */}
                <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center text-[10px] font-bold text-purple-700">JD</div>
                    <button className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                      <Plus className="h-4 w-4 text-gray-500" />
                    </button>
                  </div>
                  <button className="text-[11px] font-black uppercase tracking-widest text-[#5B21B6] hover:text-purple-800 transition-colors flex items-center gap-1.5">
                    GENERATE COACHING PLAN <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

            </div>
          )}
        </div>
      )}

      {/* ── Tab 2: Candidate Matchmaker ────────────────────────────────────── */}
      {activeTab === 'matchmaker' && (
        <div className="max-w-6xl mx-auto animate-fadeIn">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900 mb-2">AI Candidate Matchmaker</h1>
            <p className="text-sm text-gray-500 font-medium">Leverage neural matching to connect the right student with your requirements in seconds.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column - Input */}
            <div className="lg:col-span-5 bg-white rounded-[32px] p-6 shadow-sm border border-gray-100 flex flex-col h-[560px]">
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-[11px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                  <FileText className="h-3.5 w-3.5" /> JOB DESCRIPTION CONTEXT
                </h4>
                <span className="text-[10px] font-medium text-gray-300">Auto-saving...</span>
              </div>
              
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste your Job Description (JD) here to match with the best-fit talent... e.g. Senior Frontend Engineer with experience in React, TypeScript, and AI-driven UI components. Must have strong architectural focus and 3+ years experience."
                className="flex-1 w-full bg-transparent border-none outline-none resize-none text-sm font-medium text-gray-600 placeholder:text-gray-300 placeholder:leading-relaxed leading-relaxed"
              ></textarea>

              <div className="mt-4 flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex items-center gap-2">
                  <button className="h-10 w-10 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors">
                    <Paperclip className="h-4 w-4" />
                  </button>
                  <button className="h-10 w-10 rounded-xl bg-gray-50 hover:bg-gray-100 flex items-center justify-center text-gray-400 transition-colors">
                    <RotateCcw className="h-4 w-4" />
                  </button>
                </div>
                <button 
                  onClick={handleMatch}
                  disabled={isMatching || !jobDescription}
                  className="bg-gradient-to-r from-[#f472b6] to-[#fb923c] text-white px-8 py-3 rounded-xl text-sm font-bold shadow-md hover:opacity-90 transition-opacity flex items-center gap-2 disabled:opacity-70"
                >
                  {isMatching && <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  Match Candidates
                </button>
              </div>
            </div>

            {/* Right Column - Results */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                  Top Matched Talent <span className="text-purple-500 font-medium text-xs">Found 24 candidates</span>
                </h3>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-500">
                  Sort by: <span className="text-[#5B21B6] flex items-center gap-1 cursor-pointer">Match Rank <ChevronDown className="h-3 w-3" /></span>
                </div>
              </div>

              {(matchResult) && (
                <div className="space-y-4">
                  {/* Card 1 */}
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className="relative">
                          <div className="h-14 w-14 rounded-full overflow-hidden bg-gray-100">
                            <img src="https://i.pravatar.cc/150?u=1" alt="Alex" className="w-full h-full object-cover" />
                          </div>
                          <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white"></div>
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-gray-900 mb-0.5">Alex Rivera</h3>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">AVAILABLE NOW</span>
                            <span className="text-gray-300">•</span>
                            <span className="text-xs font-medium text-gray-500">Frontend Engineering Cohort '24</span>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-4">
                            <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold">React</span>
                            <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold">Tailwind CSS</span>
                            <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold">Framer Motion</span>
                            <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold">TypeScript</span>
                          </div>
                          <div className="flex items-center gap-6 text-xs font-bold text-gray-600">
                            <span className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-[#5B21B6]" /> Avg Quiz: 94%</span>
                            <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-[#5B21B6]" /> Attendance: 99%</span>
                            <span className="flex items-center gap-1.5"><span className="text-[#5B21B6] font-black text-sm">&lt;/&gt;</span> Projects: 12</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-[#f472b6] to-[#fb923c] text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest flex items-center gap-1">
                        98% MATCH <div className="h-1.5 w-1.5 bg-white rounded-full ml-0.5"></div>
                      </div>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className="relative">
                          <div className="h-14 w-14 rounded-full overflow-hidden bg-gray-100">
                            <img src="https://i.pravatar.cc/150?u=2" alt="Sarah" className="w-full h-full object-cover" />
                          </div>
                          <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-emerald-500 border-2 border-white"></div>
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-gray-900 mb-0.5">Sarah Chen</h3>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600">AVAILABLE NOW</span>
                            <span className="text-gray-300">•</span>
                            <span className="text-xs font-medium text-gray-500">Full Stack Cohort '24</span>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-4">
                            <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold">Node.js</span>
                            <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold">Next.js</span>
                            <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold">PostgreSQL</span>
                            <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold">OpenAI API</span>
                          </div>
                          <div className="flex items-center gap-6 text-xs font-bold text-gray-600">
                            <span className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-[#5B21B6]" /> Avg Quiz: 88%</span>
                            <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-[#5B21B6]" /> Attendance: 96%</span>
                            <span className="flex items-center gap-1.5"><span className="text-[#5B21B6] font-black text-sm">&lt;/&gt;</span> Projects: 8</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-[#8b5cf6] text-white px-3 py-1 rounded-full text-[10px] font-black tracking-widest flex items-center gap-1 shadow-sm">
                        92% MATCH
                      </div>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-4">
                        <div className="relative">
                          <div className="h-14 w-14 rounded-full overflow-hidden bg-gray-100">
                            <img src="https://i.pravatar.cc/150?u=3" alt="Jordan" className="w-full h-full object-cover" />
                          </div>
                          <div className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full bg-amber-500 border-2 border-white"></div>
                        </div>
                        <div>
                          <h3 className="text-base font-bold text-gray-900 mb-0.5">Jordan Smith</h3>
                          <div className="flex items-center gap-2 mb-3">
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-500">IN INTERVIEW</span>
                            <span className="text-gray-300">•</span>
                            <span className="text-xs font-medium text-gray-500">UI/UX Engineering '24</span>
                          </div>
                          <div className="flex flex-wrap gap-2 mb-4">
                            <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold">Figma</span>
                            <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold">Tailwind</span>
                            <span className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-bold">React</span>
                          </div>
                          <div className="flex items-center gap-6 text-xs font-bold text-gray-600">
                            <span className="flex items-center gap-1.5"><FileText className="h-3.5 w-3.5 text-[#5B21B6]" /> Avg Quiz: 91%</span>
                            <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5 text-[#5B21B6]" /> Attendance: 92%</span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-[10px] font-black tracking-widest flex items-center gap-1">
                        85% MATCH
                      </div>
                    </div>
                  </div>

                  <button className="w-full py-4 rounded-3xl border-2 border-dashed border-gray-200 text-gray-500 text-sm font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2">
                    <RotateCcw className="h-4 w-4" /> Load More Potential Candidates
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Tab 3: Report Synthesizer ──────────────────────────────────────── */}
      {activeTab === 'synthesizer' && (
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fadeIn">
          
          {/* Left Sidebar */}
          <div className="lg:col-span-3 space-y-8 sticky top-8">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-8 w-8 rounded-lg bg-[#5B21B6] flex items-center justify-center text-white">
                <Sliders className="h-4 w-4" />
              </div>
              <h2 className="text-lg font-black text-gray-900">Report Configuration</h2>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">TIMEFRAME SELECTOR</label>
              <div className="relative">
                <select className="w-full appearance-none bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold text-gray-700 outline-none focus:border-purple-500">
                  <option>Last 30 Days</option>
                  <option>Last Quarter</option>
                  <option>All Time</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">REPORT FOCUS AREAS</label>
              <div className="flex flex-wrap gap-2">
                <button className="px-4 py-2 rounded-full bg-[#5B21B6] text-white text-xs font-bold shadow-sm">Performance Metrics</button>
                <button className="px-4 py-2 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-100">Attendance Logs</button>
                <button className="px-4 py-2 rounded-full bg-[#5B21B6] text-white text-xs font-bold shadow-sm">Placement Readiness</button>
                <button className="px-4 py-2 rounded-full bg-purple-50 text-purple-700 text-xs font-bold border border-purple-100">Risk Analysis</button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500">CUSTOM AI CONTEXT</label>
              <textarea 
                rows={5}
                className="w-full bg-white border border-gray-200 rounded-2xl p-4 text-xs font-medium text-gray-600 resize-none outline-none focus:border-purple-500 placeholder:text-gray-300"
                placeholder="e.g., Focus on students falling behind in React, identify patterns in low quiz scores, and suggest personalized recovery plans for high-risk cohorts..."
              ></textarea>
            </div>

            <button 
              onClick={handleSynthesize}
              disabled={isSynthesizing}
              className="w-full bg-gradient-to-r from-[#0D9488] to-[#5B21B6] text-white py-3.5 rounded-xl text-xs font-black tracking-wider flex items-center justify-center gap-2 shadow-md hover:opacity-90 transition-opacity disabled:opacity-70"
            >
              {isSynthesizing ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Synthesize Performance Report
            </button>
          </div>

          {/* Right Content */}
          <div className="lg:col-span-9">
            {(reportResult) && (
              <div className="bg-white rounded-[32px] p-10 shadow-sm border border-gray-100 min-h-[600px]">
                
                {/* Header Actions */}
                <div className="flex items-center justify-end gap-4 mb-6">
                  <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100 shadow-sm">
                    <Copy className="h-3.5 w-3.5" /> Copy Report
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-gray-600 hover:bg-gray-50 rounded-lg transition-colors border border-gray-100 shadow-sm">
                    <Download className="h-3.5 w-3.5" /> Download PDF
                  </button>
                </div>

                {/* Report Header */}
                <div className="mb-10">
                  <div className="flex items-center gap-3 mb-4">
                    <span className="bg-[#d946ef] text-white px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest">
                      AI-GENERATED REPORT
                    </span>
                    <span className="text-xs font-medium text-gray-400">Created Oct 24, 2023 • 12:45 PM</span>
                  </div>
                  <h1 className="text-4xl font-extrabold text-gray-900 leading-tight">
                    Placement Readiness & Performance Synthesis
                  </h1>
                </div>

                {/* Executive Summary */}
                <div className="mb-10">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-6 w-1.5 bg-[#5B21B6] rounded-full"></div>
                    <h2 className="text-xl font-bold text-gray-900">Executive Summary</h2>
                  </div>
                  <div className="bg-[#f0fdfa] rounded-3xl p-8 border border-teal-100">
                    <p className="text-[#0f766e] text-[15px] leading-relaxed font-medium italic">
                      "Overall cohort performance has increased by <strong className="font-black text-teal-700">14.2%</strong> over the last 30 days. While React competency remains high across the top 20%, a secondary group of 12 students shows declining engagement in asynchronous modules. Placement readiness is currently tracking ahead of Q3 targets."
                    </p>
                  </div>
                </div>

                {/* Top Performers */}
                <div className="mb-10">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Top Performers</h2>
                    <button className="text-xs font-bold text-[#5B21B6] flex items-center gap-1 hover:underline">
                      View All <ArrowRight className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full overflow-hidden">
                          <img src="https://i.pravatar.cc/150?u=1" alt="Alex" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-900">Alex Rivera</h4>
                          <p className="text-[10px] text-gray-500 font-medium">Full Stack Specialist</p>
                        </div>
                      </div>
                      <div className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5 text-purple-500" /> 98%
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl p-4 border border-gray-100 shadow-sm flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full overflow-hidden">
                          <img src="https://i.pravatar.cc/150?u=4" alt="Meera" className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-gray-900">Meera Shah</h4>
                          <p className="text-[10px] text-gray-500 font-medium">UI/UX Engineer</p>
                        </div>
                      </div>
                      <div className="bg-purple-50 text-purple-700 px-3 py-1.5 rounded-lg text-xs font-black flex items-center gap-1">
                        <Sparkles className="h-3.5 w-3.5 text-purple-500" /> 95%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Risk Student Action Items */}
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Risk Student Action Items</h2>
                  <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm relative pl-10 overflow-hidden">
                    <div className="absolute left-6 top-7 h-2 w-2 rounded-full bg-rose-400"></div>
                    <div className="absolute left-[27px] top-9 bottom-0 w-px bg-gray-100"></div>
                    <h4 className="text-sm font-bold text-gray-900 mb-2">Critical Intervention: Attendance Drop</h4>
                    <p className="text-xs text-gray-500 leading-relaxed font-medium">
                      Jordan S. has missed 4 consecutive live coding labs. AI identifies this as a high-probability dropout risk for the 'Placement Readiness' module. Immediate 1-on-1 check-in recommended.
                    </p>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
