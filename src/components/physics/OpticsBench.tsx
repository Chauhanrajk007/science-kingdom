import React, { useState } from 'react';
import { soundManager } from '../../audio/SoundManager';
import { Sparkles, Sun, Eye, Sliders, RotateCcw, Compass, ArrowRight, Layers } from 'lucide-react';

export const OpticsBench: React.FC = () => {
  // Optical element selection
  const [element, setElement] = useState<'convex_lens' | 'concave_lens' | 'concave_mirror' | 'convex_mirror' | 'prism'>('convex_lens');

  // Interactive Parameters
  const [objectDistance, setObjectDistance] = useState<number>(-24.0); // u (cm, negative)
  const [objectHeight, setObjectHeight] = useState<number>(6.0); // h_o (cm)
  const [focalLength, setFocalLength] = useState<number>(12.0); // f (cm)
  const [showRays, setShowRays] = useState<{ p: boolean; f: boolean; c: boolean }>({ p: true, f: true, c: true });
  const [prismAngle, setPrismAngle] = useState<number>(45); // for prism dispersion

  // Calculate geometric optics image formation
  const calculateOptics = () => {
    const u = objectDistance; // -24 cm
    let f = focalLength; // +12 cm for convex lens, -12 for concave lens
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

    // Lens formula: 1/f = 1/v - 1/u  => 1/v = 1/f + 1/u = (u + f)/(u*f) => v = (u * f) / (u + f)
    // Mirror formula: 1/f = 1/v + 1/u => 1/v = 1/f - 1/u => v = (u * f) / (u - f)
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

  // Coordinate mapping for SVG (bench is 800px wide, center at x=400, y=200, scale = 12px/cm)
  const scale = 11;
  const originX = 400;
  const originY = 190;

  const objX = originX + objectDistance * scale;
  const objTipY = originY - objectHeight * scale;
  const fX1 = originX - Math.abs(optics.f) * scale;
  const fX2 = originX + Math.abs(optics.f) * scale;
  const cX1 = originX - 2 * Math.abs(optics.f) * scale;
  const cX2 = originX + 2 * Math.abs(optics.f) * scale;

  const imgX = originX + optics.v * scale;
  const imgTipY = originY - optics.imageHeight * scale;

  return (
    <div className="flex-1 flex flex-col gap-3 min-h-0 select-none">
      
      {/* Top Controls Toolbar */}
      <div className="stone-panel p-3 rounded-2xl border border-cyan-500/30 flex flex-wrap items-center justify-between gap-3 shadow-xl backdrop-blur-md">
        
        {/* Optical Element Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
            Optical Element:
          </span>
          <div className="flex rounded-xl bg-slate-900/90 p-1 border border-slate-700 flex-wrap">
            {[
              { id: 'convex_lens', label: 'Convex Lens (Converging)' },
              { id: 'concave_lens', label: 'Concave Lens (Diverging)' },
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
                className={`px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  element === el.id
                    ? 'bg-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {el.label}
              </button>
            ))}
          </div>
        </div>

        {/* Ray Visibility Toggles */}
        {element !== 'prism' && (
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="text-slate-400">Rays:</span>
            <button
              onClick={() => setShowRays({ ...showRays, p: !showRays.p })}
              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                showRays.p ? 'bg-emerald-950 border-emerald-500 text-emerald-300' : 'bg-slate-900 border-slate-700 text-slate-500'
              }`}
            >
              Principal
            </button>
            <button
              onClick={() => setShowRays({ ...showRays, f: !showRays.f })}
              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                showRays.f ? 'bg-amber-950 border-amber-500 text-amber-300' : 'bg-slate-900 border-slate-700 text-slate-500'
              }`}
            >
              Focal
            </button>
            <button
              onClick={() => setShowRays({ ...showRays, c: !showRays.c })}
              className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                showRays.c ? 'bg-cyan-950 border-cyan-500 text-cyan-300' : 'bg-slate-900 border-slate-700 text-slate-500'
              }`}
            >
              Central
            </button>
          </div>
        )}

      </div>

      {/* Main Optical Bench Display + Parameter Adjusters */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
        
        {/* Left Column (8 cols): Optical Bench SVG Ray Diagram */}
        <div className="lg:col-span-8 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md p-4 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                Precision Geometric Ray Tracing Bench
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-slate-400">Object u: <strong className="text-cyan-400">{objectDistance} cm</strong></span>
              <span className="text-slate-400">Focal f: <strong className="text-amber-400">{focalLength} cm</strong></span>
              <span className="text-slate-400">Image v: <strong className="text-emerald-400">{optics.v.toFixed(1)} cm</strong></span>
            </div>
          </div>

          {/* Graphical Optical Stage */}
          <div className="relative flex-1 rounded-xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800/80 overflow-hidden flex items-center justify-center min-h-[300px]">
            
            <svg viewBox="0 0 800 360" className="w-full h-full">
              <defs>
                <filter id="flameGlow">
                  <feGaussianBlur stdDeviation="3" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* --- OPTICAL AXIS (HORIZONTAL RAIL) --- */}
              <line x1="30" y1={originY} x2="770" y2={originY} stroke="#64748b" strokeWidth="2" strokeDasharray="6 4" opacity="0.6" />

              {/* Millimeter Ticks along Optical Rail */}
              {[-30, -25, -20, -15, -10, -5, 0, 5, 10, 15, 20, 25, 30].map((cm) => {
                const tickX = originX + cm * scale;
                return (
                  <g key={cm}>
                    <line x1={tickX} y1={originY - 4} x2={tickX} y2={originY + 4} stroke="#475569" strokeWidth="1" />
                    <text x={tickX} y={originY + 16} fill="#64748b" fontSize="8" fontFamily="monospace" textAnchor="middle">
                      {cm}
                    </text>
                  </g>
                );
              })}

              {/* Cardinal Focus Points F and 2F Markers */}
              {element !== 'prism' && (
                <g>
                  {/* Left Focus F1 and 2F1 */}
                  <circle cx={fX1} cy={originY} r="3.5" fill="#f59e0b" />
                  <text x={fX1} y={originY - 8} fill="#f59e0b" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                    F₁
                  </text>
                  <circle cx={cX1} cy={originY} r="3.5" fill="#f59e0b" opacity="0.6" />
                  <text x={cX1} y={originY - 8} fill="#f59e0b" fontSize="9" fontFamily="monospace" textAnchor="middle" opacity="0.7">
                    2F₁
                  </text>

                  {/* Right Focus F2 and 2F2 */}
                  <circle cx={fX2} cy={originY} r="3.5" fill="#f59e0b" />
                  <text x={fX2} y={originY - 8} fill="#f59e0b" fontSize="10" fontFamily="monospace" fontWeight="bold" textAnchor="middle">
                    F₂
                  </text>
                  <circle cx={cX2} cy={originY} r="3.5" fill="#f59e0b" opacity="0.6" />
                  <text x={cX2} y={originY - 8} fill="#f59e0b" fontSize="9" fontFamily="monospace" textAnchor="middle" opacity="0.7">
                    2F₂
                  </text>
                </g>
              )}

              {/* --- OPTICAL ELEMENT AT CENTER (x = originX) --- */}
              {element === 'convex_lens' && (
                <g>
                  {/* Biconvex Lens Glass */}
                  <path
                    d={`M ${originX},${originY - 100} Q ${originX + 22},${originY} ${originX},${originY + 100} Q ${originX - 22},${originY} ${originX},${originY - 100}`}
                    fill="#38bdf8"
                    fillOpacity="0.25"
                    stroke="#0ea5e9"
                    strokeWidth="2.5"
                  />
                  <line x1={originX} y1={originY - 110} x2={originX} y2={originY + 110} stroke="#38bdf8" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
                  <text x={originX} y={originY - 116} fill="#38bdf8" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                    Convex Lens
                  </text>
                </g>
              )}

              {element === 'concave_lens' && (
                <g>
                  {/* Biconcave Lens Glass */}
                  <path
                    d={`M ${originX - 14},${originY - 100} L ${originX + 14},${originY - 100} Q ${originX + 3},${originY} ${originX + 14},${originY + 100} L ${originX - 14},${originY + 100} Q ${originX - 3},${originY} ${originX - 14},${originY - 100}`}
                    fill="#38bdf8"
                    fillOpacity="0.25"
                    stroke="#0ea5e9"
                    strokeWidth="2.5"
                  />
                  <text x={originX} y={originY - 116} fill="#38bdf8" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                    Concave Lens
                  </text>
                </g>
              )}

              {element === 'concave_mirror' && (
                <g>
                  {/* Curved Concave Mirror Arc */}
                  <path
                    d={`M ${originX + 15},${originY - 100} Q ${originX - 15},${originY} ${originX + 15},${originY + 100}`}
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="4"
                  />
                  <text x={originX} y={originY - 116} fill="#cbd5e1" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                    Concave Mirror
                  </text>
                </g>
              )}

              {element === 'convex_mirror' && (
                <g>
                  {/* Curved Convex Mirror Arc */}
                  <path
                    d={`M ${originX - 15},${originY - 100} Q ${originX + 15},${originY} ${originX - 15},${originY + 100}`}
                    fill="none"
                    stroke="#94a3b8"
                    strokeWidth="4"
                  />
                  <text x={originX} y={originY - 116} fill="#cbd5e1" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                    Convex Mirror
                  </text>
                </g>
              )}

              {element === 'prism' && (
                <g>
                  {/* Equilateral Quartz Prism */}
                  <polygon
                    points={`${originX},${originY - 90} ${originX - 70},${originY + 60} ${originX + 70},${originY + 60}`}
                    fill="#38bdf8"
                    fillOpacity="0.2"
                    stroke="#0ea5e9"
                    strokeWidth="3"
                  />
                  {/* Incident White Ray */}
                  <line x1={originX - 220} y1={originY + 10} x2={originX - 35} y2={originY - 15} stroke="#ffffff" strokeWidth="3" />
                  
                  {/* Dispersed Rainbow Spectrum Emerging */}
                  {[
                    { color: '#ef4444', dev: 8 },
                    { color: '#f97316', dev: 14 },
                    { color: '#eab308', dev: 20 },
                    { color: '#22c55e', dev: 26 },
                    { color: '#06b6d4', dev: 32 },
                    { color: '#3b82f6', dev: 38 },
                    { color: '#a855f7', dev: 44 },
                  ].map((band, idx) => (
                    <line
                      key={idx}
                      x1={originX + 35}
                      y1={originY - 15}
                      x2={originX + 240}
                      y2={originY + band.dev}
                      stroke={band.color}
                      strokeWidth="2.5"
                      opacity="0.9"
                    />
                  ))}
                  <text x={originX + 250} y={originY + 28} fill="#ffffff" fontSize="11" fontFamily="monospace" fontWeight="bold">
                    Rainbow Spectrum (Cauchy Dispersion)
                  </text>
                </g>
              )}

              {/* --- OBJECT CANDLE (LEFT SIDE) --- */}
              {element !== 'prism' && (
                <g>
                  {/* Candle Body */}
                  <rect
                    x={objX - 6}
                    y={originY - objectHeight * scale}
                    width="12"
                    height={objectHeight * scale}
                    fill="#fef08a"
                    stroke="#ca8a04"
                    strokeWidth="1.5"
                    rx="2"
                  />
                  {/* Candle Wick */}
                  <line x1={objX} y1={originY - objectHeight * scale} x2={objX} y2={originY - objectHeight * scale - 5} stroke="#451a03" strokeWidth="2" />
                  {/* Glowing Flame Tip */}
                  <ellipse
                    cx={objX}
                    cy={objTipY - 8}
                    rx="5"
                    ry="9"
                    fill="#f59e0b"
                    filter="url(#flameGlow)"
                  />
                  <ellipse cx={objX} cy={objTipY - 7} rx="2.5" ry="5" fill="#fef08a" />
                  <text x={objX} y={originY + 28} fill="#fef08a" fontSize="10" fontFamily="monospace" textAnchor="middle" fontWeight="bold">
                    Object (Candle)
                  </text>
                </g>
              )}

              {/* --- RAY TRACING LINES --- */}
              {element !== 'prism' && (
                <g>
                  {/* Ray 1: Principal Ray (Green) - Parallel to axis then through Focus */}
                  {showRays.p && (
                    <g>
                      <line x1={objX} y1={objTipY} x2={originX} y2={objTipY} stroke="#22c55e" strokeWidth="2" opacity="0.9" />
                      {optics.isLens ? (
                        <line x1={originX} y1={objTipY} x2={imgX > originX ? imgX + 80 : 780} y2={imgTipY + (optics.imageHeight > 0 ? 40 : -40)} stroke="#22c55e" strokeWidth="2" opacity="0.9" />
                      ) : (
                        <line x1={originX} y1={objTipY} x2={imgX} y2={imgTipY} stroke="#22c55e" strokeWidth="2" opacity="0.9" />
                      )}
                    </g>
                  )}

                  {/* Ray 2: Focal Ray (Amber) - Through Focus then Parallel */}
                  {showRays.f && (
                    <g>
                      <line x1={objX} y1={objTipY} x2={originX} y2={imgTipY} stroke="#f59e0b" strokeWidth="1.8" opacity="0.8" />
                      <line x1={originX} y1={imgTipY} x2={780} y2={imgTipY} stroke="#f59e0b" strokeWidth="1.8" opacity="0.8" />
                    </g>
                  )}

                  {/* Ray 3: Central Ray (Cyan) - Straight through Optical Center */}
                  {showRays.c && (
                    <line x1={objX} y1={objTipY} x2={imgX + 40} y2={imgTipY + (optics.imageHeight > 0 ? 20 : -20)} stroke="#06b6d4" strokeWidth="1.8" opacity="0.8" />
                  )}
                </g>
              )}

              {/* --- IMAGE CANDLE (FORMED) --- */}
              {element !== 'prism' && Math.abs(optics.v) < 40 && (
                <g>
                  {/* Image Candle Body (Dashed if virtual, solid if real) */}
                  <rect
                    x={imgX - 5}
                    y={optics.imageHeight > 0 ? originY : originY - Math.abs(optics.imageHeight * scale)}
                    width="10"
                    height={Math.abs(optics.imageHeight * scale)}
                    fill={optics.isReal ? '#f43f5e' : '#a855f7'}
                    fillOpacity="0.7"
                    stroke="#ffffff"
                    strokeWidth="1.5"
                    strokeDasharray={optics.isReal ? 'none' : '4 3'}
                    rx="2"
                  />
                  {/* Image Flame Tip */}
                  <ellipse
                    cx={imgX}
                    cy={imgTipY + (optics.imageHeight > 0 ? 8 : -8)}
                    rx="4"
                    ry="7"
                    fill={optics.isReal ? '#fb7185' : '#c084fc'}
                  />
                  <text
                    x={imgX}
                    y={originY + (optics.imageHeight > 0 ? -12 : 28)}
                    fill={optics.isReal ? '#f43f5e' : '#c084fc'}
                    fontSize="10"
                    fontFamily="monospace"
                    textAnchor="middle"
                    fontWeight="bold"
                  >
                    {optics.isReal ? 'Real Image' : 'Virtual Image'}
                  </text>
                </g>
              )}
            </svg>

          </div>

          {/* Real-Time Optical Status Footer */}
          <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-800 text-xs font-mono text-slate-300">
            <span>Nature: <strong className={optics.isReal ? 'text-emerald-400' : 'text-purple-400'}>
              {element === 'prism' ? 'Polychromatic Dispersion' : `${optics.isReal ? 'Real Inverted' : 'Virtual Upright'} (${Math.abs(optics.magnification) > 1 ? 'Magnified' : 'Diminished'})`}
            </strong></span>
            <span>Magnification: <strong className="text-cyan-400">{Math.abs(optics.magnification).toFixed(2)}×</strong></span>
          </div>

        </div>

        {/* Right Column (4 cols): Curvature & Distance Sliders + Lens Formula */}
        <div className="lg:col-span-4 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md p-4 flex flex-col justify-between shadow-2xl">
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                Geometric Optics Controls
              </span>
              <Sliders className="w-4 h-4 text-cyan-400" />
            </div>

            {/* Sliders Box */}
            <div className="space-y-3.5 mb-4 text-xs font-mono">
              
              {/* 1. Object Distance u */}
              {element !== 'prism' && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-300">Object Distance (u):</span>
                    <strong className="text-cyan-400 font-bold">{objectDistance} cm</strong>
                  </div>
                  <input
                    type="range"
                    min="-35"
                    max="-8"
                    step="1"
                    value={objectDistance}
                    onChange={(e) => setObjectDistance(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>
              )}

              {/* 2. Focal Length f / Curvature */}
              {element !== 'prism' && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-300">Focal Length (f):</span>
                    <strong className="text-amber-400 font-bold">{focalLength} cm</strong>
                  </div>
                  <input
                    type="range"
                    min="6"
                    max="22"
                    step="1"
                    value={focalLength}
                    onChange={(e) => setFocalLength(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                  <span className="text-[9px] text-slate-500 font-mono block mt-0.5">
                    Radius of Curvature R = 2f = {focalLength * 2} cm
                  </span>
                </div>
              )}

              {/* 3. Object Height h_o */}
              {element !== 'prism' && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-300">Object Height (h):</span>
                    <strong className="text-emerald-400 font-bold">{objectHeight} cm</strong>
                  </div>
                  <input
                    type="range"
                    min="2"
                    max="10"
                    step="0.5"
                    value={objectHeight}
                    onChange={(e) => setObjectHeight(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  />
                </div>
              )}

            </div>

            {/* Gaussian Lens / Mirror Formula Box */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Gaussian Optical Equation:
              </span>
              <div className="text-center py-1.5 bg-slate-900 rounded border border-slate-800 font-bold text-amber-300 text-sm">
                1/f = 1/v - 1/u ⟹ v = (u · f) / (u + f)
              </div>
              <div className="text-[11px] text-slate-300 leading-relaxed pt-1">
                1/v = 1/{focalLength} - 1/({objectDistance})
                <br />
                Calculated v = <strong className="text-emerald-400 font-bold">{optics.v.toFixed(1)} cm</strong>
                <br />
                Magnification M = v/u = <strong className="text-cyan-400 font-bold">{optics.magnification.toFixed(2)}</strong>
              </div>
            </div>
          </div>

          {/* Senku's Optics Insight */}
          <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-600/40 text-[11px] font-serif text-cyan-200 mt-3">
            <strong className="font-mono text-cyan-300 block text-[10px] uppercase">
              Senku's Ray Law:
            </strong>
            "Light rays do not guess! Light follows the path of stationary action (Fermat's Principle). Place an object at 2F, and the inverted image appears at exactly 2F with 1.00x magnification!"
          </div>

        </div>

      </div>

    </div>
  );
};