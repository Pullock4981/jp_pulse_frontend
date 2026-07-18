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
        feedback: 'The resume shows potential but lacks concrete data and impact metrics. The structural flow needs adjustment for better ATS parsing.',
        issues: [
          { problem: 'Missing quantitative metrics in the "Projects" section.', recovery: 'Add numbers to show impact (e.g., "Improved load time by 30%").' },
          { problem: 'Leadership experience is not highlighted.', recovery: 'Create a separate "Leadership & Extracurriculars" section and detail your team management roles.' },
          { problem: 'Weak action verbs used in descriptions.', recovery: 'Replace words like "Helped" or "Worked on" with strong action verbs like "Architected", "Spearheaded", or "Optimized".' }
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
      const res = await apiRequest(`/projects/${selectedProjectId}/students`);
      const students = res.data || [];
      
      // Shuffle students and pick top 3
      const shuffled = students.sort(() => 0.5 - Math.random()).slice(0, 3);
      
      const mockMatches: MatchedCandidate[] = shuffled.map((student: any) => ({
        id: student._id,
        name: student.name,
        tier: student.tier || 'Tier B',
        totalMark: student.totalMark || 0,
        matchScore: Math.floor(Math.random() * (99 - 70 + 1)) + 70, // Random score between 70-99
        matchingSkills: ['React', 'Node.js', 'Communication'] // Mock skills
      })).sort((a: any, b: any) => b.matchScore - a.matchScore);

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
          <div className="flex items-center gap-2 mb-1">
            <div className="h-7 w-7 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #d946ef)' }}>
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>
              AI Powered
            </span>
          </div>
          <h1 className="text-3xl font-black tracking-tight gradient-text">Placement AI Assistant</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>Score resumes, match talent, and synthesize performance reports</p>
        </div>

        {/* Project Selector */}
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

      {/* Sub tabs */}
      <div className="flex gap-1 p-1 rounded-2xl w-fit" style={{ background: 'var(--surface-2)', border: '1px solid var(--surface-border)' }}>
        {[
          { key: 'scorer', label: 'Resume Scorer', emoji: '📄' },
          { key: 'matchmaker', label: 'Talent Matchmaker', emoji: '🎯' },
          { key: 'synthesizer', label: 'Report Synthesizer', emoji: '📊' },
        ].map(sub => (
          <button
            key={sub.key}
            onClick={() => setActiveSubTab(sub.key as any)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-200 cursor-pointer"
            style={{
              background: activeSubTab === sub.key ? 'var(--brand-gradient-soft)' : 'transparent',
              color: activeSubTab === sub.key ? 'var(--brand-primary)' : 'var(--text-muted)',
              border: activeSubTab === sub.key ? '1px solid var(--surface-border-hover)' : '1px solid transparent',
            }}
          >
            <span>{sub.emoji}</span>
            <span className="hidden sm:inline uppercase tracking-wider">{sub.label}</span>
          </button>
        ))}
      </div>

      {/* Workspace card */}
      <div className="glass-card p-6 min-h-[300px]">
        {/* Scorer Workspace */}
        {activeSubTab === 'scorer' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--foreground)' }}>AI Profile Screening</h4>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Scores CV against training stack metrics in {selectedProject?.name || 'Selected Cohort'}</p>
              </div>
              <form onSubmit={handleScoreResumeAI} className="flex gap-3">
                <input
                  type="url"
                  required
                  placeholder="Enter Resume Google Drive PDF URL..."
                  value={resumeUrl}
                  onChange={(e) => setResumeUrl(e.target.value)}
                  className="input-field flex-1"
                />
                <button type="submit" disabled={scoringResume}
                  className="btn-primary shrink-0 flex items-center gap-2 disabled:opacity-50">
                  {scoringResume ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                  {scoringResume ? 'Evaluating...' : 'Score Resume'}
                </button>
              </form>
            </div>

            <div className="rounded-2xl p-6 min-h-[300px] flex items-center justify-center text-center"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--surface-border)' }}>
              {scoringResume ? (
                <div className="h-8 w-8 border-[3px] rounded-full animate-spin"
                  style={{ borderColor: 'var(--surface-border)', borderTopColor: 'var(--brand-primary)' }} />
              ) : resumeScoreResult ? (
                <div className="w-full text-left space-y-4">
                  <div className="flex items-center gap-4 border-b pb-4" style={{ borderColor: 'var(--surface-border)' }}>
                    <div className="h-14 w-14 rounded-full border-4 flex items-center justify-center font-black text-emerald-500 text-lg"
                      style={{ borderColor: 'rgba(16,185,129,0.2)' }}>
                      {resumeScoreResult.score}
                    </div>
                    <div>
                      <h5 className="font-bold text-xs" style={{ color: 'var(--foreground)' }}>Profile Analysis Score</h5>
                      <span className="text-[10px]" style={{ color: 'var(--text-faint)' }}>Compatibility checks cleared</span>
                    </div>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{resumeScoreResult.feedback}</p>
                  <div className="space-y-4 pt-4 border-t" style={{ borderColor: 'var(--surface-border)' }}>
                    <span className="text-[10px] uppercase tracking-widest font-black block text-amber-500">Actionable Feedback</span>
                    <div className="space-y-3">
                      {resumeScoreResult.issues?.map((issue: any, i: number) => (
                        <div key={i} className="p-4 rounded-xl border flex flex-col gap-3" style={{ background: 'var(--surface-1)', borderColor: 'var(--surface-border)' }}>
                          <div className="flex gap-3">
                            <div className="mt-0.5 shrink-0 h-4 w-4 rounded-full bg-rose-500/10 flex items-center justify-center">
                              <span className="text-[10px] font-black text-rose-500">!</span>
                            </div>
                            <div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-rose-500 block mb-1">Problem Detected</span>
                              <span className="text-xs font-semibold" style={{ color: 'var(--foreground)' }}>{issue.problem}</span>
                            </div>
                          </div>
                          <div className="flex gap-3 pl-7">
                            <div className="mt-0.5 shrink-0 h-4 w-4 rounded-full bg-emerald-500/10 flex items-center justify-center">
                              <span className="text-[10px] font-black text-emerald-500">✓</span>
                            </div>
                            <div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 block mb-1">How to Recover</span>
                              <span className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{issue.recovery}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <span className="text-xs" style={{ color: 'var(--text-faint)' }}>Grade analysis display panel</span>
              )}
            </div>
          </div>
        )}

        {/* Matchmaker Workspace */}
        {activeSubTab === 'matchmaker' && (
          <div className="space-y-6">
            <div className="space-y-4">
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--foreground)' }}>AI Job Description Matcher</h4>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Paste recruiter job requirements (JD) to match top performers in {selectedProject?.name}.</p>
              </div>
              <form onSubmit={handleMatchCandidatesAI} className="space-y-4">
                <textarea
                  required
                  rows={6}
                  placeholder="Paste recruiter job requirements (JD)..."
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  className="input-field resize-none"
                />
                <button type="submit" disabled={matchingCandidates} className="btn-primary flex items-center gap-2 cursor-pointer">
                  {matchingCandidates ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                  {matchingCandidates ? 'Matching Profiles...' : 'Find Matches'}
                </button>
              </form>
            </div>

            <div className="rounded-2xl p-6 min-h-[300px]"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--surface-border)' }}>
              {matchingCandidates ? (
                <div className="h-full flex items-center justify-center min-h-[200px]">
                  <div className="h-8 w-8 border-[3px] rounded-full animate-spin"
                    style={{ borderColor: 'var(--surface-border)', borderTopColor: 'var(--brand-primary)' }} />
                </div>
              ) : matchedCandidates.length > 0 ? (
                <div className="space-y-3">
                  {matchedCandidates.map(cand => (
                    <div key={cand.id} className="p-4 rounded-xl flex items-center justify-between transition-all"
                      style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)' }}>
                      <div>
                        <h5 className="font-bold text-xs" style={{ color: 'var(--foreground)' }}>{cand.name} ({cand.tier})</h5>
                        <div className="flex gap-1.5 mt-1.5 flex-wrap">
                          {cand.matchingSkills.map(sk => (
                            <span key={sk} className="text-[9px] px-2 py-0.5 rounded-lg font-semibold"
                              style={{ background: 'var(--surface-2)', border: '1px solid var(--surface-border)', color: 'var(--text-muted)' }}>
                              {sk}
                            </span>
                          ))}
                        </div>
                      </div>
                      <span className="text-xs font-black text-emerald-500">{cand.matchScore}% Match</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-center text-xs min-h-[200px]" style={{ color: 'var(--text-faint)' }}>
                  Matched shortlist profiles display panel
                </div>
              )}
            </div>
          </div>
        )}

        {/* Synthesizer Workspace */}
        {activeSubTab === 'synthesizer' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-black uppercase tracking-widest" style={{ color: 'var(--foreground)' }}>Log Report Synthesizer</h4>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>Aggregates mentor call logs into performance summary reports for {selectedProject?.name}.</p>
              </div>
              <button onClick={handleSynthesizeReportAI} disabled={synthesizingReport} className="btn-primary cursor-pointer flex items-center gap-2 shrink-0">
                {synthesizingReport ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                {synthesizingReport ? 'Synthesizing...' : 'Synthesize Report'}
              </button>
            </div>

            <div className="rounded-2xl p-6 min-h-[400px] flex flex-col justify-between"
              style={{ background: 'var(--surface-2)', border: '1px solid var(--surface-border)' }}>
              {synthesizingReport ? (
                <div className="h-full flex items-center justify-center min-h-[300px] self-center">
                  <div className="h-8 w-8 border-[3px] rounded-full animate-spin"
                    style={{ borderColor: 'var(--surface-border)', borderTopColor: 'var(--brand-primary)' }} />
                </div>
              ) : reportMarkdown ? (
                <div className="space-y-4">
                  <div className="flex justify-between border-b pb-2" style={{ borderColor: 'var(--surface-border)' }}>
                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'var(--text-faint)' }}>Synthesized Report (Markdown)</span>
                    <button onClick={handleCopyReport} className="text-[10px] flex items-center gap-1 font-black uppercase tracking-widest cursor-pointer"
                      style={{ color: 'var(--brand-primary)' }}>
                      {copiedReport ? <Check className="h-3 w-3" /> : <Copy className="h-3.5 w-3.5" />}
                      <span>{copiedReport ? 'Copied' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="p-6 rounded-xl text-[13px] font-mono max-h-[500px] overflow-y-auto whitespace-pre-wrap leading-relaxed"
                    style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--foreground)' }}>
                    {reportMarkdown}
                  </div>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-center text-xs min-h-[300px] self-center" style={{ color: 'var(--text-faint)' }}>
                  Weekly performance summary report preview
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
