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
  Flame,
  Gauge,
  Infinity,
  RefreshCw
} from 'lucide-react';

export const MechanicsStation: React.FC = () => {
  // Mode: Horizontal Track, Inclined Ramp, or Pulley Atwood
  const [setupMode, setSetupMode] = useState<'flat' | 'inclined' | 'pulley'>('flat');
  
  // Track Mode: 'infinite' (continuous endless motion for zero friction / Newton's 1st law) or 'bounce' (elastic walls)
  const [trackBehavior, setTrackBehavior] = useState<'infinite' | 'bounce'>('infinite');

  // Simulation Parameters
  const [mass, setMass] = useState<number>(5.0); // kg
  const [hangingMass, setHangingMass] = useState<number>(3.0); // kg (for pulley)
  const [appliedForce, setAppliedForce] = useState<number>(30.0); // N
  const [frictionCoeff, setFrictionCoeff] = useState<number>(0.0); // Default to 0 so students can test Newton's 1st law!
  const [inclineAngle, setInclineAngle] = useState<number>(30); // degrees
  const [gravity] = useState<number>(9.8); // m/s^2

  // Simulation State
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [positionX, setPositionX] = useState<number>(0.0); // meters
  const [velocity, setVelocity] = useState<number>(0.0); // m/s
  const [timeElapsed, setTimeElapsed] = useState<number>(0.0); // seconds
  const [direction, setDirection] = useState<1 | -1>(1); // 1 = right, -1 = left for bounce
  
  // Graph telemetry history
  const [graphPoints, setGraphPoints] = useState<{ t: number; x: number; v: number; a: number }[]>([]);

  const animRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const isDraggingBlock = useRef<boolean>(false);
  const dragStartX = useRef<number>(0);

  // Calculate dynamic forces
  const calculateForces = () => {
    const rad = (inclineAngle * Math.PI) / 180;
    let normalForce = 0;
    let frictionMax = 0;
    let netForce = 0;
    let acceleration = 0;

    if (setupMode === 'flat') {
      normalForce = mass * gravity;
      frictionMax = frictionCoeff * normalForce;
      
      // When moving, friction opposes velocity direction
      if (Math.abs(velocity) > 0.01) {
        const opposingFriction = frictionMax * (velocity > 0 ? -1 : 1);
        netForce = appliedForce + opposingFriction;
      } else {
        // Static friction threshold
        if (Math.abs(appliedForce) > frictionMax) {
          netForce = appliedForce - (appliedForce > 0 ? frictionMax : -frictionMax);
        } else {
          netForce = 0;
        }
      }
      acceleration = netForce / mass;

    } else if (setupMode === 'inclined') {
      normalForce = mass * gravity * Math.cos(rad);
      frictionMax = frictionCoeff * normalForce;
      const gravityParallel = mass * gravity * Math.sin(rad); // pulling down ramp
      const drivingForce = appliedForce - gravityParallel;

      if (Math.abs(velocity) > 0.01) {
        const opposingFriction = frictionMax * (velocity > 0 ? -1 : 1);
        netForce = drivingForce + opposingFriction;
      } else {
        if (Math.abs(drivingForce) > frictionMax) {
          netForce = drivingForce - (drivingForce > 0 ? frictionMax : -frictionMax);
        } else {
          netForce = 0;
        }
      }
      acceleration = netForce / mass;

    } else if (setupMode === 'pulley') {
      normalForce = mass * gravity;
      frictionMax = frictionCoeff * normalForce;
      const hangingGravity = hangingMass * gravity;
      const drivingForce = hangingGravity + appliedForce;

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
      frictionForce: Math.min(frictionMax, Math.abs(netForce)),
      netForce,
      acceleration,
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
      const dt = Math.min(0.04, (timestamp - lastTimeRef.current) / 1000);
      lastTimeRef.current = timestamp;

      setVelocity((v) => {
        let newV = v + forces.acceleration * dt * direction;

        // If friction brings block to a stop when no external applied force
        if (appliedForce === 0 && frictionCoeff > 0) {
          if ((v > 0 && newV <= 0) || (v < 0 && newV >= 0)) {
            newV = 0;
          }
        }

        setPositionX((x) => {
          let newX = x + newV * dt;

          // Check track boundaries
          if (trackBehavior === 'bounce') {
            if (newX >= 10.0) {
              newX = 10.0;
              setDirection(-1);
              soundManager.playDoorSlide();
            } else if (newX <= 0.0) {
              newX = 0.0;
              setDirection(1);
              soundManager.playDoorSlide();
            }
          }
          // In 'infinite' mode, positionX keeps increasing indefinitely! (Newton's 1st law)

          return newX;
        });

        return newV;
      });

      setTimeElapsed((t) => {
        const nextT = t + dt;
        // Record telemetry point
        setGraphPoints((prev) => {
          const nextPts = [...prev, { t: parseFloat(nextT.toFixed(2)), x: positionX, v: velocity, a: forces.acceleration }];
          return nextPts.length > 50 ? nextPts.slice(nextPts.length - 50) : nextPts;
        });
        return nextT;
      });

      animRef.current = requestAnimationFrame(updatePhysics);
    };

    animRef.current = requestAnimationFrame(updatePhysics);
    return () => {
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [isRunning, forces.acceleration, trackBehavior, direction, appliedForce, frictionCoeff, positionX, velocity]);

  // Give an instant impulse push (Newton's 1st Law test)
  const handleImpulsePush = (pushSpeed = 5.0) => {
    soundManager.playClick();
    setVelocity(pushSpeed);
    setIsRunning(true);
  };

  const handleReset = () => {
    soundManager.playClick();
    setIsRunning(false);
    setPositionX(0.0);
    setVelocity(0.0);
    setTimeElapsed(0.0);
    setDirection(1);
    setGraphPoints([]);
  };

  const handleTogglePlay = () => {
    soundManager.playClick();
    setIsRunning(!isRunning);
  };

  // Preset materials for friction
  const frictionPresets = [
    { label: 'Air Track / Ice (μ = 0.00)', mu: 0.0, color: 'text-cyan-400 border-cyan-400' },
    { label: 'Teflon / Metal (μ = 0.04)', mu: 0.04, color: 'text-blue-400 border-blue-400' },
    { label: 'Wood on Wood (μ = 0.25)', mu: 0.25, color: 'text-amber-400 border-amber-400' },
    { label: 'Rubber / Concrete (μ = 0.80)', mu: 0.80, color: 'text-rose-400 border-rose-400' },
  ];

  return (
    <div className="flex-1 flex flex-col gap-3 min-h-0 select-none font-mono">
      
      {/* Top Controls Bar */}
      <div className="p-3 rounded-2xl bg-slate-900/90 border border-cyan-500/30 flex flex-wrap items-center justify-between gap-3 shadow-xl backdrop-blur-md">
        
        {/* Setup Mode Switcher */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
            Mechanics Setup:
          </span>
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-700">
            <button
              onClick={() => {
                soundManager.playClick();
                setSetupMode('flat');
                handleReset();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                setupMode === 'flat'
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Horizontal Track
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setSetupMode('inclined');
                handleReset();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                setupMode === 'inclined'
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Inclined Plane
            </button>
            <button
              onClick={() => {
                soundManager.playClick();
                setSetupMode('pulley');
                handleReset();
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                setupMode === 'pulley'
                  ? 'bg-cyan-500 text-slate-950 font-black shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Atwood Pulley
            </button>
          </div>
        </div>

        {/* Track Behavior Toggle: Infinite vs Bounce */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-slate-400">Track Boundary:</span>
          <div className="flex rounded-lg bg-slate-950 border border-slate-700 p-0.5 text-xs">
            <button
              onClick={() => setTrackBehavior('infinite')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition-all ${
                trackBehavior === 'infinite'
                  ? 'bg-emerald-500 text-slate-950 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Continuous endless motion for Newton's 1st Law"
            >
              <Infinity className="w-3.5 h-3.5" /> Endless (μ=0 Glides Forever)
            </button>
            <button
              onClick={() => setTrackBehavior('bounce')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold flex items-center gap-1 transition-all ${
                trackBehavior === 'bounce'
                  ? 'bg-cyan-500 text-slate-950 font-black'
                  : 'text-slate-400 hover:text-white'
              }`}
              title="Elastic wall bounces"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Elastic Bumper Bounce
            </button>
          </div>
        </div>

        {/* Main Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Impulse Push Button for Newton's 1st Law */}
          <button
            onClick={() => handleImpulsePush(6.0)}
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-400 hover:to-indigo-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-1.5 shadow-lg shadow-purple-500/20 transition-all"
            title="Give an instant 6 m/s impulse push"
          >
            <Zap className="w-3.5 h-3.5 fill-current" /> Give Instant Push
          </button>

          <button
            onClick={handleTogglePlay}
            className={`px-4 py-2 rounded-xl text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-2 transition-all shadow-lg ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-black'
                : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black shadow-cyan-500/20'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5" /> Pause
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5" /> Constant Force Push
              </>
            )}
          </button>

          <button
            onClick={handleReset}
            className="p-2 rounded-xl bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 hover:text-white transition-colors"
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
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              <Compass className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                Real-Time Kinematics & Vector Display
              </span>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="text-slate-400">Displacement: <strong className="text-cyan-400 font-bold">{positionX.toFixed(2)} m</strong></span>
              <span className="text-slate-400">Velocity: <strong className="text-emerald-400 font-bold">{velocity.toFixed(2)} m/s</strong></span>
              <span className="text-slate-400">Net Accel: <strong className="text-amber-400 font-bold">{forces.acceleration.toFixed(2)} m/s²</strong></span>
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
                <linearGradient id="chassisGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" />
                  <stop offset="35%" stopColor="#0284c7" />
                  <stop offset="100%" stopColor="#0369a1" />
                </linearGradient>
                <linearGradient id="brassGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#d97706" />
                  <stop offset="35%" stopColor="#fbbf24" />
                  <stop offset="70%" stopColor="#fef08a" />
                  <stop offset="100%" stopColor="#b45309" />
                </linearGradient>
                <linearGradient id="wheelRimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#94a3b8" />
                  <stop offset="50%" stopColor="#f8fafc" />
                  <stop offset="100%" stopColor="#475569" />
                </linearGradient>
                <linearGradient id="railGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#94a3b8" />
                  <stop offset="30%" stopColor="#64748b" />
                  <stop offset="70%" stopColor="#334155" />
                  <stop offset="100%" stopColor="#0f172a" />
                </linearGradient>
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
              <g stroke="#334155" strokeWidth="0.5" strokeDasharray="4 4" opacity="0.3">
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
                  {/* Track Surface Table & Stainless Steel Guide Rail */}
                  <rect x="40" y="240" width="720" height="26" fill="url(#railGrad)" stroke="#475569" strokeWidth="2" rx="4" />
                  <line x1="42" y1="242" x2="758" y2="242" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                  <line x1="42" y1="246" x2="758" y2="246" stroke="#0f172a" strokeWidth="1.5" />
                  
                  {/* Sliding Distance Markings that loop smoothly with positionX */}
                  {(() => {
                    const scrollOffset = trackBehavior === 'infinite' ? (positionX % 2) * 58 : 0;
                    const baseMeter = trackBehavior === 'infinite' ? Math.floor(positionX / 2) * 2 : 0;
                    return [0, 2, 4, 6, 8, 10, 12].map((mIdx) => {
                      const displayMeter = baseMeter + mIdx;
                      const xPos = 80 + (mIdx / 10) * 580 - scrollOffset;
                      if (xPos < 50 || xPos > 740) return null;
                      return (
                        <g key={mIdx}>
                          <line x1={xPos} y1="240" x2={xPos} y2="252" stroke="#94a3b8" strokeWidth="1.5" />
                          <text x={xPos} y="262" fill="#94a3b8" fontSize="10" textAnchor="middle">
                            {displayMeter}m
                          </text>
                        </g>
                      );
                    });
                  })()}

                  {/* Spring Bumper Stop at Track End */}
                  <g>
                    <rect x="740" y="218" width="14" height="26" fill="#334155" stroke="#94a3b8" strokeWidth="1.5" rx="3" />
                    <path
                      d="M 724 231 Q 728 223 732 231 Q 736 239 740 231"
                      stroke="#94a3b8"
                      strokeWidth="3.5"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </g>

                  {/* Precision Wheeled Dynamics Lab Cart */}
                  {(() => {
                    let cartX = 80 + (trackBehavior === 'infinite' ? 240 : (positionX / 10) * 580);
                    if (trackBehavior === 'infinite') {
                      cartX = 350;
                    }
                    const cartW = 105;
                    const cartH = 28;
                    const wheelR = 11;
                    const wheelY = 240 - wheelR;
                    const w1X = cartX + 22;
                    const w2X = cartX + cartW - 22;
                    const chassisY = 240 - 15 - cartH; // sits above wheels
                    const wheelRot = ((positionX * 360) / (2 * Math.PI * 0.15)) % 360;
                    const numWeights = Math.min(3, Math.max(1, Math.ceil(mass / 7)));

                    return (
                      <g>
                        {/* Cart Shadow */}
                        <ellipse cx={cartX + cartW / 2} cy="241" rx={cartW / 2 + 6} ry="4" fill="#000000" opacity="0.65" />

                        {/* Stacked Machined Brass Mass Weights on Top */}
                        {Array.from({ length: numWeights }).map((_, wIdx) => {
                          const discY = chassisY - (wIdx + 1) * 9;
                          return (
                            <g key={wIdx}>
                              <rect
                                x={cartX + 25}
                                y={discY}
                                width={55}
                                height={8}
                                fill="url(#brassGrad)"
                                stroke="#b45309"
                                strokeWidth="1.2"
                                rx="2"
                              />
                              <line x1={cartX + 27} y1={discY + 2} x2={cartX + 78} y2={discY + 2} stroke="#fef08a" strokeWidth="1" />
                            </g>
                          );
                        })}
                        {/* Total Mass Label */}
                        <text
                          x={cartX + cartW / 2}
                          y={chassisY - numWeights * 9 - 3}
                          fill="#fef08a"
                          fontSize="10"
                          fontWeight="bold"
                          textAnchor="middle"
                          fontFamily="monospace"
                        >
                          {mass} kg
                        </text>

                        {/* Aerodynamic Anodized Aluminum Cart Chassis Body */}
                        <rect
                          x={cartX}
                          y={chassisY}
                          width={cartW}
                          height={cartH}
                          fill="url(#chassisGrad)"
                          stroke="#38bdf8"
                          strokeWidth="2"
                          rx="4"
                        />
                        {/* Specular highlight stripe */}
                        <line
                          x1={cartX + 4}
                          y1={chassisY + 3}
                          x2={cartX + cartW - 4}
                          y2={chassisY + 3}
                          stroke="rgba(255,255,255,0.6)"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />

                        {/* Front Bumper Rubber Tip */}
                        <rect x={cartX + cartW} y={chassisY + 8} width="5" height="12" fill="#0f172a" rx="1.5" />
                        <rect x={cartX - 5} y={chassisY + 8} width="5" height="12" fill="#0f172a" rx="1.5" />

                        {/* Onboard Digital LCD Speedometer Display */}
                        <rect
                          x={cartX + 22}
                          y={chassisY + 7}
                          width={61}
                          height={14}
                          fill="#020617"
                          stroke="#0284c7"
                          strokeWidth="1"
                          rx="2"
                        />
                        <text
                          x={cartX + 52}
                          y={chassisY + 17}
                          fill="#38bdf8"
                          fontSize="9"
                          fontWeight="bold"
                          fontFamily="monospace"
                          textAnchor="middle"
                        >
                          v: {Math.abs(velocity).toFixed(2)} m/s
                        </text>

                        {/* Ball-Bearing Wheels with Visibly Rotating Spokes */}
                        {/* Wheel 1 (Rear) */}
                        <g>
                          <circle cx={w1X} cy={wheelY} r={wheelR} fill="#1e293b" stroke="#0f172a" strokeWidth="2.5" />
                          <circle cx={w1X} cy={wheelY} r={wheelR - 3.5} fill="url(#wheelRimGrad)" />
                          <g transform={`rotate(${wheelRot} ${w1X} ${wheelY})`}>
                            <line x1={w1X - 6} y1={wheelY} x2={w1X + 6} y2={wheelY} stroke="#334155" strokeWidth="1.5" />
                            <line x1={w1X} y1={wheelY - 6} x2={w1X} y2={wheelY + 6} stroke="#334155" strokeWidth="1.5" />
                          </g>
                          <circle cx={w1X} cy={wheelY} r="2.5" fill="#f59e0b" />
                        </g>

                        {/* Wheel 2 (Front) */}
                        <g>
                          <circle cx={w2X} cy={wheelY} r={wheelR} fill="#1e293b" stroke="#0f172a" strokeWidth="2.5" />
                          <circle cx={w2X} cy={wheelY} r={wheelR - 3.5} fill="url(#wheelRimGrad)" />
                          <g transform={`rotate(${wheelRot} ${w2X} ${wheelY})`}>
                            <line x1={w2X - 6} y1={wheelY} x2={w2X + 6} y2={wheelY} stroke="#334155" strokeWidth="1.5" />
                            <line x1={w2X} y1={wheelY - 6} x2={w2X} y2={wheelY + 6} stroke="#334155" strokeWidth="1.5" />
                          </g>
                          <circle cx={w2X} cy={wheelY} r="2.5" fill="#f59e0b" />
                        </g>

                        {/* Force Vectors */}
                        {/* Applied Force Arrow (Right) */}
                        {appliedForce > 0 && (
                          <g>
                            <line
                              x1={cartX + cartW}
                              y1={chassisY + cartH / 2}
                              x2={cartX + cartW + Math.min(120, appliedForce * 0.9)}
                              y2={chassisY + cartH / 2}
                              stroke="#22c55e"
                              strokeWidth="3.5"
                              markerEnd="url(#arrow-green)"
                            />
                            <text
                              x={cartX + cartW + Math.min(120, appliedForce * 0.9) + 8}
                              y={chassisY + cartH / 2 + 4}
                              fill="#22c55e"
                              fontSize="11"
                              fontWeight="bold"
                            >
                              F_app = {appliedForce}N
                            </text>
                          </g>
                        )}

                        {/* Friction Force Arrow (Left) */}
                        {forces.frictionForce > 0 && (
                          <g>
                            <line
                              x1={cartX}
                              y1={chassisY + cartH / 2}
                              x2={cartX - Math.min(100, forces.frictionForce * 1.5)}
                              y2={chassisY + cartH / 2}
                              stroke="#ef4444"
                              strokeWidth="3"
                              markerEnd="url(#arrow-red)"
                            />
                            <text
                              x={cartX - Math.min(100, forces.frictionForce * 1.5) - 8}
                              y={chassisY + cartH / 2 + 4}
                              fill="#ef4444"
                              fontSize="10"
                              textAnchor="end"
                              fontWeight="bold"
                            >
                              f_k = {forces.frictionForce.toFixed(1)}N
                            </text>
                          </g>
                        )}

                        {/* Normal Force (Up) & Gravity (Down) */}
                        <line
                          x1={cartX + cartW / 2}
                          y1={chassisY}
                          x2={cartX + cartW / 2}
                          y2={chassisY - 35}
                          stroke="#3b82f6"
                          strokeWidth="2.5"
                          markerEnd="url(#arrow-blue)"
                        />
                        <line
                          x1={cartX + cartW / 2}
                          y1={chassisY + cartH}
                          x2={cartX + cartW / 2}
                          y2={chassisY + cartH + 35}
                          stroke="#f59e0b"
                          strokeWidth="2.5"
                          markerEnd="url(#arrow-amber)"
                        />
                      </g>
                    );
                  })()}
                </g>
              )}

              {/* --- 2. INCLINED PLANE RENDERING --- */}
              {setupMode === 'inclined' && (
                <g>
                  {(() => {
                    const rad = (inclineAngle * Math.PI) / 180;
                    const rampLen = 500;
                    const baseX = 120;
                    const baseY = 290;
                    const topX = baseX + Math.cos(rad) * rampLen;
                    const topY = baseY - Math.sin(rad) * rampLen;

                    const blockDist = Math.min(rampLen - 60, (positionX % 10) * 45);
                    const bx = baseX + Math.cos(rad) * blockDist;
                    const by = baseY - Math.sin(rad) * blockDist;

                    return (
                      <g>
                        {/* Wedge Ramp */}
                        <polygon
                          points={`${baseX},${baseY} ${topX},${topY} ${topX},${baseY}`}
                          fill="url(#rampGrad)"
                          stroke="#475569"
                          strokeWidth="2.5"
                        />
                        {/* Angle Arc */}
                        <path
                          d={`M ${baseX + 60} ${baseY} A 60 60 0 0 0 ${baseX + Math.cos(rad) * 60} ${baseY - Math.sin(rad) * 60}`}
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="2"
                        />
                        <text x={baseX + 75} y={baseY - 12} fill="#38bdf8" fontSize="12" fontWeight="bold">
                          θ = {inclineAngle}°
                        </text>

                        {/* Sliding Block along Ramp */}
                        <g transform={`translate(${bx}, ${by}) rotate(${-inclineAngle})`}>
                          <rect x="0" y="-45" width="55" height="45" fill="url(#blockGrad)" stroke="#38bdf8" strokeWidth="2" rx="4" />
                          <text x="27" y="-22" fill="#fff" fontSize="11" fontWeight="bold" textAnchor="middle">
                            {mass}kg
                          </text>
                        </g>
                      </g>
                    );
                  })()}
                </g>
              )}

              {/* --- 3. ATWOOD PULLEY RENDERING --- */}
              {setupMode === 'pulley' && (
                <g>
                  {/* Table Surface */}
                  <rect x="50" y="190" width="480" height="20" fill="url(#rampGrad)" stroke="#475569" strokeWidth="2" rx="4" />
                  
                  {/* Pulley Wheel */}
                  <circle cx="530" cy="190" r="18" fill="#475569" stroke="#94a3b8" strokeWidth="2.5" />
                  <circle cx="530" cy="190" r="4" fill="#38bdf8" />

                  {/* Table Block m1 */}
                  {(() => {
                    const blockX = 100 + (positionX % 10) * 32;
                    return (
                      <g>
                        <rect x={blockX} y="145" width="55" height="45" fill="url(#blockGrad)" stroke="#38bdf8" strokeWidth="2" rx="4" />
                        <text x={blockX + 27} y="172" fill="#fff" fontSize="11" fontWeight="bold" textAnchor="middle">
                          m₁ = {mass}kg
                        </text>
                        {/* String to pulley */}
                        <line x1={blockX + 55} y1="168" x2="530" y2="172" stroke="#e2e8f0" strokeWidth="2" />
                      </g>
                    );
                  })()}

                  {/* Hanging String and Mass m2 */}
                  {(() => {
                    const hangY = 210 + (positionX % 10) * 12;
                    return (
                      <g>
                        <line x1="548" y1="190" x2="548" y2={hangY} stroke="#e2e8f0" strokeWidth="2" />
                        <rect x="532" y={hangY} width="32" height="40" fill="#f59e0b" stroke="#d97706" strokeWidth="2" rx="3" />
                        <text x="548" y={hangY + 24} fill="#1e293b" fontSize="10" fontWeight="black" textAnchor="middle">
                          {hangingMass}kg
                        </text>
                      </g>
                    );
                  })()}
                </g>
              )}
            </svg>

            {/* Zero-Friction Newton's 1st Law Banner */}
            {frictionCoeff === 0 && Math.abs(velocity) > 0.01 && (
              <div className="absolute top-3 left-4 px-3 py-1 rounded-xl bg-cyan-950/85 border border-cyan-400 text-cyan-300 text-xs shadow-lg backdrop-blur-md flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>Newton's 1st Law Verified: With zero friction (μ = 0), velocity remains constant ({velocity.toFixed(2)} m/s) forever without stopping!</span>
              </div>
            )}
          </div>

          {/* Real-time Kinematic Telemetry Readout */}
          <div className="grid grid-cols-4 gap-2 pt-3 border-t border-slate-800 text-center text-xs">
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Net Force (F_net)</span>
              <strong className="text-cyan-400">{forces.netForce.toFixed(1)} N</strong>
            </div>
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Normal Force (N)</span>
              <strong className="text-blue-400">{forces.normalForce.toFixed(1)} N</strong>
            </div>
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Kinetic Energy (E_k)</span>
              <strong className="text-emerald-400">{(0.5 * mass * velocity * velocity).toFixed(1)} J</strong>
            </div>
            <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
              <span className="text-slate-500 block text-[10px]">Time Elapsed</span>
              <strong className="text-purple-400">{timeElapsed.toFixed(1)} s</strong>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Physics Controls Deck */}
        <div className="lg:col-span-4 flex flex-col gap-3 min-h-0 overflow-y-auto pr-1">
          
          {/* Friction Selector & Presets */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                Friction Coefficient (μ):
              </span>
              <span className="text-xs font-bold text-white bg-slate-950 px-2 py-0.5 rounded border border-slate-700">
                μ = {frictionCoeff.toFixed(2)}
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={frictionCoeff}
              onChange={(e) => setFrictionCoeff(parseFloat(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg mb-3"
            />

            {/* Quick Material Presets */}
            <div className="space-y-1.5">
              {frictionPresets.map((pr) => (
                <button
                  key={pr.label}
                  onClick={() => {
                    soundManager.playClick();
                    setFrictionCoeff(pr.mu);
                  }}
                  className={`w-full py-1.5 px-2.5 rounded-lg text-left text-xs transition-all border ${
                    frictionCoeff === pr.mu
                      ? `${pr.color} bg-slate-950 font-bold shadow`
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:text-white'
                  }`}
                >
                  {pr.label}
                </button>
              ))}
            </div>
          </div>

          {/* Mass & Applied Force Sliders */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
            
            {/* Mass Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Block Mass (m):</span>
                <span className="font-bold text-cyan-300">{mass} kg</span>
              </div>
              <input
                type="range"
                min="1"
                max="25"
                step="0.5"
                value={mass}
                onChange={(e) => setMass(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Applied Force Slider */}
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-400">Applied Force (F_app):</span>
                <span className="font-bold text-emerald-300">{appliedForce} N</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="2"
                value={appliedForce}
                onChange={(e) => setAppliedForce(parseFloat(e.target.value))}
                className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>

            {/* Incline Angle Slider if Inclined Mode */}
            {setupMode === 'inclined' && (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Ramp Incline Angle (θ):</span>
                  <span className="font-bold text-amber-300">{inclineAngle}°</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="75"
                  step="1"
                  value={inclineAngle}
                  onChange={(e) => setInclineAngle(parseInt(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
              </div>
            )}

            {/* Hanging Mass if Pulley Mode */}
            {setupMode === 'pulley' && (
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Hanging Mass (m₂):</span>
                  <span className="font-bold text-amber-300">{hangingMass} kg</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="15"
                  step="0.5"
                  value={hangingMass}
                  onChange={(e) => setHangingMass(parseFloat(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
              </div>
            )}

          </div>

          {/* Senku's Law of Motion Formulation Card */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-cyan-950/60 to-slate-900 border border-cyan-500/30 text-xs shadow-xl">
            <span className="font-bold text-cyan-400 uppercase tracking-wider block mb-1">
              Newton's 1st & 2nd Laws:
            </span>
            <div className="p-2 rounded bg-slate-950 border border-cyan-500/30 text-center font-bold text-cyan-300 mb-1.5">
              a = F_net / m = (F_app - μ·m·g) / m
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
              When friction μ = 0, F_friction = 0. An initial push sets the object into perpetual motion at constant velocity with 0 deceleration!
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
