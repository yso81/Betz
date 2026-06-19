import React, { useState, useEffect, useRef } from 'react';
import { User, Challenge, UserChallenge, CheckIn, Verification, SystemLog } from './types';
import { 
  Flame, Award, PlusCircle, CheckCircle, Navigation, 
  MapPin, ShieldCheck, Heart, Trash, Compass, User as UserIcon, ListFilter,
  Check, X, Camera, Send, BellRing, Sparkles, AlertCircle, RefreshCw,
  Database, Terminal, Shield, RotateCcw, Play, LogOut, Cpu
} from 'lucide-react';

// Preseeded beautiful habit proof images for instant beautiful demo simulation clicks
const HABIT_PRESETS = [
  {
    name: 'Hydration Flask',
    imageUrl: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?auto=format&fit=crop&q=80&w=600',
    text: 'Met my hydration goals! Fresh cold water, 3L checklist complete.'
  },
  {
    name: 'Morning Gym',
    imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&q=80&w=600',
    text: 'Destroyed leg day today. High sweat, maximum effort!'
  },
  {
    name: 'Sunrise Walk/Trail',
    imageUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=600',
    text: 'Smashed the 5K early trail goal before the sun got too hot.'
  },
  {
    name: 'GitHub Contributions',
    imageUrl: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?auto=format&fit=crop&q=80&w=600',
    text: 'Green contributions on the board! Coding habit held tight.'
  },
  {
    name: 'Healthy Breakfast bowl',
    imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=600',
    text: 'Fueling my body with greens and slow release carbs.'
  },
];

function AnimatedStreak({ streak }: { streak: number }) {
  const [isIncrementing, setIsIncrementing] = useState(false);
  const [showPop, setShowPop] = useState(false);
  const prevStreakRef = useRef(streak);

  useEffect(() => {
    if (streak > prevStreakRef.current) {
      setIsIncrementing(true);
      setShowPop(true);
      
      const timer1 = setTimeout(() => setIsIncrementing(false), 800);
      const timer2 = setTimeout(() => setShowPop(false), 1400);
      
      return () => {
        clearTimeout(timer1);
        clearTimeout(timer2);
      };
    }
    prevStreakRef.current = streak;
  }, [streak]);

  return (
    <div className="relative">
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes streakPopUp {
          0% {
            opacity: 0;
            transform: translateY(2px) scale(0.85);
          }
          15% {
            opacity: 1;
            transform: translateY(-4px) scale(1.3);
          }
          100% {
            opacity: 0;
            transform: translateY(-24px) scale(0.9);
          }
        }
        .animate-streak-pop {
          animation: streakPopUp 1.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}} />
      <div 
        className={`flex items-center gap-0.5 text-xs font-bold font-mono transition-transform duration-300 ${
          isIncrementing ? 'scale-125 text-orange-650' : 'text-amber-600'
        }`}
      >
        <Flame 
          className={`w-4 h-4 fill-current transition-all duration-300 ${
            isIncrementing 
              ? 'text-red-500 scale-125 rotate-12 drop-shadow-[0_0_8px_rgba(249,115,22,0.85)]' 
              : 'text-orange-550 animate-pulse'
          }`} 
        />
        <span>{streak}d</span>
      </div>
      
      {showPop && (
        <span className="absolute -top-6 -right-2 text-[10px] font-extrabold text-orange-600 font-mono pointer-events-none select-none z-20 animate-streak-pop">
          +1 🔥
        </span>
      )}
    </div>
  );
}

export default function App() {
  // Global React States
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    username: string;
    email: string;
    total_xp: number;
  } | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [feed, setFeed] = useState<(CheckIn & { votes: Verification[] })[]>([]);
  const [userChallenges, setUserChallenges] = useState<any[]>([]);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [dbState, setDbState] = useState<{
    users: User[];
    challenges: Challenge[];
    user_challenges: UserChallenge[];
    check_ins: CheckIn[];
    verifications: Verification[];
  }>({
    users: [],
    challenges: [],
    user_challenges: [],
    check_ins: [],
    verifications: []
  });

  // Navigation and UI state
  const [activeTab, setActiveTab] = useState<'feed' | 'challenges' | 'submit' | 'rank' | 'profile' | 'sandbox'>('feed');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [sandboxTab, setSandboxTab] = useState<'terminal' | 'database'>('terminal');
  const [selectedDbTable, setSelectedDbTable] = useState<'users' | 'challenges' | 'user_challenges' | 'check_ins' | 'verifications'>('users');

  // Form inputs
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('123456');
  
  const [loginTerm, setLoginTerm] = useState('yannick'); 
  const [loginPassword, setLoginPassword] = useState('123456');

  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDuration, setNewDuration] = useState('14');
  const [newFrequency, setNewFrequency] = useState<'DAILY' | 'WEEKLY'>('DAILY');

  const [selectedChallengeToSubmit, setSelectedChallengeToSubmit] = useState('');
  const [customMediaUrl, setCustomMediaUrl] = useState('');
  const [customTextProof, setCustomTextProof] = useState('');
  const [timezoneOffset, setTimezoneOffset] = useState(-240); 
  const [isUploading, setIsUploading] = useState(false);

  const [showNotificationAlert, setShowNotificationAlert] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Local storage initialization
  useEffect(() => {
    const savedUser = localStorage.getItem('betz_user');
    const savedToken = localStorage.getItem('betz_token');
    if (savedUser && savedToken) {
      setCurrentUser(JSON.parse(savedUser));
      setToken(savedToken);
    } else {
      // Default auto-login as first researcher (Yannick) to lower entrance friction
      const defaultMockUser = {
        id: 'yc745fbf-4076-4767-8919-48227e7ca4b1',
        username: 'yannick',
        email: 'yannick@gmail.com',
        total_xp: 450
      };
      setCurrentUser(defaultMockUser);
      setToken(`mock-jwt-token-for-${defaultMockUser.id}`);
      localStorage.setItem('betz_user', JSON.stringify(defaultMockUser));
      localStorage.setItem('betz_token', `mock-jwt-token-for-${defaultMockUser.id}`);
    }
  }, []);

  // Fetch functions
  const fetchData = async () => {
    try {
      const feedRes = await fetch('/api/feed');
      if (feedRes.ok) {
        const feedData = await feedRes.json();
        setFeed(feedData);
      }

      const chalRes = await fetch('/api/challenges');
      if (chalRes.ok) {
        const chalData = await chalRes.json();
        setChallenges(chalData);
      }

      const leadRes = await fetch('/api/leaderboard');
      if (leadRes.ok) {
        const leadData = await leadRes.json();
        setLeaderboard(leadData);
      }

      const logRes = await fetch('/api/system/logs');
      if (logRes.ok) {
        const logData = await logRes.json();
        setLogs(logData);
      }

      const stateRes = await fetch('/api/system/state');
      if (stateRes.ok) {
        const stateData = await stateRes.json();
        setDbState(stateData);

        if (currentUser) {
          const freshUser = stateData.users.find((u: User) => u.id === currentUser.id);
          if (freshUser) {
            const updated = {
              id: freshUser.id,
              username: freshUser.username,
              email: freshUser.email,
              total_xp: freshUser.total_xp
            };
            setCurrentUser(updated);
            localStorage.setItem('betz_user', JSON.stringify(updated));
          }
        }
      }
    } catch (e) {
      console.error('Error polling background systems', e);
    }
  };

  const fetchUserEnrollments = async () => {
    if (!currentUser) return;
    try {
      const res = await fetch(`/api/users/${currentUser.id}/challenges`);
      if (res.ok) {
        const data = await res.json();
        setUserChallenges(data);
      }
    } catch (e) {
      console.error('Error fetching user challenges', e);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 1500);
    return () => clearInterval(interval);
  }, [currentUser?.id]);

  useEffect(() => {
    if (currentUser) {
      fetchUserEnrollments();
    } else {
      setUserChallenges([]);
    }
  }, [currentUser?.id, feed]);

  // Auth Handlers
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: regUsername, email: regEmail, password: regPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      setCurrentUser(data.user);
      setToken(data.token);
      localStorage.setItem('betz_user', JSON.stringify(data.user));
      localStorage.setItem('betz_token', data.token);
      setSuccessMsg('Pledge established! Registered successfully.');
      setActiveTab('feed');
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Operation failed');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    clearMessages();
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail: loginTerm, password: loginPassword })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login checkout rejected');
      }
      setCurrentUser(data.user);
      setToken(data.token);
      localStorage.setItem('betz_user', JSON.stringify(data.user));
      localStorage.setItem('betz_token', data.token);
      setSuccessMsg('Successfully entered habit server hub.');
      setActiveTab('feed');
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Operation failed');
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setToken(null);
    localStorage.removeItem('betz_user');
    localStorage.removeItem('betz_token');
    setActiveTab('feed');
  };

  const handleQuickSwitchUser = async (username: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ usernameOrEmail: username, password: '123456' })
      });
      const data = await res.json();
      if (res.ok) {
        setCurrentUser(data.user);
        setToken(data.token);
        localStorage.setItem('betz_user', JSON.stringify(data.user));
        localStorage.setItem('betz_token', data.token);
        setSuccessMsg(`Switched identity to @${username}`);
      }
    } catch (e) {
      console.error('Switch failed', e);
    }
  };

  // Challenge Actions
  const handleJoinChallenge = async (challengeId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`/api/challenges/${challengeId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({})
      });
      if (res.ok) {
        setSuccessMsg('Signed habit challenge successfully!');
        fetchData();
        fetchUserEnrollments();
      } else {
        const err = await res.json();
        alert(err.error || 'Join error');
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleCreateChallenge = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    clearMessages();
    try {
      const res = await fetch('/api/challenges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          duration_days: Number(newDuration),
          frequency: newFrequency,
          start_date: new Date().toISOString()
        })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Deployment error');
      }
      setSuccessMsg(`Challenge "${newTitle}" created & auto-joined!`);
      setNewTitle('');
      setNewDesc('');
      setNewDuration('14');
      setActiveTab('challenges');
      fetchData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Operation failed');
    }
  };

  const handleSubmitCheckin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    clearMessages();

    if (!selectedChallengeToSubmit) {
      setErrorMsg('Choose target challenge to file proof.');
      return;
    }
    if (!customMediaUrl) {
      setErrorMsg('Proof media upload is required.');
      return;
    }

    setIsUploading(true);
    setTimeout(async () => {
      try {
        const res = await fetch(`/api/challenges/${selectedChallengeToSubmit}/checkin`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': token
          },
          body: JSON.stringify({
            media_url: customMediaUrl,
            text_proof: customTextProof,
            timezone_offset: Number(timezoneOffset)
          })
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Check-In transmission rejected');
        }
        setSuccessMsg('Physical proof propagated to feeds! Awaiting consensus approvals.');
        setCustomMediaUrl('');
        setCustomTextProof('');
        setActiveTab('feed');
        fetchData();
        fetchUserEnrollments();
      } catch (err: any) {
        setErrorMsg(err.message || 'Operation failed');
      } finally {
        setIsUploading(false);
      }
    }, 400);
  };

  const handleCastVote = async (checkInId: string, voteType: 'APPROVE' | 'DISPUTED') => {
    if (!token) return;
    try {
      const res = await fetch(`/api/checkins/${checkInId}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token
        },
        body: JSON.stringify({ vote: voteType })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Vote registration error');
      } else {
        setSuccessMsg(`Vote registered as: ${voteType}`);
        fetchData();
        fetchUserEnrollments();
      }
    } catch (e: any) {
      console.error(e);
    }
  };

  // Sandbox Triggers
  const handleTriggerClockReset = async () => {
    try {
      const res = await fetch('/api/system/reset-engine', { method: 'POST' });
      if (res.ok) {
        setSuccessMsg('Triggered midnight evaluation cron sweeper successfully!');
        fetchData();
        fetchUserEnrollments();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetSandbox = async () => {
    if (confirm('Re-seed Sandbox database back to pristine Yannick, Ryan & Nathanaël defaults?')) {
      try {
        const res = await fetch('/api/system/reset-sandbox', { method: 'POST' });
        if (res.ok) {
          setSuccessMsg('Sandbox database re-seeded successfully.');
          fetchData();
          fetchUserEnrollments();
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleClearLogs = async () => {
    try {
      await fetch('/api/system/clear-logs', { method: 'POST' });
      setSuccessMsg('Logs cleared.');
      fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const selectPreseedLogin = (uname: string) => {
    setLoginTerm(uname);
    setLoginPassword('123456');
  };

  const handleApplyPreset = (preset: typeof HABIT_PRESETS[0]) => {
    setCustomMediaUrl(preset.imageUrl);
    setCustomTextProof(preset.text);
    setSuccessMsg(`Preset "${preset.name}" applied.`);
  };

  const clearMessages = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  // UI styling helpers
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
    <div className="bg-slate-50 text-slate-800 min-h-screen font-sans antialiased flex flex-col justify-between">
      
      {/* Top Main Navigation Header */}
      <header className="px-6 py-4 bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="p-2 bg-indigo-650 rounded-xl shadow-md flex items-center justify-center">
              <Flame className="w-5 h-5 text-white fill-current animate-pulse" />
            </span>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900 leading-none">BETZ</h1>
              <p className="text-[10px] text-slate-500 font-mono tracking-widest mt-1 hidden sm:block">
                GAMIFIED PEER-VERIFIED HABITS
              </p>
            </div>
          </div>

          {currentUser && (
            <div className="flex items-center gap-4">
              {/* Quick User summary */}
              <div className="hidden md:flex items-center gap-3 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-medium">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-slate-700">@{currentUser.username}</span>
                <span className="text-slate-300">|</span>
                <span className="text-indigo-600 font-bold">{currentUser.total_xp} XP</span>
              </div>
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-xs text-rose-600 hover:text-rose-700 font-semibold border border-rose-100 hover:border-rose-200 bg-rose-50/50 hover:bg-rose-50 px-3 py-1.5 rounded-xl transition cursor-pointer"
                title="Logout"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Container Layout */}
      <div className="flex-1 w-full max-w-7xl mx-auto px-4 py-6 md:py-8 flex flex-col md:flex-row gap-8 items-stretch">
        
        {/* Navigation Sidebar (Desktop) */}
        {currentUser && (
          <nav className="hidden md:flex flex-col gap-1 w-64 shrink-0 bg-white border border-slate-200 rounded-2xl p-4 h-fit sticky top-24 shadow-xs">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 font-mono">Navigation</div>
            {[
              { id: 'feed', label: 'Consensus Feed', icon: Compass },
              { id: 'challenges', label: 'Habit Arena', icon: ListFilter },
              { id: 'submit', label: 'File Proof', icon: PlusCircle },
              { id: 'rank', label: 'Leaderboard', icon: Award },
              { id: 'profile', label: 'Challenger Hub', icon: UserIcon },
            ].map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl transition cursor-pointer ${
                    activeTab === t.id 
                      ? 'bg-indigo-550 text-white shadow-sm' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {t.label}
                </button>
              );
            })}
            
            <div className="h-px bg-slate-100 my-3" />
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 mb-2 font-mono">Developer tools</div>
            
            <button
              onClick={() => setActiveTab('sandbox')}
              className={`flex items-center gap-3 px-3 py-2.5 text-xs font-semibold rounded-xl transition cursor-pointer ${
                activeTab === 'sandbox' 
                  ? 'bg-slate-900 text-white shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <Cpu className="w-4 h-4 text-indigo-400" />
              Sandbox Console
            </button>
          </nav>
        )}

        {/* Dynamic Screen Viewport */}
        <main className="flex-1 min-w-0 flex flex-col">
          
          {/* Notification Alert Banner */}
          {currentUser && showNotificationAlert && (
            <div className="mb-4 bg-amber-50 border border-amber-200/70 p-3 px-4 rounded-2xl flex items-start gap-3 relative transition shadow-xs">
              <BellRing className="w-4 h-4 text-amber-600 shrink-0 mt-0.5 animate-bounce" />
              <div className="text-[11px] text-slate-700 leading-normal pr-6">
                <span className="font-bold text-amber-950">Streak Deadline warning:</span> Complete your habit check-ins within 4 hours to preserve your active streaks!
              </div>
              <button 
                onClick={() => setShowNotificationAlert(false)} 
                className="text-slate-450 hover:text-slate-750 absolute top-2 right-3 w-4 h-4 text-sm font-bold font-mono cursor-pointer"
              >
                ×
              </button>
            </div>
          )}

          {/* Toast notifications */}
          {errorMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex gap-3 items-center shadow-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
              <p className="flex-1 leading-normal font-medium">{errorMsg}</p>
              <button onClick={clearMessages} className="text-rose-600 font-extrabold font-mono hover:text-rose-800 text-sm cursor-pointer px-1">×</button>
            </div>
          )}
          {successMsg && (
            <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex gap-3 items-center shadow-xs">
              <Sparkles className="w-4 h-4 shrink-0 text-emerald-500" />
              <p className="flex-1 leading-normal font-medium">{successMsg}</p>
              <button onClick={clearMessages} className="text-emerald-600 font-extrabold font-mono hover:text-emerald-800 text-sm cursor-pointer px-1">×</button>
            </div>
          )}

          {/* VIEW RENDERERS */}
          
          {/* 1. AUTH SCREEN VIEW (Unauthenticated State) */}
          {!currentUser ? (
            <div className="py-12 flex flex-col justify-center items-center min-h-[500px]">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center p-4 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4 shadow-lg shadow-indigo-500/20">
                  <Flame className="w-12 h-12 text-white fill-current animate-pulse" />
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 font-sans">BETZ Habit Hub</h2>
                <p className="text-sm text-slate-500 mt-2 max-w-sm">Gamified, Peer-Verified habit tracking with consensus verification.</p>
              </div>

              <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl p-6 shadow-md">
                <div className="flex border-b border-slate-250 mb-6">
                  <button
                    onClick={() => setAuthMode('login')}
                    className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                      authMode === 'login' ? 'text-indigo-650 border-indigo-650' : 'text-slate-400 border-transparent hover:text-slate-600'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => setAuthMode('register')}
                    className={`flex-1 pb-3 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                      authMode === 'register' ? 'text-indigo-650 border-indigo-650' : 'text-slate-400 border-transparent hover:text-slate-600'
                    }`}
                  >
                    Create Account
                  </button>
                </div>

                {authMode === 'login' ? (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-mono font-bold">Username or Email</label>
                      <input
                        type="text"
                        required
                        value={loginTerm}
                        onChange={(e) => setLoginTerm(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="yannick, ryan, nathanael..."
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-mono font-bold">Password</label>
                      <input
                        type="password"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    
                    <button
                      type="submit"
                      className="w-full bg-indigo-650 hover:bg-indigo-600 text-white font-bold text-xs py-3 rounded-xl transition shadow-md mt-4 cursor-pointer"
                    >
                      Enter Habit Arena
                    </button>

                    <div className="pt-4 text-center border-t border-slate-100">
                      <span className="text-[10px] text-slate-450 uppercase font-mono block mb-2 tracking-wider">Quick-choose tester account</span>
                      <div className="flex gap-2 justify-center flex-wrap">
                        {['yannick', 'ryan', 'nathanael'].map((u) => (
                          <button
                            type="button"
                            key={u}
                            onClick={() => selectPreseedLogin(u)}
                            className="px-2.5 py-1 text-[10px] bg-slate-550/10 hover:bg-slate-550/20 text-indigo-700 border border-indigo-100 rounded-lg capitalize font-medium transition"
                          >
                            @{u}
                          </button>
                        ))}
                      </div>
                    </div>
                  </form>
                ) : (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-mono font-bold">Username</label>
                      <input
                        type="text"
                        required
                        value={regUsername}
                        onChange={(e) => setRegUsername(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="habit_master"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-mono font-bold">Email Address</label>
                      <input
                        type="email"
                        required
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="your@email.com"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-mono font-bold">Password</label>
                      <input
                        type="password"
                        required
                        value={regPassword}
                        onChange={(e) => setRegPassword(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    
                    <button
                      type="submit"
                      className="w-full bg-indigo-650 hover:bg-indigo-600 text-white font-bold text-xs py-3 rounded-xl transition shadow-md mt-4 cursor-pointer"
                    >
                      Confirm Pledges & Register
                    </button>
                  </form>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              
              {/* 2. SOCIAL FEED & VERIFICATION PANEL */}
              {activeTab === 'feed' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">Consensus Proof Feed</h2>
                      <p className="text-xs text-slate-500">Evaluate peer habit compliance and vote on evidence</p>
                    </div>
                    <span className="text-[10px] font-mono px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 font-bold">
                      {feed.length} Proof posts
                    </span>
                  </div>

                  {feed.length === 0 ? (
                    <div className="p-16 text-center bg-white rounded-3xl border border-slate-250/70 shadow-sm max-w-xl mx-auto">
                      <Compass className="w-12 h-12 text-slate-350 mx-auto mb-3" />
                      <p className="text-sm font-bold text-slate-800">Proof stream quiet.</p>
                      <p className="text-xs text-slate-450 mt-1 max-w-xs mx-auto">Be the first to perform a habit check-in under the File Proof page!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                      {feed.map((chk) => {
                        const hasVotedApprove = chk.votes.some(v => v.verifier_id === currentUser.id && v.vote === 'APPROVE');
                        const hasVotedDispute = chk.votes.some(v => v.verifier_id === currentUser.id && v.vote === 'DISPUTED');
                        const isOwnCheckin = chk.user_id === currentUser.id;

                        let statusBadgeColor = 'bg-slate-100 text-slate-700 border border-slate-200';
                        if (chk.status === 'VERIFIED') statusBadgeColor = 'bg-emerald-50 text-emerald-700 border border-emerald-150';
                        if (chk.status === 'DISPUTED') statusBadgeColor = 'bg-rose-50 text-rose-700 border border-rose-150';

                        return (
                          <div key={chk.id} className="bg-white border border-slate-200 rounded-3xl overflow-hidden hover:border-indigo-200 transition-all hover:shadow-md flex flex-col justify-between shadow-xs">
                            
                            <div>
                              {/* Header details */}
                              <div className="p-4 bg-slate-50/70 flex items-center justify-between border-b border-slate-150">
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="w-8 h-8 rounded-full bg-indigo-650 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs shrink-0">
                                    {chk.username?.slice(0, 2)}
                                  </div>
                                  <div className="min-w-0">
                                    <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 truncate">
                                      @{chk.username}
                                      {isOwnCheckin && <span className="text-[9px] bg-slate-250 text-slate-650 px-1.5 py-0.5 rounded-sm font-normal">You</span>}
                                    </span>
                                    <p className="text-[10px] text-slate-500 font-semibold truncate leading-none mt-0.5">{chk.challenge_title}</p>
                                  </div>
                                </div>
                                <span className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded-md font-semibold shrink-0 ${statusBadgeColor}`}>
                                  {chk.status === 'PENDING_VERIFICATION' ? 'PENDING' : chk.status}
                                </span>
                              </div>

                              {/* Physical Proof Media Display */}
                              <div className="relative aspect-video bg-slate-100 border-b border-slate-150">
                                <img 
                                  src={chk.media_url} 
                                  alt="Habit Proof" 
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                  crossOrigin="anonymous"
                                />
                                <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-xs px-2 py-0.5 rounded-lg text-[9px] text-white font-mono font-medium">
                                  Offset: {chk.timezone_offset}m
                                </div>
                              </div>

                              {/* Card Content body */}
                              <div className="p-4 space-y-3">
                                <p className="text-xs text-slate-700 leading-relaxed min-h-12 font-medium">
                                  {chk.text_proof || 'Submitted proof without annotations.'}
                                </p>

                                <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-100 pt-2 font-mono">
                                  <span>Posted {new Date(chk.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                  <span>Votes: {chk.votes.length}</span>
                                </div>

                                {/* Peer voters ledger */}
                                {chk.votes.length > 0 && (
                                  <div className="bg-slate-50 p-2.5 rounded-xl text-[10px] font-mono text-slate-600 border border-slate-200/50 space-y-1">
                                    <span className="font-bold text-slate-450 uppercase tracking-wider text-[8px] block">Consensus Votes</span>
                                    <div className="divide-y divide-slate-100">
                                      {chk.votes.map((v) => (
                                        <div key={v.id} className="flex justify-between py-0.5">
                                          <span className="text-slate-500">@{v.verifier_username}:</span>
                                          <span className={v.vote === 'APPROVE' ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>{v.vote}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Voting Bar Footer */}
                            <div className="p-4 pt-0">
                              {isOwnCheckin ? (
                                <div className="text-center p-2 rounded-xl bg-slate-50 text-[10px] text-indigo-700 font-mono border border-slate-200/50">
                                  🛡️ You cannot vote on your own check-ins.
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                                  <button
                                    onClick={() => handleCastVote(chk.id, 'APPROVE')}
                                    disabled={hasVotedApprove || hasVotedDispute}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                                      hasVotedApprove 
                                        ? 'bg-slate-100 text-emerald-600 border border-emerald-200 cursor-not-allowed' 
                                        : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm'
                                    }`}
                                  >
                                    <Check className="w-4 h-4" />
                                    {hasVotedApprove ? 'Approved' : 'Approve'}
                                  </button>

                                  <button
                                    onClick={() => handleCastVote(chk.id, 'DISPUTED')}
                                    disabled={hasVotedApprove || hasVotedDispute}
                                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                                      hasVotedDispute 
                                        ? 'bg-slate-100 text-rose-600 border border-rose-200 cursor-not-allowed' 
                                        : 'bg-white hover:bg-slate-50 border border-slate-250 text-slate-700'
                                    }`}
                                  >
                                    <X className="w-4 h-4" />
                                    {hasVotedDispute ? 'Contested' : 'Dispute'}
                                  </button>
                                </div>
                              )}
                            </div>

                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* 3. ACTIVE CHALLENGES DIRECTORY */}
              {activeTab === 'challenges' && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">Habit Arena</h2>
                    <p className="text-xs text-slate-500">Sign active commitments or declare a new habit pledge</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Declaration form */}
                    <div className="lg:col-span-4 bg-white p-5 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                      <h3 className="text-sm font-extrabold text-slate-950 flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-indigo-650" /> Declare Habit Pledge
                      </h3>
                      <form onSubmit={handleCreateChallenge} className="space-y-3">
                        <div>
                          <label className="block text-[10px] text-slate-450 uppercase font-mono tracking-wider mb-1 font-bold">Challenge Title</label>
                          <input 
                            type="text" 
                            placeholder="e.g. Drink 3 Liters Water" 
                            required 
                            value={newTitle}
                            onChange={(e) => setNewTitle(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-205 rounded-xl p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-[10px] text-slate-450 uppercase font-mono tracking-wider mb-1 font-bold">Guidelines / Rules</label>
                          <input 
                            type="text" 
                            placeholder="photo of water bottle checklist..." 
                            value={newDesc}
                            onChange={(e) => setNewDesc(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-205 rounded-xl p-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="block text-[10px] text-slate-450 uppercase font-mono tracking-wider mb-1 font-bold">Frequency</label>
                            <select
                              value={newFrequency}
                              onChange={(e: any) => setNewFrequency(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-205 rounded-xl p-2.5 text-xs text-slate-700 focus:outline-none"
                            >
                              <option value="DAILY">DAILY</option>
                              <option value="WEEKLY">WEEKLY</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-[10px] text-slate-450 uppercase font-mono tracking-wider mb-1 font-bold">Duration (Days)</label>
                            <input 
                              type="number" 
                              required 
                              value={newDuration}
                              onChange={(e) => setNewDuration(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-205 rounded-xl p-2.5 text-xs text-slate-900 focus:outline-none"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          className="w-full bg-indigo-650 hover:bg-indigo-600 font-bold text-xs py-2.5 rounded-xl shadow-sm text-white transition uppercase mt-2 cursor-pointer"
                        >
                          Deploy Habit Pledge
                        </button>
                      </form>
                    </div>

                    {/* Challenges list */}
                    <div className="lg:col-span-8 space-y-4">
                      <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest">Available Contracts</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {challenges.map((c) => {
                          const isJoined = userChallenges.some(uc => uc.challenge_id === c.id);
                          
                          return (
                            <div key={c.id} className="p-4 bg-white border border-slate-200 hover:border-slate-300 transition-all rounded-2xl flex flex-col justify-between gap-3 shadow-xs">
                              <div>
                                <div className="flex justify-between items-start gap-2">
                                  <h4 className="text-sm font-extrabold text-slate-900 truncate">{c.title}</h4>
                                  <span className="px-2 py-0.5 bg-indigo-50 border border-indigo-100 rounded-md text-indigo-750 text-[9px] font-mono font-bold uppercase shrink-0">
                                    {c.frequency}
                                  </span>
                                </div>
                                <p className="text-xs text-slate-600 mt-1 line-clamp-2 min-h-8">{c.description || 'No custom guidelines provided.'}</p>
                                
                                <div className="flex items-center gap-2 mt-3 text-[10px] font-mono text-slate-500">
                                  <span className="text-indigo-600 font-bold">{c.duration_days} Days span</span>
                                  <span>•</span>
                                  <span>Creator: <b className="text-emerald-700 font-semibold">@{c.creator_username || 'system'}</b></span>
                                </div>
                              </div>

                              <div className="pt-2 border-t border-slate-100 mt-1">
                                {isJoined ? (
                                  <span className="w-full inline-flex justify-center items-center py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold uppercase rounded-xl">
                                    Signed & Active
                                  </span>
                                ) : (
                                  <button
                                    onClick={() => handleJoinChallenge(c.id)}
                                    className="w-full bg-indigo-650 hover:bg-indigo-600 text-white py-1.5 font-bold text-[10px] uppercase rounded-xl transition cursor-pointer"
                                  >
                                    Sign Commitment Contract
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* 4. PROOF SUBMISSION GATE */}
              {activeTab === 'submit' && (
                <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 font-sans">Log Habit Proof</h2>
                    <p className="text-xs text-slate-500 font-sans">Submit photographic evidence of your habit execution for peer review</p>
                  </div>

                  <form onSubmit={handleSubmitCheckin} className="bg-white border border-slate-200 p-6 rounded-3xl space-y-5 shadow-sm">
                    {/* Select challenge check-ins */}
                    <div>
                      <label className="block text-[10px] text-slate-500 font-mono tracking-wider mb-1 uppercase font-bold">Target Challenge Contract</label>
                      <select
                        value={selectedChallengeToSubmit}
                        onChange={(e) => setSelectedChallengeToSubmit(e.target.value)}
                        required
                        className="w-full bg-slate-50 border border-slate-205 text-xs text-slate-800 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="">-- CHOOSE SIGNED CONTRACT --</option>
                        {userChallenges
                          .filter(uc => uc.status === 'ACTIVE')
                          .map(uc => (
                            <option key={uc.challenge_id} value={uc.challenge_id} className="text-slate-800">
                              {uc.challenge_title || uc.challenge_id}
                            </option>
                          ))}
                      </select>
                      {userChallenges.length === 0 && (
                        <p className="text-[10px] text-rose-600 font-medium mt-1">You must sign and enter habit challenges under the Arena page first.</p>
                      )}
                    </div>

                    {/* Pre-seeded presets */}
                    <div>
                      <span className="block text-[10px] text-slate-500 tracking-wider font-mono uppercase mb-2 font-bold">Preseeded Demo Photographic Templates</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {HABIT_PRESETS.map((preset) => (
                          <button
                            type="button"
                            key={preset.name}
                            onClick={() => handleApplyPreset(preset)}
                            className="p-2 text-left text-[10px] bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-xl border border-slate-205 flex items-center justify-between transition-colors cursor-pointer"
                          >
                            <span className="truncate max-w-28 font-medium">{preset.name}</span>
                            <Camera className="w-3.5 h-3.5 text-indigo-650 shrink-0" />
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Image URL input */}
                    <div>
                      <label className="block text-[10px] text-slate-500 font-mono tracking-wider uppercase mb-1 font-bold">Proof Image URL</label>
                      <input
                        type="text"
                        required
                        value={customMediaUrl}
                        onChange={(e) => setCustomMediaUrl(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-205 text-xs text-slate-900 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="https://images.unsplash.com/... or apply a template preset above"
                      />
                    </div>

                    {/* Custom note */}
                    <div>
                      <label className="block text-[10px] text-slate-500 font-mono tracking-wider uppercase mb-1 font-bold">Personal Annotations & Verification Notes</label>
                      <textarea
                        value={customTextProof}
                        onChange={(e) => setCustomTextProof(e.target.value)}
                        rows={3}
                        className="w-full bg-slate-50 border border-slate-205 text-xs text-slate-900 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        placeholder="Explain your proof or share details about your goal achievement..."
                      />
                    </div>

                    {/* Timezone offset and mock device attributes */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] text-slate-500 font-mono mb-1 font-bold uppercase">Timezone Offset (Minutes)</label>
                        <input 
                          type="number" 
                          value={timezoneOffset}
                          onChange={(e) => setTimezoneOffset(Number(e.target.value))}
                          className="w-full bg-slate-50 border border-slate-205 p-3 rounded-xl text-xs text-slate-900 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500 font-mono mb-1 font-bold uppercase">Device GPS Status</label>
                        <div className="p-3 bg-emerald-50 border border-emerald-150 rounded-xl text-xs text-emerald-700 font-mono font-bold flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-emerald-600" />
                          <span>GPS Tracker Active</span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isUploading || userChallenges.length === 0}
                      className="w-full bg-indigo-650 hover:bg-indigo-600 text-white font-bold py-3 text-xs rounded-xl shadow-md cursor-pointer flex items-center justify-center gap-2 uppercase tracking-wider transition"
                    >
                      {isUploading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Compiling Assets & GPS Metadata...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Transmit Proof to Consensus Review
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}

              {/* 5. LEADERBOARD & STREAK HALL OF FAME */}
              {activeTab === 'rank' && (
                <div className="space-y-6 animate-fade-in font-sans">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                      <Award className="w-6 h-6 text-amber-500" /> Leaderboard Hall of Fame
                    </h2>
                    <p className="text-xs text-slate-500">Global rankings of active habit streaks and total scores</p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    
                    {/* Standings table */}
                    <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl overflow-hidden divide-y divide-slate-100 shadow-sm">
                      <div className="p-4 bg-slate-50/70 grid grid-cols-12 gap-2 text-[10px] font-mono font-bold text-slate-400 uppercase tracking-widest">
                        <div className="col-span-2 text-center">Rank</div>
                        <div className="col-span-5">Challenger</div>
                        <div className="col-span-3 text-center">Streak</div>
                        <div className="col-span-2 text-right">Score</div>
                      </div>
                      
                      {leaderboard.map((u, i) => {
                        const isSelf = u.id === currentUser.id;
                        let rankBadge = `${i + 1}`;
                        let rankColor = 'bg-slate-100 text-slate-650';
                        if (i === 0) { rankBadge = '🥇'; rankColor = 'bg-amber-50 border border-amber-200/50 text-amber-800'; }
                        if (i === 1) { rankBadge = '🥈'; rankColor = 'bg-slate-550/10 border border-slate-250 text-slate-700'; }
                        if (i === 2) { rankBadge = '🥉'; rankColor = 'bg-orange-50 border border-orange-100 text-orange-850'; }

                        return (
                          <div 
                            key={u.id} 
                            className={`p-4 grid grid-cols-12 gap-2 items-center transition ${
                              isSelf ? 'bg-indigo-50/40 shadow-inner' : 'hover:bg-slate-50/40'
                            }`}
                          >
                            <div className="col-span-2 flex justify-center">
                              <span className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-extrabold ${rankColor}`}>
                                {rankBadge}
                              </span>
                            </div>
                            
                            <div className="col-span-5 min-w-0">
                              <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 truncate">
                                @{u.username}
                                {isSelf && <span className="text-[9px] bg-indigo-650 text-white px-2 py-0.5 rounded-sm lowercase font-mono">me</span>}
                              </span>
                              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 mt-0.5">
                                <span>Pledges: {u.joined_challenges}</span>
                                <span>•</span>
                                <span>Max: {u.max_streak}d</span>
                              </div>
                            </div>

                            <div className="col-span-3 flex justify-center">
                              <AnimatedStreak streak={u.active_streak} />
                            </div>

                            <div className="col-span-2 text-right">
                              <div className="text-sm font-extrabold text-indigo-650 font-mono">{u.total_xp}</div>
                              <div className="text-[8px] text-slate-400 font-mono uppercase">XP</div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Stats panel card */}
                    <div className="lg:col-span-4 bg-gradient-to-br from-indigo-900 to-indigo-950 text-white p-6 rounded-3xl shadow-md space-y-4">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-indigo-400" />
                        <h3 className="text-sm font-bold font-mono tracking-widest uppercase">Arena Regulations</h3>
                      </div>
                      <p className="text-xs text-indigo-200 leading-relaxed">
                        streaks require verification proof submitted daily. Failure to upload valid, physical proof within your 24h cycle will break the active streak. Peer evaluations of DISPUTED by consensus will invalidate proof checkins.
                      </p>
                      <div className="h-px bg-indigo-800" />
                      <div className="space-y-2 text-xs font-mono">
                        <div className="flex justify-between">
                          <span className="text-indigo-400">Total Challengers:</span>
                          <span>{leaderboard.length} Active</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-indigo-400">Leader Streak Peak:</span>
                          <span>{Math.max(...leaderboard.map(u => u.active_streak), 0)} Days</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* 6. USER PROFILE & ENROLLMENT SHEET */}
              {activeTab === 'profile' && (
                <div className="space-y-6 animate-fade-in max-w-4xl mx-auto">
                  <div>
                    <h2 className="text-xl font-extrabold text-slate-900">Challenger Hub</h2>
                    <p className="text-xs text-slate-500">Overview of your active pledge sheets and total level progress</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* User profile card */}
                    <div className="md:col-span-1 bg-white border border-slate-205 p-5 rounded-3xl flex flex-col items-center text-center shadow-sm space-y-4">
                      <div className="w-16 h-16 rounded-full bg-indigo-650 text-white flex items-center justify-center font-black text-xl shadow-md border-4 border-indigo-50">
                        {currentUser.username.slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-base font-extrabold text-slate-900 flex items-center justify-center gap-1">
                          @{currentUser.username}
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        </h3>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{currentUser.email}</p>
                      </div>
                      <div className="w-full bg-indigo-50 border border-indigo-100 rounded-xl p-3 text-center">
                        <span className="text-indigo-750 font-mono font-bold text-sm block">{currentUser.total_xp}</span>
                        <span className="text-[8px] text-indigo-500 font-bold uppercase font-mono tracking-wider">Total Experience XP</span>
                      </div>
                    </div>

                    {/* Pledge list */}
                    <div className="md:col-span-2 space-y-3">
                      <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-widest px-1">My Active Commitments</h3>

                      {userChallenges.length === 0 ? (
                        <div className="p-10 bg-white rounded-3xl border border-dashed border-slate-250 text-center text-xs text-slate-500 shadow-sm">
                          No active enrollments found. Sign commitments in the Habit Arena to establish streaks!
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {userChallenges.map((uc) => (
                            <div key={uc.challenge_id} className="p-4 bg-white border border-slate-205 rounded-2xl shadow-xs flex flex-col justify-between space-y-3">
                              <div>
                                <div className="flex justify-between items-start gap-2">
                                  <h4 className="text-xs font-bold text-slate-900 leading-snug">{uc.challenge_title || 'Contract Frame'}</h4>
                                  <span className="px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-150 text-emerald-700 font-mono text-[8px] uppercase font-bold shrink-0">
                                    {uc.status}
                                  </span>
                                </div>
                                <p className="text-[10px] font-mono text-slate-500 mt-1 leading-none">
                                  {uc.challenge_frequency} • {uc.challenge_duration} Days Cycle
                                </p>
                              </div>

                              <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3 font-mono text-[11px]">
                                <div className="flex items-center gap-1">
                                  <Flame className="w-4 h-4 text-orange-500 fill-current" />
                                  <span className="text-slate-600">Streak: <b className="text-amber-650 font-bold">{uc.current_streak}d</b></span>
                                </div>
                                <div className="text-right text-slate-400">
                                  <span>Peak: <b>{uc.max_streak}d</b></span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* 7. SANDBOX CONTROL PANEL VIEW (Integrated Dev tools) */}
              {activeTab === 'sandbox' && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                        <Cpu className="w-5 h-5 text-indigo-650 animate-spin" />
                        BETZ Sandbox Engine Control
                      </h2>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">Host: http://localhost:3000 | PostgreSQL Relational Model</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleTriggerClockReset}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl shadow-sm transition cursor-pointer"
                        title="Runs the midnight sweeper validating proof deadlines and resetting broken streaks"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        Midnight Sweeper
                      </button>
                      <button
                        onClick={handleResetSandbox}
                        className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-205 rounded-xl shadow-xs transition cursor-pointer"
                        title="Re-seed back to default values"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Re-Seed DB
                      </button>
                    </div>
                  </div>

                  {/* Impersonation quick selection */}
                  <div className="p-4 bg-white border border-slate-205 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
                    <span className="text-xs font-bold text-slate-555">Client Identity Switcher:</span>
                    <div className="flex items-center gap-2">
                      {['yannick', 'ryan', 'nathanael'].map((name) => (
                        <button
                          key={name}
                          onClick={() => handleQuickSwitchUser(name)}
                          className={`px-3 py-1.5 text-xs rounded-lg font-mono transition-all capitalize cursor-pointer ${
                            currentUser?.username === name 
                              ? 'bg-indigo-600 text-white font-bold shadow-sm' 
                              : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100 hover:text-slate-805'
                          }`}
                        >
                          @{name}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Tabs select */}
                  <div className="flex border-b border-slate-200">
                    <button
                      onClick={() => setSandboxTab('terminal')}
                      className={`flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold border-b-2 font-mono transition cursor-pointer ${
                        sandboxTab === 'terminal' ? 'text-indigo-650 border-indigo-650' : 'text-slate-400 border-transparent hover:text-slate-650'
                      }`}
                    >
                      <Terminal className="w-4 h-4" />
                      Live Logs Console
                    </button>
                    <button
                      onClick={() => setSandboxTab('database')}
                      className={`flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold border-b-2 font-mono transition cursor-pointer ${
                        sandboxTab === 'database' ? 'text-indigo-650 border-indigo-650' : 'text-slate-400 border-transparent hover:text-slate-650'
                      }`}
                    >
                      <Database className="w-4 h-4" />
                      PostgreSQL Database Tables
                    </button>
                  </div>

                  {/* Output content box */}
                  <div className="bg-slate-950 rounded-3xl p-5 font-mono text-[11px] text-slate-300 min-h-[400px] shadow-inner">
                    {sandboxTab === 'terminal' ? (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-900 pb-2.5 mb-3">
                          <span className="text-slate-500 font-bold uppercase tracking-widest text-[9px]">Ingress Transaction Log Stream</span>
                          <button 
                            onClick={handleClearLogs}
                            className="text-[10px] text-slate-400 hover:text-rose-400 hover:underline cursor-pointer"
                          >
                            Clear Stream Output
                          </button>
                        </div>

                        {logs.length === 0 ? (
                          <p className="text-slate-500 italic">No incoming logs detected. Submit check-ins or vote in the feed to trigger logs.</p>
                        ) : (
                          <div className="space-y-2 max-h-[450px] overflow-y-auto pr-2">
                            {logs.map((log) => (
                              <div key={log.id} className="flex items-start gap-3 hover:bg-slate-900/60 p-1.5 rounded-lg transition-colors">
                                <span className="text-slate-500 text-[10px] select-none shrink-0 w-16">
                                  {new Date(log.timestamp).toLocaleTimeString()}
                                </span>
                                <span className={`px-2 py-0.5 rounded text-[8px] bg-slate-900 uppercase font-bold tracking-wider shrink-0 ${
                                  log.type === 'SUCCESS' ? 'text-emerald-400 border border-emerald-950' :
                                  log.type === 'ERROR' ? 'text-rose-400 border border-rose-950' : 'text-slate-450'
                                }`}>
                                  {log.type}
                                </span>
                                <span className={`flex-1 break-all leading-normal ${getLogTypeColor(log.type)}`}>
                                  {log.message}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="bg-white -m-5 p-5 rounded-3xl text-slate-800">
                        {/* Table selector buttons */}
                        <div className="flex flex-wrap items-center gap-2 mb-4 border-b border-slate-100 pb-3">
                          {(['users', 'challenges', 'user_challenges', 'check_ins', 'verifications'] as const).map((tbl) => (
                            <button
                              key={tbl}
                              onClick={() => setSelectedDbTable(tbl)}
                              className={`px-3 py-1.5 text-[10px] rounded-lg transition cursor-pointer font-bold ${
                                selectedDbTable === tbl 
                                  ? 'bg-indigo-50 text-indigo-750 border border-indigo-200' 
                                  : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100 hover:text-slate-705'
                              }`}
                            >
                              {tbl}
                            </button>
                          ))}
                        </div>

                        {/* Interactive database grid */}
                        <div className="overflow-x-auto border border-slate-200 rounded-xl shadow-inner max-h-[450px]">
                          {renderDbGrid(selectedDbTable, dbState)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          )}

        </main>
      </div>

      {/* Persistent Bottom Tab bar (Mobile Viewports Only) */}
      {currentUser && (
        <div className="md:hidden bg-white border-t border-slate-200 px-3 py-2 pb-5 flex items-center justify-around text-slate-400 sticky bottom-0 z-50">
          {[
            { id: 'feed', label: 'Feed', icon: Compass },
            { id: 'challenges', label: 'Arena', icon: ListFilter },
            { id: 'submit', label: 'Proof', icon: PlusCircle },
            { id: 'rank', label: 'Leaderboard', icon: Award },
            { id: 'profile', label: 'Hub', icon: UserIcon },
            { id: 'sandbox', label: 'Admin', icon: Cpu },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id as any)}
                className={`flex flex-col items-center gap-0.5 cursor-pointer transition-colors ${
                  activeTab === t.id ? 'text-indigo-650 font-bold font-semibold' : 'hover:text-slate-700'
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                <span className="text-[9px] font-medium font-sans">{t.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Footer bar */}
      <footer className="h-12 bg-slate-900 text-slate-500 text-[10px] flex items-center px-6 justify-between mt-8 border-t border-slate-800">
        <div className="flex gap-4">
          <span>© 2026 BETZ</span>
          <span className="opacity-40 font-mono">v2.4.0-stable</span>
        </div>
        <div className="flex gap-4 hidden sm:flex">
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> REST API GATEWAY</span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> LOCAL STORAGE INDEX</span>
        </div>
      </footer>

    </div>
  );
}

// Inline DB Grid renderer
function renderDbGrid(tableName: string, db: any) {
  const data = db[tableName] || [];

  if (data.length === 0) {
    return (
      <div className="p-8 text-center text-slate-400 italic text-xs font-sans bg-white">
        Null set. Table currently contains 0 records.
      </div>
    );
  }

  const headers = Object.keys(data[0]);

  return (
    <table className="w-full border-collapse text-left text-[11px] bg-white">
      <thead>
        <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 font-bold">
          {headers.map((h) => (
            <th key={h} className="p-3 py-2 font-bold tracking-tight border-r border-slate-150 whitespace-nowrap">
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-100">
        {data.map((row: any, i: number) => (
          <tr key={i} className="hover:bg-slate-50/50 text-slate-650 transition-colors">
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

              const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(displayVal);
              const isCustomId = displayVal.startsWith('usr-') || displayVal.startsWith('ch-') || displayVal.startsWith('chk-') || displayVal.startsWith('v-');
              const isTimestamp = displayVal.includes('T') && displayVal.endsWith('Z');

              let displayStyle = '';
              if (displayVal === 'NULL') {
                displayStyle = 'text-slate-400 italic';
              } else if (h === 'total_xp') {
                displayStyle = 'text-indigo-650 font-bold';
              } else if (h === 'current_streak' && Number(val) > 0) {
                displayStyle = 'text-amber-600 font-bold';
              } else if (row.status === 'ACTIVE' && h === 'status') {
                displayStyle = 'text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-bold';
              } else if (row.status === 'VERIFIED' && h === 'status') {
                displayStyle = 'text-emerald-750 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 font-bold';
              } else if (row.status === 'DISPUTED' && h === 'status') {
                displayStyle = 'text-rose-750 bg-rose-50 px-2 py-0.5 rounded border border-rose-100 font-bold';
              } else if (isUuid || isCustomId) {
                displayStyle = 'text-indigo-700 font-mono';
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
  );
}
