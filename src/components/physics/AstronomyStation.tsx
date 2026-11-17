import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CELESTIAL_OBJECTS } from '../../data/experimentsData';
import { AstronomyTarget } from '../../types/laboratory';
import { soundManager } from '../../audio/SoundManager';
import { Telescope, Compass, Orbit, Play, Pause, Radio, Zap, Eye, Volume2 } from 'lucide-react';

interface AstronomyStationProps {
  onBackToLab: () => void;
}

export const AstronomyStation: React.FC<AstronomyStationProps> = ({ onBackToLab }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedTarget, setSelectedTarget] = useState<AstronomyTarget>(CELESTIAL_OBJECTS[4]); // The Moon default or Earth
  const [viewMode, setViewMode] = useState<'orrery' | 'telescope'>('orrery');
  const [orbitSpeed, setOrbitSpeed] = useState<number>(1.0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [magnification, setMagnification] = useState<'100x' | '400x' | '800x' | '1200x'>('400x');
  const [isWhyManActive, setIsWhyManActive] = useState<boolean>(true);

  // References for Three.js control
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const planetMeshesRef = useRef<Map<string, { mesh: THREE.Mesh; pivot: THREE.Group; speed: number }>>(new Map());

  // Mouse drag state for 3D rotation
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x06070a);
    sceneRef.current = scene;

    const width = container.clientWidth;
    const height = container.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 36, 68);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    container.appendChild(renderer.domElement);

    // Deep Space Starfield
    const starGeo = new THREE.BufferGeometry();
    const starCount = 3000;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 600;
      starPositions[i + 1] = (Math.random() - 0.5) * 600;
      starPositions[i + 2] = (Math.random() - 0.5) * 600;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.85, transparent: true, opacity: 0.9 });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // Central Sun
    const sunGeo = new THREE.SphereGeometry(4.2, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    scene.add(sunMesh);

    // Glowing Corona Halo around Sun
    const coronaGeo = new THREE.SphereGeometry(4.7, 32, 32);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.35,
      side: THREE.BackSide,
    });
    const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
    scene.add(coronaMesh);

    // Sun Point Light
    const sunLight = new THREE.PointLight(0xffffff, 3.2, 500, 0.6);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x64748b, 0.6);
    scene.add(ambientLight);

    // 3D Planets & Moon Config
    const planetsData = [
      { id: 'mercury', name: 'Mercury', size: 0.8, dist: 8, speed: 4.1, color: 0x94a3b8 },
      { id: 'venus', name: 'Venus', size: 1.25, dist: 12.5, speed: 1.6, color: 0xfbbf24 },
      { id: 'earth', name: 'Earth', size: 1.35, dist: 17.5, speed: 1.0, color: 0x38bdf8 },
      { id: 'moon', name: 'The Moon', size: 0.65, dist: 20.5, speed: 1.3, color: 0xe2e8f0, isMoon: true },
      { id: 'mars', name: 'Mars', size: 0.95, dist: 25.5, speed: 0.53, color: 0xef4444 },
      { id: 'jupiter', name: 'Jupiter', size: 3.0, dist: 35, speed: 0.22, color: 0xd97706 },
      { id: 'saturn', name: 'Saturn', size: 2.4, dist: 46, speed: 0.12, color: 0xfef08a, hasRings: true },
    ];

    planetMeshesRef.current.clear();

    planetsData.forEach((p) => {
      // Orbit Ring
      const orbitGeo = new THREE.RingGeometry(p.dist - 0.08, p.dist + 0.08, 64);
      const orbitMat = new THREE.MeshBasicMaterial({ color: 0x44403c, side: THREE.DoubleSide, opacity: 0.5, transparent: true });
      const orbitRing = new THREE.Mesh(orbitGeo, orbitMat);
      orbitRing.rotation.x = Math.PI / 2;
      scene.add(orbitRing);

      // Pivot
      const pivot = new THREE.Group();
      scene.add(pivot);

      // Planet Mesh with PBR materials
      const geo = new THREE.SphereGeometry(p.size, 32, 32);
      const mat = new THREE.MeshStandardMaterial({
        color: p.color,
        roughness: p.isMoon ? 0.9 : 0.6,
        metalness: 0.1,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(p.dist, 0, 0);
      mesh.userData = { id: p.id };
      pivot.add(mesh);

      // Saturn 3D Rings
      if (p.hasRings) {
        const ringGeo = new THREE.RingGeometry(p.size * 1.35, p.size * 2.4, 48);
        const ringMat = new THREE.MeshStandardMaterial({
          color: 0xfef08a,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.85,
          roughness: 0.5,
        });
        const rings = new THREE.Mesh(ringGeo, ringMat);
        rings.rotation.x = Math.PI / 2.3;
        mesh.add(rings);
      }

      planetMeshesRef.current.set(p.id, { mesh, pivot, speed: p.speed });
    });

    // Mouse Drag Listeners for 3D Interactive Rotation
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      if (viewMode === 'orrery') {
        scene.rotation.y += deltaX * 0.006;
        scene.rotation.x = Math.max(-0.6, Math.min(0.6, scene.rotation.x + deltaY * 0.004));
      } else {
        // Rotate the individual targeted planet in 3D
        const targetObj = planetMeshesRef.current.get(selectedTarget.id);
        if (targetObj) {
          targetObj.mesh.rotation.y += deltaX * 0.015;
          targetObj.mesh.rotation.x += deltaY * 0.015;
        }
      }

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    // Animation Loop
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      if (!isPaused && viewMode === 'orrery') {
        planetMeshesRef.current.forEach((p) => {
          p.pivot.rotation.y += p.speed * 0.15 * orbitSpeed * delta;
          p.mesh.rotation.y += 0.6 * delta;
        });
      } else if (viewMode === 'telescope') {
        // Smoothly auto-spin the focused 3D planet
        const targetObj = planetMeshesRef.current.get(selectedTarget.id);
        if (targetObj && !isDraggingRef.current) {
          targetObj.mesh.rotation.y += 0.6 * delta;
        }
      }

      sunMesh.rotation.y += 0.15 * delta;
      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [orbitSpeed, isPaused, viewMode, selectedTarget]);

  // Switch between Orrery and Telescope Close-up
  const handleToggleMode = (mode: 'orrery' | 'telescope') => {
    soundManager.playClick();
    setViewMode(mode);
    const camera = cameraRef.current;
    if (!camera) return;

    if (mode === 'telescope') {
      // Zoom right up to the 3D target planet
      const targetObj = planetMeshesRef.current.get(selectedTarget.id);
      if (targetObj) {
        const zoomDist = magnification === '1200x' ? 4.5 : magnification === '800x' ? 6 : 8.5;
        camera.position.set(targetObj.mesh.position.x, 2, zoomDist);
        camera.lookAt(targetObj.mesh.position.x, 0, 0);
      }
    } else {
      // Orrery Overview
      camera.position.set(0, 36, 68);
      camera.lookAt(0, 0, 0);
      if (sceneRef.current) {
        sceneRef.current.rotation.set(0, 0, 0);
      }
    }
  };

  const handleSelectPlanet = (target: AstronomyTarget) => {
    soundManager.playClick();
    setSelectedTarget(target);
    if (viewMode === 'telescope' && cameraRef.current) {
      const targetObj = planetMeshesRef.current.get(target.id);
      if (targetObj) {
        const zoomDist = magnification === '1200x' ? 4.5 : 8.5;
        cameraRef.current.position.set(targetObj.mesh.position.x, 2, zoomDist);
        cameraRef.current.lookAt(targetObj.mesh.position.x, 0, 0);
      }
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-stone-950 flex flex-col pt-16">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing" />

      {/* Hand-Crafted Brass & Quartz Telescope Eyepiece Overlay */}
      {viewMode === 'telescope' && (
        <div className="absolute inset-0 pointer-events-none z-10 flex items-center justify-center">
          {/* Circular Brass Ocular Bezel */}
          <div className="w-[330px] h-[330px] sm:w-[450px] sm:h-[450px] rounded-full border-[14px] border-amber-950/90 relative flex items-center justify-center shadow-[0_0_90px_rgba(0,0,0,0.95)_inset,0_0_40px_rgba(245,158,11,0.25)]">
            
            {/* Fine Reticle Lines */}
            <div className="w-full h-[1px] bg-amber-500/30 absolute" />
            <div className="h-full w-[1px] bg-amber-500/30 absolute" />
            <div className="w-32 h-32 rounded-full border border-amber-500/25 absolute" />
            <div className="w-64 h-64 rounded-full border border-amber-500/15 absolute stroke-dasharray-4" />

            {/* Circular Degree Marks */}
            <span className="absolute top-4 text-[9px] font-mono text-amber-500/60">000°</span>
            <span className="absolute right-4 text-[9px] font-mono text-amber-500/60">090°</span>
            <span className="absolute bottom-4 text-[9px] font-mono text-amber-500/60">180°</span>
            <span className="absolute left-4 text-[9px] font-mono text-amber-500/60">270°</span>

            <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-stone-950/90 px-3 py-1 rounded-full text-[10px] font-mono text-amber-300 border border-amber-500/40 shadow-lg">
              SENKU'S QUARTZ TELESCOPE: {selectedTarget.name.toUpperCase()}
            </div>
          </div>

          {/* WHY-MAN 2.5 GHz RADIO SIGNAL DETECTOR OVERLAY (When observing The Moon) */}
          {selectedTarget.id === 'moon' && isWhyManActive && (
            <div className="absolute top-20 right-4 sm:right-8 z-30 pointer-events-auto stone-panel p-3.5 rounded-2xl border-2 border-emerald-500/60 max-w-xs shadow-2xl animate-in fade-in duration-300 backdrop-blur-md">
              <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-stone-800">
                <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 font-mono">
                  <Radio className="w-4 h-4 animate-pulse text-emerald-400" />
                  Why-Man Radio Frequency
                </span>
                <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-700/60 font-mono">
                  2.500 GHz
                </span>
              </div>

              {/* Pulsating Oscilloscope Waveform */}
              <div className="h-10 bg-stone-950 rounded-lg border border-emerald-500/30 p-1 flex items-center justify-center overflow-hidden mb-2">
                <svg viewBox="0 0 200 40" className="w-full h-full text-emerald-400">
                  <path
                    d="M 0 20 Q 25 5 50 20 T 100 20 T 150 20 T 200 20"
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2.5"
                    className="animate-pulse"
                  />
                  <path
                    d="M 0 20 Q 25 35 50 20 T 100 20 T 150 20 T 200 20"
                    fill="none"
                    stroke="#34d399"
                    strokeWidth="1.5"
                    opacity="0.6"
                  />
                </svg>
              </div>

              <div className="space-y-1 text-[11px] font-mono">
                <div className="text-stone-300">
                  <span className="text-amber-400 font-bold">Signal Origin:</span> Lunar Surface
                </div>
                <div className="text-stone-300">
                  <span className="text-amber-400 font-bold">Modulation:</span> Morse Code Loop
                </div>
                <div className="p-1.5 rounded bg-stone-950 border border-stone-800 text-emerald-300 font-black text-center tracking-widest text-xs">
                  "WHY... WHY... WHY..."
                </div>
              </div>

              <div className="mt-2 pt-2 border-t border-stone-800 text-[10px] text-stone-400 font-serif italic">
                Dr. Stone Chapter 138 • Petrification Device broadcast detected!
              </div>
            </div>
          )}
        </div>
      )}

      {/* Top Controls Header */}
      <div className="relative z-20 px-4 sm:px-6 py-2 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2">
          <button
            onClick={() => {
              soundManager.playClick();
              onBackToLab();
            }}
            className="stone-panel hover:bg-stone-800 text-stone-200 hover:text-white px-3.5 py-1.5 rounded-xl border border-stone-700/80 text-xs font-bold uppercase tracking-wider transition-all font-mono shadow-xl backdrop-blur-md"
          >
            ← Back to Physics Workshop
          </button>

          {/* Mode Switcher: 3D Solar System vs Telescope Eyepiece */}
          <div className="flex rounded-xl stone-panel p-1 border border-amber-600/50 shadow-xl backdrop-blur-md">
            <button
              onClick={() => handleToggleMode('orrery')}
              className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 font-mono transition-all ${
                viewMode === 'orrery'
                  ? 'bg-amber-500 text-stone-950 shadow'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <Orbit className="w-3.5 h-3.5" /> 3D Celestial System
            </button>
            <button
              onClick={() => handleToggleMode('telescope')}
              className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 font-mono transition-all ${
                viewMode === 'telescope'
                  ? 'bg-amber-500 text-stone-950 shadow'
                  : 'text-stone-300 hover:text-white'
              }`}
            >
              <Telescope className="w-3.5 h-3.5" /> Telescope Eyepiece 3D
            </button>
          </div>
        </div>

        {/* Orbit speed controls */}
        <div className="pointer-events-auto stone-panel px-3.5 py-1.5 rounded-xl border border-stone-700/80 flex items-center gap-3 shadow-xl backdrop-blur-md">
          <button
            onClick={() => {
              soundManager.playClick();
              setIsPaused(!isPaused);
            }}
            className="text-stone-300 hover:text-white"
            title={isPaused ? 'Resume Orbits' : 'Pause Orbits'}
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
          </button>
          <span className="text-[10px] text-stone-400 font-mono uppercase">Speed:</span>
          <input
            type="range"
            min="0.2"
            max="3.0"
            step="0.2"
            value={orbitSpeed}
            onChange={(e) => setOrbitSpeed(Number(e.target.value))}
            className="w-20 h-1.5 bg-stone-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
          />
          <span className="text-xs font-mono text-amber-300">{orbitSpeed.toFixed(1)}x</span>
        </div>
      </div>

      {/* Bottom Planet Selection Bar & 3D Celestial Data Card */}
      <div className="relative z-20 mt-auto p-4 sm:p-6 flex flex-col sm:flex-row items-end justify-between gap-4 pointer-events-none">
        
        {/* Planet quick selector chips */}
        <div className="pointer-events-auto stone-panel p-2 rounded-2xl border border-stone-700/80 flex flex-wrap gap-1.5 max-w-xl shadow-2xl backdrop-blur-md">
          {CELESTIAL_OBJECTS.map((obj) => (
            <button
              key={obj.id}
              onClick={() => handleSelectPlanet(obj)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 font-mono ${
                selectedTarget.id === obj.id
                  ? 'bg-amber-500 text-stone-950 font-black shadow-lg scale-105'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800'
              }`}
            >
              <span className="w-2.5 h-2.5 rounded-full border border-stone-600" style={{ backgroundColor: obj.color }} />
              {obj.name.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Selected Planet Data Card */}
        {selectedTarget && (
          <div className="pointer-events-auto stone-panel p-4 rounded-2xl border border-amber-500/50 max-w-sm w-full shadow-2xl animate-in fade-in duration-200 backdrop-blur-md">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-stone-800">
              <div>
                <span className="text-[10px] text-amber-400 font-mono font-bold uppercase tracking-wider">
                  Senku's Observatory Focus
                </span>
                <h3 className="font-bold text-base text-amber-100 font-serif">{selectedTarget.name}</h3>
              </div>
              <span className="w-4 h-4 rounded-full border-2 border-stone-400" style={{ backgroundColor: selectedTarget.color }} />
            </div>

            <p className="text-stone-300 text-xs leading-relaxed mb-2.5 font-serif">
              {selectedTarget.description}
            </p>

            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="p-2 rounded-lg bg-stone-900/95 border border-stone-800">
                <span className="text-stone-400 block text-[9px] uppercase font-serif">Distance:</span>
                <span className="text-amber-300 font-bold">{selectedTarget.distance}</span>
              </div>
              <div className="p-2 rounded-lg bg-stone-900/95 border border-stone-800">
                <span className="text-stone-400 block text-[9px] uppercase font-serif">Diameter:</span>
                <span className="text-amber-300 font-bold">{selectedTarget.diameter}</span>
              </div>
              <div className="p-2 rounded-lg bg-stone-900/95 border border-stone-800">
                <span className="text-stone-400 block text-[9px] uppercase font-serif">Surface Temp:</span>
                <span className="text-red-400 font-bold">{selectedTarget.temperature}</span>
              </div>
              <div className="p-2 rounded-lg bg-stone-900/95 border border-stone-800">
                <span className="text-stone-400 block text-[9px] uppercase font-serif">Orbit Period:</span>
                <span className="text-emerald-400 font-bold">{selectedTarget.orbitalPeriod || 'N/A'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
