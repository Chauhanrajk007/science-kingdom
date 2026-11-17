import React, { useState, useEffect, useRef } from 'react';
import { REAGENTS_DATA } from '../../data/experimentsData';
import { ChemicalReagent } from '../../types/laboratory';
import { soundManager } from '../../audio/SoundManager';
import { predictChemicalReaction, ChemicalReactionResult } from '../../services/SenkuAiService';
import confetti from 'canvas-confetti';
import { 
  FlaskConical, 
  Flame, 
  RotateCcw, 
  Pipette, 
  Thermometer, 
  Sparkles, 
  AlertTriangle,
  Beaker,
  CheckCircle2,
  Droplets,
  Eye,
  Zap,
  TrendingUp,
  Activity,
  Layers,
  Bot,
  ArrowLeft
} from 'lucide-react';
import { ChemWorkbenchRealistic } from './ChemWorkbenchRealistic';

export const ChemistryLab: React.FC = () => {
  const [viewMode, setViewMode] = useState<'table' | 'simulator' | 'titration'>('table');
  const [activeMode, setActiveMode] = useState<'simulator' | 'titration'>('simulator');

  // --- FREE CHEMICAL REACTION SIMULATOR STATE ---
  const [selectedVessel, setSelectedVessel] = useState<'beaker' | 'flask' | 'testtube'>('beaker');
  const [addedReagents, setAddedReagents] = useState<ChemicalReagent[]>([]);
  const [isTopView, setIsTopView] = useState<boolean>(false);
  const [isReacting, setIsReacting] = useState<boolean>(false);
  const [isExploding, setIsExploding] = useState<boolean>(false);
  const [reactionResult, setReactionResult] = useState<ChemicalReactionResult | null>(null);
  const [burnerActive, setBurnerActive] = useState<boolean>(false);
  const [liquidColor, setLiquidColor] = useState<string>('rgba(224, 242, 254, 0.15)');
  const [volumeMl, setVolumeMl] = useState<number>(0);
  const [filterCategory, setFilterCategory] = useState<'all' | 'acid' | 'base' | 'salt' | 'reactive'>('all');
  
  // Real Sequenced Pipette Dropper Animation State
  const [isDroppingWithPipette, setIsDroppingWithPipette] = useState<boolean>(false);
  const [droppingReagentColor, setDroppingReagentColor] = useState<string>('#38bdf8');
  const [activeDrops, setActiveDrops] = useState<Array<{ id: number; color: string; delayMs: number }>>([]);
  const [ripples, setRipples] = useState<Array<{ id: number }>>([]);
  const [isBulbSqueezing, setIsBulbSqueezing] = useState<boolean>(false);
  const [pipetteLiquidLevel, setPipetteLiquidLevel] = useState<number>(75);

  // --- TITRATION LAB STATE ---
  const [buretteVolume, setBuretteVolume] = useState<number>(50.0); // 50 mL burette
  const [dispensedVolume, setDispensedVolume] = useState<number>(0.0);
  const [titrationDropRate, setTitrationDropRate] = useState<number>(0); // 0=stop, 1=slow, 3=fast
  const [titrationIndicator, setTitrationIndicator] = useState<'phenolphthalein' | 'turmeric'>('phenolphthalein');
  const [isFlaskSwirling, setIsFlaskSwirling] = useState<boolean>(true);
  const [analyteMolarity] = useState<number>(0.10); // 0.1M HCl analyte
  const [analyteVolume] = useState<number>(25.0); // 25 mL
  const [titrantMolarity] = useState<number>(0.10); // 0.1M NaOH titrant

  // Calculate titration pH based on dispensed volume
  const equivalenceVolume = (analyteMolarity * analyteVolume) / titrantMolarity; // 25.0 mL
  
  const calculateTitrationState = () => {
    const v = dispensedVolume;
    let ph = 1.0;
    let color = 'rgba(255, 255, 255, 0.12)';
    let isEndpoint = false;

    if (v < equivalenceVolume - 0.5) {
      // Acidic buffer
      const molesAcidRemaining = (analyteMolarity * analyteVolume - titrantMolarity * v) / 1000;
      const totalVol = (analyteVolume + v) / 1000;
      const hConc = Math.max(0.0001, molesAcidRemaining / totalVol);
      ph = -Math.log10(hConc);
      color = titrationIndicator === 'turmeric' ? 'rgba(250, 204, 21, 0.7)' : 'rgba(255, 255, 255, 0.15)';
    } else if (Math.abs(v - equivalenceVolume) <= 0.5) {
      // Equivalence point steep rise
      ph = 7.0 + (v - equivalenceVolume) * 4;
      isEndpoint = true;
      if (titrationIndicator === 'phenolphthalein') {
        color = 'rgba(244, 114, 182, 0.65)'; // Persistent pale pink!
      } else {
        color = 'rgba(220, 38, 38, 0.8)'; // Turmeric turning blood-red!
      }
    } else {
      // Excess base
      const molesBaseExcess = (titrantMolarity * (v - equivalenceVolume)) / 1000;
      const totalVol = (analyteVolume + v) / 1000;
      const ohConc = Math.max(0.0001, molesBaseExcess / totalVol);
      const poh = -Math.log10(ohConc);
      ph = Math.min(13.8, 14 - poh);
      if (titrationIndicator === 'phenolphthalein') {
        color = 'rgba(236, 72, 153, 0.9)'; // Deep vibrant magenta pink
      } else {
        color = 'rgba(185, 28, 28, 0.95)'; // Deep red
      }
    }

    return { ph: Math.min(14, Math.max(1, ph)), color, isEndpoint };
  };

  const titrationState = calculateTitrationState();

  // Titration automatic drop ticker
  useEffect(() => {
    if (titrationDropRate === 0 || buretteVolume <= 0) return;

    const interval = setInterval(() => {
      setBuretteVolume((prev) => {
        const next = Math.max(0, prev - (0.1 * titrationDropRate));
        return parseFloat(next.toFixed(2));
      });
      setDispensedVolume((prev) => {
        const next = Math.min(50, prev + (0.1 * titrationDropRate));
        return parseFloat(next.toFixed(2));
      });
      soundManager.playLiquidDrip();
    }, 400 / titrationDropRate);

    return () => clearInterval(interval);
  }, [titrationDropRate, buretteVolume]);

  // Real tactile sequenced water drop engine: drops fall one after another
  const triggerDropletsSequence = (count: number = 3, colorOverride?: string) => {
    const chosenColor = colorOverride || droppingReagentColor || '#38bdf8';
    setIsBulbSqueezing(true);
    setIsDroppingWithPipette(true);
    
    // Create staggered sequential drops (spaced 240ms apart)
    const drops = Array.from({ length: count }, (_, idx) => ({
      id: Date.now() + idx,
      color: chosenColor,
      delayMs: idx * 240,
    }));

    setActiveDrops(drops);

    // Each drop accelerates down and splashes into the beaker liquid
    drops.forEach((drop) => {
      // Squeeze bulb pulse
      setTimeout(() => {
        setIsBulbSqueezing(true);
      }, drop.delayMs);
      setTimeout(() => {
        setIsBulbSqueezing(false);
      }, drop.delayMs + 160);

      // Splash impact at bottom
      setTimeout(() => {
        soundManager.playLiquidDrip();
        setRipples((prev) => [...prev.slice(-4), { id: Date.now() + Math.random() }]);
        setVolumeMl((prev) => Math.min(250, prev + 12));
        setPipetteLiquidLevel((prev) => Math.max(12, prev - 14));
      }, drop.delayMs + 440);
    });

    const totalDuration = (count - 1) * 240 + 750;
    setTimeout(() => {
      setActiveDrops([]);
      setIsDroppingWithPipette(false);
    }, totalDuration);
  };

  // Handle adding reagent to reaction simulator with real Sequenced Pipette Dropper animation
  const handleAddReagent = async (reagent: ChemicalReagent) => {
    setDroppingReagentColor(reagent.color);
    setPipetteLiquidLevel(85);

    // 1. Release sequential water drops falling one after another!
    triggerDropletsSequence(3, reagent.color);

    const updated = [...addedReagents, reagent];
    setAddedReagents(updated);

    // Analyze reaction via Chemical Knowledge Matrix
    setIsReacting(true);
    const result = await predictChemicalReaction(updated.map((r) => r.id));
    setIsReacting(false);
    setReactionResult(result);

    if (result.reactionOccurs) {
      setTimeout(() => {
        setLiquidColor(result.color);

        if (result.isExplosive) {
          soundManager.playExplosion();
          setIsExploding(true);
          setTimeout(() => setIsExploding(false), 3000);
        } else if (result.isPrecipitate) {
          soundManager.playChimeSuccess();
        } else {
          soundManager.playChemicalReaction();
        }
      }, 1000);
    } else {
      setTimeout(() => {
        setLiquidColor(reagent.color);
      }, 700);
    }
  };

  const resetSimulator = () => {
    soundManager.playGlassClink();
    setAddedReagents([]);
    setReactionResult(null);
    setLiquidColor('rgba(224, 242, 254, 0.15)');
    setVolumeMl(0);
    setIsExploding(false);
    setBurnerActive(false);
  };

  const resetTitration = () => {
    soundManager.playGlassClink();
    setBuretteVolume(50.0);
    setDispensedVolume(0.0);
    setTitrationDropRate(0);
  };

  const filteredReagents = REAGENTS_DATA.filter((r) => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'acid') return r.ph !== undefined && r.ph < 7;
    if (filterCategory === 'base') return r.ph !== undefined && r.ph > 7;
    if (filterCategory === 'reactive') return r.id === 'sodium_metal' || r.id === 'potassium_permanganate' || r.id === 'hydrogen_peroxide';
    if (filterCategory === 'salt') return r.state === 'powder' || r.id.includes('sulfate') || r.id.includes('chloride') || r.id.includes('nitrate') || r.id.includes('iodide');
    return true;
  });

  // 1. Initial Photorealistic Laboratory Workbench Overview
  if (viewMode === 'table') {
    return (
      <div className="relative w-full h-full flex flex-col pt-16 overflow-hidden bg-slate-950">
        <ChemWorkbenchRealistic
          onSelectStation={(station) => {
            soundManager.playDoorSlide();
            setViewMode(station);
            setActiveMode(station);
          }}
        />
      </div>
    );
  }

  return (
    <div className="relative w-full h-full flex flex-col pt-20 px-4 sm:px-6 pb-4 overflow-hidden bg-slate-950 select-none">
      
      {/* Authentic Laboratory Background */}
      <img
        src="/assets/futuristic_chem_lab.jpg"
        alt="Realistic Chemistry Laboratory Workbench"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none opacity-45 brightness-90"
      />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950 via-slate-950/75 to-slate-950/90" />

      {/* Screen Vibration Shake on Chemical Explosion */}
      <div className={`relative z-10 w-full h-full flex flex-col ${isExploding ? 'animate-bounce' : ''}`}>
        
        {/* Top Header Mode Switcher Bar */}
        <div className="flex items-center justify-between mb-3 z-20 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            {/* Step Back to 3D Table Button */}
            <button
              onClick={() => {
                soundManager.playClick();
                setViewMode('table');
              }}
              className="px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-emerald-400 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs font-mono font-bold shadow-xl backdrop-blur-md transition-all group"
              title="Return to Tabletop Overview"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-emerald-400 group-hover:-translate-x-0.5 transition-transform" />
              <span>Table Overview</span>
            </button>

            <div className="flex rounded-xl bg-slate-900/90 border border-slate-700/80 p-1 shadow-2xl backdrop-blur-md">
              <button
                onClick={() => {
                  soundManager.playClick();
                  setActiveMode('simulator');
                  setViewMode('simulator');
                }}
                className={`px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                  activeMode === 'simulator'
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-slate-950 font-black shadow-lg shadow-emerald-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Beaker className="w-4 h-4" /> Creative Reaction Mixer
              </button>
              <button
                onClick={() => {
                  soundManager.playClick();
                  setActiveMode('titration');
                  setViewMode('titration');
                }}
                className={`px-4 py-2 rounded-lg text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${
                  activeMode === 'titration'
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-lg shadow-cyan-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Pipette className="w-4 h-4" /> Acid-Base Color Lab
              </button>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3 px-3.5 py-1.5 rounded-xl bg-slate-900/80 border border-slate-700/70 text-xs font-mono text-emerald-300 backdrop-blur-md">
            <Bot className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Senku Science Mentor • Mix & Discover</span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* MODE 1: FREE CHEMICAL REACTION SIMULATOR WITH BLAST & TOP VIEW             */}
        {/* ========================================================================= */}
        {activeMode === 'simulator' && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
            
            {/* Left Column (4 cols): Chemical Storage Cabinet */}
            <div className="lg:col-span-4 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md p-3.5 flex flex-col justify-between overflow-hidden shadow-2xl">
              <div>
                <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <FlaskConical className="w-4 h-4 text-emerald-400" />
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-100 font-mono">
                      Chemical Reagent Cabinet
                    </h3>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">Click to Dispense</span>
                </div>

                {/* Category Filters */}
                <div className="flex items-center gap-1 mb-2.5 overflow-x-auto pb-1">
                  {(['all', 'acid', 'base', 'salt', 'reactive'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFilterCategory(cat)}
                      className={`px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold transition-all ${
                        filterCategory === cat
                          ? 'bg-emerald-500 text-slate-950'
                          : 'bg-slate-800/80 text-slate-400 hover:text-white'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Reagent Bottles List */}
                <div className="space-y-1.5 max-h-[360px] overflow-y-auto pr-1">
                  {filteredReagents.map((reagent) => (
                    <button
                      key={reagent.id}
                      onClick={() => handleAddReagent(reagent)}
                      className="w-full p-2 rounded-xl bg-slate-950/70 hover:bg-slate-800/90 border border-slate-800 hover:border-emerald-500/50 flex items-center justify-between transition-all group text-left"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/30 shrink-0 shadow-sm"
                          style={{ backgroundColor: reagent.color }}
                        />
                        <div>
                          <span className="font-bold text-xs text-slate-200 block font-mono group-hover:text-emerald-300">
                            {reagent.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {reagent.formula} {reagent.ph !== undefined && `• pH ${reagent.ph}`}
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        + Add
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Added Reagents Tray */}
              <div className="mt-3 pt-2.5 border-t border-slate-800">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">
                    In Vessel: ({addedReagents.length})
                  </span>
                  {addedReagents.length > 0 && (
                    <button
                      onClick={resetSimulator}
                      className="text-[10px] font-mono text-red-400 hover:text-red-300 flex items-center gap-1"
                    >
                      <RotateCcw className="w-3 h-3" /> Wash Glassware
                    </button>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 max-h-16 overflow-y-auto">
                  {addedReagents.length === 0 ? (
                    <span className="text-xs text-slate-500 font-mono italic">
                      Empty vessel. Add reagents above.
                    </span>
                  ) : (
                    addedReagents.map((r, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-[10px] font-mono text-slate-300"
                      >
                        {r.name}
                      </span>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Center Column (5 cols): Interactive Workbench & Vessel */}
            <div className="lg:col-span-5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md p-4 flex flex-col justify-between shadow-2xl relative overflow-hidden">
              
              {/* Vessel Type & View Controls */}
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 z-20">
                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
                  {(['beaker', 'flask', 'testtube'] as const).map((v) => (
                    <button
                      key={v}
                      onClick={() => setSelectedVessel(v)}
                      className={`px-3 py-1 rounded-lg text-xs font-mono uppercase font-bold transition-all ${
                        selectedVessel === v
                          ? 'bg-emerald-500 text-slate-950 font-black'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  {/* Top-View Toggle Button */}
                  <button
                    onClick={() => {
                      soundManager.playClick();
                      setIsTopView(!isTopView);
                    }}
                    className={`px-3 py-1 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all border ${
                      isTopView
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black shadow-[0_0_15px_rgba(6,182,212,0.6)]'
                        : 'bg-slate-950 text-cyan-300 border-slate-700 hover:border-cyan-400'
                    }`}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    {isTopView ? 'Side View' : 'Top / Near View'}
                  </button>

                  <button
                    onClick={() => {
                      soundManager.playBurnerIgnite();
                      setBurnerActive(!burnerActive);
                    }}
                    className={`p-1.5 rounded-xl border transition-all ${
                      burnerActive
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.6)]'
                        : 'bg-slate-950 text-amber-400 border-slate-700 hover:border-amber-400'
                    }`}
                    title="Toggle Bunsen Burner"
                  >
                    <Flame className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Main Laboratory Workbench Stage (Clickable Vessel Area) */}
              <div 
                onClick={() => setIsTopView(!isTopView)}
                className="relative flex-1 rounded-xl overflow-hidden bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800/80 flex items-center justify-center cursor-pointer group shadow-inner min-h-[300px]"
                title="Click inside vessel to toggle Top / Near View"
              >
                {/* EXPLOSION BLAST ANIMATION OVERLAY */}
                {isExploding && (
                  <div className="absolute inset-0 z-50 pointer-events-none flex items-center justify-center bg-orange-600/30 animate-pulse">
                    <div className="w-64 h-64 rounded-full bg-gradient-to-r from-yellow-300 via-orange-500 to-red-600 animate-ping opacity-75 blur-md" />
                    <div className="absolute text-center">
                      <span className="text-3xl font-black text-white font-mono tracking-widest drop-shadow-[0_0_20px_#ef4444] block animate-bounce">
                        💥 CHEMICAL BLAST!
                      </span>
                      <span className="text-xs font-mono font-bold text-yellow-200 bg-red-950/90 px-3 py-1 rounded-full border border-red-500/80 mt-2 inline-block">
                        Rapid Exothermic Wave Generated!
                      </span>
                    </div>
                  </div>
                )}

                {/* --- VIEW A: TOP-DOWN CIRCULAR MENISCUS & NEAR VIEW --- */}
                {isTopView ? (
                  <div className="relative flex flex-col items-center justify-center animate-in zoom-in-95 duration-300">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest mb-2 font-bold flex items-center gap-1">
                      <Eye className="w-3.5 h-3.5" /> High-Resolution Top Meniscus View
                    </span>
                    
                    {/* Circular Beaker Mouth with Dynamic Fluid Surface */}
                    <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full border-8 border-slate-600 shadow-[0_0_40px_rgba(0,0,0,0.9),inset_0_0_30px_rgba(255,255,255,0.2)] overflow-hidden bg-slate-950 flex items-center justify-center">
                      
                      {/* Swirling Liquid Texture with Dynamic Color */}
                      <div
                        style={{ animationDuration: '20s', backgroundColor: liquidColor }}
                        className="absolute inset-0 rounded-full transition-colors duration-700 animate-spin"
                      />

                      {/* Bubbles Effervescence in Top View */}
                      {reactionResult?.isBubbling && (
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="w-3 h-3 rounded-full bg-white/70 absolute top-1/4 left-1/3 animate-ping" />
                          <div className="w-2 h-2 rounded-full bg-white/70 absolute top-2/3 left-1/2 animate-ping" style={{ animationDelay: '0.3s' }} />
                          <div className="w-4 h-4 rounded-full bg-white/70 absolute top-1/2 left-2/3 animate-ping" style={{ animationDelay: '0.6s' }} />
                        </div>
                      )}

                      {/* Precipitate settling crystals in Top View */}
                      {reactionResult?.isPrecipitate && (
                        <div
                          style={{ backgroundColor: reactionResult.precipitateColor }}
                          className="w-24 h-24 rounded-full blur-sm opacity-80 animate-pulse"
                        />
                      )}

                      {/* Glass Lens Reflection */}
                      <div className="absolute inset-2 rounded-full border border-white/20 pointer-events-none shadow-inner" />
                      <div className="absolute top-4 left-6 w-16 h-8 rounded-full bg-white/10 blur-[2px] rotate-[-30deg] pointer-events-none" />

                      <div className="relative z-10 text-center px-4">
                        <span className="text-xs font-mono font-bold text-slate-900 bg-white/80 px-2 py-0.5 rounded shadow">
                          {volumeMl > 0 ? `${volumeMl} mL Solution` : 'Dry Vessel'}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-mono text-slate-400 mt-2">
                      Click anywhere to return to side bench view
                    </span>
                  </div>
                ) : (
                  /* --- VIEW B: FRONT WORKBENCH SIDE VIEW WITH INTERACTIVE GLASS PIPETTE & SEQUENCED WATER DROPS --- */
                  <div className="relative flex flex-col items-center justify-end h-88 w-72 animate-in fade-in duration-300 pt-20">
                    
                    {/* High-Precision Interactive Glass Dropper Pipette */}
                    <div
                      className="absolute top-1 z-30 flex flex-col items-center"
                    >
                      {/* Interactive Rubber Squeeze Bulb (Clickable to dispense drops!) */}
                      <button
                        onClick={() => triggerDropletsSequence(1)}
                        title="Click rubber bulb to squeeze a water drop!"
                        className="group relative flex flex-col items-center cursor-pointer transition-transform active:scale-95"
                      >
                        <div
                          style={{
                            transform: isBulbSqueezing ? 'scaleY(0.72) scaleX(1.22)' : 'scale(1)',
                            transition: 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
                          }}
                          className="w-9 h-12 rounded-t-full bg-gradient-to-b from-rose-500 via-red-600 to-rose-900 border-2 border-rose-400 shadow-[0_6px_20px_rgba(244,63,94,0.4)] relative flex items-center justify-center group-hover:brightness-110"
                        >
                          {/* Squeeze ribbing texture */}
                          <div className="w-1.5 h-7 bg-white/30 rounded-full blur-[0.5px] -ml-2.5" />
                          <div className="absolute top-2 w-5 h-0.5 bg-black/30 rounded" />
                          <div className="absolute top-5 w-6 h-0.5 bg-black/30 rounded" />
                          <div className="absolute top-8 w-5 h-0.5 bg-black/30 rounded" />
                        </div>

                        {/* Metallic Brass Collar Ring */}
                        <div className="w-7 h-2.5 bg-gradient-to-r from-amber-400 via-amber-200 to-amber-600 rounded-sm shadow-md" />

                        {/* Transparent Borosilicate Glass Pipette Barrel */}
                        <div className="w-4 h-24 border-2 border-white/80 bg-gradient-to-r from-white/35 via-white/10 to-white/20 relative rounded-b flex flex-col justify-end overflow-hidden shadow-2xl backdrop-blur-sm">
                          {/* Calibrated Meniscus Markings */}
                          <div className="absolute inset-0 flex flex-col justify-between py-1.5 px-0.5 text-[5px] font-mono text-slate-300 pointer-events-none">
                            <span>- 3mL</span>
                            <span>- 2mL</span>
                            <span>- 1mL</span>
                          </div>

                          {/* Liquid Column inside Pipette */}
                          <div
                            style={{
                              backgroundColor: droppingReagentColor,
                              height: `${pipetteLiquidLevel}%`,
                              transition: 'height 0.3s ease-out',
                            }}
                            className="w-full relative opacity-90 shadow-inner"
                          >
                            {/* Liquid Meniscus Curve */}
                            <div className="absolute top-0 inset-x-0 h-1 bg-white/40 rounded-full blur-[0.5px]" />
                          </div>
                        </div>

                        {/* Fine Tapered Capillary Jet Nozzle */}
                        <div className="w-1.5 h-5 bg-white/80 border-x border-b border-white rounded-b-full shadow-sm relative flex flex-col items-center justify-end">
                          <div
                            style={{ backgroundColor: droppingReagentColor }}
                            className="w-1 h-3 rounded-b-full opacity-90"
                          />
                        </div>
                      </button>

                      {/* Actual Cascading Water Drops Falling 1 After The Other */}
                      <div className="absolute top-[158px] left-1/2 -translate-x-1/2 w-8 h-36 pointer-events-none overflow-visible">
                        {activeDrops.map((drop) => (
                          <svg
                            key={drop.id}
                            viewBox="0 0 24 32"
                            className="absolute left-1/2 -translate-x-1/2 w-4 h-6 filter drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]"
                            style={{
                              animation: `waterDropFall 0.52s cubic-bezier(0.4, 0, 0.8, 0.4) ${drop.delayMs}ms forwards`,
                            }}
                          >
                            <defs>
                              <radialGradient id={`dropGrad-${drop.id}`} cx="35%" cy="30%" r="70%">
                                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
                                <stop offset="35%" stopColor={drop.color} />
                                <stop offset="100%" stopColor="#020617" stopOpacity="0.8" />
                              </radialGradient>
                            </defs>
                            <path
                              d="M 12 1 C 12 1, 3 13, 3 20 C 3 25.5 7 30 12 30 C 17 30 21 25.5 21 20 C 21 13, 12 1, 12 1 Z"
                              fill={`url(#dropGrad-${drop.id})`}
                            />
                            {/* Specular White Gloss Highlight Dot */}
                            <ellipse cx="9" cy="18" rx="2" ry="3.5" fill="#ffffff" opacity="0.85" />
                          </svg>
                        ))}
                      </div>
                    </div>

                    {/* Borosilicate Glass Beaker Graphic */}
                    <div className="relative w-36 h-48 rounded-b-3xl border-4 border-slate-400/60 bg-white/5 backdrop-blur-sm overflow-hidden flex flex-col justify-end shadow-2xl">
                      {/* Graduated Volume Markings */}
                      <div className="absolute top-4 left-2 space-y-3 pointer-events-none text-[8px] font-mono text-slate-400">
                        <div>- 250 mL</div>
                        <div>- 200 mL</div>
                        <div>- 150 mL</div>
                        <div>- 100 mL</div>
                        <div>- 50 mL</div>
                      </div>

                      {/* Dynamic Liquid Level */}
                      <div
                        style={{
                          height: `${Math.min(90, Math.max(15, (volumeMl / 250) * 100))}%`,
                          backgroundColor: liquidColor,
                        }}
                        className="w-full relative transition-all duration-500 rounded-b-2xl"
                      >
                        {/* Meniscus Lip Line */}
                        <div className="absolute top-0 inset-x-0 h-2 bg-white/30 rounded-full blur-[0.5px]" />

                        {/* Concentric Splash Ripple Wave Rings on Surface */}
                        <div className="absolute top-0 inset-x-0 flex items-center justify-center pointer-events-none h-2">
                          {ripples.map((rip) => (
                            <span
                              key={rip.id}
                              style={{ animation: 'waterRippleRing 0.8s ease-out forwards' }}
                              className="absolute w-12 h-3 rounded-full border-2 border-white/80 pointer-events-none"
                            />
                          ))}
                        </div>

                        {/* Bubbling Particles */}
                        {reactionResult?.isBubbling && (
                          <div className="absolute inset-0 pointer-events-none flex justify-around">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDuration: '0.6s' }} />
                            <span className="w-2 h-2 rounded-full bg-white animate-bounce" style={{ animationDuration: '0.8s' }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-bounce" style={{ animationDuration: '0.5s' }} />
                          </div>
                        )}

                        {/* Precipitate Settling at Bottom */}
                        {reactionResult?.isPrecipitate && (
                          <div
                            style={{ backgroundColor: reactionResult.precipitateColor }}
                            className="absolute bottom-0 inset-x-0 h-4 opacity-90 transition-all rounded-b-2xl border-t border-white/40"
                          />
                        )}
                      </div>

                      {/* Glass Highlight Shine */}
                      <div className="absolute top-0 right-2 w-2 h-full bg-gradient-to-b from-white/30 via-transparent to-white/10 pointer-events-none" />
                    </div>

                    {/* Bunsen Burner Flame Beneath */}
                    {burnerActive && (
                      <div className="flex flex-col items-center mt-1 animate-pulse">
                        <div className="w-6 h-10 bg-gradient-to-t from-blue-600 via-cyan-400 to-amber-300 rounded-full blur-[1px]" />
                        <div className="w-10 h-3 bg-slate-700 rounded-sm" />
                      </div>
                    )}

                    {/* Tactile Pipette Controls */}
                    <div className="flex items-center gap-2 mt-3 z-30">
                      <button
                        onClick={() => triggerDropletsSequence(1)}
                        className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-emerald-400 text-[11px] font-mono text-slate-200 hover:text-white flex items-center gap-1 shadow transition-all active:scale-95"
                        title="Squeeze 1 drop from pipette"
                      >
                        <span>💧 1 Drop</span>
                      </button>
                      <button
                        onClick={() => triggerDropletsSequence(3)}
                        className="px-2 py-1 rounded-lg bg-emerald-950/80 border border-emerald-500/50 hover:border-emerald-400 text-[11px] font-mono text-emerald-300 hover:text-white flex items-center gap-1 shadow transition-all active:scale-95"
                        title="Dispense 3 drops one after another"
                      >
                        <span>💧💧💧 3 Drops</span>
                      </button>
                      <button
                        onClick={() => setPipetteLiquidLevel(85)}
                        className="p-1 rounded-lg bg-slate-900 border border-slate-700 hover:border-slate-500 text-[11px] text-slate-400 hover:text-white"
                        title="Refill Pipette"
                      >
                        <RotateCcw className="w-3 h-3" />
                      </button>
                    </div>

                  </div>
                )}

                {/* Hint Pill at Top */}
                <div className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded bg-slate-950/80 border border-slate-700 text-[10px] font-mono text-slate-300">
                  {volumeMl} mL in {selectedVessel}
                </div>
              </div>

              {/* Status Bar */}
              <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-800 text-[11px] font-mono text-slate-300">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-red-400" />
                    {reactionResult ? `${reactionResult.temperature} °C` : (burnerActive ? '65 °C' : '22 °C')}
                  </span>
                  <span className="flex items-center gap-1">
                    <Activity className="w-3.5 h-3.5 text-cyan-400" />
                    pH: {reactionResult ? reactionResult.ph.toFixed(1) : '7.0'}
                  </span>
                </div>

                {isReacting && (
                  <span className="text-amber-400 animate-pulse flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Calculating Stoichiometry...
                  </span>
                )}
              </div>

            </div>

            {/* Right Column (3 cols): Reaction Analysis & Explanation */}
            <div className="lg:col-span-3 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md p-3.5 flex flex-col justify-between shadow-2xl">
              <div>
                <div className="pb-2 mb-2 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                    Discovery Notepad
                  </span>
                  {reactionResult?.isExplosive ? (
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-black bg-red-600 text-white animate-bounce">
                      💥 BLAST!
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-slate-800 text-slate-300">
                      {reactionResult?.reactionOccurs ? '✨ Reaction Occurred!' : 'Quiet Mix'}
                    </span>
                  )}
                </div>

                {reactionResult ? (
                  <div className="space-y-2.5">
                    {/* Balanced Equation */}
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      <span className="text-[10px] font-mono text-slate-400 block mb-0.5 uppercase font-bold">
                        Chemical Formula:
                      </span>
                      <p className="text-xs font-mono font-bold text-amber-300 leading-snug">
                        {reactionResult.equation}
                      </p>
                    </div>

                    {/* Scientific Explanation in Human Language */}
                    <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80">
                      <span className="text-[10px] font-mono text-slate-400 block mb-0.5 uppercase font-bold">
                        What Just Happened:
                      </span>
                      <p className="text-xs font-sans text-slate-200 leading-relaxed">
                        {reactionResult.explanation}
                      </p>
                    </div>

                    {/* Senku Reaction Quote */}
                    <div className="p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/40">
                      <span className="text-[10px] font-mono text-emerald-400 block mb-0.5 uppercase font-bold flex items-center gap-1">
                        <Bot className="w-3.5 h-3.5 text-emerald-400" /> Senku's Mentor Tip:
                      </span>
                      <p className="text-xs font-sans text-emerald-200 leading-relaxed">
                        "{reactionResult.senkuCommentary}"
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-6 text-center text-slate-400 font-sans text-xs leading-relaxed">
                    🧪 Click any chemical bottle in the cabinet on the left! Watch the glass pipette drop it into the beaker to discover bubbles, color shifts, or fizzing foam!
                  </div>
                )}
              </div>

              {/* Quick Preset Reactions for Students */}
              <div className="pt-2 border-t border-slate-800">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1">
                  Exciting Recipes to Try:
                </span>
                <div className="grid grid-cols-2 gap-1 text-[10px] font-mono">
                  <button
                    onClick={() => {
                      resetSimulator();
                      handleAddReagent(REAGENTS_DATA.find((r) => r.id === 'vinegar')!);
                      setTimeout(() => {
                        handleAddReagent(REAGENTS_DATA.find((r) => r.id === 'baking_soda')!);
                      }, 400);
                    }}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-left truncate"
                  >
                    CO₂ Foam Blast
                  </button>
                  <button
                    onClick={() => {
                      resetSimulator();
                      handleAddReagent(REAGENTS_DATA.find((r) => r.id === 'sodium_metal')!);
                      setTimeout(() => {
                        handleAddReagent(REAGENTS_DATA.find((r) => r.id === 'water')!);
                      }, 400);
                    }}
                    className="p-1 rounded bg-red-950/80 hover:bg-red-900 border border-red-700/60 text-red-200 text-left truncate font-bold"
                  >
                    Sodium Explosion
                  </button>
                  <button
                    onClick={() => {
                      resetSimulator();
                      handleAddReagent(REAGENTS_DATA.find((r) => r.id === 'lead_nitrate')!);
                      setTimeout(() => {
                        handleAddReagent(REAGENTS_DATA.find((r) => r.id === 'potassium_iodide')!);
                      }, 400);
                    }}
                    className="p-1 rounded bg-yellow-950/80 hover:bg-yellow-900 border border-yellow-700/60 text-yellow-200 text-left truncate"
                  >
                    Golden Rain (PbI₂)
                  </button>
                  <button
                    onClick={() => {
                      resetSimulator();
                      handleAddReagent(REAGENTS_DATA.find((r) => r.id === 'naoh')!);
                      setTimeout(() => {
                        handleAddReagent(REAGENTS_DATA.find((r) => r.id === 'turmeric')!);
                      }, 400);
                    }}
                    className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-left truncate"
                  >
                    Turmeric Red Shift
                  </button>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* ========================================================================= */}
        {/* MODE 2: ACID-BASE TITRATION PRACTICAL EXPERIMENT                          */}
        {/* ========================================================================= */}
        {activeMode === 'titration' && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
            
            {/* Left Column (4 cols): Titration Controls & Burette Readings */}
            <div className="lg:col-span-4 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md p-4 flex flex-col justify-between shadow-2xl">
              <div>
                <div className="pb-2 mb-3 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Pipette className="w-4 h-4 text-cyan-400" />
                    <h3 className="font-bold text-xs uppercase tracking-wider text-slate-100 font-mono">
                      Titration Apparatus Controls
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-400 font-bold">
                    Class 11/12 NCERT Practical
                  </span>
                </div>

                {/* Reagent Specs */}
                <div className="space-y-2 mb-3 text-xs font-mono">
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">Burette Titrant:</span>
                    <span className="font-bold text-cyan-300">0.10 M NaOH</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                    <span className="text-slate-400">Conical Flask Analyte:</span>
                    <span className="font-bold text-amber-300">25.0 mL HCl</span>
                  </div>
                </div>

                {/* Indicator Selection */}
                <div className="mb-3">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1.5">
                    Select Indicator Added to Flask:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setTitrationIndicator('phenolphthalein')}
                      className={`p-2 rounded-xl border text-xs font-mono font-bold transition-all text-left ${
                        titrationIndicator === 'phenolphthalein'
                          ? 'border-pink-500 bg-pink-950/40 text-pink-300 shadow-lg'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      Phenolphthalein
                      <span className="block text-[9px] text-slate-400 font-normal">Colorless → Pale Pink</span>
                    </button>
                    <button
                      onClick={() => setTitrationIndicator('turmeric')}
                      className={`p-2 rounded-xl border text-xs font-mono font-bold transition-all text-left ${
                        titrationIndicator === 'turmeric'
                          ? 'border-yellow-500 bg-yellow-950/40 text-yellow-300 shadow-lg'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                      }`}
                    >
                      Natural Turmeric
                      <span className="block text-[9px] text-slate-400 font-normal">Yellow → Blood Red</span>
                    </button>
                  </div>
                </div>

                {/* Stopcock Drop Rate Control */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 mb-3">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-2">
                    Burette Stopcock Valve:
                  </span>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[
                      { rate: 0, label: 'Close' },
                      { rate: 1, label: '1 Drop/s' },
                      { rate: 3, label: '3 Drops/s' },
                      { rate: 6, label: 'Stream' },
                    ].map((btn) => (
                      <button
                        key={btn.rate}
                        onClick={() => {
                          soundManager.playClick();
                          setTitrationDropRate(btn.rate);
                        }}
                        className={`py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                          titrationDropRate === btn.rate
                            ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                            : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                        }`}
                      >
                        {btn.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Reset Titration */}
              <button
                onClick={resetTitration}
                className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Refill Burette (Reset to 50 mL)
              </button>
            </div>

            {/* Center Column (5 cols): Visual Titration Apparatus Stage */}
            <div className="lg:col-span-5 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md p-4 flex flex-col justify-between shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                <span className="text-xs font-mono text-cyan-300 font-bold flex items-center gap-2">
                  <Droplets className="w-4 h-4 text-cyan-400 animate-pulse" />
                  Volumetric Titration Setup
                </span>
                <span className="text-xs font-mono text-slate-300 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                  Dispensed: <strong className="text-cyan-400">{dispensedVolume.toFixed(1)} mL</strong>
                </span>
              </div>

              {/* Visual Apparatus Stage */}
              <div className="relative flex-1 rounded-xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800/80 flex items-center justify-center min-h-[320px]">
                
                {/* Retort Stand (Iron Base & Vertical Rod) */}
                <div className="absolute left-1/4 bottom-6 w-3 h-72 bg-slate-600 rounded-sm shadow-xl" />
                <div className="absolute left-16 bottom-4 w-32 h-4 bg-slate-700 rounded-md shadow-2xl" />

                {/* White Porcelain Base Tile */}
                <div className="absolute bottom-6 w-44 h-3 bg-white/90 rounded shadow-[0_4px_15px_rgba(255,255,255,0.2)]" />

                {/* Graduated Glass Burette */}
                <div className="relative flex flex-col items-center">
                  <div className="relative w-5 h-44 border-2 border-slate-300/80 bg-white/5 rounded-t-sm overflow-hidden flex flex-col justify-end">
                    
                    {/* Liquid Level in Burette */}
                    <div
                      style={{ height: `${(buretteVolume / 50) * 100}%` }}
                      className="w-full bg-cyan-400/30 transition-all duration-300 relative border-t-2 border-cyan-300/60"
                    />

                    {/* Meniscus markings */}
                    <div className="absolute inset-0 pointer-events-none flex flex-col justify-between py-1 px-0.5 text-[6px] font-mono text-slate-300">
                      <span>0mL</span>
                      <span>10mL</span>
                      <span>20mL</span>
                      <span>30mL</span>
                      <span>40mL</span>
                      <span>50mL</span>
                    </div>
                  </div>

                  {/* Stopcock Valve Clamped */}
                  <div className="w-8 h-3 bg-amber-600 rounded-sm my-0.5 shadow-md flex items-center justify-center">
                    <div className={`w-2 h-4 bg-slate-900 rounded-sm transition-transform ${titrationDropRate > 0 ? 'rotate-90' : 'rotate-0'}`} />
                  </div>

                  {/* Jet Tip */}
                  <div className="w-1.5 h-4 bg-slate-300/80 rounded-b-full" />

                  {/* Falling Drops Corridor between Burette and Flask */}
                  <div className="relative w-8 h-10 flex flex-col items-center justify-between my-0.5 overflow-hidden">
                    {titrationDropRate === 6 && buretteVolume > 0 ? (
                      /* Continuous Laminar Fluid Stream */
                      <div className="w-1.5 h-full bg-cyan-300 shadow-[0_0_10px_#38bdf8] rounded-full animate-pulse" />
                    ) : titrationDropRate > 0 && buretteVolume > 0 ? (
                      /* Discontinuous Falling Drops */
                      <div className="relative w-full h-full flex flex-col items-center justify-around">
                        <div className="w-2 h-3 rounded-full rounded-t-sm bg-cyan-300 shadow-[0_0_8px_#38bdf8] animate-bounce" />
                        <div className="w-1.5 h-2.5 rounded-full rounded-t-sm bg-cyan-400 shadow-[0_0_6px_#38bdf8] animate-pulse" />
                      </div>
                    ) : null}
                  </div>

                  {/* Conical Flask on White Tile */}
                  <div className="relative w-28 h-24 border-2 border-slate-400/80 bg-white/5 rounded-b-3xl rounded-t-lg overflow-hidden flex flex-col justify-end shadow-2xl">
                    
                    {/* Droplet Impact Ripple on Analyte Surface */}
                    {titrationDropRate > 0 && buretteVolume > 0 && (
                      <div className="absolute top-2 inset-x-0 flex justify-center pointer-events-none z-10">
                        <span className="w-6 h-1.5 rounded-full border border-cyan-200 animate-ping" />
                      </div>
                    )}

                    {/* Analyte Solution with Dynamic Color Transition */}
                    <div
                      style={{
                        height: `${Math.min(80, 40 + (dispensedVolume / 50) * 35)}%`,
                        backgroundColor: titrationState.color,
                      }}
                      className="w-full relative transition-colors duration-500 rounded-b-2xl"
                    >
                      {/* Swirling vortex if magnetic stir plate active */}
                      {isFlaskSwirling && (
                        <div className="absolute top-0 inset-x-0 h-1 bg-white/30 rounded-full animate-pulse" />
                      )}
                    </div>

                    <div className="absolute top-0 right-1 w-1.5 h-full bg-white/20 pointer-events-none" />
                  </div>
                </div>

                {/* Equivalence Endpoint Alert Badge */}
                {titrationState.isEndpoint && (
                  <div className="absolute top-4 right-4 p-2 rounded-xl bg-pink-950/90 border border-pink-500/80 text-pink-200 text-xs font-mono font-bold animate-bounce shadow-xl">
                    🎯 ENDPOINT REACHED!
                    <span className="block text-[10px] text-pink-300 font-normal">
                      Neutralization complete at pH 7.0 - 8.2
                    </span>
                  </div>
                )}
              </div>

              {/* Status Footer */}
              <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-800 text-xs font-mono text-slate-300">
                <span>Current pH: <strong className="text-cyan-400">{titrationState.ph.toFixed(2)}</strong></span>
                <span>Equivalence Point: <strong className="text-amber-400">25.0 mL</strong></span>
              </div>
            </div>

            {/* Right Column (3 cols): Titration Curve & Molarity Calculation */}
            <div className="lg:col-span-3 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md p-3.5 flex flex-col justify-between shadow-2xl">
              <div>
                <div className="pb-2 mb-2 border-b border-slate-800 flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                    Volumetric Analysis
                  </span>
                  <TrendingUp className="w-4 h-4 text-cyan-400" />
                </div>

                {/* Titration Curve Chart Graphic */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 mb-3">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block mb-1.5">
                    pH vs. Volume Titration Curve:
                  </span>
                  
                  {/* Visual pH Axis SVG Chart */}
                  <div className="relative h-28 w-full border-l border-b border-slate-700 p-1">
                    <svg className="w-full h-full overflow-visible">
                      {/* Sigmoidal Titration Curve */}
                      <path
                        d="M 0,90 C 40,88 70,85 85,50 C 95,20 120,12 180,10"
                        fill="none"
                        stroke="#06b6d4"
                        strokeWidth="2.5"
                      />
                      {/* Current Titration Position Dot */}
                      <circle
                        cx={Math.min(180, (dispensedVolume / 50) * 180)}
                        cy={Math.max(10, 100 - (titrationState.ph / 14) * 90)}
                        r="4"
                        fill="#f43f5e"
                        stroke="#ffffff"
                        strokeWidth="1.5"
                      />
                    </svg>
                    <div className="flex justify-between text-[8px] font-mono text-slate-500 mt-1">
                      <span>0mL</span>
                      <span>25mL (Eq)</span>
                      <span>50mL</span>
                    </div>
                  </div>
                </div>

                {/* Unknown Concentration Calculation Box */}
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 mb-3 space-y-1.5 text-xs font-mono">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Neutralization Formula:
                  </span>
                  <div className="text-amber-300 font-bold text-center py-1 bg-slate-900 rounded border border-slate-800">
                    M₁ · V₁ = M₂ · V₂
                  </div>
                  <div className="text-[11px] text-slate-300 leading-relaxed pt-1">
                    M(HCl) = [M(NaOH) × V(NaOH)] / V(HCl)
                    <br />
                    M(HCl) = [0.10 M × {dispensedVolume.toFixed(1)} mL] / 25.0 mL
                    <br />
                    <strong className="text-emerald-400 font-bold">
                      = {((0.10 * dispensedVolume) / 25.0).toFixed(3)} M
                    </strong>
                  </div>
                </div>

              </div>

              {/* Mecha Senku Practical Tip */}
              <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-600/40 text-[11px] font-serif text-cyan-200">
                <strong className="font-mono text-cyan-300 block text-[10px] uppercase">
                  Senku's Titration Rule:
                </strong>
                "Watch the meniscus at eye level! Near the endpoint, add titrant one drop at a time until a single drop causes the faint pink color to persist for 30 seconds!"
              </div>

            </div>

          </div>
        )}

      </div>

    </div>
  );
};