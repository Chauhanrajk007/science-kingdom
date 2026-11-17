import React, { useState, useEffect } from 'react';
import { soundManager } from '../../audio/SoundManager';
import { Zap, Power, Gauge, Sparkles } from 'lucide-react';

export const CircuitStation: React.FC = () => {
  const [voltage, setVoltage] = useState<number>(12); // Volts
  const [resistance, setResistance] = useState<number>(20); // Ohms
  const [isSwitchClosed, setIsSwitchClosed] = useState<boolean>(true);

  // Ohm's Law: I = V / R
  const current = isSwitchClosed ? voltage / resistance : 0; // Amperes
  const power = isSwitchClosed ? voltage * current : 0; // Watts

  // Electron animation offset
  const [electronOffset, setElectronOffset] = useState<number>(0);

  useEffect(() => {
    let animId: number;
    let last = performance.now();

    const loop = (time: number) => {
      const delta = (time - last) / 1000;
      last = time;
      if (isSwitchClosed && current > 0) {
        setElectronOffset((prev) => (prev + current * 40 * delta) % 100);
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [isSwitchClosed, current]);

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Controls Bar */}
      <div className="stone-panel p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-4 border border-amber-600/40 shadow-xl backdrop-blur-md">
        {/* Knife Switch Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              soundManager.playClick();
              setIsSwitchClosed(!isSwitchClosed);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg font-mono ${
              isSwitchClosed
                ? 'bg-emerald-600 hover:bg-emerald-500 text-stone-950 shadow-emerald-900/30'
                : 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/30'
            }`}
          >
            <Power className="w-4 h-4" />
            Knife Switch: {isSwitchClosed ? 'CLOSED (GENERATING)' : 'OPEN (DISCONNECTED)'}
          </button>
        </div>

        {/* Live Gauges */}
        <div className="flex items-center gap-3">
          <div className="bg-stone-900/95 px-3.5 py-1.5 rounded-xl border border-stone-700/80 flex items-center gap-2">
            <span className="text-[10px] text-stone-400 font-bold uppercase font-mono">Current:</span>
            <span className="font-mono text-sm font-black text-amber-300">
              {current.toFixed(2)} A
            </span>
          </div>

          <div className="bg-stone-900/95 px-3.5 py-1.5 rounded-xl border border-stone-700/80 flex items-center gap-2">
            <span className="text-[10px] text-stone-400 font-bold uppercase font-mono">Dynamo:</span>
            <span className="font-mono text-sm font-black text-amber-400">
              {isSwitchClosed ? voltage.toFixed(1) : '0.0'} V
            </span>
          </div>

          <div className="bg-stone-900/95 px-3.5 py-1.5 rounded-xl border border-stone-700/80 flex items-center gap-2">
            <span className="text-[10px] text-stone-400 font-bold uppercase font-mono">Bulb Power:</span>
            <span className="font-mono text-sm font-black text-emerald-400">
              {power.toFixed(1)} W
            </span>
          </div>
        </div>
      </div>

      {/* Main Schematic & Interactive Board */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Interactive Circuit Diagram */}
        <div className="lg:col-span-2 stone-panel rounded-2xl relative overflow-hidden flex items-center justify-center p-4 border border-amber-600/40 bg-stone-950/70 backdrop-blur-md">
          <svg viewBox="0 0 700 420" className="w-full h-full max-h-[380px]">
            <defs>
              <filter id="bulbGlow" x="-50%" y="-50%" width="200%" height="200%">
                <feGaussianBlur stdDeviation={Math.min(25, 4 + power * 0.8)} result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Grid */}
            <pattern id="circGrid" width="30" height="30" patternUnits="userSpaceOnUse">
              <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            </pattern>
            <rect width="700" height="420" fill="url(#circGrid)" />

            {/* Circuit Wire Loop */}
            {/* Top Wire */}
            <line x1="120" y1="80" x2="380" y2="80" stroke="#f59e0b" strokeWidth="4" />
            <line x1="420" y1="80" x2="580" y2="80" stroke="#f59e0b" strokeWidth="4" />

            {/* Right Wire */}
            <line x1="580" y1="80" x2="580" y2="340" stroke="#f59e0b" strokeWidth="4" />

            {/* Bottom Wire */}
            <line x1="580" y1="340" x2="420" y2="340" stroke="#f59e0b" strokeWidth="4" />
            <line x1="280" y1="340" x2="120" y2="340" stroke="#f59e0b" strokeWidth="4" />

            {/* Left Wire */}
            <line x1="120" y1="340" x2="120" y2="80" stroke="#f59e0b" strokeWidth="4" />

            {/* Animated Electron particles */}
            {isSwitchClosed && current > 0 && (
              <g>
                {[...Array(12)].map((_, i) => {
                  const progress = (electronOffset + i * 8.33) % 100;
                  let px = 0;
                  let py = 0;
                  // Loop around perimeter: top (0-30), right (30-50), bottom (50-80), left (80-100)
                  if (progress < 30) {
                    px = 120 + (progress / 30) * 460;
                    py = 80;
                  } else if (progress < 50) {
                    px = 580;
                    py = 80 + ((progress - 30) / 20) * 260;
                  } else if (progress < 80) {
                    px = 580 - ((progress - 50) / 30) * 460;
                    py = 340;
                  } else {
                    px = 120;
                    py = 340 - ((progress - 80) / 20) * 260;
                  }
                  return (
                    <circle
                      key={i}
                      cx={px}
                      cy={py}
                      r="3.5"
                      fill="#38bdf8"
                      filter="drop-shadow(0 0 4px #0284c7)"
                    />
                  );
                })}
              </g>
            )}

            {/* BATTERY DC SOURCE (Left side) */}
            <g transform="translate(120, 210)">
              <rect x="-24" y="-35" width="48" height="70" rx="4" fill="#1e293b" stroke="#64748b" strokeWidth="2" />
              {/* Positive Plate */}
              <line x1="-16" y1="-12" x2="16" y2="-12" stroke="#ef4444" strokeWidth="5" />
              <text x="-32" y="-9" fill="#ef4444" fontSize="14" fontWeight="black">+</text>
              {/* Negative Plate */}
              <line x1="-10" y1="12" x2="10" y2="12" stroke="#38bdf8" strokeWidth="3" />
              <text x="-30" y="16" fill="#38bdf8" fontSize="14" fontWeight="black">-</text>
              <text x="0" y="50" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="bold">
                {voltage}V DC
              </text>
            </g>

            {/* KNIFE SWITCH (Top wire at x=400) */}
            <g transform="translate(400, 80)">
              <circle cx="-20" cy="0" r="5" fill="#f59e0b" />
              <circle cx="20" cy="0" r="5" fill="#f59e0b" />
              {isSwitchClosed ? (
                <line x1="-20" y1="0" x2="20" y2="0" stroke="#f59e0b" strokeWidth="4" />
              ) : (
                <line x1="-20" y1="0" x2="10" y2="-28" stroke="#ef4444" strokeWidth="4" />
              )}
              <text x="0" y="-30" textAnchor="middle" fill="#94a3b8" fontSize="10" fontWeight="bold">
                Knife Switch
              </text>
            </g>

            {/* INCANDESCENT LIGHT BULB (Right side at y=210) */}
            <g transform="translate(580, 210)">
              {/* Light glow halo */}
              {isSwitchClosed && power > 0 && (
                <circle
                  cx="0"
                  cy="0"
                  r={28 + Math.min(45, power * 1.5)}
                  fill="url(#bulbGlow)"
                  className="transition-all duration-200"
                  style={{
                    fill: `rgba(251, 191, 36, ${Math.min(0.85, 0.2 + power / 30)})`,
                  }}
                />
              )}
              {/* Glass bulb shell */}
              <circle
                cx="0"
                cy="0"
                r="30"
                fill={isSwitchClosed && power > 0 ? '#fef08a' : '#1e293b'}
                stroke="#64748b"
                strokeWidth="2.5"
                opacity={isSwitchClosed && power > 0 ? 0.95 : 0.6}
              />
              {/* Filament wire */}
              <path
                d="M -10 15 L -6 -6 L 0 6 L 6 -6 L 10 15"
                fill="none"
                stroke={isSwitchClosed && power > 0 ? '#ef4444' : '#475569'}
                strokeWidth="2.5"
              />
              {/* Socket base */}
              <rect x="-12" y="28" width="24" height="12" fill="#475569" rx="2" />
              <text x="0" y="55" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="bold">
                Lamp ({power.toFixed(0)}W)
              </text>
            </g>

            {/* VARIABLE RESISTOR (Bottom wire at x=350) */}
            <g transform="translate(350, 340)">
              {/* Resistor zigzag */}
              <path
                d="M -50 0 L -40 -15 L -20 15 L 0 -15 L 20 15 L 40 -15 L 50 0"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="4"
              />
              {/* Rheostat arrow */}
              <line x1="-15" y1="28" x2="15" y2="-28" stroke="#ef4444" strokeWidth="2.5" />
              <polygon points="17,-32 10,-24 20,-20" fill="#ef4444" />
              <text x="0" y="45" textAnchor="middle" fill="#94a3b8" fontSize="11" fontWeight="bold">
                Resistor R = {resistance} Ω
              </text>
            </g>
          </svg>
        </div>

        {/* Right Col: Sliders & Theory */}
        <div className="flex flex-col gap-3">
          {/* Sliders */}
          <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col gap-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-cyan-400">
              Circuit Controls
            </h4>

            {/* Voltage Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Voltage Source (V)</span>
                <span className="text-amber-400 font-mono">{voltage.toFixed(1)} V</span>
              </div>
              <input
                type="range"
                min="1.5"
                max="36"
                step="0.5"
                value={voltage}
                onChange={(e) => setVoltage(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
              />
            </div>

            {/* Resistance Slider */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Resistance (R)</span>
                <span className="text-cyan-400 font-mono">{resistance.toFixed(0)} Ω</span>
              </div>
              <input
                type="range"
                min="2"
                max="100"
                step="1"
                value={resistance}
                onChange={(e) => setResistance(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Quick voltage presets */}
            <div className="flex gap-2 pt-1">
              {[
                { v: 1.5, label: '1.5V (AA)' },
                { v: 9, label: '9V' },
                { v: 12, label: '12V (Car)' },
                { v: 24, label: '24V' },
              ].map((p) => (
                <button
                  key={p.v}
                  onClick={() => {
                    soundManager.playClick();
                    setVoltage(p.v);
                  }}
                  className="flex-1 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-bold text-slate-300 border border-white/5"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Ohm's Law Explanation */}
          <div className="glass-panel p-4 rounded-2xl border border-white/10 flex-1 flex flex-col justify-between text-xs">
            <div>
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold mb-1.5 uppercase tracking-wide">
                <Zap className="w-4 h-4 text-amber-400" /> Ohm's Law Formula:
              </div>
              <div className="font-mono text-center text-sm font-bold bg-slate-900/90 text-cyan-300 p-2 rounded-lg border border-white/5 mb-2">
                I = V / R &nbsp;|&nbsp; P = V · I
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Current (<span className="text-cyan-400 font-semibold">I</span>) is directly proportional to Voltage (<span className="text-amber-400 font-semibold">V</span>) and inversely proportional to Resistance (<span className="text-cyan-300 font-semibold">R</span>). Doubling the resistance cuts the electric current and bulb brightness by half!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
