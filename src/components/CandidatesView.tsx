import React from 'react';
import { Users, Search, Filter, ArrowUpDown, ChevronRight, Brain, Target, Sparkles, Loader2, CheckCircle2, AlertCircle, Trash2 } from 'lucide-react';
import { ResumeFile, JobRole } from '../types';
import { analyzeResume } from '../services/gemini';
import { motion, AnimatePresence } from 'motion/react';

interface CandidatesViewProps {
  resumes: ResumeFile[];
  jobs: JobRole[];
  onUpdateResume: (id: string, analysis: any) => void;
  onStartAnalysis: (id: string) => void;
  onSelectCandidate: (id: string) => void;
}

export function CandidatesView({ resumes, jobs, onUpdateResume, onStartAnalysis, onSelectCandidate }: CandidatesViewProps) {
  const [selectedJobId, setSelectedJobId] = React.useState<string>(jobs[0]?.id || '');
  const [isAnalyzingAll, setIsAnalyzingAll] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<'list' | 'table'>('table');
  const [showFilters, setShowFilters] = React.useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = React.useState('');
  const [filterSkills, setFilterSkills] = React.useState('');
  const [filterMinScore, setFilterMinScore] = React.useState<number>(0);
  const [filterMinExp, setFilterMinExp] = React.useState<number>(0);
  const [filterEducation, setFilterEducation] = React.useState('');
  const [filterLocation, setFilterLocation] = React.useState('');

  const selectedJob = jobs.find(j => j.id === selectedJobId);

  const handleMatchAll = async () => {
    if (!selectedJob) return;
    setIsAnalyzingAll(true);
    
    const resumesToAnalyze = resumes.filter(r => !r.analysis);
    
    for (const resume of resumesToAnalyze) {
      try {
        onStartAnalysis(resume.id);
        const analysis = await analyzeResume(resume.content, selectedJob.description);
        onUpdateResume(resume.id, analysis);
      } catch (error) {
        console.error(`Failed to analyze ${resume.name}:`, error);
      }
    }
    
    setIsAnalyzingAll(false);
  };

  const filteredResumes = resumes
    .filter(r => {
      const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSkills = !filterSkills || r.analysis?.matchingSkills.some(s => s.toLowerCase().includes(filterSkills.toLowerCase()));
      const matchesScore = (r.analysis?.matchScore || 0) >= filterMinScore;
      const matchesExp = (r.analysis?.yearsOfExperience || 0) >= filterMinExp;
      const matchesEdu = !filterEducation || r.analysis?.educationRelevance.toLowerCase().includes(filterEducation.toLowerCase());
      const matchesLoc = !filterLocation || (r.analysis?.location || '').toLowerCase().includes(filterLocation.toLowerCase());

      return matchesSearch && matchesSkills && matchesScore && matchesExp && matchesEdu && matchesLoc;
    })
    .sort((a, b) => (b.analysis?.matchScore || 0) - (a.analysis?.matchScore || 0));

  const clearFilters = () => {
    setSearchQuery('');
    setFilterSkills('');
    setFilterMinScore(0);
    setFilterMinExp(0);
    setFilterEducation('');
    setFilterLocation('');
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-serif italic">Resume Search & Filters</h2>
          <p className="text-[11px] font-mono uppercase tracking-widest opacity-50 mt-1">Advanced candidate discovery</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex bg-white border border-line p-1">
            <button 
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-[10px] font-mono uppercase tracking-widest transition-colors ${viewMode === 'list' ? 'bg-ink text-bg' : 'hover:bg-ink/5'}`}
            >
              List
            </button>
            <button 
              onClick={() => setViewMode('table')}
              className={`px-3 py-1 text-[10px] font-mono uppercase tracking-widest transition-colors ${viewMode === 'table' ? 'bg-ink text-bg' : 'hover:bg-ink/5'}`}
            >
              Table
            </button>
          </div>

          <div className="relative">
            <select
              value={selectedJobId}
              onChange={(e) => setSelectedJobId(e.target.value)}
              className="appearance-none bg-white border border-line px-10 py-2 text-[11px] font-mono uppercase tracking-widest focus:outline-none focus:border-ink transition-colors min-w-[200px]"
            >
              <option value="">Select Job Role</option>
              {jobs.map(job => (
                <option key={job.id} value={job.id}>{job.title}</option>
              ))}
            </select>
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
          </div>

          <button
            onClick={handleMatchAll}
            disabled={isAnalyzingAll || !selectedJobId || resumes.length === 0}
            className="flex items-center justify-center gap-2 bg-ink text-bg px-6 py-2 text-[11px] font-mono uppercase tracking-widest hover:bg-ink/90 transition-all disabled:opacity-50"
          >
            {isAnalyzingAll ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Ranking...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4" />
                Rank All Candidates
              </>
            )}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-8">
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <div className="flex items-center gap-4">
              <span className="text-[10px] font-mono uppercase tracking-widest opacity-50">{filteredResumes.length} Candidates</span>
              <div className="h-4 w-px bg-line" />
              <div className="flex items-center gap-2">
                <Search className="w-3 h-3 opacity-30" />
                <input 
                  type="text" 
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-transparent text-[10px] font-mono uppercase tracking-widest focus:outline-none w-48"
                />
              </div>
            </div>
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest transition-colors ${showFilters ? 'text-ink' : 'opacity-50 hover:opacity-100'}`}
            >
              <Filter className="w-3 h-3" />
              {showFilters ? 'Hide Filters' : 'Advanced Filters'}
            </button>
          </div>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="bg-white border border-line p-6 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6"
              >
                <div className="space-y-2">
                  <label className="text-[9px] font-mono uppercase tracking-widest opacity-50">Skill</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Python"
                    value={filterSkills}
                    onChange={(e) => setFilterSkills(e.target.value)}
                    className="w-full bg-bg border border-line/20 p-2 text-[10px] font-mono focus:outline-none focus:border-ink"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-mono uppercase tracking-widest opacity-50">Min Match Score</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    value={filterMinScore || ''}
                    onChange={(e) => setFilterMinScore(Number(e.target.value))}
                    className="w-full bg-bg border border-line/20 p-2 text-[10px] font-mono focus:outline-none focus:border-ink"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-mono uppercase tracking-widest opacity-50">Min Experience (Years)</label>
                  <input 
                    type="number" 
                    placeholder="0"
                    value={filterMinExp || ''}
                    onChange={(e) => setFilterMinExp(Number(e.target.value))}
                    className="w-full bg-bg border border-line/20 p-2 text-[10px] font-mono focus:outline-none focus:border-ink"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-mono uppercase tracking-widest opacity-50">Education</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Masters"
                    value={filterEducation}
                    onChange={(e) => setFilterEducation(e.target.value)}
                    className="w-full bg-bg border border-line/20 p-2 text-[10px] font-mono focus:outline-none focus:border-ink"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-mono uppercase tracking-widest opacity-50">Location</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="e.g. Remote"
                      value={filterLocation}
                      onChange={(e) => setFilterLocation(e.target.value)}
                      className="flex-1 bg-bg border border-line/20 p-2 text-[10px] font-mono focus:outline-none focus:border-ink"
                    />
                    <button 
                      onClick={clearFilters}
                      className="p-2 border border-line hover:bg-ink hover:text-bg transition-colors"
                      title="Clear All Filters"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="space-y-3">
            {viewMode === 'list' ? (
              filteredResumes.map((resume) => (
                <CandidateRow key={resume.id} resume={resume} onClick={() => onSelectCandidate(resume.id)} />
              ))
            ) : (
              <div className="bg-white border border-line overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-bg border-b border-line">
                      <th className="p-4 text-[10px] font-mono uppercase tracking-widest opacity-50">Rank</th>
                      <th className="p-4 text-[10px] font-mono uppercase tracking-widest opacity-50">Candidate</th>
                      <th className="p-4 text-[10px] font-mono uppercase tracking-widest opacity-50">Match Score</th>
                      <th className="p-4 text-[10px] font-mono uppercase tracking-widest opacity-50">Location</th>
                      <th className="p-4 text-[10px] font-mono uppercase tracking-widest opacity-50">Exp (Yrs)</th>
                      <th className="p-4 text-[10px] font-mono uppercase tracking-widest opacity-50">Skills</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResumes.map((resume, index) => (
                      <tr 
                        key={resume.id} 
                        onClick={() => onSelectCandidate(resume.id)}
                        className="border-b border-line last:border-0 hover:bg-bg transition-colors cursor-pointer"
                      >
                        <td className="p-4 text-sm font-mono">#{index + 1}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-ink text-bg flex items-center justify-center font-serif italic text-sm">
                              {resume.name[0].toUpperCase()}
                            </div>
                            <span className="text-sm font-serif italic">{resume.name.replace('.txt', '').replace('.pdf', '')}</span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col">
                            <span className="text-lg font-serif italic">{resume.analysis?.matchScore || 0}%</span>
                            <div className="w-24 h-1 bg-line mt-1 overflow-hidden">
                              <div 
                                className="h-full bg-ink" 
                                style={{ width: `${resume.analysis?.matchScore || 0}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="text-xs font-mono">{resume.analysis?.location || 'N/A'}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-xs font-mono">{resume.analysis?.yearsOfExperience || 0}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-xs font-mono">{resume.analysis?.detailedScores?.skillSimilarity || 0}%</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            
            {resumes.length === 0 && (
              <div className="h-64 flex flex-col items-center justify-center border border-dashed border-line/50 opacity-30">
                <Users className="w-8 h-8 mb-2" />
                <p className="text-xs font-mono uppercase tracking-widest">No candidates uploaded yet</p>
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <div className="bg-white border border-line p-6 space-y-6">
            <h3 className="text-xs font-mono uppercase tracking-widest border-b border-line pb-4">Matching Methodology</h3>
            
            <div className="space-y-4">
              <MethodItem 
                icon={<Target className="w-4 h-4" />}
                title="Keyword Extraction"
                desc="Parsing specific tools, tech stacks, and core competencies."
              />
              <MethodItem 
                icon={<Sparkles className="w-4 h-4" />}
                title="Skill Similarity"
                desc="Mapping synonyms and conceptual skill relationships."
              />
              <MethodItem 
                icon={<Brain className="w-4 h-4" />}
                title="Semantic Embeddings"
                desc="Vector-based similarity scoring using Gemini embeddings."
              />
            </div>

            <div className="pt-4 border-t border-line">
              <div className="p-4 bg-bg border border-line/20 space-y-2">
                <p className="text-[10px] font-mono uppercase tracking-widest opacity-50">Selected Job Context</p>
                <p className="text-sm font-serif italic">{selectedJob?.title || 'No Job Selected'}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {selectedJob?.requiredSkills.slice(0, 3).map((s, i) => (
                    <span key={i} className="text-[9px] font-mono uppercase px-1.5 py-0.5 bg-ink/5 border border-ink/10">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function CandidateRow({ resume, onClick }: { resume: ResumeFile, onClick: () => void }) {
  const score = resume.analysis?.matchScore || 0;
  
  return (
    <div 
      onClick={onClick}
      className="group bg-white border border-line p-4 flex items-center justify-between hover:border-ink transition-all cursor-pointer"
    >
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-bg border border-line flex items-center justify-center font-serif italic text-lg group-hover:bg-ink group-hover:text-bg transition-colors">
          {resume.name[0].toUpperCase()}
        </div>
        <div>
          <h4 className="text-sm font-serif italic">{resume.name.replace('.txt', '').replace('.pdf', '')}</h4>
          <div className="flex items-center gap-3 mt-1">
            {resume.isAnalyzing ? (
              <span className="flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest text-ink/40">
                <Loader2 className="w-2.5 h-2.5 animate-spin" />
                Analyzing...
              </span>
            ) : resume.analysis ? (
              <span className={`flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest ${
                score >= 80 ? 'text-emerald-600' : score >= 60 ? 'text-amber-600' : 'text-red-600'
              }`}>
                <CheckCircle2 className="w-2.5 h-2.5" />
                {resume.analysis.recommendation}
              </span>
            ) : (
              <span className="flex items-center gap-1 text-[9px] font-mono uppercase tracking-widest opacity-30">
                <AlertCircle className="w-2.5 h-2.5" />
                Not Analyzed
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-8">
        {resume.analysis && (
          <div className="hidden md:flex flex-col items-end">
            <div className="flex gap-2">
              {resume.analysis.detailedScores && (
                <>
                  <ScoreMini label="KW" value={resume.analysis.detailedScores.keywordMatch} />
                  <ScoreMini label="SK" value={resume.analysis.detailedScores.skillSimilarity} />
                  <ScoreMini label="SM" value={resume.analysis.detailedScores.semanticSimilarity} />
                </>
              )}
            </div>
          </div>
        )}
        
        <div className="flex flex-col items-end min-w-[80px]">
          <span className="text-2xl font-serif italic leading-none">{score}%</span>
          <span className="text-[9px] font-mono uppercase tracking-widest opacity-50 mt-1">Match Score</span>
        </div>
        
        <ChevronRight className="w-4 h-4 opacity-20 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
      </div>
    </div>
  );
}

function ScoreMini({ label, value }: { label: string, value: number }) {
  return (
    <div className="flex flex-col items-center">
      <span className="text-[8px] font-mono opacity-40">{label}</span>
      <span className="text-[10px] font-mono">{value}</span>
    </div>
  );
}

function MethodItem({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="flex gap-3">
      <div className="mt-1 text-ink/40">{icon}</div>
      <div>
        <h4 className="text-[11px] font-mono uppercase tracking-widest">{title}</h4>
        <p className="text-[10px] leading-relaxed opacity-50 mt-1">{desc}</p>
      </div>
    </div>
  );
}
