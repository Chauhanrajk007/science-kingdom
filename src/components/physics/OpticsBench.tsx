import React, { useState } from 'react';
import { soundManager } from '../../audio/SoundManager';
import { Sparkles, Sun, Eye, Sliders, RotateCcw, Compass, ArrowRight, Layers, Flame, Zap } from 'lucide-react';

export const OpticsBench: React.FC = () => {
  // Optical element selection
  const [element, setElement] = useState<'convex_lens' | 'concave_lens' | 'concave_mirror' | 'convex_mirror' | 'prism'>('convex_lens');

  // Interactive Parameters
  const [objectDistance, setObjectDistance] = useState<number>(-24.0); // u (cm, negative)
  const [objectHeight, setObjectHeight] = useState<number>(6.0); // h_o (cm)
  const [focalLength, setFocalLength] = useState<number>(12.0); // f (cm)
  const [lightMode, setLightMode] = useState<'candle' | 'laser_comb'>('candle');
  const [showRays, setShowRays] = useState<{ p: boolean; f: boolean; c: boolean }>({ p: true, f: true, c: true });

  // Calculate geometric optics image formation
  const calculateOptics = () => {
    const u = objectDistance; // negative by sign convention
    let f = focalLength;
    let isLens = true;

    if (element === 'concave_lens') {
      f = -Math.abs(focalLength);
      isLens = true;
    } else if (element === 'convex_lens') {
      f = Math.abs(focalLength);
      isLens = true;
    } else if (element === 'concave_mirror') {
      f = -Math.abs(focalLength);
      isLens = false;
    } else if (element === 'convex_mirror') {
      f = Math.abs(focalLength);
      isLens = false;
    }

    // Lens formula: 1/f = 1/v - 1/u => v = (u * f) / (u + f)
    // Mirror formula: 1/f = 1/v + 1/u => v = (u * f) / (u - f)
    let v = 0;
    if (isLens) {
      const denom = u + f;
      v = Math.abs(denom) < 0.01 ? (u > 0 ? 999 : -999) : (u * f) / denom;
    } else {
      const denom = u - f;
      v = Math.abs(denom) < 0.01 ? (u > 0 ? 999 : -999) : (u * f) / denom;
    }

    const magnification = isLens ? (v / u) : (-v / u);
    const imageHeight = objectHeight * magnification;
    const isReal = isLens ? (v > 0) : (v < 0);
    const isUpright = magnification > 0;

    return {
      f,
      v,
      magnification,
      imageHeight,
      isReal,
      isUpright,
      isLens,
    };
  };

  const optics = calculateOptics();

  // Bench coordinate mapping: Lens is at center x = 400
  const benchCenterX = 400;
  const benchScale = 8; // 8 pixels per cm
  const candleX = benchCenterX + objectDistance * benchScale;
  const imageX = benchCenterX + optics.v * benchScale;
  const candleH = objectHeight * benchScale;
  const imageH = Math.min(180, Math.max(-180, optics.imageHeight * benchScale));

  return (
    <div className="flex-1 flex flex-col gap-3 min-h-0 select-none font-mono">
      
      {/* Top Controls Bar */}
      <div className="p-3 rounded-2xl bg-slate-900/90 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-3 shadow-xl backdrop-blur-md">
        
        {/* Optical Element Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            Optical Component:
          </span>
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-700 flex-wrap gap-1">
            {[
              { id: 'convex_lens', label: 'Convex Lens (+f)' },
              { id: 'concave_lens', label: 'Concave Lens (-f)' },
              { id: 'concave_mirror', label: 'Concave Mirror' },
              { id: 'convex_mirror', label: 'Convex Mirror' },
              { id: 'prism', label: 'Dispersion Prism' },
            ].map((el) => (
              <button
                key={el.id}
                onClick={() => {
                  soundManager.playClick();
                  setElement(el.id as any);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  element === el.id
                    ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {el.label}
              </button>
            ))}
          </div>
        </div>

        {/* Light Source Switcher: Candle vs Laser Comb */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400">Light Source:</span>
          <div className="flex rounded-lg bg-slate-950 border border-slate-700 p-0.5 text-xs">
            <button
              onClick={() => setLightMode('candle')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition-all ${
                lightMode === 'candle'
                  ? 'bg-amber-500 text-slate-950 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Flame className="w-3.5 h-3.5" /> Candle Flame
            </button>
            <button
              onClick={() => setLightMode('laser_comb')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition-all ${
                lightMode === 'laser_comb'
                  ? 'bg-cyan-500 text-slate-950 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5" /> 5-Beam Laser Comb
            </button>
          </div>
        </div>

      </div>

      {/* Main Bench Visual Viewport + Controls Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
        
        {/* Left Column (8 cols): Precision Ray Optics Bench SVG Canvas */}
        <div className="lg:col-span-8 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md p-4 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 flex-wrap gap-2 text-xs">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-cyan-400" />
              <span className="font-bold text-slate-200 uppercase tracking-wider">
                Precision Optical Rail Bench & Ray Tracer
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-400">Object Distance (u): <strong className="text-amber-400">{objectDistance} cm</strong></span>
              <span className="text-slate-400">Image Distance (v): <strong className="text-emerald-400">{optics.v.toFixed(1)} cm</strong></span>
              <span className="text-slate-400">Magnification (m): <strong className="text-purple-400">{optics.magnification.toFixed(2)}×</strong></span>
            </div>
          </div>

          {/* SVG Optical Rail Bench */}
          <div className="relative flex-1 rounded-xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800/80 overflow-hidden flex items-center justify-center min-h-[320px]">
            <svg viewBox="0 0 800 360" className="w-full h-full">
              <defs>
                <linearGradient id="lensGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="rgba(56, 189, 248, 0.4)" />
                  <stop offset="50%" stopColor="rgba(255, 255, 255, 0.7)" />
                  <stop offset="100%" stopColor="rgba(56, 189, 248, 0.4)" />
                </linearGradient>
              </defs>

              {/* Optical Rail Track at bottom */}
              <rect x="50" y="280" width="700" height="18" fill="#1e293b" stroke="#475569" strokeWidth="2" rx="3" />
              
              {/* Rail Distance Markers */}
              {[-30, -20, -10, 0, 10, 20, 30].map((cm) => {
                const rx = benchCenterX + cm * benchScale;
                return (
                  <g key={cm}>
                    <line x1={rx} y1="280" x2={rx} y2="292" stroke="#94a3b8" strokeWidth="1.5" />
                    <text x={rx} y="306" fill="#64748b" fontSize="9" textAnchor="middle">
                      {cm}cm
                    </text>
                  </g>
                );
              })}

              {/* Principal Optical Axis */}
              <line x1="50" y1="180" x2="750" y2="180" stroke="#475569" strokeWidth="1.5" strokeDasharray="4 4" />

              {/* Focal Points Markers (F1, 2F1, F2, 2F2) */}
              {element !== 'prism' && (
                <g>
                  {/* Left Focus F1 and 2F1 */}
                  <circle cx={benchCenterX - focalLength * benchScale} cy="180" r="4" fill="#38bdf8" />
                  <text x={benchCenterX - focalLength * benchScale} y="196" fill="#38bdf8" fontSize="10" textAnchor="middle" fontWeight="bold">F₁</text>
                  <circle cx={benchCenterX - 2 * focalLength * benchScale} cy="180" r="4" fill="#64748b" />
                  <text x={benchCenterX - 2 * focalLength * benchScale} y="196" fill="#94a3b8" fontSize="9" textAnchor="middle">2F₁</text>

                  {/* Right Focus F2 and 2F2 */}
                  <circle cx={benchCenterX + focalLength * benchScale} cy="180" r="4" fill="#38bdf8" />
                  <text x={benchCenterX + focalLength * benchScale} y="196" fill="#38bdf8" fontSize="10" textAnchor="middle" fontWeight="bold">F₂</text>
                  <circle cx={benchCenterX + 2 * focalLength * benchScale} cy="180" r="4" fill="#64748b" />
                  <text x={benchCenterX + 2 * focalLength * benchScale} y="196" fill="#94a3b8" fontSize="9" textAnchor="middle">2F₂</text>
                </g>
              )}

              {/* --- PRISM DISPERSION MODE --- */}
              {element === 'prism' ? (
                <g>
                  {/* Glass Prism Triangle */}
                  <polygon points="400,100 340,260 460,260" fill="url(#lensGrad)" stroke="#38bdf8" strokeWidth="2.5" />
                  {/* Incident White Beam */}
                  <line x1="100" y1="210" x2="360" y2="180" stroke="#ffffff" strokeWidth="4" />
                  {/* Rainbow Refracted Beams */}
                  {[
                    { col: '#ef4444', dev: 20 },
                    { col: '#f97316', dev: 23 },
                    { col: '#eab308', dev: 26 },
                    { col: '#22c55e', dev: 29 },
                    { col: '#06b6d4', dev: 33 },
                    { col: '#a855f7', dev: 37 },
                  ].map((rb, idx) => (
                    <line key={idx} x1="430" y1={175 + idx * 2} x2="720" y2={120 + rb.dev * 3} stroke={rb.col} strokeWidth="2.5" opacity="0.9" />
                  ))}
                  <text x="730" y="140" fill="#a855f7" fontSize="10" fontWeight="bold">Violet (Max Dev)</text>
                  <text x="730" y="240" fill="#ef4444" fontSize="10" fontWeight="bold">Red (Min Dev)</text>
                </g>
              ) : (
                /* --- LENS / MIRROR MODE --- */
                <g>
                  {/* Optical Element at Center (x = 400) */}
                  {element.includes('convex') ? (
                    // Convex element shape
                    <ellipse cx={benchCenterX} cy="180" rx="14" ry="90" fill="url(#lensGrad)" stroke="#38bdf8" strokeWidth="2.5" />
                  ) : (
                    // Concave element shape
                    <path d={`M ${benchCenterX - 8} 90 Q ${benchCenterX + 4} 180 ${benchCenterX - 8} 270 L ${benchCenterX + 8} 270 Q ${benchCenterX - 4} 180 ${benchCenterX + 8} 90 Z`} fill="url(#lensGrad)" stroke="#38bdf8" strokeWidth="2.5" />
                  )}

                  {/* ELEMENT MOUNT ON RAIL */}
                  <rect x={benchCenterX - 10} y="270" width="20" height="14" fill="#334155" stroke="#94a3b8" />

                  {/* 1. CANDLE OBJECT on Left */}
                  <g>
                    {/* Candle Stand on rail */}
                    <rect x={candleX - 12} y="270" width="24" height="12" fill="#d97706" />
                    {/* Candle Body */}
                    <rect x={candleX - 6} y={180 - candleH} width="12" height={candleH} fill="#fef08a" stroke="#d97706" strokeWidth="1.5" rx="2" />
                    {/* Wick & Animated Flame */}
                    <line x1={candleX} y1={180 - candleH} x2={candleX} y2={180 - candleH - 6} stroke="#000" strokeWidth="2" />
                    <ellipse cx={candleX} cy={180 - candleH - 12} rx="5" ry="9" fill="#f59e0b" className="animate-pulse" />
                    <ellipse cx={candleX} cy={180 - candleH - 10} rx="2.5" ry="5" fill="#fef08a" />
                    <text x={candleX} y="260" fill="#f59e0b" fontSize="10" fontWeight="bold" textAnchor="middle">Object</text>
                  </g>

                  {/* 2. LIGHT RAYS TRACING */}
                  {lightMode === 'candle' ? (
                    <g opacity="0.85">
                      {/* Ray 1: Parallel to Principal Axis -> Passes through F2 */}
                      {showRays.p && (
                        <g>
                          <line x1={candleX} y1={180 - candleH} x2={benchCenterX} y2={180 - candleH} stroke="#06b6d4" strokeWidth="2" />
                          <line x1={benchCenterX} y1={180 - candleH} x2={imageX} y2={180 + imageH} stroke="#06b6d4" strokeWidth="2" />
                        </g>
                      )}

                      {/* Ray 2: Passing through Optical Center without deviation */}
                      {showRays.c && (
                        <line x1={candleX} y1={180 - candleH} x2={imageX} y2={180 + imageH} stroke="#a855f7" strokeWidth="2" />
                      )}

                      {/* Ray 3: Through Focus F1 -> Emerges Parallel */}
                      {showRays.f && (
                        <g>
                          <line x1={candleX} y1={180 - candleH} x2={benchCenterX} y2={180 + imageH} stroke="#f59e0b" strokeWidth="2" />
                          <line x1={benchCenterX} y1={180 + imageH} x2={imageX} y2={180 + imageH} stroke="#f59e0b" strokeWidth="2" />
                        </g>
                      )}
                    </g>
                  ) : (
                    /* 5-BEAM LASER COMB */
                    <g opacity="0.9">
                      {[-40, -20, 0, 20, 40].map((offset, li) => (
                        <g key={li}>
                          <line x1="80" y1={180 + offset} x2={benchCenterX} y2={180 + offset} stroke="#38bdf8" strokeWidth="2" />
                          <line x1={benchCenterX} y1={180 + offset} x2={benchCenterX + focalLength * benchScale} y2="180" stroke="#38bdf8" strokeWidth="2" />
                          <line x1={benchCenterX + focalLength * benchScale} y1="180" x2="720" y2={180 - offset * 1.5} stroke="#38bdf8" strokeWidth="2" strokeDasharray="2 2" />
                        </g>
                      ))}
                    </g>
                  )}

                  {/* 3. FORMED IMAGE (Real / Virtual) */}
                  {imageX > 50 && imageX < 750 && Math.abs(imageH) > 2 && (
                    <g>
                      {/* Image Stand */}
                      <rect x={imageX - 10} y="270" width="20" height="12" fill="#475569" />
                      
                      {/* Inverted / Upright Image Candle */}
                      <rect
                        x={imageX - 5}
                        y={optics.isUpright ? 180 - Math.abs(imageH) : 180}
                        width="10"
                        height={Math.abs(imageH)}
                        fill={optics.isReal ? '#38bdf8' : 'rgba(56, 189, 248, 0.4)'}
                        stroke="#0284c7"
                        strokeWidth="1.5"
                        strokeDasharray={optics.isReal ? 'none' : '3 3'}
                        rx="2"
                      />
                      {/* Inverted Flame */}
                      <ellipse
                        cx={imageX}
                        cy={optics.isUpright ? 180 - Math.abs(imageH) - 8 : 180 + Math.abs(imageH) + 8}
                        rx="4"
                        ry="7"
                        fill="#f59e0b"
                        opacity={optics.isReal ? 1 : 0.5}
                      />
                      <text x={imageX} y="260" fill="#38bdf8" fontSize="10" fontWeight="bold" textAnchor="middle">
                        {optics.isReal ? 'Real Image' : 'Virtual Image'}
                      </text>
                    </g>
                  )}
                </g>
              )}
            </svg>
          </div>

          {/* Bottom Telemetry */}
          <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-800 text-center text-xs">
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Image Nature</span>
              <strong className={optics.isReal ? 'text-emerald-400' : 'text-purple-400'}>
                {optics.isReal ? 'Real & Inverted' : 'Virtual & Erect'}
              </strong>
            </div>
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Magnification (m)</span>
              <strong className="text-cyan-400">{optics.magnification.toFixed(2)}×</strong>
            </div>
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Image Position (v)</span>
              <strong className="text-amber-400">{optics.v.toFixed(1)} cm</strong>
            </div>
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Focal Power (P)</span>
              <strong className="text-blue-400">{(100 / optics.f).toFixed(2)} D</strong>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Optical Parameter Sliders */}
        <div className="lg:col-span-4 flex flex-col gap-3 min-h-0 overflow-y-auto pr-1">
          
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider block">
              Bench Positioning:
            </span>

            {/* Object Distance Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Object Position (u):</span>
                <span className="font-bold text-amber-300">{objectDistance} cm</span>
              </div>
              <input
                type="range"
                min="-35"
                max="-5"
                step="0.5"
                value={objectDistance}
                onChange={(e) => setObjectDistance(parseFloat(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[9px] text-slate-500 mt-0.5">
                <span>-35cm (Beyond 2F)</span>
                <span className="text-amber-400 font-bold">-24cm (At 2F)</span>
                <span>-5cm (Between F & O)</span>
              </div>
            </div>

            {/* Focal Length Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Focal Length (f):</span>
                <span className="font-bold text-cyan-300">{focalLength} cm</span>
              </div>
              <input
                type="range"
                min="6"
                max="20"
                step="0.5"
                value={focalLength}
                onChange={(e) => setFocalLength(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Object Height Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Candle Height (h_o):</span>
                <span className="font-bold text-purple-300">{objectHeight} cm</span>
              </div>
              <input
                type="range"
                min="2"
                max="12"
                step="0.5"
                value={objectHeight}
                onChange={(e) => setObjectHeight(parseFloat(e.target.value))}
                className="w-full accent-purple-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>
          </div>

          {/* Ray Visibility Toggles */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2 text-xs">
            <span className="font-bold text-cyan-400 uppercase tracking-wider block mb-1">
              Geometric Ray Filters:
            </span>
            <label className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
              <span className="text-cyan-300 font-bold">Parallel Ray (passes via Focus)</span>
              <input
                type="checkbox"
                checked={showRays.p}
                onChange={(e) => setShowRays({ ...showRays, p: e.target.checked })}
                className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
              />
            </label>
            <label className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
              <span className="text-purple-300 font-bold">Central Ray (undeviated)</span>
              <input
                type="checkbox"
                checked={showRays.c}
                onChange={(e) => setShowRays({ ...showRays, c: e.target.checked })}
                className="w-4 h-4 accent-purple-400 rounded cursor-pointer"
              />
            </label>
            <label className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer">
              <span className="text-amber-300 font-bold">Focal Ray (emerges parallel)</span>
              <input
                type="checkbox"
                checked={showRays.f}
                onChange={(e) => setShowRays({ ...showRays, f: e.target.checked })}
                className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
              />
            </label>
          </div>

          {/* Thin Lens Equation Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-950/60 to-slate-900 border border-cyan-500/30 text-xs shadow-xl">
            <span className="font-bold text-cyan-400 uppercase tracking-wider block mb-1">
              Gaussian Thin Lens Equation:
            </span>
            <div className="p-2 rounded bg-slate-950 border border-cyan-500/30 text-center font-bold text-cyan-300 mb-1.5">
              1 / f = 1 / v - 1 / u
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
              Sign Convention: Incident light travels left-to-right. Real images form on opposite side (v &gt; 0). Virtual images form on same side (v &lt; 0).
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
