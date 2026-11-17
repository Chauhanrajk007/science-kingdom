import React, { useState, useEffect } from 'react';
import { DialogueStep } from '../../types/laboratory';
import { soundManager } from '../../audio/SoundManager';
import { ChevronRight } from 'lucide-react';

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
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [dialogues]);

  if (!isOpen) return null;

  const current = dialogues[currentIndex] || dialogues[0];

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation(); // Don't trigger backdrop click
    soundManager.playClick();
    if (currentIndex < dialogues.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onClose();
    }
  };

  return (
    <>
      {/* Click-anywhere backdrop dismiss: clicking anywhere on the screen closes Mecha Senku */}
      <div 
        onClick={onClose}
        className="fixed inset-0 z-40 cursor-pointer bg-slate-950/20 backdrop-blur-[0.5px]"
        title="Click anywhere to dismiss"
      />

      <div className="fixed bottom-3 sm:bottom-6 inset-x-3 sm:inset-x-8 max-w-4xl mx-auto z-50 pointer-events-auto animate-in slide-in-from-bottom-6 duration-300">
        <div className="relative flex items-end gap-3 sm:gap-5">
          
          {/* Mecha Senku Character Sprite - High-res, Prominent, Cleanly Alongside (NEVER covering text) */}
          <div className="shrink-0 select-none pointer-events-none drop-shadow-[0_16px_40px_rgba(0,0,0,0.95)]">
            <img
              src="/assets/mecha_senku.png"
              alt="Mecha Senku"
              className="w-36 sm:w-52 md:w-60 h-auto max-h-[300px] sm:max-h-[400px] object-contain object-bottom"
            />
          </div>

          {/* Clean Focused Speech Box - ONLY His Name & His Text */}
          <div 
            onClick={(e) => {
              // If user clicks dialogue box body other than Next button, also close
              e.stopPropagation();
              onClose();
            }}
            className="relative flex-1 rounded-2xl bg-slate-950/95 border-2 border-emerald-400/80 shadow-[0_16px_50px_rgba(0,0,0,0.95)] p-4 sm:p-5 backdrop-blur-xl flex flex-col justify-between min-h-[110px] cursor-pointer hover:border-emerald-300 transition-colors"
            title="Click anywhere on the box or screen to dismiss"
          >
            {/* Top: ONLY His Name */}
            <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-emerald-500/20 pointer-events-none">
              <span className="font-mono font-black text-xs sm:text-sm text-emerald-400 tracking-wider uppercase">
                MECHA SENKU
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                Click anywhere to close
              </span>
            </div>

            {/* Middle: ONLY His Spoken Text */}
            <div className="py-1 min-h-[42px] flex items-center pointer-events-none">
              <p
                key={currentIndex}
                className="text-slate-100 text-xs sm:text-sm md:text-base font-sans leading-relaxed tracking-wide"
              >
                {current?.text || 'Ten billion percent exciting! Let us explore science together!'}
              </p>
            </div>

            {/* Bottom: Clean Next Button (The only place that advances instead of dismissing) */}
            <div className="flex items-center justify-end pt-2 border-t border-emerald-500/20">
              <button
                onClick={handleNext}
                className="px-5 py-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-black text-xs uppercase tracking-wider font-mono flex items-center gap-1.5 shadow-lg shadow-emerald-500/30 transition-all hover:scale-105 active:scale-95"
              >
                {currentIndex < dialogues.length - 1 ? (
                  <>
                    Next <ChevronRight className="w-4 h-4 text-slate-950" />
                  </>
                ) : (
                  'Got It!'
                )}
              </button>
            </div>

          </div>

        </div>
      </div>
    </>
  );
};
