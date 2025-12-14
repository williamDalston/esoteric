import React, { useState, useEffect, useRef } from 'react';
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
  Check
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
const GlassCard = ({ children, className = "", intense = false }) => (
  <div className={`backdrop-blur-xl border border-white/10 rounded-3xl transition-all duration-500 ${intense ? 'bg-white/10 shadow-[0_0_30px_rgba(255,255,255,0.1)]' : 'bg-black/40'} ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = 'primary', className = "", disabled = false }) => {
  const base = "px-6 py-3 rounded-xl font-mono text-sm tracking-wider uppercase transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed";
  const styles = {
    primary: "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg hover:shadow-purple-500/30 border border-white/10",
    secondary: "bg-white/5 border border-white/20 text-white hover:bg-white/10",
    ghost: "text-white/60 hover:text-white hover:bg-white/5",
    danger: "bg-gradient-to-r from-red-900 to-red-600 text-white border border-red-500/30"
  };
  return (
    <button onClick={onClick} className={`${base} ${styles[variant]} ${className}`} disabled={disabled}>
      {children}
    </button>
  );
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
  
  const [view, setView] = useState('loading'); // loading, mood, dashboard, ritual, result, altar, sanctuary, shadowSend
  const [currentMood, setCurrentMood] = useState(null);
  const [ritualProgress, setRitualProgress] = useState(0);
  const [reading, setReading] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [notification, setNotification] = useState(null);
  const [shadowSendUrl, setShadowSendUrl] = useState(null);
  const [copied, setCopied] = useState(false);

  const ritualInterval = useRef(null);

  // Check daily streak
  useEffect(() => {
    const today = new Date().toDateString();
    if (userData.lastCheckIn !== today) {
      const daysSince = Math.floor((new Date() - new Date(userData.lastCheckIn)) / (1000 * 60 * 60 * 24));
      if (daysSince === 1) {
        // Continue streak
        setUserData(prev => ({ ...prev, streak: prev.streak + 1, lastCheckIn: today }));
      } else if (daysSince > 1) {
        // Reset streak
        setUserData(prev => ({ ...prev, streak: 1, lastCheckIn: today }));
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

  // Initialize
  useEffect(() => {
    setTimeout(() => {
      if (userData.mood) {
        setCurrentMood(MOODS.find(m => m.id === userData.mood));
        setView('dashboard');
      } else {
        setView('mood');
      }
    }, 1500);
  }, []);

  // --- Logic Functions ---
  const handleMoodSelect = (moodId) => {
    const mood = MOODS.find(m => m.id === moodId);
    setCurrentMood(mood);
    setUserData(prev => ({ ...prev, mood: moodId }));
    setView('dashboard');
    triggerNotification(mood.description);
  };

  const startRitual = () => {
    setRitualProgress(0);
    setView('ritual');
  };

  const handleRitualPress = () => {
    ritualInterval.current = setInterval(() => {
      setRitualProgress(prev => {
        if (prev >= 100) {
          clearInterval(ritualInterval.current);
          completeRitual();
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };

  const handleRitualRelease = () => {
    if (ritualInterval.current) {
      clearInterval(ritualInterval.current);
    }
    if (ritualProgress < 100) {
      setRitualProgress(0);
    }
  };

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

  const completeRitual = () => {
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

    setTimeout(() => setView('result'), 500);
  };

  const triggerNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleShare = async () => {
    if (!reading) return;
    
    const shareData = {
      title: `My Mystic Loop Reading: ${reading.card.name}`,
      text: reading.type === 'roast' ? reading.card.roast : reading.card.light,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        triggerNotification("Reading shared to the void");
      } catch (err) {
        // User cancelled or error
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  const copyToClipboard = () => {
    if (!reading) return;
    const text = `🔮 ${reading.card.name} - ${reading.type === 'roast' ? reading.card.roast : reading.card.light}\n\nFrom Mystic Loop: The Algorithmic Coven`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    triggerNotification("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const createShadowSend = () => {
    if (!reading) return;
    
    // Generate a unique shareable link
    const shareId = btoa(`${reading.id}-${Date.now()}`).replace(/[^a-zA-Z0-9]/g, '').substring(0, 12);
    const shareUrl = `${window.location.origin}${window.location.pathname}?shadow=${shareId}`;
    
    // Store reading data (in production, this would be server-side)
    try {
      localStorage.setItem(`shadow_${shareId}`, JSON.stringify({
        card: reading.card.name,
        type: reading.type,
        blurred: true
      }));
    } catch (e) {
      console.warn('Failed to save shadow send data:', e);
    }
    
    setShadowSendUrl(shareUrl);
    setView('shadowSend');
  };

  // --- Sub-Components (Views) ---
  const MoodCompass = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center space-y-8 animate-in fade-in duration-700">
      <div className="space-y-2">
        <h1 className="font-serif text-4xl text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-indigo-200">
          State Your Intent
        </h1>
        <p className="font-mono text-xs text-white/50 tracking-[0.2em] uppercase">
          The Algorithm is Listening
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full max-w-md">
        {MOODS.map((mood) => (
          <button
            key={mood.id}
            onClick={() => handleMoodSelect(mood.id)}
            className={`group relative overflow-hidden p-6 rounded-2xl border border-white/10 hover:border-white/40 transition-all duration-300 hover:scale-[1.02]`}
          >
            <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${mood.color} group-hover:opacity-40 transition-opacity`} />
            <div className="relative z-10 flex flex-col items-center gap-3">
              <mood.icon className="w-8 h-8 text-white/90" />
              <span className="font-serif text-lg text-white">{mood.label}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  const Dashboard = () => (
    <div className="min-h-screen pb-24 p-4 space-y-6 animate-in slide-in-from-bottom-10 duration-500">
      {/* Header */}
      <div className="flex justify-between items-center pt-8">
        <div>
          <h2 className="font-serif text-2xl text-white">The Loop</h2>
          <p className="text-white/40 text-xs font-mono">{new Date().toLocaleDateString()} • WAXING GIBBOUS</p>
        </div>
        <div className="flex items-center gap-2 bg-black/40 px-3 py-1 rounded-full border border-white/10">
          <Flame className="w-4 h-4 text-orange-500 animate-pulse" />
          <span className="font-mono text-sm text-white">{userData.streak}</span>
        </div>
      </div>

      {/* Main Action */}
      <GlassCard className="p-8 relative overflow-hidden group cursor-pointer" intense>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 to-blue-900/50 opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          <div className="w-24 h-24 rounded-full bg-white/5 border border-white/20 flex items-center justify-center relative">
             <div className="absolute inset-0 rounded-full border-t border-purple-500 animate-spin-slow" />
             <Eye className="w-10 h-10 text-white/80" />
          </div>
          <div>
            <h3 className="font-serif text-2xl text-white mb-2">Daily Divination</h3>
            <p className="text-white/60 text-sm max-w-[200px] mx-auto">
              Your pattern is incomplete. Press to synchronize with the void.
            </p>
          </div>
          <Button onClick={startRitual}>Initiate Sequence</Button>
        </div>
      </GlassCard>

      {/* Grid Features */}
      <div className="grid grid-cols-2 gap-4">
        <GlassCard className="p-4 flex flex-col items-center text-center gap-3 hover:bg-white/5 cursor-pointer" onClick={() => setView('altar')}>
           <div className="p-3 rounded-full bg-orange-500/20 text-orange-400">
             <Flame className="w-6 h-6" />
           </div>
           <span className="font-serif text-white">Digital Altar</span>
        </GlassCard>
        
        <GlassCard className="p-4 flex flex-col items-center text-center gap-3 hover:bg-white/5 cursor-pointer" onClick={() => setShowPaywall(true)}>
           <div className="p-3 rounded-full bg-indigo-500/20 text-indigo-400">
             <User className="w-6 h-6" />
           </div>
           <span className="font-serif text-white">Bond Roast</span>
        </GlassCard>

        <GlassCard className="p-4 flex flex-col items-center text-center gap-3 hover:bg-white/5 cursor-pointer" onClick={() => setView('sanctuary')}>
           <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-400">
             <MapPin className="w-6 h-6" />
           </div>
           <span className="font-serif text-white">Sanctuary</span>
        </GlassCard>

        <GlassCard className="p-4 flex flex-col items-center text-center gap-3 hover:bg-white/5 cursor-pointer" onClick={() => setShowPaywall(true)}>
           <div className="p-3 rounded-full bg-rose-500/20 text-rose-400">
             <CreditCard className="w-6 h-6" />
           </div>
           <span className="font-serif text-white">SOS Read ($1.99)</span>
        </GlassCard>
      </div>
    </div>
  );

  const RitualScreen = () => (
    <div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black select-none touch-none"
      onMouseDown={handleRitualPress}
      onMouseUp={handleRitualRelease}
      onTouchStart={handleRitualPress}
      onTouchEnd={handleRitualRelease}
    >
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20" />
      
      {/* Background Aura reacting to progress */}
      <div 
        className="absolute w-[500px] h-[500px] rounded-full blur-[100px] transition-all duration-100 ease-linear"
        style={{
          background: `conic-gradient(from 0deg, #4f46e5, #ec4899, #8b5cf6, #4f46e5)`,
          transform: `scale(${1 + (ritualProgress / 50)}) rotate(${ritualProgress * 3.6}deg)`,
          opacity: 0.3 + (ritualProgress / 200)
        }}
      />

      <div className="relative z-10 text-center space-y-12">
        <h2 className="font-serif text-3xl text-white tracking-widest animate-pulse">
          {ritualProgress > 0 ? "HOLD TO MANIFEST" : "PRESS & HOLD"}
        </h2>
        
        {/* The Fingerprint/Circle Interaction */}
        <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
           {/* Progress Ring */}
           <svg className="absolute inset-0 w-full h-full -rotate-90">
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
           <div className={`w-24 h-24 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-200 ${ritualProgress > 0 ? 'scale-90 bg-white/20' : 'scale-100'}`}>
              <Sparkles className={`w-8 h-8 text-white transition-opacity ${ritualProgress > 0 ? 'opacity-100' : 'opacity-50'}`} />
           </div>
        </div>

        <p className="font-mono text-xs text-white/40 uppercase tracking-widest">
          {ritualProgress}% Synchronized
        </p>
      </div>
    </div>
  );

  const ResultScreen = () => {
    if (!reading) return null;
    
    return (
      <div className="min-h-screen p-6 flex flex-col items-center justify-center space-y-8 animate-in zoom-in-95 duration-700">
        
        {/* AI Aura Art Generation */}
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
           {/* Card Overlay */}
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
          <Button className="flex-1 flex items-center justify-center gap-2" variant="primary" onClick={handleShare}>
             <Share2 className="w-4 h-4" /> Share
          </Button>
          <Button className="flex-1 flex items-center justify-center gap-2" variant="secondary" onClick={createShadowSend}>
             <Ghost className="w-4 h-4" /> Shadow Send
          </Button>
        </div>
        
        <Button className="w-full max-w-md" variant="ghost" onClick={() => setView('dashboard')}>
           Close Loop
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

        {/* The Visual Altar */}
        <div className="h-64 relative rounded-t-full border-b border-white/20 bg-gradient-to-b from-transparent to-purple-900/20 flex items-end justify-center p-8 gap-4">
            {/* Candles based on Streak */}
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

        {/* Stats */}
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
                {userData.readings.slice(-8).map((reading, idx) => (
                    <div key={reading.id || idx} className="aspect-square rounded-lg bg-white/5 border border-white/10 overflow-hidden relative">
                        <div 
                          className="w-full h-full opacity-70"
                          style={{
                            background: `
                              radial-gradient(circle at ${reading.auraVisual?.position || 50}% 20%, ${reading.auraVisual?.gradient1 || '#4f46e5'}, transparent),
                              radial-gradient(circle at ${100 - (reading.auraVisual?.position || 50)}% 80%, ${reading.auraVisual?.gradient2 || '#ec4899'}, transparent)
                            `
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-xs font-serif text-white/80">{reading.card.name}</span>
                        </div>
                    </div>
                ))}
                {userData.readings.length === 0 && (
                  <div className="col-span-4 text-center py-8 text-white/40 font-mono text-xs">
                    No readings yet. Complete your first ritual.
                  </div>
                )}
            </div>
        </GlassCard>
        <Button className="w-full" variant="secondary" onClick={() => setView('dashboard')}>Return to Loop</Button>
    </div>
  );

  const SanctuaryMap = () => (
      <div className="min-h-screen relative bg-gray-900">
          <div className="absolute inset-0 opacity-30">
               {/* Mock Map Background */}
               <div className="w-full h-full bg-[radial-gradient(#333_1px,transparent_1px)] [background-size:16px_16px]"></div>
          </div>
          
          {/* Mock POIs */}
          <div className="absolute top-1/4 left-1/4 animate-bounce duration-[2000ms]">
              <MapPin className="w-8 h-8 text-purple-500 drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
          </div>
          <div className="absolute top-1/2 left-1/2 animate-bounce duration-[2500ms]">
              <MapPin className="w-8 h-8 text-emerald-500 drop-shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          </div>

          <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent space-y-4">
              <GlassCard className="p-4 flex items-start gap-4">
                  <Shield className="w-8 h-8 text-emerald-400 shrink-0" />
                  <div>
                      <h3 className="text-white font-serif">Ghost Mode Active</h3>
                      <p className="text-white/60 text-xs mt-1">Your exact location is fuzzed by 400m. Only verified covens can see your true signal.</p>
                  </div>
              </GlassCard>
              <Button className="w-full" onClick={() => setView('dashboard')}>Exit Sanctuary</Button>
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
                className="flex-1 bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white text-sm font-mono"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shadowSendUrl);
                  setCopied(true);
                  triggerNotification("Link copied");
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="p-2 bg-white/5 rounded-lg border border-white/10 hover:bg-white/10 transition-colors"
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
          <Button className="flex-1" variant="primary" onClick={() => {
            if (navigator.share) {
              navigator.share({ url: shadowSendUrl, title: 'A reading from Mystic Loop' });
            }
          }}>
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
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in slide-in-from-bottom-10">
          <GlassCard className="w-full max-w-sm p-6 space-y-6" intense>
              <div className="flex justify-between items-start">
                  <h2 className="text-2xl font-serif text-white">Unlock The Void</h2>
                  <button onClick={() => setShowPaywall(false)}><X className="text-white/50" /></button>
              </div>
              <div className="space-y-4">
                  <div className="p-3 bg-white/5 rounded-lg flex items-center gap-3">
                      <Zap className="text-yellow-400" />
                      <div className="text-white text-sm">Vedic & Deep Astrology</div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg flex items-center gap-3">
                      <Ghost className="text-purple-400" />
                      <div className="text-white text-sm">See Who Manifested You</div>
                  </div>
                  <div className="p-3 bg-white/5 rounded-lg flex items-center gap-3">
                      <Flame className="text-orange-400" />
                      <div className="text-white text-sm">Unlimited SOS Readings</div>
                  </div>
              </div>
              <Button className="w-full font-bold">$9.99 / Month</Button>
              <p className="text-center text-white/40 text-xs">Planets don't align for free.</p>
          </GlassCard>
      </div>
  );

  // --- Main Render Switch ---
  return (
    <div className="bg-black min-h-screen font-sans overflow-hidden relative">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none">
          <div className={`absolute inset-0 transition-opacity duration-1000 ${currentMood ? 'opacity-30' : 'opacity-10'}`} 
            style={{ 
                background: currentMood ? `linear-gradient(to bottom right, transparent, ${currentMood.color.split(' ')[1].replace('to-', '#')})` : 'none'
            }} 
          />
          <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-purple-900/20 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-indigo-900/20 rounded-full blur-[120px] animate-pulse delay-1000" />
      </div>

      {notification && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in slide-in-from-top-4 fade-in">
           <GlassCard className="px-6 py-2 rounded-full border-green-500/30 text-emerald-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-mono">{notification}</span>
           </GlassCard>
        </div>
      )}

      {view === 'loading' && (
        <div className="h-screen flex flex-col items-center justify-center text-white space-y-4">
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

      {/* Bottom Nav (Only visible in main views) */}
      {['dashboard', 'altar', 'sanctuary'].includes(view) && (
        <div className="fixed bottom-0 left-0 right-0 p-4 z-40">
           <div className="max-w-md mx-auto bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl flex justify-between px-8 py-4">
               <button onClick={() => setView('dashboard')} className={`${view === 'dashboard' ? 'text-purple-400' : 'text-white/40'}`}>
                   <Moon className="w-6 h-6" />
               </button>
               <button onClick={() => setView('altar')} className={`${view === 'altar' ? 'text-orange-400' : 'text-white/40'}`}>
                   <Flame className="w-6 h-6" />
               </button>
               <button onClick={() => setView('sanctuary')} className={`${view === 'sanctuary' ? 'text-emerald-400' : 'text-white/40'}`}>
                   <MapPin className="w-6 h-6" />
               </button>
           </div>
        </div>
      )}
    </div>
  );
}

