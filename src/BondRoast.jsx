import React, { useState, useRef, useEffect, memo } from 'react';
import { User, Share2 } from 'lucide-react';

// Bond patterns data - uses {name1} and {name2} placeholders for dynamic insertion
const BOND_PATTERNS = [
  { type1: "The Ghost", type2: "The Anchor", roast: "One's already halfway out the door while the other is picking out curtains. The avoidant-anxious tango never ends well.", compatibility: 23 },
  { type1: "The Mystic", type2: "The Skeptic", roast: "One reads tarot, the other reads spreadsheets. They'll either balance each other or drive each other insane. No in-between.", compatibility: 42 },
  { type1: "The Giver", type2: "The Taker", roast: "An endless pour into a bottomless cup. Beautiful codependency dressed up as love.", compatibility: 22 },
  { type1: "The Chaos", type2: "The Chaos", roast: "Two tornados in a trailer park. Exhilarating until someone loses a roof.", compatibility: 67 },
  { type1: "The Healer", type2: "The Wounded", roast: "One wants to fix, one wants to be saved. Neither gets what they actually need.", compatibility: 31 },
  { type1: "The Flirt", type2: "The Serious", roast: "One's collecting options, the other's planning a future. This math doesn't add up.", compatibility: 28 },
  { type1: "The Free Spirit", type2: "The Possessive", roast: "A bird and a cage. Someone's getting their wings clipped or their heart broken.", compatibility: 15 },
  { type1: "The Dreamer", type2: "The Doer", roast: "Vision meets execution. Could be powerful, could be resentment in three years.", compatibility: 52 },
  { type1: "The Empath", type2: "The Closed-Off", roast: "One feels everything, the other feels nothing. An emotional translator is needed.", compatibility: 35 },
  { type1: "The Fire", type2: "The Water", roast: "They'll either make steam or put each other out. Passion or extinction.", compatibility: 53 },
  { type1: "The Wanderer", type2: "The Homebody", roast: "One needs adventure, one needs roots. Someone will always be compromising.", compatibility: 48 },
  { type1: "The Overthinker", type2: "The Impulsive", roast: "One's still analyzing while the other already moved on. Timing is everything they don't have.", compatibility: 41 },
  { type1: "The Optimist", type2: "The Realist", roast: "One sees potential, one sees patterns. Both are right and that's the problem.", compatibility: 55 },
  { type1: "The Loud", type2: "The Quiet", roast: "One fills the silence, one craves it. A lesson in volume control neither signed up for.", compatibility: 46 },
  { type1: "The Healing", type2: "The Healing", roast: "Two people doing the work, on themselves, at different speeds. Beautiful and exhausting.", compatibility: 61 },
  { type1: "The Old Soul", type2: "The Peter Pan", roast: "One wants depth, one wants play. They're reading different books in the same room.", compatibility: 38 },
  { type1: "The Planner", type2: "The Spontaneous", roast: "One has a five-year plan, one doesn't know what's for dinner. Flexibility required.", compatibility: 44 },
  { type1: "The Words", type2: "The Actions", roast: "One speaks love, one shows it. They're both saying 'I love you' in languages the other doesn't hear.", compatibility: 58 },
  { type1: "The Boundary", type2: "The Boundless", roast: "One says no, the other doesn't understand why. A crash course in limits.", compatibility: 33 },
  { type1: "The Mirror", type2: "The Mirror", roast: "So similar they'll either merge or compete. There's no room for two main characters.", compatibility: 49 },
  { type1: "The Storm", type2: "The Calm", roast: "One brings intensity, one brings peace. They need each other more than they know.", compatibility: 64 },
  { type1: "The Past", type2: "The Future", roast: "One's still processing yesterday, one's already living tomorrow. The present is where they keep missing each other.", compatibility: 36 },
  { type1: "The Romantic", type2: "The Practical", roast: "One wants poetry, one wants partnership. Love speaks many dialects.", compatibility: 51 },
  { type1: "The Seen", type2: "The Hidden", roast: "One lives out loud, one keeps it inside. Intimacy means showing the parts you hide.", compatibility: 43 },
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
  const [isAnalyzing, setIsAnalyzing] = useState(false);
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
    const name1 = name1Ref.current?.value?.trim() || 'Person A';
    const name2 = name2Ref.current?.value?.trim() || 'Person B';
    
    // Start dramatic analysis phase
    setIsAnalyzing(true);
    triggerHaptic('light');
    
    // Dramatic pause before revealing
    setTimeout(() => {
      const pattern = BOND_PATTERNS[Math.floor(Math.random() * BOND_PATTERNS.length)];
      
      // Randomly assign types to names (so it's not always name1 = type1)
      const flip = Math.random() > 0.5;
      
      const roast = {
        id: Date.now(),
        name1,
        name2,
        type1: flip ? pattern.type2 : pattern.type1,
        type2: flip ? pattern.type1 : pattern.type2,
        roast: pattern.roast,
        compatibility: pattern.compatibility,
      };
      
      setIsAnalyzing(false);
      setRoastResult(roast);
      triggerHaptic('success');
      if (onNotification) {
        onNotification('Bond roasted. Share the chaos.', 'success');
      }
    }, 1500); // 1.5 second dramatic pause
  };
  
  const handleNewRoast = () => {
    setRoastResult(null);
    if (name1Ref.current) name1Ref.current.value = '';
    if (name2Ref.current) name2Ref.current.value = '';
  };
  
  const handleShare = async () => {
    if (!roastResult) return;
    const text = `🔮 Bond Roast: ${roastResult.name1} (${roastResult.type1}) & ${roastResult.name2} (${roastResult.type2})\n${roastResult.compatibility}% Compatible\n\n"${roastResult.roast}"\n\n— Mystic Loop`;
    
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
      
      {/* Analyzing state - dramatic reveal */}
      {isAnalyzing && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in">
          <div className="relative">
            {/* Rotating rings */}
            <div className="w-32 h-32 rounded-full border-2 border-purple-500/30 animate-spin" style={{ animationDuration: '3s' }} />
            <div className="absolute inset-2 rounded-full border-2 border-pink-500/30 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
            <div className="absolute inset-4 rounded-full border-2 border-indigo-500/30 animate-spin" style={{ animationDuration: '4s' }} />
            
            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <User className="w-8 h-8 text-purple-400 animate-pulse" />
            </div>
          </div>
          
          <div className="mt-8 text-center space-y-2">
            <p className="text-white font-serif text-xl animate-pulse">Analyzing bond...</p>
            <p className="text-white/50 font-mono text-xs">Reading energetic signatures</p>
          </div>
        </div>
      )}
      
      {!roastResult && !isAnalyzing ? (
        <GlassCard className="p-6 sm:p-8 w-full max-w-md space-y-6" intense>
          <div className="text-center space-y-2">
            <User className="w-10 h-10 sm:w-12 sm:h-12 mx-auto text-indigo-400" />
            <h2 className="font-serif text-2xl sm:text-3xl text-white bg-gradient-to-r from-indigo-200 to-purple-200 bg-clip-text text-transparent">
              Bond Roast
            </h2>
            <p className="text-white/70 text-xs sm:text-sm px-2">
              Brutally honest compatibility readings. Enter any two names—yourself and someone else, two friends, exes, situationships, whoever.
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="text-white/70 text-xs font-mono uppercase tracking-wider block mb-2">
                First Person
              </label>
              <input
                ref={name1Ref}
                type="text"
                defaultValue=""
                placeholder="Name"
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
              <span className="px-4 text-white/40 font-serif">&</span>
              <div className="h-px w-16 bg-gradient-to-r from-transparent via-white/30 to-transparent" />
            </div>
            
            <div>
              <label className="text-white/70 text-xs font-mono uppercase tracking-wider block mb-2">
                Second Person
              </label>
              <input
                ref={name2Ref}
                type="text"
                defaultValue=""
                placeholder="Name"
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
      ) : null}
      
      {roastResult && (
        <>
          <GlassCard className={`p-6 sm:p-8 w-full max-w-md space-y-6 ${revealed ? 'animate-card-reveal' : 'opacity-0'}`} intense>
            <div className="text-center space-y-3">
              <div className="flex items-center justify-center gap-3 sm:gap-4">
                <div className="text-center p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/30 glass-premium min-w-[100px]">
                  <div className="text-base sm:text-lg font-serif text-white text-glow">{roastResult.name1}</div>
                  <div className="text-xs font-mono text-indigo-400 mt-1">{roastResult.type1}</div>
                </div>
                <div className="text-white/40 text-xl sm:text-2xl font-serif animate-pulse">&</div>
                <div className="text-center p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 glass-premium min-w-[100px]">
                  <div className="text-base sm:text-lg font-serif text-white text-glow">{roastResult.name2}</div>
                  <div className="text-xs font-mono text-purple-400 mt-1">{roastResult.type2}</div>
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

