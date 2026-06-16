import React, { useState, useEffect, useRef } from 'react';
import { User, Challenge, UserChallenge, CheckIn, Verification } from '../types.js';
import { 
  Flame, Award, PlusCircle, CheckCircle, Navigation, 
  MapPin, ShieldCheck, Heart, Trash, Compass, User as UserIcon, ListFilter,
  Check, X, Camera, Send, BellRing, Sparkles, AlertCircle, RefreshCw
} from 'lucide-react';

interface PhoneEmulatorProps {
  currentUser: {
    id: string;
    username: string;
    email: string;
    total_xp: number;
  } | null;
  challenges: Challenge[];
  feed: (CheckIn & { votes: Verification[] })[];
  userChallenges: any[];
  leaderboard: any[];
  onRegister: (form: any) => Promise<void>;
  onLogin: (form: any) => Promise<void>;
  onJoinChallenge: (challengeId: string) => void;
  onCreateChallenge: (form: any) => Promise<void>;
  onSubmitCheckin: (challengeId: string, form: any) => Promise<void>;
  onCastVote: (checkInId: string, vote: 'APPROVE' | 'DISPUTED') => void;
  onLogout: () => void;
}

// Preseeded beautiful habit proof images for instant beautiful demo simulation clicks
const HABIT_PRESETS = [
  {
    name: 'Hydration Flask',
    imageUrl: 'https://images.unsplash.com/photo-1548839133-9ac084fa0a0a?auto=format&fit=crop&q=80&w=600',
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
          isIncrementing ? 'scale-125 text-orange-600' : 'text-amber-600'
        }`}
      >
        <Flame 
          className={`w-4 h-4 fill-current transition-all duration-300 ${
            isIncrementing 
              ? 'text-red-500 scale-125 rotate-12 drop-shadow-[0_0_8px_rgba(249,115,22,0.85)]' 
              : 'text-orange-500 animate-pulse'
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

export default function PhoneEmulator({
  currentUser,
  challenges,
  feed,
  userChallenges,
  leaderboard,
  onRegister,
  onLogin,
  onJoinChallenge,
  onCreateChallenge,
  onSubmitCheckin,
  onCastVote,
  onLogout
}: PhoneEmulatorProps) {
  // Navigation
  const [activeTab, setActiveTab] = useState<'feed' | 'challenges' | 'submit' | 'rank' | 'profile'>('feed');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  
  // Forms state
  const [regUsername, setRegUsername] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('123456');
  
  const [loginTerm, setLoginTerm] = useState('yannick'); // Predef for easier testing click
  const [loginPassword, setLoginPassword] = useState('123456');

  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDuration, setNewDuration] = useState('14');
  const [newFrequency, setNewFrequency] = useState<'DAILY' | 'WEEKLY'>('DAILY');

  const [selectedChallengeToSubmit, setSelectedChallengeToSubmit] = useState('');
  const [customMediaUrl, setCustomMediaUrl] = useState('');
  const [customTextProof, setCustomTextProof] = useState('');
  const [timezoneOffset, setTimezoneOffset] = useState(-240); // -240 equals UTC-4 / EST
  const [isUploading, setIsUploading] = useState(false);

  // App notification banner dismissal
  const [showNotificationAlert, setShowNotificationAlert] = useState(true);

  // Error/Success state
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const clearMessages = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  const wrapSubmit = async (fn: () => Promise<void>) => {
    clearMessages();
    try {
      await fn();
    } catch (err: any) {
      setErrorMsg(err.message || 'Operation failed');
    }
  };

  const handleApplyPreset = (preset: typeof HABIT_PRESETS[0]) => {
    setCustomMediaUrl(preset.imageUrl);
    setCustomTextProof(preset.text);
    setSuccessMsg(`Preset "${preset.name}" applied successfully.`);
  };

  const handleFormRegister = (e: React.FormEvent) => {
    e.preventDefault();
    wrapSubmit(async () => {
      await onRegister({ username: regUsername, email: regEmail, password: regPassword });
      setSuccessMsg('Pledge established! Registered successfully.');
      setActiveTab('feed');
    });
  };

  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    wrapSubmit(async () => {
      await onLogin({ usernameOrEmail: loginTerm, password: loginPassword });
      setSuccessMsg('Successfully entered habit server hub.');
      setActiveTab('feed');
    });
  };

  const handleFormCreateChallenge = (e: React.FormEvent) => {
    e.preventDefault();
    wrapSubmit(async () => {
      await onCreateChallenge({
        title: newTitle,
        description: newDesc,
        duration_days: Number(newDuration),
        frequency: newFrequency,
        start_date: new Date().toISOString()
      });
      setSuccessMsg(`Challenge "${newTitle}" created & auto-joined!`);
      setNewTitle('');
      setNewDesc('');
      setNewDuration('14');
      setActiveTab('challenges');
    });
  };

  const handleFormSubmitProof = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChallengeToSubmit) {
      setErrorMsg('Choose target challenge to file proof.');
      return;
    }
    if (!customMediaUrl) {
      setErrorMsg('Proof media upload is an absolute game requirement.');
      return;
    }
    
    setIsUploading(true);
    // Simulate AWS-S3/Client compression delays (300ms) for high sensory fidelity
    setTimeout(() => {
      wrapSubmit(async () => {
        await onSubmitCheckin(selectedChallengeToSubmit, {
          media_url: customMediaUrl,
          text_proof: customTextProof,
          timezone_offset: Number(timezoneOffset)
        });
        setSuccessMsg('Physical proof propagated to feeds! Awaiting consensus approvals.');
        setCustomMediaUrl('');
        setCustomTextProof('');
        setActiveTab('feed');
        setIsUploading(false);
      });
    }, 400);
  };

  const selectPreseedLogin = (uname: string) => {
    setLoginTerm(uname);
    setLoginPassword('123456');
  };

  return (
    <div className="relative mx-auto w-[360px] h-[720px] rounded-[48px] border-[12px] border-slate-900 bg-slate-800 shadow-xl flex flex-col overflow-hidden ring-4 ring-indigo-500/10">
      
      {/* Phone Header notch & camera lens */}
      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-40 h-5 bg-slate-0 w-32 rounded-b-2xl z-50 flex items-center justify-around px-4">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
        <span className="w-12 h-1 bg-slate-800 rounded-full" />
        <span className="w-2.5 h-2.5 rounded-full bg-indigo-950 border border-slate-700" />
      </div>

      {/* Internal Phone Status Bar */}
      <div className="bg-white pt-6 px-5 pb-1 flex justify-between items-center text-[10px] font-medium text-slate-500 font-mono select-none border-b border-slate-100">
        <span className="text-slate-800 font-bold">09:41 AM</span>
        <div className="flex items-center gap-1.5">
          <span className="text-[9px] text-indigo-600 font-bold bg-indigo-50 px-1 rounded border border-indigo-100">5G</span>
          <span className="w-3.5 h-2 rounded bg-emerald-500 border border-slate-205" />
        </div>
      </div>

      {/* Custom app alerts/banners for deadlining & streak warnings */}
      {currentUser && showNotificationAlert && (
        <div className="bg-amber-50 border-b border-amber-200 p-2.5 px-3 flex items-start gap-2 relative transition">
          <BellRing className="w-4 h-4 text-amber-500 shrink-0 mt-0.5 animate-bounce" />
          <div className="text-[10px] text-slate-700">
            <span className="font-bold text-amber-950">Streak Deadline Alarm:</span> Complete check-ins within 4 hours to preserve your active streaks!
          </div>
          <button 
            onClick={() => setShowNotificationAlert(false)} 
            className="text-slate-400 hover:text-slate-700 absolute top-1 right-2 w-4 h-4 text-xs font-bold font-mono cursor-pointer"
          >
            ×
          </button>
        </div>
      )}

      {/* Screen viewports */}
      <div className="flex-1 overflow-y-auto px-4 py-4 bg-slate-50">
        
        {/* Error / Success alert toast container */}
        {errorMsg && (
          <div className="mb-3 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex gap-2 items-center shadow-xs">
            <AlertCircle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
            <p className="flex-1 leading-tight">{errorMsg}</p>
            <button onClick={clearMessages} className="text-rose-600 font-bold font-mono hover:text-rose-800 cursor-pointer">×</button>
          </div>
        )}
        {successMsg && (
          <div className="mb-3 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex gap-2 items-center shadow-xs">
            <Sparkles className="w-3.5 h-3.5 shrink-0 text-emerald-500" />
            <p className="flex-1 leading-tight">{successMsg}</p>
            <button onClick={clearMessages} className="text-emerald-600 font-bold font-mono hover:text-emerald-800 cursor-pointer">×</button>
          </div>
        )}

        {/* 1. AUTH SCREEN VIEW */}
        {!currentUser ? (
          <div className="py-6 flex flex-col justify-center min-h-[500px]">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center p-3.5 rounded-3xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-3 shadow-lg shadow-indigo-500/20">
                <Flame className="w-10 h-10 text-white fill-current animate-pulse" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white font-sans">BETZ</h1>
              <p className="text-xs text-slate-400 mt-1">Gamified Peer-Verified Habit Challenges</p>
            </div>

            {authMode === 'login' ? (
              <form onSubmit={handleFormLogin} className="space-y-3 p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <h3 className="text-xs font-mono font-semibold text-indigo-400 tracking-wider uppercase">Sign In</h3>
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-mono">Username or Email</label>
                  <input
                    type="text"
                    required
                    value={loginTerm}
                    onChange={(e) => setLoginTerm(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                    placeholder="yannick, ryan, nathanael..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-mono">Password</label>
                  <input
                    type="password"
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2 rounded-lg transition shadow-md mt-3 cursor-pointer"
                >
                  Enter Arena
                </button>

                <div className="pt-2 text-center">
                  <span className="text-[10px] text-slate-500">Quick-choose tester account:</span>
                  <div className="flex gap-1 justify-center mt-1.5 flex-wrap">
                    {['yannick', 'ryan', 'nathanael'].map((u) => (
                      <button
                        type="button"
                        key={u}
                        onClick={() => selectPreseedLogin(u)}
                        className="px-2 py-0.5 text-[9px] bg-slate-950 hover:bg-slate-800 text-indigo-400 border border-slate-850 rounded capitalize"
                      >
                        @{u}
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 text-center pt-2">
                  No account?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('register')}
                    className="text-indigo-400 hover:underline font-bold"
                  >
                    Register new profile
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={handleFormRegister} className="space-y-3 p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                <h3 className="text-xs font-mono font-semibold text-indigo-400 tracking-wider uppercase">Create Account</h3>
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-mono">Username</label>
                  <input
                    type="text"
                    required
                    value={regUsername}
                    onChange={(e) => setRegUsername(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                    placeholder="habit_warrior"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-mono">Email</label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 font-mono"
                    placeholder="your@email.com"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-mono">Password (Min 6 chars)</label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs text-white focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs py-2 rounded-lg transition shadow-md mt-2 cursor-pointer"
                >
                  Confirm Pledges
                </button>
                <p className="text-[10px] text-slate-400 text-center pt-2">
                  Already registered?{' '}
                  <button
                    type="button"
                    onClick={() => setAuthMode('login')}
                    className="text-indigo-400 hover:underline font-bold"
                  >
                    Login here
                  </button>
                </p>
              </form>
            )}
          </div>
        ) : (
          <div>
            {/* 2. SOCIAL FEED & VERIFICATION PANEL */}
            {activeTab === 'feed' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 tracking-tight">Consensus Proof Feed</h2>
                    <p className="text-[10px] text-slate-500">Evaluate peer habit compliance</p>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-650 font-semibold">
                    {feed.length} Active entries
                  </span>
                </div>

                {feed.length === 0 ? (
                  <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 shadow-xs">
                    <Compass className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-xs font-semibold text-slate-700">Proof stream quiet.</p>
                    <p className="text-[10px] text-slate-400 mt-1">Be the first to perform a habit check-in above!</p>
                  </div>
                ) : (
                  feed.map((chk) => {
                    const hasVotedApprove = chk.votes.some(v => v.verifier_id === currentUser.id && v.vote === 'APPROVE');
                    const hasVotedDispute = chk.votes.some(v => v.verifier_id === currentUser.id && v.vote === 'DISPUTED');
                    const isOwnCheckin = chk.user_id === currentUser.id;

                    let statusBadgeColor = 'bg-slate-100 text-amber-700 border border-slate-200';
                    if (chk.status === 'VERIFIED') statusBadgeColor = 'bg-emerald-50 text-emerald-700 border border-emerald-150';
                    if (chk.status === 'DISPUTED') statusBadgeColor = 'bg-rose-50 text-rose-700 border border-rose-150';

                    return (
                      <div key={chk.id} className="bg-white border border-slate-200 rounded-2xl overflow-hidden transition-all hover:border-slate-350 shadow-sm">
                        {/* Feed Card Author Header */}
                        <div className="p-3 bg-slate-50/50 flex items-center justify-between border-b border-slate-200">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                              {chk.username?.slice(0, 2)}
                            </div>
                            <div>
                              <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                                @{chk.username}
                                {isOwnCheckin && <span className="text-[8px] bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded font-normal">You</span>}
                              </span>
                              <p className="text-[9px] text-slate-500 font-medium">{chk.challenge_title}</p>
                            </div>
                          </div>
                          <span className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded font-medium ${statusBadgeColor}`}>
                            {chk.status === 'PENDING_VERIFICATION' ? 'PENDING' : chk.status}
                          </span>
                        </div>

                        {/* Habit Proof Image */}
                        <div className="relative aspect-video bg-slate-105 border-b border-slate-150">
                          <img 
                            src={chk.media_url} 
                            alt="Habit Checkin" 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute top-2 right-2 bg-slate-900/80 backdrop-blur-xs px-2 py-0.5 rounded text-[8px] text-white font-mono font-medium">
                            Offset: {chk.timezone_offset}m
                          </div>
                        </div>

                        {/* Card Description */}
                        <div className="p-3 space-y-2.5">
                          <p className="text-xs text-slate-700 leading-normal font-sans">
                            {chk.text_proof || 'Submitted proof without annotations.'}
                          </p>

                          <div className="flex justify-between items-center text-[10px] text-slate-400 border-t border-slate-100 pt-2 font-mono">
                            <span>Posted {new Date(chk.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                            <span className="flex items-center gap-1">
                              Votes Cast: {chk.votes.length}
                            </span>
                          </div>

                          {/* List of registered voters */}
                          {chk.votes.length > 0 && (
                            <div className="bg-slate-50 p-2 rounded-lg text-[9px] font-mono text-slate-600 border border-slate-200/50">
                              <span className="font-bold text-slate-500 uppercase tracking-tight text-[8px] block mb-1">Peer Ledger Votes:</span>
                              <div className="space-y-0.5">
                                {chk.votes.map((v) => (
                                  <div key={v.id} className="flex justify-between">
                                    <span className="text-slate-500">@{v.verifier_username}:</span>
                                    <span className={v.vote === 'APPROVE' ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>{v.vote}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Interactive Voting Actions */}
                          {isOwnCheckin ? (
                            <div className="text-center p-2 rounded-lg bg-slate-50 text-[9px] text-indigo-650 font-mono border border-slate-200/40">
                              🛡️ Anti-Cheat active. You cannot vote on your own check-ins.
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 pt-1 border-t border-slate-100">
                              <button
                                onClick={() => onCastVote(chk.id, 'APPROVE')}
                                disabled={hasVotedApprove || hasVotedDispute}
                                className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                                  hasVotedApprove 
                                    ? 'bg-slate-100 text-emerald-600 border border-emerald-200 cursor-not-allowed' 
                                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs cursor-pointer'
                                }`}
                              >
                                <Check className="w-3.5 h-3.5" />
                                {hasVotedApprove ? 'Approved' : 'Approve'}
                              </button>

                              <button
                                onClick={() => onCastVote(chk.id, 'DISPUTED')}
                                disabled={hasVotedApprove || hasVotedDispute}
                                className={`flex-1 flex items-center justify-center gap-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                                  hasVotedDispute 
                                    ? 'bg-slate-100 text-rose-600 border border-rose-200 cursor-not-allowed' 
                                    : 'bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 cursor-pointer'
                                }`}
                              >
                                <X className="w-3.5 h-3.5" />
                                {hasVotedDispute ? 'Contested' : 'Dispute'}
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            )}

            {/* 3. ACTIVE CHALLENGES DIRECTORY */}
            {activeTab === 'challenges' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Habit Arena</h2>
                    <p className="text-[10px] text-slate-500">Check active pledges and invitees</p>
                  </div>
                  <button
                    onClick={() => {
                      // Switch submode to creation
                      setNewTitle('Daily Water Hydration');
                      setNewDesc('Drink a full canister of fresh water and post physical proof.');
                    }}
                    className="flex items-center gap-1 text-[10px] bg-indigo-600 hover:bg-indigo-550 text-white px-2.5 py-1 rounded-lg transition shadow-xs cursor-pointer"
                  >
                    <PlusCircle className="w-3 h-3" />
                    Declare Challenge
                  </button>
                </div>

                {/* Challenge custom creation box inline option */}
                <form onSubmit={handleFormCreateChallenge} className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-2.5 shadow-sm">
                  <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1 tracking-tight">
                    <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Create Habit Pledge Frame
                  </h4>
                  <div className="grid grid-cols-1 gap-2">
                    <input 
                      type="text" 
                      placeholder="e.g. Drink 3 Liters Daily" 
                      required 
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <input 
                      type="text" 
                      placeholder="Habit rules: take photo of your full shaker..." 
                      value={newDesc}
                      onChange={(e) => setNewDesc(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <div className="flex items-center gap-2">
                      <div className="w-1/2">
                        <select
                          value={newFrequency}
                          onChange={(e: any) => setNewFrequency(e.target.value)}
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-xs text-slate-700"
                        >
                          <option value="DAILY">DAILY CYCLE</option>
                          <option value="WEEKLY">WEEKLY CYCLE</option>
                        </select>
                      </div>
                      <div className="w-1/2 flex items-center gap-1 text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2">
                        <input 
                          type="number" 
                          placeholder="Days" 
                          required 
                          value={newDuration}
                          onChange={(e) => setNewDuration(e.target.value)}
                          className="w-full bg-transparent p-1.5 text-xs text-slate-900 focus:outline-none"
                        />
                        <span className="text-[10px] text-slate-500 font-mono">Days</span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-indigo-600 hover:bg-indigo-550 font-bold text-[10px] py-1.5 rounded-lg shadow-xs text-white transition tracking-wide cursor-pointer uppercase"
                  >
                    Deploy New Challenge Frame
                  </button>
                </form>

                {/* List item challenges */}
                <div className="space-y-3">
                  <h3 className="text-xs font-mono font-medium text-slate-400 uppercase tracking-wider">Join Arena Pledges</h3>
                  {challenges.map((c) => {
                    const isJoined = userChallenges.some(uc => uc.challenge_id === c.id);
                    
                    return (
                      <div key={c.id} className="p-3 bg-white border border-slate-250 hover:border-slate-350 transition rounded-xl flex items-start justify-between gap-3 shadow-xs">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate">{c.title}</h4>
                          <p className="text-[10px] text-slate-600 mt-0.5 line-clamp-2">{c.description || 'No custom rules structured.'}</p>
                          
                          <div className="flex items-center gap-2 mt-2 text-[9px] font-mono text-slate-500">
                            <span className="px-1.5 py-0.5 bg-indigo-50 border border-indigo-100 rounded text-indigo-750 flex items-center gap-0.5 uppercase font-semibold">
                              {c.frequency} 
                            </span>
                            <span className="text-indigo-600 font-medium">
                              {c.duration_days} Days span
                            </span>
                            <span className="text-slate-300">•</span>
                            <span className="text-emerald-700 font-semibold">
                              @{c.creator_username || 'creator'}
                            </span>
                          </div>
                        </div>

                        {isJoined ? (
                          <span className="px-2 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-bold font-sans uppercase rounded-md tracking-wider shadow-xs shrink-0 self-center">
                            Joined
                          </span>
                        ) : (
                          <button
                            onClick={() => onJoinChallenge(c.id)}
                            className="bg-indigo-600 hover:bg-indigo-550 text-white px-2.5 py-1 font-bold text-[10px] uppercase rounded-md shadow-xs shrink-0 self-center transition cursor-pointer"
                          >
                            Sign
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 4. PROOF SUBMISSION GATE */}
            {activeTab === 'submit' && (
              <form onSubmit={handleFormSubmitProof} className="space-y-4 animate-fade-in">
                <div>
                  <h2 className="text-base font-bold text-slate-900">Log Habit Check-In</h2>
                  <p className="text-[10px] text-slate-500">Commit physical photographic evidence of execution</p>
                </div>
 
                <div className="space-y-3.5 bg-white border border-slate-200 p-4 rounded-2xl shadow-sm">
                  {/* Select challenge check-ins */}
                  <div>
                    <label className="block text-[10px] text-slate-500 font-mono tracking-wider mb-1 uppercase">Target Challenge Frame</label>
                    <select
                      value={selectedChallengeToSubmit}
                      onChange={(e) => setSelectedChallengeToSubmit(e.target.value)}
                      required
                      className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-800 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="">-- CHOOSE PLEDGED CONTRACT --</option>
                      {userChallenges
                        .filter(uc => uc.status === 'ACTIVE')
                        .map(uc => (
                          <option key={uc.challenge_id} value={uc.challenge_id} className="text-slate-800">
                            {uc.challenge_title || uc.challenge_id}
                          </option>
                        ))}
                    </select>
                    {userChallenges.length === 0 && (
                      <p className="text-[9px] text-rose-600 mt-1">You must sign and enter the Habit Arena pledges before uploading check-ins.</p>
                    )}
                  </div>
 
                  {/* Habit camera preset presets */}
                  <div>
                    <span className="block text-[10px] text-slate-500 tracking-wider font-mono uppercase mb-1.5">Preseeded Photographic templates</span>
                    <div className="grid grid-cols-2 gap-1.5">
                      {HABIT_PRESETS.map((preset) => (
                        <button
                          type="button"
                          key={preset.name}
                          onClick={() => handleApplyPreset(preset)}
                          className="p-1.5 px-2 text-left text-[9px] bg-slate-50 hover:bg-slate-100 text-slate-700 rounded-lg border border-slate-200 flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <span className="truncate max-w-28 font-medium">{preset.name}</span>
                          <Camera className="w-3 h-3 text-indigo-650 shrink-0" />
                        </button>
                      ))}
                    </div>
                  </div>
 
                  {/* File address URL */}
                  <div>
                    <label className="block text-[10px] text-slate-500 font-mono tracking-wider uppercase mb-1">Upload Photo URL</label>
                    <input
                      type="text"
                      required
                      value={customMediaUrl}
                      onChange={(e) => setCustomMediaUrl(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="https://images.unsplash.com/... or drop preset"
                    />
                  </div>
 
                  {/* Text proof area */}
                  <div>
                    <label className="block text-[10px] text-slate-500 font-mono tracking-wider uppercase mb-1">Personal annotations & notes</label>
                    <textarea
                      value={customTextProof}
                      onChange={(e) => setCustomTextProof(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Finished the water goal! Feeling ultra motivated."
                    />
                  </div>
 
                  {/* Timezone offset details */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[9px] text-slate-500 font-mono mb-0.5">Timezone Offset</label>
                      <input 
                        type="number" 
                        value={timezoneOffset}
                        onChange={(e) => setTimezoneOffset(Number(e.target.value))}
                        className="w-full bg-slate-50 border border-slate-200 p-1.5 rounded-lg text-xs text-slate-900"
                        placeholder="Offset in minutes"
                      />
                    </div>
                    <div>
                      <label className="block text-[9px] text-slate-500 font-mono mb-0.5">Device GPS Status</label>
                      <div className="p-1.5 bg-emerald-50 border border-emerald-150 rounded-lg text-[9px] text-emerald-700 font-mono font-medium">
                        ✓ Connected GPS Active
                      </div>
                    </div>
                  </div>
 
                  <button
                    type="submit"
                    disabled={isUploading || userChallenges.length === 0}
                    className="w-full bg-indigo-600 hover:bg-indigo-550 text-white font-semibold py-2.5 text-xs rounded-xl shadow-xs cursor-pointer flex items-center justify-center gap-1.5 uppercase tracking-wide transition-colors"
                  >
                    {isUploading ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        Compiling Assets...
                      </>
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        Submit Proof To Peer Evaluation
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}

            {/* 5. LEADERBOARD & STREAK HALL OF FAME */}
            {activeTab === 'rank' && (
              <div className="space-y-4 animate-fade-in font-sans">
                <div>
                  <h2 className="text-base font-bold text-slate-900 flex items-center gap-1.5">
                    <Award className="w-5 h-5 text-amber-500" /> Leaderboard Hall of Fame
                  </h2>
                  <p className="text-[10px] text-slate-500">Global evaluation of active strengths & scores</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden divide-y divide-slate-100 shadow-sm">
                  {leaderboard.map((u, i) => {
                    const isSelf = u.id === currentUser.id;
                    let rankBadge = `${i + 1}`;
                    let rankColor = 'bg-slate-100 text-slate-600';
                    if (i === 0) { rankBadge = '🥇'; rankColor = 'bg-amber-50 border border-amber-200/50 text-amber-700'; }
                    if (i === 1) { rankBadge = '🥈'; rankColor = 'bg-slate-50 border border-slate-200 text-slate-600'; }
                    if (i === 2) { rankBadge = '🥉'; rankColor = 'bg-amber-50/40 border border-amber-100/50 text-amber-800'; }

                    return (
                      <div 
                        key={u.id} 
                        className={`p-3 flex items-center justify-between gap-2.5 transition ${
                          isSelf ? 'bg-indigo-50/50 shadow-inner' : 'hover:bg-slate-50/50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${rankColor}`}>
                            {rankBadge}
                          </span>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                              @{u.username}
                              {isSelf && <span className="text-[8px] bg-indigo-600 text-white px-1.5 py-0.5 rounded-sm lowercase font-mono">me</span>}
                            </span>
                            <div className="flex items-center gap-1.5 text-[9px] font-mono text-slate-500 mt-0.5">
                              <span>Pledges: {u.joined_challenges}</span>
                              <span>•</span>
                              <span>Max Streak: {u.max_streak}d</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {/* Streak graphic with increment animation */}
                          <AnimatedStreak streak={u.active_streak} />

                          {/* XP Level value */}
                          <div className="text-right">
                            <div className="text-xs font-extrabold text-indigo-650 font-mono tracking-tight">{u.total_xp}</div>
                            <div className="text-[8px] text-slate-400 font-mono tracking-wider uppercase">total xp</div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* 6. USER PROFILE & ENROLLMENT SHEET */}
            {activeTab === 'profile' && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-bold text-slate-900">Challenger Hub</h2>
                  <button
                    onClick={onLogout}
                    className="text-[10px] text-rose-600 hover:text-rose-805 font-bold underline decoration-dotted capitalize cursor-pointer"
                  >
                    leave cockpit
                  </button>
                </div>

                <div className="bg-white border border-slate-200 p-4 rounded-2xl flex items-center gap-4 shadow-sm">
                  <div className="w-12 h-12 rounded-full bg-indigo-650 text-white flex items-center justify-center font-extrabold text-lg shadow-sm">
                    {currentUser.username.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1">
                      @{currentUser.username}
                      <ShieldCheck className="w-4 h-4 text-emerald-500" />
                    </h3>
                    <p className="text-[10px] text-slate-500 font-mono truncate">{currentUser.email}</p>
                    <div className="mt-1 flex items-center gap-1">
                      <span className="text-[10px] text-indigo-650 bg-indigo-50 border border-indigo-100 rounded-sm px-1.5 py-0.5 font-bold font-mono">
                        Score Tier: {currentUser.total_xp} Total XP
                      </span>
                    </div>
                  </div>
                </div>

                {/* Display list of active commitments for current user */}
                <div className="space-y-2.5">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold text-slate-800">My Active Pledge Sheets</h3>
                    <span className="text-[9px] text-slate-500 font-mono font-medium">{userChallenges.length} Active</span>
                  </div>

                  {userChallenges.length === 0 ? (
                    <div className="p-4 bg-white rounded-xl border border-dashed border-slate-200 text-center text-[10px] text-slate-500 shadow-sm">
                      No active enrollments flagged. Browse and sign challenges to deploy habits.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {userChallenges.map((uc) => (
                        <div key={uc.challenge_id} className="p-3 bg-white border border-slate-200 rounded-xl space-y-2 shadow-xs">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <h4 className="text-xs font-bold text-slate-900">{uc.challenge_title || 'Unnamed Pledging Block'}</h4>
                              <p className="text-[9px] font-mono text-slate-500 mt-0.5">{uc.challenge_frequency} • {uc.challenge_duration} Day Goal</p>
                            </div>
                            <span className="px-1.5 py-0.5 rounded bg-emerald-50 border border-emerald-150 text-emerald-700 font-mono text-[8px] uppercase tracking-wider font-bold">
                              {uc.status}
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-2 font-mono text-[10px]">
                            <div className="flex items-center gap-1">
                              <Flame className="w-3.5 h-3.5 text-orange-500 fill-current" />
                              <span className="text-slate-600">Current Streak: <b className="text-amber-600 font-bold">{uc.current_streak}d</b></span>
                            </div>
                            <div className="text-right">
                              <span className="text-slate-400">Max Peak: <b className="text-slate-650 font-semibold">{uc.max_streak}d</b></span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        )}

      </div>

      {/* Persistent Bottom Phone Navigation Tabs */}
      {currentUser && (
        <div className="bg-white border-t border-slate-200/85 p-2 px-3 pb-5 flex items-center justify-around text-slate-400 select-none">
          <button 
            type="button"
            onClick={() => setActiveTab('feed')}
            className={`flex flex-col items-center gap-0.5 cursor-pointer transition-colors ${activeTab === 'feed' ? 'text-indigo-600 font-semibold' : 'hover:text-slate-650'}`}
          >
            <Compass className="w-4 h-4" />
            <span className="text-[8.5px] font-medium font-sans">Feed</span>
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab('challenges')}
            className={`flex flex-col items-center gap-0.5 cursor-pointer transition-colors ${activeTab === 'challenges' ? 'text-indigo-600 font-semibold' : 'hover:text-slate-650'}`}
          >
            <ListFilter className="w-4 h-4" />
            <span className="text-[8.5px] font-medium font-sans">Arena</span>
          </button>

          <button 
            type="button"
            onClick={() => {
              setActiveTab('submit');
              // Automatically select first joined challenge if any
              if (userChallenges.length > 0 && !selectedChallengeToSubmit) {
                setSelectedChallengeToSubmit(userChallenges[0].challenge_id);
              }
            }}
            className={`flex flex-col items-center gap-0.5 cursor-pointer transition-colors ${activeTab === 'submit' ? 'text-indigo-600 font-semibold' : 'hover:text-slate-650'}`}
          >
            <PlusCircle className="w-5 h-5 text-indigo-600 shrink-0" />
            <span className="text-[8.5px] font-medium font-sans">File Proof</span>
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab('rank')}
            className={`flex flex-col items-center gap-0.5 cursor-pointer transition-colors ${activeTab === 'rank' ? 'text-indigo-600 font-semibold' : 'hover:text-slate-650'}`}
          >
            <Award className="w-4 h-4" />
            <span className="text-[8.5px] font-medium font-sans">Rankings</span>
          </button>

          <button 
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-0.5 cursor-pointer transition-colors ${activeTab === 'profile' ? 'text-indigo-600 font-semibold' : 'hover:text-slate-650'}`}
          >
            <UserIcon className="w-4 h-4" />
            <span className="text-[8.5px] font-medium font-sans">Hub</span>
          </button>
        </div>
      )}

      {/* Screen bottom bar emulator */}
      <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-slate-300 rounded-full z-50 pointer-events-none" />

    </div>
  );
}
