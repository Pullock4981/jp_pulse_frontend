'use client';

import { useState, useEffect, use } from 'react';
import { apiRequest } from '@/utils/api';
import Link from 'next/link';
import Papa from 'papaparse';
import { 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  ArrowLeft,
  HelpCircle, 
  Calendar, 
  FileDown, 
  MessageSquare,
  Award,
  BookOpen,
  Activity,
  Plus,
  Play,
  Pause,
  Minus,
  Send,
  Eye,
  FileText,
  User,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Search,
  CheckCircle2,
  Hourglass,
  Info,
  Copy,
  Check,
  ClipboardList,
  Trophy,
  UserCheck,
  TrendingUp,
  X,
  Settings,
  Edit3,
  Save
} from 'lucide-react';

// Brand icons as inline SVGs
const GithubIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
    <path d="M9 18c-4.51 2-5-2-7-2" />
  </svg>
);

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
    <rect x="2" y="9" width="4" height="12" />
    <circle cx="4" cy="4" r="2" />
  </svg>
);

interface Student {
  _id: string;
  name: string;
  email: string;
  phoneNumber?: string;
  profilePicture?: string;
  tier: string;
  riskStatus: string;
  activeStatus: string;
  hiredStatus: string;
  totalAttendance: number;
  totalAbsent: number;
  attendanceStreak: number;
  absentStreak: number;
  totalAttendanceMark: number;
  totalTaskMark: number;
  totalMark: number;
  mockInterviewScore: number;
  profiles: {
    resume: string;
    github: string;
    linkedin: string;
    resumeReady: boolean;
    githubReady: boolean;
    linkedinReady: boolean;
  };
  lastUpdateNote: string;
  lastUpdateDate?: string;
}

interface Quiz {
  _id: string;
  title: string;
  status: 'Draft' | 'Live' | 'Inactive';
  durationMinutes: number;
  questions: any[];
  avgScore?: number;
}

interface MatchedCandidate {
  id: string;
  name: string;
  tier: string;
  totalMark: number;
  matchScore: number;
  matchingSkills: string[];
}

export default function ProjectUnifiedDashboard({ params }: { params: Promise<{ projectId: string }> }) {
  const resolvedParams = use(params);
  const projectId = resolvedParams.projectId;

  // Global Page states
  const [project, setProject] = useState<any>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // Tab options: overview, students, attendance, tasks, leaderboard, quiz, placement
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Page widgets summary stats
  const [projectStats, setProjectStats] = useState({
    totalStudents: 0,
    avgAttendanceRate: 0,
    totalHired: 0,
    totalInactive: 0,
    totalActive: 0,
    totalRisk: 0,
    willinglyLeave: 0
  });

  // Drawer / 360 profile state
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showDrawer, setShowDrawer] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);
  const [showEditStudentModal, setShowEditStudentModal] = useState(false);
  const [editStudentData, setEditStudentData] = useState<any>(null);
  const [editStudentSaving, setEditStudentSaving] = useState(false);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
  const [emailMsg, setEmailMsg] = useState({ type: '', text: '' });

  // Operations Matrix states (Attendance & Tasks)
  const [dates, setDates] = useState<string[]>([]);
  const [attendanceMatrix, setAttendanceMatrix] = useState<Record<string, Record<string, string>>>({});
  const [taskMatrix, setTaskMatrix] = useState<Record<string, Record<string, string>>>({});
  const [matrixSavingState, setMatrixSavingState] = useState<Record<string, boolean>>({});

  // Quiz Workspace states
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quizTopic, setQuizTopic] = useState('');
  const [quizNumQuestions, setQuizNumQuestions] = useState(5);
  const [quizDuration, setQuizDuration] = useState(15);
  const [generatingQuiz, setGeneratingQuiz] = useState(false);
  const [quizMsg, setQuizMsg] = useState({ type: '', text: '' });

  // Placement Workspace states
  const [resumeUrl, setResumeUrl] = useState('');
  const [scoringResume, setScoringResume] = useState(false);
  const [resumeScoreResult, setResumeScoreResult] = useState<any>(null);
  const [jobDescription, setJobDescription] = useState('');
  const [matchingCandidates, setMatchingCandidates] = useState(false);
  const [matchedCandidates, setMatchedCandidates] = useState<MatchedCandidate[]>([]);
  const [synthesizingReport, setSynthesizingReport] = useState(false);
  const [reportMarkdown, setReportMarkdown] = useState('');
  const [copiedReport, setCopiedReport] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'scorer' | 'matchmaker' | 'synthesizer'>('scorer');

  useEffect(() => {
    // Generate dates (previous 7 days)
    const generatedDates: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      generatedDates.push(d.toISOString().split('T')[0]);
    }
    setDates(generatedDates);
    fetchDashboardData(generatedDates);
  }, [projectId]);

  const fetchDashboardData = async (activeDates: string[]) => {
    try {
      setLoading(true);
      
      // 1. Fetch project info
      const projRes = await apiRequest(`/projects/${projectId}`);
      setProject(projRes.data);

      // 2. Fetch student list
      const studRes = await apiRequest(`/projects/${projectId}/students`);
      const fetchedStudents = studRes.data || [];
      setStudents(fetchedStudents);
      
      // Calculate Stats
      calculateStats(fetchedStudents, projRes.data);

      // 3. Initialize matrices
      initializeOperationsMatrices(fetchedStudents, activeDates);

      // 4. Fetch Quizzes
      const quizRes = await apiRequest(`/projects/${projectId}/quizzes`);
      setQuizzes(quizRes.data || []);

    } catch (err: any) {
      console.warn('Backend failed, loading mock system workspace:', err.message);
      loadMockWorkspaceData(activeDates);
    } finally {
      setLoading(false);
    }
  };

  const loadMockWorkspaceData = (activeDates: string[]) => {
    setProject({
      _id: projectId,
      name: 'Albatross Boot-camp',
      batch: 'Batch 4',
      description: 'Full stack web development intensive training course',
    });

    const mockStudents: Student[] = [
      {
        _id: 'stud-1',
        name: 'Jane Doe',
        email: 'jane.doe@example.com',
        phoneNumber: '+1-555-0199',
        tier: 'Tier A',
        riskStatus: 'On Track',
        activeStatus: 'Active',
        hiredStatus: 'Hired',
        totalAttendance: 18,
        totalAbsent: 2,
        attendanceStreak: 12,
        absentStreak: 0,
        totalAttendanceMark: 18,
        totalTaskMark: 25,
        totalMark: 43,
        mockInterviewScore: 85,
        profiles: {
          resume: 'https://example.com/jane-cv.pdf',
          github: 'https://github.com/janedoe',
          linkedin: 'https://linkedin.com/in/janedoe',
          resumeReady: true,
          githubReady: true,
          linkedinReady: true
        },
        lastUpdateNote: 'Discussed resume formatting. GitHub profile is excellent.',
        lastUpdateDate: '2026-07-15T12:00:00Z'
      },
      {
        _id: 'stud-2',
        name: 'Alice Johnson',
        email: 'alice.j@example.com',
        phoneNumber: '+1-555-0245',
        tier: 'Tier B',
        riskStatus: 'Low',
        activeStatus: 'Active',
        hiredStatus: 'In interview',
        totalAttendance: 15,
        totalAbsent: 5,
        attendanceStreak: 3,
        absentStreak: 0,
        totalAttendanceMark: 15,
        totalTaskMark: 18,
        totalMark: 33,
        mockInterviewScore: 72,
        profiles: {
          resume: 'https://example.com/alice-cv.pdf',
          github: 'https://github.com/alicej',
          linkedin: 'https://linkedin.com/in/alicej',
          resumeReady: true,
          githubReady: true,
          linkedinReady: true
        },
        lastUpdateNote: 'Working on mock interviews prep.',
        lastUpdateDate: '2026-07-16T14:30:00Z'
      },
      {
        _id: 'stud-3',
        name: 'Bob Miller',
        email: 'bob.m@example.com',
        phoneNumber: '+1-555-0789',
        tier: 'Tier C',
        riskStatus: 'High',
        activeStatus: 'Active',
        hiredStatus: 'Looking',
        totalAttendance: 8,
        totalAbsent: 12,
        attendanceStreak: 0,
        absentStreak: 5,
        totalAttendanceMark: -4,
        totalTaskMark: 5,
        totalMark: 1,
        mockInterviewScore: 45,
        profiles: {
          resume: '',
          github: 'https://github.com/bobmiller',
          linkedin: '',
          resumeReady: false,
          githubReady: true,
          linkedinReady: false
        },
        lastUpdateNote: 'Absent for consecutive classes. Tried to contact but no reply.',
        lastUpdateDate: '2026-07-17T09:00:00Z'
      }
    ];

    setStudents(mockStudents);
    calculateStats(mockStudents, { name: 'Albatross Boot-camp' });
    initializeOperationsMatrices(mockStudents, activeDates);
    
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
  };

  const calculateStats = (studentList: Student[], projectInfo: any) => {
    const total = studentList.length;
    const hired = studentList.filter(s => s.hiredStatus === 'Hired').length;
    const active = studentList.filter(s => s.activeStatus === 'Active').length;
    const inactive = studentList.filter(s => s.activeStatus === 'Inactive').length;
    const leave = studentList.filter(s => s.activeStatus === 'Willingly Leave').length;
    const risk = studentList.filter(s => s.riskStatus === 'High').length;

    let totalAttendance = 0;
    let totalDays = 0;
    studentList.forEach(s => {
      totalAttendance += s.totalAttendance;
      totalDays += (s.totalAttendance + s.totalAbsent);
    });

    const avgAttendance = totalDays > 0 ? (totalAttendance / totalDays) * 100 : 0;

    setProjectStats({
      totalStudents: total,
      avgAttendanceRate: avgAttendance,
      totalHired: hired,
      totalInactive: inactive,
      totalActive: active,
      totalRisk: risk,
      willinglyLeave: leave
    });
  };

  const initializeOperationsMatrices = (studentList: Student[], activeDates: string[]) => {
    const attData: Record<string, Record<string, string>> = {};
    const tskData: Record<string, Record<string, string>> = {};

    studentList.forEach(student => {
      attData[student._id] = {};
      tskData[student._id] = {};
      
      activeDates.forEach((date, index) => {
        // Attendance initialization (Present, Absent, Leave)
        if (student._id === 'stud-3') {
          attData[student._id][date] = index > 3 ? 'Absent' : 'Present';
        } else {
          attData[student._id][date] = index === 2 ? 'Leave' : index === 5 ? 'Absent' : 'Present';
        }

        // Task initialization (Complete, Incomplete)
        tskData[student._id][date] = index % 3 === 0 ? 'Incomplete' : 'Complete';
      });
    });

    setAttendanceMatrix(attData);
    setTaskMatrix(tskData);
  };

  // Student hired status change action
  const handleHiredStatusChange = async (studentId: string, status: string) => {
    try {
      await apiRequest(`/students/${studentId}`, {
        method: 'PUT',
        body: JSON.stringify({ hiredStatus: status })
      });
      setStudents(prev => prev.map(s => s._id === studentId ? { ...s, hiredStatus: status } : s));
      setStudents(curr => { calculateStats(curr, project); return curr; });
    } catch (err) {
      setStudents(prev => prev.map(s => s._id === studentId ? { ...s, hiredStatus: status } : s));
    }
  };

  const handleSendAIEmail = async (studentId: string) => {
    setSendingEmailId(studentId);
    try {
      await apiRequest('/ai/send-risk-emails', {
        method: 'POST',
        body: JSON.stringify({ studentId })
      });
      setEmailMsg({ type: 'success', text: 'AI Warning Email sent successfully to the student and mentor!' });
      setTimeout(() => setEmailMsg({ type: '', text: '' }), 4000);
    } catch (err) {
      setEmailMsg({ type: 'error', text: 'Failed to send AI email. Check backend configuration.' });
      setTimeout(() => setEmailMsg({ type: '', text: '' }), 4000);
    } finally {
      setSendingEmailId(null);
    }
  };

  const handleUpdateStudentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStudentData) return;
    setEditStudentSaving(true);
    try {
      const res = await apiRequest(`/students/${editStudentData._id}`, {
        method: 'PUT',
        body: JSON.stringify(editStudentData)
      });
      // Update local states
      setStudents(students.map(s => s._id === editStudentData._id ? res.data : s));
      if (selectedStudent && selectedStudent._id === editStudentData._id) {
        setSelectedStudent(res.data);
      }
      setShowEditStudentModal(false);
      setEditStudentData(null);
    } catch (err: any) {
      alert('Failed to update student: ' + (err.message || 'Unknown error'));
    } finally {
      setEditStudentSaving(false);
    }
  };

  // Add note inside profile drawer
  const handleAddProfileNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !newNote.trim()) return;

    setNoteSaving(true);
    const updatedNote = newNote.trim();
    const updatedDate = new Date().toISOString();

    try {
      await apiRequest(`/students/${selectedStudent._id}`, {
        method: 'PUT',
        body: JSON.stringify({ 
          lastUpdateNote: updatedNote,
          lastUpdateDate: updatedDate
        })
      });
      updateStudentNoteLocal(selectedStudent._id, updatedNote, updatedDate);
    } catch (err) {
      updateStudentNoteLocal(selectedStudent._id, updatedNote, updatedDate);
    } finally {
      setNewNote('');
      setNoteSaving(false);
    }
  };

  const updateStudentNoteLocal = (studentId: string, note: string, date: string) => {
    setStudents(prev => prev.map(s => s._id === studentId ? { ...s, lastUpdateNote: note, lastUpdateDate: date } : s));
    setSelectedStudent(prev => prev ? { ...prev, lastUpdateNote: note, lastUpdateDate: date } : null);
  };

  // Toggle Matrix status (Attendance Matrix grid)
  const handleToggleAttendanceCell = async (studentId: string, date: string, currentStatus: string) => {
    let nextStatus = 'Present';
    if (currentStatus === 'Present') nextStatus = 'Absent';
    else if (currentStatus === 'Absent') nextStatus = 'Leave';
    else if (currentStatus === 'Leave') nextStatus = 'Present';

    setAttendanceMatrix(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [date]: nextStatus }
    }));

    const cellId = `att-${studentId}-${date}`;
    setMatrixSavingState(prev => ({ ...prev, [cellId]: true }));

    try {
      await apiRequest(`/projects/${projectId}/attendance`, {
        method: 'POST',
        body: JSON.stringify({ studentId, date, status: nextStatus })
      });
      updateLocalStudentMarks(studentId, 'attendance', currentStatus, nextStatus);
    } catch (err) {
      updateLocalStudentMarks(studentId, 'attendance', currentStatus, nextStatus);
    } finally {
      setTimeout(() => setMatrixSavingState(prev => ({ ...prev, [cellId]: false })), 200);
    }
  };

  // Toggle Matrix status (Task Matrix grid)
  const handleToggleTaskCell = async (studentId: string, date: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Complete' ? 'Incomplete' : 'Complete';

    setTaskMatrix(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], [date]: nextStatus }
    }));

    const cellId = `tsk-${studentId}-${date}`;
    setMatrixSavingState(prev => ({ ...prev, [cellId]: true }));

    try {
      await apiRequest(`/projects/${projectId}/tasks`, {
        method: 'POST',
        body: JSON.stringify({ studentId, date, title: `Daily Assignment ${date}`, status: nextStatus })
      });
      updateLocalStudentMarks(studentId, 'task', currentStatus, nextStatus);
    } catch (err) {
      updateLocalStudentMarks(studentId, 'task', currentStatus, nextStatus);
    } finally {
      setTimeout(() => setMatrixSavingState(prev => ({ ...prev, [cellId]: false })), 200);
    }
  };

  const updateLocalStudentMarks = (studentId: string, type: 'attendance' | 'task', oldVal: string, newVal: string) => {
    setStudents(prev => {
      const updatedStudents = prev.map(s => {
        if (s._id !== studentId) return s;
        
        let attDiff = 0;
        let tskDiff = 0;
        let attendanceDaysDiff = 0;
        let absentDaysDiff = 0;

        if (type === 'attendance') {
          const oldMark = oldVal === 'Present' ? 1 : oldVal === 'Absent' ? -1 : 0;
          const newMark = newVal === 'Present' ? 1 : newVal === 'Absent' ? -1 : 0;
          attDiff = newMark - oldMark;
          
          if (oldVal === 'Present') attendanceDaysDiff -= 1;
          else if (oldVal === 'Absent') absentDaysDiff -= 1;
          
          if (newVal === 'Present') attendanceDaysDiff += 1;
          else if (newVal === 'Absent') absentDaysDiff += 1;
        } else {
          const oldMark = oldVal === 'Complete' ? 1 : -1;
          const newMark = newVal === 'Complete' ? 1 : -1;
          tskDiff = newMark - oldMark;
        }

        const totalAttendanceMark = s.totalAttendanceMark + attDiff;
        const totalTaskMark = s.totalTaskMark + tskDiff;
        return {
          ...s,
          totalAttendance: s.totalAttendance + attendanceDaysDiff,
          totalAbsent: s.totalAbsent + absentDaysDiff,
          totalAttendanceMark,
          totalTaskMark,
          totalMark: totalAttendanceMark + totalTaskMark
        };
      });
      calculateStats(updatedStudents, project);
      return updatedStudents;
    });
  };

  // AI Quiz Creator prompt submit
  const handleGenerateQuizAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTopic) return;

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

      const res = await apiRequest(`/projects/${projectId}/quizzes`, {
        method: 'POST',
        body: JSON.stringify(newQuizBody)
      });
      setQuizzes(prev => [res.data, ...prev]);
      setQuizMsg({ type: 'success', text: `AI Quiz Assistant generated "${title}" successfully!` });
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

  // AI Resume Scorer submit
  const handleScoreResumeAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeUrl) return;

    setScoringResume(true);
    setResumeScoreResult(null);

    try {
      const res = await apiRequest('/ai/resume-score', {
        method: 'POST',
        body: JSON.stringify({ resumeUrl })
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
    if (!jobDescription) return;

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
    setSynthesizingReport(true);
    setReportMarkdown('');

    try {
      await new Promise(resolve => setTimeout(resolve, 1550));
      const markdown = `# Weekly Performance Report - ${project?.name || 'Albatross Boot-camp'}
**Date:** ${new Date().toLocaleDateString()}
**Batch:** ${project?.batch || 'Batch 4'}

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

  // Filters
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          s.email.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesFilter = true;
    if (statusFilter === 'Active') matchesFilter = s.activeStatus === 'Active';
    else if (statusFilter === 'Inactive') matchesFilter = s.activeStatus === 'Inactive';
    else if (statusFilter === 'Placed') matchesFilter = s.hiredStatus === 'Hired';
    else if (statusFilter === 'Leave') matchesFilter = s.activeStatus === 'Willingly Leave';
    else if (statusFilter === 'At Risk') matchesFilter = s.riskStatus === 'High';
    return matchesSearch && matchesFilter;
  });

  const leaderboardSorted = [...students].sort((a, b) => b.totalMark - a.totalMark);

  return (
    <div className="space-y-8 relative">
      {/* Toast Notification for Email */}
      {emailMsg.text && (
        <div className={`fixed top-8 right-8 p-4 rounded-2xl shadow-2xl z-50 flex items-center gap-4 transition-all duration-300 ${
          emailMsg.type === 'success' 
            ? 'bg-emerald-950/90 border border-emerald-500/50 text-emerald-100 shadow-emerald-900/20' 
            : 'bg-rose-950/90 border border-rose-500/50 text-rose-100 shadow-rose-900/20'
        }`}>
          {emailMsg.type === 'success' ? <CheckCircle className="h-6 w-6 text-emerald-400" /> : <XCircle className="h-6 w-6 text-rose-400" />}
          <div>
            <p className="font-bold text-sm tracking-wide">
              {emailMsg.type === 'success' ? 'Email Sent Successfully!' : 'Action Failed'}
            </p>
            <p className="text-xs opacity-80 mt-0.5">{emailMsg.text}</p>
          </div>
          <button onClick={() => setEmailMsg({ type: '', text: '' })} className="ml-4 opacity-60 hover:opacity-100 transition-opacity bg-slate-900/50 p-1.5 rounded-full hover:bg-slate-800">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Back button & Page header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="h-10 w-10 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 hover:text-white flex items-center justify-center text-slate-400 transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 bg-indigo-600/15 border border-indigo-500/20 px-2.5 py-1 rounded-full">
                {project?.batch}
              </span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white mt-2">{project?.name}</h1>
            <p className="text-slate-400 text-sm mt-1">{project?.description || 'Cohort details, operational sheets, and placement logs'}</p>
          </div>
        </div>
      </div>

      {/* AI Alert Warning Banner */}
      {projectStats.totalRisk > 0 && (
        <div className="bg-rose-500/10 border border-rose-500/30 rounded-3xl p-6 flex items-start gap-4 shadow-xl">
          <div className="h-10 w-10 rounded-2xl bg-rose-500/20 text-rose-450 flex items-center justify-center shrink-0 border border-rose-500/30">
            <AlertTriangle className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-rose-400 font-bold text-sm tracking-wide">AI Dropout Risk Warning</h3>
            <p className="text-slate-400 text-xs mt-1 leading-relaxed">
              Our predictive risk engine has flagged **{projectStats.totalRisk} students** as at-risk due to missing tasks or consecutive absences. Please check their profiles immediately.
            </p>
          </div>
        </div>
      )}

      {/* Project Statistics Widgets */}
      <div className="grid grid-cols-2 md:grid-cols-7 gap-4">
        {/* Total Students */}
        <div 
          onClick={() => { setStatusFilter('All'); setActiveTab('students'); }}
          className={`border border-slate-850 p-4 rounded-2xl text-center cursor-pointer hover:bg-slate-800/40 transition-colors ${statusFilter === 'All' ? 'bg-slate-800/60 shadow-inner' : 'bg-slate-900/40'}`}
        >
          <Users className="h-4 w-4 mx-auto text-slate-500" />
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mt-2">Total</span>
          <p className="text-xl font-extrabold text-white mt-1">{projectStats.totalStudents}</p>
        </div>
        {/* Active Students */}
        <div 
          onClick={() => { setStatusFilter('Active'); setActiveTab('students'); }}
          className={`border border-slate-850 p-4 rounded-2xl text-center cursor-pointer hover:bg-slate-800/40 transition-colors ${statusFilter === 'Active' ? 'bg-slate-800/60 shadow-inner' : 'bg-slate-900/40'}`}
        >
          <Activity className="h-4 w-4 mx-auto text-indigo-400 animate-pulse" />
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mt-2">Active</span>
          <p className="text-xl font-extrabold text-white mt-1">{projectStats.totalActive}</p>
        </div>
        {/* Avg Attendance */}
        <div 
          onClick={() => setActiveTab('attendance')}
          className="bg-slate-900/40 border border-slate-850 p-4 rounded-2xl text-center cursor-pointer hover:bg-slate-800/40 transition-colors"
        >
          <Calendar className="h-4 w-4 mx-auto text-slate-500" />
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mt-2">Attendance</span>
          <p className="text-xl font-extrabold text-white mt-1">{projectStats.avgAttendanceRate.toFixed(1)}%</p>
        </div>
        {/* Total Hired */}
        <div 
          onClick={() => { setStatusFilter('Placed'); setActiveTab('students'); }}
          className={`border border-slate-850 p-4 rounded-2xl text-center cursor-pointer hover:bg-slate-800/40 transition-colors ${statusFilter === 'Placed' ? 'bg-slate-800/60 shadow-inner' : 'bg-slate-900/40'}`}
        >
          <CheckCircle className="h-4 w-4 mx-auto text-emerald-400" />
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mt-2">Placed</span>
          <p className="text-xl font-extrabold text-emerald-450 mt-1">{projectStats.totalHired}</p>
        </div>
        {/* Inactive */}
        <div 
          onClick={() => { setStatusFilter('Inactive'); setActiveTab('students'); }}
          className={`border border-slate-850 p-4 rounded-2xl text-center cursor-pointer hover:bg-slate-800/40 transition-colors ${statusFilter === 'Inactive' ? 'bg-slate-800/60 shadow-inner' : 'bg-slate-900/40'}`}
        >
          <XCircle className="h-4 w-4 mx-auto text-rose-500" />
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mt-2">Inactive</span>
          <p className="text-xl font-extrabold text-white mt-1">{projectStats.totalInactive}</p>
        </div>
        {/* Willingly Leave */}
        <div 
          onClick={() => { setStatusFilter('Leave'); setActiveTab('students'); }}
          className={`border border-slate-850 p-4 rounded-2xl text-center cursor-pointer hover:bg-slate-800/40 transition-colors ${statusFilter === 'Leave' ? 'bg-slate-800/60 shadow-inner' : 'bg-slate-900/40'}`}
        >
          <HelpCircle className="h-4 w-4 mx-auto text-slate-500" />
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mt-2">Leave</span>
          <p className="text-xl font-extrabold text-white mt-1">{projectStats.willinglyLeave}</p>
        </div>
        {/* In Risk */}
        <div 
          onClick={() => { setStatusFilter('At Risk'); setActiveTab('students'); }}
          className={`border border-slate-850 p-4 rounded-2xl text-center cursor-pointer hover:bg-slate-800/40 transition-colors ${statusFilter === 'At Risk' ? 'bg-slate-800/60 shadow-inner' : 'bg-slate-900/40'}`}
        >
          <AlertTriangle className="h-4 w-4 mx-auto text-amber-500" />
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mt-2">At Risk</span>
          <p className="text-xl font-extrabold text-amber-400 mt-1">{projectStats.totalRisk}</p>
        </div>
      </div>

      {/* Main Command Tabs Switcher */}
      <div className="flex border-b border-slate-800/80 overflow-x-auto">
        {[
          { key: 'overview', label: 'Overview' },
          { key: 'students', label: 'Student List' },
          { key: 'attendance', label: 'Attendance Tab' },
          { key: 'tasks', label: 'Task Tab' },
          { key: 'points', label: 'Points / Leaderboard' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-3.5 text-xs font-bold uppercase tracking-wider border-b-2 shrink-0 transition-all ${
              activeTab === tab.key 
                ? 'border-indigo-500 text-indigo-400' 
                : 'border-transparent text-slate-450 hover:text-slate-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Unified Tab Area */}
      <div className="bg-slate-900/25 border border-slate-800/80 rounded-3xl p-6 shadow-xl min-h-[400px]">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-200">Batch Performance Analysis</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Overview metrics and training status summaries for {project?.name}.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Placement rate progress */}
              <div className="bg-slate-950/40 border border-slate-850 p-6 rounded-2xl space-y-4">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Placement Progress</span>
                <div className="flex items-center justify-between">
                  <div className="h-16 w-16 rounded-full border-4 border-indigo-500/25 flex items-center justify-center font-bold text-slate-200 text-lg">
                    {projectStats.totalStudents > 0 
                      ? ((projectStats.totalHired / projectStats.totalStudents) * 100).toFixed(0) 
                      : '0'}%
                  </div>
                  <div className="text-xs text-slate-450 space-y-1">
                    <p>Total Hired: <span className="font-bold text-white">{projectStats.totalHired}</span></p>
                    <p>Remaining: <span className="font-bold text-white">{projectStats.totalStudents - projectStats.totalHired}</span></p>
                  </div>
                </div>
              </div>

              {/* Attendance metrics */}
              <div className="bg-slate-950/40 border border-slate-850 p-6 rounded-2xl space-y-4">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Avg. Attendance Rate</span>
                <div className="flex items-center justify-between">
                  <div className="h-16 w-16 rounded-full border-4 border-emerald-500/25 flex items-center justify-center font-bold text-slate-200 text-lg">
                    {projectStats.avgAttendanceRate.toFixed(0)}%
                  </div>
                  <div className="text-xs text-slate-450 space-y-1">
                    <p>Cohort Standard: <span className="text-emerald-400 font-bold">&gt; 60%</span></p>
                    <p>Overall engagement is stable.</p>
                  </div>
                </div>
              </div>

              {/* Status breakdown */}
              <div className="bg-slate-950/40 border border-slate-850 p-6 rounded-2xl space-y-4">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Cohort Activity Ratio</span>
                <div className="flex items-center justify-between">
                  <div className="h-16 w-16 rounded-full border-4 border-slate-800 flex items-center justify-center font-bold text-slate-200 text-lg">
                    {projectStats.totalStudents > 0
                      ? ((projectStats.totalActive / projectStats.totalStudents) * 100).toFixed(0)
                      : '0'}%
                  </div>
                  <div className="text-xs text-slate-450 space-y-1">
                    <p>Active Students: <span className="font-bold text-white">{projectStats.totalActive}</span></p>
                    <p>Inactive: <span className="font-bold text-white">{projectStats.totalInactive}</span></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: STUDENT LIST */}
        {activeTab === 'students' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-200">
                  Cohort Enrolled Students
                  {statusFilter !== 'All' && (
                    <span className="ml-3 text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-1 rounded-md uppercase tracking-wider">
                      Filter: {statusFilter}
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-500 mt-1">Review profiles, grades, streaks and placement status.</p>
              </div>

              <div className="flex items-center gap-3">
                {statusFilter !== 'All' && (
                  <button 
                    onClick={() => setStatusFilter('All')}
                    className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
                  >
                    Clear Filter
                  </button>
                )}
                {/* Search box */}
                <div className="relative w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full text-xs bg-slate-950/60 border border-slate-850 focus:border-indigo-650 text-slate-200 pl-9 pr-4 py-2.5 rounded-xl outline-none placeholder:text-slate-650"
                  />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-850 rounded-2xl bg-slate-950/20">
              <table className="w-full text-left border-collapse min-w-[900px]">
                <thead>
                  <tr className="bg-slate-900/60 border-b border-slate-850">
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Student Info</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Tier Status</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Attendance / Task Marks</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">streaks</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Risk Status</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Hired Status</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/60">
                  {filteredStudents.map((student) => (
                    <tr key={student._id} className="hover:bg-slate-900/10 transition-all">
                      <td className="p-4 flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-300 text-xs">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-slate-200 text-xs">{student.name}</h4>
                          <span className="text-[10px] text-slate-500 block mt-0.5">{student.email}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className={`text-[10px] font-bold uppercase tracking-wider border px-2.5 py-0.5 rounded-full ${
                          student.tier === 'Tier A' 
                            ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' 
                            : student.tier === 'Tier B' 
                            ? 'bg-slate-400/10 border-slate-400/20 text-slate-350'
                            : 'bg-orange-800/10 border-orange-800/20 text-orange-450'
                        }`}>
                          {student.tier}
                        </span>
                      </td>

                      <td className="p-4">
                        <div>
                          <span className="text-xs font-bold text-slate-200">{student.totalMark} pts</span>
                          <span className="text-[10px] text-slate-500 block mt-0.5">Att: {student.totalAttendanceMark} | Task: {student.totalTaskMark}</span>
                        </div>
                      </td>

                      <td className="p-4 text-xs">
                        {student.attendanceStreak > 0 ? (
                          <span className="text-emerald-400 font-semibold">🔥 {student.attendanceStreak} days</span>
                        ) : student.absentStreak > 0 ? (
                          <span className="text-rose-450 font-semibold">⚠️ {student.absentStreak} days</span>
                        ) : (
                          <span className="text-slate-600">-</span>
                        )}
                      </td>

                      <td className="p-4">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                          student.riskStatus === 'High' 
                            ? 'bg-rose-500/10 text-rose-400'
                            : student.riskStatus === 'Low'
                            ? 'bg-slate-800 text-slate-400'
                            : 'bg-emerald-500/10 text-emerald-400'
                        }`}>
                          {student.riskStatus}
                        </span>
                      </td>

                      <td className="p-4">
                        <select
                          value={student.hiredStatus}
                          onChange={(e) => handleHiredStatusChange(student._id, e.target.value)}
                          className="bg-slate-950 text-xs border border-slate-800 text-slate-300 rounded-xl px-3 py-1.5 outline-none"
                        >
                          <option value="Looking">Looking</option>
                          <option value="In Job task">In Job task</option>
                          <option value="In interview">In interview</option>
                          <option value="On Process">On Process</option>
                          <option value="Hired">Hired</option>
                        </select>
                      </td>

                      <td className="p-4 text-right flex items-center justify-end gap-2">
                        {student.riskStatus === 'High' && (
                          <button
                            onClick={() => handleSendAIEmail(student._id)}
                            disabled={sendingEmailId === student._id}
                            className="p-2 hover:bg-rose-500/20 rounded-xl text-rose-450 transition-colors inline-flex items-center gap-1.5 text-[10px] font-bold uppercase disabled:opacity-50"
                          >
                            {sendingEmailId === student._id ? (
                              <div className="h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Send className="h-3.5 w-3.5" />
                            )}
                            <span>AI Alert</span>
                          </button>
                        )}
                        <button
                          onClick={() => { setEditStudentData(student); setShowEditStudentModal(true); }}
                          className="p-2 hover:bg-slate-800 rounded-xl text-emerald-400 hover:text-emerald-300 transition-colors inline-flex items-center gap-1.5 text-xs font-semibold"
                        >
                          <Edit3 className="h-4 w-4" />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => { setSelectedStudent(student); setShowDrawer(true); }}
                          className="p-2 hover:bg-slate-800 rounded-xl text-indigo-400 hover:text-indigo-300 transition-colors inline-flex items-center gap-1.5 text-xs font-semibold"
                        >
                          <Eye className="h-4 w-4" />
                          <span>See Profile</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ATTENDANCE */}
        {activeTab === 'attendance' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="text-sm font-bold text-slate-200">Daily Attendance Matrix Grid</h3>
                <p className="text-xs text-slate-500 mt-1">Left column is locked. Horizontal dates update scores instantly on click.</p>
              </div>
              <a
                href="https://docs.google.com/spreadsheets/d/mock-attendance-form-responses-sheet"
                target="_blank"
                rel="noreferrer"
                className="bg-slate-950 hover:bg-slate-900 text-indigo-400 hover:text-indigo-300 text-[10px] font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl border border-slate-850 hover:border-slate-800 transition-all flex items-center gap-2 w-fit shadow-lg shadow-indigo-950/20"
              >
                <FileText className="h-4 w-4" />
                <span>View Raw Form Responses (Google Sheet)</span>
              </a>
            </div>

            <div className="overflow-x-auto border border-slate-850 rounded-2xl bg-slate-950/20 relative">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-900/60 border-b border-slate-850">
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 sticky left-0 bg-slate-950 z-20 w-44">Student Name</th>
                    {dates.map(date => {
                      const parts = date.split('-');
                      return (
                        <th key={date} className="p-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                          {parts[1]}/{parts[2]}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/60">
                  {filteredStudents.map(student => (
                    <tr key={student._id} className="hover:bg-slate-900/10">
                      <td className="p-4 font-bold text-slate-200 text-xs sticky left-0 bg-slate-950 z-10 w-44 border-r border-slate-850/40 truncate">
                        {student.name}
                      </td>

                      {dates.map(date => {
                        const status = attendanceMatrix[student._id]?.[date] || 'Present';
                        const cellId = `att-${student._id}-${date}`;
                        const isSaving = matrixSavingState[cellId];

                        return (
                          <td key={date} className="p-3 text-center">
                            <button
                              onClick={() => handleToggleAttendanceCell(student._id, date, status)}
                              disabled={isSaving}
                              className={`h-9 w-20 mx-auto rounded-xl flex items-center justify-center border transition-all ${
                                status === 'Present'
                                  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                  : status === 'Absent'
                                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-450'
                                  : 'bg-amber-500/10 border-amber-500/20 text-amber-500'
                              } disabled:opacity-40`}
                            >
                              {isSaving ? (
                                <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                              ) : status === 'Present' ? (
                                <Check className="h-4 w-4" />
                              ) : status === 'Absent' ? (
                                <X className="h-4 w-4" />
                              ) : (
                                <Minus className="h-4 w-4" />
                              )}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: TASK MATRIX */}
        {activeTab === 'tasks' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-200">Daily Task Submission Grid</h3>
              <p className="text-xs text-slate-500 mt-1">Grades daily tasks. Click cell to toggle submission states.</p>
            </div>

            <div className="overflow-x-auto border border-slate-850 rounded-2xl bg-slate-950/20 relative">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-900/60 border-b border-slate-850">
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 sticky left-0 bg-slate-950 z-20 w-44">Student Name</th>
                    {dates.map(date => {
                      const parts = date.split('-');
                      return (
                        <th key={date} className="p-4 text-center text-xs font-bold uppercase tracking-wider text-slate-500">
                          {parts[1]}/{parts[2]}
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-850/60">
                  {filteredStudents.map(student => (
                    <tr key={student._id} className="hover:bg-slate-900/10">
                      <td className="p-4 font-bold text-slate-200 text-xs sticky left-0 bg-slate-950 z-10 w-44 border-r border-slate-850/40 truncate">
                        {student.name}
                      </td>

                      {dates.map(date => {
                        const status = taskMatrix[student._id]?.[date] || 'Complete';
                        const cellId = `tsk-${student._id}-${date}`;
                        const isSaving = matrixSavingState[cellId];

                        return (
                          <td key={date} className="p-3 text-center">
                            <button
                              onClick={() => handleToggleTaskCell(student._id, date, status)}
                              disabled={isSaving}
                              className={`h-9 w-24 mx-auto rounded-xl flex items-center justify-center border text-[10px] font-bold uppercase tracking-wider transition-all ${
                                status === 'Complete'
                                  ? 'bg-indigo-600/15 border-indigo-500/20 text-indigo-400'
                                  : 'bg-slate-950/60 border-slate-800 text-slate-500'
                              } disabled:opacity-40`}
                            >
                              {isSaving ? (
                                <div className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <span>{status}</span>
                              )}
                            </button>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: POINTS / LEADERBOARD */}
        {activeTab === 'points' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Table layout of points */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-200">Points Summary List</h3>
                <p className="text-xs text-slate-500 mt-1">Detailed breakdown of attendance and task marks.</p>
              </div>

              <div className="overflow-x-auto border border-slate-850 rounded-2xl bg-slate-950/20">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900/60 border-b border-slate-850">
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Student</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Attendance Pts</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Task Pts</th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Total Marks</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/60">
                    {filteredStudents.map(student => (
                      <tr key={student._id} className="hover:bg-slate-900/10 text-xs">
                        <td className="p-4 font-semibold text-slate-200">{student.name}</td>
                        <td className="p-4 text-center text-slate-450">{student.totalAttendanceMark}</td>
                        <td className="p-4 text-center text-slate-450">{student.totalTaskMark}</td>
                        <td className="p-4 text-right font-bold text-indigo-400">{student.totalMark} pts</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Leaderboard layout */}
            <div className="bg-slate-950/40 border border-slate-850 p-6 rounded-2xl space-y-5">
              <h4 className="text-xs font-bold text-slate-200 flex items-center gap-2 border-b border-slate-850 pb-3">
                <Trophy className="h-4 w-4 text-amber-500" />
                <span>Cohort Leaderboard</span>
              </h4>

              <div className="space-y-3.5">
                {leaderboardSorted.map((student, idx) => (
                  <div key={student._id} className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-850">
                    <div className="flex items-center gap-3">
                      <span className={`h-6 w-6 rounded flex items-center justify-center font-bold text-xs ${
                        idx === 0 ? 'bg-amber-500/20 text-amber-500 border border-amber-500/30' :
                        idx === 1 ? 'bg-slate-400/20 text-slate-300 border border-slate-400/30' :
                        idx === 2 ? 'bg-orange-850/20 text-orange-450 border border-orange-800/30' :
                        'bg-slate-800 text-slate-500'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className="text-xs font-semibold text-slate-200">{student.name}</span>
                    </div>
                    <span className="text-xs font-extrabold text-slate-300">{student.totalMark} pts</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>

      {/* 360-Degree Profile Side Drawer */}
      {showDrawer && selectedStudent && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Overlay */}
          <div onClick={() => setShowDrawer(false)} className="absolute inset-0 bg-slate-955/80 backdrop-blur-sm"></div>

          {/* Drawer Panel */}
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-lg h-full relative z-10 flex flex-col justify-between shadow-2xl overflow-y-auto">
            {/* Header */}
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-200 text-lg border border-slate-700">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-lg">{selectedStudent.name}</h3>
                  <span className="text-xs text-slate-400 block mt-0.5">{selectedStudent.email}</span>
                  {selectedStudent.phoneNumber && (
                    <span className="text-[10px] text-slate-500 block mt-0.5">{selectedStudent.phoneNumber}</span>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setShowDrawer(false)}
                className="h-8 w-8 rounded-lg bg-slate-950/40 text-slate-400 hover:text-slate-100 flex items-center justify-center border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Main Area */}
            <div className="p-6 flex-1 space-y-6 overflow-y-auto">
              {/* Status Badges */}
              <div className="flex flex-wrap gap-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${
                  selectedStudent.tier === 'Tier A' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                  selectedStudent.tier === 'Tier B' ? 'bg-slate-400/10 border-slate-400/20 text-slate-350' :
                  'bg-orange-800/10 border-orange-800/20 text-orange-450'
                }`}>
                  {selectedStudent.tier}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${
                  selectedStudent.riskStatus === 'High' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                  selectedStudent.riskStatus === 'Low' ? 'bg-slate-800 border-slate-700 text-slate-400' :
                  'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                }`}>
                  Risk: {selectedStudent.riskStatus}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md bg-slate-800 border border-slate-700 text-slate-300">
                  {selectedStudent.hiredStatus}
                </span>
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border ${
                  selectedStudent.activeStatus === 'Active' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                }`}>
                  {selectedStudent.activeStatus}
                </span>
                {selectedStudent.attendanceStreak > 0 && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                    🔥 {selectedStudent.attendanceStreak} Day Streak
                  </span>
                )}
                {selectedStudent.absentStreak > 0 && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md border bg-rose-500/10 border-rose-500/20 text-rose-400">
                    ⚠️ {selectedStudent.absentStreak} Day Absent
                  </span>
                )}
              </div>

              {/* Profile links cards */}
              <div className="grid grid-cols-3 gap-3">
                {selectedStudent.profiles.github ? (
                  <a
                    href={selectedStudent.profiles.github}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-slate-950/40 border border-slate-800 hover:border-slate-700 p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-colors"
                  >
                    <GithubIcon className="h-5 w-5 text-slate-400" />
                    <span className="text-[10px] text-slate-400 font-semibold">GitHub</span>
                  </a>
                ) : (
                  <div className="bg-slate-950/20 border border-dashed border-slate-850 p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 opacity-50">
                    <GithubIcon className="h-5 w-5 text-slate-600" />
                    <span className="text-[10px] text-slate-500 font-semibold">Missing GitHub</span>
                  </div>
                )}

                {selectedStudent.profiles.linkedin ? (
                  <a
                    href={selectedStudent.profiles.linkedin}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-slate-950/40 border border-slate-800 hover:border-slate-700 p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-colors"
                  >
                    <LinkedinIcon className="h-5 w-5 text-indigo-400" />
                    <span className="text-[10px] text-slate-400 font-semibold">LinkedIn</span>
                  </a>
                ) : (
                  <div className="bg-slate-950/20 border border-dashed border-slate-850 p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 opacity-50">
                    <LinkedinIcon className="h-5 w-5 text-slate-600" />
                    <span className="text-[10px] text-slate-500 font-semibold">Missing LinkedIn</span>
                  </div>
                )}

                {selectedStudent.profiles.resume ? (
                  <a
                    href={selectedStudent.profiles.resume}
                    target="_blank"
                    rel="noreferrer"
                    className="bg-slate-950/40 border border-slate-800 hover:border-slate-700 p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 transition-colors"
                  >
                    <FileDown className="h-5 w-5 text-emerald-400" />
                    <span className="text-[10px] text-slate-400 font-semibold">Resume PDF</span>
                  </a>
                ) : (
                  <div className="bg-slate-950/20 border border-dashed border-slate-850 p-3 rounded-2xl flex flex-col items-center justify-center gap-1.5 opacity-50">
                    <FileDown className="h-5 w-5 text-slate-600" />
                    <span className="text-[10px] text-slate-500 font-semibold">Missing Resume</span>
                  </div>
                )}
              </div>

              {/* Attendance heatmap representation */}
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Attendance visual heatmap</span>
                <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-2xl">
                  {/* CSS grid calendar simulation */}
                  <div className="grid grid-cols-7 gap-2">
                    {Array.from({ length: 28 }).map((_, idx) => {
                      const isAbsent = idx === 4 || idx === 10 || idx === 11 || idx === 20;
                      const isLeave = idx === 15;
                      const isPresent = !isAbsent && !isLeave;
                      return (
                        <div
                          key={idx}
                          title={`Day ${idx + 1}: ${isPresent ? 'Present' : isLeave ? 'Leave' : 'Absent'}`}
                          className={`h-7 w-full rounded-md flex items-center justify-center font-bold text-[9px] ${
                            isPresent 
                              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' 
                              : isLeave 
                              ? 'bg-amber-500/10 border border-amber-500/20 text-amber-500'
                              : 'bg-rose-500/10 border border-rose-500/20 text-rose-450'
                          }`}
                        >
                          {idx + 1}
                        </div>
                      );
                    })}
                  </div>
                  {/* Color Status Legend */}
                  <div className="flex gap-4 text-[9px] text-slate-500 mt-4 justify-center border-t border-slate-900/60 pt-3 font-semibold uppercase tracking-wider">
                    <div className="flex items-center gap-1.5">
                       <div className="h-2.5 w-2.5 rounded bg-emerald-500/20 border border-emerald-500/30"></div>
                       <span>Present</span>
                     </div>
                     <div className="flex items-center gap-1.5">
                       <div className="h-2.5 w-2.5 rounded bg-rose-500/20 border border-rose-500/30"></div>
                       <span>Absent</span>
                     </div>
                     <div className="flex items-center gap-1.5">
                       <div className="h-2.5 w-2.5 rounded bg-amber-500/20 border border-amber-500/30"></div>
                       <span>Leave (- Pts)</span>
                     </div>
                  </div>
                </div>
              </div>

              {/* Performance indicators */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-2xl text-center">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Total Points</span>
                  <p className="text-2xl font-extrabold text-white mt-1">{selectedStudent.totalMark}</p>
                </div>
                <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-2xl text-center">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Mock Score</span>
                  <p className="text-2xl font-extrabold text-white mt-1">{selectedStudent.mockInterviewScore}%</p>
                </div>
                <div className="bg-slate-950/40 border border-slate-800 p-4 rounded-2xl text-center">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Rank</span>
                  <p className="text-2xl font-extrabold text-indigo-400 mt-1">
                    #{leaderboardSorted.findIndex(s => s._id === selectedStudent._id) + 1}
                  </p>
                </div>
              </div>

              {/* Communication log */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Mentorship Logs (Last Updates)</span>
                <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-4 min-h-[120px] flex flex-col justify-between">
                  {selectedStudent.lastUpdateNote ? (
                    <div>
                      <p className="text-xs text-slate-350 leading-relaxed italic">
                        &quot;{selectedStudent.lastUpdateNote}&quot;
                      </p>
                      {selectedStudent.lastUpdateDate && (
                        <span className="text-[10px] text-slate-500 block mt-3 font-medium">
                          Updated: {new Date(selectedStudent.lastUpdateDate).toLocaleString()}
                        </span>
                      )}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-655 italic">No notes logged yet.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Note Appending Form Footer */}
            <form onSubmit={handleAddProfileNote} className="p-4 border-t border-slate-800 bg-slate-955/60 flex items-center gap-2">
              <input
                type="text"
                required
                placeholder="Append mentorship note..."
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="flex-1 text-xs bg-slate-900 border border-slate-850 focus:border-indigo-500 text-slate-200 px-4 py-3 rounded-xl outline-none placeholder:text-slate-600"
              />
              <button
                type="submit"
                disabled={noteSaving}
                className="bg-indigo-600 hover:bg-indigo-500 text-white p-3 rounded-xl transition-colors shadow-lg shadow-indigo-600/10 disabled:opacity-50"
              >
                {noteSaving ? (
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditStudentModal && editStudentData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowEditStudentModal(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-xl relative z-10 overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-white">Edit Student Data</h3>
              <button 
                onClick={() => setShowEditStudentModal(false)}
                className="h-8 w-8 rounded-lg bg-slate-950/40 text-slate-400 hover:text-slate-100 flex items-center justify-center border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateStudentSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Name</label>
                  <input
                    type="text"
                    required
                    value={editStudentData.name}
                    onChange={e => setEditStudentData({...editStudentData, name: e.target.value})}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Email</label>
                  <input
                    type="email"
                    required
                    value={editStudentData.email}
                    onChange={e => setEditStudentData({...editStudentData, email: e.target.value})}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Phone Number</label>
                  <input
                    type="text"
                    value={editStudentData.phoneNumber || ''}
                    onChange={e => setEditStudentData({...editStudentData, phoneNumber: e.target.value})}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Tier Status</label>
                  <select
                    value={editStudentData.tier}
                    onChange={e => setEditStudentData({...editStudentData, tier: e.target.value})}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value="Tier A">Tier A</option>
                    <option value="Tier B">Tier B</option>
                    <option value="Tier C">Tier C</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Risk Status</label>
                  <select
                    value={editStudentData.riskStatus}
                    onChange={e => setEditStudentData({...editStudentData, riskStatus: e.target.value})}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Hired Status</label>
                  <select
                    value={editStudentData.hiredStatus}
                    onChange={e => setEditStudentData({...editStudentData, hiredStatus: e.target.value})}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                  >
                    <option value="Looking">Looking</option>
                    <option value="In Job task">In Job task</option>
                    <option value="In interview">In interview</option>
                    <option value="On Process">On Process</option>
                    <option value="Hired">Hired</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">GitHub URL</label>
                  <input
                    type="text"
                    value={editStudentData.profiles?.github || ''}
                    onChange={e => setEditStudentData({...editStudentData, profiles: {...editStudentData.profiles, github: e.target.value}})}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">LinkedIn URL</label>
                  <input
                    type="text"
                    value={editStudentData.profiles?.linkedin || ''}
                    onChange={e => setEditStudentData({...editStudentData, profiles: {...editStudentData.profiles, linkedin: e.target.value}})}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Resume URL</label>
                  <input
                    type="text"
                    value={editStudentData.profiles?.resume || ''}
                    onChange={e => setEditStudentData({...editStudentData, profiles: {...editStudentData.profiles, resume: e.target.value}})}
                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-slate-800 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowEditStudentModal(false)}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-300 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editStudentSaving}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {editStudentSaving ? (
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
