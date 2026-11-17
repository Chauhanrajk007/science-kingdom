import React, { useState, useEffect, useRef } from 'react';
import { soundManager } from '../../audio/SoundManager';
import confetti from 'canvas-confetti';
import { 
  Rocket, 
  RotateCcw, 
  Play, 
  Pause, 
  Globe2, 
  Moon, 
  Sparkles, 
  Zap, 
  Gauge, 
  Timer, 
  Sliders, 
  Atom, 
  HelpCircle,
  Activity,
  Compass,
  ArrowRight,
  TrendingUp,
  Flame
} from 'lucide-react';

export const UnthinkableCosmicPhysics: React.FC = () => {
  // Mode: 1. Cosmic Moon Throw ("Can You Throw to the Moon?"), 2. Planetary Trampoline Jump, 3. Black Hole Spaghetti
  const [unthinkableMode, setUnthinkableMode] = useState<'moon_throw' | 'trampoline_jump' | 'black_hole'>('moon_throw');

  // --- MODE 1: MOON THROW LAUNCHER STATE ---
  const [velocityKmS, setVelocityKmS] = useState<number>(11.2); // Default to escape velocity (11.2 km/s)
  const [launchAngleDeg, setLaunchAngleDeg] = useState<number>(45);
  const [projectileType, setProjectileType] = useState<'baseball' | 'bowling_ball' | 'rocket_capsule'>('baseball');
  const [isFlying, setIsFlying] = useState<boolean>(false);
  const [flightStatus, setFlightStatus] = useState<string>('Ready on launchpad. Drag the velocity slider or hit Launch!');
  const [flightMilestone, setFlightMilestone] = useState<string>('Ground Level (0 km)');
  const [flightOutcome, setFlightOutcome] = useState<string | null>(null);
  const [realtimeAltitudeKm, setRealtimeAltitudeKm] = useState<number>(0);
  const [journeyTrail, setJourneyTrail] = useState<{ x: number; y: number }[]>([]);

  // Canvas ref for Moon Throw
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number | null>(null);

  // --- MODE 2: PLANETARY TRAMPOLINE STATE ---
  const [trampolinePlanet, setTrampolinePlanet] = useState<'earth' | 'moon' | 'mars' | 'jupiter' | 'asteroid'>('moon');
  const [jumpHeightM, setJumpHeightM] = useState<number>(0.5);

  // Natural multi-phase trampoline state
  const [trampolineState, setTrampolineState] = useState<'idle' | 'squat' | 'launch' | 'apex' | 'landing' | 'recoil'>('idle');
  const [bedDeflection, setBedDeflection] = useState<number>(0);
  const [jumpOffsetPx, setJumpOffsetPx] = useState<number>(0);
  const [characterScale, setCharacterScale] = useState<{ x: number; y: number }>({ x: 1, y: 1 });

  const planetsData = {
    earth: { name: 'Earth', gravity: 9.81, jumpM: 0.5, hangTimeSec: 0.6, desc: 'Normal Earth gravity. A healthy jump reaches about 0.5 meters (knee to waist high).' },
    moon: { name: 'The Moon', gravity: 1.62, jumpM: 3.1, hangTimeSec: 3.9, desc: 'Super low gravity (1/6th of Earth)! You jump over 3 meters high—over the roof of a two-story house! And you float down gently like a feather for 4 seconds!' },
    mars: { name: 'Mars', gravity: 3.72, jumpM: 1.35, hangTimeSec: 1.7, desc: 'About 38% of Earth gravity. You easily jump 1.35 meters high—clearing an adult\'s shoulders!' },
    jupiter: { name: 'Jupiter', gravity: 24.79, jumpM: 0.19, hangTimeSec: 0.25, desc: 'Crushing gravity (2.5x Earth)! Your body feels 2.5 times heavier. You can barely hop 19 cm off the ground before being slammed back down!' },
    asteroid: { name: 'Asteroid Bennu', gravity: 0.0001, jumpM: 999, hangTimeSec: 999, desc: 'Almost zero gravity! Escape velocity is only 0.2 m/s. If you jump off a trampoline on an asteroid, you never come down—you launch into deep space!' },
  };

  // --- MODE 3: BLACK HOLE SPAGHETTIFICATION STATE ---
  const [spaghettiDistance, setSpaghettiDistance] = useState<number>(100); // 100% = safe, 0% = event horizon
  const [droppedItem, setDroppedItem] = useState<'apple' | 'astronaut' | 'clock'>('apple');

  // Simulation physics state ref for Moon throw with trajectory impact tracking
  const sim = useRef({
    x: 110,
    y: 420,
    vx: 0,
    vy: 0,
    t: 0,
    done: false,
    trail: [] as { x: number; y: number }[],
    maxAltKm: 0,
    impact: null as { x: number; y: number; distanceKm: number; shockwaveRing: number } | null,
  });

  const speedOfLightKmS = 300000;
  const lorentzGamma = 1 / Math.sqrt(Math.max(0.0001, 1 - Math.pow(Math.min(0.999, velocityKmS / speedOfLightKmS), 2)));
  const timeDilationPercent = ((lorentzGamma - 1) * 100).toFixed(2);

  // Reset Moon Throw
  const resetMoonThrow = () => {
    setIsFlying(false);
    setFlightOutcome(null);
    setRealtimeAltitudeKm(0);
    setFlightStatus('Ready on launchpad. Drag the velocity slider or hit Launch!');
    setFlightMilestone('Ground Level (0 km)');
    sim.current = {
      x: 110,
      y: 420,
      vx: 0,
      vy: 0,
      t: 0,
      done: false,
      trail: [],
      maxAltKm: 0,
      impact: null,
    };
    setJourneyTrail([]);
  };

  // Launch Moon Throw
  const launchMoonThrow = () => {
    resetMoonThrow();
    setIsFlying(true);
    soundManager.playDoorSlide();

    const rad = (launchAngleDeg * Math.PI) / 180;
    // Normalized visual scale
    const visualSpeed = Math.min(16, Math.max(1.8, velocityKmS * 0.42));
    sim.current.vx = Math.cos(rad) * visualSpeed;
    sim.current.vy = -Math.sin(rad) * visualSpeed;
    sim.current.t = 0;
    sim.current.done = false;
    sim.current.maxAltKm = 0;
    sim.current.impact = null;
  };

  // Preset launchers for kids
  const applyPreset = (v: number, angle: number) => {
    setVelocityKmS(v);
    setLaunchAngleDeg(angle);
    resetMoonThrow();
  };

  // Canvas Render Loop for Moon Throw
  useEffect(() => {
    if (unthinkableMode !== 'moon_throw') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = canvas.width;
    let height = canvas.height;

    const render = () => {
      ctx.fillStyle = '#050811';
      ctx.fillRect(0, 0, width, height);

      // Deep space background stars
      ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
      for (let i = 0; i < 45; i++) {
        const sx = ((i * 187) % width);
        const sy = ((i * 243) % height);
        ctx.fillRect(sx, sy, 1.2, 1.2);
      }

      // EARTH on the Left
      const earthX = 110;
      const earthY = 560;
      const earthR = 140;

      // Atmospheric Halo
      const atmoGrad = ctx.createRadialGradient(earthX, earthY, earthR * 0.9, earthX, earthY, earthR * 1.35);
      atmoGrad.addColorStop(0, '#3b82f6');
      atmoGrad.addColorStop(0.6, 'rgba(56, 189, 248, 0.25)');
      atmoGrad.addColorStop(1, 'transparent');
      ctx.fillStyle = atmoGrad;
      ctx.beginPath();
      ctx.arc(earthX, earthY, earthR * 1.35, 0, Math.PI * 2);
      ctx.fill();

      // Earth Globe
      ctx.fillStyle = '#1d4ed8';
      ctx.beginPath();
      ctx.arc(earthX, earthY, earthR, 0, Math.PI * 2);
      ctx.fill();

      // Earth Continent Patterns
      ctx.fillStyle = '#10b981';
      ctx.beginPath();
      ctx.arc(earthX + 20, earthY - 50, 45, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('PLANET EARTH', earthX, earthY - 45);

      // CELESTIAL LANDMARKS & ORBITS (Shows kids exactly where the ball goes!)
      // 1. Karman Line (100km Outer Space Edge)
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.3)';
      ctx.setLineDash([3, 4]);
      ctx.beginPath();
      ctx.arc(earthX, earthY, earthR + 30, -Math.PI / 2, 0);
      ctx.stroke();
      ctx.fillStyle = '#38bdf8';
      ctx.font = '9px monospace';
      ctx.fillText('100 km (Edge of Space 🚀)', earthX + 90, earthY - 145);

      // 2. ISS Orbit (400km)
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.25)';
      ctx.beginPath();
      ctx.arc(earthX, earthY, earthR + 65, -Math.PI / 2, 0);
      ctx.stroke();
      ctx.fillStyle = '#f59e0b';
      ctx.fillText('400 km (Space Station ISS 🛰️)', earthX + 130, earthY - 175);
      ctx.setLineDash([]);

      // THE MOON on the Right
      const moonX = width - 110;
      const moonY = 130;
      const moonR = 42;

      // Moon Gravity Well Dotted Ring
      ctx.strokeStyle = 'rgba(203, 213, 225, 0.35)';
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR * 2.3, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      // Moon Body
      const moonGrad = ctx.createRadialGradient(moonX - 10, moonY - 10, 5, moonX, moonY, moonR);
      moonGrad.addColorStop(0, '#f8fafc');
      moonGrad.addColorStop(1, '#64748b');
      ctx.fillStyle = moonGrad;
      ctx.beginPath();
      ctx.arc(moonX, moonY, moonR, 0, Math.PI * 2);
      ctx.fill();

      // Moon Crater Dots
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.arc(moonX - 12, moonY - 8, 8, 0, Math.PI * 2);
      ctx.arc(moonX + 14, moonY + 12, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('TARGET: MOON 🌕', moonX, moonY + moonR + 18);
      ctx.font = '10px monospace';
      ctx.fillStyle = '#94a3b8';
      ctx.fillText('384,400 km away', moonX, moonY + moonR + 32);

      // Launch Cannon Tube on Earth
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3.5;
      const rad = (launchAngleDeg * Math.PI) / 180;
      ctx.beginPath();
      ctx.moveTo(earthX, 420);
      ctx.lineTo(earthX + Math.cos(rad) * 28, 420 - Math.sin(rad) * 28);
      ctx.stroke();

      // PREDICTED TRAJECTORY DOTTED FORECAST (Shows where it will go before launch!)
      if (!isFlying) {
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([4, 6]);
        ctx.beginPath();
        let px = earthX;
        let py = 420;
        let pvx = Math.cos(rad) * Math.min(16, Math.max(1.8, velocityKmS * 0.42));
        let pvy = -Math.sin(rad) * Math.min(16, Math.max(1.8, velocityKmS * 0.42));
        ctx.moveTo(px, py);
        for (let step = 0; step < 70; step++) {
          const dxE = earthX - px;
          const dyE = earthY - py;
          const distE = Math.sqrt(dxE * dxE + dyE * dyE);
          if (distE > 20) {
            pvx += (dxE / distE) * (0.13 * Math.pow(earthR / distE, 1.8));
            pvy += (dyE / distE) * (0.13 * Math.pow(earthR / distE, 1.8));
          }
          px += pvx;
          py += pvy;
          ctx.lineTo(px, py);
          if (distE <= earthR && step > 5) break;
        }
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // PHYSICS FLIGHT LOOP
      if (isFlying && !sim.current.done) {
        const s = sim.current;
        s.trail.push({ x: s.x, y: s.y });
        if (s.trail.length > 250) s.trail.shift();

        // Gravity pull toward Earth
        const dxE = earthX - s.x;
        const dyE = earthY - s.y;
        const distE = Math.sqrt(dxE * dxE + dyE * dyE);

        // Gravity pull toward Moon
        const dxM = moonX - s.x;
        const dyM = moonY - s.y;
        const distM = Math.sqrt(dxM * dxM + dyM * dyM);

        // Calculate real-world altitude km
        const altitudeKm = Math.max(0, (distE - earthR) * 35);
        if (altitudeKm > s.maxAltKm) s.maxAltKm = Math.round(altitudeKm);
        setRealtimeAltitudeKm(Math.round(altitudeKm));

        // Update Friendly Milestone Tracker
        if (distM < moonR * 1.5) {
          setFlightMilestone('Moon Surface (384,400 km)! 🌕');
        } else if (distM < moonR * 2.5) {
          setFlightMilestone('Entering Moon\'s Gravitational Pull! 🌌');
        } else if (altitudeKm > 36000) {
          setFlightMilestone('Beyond Geostationary Satellites (Deep Space) 📡');
        } else if (altitudeKm > 400) {
          setFlightMilestone('Past Space Station ISS (Orbit Realm) 🛰️');
        } else if (altitudeKm > 100) {
          setFlightMilestone('Passed Karman Line: In Space! 🚀');
        } else if (s.vy > 0 && s.t > 15) {
          setFlightMilestone(`⚠️ Peak (${s.maxAltKm} km) passed! Gravity pulling down to Earth!`);
        } else {
          setFlightMilestone('Ascending through Earth\'s Atmosphere 🌤️');
        }

        // Earth Gravity
        if (distE > 15) {
          const earthPull = 0.135 * Math.pow(earthR / distE, 1.8);
          s.vx += (dxE / distE) * earthPull;
          s.vy += (dyE / distE) * earthPull;
        }

        // Moon Gravity Capture
        if (distM < moonR * 2.6) {
          const moonPull = 0.35 * Math.pow(moonR / Math.max(15, distM), 1.6);
          s.vx += (dxM / distM) * moonPull;
          s.vy += (dyM / distM) * moonPull;
        }

        s.x += s.vx;
        s.y += s.vy;
        s.t += 1;

        // OUTCOME CHECKS:
        // 1. Hit the Moon!
        if (distM <= moonR) {
          s.done = true;
          setIsFlying(false);
          soundManager.playChimeSuccess();
          confetti({ particleCount: 80, spread: 90, origin: { x: 0.85, y: 0.3 } });
          setFlightOutcome('🌕 TOUCHDOWN ON THE MOON! The ball broke through Earth\'s gravity and crashed at Tycho Crater!');
        }
        // 2. Fall back to Earth (Shows exactly where and how it landed!)
        else if (distE <= earthR && s.t > 8) {
          s.done = true;
          setIsFlying(false);
          soundManager.playDoorSlide();

          // Calculate downrange distance along Earth's curvature
          const launchRad = Math.atan2(420 - earthY, 110 - earthX);
          const impactRad = Math.atan2(s.y - earthY, s.x - earthX);
          const angleDiff = Math.abs(impactRad - launchRad);
          const downrangeKm = Math.max(25, Math.round(angleDiff * 6371));

          s.impact = {
            x: s.x,
            y: s.y,
            distanceKm: downrangeKm,
            shockwaveRing: 4,
          };

          setFlightMilestone(`💥 Splashdown: ${downrangeKm.toLocaleString()} km from Launchpad`);
          setFlightOutcome(
            `🌱 FELL BACK TO EARTH! At ${velocityKmS < 1 ? `${(velocityKmS * 1000).toFixed(0)} m/s` : `${velocityKmS} km/s`}, Earth\'s gravity curved the ball down after reaching peak altitude of ${s.maxAltKm.toLocaleString()} km. It splashed down in the ocean ${downrangeKm.toLocaleString()} km downrange!`
          );
        }
        // 3. Stable Satellite Orbit
        else if (s.t > 350 && distE > earthR * 1.2 && distE < width * 0.75 && distM > moonR * 3) {
          s.done = true;
          setIsFlying(false);
          soundManager.playChimeSuccess();
          setFlightOutcome('🛰️ SATELLITE ORBIT ACHIEVED! The ball reached 7.9 km/s and is falling around Earth\'s curve forever!');
        }
        // 4. Interstellar Solar Escape
        else if (s.x > width + 40 || s.y < -40) {
          s.done = true;
          setIsFlying(false);
          soundManager.playChimeSuccess();
          setFlightOutcome('🚀 DEEP SPACE SOLAR ESCAPE! The ball exceeded 16.7 km/s and is leaving the solar system forever!');
        }
      }

      // Draw Glowing Flight Trail
      if (sim.current.trail.length > 1) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        sim.current.trail.forEach((p, idx) => {
          if (idx === 0) ctx.moveTo(p.x, p.y);
          else ctx.lineTo(p.x, p.y);
        });
        ctx.stroke();

        ctx.strokeStyle = 'rgba(56, 189, 248, 0.35)';
        ctx.lineWidth = 6;
        ctx.stroke();
      }

      // Draw Flying Projectile
      const s = sim.current;
      ctx.save();
      ctx.translate(s.x, s.y);

      // Glowing fireball tail if high speed
      if (velocityKmS > 5) {
        ctx.fillStyle = velocityKmS > 100 ? '#ec4899' : '#f59e0b';
        ctx.beginPath();
        ctx.arc(-8, 0, 5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 14;
      ctx.beginPath();
      ctx.arc(0, 0, projectileType === 'baseball' ? 6 : 9, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // Draw Animated Impact Landing Site Shockwave on Earth
      if (sim.current.impact) {
        const imp = sim.current.impact;
        if (imp.shockwaveRing < 38) {
          imp.shockwaveRing += 0.8;
        }

        // Outer Shockwave Wave
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.arc(imp.x, imp.y, imp.shockwaveRing, 0, Math.PI * 2);
        ctx.stroke();

        // Inner Flash Wave
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(imp.x, imp.y, imp.shockwaveRing * 0.5, 0, Math.PI * 2);
        ctx.stroke();

        // Impact Center Point
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(imp.x, imp.y, 4, 0, Math.PI * 2);
        ctx.fill();

        // Downrange Landing Label
        ctx.fillStyle = '#fef08a';
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'center';
        ctx.fillText(`💥 Landed: ${imp.distanceKm} km from launchpad`, imp.x, imp.y - 12);
      }

      animFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [unthinkableMode, isFlying, velocityKmS, launchAngleDeg, projectileType]);

  // Handle Natural Multi-Phase Trampoline Jump Animation
  const triggerTrampolineJump = (planetKey: 'earth' | 'moon' | 'mars' | 'jupiter' | 'asteroid') => {
    if (trampolineState !== 'idle') return;
    setTrampolinePlanet(planetKey);
    const p = planetsData[planetKey];

    // Phase 1: Squat & Bed Depression
    setTrampolineState('squat');
    setBedDeflection(18); // Bed sags down 18px
    setCharacterScale({ x: 1.18, y: 0.82 }); // Squash knees
    setJumpOffsetPx(0);
    soundManager.playClick();

    // Phase 2: Launch! Spring snaps up
    setTimeout(() => {
      setTrampolineState('launch');
      setBedDeflection(-8); // Bed snaps up
      setCharacterScale({ x: 0.85, y: 1.25 }); // Elongate on launch
      soundManager.playDoorSlide();

      // Launch physics: jump height
      const targetHeightPx = planetKey === 'asteroid' ? 360 : Math.min(260, p.jumpM * 75);
      const flightDurationMs = planetKey === 'asteroid' ? 3000 : Math.min(3800, Math.max(500, p.hangTimeSec * 1000));
      const ascentMs = flightDurationMs * 0.45;

      // Animate ascent
      const startTime = Date.now();
      const ascentTimer = setInterval(() => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(1, elapsed / ascentMs);
        // Ease out quad for gravity deceleration
        const ease = 1 - Math.pow(1 - progress, 2);
        setJumpOffsetPx(targetHeightPx * ease);

        if (progress >= 1) {
          clearInterval(ascentTimer);
          // Phase 3: Apex Float
          setTrampolineState('apex');
          setCharacterScale({ x: 1, y: 1 });
          setBedDeflection(0);

          if (planetKey === 'asteroid') {
            soundManager.playChimeSuccess();
            confetti({ particleCount: 50, spread: 80, origin: { y: 0.2 } });
            setTimeout(() => {
              setTrampolineState('idle');
              setJumpOffsetPx(0);
            }, 2500);
            return;
          }

          // Apex float pause, then fall
          const floatPauseMs = Math.min(600, p.hangTimeSec * 160);
          setTimeout(() => {
            setTrampolineState('landing');
            setCharacterScale({ x: 0.9, y: 1.15 });

            // Animate accelerating descent
            const descentStart = Date.now();
            const descentMs = flightDurationMs * 0.45;
            const descentTimer = setInterval(() => {
              const dElapsed = Date.now() - descentStart;
              const dProgress = Math.min(1, dElapsed / descentMs);
              // Accelerating quad ease in
              const dEase = Math.pow(dProgress, 2);
              setJumpOffsetPx(targetHeightPx * (1 - dEase));

              if (dProgress >= 1) {
                clearInterval(descentTimer);
                setJumpOffsetPx(0);
                // Phase 4: Bed Impact & Absorption
                soundManager.playLiquidDrip();
                setBedDeflection(20);
                setCharacterScale({ x: 1.25, y: 0.75 });

                // Phase 5: Recoil settle
                setTimeout(() => {
                  setBedDeflection(-5);
                  setCharacterScale({ x: 0.95, y: 1.05 });
                  setTimeout(() => {
                    setBedDeflection(0);
                    setCharacterScale({ x: 1, y: 1 });
                    setTrampolineState('idle');
                  }, 220);
                }, 180);
              }
            }, 16);
          }, floatPauseMs);
        }
      }, 16);
    }, 250);
  };

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden bg-slate-950 text-slate-100 select-none p-2 sm:p-4 font-mono">
      
      {/* Top Unthinkable Mode Switcher */}
      <div className="flex items-center justify-between mb-3 z-10 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="p-2.5 rounded-xl bg-pink-950/80 border border-pink-500/50 shadow-[0_0_20px_rgba(236,72,153,0.3)]">
            <Rocket className="w-5 h-5 text-pink-400 animate-bounce" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-pink-400 uppercase tracking-widest bg-pink-950/80 px-2 py-0.5 rounded-full border border-pink-600/40">
              UNTHINKABLE PHYSICS FOR CURIOUS MINDS
            </span>
            <h2 className="text-sm sm:text-base font-black text-white tracking-wide mt-0.5">
              Break the Everyday Laws of Reality!
            </h2>
          </div>
        </div>

        {/* 3 Unthinkable Ideas Tabs for Kids */}
        <div className="flex rounded-xl bg-slate-900/90 border border-slate-700 p-1 flex-wrap gap-1">
          <button
            onClick={() => {
              soundManager.playClick();
              setUnthinkableMode('moon_throw');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              unthinkableMode === 'moon_throw'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Moon className="w-3.5 h-3.5" /> 1. Throw Ball to the Moon
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              setUnthinkableMode('trampoline_jump');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              unthinkableMode === 'trampoline_jump'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" /> 2. Gravity Trampoline Jump
          </button>
          <button
            onClick={() => {
              soundManager.playClick();
              setUnthinkableMode('black_hole');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              unthinkableMode === 'black_hole'
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white font-black shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Atom className="w-3.5 h-3.5" /> 3. Black Hole Spaghetti
          </button>
        </div>
      </div>

      {/* =========================================================================
          EXPERIMENT 1: CAN YOU THROW A BALL TO THE MOON? (WITH JOURNEY TRACKER)
          ========================================================================= */}
      {unthinkableMode === 'moon_throw' && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
          
          {/* Left: Interactive Canvas with Active Journey Tracker (8 cols) */}
          <div className="lg:col-span-8 flex flex-col rounded-2xl bg-slate-900/90 border border-slate-800 shadow-2xl relative overflow-hidden">
            
            {/* Live Journey Milestone HUD Card on Top */}
            <div className="absolute top-3 inset-x-4 z-20 flex items-center justify-between flex-wrap gap-2 pointer-events-none">
              <div className="px-3.5 py-1.5 rounded-xl bg-slate-950/90 border border-cyan-500/40 text-xs shadow-xl backdrop-blur-md flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span className="text-slate-400">Flight Stage:</span>
                <strong className="text-cyan-300 font-bold">{flightMilestone}</strong>
              </div>

              <div className="px-3 py-1.5 rounded-xl bg-slate-950/90 border border-purple-500/40 text-xs shadow-xl backdrop-blur-md">
                <span className="text-slate-400">Altitude: </span>
                <strong className="text-purple-300 font-bold">{realtimeAltitudeKm.toLocaleString()} km</strong>
              </div>
            </div>

            <canvas
              ref={canvasRef}
              width={900}
              height={520}
              className="w-full h-full object-cover"
            />

            {/* Dynamic Outcome Banner */}
            {flightOutcome && (
              <div className="absolute top-16 left-1/2 -translate-x-1/2 z-20 w-11/12 max-w-lg">
                <div className="p-3.5 rounded-xl bg-slate-950/95 border-2 border-cyan-400 text-center shadow-2xl backdrop-blur-md animate-bounce">
                  <p className="font-bold text-xs sm:text-sm text-cyan-200">
                    {flightOutcome}
                  </p>
                </div>
              </div>
            )}

            {/* Bottom Controls Bar */}
            <div className="absolute bottom-3 left-4 right-4 z-20 flex items-center justify-between flex-wrap gap-2 pointer-events-auto">
              <div className="flex items-center gap-2">
                <button
                  onClick={launchMoonThrow}
                  disabled={isFlying}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-400 hover:to-purple-500 text-white font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-pink-500/25 transition-all disabled:opacity-50"
                >
                  <Play className="w-4 h-4 fill-current" /> Throw Into Space!
                </button>
                <button
                  onClick={resetMoonThrow}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 border border-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" /> Reset
                </button>
              </div>

              {/* Quick Velocity Presets for Kids */}
              <div className="flex items-center gap-1 bg-slate-950/90 p-1 rounded-xl border border-slate-800 text-[10px]">
                <button onClick={() => applyPreset(0.035, 45)} className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300">
                  ⚾ Human (35 m/s)
                </button>
                <button onClick={() => applyPreset(7.9, 45)} className="px-2 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-600/40 font-bold">
                  🛰️ Orbit (7.9 km/s)
                </button>
                <button onClick={() => applyPreset(11.2, 48)} className="px-2 py-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-600/40 font-bold">
                  🌕 Moon (11.2 km/s)
                </button>
              </div>
            </div>
          </div>

          {/* Right: Flight Controls & Cosmic Science Card (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-3 min-h-0 overflow-y-auto pr-1">
            
            {/* Speed Slider */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400 font-bold">Throw Speed:</span>
                <span className="font-bold text-cyan-300">
                  {velocityKmS >= 1 ? `${velocityKmS} km/s` : `${(velocityKmS * 1000).toFixed(0)} m/s`}
                </span>
              </div>
              <input
                type="range"
                min="0.01"
                max="25"
                step="0.1"
                value={velocityKmS > 25 ? 25 : velocityKmS}
                onChange={(e) => setVelocityKmS(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
              <div className="flex justify-between text-[9px] text-slate-500">
                <span>0.01 km/s (Slow)</span>
                <span className="text-cyan-400 font-bold">7.9 km/s (Orbit)</span>
                <span className="text-emerald-400 font-bold">11.2 km/s (Moon)</span>
              </div>

              {/* Launch Angle */}
              <div className="pt-2 border-t border-slate-800">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400 font-bold">Angle:</span>
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
              </div>
            </div>

            {/* Where It Goes Explanation */}
            <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2 text-xs">
              <span className="font-bold text-purple-300 uppercase tracking-wider block">
                Where Does Your Throw Go?
              </span>
              <div className="space-y-1.5 text-[11px] font-sans">
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <strong className="text-amber-400">Under 7.9 km/s:</strong> Earth's gravity curves it back down to the ground.
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <strong className="text-cyan-400">At 7.9 km/s (Orbital Speed):</strong> The ball falls around the curve of the Earth forever like the ISS!
                </div>
                <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <strong className="text-emerald-400">At 11.2 km/s (Escape Velocity):</strong> Kinetic energy breaks Earth's chokehold and flies all 384,400 km to crash onto the Moon!
                </div>
              </div>
            </div>

            {/* Fun Fact Card */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-pink-950/60 to-slate-900 border border-pink-500/30 text-xs shadow-xl space-y-1.5">
              <div className="flex items-center gap-1.5 text-pink-400 font-bold">
                <Sparkles className="w-4 h-4" />
                <span>Senku's Cosmic Secret</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                Why don't satellites fall out of the sky? Because they ARE falling! But they're moving sideways so fast (7.9 km/s) that by the time they fall, Earth's round curve bends away underneath them!
              </p>
            </div>

          </div>

        </div>
      )}

      {/* =========================================================================
          EXPERIMENT 2: THE PLANETARY GRAVITY TRAMPOLINE
          ========================================================================= */}
      {unthinkableMode === 'trampoline_jump' && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
          
          {/* Trampoline Visual Jump Arena (8 cols) */}
          <div className="lg:col-span-8 rounded-2xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col justify-between items-center relative overflow-hidden shadow-2xl">
            
            <div className="w-full flex items-center justify-between text-xs pb-2 border-b border-slate-800">
              <span className="font-bold text-amber-300 uppercase tracking-wider">
                Planetary Trampoline Arena: {planetsData[trampolinePlanet].name}
              </span>
              <span className="text-slate-400">Gravity: <strong>{planetsData[trampolinePlanet].gravity} m/s²</strong></span>
            </div>

            {/* Trampoline Stage */}
            <div className="relative w-full flex-1 flex flex-col items-center justify-end pb-8">
              
              {/* Jump Height Meter Stick & Real-Time Laser Height Bar */}
              <div className="absolute left-10 bottom-12 top-6 w-16 border-r-2 border-slate-700 flex flex-col justify-between text-[9px] text-slate-500 font-mono">
                <span>3.5m (Roof)</span>
                <span>2.0m (Door)</span>
                <span>1.0m (Table)</span>
                <span>0.5m (Chair)</span>
                <span>0m (Bed)</span>
              </div>

              {/* Dynamic Laser Height Marker following character */}
              {jumpOffsetPx > 5 && (
                <div
                  style={{ bottom: `${48 + jumpOffsetPx}px` }}
                  className="absolute left-16 right-16 border-b border-dashed border-amber-400/60 pointer-events-none flex justify-end pr-2 transition-all"
                >
                  <span className="text-[10px] font-mono font-bold text-amber-300 bg-slate-950/80 px-1 rounded">
                    Height: {(jumpOffsetPx / 75).toFixed(2)} m
                  </span>
                </div>
              )}

              {/* Natural Physics Animated Jumping Character */}
              <div
                style={{
                  transform: `translateY(-${jumpOffsetPx}px) scale(${characterScale.x}, ${characterScale.y})`,
                  transition: trampolineState === 'squat' ? 'transform 0.25s ease-out' : 'none',
                }}
                className="relative z-20 flex flex-col items-center will-change-transform"
              >
                {/* Speech Bubble when in mid-air or landing */}
                {trampolineState !== 'idle' && (
                  <div className="mb-2 px-3 py-1 rounded-full bg-slate-950 border border-amber-400 text-amber-300 text-xs font-bold shadow-xl animate-pulse">
                    {trampolineState === 'squat'
                      ? 'Squatting & loading springs...'
                      : trampolineState === 'apex'
                      ? (planetsData[trampolinePlanet].jumpM > 2 ? 'Wheee! Floaty apex hang-time! 🌌' : 'At the peak!')
                      : trampolineState === 'landing'
                      ? 'Cushioning impact!'
                      : 'Launching!'}
                  </div>
                )}

                {/* Astronaut Emoji / Sprite */}
                <div className="text-6xl drop-shadow-[0_12px_24px_rgba(0,0,0,0.9)]">
                  🧑‍🚀
                </div>
              </div>

              {/* Dynamic Trampoline Bed with Real Spring Stretch and Sag Curve */}
              <div className="relative w-72 flex flex-col items-center z-10">
                <svg viewBox="0 0 280 50" className="w-full h-12 overflow-visible">
                  {/* Outer Steel Tubular Ring */}
                  <rect x="0" y="20" width="280" height="10" fill="#1e293b" stroke="#f59e0b" strokeWidth="2.5" rx="5" />

                  {/* Left Coil Springs */}
                  <path
                    d={`M 10 25 Q 15 ${25 + bedDeflection * 0.3} 20 ${25 + bedDeflection * 0.4}`}
                    stroke="#94a3b8"
                    strokeWidth="3"
                    fill="none"
                  />
                  {/* Right Coil Springs */}
                  <path
                    d={`M 260 ${25 + bedDeflection * 0.4} Q 265 ${25 + bedDeflection * 0.3} 270 25`}
                    stroke="#94a3b8"
                    strokeWidth="3"
                    fill="none"
                  />

                  {/* Elastic Bed Fabric (Naturally sags when squatted or landed on!) */}
                  <path
                    d={`M 20 ${25 + bedDeflection * 0.4} Q 140 ${25 + bedDeflection} 260 ${25 + bedDeflection * 0.4}`}
                    stroke="#fbbf24"
                    strokeWidth="5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  {/* Subtle Shadow under sagged bed */}
                  <path
                    d={`M 20 ${28 + bedDeflection * 0.4} Q 140 ${28 + bedDeflection} 260 ${28 + bedDeflection * 0.4}`}
                    stroke="rgba(0,0,0,0.4)"
                    strokeWidth="3"
                    fill="none"
                  />
                </svg>

                {/* Trampoline Steel Legs */}
                <div className="w-56 flex justify-between -mt-3.5">
                  <div className="w-3 h-10 bg-slate-700 rounded-b shadow-md" />
                  <div className="w-3 h-10 bg-slate-700 rounded-b shadow-md" />
                  <div className="w-3 h-10 bg-slate-700 rounded-b shadow-md" />
                </div>
              </div>

            </div>

            {/* Jump Button */}
            <button
              onClick={() => triggerTrampolineJump(trampolinePlanet)}
              disabled={trampolineState !== 'idle'}
              className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-xs uppercase tracking-wider flex items-center gap-2 shadow-xl shadow-amber-500/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              <Zap className="w-4 h-4 fill-current" /> Jump on Trampoline!
            </button>

          </div>

          {/* Planet Selector Deck (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-3 min-h-0 overflow-y-auto pr-1">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-2">
                Choose Where to Jump:
              </span>

              {(['earth', 'moon', 'mars', 'jupiter', 'asteroid'] as const).map((pk) => (
                <button
                  key={pk}
                  onClick={() => triggerTrampolineJump(pk)}
                  className={`w-full p-2.5 rounded-xl text-left border transition-all ${
                    trampolinePlanet === pk
                      ? 'border-amber-400 bg-amber-950/60 text-white font-bold shadow'
                      : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold">{planetsData[pk].name}</span>
                    <span className="text-amber-400 font-bold">{planetsData[pk].jumpM}m Jump</span>
                  </div>
                </button>
              ))}
            </div>

            {/* Explanation of Selected World */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/30 shadow-xl space-y-2 text-xs">
              <span className="font-bold text-amber-300 uppercase block">
                What Happens on {planetsData[trampolinePlanet].name}:
              </span>
              <p className="text-xs text-slate-200 font-sans leading-relaxed">
                {planetsData[trampolinePlanet].desc}
              </p>
            </div>
          </div>

        </div>
      )}

      {/* =========================================================================
          EXPERIMENT 3: THE BLACK HOLE SPAGHETTIFICATION MACHINE
          ========================================================================= */}
      {unthinkableMode === 'black_hole' && (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-3 min-h-0">
          
          {/* Black Hole Stage (8 cols) */}
          <div className="lg:col-span-8 rounded-2xl bg-slate-900/90 border border-slate-800 p-6 flex flex-col justify-between items-center relative overflow-hidden shadow-2xl">
            
            <div className="w-full flex items-center justify-between text-xs pb-2 border-b border-slate-800">
              <span className="font-bold text-purple-300 uppercase tracking-wider">
                Event Horizon Simulator: Tidal Gravitational Noodling
              </span>
              <span className="text-slate-400">Distance to Horizon: <strong>{spaghettiDistance}%</strong></span>
            </div>

            {/* Glowing Black Hole Center */}
            <div className="relative flex-1 w-full flex items-center justify-center">
              
              {/* Accretion Disk Vortex */}
              <div className="w-64 h-64 rounded-full bg-gradient-to-r from-purple-600 via-pink-500 to-amber-500 opacity-60 blur-xl animate-spin" style={{ animationDuration: '12s' }} />
              
              {/* Black Hole Event Horizon Sphere */}
              <div className="absolute w-36 h-36 rounded-full bg-black border-2 border-purple-500 shadow-[0_0_50px_rgba(168,85,247,0.8)] flex items-center justify-center">
                <span className="text-[10px] text-purple-300 font-bold text-center">Event Horizon<br />(No Return)</span>
              </div>

              {/* Spaghettifying Object */}
              <div
                style={{
                  transform: `translate(${-(spaghettiDistance * 1.8)}px, 0px) scaleY(${1 + (100 - spaghettiDistance) * 0.05}) scaleX(${Math.max(0.2, 1 - (100 - spaghettiDistance) * 0.008)})`,
                  transition: 'transform 0.1s ease-out',
                }}
                className="absolute z-20 text-5xl will-change-transform filter drop-shadow-[0_0_15px_#ec4899]"
              >
                {droppedItem === 'apple' ? '🍎' : droppedItem === 'astronaut' ? '🧑‍🚀' : '⏰'}
              </div>

            </div>

            {/* Distance Slider */}
            <div className="w-full max-w-md space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Lower Object Towards Black Hole:</span>
                <span className="text-pink-400 font-bold">{spaghettiDistance}% Distance</span>
              </div>
              <input
                type="range"
                min="5"
                max="100"
                step="1"
                value={spaghettiDistance}
                onChange={(e) => setSpaghettiDistance(parseInt(e.target.value))}
                className="w-full accent-pink-500 cursor-pointer h-2 bg-slate-800 rounded-lg"
              />
            </div>

          </div>

          {/* Item Selector & Science Explanation (4 cols) */}
          <div className="lg:col-span-4 flex flex-col gap-3 min-h-0 overflow-y-auto pr-1">
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2">
              <span className="text-xs font-bold text-purple-400 uppercase tracking-wider block mb-1">
                Choose Object to Drop:
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'apple', label: '🍎 Apple' },
                  { id: 'astronaut', label: '🧑‍🚀 Astronaut' },
                  { id: 'clock', label: '⏰ Clock' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setDroppedItem(item.id as any)}
                    className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                      droppedItem === item.id
                        ? 'border-purple-400 bg-purple-950 text-white shadow'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/90 border border-purple-500/30 shadow-xl space-y-2 text-xs">
              <span className="font-bold text-purple-300 uppercase block">
                What is "Spaghettification"?
              </span>
              <p className="text-xs text-slate-200 font-sans leading-relaxed">
                Near a black hole, gravity pulls MUCH harder on your feet than on your head! This difference (tidal force) stretches you out like a long strand of spaghetti!
              </p>
              <p className="text-[11px] text-pink-300 font-sans leading-relaxed pt-1 border-t border-slate-800">
                And if you look at the clock: gravitational time dilation causes time to tick slower and slower until it appears completely frozen at the edge!
              </p>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
