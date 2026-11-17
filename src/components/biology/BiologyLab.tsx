import React, { useState } from 'react';
import { SPECIMEN_DATA } from '../../data/specimenData';
import { SpecimenData } from '../../types/laboratory';
import { EyepieceView } from './EyepieceView';
import { DissectionStation } from './DissectionStation';
import { BioWorkbenchRealistic } from './BioWorkbenchRealistic';
import { soundManager } from '../../audio/SoundManager';
import { Eye, Microscope, Scissors, Sparkles, ChevronRight, Leaf, Flower2, ArrowLeft } from 'lucide-react';

export const BiologyLab: React.FC = () => {
  const [viewMode, setViewMode] = useState<'table' | 'microscopy' | 'dissection'>('table');
  const [selectedSpecimen, setSelectedSpecimen] = useState<SpecimenData>(SPECIMEN_DATA[0]);
  const [isEyepieceOpen, setIsEyepieceOpen] = useState<boolean>(false);
  const [isSlideMounted, setIsSlideMounted] = useState<boolean>(true);

  const handleSelectSpecimen = (specimen: SpecimenData) => {
    soundManager.playGlassClink();
    setSelectedSpecimen(specimen);
    setIsSlideMounted(true);
  };

  const handleOpenEyepiece = () => {
    soundManager.playMicroscopeClick();
    setIsEyepieceOpen(true);
  };

  // 1. Initial Photorealistic Workbench Overview
  if (viewMode === 'table') {
    return (
      <div className="relative w-full h-full flex flex-col pt-16 overflow-hidden bg-slate-950">
        <BioWorkbenchRealistic
          onSelectStation={(station) => {
            soundManager.playDoorSlide();
            setViewMode(station);
          }}
        />
      </div>
    );
  }

  if (viewMode === 'dissection') {
    return (
      <div className="relative w-full h-full flex flex-col pt-20 px-4 sm:px-6 pb-4 overflow-hidden bg-stone-950">
        <div className="flex items-center justify-between mb-3 z-20 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundManager.playClick();
                setViewMode('table');
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-purple-400 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs font-mono font-bold shadow-xl backdrop-blur-md transition-all group"
              title="Return to Biology Workbench Overview"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-purple-400 group-hover:-translate-x-0.5 transition-transform" />
              <span>Workbench Overview</span>
            </button>

            <div className="flex rounded-xl stone-panel p-1 border border-amber-600/50 shadow-xl backdrop-blur-md">
              <button
                onClick={() => {
                  soundManager.playClick();
                  setViewMode('microscopy');
                }}
                className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-stone-300 hover:text-white flex items-center gap-2 font-serif transition-all"
              >
                <Microscope className="w-4 h-4 text-amber-400" /> Brass & Quartz Microscope
              </button>
              <button
                className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-rose-500 text-stone-950 font-black shadow-lg shadow-rose-500/20 flex items-center gap-2 font-serif"
              >
                <Flower2 className="w-4 h-4" /> Hibiscus Flower Dissection
              </button>
            </div>
          </div>
        </div>
        <div className="flex-1 min-h-0 z-10">
          <DissectionStation />
        </div>
      </div>
    );
  }

  if (isEyepieceOpen) {
    return (
      <EyepieceView
        specimen={selectedSpecimen}
        onCloseEyepiece={() => setIsEyepieceOpen(false)}
      />
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col pt-20 px-4 sm:px-6 pb-4 overflow-hidden bg-stone-950">
      {/* Authentic Dr. Stone Biology Laboratory Background */}
      <img
        src="/assets/dr_stone_bio_lab.jpg"
        alt="Dr. Stone Kingdom of Science Botanical and Biology Laboratory"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none opacity-45 brightness-80"
      />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-stone-950 via-stone-950/75 to-stone-950/90" />

      {/* Top Header: Simple Mode Switcher */}
      <div className="relative z-20 flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundManager.playClick();
              setViewMode('table');
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-purple-400 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs font-mono font-bold shadow-xl backdrop-blur-md transition-all group"
            title="Return to Biology Workbench Overview"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-purple-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>Workbench Overview</span>
          </button>

          <div className="flex rounded-xl stone-panel p-1 border border-amber-600/50 shadow-xl backdrop-blur-md">
            <button
              onClick={() => setViewMode('microscopy')}
              className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-emerald-600 text-stone-950 font-black shadow-lg shadow-emerald-600/30 flex items-center gap-2 font-serif"
            >
              <Microscope className="w-4 h-4" /> Brass & Quartz Microscope
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setViewMode('dissection');
              }}
              className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-stone-300 hover:text-white flex items-center gap-2 font-serif transition-all"
            >
              <Flower2 className="w-4 h-4 text-amber-400" /> Hibiscus Flower Dissection
            </button>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 stone-panel px-3.5 py-1.5 rounded-xl border border-stone-700/80 text-xs font-mono text-emerald-300 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34d399]" />
          <span>Kingdom of Science • Botanical Biology</span>
        </div>
      </div>

      {/* Main Microscopy Lab Layout */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
        
        {/* Left Col (4 cols): Slide Preparation Tray (Wooden Slide Box) */}
        <div className="lg:col-span-4 stone-panel backdrop-blur-md p-3.5 rounded-2xl border border-stone-700/80 flex flex-col justify-between overflow-y-auto shadow-2xl">
          <div>
            <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-stone-800">
              <h3 className="font-bold text-xs uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 font-serif">
                <Leaf className="w-4 h-4 text-emerald-400" /> Prepared Specimen Box
              </h3>
              <span className="text-[10px] text-stone-400 font-mono">Mount Slide</span>
            </div>

            <p className="text-xs text-stone-300 mb-2.5 leading-relaxed font-serif">
              Select a prepared biological specimen to mount onto the microscope stage:
            </p>

            {/* Specimen Slide Cards */}
            <div className="space-y-2">
              {SPECIMEN_DATA.map((specimen) => {
                const isSelected = selectedSpecimen.id === specimen.id;
                return (
                  <div
                    key={specimen.id}
                    onClick={() => handleSelectSpecimen(specimen)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-950/45 shadow-lg shadow-emerald-950/40 scale-[1.01]'
                        : 'border-stone-800 bg-stone-900/80 hover:bg-stone-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-3.5 rounded bg-stone-800 border border-stone-600 relative flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        </div>
                        <h4 className="font-bold text-xs text-amber-100 font-serif">{specimen.name}</h4>
                      </div>
                      {isSelected && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500 text-stone-950 font-mono">
                          MOUNTED
                        </span>
                      )}
                    </div>

                    <div className="text-[10px] text-emerald-300 font-mono mb-0.5">
                      Stain: {specimen.stain}
                    </div>

                    <p className="text-[11px] text-stone-300 leading-normal line-clamp-2 font-serif">
                      {specimen.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-stone-800 text-[10px] text-stone-400 font-mono">
            Kingdom of Science • Hand-Ground Quartz Lens
          </div>
        </div>

        {/* Center & Right Col (8 cols): Microscope Apparatus & Eyepiece Launcher */}
        <div className="lg:col-span-8 stone-panel backdrop-blur-md rounded-2xl relative overflow-hidden flex flex-col items-center justify-between p-5 border border-stone-700/80 shadow-2xl">
          
          <div className="w-full flex items-center justify-between z-20">
            <div className="bg-stone-900/95 px-3 py-1 rounded-xl border border-stone-800 flex items-center gap-2 shadow">
              <span className="text-[10px] text-stone-400 font-bold uppercase font-mono">Specimen on Stage:</span>
              <span className="font-bold text-xs text-amber-200 font-serif">{selectedSpecimen.name}</span>
            </div>

            <div className="bg-stone-900/95 px-3 py-1 rounded-xl border border-stone-800 flex items-center gap-2 shadow">
              <span className="text-[10px] text-stone-400 font-bold uppercase font-mono">Stain:</span>
              <span className="font-mono text-xs text-amber-400">{selectedSpecimen.stain}</span>
            </div>
          </div>

          {/* Central Microscope Model */}
          <div className="relative w-full flex-1 flex items-center justify-center my-3">
            <svg viewBox="0 0 400 380" className="w-72 h-72 sm:w-80 sm:h-80 relative z-10 overflow-visible">
              <defs>
                <linearGradient id="brassStandReal" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#d97706" />
                  <stop offset="50%" stopColor="#92400e" />
                  <stop offset="100%" stopColor="#451a03" />
                </linearGradient>
                <linearGradient id="brassKnobReal" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fef08a" />
                  <stop offset="50%" stopColor="#d97706" />
                  <stop offset="100%" stopColor="#78350f" />
                </linearGradient>
              </defs>

              <path d="M 100 350 L 300 350 L 280 320 L 120 320 Z" fill="url(#brassStandReal)" stroke="#b45309" strokeWidth="2.5" />
              
              <path
                d="M 230 320 Q 280 260 270 160 Q 260 90 200 90 L 170 90"
                fill="none"
                stroke="url(#brassStandReal)"
                strokeWidth="28"
                strokeLinecap="round"
              />

              <circle cx="160" cy="300" r="16" fill="#f8fafc" stroke="#b45309" strokeWidth="2" filter="drop-shadow(0 0 14px #fde68a)" />
              <rect x="145" y="260" width="30" height="15" fill="#78350f" />

              <rect x="100" y="240" width="120" height="14" rx="2" fill="#1c1917" stroke="#b45309" strokeWidth="2" />
              
              {/* Glass Slide on Stage */}
              {isSlideMounted && (
                <g>
                  <rect x="115" y="235" width="85" height="5" rx="1" fill="#fef08a" stroke="#d97706" strokeWidth="1" opacity="0.85" />
                  <circle cx="157" cy="237" r="3.5" fill="#10b981" />
                  <path d="M 125 240 L 135 234 L 145 240" fill="none" stroke="#f59e0b" strokeWidth="2" />
                </g>
              )}

              <circle cx="160" cy="180" r="22" fill="#78350f" stroke="#b45309" strokeWidth="2" />
              <rect x="153" y="195" width="14" height="28" fill="#451a03" stroke="#f59e0b" strokeWidth="1.5" />
              <rect x="172" y="185" width="12" height="22" fill="#451a03" stroke="#10b981" strokeWidth="1.5" transform="rotate(35 172 185)" />
              <rect x="136" y="185" width="12" height="22" fill="#451a03" stroke="#d97706" strokeWidth="1.5" transform="rotate(-35 136 185)" />

              <rect x="150" y="100" width="20" height="75" fill="#451a03" stroke="#b45309" strokeWidth="2" />
              <rect x="145" y="60" width="30" height="40" rx="3" fill="#1c1917" stroke="#b45309" strokeWidth="2" />
              <ellipse cx="160" cy="60" rx="15" ry="6" fill="#fef08a" opacity="0.8" />

              <circle cx="255" cy="210" r="18" fill="url(#brassKnobReal)" stroke="#451a03" strokeWidth="2" />
              <circle cx="255" cy="210" r="10" fill="#f59e0b" stroke="#78350f" strokeWidth="1.5" />
            </svg>
          </div>

          {/* Action Button: Look into Eyepiece */}
          <div className="w-full flex items-center justify-between z-20 pt-3 border-t border-stone-800">
            <div>
              <span className="text-xs text-stone-300 block font-serif">
                Specimen securely clamped to mechanical stage
              </span>
              <span className="text-[11px] text-amber-400 font-bold font-mono">
                Revolving Turret: 10x Quartz Objective Active
              </span>
            </div>

            <button
              onClick={handleOpenEyepiece}
              className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-amber-500/30 hover:scale-105 active:scale-95 transition-all font-serif"
            >
              <Eye className="w-4 h-4 text-stone-950" />
              Look into Quartz Eyepiece (4x-100x)
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
