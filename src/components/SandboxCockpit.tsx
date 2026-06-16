import React, { useState } from 'react';
import { User, Challenge, UserChallenge, CheckIn, Verification, SystemLog } from '../types.js';
import { Play, RotateCcw, Database, Terminal, Shield, RefreshCw } from 'lucide-react';

interface SandboxCockpitProps {
  logs: SystemLog[];
  dbState: {
    users: User[];
    challenges: Challenge[];
    user_challenges: UserChallenge[];
    check_ins: CheckIn[];
    verifications: Verification[];
  };
  onTriggerClockReset: () => void;
  onResetSandbox: () => void;
  onClearLogs: () => void;
  onUserSelected: (username: string) => void;
  activeUsername: string;
}

export default function SandboxCockpit({
  logs,
  dbState,
  onTriggerClockReset,
  onResetSandbox,
  onClearLogs,
  onUserSelected,
  activeUsername
}: SandboxCockpitProps) {
  const [activeTab, setActiveTab] = useState<'terminal' | 'database'>('terminal');
  const [selectedTable, setSelectedTable] = useState<'users' | 'challenges' | 'user_challenges' | 'check_ins' | 'verifications'>('users');

  const getLogTypeColor = (type: SystemLog['type']) => {
    switch (type) {
      case 'SUCCESS': return 'text-emerald-400 font-semibold';
      case 'ERROR': return 'text-rose-400 font-semibold';
      case 'CRON': return 'text-amber-300 font-bold';
      case 'API': return 'text-cyan-300';
      default: return 'text-slate-300';
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
      {/* Header operations bar */}
      <div className="p-5 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">BETZ Full-Stack Sandbox Engine</h2>
          </div>
          <p className="text-xs text-slate-500 font-mono mt-1">Host: 0.0.0.0:3000 | PostgreSQL Relational Model</p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onTriggerClockReset}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg shadow-sm transition-colors cursor-pointer"
            title="Simulates standard midnight cron job verifying submissions and resetting failing player streaks"
          >
            <Play className="w-3 h-3 fill-current" />
            Trigger Midnight Sweep
          </button>
          
          <button
            onClick={onResetSandbox}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold bg-white hover:bg-slate-50 text-slate-700 rounded-lg shadow-sm border border-slate-200 transition-colors cursor-pointer"
            title="Restores default database seed entries"
          >
            <RotateCcw className="w-3 h-3" />
            Reset DB
          </button>
        </div>
      </div>

      {/* Simulator Switch user panel */}
      <div className="p-4 bg-slate-50/40 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
        <span className="text-xs font-medium text-slate-500">Sandbox Quick-Switch Client Identity:</span>
        <div className="flex items-center gap-1.5">
          {['yannick', 'ryan', 'nathanael'].map((name) => (
            <button
              key={name}
              onClick={() => onUserSelected(name)}
              className={`px-3 py-1 text-xs rounded-md font-mono transition-all capitalize ${
                activeUsername === name 
                  ? 'bg-indigo-600 text-white font-bold shadow-sm' 
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 hover:text-slate-800'
              }`}
            >
              @{name}
            </button>
          ))}
        </div>
      </div>

      {/* Tab controls */}
      <div className="flex items-center bg-slate-50/50 border-b border-slate-200 h-11 px-3">
        <button
          onClick={() => setActiveTab('terminal')}
          className={`flex items-center gap-1.5 px-4 h-full text-xs font-mono transition-all border-b-2 cursor-pointer ${
            activeTab === 'terminal' 
              ? 'text-indigo-600 border-indigo-600 bg-white font-bold' 
              : 'text-slate-500 hover:text-slate-800 border-transparent'
          }`}
        >
          <Terminal className="w-3.5 h-3.5" />
          Live Logs Console
        </button>
        <button
          onClick={() => setActiveTab('database')}
          className={`flex items-center gap-1.5 px-4 h-full text-xs font-mono transition-all border-b-2 cursor-pointer ${
            activeTab === 'database' 
              ? 'text-indigo-600 border-indigo-600 bg-white font-bold' 
              : 'text-slate-500 hover:text-slate-800 border-transparent'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          PostgreSQL Explorer
        </button>
      </div>

      {/* Output Content container */}
      <div className="flex-1 overflow-auto bg-slate-950 p-4 font-mono text-xs">
        {activeTab === 'terminal' ? (
          <div className="space-y-2.5 h-full overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-3">
              <span className="text-slate-550 text-2xs uppercase tracking-wider font-bold">System Stream (Newest first)</span>
              <button 
                onClick={onClearLogs}
                className="text-2xs text-slate-400 hover:text-rose-400 hover:underline cursor-pointer"
              >
                Clear Console
              </button>
            </div>
            {logs.length === 0 ? (
              <p className="text-slate-500 italic">No incoming logs. Perform actions on the simulator to register transactions.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="flex items-start gap-2.5 hover:bg-slate-900/40 p-1 rounded transition-colors">
                  <span className="text-slate-500 font-mono text-[10px] w-18 select-none">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] bg-slate-900 uppercase font-mono tracking-wider shrink-0 ${
                    log.type === 'SUCCESS' ? 'text-emerald-400 border border-emerald-950' :
                    log.type === 'ERROR' ? 'text-rose-400 border border-rose-950' : 'text-slate-400'
                  }`}>
                    {log.type}
                  </span>
                  <span className={`flex-1 break-all ${getLogTypeColor(log.type)}`}>
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="h-full flex flex-col bg-white -m-4 p-4 text-slate-800">
            {/* Table Select navigation */}
            <div className="flex flex-wrap items-center gap-1.5 mb-4 border-b border-slate-100 pb-3">
              {(['users', 'challenges', 'user_challenges', 'check_ins', 'verifications'] as const).map((tbl) => (
                <button
                  key={tbl}
                  onClick={() => setSelectedTable(tbl)}
                  className={`px-2.5 py-1 text-2xs rounded-md transition-all cursor-pointer ${
                    selectedTable === tbl 
                      ? 'bg-indigo-50 text-indigo-650 font-bold border border-indigo-200' 
                      : 'bg-slate-50 text-slate-500 border border-slate-100 hover:bg-slate-100 hover:text-slate-700'
                  }`}
                >
                  {tbl}
                </button>
              ))}
            </div>

            {/* Simulated interactive grid view */}
            <div className="flex-1 overflow-auto border border-slate-200 rounded-lg shadow-inner bg-white">
              {renderDatabaseTable(selectedTable, dbState)}
            </div>
          </div>
        )}
      </div>

      <div className="p-3 bg-slate-50 text-2xs text-slate-500 flex items-center justify-between border-t border-slate-200">
        <span className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-white shadow-xs border border-slate-100">
          <Shield className="w-3 h-3 text-indigo-500" />
          ACID Compliance
        </span>
        <span className="font-sans text-slate-400 font-medium">
          BETZ Engine v1.3 • Relational Guard State
        </span>
      </div>
    </div>
  );
}

// Subrender for tables
function renderDatabaseTable(tableName: string, db: any) {
  const data = db[tableName] || [];

  if (data.length === 0) {
    return (
      <div className="p-10 text-center text-slate-400 italic font-sans">
        Null set. Table currently contains 0 records.
      </div>
    );
  }

  // Pick headers from keys
  const headers = Object.keys(data[0]);

  return (
    <div className="w-full text-[11px] bg-white">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="bg-slate-50 text-slate-600 border-b border-slate-200">
            {headers.map((h) => (
              <th key={h} className="p-3 py-2.5 font-bold tracking-tight border-r border-slate-150 whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {data.map((row: any, i: number) => (
            <tr key={i} className="hover:bg-slate-50/50 text-slate-700 transition-colors">
              {headers.map((h) => {
                const val = row[h];
                let displayVal = '';
                if (typeof val === 'object' && val !== null) {
                  displayVal = JSON.stringify(val);
                } else if (val === undefined || val === null) {
                  displayVal = 'NULL';
                } else if (typeof val === 'boolean') {
                  displayVal = val ? 'TRUE' : 'FALSE';
                } else {
                  displayVal = String(val);
                }

                // Truncate UUID and timestamps for UI elegance
                const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(displayVal);
                const isCustomId = displayVal.startsWith('usr-') || displayVal.startsWith('ch-') || displayVal.startsWith('chk-') || displayVal.startsWith('v-');
                const isTimestamp = displayVal.includes('T') && displayVal.endsWith('Z');

                let displayStyle = '';
                if (displayVal === 'NULL') {
                  displayStyle = 'text-slate-400 italic';
                } else if (h === 'total_xp') {
                  displayStyle = 'text-indigo-600 font-bold';
                } else if (h === 'current_streak' && Number(val) > 0) {
                  displayStyle = 'text-amber-600 font-bold';
                } else if (row.status === 'ACTIVE' && h === 'status') {
                  displayStyle = 'text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 font-semibold';
                } else if (row.status === 'VERIFIED' && h === 'status') {
                  displayStyle = 'text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100 font-semibold';
                } else if (row.status === 'DISPUTED' && h === 'status') {
                  displayStyle = 'text-red-700 bg-red-50 px-1.5 py-0.5 rounded border border-red-100 font-semibold';
                } else if (isUuid || isCustomId) {
                  displayStyle = 'text-indigo-650 font-mono text-xs';
                } else if (isTimestamp) {
                  displayStyle = 'text-slate-400';
                }

                return (
                  <td key={h} className="p-3 border-r border-slate-100 font-mono select-all truncate max-w-44" title={displayVal}>
                    <span className={displayStyle}>
                      {isUuid || isCustomId ? `${displayVal.slice(0, 8)}…` : displayVal}
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
