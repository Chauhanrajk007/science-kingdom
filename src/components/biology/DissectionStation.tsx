import React, { useState, useRef, useEffect } from 'react';
import { soundManager } from '../../audio/SoundManager';
import confetti from 'canvas-confetti';
import { 
  Scissors, 
  RotateCcw, 
  Sparkles, 
  CheckCircle2, 
  Eye, 
  ZoomIn, 
  ZoomOut, 
  Info, 
  Flower2, 
  Pin,
  Search,
  ArrowRight,
  Hand,
  Heart,
  HelpCircle
} from 'lucide-react';

export const DissectionStation: React.FC = () => {
  // Dissection Stage: 0 = Peel Petals & Calyx, 1 = Slit Staminal Sheath, 2 = Slice Open Ovary
  const [currentStage, setCurrentStage] = useState<number>(0);
  
  // Real-time Cutting & Peeling State
  const [isDraggingScalpel, setIsDraggingScalpel] = useState<boolean>(false);
  const [cutProgress, setCutProgress] = useState<number>(0); // 0% to 100%
  const [hasCompletedCut, setHasCompletedCut] = useState<boolean>(false);
  const [selectedOrgan, setSelectedOrgan] = useState<string>('petals');
  const [scalpelY, setScalpelY] = useState<number>(20); // vertical position percentage

  const trayRef = useRef<HTMLDivElement>(null);

  const stages = [
    {
      id: 0,
      name: 'Layer 1: Peeling Sepals & Petals',
      friendlyPrompt: 'Take your scalpel and drag down the line to gently slice and peel open the flower petals!',
      baseInnerImg: '/assets/flower_stage2.jpg', // Revealed inside: staminal column
      outerLeftImg: '/assets/flower_stage1.jpg',
      outerRightImg: '/assets/flower_stage1.jpg',
      revealName: 'Golden-Dusted Staminal Column & Velvet Stigma',
      organs: ['epicalyx', 'calyx', 'petals', 'pedicel'],
      nextActionText: 'Next Step: Slit Open the Staminal Tube →',
    },
    {
      id: 1,
      name: 'Layer 2: Splitting the Staminal Column',
      friendlyPrompt: 'Now gently slice down the yellow tube to peel it open and find the secret white style hidden inside!',
      baseInnerImg: '/assets/flower_stage3.jpg', // Revealed inside: style and ovary
      outerLeftImg: '/assets/flower_stage2.jpg',
      outerRightImg: '/assets/flower_stage2.jpg',
      revealName: 'The Long White Style & Ovary Chamber',
      organs: ['stigma', 'anthers', 'filaments', 'staminal_tube'],
      nextActionText: 'Next Step: Slice Open the Ovary Chamber →',
    },
    {
      id: 2,
      name: 'Layer 3: Slicing the Baby Seed Chamber (Ovary)',
      friendlyPrompt: 'Make one clean cut right through the green ovary at the base to open the 5 rooms holding baby ovules!',
      baseInnerImg: '/assets/flower_stage3.jpg',
      outerLeftImg: '/assets/flower_stage3.jpg',
      outerRightImg: '/assets/flower_stage3.jpg',
      revealName: '5 Chambers with Glistening White Ovules (Baby Seeds)',
      organs: ['ovary_wall', 'locules_ovules', 'style_tube', 'receptacle'],
      nextActionText: 'Complete Dissection! Celebrate Discovery 🎉',
    },
  ];

  const organData: Record<string, { name: string; funTitle: string; easyExplanation: string }> = {
    epicalyx: {
      name: 'Green Leafy Shield (Epicalyx)',
      funTitle: 'The Flower\'s Armor',
      easyExplanation: 'A little ring of 5 to 7 green leafy tips just under the flower. They wrap tightly around the flower when it is a baby bud to protect it from hungry bugs and rain!',
    },
    calyx: {
      name: 'Green Cup (Calyx / Sepals)',
      funTitle: 'The Floral Cradle',
      easyExplanation: 'Five green sepals fused into a sturdy cup. It holds all the petals together tightly at the base so wind cannot blow the flower away.',
    },
    petals: {
      name: 'Scarlet Petals (Corolla)',
      funTitle: 'The Colorful Welcome Sign',
      easyExplanation: 'Big, bright red petals that catch the eyes of butterflies, hummingbirds, and bees. Deep inside, sweet nectar is waiting for visiting pollinators!',
    },
    pedicel: {
      name: 'Flower Stalk (Pedicel)',
      funTitle: 'The Plant\'s Drinking Straw',
      easyExplanation: 'The sturdy green stem that connects the flower to the main plant. It pumps fresh water and nutrients up into every petal!',
    },
    stigma: {
      name: '5 Velvet Stigma Tips',
      funTitle: 'The Pollen Catcher',
      easyExplanation: 'At the very top of the stalk are 5 soft, sticky crimson pads. When bees land with golden pollen on their legs, the sticky pads catch the pollen so new seeds can grow!',
    },
    anthers: {
      name: 'Golden Pollen Bags (Anthers)',
      funTitle: 'The Yellow Dust Pouches',
      easyExplanation: 'Hundreds of tiny yellow bags filled with fine golden dust called pollen. Whenever an insect brushes past, pollen rubs onto its fur like fairy dust!',
    },
    filaments: {
      name: 'Tiny Stalks (Filaments)',
      funTitle: 'Springy Stamen Arms',
      easyExplanation: 'Delicate little arms holding each yellow pollen pouch outwards so passing bees easily bump into them.',
    },
    staminal_tube: {
      name: 'Fused Staminal Column',
      funTitle: 'The Science Elevator',
      easyExplanation: 'All hundreds of stamen stems fuse together into a hollow red tube! It lifts the pollen high into the air right where flying pollinators will touch it.',
    },
    ovary_wall: {
      name: 'Ovary Wall',
      funTitle: 'The Protective Fruit Shell',
      easyExplanation: 'The green protective wall around the seed room. Once the flower is pollinated, this wall thickens and ripens into a seed pod!',
    },
    locules_ovules: {
      name: '5 Rooms with Baby Ovules',
      funTitle: 'The Baby Seeds!',
      easyExplanation: 'Inside the ovary are 5 cozy rooms. Each room holds tiny white beads called ovules. When fertilized by pollen, each ovule grows into a real seed!',
    },
    style_tube: {
      name: 'The Inner Style Tunnel',
      funTitle: 'The Hidden Pathway',
      easyExplanation: 'A delicate white tube running straight through the center. Pollen tubes sprout on top and grow all the way down this tunnel to reach the baby seeds below!',
    },
    receptacle: {
      name: 'Base Cushion (Receptacle)',
      funTitle: 'The Flower\'s Cushion',
      easyExplanation: 'The strong round base where all the petals, stems, and seed chambers sit safely.',
    },
  };

  const currentStageData = stages[currentStage];
  const activeOrganInfo = organData[selectedOrgan] || organData['petals'];

  // Handle Dragging Scalpel to Cut and Peel
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (hasCompletedCut) return;
    setIsDraggingScalpel(true);
    updateCutPosition(e.clientY);
    soundManager.playDoorSlide();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDraggingScalpel || hasCompletedCut) return;
    updateCutPosition(e.clientY);
  };

  const handleMouseUp = () => {
    setIsDraggingScalpel(false);
  };

  const updateCutPosition = (clientY: number) => {
    if (!trayRef.current) return;
    const rect = trayRef.current.getBoundingClientRect();
    const relativeY = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    const progress = Math.min(100, Math.max(0, relativeY * 115));
    
    setScalpelY(relativeY * 100);
    setCutProgress(progress);

    // Play subtle cutting sound as progress advances
    if (Math.floor(progress) % 25 === 0 && progress > 5) {
      soundManager.playClick();
    }

    if (progress >= 95 && !hasCompletedCut) {
      setHasCompletedCut(true);
      setCutProgress(100);
      setIsDraggingScalpel(false);
      soundManager.playChimeSuccess();
      confetti({ particleCount: 70, spread: 80, origin: { y: 0.5 } });
    }
  };

  const handleNextStage = () => {
    soundManager.playGlassClink();
    if (currentStage < stages.length - 1) {
      setCurrentStage((prev) => prev + 1);
      setCutProgress(0);
      setHasCompletedCut(false);
    } else {
      confetti({ particleCount: 120, spread: 100, origin: { y: 0.4 } });
    }
  };

  const handleResetDissection = () => {
    soundManager.playClick();
    setCurrentStage(0);
    setCutProgress(0);
    setHasCompletedCut(false);
    setSelectedOrgan('petals');
  };

  // Automated Smooth Dissection Animation: plays every time user triggers a cut!
  const performAnimatedCut = () => {
    if (hasCompletedCut) return;
    setIsDraggingScalpel(true);
    soundManager.playDoorSlide();

    const startTime = Date.now();
    const duration = 1100;

    const timer = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(100, (elapsed / duration) * 100);
      setCutProgress(progress);
      setScalpelY(15 + progress * 0.75);

      if (Math.floor(progress) % 25 === 0 && progress > 5) {
        soundManager.playClick();
      }

      if (progress >= 100) {
        clearInterval(timer);
        setIsDraggingScalpel(false);
        setHasCompletedCut(true);
        soundManager.playChimeSuccess();
        confetti({ particleCount: 75, spread: 85, origin: { y: 0.5 } });
      }
    }, 16);
  };

  // Calculate dynamic peeling transforms directly from cutProgress
  // As cutProgress goes 0 -> 100%, the petals/sheaths curl open!
  const peelTranslateX = (cutProgress / 100) * 120;
  const peelRotation = (cutProgress / 100) * 26;
  const peelOpacity = 1 - (cutProgress / 100) * 0.12;

  return (
    <div className="flex-1 flex flex-col gap-3 min-h-0 select-none font-mono">
      
      {/* Top Friendly Guidance Bar */}
      <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-purple-500/30 flex flex-wrap items-center justify-between gap-3 shadow-xl backdrop-blur-md">
        
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-950/80 border border-purple-500/50">
            <Flower2 className="w-5 h-5 text-purple-400 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                Hands-On Flower Dissection
              </span>
              <span className="text-[10px] bg-purple-950 text-purple-300 border border-purple-600/40 px-2 py-0.5 rounded-full font-bold">
                Step {currentStage + 1} of 3
              </span>
            </div>
            <p className="text-xs text-slate-300 font-sans mt-0.5">
              {currentStageData.friendlyPrompt}
            </p>
          </div>
        </div>

        {/* Step Indicators & Reset */}
        <div className="flex items-center gap-2">
          {stages.map((st, idx) => (
            <button
              key={st.id}
              onClick={() => {
                soundManager.playClick();
                setCurrentStage(idx);
                setCutProgress(0);
                setHasCompletedCut(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                currentStage === idx
                  ? 'border-purple-400 bg-purple-950 text-white shadow-lg shadow-purple-500/20'
                  : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
              }`}
            >
              {idx === 0 ? '🌸 1. Petals' : idx === 1 ? '🌾 2. Stamen' : '🔬 3. Ovary'}
            </button>
          ))}

          <button
            onClick={handleResetDissection}
            className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Start Over"
          >
            <RotateCcw className="w-4 h-4 text-purple-400" />
          </button>
        </div>

      </div>

      {/* Main Interactive Stage Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
        
        {/* Left Column (8 cols): Tactile Dissection Tray with REAL-TIME PEELING ANIMATION */}
        <div className="lg:col-span-8 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md p-4 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          
          {/* Header Status & Progress */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
            <span className="font-bold text-purple-300">
              {currentStageData.name}
            </span>
            <div className="flex items-center gap-2 font-bold">
              <span className="text-slate-400">Cut & Peel:</span>
              <span className={cutProgress >= 100 ? 'text-emerald-400' : 'text-purple-400'}>
                {cutProgress.toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Interactive Wax Tray Viewport with Pure Procedural Botanical Flower Dissection */}
          <div
            ref={trayRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className={`relative flex-1 rounded-xl bg-slate-950 border-2 border-purple-500/30 overflow-hidden flex items-center justify-center min-h-[350px] ${
              hasCompletedCut ? 'cursor-default' : 'cursor-crosshair'
            }`}
          >
            {/* Wax Tray Border */}
            <div className="absolute inset-0 pointer-events-none border-8 border-slate-900/90 rounded-lg shadow-inner z-20" />

            {/* Pure Procedural Animated Botanical Flower SVG */}
            <svg viewBox="0 0 500 500" className="w-full h-full max-h-[440px] select-none">
              <defs>
                <linearGradient id="waxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e293b" />
                  <stop offset="50%" stopColor="#0f172a" />
                  <stop offset="100%" stopColor="#020617" />
                </linearGradient>
                <linearGradient id="petalRedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="40%" stopColor="#e11d48" />
                  <stop offset="85%" stopColor="#be123c" />
                  <stop offset="100%" stopColor="#881337" />
                </linearGradient>
                <linearGradient id="stemGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#4ade80" />
                  <stop offset="60%" stopColor="#16a34a" />
                  <stop offset="100%" stopColor="#15803d" />
                </linearGradient>
                <linearGradient id="staminalColGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#e11d48" />
                  <stop offset="40%" stopColor="#fda4af" />
                  <stop offset="80%" stopColor="#be123c" />
                </linearGradient>
                <linearGradient id="ovaryGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#86efac" />
                  <stop offset="50%" stopColor="#22c55e" />
                  <stop offset="100%" stopColor="#15803d" />
                </linearGradient>
                <linearGradient id="pinSteelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f8fafc" />
                  <stop offset="50%" stopColor="#94a3b8" />
                  <stop offset="100%" stopColor="#475569" />
                </linearGradient>
              </defs>

              {/* Paraffin Dissection Wax Board Background */}
              <rect x="15" y="15" width="470" height="470" fill="url(#waxGrad)" stroke="#6b21a8" strokeWidth="3" rx="14" />
              
              {/* Wax Tray mm Guidelines */}
              <g stroke="#334155" strokeWidth="0.6" strokeDasharray="4 4" opacity="0.3">
                {[100, 200, 300, 400].map(y => <line key={y} x1="20" y1={y} x2="480" y2={y} />)}
                {[100, 200, 300, 400].map(x => <line key={x} x1={x} y1="20" x2={x} y2="480" />)}
              </g>

              {/* === REVEALED BOTANICAL ANATOMY === */}
              {/* 1. Pedicel (Flower Stalk) */}
              <path d="M 242 415 Q 248 450 250 475 L 254 475 Q 252 450 246 415 Z" fill="url(#stemGrad)" />

              {/* 2. Receptacle Base Cushion */}
              <path d="M 230 415 Q 244 425 258 415 Q 262 428 244 430 Q 226 428 230 415 Z" fill="#15803d" />
              <polygon points="224,415 218,400 228,410" fill="#16a34a" />
              <polygon points="264,415 270,400 260,410" fill="#16a34a" />

              {/* 3. Green Calyx Cup */}
              <path d="M 226 414 Q 212 370 222 360 Q 244 375 266 360 Q 276 370 262 414 Z" fill="url(#stemGrad)" stroke="#14532d" strokeWidth="1" />

              {/* 4. Superior Ovary (Seed Chamber) */}
              {currentStage === 2 && cutProgress > 30 ? (
                /* Stage 3: Longitudinal section showing 5 locules and glistening white ovules */
                <g>
                  <path d="M 230 405 Q 244 325 258 405 Z" fill="#14532d" stroke="#4ade80" strokeWidth="2" />
                  <rect x="234" y="350" width="20" height="48" fill="#052e16" rx="3" />
                  <line x1="244" y1="350" x2="244" y2="398" stroke="#4ade80" strokeWidth="1.5" />
                  {/* Pearlescent Baby Ovules */}
                  {[
                    { x: 238, y: 358 }, { x: 250, y: 358 },
                    { x: 238, y: 368 }, { x: 250, y: 368 },
                    { x: 238, y: 378 }, { x: 250, y: 378 },
                    { x: 238, y: 388 }, { x: 250, y: 388 },
                  ].map((ov, oIdx) => (
                    <circle key={oIdx} cx={ov.x} cy={ov.y} r="2.8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="0.8" className="animate-pulse" />
                  ))}
                  <text x="244" y="340" fill="#4ade80" fontSize="10" fontWeight="bold" textAnchor="middle" fontFamily="monospace">Ovules (Baby Seeds)</text>
                </g>
              ) : (
                <path d="M 232 405 Q 244 335 256 405 Z" fill="url(#ovaryGrad)" stroke="#16a34a" strokeWidth="1.5" />
              )}

              {/* 5. Staminal Column & Style */}
              {currentStage >= 1 && cutProgress > 30 ? (
                /* Stage 2/3: Column split open revealing the white style thread */
                <g>
                  <path d="M 238 335 L 238 115" stroke="#be123c" strokeWidth="6" strokeLinecap="round" />
                  <path d="M 250 335 L 250 115" stroke="#be123c" strokeWidth="6" strokeLinecap="round" />
                  <path d="M 244 75 L 244 350" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" filter="drop-shadow(0 0 4px #ffffff)" />
                </g>
              ) : (
                /* Intact Red Staminal Column */
                <path d="M 244 345 L 244 110" stroke="url(#staminalColGrad)" strokeWidth="10" strokeLinecap="round" />
              )}

              {/* 6. Hundreds of Golden Anthers on Springy Filaments */}
              {Array.from({ length: 26 }).map((_, aIdx) => {
                const isLeft = aIdx % 2 === 0;
                const yPos = 120 + (aIdx * 8);
                const filamentLen = 14 + (aIdx % 4) * 2;
                const endX = isLeft ? 244 - filamentLen : 244 + filamentLen;
                return (
                  <g key={aIdx}>
                    <line x1="244" y1={yPos} x2={endX} y2={yPos - 4} stroke="#f43f5e" strokeWidth="1.2" />
                    <ellipse cx={endX} cy={yPos - 4} rx="3.5" ry="2.2" fill="#fbbf24" stroke="#d97706" strokeWidth="0.8" transform={`rotate(${isLeft ? -25 : 25} ${endX} ${yPos - 4})`} />
                  </g>
                );
              })}

              {/* 7. Velvet Crimson 5-Lobed Stigma (Crown) */}
              <g>
                <circle cx="244" cy="70" r="5.5" fill="#881337" stroke="#f43f5e" strokeWidth="1.5" />
                <circle cx="233" cy="78" r="5" fill="#881337" stroke="#f43f5e" strokeWidth="1.5" />
                <circle cx="255" cy="78" r="5" fill="#881337" stroke="#f43f5e" strokeWidth="1.5" />
                <circle cx="237" cy="88" r="4.8" fill="#881337" stroke="#f43f5e" strokeWidth="1.5" />
                <circle cx="251" cy="88" r="4.8" fill="#881337" stroke="#f43f5e" strokeWidth="1.5" />
                <circle cx="244" cy="70" r="1.5" fill="#fda4af" />
                <circle cx="233" cy="78" r="1.5" fill="#fda4af" />
                <circle cx="255" cy="78" r="1.5" fill="#fda4af" />
              </g>

              {/* === PROCEDURAL PEELING PETAL FLAPS === */}
              {currentStage === 0 && (
                <g>
                  {/* Left Scarlet Petals Flap */}
                  <g transform={`translate(${-peelTranslateX}, 0) rotate(${-peelRotation} 220 420)`}>
                    <path d="M 230 415 Q 120 360 85 260 Q 65 155 155 125 Q 235 150 244 260 Z" fill="url(#petalRedGrad)" stroke="#9f1239" strokeWidth="2.5" opacity={peelOpacity} />
                    <path d="M 235 415 Q 150 320 125 220" stroke="#f43f5e" strokeWidth="1.5" opacity="0.6" fill="none" />
                    <path d="M 240 415 Q 190 300 175 180" stroke="#f43f5e" strokeWidth="1.5" opacity="0.6" fill="none" />
                  </g>

                  {/* Right Scarlet Petals Flap */}
                  <g transform={`translate(${peelTranslateX}, 0) rotate(${peelRotation} 268 420)`}>
                    <path d="M 258 415 Q 368 360 403 260 Q 423 155 333 125 Q 253 150 244 260 Z" fill="url(#petalRedGrad)" stroke="#9f1239" strokeWidth="2.5" opacity={peelOpacity} />
                    <path d="M 253 415 Q 338 320 363 220" stroke="#f43f5e" strokeWidth="1.5" opacity="0.6" fill="none" />
                    <path d="M 248 415 Q 298 300 313 180" stroke="#f43f5e" strokeWidth="1.5" opacity="0.6" fill="none" />
                  </g>
                </g>
              )}

              {/* DISSECTION STEEL PINS (Drop when cut is >= 85%) */}
              {cutProgress >= 85 && (
                <g>
                  <g className="animate-in zoom-in duration-300">
                    <ellipse cx="75" cy="275" rx="14" ry="4" fill="#000000" opacity="0.5" />
                    <line x1="60" y1="210" x2="75" y2="275" stroke="url(#pinSteelGrad)" strokeWidth="3.5" strokeLinecap="round" />
                    <circle cx="60" cy="210" r="7" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" filter="drop-shadow(0 0 6px #38bdf8)" />
                  </g>
                  <g className="animate-in zoom-in duration-300">
                    <ellipse cx="415" cy="275" rx="14" ry="4" fill="#000000" opacity="0.5" />
                    <line x1="430" y1="210" x2="415" y2="275" stroke="url(#pinSteelGrad)" strokeWidth="3.5" strokeLinecap="round" />
                    <circle cx="430" cy="210" r="7" fill="#38bdf8" stroke="#ffffff" strokeWidth="2" filter="drop-shadow(0 0 6px #38bdf8)" />
                  </g>
                </g>
              )}

              {/* INCISION LINE & SCALPEL */}
              {!hasCompletedCut && (
                <g>
                  <line x1="244" y1="90" x2="244" y2="420" stroke="#f43f5e" strokeWidth="2" strokeDasharray="5 5" />
                  <line x1="244" y1="90" x2="244" y2={90 + (cutProgress / 100) * 330} stroke="#fbbf24" strokeWidth="3" filter="drop-shadow(0 0 8px #f59e0b)" />

                  {/* Scalpel Blade following cut */}
                  {(() => {
                    const bladeY = 90 + (cutProgress / 100) * 330;
                    return (
                      <g transform={`translate(244, ${bladeY})`}>
                        <polygon points="0,0 22,-30 18,-34 -4,-4" fill="url(#pinSteelGrad)" stroke="#e2e8f0" strokeWidth="1" filter="drop-shadow(0 4px 10px rgba(0,0,0,0.8))" />
                        <polygon points="18,-34 50,-80 44,-84 14,-38" fill="#d97706" stroke="#b45309" strokeWidth="1" />
                        <circle cx="0" cy="0" r="4" fill="#fbbf24" className="animate-ping" />
                      </g>
                    );
                  })()}
                </g>
              )}
            </svg>

            {/* Revealed Anatomy Alert Badge */}
            {cutProgress > 40 && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 px-3.5 py-1.5 rounded-full bg-slate-950/90 border border-emerald-400 text-emerald-300 text-xs font-bold shadow-2xl backdrop-blur-md flex items-center gap-2 animate-bounce z-30">
                <Sparkles className="w-4 h-4 text-emerald-400" />
                <span>Revealed: {currentStageData.revealName}!</span>
              </div>
            )}

            {/* Clickable Organ Callout Badges on Revealed Anatomy */}
            {cutProgress > 50 && (
              <div className="absolute inset-0 pointer-events-none z-30">
                {currentStageData.organs.map((orgKey, idx) => {
                  const organ = organData[orgKey];
                  if (!organ) return null;
                  const positions = [
                    { x: 28, y: 30 },
                    { x: 50, y: 55 },
                    { x: 72, y: 35 },
                    { x: 50, y: 82 },
                  ];
                  const pos = positions[idx % positions.length];
                  return (
                    <button
                      key={orgKey}
                      onClick={() => {
                        soundManager.playClick();
                        setSelectedOrgan(orgKey);
                      }}
                      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                      className={`absolute pointer-events-auto -translate-x-1/2 -translate-y-1/2 px-3 py-1 rounded-full text-xs font-bold shadow-2xl backdrop-blur-md border transition-all ${
                        selectedOrgan === orgKey
                          ? 'border-purple-400 bg-purple-600 text-white scale-110 shadow-[0_0_15px_rgba(168,85,247,0.8)]'
                          : 'border-slate-700 bg-slate-950/85 text-slate-300 hover:border-purple-400'
                      }`}
                    >
                      {organ.name}
                    </button>
                  );
                })}
              </div>
            )}

          </div>

          {/* Bottom Bar: Action to proceed to next stage & Trigger Animation Button */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800 flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2">
              {!hasCompletedCut && (
                <button
                  onClick={performAnimatedCut}
                  disabled={isDraggingScalpel}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-purple-500/25 transition-all active:scale-95 disabled:opacity-50"
                  title="Watch clean scientific incision animation"
                >
                  <Scissors className="w-4 h-4 fill-current" /> ✂️ Cut with Scalpel (Animate)
                </button>
              )}
              <span className="text-slate-400 text-[11px]">
                {hasCompletedCut 
                  ? 'Incision complete! Click organs to inspect.' 
                  : 'Or drag down with mouse along the dotted seam.'}
              </span>
            </div>

            {hasCompletedCut && (
              <button
                onClick={handleNextStage}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-fuchsia-600 hover:from-purple-400 hover:to-fuchsia-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-purple-500/25 transition-all animate-bounce"
              >
                <span>{currentStageData.nextActionText}</span>
              </button>
            )}
          </div>

        </div>

        {/* Right Column (4 cols): Human-Friendly Botanical Explanations */}
        <div className="lg:col-span-4 flex flex-col gap-3 min-h-0 overflow-y-auto pr-1">
          
          {/* Organ Discovery Card */}
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-purple-500/30 shadow-xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <span className="text-[10px] text-purple-400 font-bold uppercase tracking-wider">
                Flower Anatomy Guide
              </span>
              <span className="text-[10px] text-emerald-400 font-bold">Hibiscus Flower</span>
            </div>

            <div>
              <h3 className="text-base font-black text-white">
                {activeOrganInfo.name}
              </h3>
              <span className="text-xs text-purple-300 font-bold block mt-0.5">
                "{activeOrganInfo.funTitle}"
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-[10px] text-slate-400 uppercase font-bold block mb-1">
                How It Works in Nature:
              </span>
              <p className="text-xs text-slate-200 font-sans leading-relaxed">
                {activeOrganInfo.easyExplanation}
              </p>
            </div>
          </div>

          {/* Friendly Science Fun Fact */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-950/60 to-slate-900 border border-purple-500/30 text-xs shadow-xl space-y-2">
            <div className="flex items-center gap-1.5 text-purple-400 font-bold">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Senku's Fun Flower Secret</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
              Did you know? The red Hibiscus flower is both a boy and a girl at the same time! The yellow fluffy powder are the male stamens, and the 5 velvety red tips on top are the female stigmas!
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
