import React, { useState, useEffect, useRef } from 'react';
import { soundManager } from '../../audio/SoundManager';
import confetti from 'canvas-confetti';
import { 
  Rocket, 
  RotateCcw, 
  Play, 
  Pause, 
  Flame, 
  Globe2, 
  Moon, 
  Sparkles, 
  Zap, 
  Compass, 
  Gauge, 
  Timer, 
  Sliders, 
  Atom, 
  AlertCircle,
  HelpCircle,
  Layers,
  CheckCircle2
} from 'lucide-react';

interface CelestialBody {
  id: string;
  name: string;
  massKg: number;
  radiusKm: number;
  surfaceGravity: number; // m/s^2
  color: string;
  glowColor: string;
}

const CELESTIAL_BODIES: CelestialBody[] = [
  { id: 'earth', name: 'Earth', massKg: 5.972e24, radiusKm: 6371, surfaceGravity: 9.81, color: '#3b82f6', glowColor: '#60a5fa' },
  { id: 'moon', name: 'The Moon', massKg: 7.342e22, radiusKm: 1737, surfaceGravity: 1.62, color: '#94a3b8', glowColor: '#cbd5e1' },
  { id: 'mars', name: 'Mars', massKg: 6.417e23, radiusKm: 3389, surfaceGravity: 3.72, color: '#ef4444', glowColor: '#f87171' },
  { id: 'jupiter', name: 'Jupiter', massKg: 1.898e27, radiusKm: 69911, surfaceGravity: 24.79, color: '#f59e0b', glowColor: '#fbbf24' },
  { id: 'void', name: 'Zero-G Void', massKg: 0, radiusKm: 1000, surfaceGravity: 0.0, color: '#6366f1', glowColor: '#818cf8' },
];

export const UnthinkableCosmicPhysics: React.FC = () => {
  // Launch Settings
  const [velocityKmS, setVelocityKmS] = useState<number>(11.2); // Default to escape velocity (11.2 km/s)
  const [launchAngleDeg, setLaunchAngleDeg] = useState<number>(45);
  const [selectedBody, setSelectedBody] = useState<CelestialBody>(CELESTIAL_BODIES[0]);
  const [projectileType, setProjectileType] = useState<'baseball' | 'cannonball' | 'senku_capsule'>('baseball');
  const [airResistanceOn, setAirResistanceOn] = useState<boolean>(true);
  const [godModeZeroG, setGodModeZeroG] = useState<boolean>(false);
  
  // Simulation State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [outcome, setOutcome] = useState<string | null>(null);
  const [outcomeType, setOutcomeType] = useState<'ground' | 'orbit' | 'moon' | 'interstellar' | null>(null);
  
  // Real-time Canvas Simulation
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // Ball position in simulation coordinates
  const simState = useRef({
    x: 120, // Earth launch pad
    y: 420,
    vx: 0,
    vy: 0,
    trail: [] as { x: number; y: number }[],
    t: 0,
    landed: false,
  });

  // Calculate Relativistic Lorentz Factor γ = 1 / sqrt(1 - v^2/c^2)
  const speedOfLightKmS = 300000;
  const speedRatio = Math.min(0.9999, velocityKmS / speedOfLightKmS);
  const lorentzFactor = 1 / Math.sqrt(Math.max(0.0001, 1 - Math.pow(speedRatio, 2)));
  const timeDilationPercent = ((lorentzFactor - 1) * 100).toFixed(4);

  // Escape velocity of current body: v = sqrt(2 * G * M / R)
  const G = 6.6743e-11;
  const escapeVelocityKmS = selectedBody.massKg > 0 
    ? Math.sqrt((2 * G * selectedBody.massKg) / (selectedBody.radiusKm * 1000)) / 1000 
    : 0;

  // Orbital velocity: v = sqrt(G * M / R)
  const orbitalVelocityKmS = escapeVelocityKmS / Math.SQRT2;

  // Reset Simulation
  const handleReset = () => {
    setIsRunning(false);
    setOutcome(null);
    setOutcomeType(null);
    simState.current = {
      x: 120,
      y: 420,
      vx: 0,
      vy: 0,
      trail: [],
      t: 0,
      landed: false,
    };
    drawCanvas();
  };

  // Launch Ball
  const handleLaunch = () => {
    handleReset();
    setIsRunning(true);
    soundManager.playDoorSlide();

    const rad = (launchAngleDeg * Math.PI) / 180;
    // Scale visual speed
    const visualSpeed = Math.min(18, Math.max(1.8, velocityKmS * 0.45));
    simState.current.vx = Math.cos(rad) * visualSpeed;
    simState.current.vy = -Math.sin(rad) * visualSpeed;
    simState.current.t = 0;
    simState.current.landed = false;
  };

  // Apply Quick Presets
  const setPreset = (vKmS: number, angle: number, desc: string) => {
    setVelocityKmS(vKmS);
    setLaunchAngleDeg(angle);
    handleReset();
  };

  // Canvas Drawing & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width;
    let height = canvas.height;

    const render = () => {
      // 1. Clear background
      ctx.fillStyle = '#050811';
      ctx.fillRect(0, 0, width, height);

      // Starfield dots
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let i = 0; i < 40; i++) {
        const sx = ((i * 137.5) % width);
        const sy = ((i * 269.3) % height);
        ctx.fillRect(sx, sy, 1.2, 1.2);
      }

      // 2. Draw Earth (or Celestial Body) on the Left
      const earthX = 120;
      const earthY = 560;
      const earthR = 140;

      // Earth Glow Atmosphere
      const grad = ctx.createRadialGradient(earthX, earthY, earthR * 0.8, earthX, earthY, earthR * 1.35);
      grad.addColorStop(0, selectedBody.color);
      grad.addColorStop(0.7, 'rgba(59, 130, 246, 0.25)');
      grad.addColorStop(1, 'transparent');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(earthX, earthY, earthR * 1.35, 0, Math.PI * 2);
      ctx.fill();

      // Earth Body
      ctx.fillStyle = selectedBody.color;
      ctx.beginPath();
      ctx.arc(earthX, earthY, earthR, 0, Math.PI * 2);
      ctx.fill();

      // Earth surface label
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(selectedBody.name, earthX, earthY - 40);

      // 3. Draw The Moon on the Far Right Upper Corner
      const moonX = width - 110;
      const moonY = 130;
      const moonR = 40;

      // Moon Gravity Field Radius
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.2)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR * 2.2, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Moon Body
      const moonGrad = ctx.createRadialGradient(moonX - 10, moonY - 10, 5, moonX, moonY, moonR);
      moonGrad.addColorStop(0, '#f1f5f9');
      moonGrad.addColorStop(1, '#64748b');
      ctx.fillStyle = moonGrad;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 11px monospace';
      ctx.fillText('TARGET: MOON', moonX, moonY + moonR + 18);
      ctx.font = '9px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('384,400 km', moonX, moonY + moonR + 30);

      // 4. Draw Launch Pad Cannon on Earth
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      const rad = (launchAngleDeg * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(earthX, 420);
      ctx.lineTo(earthX + Math.cos(rad) * 26, 420 - Math.sin(rad) * 26);
      ctx.stroke();

      // 5. Physics Simulation Step
      if (isRunning && !simState.current.landed) {
        const s = simState.current;
        s.trail.push({ x: s.x, y: s.y });
        if (s.trail.length > 300) s.trail.shift();

        // Gravitational pull toward Earth center
        const dxE = earthX - s.x;
        const dyE = earthY - s.y;
        const distE = Math.sqrt(dxE * dxE + dyE * dyE);

        // Gravitational pull toward Moon center
        const dxM = moonX - s.x;
        const dyM = moonY - s.y;
        const distM = Math.sqrt(dxM * dxM + dyM * dyM);

        let gEff = godModeZeroG ? 0 : (selectedBody.surfaceGravity / 9.81) * 0.14;
        
        // Earth Gravity Vector (inverse square approximation)
        if (distE > 20) {
          const earthPull = gEff * Math.pow(earthR / distE, 1.8);
          s.vx += (dxE / distE) * earthPull;
          s.vy += (dyE / distE) * earthPull;
        }

        // Moon Gravity Well capture
        if (distM < moonR * 2.8) {
          const moonPull = 0.28 * Math.pow(moonR / Math.max(15, distM), 1.5);
          s.vx += (dxM / distM) * moonPull;
          s.vy += (dyM / distM) * moonPull;
        }

        // Atmospheric drag (only close to Earth surface)
        if (airResistanceOn && distE < earthR * 1.35) {
          s.vx *= 0.994;
          s.vy *= 0.994;
        }

        s.x += s.vx;
        s.y += s.vy;
        s.t += 1;

        // Collision Check: Crash back onto Earth
        if (distE <= earthR && s.t > 8) {
          s.landed = true;
          setIsRunning(false);
          setOutcomeType('ground');
          soundManager.playDoorSlide();
          setOutcome(`Fell back to ${selectedBody.name}! Gravity pulled it down after travel.`);
        }

        // Collision Check: Hit the Moon!
        if (distM <= moonR) {
          s.landed = true;
          setIsRunning(false);
          setOutcomeType('moon');
          soundManager.playChimeSuccess();
          confetti({ particleCount: 75, spread: 80, origin: { x: 0.8, y: 0.3 } });
          setOutcome('🌕 MISSION ACCOMPLISHED! THE BALL HAS LANDED ON THE MOON!');
        }

        // Orbit Check: Stable orbital looping
        if (s.t > 380 && distE > earthR * 1.2 && distE < width * 0.8 && distM > moonR * 3) {
          s.landed = true;
          setIsRunning(false);
          setOutcomeType('orbit');
          soundManager.playChimeSuccess();
          setOutcome('🛰️ SATELLITE ORBIT ACHIEVED! The ball is falling around Earth perpetually!');
        }

        // Escape Check: Interstellar Escape
        if (s.x > width + 40 || s.y < -40) {
          s.landed = true;
          setIsRunning(false);
          setOutcomeType('interstellar');
          soundManager.playChimeSuccess();
          setOutcome('🚀 SOLAR ESCAPE VELOCITY! The ball has escaped into deep interstellar space!');
        }
      }

      // 6. Draw Trajectory Trail
      if (simState.current.trail.length > 1) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2;
        ctx.beginPath();
        simState.current.trail.forEach((p, idx) => {
          if (idx === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();

        // Neon Glow on trajectory
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 6;
        ctx.stroke();
      }

      // 7. Draw the Moving Projectile
      const s = simState.current;
      ctx.save();
      ctx.translate(s.x, s.y);

      // Projectile Glow
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 15;
      ctx.beginPath();
      ctx.arc(0, 0, projectileType === 'baseball' ? 6 : 9, 0, Math.PI * 2);
      ctx.fill();

      // Relativistic Fire Tail when velocity is extreme
      if (velocityKmS > 100) {
        ctx.fillStyle = '#ec4899';
        ctx.beginPath();
        ctx.arc(-8, 0, 4, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isRunning, velocityKmS, launchAngleDeg, selectedBody, projectileType, airResistanceOn, godModeZeroG]);

  const drawCanvas = () => {
    // Re-renders naturally through react loop
  };

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-slate-950 text-slate-100 select-none p-2 sm:p-4 font-mono">
      
      {/* Top Banner: Unthinkable Physics Header */}
      <div className="flex items-center justify-between mb-3 z-10 flex-wrap gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-950/80 border border-cyan-500/50 shadow-[0_0_20px_rgba(6,182,212,0.4)]">
            <Rocket className="w-6 h-6 text-cyan-400 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-600/40">
                UNTHINKABLE PHYSICS SIMULATOR
              </span>
              <span className="text-[10px] text-pink-400 bg-pink-950/80 px-2 py-0.5 rounded-full border border-pink-600/40 font-bold">
                Cosmic Scale & Relativity
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-white tracking-wide mt-0.5">
              Can You Throw a Ball to the Moon?
            </h2>
          </div>
        </div>

        {/* Quick Presets for Kids & Students */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={() => setPreset(0.035, 45, 'Human Pitch')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              velocityKmS === 0.035 
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-lg shadow-amber-500/30' 
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            🥎 Human Pitch (35 m/s)
          </button>
          <button
            onClick={() => setPreset(7.9, 45, 'Orbital Speed')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              velocityKmS === 7.9 
                ? 'bg-cyan-500 text-slate-950 border-cyan-400 font-black shadow-lg shadow-cyan-500/30' 
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            🛰️ Orbital Velocity (7.9 km/s)
          </button>
          <button
            onClick={() => setPreset(11.2, 48, 'Moon Escape')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              velocityKmS === 11.2 
                ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-lg shadow-emerald-500/30' 
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            🌕 Moon Escape Velocity (11.2 km/s)
          </button>
          <button
            onClick={() => setPreset(270000, 45, 'Relativistic')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border ${
              velocityKmS === 270000 
                ? 'bg-pink-500 text-slate-950 border-pink-400 font-black shadow-lg shadow-pink-500/30' 
                : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
            }`}
          >
            ⚡ 90% Speed of Light (0.9c)
          </button>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
        
        {/* Left Side: Real-Time Orbital Canvas (8 cols) */}
        <div className="lg:col-span-8 flex flex-col rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl relative overflow-hidden">
          <canvas
            ref={canvasRef}
            width={900}
            height={520}
            className="w-full h-full object-cover"
          />

          {/* Dynamic Outcome Banner Overlay */}
          {outcome && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 w-11/12 max-w-lg">
              <div className={`p-3.5 rounded-xl border shadow-2xl backdrop-blur-md text-center transition-all animate-bounce ${
                outcomeType === 'moon' 
                  ? 'bg-emerald-950/90 border-emerald-400 text-emerald-200' 
                  : outcomeType === 'orbit'
                  ? 'bg-cyan-950/90 border-cyan-400 text-cyan-200'
                  : outcomeType === 'interstellar'
                  ? 'bg-purple-950/90 border-purple-400 text-purple-200'
                  : 'bg-amber-950/90 border-amber-400 text-amber-200'
              }`}>
                <p className="font-black text-xs sm:text-sm tracking-wide">
                  {outcome}
                </p>
              </div>
            </div>
          )}

          {/* Bottom Canvas Controls Bar */}
          <div className="absolute bottom-3 left-4 right-4 z-20 flex items-center justify-between flex-wrap gap-2 pointer-events-auto">
            <div className="flex items-center gap-2">
              <button
                onClick={handleLaunch}
                disabled={isRunning}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-500/25 transition-all disabled:opacity-50"
              >
                <Play className="w-4 h-4 fill-current" /> Launch Projectile
              </button>
              <button
                onClick={handleReset}
                className="px-3.5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Reset
              </button>
            </div>

            {/* Real-time Velocity Telemetry Readout */}
            <div className="flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-950/85 border border-cyan-500/40 text-[11px] shadow-lg backdrop-blur-md">
              <div className="flex items-center gap-1.5 text-cyan-400">
                <Gauge className="w-4 h-4" />
                <span className="font-bold">v = {velocityKmS >= 1 ? `${velocityKmS.toLocaleString()} km/s` : `${(velocityKmS * 1000).toFixed(0)} m/s`}</span>
              </div>
              <span className="text-slate-600">|</span>
              <div className="flex items-center gap-1.5 text-pink-400">
                <Timer className="w-4 h-4" />
                <span>Time Dilation: +{timeDilationPercent}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Physics Control Deck (4 cols) */}
        <div className="lg:col-span-4 flex flex-col gap-3 min-h-0 overflow-y-auto pr-1">
          
          {/* Velocity & Angle Sliders */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
            <h3 className="text-xs font-black text-cyan-400 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Sliders className="w-4 h-4" /> Launch Parameters
            </h3>

            {/* Launch Velocity Slider */}
            <div className="mb-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Launch Velocity:</span>
                <span className="font-bold text-cyan-300">
                  {velocityKmS >= 1 ? `${velocityKmS} km/s` : `${(velocityKmS * 1000).toFixed(0)} m/s`}
                </span>
              </div>
              <input
                type="range"
                min="0.01"
                max="30"
                step="0.1"
                value={velocityKmS > 30 ? 30 : velocityKmS}
                onChange={(e) => setVelocityKmS(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[9px] text-slate-500 mt-0.5">
                <span>0.01 km/s (Slow)</span>
                <span className="text-cyan-400">7.9 km/s (Orbit)</span>
                <span className="text-emerald-400">11.2 km/s (Moon)</span>
                <span>30 km/s</span>
              </div>
            </div>

            {/* Launch Angle Slider */}
            <div className="mb-2">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Elevation Angle:</span>
                <span className="font-bold text-amber-300">{launchAngleDeg}°</span>
              </div>
              <input
                type="range"
                min="5"
                max="85"
                step="1"
                value={launchAngleDeg}
                onChange={(e) => setLaunchAngleDeg(parseInt(e.target.value))}
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[9px] text-slate-500 mt-0.5">
                <span>5° (Flat)</span>
                <span className="text-amber-400 font-bold">45° (Maximum Range)</span>
                <span>85° (Vertical)</span>
              </div>
            </div>
          </div>

          {/* Celestial Body Gravity Selector */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
            <h3 className="text-xs font-black text-blue-400 uppercase tracking-wider mb-2 flex items-center gap-2">
              <Globe2 className="w-4 h-4" /> Celestial Gravity
            </h3>
            <div className="grid grid-cols-2 gap-1.5">
              {CELESTIAL_BODIES.map((body) => (
                <button
                  key={body.id}
                  onClick={() => {
                    soundManager.playClick();
                    setSelectedBody(body);
                    handleReset();
                  }}
                  className={`p-2 rounded-xl text-left border transition-all text-xs ${
                    selectedBody.id === body.id
                      ? 'border-cyan-400 bg-cyan-950/60 text-white font-bold shadow-lg'
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="font-bold">{body.name}</div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    g = {body.surfaceGravity} m/s²
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Unthinkable "God Mode" Switches */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-purple-500/30 shadow-xl">
            <h3 className="text-xs font-black text-purple-400 uppercase tracking-wider mb-2.5 flex items-center gap-2">
              <Zap className="w-4 h-4" /> Unthinkable "God Mode"
            </h3>
            
            <div className="space-y-2">
              {/* Toggle Air Resistance */}
              <label className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-slate-700">
                <span className="text-xs text-slate-300">Earth Atmospheric Drag</span>
                <input
                  type="checkbox"
                  checked={airResistanceOn}
                  onChange={(e) => setAirResistanceOn(e.target.checked)}
                  className="w-4 h-4 accent-cyan-400 rounded cursor-pointer"
                />
              </label>

              {/* Zero Gravity God Mode */}
              <label className="flex items-center justify-between p-2 rounded-xl bg-slate-950/60 border border-slate-800 cursor-pointer hover:border-purple-600/40">
                <span className="text-xs text-purple-300 font-bold">Turn OFF Gravity Entirely!</span>
                <input
                  type="checkbox"
                  checked={godModeZeroG}
                  onChange={(e) => setGodModeZeroG(e.target.checked)}
                  className="w-4 h-4 accent-purple-400 rounded cursor-pointer"
                />
              </label>
            </div>
          </div>

          {/* Senku's Scientific Explanation Card for STEM */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-950/60 to-slate-900/90 border border-cyan-500/30 text-xs shadow-xl">
            <div className="flex items-center gap-2 mb-1.5 text-cyan-400 font-bold">
              <Sparkles className="w-4 h-4" />
              <span>Senku's Cosmic Formula</span>
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans mb-2">
              To throw a ball to the Moon from Earth, you need <strong>Escape Velocity ($v_e$)</strong>:
            </p>
            <div className="p-2 rounded-lg bg-slate-950 border border-cyan-500/40 text-center font-mono text-cyan-300 text-xs font-bold mb-2">
              vₑ = √(2 · G · M / R) ≈ 11.2 km/s (40,320 km/h)
            </div>
            <p className="text-[10px] text-slate-400 font-sans leading-tight">
              A human throws at 35 m/s. But at 11,200 m/s, kinetic energy overcomes Earth's gravitational chokehold and lands straight on the Moon!
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
