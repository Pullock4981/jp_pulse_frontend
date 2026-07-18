'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  ClipboardCheck, 
  AlertTriangle, 
  Send, 
  HelpCircle, 
  User, 
  Mail, 
  Phone, 
  Hash, 
  MapPin, 
  GraduationCap, 
  BookOpen, 
  Calendar, 
  Briefcase, 
  Layers,
  Sun,
  Moon,
  ChevronDown
} from 'lucide-react';

export default function StudentPublicFormPage() {
  const { projectId } = useParams();
  
  const [formConfig, setFormConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<any>({});
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Sync dark class on mount
  useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    if (document.documentElement.classList.contains('dark')) {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
    } else {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
    }
  };

  // Fetch Form Config on Load
  useEffect(() => {
    async function fetchFormSchema() {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://hackathon-backend-sandy.vercel.app/api/v1';
        const res = await fetch(`${backendUrl}/public/projects/${projectId}/form`);
        const result = await res.json();
        
        if (result.success && result.data) {
          setFormConfig(result.data);
          // Initialize empty form values
          const initialData: any = {};
          result.data.fields.forEach((f: any) => {
            initialData[f.id] = '';
          });
          setFormData(initialData);
        } else {
          setError('This student detailed info collection form has not been configured by the admin yet.');
        }
      } catch (err) {
        setError('Error establishing connection with the Placement Pulse server.');
      } finally {
        setLoading(false);
      }
    }

    if (projectId) {
      fetchFormSchema();
    }
  }, [projectId]);

  // Form Field Icons Mapping Helper
  const getFieldIcon = (fieldId: string) => {
    switch (fieldId) {
      case 'name': return <User className="h-5 w-5 text-slate-400" />;
      case 'email': return <Mail className="h-5 w-5 text-slate-400" />;
      case 'phoneNumber': return <Phone className="h-5 w-5 text-slate-400" />;
      case 'discordUsername': return <Hash className="h-5 w-5 text-slate-400" />;
      case 'currentAddress': return <MapPin className="h-5 w-5 text-slate-400" />;
      case 'educationInstitute': return <GraduationCap className="h-5 w-5 text-slate-400" />;
      case 'groupSubject': return <BookOpen className="h-5 w-5 text-slate-400" />;
      case 'nextExamDate': return <Calendar className="h-5 w-5 text-slate-400" />;
      case 'currentOccupation': return <Briefcase className="h-5 w-5 text-slate-400" />;
      case 'level2Batch': return <Layers className="h-5 w-5 text-slate-400" />;
      default: return <HelpCircle className="h-5 w-5 text-slate-400" />;
    }
  };

  const handleInputChange = (fieldId: string, value: string) => {
    setFormData({
      ...formData,
      [fieldId]: value
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'https://hackathon-backend-sandy.vercel.app/api/v1';
      const res = await fetch(`${backendUrl}/public/projects/${projectId}/form/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      const result = await res.json();

      if (res.ok && result.success) {
        setSubmitted(true);
      } else {
        setError(result.message || 'Submission failed. Please check your inputs.');
      }
    } catch (err) {
      setError('Network error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex items-center justify-center p-4 font-sans select-none overflow-y-auto">
      {/* Background layer: system default theme logic handles visibility via CSS styles */}
      {/* Light Mode Grid Background */}
      <div
        className="absolute inset-0 z-0 block dark:hidden"
        style={{
          background: '#f9fafb',
          backgroundImage: `
            linear-gradient(to right, #d1d5db 1px, transparent 1px),
            linear-gradient(to bottom, #d1d5db 1px, transparent 1px)
          `,
          backgroundSize: '32px 32px',
          WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at 100% 0%, #000 50%, transparent 90%)',
          maskImage: 'radial-gradient(ellipse 80% 80% at 100% 0%, #000 50%, transparent 90%)',
        }}
      />
      {/* Dark Mode Gradient Background */}
      <div
        className="absolute inset-0 z-0 hidden dark:block"
        style={{
          background: 'radial-gradient(125% 125% at 50% 10%, #000000 40%, #350136 100%)',
        }}
      />

      <div className="w-full max-w-2xl bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 relative">
        {/* Upper colored visual stripe */}
        <div className="h-2 w-full bg-gradient-to-r from-purple-600 via-indigo-600 to-orange-500"></div>

        <div className="p-8 md:p-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="h-10 w-10 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin"></div>
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Loading form template...</p>
            </div>
          ) : error && !formConfig ? (
            <div className="text-center py-16 space-y-6">
              <div className="h-16 w-16 bg-rose-500/10 border border-rose-500/20 text-rose-500 rounded-2xl flex items-center justify-center mx-auto">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-slate-850 dark:text-slate-100">Form Not Available</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
                  {error}
                </p>
              </div>
            </div>
          ) : submitted ? (
            <div className="text-center py-16 space-y-6">
              <div className="h-20 w-20 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto animate-bounce">
                <ClipboardCheck className="h-10 w-10" />
              </div>
              <div className="space-y-2">
                <h3 className="text-2xl font-extrabold text-slate-850 dark:text-slate-100">Submission Successful</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
                  Thank you! Your details have been parsed and synced to your student profile dashboard.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-slate-800/80 pb-6 gap-4 animate-fadeIn">
                <div className="space-y-1 text-left">
                  <h2 className="text-xl md:text-2xl font-black bg-gradient-to-r from-slate-900 via-indigo-950 to-orange-600 dark:from-white dark:via-slate-200 dark:to-orange-400 bg-clip-text text-transparent">
                    Kaizen Student Details Portal
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Fields marked with <span className="text-rose-500 font-bold">*</span> are required.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={toggleTheme}
                  className="h-9 w-9 rounded-xl bg-slate-100 dark:bg-slate-800/60 text-slate-600 dark:text-slate-350 hover:text-slate-900 dark:hover:text-white flex items-center justify-center border border-slate-250 dark:border-slate-700 transition-all shrink-0"
                >
                  {isDarkMode ? <Sun className="h-4.5 w-4.5" /> : <Moon className="h-4.5 w-4.5" />}
                </button>
              </div>

              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-rose-600 dark:text-rose-450 font-semibold leading-relaxed">
                    {error}
                  </p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {formConfig.fields.map((field: any) => {
                    const isFullWidth = field.type === 'textarea' || field.id === 'currentAddress';
                    return (
                      <div key={field.id} className={`space-y-2 ${isFullWidth ? 'md:col-span-2' : ''}`}>
                        <label className="text-xs font-extrabold uppercase tracking-widest text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                          {field.label}
                          {field.required && <span className="text-rose-500 font-bold">*</span>}
                        </label>

                        <div className="relative flex items-center w-full">
                          {field.type !== 'textarea' && field.type !== 'checkbox' && (
                            <div className="absolute left-4 pointer-events-none z-10">
                              {getFieldIcon(field.id)}
                            </div>
                          )}

                          {field.type === 'select' ? (
                            <div className="relative flex items-center w-full">
                              <select
                                required={field.required}
                                value={formData[field.id]}
                                onChange={(e) => handleInputChange(field.id, e.target.value)}
                                className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-10 py-3.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 focus:ring-1 focus:ring-indigo-500 transition-all appearance-none cursor-pointer placeholder:text-slate-450 dark:placeholder:text-slate-500"
                              >
                                <option value="" disabled className="bg-white dark:bg-slate-950 text-slate-550">Choose option...</option>
                                {field.options?.map((opt: string) => (
                                  <option key={opt} value={opt} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100">{opt}</option>
                                ))}
                              </select>
                              <ChevronDown className="absolute right-4 h-4 w-4 text-slate-400 dark:text-slate-500 pointer-events-none" />
                            </div>
                          ) : field.type === 'checkbox' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 w-full p-1">
                              {field.options?.map((opt: string) => {
                                const selectedArray = Array.isArray(formData[field.id]) 
                                  ? formData[field.id] 
                                  : (formData[field.id] ? String(formData[field.id]).split(',').map((s: string) => s.trim()) : []);
                                const isChecked = selectedArray.includes(opt);
                                return (
                                  <label key={opt} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/20 border border-slate-200 dark:border-slate-800 hover:border-slate-350 dark:hover:border-slate-700 cursor-pointer select-none transition-colors">
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) => {
                                        let nextSelected;
                                        if (e.target.checked) {
                                          nextSelected = [...selectedArray, opt];
                                        } else {
                                          nextSelected = selectedArray.filter((s: string) => s !== opt);
                                        }
                                        handleInputChange(field.id, nextSelected);
                                      }}
                                      className="rounded border-slate-300 dark:border-slate-850 text-indigo-600 focus:ring-indigo-500 mt-0.5"
                                    />
                                    <span className="text-xs font-semibold text-slate-850 dark:text-slate-200 leading-tight">{opt}</span>
                                  </label>
                                );
                              })}
                            </div>
                          ) : field.type === 'textarea' ? (
                            <textarea
                              required={field.required}
                              value={formData[field.id]}
                              onChange={(e) => handleInputChange(field.id, e.target.value)}
                              rows={3}
                              placeholder={`Enter details...`}
                              className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-3.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 focus:ring-1 focus:ring-indigo-500 transition-all resize-none placeholder:text-slate-450 dark:placeholder:text-slate-500"
                            />
                          ) : (
                            <input
                              type={field.type === 'date' ? 'date' : 'text'}
                              required={field.required}
                              value={formData[field.id]}
                              onChange={(e) => handleInputChange(field.id, e.target.value)}
                              placeholder={`Enter ${field.label.toLowerCase()}...`}
                              className="w-full bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 rounded-2xl pl-12 pr-4 py-3.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:border-indigo-500 focus:bg-white dark:focus:bg-slate-950 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-450 dark:placeholder:text-slate-500"
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex justify-end">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full md:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-sm px-8 py-3.5 rounded-2xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitting ? (
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    Submit Details
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
