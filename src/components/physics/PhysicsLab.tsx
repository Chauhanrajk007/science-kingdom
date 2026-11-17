import React, { useState } from 'react';
import { OpticsBench } from './OpticsBench';
import { MechanicsStation } from './MechanicsStation';
import { PendulumStation } from './PendulumStation';
import { CircuitStation } from './CircuitStation';
import { AstronomyStation } from './AstronomyStation';
import { PhysWorkbenchRealistic } from './PhysWorkbenchRealistic';
import { UnthinkableCosmicPhysics } from './UnthinkableCosmicPhysics';
import { soundManager } from '../../audio/SoundManager';
import { Sun, Activity, Zap, Telescope, Compass, Rocket, ArrowLeft, Atom, Sparkles, Orbit } from 'lucide-react';

export const PhysicsLab: React.FC = () => {
  const [viewMode, setViewMode] = useState<'table' | 'classical' | 'unthinkable'>('table');
  const [activeTab, setActiveTab] = useState<'mechanics' | 'optics' | 'astronomy' | 'circuit' | 'pendulum'>('mechanics');

  const classicalStations = [
    {
      id: 'mechanics' as const,
      label: "Newton's Push & Motion",
      badge: 'Forces • Ramps • Pulleys',
      icon: <Compass className="w-4 h-4 text-cyan-400" />,
    },
    {
      id: 'optics' as const,
      label: 'Magic of Light & Lenses',
      badge: 'Bend Light • Rainbow Prism',
      icon: <Sun className="w-4 h-4 text-amber-400" />,
    },
    {
      id: 'astronomy' as const,
      label: "Planetary Science",
      badge: 'Real NASA & ISRO Telemetry',
      icon: <Orbit className="w-4 h-4 text-cyan-400" />,
    },
    {
      id: 'circuit' as const,
      label: 'Electricity & Lightbulb',
      badge: 'Spin Dynamo • Light the Bulb',
      icon: <Zap className="w-4 h-4 text-emerald-400" />,
    },
    {
      id: 'pendulum' as const,
      label: 'Swinging Pendulum',
      badge: 'Rhythm of Gravity',
      icon: <Activity className="w-4 h-4 text-purple-400" />,
    },
  ];

  // 1. Initial Photorealistic Physics Workbench Overview
  if (viewMode === 'table') {
    return (
      <div className="relative w-full h-full flex flex-col pt-16 overflow-hidden bg-slate-950">
        <PhysWorkbenchRealistic
          onSelectStation={(station) => {
            soundManager.playDoorSlide();
            setViewMode(station);
          }}
        />
      </div>
    );
  }

  // 2. Section 2: The Unthinkable Cosmic Physics Simulator ("Make the Unthinkable Thinkable")
  if (viewMode === 'unthinkable') {
    return (
      <div className="relative w-full h-full flex flex-col pt-20 px-4 sm:px-6 pb-4 overflow-hidden bg-slate-950">
        <div className="flex items-center justify-between mb-3 z-20 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                soundManager.playClick();
                setViewMode('table');
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs font-mono font-bold shadow-xl backdrop-blur-md transition-all group"
              title="Return to Physics Workbench Overview"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-cyan-400 group-hover:-translate-x-0.5 transition-transform" />
              <span>Workbench Overview</span>
            </button>

            <div className="flex rounded-xl bg-slate-900/90 border border-slate-700/80 p-1 shadow-2xl backdrop-blur-md">
              <button
                onClick={() => {
                  soundManager.playClick();
                  setViewMode('classical');
                }}
                className="px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider text-slate-300 hover:text-white flex items-center gap-2 transition-all"
              >
                <Atom className="w-4 h-4 text-cyan-400" /> Section 1: Classical STEM Lab
              </button>
              <button
                className="px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black shadow-lg shadow-pink-500/25 flex items-center gap-2"
              >
                <Rocket className="w-4 h-4 fill-current" /> Section 2: Unthinkable Physics
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0 z-10">
          <UnthinkableCosmicPhysics />
        </div>
      </div>
    );
  }

  // 3. Section 1: Classical STEM Physics Laboratory
  if (activeTab === 'astronomy') {
    return <AstronomyStation onBackToLab={() => setActiveTab('mechanics')} />;
  }

  return (
    <div className="relative w-full h-full flex flex-col pt-20 px-4 sm:px-6 pb-4 overflow-hidden bg-slate-950">
      {/* Authentic Physics Workshop Background */}
      <img
        src="/assets/futuristic_phys_lab.jpg"
        alt="Physics Workshop and Observatory"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none opacity-40 brightness-85"
      />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/90" />

      {/* Top Header Mode Bar with Step Back to Workbench */}
      <div className="relative z-20 mb-3 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              soundManager.playClick();
              setViewMode('table');
            }}
            className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-cyan-400 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs font-mono font-bold shadow-xl backdrop-blur-md transition-all group"
            title="Return to Physics Workbench Overview"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-cyan-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>Workbench Overview</span>
          </button>

          <div className="flex rounded-xl bg-slate-900/90 border border-slate-700/80 p-1 shadow-2xl backdrop-blur-md">
            <button
              className="px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-lg shadow-cyan-500/25 flex items-center gap-2"
            >
              <Atom className="w-4 h-4" /> Section 1: Classical STEM Lab
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setViewMode('unthinkable');
              }}
              className="px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider text-pink-300 hover:text-white hover:bg-slate-800 flex items-center gap-2 transition-all"
            >
              <Rocket className="w-4 h-4 text-pink-400" /> Section 2: Unthinkable Physics
            </button>
          </div>
        </div>

        {/* Sub-Station Tabs for Classical Lab */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {classicalStations.map((st) => {
            const isActive = activeTab === st.id;
            return (
              <button
                key={st.id}
                onClick={() => {
                  soundManager.playClick();
                  setActiveTab(st.id);
                }}
                className={`px-3 py-1.5 rounded-xl text-left transition-all backdrop-blur-md flex items-center gap-1.5 border text-xs font-mono ${
                  isActive
                    ? 'border-cyan-400 bg-cyan-950/60 text-white font-bold shadow-lg shadow-cyan-500/20'
                    : 'border-slate-800 bg-slate-900/70 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                }`}
              >
                {st.icon}
                <span className="truncate">{st.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Classical Physics Workspace Render */}
      <div className="relative z-10 flex-1 min-h-0">
        {activeTab === 'mechanics' && <MechanicsStation />}
        {activeTab === 'optics' && <OpticsBench />}
        {activeTab === 'circuit' && <CircuitStation />}
        {activeTab === 'pendulum' && <PendulumStation />}
      </div>
    </div>
  );
};
