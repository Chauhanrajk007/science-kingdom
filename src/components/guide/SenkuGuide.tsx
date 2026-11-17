import React, { useState, useEffect } from 'react';
import { DialogueStep } from '../../types/laboratory';
import { soundManager } from '../../audio/SoundManager';
import { Flame, X, ChevronRight, ChevronLeft } from 'lucide-react';

interface SenkuGuideProps {
  dialogues: DialogueStep[];
  isOpen: boolean;
  onClose: () => void;
  onStartTour?: () => void;
  onSkipTour?: () => void;
  showTourOptions?: boolean;
}

export const SenkuGuide: React.FC<SenkuGuideProps> = ({
  dialogues,
  isOpen,
  onClose,
  onStartTour,
  onSkipTour,
  showTourOptions = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [dialogues]);

  if (!isOpen) return null;

  const current = dialogues[currentIndex] || dialogues[0];

  const handleNext = () => {
    soundManager.playClick();
    if (currentIndex < dialogues.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    soundManager.playClick();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  return (
    <div className="fixed bottom-2 sm:bottom-4 inset-x-2 sm:inset-x-6 max-w-6xl mx-auto z-50 pointer-events-auto animate-in slide-in-from-bottom-8 duration-300">
      
      {/* Dr. Stone Visual Novel: Mecha Senku Sprite + Authentic Dr. Stone Dialogue Slate */}
      <div className="relative flex items-end">
        
        {/* Giant Mecha Senku Character Sprite - Ultra-smooth anti-aliased cutout standing tall! */}
        <div className="relative -mb-2 -mr-5 sm:-mr-10 md:-mr-14 z-20 shrink-0 w-44 sm:w-72 md:w-80 lg:w-96 select-none pointer-events-none drop-shadow-[0_22px_45px_rgba(0,0,0,0.95)] filter transition-all duration-300">
          <img
            src="/assets/mecha_senku.png"
            alt="Mecha Senku"
            className="w-full h-auto max-h-[380px] sm:max-h-[500px] md:max-h-[580px] object-contain object-bottom"
          />
        </div>

        {/* Authentic Dr. Stone Dialogue Slate on the RIGHT */}
        <div className="relative flex-1 rounded-2xl stone-panel border-2 border-amber-600/80 shadow-[0_20px_60px_rgba(0,0,0,0.98),inset_0_1px_1px_rgba(251,191,36,0.2)] p-4 sm:p-5 md:p-6 backdrop-blur-xl z-10 overflow-hidden flex flex-col justify-between min-h-[135px] sm:min-h-[160px]">
          
          {/* Dr. Stone Amber & Emerald Accent Top Line */}
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-amber-500 to-transparent shadow-[0_0_12px_#f59e0b]" />

          {/* Dr. Stone Rustic Corner Accents */}
          <div className="absolute top-2 left-2 w-2.5 h-2.5 border-t-2 border-l-2 border-amber-500/70 pointer-events-none" />
          <div className="absolute top-2 right-2 w-2.5 h-2.5 border-t-2 border-r-2 border-amber-500/70 pointer-events-none" />
          <div className="absolute bottom-2 left-2 w-2.5 h-2.5 border-b-2 border-l-2 border-amber-500/70 pointer-events-none" />
          <div className="absolute bottom-2 right-2 w-2.5 h-2.5 border-b-2 border-r-2 border-amber-500/70 pointer-events-none" />

          {/* Dr. Stone Character Name Banner */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-600/30">
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
              
              {/* Character Nameplate */}
              <span className="px-3 py-1 rounded-lg bg-stone-950 border border-amber-500/70 text-amber-300 font-black text-xs sm:text-sm uppercase font-serif tracking-wide flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
                <Flame className="w-4 h-4 text-amber-400" />
                Mecha Senku
              </span>

              {/* Senku's Iconic Crimson E=mc² Crest */}
              <span className="px-2 py-0.5 rounded text-[10px] sm:text-xs font-mono font-black bg-red-950/90 text-red-400 border border-red-700/80 shadow-[0_0_10px_rgba(220,38,38,0.3)]">
                E=mc²
              </span>

              {/* Kingdom of Science Subtitle */}
              <span className="text-[11px] text-stone-400 font-serif italic hidden md:inline">
                Chief of the Kingdom of Science • Science Tutorials
              </span>

              {/* 10 Billion Percent Tag */}
              <span className="hidden sm:inline-flex px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-600/50 text-[10px] font-mono text-emerald-400 font-bold">
                10,000,000,000%
              </span>
            </div>

            {/* Step Counter & Close Button */}
            <div className="flex items-center gap-2">
              {dialogues.length > 0 && (
                <span className="text-amber-400/90 text-xs font-mono font-bold px-2 py-0.5 rounded bg-stone-950 border border-amber-600/40">
                  {currentIndex + 1} / {dialogues.length}
                </span>
              )}
              <button
                onClick={() => {
                  soundManager.playClick();
                  onClose();
                }}
                className="text-stone-400 hover:text-amber-300 p-1.5 rounded-lg hover:bg-stone-800 transition-colors"
                title="Close Guide"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Spoken Dialogue Text with Authentic Dr. Stone Serif Typography */}
          <div className="py-1.5 min-h-[48px] flex items-center">
            <p
              key={currentIndex}
              className="text-amber-50 text-xs sm:text-base md:text-lg font-serif italic leading-relaxed tracking-wide animate-in fade-in slide-in-from-left-2 duration-300"
            >
              <span className="text-amber-400 font-bold mr-1 text-lg sm:text-xl not-italic">“</span>
              {current?.text || 'Ten billion percent exhilarating! Let us build science from scratch!'}
              <span className="text-amber-400 font-bold ml-1 text-lg sm:text-xl not-italic">”</span>
            </p>
          </div>

          {/* Interactive Dialogue Navigation Buttons */}
          <div className="flex items-center justify-between pt-2.5 mt-1 border-t border-amber-600/30">
            <div className="flex items-center gap-2">
              {currentIndex > 0 && (
                <button
                  onClick={handlePrev}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-serif font-bold text-stone-300 hover:text-white bg-stone-900 hover:bg-stone-800 border border-stone-700 hover:border-amber-500/50 flex items-center gap-1 transition-all"
                >
                  <ChevronLeft className="w-3.5 h-3.5 text-amber-400" /> Back
                </button>
              )}
              {showTourOptions && (
                <button
                  onClick={() => {
                    soundManager.playClick();
                    onSkipTour?.();
                    onClose();
                  }}
                  className="text-xs text-stone-400 hover:text-amber-300 font-serif underline ml-1"
                >
                  Skip Tour
                </button>
              )}
            </div>

            <button
              onClick={handleNext}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-stone-950 font-black text-xs sm:text-sm uppercase tracking-wider font-serif flex items-center gap-1.5 shadow-[0_4px_20px_rgba(217,119,6,0.4)] hover:shadow-[0_6px_25px_rgba(217,119,6,0.6)] active:scale-95 transition-all"
            >
              {currentIndex < dialogues.length - 1 ? (
                <>
                  Next <ChevronRight className="w-4 h-4 text-stone-950" />
                </>
              ) : (
                'Get Excited!'
              )}
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
