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

  // 2. Dissection Station View
  if (viewMode === 'dissection') {
    return (
      <div className="relative w-full h-full flex flex-col pt-20 px-4 sm:px-6 pb-4 overflow-hidden bg-slate-950 font-mono">
        <div className="flex items-center justify-between mb-3 z-20 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundManager.playClick();
                setViewMode('table');
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-purple-400 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs font-bold shadow-xl backdrop-blur-md transition-all group"
              title="Return to Biology Workbench Overview"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-purple-400 group-hover:-translate-x-0.5 transition-transform" />
              <span>Workbench Overview</span>
            </button>

            <div className="flex rounded-xl bg-slate-900/90 p-1 border border-slate-700 shadow-xl backdrop-blur-md">
              <button
                onClick={() => {
                  soundManager.playClick();
                  setViewMode('microscopy');
                }}
                className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white flex items-center gap-2 transition-all"
              >
                <Microscope className="w-4 h-4 text-purple-400" /> Compound Microscope
              </button>
              <button
                className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-purple-500 to-fuchsia-600 text-white font-black shadow-lg shadow-purple-500/20 flex items-center gap-2"
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
    <div className="relative w-full h-full flex flex-col pt-20 px-4 sm:px-6 pb-4 overflow-hidden bg-slate-950 font-mono">
      {/* Authentic Futuristic Biology Laboratory Background matching purple doors */}
      <img
        src="/assets/futuristic_bio_lab.jpg"
        alt="Futuristic Botanical and Biology Laboratory"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none opacity-45 brightness-85"
      />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/90" />

      {/* Top Header: Simple Mode Switcher */}
      <div className="relative z-20 flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundManager.playClick();
              setViewMode('table');
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-purple-400 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs font-bold shadow-xl backdrop-blur-md transition-all group"
            title="Return to Biology Workbench Overview"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-purple-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>Workbench Overview</span>
          </button>

          <div className="flex rounded-xl bg-slate-900/90 p-1 border border-slate-700 shadow-xl backdrop-blur-md">
            <button
              onClick={() => setViewMode('microscopy')}
              className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-black shadow-lg shadow-purple-500/30 flex items-center gap-2"
            >
              <Microscope className="w-4 h-4" /> Compound Microscope
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setViewMode('dissection');
              }}
              className="px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider text-slate-300 hover:text-white flex items-center gap-2 transition-all"
            >
              <Flower2 className="w-4 h-4 text-purple-400" /> Hibiscus Flower Dissection
            </button>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 bg-slate-900/80 px-3.5 py-1.5 rounded-xl border border-purple-500/30 text-xs text-purple-300 backdrop-blur-md">
          <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse shadow-[0_0_8px_#c084fc]" />
          <span>Kingdom of Science • Botanical Biology</span>
        </div>
      </div>

      {/* Main Microscopy Lab Layout */}
      <div className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
        
        {/* Left Col (4 cols): Slide Preparation Tray */}
        <div className="lg:col-span-4 bg-slate-900/90 backdrop-blur-md p-3.5 rounded-2xl border border-purple-500/20 flex flex-col justify-between overflow-y-auto shadow-2xl">
          <div>
            <div className="flex items-center justify-between mb-2.5 pb-2 border-b border-slate-800">
              <h3 className="font-bold text-xs uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Leaf className="w-4 h-4 text-purple-400" /> Prepared Specimen Box
              </h3>
              <span className="text-[10px] text-slate-400">Mount Slide</span>
            </div>

            <p className="text-xs text-slate-300 mb-2.5 leading-relaxed font-sans">
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
                        ? 'border-purple-400 bg-purple-950/60 shadow-lg shadow-purple-950/40 scale-[1.01]'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-3.5 rounded bg-slate-800 border border-slate-600 relative flex items-center justify-center">
                          <div className="w-2 h-2 rounded-full bg-purple-400" />
                        </div>
                        <h4 className="font-bold text-xs text-slate-100">{specimen.name}</h4>
                      </div>
                      {isSelected && (
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-500 text-white">
                          MOUNTED
                        </span>
                      )}
                    </div>

                    <div className="text-[10px] text-purple-300 mb-0.5">
                      Stain: {specimen.stain}
                    </div>

                    <p className="text-[11px] text-slate-300 leading-normal line-clamp-2 font-sans">
                      {specimen.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-500">
            Kingdom of Science • High-Precision Optical Stage
          </div>
        </div>

        {/* Center & Right Col (8 cols): Microscope Apparatus & Eyepiece Launcher */}
        <div className="lg:col-span-8 bg-slate-900/90 backdrop-blur-md rounded-2xl relative overflow-hidden flex flex-col items-center justify-between p-5 border border-purple-500/20 shadow-2xl">
          
          <div className="w-full flex items-center justify-between z-20">
            <div className="bg-slate-950/95 px-3 py-1 rounded-xl border border-slate-800 flex items-center gap-2 shadow">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Specimen on Stage:</span>
              <span className="font-bold text-xs text-purple-300">{selectedSpecimen.name}</span>
            </div>

            <div className="bg-slate-950/95 px-3 py-1 rounded-xl border border-slate-800 flex items-center gap-2 shadow">
              <span className="text-[10px] text-slate-400 font-bold uppercase">Stain:</span>
              <span className="text-xs text-fuchsia-400 font-bold">{selectedSpecimen.stain}</span>
            </div>
          </div>

          {/* Central Microscope Model */}
          <div className="relative w-full flex-1 flex items-center justify-center my-3">
            <svg viewBox="0 0 400 380" className="w-72 h-72 sm:w-80 sm:h-80 relative z-10 overflow-visible">
              <defs>
                <linearGradient id="brassStandReal" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#c084fc" />
                  <stop offset="50%" stopColor="#7e22ce" />
                  <stop offset="100%" stopColor="#3b0764" />
                </linearGradient>
                <linearGradient id="brassKnobReal" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#e879f9" />
                  <stop offset="50%" stopColor="#a855f7" />
                  <stop offset="100%" stopColor="#581c87" />
                </linearGradient>
              </defs>

              <path d="M 100 350 L 300 350 L 280 320 L 120 320 Z" fill="url(#brassStandReal)" stroke="#a855f7" strokeWidth="2.5" />
              
              <path
                d="M 230 320 Q 280 260 270 160 Q 260 90 200 90 L 170 90"
                fill="none"
                stroke="url(#brassStandReal)"
                strokeWidth="28"
                strokeLinecap="round"
              />

              <circle cx="160" cy="300" r="16" fill="#f8fafc" stroke="#a855f7" strokeWidth="2" filter="drop-shadow(0 0 14px #e879f9)" />
              <rect x="145" y="260" width="30" height="15" fill="#3b0764" />

              <rect x="100" y="240" width="120" height="14" rx="2" fill="#0f172a" stroke="#a855f7" strokeWidth="2" />
              
              {/* Glass Slide on Stage */}
              {isSlideMounted && (
                <g>
                  <rect x="115" y="235" width="85" height="5" rx="1" fill="#fef08a" stroke="#d97706" strokeWidth="1" opacity="0.85" />
                  <circle cx="157" cy="237" r="3.5" fill="#a855f7" />
                  <path d="M 125 240 L 135 234 L 145 240" fill="none" stroke="#e879f9" strokeWidth="2" />
                </g>
              )}

              <circle cx="160" cy="180" r="22" fill="#3b0764" stroke="#a855f7" strokeWidth="2" />
              <rect x="153" y="195" width="14" height="28" fill="#1e1b4b" stroke="#c084fc" strokeWidth="1.5" />
              <rect x="172" y="185" width="12" height="22" fill="#1e1b4b" stroke="#a855f7" strokeWidth="1.5" transform="rotate(35 172 185)" />
              <rect x="136" y="185" width="12" height="22" fill="#1e1b4b" stroke="#e879f9" strokeWidth="1.5" transform="rotate(-35 136 185)" />

              <rect x="150" y="100" width="20" height="75" fill="#1e1b4b" stroke="#a855f7" strokeWidth="2" />
              <rect x="145" y="60" width="30" height="40" rx="3" fill="#0f172a" stroke="#a855f7" strokeWidth="2" />
              <ellipse cx="160" cy="60" rx="15" ry="6" fill="#c084fc" opacity="0.8" />

              <circle cx="255" cy="210" r="18" fill="url(#brassKnobReal)" stroke="#3b0764" strokeWidth="2" />
              <circle cx="255" cy="210" r="10" fill="#c084fc" stroke="#7e22ce" strokeWidth="1.5" />
            </svg>
          </div>

          {/* Action Button: Look into Eyepiece */}
          <div className="w-full flex items-center justify-between z-20 pt-3 border-t border-slate-800">
            <div>
              <span className="text-xs text-slate-300 block font-sans">
                Specimen securely clamped to mechanical stage
              </span>
              <span className="text-[11px] text-purple-400 font-bold">
                Revolving Turret: 10x Quartz Objective Active
              </span>
            </div>

            <button
              onClick={handleOpenEyepiece}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-600 hover:from-purple-400 hover:to-fuchsia-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-purple-500/30 hover:scale-105 active:scale-95 transition-all"
            >
              <Eye className="w-4 h-4 text-white" />
              Look into Quartz Eyepiece (4x-100x)
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
