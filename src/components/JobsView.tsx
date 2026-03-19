import React from 'react';
import { Briefcase, MapPin, Clock, Plus, Upload, Trash2, Loader2, CheckCircle2 } from 'lucide-react';
import { JobRole } from '../types';
import { extractJobDetails } from '../services/gemini';
import { motion, AnimatePresence } from 'motion/react';

interface JobsViewProps {
  jobs: JobRole[];
  onSave: (job: JobRole) => void;
  onDelete: (id: string) => void;
}

export function JobsView({ jobs, onSave, onDelete }: JobsViewProps) {
  const [isAdding, setIsAdding] = React.useState(false);
  const [jdText, setJdText] = React.useState('');
  const [isExtracting, setIsExtracting] = React.useState(false);
  const [extractedJob, setExtractedJob] = React.useState<Partial<JobRole> | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setJdText(event.target?.result as string);
    };
    reader.readAsText(file);
  };

  const handleExtract = async () => {
    if (!jdText.trim()) return;
    setIsExtracting(true);
    try {
      const details = await extractJobDetails(jdText);
      setExtractedJob(details);
    } catch (error) {
      console.error(error);
      alert("Failed to extract job details.");
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSave = () => {
    if (!extractedJob || !extractedJob.title) return;
    const newJob: JobRole = {
      id: Math.random().toString(36).substr(2, 9),
      title: extractedJob.title || 'Untitled Role',
      description: jdText,
      requiredSkills: extractedJob.requiredSkills || [],
      experienceLevel: extractedJob.experienceLevel || 'Not specified',
      location: extractedJob.location || 'Remote',
      qualifications: extractedJob.qualifications || [],
      createdAt: new Date().toISOString(),
    };
    onSave(newJob);
    setIsAdding(false);
    setJdText('');
    setExtractedJob(null);
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-serif italic">Job Roles</h2>
          <p className="text-[11px] font-mono uppercase tracking-widest opacity-50 mt-1">Manage and extract job requirements</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 bg-ink text-bg px-4 py-2 text-[11px] font-mono uppercase tracking-widest hover:bg-ink/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add New Role
        </button>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white border border-line p-6 space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-mono uppercase tracking-widest">Job Description Input</h3>
                  <label className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest cursor-pointer hover:text-ink transition-colors">
                    <Upload className="w-3 h-3" />
                    Upload JD
                    <input type="file" className="hidden" onChange={handleFileUpload} accept=".txt,.md" />
                  </label>
                </div>
                <textarea
                  value={jdText}
                  onChange={(e) => setJdText(e.target.value)}
                  placeholder="Paste the job description here or upload a file..."
                  className="w-full h-48 p-4 bg-bg border border-line/20 text-sm focus:outline-none focus:border-ink transition-colors resize-none font-sans leading-relaxed"
                />
                <button
                  onClick={handleExtract}
                  disabled={isExtracting || !jdText.trim()}
                  className="w-full flex items-center justify-center gap-2 border border-ink py-3 text-[11px] font-mono uppercase tracking-widest hover:bg-ink hover:text-bg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isExtracting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Extracting Details...
                    </>
                  ) : (
                    <>
                      <Briefcase className="w-4 h-4" />
                      Extract Details with AI
                    </>
                  )}
                </button>
              </div>

              {extractedJob && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="pt-6 border-t border-line space-y-6"
                >
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase tracking-widest opacity-50">Job Title</label>
                      <input
                        type="text"
                        value={extractedJob.title || ''}
                        onChange={(e) => setExtractedJob({ ...extractedJob, title: e.target.value })}
                        className="w-full bg-transparent border-b border-line/20 py-1 text-sm focus:outline-none focus:border-ink"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase tracking-widest opacity-50">Location</label>
                      <input
                        type="text"
                        value={extractedJob.location || ''}
                        onChange={(e) => setExtractedJob({ ...extractedJob, location: e.target.value })}
                        className="w-full bg-transparent border-b border-line/20 py-1 text-sm focus:outline-none focus:border-ink"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-mono uppercase tracking-widest opacity-50">Experience Level</label>
                      <input
                        type="text"
                        value={extractedJob.experienceLevel || ''}
                        onChange={(e) => setExtractedJob({ ...extractedJob, experienceLevel: e.target.value })}
                        className="w-full bg-transparent border-b border-line/20 py-1 text-sm focus:outline-none focus:border-ink"
                      />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono uppercase tracking-widest opacity-50">Required Skills</label>
                      <div className="flex flex-wrap gap-2">
                        {extractedJob.requiredSkills?.map((skill, i) => (
                          <span key={i} className="px-2 py-1 bg-ink/5 text-[10px] font-mono uppercase tracking-wider border border-ink/10">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-mono uppercase tracking-widest opacity-50">Qualifications</label>
                      <div className="flex flex-wrap gap-2">
                        {extractedJob.qualifications?.map((q, i) => (
                          <span key={i} className="px-2 py-1 bg-ink/5 text-[10px] font-mono uppercase tracking-wider border border-ink/10">
                            {q}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <button
                      onClick={handleSave}
                      className="flex-1 flex items-center justify-center gap-2 bg-ink text-bg py-3 text-[11px] font-mono uppercase tracking-widest hover:bg-ink/90 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Save Job Role
                    </button>
                    <button
                      onClick={() => setIsAdding(false)}
                      className="px-6 border border-line py-3 text-[11px] font-mono uppercase tracking-widest hover:bg-ink/5 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {jobs.map((job) => (
          <div key={job.id} className="bg-white border border-line p-6 space-y-4 group hover:border-ink transition-colors relative">
            <button
              onClick={() => onDelete(job.id)}
              className="absolute top-4 right-4 p-2 text-ink/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <div className="space-y-1">
              <h3 className="text-lg font-serif italic">{job.title}</h3>
              <div className="flex items-center gap-4 text-[10px] font-mono uppercase tracking-widest opacity-50">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {job.experienceLevel}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-mono uppercase tracking-widest opacity-50">Required Skills</p>
              <div className="flex flex-wrap gap-2">
                {job.requiredSkills.slice(0, 4).map((skill, i) => (
                  <span key={i} className="px-2 py-0.5 bg-ink/5 text-[9px] font-mono uppercase tracking-wider border border-ink/10">
                    {skill}
                  </span>
                ))}
                {job.requiredSkills.length > 4 && (
                  <span className="px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider opacity-50">
                    +{job.requiredSkills.length - 4} more
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}

        {jobs.length === 0 && !isAdding && (
          <div className="col-span-full h-64 flex flex-col items-center justify-center border border-dashed border-line/50 opacity-30">
            <Briefcase className="w-8 h-8 mb-2" />
            <p className="text-xs font-mono uppercase tracking-widest">No job roles saved yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
