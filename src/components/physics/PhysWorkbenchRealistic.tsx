import React, { useState, useRef } from 'react';
import { soundManager } from '../../audio/SoundManager';
import { Atom, Rocket, Sparkles, LogIn, ArrowRight, Compass, Zap } from 'lucide-react';

interface PhysWorkbenchRealisticProps {
  onSelectStation: (station: 'classical' | 'unthinkable') => void;
}

export const PhysWorkbenchRealistic: React.FC<PhysWorkbenchRealisticProps> = ({ onSelectStation }) => {
  const [hoveredStation, setHoveredStation] = useState<'classical' | 'unthinkable' | null>(null);
  const [zoomingStation, setZoomingStation] = useState<'classical' | 'unthinkable' | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Subtle interactive parallax on mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (zoomingStation) return;
    if (!containerRef.current || !imageRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    imageRef.current.style.transform = `scale(1.05) translate(${x * -16}px, ${y * -12}px)`;
  };

  const handleMouseLeave = () => {
    if (zoomingStation) return;
    if (imageRef.current) {
      imageRef.current.style.transform = 'scale(1.02) translate(0px, 0px)';
    }
    setHoveredStation(null);
  };

  const handleStationClick = (station: 'classical' | 'unthinkable') => {
    if (zoomingStation) return;
    setZoomingStation(station);
    soundManager.playDoorSlide();

    // Cinematic zoom glide into that side of the bench
    if (imageRef.current) {
      if (station === 'classical') {
        imageRef.current.style.transition = 'transform 0.85s cubic-bezier(0.16, 1, 0.3, 1)';
        imageRef.current.style.transform = 'scale(1.85) translate(18%, -4%)';
      } else {
        imageRef.current.style.transition = 'transform 0.85s cubic-bezier(0.16, 1, 0.3, 1)';
        imageRef.current.style.transform = 'scale(1.85) translate(-18%, -4%)';
      }
    }

    setTimeout(() => {
      onSelectStation(station);
    }, 820);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-full overflow-hidden select-none bg-slate-950 flex items-center justify-center cursor-default"
    >
      {/* Photorealistic Generated Physics Laboratory Workbench Image */}
      <img
        ref={imageRef}
        src="/assets/phys_workbench_realistic.jpg"
        alt="Photorealistic Futuristic Physics Laboratory Workbench Table"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none transition-transform will-change-transform scale-[1.02]"
      />

      {/* Atmospheric lighting gradient overlay */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/50" />

      {/* Top Banner: Authentic Laboratory HUD */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none text-center px-4 w-full max-w-2xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-950/80 border border-cyan-500/40 text-cyan-400 text-[11px] font-mono tracking-widest uppercase mb-1 shadow-lg backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>Interactive Physics Workbench</span>
        </div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-black tracking-widest text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] uppercase font-mono">
          THE SCIENCE KINGDOM • PHYSICS
        </h1>
        <p className="text-cyan-200/90 text-xs sm:text-sm drop-shadow font-mono tracking-wide">
          Select either apparatus on the laboratory table to step up and begin
        </p>
      </div>

      {/* TWO INTERACTIVE APPARATUS HOTSPOT ZONES ON THE TABLE */}
      <div className={`absolute inset-0 z-10 ${zoomingStation ? 'pointer-events-none opacity-0 transition-opacity duration-300' : ''}`}>
        
        {/* =========================================================================
            STATION 1 (LEFT TABLETOP): CLASSICAL IRL STEM PHYSICS (MECHANICS & OPTICS)
            ========================================================================= */}
        <div
          style={{
            left: '5%',
            top: '18%',
            width: '43%',
            height: '70%',
          }}
          onMouseEnter={() => {
            soundManager.playClick();
            setHoveredStation('classical');
          }}
          onMouseLeave={() => setHoveredStation(null)}
          onClick={() => handleStationClick('classical')}
          className="absolute cursor-pointer rounded-2xl group transition-all duration-300 flex flex-col items-center justify-between p-4"
        >
          {/* Animated Glowing Sci-Fi Target Reticle Frame on Hover */}
          <div
            className={`absolute inset-0 rounded-2xl border-2 transition-all duration-300 ${
              hoveredStation === 'classical'
                ? 'border-cyan-400 bg-cyan-950/25 shadow-[0_0_50px_rgba(6,182,212,0.7)] scale-[1.01] backdrop-blur-[0.5px]'
                : 'border-transparent hover:border-cyan-500/30'
            }`}
          />

          {/* Floating High-Tech HUD Beacon at Station Top */}
          <div
            className={`relative z-20 border border-cyan-500/70 bg-slate-950/90 px-4 py-2.5 rounded-xl flex items-center gap-3 transition-all duration-300 shadow-2xl backdrop-blur-md ${
              hoveredStation === 'classical'
                ? 'scale-105 opacity-100 translate-y-0 shadow-[0_0_25px_rgba(6,182,212,0.5)]'
                : 'opacity-90 -translate-y-1'
            }`}
          >
            <div className="p-2 rounded-lg bg-cyan-950/80 border border-cyan-500/50">
              <Atom className="w-5 h-5 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
            </div>
            <div className="text-left">
              <span className="font-mono font-black text-xs sm:text-sm text-cyan-300 uppercase block tracking-wider">
                SECTION 1: CLASSICAL PHYSICS LAB
              </span>
              <span className="text-[10px] sm:text-xs text-slate-300 font-mono">
                Newton's Laws • Pulleys • Incline Friction • Laser Optics
              </span>
            </div>
          </div>

          {/* Enter Button at Station Bottom on Hover */}
          <button
            className={`relative z-20 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider font-mono flex items-center gap-2 shadow-2xl transition-all duration-300 ${
              hoveredStation === 'classical'
                ? 'scale-105 opacity-100 translate-y-0 shadow-[0_0_25px_rgba(6,182,212,0.8)]'
                : 'opacity-0 translate-y-3 pointer-events-none'
            }`}
          >
            <LogIn className="w-4 h-4" /> Step Up to Classical Bench
          </button>
        </div>

        {/* =========================================================================
            STATION 2 (RIGHT TABLETOP): THE UNTHINKABLE COSMIC PHYSICS SIMULATOR
            ========================================================================= */}
        <div
          style={{
            left: '52%',
            top: '18%',
            width: '43%',
            height: '70%',
          }}
          onMouseEnter={() => {
            soundManager.playClick();
            setHoveredStation('unthinkable');
          }}
          onMouseLeave={() => setHoveredStation(null)}
          onClick={() => handleStationClick('unthinkable')}
          className="absolute cursor-pointer rounded-2xl group transition-all duration-300 flex flex-col items-center justify-between p-4"
        >
          {/* Animated Glowing Sci-Fi Target Reticle Frame on Hover */}
          <div
            className={`absolute inset-0 rounded-2xl border-2 transition-all duration-300 ${
              hoveredStation === 'unthinkable'
                ? 'border-pink-500 bg-pink-950/25 shadow-[0_0_50px_rgba(236,72,153,0.7)] scale-[1.01] backdrop-blur-[0.5px]'
                : 'border-transparent hover:border-pink-500/30'
            }`}
          />

          {/* Floating High-Tech HUD Beacon at Station Top */}
          <div
            className={`relative z-20 border border-pink-500/70 bg-slate-950/90 px-4 py-2.5 rounded-xl flex items-center gap-3 transition-all duration-300 shadow-2xl backdrop-blur-md ${
              hoveredStation === 'unthinkable'
                ? 'scale-105 opacity-100 translate-y-0 shadow-[0_0_25px_rgba(236,72,153,0.5)]'
                : 'opacity-90 -translate-y-1'
            }`}
          >
            <div className="p-2 rounded-lg bg-pink-950/80 border border-pink-500/50">
              <Rocket className="w-5 h-5 text-pink-400 animate-bounce" />
            </div>
            <div className="text-left">
              <span className="font-mono font-black text-xs sm:text-sm text-pink-300 uppercase block tracking-wider">
                SECTION 2: UNTHINKABLE COSMIC PHYSICS
              </span>
              <span className="text-[10px] sm:text-xs text-slate-300 font-mono">
                Throw Ball to the Moon • Escape Velocity • 0.99c Time Dilation
              </span>
            </div>
          </div>

          {/* Enter Button at Station Bottom on Hover */}
          <button
            className={`relative z-20 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider font-mono flex items-center gap-2 shadow-2xl transition-all duration-300 ${
              hoveredStation === 'unthinkable'
                ? 'scale-105 opacity-100 translate-y-0 shadow-[0_0_25px_rgba(236,72,153,0.8)]'
                : 'opacity-0 translate-y-3 pointer-events-none'
            }`}
          >
            <Zap className="w-4 h-4 fill-current" /> Enter Unthinkable Physics
          </button>
        </div>

      </div>

      {/* Bottom Workbench Navigation Indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
        <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-950/85 border border-slate-700/60 text-xs font-mono backdrop-blur-md shadow-2xl">
          <button
            onClick={() => handleStationClick('classical')}
            className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Section 1: Classical STEM Lab (Newton & Optics)</span>
          </button>
          <span className="text-slate-600">|</span>
          <button
            onClick={() => handleStationClick('unthinkable')}
            className="flex items-center gap-1.5 text-pink-400 hover:text-pink-300 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-pink-400 animate-pulse" />
            <span>Section 2: Unthinkable Physics (Moon Throw & 0.99c)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
