import React from 'react';
import { ResumeAnalysis } from '../types';
import ReactMarkdown from 'react-markdown';
import { CheckCircle2, AlertCircle, TrendingUp, Award } from 'lucide-react';

interface AnalysisResultProps {
  analysis: ResumeAnalysis;
  candidateName: string;
}

function MetricBar({ label, score }: { label: string; score: number }) {
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest opacity-50">
        <span>{label}</span>
        <span>{score}%</span>
      </div>
      <div className="h-1 bg-line/10 w-full overflow-hidden">
        <div 
          className="h-full bg-ink transition-all duration-1000 ease-out" 
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );
}

export function AnalysisResult({ analysis, candidateName }: AnalysisResultProps) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-600';
    if (score >= 50) return 'text-amber-600';
    return 'text-rose-600';
  };

  return (
    <div className="bg-white border border-line p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex justify-between items-start border-b border-line pb-6">
        <div>
          <h2 className="text-2xl font-serif italic">{candidateName}</h2>
          <p className="text-xs font-mono uppercase tracking-widest opacity-50 mt-1">Analysis Report</p>
        </div>
        <div className="text-right">
          <div className={cn("text-4xl font-mono font-bold", getScoreColor(analysis.matchScore))}>
            {analysis.matchScore}%
          </div>
          <p className="text-[10px] font-mono uppercase tracking-widest opacity-50">Overall Match Score</p>
        </div>
      </div>

      {/* Matching Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4 border-b border-line/10">
        <MetricBar label="Keyword Match" score={analysis.keywordScore || 0} />
        <MetricBar label="Skill Similarity" score={analysis.skillSimilarity || 0} />
        <MetricBar label="Semantic Score" score={analysis.semanticScore || 0} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <section>
            <h3 className="col-header mb-3 flex items-center gap-2">
              <TrendingUp className="w-3 h-3" /> Summary
            </h3>
            <p className="text-sm leading-relaxed">{analysis.summary}</p>
          </section>

          <section>
            <h3 className="col-header mb-3 flex items-center gap-2">
              <Award className="w-3 h-3" /> Experience Match
            </h3>
            <p className="text-sm leading-relaxed">{analysis.experienceMatch}</p>
          </section>
        </div>

        <div className="space-y-6">
          <section>
            <h3 className="col-header mb-3 flex items-center gap-2 text-emerald-700">
              <CheckCircle2 className="w-3 h-3" /> Matching Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {analysis.matchingSkills.map((skill, i) => (
                <span key={i} className="px-2 py-1 bg-emerald-50 text-emerald-700 text-[10px] font-mono border border-emerald-200">
                  {skill}
                </span>
              ))}
            </div>
          </section>

          <section>
            <h3 className="col-header mb-3 flex items-center gap-2 text-rose-700">
              <AlertCircle className="w-3 h-3" /> Missing Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {analysis.missingSkills.map((skill, i) => (
                <span key={i} className="px-2 py-1 bg-rose-50 text-rose-700 text-[10px] font-mono border border-rose-200">
                  {skill}
                </span>
              ))}
            </div>
          </section>
        </div>
      </div>

      <div className="pt-6 border-t border-line flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-widest opacity-50">Recommendation:</span>
          <span className={cn(
            "px-3 py-1 text-[10px] font-mono uppercase tracking-widest border",
            analysis.recommendation === 'Strong Match' ? "bg-emerald-600 text-white border-emerald-600" :
            analysis.recommendation === 'Potential Match' ? "bg-amber-500 text-white border-amber-500" :
            "bg-rose-600 text-white border-rose-600"
          )}>
            {analysis.recommendation}
          </span>
        </div>
      </div>
    </div>
  );
}

function cn(...inputs: any[]) {
  return inputs.filter(Boolean).join(' ');
}
