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

  // Calculate dynamic peeling transforms directly from cutProgress
  // As cutProgress goes 0 -> 100%, the left flap curls left and right flap curls right!
  const peelTranslateX = (cutProgress / 100) * 110; // pixels to separate
  const peelRotation = (cutProgress / 100) * 22; // degrees to hinge open
  const peelOpacity = 1 - (cutProgress / 100) * 0.15; // slightly fade edges

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

          {/* Interactive Wax Tray Viewport */}
          <div
            ref={trayRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className={`relative flex-1 rounded-xl bg-slate-950 border-2 border-purple-500/30 overflow-hidden flex items-center justify-center min-h-[340px] ${
              hasCompletedCut ? 'cursor-default' : 'cursor-crosshair'
            }`}
          >
            {/* Wax Tray Border & Insect Pins Texture */}
            <div className="absolute inset-0 pointer-events-none border-8 border-slate-900/90 rounded-lg shadow-inner z-20" />

            {/* BASE LAYER: The Inner Anatomy Revealed As You Peel! */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <img
                src={currentStageData.baseInnerImg}
                alt="Revealed Flower Anatomy"
                className="w-full h-full object-contain filter brightness-105 transition-transform duration-300"
              />

              {/* Glowing Callout Tag for the Revealed Anatomy */}
              {cutProgress > 40 && (
                <div className="absolute top-6 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full bg-slate-950/90 border border-emerald-400 text-emerald-300 text-xs font-bold shadow-2xl backdrop-blur-md flex items-center gap-2 animate-bounce z-10">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span>Revealed: {currentStageData.revealName}!</span>
                </div>
              )}
            </div>

            {/* OVERLAY LAYER: The Outer Petal / Tissue Layer Sliced and Peeling in Real-Time! */}
            <div className="absolute inset-0 flex items-center justify-center p-4 overflow-hidden pointer-events-none">
              
              {/* LEFT HALF OF THE FLOWER (Peels Open to the Left as you cut!) */}
              <div
                style={{
                  clipPath: 'polygon(0% 0%, 50% 0%, 50% 100%, 0% 100%)',
                  transform: `translateX(-${peelTranslateX}px) rotate(-${peelRotation}deg)`,
                  transformOrigin: 'left bottom',
                  opacity: peelOpacity,
                  transition: isDraggingScalpel ? 'none' : 'transform 0.4s ease-out',
                }}
                className="absolute inset-0 flex items-center justify-center p-4 will-change-transform"
              >
                <img
                  src={currentStageData.outerLeftImg}
                  alt="Outer Flower Left Flap"
                  className="w-full h-full object-contain filter brightness-95"
                />
              </div>

              {/* RIGHT HALF OF THE FLOWER (Peels Open to the Right as you cut!) */}
              <div
                style={{
                  clipPath: 'polygon(50% 0%, 100% 0%, 100% 100%, 50% 100%)',
                  transform: `translateX(${peelTranslateX}px) rotate(${peelRotation}deg)`,
                  transformOrigin: 'right bottom',
                  opacity: peelOpacity,
                  transition: isDraggingScalpel ? 'none' : 'transform 0.4s ease-out',
                }}
                className="absolute inset-0 flex items-center justify-center p-4 will-change-transform"
              >
                <img
                  src={currentStageData.outerRightImg}
                  alt="Outer Flower Right Flap"
                  className="w-full h-full object-contain filter brightness-95"
                />
              </div>

            </div>

            {/* CUTTING GUIDE: Dotted Incision Seam when not yet cut */}
            {!hasCompletedCut && (
              <div className="absolute inset-0 pointer-events-none flex flex-col items-center justify-center z-20">
                {/* Dotted Vertical Incision Seam */}
                <div className="h-4/6 w-0.5 border-r-2 border-dashed border-rose-400/90 relative">
                  {/* Glowing Incision Trench as Scalpel moves */}
                  <div
                    style={{ height: `${cutProgress}%` }}
                    className="w-1 bg-gradient-to-b from-rose-500 to-amber-400 shadow-[0_0_15px_#f43f5e] transition-all"
                  />
                </div>

                {/* Friendly Drag Callout Bubble */}
                {cutProgress === 0 && (
                  <div className="mt-3 px-4 py-2 rounded-2xl bg-purple-950/90 border border-purple-400 text-purple-200 text-xs font-bold shadow-2xl backdrop-blur-md flex items-center gap-2 animate-bounce">
                    <Scissors className="w-4 h-4 text-purple-400" />
                    <span>Click & Drag down with your mouse to cut and peel!</span>
                  </div>
                )}
              </div>
            )}

            {/* Moving Scalpel Blade Icon following mouse drag */}
            {isDraggingScalpel && (
              <div
                style={{
                  top: `${scalpelY}%`,
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                }}
                className="absolute pointer-events-none z-30 transition-transform"
              >
                <div className="p-2 rounded-full bg-rose-600/90 text-white shadow-[0_0_20px_#f43f5e] animate-pulse">
                  <Scissors className="w-5 h-5 fill-current" />
                </div>
              </div>
            )}

            {/* DISSECTION STEEL PINS (Appear when cut is complete to pin flaps down!) */}
            {hasCompletedCut && (
              <div className="absolute inset-0 pointer-events-none z-20">
                {/* Left Pin */}
                <div className="absolute top-1/3 left-16 flex items-center gap-1 animate-in zoom-in duration-300">
                  <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_#38bdf8]" />
                  <span className="text-[10px] text-cyan-300 font-bold bg-slate-950/80 px-1.5 py-0.5 rounded border border-cyan-500/40">
                    Pinned
                  </span>
                </div>
                {/* Right Pin */}
                <div className="absolute top-1/3 right-16 flex items-center gap-1 animate-in zoom-in duration-300">
                  <span className="text-[10px] text-cyan-300 font-bold bg-slate-950/80 px-1.5 py-0.5 rounded border border-cyan-500/40">
                    Pinned
                  </span>
                  <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_#38bdf8]" />
                </div>
              </div>
            )}

            {/* Clickable Organ Callouts on Revealed Anatomy */}
            {cutProgress > 60 && (
              <div className="absolute inset-0 pointer-events-none z-30">
                {currentStageData.organs.map((orgKey, idx) => {
                  const organ = organData[orgKey];
                  if (!organ) return null;
                  const positions = [
                    { x: 30, y: 35 },
                    { x: 50, y: 55 },
                    { x: 70, y: 40 },
                    { x: 50, y: 80 },
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

          {/* Bottom Bar: Action to proceed to next stage */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800 flex-wrap gap-2 text-xs">
            <span className="text-slate-400">
              {hasCompletedCut 
                ? 'Great job! The petals are completely peeled open.' 
                : 'Click and drag down to peel the petals open!'}
            </span>

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
