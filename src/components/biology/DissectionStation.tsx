import React, { useState, useRef } from 'react';
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
  Play, 
  Pause, 
  Film, 
  Sliders, 
  Layers,
  ChevronRight,
  Pin,
  Search
} from 'lucide-react';

export const DissectionStation: React.FC = () => {
  // Mode: Interactive Hands-On Cutting vs Predefined Video Demonstration
  const [activeTab, setActiveTab] = useState<'interactive_cut' | 'video_guide'>('interactive_cut');

  // Dissection Stage: 0 = Epicalyx/Calyx & Corolla, 1 = Staminal Column & Sheath, 2 = Ovary Longitudinal Section
  const [currentStage, setCurrentStage] = useState<number>(0);
  
  // Tools: 'scalpel' (knife to cut), 'forceps' (tweezers to peel), 'loupe' (2.5x magnifier), 'pin' (probe)
  const [activeTool, setActiveTool] = useState<'scalpel' | 'forceps' | 'loupe' | 'pin'>('scalpel');
  
  // Real-time Cutting State
  const [isCutting, setIsCutting] = useState<boolean>(false);
  const [cutProgress, setCutProgress] = useState<number>(0); // 0 to 100%
  const [hasCutCompleted, setHasCutCompleted] = useState<boolean>(false);
  const [isLayerPeeled, setIsLayerPeeled] = useState<boolean>(false);
  const [selectedOrgan, setSelectedOrgan] = useState<string>('petals');

  // Video Demonstration State
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);
  const [videoTimestamp, setVideoTimestamp] = useState<number>(0);
  const [selectedVideoStep, setSelectedVideoStep] = useState<number>(0);

  // Loupe Magnifier position
  const [loupePos, setLoupePos] = useState<{ x: number; y: number } | null>(null);

  const stages = [
    {
      id: 0,
      title: 'Stage 1: Calyx & Corolla Incision (Petal & Sepal Removal)',
      taskPrompt: 'Use your surgical scalpel to make a longitudinal slit down the green calyx and corolla base.',
      cutGuide: { x1: 50, y1: 25, x2: 50, y2: 78, label: 'Longitudinal Incision Line' },
      stageImg: '/assets/flower_stage1.jpg',
      revealedImg: '/assets/flower_stage2.jpg',
      desc: 'Intact Hibiscus rosa-sinensis pinned onto the wax dissection dish. Slicing through the gamosepalous calyx allows forceps to peel away the 5 scarlet petals, exposing the internal reproductive column.',
      organs: ['epicalyx', 'calyx', 'petals', 'pedicel'],
    },
    {
      id: 1,
      title: 'Stage 2: Slitting the Monadelphous Staminal Tube',
      taskPrompt: 'Carefully slit the hollow fused stamen sheath from base to apex to expose the inner style.',
      cutGuide: { x1: 48, y1: 30, x2: 48, y2: 80, label: 'Staminal Sheath Slit Line' },
      stageImg: '/assets/flower_stage2.jpg',
      revealedImg: '/assets/flower_stage3.jpg',
      desc: 'The staminal tube is formed by fused filaments of hundreds of stamens. Slitting it lengthwise with fine needle forceps reveals the delicate, white elongated style running down its core.',
      organs: ['stigma', 'anthers', 'filaments', 'staminal_tube'],
    },
    {
      id: 2,
      title: 'Stage 3: Longitudinal Section (L.S.) of Superior Ovary',
      taskPrompt: 'Slice the swollen green ovary longitudinally with a razor blade to reveal internal locules and ovules.',
      cutGuide: { x1: 50, y1: 32, x2: 50, y2: 72, label: 'Central Longitudinal Razor Cut' },
      stageImg: '/assets/flower_stage3.jpg',
      revealedImg: '/assets/flower_stage3.jpg',
      desc: 'Superior syncarpous pentacarpellary ovary. The longitudinal slice reveals 5 distinct internal chambers (locules) bearing glistening white biseriate ovules in axile placentation.',
      organs: ['ovary_wall', 'locules_ovules', 'style_tube', 'receptacle'],
    },
  ];

  const organData: Record<string, { name: string; system: string; functionTitle: string; desc: string }> = {
    epicalyx: {
      name: 'Epicalyx (Involucre)',
      system: 'Accessory Floral Whorl',
      functionTitle: 'Extra Bud Protection & Photosynthesis',
      desc: 'A whorl of 5 to 7 green, slender, leaf-like bracteoles situated immediately beneath the calyx. Provides supplementary structural defense to delicate inner floral organs during the young bud phase.',
    },
    calyx: {
      name: 'Calyx (5 Sepals)',
      system: 'Protective Floral Whorl',
      functionTitle: 'Gamosepalous Protection & Support',
      desc: 'The outermost true floral whorl composed of 5 green sepals fused at the base (gamosepalous) with valvate aestivation. Synthesizes carbohydrates via photosynthesis and anchors the corolla securely to the floral receptacle.',
    },
    petals: {
      name: 'Corolla (5 Petals)',
      system: 'Attraction & Pollination Whorl',
      functionTitle: 'Visual Attraction & Protection',
      desc: 'Consists of 5 large, free (polypetalous), vibrant scarlet petals showing twisted (contorted) aestivation. The rich anthocyanin pigmentation and nectar glands at the base attract avian and insect pollinators like butterflies and honeybees.',
    },
    pedicel: {
      name: 'Floral Pedicel',
      system: 'Vascular Axis',
      functionTitle: 'Nutrient Transport & Mechanical Support',
      desc: 'The cylindrical green stalk that connects the flower to the plant stem. Houses continuous xylem and phloem vascular bundles transporting water, minerals, and sucrose to the metabolically active floral tissues.',
    },
    stigma: {
      name: '5-Lobed Velvety Stigma',
      system: 'Gynoecium / Pistil Apex',
      functionTitle: 'Pollen Reception & Germination',
      desc: 'The female receptive surface, branching into 5 velvety crimson lobes corresponding to the 5 underlying carpels. Covered with microscopic glandular stigmatic papillae and sticky sugary exudate that hydrates compatible pollen grains to trigger pollen tube growth.',
    },
    anthers: {
      name: 'Monothecous Anthers & Pollen',
      system: 'Androecium (Male Gametophyte Producer)',
      functionTitle: 'Microsporogenesis & Pollen Release',
      desc: 'Each stamen bears a single-lobed (monothecous), reniform (kidney-shaped) golden-yellow anther. At maturity, it dehisces transversely to release thousands of spiny, spheroidal pollen grains specialized for sticking to insect legs.',
    },
    filaments: {
      name: 'Stamen Filaments',
      system: 'Androecium Support',
      functionTitle: 'Anther Flexibility & Positioning',
      desc: 'Short, slender, delicate stalks that branch outward radially from the fused staminal tube, holding each anther outward so passing pollinators readily brush against the pollen sacs.',
    },
    staminal_tube: {
      name: 'Fused Staminal Sheath',
      system: 'Androecium Column',
      functionTitle: 'Style Enclosure & Protection',
      desc: 'The elongated hollow cylinder formed by basal stamen fusion. It acts as a protective conduit shield through which the delicate female style travels upwards from the ovary to the stigma without mechanical damage.',
    },
    ovary_wall: {
      name: 'Superior Ovary Wall (Pericarp)',
      system: 'Gynoecium Base',
      functionTitle: 'Ovule Shielding & Fruit Development',
      desc: 'The fleshy protective outer enclosure of the pentacarpellary, syncarpous ovary. After successful double fertilization, this wall thickens and ripens into a 5-valved capsule fruit.',
    },
    locules_ovules: {
      name: '5 Locules with Axile Ovules',
      system: 'Female Megasporangia',
      functionTitle: 'Egg Cell Development & Seed Formation',
      desc: 'Longitudinal and cross sections clearly reveal 5 internal chambers (locules). Each locule contains numerous biseriate white ovules attached directly to the central axis (axile placentation). Each ovule contains an embryo sac ready for fertilization.',
    },
    style_tube: {
      name: 'Elongated Style',
      system: 'Gynoecium Conduit',
      functionTitle: 'Pollen Tube Pathway to Ovary',
      desc: 'The long, slender, cylindrical central axis passing straight through the staminal tube. Germinating pollen tubes digest their way through transmitting tissue inside this style to reach the ovules in the ovary below.',
    },
    receptacle: {
      name: 'Thalamus / Receptacle',
      system: 'Floral Axis',
      functionTitle: 'Basal Attachment of All Whorls',
      desc: 'The swollen apex of the pedicel upon which all 4 floral whorls (calyx, corolla, androecium, and gynoecium) are hypogynously seated in concentric rings.',
    },
  };

  const videoSteps = [
    {
      id: 0,
      title: 'Step 1: Epicalyx & Calyx Dissection',
      duration: '0:45',
      summary: 'Using fine forceps, tease away the 5-7 slender epicalyx bracteoles. Then insert scalpel tip at the pedicel junction to slit the green tubular calyx.',
      tip: 'Do not penetrate more than 1mm to avoid bruising the delicate ovary nestled inside.',
    },
    {
      id: 1,
      title: 'Step 2: Corolla (Petals) Removal',
      duration: '1:15',
      summary: 'Gently grasp each of the 5 twisted scarlet petals at their narrowed base where they fuse with the staminal column and peel them back sequentially.',
      tip: 'Notice the twisted (contorted) petal overlap in the intact flower before removing.',
    },
    {
      id: 2,
      title: 'Step 3: Longitudinal Slit of Staminal Column',
      duration: '2:10',
      summary: 'Under magnification, insert the needle point into the base of the staminal column. Guide the needle or scalpel blade upwards to split the fused filament tube.',
      tip: 'Peel the split sheath gently with watchmaker forceps to reveal the glistening white style.',
    },
    {
      id: 3,
      title: 'Step 4: Longitudinal Section (L.S.) of Ovary',
      duration: '3:30',
      summary: 'Place the isolated superior ovary onto a clean glass slide. Hold it firmly with forceps and use a fresh razor blade to make one clean vertical cut straight down the center.',
      tip: 'Add a single drop of water to prevent the delicate ovules from dehydrating.',
    },
    {
      id: 4,
      title: 'Step 5: Locules & Axile Placentation Examination',
      duration: '4:45',
      summary: 'Inspect under 10x lens: observe the 5 distinct chambers (locules) and rows of pearly white ovules attached along the central column axis (axile placentation).',
      tip: 'Count the 5 stigmas above and the 5 locules below to confirm pentacarpellary symmetry!',
    },
  ];

  // Handle Drag-to-Cut Scalpel Interaction
  const handleCutMouseDown = () => {
    if (activeTool !== 'scalpel' || hasCutCompleted) return;
    setIsCutting(true);
    soundManager.playDoorSlide();
  };

  const handleCutMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isCutting || hasCutCompleted) return;
    
    setCutProgress((prev) => {
      const next = Math.min(100, prev + 2.5);
      if (next >= 100) {
        setIsCutting(false);
        setHasCutCompleted(true);
        soundManager.playChimeSuccess();
        confetti({ particleCount: 60, spread: 70, origin: { x: 0.5, y: 0.5 } });
      }
      return next;
    });
  };

  const handleCutMouseUp = () => {
    setIsCutting(false);
  };

  const handlePeelLayer = () => {
    soundManager.playGlassClink();
    setIsLayerPeeled(true);
    if (currentStage < stages.length - 1) {
      setTimeout(() => {
        setCurrentStage((prev) => prev + 1);
        setCutProgress(0);
        setHasCutCompleted(false);
        setIsLayerPeeled(false);
      }, 750);
    }
  };

  const handleResetDissection = () => {
    soundManager.playClick();
    setCurrentStage(0);
    setCutProgress(0);
    setHasCutCompleted(false);
    setIsLayerPeeled(false);
    setSelectedOrgan('petals');
  };

  const currentStageData = stages[currentStage];
  const activeOrganInfo = organData[selectedOrgan] || organData['petals'];

  return (
    <div className="flex-1 flex flex-col gap-3 min-h-0 select-none font-mono">
      
      {/* Top Controls & Navigation Bar */}
      <div className="p-3 rounded-2xl bg-slate-900/90 border border-purple-500/30 flex flex-wrap items-center justify-between gap-3 shadow-xl backdrop-blur-md">
        
        {/* Dissection Mode Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
            <Flower2 className="w-4 h-4 text-purple-400" />
            Dissection Mode:
          </span>
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-700">
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('interactive_cut');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                activeTab === 'interactive_cut'
                  ? 'bg-purple-600 text-white font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Scissors className="w-3.5 h-3.5" /> Hands-On Scalpel Cut
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTab('video_guide');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 ${
                activeTab === 'video_guide'
                  ? 'bg-purple-600 text-white font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Film className="w-3.5 h-3.5" /> Video Demonstration Lab
            </button>
          </div>
        </div>

        {/* Stage Steps Indicator */}
        <div className="flex items-center gap-1.5">
          {stages.map((st, idx) => (
            <button
              key={st.id}
              onClick={() => {
                soundManager.playClick();
                setCurrentStage(idx);
                setCutProgress(0);
                setHasCutCompleted(false);
                setIsLayerPeeled(false);
              }}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                currentStage === idx
                  ? 'border-purple-400 bg-purple-950/80 text-purple-200 shadow'
                  : 'border-slate-800 bg-slate-950/50 text-slate-500 hover:text-slate-300'
              }`}
            >
              Stage {idx + 1}
            </button>
          ))}
          <button
            onClick={handleResetDissection}
            className="p-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white ml-1"
            title="Reset Dissection"
          >
            <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
          </button>
        </div>

      </div>

      {/* =========================================================================
          MODE A: HANDS-ON SCALPEL DISSECTION OPERATING TABLE
          ========================================================================= */}
      {activeTab === 'interactive_cut' && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
          
          {/* Left Column (8 cols): Interactive Wax Tray Operating Stage */}
          <div className="lg:col-span-8 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md p-4 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            
            {/* Header Stage Status */}
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
              <span className="font-bold text-purple-300 uppercase tracking-wider">
                {currentStageData.title}
              </span>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">Cut Progress:</span>
                <span className="font-bold text-emerald-400">{cutProgress.toFixed(0)}%</span>
              </div>
            </div>

            {/* Task Prompt Guide Banner */}
            <div className="mb-2 p-2.5 rounded-xl bg-purple-950/50 border border-purple-500/30 text-xs text-purple-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scissors className="w-4 h-4 text-purple-400 animate-pulse" />
                <span>{currentStageData.taskPrompt}</span>
              </div>
              {hasCutCompleted && !isLayerPeeled && (
                <button
                  onClick={handlePeelLayer}
                  className="px-3 py-1 rounded-lg bg-gradient-to-r from-emerald-500 to-green-600 text-slate-950 font-black text-xs uppercase tracking-wider animate-bounce shadow-lg"
                >
                  Peel Open Tissue Layer →
                </button>
              )}
            </div>

            {/* Visual Operating Tray Viewport */}
            <div
              onMouseDown={handleCutMouseDown}
              onMouseMove={handleCutMouseMove}
              onMouseUp={handleCutMouseUp}
              className={`relative flex-1 rounded-xl bg-slate-950 border border-purple-500/20 overflow-hidden flex items-center justify-center min-h-[320px] ${
                activeTool === 'scalpel' ? 'cursor-crosshair' : 'cursor-default'
              }`}
            >
              {/* Macro Specimen Image */}
              <img
                src={isLayerPeeled ? currentStageData.revealedImg : currentStageData.stageImg}
                alt="Hibiscus Dissection Practical Stage"
                className={`w-full h-full object-contain pointer-events-none transition-all duration-700 ${
                  isLayerPeeled ? 'scale-105 filter brightness-110' : ''
                }`}
              />

              {/* Incision Line Guide Overlay */}
              {!hasCutCompleted && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div
                    style={{
                      left: `${currentStageData.cutGuide.x1}%`,
                      top: `${currentStageData.cutGuide.y1}%`,
                      height: `${currentStageData.cutGuide.y2 - currentStageData.cutGuide.y1}%`,
                    }}
                    className="absolute w-1 border-r-2 border-dashed border-rose-400/80 animate-pulse"
                  >
                    {/* Progress Indicator Cut */}
                    <div
                      style={{ height: `${cutProgress}%` }}
                      className="w-full bg-rose-500 shadow-[0_0_12px_#f43f5e]"
                    />
                  </div>

                  {/* Cut Instruction Floating Pill */}
                  <div
                    style={{
                      left: `${currentStageData.cutGuide.x1 + 3}%`,
                      top: `${(currentStageData.cutGuide.y1 + currentStageData.cutGuide.y2) / 2}%`,
                    }}
                    className="absolute px-2.5 py-1 rounded-lg bg-slate-950/90 border border-rose-500/60 text-[10px] text-rose-300 font-bold shadow-xl backdrop-blur-md"
                  >
                    Hold & Drag Scalpel Down
                  </div>
                </div>
              )}

              {/* Sliced Open Seam when Completed */}
              {hasCutCompleted && !isLayerPeeled && (
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div className="px-4 py-2 rounded-xl bg-emerald-950/90 border border-emerald-400 text-emerald-200 text-xs font-black shadow-2xl backdrop-blur-md animate-bounce">
                    ✓ INCISION COMPLETE! Click "Peel Open Tissue Layer" above!
                  </div>
                </div>
              )}

              {/* Organ Identification Hotspots */}
              <div className="absolute inset-0 pointer-events-none">
                {currentStageData.organs.map((orgKey, idx) => {
                  const organ = organData[orgKey];
                  if (!organ) return null;
                  const offsets = [
                    { x: 30, y: 35 },
                    { x: 50, y: 55 },
                    { x: 70, y: 40 },
                    { x: 45, y: 75 },
                  ];
                  const pos = offsets[idx % offsets.length];
                  return (
                    <button
                      key={orgKey}
                      onClick={(e) => {
                        e.stopPropagation();
                        soundManager.playClick();
                        setSelectedOrgan(orgKey);
                      }}
                      style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                      className={`absolute pointer-events-auto -translate-x-1/2 -translate-y-1/2 px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider shadow-xl backdrop-blur-md border transition-all ${
                        selectedOrgan === orgKey
                          ? 'border-purple-400 bg-purple-600 text-white scale-110 shadow-[0_0_15px_rgba(168,85,247,0.8)]'
                          : 'border-slate-700 bg-slate-950/80 text-slate-300 hover:border-purple-400'
                      }`}
                    >
                      {organ.name}
                    </button>
                  );
                })}
              </div>

            </div>

            {/* Dissection Tool Tray */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800 flex-wrap gap-2 text-xs">
              <span className="text-slate-400 font-bold uppercase tracking-wider">
                Instruments:
              </span>
              <div className="flex items-center gap-1.5">
                {[
                  { id: 'scalpel', label: 'Dissecting Scalpel', icon: <Scissors className="w-3.5 h-3.5" /> },
                  { id: 'forceps', label: 'Fine Watchmaker Forceps', icon: <Pin className="w-3.5 h-3.5" /> },
                  { id: 'loupe', label: '2.5× Loupe Lens', icon: <Search className="w-3.5 h-3.5" /> },
                ].map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      soundManager.playClick();
                      setActiveTool(t.id as any);
                    }}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                      activeTool === t.id
                        ? 'border-purple-400 bg-purple-950/80 text-purple-200 shadow-md ring-1 ring-purple-400'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                    }`}
                  >
                    {t.icon}
                    <span>{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column (4 cols): Anatomical Detail & Dissection Analysis */}
          <div className="lg:col-span-4 flex flex-col gap-3 min-h-0 overflow-y-auto pr-1">
            
            {/* Selected Organ Botanical Card */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-purple-500/30 shadow-xl space-y-2">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-[10px] text-purple-400 uppercase font-bold tracking-widest">
                  {activeOrganInfo.system}
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">Taxon: Malvaceae</span>
              </div>
              
              <h3 className="text-base font-black text-white tracking-wide">
                {activeOrganInfo.name}
              </h3>
              
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 block mb-0.5 uppercase font-bold">
                  Diagnostic Function:
                </span>
                <p className="text-xs text-purple-200 font-sans leading-relaxed">
                  {activeOrganInfo.functionTitle}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
                <span className="text-[10px] text-slate-400 block mb-0.5 uppercase font-bold">
                  Morphological & Anatomical Description:
                </span>
                <p className="text-xs text-slate-300 font-sans leading-relaxed">
                  {activeOrganInfo.desc}
                </p>
              </div>
            </div>

            {/* Botanical Floral Formula Card for STEM Students */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-purple-950/60 to-slate-900 border border-purple-500/30 text-xs shadow-xl space-y-2">
              <span className="font-bold text-purple-400 uppercase tracking-wider block">
                Hibiscus Floral Formula (NCERT):
              </span>
              <div className="p-2 rounded-lg bg-slate-950 border border-purple-500/30 text-center font-bold text-purple-300 text-xs">
                ⊕ ⚥ Epi₅₋₇ K₍₅₎ C₅ A₍∞₎ <u>G</u>₍₅₎
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                Actinomorphic (radial symmetry), bisexual, 5-7 epicalyx bracts, 5 gamosepalous sepals, 5 free twisted petals, monadelphous infinite stamens, 5 fused superior carpels with axile placentation.
              </p>
            </div>

          </div>

        </div>
      )}

      {/* =========================================================================
          MODE B: PREDEFINED HIGH-DEFINITION VIDEO DEMONSTRATION LAB
          ========================================================================= */}
      {activeTab === 'video_guide' && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
          
          {/* Left Column (8 cols): Video Player Interface */}
          <div className="lg:col-span-8 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md p-4 flex flex-col justify-between shadow-2xl relative overflow-hidden">
            
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 text-xs">
              <span className="font-bold text-purple-300 uppercase tracking-wider flex items-center gap-2">
                <Film className="w-4 h-4 text-purple-400" />
                Predefined Laboratory Dissection Video Guide
              </span>
              <span className="text-slate-400">Step {selectedVideoStep + 1} of 5</span>
            </div>

            {/* Simulated High-Definition Video Canvas */}
            <div className="relative flex-1 rounded-xl bg-slate-950 border border-purple-500/30 overflow-hidden flex items-center justify-center min-h-[340px]">
              {/* Macro Dissection Demonstration Imagery */}
              <img
                src={
                  selectedVideoStep === 0 
                    ? '/assets/flower_stage1.jpg' 
                    : selectedVideoStep <= 2 
                    ? '/assets/flower_stage2.jpg' 
                    : '/assets/flower_stage3.jpg'
                }
                alt="Demonstration Video Frame"
                className="w-full h-full object-cover filter brightness-95"
              />

              {/* Video Overlay Tint & Play Watermark */}
              <div className="absolute inset-0 bg-slate-950/30 flex items-center justify-center">
                <button
                  onClick={() => {
                    soundManager.playClick();
                    setIsVideoPlaying(!isVideoPlaying);
                  }}
                  className="w-16 h-16 rounded-full bg-purple-600/90 hover:bg-purple-500 text-white flex items-center justify-center shadow-2xl transition-all scale-100 hover:scale-110"
                >
                  {isVideoPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                </button>
              </div>

              {/* Bottom Video Progress Scrubber */}
              <div className="absolute bottom-3 left-4 right-4 z-20 flex items-center justify-between gap-3 px-4 py-2 rounded-xl bg-slate-950/90 border border-slate-800 text-xs">
                <span className="text-purple-400 font-bold">{videoSteps[selectedVideoStep].duration}</span>
                <div className="flex-1 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${((selectedVideoStep + 1) / 5) * 100}%` }}
                    className="h-full bg-purple-500 transition-all duration-300"
                  />
                </div>
                <span className="text-slate-400">5:00 Total</span>
              </div>
            </div>

            {/* Video Step Selection Navigation */}
            <div className="grid grid-cols-5 gap-1.5 pt-3 border-t border-slate-800 text-center">
              {videoSteps.map((st, idx) => (
                <button
                  key={st.id}
                  onClick={() => {
                    soundManager.playClick();
                    setSelectedVideoStep(idx);
                  }}
                  className={`p-1.5 rounded-lg text-xs font-bold transition-all border ${
                    selectedVideoStep === idx
                      ? 'border-purple-400 bg-purple-950 text-purple-200 shadow'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                  }`}
                >
                  Step {idx + 1}
                </button>
              ))}
            </div>

          </div>

          {/* Right Column (4 cols): Detailed Practical Step Protocol */}
          <div className="lg:col-span-4 flex flex-col gap-3 min-h-0 overflow-y-auto pr-1">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-purple-500/30 shadow-xl space-y-3">
              <div className="border-b border-slate-800 pb-2">
                <span className="text-[10px] text-purple-400 font-bold uppercase tracking-widest block">
                  Demonstration Protocol:
                </span>
                <h3 className="text-base font-black text-white mt-0.5">
                  {videoSteps[selectedVideoStep].title}
                </h3>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] text-slate-400 font-bold uppercase block mb-1">
                  Procedure:
                </span>
                <p className="text-xs text-slate-200 font-sans leading-relaxed">
                  {videoSteps[selectedVideoStep].summary}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30">
                <span className="text-[10px] text-purple-300 font-bold uppercase block mb-1">
                  Practical Laboratory Tip:
                </span>
                <p className="text-xs text-purple-200 font-sans leading-relaxed">
                  {videoSteps[selectedVideoStep].tip}
                </p>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
