import React, { useState, useRef } from 'react';
import gsap from 'gsap';
import { LabType } from '../../types/laboratory';
import { soundManager } from '../../audio/SoundManager';
import { Atom, FlaskConical, Dna, LogIn } from 'lucide-react';

interface EntranceCorridorProps {
  onEnterLab: (lab: LabType) => void;
}

export const EntranceCorridor: React.FC<EntranceCorridorProps> = ({ onEnterLab }) => {
  const [hoveredDoor, setHoveredDoor] = useState<LabType | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [selectedDoorName, setSelectedDoorName] = useState<string>('');
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Subtle parallax on mouse movement
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isTransitioning || !imageRef.current || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    gsap.to(imageRef.current, {
      x: -x * 16,
      y: -y * 10,
      scale: 1.03,
      duration: 0.5,
      ease: 'power2.out',
    });
  };

  const handleMouseLeave = () => {
    if (isTransitioning || !imageRef.current) return;
    gsap.to(imageRef.current, {
      x: 0,
      y: 0,
      scale: 1.0,
      duration: 0.8,
      ease: 'power2.out',
    });
    setHoveredDoor(null);
  };

  // Door click and smooth fly-through zoom
  const handleDoorClick = (lab: LabType, name: string) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setSelectedDoorName(name);
    soundManager.playDoorSlide();

    // Zoom origin based on door position
    let originX = '50%';
    if (lab === 'physics') originX = '18.5%';
    if (lab === 'chemistry') originX = '50%';
    if (lab === 'biology') originX = '81.5%';

    if (imageRef.current) {
      gsap.to(imageRef.current, {
        scale: 4.2,
        transformOrigin: `${originX} 52%`,
        duration: 1.35,
        ease: 'power3.in',
        onComplete: () => {
          onEnterLab(lab);
        },
      });
    } else {
      setTimeout(() => onEnterLab(lab), 1000);
    }
  };

  const doors = [
    {
      id: 'physics' as LabType,
      name: 'PHYSICS LAB',
      subtext: 'Newton Mechanics • Optics Bench • Observatory',
      themeBorder: 'border-cyan-400 bg-cyan-950/25 shadow-[0_0_50px_rgba(6,182,212,0.75)]',
      badgeBg: 'border-cyan-500/60 text-cyan-300 bg-slate-950/90',
      buttonBg: 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950',
      icon: <Atom className="w-5 h-5 text-cyan-400 animate-spin" style={{ animationDuration: '10s' }} />,
      style: {
        left: '4.8%',
        top: '21%',
        width: '27.4%',
        height: '59%',
      },
    },
    {
      id: 'chemistry' as LabType,
      name: 'CHEMISTRY LAB',
      subtext: 'Free Chemical Simulator • Titration • Reaction Matrix',
      themeBorder: 'border-emerald-400 bg-emerald-950/25 shadow-[0_0_50px_rgba(16,185,129,0.75)]',
      badgeBg: 'border-emerald-500/60 text-emerald-300 bg-slate-950/90',
      buttonBg: 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950',
      icon: <FlaskConical className="w-5 h-5 text-emerald-400 animate-bounce" style={{ animationDuration: '2s' }} />,
      style: {
        left: '36.3%',
        top: '21%',
        width: '27.4%',
        height: '59%',
      },
    },
    {
      id: 'biology' as LabType,
      name: 'BIOLOGY LAB',
      subtext: 'Hibiscus Flower Dissection • Microscope • Plant Anatomy',
      themeBorder: 'border-purple-400 bg-purple-950/25 shadow-[0_0_50px_rgba(168,85,247,0.75)]',
      badgeBg: 'border-purple-500/60 text-purple-300 bg-slate-950/90',
      buttonBg: 'bg-gradient-to-r from-purple-500 to-fuchsia-600 hover:from-purple-400 hover:to-fuchsia-500 text-slate-950',
      icon: <Dna className="w-5 h-5 text-purple-400 animate-pulse" />,
      style: {
        left: '67.8%',
        top: '21%',
        width: '27.4%',
        height: '59%',
      },
    },
  ];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-full overflow-hidden select-none bg-slate-950 flex items-center justify-center cursor-default"
    >
      {/* Authentic Futuristic Three Doors Background Image matching uploaded reference */}
      <img
        ref={imageRef}
        src="/assets/futuristic_doors.jpg"
        alt="Futuristic Laboratory Blast Doors"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none transition-transform will-change-transform"
      />

      {/* Atmospheric lighting gradient */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950/70 via-transparent to-slate-950/50" />

      {/* Top Banner: Authentic Futuristic Laboratory Header */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none text-center px-4 w-full max-w-xl">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-widest text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.95)] uppercase font-mono">
          THE SCIENCE KINGDOM
        </h1>
        <p className="text-cyan-200/90 text-xs sm:text-sm drop-shadow font-mono tracking-wide mt-1">
          Select any futuristic laboratory blast door to enter
        </p>
      </div>

      {/* THREE INTERACTIVE FUTURISTIC DOOR ZONES */}
      <div className="absolute inset-0 z-10">
        {doors.map((door) => {
          const isHovered = hoveredDoor === door.id;
          return (
            <div
              key={door.id}
              style={door.style}
              onMouseEnter={() => {
                soundManager.playClick();
                setHoveredDoor(door.id);
              }}
              onMouseLeave={() => setHoveredDoor(null)}
              onClick={() => handleDoorClick(door.id, door.name)}
              className="absolute cursor-pointer rounded-2xl group transition-all duration-300 flex flex-col items-center justify-between p-3"
            >
              {/* Animated Interactive Glowing Frame */}
              <div
                className={`absolute inset-0 rounded-2xl border-2 transition-all duration-300 ${
                  isHovered
                    ? `${door.themeBorder} scale-[1.01] backdrop-blur-[0.5px]`
                    : 'border-transparent hover:border-white/20'
                }`}
              />

              {/* Hover Badge at Door Top (High-tech Card) */}
              <div
                className={`relative z-20 border ${door.badgeBg} px-3.5 py-1.5 rounded-xl flex items-center gap-2.5 transition-all duration-300 shadow-2xl backdrop-blur-md ${
                  isHovered
                    ? 'scale-105 opacity-100 translate-y-0'
                    : 'opacity-0 -translate-y-2 pointer-events-none'
                }`}
              >
                {door.icon}
                <div className="text-left">
                  <span className="font-bold text-xs uppercase block leading-tight font-mono tracking-wider">
                    {door.name}
                  </span>
                  <span className="text-[10px] text-slate-300 font-mono">
                    {door.subtext}
                  </span>
                </div>
              </div>

              {/* Enter Button at Door Bottom on Hover */}
              <button
                className={`relative z-20 ${door.buttonBg} px-5 py-2 rounded-xl font-black text-xs uppercase tracking-wider font-mono flex items-center gap-2 shadow-2xl transition-all duration-300 ${
                  isHovered
                    ? 'scale-105 opacity-100 translate-y-0 shadow-[0_0_25px_rgba(255,255,255,0.4)]'
                    : 'opacity-0 translate-y-3 pointer-events-none'
                }`}
              >
                <LogIn className="w-4 h-4" /> Enter Lab
              </button>
            </div>
          );
        })}
      </div>

      {/* Bottom Sector Badges Navigation Indicator */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 pointer-events-auto">
        <div className="flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-950/80 border border-slate-700/60 text-xs font-mono backdrop-blur-md shadow-2xl">
          <button
            onClick={() => handleDoorClick('physics', 'PHYSICS LAB')}
            className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Physics Sector</span>
          </button>
          <span className="text-slate-600">|</span>
          <button
            onClick={() => handleDoorClick('chemistry', 'CHEMISTRY LAB')}
            className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Chemistry Sector</span>
          </button>
          <span className="text-slate-600">|</span>
          <button
            onClick={() => handleDoorClick('biology', 'BIOLOGY LAB')}
            className="flex items-center gap-1.5 text-purple-400 hover:text-purple-300 transition-colors"
          >
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
            <span>Biology Sector</span>
          </button>
        </div>
      </div>

      {/* Fly-through Transition Overlay */}
      {isTransitioning && (
        <div className="absolute inset-0 bg-white/20 backdrop-blur-[2px] z-50 pointer-events-none transition-opacity duration-700 flex items-center justify-center">
          <div className="px-6 py-3 rounded-2xl bg-slate-950/90 border border-cyan-500/50 shadow-[0_0_40px_rgba(6,182,212,0.8)] text-center animate-pulse">
            <span className="text-xs uppercase font-mono tracking-widest text-cyan-300 block">
              INITIALIZING AIRLOCK • ENTERING
            </span>
            <span className="text-lg font-black text-white font-mono tracking-wider">
              {selectedDoorName}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};