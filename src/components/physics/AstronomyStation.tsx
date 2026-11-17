import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { CELESTIAL_OBJECTS } from '../../data/experimentsData';
import { AstronomyTarget } from '../../types/laboratory';
import { soundManager } from '../../audio/SoundManager';
import { Orbit, Play, Pause, Radio, ArrowLeft, ZoomIn, ZoomOut, RotateCcw, Sparkles, Globe } from 'lucide-react';

interface AstronomyStationProps {
  onBackToLab: () => void;
}

export const AstronomyStation: React.FC<AstronomyStationProps> = ({ onBackToLab }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedTarget, setSelectedTarget] = useState<AstronomyTarget>(
    CELESTIAL_OBJECTS.find((c) => c.id === 'earth') || CELESTIAL_OBJECTS[3]
  );
  const [viewMode, setViewMode] = useState<'system' | 'focus'>('system');
  const [orbitSpeed, setOrbitSpeed] = useState<number>(1.0);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [isWhyManActive, setIsWhyManActive] = useState<boolean>(true);

  // References for Three.js control
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const planetMeshesRef = useRef<Map<string, { mesh: THREE.Mesh; pivot: THREE.Group; speed: number; dist: number }>>(
    new Map()
  );
  const sunMeshRef = useRef<THREE.Mesh | null>(null);

  // Camera targets for smooth animation
  const targetCameraPos = useRef(new THREE.Vector3(0, 36, 68));
  const targetLookAt = useRef(new THREE.Vector3(0, 0, 0));
  const currentLookAt = useRef(new THREE.Vector3(0, 0, 0));

  // Mouse drag state for 3D rotation
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x04060c);
    sceneRef.current = scene;

    const width = container.clientWidth;
    const height = container.clientHeight;
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1500);
    camera.position.set(0, 36, 68);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Deep Space Starfield
    const starGeo = new THREE.BufferGeometry();
    const starCount = 3500;
    const starPositions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPositions[i] = (Math.random() - 0.5) * 800;
      starPositions[i + 1] = (Math.random() - 0.5) * 800;
      starPositions[i + 2] = (Math.random() - 0.5) * 800;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starMat = new THREE.PointsMaterial({ color: 0xffffff, size: 0.95, transparent: true, opacity: 0.9 });
    const starField = new THREE.Points(starGeo, starMat);
    scene.add(starField);

    // Central Sun
    const sunGeo = new THREE.SphereGeometry(4.2, 32, 32);
    const sunMat = new THREE.MeshBasicMaterial({ color: 0xffaa00 });
    const sunMesh = new THREE.Mesh(sunGeo, sunMat);
    sunMesh.userData = { id: 'sun' };
    scene.add(sunMesh);
    sunMeshRef.current = sunMesh;

    // Glowing Corona Halo around Sun
    const coronaGeo = new THREE.SphereGeometry(4.8, 32, 32);
    const coronaMat = new THREE.MeshBasicMaterial({
      color: 0xf59e0b,
      transparent: true,
      opacity: 0.35,
      side: THREE.BackSide,
    });
    const coronaMesh = new THREE.Mesh(coronaGeo, coronaMat);
    scene.add(coronaMesh);

    // Sun Point Light
    const sunLight = new THREE.PointLight(0xffffff, 3.2, 600, 0.6);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0x64748b, 0.65);
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
      // Orbit Path Ring
      const orbitGeo = new THREE.RingGeometry(p.dist - 0.08, p.dist + 0.08, 64);
      const orbitMat = new THREE.MeshBasicMaterial({
        color: 0x475569,
        side: THREE.DoubleSide,
        opacity: 0.45,
        transparent: true,
      });
      const orbitRing = new THREE.Mesh(orbitGeo, orbitMat);
      orbitRing.rotation.x = Math.PI / 2;
      scene.add(orbitRing);

      // Pivot
      const pivot = new THREE.Group();
      scene.add(pivot);

      // Planet Mesh with Standard material
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

      planetMeshesRef.current.set(p.id, { mesh, pivot, speed: p.speed, dist: p.dist });
    });

    // Mouse Drag Listeners for Free 3D Rotation
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      if (viewMode === 'system') {
        scene.rotation.y += deltaX * 0.006;
        scene.rotation.x = Math.max(-0.7, Math.min(0.7, scene.rotation.x + deltaY * 0.004));
      } else {
        // In focus view, rotate focused planet or scene around it
        const targetObj = planetMeshesRef.current.get(selectedTarget.id);
        if (targetObj) {
          targetObj.mesh.rotation.y += deltaX * 0.015;
          targetObj.mesh.rotation.x += deltaY * 0.015;
        } else if (selectedTarget.id === 'sun' && sunMeshRef.current) {
          sunMeshRef.current.rotation.y += deltaX * 0.015;
        }
      }

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    // Zoom with mouse wheel
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (!cameraRef.current) return;
      const zoomFactor = e.deltaY > 0 ? 1.08 : 0.92;
      if (viewMode === 'system') {
        cameraRef.current.position.multiplyScalar(zoomFactor);
        const dist = cameraRef.current.position.length();
        if (dist < 15) cameraRef.current.position.setLength(15);
        if (dist > 180) cameraRef.current.position.setLength(180);
      }
    };

    // Raycast click to select planet directly from 3D canvas
    const onClick = (e: MouseEvent) => {
      if (!container || !cameraRef.current || !sceneRef.current) return;
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycasterRef.current.setFromCamera(mouseRef.current, cameraRef.current);
      const meshesToTest: THREE.Mesh[] = [];
      if (sunMeshRef.current) meshesToTest.push(sunMeshRef.current);
      planetMeshesRef.current.forEach((val) => meshesToTest.push(val.mesh));

      const intersects = raycasterRef.current.intersectObjects(meshesToTest, false);
      if (intersects.length > 0) {
        const hitId = intersects[0].object.userData?.id;
        const targetFound = CELESTIAL_OBJECTS.find((c) => c.id === hitId);
        if (targetFound) {
          soundManager.playClick();
          setSelectedTarget(targetFound);
        }
      }
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: false });
    container.addEventListener('click', onClick);

    // Animation Loop
    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Orbit animation when not paused
      if (!isPaused) {
        planetMeshesRef.current.forEach((p) => {
          p.pivot.rotation.y += p.speed * 0.15 * orbitSpeed * delta;
          p.mesh.rotation.y += 0.6 * delta;
        });
      }

      if (sunMeshRef.current) {
        sunMeshRef.current.rotation.y += 0.15 * delta;
      }

      // Smooth camera interpolation in focus mode
      if (cameraRef.current) {
        if (viewMode === 'focus') {
          if (selectedTarget.id === 'sun') {
            targetCameraPos.current.set(0, 4, 14);
            targetLookAt.current.set(0, 0, 0);
          } else {
            const targetObj = planetMeshesRef.current.get(selectedTarget.id);
            if (targetObj) {
              const worldPos = new THREE.Vector3();
              targetObj.mesh.getWorldPosition(worldPos);
              targetLookAt.current.copy(worldPos);

              // Position camera at a slight offset from the planet
              const offsetDist = selectedTarget.id === 'jupiter' ? 8 : selectedTarget.id === 'saturn' ? 8.5 : 5;
              targetCameraPos.current.set(worldPos.x + offsetDist * 0.7, worldPos.y + 2, worldPos.z + offsetDist);
            }
          }
        } else {
          // System view default position
          targetCameraPos.current.set(0, 36, 68);
          targetLookAt.current.set(0, 0, 0);
        }

        // Lerp camera position and lookAt smoothly
        cameraRef.current.position.lerp(targetCameraPos.current, 0.05);
        currentLookAt.current.lerp(targetLookAt.current, 0.05);
        cameraRef.current.lookAt(currentLookAt.current);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container || !cameraRef.current || !rendererRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('click', onClick);
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [orbitSpeed, isPaused, viewMode, selectedTarget]);

  // Switch between Solar System Overview and Focus Planet mode
  const handleToggleMode = (mode: 'system' | 'focus') => {
    soundManager.playClick();
    setViewMode(mode);
  };

  const handleSelectPlanet = (target: AstronomyTarget) => {
    soundManager.playClick();
    setSelectedTarget(target);
  };

  const handleResetCamera = () => {
    soundManager.playClick();
    setViewMode('system');
    if (sceneRef.current) {
      sceneRef.current.rotation.set(0, 0, 0);
    }
    if (cameraRef.current) {
      targetCameraPos.current.set(0, 36, 68);
      targetLookAt.current.set(0, 0, 0);
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-slate-950 flex flex-col pt-16">
      {/* 3D WebGL Canvas - Clean, Full-Screen, Unobstructed */}
      <div ref={mountRef} className="absolute inset-0 z-0 cursor-grab active:cursor-grabbing" />

      {/* WHY-MAN 2.5 GHz RADIO SIGNAL DETECTOR (When The Moon is selected) */}
      {selectedTarget.id === 'moon' && isWhyManActive && (
        <div className="absolute top-20 right-4 sm:right-6 z-20 pointer-events-auto bg-slate-950/90 border border-emerald-500/60 p-3.5 rounded-2xl max-w-xs shadow-2xl backdrop-blur-xl animate-in fade-in duration-300">
          <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-emerald-500/30">
            <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 font-mono">
              <Radio className="w-4 h-4 animate-pulse text-emerald-400" />
              Why-Man Radio Frequency
            </span>
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-red-950 text-red-400 border border-red-700/60 font-mono">
              2.500 GHz
            </span>
          </div>

          {/* Pulsating Oscilloscope Waveform */}
          <div className="h-10 bg-slate-900/90 rounded-lg border border-emerald-500/30 p-1 flex items-center justify-center overflow-hidden mb-2">
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
            <div className="text-slate-300">
              <span className="text-amber-400 font-bold">Signal Origin:</span> Lunar Surface
            </div>
            <div className="text-slate-300">
              <span className="text-amber-400 font-bold">Modulation:</span> Morse Code Loop
            </div>
            <div className="p-1.5 rounded bg-slate-900 border border-slate-700 text-emerald-300 font-black text-center tracking-widest text-xs">
              "WHY... WHY... WHY..."
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-slate-800 text-[10px] text-slate-400 font-sans italic">
            Dr. Stone Chapter 138 • Petrification Device broadcast detected!
          </div>
        </div>
      )}

      {/* Top Header Bar */}
      <div className="relative z-20 px-4 sm:px-6 py-2 flex items-center justify-between pointer-events-none flex-wrap gap-2">
        <div className="pointer-events-auto flex items-center gap-2 flex-wrap">
          <button
            onClick={() => {
              soundManager.playClick();
              onBackToLab();
            }}
            className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-cyan-400 text-slate-300 hover:text-white flex items-center gap-1.5 text-xs font-mono font-bold shadow-xl backdrop-blur-md transition-all group"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-cyan-400 group-hover:-translate-x-0.5 transition-transform" />
            <span>Physics Workshop</span>
          </button>

          {/* Mode Switcher: 3D Solar System vs Focus Planet */}
          <div className="flex rounded-xl bg-slate-900/90 border border-slate-700/80 p-1 shadow-2xl backdrop-blur-md">
            <button
              onClick={() => handleToggleMode('system')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                viewMode === 'system'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-lg shadow-cyan-500/25'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Orbit className="w-3.5 h-3.5" /> Full Solar System
            </button>
            <button
              onClick={() => handleToggleMode('focus')}
              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                viewMode === 'focus'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-slate-950 font-black shadow-lg shadow-amber-500/25'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <Globe className="w-3.5 h-3.5" /> Focus: {selectedTarget.name.split(' ')[0]}
            </button>
          </div>

          <button
            onClick={handleResetCamera}
            className="px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700 hover:border-slate-500 text-slate-400 hover:text-white text-xs font-mono flex items-center gap-1 shadow-xl backdrop-blur-md transition-all"
            title="Reset Camera Angle"
          >
            <RotateCcw className="w-3 h-3 text-cyan-400" />
            <span className="hidden sm:inline">Reset Angle</span>
          </button>
        </div>

        {/* Orbit speed and simulation controls */}
        <div className="pointer-events-auto bg-slate-900/90 border border-slate-700/80 px-3.5 py-1.5 rounded-xl flex items-center gap-3 shadow-2xl backdrop-blur-md">
          <button
            onClick={() => {
              soundManager.playClick();
              setIsPaused(!isPaused);
            }}
            className="text-slate-300 hover:text-white transition-colors"
            title={isPaused ? 'Resume Planetary Orbits' : 'Pause Orbits'}
          >
            {isPaused ? <Play className="w-4 h-4 text-emerald-400" /> : <Pause className="w-4 h-4 text-amber-400" />}
          </button>
          <span className="text-[10px] text-slate-400 font-mono uppercase">Orbit Speed:</span>
          <input
            type="range"
            min="0.2"
            max="3.0"
            step="0.2"
            value={orbitSpeed}
            onChange={(e) => setOrbitSpeed(Number(e.target.value))}
            className="w-20 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
          />
          <span className="text-xs font-mono text-cyan-300 font-bold">{orbitSpeed.toFixed(1)}x</span>
        </div>
      </div>

      {/* Helpful Hint HUD in the top center */}
      <div className="absolute top-28 left-1/2 -translate-x-1/2 z-10 pointer-events-none text-center">
        <span className="text-[11px] font-mono text-cyan-300/80 bg-slate-950/70 border border-cyan-500/30 px-3 py-1 rounded-full backdrop-blur-md shadow-lg">
          ✦ Drag anywhere to rotate 3D view • Scroll wheel to zoom in/out • Click any planet to focus
        </span>
      </div>

      {/* Bottom Celestial Selector Bar & Selected Planet Scientific Data Card */}
      <div className="relative z-20 mt-auto p-4 sm:p-6 flex flex-col sm:flex-row items-end justify-between gap-4 pointer-events-none">
        {/* Planet quick selector chips */}
        <div className="pointer-events-auto bg-slate-950/90 border border-slate-700/80 p-2 rounded-2xl flex flex-wrap gap-1.5 max-w-xl shadow-2xl backdrop-blur-xl">
          {CELESTIAL_OBJECTS.map((obj) => {
            const isSelected = selectedTarget.id === obj.id;
            return (
              <button
                key={obj.id}
                onClick={() => handleSelectPlanet(obj)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 font-mono ${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-slate-950 font-black shadow-lg shadow-cyan-500/25 scale-105'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full border border-slate-600 shadow-sm"
                  style={{ backgroundColor: obj.color }}
                />
                <span>{obj.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Planet Scientific Data Card */}
        {selectedTarget && (
          <div className="pointer-events-auto bg-slate-950/95 border border-cyan-500/50 p-4 rounded-2xl max-w-sm w-full shadow-2xl animate-in fade-in duration-200 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
              <div>
                <span className="text-[10px] text-cyan-400 font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" /> Planetary Orbit Focus
                </span>
                <h3 className="font-bold text-base text-white font-mono">{selectedTarget.name}</h3>
              </div>
              <span
                className="w-4 h-4 rounded-full border-2 border-slate-400 shadow-[0_0_10px_rgba(255,255,255,0.4)]"
                style={{ backgroundColor: selectedTarget.color }}
              />
            </div>

            <p className="text-slate-300 text-xs leading-relaxed mb-2.5 font-sans">
              {selectedTarget.description}
            </p>

            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
              <div className="p-2 rounded-lg bg-slate-900/95 border border-slate-800">
                <span className="text-slate-400 block text-[9px] uppercase font-sans">Distance:</span>
                <span className="text-cyan-300 font-bold">{selectedTarget.distance}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/95 border border-slate-800">
                <span className="text-slate-400 block text-[9px] uppercase font-sans">Diameter:</span>
                <span className="text-cyan-300 font-bold">{selectedTarget.diameter}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/95 border border-slate-800">
                <span className="text-slate-400 block text-[9px] uppercase font-sans">Surface Temp:</span>
                <span className="text-amber-400 font-bold">{selectedTarget.temperature}</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-900/95 border border-slate-800">
                <span className="text-slate-400 block text-[9px] uppercase font-sans">Orbit Period:</span>
                <span className="text-emerald-400 font-bold">{selectedTarget.orbitalPeriod || 'N/A'}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
