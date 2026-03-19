import React from 'react';
import { ResumeFile } from '../types';
import { AnalysisResult } from './AnalysisResult';
import { ArrowLeft, FileText, MapPin, Calendar, Briefcase, GraduationCap, Download, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

interface CandidateProfileViewProps {
  candidate: ResumeFile;
  onBack: () => void;
}

export function CandidateProfileView({ candidate, onBack }: CandidateProfileViewProps) {
  const [activeTab, setActiveTab] = React.useState<'analysis' | 'resume'>('analysis');

  if (!candidate.analysis) {
    return (
      <div className="h-full flex flex-col items-center justify-center space-y-4 opacity-50">
        <FileText className="w-12 h-12" />
        <p className="font-mono text-xs uppercase tracking-widest">No analysis available for this candidate</p>
        <button onClick={onBack} className="text-[10px] font-mono uppercase tracking-widest underline">Go Back</button>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-line pb-8">
        <div className="space-y-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to Candidates
          </button>
          
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-ink text-bg flex items-center justify-center font-serif italic text-4xl">
              {candidate.name[0].toUpperCase()}
            </div>
            <div>
              <h2 className="text-4xl font-serif italic">{candidate.name.replace('.txt', '').replace('.pdf', '')}</h2>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest opacity-50">
                  <MapPin className="w-3 h-3" />
                  {candidate.analysis.location || 'Not Specified'}
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest opacity-50">
                  <Calendar className="w-3 h-3" />
                  {candidate.analysis.yearsOfExperience || 0} Years Exp
                </div>
                <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-widest opacity-50">
                  <Briefcase className="w-3 h-3" />
                  {candidate.analysis.recommendation}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 border border-line text-[10px] font-mono uppercase tracking-widest hover:bg-ink hover:text-bg transition-all">
            <Download className="w-3 h-3" />
            Download CV
          </button>
          <button className="flex items-center gap-2 px-6 py-2 bg-ink text-bg text-[10px] font-mono uppercase tracking-widest hover:bg-ink/90 transition-all">
            Contact Candidate
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-line">
        <button 
          onClick={() => setActiveTab('analysis')}
          className={`px-8 py-4 text-[11px] font-mono uppercase tracking-widest transition-all relative ${
            activeTab === 'analysis' ? 'text-ink' : 'text-ink/40 hover:text-ink'
          }`}
        >
          AI Analysis
          {activeTab === 'analysis' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-ink" />}
        </button>
        <button 
          onClick={() => setActiveTab('resume')}
          className={`px-8 py-4 text-[11px] font-mono uppercase tracking-widest transition-all relative ${
            activeTab === 'resume' ? 'text-ink' : 'text-ink/40 hover:text-ink'
          }`}
        >
          Resume Preview
          {activeTab === 'resume' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-ink" />}
        </button>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_350px] gap-12">
        <div className="min-h-[500px]">
          {activeTab === 'analysis' ? (
            <AnalysisResult 
              analysis={candidate.analysis} 
              candidateName={candidate.name.replace('.txt', '')} 
            />
          ) : (
            <div className="bg-white border border-line p-8 font-mono text-xs leading-relaxed whitespace-pre-wrap overflow-y-auto max-h-[800px] shadow-inner">
              <div className="flex items-center justify-between mb-8 border-b border-line pb-4 opacity-50">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  <span>{candidate.name}</span>
                </div>
                <span>{candidate.content.length} characters</span>
              </div>
              {candidate.content}
            </div>
          )}
        </div>

        <aside className="space-y-8">
          <div className="bg-white border border-line p-6 space-y-6">
            <h3 className="text-xs font-mono uppercase tracking-widest border-b border-line pb-4">Quick Stats</h3>
            
            <div className="space-y-6">
              <StatItem 
                label="Match Score" 
                value={`${candidate.analysis.matchScore}%`} 
                color={candidate.analysis.matchScore >= 80 ? 'text-emerald-600' : 'text-amber-600'}
              />
              <StatItem 
                label="Skill Match" 
                value={`${candidate.analysis.detailedScores?.skillSimilarity || 0}%`} 
              />
              <StatItem 
                label="Experience Score" 
                value={`${candidate.analysis.detailedScores?.experienceScore || 0}%`} 
              />
              <StatItem 
                label="Education Score" 
                value={`${candidate.analysis.detailedScores?.educationScore || 0}%`} 
              />
            </div>
          </div>

          <div className="bg-white border border-line p-6 space-y-6">
            <h3 className="text-xs font-mono uppercase tracking-widest border-b border-line pb-4">Key Qualifications</h3>
            <div className="space-y-4">
              <div className="flex gap-3">
                <GraduationCap className="w-4 h-4 opacity-30 mt-1" />
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest opacity-50">Education Relevance</p>
                  <p className="text-xs mt-1 leading-relaxed">{candidate.analysis.educationRelevance}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Briefcase className="w-4 h-4 opacity-30 mt-1" />
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-widest opacity-50">Experience Context</p>
                  <p className="text-xs mt-1 leading-relaxed">{candidate.analysis.experienceMatch}</p>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function StatItem({ label, value, color = 'text-ink' }: { label: string, value: string, color?: string }) {
  return (
    <div>
      <p className="text-[9px] font-mono uppercase tracking-widest opacity-50">{label}</p>
      <p className={`text-2xl font-serif italic mt-1 ${color}`}>{value}</p>
    </div>
  );
}
