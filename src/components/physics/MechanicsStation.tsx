import React, { useState, useEffect, useRef } from 'react';
import { soundManager } from '../../audio/SoundManager';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Sliders, 
  TrendingUp, 
  Activity, 
  ArrowRight, 
  Layers, 
  Compass, 
  HelpCircle,
  Zap,
  Flame
} from 'lucide-react';

export const MechanicsStation: React.FC = () => {
  // Mode: Horizontal Flat Surface, Inclined Ramp, or Pulley Atwood
  const [setupMode, setSetupMode] = useState<'flat' | 'inclined' | 'pulley'>('flat');

  // Simulation Parameters
  const [mass, setMass] = useState<number>(5.0); // kg
  const [hangingMass, setHangingMass] = useState<number>(3.0); // kg (for pulley)
  const [appliedForce, setAppliedForce] = useState<number>(40.0); // N
  const [frictionCoeff, setFrictionCoeff] = useState<number>(0.20); // mu
  const [inclineAngle, setInclineAngle] = useState<number>(30); // degrees
  const [gravity] = useState<number>(9.8); // m/s^2

  // Simulation State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [positionX, setPositionX] = useState<number>(0.0); // meters (0 to 10m)
  const [velocity, setVelocity] = useState<number>(0.0); // m/s
  const [timeElapsed, setTimeElapsed] = useState<number>(0.0); // seconds

  const animRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // Calculate dynamic forces
  const calculateForces = () => {
    const rad = (inclineAngle * Math.PI) / 180;
    let normalForce = 0;
    let frictionMax = 0;
    let drivingForce = 0;
    let netForce = 0;
    let acceleration = 0;

    if (setupMode === 'flat') {
      normalForce = mass * gravity;
      frictionMax = frictionCoeff * normalForce;
      
      if (appliedForce > frictionMax) {
        netForce = appliedForce - frictionMax;
        acceleration = netForce / mass;
      } else if (appliedForce < -frictionMax) {
        netForce = appliedForce + frictionMax;
        acceleration = netForce / mass;
      } else {
        netForce = 0;
        acceleration = 0;
      }
    } else if (setupMode === 'inclined') {
      normalForce = mass * gravity * Math.cos(rad);
      frictionMax = frictionCoeff * normalForce;
      const gravityParallel = mass * gravity * Math.sin(rad); // pulling down ramp
      drivingForce = appliedForce - gravityParallel; // positive pushes up ramp

      if (Math.abs(drivingForce) > frictionMax) {
        const frictionDirection = drivingForce > 0 ? -1 : 1;
        netForce = drivingForce + (frictionDirection * frictionMax);
        acceleration = netForce / mass;
      } else {
        netForce = 0;
        acceleration = 0;
      }
    } else if (setupMode === 'pulley') {
      // Half-Atwood: mass m1 on table connected via pulley to hanging mass m2
      normalForce = mass * gravity;
      frictionMax = frictionCoeff * normalForce;
      const hangingGravity = hangingMass * gravity;
      drivingForce = hangingGravity;

      if (drivingForce > frictionMax) {
        netForce = drivingForce - frictionMax;
        acceleration = netForce / (mass + hangingMass);
      } else {
        netForce = 0;
        acceleration = 0;
      }
    }

    return {
      normalForce,
      frictionForce: Math.min(frictionMax, Math.abs(drivingForce || appliedForce)),
      netForce,
      acceleration: Math.max(0, acceleration), // forward track
    };
  };

  const forces = calculateForces();

  // Physics animation loop
  useEffect(() => {
    if (!isRunning) {
      lastTimeRef.current = null;
      return;
    }

    const updatePhysics = (timestamp: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = timestamp;
      }
      const dt = Math.min(0.05, (timestamp - lastTimeRef.current) / 1000); // capped at 50ms
      lastTimeRef.current = timestamp;

      setVelocity((v) => {
        const nextV = v + forces.acceleration * dt;
        setPositionX((x) => {
          const nextX = x + nextV * dt;
          if (nextX >= 10.0) {
            setIsRunning(false);
            soundManager.playChimeSuccess();
            return 10.0;
          }
          return nextX;
        });
        return nextV;
      });

      setTimeElapsed((t) => t + dt);
      animRef.current = requestAnimationFrame(updatePhysics);
    };

    animRef.current = requestAnimationFrame(updatePhysics);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isRunning, forces.acceleration]);

  const handleReset = () => {
    soundManager.playClick();
    setIsRunning(false);
    setPositionX(0.0);
    setVelocity(0.0);
    setTimeElapsed(0.0);
  };

  const handleTogglePlay = () => {
    soundManager.playClick();
    if (positionX >= 10.0) {
      handleReset();
    }
    setIsRunning(!isRunning);
  };

  const kineticEnergy = 0.5 * mass * velocity * velocity;
  const workDone = appliedForce * positionX;

  return (
    <div className="flex-1 flex flex-col gap-3 min-h-0 select-none">
      
      {/* Top Controls Bar */}
      <div className="stone-panel p-3 rounded-2xl border border-cyan-500/30 flex flex-wrap items-center justify-between gap-3 shadow-xl backdrop-blur-md">
        
        {/* Setup Mode Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
            Mechanics Apparatus:
          </span>
          <div className="flex rounded-xl bg-slate-900/90 p-1 border border-slate-700">
            {[
              { id: 'flat', label: '1. Flat Surface' },
              { id: 'inclined', label: '2. Inclined Ramp' },
              { id: 'pulley', label: '3. Pulley System' },
            ].map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  soundManager.playClick();
                  setSetupMode(m.id as any);
                  handleReset();
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                  setupMode === m.id
                    ? 'bg-cyan-500 text-slate-950 font-black shadow-lg shadow-cyan-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleTogglePlay}
            className={`px-4 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-xl transition-all ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black'
                : 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-slate-950 font-black shadow-emerald-500/20'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5" /> Pause
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" /> Push & Observe
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
            title="Reset Simulation"
          >
            <RotateCcw className="w-4 h-4 text-cyan-400" />
          </button>
        </div>

      </div>

      {/* Main Workbench Stage + Controls Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
        
        {/* Left Column (8 cols): Interactive Visual Physics Simulation Stage */}
        <div className="lg:col-span-8 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md p-4 flex flex-col justify-between shadow-2xl relative overflow-hidden">
          
          {/* Header Track HUD */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                Real-Time Kinematics & Free-Body Vectors
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="text-slate-400">Position: <strong className="text-cyan-400">{positionX.toFixed(2)} m</strong></span>
              <span className="text-slate-400">Velocity: <strong className="text-emerald-400">{velocity.toFixed(2)} m/s</strong></span>
              <span className="text-slate-400">Acceleration: <strong className="text-amber-400">{forces.acceleration.toFixed(2)} m/s²</strong></span>
            </div>
          </div>

          {/* Graphical Simulation Viewport */}
          <div className="relative flex-1 rounded-xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800/80 overflow-hidden flex items-center justify-center min-h-[300px]">
            
            {/* SVG Visual Stage */}
            <svg viewBox="0 0 800 360" className="w-full h-full">
              <defs>
                <linearGradient id="rampGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#334155" />
                  <stop offset="100%" stopColor="#1e293b" />
                </linearGradient>
                <linearGradient id="blockGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="100%" stopColor="#0284c7" />
                </linearGradient>
                {/* Arrow markers */}
                <marker id="arrow-green" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#22c55e" />
                </marker>
                <marker id="arrow-red" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
                </marker>
                <marker id="arrow-blue" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#3b82f6" />
                </marker>
                <marker id="arrow-amber" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
                </marker>
              </defs>

              {/* Grid Lines */}
              <g stroke="#334155" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.4">
                {[50, 100, 150, 200, 250, 300, 350].map((y) => (
                  <line key={y} x1="0" y1={y} x2="800" y2={y} />
                ))}
                {[100, 200, 300, 400, 500, 600, 700].map((x) => (
                  <line key={x} x1={x} y1="0" x2={x} y2="360" />
                ))}
              </g>

              {/* --- 1. FLAT SURFACE RENDERING --- */}
              {setupMode === 'flat' && (
                <g>
                  {/* Track Surface Table */}
                  <rect x="50" y="240" width="700" height="24" fill="url(#rampGrad)" stroke="#475569" strokeWidth="2" rx="4" />
                  
                  {/* Distance Meter Markings */}
                  {[0, 2, 4, 6, 8, 10].map((m) => {
                    const xPos = 80 + (m / 10) * 580;
                    return (
                      <g key={m}>
                        <line x1={xPos} y1="240" x2={xPos} y2="252" stroke="#94a3b8" strokeWidth="1.5" />
                        <text x={xPos} y="260" fill="#94a3b8" fontSize="10" fontFamily="monospace" textAnchor="middle">
                          {m}m
                        </text>
                      </g>
                    );
                  })}

                  {/* Sliding Wooden Block */}
                  {(() => {
                    const blockX = 80 + (positionX / 10) * 580;
                    const blockY = 180;
                    const bSize = Math.max(40, Math.min(70, 35 + mass * 2.5));
                    return (
                      <g>
                        {/* Block Shadow */}
                        <ellipse cx={blockX + bSize / 2} cy="240" rx={bSize / 2 + 5} ry="4" fill="#000000" opacity="0.5" />
                        
                        {/* Block Body */}
                        <rect
                          x={blockX}
                          y={240 - bSize}
                          width={bSize}
                          height={bSize}
                          fill="url(#blockGrad)"
                          stroke="#38bdf8"
                          strokeWidth="2.5"
                          rx="6"
                        />
                        <text
                          x={blockX + bSize / 2}
                          y={240 - bSize / 2 + 4}
                          fill="#ffffff"
                          fontSize="12"
                          fontWeight="bold"
                          fontFamily="monospace"
                          textAnchor="middle"
                        >
                          {mass} kg
                        </text>

                        {/* Free-Body Force Vector Arrows */}
                        {/* 1. Applied Force Arrow (Right) */}
                        {appliedForce > 0 && (
                          <g>
                            <line
                              x1={blockX + bSize}
                              y1={240 - bSize / 2}
                              x2={blockX + bSize + Math.min(100, appliedForce * 0.7)}
                              y2={240 - bSize / 2}
                              stroke="#22c55e"
                              strokeWidth="3.5"
                              markerEnd="url(#arrow-green)"
                            />
                            <text
                              x={blockX + bSize + Math.min(100, appliedForce * 0.7) + 5}
                              y={240 - bSize / 2 - 6}
                              fill="#22c55e"
                              fontSize="11"
                              fontWeight="bold"
                              fontFamily="monospace"
                            >
                              F_app ({appliedForce}N)
                            </text>
                          </g>
                        )}

                        {/* 2. Friction Force Arrow (Left) */}
                        {forces.frictionForce > 0 && (
                          <g>
                            <line
                              x1={blockX}
                              y1={240 - 2}
                              x2={blockX - Math.min(80, forces.frictionForce * 1.5)}
                              y2={240 - 2}
                              stroke="#ef4444"
                              strokeWidth="3"
                              markerEnd="url(#arrow-red)"
                            />
                            <text
                              x={blockX - Math.min(80, forces.frictionForce * 1.5) - 5}
                              y={240 - 8}
                              fill="#ef4444"
                              fontSize="10"
                              fontWeight="bold"
                              fontFamily="monospace"
                              textAnchor="end"
                            >
                              f_k ({forces.frictionForce.toFixed(1)}N)
                            </text>
                          </g>
                        )}

                        {/* 3. Normal Force Arrow (Up) */}
                        <line
                          x1={blockX + bSize / 2}
                          y1={240 - bSize}
                          x2={blockX + bSize / 2}
                          y2={240 - bSize - 45}
                          stroke="#3b82f6"
                          strokeWidth="2.5"
                          markerEnd="url(#arrow-blue)"
                        />
                        <text
                          x={blockX + bSize / 2 + 5}
                          y={240 - bSize - 45}
                          fill="#3b82f6"
                          fontSize="10"
                          fontFamily="monospace"
                        >
                          N ({forces.normalForce.toFixed(0)}N)
                        </text>

                        {/* 4. Gravity Arrow (Down) */}
                        <line
                          x1={blockX + bSize / 2}
                          y1={240}
                          x2={blockX + bSize / 2}
                          y2={240 + 45}
                          stroke="#f59e0b"
                          strokeWidth="2.5"
                          markerEnd="url(#arrow-amber)"
                        />
                        <text
                          x={blockX + bSize / 2 + 5}
                          y={240 + 52}
                          fill="#f59e0b"
                          fontSize="10"
                          fontFamily="monospace"
                        >
                          mg ({(mass * gravity).toFixed(0)}N)
                        </text>
                      </g>
                    );
                  })()}
                </g>
              )}

              {/* --- 2. INCLINED RAMP RENDERING --- */}
              {setupMode === 'inclined' && (
                <g>
                  {/* Inclined Ramp Wedge */}
                  {(() => {
                    const startX = 120;
                    const endX = 680;
                    const baseY = 280;
                    const rampH = Math.tan((inclineAngle * Math.PI) / 180) * (endX - startX) * 0.45;
                    const topY = Math.max(60, baseY - rampH);

                    return (
                      <g>
                        {/* Triangle Ramp */}
                        <polygon
                          points={`${startX},${baseY} ${endX},${baseY} ${startX},${topY}`}
                          fill="url(#rampGrad)"
                          stroke="#475569"
                          strokeWidth="2"
                        />
                        <line x1={startX} y1={baseY} x2={endX} y2={baseY} stroke="#94a3b8" strokeWidth="2" />
                        
                        {/* Angle Arc Label */}
                        <path
                          d={`M ${startX + 60},${baseY} A 60 60 0 0 0 ${startX + 50},${baseY - 25}`}
                          fill="none"
                          stroke="#f59e0b"
                          strokeWidth="2"
                        />
                        <text x={startX + 75} y={baseY - 10} fill="#f59e0b" fontSize="12" fontFamily="monospace" fontWeight="bold">
                          θ = {inclineAngle}°
                        </text>

                        {/* Block Sliding along Hypotenuse */}
                        {(() => {
                          const t = positionX / 10;
                          const bx = startX + t * (endX - startX) * 0.8;
                          const by = topY + t * (baseY - topY) * 0.8;
                          const bSize = 45;

                          return (
                            <g transform={`translate(${bx}, ${by}) rotate(${inclineAngle})`}>
                              <rect
                                x={-bSize / 2}
                                y={-bSize}
                                width={bSize}
                                height={bSize}
                                fill="url(#blockGrad)"
                                stroke="#38bdf8"
                                strokeWidth="2"
                                rx="4"
                              />
                              <text
                                x="0"
                                y={-bSize / 2 + 4}
                                fill="#ffffff"
                                fontSize="11"
                                fontWeight="bold"
                                fontFamily="monospace"
                                textAnchor="middle"
                              >
                                {mass}kg
                              </text>
                            </g>
                          );
                        })()}
                      </g>
                    );
                  })()}
                </g>
              )}

              {/* --- 3. PULLEY SYSTEM RENDERING --- */}
              {setupMode === 'pulley' && (
                <g>
                  {/* Table Surface */}
                  <rect x="60" y="160" width="460" height="18" fill="url(#rampGrad)" stroke="#475569" strokeWidth="2" rx="4" />
                  
                  {/* Pulley Wheel at Edge */}
                  <circle cx="520" cy="160" r="16" fill="#64748b" stroke="#cbd5e1" strokeWidth="2.5" />
                  <circle cx="520" cy="160" r="4" fill="#0f172a" />

                  {/* Cord connecting Block to Hanging Mass */}
                  {(() => {
                    const blockX = 80 + (positionX / 10) * 380;
                    const hangingY = 160 + (positionX / 10) * 120 + 20;

                    return (
                      <g>
                        {/* Horizontal Cord */}
                        <line x1={blockX + 45} y1="140" x2="520" y2="140" stroke="#f8fafc" strokeWidth="2.5" />
                        {/* Vertical Hanging Cord */}
                        <line x1="536" y1="160" x2="536" y2={hangingY} stroke="#f8fafc" strokeWidth="2.5" />

                        {/* Cart Block on Table */}
                        <rect x={blockX} y="115" width="45" height="45" fill="url(#blockGrad)" stroke="#38bdf8" strokeWidth="2" rx="4" />
                        <text x={blockX + 22} y="142" fill="#ffffff" fontSize="10" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                          m₁={mass}kg
                        </text>
                        {/* Wheels on Cart */}
                        <circle cx={blockX + 10} cy="160" r="5" fill="#334155" />
                        <circle cx={blockX + 35} cy="160" r="5" fill="#334155" />

                        {/* Hanging Counterweight Mass m2 */}
                        <rect x="522" y={hangingY} width="28" height="34" fill="#f59e0b" stroke="#ffffff" strokeWidth="1.5" rx="3" />
                        <text x="536" y={hangingY + 20} fill="#0f172a" fontSize="9" fontWeight="bold" fontFamily="monospace" textAnchor="middle">
                          {hangingMass}kg
                        </text>
                      </g>
                    );
                  })()}
                </g>
              )}
            </svg>

            {/* Bottom Track Telemetry Pill */}
            <div className="absolute bottom-2 left-4 px-3 py-1 rounded-xl bg-slate-950/80 border border-slate-700 text-xs font-mono text-slate-300">
              Net Force: <strong className="text-amber-400">{forces.netForce.toFixed(1)} N</strong> • Normal: <strong className="text-cyan-400">{forces.normalForce.toFixed(1)} N</strong> • Friction: <strong className="text-red-400">{forces.frictionForce.toFixed(1)} N</strong>
            </div>

          </div>

          {/* Kinetic Energy & Work Done Footnote */}
          <div className="flex items-center justify-between pt-2 mt-2 border-t border-slate-800 text-xs font-mono text-slate-400">
            <span>Work Done (W = F·d): <strong className="text-emerald-400">{workDone.toFixed(1)} J</strong></span>
            <span>Kinetic Energy (½mv²): <strong className="text-cyan-400">{kineticEnergy.toFixed(1)} J</strong></span>
            <span>Time: <strong className="text-slate-200">{timeElapsed.toFixed(2)} s</strong></span>
          </div>

        </div>

        {/* Right Column (4 cols): Parameter Adjustment Sliders & Law Formula */}
        <div className="lg:col-span-4 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md p-4 flex flex-col justify-between shadow-2xl">
          <div>
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
              <span className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold">
                Newtonian Controls
              </span>
              <Sliders className="w-4 h-4 text-cyan-400" />
            </div>

            {/* Sliders Box */}
            <div className="space-y-3.5 mb-4 text-xs font-mono">
              
              {/* 1. Applied Force */}
              {setupMode !== 'pulley' && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-300">Applied Force (F):</span>
                    <strong className="text-emerald-400 font-bold">{appliedForce} N</strong>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="120"
                    step="5"
                    value={appliedForce}
                    onChange={(e) => setAppliedForce(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                  />
                </div>
              )}

              {/* 2. Block Mass m1 */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-300">Block Mass (m):</span>
                  <strong className="text-cyan-400 font-bold">{mass} kg</strong>
                </div>
                <input
                  type="range"
                  min="1"
                  max="20"
                  step="0.5"
                  value={mass}
                  onChange={(e) => setMass(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* 3. Hanging Mass for Pulley */}
              {setupMode === 'pulley' && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-300">Hanging Counterweight (m₂):</span>
                    <strong className="text-amber-400 font-bold">{hangingMass} kg</strong>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="15"
                    step="0.5"
                    value={hangingMass}
                    onChange={(e) => setHangingMass(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                  />
                </div>
              )}

              {/* 4. Surface Friction Coefficient mu */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-300">Friction Coeff (μ):</span>
                  <strong className="text-red-400 font-bold">{frictionCoeff.toFixed(2)}</strong>
                </div>
                <input
                  type="range"
                  min="0.00"
                  max="0.80"
                  step="0.05"
                  value={frictionCoeff}
                  onChange={(e) => setFrictionCoeff(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-red-400"
                />
              </div>

              {/* 5. Ramp Incline Angle theta */}
              {setupMode === 'inclined' && (
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-300">Ramp Incline (θ):</span>
                    <strong className="text-yellow-400 font-bold">{inclineAngle}°</strong>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    step="5"
                    value={inclineAngle}
                    onChange={(e) => setInclineAngle(Number(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-yellow-400"
                  />
                </div>
              )}

            </div>

            {/* Formula & Equation Display Box */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs font-mono">
              <span className="text-[10px] text-slate-400 uppercase font-bold block">
                Newton's Second Law of Motion:
              </span>
              <div className="text-center py-1.5 bg-slate-900 rounded border border-slate-800 font-bold text-amber-300 text-sm">
                F_net = m · a ⟹ a = F_net / m
              </div>
              <div className="text-[11px] text-slate-300 leading-relaxed pt-1">
                F_net = {forces.netForce.toFixed(1)} N
                <br />
                a = {forces.netForce.toFixed(1)} N / {setupMode === 'pulley' ? (mass + hangingMass) : mass} kg
                <br />
                <strong className="text-emerald-400 font-bold text-xs">
                  = {forces.acceleration.toFixed(2)} m/s²
                </strong>
              </div>
            </div>
          </div>

          {/* Senku's Mechanics Insight */}
          <div className="p-2.5 rounded-xl bg-cyan-950/30 border border-cyan-600/40 text-[11px] font-serif text-cyan-200 mt-3">
            <strong className="font-mono text-cyan-300 block text-[10px] uppercase">
              Senku's Physics Rule:
            </strong>
            "Friction is what keeps civilization standing! If applied force is less than static friction (μ·N), the acceleration is zero. Overcome friction, and the laws of motion carry you forward at ten billion percent!"
          </div>

        </div>

      </div>

    </div>
  );
};