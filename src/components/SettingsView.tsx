import React from 'react';
import { User, Shield, Database, Sparkles, Trash2, Save, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';

interface SettingsViewProps {
  onClearData: (type: 'resumes' | 'jobs' | 'all') => void;
}

export function SettingsView({ onClearData }: SettingsViewProps) {
  const [isSaved, setIsSaved] = React.useState(false);
  const [hrName, setHrName] = React.useState('Admin User');
  const [department, setDepartment] = React.useState('Talent Acquisition');

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  return (
    <div className="space-y-12 pb-20 max-w-4xl mx-auto">
      <div className="border-b border-line pb-8">
        <h2 className="text-3xl font-serif italic">Settings</h2>
        <p className="text-[11px] font-mono uppercase tracking-widest opacity-50 mt-1">Configure your HR workspace and AI preferences</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[250px_1fr] gap-12">
        {/* Sidebar Navigation */}
        <aside className="space-y-2">
          <SettingsNavButton icon={<User className="w-4 h-4" />} label="Profile" active />
          <SettingsNavButton icon={<Sparkles className="w-4 h-4" />} label="AI Configuration" />
          <SettingsNavButton icon={<Shield className="w-4 h-4" />} label="Security" />
          <SettingsNavButton icon={<Database className="w-4 h-4" />} label="Data Management" />
        </aside>

        {/* Content */}
        <div className="space-y-12">
          {/* Profile Section */}
          <section className="space-y-6">
            <h3 className="text-xs font-mono uppercase tracking-[0.2em] opacity-30 border-b border-line pb-2">Profile Settings</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest opacity-50">HR Administrator Name</label>
                <input 
                  type="text" 
                  value={hrName}
                  onChange={(e) => setHrName(e.target.value)}
                  className="w-full bg-white border border-line p-3 text-sm font-serif italic focus:outline-none focus:border-ink transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-mono uppercase tracking-widest opacity-50">Department</label>
                <input 
                  type="text" 
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-white border border-line p-3 text-sm font-serif italic focus:outline-none focus:border-ink transition-colors"
                />
              </div>
            </div>
          </section>

          {/* AI Configuration */}
          <section className="space-y-6">
            <h3 className="text-xs font-mono uppercase tracking-[0.2em] opacity-30 border-b border-line pb-2">AI Configuration</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-white border border-line">
                <div>
                  <p className="text-sm font-serif italic">Deep Analysis Mode</p>
                  <p className="text-[10px] font-mono uppercase tracking-widest opacity-40 mt-1">Extracts more granular data but takes longer</p>
                </div>
                <div className="w-10 h-5 bg-ink rounded-full relative cursor-pointer">
                  <div className="absolute right-1 top-1 w-3 h-3 bg-bg rounded-full" />
                </div>
              </div>
              <div className="flex items-center justify-between p-4 bg-white border border-line">
                <div>
                  <p className="text-sm font-serif italic">Auto-Ranking</p>
                  <p className="text-[10px] font-mono uppercase tracking-widest opacity-40 mt-1">Automatically rank new resumes upon upload</p>
                </div>
                <div className="w-10 h-5 bg-line/20 rounded-full relative cursor-pointer">
                  <div className="absolute left-1 top-1 w-3 h-3 bg-white rounded-full" />
                </div>
              </div>
            </div>
          </section>

          {/* Data Management */}
          <section className="space-y-6">
            <h3 className="text-xs font-mono uppercase tracking-[0.2em] opacity-30 border-b border-line pb-2">Data Management</h3>
            <div className="p-6 border border-rose-100 bg-rose-50/30 space-y-6">
              <div className="flex items-start gap-3 text-rose-800">
                <AlertTriangle className="w-5 h-5 mt-0.5" />
                <div>
                  <p className="text-xs font-mono uppercase tracking-widest font-bold">Danger Zone</p>
                  <p className="text-[10px] font-mono uppercase tracking-widest opacity-70 mt-1">These actions are permanent and cannot be undone.</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button 
                  onClick={() => onClearData('resumes')}
                  className="flex items-center justify-center gap-2 p-3 border border-rose-200 text-rose-700 text-[10px] font-mono uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear All Resumes
                </button>
                <button 
                  onClick={() => onClearData('jobs')}
                  className="flex items-center justify-center gap-2 p-3 border border-rose-200 text-rose-700 text-[10px] font-mono uppercase tracking-widest hover:bg-rose-600 hover:text-white transition-all"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear All Job Roles
                </button>
              </div>
            </div>
          </section>

          {/* Footer Actions */}
          <div className="pt-8 border-t border-line flex items-center justify-between">
            <div className="flex items-center gap-2">
              {isSaved && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-2 text-emerald-600 text-[10px] font-mono uppercase tracking-widest"
                >
                  <CheckCircle2 className="w-3 h-3" />
                  Settings saved successfully
                </motion.div>
              )}
            </div>
            <button 
              onClick={handleSave}
              className="flex items-center gap-2 px-8 py-3 bg-ink text-bg text-[10px] font-mono uppercase tracking-widest hover:bg-ink/90 transition-all"
            >
              <Save className="w-3 h-3" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsNavButton({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
  return (
    <button className={`w-full flex items-center gap-3 px-4 py-3 text-[11px] font-mono uppercase tracking-widest transition-all ${
      active ? 'bg-bg border border-line text-ink' : 'text-ink/40 hover:text-ink hover:bg-bg/50'
    }`}>
      {icon}
      {label}
    </button>
  );
}
