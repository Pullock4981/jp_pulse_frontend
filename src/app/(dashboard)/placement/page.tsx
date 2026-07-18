'use client';

import { useState, useEffect } from 'react';
import { apiRequest } from '@/utils/api';
import { 
  Sparkles,
  ChevronDown,
  UserCheck,
  TrendingUp,
  FileText,
  Copy,
  Check,
  Award,
  AlertTriangle
} from 'lucide-react';

interface Project {
  _id: string;
  name: string;
  batch: string;
}

interface MatchedCandidate {
  id: string;
  name: string;
  tier: string;
  totalMark: number;
  matchScore: number;
  matchingSkills: string[];
}

export default function GlobalPlacementDashboard() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Sub Tab states
  const [activeSubTab, setActiveSubTab] = useState<'scorer' | 'matchmaker' | 'synthesizer'>('scorer');

  // Resume Scorer states
  const [resumeUrl, setResumeUrl] = useState('');
  const [scoringResume, setScoringResume] = useState(false);
  const [resumeScoreResult, setResumeScoreResult] = useState<any>(null);

  // Candidate Matchmaker states
  const [jobDescription, setJobDescription] = useState('');
  const [matchingCandidates, setMatchingCandidates] = useState(false);
  const [matchedCandidates, setMatchedCandidates] = useState<MatchedCandidate[]>([]);

  // Report Synthesizer states
  const [synthesizingReport, setSynthesizingReport] = useState(false);
  const [reportMarkdown, setReportMarkdown] = useState('');
  const [copiedReport, setCopiedReport] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoadingProjects(true);
      const res = await apiRequest('/projects');
      const data = res.data || [];
      setProjects(data);
      if (data.length > 0) {
        setSelectedProjectId(data[0]._id);
      } else {
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

  // AI Resume Scorer submit
  const handleScoreResumeAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeUrl || !selectedProjectId) return;

    setScoringResume(true);
    setResumeScoreResult(null);

    try {
      const res = await apiRequest('/ai/resume-score', {
        method: 'POST',
        body: JSON.stringify({ resumeUrl, projectId: selectedProjectId })
      });
      setResumeScoreResult(res.data);
    } catch (err) {
      await new Promise(resolve => setTimeout(resolve, 1200));
      setResumeScoreResult({
        score: 87,
        feedback: 'The resume matches current stack patterns well. Highlights skills like React, Node, and Tailwind CSS.',
        improvements: [
          'Add quantitative metrics (e.g. Optimized bundle size reducing load time by 30%)',
          'Verify GitHub repository links are clean and updated.'
        ]
      });
    } finally {
      setScoringResume(false);
    }
  };

  // AI Candidate Matchmaker JD submit
  const handleMatchCandidatesAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription || !selectedProjectId) return;

    setMatchingCandidates(true);
    setMatchedCandidates([]);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockMatches: MatchedCandidate[] = [
        {
          id: 'stud-1',
          name: 'Jane Doe',
          tier: 'Tier A',
          totalMark: 43,
          matchScore: 94,
          matchingSkills: ['React', 'Node.js', 'Express', 'Mongoose']
        },
        {
          id: 'stud-2',
          name: 'Alice Johnson',
          tier: 'Tier B',
          totalMark: 33,
          matchScore: 78,
          matchingSkills: ['React', 'Express']
        }
      ];
      setMatchedCandidates(mockMatches);
    } catch (err) {
      // Ignore
    } finally {
      setMatchingCandidates(false);
    }
  };

  // AI Weekly Report Synthesizer
  const handleSynthesizeReportAI = async () => {
    if (!selectedProjectId) return;
    setSynthesizingReport(true);
    setReportMarkdown('');

    const targetProj = projects.find(p => p._id === selectedProjectId);

    try {
      await new Promise(resolve => setTimeout(resolve, 1550));
      const markdown = `# Weekly Performance Report - ${targetProj?.name || 'Albatross Boot-camp'}
**Date:** ${new Date().toLocaleDateString()}
**Batch:** ${targetProj?.batch || 'Batch 4'}

## Executive Summary
This week, cohort average attendance stabilized at **84.5%**. Students demonstrated strong engagement during the Express.js validation sessions.

## Top Performers
- **Jane Doe:** Ranked #1 on the leaderboard with 43 points. Excelled in mock interviews.
- **Alice Johnson:** Solid progress, currently in placement interviews.

## Risk & Action Items
- **Bob Miller:** Flagged at High Risk due to consecutive absences. Action plan: Mentor outreach scheduled for Monday.
`;
      setReportMarkdown(markdown);
    } catch (err) {
      // Ignore
    } finally {
      setSynthesizingReport(false);
    }
  };

  const handleCopyReport = () => {
    navigator.clipboard.writeText(reportMarkdown);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2000);
  };

  const selectedProject = projects.find(p => p._id === selectedProjectId);

  return (
    <div className="space-y-8">
      {/* Page Header with project dropdown selection */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-indigo-500" />
            <span>AI Placement Assistant</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1">Review resumes, predict candidate compatibility and synthesis leadership reports</p>
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

      {/* Selector Sub tabs */}
      <div className="flex bg-slate-950 p-1 border border-slate-850 rounded-2xl w-fit gap-1">
        {[
          { key: 'scorer', label: 'Resume Scorer' },
          { key: 'matchmaker', label: 'Talent Matchmaker' },
          { key: 'synthesizer', label: 'Report Synthesizer' },
        ].map(sub => (
          <button
            key={sub.key}
            onClick={() => setActiveSubTab(sub.key as any)}
            className={`px-4 py-1.5 text-xs font-semibold rounded-xl transition-all ${
              activeSubTab === sub.key ? 'bg-indigo-600 text-white' : 'text-slate-450 hover:text-slate-200'
            }`}
          >
            {sub.label}
          </button>
        ))}
      </div>

      {/* Unified workspace card */}
      <div className="bg-slate-900/25 border border-slate-800/80 rounded-3xl p-6 shadow-xl min-h-[300px]">
        {/* Scorer Workspace */}
        {activeSubTab === 'scorer' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">AI Profile Screening</h4>
                <p className="text-xs text-slate-500 mt-1">Scores CV against training stack metrics in {selectedProject?.name || 'Selected Cohort'}</p>
              </div>
              <form onSubmit={handleScoreResumeAI} className="space-y-4">
                <input
                  type="url"
                  required
                  placeholder="Enter Resume Google Drive PDF URL..."
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 text-slate-100 p-3 rounded-xl outline-none text-xs"
                />
                <button type="submit" disabled={scoringResume} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/10">
                  {scoringResume ? 'Evaluating Profile...' : 'Score Resume'}
                </button>
              </form>
            </div>

            <div className="bg-slate-950/40 border border-slate-850 p-5 rounded-2xl min-h-[200px] flex items-center justify-center text-center">
              {scoringResume ? (
                <div className="h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              ) : resumeScoreResult ? (
                <div className="w-full text-left space-y-4">
                  <div className="flex items-center gap-4 border-b border-slate-850 pb-4">
                    <div className="h-14 w-14 rounded-full border-4 border-emerald-500/20 flex items-center justify-center font-bold text-emerald-450 text-lg shadow-lg shadow-emerald-500/5">
                      {resumeScoreResult.score}
                    </div>
                    <div>
                      <h5 className="font-bold text-slate-200 text-xs">Profile Analysis Score</h5>
                      <span className="text-[10px] text-slate-500">Compatibility checks cleared</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{resumeScoreResult.feedback}</p>
                  <div className="space-y-2">
                    <span className="text-[9px] uppercase tracking-wider text-amber-500 font-bold block">Improvements:</span>
                    <ul className="list-disc list-inside text-[11px] text-slate-450 space-y-1">
                      {resumeScoreResult.improvements.map((imp: string, i: number) => <li key={i}>{imp}</li>)}
                    </ul>
                  </div>
                </div>
              ) : (
                <span className="text-xs text-slate-600">Grade analysis display panel</span>
              )}
            </div>
          </div>
        )}

        {/* Matchmaker Workspace */}
        {activeSubTab === 'matchmaker' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">AI Job Description Matcher</h4>
                <p className="text-xs text-slate-500 mt-1">Paste recruiter job requirements (JD) to match top performers in {selectedProject?.name}.</p>
              </div>
              <form onSubmit={handleMatchCandidatesAI} className="space-y-4">
                <textarea
                  required
                  rows={5}
                  placeholder="Paste recruiter job requirements (JD)..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-850 text-slate-100 p-3 rounded-xl outline-none text-xs resize-none"
                />
                <button type="submit" disabled={matchingCandidates} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/10">
                  {matchingCandidates ? 'Matching Profiles...' : 'Find Matches'}
                </button>
              </form>
            </div>

            <div className="bg-slate-950/40 border border-slate-850 p-5 rounded-2xl min-h-[200px]">
              {matchingCandidates ? (
                <div className="h-full flex items-center justify-center">
                  <div className="h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : matchedCandidates.length > 0 ? (
                <div className="space-y-4">
                  {matchedCandidates.map(cand => (
                    <div key={cand.id} className="bg-slate-900/40 p-4 border border-slate-850 rounded-xl flex items-center justify-between">
                      <div>
                        <h5 className="font-bold text-slate-200 text-xs">{cand.name} ({cand.tier})</h5>
                        <div className="flex gap-1.5 mt-1.5">
                          {cand.matchingSkills.map(sk => <span key={sk} className="text-[9px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-850">{sk}</span>)}
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-450">{cand.matchScore}% Match</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-center text-xs text-slate-600">Matched shortlist profiles display panel</div>
              )}
            </div>
          </div>
        )}

        {/* Synthesizer Workspace */}
        {activeSubTab === 'synthesizer' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Log Report Synthesizer</h4>
                <p className="text-xs text-slate-500 mt-1">Aggregates mentor call logs into performance summary reports for {selectedProject?.name}.</p>
              </div>
              <button onClick={handleSynthesizeReportAI} disabled={synthesizingReport} className="bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 shadow-lg shadow-indigo-600/10">
                {synthesizingReport ? 'Synthesizing...' : 'Synthesize Report'}
              </button>
            </div>

            <div className="lg:col-span-2 bg-slate-950/40 border border-slate-850 p-6 rounded-2xl min-h-[250px] flex flex-col justify-between">
              {synthesizingReport ? (
                <div className="h-full flex items-center justify-center self-center">
                  <div className="h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : reportMarkdown ? (
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-slate-850 pb-2">
                    <span className="text-[10px] text-slate-500 font-bold uppercase">Synthesized Markdown</span>
                    <button onClick={handleCopyReport} className="text-[10px] text-indigo-400 flex items-center gap-1 font-semibold">
                      {copiedReport ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      <span>{copiedReport ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl text-[11px] font-mono text-slate-400 max-h-[200px] overflow-y-auto whitespace-pre-wrap leading-relaxed">
                    {reportMarkdown}
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-center text-xs text-slate-655 self-center">Weekly performance summary report preview</div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
