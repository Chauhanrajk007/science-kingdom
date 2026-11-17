import React, { useState } from 'react';
import { LabType } from '../../types/laboratory';
import { soundManager } from '../../audio/SoundManager';
import { 
  ArrowLeft, 
  Volume2, 
  VolumeX, 
  Compass, 
  FlaskConical, 
  Leaf, 
  Sparkles,
  BookOpen,
  MessageSquare,
  Flame
} from 'lucide-react';

interface LabHUDProps {
  currentLab: LabType;
  onNavigate: (lab: LabType) => void;
  onOpenSenku: () => void;
  onOpenInfo?: () => void;
  labTitle: string;
  labSubtitle: string;
}

export const LabHUD: React.FC<LabHUDProps> = ({
  currentLab,
  onNavigate,
  onOpenSenku,
  onOpenInfo,
  labTitle,
  labSubtitle,
}) => {
  const [isMuted, setIsMuted] = useState(soundManager.isMuted);

  const handleToggleMute = () => {
    const muted = soundManager.toggleMute();
    setIsMuted(muted);
    if (!muted) {
      soundManager.playClick();
    }
  };

  const getLabIcon = () => {
    switch (currentLab) {
      case 'physics':
        return <Compass className="w-4 h-4 text-amber-400 animate-spin" style={{ animationDuration: '10s' }} />;
      case 'chemistry':
        return <FlaskConical className="w-4 h-4 text-emerald-400 animate-bounce" style={{ animationDuration: '2.5s' }} />;
      case 'biology':
        return <Leaf className="w-4 h-4 text-lime-400 animate-pulse" />;
      default:
        return <Flame className="w-4 h-4 text-amber-400" />;
    }
  };

  const getAccentGlow = () => {
    switch (currentLab) {
      case 'physics':
        return 'border-amber-500/50 bg-amber-950/40 text-amber-300';
      case 'chemistry':
        return 'border-emerald-500/50 bg-emerald-950/40 text-emerald-300';
      case 'biology':
        return 'border-lime-500/50 bg-lime-950/40 text-lime-300';
      default:
        return 'border-amber-500/50 bg-amber-950/40 text-amber-300';
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-3 sm:px-6 py-2.5 flex items-center justify-between pointer-events-none bg-gradient-to-b from-stone-950 via-stone-950/85 to-transparent">
      {/* Left: Entrance Portal & Subject Display */}
      <div className="flex items-center gap-2 sm:gap-3 pointer-events-auto">
        {currentLab !== 'corridor' && (
          <button
            onClick={() => {
              soundManager.playDoorSlide();
              onNavigate('corridor');
            }}
            className="stone-panel px-3.5 py-1.5 rounded-xl border border-amber-600/40 hover:bg-amber-950/40 text-amber-200 hover:text-white flex items-center gap-2 text-xs font-bold uppercase tracking-wider transition-all hover:scale-105 active:scale-95 shadow-xl font-mono backdrop-blur-md"
            title="Return to Workshop Entrance Doors"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">Workshop Doors</span>
          </button>
        )}

        <div className="stone-panel px-3.5 py-1.5 rounded-xl border border-stone-700/80 flex items-center gap-2.5 shadow-xl backdrop-blur-md">
          <div className={`p-1 rounded-lg border ${getAccentGlow()}`}>
            {getLabIcon()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-amber-100 font-bold text-xs sm:text-sm tracking-wide uppercase font-serif">
                {labTitle}
              </span>
              <span className="hidden md:inline-block px-1.5 py-0.2 rounded text-[9px] font-mono font-black bg-red-950/60 text-red-400 border border-red-700/50">
                E=mc²
              </span>
            </div>
            <p className="text-[10px] text-stone-400 font-serif italic hidden sm:block">
              {labSubtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Right: Mecha Senku AI & Tool Controls */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Mecha Senku AI Assistant */}
        <button
          onClick={() => {
            soundManager.playClick();
            onOpenSenku();
          }}
          className="stone-panel px-3.5 py-1.5 rounded-xl border border-emerald-500/50 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 flex items-center gap-2 text-xs font-bold tracking-wider transition-all hover:scale-105 active:scale-95 shadow-xl font-mono group backdrop-blur-md"
          title="Consult Mecha Senku (Kingdom of Science AI)"
        >
          <div className="w-6 h-6 rounded-full overflow-hidden border border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.5)] bg-stone-900/80 p-0.5">
            <img src="/assets/mecha_senku.png" alt="Senku" className="w-full h-full object-contain" />
          </div>
          <span className="font-bold flex items-center gap-1 font-serif">
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" /> Ask Senku (AI)
          </span>
        </button>

        {/* Science Formula Manual */}
        {onOpenInfo && (
          <button
            onClick={() => {
              soundManager.playClick();
              onOpenInfo();
            }}
            className="stone-panel p-2 rounded-xl border border-stone-700/80 text-stone-300 hover:text-white hover:bg-stone-800 transition-all active:scale-95 shadow-xl backdrop-blur-md"
            title="Scientific Principles & Formulas"
          >
            <BookOpen className="w-4 h-4 text-amber-400" />
          </button>
        )}

        {/* Audio Mute/Unmute */}
        <button
          onClick={handleToggleMute}
          className="stone-panel p-2 rounded-xl border border-stone-700/80 text-stone-300 hover:text-white hover:bg-stone-800 transition-all active:scale-95 shadow-xl backdrop-blur-md"
          title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
        >
          {isMuted ? (
            <VolumeX className="w-4 h-4 text-red-400" />
          ) : (
            <Volume2 className="w-4 h-4 text-amber-400" />
          )}
        </button>
      </div>
    </header>
  );
};
