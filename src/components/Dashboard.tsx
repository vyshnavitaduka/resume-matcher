import React from 'react';
import { Users, Briefcase, CheckCircle2, XCircle, Clock, TrendingUp } from 'lucide-react';
import { motion } from 'motion/react';

interface DashboardStats {
  totalResumes: number;
  totalJobs: number;
  topCandidates: { name: string; match_score: number; resume_name: string }[];
  statusCounts: { status: string; count: number }[];
}

export function Dashboard() {
  const [stats, setStats] = React.useState<DashboardStats | null>(null);

  React.useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(setStats);
  }, []);

  if (!stats) return <div className="p-8 font-mono text-xs animate-pulse">Loading Analytics...</div>;

  return (
    <div className="max-w-6xl mx-auto space-y-12 p-8">
      <header>
        <h2 className="text-4xl font-serif italic">HR Analytics</h2>
        <p className="text-[10px] font-mono uppercase tracking-widest opacity-50 mt-2">Hiring Pipeline & Performance</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-line border border-line">
        <StatCard 
          icon={<Users className="w-5 h-5" />} 
          label="Total Resumes" 
          value={stats.totalResumes} 
        />
        <StatCard 
          icon={<Briefcase className="w-5 h-5" />} 
          label="Active Jobs" 
          value={stats.totalJobs} 
        />
        <StatCard 
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />} 
          label="Shortlisted" 
          value={stats.statusCounts.find(s => s.status === 'Shortlisted')?.count || 0} 
        />
        <StatCard 
          icon={<Clock className="w-5 h-5 text-amber-600" />} 
          label="Pending Review" 
          value={stats.statusCounts.find(s => s.status === 'Pending')?.count || 0} 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Top Candidates */}
        <section className="space-y-6">
          <h3 className="col-header flex items-center gap-2">
            <TrendingUp className="w-4 h-4" /> Top Ranked Candidates
          </h3>
          <div className="border border-line divide-y divide-line">
            {stats.topCandidates.map((c, i) => (
              <div key={i} className="p-4 bg-white flex items-center justify-between hover:bg-bg transition-colors">
                <div>
                  <p className="text-sm font-medium">{c.name}</p>
                  <p className="text-[10px] font-mono uppercase tracking-widest opacity-50">{c.resume_name}</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-mono font-bold">{c.match_score}%</p>
                  <p className="text-[10px] font-mono uppercase tracking-widest opacity-50">Match</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pipeline Distribution */}
        <section className="space-y-6">
          <h3 className="col-header flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Pipeline Distribution
          </h3>
          <div className="bg-white border border-line p-8 space-y-6">
            {stats.statusCounts.map((s, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest">
                  <span>{s.status}</span>
                  <span>{s.count} Candidates</span>
                </div>
                <div className="h-2 bg-line/10 w-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${(s.count / stats.totalResumes) * 100}%` }}
                    className="h-full bg-ink"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode, label: string, value: number | string }) {
  return (
    <div className="bg-white p-8 flex flex-col items-center text-center space-y-2">
      <div className="opacity-50">{icon}</div>
      <p className="text-3xl font-mono font-bold">{value}</p>
      <p className="text-[10px] font-mono uppercase tracking-widest opacity-50">{label}</p>
    </div>
  );
}
