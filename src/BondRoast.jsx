import React, { useState, useRef, useEffect, memo } from 'react';
import { User, Share2 } from 'lucide-react';

// Bond patterns data
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

// GlassCard component (simplified version)
const GlassCard = ({ children, className = "", intense = false }) => (
  <div 
    className={`
      glass-depth rounded-3xl transition-all duration-500 relative
      ${intense ? 'bg-white/10 shadow-[0_0_40px_rgba(168,85,247,0.15)]' : ''} 
      ${className}
    `}
  >
    <div className="absolute inset-0 rounded-3xl gradient-border pointer-events-none" />
    {children}
  </div>
);

// Button component (simplified version)
const Button = ({ children, onClick, variant = 'primary', className = "", disabled = false }) => {
  const base = "relative overflow-hidden font-mono tracking-wider uppercase transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-black px-4 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm rounded-xl min-h-[44px]";
  
  const styles = {
    primary: "bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 text-white shadow-[0_4px_20px_rgba(168,85,247,0.4)] hover:shadow-[0_8px_30px_rgba(168,85,247,0.6)] border border-purple-400/30 hover:border-purple-300/50 hover:scale-[1.02]",
    secondary: "bg-white/5 border border-white/20 text-white hover:bg-white/10 hover:border-white/40 hover:scale-[1.02]",
    ghost: "text-white/60 hover:text-white hover:bg-white/10 hover:scale-[1.02] border border-transparent hover:border-white/10",
  };
  
  return (
    <button 
      onClick={onClick} 
      className={`${base} ${styles[variant]} ${className}`} 
      disabled={disabled}
    >
      {children}
    </button>
  );
};

// Haptic feedback
const triggerHaptic = (type = 'light') => {
  if (navigator.vibrate) {
    const patterns = {
      light: [10],
      medium: [20],
      success: [10, 50, 10],
      error: [20, 50, 20, 50, 20]
    };
    navigator.vibrate(patterns[type] || patterns.light);
  }
};

// Main BondRoast component - memoized to prevent unnecessary re-renders
const BondRoast = memo(function BondRoast({ onBack, onNotification }) {
  const [roastResult, setRoastResult] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const name1Ref = useRef(null);
  const name2Ref = useRef(null);
  
  useEffect(() => {
    if (roastResult) {
      setTimeout(() => setRevealed(true), 300);
    } else {
      setRevealed(false);
    }
  }, [roastResult]);
  
  const handleGenerateRoast = () => {
    const name1 = name1Ref.current?.value?.trim() || 'You';
    const name2 = name2Ref.current?.value?.trim() || 'Them';
    
    const pattern = BOND_PATTERNS[Math.floor(Math.random() * BOND_PATTERNS.length)];
    
    const roast = {
      id: Date.now(),
      name1,
      name2,
      you: pattern.you,
      them: pattern.them,
      roast: pattern.roast,
      compatibility: pattern.compatibility,
    };
    
    setRoastResult(roast);
    triggerHaptic('success');
    if (onNotification) {
      onNotification('Bond roasted. Share the chaos.', 'success');
    }
  };
  
  const handleNewRoast = () => {
    setRoastResult(null);
    if (name1Ref.current) name1Ref.current.value = '';
    if (name2Ref.current) name2Ref.current.value = '';
  };
  
  const handleShare = async () => {
    if (!roastResult) return;
    const text = `🔮 Bond Roast: ${roastResult.name1} (${roastResult.you}) vs ${roastResult.name2} (${roastResult.them})\n${roastResult.compatibility}% Compatible\n\n"${roastResult.roast}"\n\n— Mystic Loop: Modern Mischief. Sacred Systems. Viral Magic.`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Bond Roast from Mystic Loop',
          text: text,
        });
        if (onNotification) onNotification('Roast shared to the void', 'success');
      } catch (err) {
        // Fallback to copy
      }
    }
    
    try {
      await navigator.clipboard.writeText(text);
      if (onNotification) onNotification('Copied. Share the chaos.', 'success');
      triggerHaptic('light');
    } catch (err) {
      if (onNotification) onNotification('Failed to copy', 'error');
    }
  };
  
  return (
    <div className="min-h-screen p-4 sm:p-6 pb-28 flex flex-col items-center justify-center space-y-6 animate-in fade-in relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 particle-bg opacity-20" />
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/10 via-purple-900/10 to-pink-900/10" />
      
      {!roastResult ? (
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
                ref={name1Ref}
                type="text"
                defaultValue=""
                placeholder="You"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                maxLength={20}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                enterKeyHint="next"
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
                ref={name2Ref}
                type="text"
                defaultValue=""
                placeholder="Them"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                maxLength={20}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                enterKeyHint="done"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleGenerateRoast();
                  }
                }}
              />
            </div>
          </div>
          
          <Button 
            className="w-full" 
            variant="primary" 
            onClick={handleGenerateRoast}
          >
            Roast This Bond
          </Button>
          
          <Button 
            className="w-full" 
            variant="ghost" 
            onClick={onBack}
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
                  <div className="text-base sm:text-lg font-serif text-white text-glow">{roastResult.name1}</div>
                  <div className="text-xs font-mono text-indigo-400 uppercase mt-1">{roastResult.you}</div>
                </div>
                <div className="text-white/40 text-xl sm:text-2xl font-serif animate-pulse">vs</div>
                <div className="text-center p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 glass-premium">
                  <div className="text-base sm:text-lg font-serif text-white text-glow">{roastResult.name2}</div>
                  <div className="text-xs font-mono text-purple-400 uppercase mt-1">{roastResult.them}</div>
                </div>
              </div>
            </div>
            
            <div className={`p-6 bg-gradient-to-br from-black/60 to-red-900/20 rounded-2xl border-2 border-red-500/40 space-y-4 ${revealed ? 'animate-card-reveal' : ''}`} style={{ animationDelay: '0.2s' }}>
              <div className="text-center relative">
                <div className="text-5xl sm:text-6xl font-serif text-red-400 mb-2 text-glow-intense animate-pulse-glow">
                  {roastResult.compatibility}%
                </div>
                <div className="text-xs font-mono text-white/50 uppercase tracking-wider mb-4">Compatibility</div>
                {/* Progress bar */}
                <div className="mt-4 h-2.5 bg-black/40 rounded-full overflow-hidden border border-white/10">
                  <div 
                    className="h-full bg-gradient-to-r from-red-500 via-red-400 to-red-500 transition-all duration-1000 shadow-[0_0_10px_rgba(239,68,68,0.6)]"
                    style={{ width: `${roastResult.compatibility}%` }}
                  />
                </div>
                {/* Compatibility message */}
                <p className="mt-3 text-xs font-mono text-white/40">
                  {roastResult.compatibility < 30 
                    ? '💀 Toxic territory'
                    : roastResult.compatibility < 50
                    ? '⚠️ Proceed with caution'
                    : roastResult.compatibility < 70
                    ? '✨ Potential exists'
                    : '🔥 Strong connection'}
                </p>
              </div>
              
              <div className="pt-4 border-t border-white/10">
                <p className={`text-white text-base sm:text-lg font-serif leading-relaxed text-center italic ${revealed ? 'animate-in fade-in' : ''}`} style={{ animationDelay: '0.4s' }}>
                  "{roastResult.roast}"
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                className="flex-1 flex items-center justify-center gap-2" 
                variant="primary" 
                onClick={handleShare}
              >
                <Share2 className="w-4 h-4" /> Share
              </Button>
              <Button 
                className="flex-1" 
                variant="secondary" 
                onClick={handleNewRoast}
              >
                New Roast
              </Button>
            </div>
            
            <Button 
              className="w-full" 
              variant="ghost" 
              onClick={onBack}
            >
              Return to Loop
            </Button>
          </GlassCard>
        </>
      )}
    </div>
  );
});

export default BondRoast;

