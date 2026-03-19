import React from 'react';
import { Users, Briefcase, FileCheck, TrendingUp, Award, Clock, MapPin } from 'lucide-react';
import { ResumeFile, JobRole } from '../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { motion } from 'motion/react';

interface DashboardViewProps {
  resumes: ResumeFile[];
  jobs: JobRole[];
  onSelectCandidate: (id: string) => void;
  onSelectJob: (id: string) => void;
}

export function DashboardView({ resumes, jobs, onSelectCandidate, onSelectJob }: DashboardViewProps) {
  const totalResumes = resumes.length;
  const totalJobs = jobs.length;
  const analyzedResumes = resumes.filter(r => r.analysis).length;
  
  const topCandidates = [...resumes]
    .filter(r => r.analysis)
    .sort((a, b) => (b.analysis?.matchScore || 0) - (a.analysis?.matchScore || 0))
    .slice(0, 5);

  const recentJobs = [...jobs]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  // Data for charts
  const scoreDistribution = [
    { range: '90-100', count: resumes.filter(r => (r.analysis?.matchScore || 0) >= 90).length },
    { range: '80-89', count: resumes.filter(r => (r.analysis?.matchScore || 0) >= 80 && (r.analysis?.matchScore || 0) < 90).length },
    { range: '70-79', count: resumes.filter(r => (r.analysis?.matchScore || 0) >= 70 && (r.analysis?.matchScore || 0) < 80).length },
    { range: '60-69', count: resumes.filter(r => (r.analysis?.matchScore || 0) >= 60 && (r.analysis?.matchScore || 0) < 70).length },
    { range: '<60', count: resumes.filter(r => r.analysis && (r.analysis?.matchScore || 0) < 60).length },
  ];

  const recommendationData = [
    { name: 'Strong', value: resumes.filter(r => r.analysis?.recommendation === 'Strong Match').length, color: '#059669' },
    { name: 'Potential', value: resumes.filter(r => r.analysis?.recommendation === 'Potential Match').length, color: '#d97706' },
    { name: 'Weak', value: resumes.filter(r => r.analysis?.recommendation === 'Weak Match').length, color: '#dc2626' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-8 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif italic">HR Overview</h2>
          <p className="text-[11px] font-mono uppercase tracking-widest opacity-50 mt-1">Recruitment performance & candidate analytics</p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest opacity-50">
          <Clock className="w-3 h-3" />
          Last updated: {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          icon={<Users className="w-5 h-5" />} 
          label="Total Resumes" 
          value={totalResumes} 
          subtext={`${analyzedResumes} Analyzed`}
        />
        <StatCard 
          icon={<Briefcase className="w-5 h-5" />} 
          label="Active Job Roles" 
          value={totalJobs} 
          subtext="Across all departments"
        />
        <StatCard 
          icon={<FileCheck className="w-5 h-5" />} 
          label="Avg. Match Score" 
          value={analyzedResumes > 0 ? Math.round(resumes.reduce((acc, r) => acc + (r.analysis?.matchScore || 0), 0) / analyzedResumes) + '%' : '0%'} 
          subtext="Based on analyzed candidates"
        />
        <StatCard 
          icon={<TrendingUp className="w-5 h-5" />} 
          label="Top Matches" 
          value={resumes.filter(r => (r.analysis?.matchScore || 0) >= 80).length} 
          subtext="Candidates with 80%+ score"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Match Score Distribution */}
        <div className="bg-white border border-line p-6 space-y-6">
          <h3 className="text-xs font-mono uppercase tracking-widest border-b border-line pb-4">Match Score Distribution</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis 
                  dataKey="range" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontFamily: 'monospace' }} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 10, fontFamily: 'monospace' }} 
                />
                <Tooltip 
                  cursor={{ fill: '#f5f5f5' }}
                  contentStyle={{ border: '1px solid #141414', borderRadius: '0', fontFamily: 'monospace', fontSize: '10px' }}
                />
                <Bar dataKey="count" fill="#141414" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recommendation Breakdown */}
        <div className="bg-white border border-line p-6 space-y-6">
          <h3 className="text-xs font-mono uppercase tracking-widest border-b border-line pb-4">Recommendation Breakdown</h3>
          <div className="h-[300px] w-full flex items-center justify-center">
            {recommendationData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={recommendationData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {recommendationData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ border: '1px solid #141414', borderRadius: '0', fontFamily: 'monospace', fontSize: '10px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-center opacity-30">
                <p className="text-[10px] font-mono uppercase tracking-widest">No analysis data available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8">
        {/* Top Candidates Ranking */}
        <div className="bg-white border border-line p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <h3 className="text-xs font-mono uppercase tracking-widest">Top Candidate Ranking</h3>
            <button 
              onClick={() => onSelectCandidate('')}
              className="text-[10px] font-mono uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {topCandidates.map((candidate, index) => (
              <motion.div 
                key={candidate.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onSelectCandidate(candidate.id)}
                className="flex items-center justify-between p-4 bg-bg border border-line/10 hover:border-ink transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-ink text-bg flex items-center justify-center font-serif italic text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="text-sm font-serif italic">{candidate.name.replace('.txt', '').replace('.pdf', '')}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <MapPin className="w-3 h-3 opacity-30" />
                      <span className="text-[9px] font-mono uppercase tracking-widest opacity-50">{candidate.analysis?.location || 'Remote'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-lg font-serif italic leading-none">{candidate.analysis?.matchScore}%</div>
                    <div className="text-[8px] font-mono uppercase tracking-widest opacity-40 mt-1">Match</div>
                  </div>
                  <Award className={`w-5 h-5 ${index === 0 ? 'text-amber-500' : 'opacity-10'}`} />
                </div>
              </motion.div>
            ))}
            {topCandidates.length === 0 && (
              <div className="h-32 flex flex-col items-center justify-center opacity-30">
                <p className="text-[10px] font-mono uppercase tracking-widest">No candidates analyzed yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Job Roles */}
        <div className="bg-white border border-line p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-line pb-4">
            <h3 className="text-xs font-mono uppercase tracking-widest">Recent Job Roles</h3>
            <button 
              onClick={() => onSelectJob('')}
              className="text-[10px] font-mono uppercase tracking-widest opacity-50 hover:opacity-100 transition-opacity"
            >
              View All
            </button>
          </div>
          <div className="space-y-4">
            {recentJobs.map((job) => (
              <div 
                key={job.id}
                onClick={() => onSelectJob(job.id)}
                className="p-4 border border-line hover:border-ink transition-all cursor-pointer group"
              >
                <h4 className="text-sm font-serif italic">{job.title}</h4>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[9px] font-mono uppercase tracking-widest px-1.5 py-0.5 bg-bg border border-line/20">
                    {job.experienceLevel}
                  </span>
                  <span className="text-[9px] font-mono uppercase tracking-widest opacity-40">
                    {new Date(job.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
            {recentJobs.length === 0 && (
              <div className="h-32 flex flex-col items-center justify-center opacity-30">
                <p className="text-[10px] font-mono uppercase tracking-widest">No job roles created yet</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value, subtext }: { icon: React.ReactNode, label: string, value: string | number, subtext: string }) {
  return (
    <div className="bg-white border border-line p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="p-2 bg-bg border border-line/10 text-ink/40">
          {icon}
        </div>
      </div>
      <div>
        <div className="text-3xl font-serif italic leading-none">{value}</div>
        <div className="text-[10px] font-mono uppercase tracking-widest opacity-50 mt-2">{label}</div>
      </div>
      <div className="pt-4 border-t border-line/10">
        <p className="text-[9px] font-mono uppercase tracking-widest opacity-40">{subtext}</p>
      </div>
    </div>
  );
}
