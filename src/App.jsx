import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
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

const BOND_PATTERNS = [
  { you: "Ghost", them: "Clinger", roast: "You're already gone, they're already attached. Classic avoidant-anxious dance.", compatibility: 23 },
  { you: "Manifestor", them: "Realist", roast: "You believe in vibrations, they believe in math. Both are wrong.", compatibility: 45 },
  { you: "Healer", them: "Vampire", roast: "You give energy, they take it. At least someone's winning.", compatibility: 31 },
  { you: "Chaos", them: "Chaos", roast: "Two disasters don't make a party. They make a war zone.", compatibility: 67 },
  { you: "Flirt", them: "Serious", roast: "You're playing games, they want marriage. Someone's getting hurt.", compatibility: 28 },
  { you: "Independent", them: "Clingy", roast: "You need space, they need a hug. Find a middle ground (or don't).", compatibility: 34 },
  { you: "Mystic", them: "Skeptic", roast: "You read tarot, they read receipts. This ends in therapy.", compatibility: 42 },
  { you: "Empath", them: "Narcissist", roast: "You feel everything, they feel nothing. Perfect match (said no one ever).", compatibility: 19 },
  { you: "Wild", them: "Stable", roast: "You're chaos, they're a rock. One of you will break.", compatibility: 51 },
  { you: "Healing", them: "Healing", roast: "Two broken people trying to fix each other. Cute but doomed.", compatibility: 38 },
  { you: "Alchemist", them: "Planner", roast: "You manifest, they strategize. Both think you're right.", compatibility: 56 },
  { you: "Free", them: "Possessive", roast: "You want freedom, they want ownership. Red flag parade.", compatibility: 15 },
  { you: "Giver", them: "Taker", roast: "You pour into an empty cup. They never fill back.", compatibility: 22 },
  { you: "Dreamer", them: "Achiever", roast: "You dream, they do. One of you will resent the other.", compatibility: 47 },
  { you: "Twin Flame", them: "Karmic", roast: "You think it's destiny, it's just trauma. Classic.", compatibility: 29 },
  { you: "Light", them: "Shadow", roast: "You're all love and light, they're all darkness. Yin and yang, but toxic.", compatibility: 44 },
  { you: "Wanderer", them: "Homebody", roast: "You want to explore, they want to nest. Someone's compromising too much.", compatibility: 48 },
  { you: "Fire", them: "Water", roast: "Steam or extinguish? Either way, someone's getting burned or drowned.", compatibility: 53 },
  { you: "Evolved", them: "Stuck", roast: "You've done the work, they haven't started. Good luck with that.", compatibility: 37 },
  { you: "Boundaries", them: "None", roast: "You say no, they don't listen. Fun.", compatibility: 26 },
];

// --- Utility Components ---
const GlassCard = ({ children, className = "", intense = false, hoverable = false, onClick, glowing = false }) => (
  <div 
    className={`
      glass-depth rounded-3xl transition-all duration-500 relative
      ${intense ? 'bg-white/10 shadow-[0_0_40px_rgba(168,85,247,0.15)]' : ''} 
      ${hoverable ? 'hover-glow hover:border-white/20 cursor-pointer active:scale-[0.98]' : ''}
      ${onClick ? 'cursor-pointer' : ''}
      ${glowing ? 'animate-breathe' : ''}
      ${className}
    `}
    onClick={onClick}
    role={onClick ? 'button' : undefined}
    tabIndex={onClick ? 0 : undefined}
    onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') onClick(e); } : undefined}
  >
    {/* Gradient border overlay */}
    <div className="absolute inset-0 rounded-3xl gradient-border pointer-events-none" />
    {children}
  </div>
);

const Button = ({ children, onClick, variant = 'primary', className = "", disabled = false, loading = false, size = 'default' }) => {
  const base = "relative overflow-hidden font-mono tracking-wider uppercase transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black ripple";
  
  const sizes = {
    sm: "px-3 py-2 text-xs rounded-lg min-h-[36px]",
    default: "px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl min-h-[44px]",
    lg: "px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base rounded-2xl min-h-[52px]"
  };
  
  const styles = {
    primary: `
      bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 text-white 
      shadow-[0_4px_20px_rgba(168,85,247,0.4)] hover:shadow-[0_8px_30px_rgba(168,85,247,0.6)]
      border border-purple-400/30 hover:border-purple-300/50 
      hover:scale-[1.02] hover:-translate-y-0.5
      animate-gradient bg-[length:200%_200%]
    `,
    secondary: `
      bg-white/5 border border-white/20 text-white 
      hover:bg-white/10 hover:border-white/40 
      hover:scale-[1.02] hover:-translate-y-0.5
      shadow-[0_4px_15px_rgba(0,0,0,0.3)]
    `,
    ghost: `
      text-white/60 hover:text-white hover:bg-white/10 
      hover:scale-[1.02]
      border border-transparent hover:border-white/10
    `,
    danger: `
      bg-gradient-to-r from-red-700 via-red-600 to-rose-600 text-white 
      border border-red-400/30 hover:border-red-300/50 
      shadow-[0_4px_20px_rgba(239,68,68,0.3)] hover:shadow-[0_8px_30px_rgba(239,68,68,0.5)]
      hover:scale-[1.02] hover:-translate-y-0.5
    `,
    gold: `
      bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 text-black font-semibold
      border border-amber-400/50 hover:border-amber-300/70
      shadow-[0_4px_20px_rgba(251,191,36,0.4)] hover:shadow-[0_8px_30px_rgba(251,191,36,0.6)]
      hover:scale-[1.02] hover:-translate-y-0.5
      animate-gradient bg-[length:200%_200%]
    `
  };
  
  return (
    <button 
      onClick={onClick} 
      className={`${base} ${sizes[size]} ${styles[variant]} ${className}`} 
      disabled={disabled || loading}
      aria-busy={loading}
    >
      <span className="relative z-10 flex items-center justify-center gap-2">
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {children}
      </span>
      {/* Shine effect */}
      {(variant === 'primary' || variant === 'gold') && !loading && (
        <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 skew-x-12"></span>
      )}
      {/* Glow pulse on hover */}
      <span className="absolute inset-0 rounded-inherit opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-purple-500/20 via-transparent to-indigo-500/20 blur-xl"></span>
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

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
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
  
  const [view, setView] = useState('loading'); // loading, welcome, mood, dashboard, ritual, result, altar, sanctuary, shadowSend, bondRoast
  const [prevView, setPrevView] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [confettiActive, setConfettiActive] = useState(false);
  const [currentMood, setCurrentMood] = useState(null);
  const [ritualProgress, setRitualProgress] = useState(0);
  const [reading, setReading] = useState(null);
  const [showPaywall, setShowPaywall] = useState(false);
  const [shadowSendUrl, setShadowSendUrl] = useState(null);
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [fuzzedLocation, setFuzzedLocation] = useState(null);
  const [nearbySanctuaries, setNearbySanctuaries] = useState([]);
  const [locationError, setLocationError] = useState(null);
  const [mapCenter, setMapCenter] = useState(null);
  const [bondRoast, setBondRoast] = useState(null);
  const [bondName1, setBondName1] = useState('');
  const [bondName2, setBondName2] = useState('');
  const [hasSeenWelcome, setHasSeenWelcome] = useState(() => {
    try {
      return localStorage.getItem('mysticLoop_welcomeSeen') === 'true';
    } catch {
      return false;
    }
  });
  const [konamiCode, setKonamiCode] = useState([]);
  const [easterEgg, setEasterEgg] = useState(false);

  const ritualInterval = useRef(null);
  const { notifications, addNotification } = useNotificationQueue();
  const addNotificationRef = useRef(addNotification);
  
  // Keep ref in sync
  useEffect(() => {
    addNotificationRef.current = addNotification;
  }, [addNotification]);

  // Smooth view transitions
  const changeView = useCallback((newView) => {
    if (newView === view) return;
    setIsTransitioning(true);
    setPrevView(view);
    setTimeout(() => {
      setView(newView);
      setTimeout(() => setIsTransitioning(false), 300);
    }, 150);
  }, [view]);

  // Confetti effect
  const triggerConfetti = useCallback(() => {
    setConfettiActive(true);
    setTimeout(() => setConfettiActive(false), 3000);
  }, []);

  // Check daily streak
  useEffect(() => {
    const today = new Date().toDateString();
    if (userData.lastCheckIn !== today) {
      const daysSince = Math.floor((new Date() - new Date(userData.lastCheckIn)) / (1000 * 60 * 60 * 24));
      if (daysSince === 1) {
        const newStreak = userData.streak + 1;
        setUserData(prev => ({ ...prev, streak: newStreak, lastCheckIn: today }));
        
        // Celebrate streak milestones with confetti
        let streakMessage = `Streak continues! Day ${newStreak}`;
        if (newStreak === 7) {
          streakMessage = `🔥 7-day streak! A week of dedication.`;
          triggerHaptic('success');
          triggerConfetti();
        } else if (newStreak === 30) {
          streakMessage = `✨ 30 days! You've mastered the ritual.`;
          triggerHaptic('success');
          triggerConfetti();
        } else if (newStreak === 100) {
          streakMessage = `🌟 100 DAYS! You are a true mystic.`;
          triggerHaptic('success');
          triggerConfetti();
        }
        
        // Use ref to avoid closure issues
        if (addNotificationRef.current) {
          addNotificationRef.current(streakMessage, 'success');
        }
      } else if (daysSince > 1) {
        setUserData(prev => ({ ...prev, streak: 1, lastCheckIn: today }));
        if (addNotificationRef.current) {
          addNotificationRef.current('Streak reset. Start fresh.', 'info');
        }
      }
    }
  }, [userData.lastCheckIn, userData.streak]);

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
      if (!hasSeenWelcome) {
        setView('welcome');
      } else if (userData.mood) {
        setCurrentMood(MOODS.find(m => m.id === userData.mood));
        setView('dashboard');
      } else {
        setView('mood');
      }
    }, 800);
    
    return () => clearTimeout(timer);
  }, [hasSeenWelcome, userData.mood]);
  
  // Cleanup ritual interval on unmount
  useEffect(() => {
    return () => {
      if (ritualInterval.current) {
        clearInterval(ritualInterval.current);
      }
    };
  }, []);

  // Swipe gesture handling
  const swipeStart = useRef({ x: 0, y: 0, time: 0 });
  const swipeThreshold = 50;
  const swipeTimeThreshold = 300;

  const handleTouchStart = useCallback((e) => {
    const touch = e.touches[0];
    swipeStart.current = { x: touch.clientX, y: touch.clientY, time: Date.now() };
  }, []);

  const handleTouchEnd = useCallback((e) => {
    if (!swipeStart.current.x) return;
    const touch = e.changedTouches[0];
    const deltaX = touch.clientX - swipeStart.current.x;
    const deltaY = touch.clientY - swipeStart.current.y;
    const deltaTime = Date.now() - swipeStart.current.time;
    
    // Only handle horizontal swipes
    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > swipeThreshold && deltaTime < swipeTimeThreshold) {
      // Swipe right (go back)
      if (deltaX > 0 && (view === 'result' || view === 'altar' || view === 'sanctuary' || view === 'bondRoast')) {
        changeView('dashboard');
        triggerHaptic('light');
      }
      // Swipe left (forward navigation - could add later)
    }
    
    swipeStart.current = { x: 0, y: 0, time: 0 };
  }, [view, changeView]);

  // Keyboard shortcuts - uses startRitualRef to avoid forward reference
  const startRitualRef = useRef(null);
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      // ESC to close modals/exit views
      if (e.key === 'Escape') {
        if (showPaywall) {
          setShowPaywall(false);
          triggerHaptic('light');
        }
        if (view === 'shadowSend' || view === 'bondRoast' || view === 'result') {
          changeView('dashboard');
          triggerHaptic('light');
        }
        if (view === 'ritual') {
          setRitualProgress(0);
          changeView('dashboard');
          triggerHaptic('light');
        }
      }
      
      // Quick navigation shortcuts (Ctrl/Cmd + key)
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
        switch(e.key) {
          case '1':
            e.preventDefault();
            changeView('dashboard');
            triggerHaptic('light');
            break;
          case '2':
            e.preventDefault();
            changeView('altar');
            triggerHaptic('light');
            break;
          case '3':
            e.preventDefault();
            changeView('sanctuary');
            triggerHaptic('light');
            break;
          case 'r':
            if (view === 'dashboard' && startRitualRef.current) {
              e.preventDefault();
              startRitualRef.current();
            }
            break;
          case 'b':
            if (view === 'dashboard') {
              e.preventDefault();
              setView('bondRoast');
              triggerHaptic('light');
            }
            break;
        }
      }
      
      // Spacebar to start ritual when on dashboard
      if (e.key === ' ' && view === 'dashboard' && !e.target.matches('input, textarea, button') && startRitualRef.current) {
        e.preventDefault();
        startRitualRef.current();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showPaywall, view]);
  
  // Konami Code Easter Egg (up up down down left right left right b a)
  useEffect(() => {
    const konamiSequence = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    
    const handleKonami = (e) => {
      const newSequence = [...konamiCode, e.key];
      const sequenceMatch = konamiSequence.slice(0, newSequence.length);
      
      if (JSON.stringify(newSequence) === JSON.stringify(sequenceMatch)) {
        setKonamiCode(newSequence);
        if (newSequence.length === konamiSequence.length) {
          setEasterEgg(true);
          addNotification('🔮 Secret unlocked! The algorithm sees all...', 'success');
          triggerHaptic('success');
          setUserData(prev => ({
            ...prev,
            coins: prev.coins + 100,
            easterEggUnlocked: true
          }));
          setKonamiCode([]);
          setTimeout(() => setEasterEgg(false), 3000);
        }
      } else {
        setKonamiCode([]);
      }
    };
    
    window.addEventListener('keydown', handleKonami);
    return () => window.removeEventListener('keydown', handleKonami);
  }, [konamiCode, addNotification]);
  
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

  // Get user location when entering sanctuary
  useEffect(() => {
    if (view === 'sanctuary') {
      if (!navigator.geolocation) {
        setLocationError('Geolocation is not supported by your browser.');
        return;
      }

      setIsLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const realLocation = { lat: latitude, lng: longitude };
          setUserLocation(realLocation);
          
          // Fuzz location by 400m (approximately 0.0036 degrees)
          const fuzzDistance = 0.0036; // ~400m
          const fuzzAngle = Math.random() * 2 * Math.PI;
          const fuzzed = {
            lat: latitude + (Math.cos(fuzzAngle) * fuzzDistance),
            lng: longitude + (Math.sin(fuzzAngle) * fuzzDistance)
          };
          setFuzzedLocation(fuzzed);
          setMapCenter(fuzzed);
          
          // Generate nearby sanctuaries (in production, this would come from a server)
          generateNearbySanctuaries(fuzzed);
          setIsLoading(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setLocationError('Unable to get your location. Please enable location services.');
          setIsLoading(false);
          // Fallback to a default location (e.g., city center)
          const defaultLocation = { lat: 40.7128, lng: -74.0060 }; // NYC as fallback
          setMapCenter(defaultLocation);
          generateNearbySanctuaries(defaultLocation);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    }
  }, [view]);

  // Generate nearby sanctuaries (mock data - in production this would be from API)
  const generateNearbySanctuaries = (centerLocation) => {
    const sanctuaries = [];
    const types = ['coven', 'sanctuary', 'temple', 'circle'];
    const colors = ['purple', 'emerald', 'pink', 'indigo', 'orange'];
    
    // Generate 3-6 random nearby points
    const count = 3 + Math.floor(Math.random() * 4);
    for (let i = 0; i < count; i++) {
      const distance = 0.01 + Math.random() * 0.05; // 1-6km away
      const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.5);
      const lat = centerLocation.lat + (Math.cos(angle) * distance);
      const lng = centerLocation.lng + (Math.sin(angle) * distance);
      
      sanctuaries.push({
        id: i,
        lat,
        lng,
        name: `${types[Math.floor(Math.random() * types.length)]} ${String.fromCharCode(65 + i)}`,
        type: types[Math.floor(Math.random() * types.length)],
        color: colors[Math.floor(Math.random() * colors.length)],
        distance: Math.round(distance * 111) // Convert to km
      });
    }
    
    setNearbySanctuaries(sanctuaries);
  };

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

  // Keep startRitualRef in sync
  useEffect(() => {
    startRitualRef.current = startRitual;
  }, [startRitual]);

  // Define generateAuraVisual before completeRitual to avoid forward reference
  const generateAuraVisual = useCallback((seed, mood) => {
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
  }, []);

  // Define completeRitual before handleRitualPress to avoid forward reference
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
    const newCoins = userData.coins + 10;
    const newReadingsCount = (userData.readings?.length || 0) + 1;
    
    setUserData(prev => ({
      ...prev,
      coins: newCoins,
      readings: [...(prev.readings || []), newReading]
    }));

    // Trigger confetti celebration
    triggerConfetti();
    triggerHaptic('success');

    // Celebrate milestones
    let milestoneMessage = 'Ritual complete. +10 Aether Coins earned.';
    
    // Coin milestones
    if (newCoins === 100 || newCoins === 250 || newCoins === 500 || newCoins === 1000) {
      milestoneMessage = `🎉 ${newCoins} Aether Coins! You're building power.`;
      triggerHaptic('success');
    }
    
    // Reading milestones
    if (newReadingsCount === 10 || newReadingsCount === 25 || newReadingsCount === 50 || newReadingsCount === 100) {
      milestoneMessage = `✨ ${newReadingsCount} readings collected! Your grimoire grows.`;
      triggerHaptic('success');
    }
    
    // Special achievement for first reading
    if (newReadingsCount === 1) {
      milestoneMessage = '✨ First reading complete. The void welcomes you.';
      triggerHaptic('success');
    }
    
    addNotification(milestoneMessage, 'success');
    triggerHaptic('success');
    setTimeout(() => setView('result'), 500);
  }, [currentMood, addNotification, userData.coins, userData.readings, generateAuraVisual]);

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
  }, [completeRitual]);

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

  // Define copyToClipboard BEFORE handleShare to avoid forward reference
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
  }, [reading, isLoading, addNotification, copyToClipboard]);

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

  const generateBondRoast = useCallback(() => {
    const name1 = bondName1.trim() || 'You';
    const name2 = bondName2.trim() || 'Them';
    
    // Select a random bond pattern
    const pattern = BOND_PATTERNS[Math.floor(Math.random() * BOND_PATTERNS.length)];
    
    const roast = {
      id: Date.now(),
      name1,
      name2,
      you: pattern.you,
      them: pattern.them,
      roast: pattern.roast,
      compatibility: pattern.compatibility,
      timestamp: new Date()
    };
    
    setBondRoast(roast);
    setUserData(prev => ({
      ...prev,
      bondRoasts: [...(prev.bondRoasts || []), roast]
    }));
    triggerHaptic('success');
    addNotification('Bond roasted. Share the chaos.', 'success');
  }, [bondName1, bondName2, addNotification]);

  // --- Sub-Components (Views) ---
  const WelcomeScreen = () => {
    const [iconHover, setIconHover] = useState(null);
    
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-6 sm:p-8 text-center space-y-8 animate-in fade-in duration-700 relative overflow-hidden">
        <div className="absolute inset-0 particle-bg opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-indigo-900/20 animate-aurora" />
        
        {/* Floating sparkles */}
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="absolute particle animate-sparkle"
            style={{
              left: `${15 + Math.random() * 70}%`,
              top: `${15 + Math.random() * 70}%`,
              width: '3px',
              height: '3px',
              animationDelay: `${i * 0.3}s`
            }}
          />
        ))}
        
        <div className="relative z-10 max-w-lg space-y-6">
          <div className="space-y-4 animate-in zoom-in-95">
            <div className="relative inline-block">
              <Sparkles className="w-16 h-16 mx-auto text-purple-400 animate-pulse drop-shadow-[0_0_20px_rgba(168,85,247,0.6)]" />
              <div className="absolute inset-0 w-16 h-16 mx-auto bg-purple-400/30 rounded-full blur-xl animate-pulse" />
            </div>
            <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-indigo-200 animate-gradient text-glow-intense">
              Welcome to Mystic Loop
            </h1>
            <p className="text-white/80 text-lg sm:text-xl font-serif">
              Modern Mischief. Sacred Systems. Viral Magic.
            </p>
          </div>
          
          <GlassCard className="p-6 sm:p-8 space-y-4 text-left animate-in slide-in-from-bottom-10" intense style={{ animationDelay: '0.2s' }}>
            <div className="space-y-4">
              <div 
                className="flex items-start gap-3 group cursor-default"
                onMouseEnter={() => setIconHover('eye')}
                onMouseLeave={() => setIconHover(null)}
              >
                <div className={`p-2 rounded-lg bg-purple-500/20 border border-purple-500/30 transition-all duration-300 ${iconHover === 'eye' ? 'scale-110 bg-purple-500/30 shadow-[0_0_20px_rgba(168,85,247,0.4)]' : ''}`}>
                  <Eye className={`w-5 h-5 text-purple-400 transition-all duration-300 ${iconHover === 'eye' ? 'scale-110 text-glow' : ''}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-serif text-lg mb-1 group-hover:text-purple-300 transition-colors">Get Daily Readings</h3>
                  <p className="text-white/70 text-sm leading-relaxed">Select your mood, hold the ritual circle, and receive personalized tarot guidance (or a brutal roast).</p>
                </div>
              </div>
              
              <div 
                className="flex items-start gap-3 group cursor-default"
                onMouseEnter={() => setIconHover('share')}
                onMouseLeave={() => setIconHover(null)}
              >
                <div className={`p-2 rounded-lg bg-pink-500/20 border border-pink-500/30 transition-all duration-300 ${iconHover === 'share' ? 'scale-110 bg-pink-500/30 shadow-[0_0_20px_rgba(236,72,153,0.4)]' : ''}`}>
                  <Share2 className={`w-5 h-5 text-pink-400 transition-all duration-300 ${iconHover === 'share' ? 'scale-110 text-glow' : ''}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-serif text-lg mb-1 group-hover:text-pink-300 transition-colors">Share & Connect</h3>
                  <p className="text-white/70 text-sm leading-relaxed">Send readings to friends, roast relationships, and build your collection of mystical insights.</p>
                </div>
              </div>
              
              <div 
                className="flex items-start gap-3 group cursor-default"
                onMouseEnter={() => setIconHover('flame')}
                onMouseLeave={() => setIconHover(null)}
              >
                <div className={`p-2 rounded-lg bg-orange-500/20 border border-orange-500/30 transition-all duration-300 ${iconHover === 'flame' ? 'scale-110 bg-orange-500/30 shadow-[0_0_20px_rgba(249,115,22,0.4)]' : ''}`}>
                  <Flame className={`w-5 h-5 text-orange-400 transition-all duration-300 ${iconHover === 'flame' ? 'scale-110 text-glow animate-pulse' : ''}`} />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-serif text-lg mb-1 group-hover:text-orange-300 transition-colors">Build Your Altar</h3>
                  <p className="text-white/70 text-sm leading-relaxed">Daily check-ins power your digital altar. Keep the streak alive for stronger energies.</p>
                </div>
              </div>
            </div>
          </GlassCard>
          
          <div className="animate-in slide-in-from-bottom-10" style={{ animationDelay: '0.4s' }}>
            <Button 
              className="w-full max-w-sm min-h-[52px] text-base" 
              variant="primary"
              onClick={() => {
                triggerHaptic('success');
                setHasSeenWelcome(true);
                try {
                  localStorage.setItem('mysticLoop_welcomeSeen', 'true');
                } catch {}
                setTimeout(() => setView('mood'), 300);
              }}
            >
              Begin Your Journey
            </Button>
          </div>
          
          {/* Subtle credit */}
          <p className="text-white/20 text-xs font-mono tracking-widest mt-8 animate-in fade-in" style={{ animationDelay: '0.6s' }}>
            By Will A. For Iamê M.
          </p>
        </div>
      </div>
    );
  };

  const MoodCompass = () => {
    const [hoveredMood, setHoveredMood] = useState(null);
    
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 sm:p-6 text-center space-y-6 sm:space-y-8 animate-in fade-in duration-700 relative overflow-hidden">
        {/* Enhanced Background Effects */}
        <div className="absolute inset-0 particle-bg opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-transparent to-indigo-900/20 animate-aurora" />
        
        {/* Floating particles */}
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="absolute particle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: `${2 + Math.random() * 4}px`,
              height: `${2 + Math.random() * 4}px`,
              animationDelay: `${Math.random() * 6}s`,
              animationDuration: `${4 + Math.random() * 4}s`
            }}
          />
        ))}
        
        <div className="space-y-3 sm:space-y-4 relative z-10">
          <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-transparent bg-clip-text bg-gradient-to-r from-purple-200 via-pink-200 to-indigo-200 animate-gradient px-4 text-glow-intense">
            How Are You Feeling?
          </h1>
          <p className="text-white/80 text-sm sm:text-base px-4 max-w-md mx-auto font-serif">
            Choose your current energy. This shapes your reading—whether you get mystical guidance or a shadow roast.
          </p>
          <div className="w-16 sm:w-24 h-1 mx-auto bg-gradient-to-r from-transparent via-purple-500 to-transparent rounded-full mt-3 sm:mt-4 animate-pulse" />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:gap-4 w-full max-w-md relative z-10 px-4">
          {MOODS.map((mood, index) => (
            <button
              key={mood.id}
              onClick={() => handleMoodSelect(mood.id)}
              onMouseEnter={() => setHoveredMood(mood.id)}
              onMouseLeave={() => setHoveredMood(null)}
              disabled={isProcessing}
              style={{ animationDelay: `${index * 100}ms` }}
              className={`group relative overflow-hidden p-4 sm:p-6 rounded-2xl border border-white/10 hover:border-white/50 transition-all duration-500 hover:scale-[1.05] hover:shadow-[0_0_40px_rgba(168,85,247,0.4)] active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black disabled:opacity-50 disabled:cursor-not-allowed min-h-[120px] sm:min-h-[140px] glass-premium`}
              aria-label={`Select ${mood.label} mood`}
            >
              <div className={`absolute inset-0 opacity-20 bg-gradient-to-br ${mood.color} group-hover:opacity-60 transition-opacity duration-500`} />
              <div className={`absolute inset-0 bg-gradient-to-br ${mood.color} opacity-0 group-hover:opacity-30 blur-2xl transition-opacity duration-500`} />
              {hoveredMood === mood.id && (
                <div className={`absolute inset-0 bg-gradient-to-br ${mood.color} opacity-0 group-hover:opacity-10 animate-energy-wave`} />
              )}
              <div className="relative z-10 flex flex-col items-center gap-2 sm:gap-3">
                <mood.icon className="w-8 h-8 sm:w-10 sm:h-10 text-white group-hover:scale-125 transition-all duration-300 group-hover:drop-shadow-[0_0_20px_currentColor] group-hover:text-glow-intense" />
                <span className="font-serif text-base sm:text-lg text-white group-hover:text-glow transition-all duration-300">{mood.label}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  const Dashboard = () => {
    // Time-based greeting
    const getGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 6) return { text: "Night Owl", icon: "🌙", mood: "The veil is thin." };
      if (hour < 12) return { text: "Good Morning", icon: "✨", mood: "A fresh start awaits." };
      if (hour < 17) return { text: "Good Afternoon", icon: "☀️", mood: "Power hour beckons." };
      if (hour < 21) return { text: "Good Evening", icon: "🌅", mood: "Reflect and manifest." };
      return { text: "Good Night", icon: "🔮", mood: "The cosmos speaks." };
    };
    
    const greeting = getGreeting();
    const moonPhases = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘'];
    const currentMoonPhase = moonPhases[new Date().getDate() % 8];
    
    return (
      <div className="min-h-screen pb-28 sm:pb-24 p-4 sm:p-6 space-y-5 sm:space-y-6 animate-in slide-in-from-bottom-10 duration-500 relative">
        {/* Starfield background */}
        <div className="absolute inset-0 starfield" />
        <div className="absolute inset-0 particle-bg opacity-20" />
        
        {/* Floating orbs */}
        <div className="floating-orb w-64 h-64 bg-purple-600/20 -top-32 -left-32" />
        <div className="floating-orb w-48 h-48 bg-indigo-600/15 top-1/2 -right-24" style={{ animationDelay: '5s' }} />
        
        <div className="flex justify-between items-start pt-4 sm:pt-8 relative z-10">
          <div className="flex-1 min-w-0">
            <p className="text-white/50 text-xs font-mono tracking-wider mb-1 flex items-center gap-2">
              <span>{greeting.icon}</span>
              <span className="uppercase">{greeting.text}</span>
            </p>
            <h2 className="font-serif text-2xl sm:text-3xl text-white mb-1 truncate neon-text" style={{ textShadow: '0 0 20px rgba(168,85,247,0.5), 0 0 40px rgba(168,85,247,0.3)' }}>
              The Loop
            </h2>
            <p className="text-white/40 text-xs font-mono tracking-wider truncate flex items-center gap-2">
              <span>{new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
              <span className="text-white/20">•</span>
              <span className="text-purple-400 flex items-center gap-1">
                {currentMoonPhase} <span className="hidden sm:inline">Waxing</span>
              </span>
            </p>
            <p className="text-white/30 text-xs font-serif italic mt-1 hidden sm:block">{greeting.mood}</p>
          </div>
          
          {/* Streak badge - enhanced */}
          <div 
            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-2xl shrink-0 ml-2 cursor-default transition-all duration-500 ${
              userData.streak >= 7 
                ? 'bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-400/40 shadow-[0_0_20px_rgba(249,115,22,0.3)]' 
                : 'glass-enhanced border border-orange-500/20'
            }`}
            title={`${userData.streak} day streak`}
          >
            <div className="relative">
              <Flame className={`w-5 h-5 sm:w-6 sm:h-6 text-orange-400 drop-shadow-[0_0_10px_rgba(249,115,22,0.6)] ${userData.streak >= 7 ? 'animate-pulse' : ''}`} />
              {userData.streak >= 7 && (
                <div className="absolute inset-0 bg-orange-400/30 rounded-full blur-md animate-pulse" />
              )}
            </div>
            <div className="text-right">
              <span className="font-mono text-lg sm:text-xl font-bold text-white block leading-none counter">{userData.streak}</span>
              <span className="font-mono text-[10px] text-white/50 uppercase tracking-wider">day{userData.streak !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

      <GlassCard className="p-6 sm:p-8 relative overflow-hidden group cursor-pointer" intense hoverable onClick={startRitual}>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/50 via-indigo-900/50 to-blue-900/50 opacity-50 group-hover:opacity-100 transition-opacity duration-1000 animate-gradient" />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-purple-500/10 to-indigo-500/0 group-hover:via-purple-500/20 transition-all duration-1000" />
        {/* Subtle pulse effect */}
        <div className="absolute inset-0 bg-purple-500/0 group-hover:bg-purple-500/5 transition-all duration-1000 rounded-3xl" />
        <div className="relative z-10 flex flex-col items-center text-center space-y-4 sm:space-y-6">
          <div className="w-20 h-20 sm:w-28 sm:h-28 rounded-full bg-white/5 border-2 border-purple-500/30 flex items-center justify-center relative group-hover:border-purple-400/60 transition-all duration-500 group-hover:shadow-[0_0_40px_rgba(168,85,247,0.4)]">
             <div className="absolute inset-0 rounded-full border-t-2 border-purple-500 animate-spin-slow opacity-60" />
             <div className="absolute inset-0 rounded-full border-r-2 border-pink-500 animate-spin-slow opacity-40" style={{ animationDirection: 'reverse', animationDuration: '4s' }} />
             <Eye className="w-8 h-8 sm:w-12 sm:h-12 text-white/90 group-hover:text-white group-hover:scale-110 transition-all duration-300 drop-shadow-[0_0_20px_rgba(168,85,247,0.5)] group-hover:drop-shadow-[0_0_30px_rgba(168,85,247,0.8)]" />
          </div>
          <div>
            <h3 className="font-serif text-2xl sm:text-3xl text-white mb-2 sm:mb-3 bg-gradient-to-r from-white via-purple-100 to-white bg-clip-text text-transparent group-hover:text-glow transition-all duration-300">
              Daily Divination
            </h3>
            <p className="text-white/70 text-xs sm:text-sm max-w-[280px] mx-auto leading-relaxed px-2 mb-2">
              Tap to start your ritual. Hold the circle until it fills completely to receive your tarot reading.
            </p>
            <div className="flex items-center justify-center gap-2 text-white/50 text-xs font-mono">
              <Sparkles className="w-3 h-3 text-purple-400" />
              <span>Earn 10 Aether Coins per reading</span>
            </div>
          </div>
          <Button 
            onClick={startRitual} 
            className="mt-2 w-full sm:w-auto min-h-[48px] group-hover:shadow-[0_0_30px_rgba(168,85,247,0.5)]" 
            disabled={isProcessing}
          >
            Start Reading
          </Button>
        </div>
      </GlassCard>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 relative z-10">
        <GlassCard 
          className="p-4 sm:p-5 flex flex-col items-center text-center gap-2 sm:gap-3 cursor-pointer group min-h-[120px] sm:min-h-[140px]" 
          hoverable
          onClick={() => {
            triggerHaptic('light');
            setView('altar');
          }}
        >
           <div className="p-3 sm:p-4 rounded-full bg-gradient-to-br from-orange-500/30 to-red-500/30 text-orange-300 group-hover:from-orange-500/50 group-hover:to-red-500/50 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(249,115,22,0.4)] relative">
             <Flame className="w-6 h-6 sm:w-7 sm:h-7 relative z-10" />
             {userData.streak > 0 && (
               <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-400 rounded-full border-2 border-black animate-pulse z-10" />
             )}
           </div>
           <span className="font-serif text-white text-sm sm:text-base group-hover:text-orange-300 transition-colors">Digital Altar</span>
           {userData.streak > 0 ? (
             <span className="font-mono text-xs text-orange-400/70">{userData.streak} day streak</span>
           ) : (
             <span className="font-mono text-xs text-white/50 hidden sm:block">View your collection</span>
           )}
        </GlassCard>
        
        <GlassCard 
          className="p-4 sm:p-5 flex flex-col items-center text-center gap-2 sm:gap-3 cursor-pointer group min-h-[120px] sm:min-h-[140px]" 
          hoverable
          onClick={() => {
            triggerHaptic('light');
            setView('bondRoast');
          }}
        >
           <div className="p-3 sm:p-4 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 text-indigo-300 group-hover:from-indigo-500/50 group-hover:to-purple-500/50 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(99,102,241,0.4)]">
             <User className="w-6 h-6 sm:w-7 sm:h-7" />
           </div>
           <span className="font-serif text-white text-sm sm:text-base group-hover:text-indigo-300 transition-colors">Bond Roast</span>
           <span className="font-mono text-xs text-white/50 hidden sm:block">Relationship readings</span>
        </GlassCard>

        <GlassCard 
          className="p-4 sm:p-5 flex flex-col items-center text-center gap-2 sm:gap-3 cursor-pointer group min-h-[120px] sm:min-h-[140px]" 
          hoverable
          onClick={() => {
            triggerHaptic('light');
            setView('sanctuary');
          }}
        >
           <div className="p-3 sm:p-4 rounded-full bg-gradient-to-br from-emerald-500/30 to-teal-500/30 text-emerald-300 group-hover:from-emerald-500/50 group-hover:to-teal-500/50 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(16,185,129,0.4)] relative">
             <MapPin className="w-6 h-6 sm:w-7 sm:h-7 relative z-10" />
             {(nearbySanctuaries?.length || 0) > 0 && (
               <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full border-2 border-black animate-pulse z-10" />
             )}
           </div>
           <span className="font-serif text-white text-sm sm:text-base group-hover:text-emerald-300 transition-colors">Sanctuary</span>
           {(nearbySanctuaries?.length || 0) > 0 ? (
             <span className="font-mono text-xs text-emerald-400/70">{(nearbySanctuaries?.length || 0)} nearby</span>
           ) : (
             <span className="font-mono text-xs text-white/50 hidden sm:block">Find nearby covens</span>
           )}
        </GlassCard>

        <GlassCard 
          className="p-4 sm:p-5 flex flex-col items-center text-center gap-2 sm:gap-3 cursor-pointer group min-h-[120px] sm:min-h-[140px]" 
          hoverable
          onClick={() => {
            triggerHaptic('light');
            setShowPaywall(true);
          }}
        >
           <div className="p-3 sm:p-4 rounded-full bg-gradient-to-br from-rose-500/30 to-pink-500/30 text-rose-300 group-hover:from-rose-500/50 group-hover:to-pink-500/50 transition-all duration-300 group-hover:scale-110 group-hover:shadow-[0_0_25px_rgba(244,63,94,0.4)]">
             <CreditCard className="w-6 h-6 sm:w-7 sm:h-7" />
           </div>
           <span className="font-serif text-white text-sm sm:text-base group-hover:text-rose-300 transition-colors">SOS Read</span>
            <span className="font-mono text-xs text-white/50">$1.99 • Instant</span>
        </GlassCard>
      </div>
      
      {/* Subtle credit footer */}
      <div className="relative z-10 pt-4 pb-2 text-center">
        <p className="text-white/15 text-[10px] font-mono tracking-[0.2em] uppercase">
          By Will A. For Iamê M.
        </p>
      </div>
    </div>
    );
  };

  const RitualScreen = () => (
    <div 
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black select-none overflow-hidden"
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
      
      {/* Multiple rotating auras */}
      <div 
        className="absolute w-[600px] h-[600px] rounded-full blur-[120px] transition-all duration-100 ease-linear"
        style={{
          background: `conic-gradient(from ${ritualProgress * 3.6}deg, #4f46e5, #ec4899, #8b5cf6, #4f46e5)`,
          transform: `scale(${1 + (ritualProgress / 50)}) rotate(${ritualProgress * 3.6}deg)`,
          opacity: 0.3 + (ritualProgress / 200)
        }}
        aria-hidden="true"
      />
      <div 
        className="absolute w-[400px] h-[400px] rounded-full blur-[80px] transition-all duration-150 ease-linear"
        style={{
          background: `conic-gradient(from ${-ritualProgress * 2.4}deg, #ec4899, #8b5cf6, #4f46e5, #ec4899)`,
          transform: `scale(${0.8 + (ritualProgress / 60)}) rotate(${-ritualProgress * 2.4}deg)`,
          opacity: 0.2 + (ritualProgress / 250)
        }}
        aria-hidden="true"
      />
      
      {/* Energy waves on progress */}
      {ritualProgress > 0 && Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="absolute w-32 h-32 rounded-full border-2 border-purple-400/30 animate-energy-wave"
          style={{
            animationDelay: `${i * 0.3}s`,
            left: '50%',
            top: '50%',
            transform: 'translate(-50%, -50%)'
          }}
        />
      ))}

        <div className="relative z-10 text-center space-y-8 sm:space-y-12 px-4">
        <div className="space-y-3">
          <h2 className="font-serif text-xl sm:text-2xl md:text-3xl text-white tracking-widest animate-pulse px-4 text-glow">
            {ritualProgress > 0 ? "HOLD TO MANIFEST" : "TOUCH & HOLD"}
          </h2>
          <p className="text-white/60 text-xs sm:text-sm font-mono px-4 max-w-sm mx-auto leading-relaxed">
            {ritualProgress === 0 
              ? "Press and hold the circle below. Don't let go until it's complete."
              : ritualProgress < 25
              ? "Keep holding... your reading is manifesting"
              : ritualProgress < 50
              ? "The void is responding..."
              : ritualProgress < 75
              ? "Almost there... energy building"
              : ritualProgress < 90
              ? "Final moments... prepare for revelation"
              : "Complete! Receiving your reading..."}
          </p>
          {ritualProgress > 0 && ritualProgress < 100 && (
            <div className="flex items-center justify-center gap-2 text-white/40 text-xs font-mono animate-pulse">
              <div className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-pulse" />
              <span>Channeling energy...</span>
            </div>
          )}
        </div>
        
        <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto flex items-center justify-center">
           <svg className="absolute inset-0 w-full h-full -rotate-90" aria-hidden="true" viewBox="0 0 160 160">
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
             className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-white/10 backdrop-blur-md border-2 border-white/20 flex items-center justify-center transition-all duration-200 ${ritualProgress > 0 ? 'scale-90 bg-white/20 border-purple-400/50 animate-ritual-pulse glow-purple-intense' : 'scale-100'}`}
             role="progressbar"
             aria-valuenow={ritualProgress}
             aria-valuemin={0}
             aria-valuemax={100}
             aria-label={`Ritual progress: ${ritualProgress}%`}
           >
              <Sparkles className={`w-6 h-6 sm:w-8 sm:h-8 text-white transition-all duration-300 ${ritualProgress > 0 ? 'opacity-100 text-glow-intense animate-sparkle' : 'opacity-50'}`} />
              {ritualProgress >= 100 && (
                <div className="absolute inset-0 rounded-full border-2 border-green-400 animate-energy-wave" />
              )}
           </div>
        </div>

        <div className="space-y-2">
          <p className="font-mono text-xs sm:text-sm text-white/40 uppercase tracking-widest">
            {ritualProgress}% Manifested
          </p>
          {ritualProgress >= 100 && (
            <div className="flex items-center justify-center gap-2 text-green-400 text-xs font-mono animate-pulse">
              <Check className="w-4 h-4" />
              <span>Ritual Complete!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const ResultScreen = () => {
    const [cardRevealed, setCardRevealed] = useState(false);
    
    useEffect(() => {
      if (!reading) {
        setView('dashboard');
      } else {
        setTimeout(() => setCardRevealed(true), 200);
      }
    }, [reading]);
    
    if (!reading) return null;
    
    return (
      <div className="min-h-screen p-4 sm:p-6 pb-28 sm:pb-24 flex flex-col items-center justify-center space-y-6 sm:space-y-8 animate-in zoom-in-95 duration-700 relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 particle-bg opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-indigo-900/10" />
        
        {/* Sparkle effects */}
        {cardRevealed && Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="absolute particle animate-sparkle"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
              width: '4px',
              height: '4px',
              animationDelay: `${i * 0.2}s`
            }}
          />
        ))}
        
        <div className={`relative w-full max-w-[280px] sm:w-64 h-[350px] sm:h-80 rounded-2xl overflow-hidden border border-white/20 shadow-2xl ${cardRevealed ? 'animate-card-reveal' : ''}`}>
           <div className="absolute inset-0 bg-black" />
           <div 
             className="absolute inset-0 blur-xl opacity-80 transition-opacity duration-1000"
             style={{
                background: `
                  radial-gradient(circle at ${reading.auraVisual.position}% 20%, ${reading.auraVisual.gradient1}, transparent),
                  radial-gradient(circle at ${100 - reading.auraVisual.position}% 80%, ${reading.auraVisual.gradient2}, transparent),
                  conic-gradient(from ${reading.auraVisual.rotation}deg, ${reading.auraVisual.gradient3}, #000, ${reading.auraVisual.gradient1})
                `
             }}
           />
           {/* Glow effect */}
           <div 
             className="absolute inset-0 opacity-0 transition-opacity duration-1000"
             style={{
               background: `radial-gradient(circle at center, ${reading.auraVisual.gradient1}40, transparent 70%)`,
               opacity: cardRevealed ? 0.3 : 0
             }}
           />
           <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center z-10 bg-black/20">
             <h2 className={`font-serif text-3xl text-white font-bold mb-2 transition-all duration-1000 ${cardRevealed ? 'text-glow-intense scale-100' : 'scale-90 opacity-0'}`}>
               {reading.card.name}
             </h2>
             <span className={`font-mono text-xs text-white/70 tracking-widest uppercase border border-white/20 px-2 py-1 rounded-full transition-all duration-1000 delay-300 ${cardRevealed ? 'opacity-100' : 'opacity-0'}`}>
                {reading.card.archetype}
             </span>
           </div>
        </div>

        <GlassCard className={`p-6 w-full max-w-md space-y-4 ${cardRevealed ? 'animate-in slide-in-from-bottom-10' : 'opacity-0'}`} intense style={{ animationDelay: '0.6s' }}>
          <div className="flex justify-between items-center border-b border-white/10 pb-4">
            <span className="text-white/50 font-mono text-xs uppercase tracking-wider">Interpretation</span>
            <span className={`text-xs font-bold px-3 py-1.5 rounded-full bg-white/10 border ${reading.type === 'roast' ? 'text-red-400 border-red-500/30' : 'text-purple-400 border-purple-500/30'} animate-pulse-glow`}>
              {reading.type === 'roast' ? 'SHADOW ROAST' : 'MYSTIC GUIDANCE'}
            </span>
          </div>
          <p className="text-white text-lg sm:text-xl font-serif leading-relaxed italic">
            "{reading.type === 'roast' ? reading.card.roast : reading.card.light}"
          </p>
          {cardRevealed && (
            <div className="pt-2 flex items-center justify-center gap-2 text-white/40 text-xs font-mono">
              <Sparkles className="w-3 h-3" />
              <span>Reading #{userData.readings.length}</span>
            </div>
          )}
        </GlassCard>

        <div className={`flex gap-3 sm:gap-4 w-full max-w-md ${cardRevealed ? 'animate-in slide-in-from-bottom-10' : 'opacity-0'}`} style={{ animationDelay: '0.8s' }}>
          <Button 
            className="flex-1 flex items-center justify-center gap-2 min-h-[48px]" 
            variant="primary" 
            onClick={handleShare} 
            loading={isLoading}
          >
             <Share2 className="w-4 h-4" /> Share
          </Button>
          <Button 
            className="flex-1 flex items-center justify-center gap-2 min-h-[48px]" 
            variant="secondary" 
            onClick={createShadowSend} 
            loading={isLoading}
          >
             <Ghost className="w-4 h-4" /> Shadow Send
          </Button>
        </div>
        
        <Button 
          className={`w-full max-w-md min-h-[44px] ${cardRevealed ? 'animate-in fade-in' : 'opacity-0'}`} 
          variant="ghost" 
          onClick={() => {
            triggerHaptic('light');
            setView('dashboard');
          }}
          style={{ animationDelay: '1s' }}
        >
           Return to the Loop
        </Button>
      </div>
    );
  };

  const AltarView = () => (
    <div className="min-h-screen p-4 sm:p-6 pb-28 sm:pb-24 space-y-4 sm:space-y-6 animate-in fade-in">
        <div className="text-center space-y-2 pt-4 sm:pt-8">
            <h2 className="font-serif text-2xl sm:text-3xl text-white">Your Altar</h2>
            <p className="font-mono text-xs text-white/50 px-4">Keep the flame alive to invite stronger energies.</p>
        </div>

        <div className="h-64 relative rounded-t-full border-b border-white/20 bg-gradient-to-b from-transparent via-purple-900/10 to-purple-900/20 flex items-end justify-center p-8 gap-4 overflow-hidden">
            {/* Subtle glow effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-orange-500/10 to-transparent" />
            
            {userData.streak > 0 ? (
              <>
                {Array.from({ length: Math.min(5, userData.streak || 1) }).map((_, i) => (
                    <div key={i} className="flex flex-col items-center group cursor-default relative z-10 animate-in fade-in" style={{ animationDelay: `${i * 100}ms` }}>
                        <div className="w-2 h-4 bg-orange-400 rounded-full blur-[2px] animate-pulse mb-1 group-hover:scale-125 transition-transform drop-shadow-[0_0_8px_rgba(249,115,22,0.8)]" />
                        <div className="w-4 h-16 bg-gradient-to-b from-white via-orange-50 to-gray-300 rounded-sm opacity-80 group-hover:opacity-100 transition-opacity shadow-[0_0_10px_rgba(249,115,22,0.3)]" />
                    </div>
                ))}
                {userData.streak > 5 && (
                    <div className="font-mono text-xs text-white/60 absolute bottom-2 right-4 bg-black/40 px-2 py-1 rounded-full border border-white/10 animate-in fade-in">
                       + {userData.streak - 5} more
                    </div>
                )}
              </>
            ) : (
                <div className="absolute inset-0 flex items-center justify-center animate-in fade-in">
                   <div className="text-center space-y-3">
                     <Flame className="w-10 h-10 mx-auto text-white/20 animate-pulse" />
                     <p className="text-white/40 font-mono text-xs">Light your first candle</p>
                     <p className="text-white/30 font-mono text-xs">Complete a reading to begin</p>
                   </div>
                 </div>
            )}
        </div>

        <div className="grid grid-cols-2 gap-4">
            <GlassCard className="p-5 text-center group hover:scale-105 transition-all duration-300 cursor-default" hoverable>
                <div className="text-4xl font-serif text-white mb-2 text-glow group-hover:scale-110 transition-transform duration-300">{userData.streak}</div>
                <div className="text-xs font-mono text-white/50 uppercase tracking-wider flex items-center justify-center gap-1.5">
                  <Flame className="w-3 h-3 text-orange-400" />
                  Day Streak
                </div>
                {userData.streak >= 7 && (
                  <div className="mt-2 text-xs font-mono text-orange-400 animate-pulse">🔥 On Fire!</div>
                )}
            </GlassCard>
            <GlassCard className="p-5 text-center group hover:scale-105 transition-all duration-300 cursor-default" hoverable>
                <div className="text-4xl font-serif text-white mb-2 text-glow group-hover:scale-110 transition-transform duration-300">{userData.coins}</div>
                <div className="text-xs font-mono text-white/50 uppercase tracking-wider flex items-center justify-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-purple-400" />
                  Aether Coins
                </div>
                {userData.coins >= 500 && (
                  <div className="mt-2 text-xs font-mono text-purple-400 animate-pulse">✨ Wealthy!</div>
                )}
            </GlassCard>
        </div>

        <GlassCard className="p-6" intense>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-serif text-white">Grimoire Collection</h3>
              {userData.readings.length > 0 && (
                <span className="text-xs font-mono text-white/40">
                  {userData.readings.length} {userData.readings.length === 1 ? 'reading' : 'readings'}
                </span>
              )}
            </div>
            <div className="grid grid-cols-4 gap-2">
                {userData.readings.length > 0 ? (
                  userData.readings.slice(-8).map((reading, idx) => (
                    <div 
                      key={reading.id || idx} 
                      className="aspect-square rounded-lg bg-white/5 border border-white/10 overflow-hidden relative group cursor-pointer hover:border-white/40 hover:scale-105 transition-all duration-300 hover:shadow-[0_0_20px_rgba(168,85,247,0.3)]"
                      onClick={() => {
                        setReading(reading);
                        setView('result');
                      }}
                    >
                        <div 
                          className="w-full h-full opacity-70 transition-opacity group-hover:opacity-100"
                          style={{
                            background: `
                              radial-gradient(circle at ${reading.auraVisual?.position || 50}% 20%, ${reading.auraVisual?.gradient1 || '#4f46e5'}, transparent),
                              radial-gradient(circle at ${100 - (reading.auraVisual?.position || 50)}% 80%, ${reading.auraVisual?.gradient2 || '#ec4899'}, transparent)
                            `
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                          <span className="text-xs font-serif text-white bg-black/70 px-3 py-1.5 rounded-full border border-white/20">{reading.card.name}</span>
                        </div>
                        {/* Type indicator */}
                        <div className="absolute top-1 right-1">
                          <div className={`w-2 h-2 rounded-full ${reading.type === 'roast' ? 'bg-red-400' : 'bg-purple-400'} shadow-[0_0_8px_currentColor]`} />
                        </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-4 text-center py-12 animate-in fade-in">
                    <div className="relative inline-block mb-4">
                      <Ghost className="w-12 h-12 mx-auto text-white/20 animate-pulse" />
                      <div className="absolute inset-0 w-12 h-12 bg-purple-400/10 rounded-full blur-xl" />
                    </div>
                    <p className="text-white/40 font-mono text-xs mb-2">No readings yet.</p>
                    <p className="text-white/30 font-mono text-xs mb-4">Complete your first ritual to begin your collection.</p>
                    <Button 
                      variant="ghost" 
                      className="text-xs"
                      onClick={() => setView('dashboard')}
                    >
                      Start Reading →
                    </Button>
                  </div>
                )}
            </div>
        </GlassCard>
        <Button className="w-full min-h-[44px]" variant="secondary" onClick={() => setView('dashboard')}>Back to the Loop</Button>
    </div>
  );

  // Custom map marker icons for Leaflet
  const createCustomIcon = (color, isUser = false) => {
    const colors = {
      purple: '#a855f7',
      emerald: '#10b981',
      pink: '#ec4899',
      indigo: '#6366f1',
      orange: '#f97316',
      blue: '#3b82f6'
    };
    const iconColor = colors[color] || colors.purple;
    
    if (isUser) {
      return L.divIcon({
        className: 'custom-marker',
        html: `
          <div style="position: relative;">
            <div style="
              width: 20px;
              height: 20px;
              background: ${iconColor};
              border-radius: 50%;
              border: 3px solid white;
              box-shadow: 0 0 20px ${iconColor}, 0 0 40px ${iconColor}40;
              animation: pulse 2s infinite;
            "></div>
            <div style="
              position: absolute;
              inset: -10px;
              background: ${iconColor}30;
              border-radius: 50%;
              animation: ping 2s infinite;
            "></div>
          </div>
        `,
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      });
    }
    
    return L.divIcon({
      className: 'custom-marker',
      html: `
        <div style="position: relative; cursor: pointer;">
          <svg width="36" height="48" viewBox="0 0 24 32" fill="none" style="filter: drop-shadow(0 0 10px ${iconColor}80);">
            <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20c0-6.6-5.4-12-12-12z" fill="${iconColor}"/>
            <circle cx="12" cy="12" r="5" fill="white" opacity="0.9"/>
          </svg>
        </div>
      `,
      iconSize: [36, 48],
      iconAnchor: [18, 48],
      popupAnchor: [0, -48]
    });
  };

  // Map recenter component
  const MapRecenter = ({ center }) => {
    const map = useMap();
    useEffect(() => {
      if (center) {
        map.setView([center.lat, center.lng], 14, { animate: true });
      }
    }, [center, map]);
    return null;
  };

  const SanctuaryMap = () => {
    const [selectedSanctuary, setSelectedSanctuary] = useState(null);
    
    // Memoize icons to prevent recreation
    const userIcon = useMemo(() => createCustomIcon('blue', true), []);
    const sanctuaryIcons = useMemo(() => ({
      purple: createCustomIcon('purple'),
      emerald: createCustomIcon('emerald'),
      pink: createCustomIcon('pink'),
      indigo: createCustomIcon('indigo'),
      orange: createCustomIcon('orange')
    }), []);

    return (
      <div className="min-h-screen relative bg-gray-900 pb-28">
        {/* Loading State */}
        {isLoading && !mapCenter && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/80">
            <div className="text-center space-y-4">
              <Loader2 className="w-12 h-12 mx-auto text-purple-400 animate-spin" />
              <p className="text-white/60 font-mono text-sm">Locating your energy...</p>
              <p className="text-white/40 font-mono text-xs">Finding nearby sanctuaries</p>
            </div>
          </div>
        )}

        {/* Error State */}
        {locationError && (
          <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/80">
            <GlassCard className="p-6 max-w-sm text-center space-y-4" intense>
              <MapPin className="w-12 h-12 mx-auto text-red-400" />
              <div>
                <h3 className="text-white font-serif text-lg mb-2">Location Unavailable</h3>
                <p className="text-white/60 text-sm leading-relaxed">{locationError}</p>
              </div>
              <Button variant="secondary" onClick={() => {
                setLocationError(null);
                // Try to get location again
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      const { latitude, longitude } = position.coords;
                      const fuzzDistance = 0.0036;
                      const fuzzAngle = Math.random() * 2 * Math.PI;
                      const fuzzed = {
                        lat: latitude + (Math.cos(fuzzAngle) * fuzzDistance),
                        lng: longitude + (Math.sin(fuzzAngle) * fuzzDistance)
                      };
                      setFuzzedLocation(fuzzed);
                      setMapCenter(fuzzed);
                      generateNearbySanctuaries(fuzzed);
                    },
                    () => setLocationError('Please enable location services to find nearby sanctuaries.')
                  );
                }
              }}>
                Try Again
              </Button>
              <Button variant="ghost" onClick={() => setView('dashboard')}>
                Return to Loop
              </Button>
            </GlassCard>
          </div>
        )}

        {/* Leaflet Map */}
        {mapCenter && !locationError && (
          <div className="absolute inset-0" style={{ zIndex: 1 }}>
            <MapContainer
              center={[mapCenter.lat, mapCenter.lng]}
              zoom={14}
              style={{ height: '100%', width: '100%' }}
              zoomControl={false}
              attributionControl={false}
            >
              {/* Dark themed map tiles from CartoDB */}
              <TileLayer
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              />
              
              {/* Recenter when location changes */}
              <MapRecenter center={mapCenter} />
              
              {/* Privacy radius circle */}
              {fuzzedLocation && (
                <Circle
                  center={[fuzzedLocation.lat, fuzzedLocation.lng]}
                  radius={400}
                  pathOptions={{
                    color: '#8b5cf6',
                    fillColor: '#8b5cf6',
                    fillOpacity: 0.1,
                    weight: 1,
                    dashArray: '5, 10'
                  }}
                />
              )}
              
              {/* User location marker */}
              {fuzzedLocation && (
                <Marker 
                  position={[fuzzedLocation.lat, fuzzedLocation.lng]} 
                  icon={userIcon}
                >
                  <Popup className="custom-popup">
                    <div className="text-center p-2">
                      <p className="font-semibold text-purple-600">Your Location</p>
                      <p className="text-xs text-gray-500">Ghost Mode: ~400m offset</p>
                    </div>
                  </Popup>
                </Marker>
              )}
              
              {/* Sanctuary markers */}
              {(nearbySanctuaries || []).map((sanctuary) => (
                <Marker
                  key={sanctuary.id}
                  position={[sanctuary.lat, sanctuary.lng]}
                  icon={sanctuaryIcons[sanctuary.color] || sanctuaryIcons.purple}
                  eventHandlers={{
                    click: () => {
                      setSelectedSanctuary(sanctuary);
                      triggerHaptic('light');
                    }
                  }}
                >
                  <Popup className="custom-popup">
                    <div className="p-2 min-w-[150px]">
                      <p className="font-semibold text-purple-600">{sanctuary.name}</p>
                      <p className="text-xs text-gray-500 mt-1">{sanctuary.distance}km away</p>
                      <p className="text-xs text-gray-400 mt-2 italic">{sanctuary.vibe}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        )}

        {/* Info Panel Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pb-32 bg-gradient-to-t from-black via-black/95 to-transparent space-y-3" style={{ zIndex: 10 }}>
          {/* Selected sanctuary info */}
          {selectedSanctuary && (
            <GlassCard className="p-4 space-y-2 animate-in slide-in-from-bottom-10" intense>
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-white font-serif text-lg">{selectedSanctuary.name}</h3>
                  <p className="text-purple-400 font-mono text-xs">{selectedSanctuary.distance}km • {selectedSanctuary.members} members</p>
                </div>
                <button 
                  onClick={() => setSelectedSanctuary(null)}
                  className="text-white/40 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-white/60 text-sm italic">"{selectedSanctuary.vibe}"</p>
              <Button className="w-full" variant="primary" size="sm" onClick={() => {
                addNotification(`Joining ${selectedSanctuary.name}...`, 'info');
                setSelectedSanctuary(null);
              }}>
                Request to Join
              </Button>
            </GlassCard>
          )}
          
          {/* Location info */}
          {mapCenter && !selectedSanctuary && (
            <GlassCard className="p-3 flex items-center gap-3" intense>
              <div className="relative">
                <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
                <div className="absolute inset-0 w-3 h-3 bg-blue-400 rounded-full animate-ping opacity-50" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/80 font-mono text-xs">Your Mystic Location</p>
                <p className="text-white/40 font-mono text-xs truncate">
                  {mapCenter.lat.toFixed(4)}°, {mapCenter.lng.toFixed(4)}°
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-purple-400 font-mono text-sm font-bold">{(nearbySanctuaries?.length || 0)}</p>
                <p className="text-white/40 font-mono text-xs">nearby</p>
              </div>
            </GlassCard>
          )}
          
          {/* Ghost Mode info */}
          <GlassCard className="p-4 flex items-start gap-3" intense>
            <div className="p-2 bg-emerald-500/20 rounded-lg shrink-0">
              <Shield className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-serif text-base mb-0.5">Ghost Mode Active</h3>
              <p className="text-white/50 text-xs leading-relaxed">
                Your exact location is hidden. Others see you within a ~400m radius.
              </p>
            </div>
          </GlassCard>
          
          {/* Action buttons */}
          <div className="flex gap-2">
            <Button 
              className="flex-1" 
              variant="secondary"
              size="sm"
              onClick={() => {
                if (navigator.geolocation) {
                  setIsLoading(true);
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      const { latitude, longitude } = position.coords;
                      const fuzzDistance = 0.0036;
                      const fuzzAngle = Math.random() * 2 * Math.PI;
                      const newFuzzed = {
                        lat: latitude + (Math.cos(fuzzAngle) * fuzzDistance),
                        lng: longitude + (Math.sin(fuzzAngle) * fuzzDistance)
                      };
                      setFuzzedLocation(newFuzzed);
                      setMapCenter(newFuzzed);
                      generateNearbySanctuaries(newFuzzed);
                      addNotification('Location refreshed', 'success');
                      setIsLoading(false);
                    },
                    () => {
                      addNotification('Failed to refresh location', 'error');
                      setIsLoading(false);
                    }
                  );
                }
              }}
              disabled={!mapCenter || isLoading}
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Refresh'}
            </Button>
            <Button className="flex-1" variant="secondary" size="sm" onClick={() => setView('dashboard')}>
              Exit Map
            </Button>
          </div>
        </div>
        
        {/* Custom CSS for Leaflet popups */}
        <style>{`
          .leaflet-popup-content-wrapper {
            background: rgba(0, 0, 0, 0.9);
            border: 1px solid rgba(139, 92, 246, 0.3);
            border-radius: 12px;
            backdrop-filter: blur(10px);
          }
          .leaflet-popup-content {
            margin: 8px;
            color: white;
          }
          .leaflet-popup-tip {
            background: rgba(0, 0, 0, 0.9);
            border: 1px solid rgba(139, 92, 246, 0.3);
          }
          .leaflet-popup-close-button {
            color: rgba(255, 255, 255, 0.6) !important;
          }
          .custom-marker {
            background: transparent !important;
            border: none !important;
          }
          @keyframes ping {
            75%, 100% {
              transform: scale(2);
              opacity: 0;
            }
          }
          @keyframes pulse {
            0%, 100% {
              opacity: 1;
            }
            50% {
              opacity: 0.7;
            }
          }
        `}</style>
      </div>
    );
  };

  const BondRoastView = () => {
    const [revealed, setRevealed] = useState(false);
    
    useEffect(() => {
      if (bondRoast) {
        setTimeout(() => setRevealed(true), 300);
      } else {
        setRevealed(false);
      }
    }, [bondRoast]);
    
    return (
      <div className="min-h-screen p-4 sm:p-6 pb-28 flex flex-col items-center justify-center space-y-6 animate-in fade-in relative overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 particle-bg opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 via-purple-900/10 to-pink-900/10" />
        
        {!bondRoast ? (
        <GlassCard className="p-6 sm:p-8 w-full max-w-md space-y-6" intense>
          <div className="text-center space-y-2">
            <User className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-indigo-400" />
            <h2 className="font-serif text-2xl sm:text-3xl text-white bg-gradient-to-r from-indigo-200 to-purple-200 bg-clip-text text-transparent">
              Bond Roast
            </h2>
            <p className="text-white/70 text-xs sm:text-sm px-2">
              Get brutally honest relationship compatibility readings. Enter two names (or leave blank for "You" vs "Them").
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-white/70 text-xs font-mono uppercase tracking-wider block mb-2">
                First Person (or "You")
              </label>
              <input
                type="text"
                value={bondName1}
                onChange={(e) => setBondName1(e.target.value)}
                placeholder="You"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                maxLength={20}
              />
            </div>
            
            <div className="flex items-center justify-center py-2">
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
              <span className="px-4 text-white/40 font-serif">vs</span>
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            </div>
            
            <div>
              <label className="text-white/70 text-xs font-mono uppercase tracking-wider block mb-2">
                Second Person (or "Them")
              </label>
              <input
                type="text"
                value={bondName2}
                onChange={(e) => setBondName2(e.target.value)}
                placeholder="Them"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                maxLength={20}
              />
            </div>
          </div>
          
          <Button 
            className="w-full" 
            variant="primary" 
            onClick={generateBondRoast}
            disabled={isLoading}
          >
            Roast This Bond
          </Button>
          
          <Button 
            className="w-full" 
            variant="ghost" 
            onClick={() => setView('dashboard')}
          >
            Back to Loop
          </Button>
        </GlassCard>
      ) : (
        <>
          <GlassCard className={`p-6 sm:p-8 w-full max-w-md space-y-6 ${revealed ? 'animate-card-reveal' : 'opacity-0'}`} intense>
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-3 sm:gap-4">
                <div className="text-center p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 glass-premium">
                  <div className="text-base sm:text-lg font-serif text-white text-glow">{bondRoast.name1}</div>
                  <div className="text-xs font-mono text-indigo-400 uppercase mt-1">{bondRoast.you}</div>
                </div>
                <div className="text-white/40 text-xl sm:text-2xl font-serif animate-pulse">vs</div>
                <div className="text-center p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 glass-premium">
                  <div className="text-base sm:text-lg font-serif text-white text-glow">{bondRoast.name2}</div>
                  <div className="text-xs font-mono text-purple-400 uppercase mt-1">{bondRoast.them}</div>
                </div>
              </div>
            </div>
            
            <div className={`p-6 bg-gradient-to-br from-black/60 to-red-900/20 rounded-2xl border-2 border-red-500/40 space-y-4 ${revealed ? 'animate-card-reveal' : ''}`} style={{ animationDelay: '0.2s' }}>
              <div className="text-center relative">
                <div className="text-5xl sm:text-6xl font-serif text-red-400 mb-2 text-glow-intense animate-pulse-glow">
                  {bondRoast.compatibility}%
                </div>
                <div className="text-xs font-mono text-white/50 uppercase tracking-wider mb-4">Compatibility</div>
                {/* Progress bar */}
                <div className="mt-4 h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/10">
                  <div 
                    className="h-full bg-gradient-to-r from-red-500 via-red-400 to-red-500 transition-all duration-1000 shadow-[0_0_10px_rgba(239,68,68,0.6)]"
                    style={{ width: `${bondRoast.compatibility}%` }}
                  />
                </div>
                {/* Compatibility message */}
                <p className="mt-3 text-xs font-mono text-white/40">
                  {bondRoast.compatibility < 30 
                    ? '💀 Toxic territory'
                    : bondRoast.compatibility < 50
                    ? '⚠️ Proceed with caution'
                    : bondRoast.compatibility < 70
                    ? '✨ Potential exists'
                    : '🔥 Strong connection'}
                </p>
              </div>
              
              <div className="pt-4 border-t border-white/10">
                <p className={`text-white text-base sm:text-lg font-serif leading-relaxed text-center italic ${revealed ? 'animate-in fade-in' : ''}`} style={{ animationDelay: '0.4s' }}>
                  "{bondRoast.roast}"
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                className="flex-1 flex items-center justify-center gap-2" 
                variant="primary" 
                onClick={async () => {
                  const text = `🔮 Bond Roast: ${bondRoast.name1} (${bondRoast.you}) vs ${bondRoast.name2} (${bondRoast.them})\n${bondRoast.compatibility}% Compatible\n\n"${bondRoast.roast}"\n\n— Mystic Loop: Modern Mischief. Sacred Systems. Viral Magic.`;
                  
                  if (navigator.share) {
                    try {
                      await navigator.share({
                        title: 'Bond Roast from Mystic Loop',
                        text: text,
                        url: window.location.href
                      });
                      addNotification('Roast shared to the void', 'success');
                    } catch (err) {
                      // Fallback to copy
                    }
                  }
                  
                  try {
                    await navigator.clipboard.writeText(text);
                    addNotification('Copied. Share the chaos.', 'success');
                    triggerHaptic('light');
                  } catch (err) {
                    addNotification('Failed to copy', 'error');
                  }
                }}
              >
                <Share2 className="w-4 h-4" /> Share
              </Button>
              <Button 
                className="flex-1" 
                variant="secondary" 
                onClick={() => {
                  setBondRoast(null);
                  setBondName1('');
                  setBondName2('');
                }}
              >
                New Roast
              </Button>
            </div>
            
            <Button 
              className="w-full" 
              variant="ghost" 
              onClick={() => setView('dashboard')}
            >
              Return to Loop
            </Button>
          </GlassCard>
        </>
      )}
      </div>
    );
  };

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
          <Button className="flex-1 min-h-[44px]" variant="secondary" onClick={() => setView('dashboard')}>
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
    <div 
      className="bg-black min-h-screen font-sans overflow-hidden relative"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Enhanced Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
          {/* Mood-based gradient */}
          <div className={`absolute inset-0 transition-opacity duration-1000 ${currentMood ? 'opacity-30' : 'opacity-10'}`} 
            style={{ 
                background: currentMood ? `linear-gradient(to bottom right, transparent, ${currentMood.color.split(' ')[1].replace('to-', '#')})` : 'none'
            }} 
          />
          
          {/* Animated orbs */}
          <div className="absolute top-[-20%] left-[-20%] w-[80%] h-[80%] bg-purple-900/20 rounded-full blur-[120px] animate-pulse animate-aurora" />
          <div className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[80%] bg-indigo-900/20 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-pink-900/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }} />
          
          {/* Particle overlay */}
          <div className="absolute inset-0 particle-bg opacity-10" />
      </div>

      {/* Notification Queue */}
      <div className="fixed top-4 sm:top-6 left-1/2 -translate-x-1/2 z-50 space-y-2 flex flex-col items-center max-w-sm w-full px-4">
        {notifications.map((notif, idx) => (
          <div 
            key={notif.id} 
            className="animate-in slide-in-from-top-4 fade-in w-full"
            style={{ animationDelay: `${idx * 100}ms` }}
          >
            <GlassCard className={`px-4 sm:px-6 py-2.5 sm:py-3 rounded-full flex items-center gap-2.5 justify-center shadow-lg ${
              notif.type === 'success' ? 'border-green-500/40 text-emerald-400 bg-emerald-500/5' :
              notif.type === 'error' ? 'border-red-500/40 text-red-400 bg-red-500/5' :
              'border-blue-500/40 text-blue-400 bg-blue-500/5'
            }`} intense>
              {notif.type === 'success' && <Check className="w-4 h-4 shrink-0" />}
              {notif.type === 'error' && <X className="w-4 h-4 shrink-0" />}
              {notif.type === 'info' && <Sparkles className="w-4 h-4 shrink-0 animate-pulse" />}
              <span className="text-xs sm:text-sm font-mono text-center">{notif.message}</span>
            </GlassCard>
          </div>
        ))}
      </div>

      {view === 'loading' && (
        <div className="h-screen flex flex-col items-center justify-center text-white space-y-6 relative overflow-hidden" role="status" aria-label="Loading">
          <div className="absolute inset-0 particle-bg opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/10 via-transparent to-indigo-900/10" />
          <div className="relative z-10 flex flex-col items-center space-y-4">
            <div className="relative">
              <Ghost className="w-16 h-16 animate-bounce opacity-80 drop-shadow-[0_0_20px_rgba(168,85,247,0.6)]" />
              <div className="absolute inset-0 w-16 h-16 bg-purple-400/30 rounded-full blur-xl animate-pulse" />
            </div>
            <div className="text-center space-y-2">
              <p className="font-mono text-sm animate-pulse tracking-wider">SUMMONING DAEMON...</p>
              <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full animate-gradient" style={{ width: '60%' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confetti Celebration */}
      {confettiActive && (
        <div className="fixed inset-0 pointer-events-none z-[9999]" aria-hidden="true">
          {Array.from({ length: 50 }).map((_, i) => {
            const colors = ['#a855f7', '#ec4899', '#6366f1', '#06b6d4', '#fbbf24', '#10b981'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            const left = Math.random() * 100;
            const delay = Math.random() * 0.5;
            const duration = 2 + Math.random() * 1;
            return (
              <div
                key={i}
                className="absolute w-3 h-3 rounded-full"
                style={{
                  left: `${left}%`,
                  top: '-10px',
                  background: color,
                  animation: `confetti-fall ${duration}s linear ${delay}s forwards`,
                  boxShadow: `0 0 10px ${color}80`
                }}
              />
            );
          })}
        </div>
      )}

      {/* Page Transitions */}
      <div className={`transition-opacity duration-300 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
        {view === 'welcome' && <WelcomeScreen />}
        {view === 'mood' && <MoodCompass />}
        {view === 'dashboard' && <Dashboard />}
        {view === 'ritual' && <RitualScreen />}
        {view === 'result' && <ResultScreen />}
        {view === 'altar' && <AltarView />}
        {view === 'sanctuary' && <SanctuaryMap />}
        {view === 'shadowSend' && <ShadowSendView />}
        {view === 'bondRoast' && <BondRoastView />}
      </div>
      
      {showPaywall && <PaywallModal />}

      {['dashboard', 'altar', 'sanctuary'].includes(view) && (
        <div className="fixed bottom-0 left-0 right-0 p-3 sm:p-4 z-40 safe-area-inset-bottom">
           <div className="max-w-md mx-auto bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl flex justify-between px-4 sm:px-8 py-3 sm:py-4 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
               <button 
                 onClick={() => {
                   triggerHaptic('light');
                   changeView('dashboard');
                 }} 
                 className={`transition-all duration-300 active:scale-90 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black rounded-lg p-2 min-w-[44px] min-h-[44px] flex items-center justify-center relative group ${view === 'dashboard' ? 'text-purple-400' : 'text-white/40 hover:text-white/60'}`}
                 aria-label="Dashboard"
                 aria-current={view === 'dashboard' ? 'page' : undefined}
               >
                   {view === 'dashboard' && (
                     <div className="absolute inset-0 bg-purple-500/10 rounded-lg blur-sm" />
                   )}
                   <Moon className={`w-6 h-6 relative z-10 transition-all duration-300 ${view === 'dashboard' ? 'drop-shadow-[0_0_10px_rgba(168,85,247,0.6)] scale-110' : 'group-hover:scale-110'}`} />
               </button>
               <button 
                 onClick={() => {
                   triggerHaptic('light');
                   changeView('altar');
                 }} 
                 className={`transition-all duration-300 active:scale-90 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-black rounded-lg p-2 min-w-[44px] min-h-[44px] flex items-center justify-center relative group ${view === 'altar' ? 'text-orange-400' : 'text-white/40 hover:text-white/60'}`}
                 aria-label="Digital Altar"
                 aria-current={view === 'altar' ? 'page' : undefined}
               >
                   {view === 'altar' && (
                     <div className="absolute inset-0 bg-orange-500/10 rounded-lg blur-sm" />
                   )}
                   <Flame className={`w-6 h-6 relative z-10 transition-all duration-300 ${view === 'altar' ? 'drop-shadow-[0_0_10px_rgba(249,115,22,0.6)] scale-110 animate-pulse' : 'group-hover:scale-110'}`} />
               </button>
               <button 
                 onClick={() => {
                   triggerHaptic('light');
                   changeView('sanctuary');
                 }} 
                 className={`transition-all duration-300 active:scale-90 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-black rounded-lg p-2 min-w-[44px] min-h-[44px] flex items-center justify-center relative group ${view === 'sanctuary' ? 'text-emerald-400' : 'text-white/40 hover:text-white/60'}`}
                 aria-label="Sanctuary"
                 aria-current={view === 'sanctuary' ? 'page' : undefined}
               >
                   {view === 'sanctuary' && (
                     <div className="absolute inset-0 bg-emerald-500/10 rounded-lg blur-sm" />
                   )}
                   <MapPin className={`w-6 h-6 relative z-10 transition-all duration-300 ${view === 'sanctuary' ? 'drop-shadow-[0_0_10px_rgba(16,185,129,0.6)] scale-110' : 'group-hover:scale-110'}`} />
               </button>
           </div>
        </div>
      )}
    </div>
  );
}
