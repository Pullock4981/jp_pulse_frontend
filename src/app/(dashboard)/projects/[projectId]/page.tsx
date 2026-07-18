'use client';

import { useState, useEffect, use } from 'react';
import { apiRequest } from '@/utils/api';
import Link from 'next/link';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
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
  Briefcase,
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
  Save,
  Trash2,
  Edit2,
  Lock,
  Unlock,
  AlignLeft,
  CheckSquare,
  Key,
  ChevronDown
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
  github?: string;
  linkedin?: string;
  resume?: string;
  bestProject1?: string;
  bestProject2?: string;
  portfolio?: string;
  discordUsername?: string;
  level2Batch?: string;
  currentOccupation?: string;
  nextExamDate?: string;
  educationInstitute?: string;
  groupSubject?: string;
  currentAddress?: string;
  primaryFocus?: string;
  placementTimeline?: string;
  jobTypePreference?: string;
  dhakaRelocate?: string;
  onsiteInHomeDistrict?: string;
  placementCommitment?: string;
  bootcampCommitment?: string;
  taskCommitment?: string;
  currentSituationNote?: string;
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
  const [drawerTab, setDrawerTab] = useState<'overview' | 'career' | 'tracker'>('overview');
  const [newNote, setNewNote] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);
  const [showEditStudentModal, setShowEditStudentModal] = useState(false);
  const [editStudentData, setEditStudentData] = useState<any>(null);
  const [editStudentSaving, setEditStudentSaving] = useState(false);
  const [sendingEmailId, setSendingEmailId] = useState<string | null>(null);
  const [emailMsg, setEmailMsg] = useState({ type: '', text: '' });

  // Custom Form Builder states
  const [formConfig, setFormConfig] = useState<any>(null);
  const [showFormBuilderModal, setShowFormBuilderModal] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [customFields, setCustomFields] = useState<any[]>([]);
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState<'text' | 'textarea' | 'select' | 'date' | 'checkbox'>('text');
  const [newFieldRequired, setNewFieldRequired] = useState(false);
  const [newFieldOptions, setNewFieldOptions] = useState('');
  const [formSaving, setFormSaving] = useState(false);

  // Detailed Profile Import states
  const [showImportDetailsModal, setShowImportDetailsModal] = useState(false);
  const [importDetailsLoading, setImportDetailsLoading] = useState(false);
  const [importDetailsSheetUrl, setImportDetailsSheetUrl] = useState('');
  const [importDetailsMsg, setImportDetailsMsg] = useState({ type: '', text: '' });

  // Bulk Add Import states
  const [showBulkAddModal, setShowBulkAddModal] = useState(false);
  const [bulkAddLoading, setBulkAddLoading] = useState(false);
  const [bulkAddSheetUrl, setBulkAddSheetUrl] = useState('');
  const [bulkAddMsg, setBulkAddMsg] = useState({ type: '', text: '' });

  // Form Builder inline edit state
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);

  // Operations Matrix states (Attendance & Tasks)
  const [dates, setDates] = useState<string[]>([]);
  const [attendanceMatrix, setAttendanceMatrix] = useState<Record<string, Record<string, string>>>({});
  const [taskMatrix, setTaskMatrix] = useState<Record<string, Record<string, string>>>({});
  const [matrixSavingState, setMatrixSavingState] = useState<Record<string, boolean>>({});

  // Attendance Form Management states
  const [attendanceForms, setAttendanceForms] = useState<any[]>([]);
  const [showCreateAttFormModal, setShowCreateAttFormModal] = useState(false);
  const [attFormDate, setAttFormDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [attFormExpiry, setAttFormExpiry] = useState('');
  const [attFormPresentMark, setAttFormPresentMark] = useState(1);
  const [attFormAbsentMark, setAttFormAbsentMark] = useState(-1);
  const [attFormCreating, setAttFormCreating] = useState(false);
  const [attFormMsg, setAttFormMsg] = useState({ type: '', text: '' });
  const [closingFormId, setClosingFormId] = useState<string | null>(null);
  const [copiedFormLink, setCopiedFormLink] = useState<string | null>(null);

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
    fetchDashboardData();
  }, [projectId]);

  const fetchDashboardData = async () => {
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

      // 3. Fetch real attendance data to build matrix
      try {
        const attDataRes = await apiRequest(`/projects/${projectId}/attendance`);
        const fetchedAttendances = attDataRes.data || [];
        
        const attData: Record<string, Record<string, string>> = {};
        const uniqueDates = new Set<string>();

        fetchedStudents.forEach((student: any) => {
          attData[student._id] = {};
        });

        fetchedAttendances.forEach((record: any) => {
          if (record.student && typeof record.student === 'object' && record.student._id) {
             // Populate returns object
             record.student = record.student._id;
          }
          if (attData[record.student]) {
            const dateStr = new Date(record.date).toISOString().split('T')[0];
            attData[record.student][dateStr] = record.status;
            uniqueDates.add(dateStr);
          }
        });

        const sortedDates = Array.from(uniqueDates).sort();
        setDates(sortedDates);
        setAttendanceMatrix(attData);
        
        // Mock task matrix for now
        const tskData: Record<string, Record<string, string>> = {};
        fetchedStudents.forEach((student: any) => {
          tskData[student._id] = {};
          sortedDates.forEach((date, idx) => {
            tskData[student._id][date] = idx % 2 === 0 ? 'Complete' : 'Incomplete';
          });
        });
        setTaskMatrix(tskData);

      } catch (err) {
        console.error('Failed to fetch attendance data:', err);
      }

      // 4. Fetch Quizzes
      const quizRes = await apiRequest(`/projects/${projectId}/quizzes`);
      setQuizzes(quizRes.data || []);

      // 5. Fetch Form configuration
      try {
        const formRes = await apiRequest(`/projects/${projectId}/forms`);
        if (formRes.success && formRes.data) {
          setFormConfig(formRes.data);
          setCustomFields(formRes.data.fields || []);
        } else {
          setFormConfig(null);
          setCustomFields([]);
        }
      } catch (e) {
        setFormConfig(null);
        setCustomFields([]);
      }

      // 6. Fetch attendance forms
      try {
        const attFormsRes = await apiRequest(`/projects/${projectId}/attendance-forms`);
        if (attFormsRes.success) setAttendanceForms(attFormsRes.data || []);
      } catch {
        setAttendanceForms([]);
      }

    } catch (err: any) {
      console.warn('Backend failed, loading mock system workspace:', err.message);
      loadMockWorkspaceData();
    } finally {
      setLoading(false);
    }
  };

  const loadMockWorkspaceData = () => {
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
    calculateStats(mockStudents, { _id: projectId, name: 'Albatross Boot-camp', tierConfig: { enableTiers: true } });
    
    // Set dates and mock matrix
    const generatedDates: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      generatedDates.push(d.toISOString().split('T')[0]);
    }
    setDates(generatedDates);

    const attData: Record<string, Record<string, string>> = {};
    const tskData: Record<string, Record<string, string>> = {};

    mockStudents.forEach(student => {
      attData[student._id] = {};
      tskData[student._id] = {};
      
      generatedDates.forEach((date, index) => {
        if (student._id === 'stud-3') {
          attData[student._id][date] = index > 3 ? 'Absent' : 'Present';
        } else {
          attData[student._id][date] = index === 2 ? 'Leave' : index === 5 ? 'Absent' : 'Present';
        }
        tskData[student._id][date] = index % 3 === 0 ? 'Incomplete' : 'Complete';
      });
    });

    setAttendanceMatrix(attData);
    setTaskMatrix(tskData);
    
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

  // Create / Initialize Custom Form
  const handleCreateForm = async () => {
    setFormSaving(true);
    try {
      const res = await apiRequest(`/projects/${projectId}/forms`, {
        method: 'POST'
      });
      if (res.success && res.data) {
        setFormConfig(res.data);
        setCustomFields(res.data.fields || []);
        alert('Student Info Form configuration initialized successfully!');
      }
    } catch (err: any) {
      alert('Failed to initialize form: ' + (err.message || 'Unknown error'));
    } finally {
      setFormSaving(false);
    }
  };

  // Add custom field to local fields array
  const handleAddCustomField = () => {
    if (!newFieldName.trim() || !newFieldLabel.trim()) {
      alert('Please fill in field Name and Label.');
      return;
    }
    const cleanId = newFieldName.toLowerCase().replace(/[^a-z0-9]/g, '');
    
    // Check duplicates
    if (customFields.some(f => f.id === cleanId)) {
      alert('A field with this identifier already exists.');
      return;
    }

    const fieldObj = {
      id: cleanId,
      label: newFieldLabel.trim(),
      type: newFieldType,
      required: newFieldRequired,
      options: (newFieldType === 'select' || newFieldType === 'checkbox') ? newFieldOptions.split(',').map(o => o.trim()).filter(o => o) : []
    };

    setCustomFields([...customFields, fieldObj]);
    setNewFieldName('');
    setNewFieldLabel('');
    setNewFieldType('text');
    setNewFieldRequired(false);
    setNewFieldOptions('');
  };

  // Remove custom field from local fields array
  const handleRemoveCustomField = (fieldId: string) => {
    // Avoid removing core lookup fields
    if (fieldId === 'email') {
      alert('The email field is required for matching submissions and cannot be removed.');
      return;
    }
    setCustomFields(customFields.filter(f => f.id !== fieldId));
  };

  // Inline form builder field update handlers
  const handleUpdateFieldLabel = (fieldId: string, newLabel: string) => {
    setCustomFields(prev => prev.map(f => f.id === fieldId ? { ...f, label: newLabel } : f));
  };

  const handleUpdateFieldType = (fieldId: string, newType: string) => {
    setCustomFields(prev => prev.map(f => f.id === fieldId ? { ...f, type: newType, options: (newType === 'select' || newType === 'checkbox') ? (f.options || []) : [] } : f));
  };

  const handleUpdateFieldRequired = (fieldId: string, newRequired: boolean) => {
    setCustomFields(prev => prev.map(f => f.id === fieldId ? { ...f, required: newRequired } : f));
  };

  const handleUpdateFieldOptions = (fieldId: string, optionsStr: string) => {
    const opts = optionsStr.split(',').map(s => s.trim()).filter(Boolean);
    setCustomFields(prev => prev.map(f => f.id === fieldId ? { ...f, options: opts } : f));
  };

  // Save the custom fields configuration to the backend
  const handleSaveFormConfig = async () => {
    setFormSaving(true);
    try {
      const res = await apiRequest(`/projects/${projectId}/forms`, {
        method: 'PUT',
        body: JSON.stringify({ fields: customFields })
      });
      if (res.success) {
        setFormConfig(res.data);
        alert('Form configuration saved!');
        setShowFormBuilderModal(false);
      }
    } catch (err: any) {
      alert('Failed to save form config: ' + (err.message || 'Unknown error'));
    } finally {
      setFormSaving(false);
    }
  };

  const handleCopyFormLink = () => {
    const formLink = window.location.origin + '/forms/' + projectId;
    navigator.clipboard.writeText(formLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // ── Attendance Forms management ────────────────────────────────────────────

  const fetchAttendanceForms = async () => {
    try {
      const res = await apiRequest(`/projects/${projectId}/attendance-forms`);
      if (res.success) setAttendanceForms(res.data || []);
    } catch {
      setAttendanceForms([]);
    }
  };

  const handleCreateAttendanceForm = async () => {
    setAttFormCreating(true);
    setAttFormMsg({ type: '', text: '' });
    try {
      const res = await apiRequest(`/projects/${projectId}/attendance-forms`, {
        method: 'POST',
        body: JSON.stringify({
          presentMark: attFormPresentMark,
          absentMark: attFormAbsentMark,
        })
      });
      if (res.success) {
        setAttFormMsg({ type: 'success', text: `Attendance form created successfully!` });
        setAttendanceForms(prev => [res.data, ...prev]);
        setTimeout(() => {
          setShowCreateAttFormModal(false);
          setAttFormMsg({ type: '', text: '' });
          setAttFormPresentMark(1);
          setAttFormAbsentMark(-1);
        }, 1500);
      } else {
        setAttFormMsg({ type: 'error', text: res.message || 'Failed to create form.' });
      }
    } catch (err: any) {
      setAttFormMsg({ type: 'error', text: err.message || 'Failed to create form.' });
    } finally {
      setAttFormCreating(false);
    }
  };

  const handleCloseAttendanceForm = async (formId: string) => {
    if (!confirm('Close this form and automatically mark all non-submitting students as Absent?')) return;
    setClosingFormId(formId);
    try {
      const res = await apiRequest(`/projects/${projectId}/attendance-forms/${formId}/close`, { method: 'POST' });
      if (res.success) {
        alert(res.message);
        setAttendanceForms(prev => prev.map(f => f._id === formId ? { ...f, isActive: false, absenteesProcessed: true } : f));
      } else {
        alert(res.message || 'Failed to close form.');
      }
    } catch (err: any) {
      alert(err.message || 'Failed to close form.');
    } finally {
      setClosingFormId(null);
    }
  };

  const handleCopyAttFormLink = (formId: string) => {
    const link = `${window.location.origin}/attendance-form/${formId}`;
    navigator.clipboard.writeText(link);
    setCopiedFormLink(formId);
    setTimeout(() => setCopiedFormLink(null), 2000);
  };

  // Submit the mapped student profile updates to the backend
  const handleImportDetailsData = async (updates: any[]) => {
    if (updates.length === 0) {
      setImportDetailsMsg({ type: 'error', text: 'No valid rows with email matching could be parsed.' });
      return;
    }
    setImportDetailsLoading(true);
    setImportDetailsMsg({ type: 'info', text: `Syncing ${updates.length} students details...` });
    try {
      const res = await apiRequest(`/projects/${projectId}/students/import-details`, {
        method: 'POST',
        body: JSON.stringify({ updates })
      });
      if (res.success) {
        setImportDetailsMsg({
          type: 'success',
          text: `Success! Matched and updated ${res.matchedCount} students. Unmatched: ${res.unmatchedCount || 0}.`
        });
        // Reload students list
        const studRes = await apiRequest(`/projects/${projectId}/students`);
        setStudents(studRes.data || []);
      } else {
        setImportDetailsMsg({ type: 'error', text: res.message || 'Import failed.' });
      }
    } catch (err: any) {
      setImportDetailsMsg({ type: 'error', text: err.message || 'Failed connecting to placement pulse api.' });
    } finally {
      setImportDetailsLoading(false);
    }
  };

  // ----------------------------------------------------
  // Bulk Add Students Flow
  // ----------------------------------------------------
  const handleBulkAddFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setBulkAddLoading(true);
    setBulkAddMsg({ type: 'info', text: 'Parsing spreadsheet file...' });

    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = evt.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheet];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          processBulkAddJson(jsonData);
        } catch (err: any) {
          setBulkAddMsg({ type: 'error', text: `Failed to parse Excel file: ${err.message}` });
          setBulkAddLoading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          processBulkAddJson(results.data);
        },
        error: (err) => {
          setBulkAddMsg({ type: 'error', text: `Failed to parse CSV file: ${err.message}` });
          setBulkAddLoading(false);
        }
      });
    }
  };

  const processBulkAddJson = async (jsonData: any[]) => {
    if (!jsonData || jsonData.length === 0) {
      setBulkAddMsg({ type: 'error', text: 'Spreadsheet contains no data rows.' });
      setBulkAddLoading(false);
      return;
    }

    const newStudents: any[] = [];
    jsonData.forEach((row: any) => {
      let rowEmail = '';
      let rowName = '';
      Object.keys(row).forEach(k => {
        const cleanK = k.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
        if (cleanK === 'email' || cleanK === 'mail' || cleanK === 'emailaddress') rowEmail = String(row[k]).trim();
        if (cleanK === 'name' || cleanK === 'fullname' || cleanK === 'studentname') rowName = String(row[k]).trim();
      });

      if (rowEmail && rowName) {
        newStudents.push({ name: rowName, email: rowEmail, activeStatus: 'Active', riskStatus: 'On Track', tier: 'Tier C' });
      } else if (rowEmail && !rowName) {
        newStudents.push({ name: rowEmail.split('@')[0], email: rowEmail, activeStatus: 'Active', riskStatus: 'On Track', tier: 'Tier C' });
      }
    });

    if (newStudents.length === 0) {
      setBulkAddMsg({ type: 'error', text: 'No valid rows with Name and Email could be extracted.' });
      setBulkAddLoading(false);
      return;
    }

    setBulkAddMsg({ type: 'info', text: `Adding ${newStudents.length} students...` });
    try {
      const res = await apiRequest(`/projects/${projectId}/students/bulk`, {
        method: 'POST',
        body: JSON.stringify({ students: newStudents })
      });
      if (res.success) {
        setBulkAddMsg({ type: 'success', text: `Success! Added ${res.count} students.` });
        const studRes = await apiRequest(`/projects/${projectId}/students`);
        setStudents(studRes.data || []);
      } else {
        setBulkAddMsg({ type: 'error', text: res.message || 'Import failed.' });
      }
    } catch (err: any) {
      setBulkAddMsg({ type: 'error', text: err.message || 'Failed connecting to server.' });
    } finally {
      setBulkAddLoading(false);
    }
  };

  // Parse local CSV/Excel spreadsheet file
  const handleImportDetailsFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportDetailsLoading(true);
    setImportDetailsMsg({ type: 'info', text: 'Parsing spreadsheet file...' });

    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = evt.target?.result;
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheet];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          
          processSpreadsheetJson(jsonData);
        } catch (err: any) {
          setImportDetailsMsg({ type: 'error', text: `Failed to parse Excel file: ${err.message}` });
          setImportDetailsLoading(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          processSpreadsheetJson(results.data);
        },
        error: (err) => {
          setImportDetailsMsg({ type: 'error', text: `Failed to parse CSV file: ${err.message}` });
          setImportDetailsLoading(false);
        }
      });
    }
  };

  // Google Sheet URL import
  const handleImportDetailsGoogleSheet = async () => {
    if (!importDetailsSheetUrl.trim()) return;
    setImportDetailsLoading(true);
    setImportDetailsMsg({ type: 'info', text: 'Fetching Google Sheet contents...' });

    try {
      const res = await apiRequest('/projects/import-sheet', {
        method: 'POST',
        body: JSON.stringify({ sheetUrl: importDetailsSheetUrl.trim() })
      });
      if (res.csvData) {
        Papa.parse(res.csvData, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            processSpreadsheetJson(results.data);
          },
          error: (err) => {
            setImportDetailsMsg({ type: 'error', text: `Failed to parse Sheet CSV data: ${err.message}` });
            setImportDetailsLoading(false);
          }
        });
      } else {
        setImportDetailsMsg({ type: 'error', text: 'Could not fetch Google Sheet. Verify sharing settings.' });
        setImportDetailsLoading(false);
      }
    } catch (err: any) {
      setImportDetailsMsg({ type: 'error', text: err.message || 'Failed connecting to server' });
      setImportDetailsLoading(false);
    }
  };

  // Process rows dynamically mapping fields
  const processSpreadsheetJson = (jsonData: any[]) => {
    if (!jsonData || jsonData.length === 0) {
      setImportDetailsMsg({ type: 'error', text: 'Spreadsheet contains no data rows.' });
      setImportDetailsLoading(false);
      return;
    }

    const updates: any[] = [];
    jsonData.forEach((row: any) => {
      // Find email column
      let rowEmail = '';
      Object.keys(row).forEach(k => {
        const cleanK = k.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
        if (
          cleanK === 'email' || 
          cleanK === 'mail' || 
          cleanK === 'emailaddress' || 
          cleanK === 'yourcourseemailaddress' || 
          cleanK === 'courseemail'
        ) {
          rowEmail = String(row[k]).trim();
        }
      });

      if (!rowEmail) return;

      const updateObj: any = { email: rowEmail };
      
      // Look for other columns matching form fields list
      if (formConfig && formConfig.fields) {
        formConfig.fields.forEach((field: any) => {
          Object.keys(row).forEach(k => {
            const cleanK = k.toLowerCase().trim();
            const cleanLabel = field.label.toLowerCase().trim();
            const cleanId = field.id.toLowerCase().trim();

            if (cleanK === cleanLabel || cleanK === cleanId) {
              updateObj[field.id] = String(row[k]).trim();
            }
          });
        });
      }

      updates.push(updateObj);
    });

    handleImportDetailsData(updates);
  };

  // Update Matrix status (Attendance Matrix grid)
  const handleSetAttendanceStatus = async (studentId: string, date: string, nextStatus: string) => {
    const currentStatus = attendanceMatrix[studentId]?.[date] || 'Absent';

    if (currentStatus === nextStatus) return;

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
      // Revert if error
      setAttendanceMatrix(prev => ({
        ...prev,
        [studentId]: { ...prev[studentId], [date]: currentStatus }
      }));
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
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-200 shrink-0"
            style={{ background: 'var(--surface-1)', border: '1px solid var(--surface-border)', color: 'var(--text-muted)' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--brand-primary)'; (e.currentTarget as HTMLElement).style.color = 'var(--brand-primary)'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = 'var(--surface-border)'; (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)'; }}
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] uppercase font-black tracking-widest px-2.5 py-1 rounded-full"
                style={{ color: 'var(--brand-primary)', background: 'var(--brand-gradient-soft)', border: '1px solid var(--surface-border)' }}>
                {project?.batch}
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full"
                style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981', border: '1px solid rgba(16,185,129,0.2)' }}>
                Active
              </span>
            </div>
            <h1 className="text-2xl font-black tracking-tight gradient-text">{project?.name || 'Loading...'}</h1>
            <p className="text-sm mt-0.5" style={{ color: 'var(--text-muted)' }}>{project?.description || 'Cohort details, operational sheets, and placement logs'}</p>
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
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
        {[
          { filter: 'All', label: 'Total', value: projectStats.totalStudents, icon: Users, color: '#7c3aed', tab: 'students' },
          { filter: 'Active', label: 'Active', value: projectStats.totalActive, icon: Activity, color: '#10b981', tab: 'students' },
          { filter: null, label: 'Attendance', value: `${projectStats.avgAttendanceRate.toFixed(0)}%`, icon: Calendar, color: '#3b82f6', tab: 'attendance' },
          { filter: 'Placed', label: 'Placed', value: projectStats.totalHired, icon: CheckCircle, color: '#10b981', tab: 'students' },
          { filter: 'Inactive', label: 'Inactive', value: projectStats.totalInactive, icon: XCircle, color: '#f43f5e', tab: 'students' },
          { filter: 'Leave', label: 'Leave', value: projectStats.willinglyLeave, icon: HelpCircle, color: '#f59e0b', tab: 'students' },
          { filter: 'At Risk', label: 'At Risk', value: projectStats.totalRisk, icon: AlertTriangle, color: '#f97316', tab: 'students' },
        ].map(stat => {
          const Icon = stat.icon;
          const isActive = stat.filter ? statusFilter === stat.filter : activeTab === stat.tab;
          return (
            <div key={stat.label}
              onClick={() => { if (stat.filter) setStatusFilter(stat.filter); setActiveTab(stat.tab); }}
              className="p-4 rounded-2xl text-center cursor-pointer transition-all duration-200 group"
              style={{
                background: isActive ? `${stat.color}12` : 'var(--surface-1)',
                border: `1px solid ${isActive ? stat.color + '40' : 'var(--surface-border)'}`,
              }}
              onMouseEnter={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.borderColor = stat.color + '50'; } }}
              onMouseLeave={e => { if (!isActive) { (e.currentTarget as HTMLElement).style.borderColor = 'var(--surface-border)'; } }}
            >
              <div className="h-8 w-8 mx-auto rounded-xl flex items-center justify-center mb-2 text-white"
                style={{ background: stat.color }}>
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest block" style={{ color: 'var(--text-faint)' }}>
                {stat.label}
              </span>
              <p className="text-xl font-black mt-1" style={{ color: isActive ? stat.color : 'var(--foreground)' }}>
                {stat.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Main Command Tabs Switcher */}
      <div className="flex gap-1 overflow-x-auto p-1 rounded-2xl" style={{ background: 'var(--surface-2)', border: '1px solid var(--surface-border)' }}>
        {[
          { key: 'overview', label: 'Overview', emoji: '📊' },
          { key: 'students', label: 'Students', emoji: '👥' },
          { key: 'attendance', label: 'Attendance', emoji: '✅' },
          { key: 'tasks', label: 'Tasks', emoji: '📋' },
          { key: 'points', label: 'Leaderboard', emoji: '🏆' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all duration-200 cursor-pointer"
            style={{
              background: activeTab === tab.key ? 'var(--brand-gradient-soft)' : 'transparent',
              color: activeTab === tab.key ? 'var(--brand-primary)' : 'var(--text-muted)',
              border: activeTab === tab.key ? '1px solid var(--surface-border-hover)' : '1px solid transparent',
            }}
          >
            <span className="text-sm">{tab.emoji}</span>
            <span className="hidden sm:inline uppercase tracking-wider">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Unified Tab Area */}
      <div className="glass-card p-6 min-h-[400px]">
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {!formConfig && (
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-4 animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20 shrink-0">
                    <AlertTriangle className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-amber-500 uppercase tracking-wider">Detailed Student Info Collection Pending</h4>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      You have not configured a detailed info submission form for this project. Students cannot update their profiles yet.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => { setActiveTab('students'); }}
                  className="bg-amber-500 hover:bg-amber-450 text-slate-950 font-bold text-[10px] uppercase tracking-wider px-4 py-2 rounded-xl transition-all shrink-0"
                >
                  Configure Form
                </button>
              </div>
            )}

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
                    <p>Total Hired: <span className="font-bold text-slate-100">{projectStats.totalHired}</span></p>
                    <p>Remaining: <span className="font-bold text-slate-100">{projectStats.totalStudents - projectStats.totalHired}</span></p>
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
                    <p>Active Students: <span className="font-bold text-slate-100">{projectStats.totalActive}</span></p>
                    <p>Inactive: <span className="font-bold text-slate-100">{projectStats.totalInactive}</span></p>
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

              <div className="flex items-center gap-3 flex-wrap">
                {!formConfig ? (
                  <button
                    onClick={handleCreateForm}
                    disabled={formSaving}
                    className="bg-indigo-600/90 hover:bg-indigo-600 text-white font-bold text-[10px] uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all disabled:opacity-50"
                  >
                    {formSaving ? 'Initializing...' : 'Create Student Info Form'}
                  </button>
                ) : (
                  <>
                    <button
                      onClick={() => { setCustomFields(formConfig.fields || []); setShowFormBuilderModal(true); }}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-750 font-bold text-[10px] uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all"
                    >
                      Configure Form
                    </button>
                    <button
                      onClick={handleCopyFormLink}
                      className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-[10px] uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all"
                    >
                      {copiedLink ? 'Copied!' : 'Copy Form Link'}
                    </button>
                    <button
                      onClick={() => { setImportDetailsMsg({ type: '', text: '' }); setShowImportDetailsModal(true); }}
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-750 font-bold text-[10px] uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all"
                    >
                      Import Details
                    </button>
                  </>
                )}

                <button
                  onClick={() => { setBulkAddMsg({ type: '', text: '' }); setShowBulkAddModal(true); }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all flex items-center gap-2"
                >
                  <Plus className="h-3 w-3" /> Add Students
                </button>

                {statusFilter !== 'All' && (
                  <button 
                    onClick={() => setStatusFilter('All')}
                    className="text-[10px] font-bold uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
                  >
                    Clear Filter
                  </button>
                )}
                {/* Status Filter Dropdown */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="text-xs font-semibold bg-slate-900 border border-slate-700 text-slate-300 rounded-xl px-3 py-2.5 outline-none focus:border-indigo-500 cursor-pointer"
                >
                  <option value="All">All Students</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Placed">Placed</option>
                  <option value="Leave">Willingly Leave</option>
                  <option value="At Risk">At Risk</option>
                </select>
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
          <div className="space-y-6">

            {/* ── Daily Attendance Forms Panel ────────────────────────────────── */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
              {/* Panel header */}
              <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <ClipboardList className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-200">Daily Attendance Forms</h3>
                    <p className="text-xs text-slate-500">Generate unique links students submit to mark themselves Present.</p>
                  </div>
                </div>
                <button
                  onClick={() => { setShowCreateAttFormModal(true); setAttFormMsg({ type: '', text: '' }); }}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-[10px] font-bold uppercase tracking-wider px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 shrink-0 cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Generate Form
                </button>
              </div>

              {/* Forms list */}
              <div className="p-4 space-y-3">
                {attendanceForms.length === 0 ? (
                  <div className="text-center py-8 space-y-2">
                    <div className="h-12 w-12 mx-auto rounded-2xl bg-slate-950/50 border border-slate-850 flex items-center justify-center">
                      <ClipboardList className="h-6 w-6 text-slate-600" />
                    </div>
                    <p className="text-sm text-slate-500 font-medium">No forms generated yet</p>
                    <p className="text-xs text-slate-600">Click <strong className="text-slate-500">Generate Form</strong> to create today's attendance link.</p>
                  </div>
                ) : (
                  attendanceForms.map((form: any) => {
                    const isClosed = !form.isActive || form.absenteesProcessed;
                    const status = isClosed ? 'closed' : 'active';
                    const formLink = typeof window !== 'undefined' ? `${window.location.origin}/attendance-form/${form._id}` : `/attendance-form/${form._id}`;

                    return (
                      <div
                        key={form._id}
                        className={`border rounded-2xl p-4 transition-all ${
                          status === 'active'
                            ? 'bg-emerald-500/5 border-emerald-500/15 hover:border-emerald-500/25'
                            : 'bg-slate-950/30 border-slate-850'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-sm font-bold text-slate-200">Dynamic Attendance Link</span>
                              {status === 'active' && (
                                <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full flex items-center gap-1">
                                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                  Active
                                </span>
                              )}
                              {isClosed && (
                                <span className="text-[9px] font-bold uppercase tracking-wider text-slate-500 bg-slate-850 border border-slate-800 px-2 py-0.5 rounded-full">
                                  Closed
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                              <span className="flex items-center gap-1 text-emerald-500">
                                +{form.presentMark} Present
                              </span>
                              <span className="flex items-center gap-1 text-rose-400">
                                {form.absentMark} Absent
                              </span>
                            </div>
                            {/* Copyable link */}
                            <div className="flex items-center gap-2 mt-2 bg-slate-950/50 border border-slate-800 rounded-xl px-3 py-2">
                              <span className="text-[10px] text-slate-500 truncate flex-1 font-mono">{formLink}</span>
                              <button
                                onClick={() => handleCopyAttFormLink(form._id)}
                                className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 hover:text-indigo-300 flex items-center gap-1 shrink-0 cursor-pointer"
                              >
                                {copiedFormLink === form._id ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                                {copiedFormLink === form._id ? 'Copied!' : 'Copy'}
                              </button>
                            </div>
                          </div>

                          {/* Close button */}
                          {!isClosed && (
                            <button
                              onClick={() => handleCloseAttendanceForm(form._id)}
                              disabled={closingFormId === form._id}
                              className="shrink-0 h-9 px-3 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/30 text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                              title="Close form and mark absentees"
                            >
                              {closingFormId === form._id ? (
                                <div className="h-3 w-3 border-2 border-rose-400 border-t-transparent rounded-full animate-spin" />
                              ) : (
                                <X className="h-3.5 w-3.5" />
                              )}
                              Close & Penalize
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            
            {/* ── Manual Attendance Matrix (Spreadsheet view) ────────────────── */}
            <div className="mt-8 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-200">Manual Attendance Matrix</h3>
                <p className="text-xs text-slate-500 mt-1">Select dropdown to manually toggle attendance status. Syncs scores instantly.</p>
              </div>

              <div className="overflow-x-auto border border-slate-850 rounded-2xl bg-slate-950/20 relative">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="bg-slate-900/60 border-b border-slate-850">
                      {/* Pinned left columns */}
                      <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 sticky left-0 bg-slate-900/90 z-20 w-44 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">Name</th>
                      <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 sticky left-[11rem] bg-slate-900/90 z-20 w-48 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">Email</th>
                      <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 sticky left-[23rem] bg-slate-900/90 z-20 w-24 border-r border-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)]">Tier</th>
                      
                      {/* Summary Columns */}
                      <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center w-24 bg-rose-500/5">Total Absent</th>
                      <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center w-24 bg-emerald-500/5">Total Present</th>
                      <th className="p-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 text-center w-24 bg-purple-500/5 border-r border-slate-850">Absent Streak</th>
                      
                      {/* Dynamic Date Columns */}
                      {dates.map(date => {
                        const parts = date.split('-');
                        return (
                          <th key={date} className="p-3 text-center text-[10px] font-bold uppercase tracking-wider text-slate-500 min-w-[120px]">
                            {parts[1]}/{parts[2]}
                          </th>
                        );
                      })}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-850/60">
                    {filteredStudents.map(student => (
                      <tr key={student._id} className="hover:bg-slate-900/20 group">
                        {/* Pinned left columns */}
                        <td className="p-3 text-[11px] font-semibold text-slate-200 sticky left-0 bg-slate-950 z-10 w-44 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)] truncate group-hover:bg-slate-900/90 transition-colors">
                          {student.name}
                        </td>
                        <td className="p-3 text-[10px] text-slate-400 sticky left-[11rem] bg-slate-950 z-10 w-48 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)] truncate group-hover:bg-slate-900/90 transition-colors">
                          {student.email}
                        </td>
                        <td className="p-3 text-[10px] text-slate-300 sticky left-[23rem] bg-slate-950 z-10 w-24 border-r border-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.3)] group-hover:bg-slate-900/90 transition-colors">
                          <span className="bg-indigo-500/10 text-indigo-400 px-2 py-1 rounded border border-indigo-500/20 w-full inline-block text-center">{student.tier || '-'}</span>
                        </td>

                        {/* Summary Columns */}
                        <td className="p-3 text-[11px] font-bold text-rose-400 text-center bg-rose-500/5">{student.totalAbsent}</td>
                        <td className="p-3 text-[11px] font-bold text-emerald-400 text-center bg-emerald-500/5">{student.totalAttendance}</td>
                        <td className="p-3 text-[11px] font-bold text-purple-400 text-center bg-purple-500/5 border-r border-slate-850">{student.absentStreak}</td>

                        {/* Dynamic Date Cells */}
                        {dates.map(date => {
                          const status = attendanceMatrix[student._id]?.[date] || 'Absent';
                          const cellId = `att-${student._id}-${date}`;
                          const isSaving = matrixSavingState[cellId];

                          return (
                            <td key={date} className="p-2 text-center">
                              <select
                                value={status}
                                onChange={(e) => handleSetAttendanceStatus(student._id, date, e.target.value)}
                                disabled={isSaving}
                                className={`h-8 w-full min-w-[110px] rounded-lg text-[10px] font-bold uppercase tracking-wider px-2 cursor-pointer outline-none transition-all border ${
                                  status === 'Present'
                                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                                    : status === 'Absent'
                                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 hover:bg-rose-500/20'
                                    : 'bg-orange-500/10 border-orange-500/30 text-orange-400 hover:bg-orange-500/20'
                                } disabled:opacity-40 appearance-none text-center`}
                                style={{ textAlignLast: 'center' }}
                              >
                                <option value="Present" className="bg-slate-900 text-emerald-400">Present (+)</option>
                                <option value="Absent" className="bg-slate-900 text-rose-400">Absent (−)</option>
                                <option value="Leave" className="bg-slate-900 text-orange-400">Informed</option>
                              </select>
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Create Attendance Form Modal */}
        {showCreateAttFormModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div onClick={() => setShowCreateAttFormModal(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
            <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden">
              {/* Header */}
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <ClipboardList className="h-5 w-5 text-indigo-400" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100">Generate Attendance Form</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Create a daily link for students to self-mark attendance.</p>
                  </div>
                </div>
                <button onClick={() => setShowCreateAttFormModal(false)} className="h-8 w-8 rounded-lg border border-slate-800 bg-slate-950/40 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer">
                  <X className="h-4 w-4" />
                </button>
              </div>

              {/* Body */}
              <div className="p-6 space-y-5">
                {attFormMsg.text && (
                  <div className={`flex items-start gap-2.5 p-3.5 rounded-xl text-xs font-semibold border ${
                    attFormMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                  }`}>
                    {attFormMsg.type === 'success' ? <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" /> : <XCircle className="h-4 w-4 shrink-0 mt-0.5" />}
                    <span>{attFormMsg.text}</span>
                  </div>
                )}


                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">Present Mark (+)</label>
                    <input
                      type="number"
                      value={attFormPresentMark}
                      onChange={e => setAttFormPresentMark(Number(e.target.value))}
                      className="w-full bg-emerald-500/5 border border-emerald-500/20 rounded-xl px-4 py-2.5 text-sm font-bold text-emerald-400 outline-none focus:border-emerald-500 transition-colors"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-rose-500 block">Absent Mark (−)</label>
                    <input
                      type="number"
                      value={attFormAbsentMark}
                      onChange={e => setAttFormAbsentMark(Number(e.target.value))}
                      className="w-full bg-rose-500/5 border border-rose-500/20 rounded-xl px-4 py-2.5 text-sm font-bold text-rose-400 outline-none focus:border-rose-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="bg-indigo-500/5 border border-indigo-500/15 rounded-xl p-3 text-xs text-indigo-300/70 leading-relaxed">
                  A unique link will be generated. Students submit their course email to mark themselves as <strong className="text-indigo-300">Present (+{attFormPresentMark})</strong>. When expired/closed, all remaining students are automatically marked <strong className="text-rose-300">Absent ({attFormAbsentMark})</strong>.
                </div>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-slate-800 flex justify-end gap-3">
                <button onClick={() => setShowCreateAttFormModal(false)} className="px-5 py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer">
                  Cancel
                </button>
                <button
                  onClick={handleCreateAttendanceForm}
                  disabled={attFormCreating}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {attFormCreating ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send className="h-4 w-4" />}
                  Generate Form
                </button>
              </div>
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
          <div className="bg-slate-900 border-l border-slate-800 w-full max-w-2xl h-full relative z-10 flex flex-col justify-between shadow-2xl overflow-hidden animate-slideLeft">
            {/* Header */}
            <div className="p-6 border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="h-14 w-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center font-black text-xl shadow-inner uppercase tracking-wider">
                  {selectedStudent.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-black text-slate-100 text-xl tracking-tight leading-none">{selectedStudent.name}</h3>
                  <span className="text-xs text-slate-400 block mt-1.5 font-medium">{selectedStudent.email}</span>
                  {selectedStudent.phoneNumber && (
                    <span className="text-[10px] text-slate-500 block mt-1 font-bold tracking-widest">{selectedStudent.phoneNumber}</span>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setShowDrawer(false)}
                className="h-9 w-9 rounded-xl bg-slate-950/40 text-slate-400 hover:text-slate-100 flex items-center justify-center border border-slate-800 hover:border-slate-700 transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Tabbed Selectors Toolbar */}
            <div className="flex border-b border-slate-800/80 bg-slate-950/20 px-6 py-3 gap-2.5 select-none">
              <button
                type="button"
                onClick={() => setDrawerTab('overview')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all border ${
                  drawerTab === 'overview'
                    ? 'bg-indigo-650 text-white border-indigo-600 shadow-lg shadow-indigo-600/15'
                    : 'text-slate-450 hover:text-slate-200 border-transparent hover:bg-slate-800/30'
                }`}
              >
                <User className="h-3.5 w-3.5 shrink-0" />
                <span>Overview & Links</span>
              </button>
              <button
                type="button"
                onClick={() => setDrawerTab('career')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all border ${
                  drawerTab === 'career'
                    ? 'bg-indigo-655 text-white border-indigo-600 shadow-lg shadow-indigo-600/15'
                    : 'text-slate-450 hover:text-slate-200 border-transparent hover:bg-slate-800/30'
                }`}
              >
                <Briefcase className="h-3.5 w-3.5 shrink-0" />
                <span>Career & Forms</span>
              </button>
              <button
                type="button"
                onClick={() => setDrawerTab('tracker')}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all border ${
                  drawerTab === 'tracker'
                    ? 'bg-indigo-655 text-white border-indigo-600 shadow-lg shadow-indigo-600/15'
                    : 'text-slate-450 hover:text-slate-200 border-transparent hover:bg-slate-800/30'
                }`}
              >
                <Calendar className="h-3.5 w-3.5 shrink-0" />
                <span>Attendance Tracker</span>
              </button>
            </div>

            {/* Scrollable Workspace Panels */}
            <div className="flex-1 p-6 overflow-y-auto space-y-6 bg-slate-900/40">
              
              {/* TAB 1: OVERVIEW & LINKS */}
              {drawerTab === 'overview' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Status Badges */}
                  <div className="flex flex-wrap gap-2">
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                      selectedStudent.tier === 'Tier A' ? 'bg-amber-500/10 border-amber-500/20 text-amber-500' :
                      selectedStudent.tier === 'Tier B' ? 'bg-slate-400/10 border-slate-400/20 text-slate-350' :
                      'bg-orange-800/10 border-orange-800/20 text-orange-450'
                    }`}>
                      {selectedStudent.tier}
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                      selectedStudent.riskStatus === 'High' ? 'bg-rose-500/10 border-rose-500/20 text-rose-455' :
                      selectedStudent.riskStatus === 'Low' ? 'bg-slate-800 border-slate-700 text-slate-400' :
                      'bg-emerald-500/10 border-emerald-500/20 text-emerald-450'
                    }`}>
                      Risk: {selectedStudent.riskStatus}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg bg-slate-850 border border-slate-750 text-slate-300">
                      {selectedStudent.hiredStatus}
                    </span>
                    <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border ${
                      selectedStudent.activeStatus === 'Active' ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-450'
                    }`}>
                      {selectedStudent.activeStatus}
                    </span>
                    {selectedStudent.attendanceStreak > 0 && (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                        🔥 {selectedStudent.attendanceStreak} Day Streak
                      </span>
                    )}
                    {selectedStudent.absentStreak > 0 && (
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border bg-rose-500/10 border-rose-500/20 text-rose-450">
                        ⚠️ {selectedStudent.absentStreak} Day Absent
                      </span>
                    )}
                  </div>

                  {/* Performance Indicators */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-slate-950/45 border border-slate-800/80 p-4.5 rounded-2xl text-center shadow-sm">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Total Points</span>
                      <p className="text-2xl font-black text-slate-100 mt-1">{selectedStudent.totalMark || 0}</p>
                    </div>
                    <div className="bg-slate-950/45 border border-slate-800/80 p-4.5 rounded-2xl text-center shadow-sm">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Mock Score</span>
                      <p className="text-2xl font-black text-slate-100 mt-1">{selectedStudent.mockInterviewScore || 0}%</p>
                    </div>
                    <div className="bg-slate-950/45 border border-slate-800/80 p-4.5 rounded-2xl text-center shadow-sm">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Cohort Rank</span>
                      <p className="text-2xl font-black text-indigo-400 mt-1">
                        #{leaderboardSorted.findIndex(s => s._id === selectedStudent._id) + 1}
                      </p>
                    </div>
                  </div>

                  {/* Profile Links & Projects Grid */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Submitted Links & Projects</span>
                    <div className="grid grid-cols-2 gap-3.5">
                      {/* GitHub */}
                      {selectedStudent.profiles.github || selectedStudent.github ? (
                        <a
                          href={selectedStudent.profiles.github || selectedStudent.github}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-slate-950/45 border border-slate-800 hover:border-slate-700 p-3.5 rounded-2xl flex items-center gap-3.5 transition-all hover:bg-slate-900 group"
                        >
                          <div className="h-8 w-8 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-850 group-hover:border-slate-750">
                            <GithubIcon className="h-4.5 w-4.5 text-slate-400 group-hover:text-white" />
                          </div>
                          <div className="text-left">
                            <span className="text-[10px] text-slate-300 font-extrabold uppercase block tracking-wider">GitHub Link</span>
                            <span className="text-[9px] text-slate-500 block truncate max-w-[120px]">View code profile</span>
                          </div>
                          <ExternalLink className="h-3 w-3 text-slate-500 ml-auto" />
                        </a>
                      ) : (
                        <div className="bg-slate-950/20 border border-dashed border-slate-850 p-3.5 rounded-2xl flex items-center gap-3.5 opacity-50 select-none">
                          <div className="h-8 w-8 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-850">
                            <GithubIcon className="h-4.5 w-4.5 text-slate-600" />
                          </div>
                          <div className="text-left">
                            <span className="text-[10px] text-slate-500 font-extrabold uppercase block tracking-wider">GitHub</span>
                            <span className="text-[9px] text-slate-600 block">Not Submitted</span>
                          </div>
                        </div>
                      )}

                      {/* LinkedIn */}
                      {selectedStudent.profiles.linkedin || selectedStudent.linkedin ? (
                        <a
                          href={selectedStudent.profiles.linkedin || selectedStudent.linkedin}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-slate-950/45 border border-slate-800 hover:border-slate-700 p-3.5 rounded-2xl flex items-center gap-3.5 transition-all hover:bg-slate-900 group"
                        >
                          <div className="h-8 w-8 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-850 group-hover:border-slate-750">
                            <LinkedinIcon className="h-4.5 w-4.5 text-indigo-400 group-hover:text-indigo-300" />
                          </div>
                          <div className="text-left">
                            <span className="text-[10px] text-slate-300 font-extrabold uppercase block tracking-wider">LinkedIn Link</span>
                            <span className="text-[9px] text-slate-500 block truncate max-w-[120px]">View professional</span>
                          </div>
                          <ExternalLink className="h-3 w-3 text-slate-500 ml-auto" />
                        </a>
                      ) : (
                        <div className="bg-slate-950/20 border border-dashed border-slate-850 p-3.5 rounded-2xl flex items-center gap-3.5 opacity-50 select-none">
                          <div className="h-8 w-8 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-850">
                            <LinkedinIcon className="h-4.5 w-4.5 text-slate-600" />
                          </div>
                          <div className="text-left">
                            <span className="text-[10px] text-slate-500 font-extrabold uppercase block tracking-wider">LinkedIn</span>
                            <span className="text-[9px] text-slate-600 block">Not Submitted</span>
                          </div>
                        </div>
                      )}

                      {/* Resume */}
                      {selectedStudent.profiles.resume || selectedStudent.resume ? (
                        <a
                          href={selectedStudent.profiles.resume || selectedStudent.resume}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-slate-950/45 border border-slate-800 hover:border-slate-700 p-3.5 rounded-2xl flex items-center gap-3.5 transition-all hover:bg-slate-900 group"
                        >
                          <div className="h-8 w-8 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-850 group-hover:border-slate-750">
                            <FileText className="h-4.5 w-4.5 text-emerald-450 group-hover:text-emerald-400" />
                          </div>
                          <div className="text-left">
                            <span className="text-[10px] text-slate-300 font-extrabold uppercase block tracking-wider">Resume PDF</span>
                            <span className="text-[9px] text-slate-500 block truncate max-w-[120px]">View credentials</span>
                          </div>
                          <ExternalLink className="h-3 w-3 text-slate-550 ml-auto" />
                        </a>
                      ) : (
                        <div className="bg-slate-950/20 border border-dashed border-slate-850 p-3.5 rounded-2xl flex items-center gap-3.5 opacity-50 select-none">
                          <div className="h-8 w-8 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-850">
                            <FileText className="h-4.5 w-4.5 text-slate-600" />
                          </div>
                          <div className="text-left">
                            <span className="text-[10px] text-slate-500 font-extrabold uppercase block tracking-wider">Resume</span>
                            <span className="text-[9px] text-slate-600 block">Not Submitted</span>
                          </div>
                        </div>
                      )}

                      {/* Best Project 1 */}
                      {selectedStudent.bestProject1 ? (
                        <a
                          href={selectedStudent.bestProject1}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-slate-950/45 border border-slate-800 hover:border-slate-700 p-3.5 rounded-2xl flex items-center gap-3.5 transition-all hover:bg-slate-900 group"
                        >
                          <div className="h-8 w-8 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-850 group-hover:border-slate-750">
                            <BookOpen className="h-4.5 w-4.5 text-purple-450 group-hover:text-purple-400" />
                          </div>
                          <div className="text-left">
                            <span className="text-[10px] text-slate-300 font-extrabold uppercase block tracking-wider">Best Project 1</span>
                            <span className="text-[9px] text-slate-500 block truncate max-w-[120px]">View live deployment</span>
                          </div>
                          <ExternalLink className="h-3 w-3 text-slate-550 ml-auto" />
                        </a>
                      ) : (
                        <div className="bg-slate-950/20 border border-dashed border-slate-850 p-3.5 rounded-2xl flex items-center gap-3.5 opacity-50 select-none">
                          <div className="h-8 w-8 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-850">
                            <BookOpen className="h-4.5 w-4.5 text-slate-600" />
                          </div>
                          <div className="text-left">
                            <span className="text-[10px] text-slate-500 font-extrabold uppercase block tracking-wider">Project 1</span>
                            <span className="text-[9px] text-slate-600 block">Not Submitted</span>
                          </div>
                        </div>
                      )}

                      {/* Best Project 2 */}
                      {selectedStudent.bestProject2 ? (
                        <a
                          href={selectedStudent.bestProject2}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-slate-950/45 border border-slate-800 hover:border-slate-700 p-3.5 rounded-2xl flex items-center gap-3.5 transition-all hover:bg-slate-900 group"
                        >
                          <div className="h-8 w-8 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-850 group-hover:border-slate-750">
                            <BookOpen className="h-4.5 w-4.5 text-orange-450 group-hover:text-orange-405" />
                          </div>
                          <div className="text-left">
                            <span className="text-[10px] text-slate-300 font-extrabold uppercase block tracking-wider">Best Project 2</span>
                            <span className="text-[9px] text-slate-500 block truncate max-w-[120px]">View live deployment</span>
                          </div>
                          <ExternalLink className="h-3 w-3 text-slate-550 ml-auto" />
                        </a>
                      ) : (
                        <div className="bg-slate-950/20 border border-dashed border-slate-850 p-3.5 rounded-2xl flex items-center gap-3.5 opacity-50 select-none">
                          <div className="h-8 w-8 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-850">
                            <BookOpen className="h-4.5 w-4.5 text-slate-600" />
                          </div>
                          <div className="text-left">
                            <span className="text-[10px] text-slate-500 font-extrabold uppercase block tracking-wider">Project 2</span>
                            <span className="text-[9px] text-slate-600 block">Not Submitted</span>
                          </div>
                        </div>
                      )}

                      {/* Portfolio */}
                      {selectedStudent.portfolio && selectedStudent.portfolio !== 'N/A' && selectedStudent.portfolio !== 'n/a' ? (
                        <a
                          href={selectedStudent.portfolio}
                          target="_blank"
                          rel="noreferrer"
                          className="bg-slate-950/45 border border-slate-800 hover:border-slate-700 p-3.5 rounded-2xl flex items-center gap-3.5 transition-all hover:bg-slate-900 group"
                        >
                          <div className="h-8 w-8 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-850 group-hover:border-slate-750">
                            <Award className="h-4.5 w-4.5 text-cyan-455 group-hover:text-cyan-350" />
                          </div>
                          <div className="text-left">
                            <span className="text-[10px] text-slate-300 font-extrabold uppercase block tracking-wider">Portfolio Site</span>
                            <span className="text-[9px] text-slate-500 block truncate max-w-[120px]">View showcase</span>
                          </div>
                          <ExternalLink className="h-3 w-3 text-slate-550 ml-auto" />
                        </a>
                      ) : (
                        <div className="bg-slate-950/20 border border-dashed border-slate-850 p-3.5 rounded-2xl flex items-center gap-3.5 opacity-50 select-none">
                          <div className="h-8 w-8 bg-slate-900 rounded-lg flex items-center justify-center border border-slate-850">
                            <Award className="h-4.5 w-4.5 text-slate-600" />
                          </div>
                          <div className="text-left">
                            <span className="text-[10px] text-slate-500 font-extrabold uppercase block tracking-wider">Portfolio</span>
                            <span className="text-[9px] text-slate-600 block">Not Submitted / N/A</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Mentorship logs timeline wrapper */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Mentorship logs (Last Updates)</span>
                    <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4.5 min-h-[140px] flex flex-col justify-between shadow-inner">
                      {selectedStudent.lastUpdateNote ? (
                        <div>
                          <p className="text-xs text-slate-300 leading-relaxed italic bg-slate-900/40 border border-slate-850/80 p-3.5 rounded-xl">
                            &quot;{selectedStudent.lastUpdateNote}&quot;
                          </p>
                          {selectedStudent.lastUpdateDate && (
                            <span className="text-[10px] text-slate-550 block mt-3 font-semibold">
                              Updated: {new Date(selectedStudent.lastUpdateDate).toLocaleString()}
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 italic py-6 text-center">No notes logged yet.</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CAREER & FORM DETAILS */}
              {drawerTab === 'career' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Cohort Identity Information */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-black uppercase text-slate-500 block tracking-wider">Education & Cohort Registration</span>
                    <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-5 space-y-4.5 text-xs text-slate-350">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Discord Username</span>
                          <p className="font-extrabold text-slate-200 mt-1">{selectedStudent.discordUsername || 'Not Provided'}</p>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">L2 Batch</span>
                          <p className="font-extrabold text-slate-200 mt-1">{selectedStudent.level2Batch || 'Not Provided'}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Occupation Status</span>
                          <p className="font-extrabold text-slate-200 mt-1 leading-relaxed">{selectedStudent.currentOccupation || 'Not Provided'}</p>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Next Expected Exam</span>
                          <p className="font-extrabold text-slate-200 mt-1">{selectedStudent.nextExamDate || 'Not Provided'}</p>
                        </div>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Education Institute</span>
                        <p className="font-extrabold text-slate-200 mt-1 leading-relaxed">{selectedStudent.educationInstitute || 'Not Provided'}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Group/Subject</span>
                          <p className="font-extrabold text-slate-200 mt-1 leading-relaxed">{selectedStudent.groupSubject || 'Not Provided'}</p>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Current Address</span>
                          <p className="font-extrabold text-slate-200 mt-1 whitespace-pre-wrap leading-relaxed">{selectedStudent.currentAddress || 'Not Provided'}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Career & Relocation Preferences */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-black uppercase text-slate-500 block tracking-wider">Career Priorities & Relocation</span>
                    <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-5 space-y-4.5 text-xs text-slate-350">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Primary Focus</span>
                          <p className="font-extrabold text-slate-200 mt-1 leading-relaxed">{selectedStudent.primaryFocus || 'Not Provided'}</p>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Placement Timeline</span>
                          <p className="font-extrabold text-slate-200 mt-1 leading-relaxed">{selectedStudent.placementTimeline || 'Not Provided'}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Job Type Preference</span>
                          <p className="font-extrabold text-slate-200 mt-1 leading-relaxed">{selectedStudent.jobTypePreference || 'Not Provided'}</p>
                        </div>
                        <div>
                          <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Dhaka Relocation</span>
                          <p className="font-extrabold text-slate-200 mt-1 leading-relaxed">{selectedStudent.dhakaRelocate || 'Not Provided'}</p>
                        </div>
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Onsite In Home District</span>
                        <p className="font-extrabold text-slate-200 mt-1 leading-relaxed">{selectedStudent.onsiteInHomeDistrict || 'Not Provided'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Bootcamp Commitments & Reality Note */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-black uppercase text-slate-500 block tracking-wider">Bootcamp Agreements & Commitments</span>
                    <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-5 space-y-5 text-xs text-slate-350">
                      <div className="grid grid-cols-3 gap-3">
                        <div className="bg-slate-900 border border-slate-850 p-3 rounded-xl text-center">
                          <span className="text-[8px] text-slate-500 font-bold uppercase block tracking-wider">Placement Team</span>
                          <p className="font-extrabold text-xs mt-1 text-slate-200">{selectedStudent.placementCommitment || 'N/A'}</p>
                        </div>
                        <div className="bg-slate-900 border border-slate-850 p-3 rounded-xl text-center">
                          <span className="text-[8px] text-slate-500 font-bold uppercase block tracking-wider">Attendance Daily</span>
                          <p className="font-extrabold text-xs mt-1 text-slate-200">{selectedStudent.bootcampCommitment || 'N/A'}</p>
                        </div>
                        <div className="bg-slate-900 border border-slate-850 p-3 rounded-xl text-center">
                          <span className="text-[8px] text-slate-500 font-bold uppercase block tracking-wider">Daily Tasks</span>
                          <p className="font-extrabold text-xs mt-1 text-slate-200">{selectedStudent.taskCommitment || 'N/A'}</p>
                        </div>
                      </div>
                      <div className="border-t border-slate-850/60 pt-4.5">
                        <span className="text-[9px] text-slate-550 font-bold uppercase block">Current Reality & Situation Description</span>
                        <p className="font-medium text-slate-350 mt-2 whitespace-pre-wrap leading-relaxed bg-[#0c0810] border border-slate-850 p-4 rounded-xl italic">
                          {selectedStudent.currentSituationNote ? `"${selectedStudent.currentSituationNote}"` : 'Not Provided'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: ATTENDANCE TRACKER */}
              {drawerTab === 'tracker' && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Cohort Calendar Session Grid</span>
                    {(!dates || dates.length === 0 || (selectedStudent.totalAttendance === 0 && selectedStudent.totalAbsent === 0)) ? (
                      <div className="bg-slate-955/45 border border-slate-850 p-8 rounded-2xl text-center space-y-3">
                        <div className="h-14 w-14 bg-slate-900 border border-slate-800 text-slate-500 rounded-2xl flex items-center justify-center mx-auto shadow-md">
                          <Calendar className="h-6 w-6 text-indigo-400" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-extrabold text-slate-200">No Operations Tracking Logged Yet</p>
                          <p className="text-xs text-slate-500 max-w-[280px] mx-auto leading-relaxed">
                            This student has no attendance status marked or point history logged inside this cohort matrix.
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {/* Month and Year Header */}
                        <div className="flex items-center justify-between bg-slate-955/45 border border-slate-850 p-4 rounded-xl shadow-sm">
                          <span className="text-xs font-bold text-slate-200">Session Month</span>
                          <span className="text-[10px] bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 font-extrabold uppercase px-3 py-1.5 rounded-lg tracking-widest">
                            {(() => {
                              const dateObj = new Date(dates[0]);
                              return dateObj.toLocaleString('default', { month: 'long', year: 'numeric' });
                            })()}
                          </span>
                        </div>

                        {/* Calendar Grid card */}
                        <div className="bg-slate-950/40 border border-slate-800 p-5 rounded-2xl space-y-5">
                          <div className="grid grid-cols-7 gap-2.5">
                            {dates.map((date) => {
                              const status = attendanceMatrix[selectedStudent._id]?.[date] || 'Unmarked';
                              const statusColor = status === 'Present' 
                                ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-450 shadow-emerald-500/5' 
                                : status === 'Absent' 
                                ? 'bg-rose-500/10 border border-rose-500/20 text-rose-455 shadow-rose-500/5'
                                : 'bg-amber-500/10 border border-amber-500/20 text-amber-550 shadow-amber-500/5';
                              
                              return (
                                <div
                                  key={date}
                                  title={`${date}: ${status}`}
                                  className={`h-9 w-full rounded-lg flex items-center justify-center font-extrabold text-[10px] select-none border transition-all ${statusColor}`}
                                >
                                  {date.split('-')[2]}
                                </div>
                              );
                            })}
                          </div>

                          {/* Legend status indicators */}
                          <div className="flex gap-4.5 text-[9px] text-slate-500 justify-center border-t border-slate-900/60 pt-4 font-semibold uppercase tracking-wider">
                            <div className="flex items-center gap-1.5">
                              <div className="h-3 w-3 rounded bg-emerald-500/20 border border-emerald-500/30 shadow-inner"></div>
                              <span>Present (+10 Pts)</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="h-3 w-3 rounded bg-rose-500/20 border border-rose-500/30 shadow-inner"></div>
                              <span>Absent (-5 Pts)</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <div className="h-3 w-3 rounded bg-amber-500/20 border border-amber-500/30 shadow-inner"></div>
                              <span>Leave (0 Pts)</span>
                            </div>
                          </div>
                        </div>

                        {/* Timeline list */}
                        <div className="space-y-3">
                          <span className="text-[10px] font-black uppercase tracking-wider text-slate-500 block">Date-Wise Points Breakdown Timeline</span>
                          <div className="bg-slate-955/20 border border-slate-800/80 rounded-xl p-3.5 max-h-[220px] overflow-y-auto space-y-2 shadow-inner">
                            {dates.map((date) => {
                              const status = attendanceMatrix[selectedStudent._id]?.[date] || 'Unmarked';
                              const taskStatus = taskMatrix[selectedStudent._id]?.[date] || 'Incomplete';
                              
                              let points = 0;
                              if (status === 'Present') points += 10;
                              if (status === 'Absent') points -= 5;
                              if (taskStatus === 'Complete') points += 20;

                              const statusBadge = status === 'Present'
                                ? 'bg-emerald-500/10 text-emerald-450 border border-emerald-500/20'
                                : status === 'Absent'
                                ? 'bg-rose-500/10 text-rose-455 border border-rose-500/20'
                                : 'bg-amber-500/10 text-amber-550 border border-amber-500/20';

                              return (
                                <div key={date} className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-slate-955/40 border border-slate-850/80 hover:border-slate-800 hover:bg-slate-950/20 transition-all">
                                  <span className="font-semibold text-slate-400">
                                    {new Date(date).toLocaleDateString('default', { day: '2-digit', month: 'short', year: 'numeric' })}
                                  </span>
                                  <div className="flex items-center gap-2">
                                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md ${statusBadge}`}>
                                      {status}
                                    </span>
                                    <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                                      taskStatus === 'Complete' ? 'bg-indigo-500/10 text-indigo-450 border border-indigo-500/20' : 'bg-slate-800 text-slate-500'
                                    }`}>
                                      Task: {taskStatus}
                                    </span>
                                    <span className={`text-[10px] font-black ${points >= 0 ? 'text-indigo-400' : 'text-rose-455'}`}>
                                      {points >= 0 ? `+${points}` : points} Pts
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>

            {/* Note Appending Form Footer (Visible only inside overview panel tab) */}
            {drawerTab === 'overview' && (
              <form onSubmit={handleAddProfileNote} className="p-4 border-t border-slate-800/80 bg-slate-950/40 flex items-center gap-3.5 backdrop-blur-md">
                <input
                  type="text"
                  required
                  placeholder="Append mentorship note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="flex-1 text-xs bg-slate-950 border border-slate-800 focus:border-indigo-500 text-slate-200 px-4 py-3 rounded-xl outline-none placeholder:text-slate-655"
                />
                <button
                  type="submit"
                  disabled={noteSaving}
                  className="bg-indigo-600 hover:bg-indigo-550 text-white p-3 rounded-xl transition-all shadow-lg shadow-indigo-650/20 disabled:opacity-50"
                >
                  {noteSaving ? (
                    <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditStudentModal && editStudentData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowEditStudentModal(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-xl relative z-10 overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-100">Edit Student Data</h3>
              <button 
                onClick={() => setShowEditStudentModal(false)}
                className="h-8 w-8 rounded-lg bg-slate-950/40 text-slate-400 hover:text-slate-100 flex items-center justify-center border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <form onSubmit={handleUpdateStudentSubmit} className="p-6 flex flex-col max-h-[85vh]">
              {/* Scrollable fields wrapper */}
              <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[55vh]">
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

                {/* Additional Google Form Fields Section */}
                <div className="border-t border-slate-800 pt-4 space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-indigo-400">Additional Information</h4>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Discord Username</label>
                      <input
                        type="text"
                        value={editStudentData.discordUsername || ''}
                        onChange={e => setEditStudentData({...editStudentData, discordUsername: e.target.value})}
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                        placeholder="e.g. username#1234"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Level 2 Batch</label>
                      <select
                        value={editStudentData.level2Batch || ''}
                        onChange={e => setEditStudentData({...editStudentData, level2Batch: e.target.value})}
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                      >
                        <option value="">Select L2 Batch</option>
                        <option value="Level 2 Batch 1">Level 2 Batch 1</option>
                        <option value="Level 2 Batch 2">Level 2 Batch 2</option>
                        <option value="Level 2 Batch 3">Level 2 Batch 3</option>
                        <option value="Level 2 Batch 4">Level 2 Batch 4</option>
                        <option value="Level 2 Batch 5">Level 2 Batch 5</option>
                        <option value="Level 2 Batch 6">Level 2 Batch 6</option>
                        <option value="Level 2 Batch 7">Level 2 Batch 7</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Occupation</label>
                      <select
                        value={editStudentData.currentOccupation || ''}
                        onChange={e => setEditStudentData({...editStudentData, currentOccupation: e.target.value})}
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                      >
                        <option value="">Select Occupation</option>
                        <option value="University Student">University Student</option>
                        <option value="College Student">College Student</option>
                        <option value="High School Student">High School Student</option>
                        <option value="Non Development Job (Looking for a switch)">Non Development Job (Looking for a switch)</option>
                        <option value="Development Job">Development Job</option>
                        <option value="Unemployed (Looking for first job)">Unemployed (Looking for first job)</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Next Exam Possible Date</label>
                      <input
                        type="text"
                        value={editStudentData.nextExamDate || ''}
                        onChange={e => setEditStudentData({...editStudentData, nextExamDate: e.target.value})}
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                        placeholder="e.g. 2026-10-15 or N/A"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Education Institute</label>
                      <input
                        type="text"
                        value={editStudentData.educationInstitute || ''}
                        onChange={e => setEditStudentData({...editStudentData, educationInstitute: e.target.value})}
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                        placeholder="University or College Name"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Group / Subject</label>
                      <input
                        type="text"
                        value={editStudentData.groupSubject || ''}
                        onChange={e => setEditStudentData({...editStudentData, groupSubject: e.target.value})}
                        className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition-colors"
                        placeholder="e.g. Science, CSE, BBA"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Current Address</label>
                    <textarea
                      value={editStudentData.currentAddress || ''}
                      onChange={e => setEditStudentData({...editStudentData, currentAddress: e.target.value})}
                      rows={2}
                      className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-indigo-500 transition-colors resize-none"
                      placeholder="Area, Police Station, and District"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-6 border-t border-slate-800 flex justify-end gap-3 shrink-0">
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

      {/* Custom Form Builder Modal */}
      {showFormBuilderModal && (() => {
        const getFieldIcon = (type: string) => {
          switch (type) {
            case 'text':
              return <FileText className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />;
            case 'textarea':
              return <AlignLeft className="h-4 w-4 text-emerald-500 dark:text-emerald-400" />;
            case 'select':
              return <ChevronDown className="h-4 w-4 text-amber-500 dark:text-amber-400" />;
            case 'checkbox':
              return <CheckSquare className="h-4 w-4 text-purple-500 dark:text-purple-400" />;
            case 'date':
              return <Calendar className="h-4 w-4 text-rose-500 dark:text-rose-400" />;
            default:
              return <FileText className="h-4 w-4 text-slate-500" />;
          }
        };

        const getFieldTypeName = (type: string) => {
          switch (type) {
            case 'text': return 'Short Answer';
            case 'textarea': return 'Paragraph';
            case 'select': return 'Dropdown';
            case 'checkbox': return 'Checkboxes';
            case 'date': return 'Date';
            default: return type;
          }
        };

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div onClick={() => setShowFormBuilderModal(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>
            
            <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl relative z-10 overflow-hidden flex flex-col max-h-[85vh]">
              <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                    <Settings className="h-5 w-5 text-indigo-500 animate-spin-slow" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100">Configure Student Info Form</h3>
                    <p className="text-xs text-slate-500 mt-0.5">Customize form inputs sent to students for detailed data collection.</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowFormBuilderModal(false)}
                  className="h-8 w-8 rounded-lg bg-slate-950/40 text-slate-400 hover:text-slate-100 flex items-center justify-center border border-slate-800 hover:border-slate-700 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <div className="p-6 overflow-y-auto space-y-6 flex-1 max-h-[60vh]">
                {/* Existing fields list */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-850 pb-2">
                    <ClipboardList className="h-4 w-4 text-slate-450" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Current Form Fields</span>
                  </div>

                  <div className="space-y-2.5">
                    {customFields.map((field) => {
                      const isEditing = editingFieldId === field.id;
                      const isCoreField = field.id === 'email' || field.id === 'name';

                      if (isEditing) {
                        return (
                          <div 
                            key={field.id}
                            className="bg-slate-950/45 border-l-4 border-l-indigo-600 border-y border-r border-slate-800 p-5 rounded-2xl space-y-4 shadow-md transition-all animate-fadeIn"
                          >
                            <div className="flex items-center justify-between gap-4 border-b border-slate-800 pb-3">
                              <div className="flex items-center gap-2">
                                <div className="h-7 w-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                                  <Edit3 className="h-4 w-4 text-indigo-550" />
                                </div>
                                <span className="text-xs font-bold text-slate-200">
                                  Editing Field: <code className="text-indigo-400 font-mono bg-slate-950/30 px-1.5 py-0.5 rounded">{field.id}</code>
                                </span>
                              </div>
                              <button
                                onClick={() => setEditingFieldId(null)}
                                className="text-[10px] font-bold text-indigo-450 hover:text-white transition-colors bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 rounded-xl uppercase flex items-center gap-1 cursor-pointer"
                              >
                                <Check className="h-3.5 w-3.5" />
                                Done
                              </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Field Display Label</label>
                                <input
                                  type="text"
                                  value={field.label}
                                  onChange={(e) => handleUpdateFieldLabel(field.id, e.target.value)}
                                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500 transition-colors"
                                />
                              </div>

                              <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Field Input Type</label>
                                <div className="relative">
                                  <select
                                    value={field.type}
                                    onChange={(e) => handleUpdateFieldType(field.id, e.target.value)}
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500 transition-colors cursor-pointer appearance-none"
                                  >
                                    <option value="text">Short answer</option>
                                    <option value="textarea">Paragraph</option>
                                    <option value="select">Multiple choice / Dropdown</option>
                                    <option value="checkbox">Checkboxes</option>
                                    <option value="date">Date</option>
                                  </select>
                                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
                                    <ChevronDown className="h-3.5 w-3.5" />
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-2 pt-6">
                                <label className="flex items-center gap-2.5 cursor-pointer select-none text-[10px] font-bold uppercase tracking-wider text-slate-500 py-2">
                                  <input
                                    type="checkbox"
                                    checked={field.required}
                                    onChange={(e) => handleUpdateFieldRequired(field.id, e.target.checked)}
                                    className="rounded border-slate-800 text-indigo-650 focus:ring-indigo-500 h-4.5 w-4.5 cursor-pointer"
                                  />
                                  Required Field
                                </label>
                              </div>
                            </div>

                            {(field.type === 'select' || field.type === 'checkbox') && (
                              <div className="space-y-1.5 border-t border-slate-850/50 pt-3">
                                <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Dropdown / Checkbox Options (comma-separated list)</label>
                                <input
                                  type="text"
                                  placeholder="e.g. Option A, Option B, Option C"
                                  value={field.options ? field.options.join(', ') : ''}
                                  onChange={(e) => handleUpdateFieldOptions(field.id, e.target.value)}
                                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500 transition-colors"
                                />
                              </div>
                            )}
                          </div>
                        );
                      }

                      if (isCoreField) {
                        return (
                          <div 
                            key={field.id}
                            className="bg-slate-950/20 border border-slate-850/60 rounded-2xl p-4 flex items-center justify-between gap-4 select-none opacity-85 transition-all"
                          >
                            <div className="flex items-center gap-3.5 flex-1 min-w-0">
                              <div className="h-10 w-10 rounded-xl bg-slate-950/30 border border-slate-850 flex items-center justify-center shrink-0">
                                {getFieldIcon(field.type)}
                              </div>
                              <div className="space-y-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="text-sm font-bold text-slate-300 truncate">{field.label}</span>
                                  <span className="text-[10px] bg-slate-850 text-slate-500 border border-slate-800 px-2 py-0.5 rounded-full font-semibold tracking-wide">
                                    {getFieldTypeName(field.type)}
                                  </span>
                                  <span className="text-[10px] bg-indigo-500/10 text-indigo-450 border border-indigo-500/20 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500"></span>
                                    System Required
                                  </span>
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                  <span className="flex items-center gap-1">
                                    <Key className="h-3 w-3 text-slate-600" />
                                    Field Key: <code className="text-slate-450 font-mono text-[10px] bg-slate-950/25 px-1 py-0.5 rounded">{field.id}</code>
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 shrink-0 pr-2">
                              <span className="text-slate-550 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider bg-slate-850 border border-slate-800 px-3 py-1.5 rounded-xl">
                                <Lock className="h-3.5 w-3.5 text-slate-650" />
                                Locked
                              </span>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div 
                          key={field.id}
                          className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-4 hover:border-slate-750 transition-all shadow-sm hover:shadow-md animate-fadeIn"
                        >
                          <div className="flex items-center gap-3.5 flex-1 min-w-0">
                            <div className="h-10 w-10 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-center shrink-0">
                              {getFieldIcon(field.type)}
                            </div>
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-bold text-slate-200 truncate">{field.label}</span>
                                <span className="text-[10px] bg-slate-850 text-slate-400 border border-slate-800 px-2 py-0.5 rounded-full font-medium tracking-wide">
                                  {getFieldTypeName(field.type)}
                                </span>
                                {field.required && (
                                  <span className="text-[10px] bg-rose-500/10 text-rose-500 border border-rose-500/20 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                                    <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                                    Required
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-3 text-xs text-slate-500">
                                <span className="flex items-center gap-1">
                                  <Key className="h-3 w-3 text-slate-600" />
                                  Field Key: <code className="text-slate-400 font-mono text-[10px] bg-slate-950/30 px-1 py-0.5 rounded">{field.id}</code>
                                </span>
                                {field.options && field.options.length > 0 && (
                                  <span className="truncate max-w-[200px] text-slate-450 font-medium">
                                    • Options: {field.options.join(', ')}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              onClick={() => setEditingFieldId(field.id)}
                              className="h-9 w-9 rounded-xl bg-slate-950/50 text-slate-450 hover:text-slate-100 flex items-center justify-center border border-slate-800 hover:border-slate-700 transition-all hover:bg-slate-900 cursor-pointer"
                              title="Edit field details"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleRemoveCustomField(field.id)}
                              className="h-9 w-9 rounded-xl bg-rose-500/10 text-rose-450 hover:bg-rose-500/20 hover:text-rose-450 flex items-center justify-center border border-rose-500/25 hover:border-rose-500/40 transition-all cursor-pointer"
                              title="Delete field"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Add field section */}
                <div className="border-t border-slate-800 pt-6 space-y-4">
                  <div className="flex items-center gap-2 pb-1">
                    <div className="h-7 w-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                      <Plus className="h-4.5 w-4.5 text-indigo-500" />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-350 block">Add Custom Form Field</span>
                  </div>
                  
                  <div className="bg-slate-950/20 border border-slate-850/60 p-5 rounded-2xl space-y-4 shadow-inner">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                          Field Key ID <span className="text-slate-600 font-normal lowercase">(e.g. fathersname)</span>
                        </label>
                        <input
                          type="text"
                          placeholder="lowercase, letters/numbers only"
                          value={newFieldName}
                          onChange={(e) => setNewFieldName(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600 font-mono"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Field Display Label</label>
                        <input
                          type="text"
                          placeholder="e.g. Father's Name"
                          value={newFieldLabel}
                          onChange={(e) => setNewFieldLabel(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Field Input Type</label>
                        <div className="relative">
                          <select
                            value={newFieldType}
                            onChange={(e: any) => {
                              setNewFieldType(e.target.value);
                              setNewFieldOptions('');
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500 transition-colors cursor-pointer appearance-none"
                          >
                            <option value="text">Short answer</option>
                            <option value="textarea">Paragraph</option>
                            <option value="select">Dropdown / Select Menu</option>
                            <option value="checkbox">Checkboxes</option>
                            <option value="date">Date</option>
                          </select>
                          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-500">
                            <ChevronDown className="h-4 w-4" />
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1.5 flex flex-col justify-end">
                        <label className="flex items-center gap-2.5 cursor-pointer py-3 select-none text-[10px] font-bold uppercase tracking-wider text-slate-500">
                          <input
                            type="checkbox"
                            checked={newFieldRequired}
                            onChange={(e) => setNewFieldRequired(e.target.checked)}
                            className="rounded border-slate-800 text-indigo-650 focus:ring-indigo-500 h-4.5 w-4.5 cursor-pointer"
                          />
                          Make this field Required
                        </label>
                      </div>
                    </div>

                    {(newFieldType === 'select' || newFieldType === 'checkbox') && (
                      <div className="space-y-1.5 border-t border-slate-850 pt-3 animate-fadeIn">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Dropdown / Checkbox Options (comma-separated list)</label>
                        <input
                          type="text"
                          placeholder="e.g. Option A, Option B, Option C"
                          value={newFieldOptions}
                          onChange={(e) => setNewFieldOptions(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
                        />
                      </div>
                    )}

                    <div className="pt-2 flex justify-end">
                      <button
                        type="button"
                        onClick={handleAddCustomField}
                        className="bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-bold text-[10px] uppercase tracking-wider px-5 py-2.5 rounded-xl transition-all flex items-center gap-1.5 shadow-sm shadow-indigo-600/10 cursor-pointer"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Append Field
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-slate-800 flex justify-end gap-3 shrink-0">
                <button
                  type="button"
                  onClick={() => setShowFormBuilderModal(false)}
                  className="px-5 py-2.5 text-xs font-semibold text-slate-350 hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveFormConfig}
                  disabled={formSaving}
                  className="bg-gradient-to-r from-purple-650 to-indigo-650 hover:from-purple-600 hover:to-indigo-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 flex items-center gap-2 cursor-pointer"
                >
                  {formSaving ? (
                    <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Form Configuration
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Import Details Modal */}
      {showImportDetailsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowImportDetailsModal(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-100">Import Student Details</h3>
                <p className="text-xs text-slate-500 mt-1">Match by student email and merge additional info dynamically.</p>
              </div>
              <button 
                onClick={() => setShowImportDetailsModal(false)}
                className="h-8 w-8 rounded-lg bg-slate-950/40 text-slate-400 hover:text-slate-100 flex items-center justify-center border border-slate-800 hover:border-slate-700 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {importDetailsMsg.text && (
                <div className={`p-4 rounded-xl text-xs font-semibold leading-relaxed flex items-start gap-2.5 ${
                  importDetailsMsg.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                  importDetailsMsg.type === 'error' ? 'bg-rose-500/10 border border-rose-500/20 text-rose-450' :
                  'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400'
                }`}>
                  {importDetailsMsg.type === 'error' ? <XCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" /> : <CheckCircle2 className="h-4.5 w-4.5 shrink-0 mt-0.5" />}
                  <span>{importDetailsMsg.text}</span>
                </div>
              )}

              {/* Option A: Google Sheet Link */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Google Sheet URL</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    disabled={importDetailsLoading}
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    value={importDetailsSheetUrl}
                    onChange={(e) => setImportDetailsSheetUrl(e.target.value)}
                    className="flex-1 bg-slate-950/50 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-600"
                  />
                  <button
                    onClick={handleImportDetailsGoogleSheet}
                    disabled={importDetailsLoading || !importDetailsSheetUrl}
                    className="bg-indigo-650 hover:bg-indigo-600 text-white text-xs font-semibold px-4 py-3 rounded-xl transition-all disabled:opacity-50"
                  >
                    {importDetailsLoading ? 'Loading...' : 'Import'}
                  </button>
                </div>
              </div>

              {/* Divider */}
              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-slate-800/80"></div>
                <span className="flex-shrink mx-4 text-[10px] text-slate-600 uppercase font-black tracking-widest">Or Upload File</span>
                <div className="flex-grow border-t border-slate-800/80"></div>
              </div>

              {/* Option B: Local File Picker */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Excel / CSV File</label>
                <div className="border border-dashed border-slate-800 hover:border-slate-700 rounded-2xl p-6 text-center cursor-pointer relative bg-slate-950/20 transition-colors">
                  <input
                    type="file"
                    disabled={importDetailsLoading}
                    accept=".csv,.xlsx,.xls"
                    onChange={handleImportDetailsFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <ClipboardList className="h-8 w-8 text-slate-500 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-350">Click to upload spreadsheet file</p>
                  <p className="text-[10px] text-slate-500 mt-1">Accepts .xlsx, .xls, or .csv formats</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowImportDetailsModal(false)}
                className="bg-slate-950/40 border border-slate-850 hover:border-slate-700 text-slate-350 hover:text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Add Modal */}
      {showBulkAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div onClick={() => setShowBulkAddModal(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"></div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-lg relative z-10 overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-100">Add New Students (Bulk Import)</h3>
                <p className="text-xs text-slate-500 mt-1">Upload an Excel or CSV file containing at least Name and Email.</p>
              </div>
              <button 
                onClick={() => setShowBulkAddModal(false)}
                className="h-8 w-8 rounded-lg bg-slate-950/40 text-slate-400 hover:text-white flex items-center justify-center border border-slate-800 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              {bulkAddMsg.text && (
                <div className={`p-4 rounded-xl text-xs font-semibold leading-relaxed flex items-start gap-2.5 ${
                  bulkAddMsg.type === 'success' ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' :
                  bulkAddMsg.type === 'error' ? 'bg-rose-500/10 border border-rose-500/20 text-rose-450' :
                  'bg-indigo-500/10 border border-indigo-500/20 text-indigo-400'
                }`}>
                  {bulkAddMsg.type === 'error' ? <XCircle className="h-4.5 w-4.5 shrink-0 mt-0.5" /> : <CheckCircle2 className="h-4.5 w-4.5 shrink-0 mt-0.5" />}
                  <span>{bulkAddMsg.text}</span>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Upload Spreadsheet (Excel/CSV)</label>
                <div className="border border-dashed border-slate-700 hover:border-emerald-600 rounded-2xl p-6 text-center cursor-pointer relative bg-slate-950/30 transition-colors">
                  <input
                    type="file"
                    disabled={bulkAddLoading}
                    accept=".csv,.xlsx,.xls"
                    onChange={handleBulkAddFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Users className="h-8 w-8 text-emerald-500/60 mx-auto mb-2" />
                  <p className="text-xs font-semibold text-slate-300">Click or drag file to upload</p>
                  <p className="text-[10px] text-slate-500 mt-1">Requires 'Name' and 'Email' columns</p>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-800 flex justify-end">
              <button
                type="button"
                onClick={() => setShowBulkAddModal(false)}
                className="bg-slate-800 hover:bg-slate-700 text-white px-5 py-2.5 rounded-xl text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
