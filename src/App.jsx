import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Sparkles, 
  Ghost, 
  MapPin, 
  Moon, 
  Wind, 
  Flame, 
  Eye, 
  Share2, 
  Zap, 
  Heart, 
  Shield, 
  Lock, 
  X,
  CreditCard,
  User,
  Copy,
  Check,
  Loader2
} from 'lucide-react';

// --- Constants & Data ---
const MOODS = [
  { id: 'chaos', label: 'Chaos', color: 'from-pink-500 to-rose-500', icon: Wind, description: 'You\'re manifesting chaos. We support that.' },
  { id: 'void', label: 'Void', color: 'from-gray-900 to-black', icon: Moon, description: 'Embrace the emptiness. Something waits.' },
  { id: 'electric', label: 'Electric', color: 'from-yellow-400 to-orange-500', icon: Zap, description: 'Your energy is charged. Channel it.' },
  { id: 'tender', label: 'Tender', color: 'from-pink-300 to-purple-400', icon: Heart, description: 'Softness is strength. Honor it.' },
  { id: 'toxic', label: 'Toxic', color: 'from-green-400 to-emerald-600', icon: Ghost, description: 'Your aura just screamed. Want to know why?' },
  { id: 'divine', label: 'Divine', color: 'from-indigo-400 to-cyan-400', icon: Sparkles, description: 'The sacred calls. Answer.' },
];

const TAROT_CARDS = [
  { name: "The Fool", archetype: "New Beginnings", roast: "You're walking off a cliff and calling it 'manifesting'.", light: "Trust the unknown. Leap." },
  { name: "The Tower", archetype: "Sudden Change", roast: "Your foundation was trash anyway. Let it burn.", light: "Liberation through destruction." },
  { name: "The High Priestess", archetype: "Intuition", roast: "Stop texting them. You already know the answer.", light: "Listen to the silence." },
  { name: "Death", archetype: "Transformation", roast: "That version of you is expired. Bury it.", light: "Endings are just fertilizer." },
  { name: "The Devil", archetype: "Addiction", roast: "You are your own toxicity. Cute chains though.", light: "Reclaim your power from desire." },
  { name: "The Star", archetype: "Hope", roast: "Stop wishing, start doing, space cadet.", light: "Healing is available now." },
  { name: "The Moon", archetype: "Illusion", roast: "You're lost in your own delusion. Classic.", light: "Trust your intuition over fear." },
  { name: "The Sun", archetype: "Joy", roast: "Your optimism is showing. Cringe but valid.", light: "Radiate your authentic light." },
  { name: "The Hermit", archetype: "Solitude", roast: "You ghost everyone and call it 'self-care'.", light: "Wisdom comes from within." },
  { name: "The Lovers", archetype: "Choice", roast: "You're choosing chaos again. We see you.", light: "Align with your highest values." },
];

// --- Utility Components ---
const GlassCard = ({ children, className = "", intense = false, hoverable = false, onClick }) => (
  <div 
    className={`
      backdrop-blur-xl border border-white/10 rounded-3xl transition-all duration-500 
      ${intense ? 'bg-white/10 shadow-[0_0_30px_rgba(255,255,255,0.1)]' : 'bg-black/40'} 
      ${hoverable ? 'hover:border-white/30 hover:shadow-[0_0_40px_rgba(168,85,247,0.2)] hover:scale-[1.02] cursor-pointer active:scale-[0.98]' : ''}
      ${onClick ? 'cursor-pointer' : ''}
      ${className}
    `}
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(e); } : undefined}
  >
    {children}
  </div>
);

const Button = ({ children, onClick, variant = 'primary', className = "", disabled = false, loading = false }) => {
  const base = "px-6 py-3 rounded-xl font-mono text-sm tracking-wider uppercase transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden group focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black";
  const styles = {
    primary: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg hover:shadow-purple-500/50 border border-white/10 hover:border-white/30 hover:scale-105 animate-gradient",
    secondary: "bg-white/5 border border-white/20 text-white hover:bg-white/10 hover:border-white/30 hover:scale-105",
    ghost: "text-white/60 hover:text-white hover:bg-white/5 hover:scale-105",
    danger: "bg-gradient-to-r from-red-900 to-red-600 text-white border border-red-500/30 hover:border-red-400/50 hover:scale-105"
  };
  return (
    <button 
      onClick={onClick} 
      className={`${base} ${styles[variant]} ${className}`} 
      disabled={disabled || loading}
      aria-busy={loading}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </span>
      {variant === 'primary' && !loading && (
        <span className="absolute inset-0 bg-gradient-to-r from-purple-400/0 via-white/10 to-purple-400/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></span>
      )}
    </button>
  );
};

// Notification Queue System
const useNotificationQueue = () => {
  const [notifications, setNotifications] = useState([]);
  const timeoutRef = useRef(null);

  const addNotification = useCallback((message, type = 'info') => {
    const id = Date.now();
    const notification = { id, message, type };
    
    setNotifications(prev => [...prev, notification]);
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 3000);
    
    return id;
  }, []);

  return { notifications, addNotification };
};

// Haptic Feedback Simulation
const triggerHaptic = (type = 'light') => {
  if ('vibrate' in navigator) {
    const patterns = {
      light: 10,
      medium: 20,
      heavy: 30,
      success: [10, 50, 10],
      error: [20, 50, 20, 50, 20]
    };
    navigator.vibrate(patterns[type] || patterns.light);
  }
};

// --- Main App Component ---
export default function App() {
  const [userData, setUserData] = useState(() => {
    try {
      const saved = localStorage.getItem('mysticLoop_userData');
      return saved ? JSON.parse(saved) : { 
        coins: 100, 
        streak: 1, 
        altarItems: ['candle_basic'],
        mood: null,
        readings: [],
        lastCheckIn: new Date().toDateString()
      };
    } catch (e) {
      return { 
        coins: 100, 
        streak: 1, 
        altarItems: ['candle_basic'],
        mood: null,
        readings: [],
        lastCheckIn: new Date().toDateString()
      };
    }
  });
  
  const [view, setView] = useState('loading');
  const [currentMood, setCurrentMood] = useState(null);
  const [ritualProgress, setRitualProgress] = useState(0);
  const [reading, setReading] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [shadowSendUrl, setShadowSendUrl] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const ritualInterval = useRef(null);
  const { notifications, addNotification } = useNotificationQueue();

  // Check daily streak
  useEffect(() => {
    const today = new Date().toDateString();
    if (userData.lastCheckIn !== today) {
      const daysSince = Math.floor((new Date() - new Date(userData.lastCheckIn)) / (1000 * 60 * 60 * 24));
      if (daysSince === 1) {
        setUserData(prev => ({ ...prev, streak: prev.streak + 1, lastCheckIn: today }));
        addNotification(`Streak continues! Day ${userData.streak + 1}`, 'success');
      } else if (daysSince > 1) {
        setUserData(prev => ({ ...prev, streak: 1, lastCheckIn: today }));
        addNotification('Streak reset. Start fresh.', 'info');
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('mysticLoop_userData', JSON.stringify(userData));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }, [userData]);

  // Initialize - reduced delay
  useEffect(() => {
    const timer = setTimeout(() => {
      if (userData.mood) {
        setCurrentMood(MOODS.find(m => m.id === userData.mood));
        setView('dashboard');
      } else {
        setView('mood');
      }
    }, 800);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Cleanup ritual interval on unmount
  useEffect(() => {
    return () => {
      if (ritualInterval.current) {
        clearInterval(ritualInterval.current);
      }
    };
  }, []);

  // Handle ESC key for modals
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        if (showPaywall) {
          setShowPaywall(false);
        }
        if (view === 'shadowSend') {
          setView('dashboard');
        }
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showPaywall, view]);
  
  // Handle shadow send URL from query params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shadowId = params.get('shadow');
    if (shadowId) {
      try {
        const shadowData = localStorage.getItem(`shadow_${shadowId}`);
        if (shadowData) {
          const data = JSON.parse(shadowData);
          addNotification("A Shadow Send awaits. Join the coven to reveal the reading.", 'info');
        }
      } catch (e) {
        console.warn('Failed to load shadow send:', e);
      }
    }
  }, []);

  // --- Logic Functions ---
  const handleMoodSelect = useCallback((moodId) => {
    if (isProcessing) return;
    setIsProcessing(true);
    triggerHaptic('light');
    
    const mood = MOODS.find(m => m.id === moodId);
    setCurrentMood(mood);
    setUserData(prev => ({ ...prev, mood: moodId }));
    addNotification(mood.description, 'info');
    
    setTimeout(() => {
      setView('dashboard');
      setIsProcessing(false);
    }, 300);
  }, [isProcessing, addNotification]);

  const startRitual = useCallback(() => {
    if (isProcessing) return;
    setRitualProgress(0);
    setView('ritual');
    triggerHaptic('light');
  }, [isProcessing]);

  const handleRitualPress = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (ritualInterval.current) {
      clearInterval(ritualInterval.current);
    }
    
    triggerHaptic('medium');
    ritualInterval.current = setInterval(() => {
      setRitualProgress(prev => {
        const newProgress = Math.min(prev + 2, 100);
        
        // Haptic feedback at milestones
        if (newProgress === 25 || newProgress === 50 || newProgress === 75) {
          triggerHaptic('light');
        }
        
        if (newProgress >= 100) {
          if (ritualInterval.current) {
            clearInterval(ritualInterval.current);
            ritualInterval.current = null;
          }
          triggerHaptic('success');
          completeRitual();
          return 100;
        }
        return newProgress;
      });
    }, 50);
  }, []);

  const handleRitualRelease = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (ritualInterval.current) {
      clearInterval(ritualInterval.current);
      ritualInterval.current = null;
    }
    if (ritualProgress < 100) {
      setRitualProgress(0);
      triggerHaptic('error');
      addNotification('Ritual interrupted. Hold longer to complete.', 'info');
    }
  }, [ritualProgress, addNotification]);

  const generateAuraVisual = (seed, mood) => {
    const hue1 = (seed * 360) % 360;
    const hue2 = ((seed * 360) + 120) % 360;
    const hue3 = ((seed * 360) + 240) % 360;
    
    return {
      gradient1: `hsl(${hue1}, 70%, 50%)`,
      gradient2: `hsl(${hue2}, 70%, 50%)`,
      gradient3: `hsl(${hue3}, 70%, 50%)`,
      position: seed * 100,
      rotation: seed * 360
    };
  };

  const completeRitual = useCallback(() => {
    const randomCard = TAROT_CARDS[Math.floor(Math.random() * TAROT_CARDS.length)];
    const isRoast = Math.random() > 0.5;
    const auraSeed = Math.random();
    const auraVisual = generateAuraVisual(auraSeed, currentMood);
    
    const newReading = {
      id: Date.now(),
      card: randomCard,
      type: isRoast ? 'roast' : 'mystic',
      timestamp: new Date(),
      auraSeed,
      auraVisual,
      mood: currentMood?.id || 'void',
      shareable: true
    };
    
    setReading(newReading);
    setUserData(prev => ({
      ...prev,
      coins: prev.coins + 10,
      readings: [...prev.readings, newReading]
    }));

    addNotification('Ritual complete. +10 Aether Coins earned.', 'success');
    setTimeout(() => setView('result'), 500);
  }, [currentMood, addNotification]);

  const handleShare = useCallback(async () => {
    if (!reading || isLoading) return;
    setIsLoading(true);
    
    const shareData = {
      title: `My Mystic Loop Reading: ${reading.card.name}`,
      text: reading.type === 'roast' ? reading.card.roast : reading.card.light,
      url: window.location.href
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
        addNotification("Reading shared to the void", 'success');
        triggerHaptic('success');
      } else {
        await copyToClipboard();
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        await copyToClipboard();
      }
    } finally {
      setIsLoading(false);
    }
  }, [reading, isLoading, addNotification]);

  const copyToClipboard = useCallback(async () => {
    if (!reading) return;
    const text = `🔮 ${reading.card.name} - ${reading.type === 'roast' ? reading.card.roast : reading.card.light}\n\nFrom Mystic Loop: The Algorithmic Coven`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        addNotification("Copied to clipboard", 'success');
        triggerHaptic('light');
        setTimeout(() => setCopied(false), 2000);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        addNotification("Copied to clipboard", 'success');
        triggerHaptic('light');
        setTimeout(() => setCopied(false), 2000);
      }
    } catch (err) {
      addNotification("Failed to copy. Please try again.", 'error');
    }
  }, [reading, addNotification]);

  const createShadowSend = useCallback(() => {
    if (!reading || isLoading) return;
    setIsLoading(true);
    
    try {
      const shareId = btoa(`${reading.id}-${Date.now()}-${Math.random()}`).replace(/[^a-zA-Z0-9]/g, '').substring(0, 16);
      const shareUrl = `${window.location.origin}${window.location.pathname}?shadow=${shareId}`;
      
      try {
        localStorage.setItem(`shadow_${shareId}`, JSON.stringify({
          card: reading.card.name,
          archetype: reading.card.archetype,
          type: reading.type,
          blurred: true,
          timestamp: new Date().toISOString()
        }));
      } catch (e) {
        addNotification("Failed to create share link. Please try again.", 'error');
        setIsLoading(false);
        return;
      }
      
      setShadowSendUrl(shareUrl);
      setView('shadowSend');
      triggerHaptic('light');
    } catch (err) {
      addNotification("Failed to create share link. Please try again.", 'error');
    } finally {
      setIsLoading(false);
    }
  }, [reading, isLoading, addNotification]);

  // --- Sub-Components (Views) ---
  const MoodCompass = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center space-y-8 animate-in fade-in duration-700 relative">
      <div className="absolute inset-0 particle-bg opacity-30" />
      <div className="space-y-4 relative z-10">
        <h1 className="font-serif text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-indigo-200 animate-gradient">
          State Your Intent
        </h1>
        <p className="font-mono text-xs text-white/60 tracking-[0.3em] uppercase">
          The Algorithm is Listening
        </p>
        <div className="w-24 h-1 mx-auto bg-gradient-to-r from-transparent via-purple-500 to-transparent rounded-full mt-4" />
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-md relative z-10">
        {MOODS.map((mood, index) => (
          <button
            key={mood.id}
            onClick={() => handleMoodSelect(mood.id)}
            disabled={isProcessing}
            style={{ animationDelay: `${index * 100}ms` }}
            className={`group relative overflow-hidden p-6 rounded-2xl border border-white/10 hover:border-white/50 transition-all duration-500 hover:scale-[1.05] hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed`}
            aria-label={`Select ${mood.label} mood`}
          >
            <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${mood.color} group-hover:opacity-50 transition-opacity duration-500`} />
            <div className={`absolute inset-0 bg-gradient-to-br ${mood.color} opacity-0 group-hover:opacity-20 blur-xl transition-opacity duration-500`} />
            <div className="relative z-10 flex flex-col items-center gap-3">
              <mood.icon className="w-10 h-10 text-white group-hover:scale-110 transition-transform duration-300 group-hover:drop-shadow-[0_0_15px_currentColor]" />
              <span className="font-serif text-lg text-white group-hover:text-glow transition-all duration-300">{mood.label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const Dashboard = () => (
    <div className="min-h-screen pb-24 p-4 space-y-6 animate-in slide-in-from-bottom-10 duration-500 relative">
      <div className="absolute inset-0 particle-bg opacity-20" />
      
      <div className="flex justify-between items-center pt-8 relative z-10">
        <div>
          <h2 className="font-serif text-3xl text-white mb-1 bg-gradient-to-r from-white via-purple-200 to-white bg-clip-text text-transparent">
            The Loop
          </h2>
          <p className="text-white/50 text-xs font-mono tracking-wider">{new Date().toLocaleDateString()} • MOON WAXING</p>
        </div>
        <div className="flex items-center gap-2 glass-enhanced px-4 py-2 rounded-full border border-orange-500/30 hover:border-orange-400/50 transition-all duration-300 hover:scale-105 group">
          <Flame className="w-5 h-5 text-orange-400 group-hover:text-orange-300 transition-colors drop-shadow-[0_0_10px_rgba(249,115,22,0.5)]" />
          <span className="font-mono text-sm font-bold text-white">{userData.streak}</span>
          <span className="font-mono text-xs text-white/60 ml-1">days</span>
        </div>
      </div>

      <GlassCard className="p-8 relative overflow-hidden group cursor-pointer" intense hoverable onClick={startRitual}>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 via-indigo-900/50 to-blue-900/50 opacity-50 group-hover:opacity-100 transition-opacity duration-1000 animate-gradient" />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-purple-500/10 to-indigo-500/0 group-hover:via-purple-500/20 transition-all duration-1000" />
        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          <div className="w-28 h-28 rounded-full bg-white/5 border-2 border-purple-500/30 flex items-center justify-center relative group-hover:border-purple-400/60 transition-all duration-500">
             <div className="absolute inset-0 rounded-full border-t-2 border-purple-500 animate-spin-slow opacity-60" />
             <div className="absolute inset-0 rounded-full border-r-2 border-pink-500 animate-spin-slow opacity-40" style={{ animationDirection: 'reverse', animationDuration: '4s' }} />
             <Eye className="w-12 h-12 text-white/90 group-hover:text-white group-hover:scale-110 transition-all duration-300 drop-shadow-[0_0_20px_rgba(168,85,247,0.5)]" />
          </div>
          <div>
            <h3 className="font-serif text-3xl text-white mb-3 bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text text-transparent">
              Daily Divination
            </h3>
            <p className="text-white/70 text-sm max-w-[240px] mx-auto leading-relaxed">
              Your pattern is incomplete. Press to synchronize with the void.
            </p>
          </div>
          <Button onClick={startRitual} className="mt-2" disabled={isProcessing}>Initiate Sequence</Button>
        </div>
      </GlassCard>

      <div className="grid grid-cols-2 gap-4 relative z-10">
        <GlassCard 
          className="p-5 flex flex-col items-center text-center gap-3 cursor-pointer group" 
          hoverable
          onClick={() => setView('altar')}
        >
           <div className="p-4 rounded-full bg-gradient-to-br from-orange-500/30 to-red-500/30 text-orange-300 group-hover:from-orange-500/50 group-hover:to-red-500/50 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(249,115,22,0.4)]">
             <Flame className="w-7 h-7" />
           </div>
           <span className="font-serif text-white text-base group-hover:text-orange-300 transition-colors">Digital Altar</span>
        </GlassCard>
        
        <GlassCard 
          className="p-5 flex flex-col items-center text-center gap-3 cursor-pointer group" 
          hoverable
          onClick={() => setShowPaywall(true)}
        >
           <div className="p-4 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 text-indigo-300 group-hover:from-indigo-500/50 group-hover:to-purple-500/50 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(99,102,241,0.4)]">
             <User className="w-7 h-7" />
           </div>
           <span className="font-serif text-white text-base group-hover:text-indigo-300 transition-colors">Bond Roast</span>
        </GlassCard>

        <GlassCard 
          className="p-5 flex flex-col items-center text-center gap-3 cursor-pointer group" 
          hoverable
          onClick={() => setView('sanctuary')}
        >
           <div className="p-4 rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-500/30 text-emerald-300 group-hover:from-emerald-500/50 group-hover:to-teal-500/50 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(16,185,129,0.4)]">
             <MapPin className="w-7 h-7" />
           </div>
           <span className="font-serif text-white text-base group-hover:text-emerald-300 transition-colors">Sanctuary</span>
        </GlassCard>

        <GlassCard 
          className="p-5 flex flex-col items-center text-center gap-3 cursor-pointer group" 
          hoverable
          onClick={() => setShowPaywall(true)}
        >
           <div className="p-4 rounded-full bg-gradient-to-br from-rose-500/30 to-pink-500/30 text-rose-300 group-hover:from-rose-500/50 group-hover:to-pink-500/50 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(244,63,94,0.4)]">
             <CreditCard className="w-7 h-7" />
           </div>
           <span className="font-serif text-white text-base group-hover:text-rose-300 transition-colors">SOS Read</span>
           <span className="font-mono text-xs text-white/50">$1.99</span>
        </GlassCard>
      </div>
    </div>
  );

  const RitualScreen = () => (
    <div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black select-none"
      style={{ touchAction: 'none', userSelect: 'none' }}
      onMouseDown={handleRitualPress}
      onMouseUp={handleRitualRelease}
      onMouseLeave={handleRitualRelease}
      onTouchStart={handleRitualPress}
      onTouchEnd={handleRitualRelease}
      onTouchCancel={handleRitualRelease}
      role="application"
      aria-label="Ritual completion screen"
    >
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
      
      <div 
        className="absolute w-[500px] h-[500px] rounded-full blur-[100px] transition-all duration-100 ease-linear"
        style={{
          background: `conic-gradient(from 0deg, #4f46e5, #ec4899, #8b5cf6, #4f46e5)`,
          transform: `scale(${1 + (ritualProgress / 50)}) rotate(${ritualProgress * 3.6}deg)`,
          opacity: 0.3 + (ritualProgress / 200)
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 text-center space-y-12">
        <h2 className="font-serif text-3xl text-white tracking-widest animate-pulse">
          {ritualProgress > 0 ? "HOLD TO MANIFEST" : "TOUCH & HOLD"}
        </h2>
        
        <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
           <svg className="absolute inset-0 w-full h-full -rotate-90" aria-hidden="true">
             <circle cx="80" cy="80" r="70" stroke="white" strokeWidth="2" fill="transparent" className="opacity-10" />
             <circle 
                cx="80" cy="80" r="70" 
                stroke="#d8b4fe" 
                strokeWidth="4" 
                fill="transparent"
                strokeDasharray="440"
                strokeDashoffset={440 - (440 * ritualProgress) / 100}
                className="transition-all duration-75 ease-linear"
             />
           </svg>
           <div 
             className={`w-24 h-24 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-200 ${ritualProgress > 0 ? 'scale-90 bg-white/20' : 'scale-100'}`}
             role="progressbar"
             aria-valuenow={ritualProgress}
             aria-valuemin={0}
             aria-valuemax={100}
             aria-label={`Ritual progress: ${ritualProgress}%`}
           >
              <Sparkles className={`w-8 h-8 text-white transition-opacity ${ritualProgress > 0 ? 'opacity-100' : 'opacity-50'}`} />
           </div>
        </div>

        <p className="font-mono text-xs text-white/40 uppercase tracking-widest">
          {ritualProgress}% Manifested
        </p>
      </div>
    </div>
  );

  const ResultScreen = () => {
    useEffect(() => {
      if (!reading) {
        setView('dashboard');
      }
    }, [reading]);
    
    if (!reading) return null;
    
    return (
      <div className="min-h-screen p-6 pb-24 flex flex-col items-center justify-center space-y-8 animate-in zoom-in-95 duration-700">
        <div className="relative w-64 h-80 rounded-2xl overflow-hidden border border-white/20 shadow-2xl">
           <div className="absolute inset-0 bg-black" />
           <div 
             className="absolute inset-0 blur-xl opacity-80"
             style={{
                background: `
                  radial-gradient(circle at ${reading.auraVisual.position}% 20%, ${reading.auraVisual.gradient1}, transparent),
                  radial-gradient(circle at ${100 - reading.auraVisual.position}% 80%, ${reading.auraVisual.gradient2}, transparent),
                  conic-gradient(from ${reading.auraVisual.rotation}deg, ${reading.auraVisual.gradient3}, #000, ${reading.auraVisual.gradient1})
                `
             }}
           />
           <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10 bg-black/20">
             <h2 className="font-serif text-3xl text-white font-bold mb-2">{reading.card.name}</h2>
             <span className="font-mono text-xs text-white/70 tracking-widest uppercase border border-white/20 px-2 py-1 rounded-full">
                {reading.card.archetype}
             </span>
           </div>
        </div>

        <GlassCard className="p-6 w-full max-w-md space-y-4">
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <span className="text-white/50 font-mono text-xs uppercase">Interpretation</span>
            <span className={`text-xs font-bold px-2 py-1 rounded bg-white/10 ${reading.type === 'roast' ? 'text-red-400' : 'text-purple-400'}`}>
              {reading.type === 'roast' ? 'SHADOW ROAST' : 'MYSTIC GUIDANCE'}
            </span>
          </div>
          <p className="text-white text-lg font-serif leading-relaxed">
            "{reading.type === 'roast' ? reading.card.roast : reading.card.light}"
          </p>
        </GlassCard>

        <div className="flex gap-4 w-full max-w-md">
          <Button className="flex-1 flex items-center justify-center gap-2" variant="primary" onClick={handleShare} loading={isLoading}>
             <Share2 className="w-4 h-4" /> Share
          </Button>
          <Button className="flex-1 flex items-center justify-center gap-2" variant="secondary" onClick={createShadowSend} loading={isLoading}>
             <Ghost className="w-4 h-4" /> Shadow Send
          </Button>
        </div>
        
        <Button className="w-full max-w-md" variant="ghost" onClick={() => setView('dashboard')}>
           Return to the Loop
        </Button>
      </div>
    );
  };

  const AltarView = () => (
    <div className="min-h-screen p-6 pb-24 space-y-6 animate-in fade-in">
        <div className="text-center space-y-2 pt-8">
            <h2 className="font-serif text-3xl text-white">Your Altar</h2>
            <p className="font-mono text-xs text-white/50">Keep the flame alive to invite stronger energies.</p>
        </div>

        <div className="h-64 relative rounded-t-full border-b border-white/20 bg-gradient-to-b from-transparent to-purple-900/20 flex items-end justify-center p-8 gap-4">
            {Array.from({ length: Math.min(5, userData.streak || 1) }).map((_, i) => (
                <div key={i} className="flex flex-col items-center">
                    <div className="w-2 h-4 bg-orange-400 rounded-full blur-[2px] animate-pulse mb-1" />
                    <div className="w-4 h-16 bg-gradient-to-b from-white to-gray-300 rounded-sm opacity-80" />
                </div>
            ))}
             {userData.streak > 5 && (
                 <div className="font-mono text-xs text-white/50 absolute bottom-2 right-4">
                    + {userData.streak - 5} more
                 </div>
             )}
        </div>

        <div className="grid grid-cols-2 gap-4">
            <GlassCard className="p-4 text-center">
                <div className="text-3xl font-serif text-white mb-1">{userData.streak}</div>
                <div className="text-xs font-mono text-white/50 uppercase">Day Streak</div>
            </GlassCard>
            <GlassCard className="p-4 text-center">
                <div className="text-3xl font-serif text-white mb-1">{userData.coins}</div>
                <div className="text-xs font-mono text-white/50 uppercase">Aether Coins</div>
            </GlassCard>
        </div>

        <GlassCard className="p-6">
            <h3 className="font-serif text-white mb-4">Grimoire Collection</h3>
            <div className="grid grid-cols-4 gap-2">
                {userData.readings.length > 0 ? (
                  userData.readings.slice(-8).map((reading, idx) => (
                    <div key={reading.id || idx} className="aspect-square rounded-lg bg-white/5 border border-white/10 overflow-hidden relative group cursor-pointer hover:border-white/30 transition-all">
                        <div 
                          className="w-full h-full opacity-70 transition-opacity group-hover:opacity-100"
                          style={{
                            background: `
                              radial-gradient(circle at ${reading.auraVisual?.position || 50}% 20%, ${reading.auraVisual?.gradient1 || '#4f46e5'}, transparent),
                              radial-gradient(circle at ${100 - (reading.auraVisual?.position || 50)}% 80%, ${reading.auraVisual?.gradient2 || '#ec4899'}, transparent)
                            `
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="text-xs font-serif text-white/90 bg-black/50 px-2 py-1 rounded">{reading.card.name}</span>
                        </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-4 text-center py-12">
                    <Ghost className="w-12 h-12 mx-auto mb-4 text-white/20" />
                    <p className="text-white/40 font-mono text-xs mb-2">No readings yet.</p>
                    <p className="text-white/30 font-mono text-xs">Complete your first ritual to begin your collection.</p>
                  </div>
                )}
            </div>
        </GlassCard>
        <Button className="w-full" variant="secondary" onClick={() => setView('dashboard')}>Back to the Loop</Button>
    </div>
  );

  const SanctuaryMap = () => (
      <div className="min-h-screen relative bg-gray-900 pb-28">
          <div className="absolute inset-0 opacity-40">
               {/* Enhanced Map Background */}
               <div className="w-full h-full bg-[radial-gradient(#444_1px,transparent_1px)] [background-size:20px_20px]"></div>
          </div>
          
          <div className="absolute inset-0 particle-bg opacity-20" />
          
          {/* Enhanced POIs with pulsing effects */}
          <div className="absolute top-1/4 left-1/4 animate-float">
              <div className="relative">
                <MapPin className="w-10 h-10 text-purple-400 drop-shadow-[0_0_15px_rgba(168,85,247,0.8)] relative z-10" />
                <div className="absolute inset-0 w-10 h-10 bg-purple-500/30 rounded-full blur-xl animate-pulse" />
              </div>
          </div>
          <div className="absolute top-1/2 left-1/2 animate-float" style={{ animationDelay: '0.5s' }}>
              <div className="relative">
                <MapPin className="w-10 h-10 text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.8)] relative z-10" />
                <div className="absolute inset-0 w-10 h-10 bg-emerald-500/30 rounded-full blur-xl animate-pulse" />
              </div>
          </div>
          <div className="absolute top-2/3 right-1/4 animate-float" style={{ animationDelay: '1s' }}>
              <div className="relative">
                <MapPin className="w-10 h-10 text-pink-400 drop-shadow-[0_0_15px_rgba(236,72,153,0.8)] relative z-10" />
                <div className="absolute inset-0 w-10 h-10 bg-pink-500/30 rounded-full blur-xl animate-pulse" />
              </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 pb-32 bg-gradient-to-t from-black via-black/95 to-transparent space-y-4">
              <GlassCard className="p-5 flex items-start gap-4" intense>
                  <div className="p-3 bg-emerald-500/20 rounded-lg shrink-0">
                    <Shield className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                      <h3 className="text-white font-serif text-lg mb-1">Ghost Mode Active</h3>
                      <p className="text-white/60 text-xs leading-relaxed">Your exact location is fuzzed by 400m. Only verified covens can see your true signal.</p>
                  </div>
              </GlassCard>
              <Button className="w-full" variant="secondary" onClick={() => setView('dashboard')}>Exit Sanctuary</Button>
          </div>
      </div>
  );

  const ShadowSendView = () => (
    <div className="min-h-screen p-6 flex flex-col items-center justify-center space-y-6 animate-in fade-in">
      <GlassCard className="p-8 w-full max-w-md space-y-6" intense>
        <div className="text-center space-y-2">
          <Ghost className="w-12 h-12 mx-auto text-purple-400" />
          <h2 className="font-serif text-2xl text-white">Shadow Send</h2>
          <p className="text-white/60 text-sm">Send a karmic ping. They won't see the full reading until they join.</p>
        </div>
        
        <div className="space-y-4">
          <div className="p-4 bg-black/40 rounded-xl border border-white/10">
            <p className="text-white/40 font-mono text-xs mb-2">SHARABLE LINK</p>
            <div className="flex items-center gap-2">
              <input 
                type="text" 
                value={shadowSendUrl || ''} 
                readOnly
                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono focus:outline-none focus:ring-2 focus:ring-purple-500"
                onClick={(e) => e.target.select()}
                aria-label="Shadow send shareable link"
              />
              <button
                onClick={async () => {
                  if (!shadowSendUrl) return;
                  try {
                    if (navigator.clipboard && navigator.clipboard.writeText) {
                      await navigator.clipboard.writeText(shadowSendUrl);
                      setCopied(true);
                      addNotification("Link copied", 'success');
                      triggerHaptic('light');
                      setTimeout(() => setCopied(false), 2000);
                    } else {
                      const textArea = document.createElement('textarea');
                      textArea.value = shadowSendUrl;
                      textArea.style.position = 'fixed';
                      textArea.style.opacity = '0';
                      document.body.appendChild(textArea);
                      textArea.select();
                      document.execCommand('copy');
                      document.body.removeChild(textArea);
                      setCopied(true);
                      addNotification("Link copied", 'success');
                      triggerHaptic('light');
                      setTimeout(() => setCopied(false), 2000);
                    }
                  } catch (err) {
                    addNotification("Failed to copy. Please select and copy manually.", 'error');
                  }
                }}
                className="p-2 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors active:scale-95 focus:outline-none focus:ring-2 focus:ring-purple-500"
                aria-label="Copy link"
              >
                {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-white" />}
              </button>
            </div>
          </div>
          
          <p className="text-white/40 text-xs text-center">
            The recipient will see a blurred preview. Full reading unlocks after app install.
          </p>
        </div>
        
        <div className="flex gap-4">
          <Button className="flex-1" variant="primary" onClick={async () => {
            if (!shadowSendUrl || isLoading) return;
            setIsLoading(true);
            if (navigator.share) {
              try {
                await navigator.share({ 
                  url: shadowSendUrl, 
                  title: 'A reading from Mystic Loop',
                  text: 'Someone sent you a karmic ping. Curious?'
                });
                addNotification("Link shared", 'success');
                triggerHaptic('success');
              } catch (err) {
                if (err.name !== 'AbortError') {
                  await copyToClipboard();
                }
              }
            } else {
              try {
                await navigator.clipboard.writeText(shadowSendUrl);
                setCopied(true);
                addNotification("Link copied to clipboard", 'success');
                triggerHaptic('light');
                setTimeout(() => setCopied(false), 2000);
              } catch (err) {
                addNotification("Please copy the link manually", 'error');
              }
            }
            setIsLoading(false);
          }} loading={isLoading}>
            Share Link
          </Button>
          <Button className="flex-1" variant="secondary" onClick={() => setView('dashboard')}>
            Close
          </Button>
        </div>
      </GlassCard>
    </div>
  );

  const PaywallModal = () => (
      <div 
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in slide-in-from-bottom-10"
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowPaywall(false);
          }
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="paywall-title"
      >
          <GlassCard className="w-full max-w-sm p-6 space-y-6" intense>
              <div className="flex justify-between items-start">
                  <h2 id="paywall-title" className="text-2xl font-serif text-white bg-gradient-to-r from-purple-200 to-pink-200 bg-clip-text text-transparent">Upgrade to Mystic</h2>
                  <button 
                    onClick={() => setShowPaywall(false)}
                    className="p-1 hover:bg-white/10 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
                    aria-label="Close paywall"
                  >
                    <X className="text-white/50 w-5 h-5" />
                  </button>
              </div>
              <div className="space-y-4">
                  <div className="p-3 bg-white/5 rounded-lg flex items-center gap-3">
                      <Zap className="text-yellow-400" />
                      <div>
                        <div className="text-white text-sm font-medium">Vedic & Deep Astrology</div>
                        <div className="text-white/50 text-xs mt-0.5">Beyond the basics</div>
                      </div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg flex items-center gap-3">
                      <Ghost className="text-purple-400" />
                      <div>
                        <div className="text-white text-sm font-medium">See Who Manifested You</div>
                        <div className="text-white/50 text-xs mt-0.5">The algorithm sees all</div>
                      </div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg flex items-center gap-3">
                      <Flame className="text-orange-400" />
                      <div>
                        <div className="text-white text-sm font-medium">Unlimited SOS Readings</div>
                        <div className="text-white/50 text-xs mt-0.5">Crisis? We got you.</div>
                      </div>
                  </div>
              </div>
              <Button className="w-full font-bold" onClick={() => {
                addNotification("Payment integration coming soon", 'info');
                setShowPaywall(false);
              }}>Unlock for $9.99/mo</Button>
              <p className="text-center text-white/40 text-xs font-mono italic">The void demands its price. Worth it.</p>
          </GlassCard>
      </div>
  );

  // --- Main Render Switch ---
  return (
    <div className="bg-black min-h-screen font-sans overflow-hidden relative">
      <div className="fixed inset-0 pointer-events-none">
          <div className={`absolute inset-0 transition-opacity duration-1000 ${currentMood ? 'opacity-30' : 'opacity-10'}`} 
            style={{ 
                background: currentMood ? `linear-gradient(to bottom right, transparent, ${currentMood.color.split(' ')[1].replace('to-', '#')})` : 'none'
            }} 
          />
          <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-purple-900/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-indigo-900/20 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      {/* Notification Queue */}
      <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 space-y-2 flex flex-col items-center">
        {notifications.map((notif, idx) => (
          <div 
            key={notif.id} 
            className="animate-in slide-in-from-top-4 fade-in"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <GlassCard className={`px-6 py-2 rounded-full flex items-center gap-2 ${
              notif.type === 'success' ? 'border-green-500/30 text-emerald-400' :
              notif.type === 'error' ? 'border-red-500/30 text-red-400' :
              'border-blue-500/30 text-blue-400'
            }`}>
              {notif.type === 'success' && <Check className="w-4 h-4" />}
              {notif.type === 'error' && <X className="w-4 h-4" />}
              {notif.type === 'info' && <Sparkles className="w-4 h-4" />}
              <span className="text-sm font-mono">{notif.message}</span>
            </GlassCard>
          </div>
        ))}
      </div>

      {view === 'loading' && (
        <div className="h-screen flex flex-col items-center justify-center text-white space-y-4" role="status" aria-label="Loading">
          <Ghost className="w-12 h-12 animate-bounce opacity-50" />
          <p className="font-mono text-xs animate-pulse">SUMMONING DAEMON...</p>
        </div>
      )}

      {view === 'mood' && <MoodCompass />}
      {view === 'dashboard' && <Dashboard />}
      {view === 'ritual' && <RitualScreen />}
      {view === 'result' && <ResultScreen />}
      {view === 'altar' && <AltarView />}
      {view === 'sanctuary' && <SanctuaryMap />}
      {view === 'shadowSend' && <ShadowSendView />}
      
      {showPaywall && <PaywallModal />}

      {['dashboard', 'altar', 'sanctuary'].includes(view) && (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-40 safe-area-inset-bottom">
           <div className="max-w-md mx-auto bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl flex justify-between px-8 py-4">
               <button 
                 onClick={() => setView('dashboard')} 
                 className={`transition-all active:scale-90 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black rounded-lg p-2 ${view === 'dashboard' ? 'text-purple-400' : 'text-white/40 hover:text-white/60'}`}
                 aria-label="Dashboard"
                 aria-current={view === 'dashboard' ? 'page' : undefined}
               >
                   <Moon className="w-6 h-6" />
               </button>
               <button 
                 onClick={() => setView('altar')} 
                 className={`transition-all active:scale-90 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-black rounded-lg p-2 ${view === 'altar' ? 'text-orange-400' : 'text-white/40 hover:text-white/60'}`}
                 aria-label="Digital Altar"
                 aria-current={view === 'altar' ? 'page' : undefined}
               >
                   <Flame className="w-6 h-6" />
               </button>
               <button 
                 onClick={() => setView('sanctuary')} 
                 className={`transition-all active:scale-90 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-black rounded-lg p-2 ${view === 'sanctuary' ? 'text-emerald-400' : 'text-white/40 hover:text-white/60'}`}
                 aria-label="Sanctuary"
                 aria-current={view === 'sanctuary' ? 'page' : undefined}
               >
                   <MapPin className="w-6 h-6" />
               </button>
           </div>
        </div>
      )}
    </div>
  );
}
