import React, { useState, useEffect, useRef } from 'react';
import { soundManager } from '../../audio/SoundManager';
import { Play, Pause, RotateCcw, Clock, Activity, Gauge } from 'lucide-react';

export const PendulumStation: React.FC = () => {
  const [length, setLength] = useState<number>(1.2); // meters
  const [mass, setMass] = useState<number>(0.5); // kg
  const [gravity, setGravity] = useState<number>(9.81); // m/s^2
  const [gravityName, setGravityName] = useState<string>('Earth (9.81 m/s²)');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);

  // Stopwatch state
  const [stopwatchTime, setStopwatchTime] = useState<number>(0);
  const [isStopwatchRunning, setIsStopwatchRunning] = useState<boolean>(false);

  // Physics animation state
  const [angle, setAngle] = useState<number>(0);
  const [period, setPeriod] = useState<number>(0);
  const historyRef = useRef<number[]>([]);
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);

  // Theoretical Period: T = 2 * PI * sqrt(L / g)
  useEffect(() => {
    const calculatedPeriod = 2 * Math.PI * Math.sqrt(length / gravity);
    setPeriod(calculatedPeriod);
  }, [length, gravity]);

  // Stopwatch interval
  useEffect(() => {
    let interval: any;
    if (isStopwatchRunning) {
      interval = setInterval(() => {
        setStopwatchTime((t) => t + 10);
      }, 10);
    }
    return () => clearInterval(interval);
  }, [isStopwatchRunning]);

  // Physics oscillation loop
  useEffect(() => {
    let lastTimestamp = performance.now();
    const initialAmplitude = 0.45; // radians (~25 degrees)

    const loop = (timestamp: number) => {
      const delta = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      if (isPlaying) {
        timeRef.current += delta;
        const omega = Math.sqrt(gravity / length);
        const currentAngle = initialAmplitude * Math.cos(omega * timeRef.current);
        setAngle(currentAngle);

        // Update wave history buffer
        historyRef.current.push(currentAngle);
        if (historyRef.current.length > 80) {
          historyRef.current.shift();
        }
      }

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [length, gravity, isPlaying]);

  const gravityPresets = [
    { name: 'Earth', val: 9.81, label: 'Earth (9.81 m/s²)' },
    { name: 'Moon', val: 1.62, label: 'Moon (1.62 m/s²)' },
    { name: 'Mars', val: 3.71, label: 'Mars (3.71 m/s²)' },
    { name: 'Jupiter', val: 24.79, label: 'Jupiter (24.79 m/s²)' },
  ];

  const formatStopwatch = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const centiseconds = Math.floor((ms % 1000) / 10);
    return `${seconds.toString().padStart(2, '0')}:${centiseconds.toString().padStart(2, '0')}s`;
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Controls Header */}
      <div className="glass-panel p-3.5 rounded-xl flex flex-wrap items-center justify-between gap-4">
        {/* Play / Pause / Reset */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              soundManager.playClick();
              setIsPlaying(!isPlaying);
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow ${
              isPlaying ? 'bg-amber-500 text-slate-950' : 'bg-emerald-500 text-slate-950'
            }`}
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            {isPlaying ? 'Pause Motion' : 'Resume'}
          </button>

          <button
            onClick={() => {
              soundManager.playClick();
              timeRef.current = 0;
            }}
            className="p-1.5 rounded-lg bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition-colors"
            title="Reset Phase"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

        {/* Gravity Preset selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Environment:
          </span>
          <div className="flex rounded-lg bg-slate-900/80 p-0.5 border border-white/10">
            {gravityPresets.map((g) => (
              <button
                key={g.name}
                onClick={() => {
                  soundManager.playClick();
                  setGravity(g.val);
                  setGravityName(g.label);
                }}
                className={`px-2.5 py-1 rounded text-xs font-semibold transition-all ${
                  gravity === g.val
                    ? 'bg-cyan-500 text-slate-950 shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {g.name}
              </button>
            ))}
          </div>
        </div>

        {/* Stopwatch Widget */}
        <div className="flex items-center gap-2 bg-slate-900/90 px-3 py-1.5 rounded-xl border border-white/10">
          <Clock className="w-4 h-4 text-cyan-400" />
          <span className="font-mono text-sm font-bold text-white min-w-[65px]">
            {formatStopwatch(stopwatchTime)}
          </span>
          <button
            onClick={() => {
              soundManager.playClick();
              setIsStopwatchRunning(!isStopwatchRunning);
            }}
            className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 uppercase"
          >
            {isStopwatchRunning ? 'Stop' : 'Start'}
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              setIsStopwatchRunning(false);
              setStopwatchTime(0);
            }}
            className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 hover:text-white uppercase"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Main Simulation Viewport & Sliders */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Left 2 Cols: Pendulum 2D Graphic Display */}
        <div className="lg:col-span-2 glass-panel rounded-2xl relative overflow-hidden flex flex-col items-center justify-center p-4 border border-cyan-500/20 bg-slate-950/70">
          <svg viewBox="0 0 600 400" className="w-full h-full max-h-[380px]">
            {/* Ceiling mount */}
            <rect x="250" y="20" width="100" height="15" rx="3" fill="#334155" stroke="#64748b" strokeWidth="2" />
            <circle cx="300" cy="35" r="5" fill="#f8fafc" />

            {/* Protractor angle markings arc */}
            <path
              d="M 180 160 A 130 130 0 0 1 420 160"
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeDasharray="3 3"
              strokeWidth="2"
            />
            <line x1="300" y1="35" x2="300" y2="350" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />

            {/* Pendulum Cord & Bob */}
            {(() => {
              const pivotX = 300;
              const pivotY = 35;
              const visualLength = 80 + length * 80; // pixels
              const bobX = pivotX + visualLength * Math.sin(angle);
              const bobY = pivotY + visualLength * Math.cos(angle);
              const bobRadius = 14 + mass * 12;

              return (
                <g>
                  {/* String */}
                  <line
                    x1={pivotX}
                    y1={pivotY}
                    x2={bobX}
                    y2={bobY}
                    stroke="#cbd5e1"
                    strokeWidth="2.5"
                  />
                  {/* Metallic Bob */}
                  <defs>
                    <radialGradient id="bobShine" cx="35%" cy="35%" r="65%">
                      <stop offset="0%" stopColor="#f8fafc" />
                      <stop offset="40%" stopColor="#38bdf8" />
                      <stop offset="100%" stopColor="#0369a1" />
                    </radialGradient>
                  </defs>
                  <circle
                    cx={bobX}
                    cy={bobY}
                    r={bobRadius}
                    fill="url(#bobShine)"
                    stroke="#e0f2fe"
                    strokeWidth="2"
                    filter="drop-shadow(0 4px 6px rgba(0,0,0,0.5))"
                  />
                  {/* Bob label */}
                  <text
                    x={bobX}
                    y={bobY + 4}
                    textAnchor="middle"
                    fill="#082f49"
                    fontSize="11"
                    fontWeight="bold"
                  >
                    {mass}kg
                  </text>
                </g>
              );
            })()}
          </svg>

          {/* Real-time Oscillation Wave Mini-Graph */}
          <div className="absolute bottom-3 right-4 w-52 h-20 bg-slate-900/90 rounded-xl p-2 border border-white/10 flex flex-col justify-between">
            <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold uppercase">
              <span className="flex items-center gap-1">
                <Activity className="w-3 h-3 text-cyan-400" /> θ vs Time Wave
              </span>
              <span className="font-mono text-cyan-300">
                {(angle * (180 / Math.PI)).toFixed(1)}°
              </span>
            </div>
            <svg viewBox="0 0 100 40" className="w-full h-10 overflow-visible">
              <line x1="0" y1="20" x2="100" y2="20" stroke="rgba(255,255,255,0.15)" strokeDasharray="2 2" />
              <polyline
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2"
                points={historyRef.current
                  .map((a, i) => `${(i / 80) * 100},${20 - a * 35}`)
                  .join(' ')}
              />
            </svg>
          </div>
        </div>

        {/* Right Col: Parameters & Science Readout */}
        <div className="flex flex-col gap-3">
          {/* Sliders Panel */}
          <div className="glass-panel p-4 rounded-2xl border border-white/10 flex flex-col gap-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-cyan-400">
              Interactive Variables
            </h4>

            {/* String Length */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">String Length (L)</span>
                <span className="text-cyan-400 font-mono">{length.toFixed(2)} m</span>
              </div>
              <input
                type="range"
                min="0.4"
                max="2.5"
                step="0.05"
                value={length}
                onChange={(e) => setLength(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Bob Mass */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300">Bob Mass (m)</span>
                <span className="text-cyan-400 font-mono">{mass.toFixed(2)} kg</span>
              </div>
              <input
                type="range"
                min="0.1"
                max="2.0"
                step="0.1"
                value={mass}
                onChange={(e) => setMass(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Calculated Theoretical Period Display */}
            <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-800/40">
              <span className="text-[10px] text-cyan-300 font-bold uppercase tracking-wider block mb-0.5">
                Theoretical Period (T)
              </span>
              <div className="font-mono text-2xl font-black text-cyan-300">
                {period.toFixed(3)} <span className="text-xs text-cyan-400">seconds</span>
              </div>
              <span className="text-[11px] text-slate-400 mt-1 block font-mono">
                Frequency (f): {(1 / period).toFixed(2)} Hz
              </span>
            </div>
          </div>

          {/* Formula & Rural Science Insight Box */}
          <div className="glass-panel p-4 rounded-2xl border border-white/10 flex-1 flex flex-col justify-between text-xs">
            <div>
              <div className="flex items-center gap-1.5 text-amber-400 font-bold mb-1.5 uppercase tracking-wide">
                <Gauge className="w-4 h-4" /> Scientific Principle:
              </div>
              <div className="font-mono text-center text-sm font-bold bg-slate-900/90 text-cyan-300 p-2 rounded-lg border border-white/5 mb-2">
                T = 2π √(L / g)
              </div>
              <p className="text-slate-300 leading-relaxed text-[11px]">
                Notice how changing the <span className="text-cyan-300 font-semibold">mass (m)</span> has zero effect on the oscillation period! Only the <span className="text-cyan-300 font-semibold">length (L)</span> and <span className="text-cyan-300 font-semibold">gravitational acceleration (g)</span> determine the swing rate.
              </p>
            </div>
            <div className="mt-2 pt-2 border-t border-white/10 text-[10px] text-slate-400">
              Current Environment: <span className="text-slate-200 font-bold">{gravityName}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
