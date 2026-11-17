import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import { soundManager } from '../../audio/SoundManager';
import { Beaker, Pipette, Sparkles, LogIn, ArrowRight } from 'lucide-react';

interface ChemWorkbench3DProps {
  onSelectStation: (station: 'simulator' | 'titration') => void;
}

export const ChemWorkbench3D: React.FC<ChemWorkbench3DProps> = ({ onSelectStation }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [hoveredStation, setHoveredStation] = useState<'simulator' | 'titration' | null>(null);
  const [isZooming, setIsZooming] = useState<boolean>(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050811, 0.04);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    // Initial camera position looking down at workbench
    camera.position.set(0, 3.2, 7.5);
    camera.lookAt(0, 0.4, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // --- LIGHTING ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    // Main Overhead Laboratory Strip Spotlight
    const mainSpot = new THREE.SpotLight(0xecfdf5, 2.8);
    mainSpot.position.set(0, 8, 3);
    mainSpot.angle = Math.PI / 4;
    mainSpot.penumbra = 0.6;
    mainSpot.castShadow = true;
    scene.add(mainSpot);

    // Green Neon Underglow Accent Light
    const greenGlow = new THREE.PointLight(0x10b981, 2.5, 8);
    greenGlow.position.set(-2, 1.2, 0);
    scene.add(greenGlow);

    // Cyan Neon Accent Light for Titration side
    const cyanGlow = new THREE.PointLight(0x06b6d4, 2.5, 8);
    cyanGlow.position.set(2, 1.8, 0);
    scene.add(cyanGlow);

    // --- 3D WORKBENCH TABLE ---
    const tableGroup = new THREE.Group();

    // Tabletop slab (brushed dark slate with green rim)
    const tableGeo = new THREE.BoxGeometry(9.5, 0.35, 4.2);
    const tableMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.25,
      metalness: 0.6,
    });
    const tableMesh = new THREE.Mesh(tableGeo, tableMat);
    tableMesh.position.y = 0;
    tableMesh.receiveShadow = true;
    tableGroup.add(tableMesh);

    // Tabletop Beveled Rim with glowing green trim
    const rimGeo = new THREE.BoxGeometry(9.6, 0.08, 4.3);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0x059669,
      emissive: 0x047857,
      emissiveIntensity: 0.35,
      roughness: 0.3,
    });
    const rimMesh = new THREE.Mesh(rimGeo, rimMat);
    rimMesh.position.y = 0.16;
    tableGroup.add(rimMesh);

    // Sturdy Steel Table Legs
    const legGeo = new THREE.CylinderGeometry(0.12, 0.12, 2.5, 16);
    const legMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.8, roughness: 0.2 });
    
    const legPositions = [
      [-4.4, -1.25, -1.8],
      [4.4, -1.25, -1.8],
      [-4.4, -1.25, 1.8],
      [4.4, -1.25, 1.8],
    ];
    legPositions.forEach(([x, y, z]) => {
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.set(x, y, z);
      leg.castShadow = true;
      tableGroup.add(leg);
    });

    // Floor below
    const floorGeo = new THREE.PlaneGeometry(32, 32);
    const floorMat = new THREE.MeshStandardMaterial({ 
      color: 0x070b13, 
      roughness: 0.4,
      metalness: 0.6 
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.position.y = -2.5;
    floorMesh.receiveShadow = true;
    tableGroup.add(floorMesh);

    // Glowing futuristic floor grid
    const floorGrid = new THREE.GridHelper(30, 30, 0x10b981, 0x1e293b);
    floorGrid.position.y = -2.48;
    tableGroup.add(floorGrid);

    // Futuristic Holographic Station Pod Discs on the Tabletop
    const padGeo = new THREE.CylinderGeometry(1.5, 1.5, 0.02, 32);
    const padMat1 = new THREE.MeshStandardMaterial({
      color: 0x064e3b,
      emissive: 0x059669,
      emissiveIntensity: 0.35,
      roughness: 0.2,
      metalness: 0.7,
    });
    const pad1 = new THREE.Mesh(padGeo, padMat1);
    pad1.position.set(-2.2, 0.18, 0);
    tableGroup.add(pad1);

    const padMat2 = new THREE.MeshStandardMaterial({
      color: 0x083344,
      emissive: 0x0891b2,
      emissiveIntensity: 0.35,
      roughness: 0.2,
      metalness: 0.7,
    });
    const pad2 = new THREE.Mesh(padGeo, padMat2);
    pad2.position.set(2.2, 0.18, 0);
    tableGroup.add(pad2);

    scene.add(tableGroup);

    // Glass Material
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 0.85,
      opacity: 1,
      transparent: true,
      roughness: 0.1,
      ior: 1.5,
      thickness: 0.2,
      specularIntensity: 1,
    });

    // =========================================================================
    // STATION 1 (LEFT): CHEMICAL REACTION SIMULATOR APPARATUS
    // =========================================================================
    const simGroup = new THREE.Group();
    simGroup.position.set(-2.2, 0.2, 0.2);
    simGroup.name = 'station_simulator';

    // 1. Large 500 mL Borosilicate Glass Beaker
    const beakerGeo = new THREE.CylinderGeometry(0.55, 0.55, 1.2, 32, 1, true);
    const beakerMesh = new THREE.Mesh(beakerGeo, glassMat);
    beakerMesh.position.set(-0.8, 0.6, 0.4);
    beakerMesh.castShadow = true;
    simGroup.add(beakerMesh);

    // Liquid inside Beaker (Vibrant Emerald / Cyan solution)
    const beakerLiquidGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.7, 32);
    const beakerLiquidMat = new THREE.MeshStandardMaterial({
      color: 0x10b981,
      roughness: 0.15,
      metalness: 0.1,
      transparent: true,
      opacity: 0.85,
    });
    const beakerLiquid = new THREE.Mesh(beakerLiquidGeo, beakerLiquidMat);
    beakerLiquid.position.set(-0.8, 0.38, 0.4);
    simGroup.add(beakerLiquid);

    // 2. Erlenmeyer Conical Flask
    const flaskConeGeo = new THREE.ConeGeometry(0.65, 0.9, 32, 1, true);
    const flaskNeckGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.45, 32);
    const flaskCone = new THREE.Mesh(flaskConeGeo, glassMat);
    const flaskNeck = new THREE.Mesh(flaskNeckGeo, glassMat);
    flaskCone.position.set(0.6, 0.45, -0.2);
    flaskNeck.position.set(0.6, 1.05, -0.2);
    simGroup.add(flaskCone);
    simGroup.add(flaskNeck);

    // Golden Liquid inside Flask
    const flaskLiquidGeo = new THREE.ConeGeometry(0.58, 0.5, 32);
    const flaskLiquidMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      roughness: 0.2,
      transparent: true,
      opacity: 0.85,
    });
    const flaskLiquid = new THREE.Mesh(flaskLiquidGeo, flaskLiquidMat);
    flaskLiquid.position.set(0.6, 0.26, -0.2);
    simGroup.add(flaskLiquid);

    // 3. Wooden / Metal Test Tube Rack with 4 colorful test tubes
    const rackBaseGeo = new THREE.BoxGeometry(1.4, 0.1, 0.45);
    const rackMat = new THREE.MeshStandardMaterial({ color: 0x3e2723, roughness: 0.5 });
    const rackBase = new THREE.Mesh(rackBaseGeo, rackMat);
    rackBase.position.set(-0.4, 0.05, -0.9);
    simGroup.add(rackBase);

    const tubeGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.75, 16);
    const tubeColors = [0xef4444, 0x3b82f6, 0x10b981, 0xa855f7];
    tubeColors.forEach((col, idx) => {
      const tube = new THREE.Mesh(tubeGeo, glassMat);
      const xOffset = -0.4 + (idx - 1.5) * 0.25;
      tube.position.set(xOffset, 0.45, -0.9);
      simGroup.add(tube);

      const tubeLiquidGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.45, 16);
      const tubeLiquidMat = new THREE.MeshStandardMaterial({ color: col, transparent: true, opacity: 0.9 });
      const tubeLiquid = new THREE.Mesh(tubeLiquidGeo, tubeLiquidMat);
      tubeLiquid.position.set(xOffset, 0.3, -0.9);
      simGroup.add(tubeLiquid);
    });

    // 4. Bunsen Burner on Tripod
    const burnerBaseGeo = new THREE.CylinderGeometry(0.28, 0.32, 0.1, 24);
    const burnerPipeGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.65, 16);
    const burnerMat = new THREE.MeshStandardMaterial({ color: 0x64748b, metalness: 0.8, roughness: 0.2 });
    const burnerBase = new THREE.Mesh(burnerBaseGeo, burnerMat);
    const burnerPipe = new THREE.Mesh(burnerPipeGeo, burnerMat);
    burnerBase.position.set(1.4, 0.05, 0.5);
    burnerPipe.position.set(1.4, 0.4, 0.5);
    simGroup.add(burnerBase);
    simGroup.add(burnerPipe);

    // Flickering Blue Flame
    const flameGeo = new THREE.ConeGeometry(0.09, 0.35, 16);
    const flameMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const flameMesh = new THREE.Mesh(flameGeo, flameMat);
    flameMesh.position.set(1.4, 0.85, 0.5);
    simGroup.add(flameMesh);

    // Reagent Storage Bottles behind
    const bottleGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.55, 16);
    const amberBottleMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.3 });
    [-1.5, -1.0, 1.4].forEach((bx, bi) => {
      const bottle = new THREE.Mesh(bottleGeo, amberBottleMat);
      bottle.position.set(bx, 0.28, -1.2);
      simGroup.add(bottle);
    });

    scene.add(simGroup);

    // =========================================================================
    // STATION 2 (RIGHT): ACID-BASE TITRATION APPARATUS
    // =========================================================================
    const titrGroup = new THREE.Group();
    titrGroup.position.set(2.2, 0.2, 0.2);
    titrGroup.name = 'station_titration';

    // 1. Heavy Iron Retort Stand
    const standBaseGeo = new THREE.BoxGeometry(1.2, 0.1, 0.8);
    const standMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, metalness: 0.8, roughness: 0.3 });
    const standBase = new THREE.Mesh(standBaseGeo, standMat);
    standBase.position.set(-0.2, 0.05, 0);
    standBase.castShadow = true;
    titrGroup.add(standBase);

    // Vertical Retort Rod
    const rodGeo = new THREE.CylinderGeometry(0.04, 0.04, 2.8, 16);
    const rodMesh = new THREE.Mesh(rodGeo, standMat);
    rodMesh.position.set(-0.6, 1.45, 0);
    titrGroup.add(rodMesh);

    // Horizontal Clamp Arms
    const clampGeo = new THREE.BoxGeometry(0.55, 0.05, 0.05);
    const clampMesh = new THREE.Mesh(clampGeo, standMat);
    clampMesh.position.set(-0.35, 2.1, 0);
    titrGroup.add(clampMesh);

    // 2. Graduated Burette clamped vertically
    const buretteTubeGeo = new THREE.CylinderGeometry(0.055, 0.055, 1.8, 24);
    const buretteMesh = new THREE.Mesh(buretteTubeGeo, glassMat);
    buretteMesh.position.set(-0.1, 1.85, 0);
    titrGroup.add(buretteMesh);

    // Burette Solution inside
    const buretteLiquidGeo = new THREE.CylinderGeometry(0.045, 0.045, 1.3, 16);
    const buretteLiquidMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, transparent: true, opacity: 0.65 });
    const buretteLiquid = new THREE.Mesh(buretteLiquidGeo, buretteLiquidMat);
    buretteLiquid.position.set(-0.1, 1.6, 0);
    titrGroup.add(buretteLiquid);

    // Burette Stopcock valve
    const stopcockGeo = new THREE.BoxGeometry(0.12, 0.05, 0.05);
    const stopcockMat = new THREE.MeshStandardMaterial({ color: 0xd97706 });
    const stopcock = new THREE.Mesh(stopcockGeo, stopcockMat);
    stopcock.position.set(-0.1, 0.9, 0);
    titrGroup.add(stopcock);

    // 3. White Porcelain Tile under flask
    const tileGeo = new THREE.BoxGeometry(0.9, 0.04, 0.9);
    const tileMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.1 });
    const tile = new THREE.Mesh(tileGeo, tileMat);
    tile.position.set(-0.1, 0.12, 0);
    titrGroup.add(tile);

    // 4. Conical Flask on tile receiving drops
    const titrFlaskConeGeo = new THREE.ConeGeometry(0.48, 0.7, 32, 1, true);
    const titrFlaskNeckGeo = new THREE.CylinderGeometry(0.14, 0.14, 0.3, 32);
    const titrFlaskCone = new THREE.Mesh(titrFlaskConeGeo, glassMat);
    const titrFlaskNeck = new THREE.Mesh(titrFlaskNeckGeo, glassMat);
    titrFlaskCone.position.set(-0.1, 0.45, 0);
    titrFlaskNeck.position.set(-0.1, 0.88, 0);
    titrGroup.add(titrFlaskCone);
    titrGroup.add(titrFlaskNeck);

    // Pink / Rose Endpoint Indicator Solution in Flask
    const titrLiquidGeo = new THREE.ConeGeometry(0.42, 0.38, 32);
    const titrLiquidMat = new THREE.MeshStandardMaterial({
      color: 0xf472b6,
      transparent: true,
      opacity: 0.85,
      roughness: 0.2,
    });
    const titrLiquid = new THREE.Mesh(titrLiquidGeo, titrLiquidMat);
    titrLiquid.position.set(-0.1, 0.28, 0);
    titrGroup.add(titrLiquid);

    // Pipette Dropper on stand
    const dropperGeo = new THREE.CylinderGeometry(0.03, 0.015, 0.65, 16);
    const dropper = new THREE.Mesh(dropperGeo, glassMat);
    dropper.rotation.z = Math.PI / 4;
    dropper.position.set(0.65, 0.35, -0.4);
    titrGroup.add(dropper);

    // Wash Bottle beside setup
    const washBottleGeo = new THREE.CylinderGeometry(0.2, 0.2, 0.6, 24);
    const washMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.4 });
    const washBottle = new THREE.Mesh(washBottleGeo, washMat);
    washBottle.position.set(0.9, 0.32, 0.2);
    titrGroup.add(washBottle);

    scene.add(titrGroup);

    // =========================================================================
    // RAYCASTING & INTERACTION
    // =========================================================================
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      // Check intersections with simulator vs titration groups
      const simIntersects = raycaster.intersectObjects(simGroup.children, true);
      const titrIntersects = raycaster.intersectObjects(titrGroup.children, true);

      if (simIntersects.length > 0) {
        setHoveredStation('simulator');
        container.style.cursor = 'pointer';
      } else if (titrIntersects.length > 0) {
        setHoveredStation('titration');
        container.style.cursor = 'pointer';
      } else {
        setHoveredStation(null);
        container.style.cursor = 'default';
      }
    };

    const handleClick = () => {
      if (isZooming) return;
      raycaster.setFromCamera(mouse, camera);

      const simIntersects = raycaster.intersectObjects(simGroup.children, true);
      const titrIntersects = raycaster.intersectObjects(titrGroup.children, true);

      if (simIntersects.length > 0) {
        triggerZoomIn('simulator');
      } else if (titrIntersects.length > 0) {
        triggerZoomIn('titration');
      }
    };

    const triggerZoomIn = (station: 'simulator' | 'titration') => {
      setIsZooming(true);
      soundManager.playDoorSlide();

      const targetX = station === 'simulator' ? -2.2 : 2.2;
      const targetY = 1.0;
      const targetZ = 2.4;

      // GSAP smooth camera glide forward straight to the table apparatus
      gsap.to(camera.position, {
        x: targetX,
        y: targetY,
        z: targetZ,
        duration: 1.15,
        ease: 'power2.inOut',
        onUpdate: () => {
          camera.lookAt(targetX, 0.6, 0);
        },
        onComplete: () => {
          onSelectStation(station);
        },
      });
    };

    container.addEventListener('mousemove', handlePointerMove);
    container.addEventListener('click', handleClick);

    // =========================================================================
    // ANIMATION LOOP
    // =========================================================================
    let animId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Subtle flame flicker
      flameMesh.scale.y = 1.0 + Math.sin(elapsedTime * 15) * 0.18;
      flameMesh.scale.x = 1.0 + Math.cos(elapsedTime * 18) * 0.12;

      // Subtle hovering animation when stations are highlighted
      if (hoveredStation === 'simulator') {
        simGroup.position.y = 0.2 + Math.sin(elapsedTime * 4) * 0.03;
      } else {
        simGroup.position.y = THREE.MathUtils.lerp(simGroup.position.y, 0.2, 0.1);
      }

      if (hoveredStation === 'titration') {
        titrGroup.position.y = 0.2 + Math.sin(elapsedTime * 4) * 0.03;
      } else {
        titrGroup.position.y = THREE.MathUtils.lerp(titrGroup.position.y, 0.2, 0.1);
      }

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handlePointerMove);
      container.removeEventListener('click', handleClick);
      cancelAnimationFrame(animId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [onSelectStation, isZooming]);

  return (
    <div className="relative w-full h-full overflow-hidden select-none bg-slate-950">
      
      {/* Authentic Futuristic Chemistry Laboratory Backdrop matching the green blast door theme */}
      <img
        src="/assets/futuristic_chem_lab.jpg"
        alt="Futuristic Chemistry Laboratory Room"
        className="absolute inset-0 w-full h-full object-cover object-center pointer-events-none opacity-45 brightness-90 filter blur-[0.5px]"
      />
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-slate-950 via-slate-950/60 to-slate-950/75" />

      {/* 3D WebGL Canvas Viewport */}
      <div ref={mountRef} className="relative z-10 w-full h-full cursor-default" />

      {/* Floating 3D Station HUD Beacons on the Workbench */}
      <div className="absolute inset-0 pointer-events-none">
        
        {/* Left Station 1 Beacon (Reaction Simulator) */}
        <div
          style={{ left: '26%', top: '32%' }}
          className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 pointer-events-auto cursor-pointer ${
            hoveredStation === 'simulator' ? 'scale-110' : 'scale-100 opacity-90'
          }`}
          onClick={() => onSelectStation('simulator')}
        >
          <div className="px-4 py-2.5 rounded-2xl bg-slate-950/90 border-2 border-emerald-400/80 shadow-[0_0_30px_rgba(16,185,129,0.5)] backdrop-blur-md text-center group">
            <div className="flex items-center justify-center gap-1.5 mb-0.5">
              <Beaker className="w-4 h-4 text-emerald-400 animate-bounce" />
              <span className="font-mono font-black text-xs uppercase tracking-wider text-white">
                STATION 1: REACTION SIMULATOR
              </span>
            </div>
            <p className="text-[10px] font-mono text-emerald-300">
              Free Mixing • Beakers • Gas & Blast Reactions
            </p>
            <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-mono font-bold text-slate-950 bg-emerald-400 px-2 py-0.5 rounded-full shadow">
              Click to Step Up <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>

        {/* Right Station 2 Beacon (Acid-Base Titration) */}
        <div
          style={{ left: '74%', top: '32%' }}
          className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 pointer-events-auto cursor-pointer ${
            hoveredStation === 'titration' ? 'scale-110' : 'scale-100 opacity-90'
          }`}
          onClick={() => onSelectStation('titration')}
        >
          <div className="px-4 py-2.5 rounded-2xl bg-slate-950/90 border-2 border-cyan-400/80 shadow-[0_0_30px_rgba(6,182,212,0.5)] backdrop-blur-md text-center group">
            <div className="flex items-center justify-center gap-1.5 mb-0.5">
              <Pipette className="w-4 h-4 text-cyan-400 animate-bounce" />
              <span className="font-mono font-black text-xs uppercase tracking-wider text-white">
                STATION 2: ACID-BASE TITRATION
              </span>
            </div>
            <p className="text-[10px] font-mono text-cyan-300">
              Burette Setup • Color Endpoint • Molarity Calculations
            </p>
            <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-mono font-bold text-slate-950 bg-cyan-400 px-2 py-0.5 rounded-full shadow">
              Click to Step Up <ArrowRight className="w-3 h-3" />
            </div>
          </div>
        </div>

      </div>

      {/* Ambient Workbench Instructions at Bottom */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 pointer-events-none text-center">
        <div className="px-5 py-2 rounded-full bg-slate-950/90 border border-slate-700/80 text-xs font-mono text-slate-300 backdrop-blur-md shadow-2xl flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Interactive 3D Workbench: Click on either apparatus on the table to approach and experiment!</span>
        </div>
      </div>

    </div>
  );
};