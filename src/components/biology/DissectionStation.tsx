import React, { useState } from 'react';
import { soundManager } from '../../audio/SoundManager';
import { Scissors, Pin, RotateCcw, Sparkles, CheckCircle2, Eye, ZoomIn, ZoomOut, Info, Flower2, Search } from 'lucide-react';

export const DissectionStation: React.FC = () => {
  const [currentLayer, setCurrentLayer] = useState<number>(0);
  const [selectedPart, setSelectedPart] = useState<string>('petals');
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [activeTool, setActiveTool] = useState<'inspect' | 'scalpel' | 'magnifier'>('inspect');
  const [loupePos, setLoupePos] = useState<{ x: number; y: number } | null>(null);

  const layers = [
    {
      id: 0,
      title: 'Stage 1: Complete Floral Morphology & Calyx/Epicalyx',
      stageImg: '/assets/flower_stage1.jpg',
      description: 'Macro photographic examination of intact Hibiscus rosa-sinensis pinned onto a black paraffin wax tray with steel insect pins. Observe the green pedicel, 5-7 epicalyx bracts, protective gamosepalous calyx, and 5 twisted scarlet petals.',
      hotspots: [
        { id: 'epicalyx', label: 'Epicalyx Bracteoles', x: 26, y: 72 },
        { id: 'calyx', label: 'Calyx (Sepals)', x: 33, y: 64 },
        { id: 'petals', label: 'Corolla (Petals)', x: 52, y: 38 },
        { id: 'staminal_column', label: 'Staminal Column', x: 62, y: 55 },
        { id: 'pedicel', label: 'Floral Pedicel', x: 18, y: 82 },
        { id: 'scalpel', label: 'Dissecting Scalpel', x: 80, y: 30 },
      ],
    },
    {
      id: 1,
      title: 'Stage 2: Androecium & Monadelphous Staminal Column',
      stageImg: '/assets/flower_stage2.jpg',
      description: 'Petals dissected away using fine forceps. The central reproductive staminal column is isolated: hundreds of golden-yellow pollen-bearing anthers arise on short filaments from the monadelphous tube, crowned by 5 velvety crimson stigma lobes.',
      hotspots: [
        { id: 'stigma', label: '5-Lobed Stigma', x: 58, y: 22 },
        { id: 'anthers', label: 'Yellow Anthers & Pollen', x: 48, y: 46 },
        { id: 'filaments', label: 'Stamen Filaments', x: 42, y: 56 },
        { id: 'staminal_tube', label: 'Fused Staminal Tube', x: 46, y: 68 },
        { id: 'needle', label: 'Dissecting Needle', x: 78, y: 62 },
      ],
    },
    {
      id: 2,
      title: 'Stage 3: Longitudinal Section (L.S.) of Ovary & Ovules',
      stageImg: '/assets/flower_stage3.jpg',
      description: 'Superior ovary sliced longitudinally with a razor blade on a glass slide. Reveals the 5 distinct chambers (locules) containing glistening white ovules arranged in axile placentation along the central axis, leading up into the hollow style.',
      hotspots: [
        { id: 'ovary_wall', label: 'Ovary Wall (Pericarp)', x: 40, y: 48 },
        { id: 'locules_ovules', label: 'Locules & Ovules', x: 50, y: 52 },
        { id: 'style_tube', label: 'Style Emerging from Ovary', x: 58, y: 35 },
        { id: 'receptacle', label: 'Thalamus / Receptacle', x: 32, y: 72 },
        { id: 'slide', label: 'Glass Mounting Slide', x: 74, y: 68 },
      ],
    },
  ];

  const organData: Record<string, { name: string; system: string; functionTitle: string; desc: string }> = {
    epicalyx: {
      name: 'Epicalyx (Involucre)',
      system: 'Accessory Floral Whorl',
      functionTitle: 'Extra Bud Protection & Photosynthesis',
      desc: 'A whorl of 5 to 7 green, slender, leaf-like bracteoles situated immediately beneath the calyx. It provides supplementary structural defense to delicate inner floral organs during the young bud phase.',
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
    staminal_column: {
      name: 'Staminal Column (Monadelphous)',
      system: 'Male Reproductive Structure',
      functionTitle: 'Pollen Elevation & Display',
      desc: 'A signature diagnostic feature of Malvaceae: filaments of hundreds of stamens fuse completely into a tubular sheath surrounding the inner style. This elevates anthers into the optimal flight path of visiting pollinators.',
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
    scalpel: {
      name: 'Dissecting Scalpel & Forceps',
      system: 'Laboratory Practical Instrument',
      functionTitle: 'Delicate Tissue Incision & Separation',
      desc: 'High-precision surgical stainless steel blades and watchmaker forceps used in botanical practicals to cleanly peel petals and slit the staminal tube without bruising the inner style or ovary.',
    },
    needle: {
      name: 'Dissecting Needle',
      system: 'Laboratory Practical Instrument',
      functionTitle: 'Micro-manipulation & Slitting',
      desc: 'A fine steel needle mounted on a brass chuck handle. Used to tease apart individual stamens, separate the style from the staminal sheath, and mount sections onto glass slides.',
    },
    slide: {
      name: 'Glass Slide & Cover Slip',
      system: 'Microscopic Preparation',
      functionTitle: 'Tissue Examination Under Transmitted Light',
      desc: 'Thin optical glass slide used with glycerin or water mount to inspect the ovary locules and pollen grains under compound microscopes without drying out.',
    },
  };

  const currentStage = layers[currentLayer];
  const activeOrgan = organData[selectedPart] || organData['petals'];

  const handleMouseMoveLoupe = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeTool !== 'magnifier') return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setLoupePos({ x, y });
  };

  return (
    <div className="relative w-full h-full flex flex-col lg:flex-row gap-4 select-none">
      
      {/* LEFT/CENTER: Interactive Dissection Dish */}
      <div className="flex-1 flex flex-col stone-panel rounded-2xl border border-amber-600/40 p-3 sm:p-4 shadow-2xl overflow-hidden backdrop-blur-md">
        
        {/* Dissection Tray Toolbar */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-stone-800 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
              <Flower2 className="w-5 h-5 animate-pulse" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm sm:text-base text-amber-200 font-serif">
                  Hibiscus Flower Dissection Practical
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950/80 text-emerald-400 border border-emerald-700/50">
                  Hibiscus rosa-sinensis
                </span>
              </div>
              <p className="text-[11px] text-stone-400 font-serif italic">
                STEM Botanical Laboratory • NCERT / Practical Curriculum
              </p>
            </div>
          </div>

          {/* Practical Dissection Tool Selector */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-stone-900 border border-stone-700/80">
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTool('inspect');
                setLoupePos(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-serif font-bold flex items-center gap-1.5 transition-all ${
                activeTool === 'inspect'
                  ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
              title="Pin & Inspect Mode"
            >
              <Pin className="w-3.5 h-3.5" /> Pin Probe
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTool('scalpel');
                setLoupePos(null);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-serif font-bold flex items-center gap-1.5 transition-all ${
                activeTool === 'scalpel'
                  ? 'bg-amber-500 text-stone-950 shadow-md font-black'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
              title="Dissection Incision Mode"
            >
              <Scissors className="w-3.5 h-3.5" /> Scalpel
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setActiveTool('magnifier');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-serif font-bold flex items-center gap-1.5 transition-all ${
                activeTool === 'magnifier'
                  ? 'bg-cyan-500 text-stone-950 shadow-md font-black'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
              title="2.5x Botanical Hand Lens Loupe"
            >
              <Search className="w-3.5 h-3.5" /> 2.5× Loupe
            </button>
          </div>
        </div>

        {/* Layer / Dissection Stage Progress Buttons */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          {layers.map((layer, idx) => (
            <button
              key={layer.id}
              onClick={() => {
                soundManager.playClick();
                setCurrentLayer(idx);
                // default select appropriate part for layer
                if (idx === 0) setSelectedPart('petals');
                if (idx === 1) setSelectedPart('stigma');
                if (idx === 2) setSelectedPart('locules_ovules');
              }}
              className={`p-2.5 rounded-xl border text-left transition-all relative overflow-hidden ${
                currentLayer === idx
                  ? 'border-amber-400 bg-amber-950/40 text-amber-200 shadow-lg'
                  : 'border-stone-800 bg-stone-900/60 text-stone-400 hover:border-stone-700 hover:text-stone-200'
              }`}
            >
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[10px] font-mono uppercase tracking-widest font-black text-amber-400">
                  Stage {idx + 1}
                </span>
                {currentLayer === idx && (
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                )}
              </div>
              <span className="text-xs font-serif font-bold block truncate">
                {idx === 0 && '1. Intact Flower'}
                {idx === 1 && '2. Staminal Tube'}
                {idx === 2 && '3. Ovary & Ovules'}
              </span>
            </button>
          ))}
        </div>

        {/* Specimen Viewport (Wax Dissection Dish) */}
        <div
          onMouseMove={handleMouseMoveLoupe}
          onMouseLeave={() => setLoupePos(null)}
          className="relative flex-1 rounded-xl overflow-hidden border border-stone-800 bg-stone-950 flex items-center justify-center group cursor-crosshair min-h-[300px]"
        >
          {/* Real High-Resolution Macro Scientific Photograph */}
          <img
            src={currentStage.stageImg}
            alt={currentStage.title}
            className={`w-full h-full object-cover transition-transform duration-500 ${
              isZoomed ? 'scale-130' : 'scale-100'
            }`}
          />

          {/* Interactive Anatomical Pin Hotspots */}
          {activeTool !== 'magnifier' &&
            currentStage.hotspots.map((pin) => {
              const isSelected = selectedPart === pin.id;
              return (
                <div
                  key={pin.id}
                  style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
                  onClick={() => {
                    soundManager.playGlassClink();
                    setSelectedPart(pin.id);
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer group/pin"
                >
                  {/* Glowing Pin Point */}
                  <div
                    className={`relative w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                      isSelected
                        ? 'bg-amber-400 text-stone-950 ring-4 ring-amber-400/50 scale-125 shadow-[0_0_15px_rgba(245,158,11,0.9)]'
                        : 'bg-stone-900/90 text-amber-300 border border-amber-400/70 hover:scale-120 hover:bg-amber-500 hover:text-stone-950'
                    }`}
                  >
                    <Pin className="w-3.5 h-3.5 rotate-45" />
                  </div>

                  {/* Hotspot Floating Tooltip */}
                  <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-1.5 whitespace-nowrap px-2 py-0.5 rounded-md bg-stone-950/95 border border-amber-500/60 text-amber-200 text-[10px] font-mono font-bold shadow-xl pointer-events-none opacity-0 group-hover/pin:opacity-100 transition-opacity">
                    {pin.label}
                  </div>
                </div>
              );
            })}

          {/* Interactive 2.5x Loupe Magnifier Lens */}
          {activeTool === 'magnifier' && loupePos && (
            <div
              style={{
                left: `${loupePos.x}%`,
                top: `${loupePos.y}%`,
                transform: 'translate(-50%, -50%)',
              }}
              className="absolute w-44 h-44 rounded-full border-4 border-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.8)] overflow-hidden pointer-events-none z-30 bg-stone-950"
            >
              <img
                src={currentStage.stageImg}
                alt="Magnified View"
                style={{
                  position: 'absolute',
                  width: '320%',
                  height: '320%',
                  left: `-${loupePos.x * 2.2}%`,
                  top: `-${loupePos.y * 2.2}%`,
                }}
                className="max-w-none"
              />
              <div className="absolute inset-0 rounded-full border border-white/20 shadow-inner" />
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-slate-950/90 text-[9px] font-mono text-cyan-300 font-bold border border-cyan-500/50">
                2.5× Loupe Focus
              </div>
            </div>
          )}

          {/* Zoom Toggle in Corner */}
          <div className="absolute bottom-3 right-3 z-20 flex items-center gap-1.5 bg-stone-900/90 border border-stone-700/80 rounded-xl p-1 backdrop-blur-md">
            <button
              onClick={() => {
                soundManager.playClick();
                setIsZoomed(!isZoomed);
              }}
              className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
              title={isZoomed ? 'Zoom Out' : 'Zoom In'}
            >
              {isZoomed ? <ZoomOut className="w-4 h-4 text-amber-400" /> : <ZoomIn className="w-4 h-4 text-amber-400" />}
            </button>
          </div>
        </div>

        {/* Stage Description Bar */}
        <div className="mt-3 p-3 rounded-xl bg-stone-900/80 border border-stone-800 text-xs text-stone-300 font-serif leading-relaxed">
          <span className="font-bold text-amber-300 font-mono block mb-0.5">
            {currentStage.title}
          </span>
          {currentStage.description}
        </div>

      </div>

      {/* RIGHT: Anatomical Inspector & Function Analysis */}
      <div className="w-full lg:w-96 flex flex-col gap-3">
        
        {/* Organ Detail Card */}
        <div className="stone-panel rounded-2xl border border-amber-600/40 p-4 shadow-xl backdrop-blur-md flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-stone-800">
              <span className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold">
                Anatomical Structure Inspector
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                NCERT Core Practical
              </span>
            </div>

            {/* Organ Name Header */}
            <h4 className="text-lg font-bold text-amber-100 font-serif mb-1 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-400" />
              {activeOrgan.name}
            </h4>
            <div className="text-xs text-emerald-400 font-mono font-bold mb-3">
              {activeOrgan.system}
            </div>

            {/* Biological Function Box */}
            <div className="p-3 rounded-xl bg-stone-900/90 border border-stone-800 mb-3">
              <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block mb-1 font-bold">
                Primary Physiological Function
              </span>
              <p className="text-xs text-amber-200 font-serif font-bold leading-relaxed">
                {activeOrgan.functionTitle}
              </p>
            </div>

            {/* Comprehensive Anatomical Notes */}
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-stone-400 uppercase tracking-wider block font-bold">
                Detailed Morphological Description
              </span>
              <p className="text-xs text-stone-300 font-serif leading-relaxed">
                {activeOrgan.desc}
              </p>
            </div>
          </div>

          {/* Practical Laboratory Tips */}
          <div className="mt-4 pt-3 border-t border-stone-800/80">
            <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-600/30 text-[11px] font-serif text-amber-200 leading-normal flex items-start gap-2">
              <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-amber-300 font-mono block text-[10px] uppercase">Practical Examination Tip:</strong>
                To view ovule arrangement clearly, cut a transverse section (T.S.) of the ovary with a fresh razor blade into water, mount with a drop of safranin stain, and observe under low power.
              </div>
            </div>
          </div>

        </div>

        {/* Quick Organ Selector Grid */}
        <div className="stone-panel rounded-2xl border border-stone-800 p-3 shadow-xl backdrop-blur-md">
          <span className="text-[10px] font-mono uppercase text-stone-400 font-bold block mb-2">
            Select Floral Part to Inspect:
          </span>
          <div className="grid grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
            {Object.entries(organData).map(([key, data]) => (
              <button
                key={key}
                onClick={() => {
                  soundManager.playClick();
                  setSelectedPart(key);
                }}
                className={`p-1.5 rounded-lg text-left text-[11px] font-serif font-bold transition-all truncate ${
                  selectedPart === key
                    ? 'bg-amber-500 text-stone-950 font-black shadow-md'
                    : 'bg-stone-900/80 text-stone-300 hover:text-white hover:bg-stone-800 border border-stone-800'
                }`}
              >
                {data.name}
              </button>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};