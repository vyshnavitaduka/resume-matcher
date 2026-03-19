import React from 'react';
import { Briefcase, FileSearch, LayoutDashboard, Settings, Users, AlertCircle } from 'lucide-react';
import { JobDescriptionInput } from './components/JobDescriptionInput';
import { ResumeUpload } from './components/ResumeUpload';
import { AnalysisResult } from './components/AnalysisResult';
import { JobsView } from './components/JobsView';
import { CandidatesView } from './components/CandidatesView';
import { DashboardView } from './components/DashboardView';
import { CandidateProfileView } from './components/CandidateProfileView';
import { SettingsView } from './components/SettingsView';
import { analyzeResume } from './services/gemini';
import { ResumeFile, JobRole, ResumeAnalysis } from './types';
import { motion, AnimatePresence } from 'motion/react';

type View = 'dashboard' | 'matcher' | 'jobs' | 'candidates' | 'settings' | 'profile';

export default function App() {
  const [currentView, setCurrentView] = React.useState<View>('dashboard');
  const [jobDescription, setJobDescription] = React.useState('');
  const [resumes, setResumes] = React.useState<ResumeFile[]>([]);
  const [selectedResumeId, setSelectedResumeId] = React.useState<string | null>(null);
  const [selectedProfileId, setSelectedProfileId] = React.useState<string | null>(null);
  const [jobs, setJobs] = React.useState<JobRole[]>(() => {
    const saved = localStorage.getItem('jobs');
    return saved ? JSON.parse(saved) : [];
  });

  const handleClearData = (type: 'resumes' | 'jobs' | 'all') => {
    if (type === 'resumes' || type === 'all') {
      setResumes([]);
      setSelectedResumeId(null);
      setSelectedProfileId(null);
    }
    if (type === 'jobs' || type === 'all') {
      setJobs([]);
      localStorage.removeItem('jobs');
    }
  };

  React.useEffect(() => {
    localStorage.setItem('jobs', JSON.stringify(jobs));
  }, [jobs]);

  const handleUpload = async (name: string, content: string) => {
    const newResume: ResumeFile = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      content,
      type: 'text/plain',
      isAnalyzing: true,
    };

    setResumes(prev => [...prev, newResume]);
    setSelectedResumeId(newResume.id);

    try {
      if (!jobDescription.trim()) {
        throw new Error("Please provide a job description first.");
      }
      const analysis = await analyzeResume(content, jobDescription);
      setResumes(prev => prev.map(r => r.id === newResume.id ? { ...r, analysis, isAnalyzing: false } : r));
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Analysis failed");
      setResumes(prev => prev.map(r => r.id === newResume.id ? { ...r, isAnalyzing: false } : r));
    }
  };

  const handleRemove = (id: string) => {
    setResumes(prev => prev.filter(r => r.id !== id));
    if (selectedResumeId === id) setSelectedResumeId(null);
  };

  const handleUpdateResumeAnalysis = (id: string, analysis: ResumeAnalysis) => {
    setResumes(prev => prev.map(r => r.id === id ? { ...r, analysis, isAnalyzing: false } : r));
  };

  const handleStartAnalysis = (id: string) => {
    setResumes(prev => prev.map(r => r.id === id ? { ...r, isAnalyzing: true } : r));
  };

  const handleSaveJob = (job: JobRole) => {
    setJobs(prev => [job, ...prev]);
  };

  const handleDeleteJob = (id: string) => {
    setJobs(prev => prev.filter(j => j.id !== id));
  };

  const selectedResume = resumes.find(r => r.id === selectedResumeId);

  return (
    <div className="min-h-screen flex flex-col bg-bg text-ink font-sans selection:bg-ink selection:text-bg">
      {/* Header */}
      <header className="border-b border-line p-4 flex items-center justify-between bg-white sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="bg-ink text-bg p-2">
            <FileSearch className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-serif italic leading-none">Resume Matcher</h1>
            <p className="text-[10px] font-mono uppercase tracking-widest opacity-50 mt-1">AI-Powered HR Automation</p>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <NavItem 
            icon={<LayoutDashboard className="w-4 h-4" />} 
            label="Dashboard" 
            active={currentView === 'dashboard'} 
            onClick={() => setCurrentView('dashboard')}
          />
          <NavItem 
            icon={<FileSearch className="w-4 h-4" />} 
            label="AI Matcher" 
            active={currentView === 'matcher'} 
            onClick={() => setCurrentView('matcher')}
          />
          <NavItem 
            icon={<Briefcase className="w-4 h-4" />} 
            label="Jobs" 
            active={currentView === 'jobs'} 
            onClick={() => setCurrentView('jobs')}
          />
          <NavItem 
            icon={<Users className="w-4 h-4" />} 
            label="Candidates" 
            active={currentView === 'candidates'} 
            onClick={() => setCurrentView('candidates')}
          />
          <NavItem 
            icon={<Settings className="w-4 h-4" />} 
            label="Settings" 
            active={currentView === 'settings'} 
            onClick={() => setCurrentView('settings')}
          />
        </nav>
      </header>

      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          {currentView === 'dashboard' ? (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full p-8 max-w-7xl mx-auto overflow-y-auto"
            >
              <DashboardView 
                resumes={resumes} 
                jobs={jobs} 
                onSelectCandidate={(id) => {
                  if (id) {
                    setSelectedProfileId(id);
                    setCurrentView('profile');
                  } else {
                    setCurrentView('candidates');
                  }
                }}
                onSelectJob={(id) => {
                  setCurrentView('jobs');
                }}
              />
            </motion.div>
          ) : currentView === 'matcher' ? (
            <motion.div
              key="matcher"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full grid grid-cols-1 lg:grid-cols-[350px_1fr] gap-px bg-line"
            >
              {/* Sidebar - Inputs */}
              <aside className="bg-bg p-6 space-y-8 overflow-y-auto">
                <JobDescriptionInput
                  value={jobDescription}
                  onChange={setJobDescription}
                />

                <section>
                  <h3 className="col-header mb-4">Resumes</h3>
                  <ResumeUpload
                    onUpload={handleUpload}
                    files={resumes.map(r => ({ id: r.id, name: r.name, isAnalyzing: r.isAnalyzing }))}
                    onRemove={handleRemove}
                  />
                </section>
              </aside>

              {/* Main Content - Results */}
              <div className="bg-bg p-8 overflow-y-auto">
                <AnimatePresence mode="wait">
                  {selectedResume ? (
                    <motion.div
                      key={selectedResume.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="max-w-4xl mx-auto"
                    >
                      {selectedResume.isAnalyzing ? (
                        <div className="h-96 flex flex-col items-center justify-center space-y-4 opacity-50">
                          <div className="w-12 h-12 border-2 border-ink border-t-transparent rounded-full animate-spin" />
                          <p className="font-mono text-xs uppercase tracking-[0.2em]">Analyzing Candidate Profile...</p>
                        </div>
                      ) : selectedResume.analysis ? (
                        <AnalysisResult
                          analysis={selectedResume.analysis}
                          candidateName={selectedResume.name.replace('.txt', '')}
                        />
                      ) : (
                        <div className="h-96 flex flex-col items-center justify-center space-y-4 opacity-50">
                          <AlertCircle className="w-12 h-12" />
                          <p className="font-mono text-xs uppercase tracking-[0.2em]">Analysis failed for this file</p>
                        </div>
                      )}
                    </motion.div>
                  ) : (
                    <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-30">
                      <FileSearch className="w-16 h-16" />
                      <div>
                        <h2 className="text-xl font-serif italic">No Analysis Selected</h2>
                        <p className="text-xs font-mono uppercase tracking-widest mt-2">Upload a resume and provide a JD to begin</p>
                      </div>
                    </div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : currentView === 'jobs' ? (
            <motion.div
              key="jobs"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full p-8 max-w-6xl mx-auto overflow-y-auto"
            >
              <JobsView 
                jobs={jobs} 
                onSave={handleSaveJob} 
                onDelete={handleDeleteJob} 
              />
            </motion.div>
          ) : currentView === 'candidates' ? (
            <motion.div
              key="candidates"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full p-8 max-w-6xl mx-auto overflow-y-auto"
            >
              <CandidatesView 
                resumes={resumes} 
                jobs={jobs} 
                onUpdateResume={handleUpdateResumeAnalysis} 
                onStartAnalysis={handleStartAnalysis}
                onSelectCandidate={(id) => {
                  setSelectedProfileId(id);
                  setCurrentView('profile');
                }}
              />
            </motion.div>
          ) : currentView === 'profile' ? (
            <motion.div
              key="profile"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full p-8 max-w-6xl mx-auto overflow-y-auto"
            >
              {resumes.find(r => r.id === selectedProfileId) ? (
                <CandidateProfileView 
                  candidate={resumes.find(r => r.id === selectedProfileId)!} 
                  onBack={() => setCurrentView('candidates')}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-30">
                  <p className="font-mono text-xs uppercase tracking-widest">Candidate not found</p>
                  <button onClick={() => setCurrentView('candidates')} className="underline mt-4">Back to Candidates</button>
                </div>
              )}
            </motion.div>
          ) : currentView === 'settings' ? (
            <motion.div
              key="settings"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="h-full p-8 max-w-6xl mx-auto overflow-y-auto"
            >
              <SettingsView onClearData={handleClearData} />
            </motion.div>
          ) : (
            <div className="h-full flex items-center justify-center opacity-30">
              <p className="font-mono text-xs uppercase tracking-widest">View not found</p>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 text-[11px] font-mono uppercase tracking-widest transition-colors",
        active ? "text-ink" : "text-ink/40 hover:text-ink"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
