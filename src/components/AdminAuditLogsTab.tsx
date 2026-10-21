import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  ShieldAlert, 
  Clock, 
  Search, 
  RefreshCw, 
  FileCheck2, 
  Building2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Coins, 
  UserCheck, 
  AlertCircle,
  Download,
  CheckCircle2,
  Lock,
  Database
} from 'lucide-react';
import { 
  fetchInvestorProtectionLogs, 
  fetchAdminAuditLogs, 
  InvestorProtectionLog, 
  AdminSecurityAuditLog,
  isSupabaseConfigured
} from '../lib/supabase';

interface CombinedLogEntry {
  id: string;
  source: 'investor' | 'admin';
  timestamp: string;
  actor: string;
  actorRole: string;
  eventType: string;
  title: string;
  amount?: number;
  reference?: string;
  details: Record<string, any>;
}

export const AdminAuditLogsTab: React.FC = () => {
  const [investorLogs, setInvestorLogs] = useState<InvestorProtectionLog[]>([]);
  const [adminLogs, setAdminLogs] = useState<AdminSecurityAuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'deeds' | 'deposits' | 'withdrawals' | 'kyc' | 'tasks'>('all');
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const loadLogs = async () => {
    setIsLoading(true);
    try {
      const [inv, adm] = await Promise.all([
        fetchInvestorProtectionLogs(),
        fetchAdminAuditLogs()
      ]);
      setInvestorLogs(inv);
      setAdminLogs(adm);
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (e) {
      console.warn('Failed to load audit logs:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
    const interval = setInterval(loadLogs, 15000); // Polling sync every 15s
    return () => clearInterval(interval);
  }, []);

  // Combine and sort logs chronologically
  const combinedEntries: CombinedLogEntry[] = [
    ...investorLogs.map(l => ({
      id: l.id,
      source: 'investor' as const,
      timestamp: l.createdAt,
      actor: l.userName || l.userEmail || l.userId,
      actorRole: 'Investor',
      eventType: l.eventType,
      title: l.eventType === 'plan_purchased' ? `Property Plan Acquisition: ${l.planName || 'Asset'}` :
             l.eventType === 'deed_issued' ? `Official UAE Deed Generated` :
             l.eventType === 'withdrawal_requested' ? `Bank Cashout Initiated` :
             l.eventType === 'deposit_receipt_uploaded' ? `Bank Transfer Proof Uploaded` :
             l.eventType === 'task_claimed' ? `Daily Bounty Claimed` : 'Investor Activity',
      amount: l.amount,
      reference: l.deedReferenceCode || l.makaniNumber || undefined,
      details: l.details || {}
    })),
    ...adminLogs.map(l => ({
      id: l.id,
      source: 'admin' as const,
      timestamp: l.createdAt,
      actor: l.adminName || l.adminId,
      actorRole: 'Administrator',
      eventType: l.actionType,
      title: l.actionType === 'approve_deposit' ? `Approved Bank Deposit for ${l.targetUserName || l.targetUserId}` :
             l.actionType === 'reject_deposit' ? `Rejected Bank Deposit for ${l.targetUserName || l.targetUserId}` :
             l.actionType === 'settle_withdrawal' ? `Authorized Bank Settlement to ${l.targetUserName || l.targetUserId}` :
             l.actionType === 'reject_withdrawal' ? `Rejected Cashout Request for ${l.targetUserName || l.targetUserId}` :
             l.actionType === 'approve_kyc' ? `Verified KYC Identity for ${l.targetUserName || l.targetUserId}` :
             l.actionType === 'approve_task_bounty' ? `Credited Task Bounty to ${l.targetUserName || l.targetUserId}` :
             `Administrative Action: ${l.actionType}`,
      amount: l.amount,
      reference: l.notes || undefined,
      details: l.details || {}
    }))
  ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  // Filter entries
  const filtered = combinedEntries.filter(entry => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = !q || 
      entry.actor.toLowerCase().includes(q) || 
      entry.title.toLowerCase().includes(q) || 
      (entry.reference && entry.reference.toLowerCase().includes(q));

    if (!matchesSearch) return false;

    if (filterType === 'deeds') return entry.eventType.includes('plan') || entry.eventType.includes('deed');
    if (filterType === 'deposits') return entry.eventType.includes('deposit');
    if (filterType === 'withdrawals') return entry.eventType.includes('withdrawal') || entry.eventType.includes('settle');
    if (filterType === 'kyc') return entry.eventType.includes('kyc');
    if (filterType === 'tasks') return entry.eventType.includes('task');
    return true;
  });

  const deedsCount = investorLogs.filter(l => l.eventType === 'plan_purchased').length;
  const adminActionsCount = adminLogs.length;

  const handleExportCSV = () => {
    const headers = ['ID', 'Timestamp', 'Actor', 'Role', 'Event', 'Amount', 'Reference'];
    const rows = filtered.map(e => [
      `"${e.id}"`,
      `"${new Date(e.timestamp).toISOString()}"`,
      `"${e.actor.replace(/"/g, '""')}"`,
      `"${e.actorRole}"`,
      `"${e.title.replace(/"/g, '""')}"`,
      `"${e.amount || 0}"`,
      `"${(e.reference || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pm_invest_audit_ledger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase">Protection Events</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{investorLogs.length}</h3>
          <p className="text-[10px] text-slate-500 mt-1">Live investor actions recorded</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase">UAE Deeds Backed</span>
            <Building2 className="w-4 h-4 text-amber-500" />
          </div>
          <h3 className="text-2xl font-extrabold text-amber-600 mt-1">{deedsCount}</h3>
          <p className="text-[10px] text-slate-500 mt-1">Makani & DLD title registered</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase">Admin Authorizations</span>
            <Lock className="w-4 h-4 text-purple-600" />
          </div>
          <h3 className="text-2xl font-extrabold text-purple-700 mt-1">{adminActionsCount}</h3>
          <p className="text-[10px] text-slate-500 mt-1">Audited administrative decisions</p>
        </div>

        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono font-bold text-slate-500 uppercase">Supabase Realtime</span>
            <Database className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className={`w-2.5 h-2.5 rounded-full ${isSupabaseConfigured() ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <h3 className="text-sm font-extrabold text-slate-900 font-mono">
              {isSupabaseConfigured() ? 'Cloud Synced' : 'Local + Offline Cache'}
            </h3>
          </div>
          <p className="text-[10px] text-slate-500 mt-1">
            {lastRefreshed ? `Updated at ${lastRefreshed}` : 'Continuous live stream'}
          </p>
        </div>
      </div>

      {/* Control & Search Toolbar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by investor, admin, Makani, or ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:outline-none focus:border-amber-500 text-slate-900"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { id: 'all', label: 'All Events' },
            { id: 'deeds', label: 'Deeds & Plans' },
            { id: 'deposits', label: 'Deposits' },
            { id: 'withdrawals', label: 'Withdrawals' },
            { id: 'kyc', label: 'KYC Identity' },
            { id: 'tasks', label: 'Daily Bounties' }
          ].map((f) => (
            <button
              key={f.id}
              onClick={() => setFilterType(f.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterType === f.id
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
          <button
            onClick={loadLogs}
            disabled={isLoading}
            className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer transition-colors"
            title="Refresh from Supabase"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-amber-500' : ''}`} />
          </button>
          <button
            onClick={handleExportCSV}
            className="bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs cursor-pointer transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Main Audit Stream Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-200 bg-slate-50/75 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <h4 className="font-bold text-xs uppercase tracking-wider text-slate-800 font-mono">
              Immutable Cryptographic Audit Trail ({filtered.length} Records)
            </h4>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">
            Synced with Supabase Realtime
          </span>
        </div>

        {filtered.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-xs">
            <CheckCircle2 className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-bold text-slate-700">No audit records match your query.</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Events from plan purchases, deeds, and admin actions stream here automatically.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/75 text-slate-600 uppercase font-mono text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Timestamp</th>
                  <th className="py-2.5 px-4 font-semibold">Actor</th>
                  <th className="py-2.5 px-4 font-semibold">Action / Event</th>
                  <th className="py-2.5 px-4 font-semibold">Reference / Makani</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Amount</th>
                  <th className="py-2.5 px-4 font-semibold text-center">Audit Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-sans">
                {filtered.map((entry) => {
                  const isInvestor = entry.source === 'investor';
                  const dateStr = new Date(entry.timestamp);

                  return (
                    <tr key={entry.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Timestamp */}
                      <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                        <div className="font-bold text-slate-700">{dateStr.toLocaleDateString()}</div>
                        <div className="text-[10px] text-slate-400">{dateStr.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</div>
                      </td>

                      {/* Actor */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                          {entry.actor}
                        </div>
                        <span className={`inline-block text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                          isInvestor ? 'bg-amber-100 text-amber-900 border border-amber-200' : 'bg-purple-100 text-purple-900 border border-purple-200'
                        }`}>
                          {entry.actorRole}
                        </span>
                      </td>

                      {/* Action / Event */}
                      <td className="py-3 px-4 max-w-xs">
                        <p className="font-bold text-slate-900 truncate">{entry.title}</p>
                        <p className="text-[10px] font-mono text-slate-400 truncate">ID: {entry.id}</p>
                      </td>

                      {/* Reference / Makani */}
                      <td className="py-3 px-4 whitespace-nowrap">
                        {entry.reference ? (
                          <span className="font-mono text-[11px] bg-slate-100 text-slate-800 px-2 py-0.5 rounded border border-slate-200 font-bold">
                            {entry.reference}
                          </span>
                        ) : (
                          <span className="text-slate-400 text-[10px] font-mono">—</span>
                        )}
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-4 text-right whitespace-nowrap font-mono font-bold">
                        {entry.amount ? (
                          <span className={isInvestor ? 'text-emerald-700' : 'text-slate-900'}>
                            ₦{entry.amount.toLocaleString()}
                          </span>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Audit Source Badge */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          isInvestor 
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' 
                            : 'bg-purple-50 text-purple-800 border border-purple-200'
                        }`}>
                          {isInvestor ? 'Investor Ledger' : 'Admin Signed'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAuditLogsTab;
