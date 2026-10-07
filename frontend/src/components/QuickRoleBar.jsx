import React from 'react';
import { useAuth, DEMO_PRESETS } from '../context/AuthContext';
import { UserCheck, Sparkles } from 'lucide-react';

export default function QuickRoleBar() {
  const { user, switchDemoRole, loading } = useAuth();

  return (
    <div className="bg-slate-900 text-white text-xs border-b border-slate-800 px-4 py-2 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 font-semibold text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
            Hackathon Demo Switcher:
          </span>
          <span className="text-slate-400 hidden sm:inline">Active:</span>
          <span className="font-medium bg-slate-800 text-orange-400 px-2 py-0.5 rounded-full border border-slate-700">
            {user?.name} ({user?.role?.toUpperCase()})
          </span>
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-slate-400 text-[11px] hidden md:inline">Switch Role:</span>
          {DEMO_PRESETS.map((p) => {
            const isActive = user?.email === p.email;
            return (
              <button
                key={p.roleKey}
                disabled={loading}
                onClick={() => switchDemoRole(p.roleKey)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition flex items-center gap-1 ${
                  isActive
                    ? 'bg-orange-600 text-white shadow-sm ring-1 ring-orange-400'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700'
                }`}
                title={`Login as ${p.label} (${p.email})`}
              >
                <span>{p.avatar}</span>
                <span>{p.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
