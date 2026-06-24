import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Challenge, UserChallenge, CheckIn, Verification } from '../types.js';
import { 
  Flame, Award, PlusCircle, CheckCircle, Navigation, 
  MapPin, ShieldCheck, Heart, Trash, Compass, User as UserIcon, ListFilter,
  Check, X, Camera, Send, BellRing, Sparkles, AlertCircle, RefreshCw,
  Trophy, Crown, Sunrise, Zap, Snowflake, Smartphone, Activity, Upload
} from 'lucide-react';

interface PhoneEmulatorProps {
  currentUser: User | null;
  challenges: Challenge[];
  feed: (CheckIn & { votes: Verification[] })[];
  userChallenges: any[];
  leaderboard: any[];
  onRegister: (form: any) => Promise<void>;
  onLogin: (form: any) => Promise<void>;
  onJoinChallenge: (challengeId: string) => Promise<void>;
  onCreateChallenge: (form: any) => Promise<void>;
  onSubmitCheckin: (challengeId: string, form: any) => Promise<void>;
  onCastVote: (checkInId: string, vote: 'APPROVE' | 'DISPUTED') => Promise<void>;
  onLogout: () => void;
  onAddComment?: (checkInId: string, message: string) => Promise<void>;
  onUpdateProfilePicture?: (avatarUrl: string) => Promise<void>;
  onPurchaseStreakFreeze?: (challengeId: string, xpCost: number) => Promise<void>;
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

        @keyframes cardEntrance {
          0% {
            opacity: 0;
            transform: translate(-50%, -40%) scale(0.8);
          }
          15% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1.05);
          }
          22% {
            transform: translate(-50%, -50%) scale(1);
          }
          85% {
            opacity: 1;
            transform: translate(-50%, -50%) scale(1);
          }
          100% {
            opacity: 0;
            transform: translate(-50%, -60%) scale(0.85);
          }
        }
        .animate-card-entrance {
          animation: cardEntrance 3s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
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

export const BADGE_META: Record<string, {
  name: string;
  icon: React.ComponentType<any>;
  bgColor: string;
  borderColor: string;
  textColor: string;
  iconColor: string;
  description: string;
}> = {
  'XP Elite': {
    name: 'XP Elite',
    icon: Trophy,
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    textColor: 'text-amber-800',
    iconColor: 'text-amber-500',
    description: 'Smashed 400+ total XP threshold.'
  },
  'Consistency King': {
    name: 'Consistency King',
    icon: Crown,
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    textColor: 'text-purple-800',
    iconColor: 'text-purple-500',
    description: 'Conquered a 5+ day streak milestone.'
  },
  'Early Bird': {
    name: 'Early Bird',
    icon: Sunrise,
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    textColor: 'text-orange-800',
    iconColor: 'text-orange-500',
    description: 'Signed off sunrise checks before 10 AM.'
  },
  'Pledge Pioneer': {
    name: 'Pledge Pioneer',
    icon: Compass,
    bgColor: 'bg-cyan-50',
    borderColor: 'border-cyan-200',
    textColor: 'text-cyan-800',
    iconColor: 'text-cyan-500',
    description: 'Signed pledges for 2+ active commitments.'
  },
  'First Steps': {
    name: 'First Steps',
    icon: Zap,
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    textColor: 'text-emerald-800',
    iconColor: 'text-emerald-500',
    description: 'Unlocked first streak commitment of 1+ days.'
  }
};

export function BadgePill({ name, size = 'md' }: { name: string; size?: 'sm' | 'md'; key?: any }) {
  const meta = BADGE_META[name];
  if (!meta) return null;
  const Icon = meta.icon;

  if (size === 'sm') {
    return (
      <span 
        title={`${meta.name}: ${meta.description}`}
        className={`inline-flex items-center justify-center w-5 h-5 rounded-full border ${meta.bgColor} ${meta.borderColor} ${meta.iconColor} cursor-help shrink-0 shadow-xs transition-transform hover:scale-115`}
      >
        <Icon className="w-2.5 h-2.5" />
      </span>
    );
  }

  return (
    <div 
      title={meta.description}
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-bold transition-all duration-300 hover:-translate-y-0.5 shadow-sm cursor-help ${meta.bgColor} ${meta.borderColor} ${meta.textColor}`}
    >
      <Icon className={`w-3.5 h-3.5 ${meta.iconColor}`} />
      <span>{meta.name}</span>
    </div>
  );
}

export function CelebrationCanvas({ trigger }: { trigger: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (trigger === 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      color: string;
      size: number;
      rotation: number;
      rotationSpeed: number;
      shape: 'circle' | 'rect';
      opacity: number;
    }> = [];

    // Set canvas dimensions relative to phone layout inside border
    const width = 336;
    const height = 696;
    canvas.width = width;
    canvas.height = height;

    const colors = ['#F59E0B', '#EF4444', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#F97316'];

    // Spawn Confetti coming down from top & side corners
    for (let i = 0; i < 65; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * -120 - 10,
        vx: (Math.random() - 0.5) * 4.5,
        vy: Math.random() * 2.5 + 2,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 5 + 6,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        shape: Math.random() > 0.45 ? 'rect' : 'circle',
        opacity: 1
      });
    }

    // Spawn explosive golden sparkles from the center for high impact
    for (let i = 0; i < 45; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 5 + 4;
      particles.push({
        x: width / 2,
        y: height / 2.5,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 1.2, // slight upward bias
        color: Math.random() > 0.5 ? '#FBBF24' : '#F59E0B', // gold / amber
        size: Math.random() * 2.5 + 3,
        rotation: 0,
        rotationSpeed: 0,
        shape: 'circle',
        opacity: 1
      });
    }

    let frame = 0;
    const maxFrames = 150; // 2.5 seconds at 60fps

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      frame++;

      particles.forEach((p) => {
        // Physics update
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.085; // gravity
        p.vx *= 0.985; // air drag
        p.rotation += p.rotationSpeed;
        p.opacity = Math.max(0, 1 - (frame / maxFrames));

        if (p.opacity <= 0) return;

        // Draw particle
        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;

        if (p.shape === 'rect') {
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size / 2);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });

      if (frame < maxFrames) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, width, height);
      }
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [trigger]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-40 rounded-[36px]"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}

export function DisputeThread({ 
  checkIn, 
  currentUserId,
  onAddComment 
}: { 
  checkIn: CheckIn & { votes: Verification[] }; 
  currentUserId: string;
  onAddComment?: (checkInId: string, message: string) => Promise<void> 
}) {
  const [commentText, setCommentText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const comments = checkIn.comments || [];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !onAddComment) return;
    setIsSending(true);
    try {
      await onAddComment(checkIn.id, commentText);
      setCommentText('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="mt-3 bg-rose-50/40 border border-rose-100 rounded-xl p-3 space-y-2 text-left">
      <div className="flex items-center justify-between border-b border-rose-100 pb-1.5">
        <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1">
          ⚖️ Dispute Justification Thread
        </span>
        <span className="text-[9px] font-mono text-rose-600 bg-rose-100/60 px-1.5 py-0.5 rounded-sm">
          {comments.length} justification{comments.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Messages Thread list */}
      <div className="space-y-2 max-h-[160px] overflow-y-auto pr-1 flex flex-col">
        {comments.length === 0 ? (
          <p className="text-[10px] text-rose-600/80 italic py-1 text-center font-sans w-full">
            No explanations submitted yet. Discuss or justify this check-in to clear the dispute!
          </p>
        ) : (
          comments.map((comment) => {
            const isSelf = comment.user_id === currentUserId;
            const isAuthor = comment.user_id === checkIn.user_id;

            return (
              <div 
                key={comment.id} 
                className={`flex flex-col space-y-0.5 max-w-[92%] ${isSelf ? 'self-end items-end ml-auto' : 'self-start items-start mr-auto'}`}
              >
                <div className="flex items-center gap-1 text-[8px] font-mono text-slate-500">
                  <span className={`font-bold ${isSelf ? 'text-indigo-650' : 'text-slate-700'}`}>
                    @{comment.username}
                  </span>
                  {isAuthor && (
                    <span className="bg-rose-105 text-rose-700 px-1 rounded-[3px] text-[7px] font-extrabold uppercase">
                      Author
                    </span>
                  )}
                  {isSelf && !isAuthor && (
                    <span className="bg-indigo-50 text-indigo-650 px-1 rounded-[3px] text-[7px] font-extrabold uppercase font-bold">
                      Me
                    </span>
                  )}
                </div>
                <div 
                  className={`p-2 rounded-xl text-[10px] leading-tight ${
                    isSelf 
                      ? 'bg-indigo-650 text-white rounded-tr-none text-right' 
                      : 'bg-white text-slate-800 rounded-tl-none border border-slate-200/50 text-left'
                  }`}
                >
                  {comment.message}
                </div>
                <span className="text-[7px] text-slate-400 font-mono scale-90">
                  {new Date(comment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            );
          })
        )}
      </div>

      {/* Reply Input Form */}
      <form onSubmit={handleSend} className="flex gap-1.5 pt-1.5 border-t border-rose-100">
        <input
          type="text"
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder={checkIn.user_id === currentUserId ? "Justify your check-in..." : "Discuss or ask for proof..."}
          disabled={isSending}
          className="flex-1 bg-white border border-rose-200 rounded-lg px-2.5 py-1 text-[10px] text-slate-800 focus:outline-none focus:ring-1 focus:ring-rose-400 focus:border-rose-400 font-sans placeholder-slate-400"
        />
        <button
          type="submit"
          disabled={isSending || !commentText.trim()}
          className="bg-rose-600 hover:bg-rose-700 active:scale-95 disabled:opacity-40 disabled:scale-100 text-white p-1 px-2.5 rounded-lg text-[9px] font-black uppercase tracking-wider transition-all flex items-center justify-center shrink-0 cursor-pointer"
        >
          {isSending ? (
            <RefreshCw className="w-3 h-3 animate-spin" />
          ) : (
            <Send className="w-3 h-3 fill-current" />
          )}
        </button>
      </form>
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
  onLogout,
  onAddComment,
  onUpdateProfilePicture,
  onPurchaseStreakFreeze
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

  // Avatar / Profile picture edit states
  const [isEditingAvatar, setIsEditingAvatar] = useState(false);
  const [avatarUrlInput, setAvatarUrlInput] = useState('');

  // Error/Success state
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Toast notifications state
  const [toasts, setToasts] = useState<{
    id: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'xp' | 'streak';
    title?: string;
  }[]>([]);

  const addToast = (message: string, type: 'success' | 'error' | 'info' | 'xp' | 'streak' = 'success', title?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type, title }]);
    
    // Auto-remove after 4.2 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4200);
  };

  // Gamified Celebration & Milestone tracking state
  const [celebrationTrigger, setCelebrationTrigger] = useState(0);
  const [announcement, setAnnouncement] = useState<{ title: string; subtitle: string; iconType: 'badge' | 'xp' | 'challenge' | 'streak' | 'generic' } | null>(null);

  // Settings - Vibration / Haptic Feedback
  const [vibrationEnabled, setVibrationEnabled] = useState<boolean>(() => {
    const saved = localStorage.getItem('betz_vibration');
    return saved !== null ? saved === 'true' : true;
  });
  const [isVibrating, setIsVibrating] = useState(false);

  const triggerVibration = (pattern: number | number[] = 100) => {
    if (!vibrationEnabled) return;
    setIsVibrating(true);
    try {
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(pattern);
      }
    } catch (e) {
      console.warn('Vibrate API not supported or blocked in this context', e);
    }
    setTimeout(() => {
      setIsVibrating(false);
    }, 250);
  };

  // Image Resizer metrics state
  const [resizeMetrics, setResizeMetrics] = useState<{
    originalSize: string;
    resizedSize: string;
    dimensions: string;
    compressionRatio: string;
  } | null>(null);

  // Profile Avatar Image Resizer metrics state
  const [avatarResizeMetrics, setAvatarResizeMetrics] = useState<{
    originalSize: string;
    resizedSize: string;
    dimensions: string;
    compressionRatio: string;
  } | null>(null);

  // Client-side HTML5 canvas image resizing and optimization engine
  const resizeAndCompressImage = (
    file: File,
    maxDimension: number = 500,
    quality: number = 0.8
  ): Promise<{ dataUrl: string; originalSizeKb: string; resizedSizeKb: string; dimensions: string; ratio: string }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxDimension) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            }
          } else {
            if (height > maxDimension) {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('Canvas context could not be created'));
            return;
          }

          ctx.drawImage(img, 0, 0, width, height);
          
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          
          const origSizeKb = (file.size / 1024).toFixed(1) + ' KB';
          const resSizeInBytes = Math.round((dataUrl.length - 22) * 3 / 4);
          const resSizeKb = (resSizeInBytes / 1024).toFixed(1) + ' KB';
          const ratio = ((1 - (resSizeInBytes / file.size)) * 100).toFixed(0) + '%';
          const dimensions = `${width}×${height}px`;

          resolve({
            dataUrl,
            originalSizeKb: origSizeKb,
            resizedSizeKb: resSizeKb,
            dimensions,
            ratio
          });
        };
        img.onerror = (err) => reject(err);
        img.src = event.target?.result as string;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(file);
    });
  };

  const prevBadgesRef = useRef<string[]>([]);
  const prevXpRef = useRef<number>(0);
  const prevChallengesRef = useRef<any[]>([]);

  // Monitor user challenges to trigger immediate success celebrations
  useEffect(() => {
    if (!currentUser) {
      prevChallengesRef.current = [];
      return;
    }
    
    if (prevChallengesRef.current.length === 0) {
      prevChallengesRef.current = userChallenges;
      return;
    }

    userChallenges.forEach(uc => {
      const prevUc = prevChallengesRef.current.find(p => p.challenge_id === uc.challenge_id);
      if (prevUc) {
        // A. Check for completed challenge (status changed from ACTIVE to COMPLETED)
        if (uc.status === 'COMPLETED' && prevUc.status !== 'COMPLETED') {
          setAnnouncement({
            title: 'CHALLENGE CONQUERED! 🏆',
            subtitle: `Incredible! You completed all days of "${uc.challenge_title || 'your pledge'}"!`,
            iconType: 'challenge'
          });
          setCelebrationTrigger(prev => prev + 1);
          triggerVibration([100, 50, 100, 50, 200]);
        }
        // B. Check for streak record / streak increment
        else if (uc.current_streak > prevUc.current_streak) {
          // If the current streak exceeds previous max streak and is a record
          if (uc.current_streak > prevUc.max_streak && prevUc.max_streak > 0) {
            setAnnouncement({
              title: 'NEW STREAK RECORD! ⚡',
              subtitle: `Phenomenal! A new peak record of ${uc.current_streak} days on "${uc.challenge_title || 'your pledge'}"!`,
              iconType: 'streak'
            });
            triggerVibration([150, 60, 150]);
          } else {
            setAnnouncement({
              title: 'STREAK INCREMENTED! 🔥',
              subtitle: `Keep it up! Your streak for "${uc.challenge_title || 'your pledge'}" is now ${uc.current_streak} days!`,
              iconType: 'streak'
            });
            triggerVibration(100);
          }
          setCelebrationTrigger(prev => prev + 1);
        }
      }
    });

    prevChallengesRef.current = userChallenges;
  }, [userChallenges, currentUser]);

  // Celebrate newly unlocked badges or XP milestones automatically
  useEffect(() => {
    if (!currentUser) {
      prevBadgesRef.current = [];
      prevXpRef.current = 0;
      return;
    }

    const currentBadges = currentUser.badges || [];
    const currentXp = currentUser.total_xp;

    // Populate refs on initial load without triggering a celebration
    if (prevBadgesRef.current.length === 0 && prevXpRef.current === 0) {
      prevBadgesRef.current = currentBadges;
      prevXpRef.current = currentXp;
      return;
    }

    // 1. Check for newly unlocked badges
    const newlyUnlocked = currentBadges.filter(b => !prevBadgesRef.current.includes(b));
    if (newlyUnlocked.length > 0) {
      const latestBadge = newlyUnlocked[0];
      setAnnouncement({
        title: 'Achievement Unlocked! 🎉',
        subtitle: `You unlocked the "${latestBadge}" badge!`,
        iconType: 'badge'
      });
      setCelebrationTrigger(prev => prev + 1);
    } 
    // 2. Check for XP Milestones
    else if (currentXp > prevXpRef.current) {
      const oldMilestone = Math.floor(prevXpRef.current / 100);
      const newMilestone = Math.floor(currentXp / 100);
      if (newMilestone > oldMilestone) {
        setAnnouncement({
          title: 'XP Milestone Smashed! 🔥',
          subtitle: `Conquered the ${newMilestone * 100} XP Milestone!`,
          iconType: 'xp'
        });
        setCelebrationTrigger(prev => prev + 1);
      }
    }

    prevBadgesRef.current = currentBadges;
    prevXpRef.current = currentXp;
  }, [currentUser]);

  // Automatically clear announcements after 6 seconds
  useEffect(() => {
    if (!announcement) return;
    const timer = setTimeout(() => {
      setAnnouncement(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [announcement]);

  const triggerTestCelebration = () => {
    // Random select a badge or milestone to simulate
    const testOptions = [
      { title: 'Achievement Unlocked! 🎉', subtitle: 'You unlocked the "Consistency King" badge!', iconType: 'badge' as const },
      { title: 'XP Milestone Smashed! 🔥', subtitle: 'Conquered the 500 XP Milestone!', iconType: 'xp' as const },
      { title: 'Pledge Pioneer! 🏆', subtitle: 'You unlocked the "Pledge Pioneer" badge!', iconType: 'badge' as const },
      { title: 'CHALLENGE CONQUERED! 🏆', subtitle: 'Incredible! You completed all days of "No Sugar Challenge"!', iconType: 'challenge' as const },
      { title: 'NEW STREAK RECORD! ⚡', subtitle: 'Phenomenal! A new peak record of 10 days on "Daily Gym Check-in"!', iconType: 'streak' as const },
      { title: 'STREAK INCREMENTED! 🔥', subtitle: 'Keep it up! Your streak for "Drink Water" is now 5 days!', iconType: 'streak' as const }
    ];
    const choice = testOptions[Math.floor(Math.random() * testOptions.length)];
    setAnnouncement(choice);
    setCelebrationTrigger(prev => prev + 1);
    
    // Choose appropriate vibration pattern
    if (choice.iconType === 'challenge') {
      triggerVibration([100, 50, 100, 50, 200]);
    } else if (choice.iconType === 'streak') {
      triggerVibration([150, 60, 150]);
    } else if (choice.iconType === 'badge') {
      triggerVibration([100, 100, 100]);
    } else {
      triggerVibration(100);
    }
  };

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
      addToast(err.message || 'Operation failed', 'error', 'Error Occurred');
    }
  };

  const handleApplyPreset = (preset: typeof HABIT_PRESETS[0]) => {
    setCustomMediaUrl(preset.imageUrl);
    setCustomTextProof(preset.text);
    setSuccessMsg(`Preset "${preset.name}" applied successfully.`);
    addToast(`Preset "${preset.name}" applied! 📝`, 'info', 'Preset Loaded');
  };

  const handleFormRegister = (e: React.FormEvent) => {
    e.preventDefault();
    wrapSubmit(async () => {
      await onRegister({ username: regUsername, email: regEmail, password: regPassword });
      setSuccessMsg('Pledge established! Registered successfully.');
      addToast('Welcome to Habit Arena! Pledge established 🛡️', 'success', 'Account Formed');
      setActiveTab('feed');
    });
  };

  const handleFormLogin = (e: React.FormEvent) => {
    e.preventDefault();
    wrapSubmit(async () => {
      await onLogin({ usernameOrEmail: loginTerm, password: loginPassword });
      setSuccessMsg('Successfully entered habit server hub.');
      addToast('Logged in successfully! Welcome back 👋', 'success', 'Session Active');
      setActiveTab('feed');
    });
  };

  const handleJoinChallengeClick = async (challengeId: string, title: string) => {
    try {
      await onJoinChallenge(challengeId);
      addToast(`Signed pledge for: "${title}"! ⚔️`, 'success', 'Arena Signed');
      triggerVibration(100);
    } catch (err: any) {
      addToast(err.message || 'Failed to sign challenge pledge.', 'error', 'Pledge Failure');
    }
  };

  const handleCastVoteClick = async (checkInId: string, voteType: 'APPROVE' | 'DISPUTED', authorUsername: string) => {
    try {
      await onCastVote(checkInId, voteType);
      const isApprove = voteType === 'APPROVE';
      addToast(
        isApprove 
          ? `Approved @${authorUsername}'s check-in! 💎` 
          : `Contested @${authorUsername}'s check-in. ⚔️`,
        isApprove ? 'success' : 'info',
        'Vote Registered'
      );
      triggerVibration(isApprove ? 80 : [80, 50, 80]);
    } catch (err: any) {
      addToast(err.message || 'Vote registration error', 'error', 'Vote Failed');
    }
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
        triggerVibration([80, 50, 80]); // double haptic tap
        setSuccessMsg('Physical proof propagated to feeds! Awaiting consensus approvals.');
        setCustomMediaUrl('');
        setCustomTextProof('');
        setResizeMetrics(null);
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
    <motion.div
      animate={isVibrating ? {
        x: [0, -3, 3, -3, 3, -1.5, 1.5, 0],
        y: [0, 1, -1, 1, -1, 0.5, -0.5, 0]
      } : {}}
      transition={{ duration: 0.25 }}
      className="relative mx-auto w-[360px] h-[720px] rounded-[48px] border-[12px] border-slate-900 bg-slate-800 shadow-xl flex flex-col overflow-hidden ring-4 ring-indigo-500/10"
    >
      
      {/* Gamified Celebration Overlay */}
      <CelebrationCanvas trigger={celebrationTrigger} />

      {/* Floating Announcement Banner (Success Celebration) */}
      <AnimatePresence>
        {announcement && (
          <div className="absolute inset-0 bg-slate-950/50 backdrop-blur-xs z-50 flex items-center justify-center p-6 select-none overflow-hidden">
            {/* Main Interactive Celebration Card */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0, y: 50 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0, y: 30 }}
              transition={{ type: 'spring', damping: 22, stiffness: 220 }}
              className="relative w-full max-w-[270px] bg-slate-900/95 border-2 border-amber-400 rounded-3xl p-5 shadow-[0_0_40px_rgba(245,158,11,0.4)] text-center flex flex-col items-center overflow-hidden"
            >
              {/* Star-Burst Explosion Particles driven by Framer Motion */}
              {[...Array(16)].map((_, idx) => {
                const angle = (idx / 16) * Math.PI * 2 + (Math.random() - 0.5) * 0.25;
                const distance = Math.random() * 85 + 85;
                const colors = ['#F59E0B', '#EF4444', '#3B82F6', '#10B981', '#8B5CF6', '#EC4899', '#F97316', '#FBBF24'];
                const randColor = colors[Math.floor(Math.random() * colors.length)];
                const duration = Math.random() * 1.3 + 1.2;
                return (
                  <motion.div
                    key={idx}
                    initial={{ x: 0, y: 0, opacity: 1, scale: Math.random() * 0.45 + 0.55 }}
                    animate={{
                      x: Math.cos(angle) * distance,
                      y: Math.sin(angle) * distance + 25,
                      opacity: 0,
                      rotate: Math.random() * 360 + 180,
                      scale: 0.15
                    }}
                    transition={{
                      duration: duration,
                      ease: 'easeOut',
                    }}
                    style={{ backgroundColor: randColor }}
                    className="absolute w-2 h-2 rounded-xs"
                  />
                );
              })}

              {/* Radial gradient background accent */}
              <div className="absolute -inset-10 bg-radial from-amber-500/10 via-transparent to-transparent pointer-events-none rounded-full" />

              {/* Interactive Icon Container with Pop transition */}
              <motion.div
                initial={{ scale: 0.3, rotate: -25 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', delay: 0.1, damping: 11 }}
                className="w-14 h-14 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center shadow-lg border-2 border-amber-300/80 mb-3 z-10"
              >
                {announcement.iconType === 'badge' ? (
                  <Trophy className="w-7 h-7 text-white fill-amber-100" />
                ) : announcement.iconType === 'xp' ? (
                  <Zap className="w-7 h-7 text-white fill-amber-100" />
                ) : announcement.iconType === 'challenge' ? (
                  <Crown className="w-7 h-7 text-white fill-amber-100" />
                ) : announcement.iconType === 'streak' ? (
                  <Flame className="w-7 h-7 text-white fill-amber-100" />
                ) : (
                  <Sparkles className="w-7 h-7 text-white" />
                )}
              </motion.div>

              <motion.span
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-[10px] uppercase tracking-widest font-extrabold text-amber-400 font-mono"
              >
                {announcement.title}
              </motion.span>

              <motion.h3
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-xs font-black text-white mt-1 leading-tight tracking-tight z-10 px-0.5"
              >
                {announcement.subtitle}
              </motion.h3>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="mt-3 text-[9px] text-slate-400 font-medium font-sans z-10"
              >
                {announcement.iconType === 'challenge' 
                  ? 'Fantastic execution! Your dedication is fully recorded.'
                  : announcement.iconType === 'streak'
                  ? 'Sensational consistency! Keep checking in daily to hold your edge.'
                  : 'Maintain consistency to ascend the peer rankings!'}
              </motion.div>

              {/* Claim Button */}
              <motion.button
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.48 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setAnnouncement(null)}
                className="mt-4 w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-[9.5px] uppercase tracking-wider py-2 px-3 rounded-xl shadow-md border border-amber-300/30 cursor-pointer z-20"
              >
                Claim Rewards
              </motion.button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

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
                            {chk.avatar_url ? (
                              <img 
                                src={chk.avatar_url} 
                                alt={chk.username} 
                                className="w-7 h-7 rounded-full object-cover shadow-xs border border-indigo-200"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                                {chk.username?.slice(0, 2)}
                              </div>
                            )}
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
                                onClick={() => handleCastVoteClick(chk.id, 'APPROVE', chk.username)}
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
                                onClick={() => handleCastVoteClick(chk.id, 'DISPUTED', chk.username)}
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

                          {/* Dispute justification thread for flagged entries */}
                          {chk.status === 'DISPUTED' && currentUser && (
                            <DisputeThread
                              checkIn={chk}
                              currentUserId={currentUser.id}
                              onAddComment={onAddComment}
                            />
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
                            onClick={() => handleJoinChallengeClick(c.id, c.title)}
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
 
                  {/* File Dropzone & Real Resizing Upload */}
                  <div className="space-y-2">
                    <label className="block text-[10px] text-slate-500 font-mono tracking-wider uppercase mb-1 flex items-center justify-between">
                      <span>Physical Photo Evidence</span>
                      <span className="text-[8px] text-indigo-650 font-bold bg-indigo-50 px-1.5 py-0.5 rounded font-mono">RESIZE AUTO-ACTIVE ⚡</span>
                    </label>

                    {/* Drag & Drop/Click Area */}
                    <div 
                      onClick={() => document.getElementById('checkin-file-picker')?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={async (e) => {
                        e.preventDefault();
                        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                          const file = e.dataTransfer.files[0];
                          if (file.type.startsWith('image/')) {
                            try {
                              const result = await resizeAndCompressImage(file);
                              setCustomMediaUrl(result.dataUrl);
                              setResizeMetrics({
                                originalSize: result.originalSizeKb,
                                resizedSize: result.resizedSizeKb,
                                dimensions: result.dimensions,
                                compressionRatio: result.ratio
                              });
                              triggerVibration([50, 30, 50]); // quick confirmation buzz
                            } catch (err) {
                              console.error('Error resizing dropped image', err);
                            }
                          }
                        }
                      }}
                      className="border-2 border-dashed border-indigo-200 hover:border-indigo-400 bg-indigo-50/10 hover:bg-indigo-50/20 rounded-xl p-3 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all active:scale-[0.99] group text-center"
                    >
                      <Upload className="w-5 h-5 text-indigo-500 group-hover:scale-110 transition-transform" />
                      <span className="text-[9.5px] font-bold text-slate-700">Drag & Drop Image or Click</span>
                      <span className="text-[8px] text-slate-400">PNG, JPG auto-optimized to max 500px</span>
                      <input 
                        id="checkin-file-picker"
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={async (e) => {
                          if (e.target.files && e.target.files[0]) {
                            const file = e.target.files[0];
                            try {
                              const result = await resizeAndCompressImage(file);
                              setCustomMediaUrl(result.dataUrl);
                              setResizeMetrics({
                                originalSize: result.originalSizeKb,
                                resizedSize: result.resizedSizeKb,
                                dimensions: result.dimensions,
                                compressionRatio: result.ratio
                              });
                              triggerVibration([50, 30, 50]);
                            } catch (err) {
                              console.error('Error resizing selected image', err);
                            }
                          }
                        }}
                      />
                    </div>

                    {/* Resize Stats Display */}
                    {resizeMetrics && (
                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-2 space-y-1 text-left animate-fade-in font-mono text-[8.5px]">
                        <div className="flex items-center justify-between text-emerald-800 font-bold">
                          <span className="flex items-center gap-1">⚡ RESIZED & OPTIMIZED:</span>
                          <span className="bg-emerald-100 px-1 rounded text-[7.5px] font-extrabold">-{resizeMetrics.compressionRatio} KB Size</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1 text-emerald-650 font-semibold">
                          <div>Orig: <span className="text-slate-500 font-normal">{resizeMetrics.originalSize}</span></div>
                          <div>New: <span className="text-slate-800 font-bold">{resizeMetrics.resizedSize}</span></div>
                          <div>Specs: <span className="text-slate-500 font-normal">{resizeMetrics.dimensions}</span></div>
                        </div>
                      </div>
                    )}

                    {/* Or Paste input as fallback */}
                    <div className="pt-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="h-px bg-slate-100 flex-1"></div>
                        <span className="text-[8px] text-slate-400 font-bold font-mono">OR SPECIFY DIRECT IMAGE URL</span>
                        <div className="h-px bg-slate-100 flex-1"></div>
                      </div>
                      <input
                        type="text"
                        required
                        value={customMediaUrl}
                        onChange={(e) => {
                          setCustomMediaUrl(e.target.value);
                          setResizeMetrics(null);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 text-xs text-slate-900 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                        placeholder="https://images.unsplash.com/... or paste data URL"
                      />
                    </div>
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
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${rankColor}`}>
                            {rankBadge}
                          </span>
                          {u.avatar_url ? (
                            <img 
                              src={u.avatar_url} 
                              alt={u.username} 
                              className="w-6 h-6 rounded-full object-cover shrink-0 border border-slate-200"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[9px] font-extrabold shrink-0">
                              {u.username?.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-slate-900 flex items-center gap-1.5 flex-wrap">
                              <span>@{u.username}</span>
                              {isSelf && <span className="text-[8px] bg-indigo-600 text-white px-1.5 py-0.5 rounded-sm lowercase font-mono">me</span>}
                              {u.badges && u.badges.length > 0 && (
                                <span className="flex items-center gap-0.5 shrink-0">
                                  {u.badges.map((b: string) => (
                                    <BadgePill key={b} name={b} size="sm" />
                                  ))}
                                </span>
                              )}
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

                <div className="bg-white border border-slate-200 p-4 rounded-2xl flex flex-col gap-3 shadow-sm">
                  <div className="flex items-center gap-4">
                    <div className="relative group shrink-0">
                      <button
                        onClick={() => {
                          setIsEditingAvatar(!isEditingAvatar);
                          setAvatarUrlInput(currentUser.avatar_url || '');
                        }}
                        className="relative block w-14 h-14 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-indigo-500 border border-indigo-200 shadow-xs transition hover:scale-105 active:scale-95 cursor-pointer"
                        title={currentUser.avatar_url ? 'Change profile photo' : 'Add profile photo'}
                      >
                        {currentUser.avatar_url ? (
                          <img 
                            src={currentUser.avatar_url} 
                            alt={currentUser.username} 
                            className="w-full h-full object-cover"
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full bg-indigo-650 text-white flex items-center justify-center font-extrabold text-lg">
                            {currentUser.username.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-slate-950/60 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <Camera className="w-4 h-4 text-white" />
                          <span className="text-[7px] text-white font-extrabold tracking-wider uppercase scale-90 mt-0.5">
                            {currentUser.avatar_url ? 'Edit' : 'Add'}
                          </span>
                        </div>
                      </button>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1">
                          @{currentUser.username}
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                        </h3>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono truncate">{currentUser.email}</p>
                      <div className="mt-1 flex items-center gap-1">
                        <span className="text-[10px] text-indigo-650 bg-indigo-50 border border-indigo-100 rounded-sm px-1.5 py-0.5 font-bold font-mono">
                          Score Tier: {currentUser.total_xp} Total XP
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Avatar upload / edit interface */}
                  {isEditingAvatar && (
                    <div className="border-t border-slate-100 pt-3 mt-1 space-y-3 animate-fade-in text-left">
                      <h4 className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider">
                        Set Profile Picture
                      </h4>
                      
                      {/* Avatar presets selection */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] text-slate-400 block">Choose an instant beautiful avatar:</span>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1">
                          {[
                            { name: 'Dev', url: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80' },
                            { name: 'Des', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&h=120&q=80' },
                            { name: 'Tech', url: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&h=120&q=80' },
                            { name: 'Pro', url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=120&h=120&q=80' },
                            { name: 'Zone', url: 'https://images.unsplash.com/photo-1628157582853-a796fa650a6a?auto=format&fit=crop&w=120&h=120&q=80' }
                          ].map((av) => (
                            <button
                              key={av.name}
                              type="button"
                              onClick={() => {
                                setAvatarUrlInput(av.url);
                                if (onUpdateProfilePicture) {
                                  onUpdateProfilePicture(av.url)
                                    .then(() => {
                                      addToast('Profile avatar updated! 👤', 'success', 'Profile Synced');
                                      setIsEditingAvatar(false);
                                    })
                                    .catch((err) => {
                                      addToast(err.message || 'Failed to update avatar', 'error', 'Profile Error');
                                    });
                                }
                              }}
                              className="flex flex-col items-center gap-1 p-1 rounded-lg border border-slate-100 hover:border-indigo-400 bg-slate-50 transition shrink-0 cursor-pointer"
                            >
                              <img 
                                src={av.url} 
                                alt={av.name} 
                                className="w-8 h-8 rounded-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                              <span className="text-[7.5px] font-mono text-slate-500 font-semibold">{av.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Avatar File Dropzone & Real Resizing Upload */}
                      <div className="space-y-2 border-t border-slate-100 pt-2.5">
                        <label className="block text-[9.5px] text-slate-500 font-mono tracking-wider uppercase mb-1 flex items-center justify-between">
                          <span>Custom Avatar Photo</span>
                          <span className="text-[8px] text-indigo-650 font-bold bg-indigo-50 px-1 py-0.2 rounded font-mono">AUTO-RESIZED ⚡</span>
                        </label>

                        {/* File Selector Zone */}
                        <div 
                          onClick={() => document.getElementById('avatar-file-picker')?.click()}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={async (e) => {
                            e.preventDefault();
                            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                              const file = e.dataTransfer.files[0];
                              if (file.type.startsWith('image/')) {
                                try {
                                  const result = await resizeAndCompressImage(file, 200, 0.75); // Avatars are smaller: max 200px
                                  setAvatarUrlInput(result.dataUrl);
                                  setAvatarResizeMetrics({
                                    originalSize: result.originalSizeKb,
                                    resizedSize: result.resizedSizeKb,
                                    dimensions: result.dimensions,
                                    compressionRatio: result.ratio
                                  });
                                  triggerVibration([50, 30, 50]);
                                } catch (err) {
                                  console.error('Error resizing avatar file', err);
                                }
                              }
                            }
                          }}
                          className="border-2 border-dashed border-slate-200 hover:border-indigo-400 bg-slate-50 hover:bg-indigo-50/20 rounded-xl p-3 flex flex-col items-center justify-center gap-1 cursor-pointer transition-all active:scale-[0.99] group text-center"
                        >
                          <Upload className="w-4 h-4 text-slate-400 group-hover:scale-110 transition-transform" />
                          <span className="text-[9px] font-bold text-slate-700">Drag Avatar or Click to Select</span>
                          <span className="text-[8px] text-slate-400 font-medium">Auto-resized to ultra-fast 200×200px</span>
                          <input 
                            id="avatar-file-picker"
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={async (e) => {
                              if (e.target.files && e.target.files[0]) {
                                const file = e.target.files[0];
                                try {
                                  const result = await resizeAndCompressImage(file, 200, 0.75); // 200px max
                                  setAvatarUrlInput(result.dataUrl);
                                  setAvatarResizeMetrics({
                                    originalSize: result.originalSizeKb,
                                    resizedSize: result.resizedSizeKb,
                                    dimensions: result.dimensions,
                                    compressionRatio: result.ratio
                                  });
                                  triggerVibration([50, 30, 50]);
                                } catch (err) {
                                  console.error('Error resizing avatar file', err);
                                }
                              }
                            }}
                          />
                        </div>

                        {/* Compression stats */}
                        {avatarResizeMetrics && (
                          <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-2 space-y-0.5 text-left font-mono text-[8px]">
                            <div className="flex items-center justify-between text-emerald-800 font-bold">
                              <span>⚡ AVATAR OPTIMIZED:</span>
                              <span className="bg-emerald-100 px-1 rounded">-{avatarResizeMetrics.compressionRatio} Saved</span>
                            </div>
                            <div className="grid grid-cols-2 gap-1 text-emerald-650 font-semibold">
                              <div>Orig: {avatarResizeMetrics.originalSize}</div>
                              <div>New: {avatarResizeMetrics.resizedSize} ({avatarResizeMetrics.dimensions})</div>
                            </div>
                          </div>
                        )}

                        {/* Paste input / Save Form */}
                        <form 
                          onSubmit={async (e) => {
                            e.preventDefault();
                            if (onUpdateProfilePicture && avatarUrlInput.trim() !== '') {
                              try {
                                await onUpdateProfilePicture(avatarUrlInput.trim());
                                addToast('Profile avatar updated! 👤', 'success', 'Profile Synced');
                                setAvatarResizeMetrics(null);
                                setIsEditingAvatar(false);
                              } catch (err: any) {
                                addToast(err.message || 'Failed to update avatar', 'error', 'Profile Error');
                              }
                            }
                          }} 
                          className="space-y-2 mt-1"
                        >
                          <div>
                            <div className="flex items-center gap-1.5 my-1">
                              <div className="h-px bg-slate-100 flex-1"></div>
                              <span className="text-[8px] text-slate-400 font-mono">OR WEB URL</span>
                              <div className="h-px bg-slate-100 flex-1"></div>
                            </div>
                            <div className="flex gap-1.5">
                              <input
                                type="text"
                                value={avatarUrlInput}
                                onChange={(e) => {
                                  setAvatarUrlInput(e.target.value);
                                  setAvatarResizeMetrics(null);
                                }}
                                placeholder="https://images.unsplash.com/photo-..."
                                className="flex-1 bg-slate-50 border border-slate-200 text-[9.5px] text-slate-900 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-sans"
                              />
                              <button
                                type="submit"
                                disabled={!avatarUrlInput.trim()}
                                className="bg-indigo-650 hover:bg-indigo-700 text-white font-bold px-3 py-1.5 rounded-lg text-[9px] uppercase tracking-wide cursor-pointer disabled:opacity-40 active:scale-95 transition"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                  )}
                </div>

                {/* Badge Accomplishment Deck */}
                <div className="bg-slate-50 border border-slate-200/60 p-4 rounded-2xl space-y-2">
                  <h4 className="text-xs font-extrabold text-slate-800 tracking-tight flex items-center gap-1.5 uppercase">
                    <Award className="w-4 h-4 text-amber-500" /> Unlocked Achievements
                  </h4>
                  {currentUser.badges && currentUser.badges.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {currentUser.badges.map(b => (
                        <BadgePill key={b} name={b} />
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-slate-500 italic">No achievements unlocked yet. Finish commitments and earn XP to unlock badges.</p>
                  )}
                </div>

                {/* System Preferences / Vibration Feedback Toggle */}
                <div id="vibration-settings-card" className="bg-white border border-slate-200 p-4 rounded-2xl space-y-3 shadow-sm">
                  <div className="flex items-center gap-1.5 justify-between">
                    <h4 className="text-xs font-bold text-slate-800 tracking-tight flex items-center gap-1.5 uppercase">
                      <Smartphone className="w-4 h-4 text-indigo-500" /> Haptic Settings
                    </h4>
                    <span className="text-[8px] bg-indigo-50 text-indigo-650 font-mono font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                      {vibrationEnabled ? 'ACTIVE' : 'MUTED'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="space-y-0.5 text-left">
                      <span className="text-[11px] font-bold text-slate-700 block leading-tight">Vibration Feedback</span>
                      <span className="text-[8.5px] text-slate-500 block leading-normal">Simulates responsive impulses on check-ins, freezes, and milestones.</span>
                    </div>

                    <button
                      id="vibration-feedback-toggle"
                      type="button"
                      onClick={() => {
                        const nextVal = !vibrationEnabled;
                        setVibrationEnabled(nextVal);
                        localStorage.setItem('betz_vibration', String(nextVal));
                        if (nextVal) {
                          // Quick feedback buzz
                          setTimeout(() => {
                            if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
                              window.navigator.vibrate(80);
                            }
                            setIsVibrating(true);
                            setTimeout(() => setIsVibrating(false), 200);
                          }, 50);
                        }
                      }}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        vibrationEnabled ? 'bg-indigo-650' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
                          vibrationEnabled ? 'translate-x-4' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  {vibrationEnabled && (
                    <div className="flex justify-end pt-1">
                      <button
                        id="test-haptic-pulse-btn"
                        type="button"
                        onClick={() => triggerVibration([80, 50, 80])}
                        className="bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[8.5px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-lg border border-indigo-100 cursor-pointer transition-all active:scale-95 flex items-center gap-1"
                      >
                        <Activity className="w-2.5 h-2.5" /> Test Buzz
                      </button>
                    </div>
                  )}
                </div>

                {/* Simulated Milestone Trigger */}
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/60 p-4 rounded-2xl flex items-center justify-between shadow-xs">
                  <div className="space-y-0.5">
                    <h4 className="text-xs font-extrabold text-amber-900 flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Sensory Rewards
                    </h4>
                    <p className="text-[9px] text-amber-700 leading-normal max-w-[180px]">Test the canvas celebration explosion manually!</p>
                  </div>
                  <button
                    type="button"
                    onClick={triggerTestCelebration}
                    className="bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-[9px] uppercase tracking-wide font-black px-3 py-1.5 rounded-lg shadow-sm transition-all cursor-pointer flex items-center gap-1 shrink-0"
                  >
                    <Trophy className="w-3 h-3 fill-white" /> Trigger
                  </button>
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

                          {/* Streak Freeze Mechanic */}
                          <div className="border-t border-slate-100 pt-2 flex items-center justify-between font-sans text-[10px]">
                            <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                              <Snowflake className="w-3.5 h-3.5 text-indigo-500 animate-pulse" />
                              <span>Streak Freezes: <b className="text-indigo-600 font-bold">{uc.streak_freezes || 0}</b> active</span>
                            </div>
                            
                            {uc.status === 'ACTIVE' && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (currentUser && currentUser.total_xp < 100) {
                                    addToast(`Insufficient XP. You need 100 XP to purchase a Streak Freeze, but you currently have ${currentUser.total_xp} XP.`, 'error', 'Store Error');
                                    return;
                                  }
                                  if (confirm(`Spend 100 XP to buy 1 Streak Freeze for "${uc.challenge_title || 'this challenge'}"?`)) {
                                    if (onPurchaseStreakFreeze) {
                                      onPurchaseStreakFreeze(uc.challenge_id, 100)
                                        .then(() => {
                                          addToast('Streak Freeze purchased successfully! ❄️', 'xp', 'Item Purchased');
                                          triggerVibration(120);
                                        })
                                        .catch((err) => {
                                          addToast(err.message || 'Streak Freeze purchase failed', 'error', 'Store Error');
                                        });
                                    }
                                  }
                                }}
                                className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wide border cursor-pointer transition-all ${
                                  currentUser && currentUser.total_xp >= 100
                                    ? 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700 active:scale-95'
                                    : 'bg-slate-50 border-slate-200 text-slate-400 opacity-65 cursor-not-allowed'
                                }`}
                              >
                                <Zap className="w-2.5 h-2.5 fill-current text-indigo-600" /> Buy Freeze (100 XP)
                              </button>
                            )}
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

      {/* Dynamic Toast Notifications Stack */}
      <div className="absolute bottom-18 left-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 15, scale: 0.93 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.92 }}
              transition={{ type: 'spring', damping: 18, stiffness: 300 }}
              className={`pointer-events-auto p-3 rounded-2xl border flex gap-2.5 items-center shadow-lg backdrop-blur-md select-none ${
                toast.type === 'success' 
                  ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-100'
                  : toast.type === 'error'
                  ? 'bg-rose-950/95 border-rose-500/30 text-rose-100'
                  : toast.type === 'xp'
                  ? 'bg-slate-950/95 border-amber-500/40 text-amber-100'
                  : toast.type === 'streak'
                  ? 'bg-slate-950/95 border-orange-500/40 text-orange-100'
                  : 'bg-slate-950/90 border-slate-700/50 text-slate-100'
              }`}
            >
              <div className="shrink-0">
                {toast.type === 'success' && <CheckCircle className="w-4.5 h-4.5 text-emerald-400" />}
                {toast.type === 'error' && <AlertCircle className="w-4.5 h-4.5 text-rose-400" />}
                {toast.type === 'info' && <Sparkles className="w-4.5 h-4.5 text-indigo-400" />}
                {toast.type === 'xp' && <Zap className="w-4.5 h-4.5 text-amber-400 fill-amber-400/20 animate-pulse" />}
                {toast.type === 'streak' && <Flame className="w-4.5 h-4.5 text-orange-400 fill-orange-400/20" />}
              </div>
              <div className="flex-1 text-left">
                {toast.title && <div className="text-[8px] font-extrabold uppercase tracking-widest opacity-60 mb-0.5">{toast.title}</div>}
                <div className="text-[10.5px] font-semibold leading-tight tracking-wide font-sans">{toast.message}</div>
              </div>
              <button
                type="button"
                onClick={() => setToasts(prev => prev.filter(t => t.id !== toast.id))}
                className="shrink-0 text-[14px] font-bold font-mono opacity-50 hover:opacity-100 px-1 cursor-pointer transition-opacity"
              >
                ×
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Screen bottom bar emulator */}
      <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-slate-300 rounded-full z-50 pointer-events-none" />

    </motion.div>
  );
}
