import React from 'react';
import { Search, Filter, CheckCircle2, XCircle, Clock, MoreVertical, Trash2, Mail, GraduationCap, Briefcase } from 'lucide-react';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

interface Candidate {
  id: string;
  name: string;
  email: string;
  skills: string[];
  education: string;
  experience: string;
  years_of_experience: number;
  resume_name: string;
  match_score: number;
  status: string;
  analysis: any;
  created_at: string;
}

interface CandidateListProps {
  candidates: Candidate[];
  onSelect: (id: string) => void;
  onStatusUpdate: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}

export function CandidateList({ candidates, onSelect, onStatusUpdate, onDelete }: CandidateListProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [filterStatus, setFilterStatus] = React.useState('All');
  const [minScore, setMinScore] = React.useState(0);

  const filteredCandidates = candidates.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         c.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = filterStatus === 'All' || c.status === filterStatus;
    const matchesScore = c.match_score >= minScore;
    return matchesSearch && matchesStatus && matchesScore;
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 p-8">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h2 className="text-4xl font-serif italic">Candidate Ranking</h2>
          <p className="text-[10px] font-mono uppercase tracking-widest opacity-50 mt-2">Ranked by AI Match Score</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
            <input 
              type="text" 
              placeholder="Search skills or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-line text-xs focus:outline-none focus:border-ink transition-colors w-64"
            />
          </div>
          
          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 bg-white border border-line text-[10px] font-mono uppercase tracking-widest focus:outline-none focus:border-ink transition-colors"
          >
            <option value="All">All Status</option>
            <option value="Pending">Pending</option>
            <option value="Shortlisted">Shortlisted</option>
            <option value="Interview">Interview</option>
            <option value="Rejected">Rejected</option>
          </select>

          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-line">
            <span className="text-[10px] font-mono uppercase tracking-widest opacity-50">Min Score:</span>
            <input 
              type="number" 
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-12 text-xs font-mono focus:outline-none"
              min="0" max="100"
            />
          </div>
        </div>
      </header>

      <div className="bg-white border border-line overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-bg border-b border-line">
              <th className="p-4 text-[10px] font-mono uppercase tracking-widest opacity-50 font-medium">Rank</th>
              <th className="p-4 text-[10px] font-mono uppercase tracking-widest opacity-50 font-medium">Candidate</th>
              <th className="p-4 text-[10px] font-mono uppercase tracking-widest opacity-50 font-medium">Match Score</th>
              <th className="p-4 text-[10px] font-mono uppercase tracking-widest opacity-50 font-medium">Status</th>
              <th className="p-4 text-[10px] font-mono uppercase tracking-widest opacity-50 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            <AnimatePresence mode="popLayout">
              {filteredCandidates.map((c, i) => (
                <motion.tr 
                  layout
                  key={c.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="group hover:bg-bg transition-colors cursor-pointer"
                  onClick={() => onSelect(c.id)}
                >
                  <td className="p-4 text-sm font-mono opacity-50">#{i + 1}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-ink text-bg flex items-center justify-center font-serif italic text-lg">
                        {c.name[0]}
                      </div>
                      <div>
                        <p className="text-sm font-medium">{c.name}</p>
                        <p className="text-[10px] font-mono uppercase tracking-widest opacity-50">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-1.5 bg-line/10 w-24 overflow-hidden">
                        <div 
                          className="h-full bg-ink" 
                          style={{ width: `${c.match_score}%` }}
                        />
                      </div>
                      <span className="text-sm font-mono font-bold">{c.match_score}%</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
                      <button 
                        onClick={() => onStatusUpdate(c.id, 'Shortlisted')}
                        className="p-2 hover:bg-emerald-50 text-emerald-600 rounded transition-colors"
                        title="Shortlist"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onStatusUpdate(c.id, 'Interview')}
                        className="p-2 hover:bg-amber-50 text-amber-600 rounded transition-colors"
                        title="Mark for Interview"
                      >
                        <Mail className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onStatusUpdate(c.id, 'Rejected')}
                        className="p-2 hover:bg-rose-50 text-rose-600 rounded transition-colors"
                        title="Reject"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => onDelete(c.id)}
                        className="p-2 hover:bg-line/10 text-ink rounded transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        {filteredCandidates.length === 0 && (
          <div className="p-12 text-center opacity-30 font-mono text-xs">
            No candidates match your filters
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    'Pending': 'bg-bg text-ink border-line',
    'Shortlisted': 'bg-emerald-50 text-emerald-700 border-emerald-200',
    'Interview': 'bg-amber-50 text-amber-700 border-amber-200',
    'Rejected': 'bg-rose-50 text-rose-700 border-rose-200',
  }[status] || 'bg-bg text-ink border-line';

  return (
    <span className={cn(
      "px-2 py-1 text-[9px] font-mono uppercase tracking-widest border",
      styles
    )}>
      {status}
    </span>
  );
}
