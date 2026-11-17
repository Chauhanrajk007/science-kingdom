import React, { useState } from 'react';
import { SpecimenData } from '../../types/laboratory';
import { soundManager } from '../../audio/SoundManager';
import { ZoomIn, Sliders, Eye, Sun, Info, CheckCircle2 } from 'lucide-react';

interface EyepieceViewProps {
  specimen: SpecimenData;
  onCloseEyepiece: () => void;
}

export const EyepieceView: React.FC<EyepieceViewProps> = ({ specimen, onCloseEyepiece }) => {
  const [magnification, setMagnification] = useState<'4x' | '10x' | '40x' | '100x'>('10x');
  const [focusOffset, setFocusOffset] = useState<number>(15); // 0 is sharpest focus
  const [brightness, setBrightness] = useState<number>(85); // Light condenser %
  const [hoveredOrganelle, setHoveredOrganelle] = useState<string | null>(null);

  const currentMagLevel = specimen.magnificationLevels.find((m) => m.power === magnification) || specimen.magnificationLevels[1];

  const handleMagChange = (power: '4x' | '10x' | '40x' | '100x') => {
    soundManager.playMicroscopeClick();
    setMagnification(power);
  };

  // Blur in pixels based on distance from optimal focus (0)
  const blurPx = Math.abs(focusOffset) * 0.35;

  return (
    <div className="relative w-full h-full flex flex-col items-center justify-between p-4 bg-stone-950 overflow-hidden">
      
      {/* Top Controls Bar */}
      <div className="w-full flex items-center justify-between z-20 stone-panel p-3 rounded-2xl border border-amber-600/50 shadow-xl max-w-4xl backdrop-blur-md">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              soundManager.playClick();
              onCloseEyepiece();
            }}
            className="px-3 py-1.5 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 text-xs font-bold uppercase tracking-wider border border-stone-600 transition-all font-mono"
          >
            ← Slide Stage View
          </button>
          <div>
            <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block font-mono">
              Hand-Crafted Quartz Microscope Eyepiece
            </span>
            <h3 className="font-bold text-sm text-amber-100 font-serif">{specimen.name}</h3>
          </div>
        </div>

        {/* Objective Lens Turret Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-stone-400 uppercase hidden sm:inline font-mono">
            Quartz Lens:
          </span>
          <div className="flex rounded-xl bg-stone-900/90 p-1 border border-stone-700">
            {(['4x', '10x', '40x', '100x'] as const).map((power) => (
              <button
                key={power}
                onClick={() => handleMagChange(power)}
                className={`px-3 py-1 rounded-lg text-xs font-bold font-mono transition-all ${
                  magnification === power
                    ? 'bg-amber-500 text-stone-950 font-black shadow-lg shadow-amber-500/30 scale-105'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                {power}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Eyepiece Viewport (Circular Field of View) */}
      <div className="relative flex-1 flex items-center justify-center my-2 w-full max-w-4xl">
        {/* Brass Eyepiece Circular Mask Container */}
        <div
          className="relative w-[340px] h-[340px] sm:w-[440px] sm:h-[440px] rounded-full border-[14px] border-amber-950 shadow-[0_0_80px_rgba(0,0,0,0.9)_inset,0_0_50px_rgba(245,158,11,0.3)] overflow-hidden flex items-center justify-center transition-all"
          style={{
            backgroundColor: `rgba(240, 248, 255, ${brightness / 120})`,
          }}
        >
          {/* Eyepiece reticle / pointer crosshairs */}
          <div className="absolute inset-0 pointer-events-none z-30 opacity-20 flex items-center justify-center">
            <div className="w-full h-[1px] bg-slate-600" />
            <div className="h-full w-[1px] bg-slate-600 absolute" />
            <div className="w-32 h-32 rounded-full border border-slate-600 absolute" />
          </div>

          {/* Biological Specimen Cellular Drawing */}
          <div
            className="relative w-full h-full flex items-center justify-center transition-all duration-300"
            style={{
              transform: `scale(${currentMagLevel.scale})`,
              filter: `blur(${blurPx}px)`,
            }}
          >
            {/* SPECIMEN 1: Onion Epidermal Peel (Plant Cell) */}
            {specimen.id === 'onion_peel' && (
              <svg viewBox="0 0 500 500" className="w-[120%] h-[120%]">
                <defs>
                  <pattern id="onionBrick" width="160" height="75" patternUnits="userSpaceOnUse">
                    {/* Rigid Cellulose Double Cell Wall */}
                    <rect x="0" y="0" width="158" height="73" rx="4" fill="#fef9c3" stroke="#84cc16" strokeWidth="4" />
                    {/* Vacuole interior */}
                    <ellipse cx="80" cy="36" rx="55" ry="24" fill="#ecfdf5" stroke="#a7f3d0" strokeWidth="1.5" />
                    {/* Stained Nucleus */}
                    <circle cx="115" cy="35" r="9" fill="#e11d48" opacity="0.85" />
                    <circle cx="116" cy="34" r="3" fill="#881337" />
                    {/* Cytoplasm granulation */}
                    <circle cx="45" cy="25" r="2" fill="#ca8a04" opacity="0.6" />
                    <circle cx="55" cy="48" r="2.5" fill="#ca8a04" opacity="0.6" />
                    <circle cx="130" cy="20" r="1.5" fill="#ca8a04" opacity="0.6" />
                  </pattern>
                </defs>
                <rect width="500" height="500" fill="url(#onionBrick)" />
              </svg>
            )}

            {/* SPECIMEN 2: Human Cheek Epithelial Cell (Animal Cell) */}
            {specimen.id === 'cheek_cell' && (
              <svg viewBox="0 0 500 500" className="w-[110%] h-[110%]">
                <defs>
                  <radialGradient id="cheekGrad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#bfdbfe" stopOpacity="0.85" />
                    <stop offset="85%" stopColor="#93c5fd" stopOpacity="0.7" />
                    <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.9" />
                  </radialGradient>
                </defs>

                {/* Irregular flat epithelial cell 1 */}
                <path
                  d="M 120 160 Q 220 110 320 140 Q 420 180 390 300 Q 340 400 220 380 Q 110 360 90 260 Z"
                  fill="url(#cheekGrad)"
                  stroke="#2563eb"
                  strokeWidth="3.5"
                />

                {/* Prominent methylene-blue stained nucleus */}
                <ellipse cx="240" cy="260" rx="24" ry="22" fill="#4338ca" stroke="#312e81" strokeWidth="3" />
                <circle cx="245" cy="258" r="7" fill="#1e1b4b" />

                {/* Granular Cytosol & Mitochondria dots */}
                {[...Array(24)].map((_, i) => (
                  <ellipse
                    key={i}
                    cx={150 + (i % 5) * 45 + Math.sin(i) * 15}
                    cy={180 + Math.floor(i / 5) * 35 + Math.cos(i) * 12}
                    rx="3"
                    ry="2"
                    fill="#ef4444"
                    opacity="0.75"
                  />
                ))}
              </svg>
            )}

            {/* SPECIMEN 3: Leaf Stomatal Epidermis */}
            {specimen.id === 'leaf_stomata' && (
              <svg viewBox="0 0 500 500" className="w-[110%] h-[110%]">
                <defs>
                  <linearGradient id="guardGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#86efac" />
                    <stop offset="100%" stopColor="#15803d" />
                  </linearGradient>
                </defs>

                {/* Epidermal pavement puzzle cells background */}
                <rect width="500" height="500" fill="#f0fdf4" />
                <path d="M 50 100 Q 150 150 250 80 Q 380 120 450 60" fill="none" stroke="#86efac" strokeWidth="2.5" />
                <path d="M 40 380 Q 180 340 280 410 Q 400 370 480 420" fill="none" stroke="#86efac" strokeWidth="2.5" />

                {/* Central Stomatal Apparatus */}
                {/* Left kidney guard cell */}
                <path
                  d="M 235 150 C 180 170 170 310 235 340 C 215 290 215 200 235 150 Z"
                  fill="url(#guardGrad)"
                  stroke="#166534"
                  strokeWidth="3.5"
                />
                {/* Right kidney guard cell */}
                <path
                  d="M 265 150 C 320 170 330 310 265 340 C 285 290 285 200 265 150 Z"
                  fill="url(#guardGrad)"
                  stroke="#166534"
                  strokeWidth="3.5"
                />

                {/* Stomatal pore aperture */}
                <ellipse cx="250" cy="245" rx="14" ry="45" fill="#0284c7" opacity="0.8" />

                {/* Chloroplast granules inside guard cells */}
                {[...Array(12)].map((_, i) => (
                  <circle
                    key={i}
                    cx={i < 6 ? 205 + (i % 2) * 12 : 285 + (i % 2) * 12}
                    cy={180 + (i % 4) * 32}
                    r="4.5"
                    fill="#15803d"
                    stroke="#14532d"
                    strokeWidth="1.5"
                  />
                ))}
              </svg>
            )}

            {/* Organelle Interactive Click/Hover Hotspots (Shown at clear focus) */}
            {blurPx < 2 &&
              specimen.organelles.map((organelle) => (
                <button
                  key={organelle.id}
                  onMouseEnter={() => setHoveredOrganelle(organelle.id)}
                  onMouseLeave={() => setHoveredOrganelle(null)}
                  className="absolute p-2 rounded-full transform -translate-x-1/2 -translate-y-1/2 group transition-transform hover:scale-125 z-40"
                  style={{
                    left: `${organelle.x}%`,
                    top: `${organelle.y}%`,
                  }}
                  title={organelle.name}
                >
                  <span
                    className="w-3.5 h-3.5 rounded-full block border-2 border-white shadow-md animate-ping"
                    style={{ backgroundColor: organelle.color }}
                  />
                  <span
                    className="w-3.5 h-3.5 rounded-full block border-2 border-white shadow-md absolute top-2 left-2"
                    style={{ backgroundColor: organelle.color }}
                  />
                </button>
              ))}
          </div>

          {/* Blur Focus Helper Overlay */}
          {blurPx >= 2 && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30 pointer-events-none bg-slate-900/90 text-amber-300 px-3 py-1 rounded-full text-[11px] font-bold border border-amber-500/30 flex items-center gap-1.5 shadow-lg">
              <Eye className="w-3.5 h-3.5" /> Adjust Fine Focus Knob to clarify view!
            </div>
          )}
        </div>

        {/* Hovered Organelle Description Tooltip */}
        {hoveredOrganelle && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 stone-panel p-3.5 rounded-2xl border border-amber-500 max-w-md w-full shadow-2xl animate-in fade-in duration-200 backdrop-blur-md">
            {(() => {
              const o = specimen.organelles.find((item) => item.id === hoveredOrganelle);
              if (!o) return null;
              return (
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: o.color }} />
                    <h4 className="font-bold text-xs text-amber-200 uppercase tracking-wider font-serif">{o.name}</h4>
                  </div>
                  <p className="text-[11px] text-stone-200 leading-relaxed font-serif">{o.function}</p>
                </div>
              );
            })()}
          </div>
        )}
      </div>

      {/* Bottom Fine Tuning Dials */}
      <div className="w-full flex flex-wrap items-center justify-between gap-4 stone-panel p-3 rounded-2xl border border-stone-700/80 max-w-4xl z-20 backdrop-blur-md">
        {/* Coarse & Fine Focus Slider */}
        <div className="flex items-center gap-3 min-w-[220px]">
          <Sliders className="w-4 h-4 text-amber-400" />
          <div className="flex-1">
            <div className="flex justify-between text-[11px] font-semibold mb-0.5">
              <span className="text-stone-300 font-serif">Brass Focus Knob:</span>
              <span className="text-amber-300 font-mono">
                {focusOffset === 0 ? 'Sharp Focus (Optimal)' : `${focusOffset > 0 ? '+' : ''}${focusOffset}`}
              </span>
            </div>
            <input
              type="range"
              min="-25"
              max="25"
              value={focusOffset}
              onChange={(e) => setFocusOffset(Number(e.target.value))}
              className="w-full h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />
          </div>
          {focusOffset === 0 && (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
        </div>

        {/* Iris Diaphragm Brightness Slider */}
        <div className="flex items-center gap-3 min-w-[200px]">
          <Sun className="w-4 h-4 text-amber-400" />
          <div className="flex-1">
            <div className="flex justify-between text-[11px] font-semibold mb-0.5">
              <span className="text-slate-300">Condenser Diaphragm:</span>
              <span className="text-amber-300 font-mono">{brightness}%</span>
            </div>
            <input
              type="range"
              min="40"
              max="120"
              value={brightness}
              onChange={(e) => setBrightness(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
            />
          </div>
        </div>

        {/* Power magnification description */}
        <div className="hidden lg:block text-[11px] text-slate-400 max-w-xs font-mono">
          {currentMagLevel.description}
        </div>
      </div>
    </div>
  );
};
