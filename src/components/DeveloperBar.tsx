import React from 'react';
import { useAppState } from '../context/StateContext';
import { RefreshCw, Users, Shield, Calendar, HelpCircle } from 'lucide-react';

export const DeveloperBar: React.FC = () => {
  const { users, currentUser, switchUser, simulateWeek, resetAll, currentWeek } = useAppState();

  return (
    <div 
      className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-black via-[#06120b] to-black border-t border-[#C5A85A]/40 text-gray-200 py-3 px-4 z-50 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-4"
      id="simulation_developer_bar"
    >
      {/* Simulation Info */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-[#123122] border border-[#C5A85A]/30 rounded-lg flex items-center justify-center text-[#C5A85A]">
          <Calendar className="w-4 h-4 animate-pulse" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-white">SIMULATION SANDBOX</span>
            <span className="bg-[#C5A85A]/20 text-[#C5A85A] border border-[#C5A85A]/30 text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold uppercase">
              Week {currentWeek}
            </span>
          </div>
          <p className="text-[11px] text-gray-400">
            Switch accounts to test different roles. Click <strong className="text-white">Trigger Weekly Payout</strong> to pay investors & calculate referral fees!
          </p>
        </div>
      </div>

      {/* Quick Action switches & Simulator */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Quick Identity switcher dropdown */}
        <div className="flex items-center gap-1.5 bg-[#0a1a11] border border-gray-800 rounded px-2 py-1 text-xs">
          <Users className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-gray-400 text-[10px] hidden sm:inline">Act As:</span>
          <select
            value={currentUser?.id || ''}
            onChange={(e) => switchUser(e.target.value)}
            className="bg-transparent text-white font-semibold focus:outline-none cursor-pointer max-w-[150px] sm:max-w-none text-xs"
            id="simulation_user_select"
          >
            {users.map(u => (
              <option key={u.id} value={u.id} className="bg-[#050D09] text-white">
                {u.name} ({u.role.toUpperCase()})
              </option>
            ))}
          </select>
        </div>

        {/* Time Simulator Button */}
        <button
          onClick={simulateWeek}
          className="bg-[#C5A85A] hover:bg-[#D4AF37] text-black font-extrabold px-3 py-1.5 rounded text-[11px] uppercase tracking-wider flex items-center gap-1 transition-all shadow shadow-[#C5A85A]/20"
          id="btn_simulate_week_bar"
          title="Simulate 1-Week elapsing: Credits weekly payouts (e.g. Plan 1 ₦16,250) and credits 50% referral bonuses to sponsors."
        >
          <RefreshCw className="w-3 h-3 animate-spin-slow" /> Payout Week
        </button>

        {/* Restore seeds button */}
        <button
          onClick={resetAll}
          className="bg-gray-900 hover:bg-gray-800 text-gray-400 hover:text-white border border-gray-800 px-2.5 py-1.5 rounded text-[10px] uppercase font-semibold font-mono tracking-wider transition-colors"
          id="btn_reset_simulation_bar"
          title="Reset to default seed users and data."
        >
          Reset Demo
        </button>
      </div>
    </div>
  );
};
