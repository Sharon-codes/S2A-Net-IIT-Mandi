"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { Play, Pause, RotateCcw, Activity, ShieldCheck, Cpu } from "lucide-react";

export function RoboticArmScanner() {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const reqIdRef = useRef<number | null>(null);

  // Kinematic nodes
  const robotBaseRef = useRef<THREE.Group | null>(null);
  const armShoulderRef = useRef<THREE.Group | null>(null);
  const armElbowRef = useRef<THREE.Group | null>(null);
  const armWristRef = useRef<THREE.Group | null>(null);
  const scannerHeadRef = useRef<THREE.Group | null>(null);
  const scanBeamRef = useRef<THREE.Mesh | null>(null);
  const scanLineRef = useRef<THREE.Mesh | null>(null);

  // Organ centroid meshes for illumination during sweep
  const organMeshesRef = useRef<Record<string, THREE.Mesh>>({});

  const [isAutoScanning, setIsAutoScanning] = useState(true);
  const [scanProgress, setScanProgress] = useState(0.2); // 0 = head, 1 = feet
  const [activeZone, setActiveZone] = useState<string>("Thorax / Heart");

  // Camera Orbit
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const cameraSphericalRef = useRef({ radius: 620, theta: 0.65, phi: Math.PI / 2.7 });
  const targetCenterRef = useRef(new THREE.Vector3(0, 40, 0));

  const updateCamera = () => {
    if (!cameraRef.current) return;
    const { radius, theta, phi } = cameraSphericalRef.current;
    const x = targetCenterRef.current.x + radius * Math.sin(phi) * Math.sin(theta);
    const y = targetCenterRef.current.y + radius * Math.cos(phi);
    const z = targetCenterRef.current.z + radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(targetCenterRef.current);
  };

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 3000);
    camera.up.set(0, 1, 0);
    cameraRef.current = camera;
    updateCamera();

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    rendererRef.current = renderer;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Studio Lighting
    const ambLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.85);
    dirLight1.position.set(200, 400, 300);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xc8d8e8, 0.4);
    dirLight2.position.set(-200, 150, -200);
    scene.add(dirLight2);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(800, 32, 0xd0dbe5, 0xe2e8f0);
    gridHelper.position.y = -65;
    scene.add(gridHelper);

    // ==========================================
    // 1. SCANNER BED / EXAMINATION COUCH
    // ==========================================
    const bedGroup = new THREE.Group();

    // Bed Cantilever Base & Pedestal
    const baseMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.3, metalness: 0.6 });
    const bedBaseGeo = new THREE.CylinderGeometry(45, 55, 60, 24);
    const bedBase = new THREE.Mesh(bedBaseGeo, baseMat);
    bedBase.position.set(0, -35, 0);
    bedGroup.add(bedBase);

    // Longitudinal Rails
    const railGeo = new THREE.BoxGeometry(360, 8, 80);
    const railMesh = new THREE.Mesh(railGeo, baseMat);
    railMesh.position.set(0, -5, 0);
    bedGroup.add(railMesh);

    // Patient Couch Mattress (White Upholstery)
    const matGeo = new THREE.BoxGeometry(340, 12, 75);
    const matMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.5,
      metalness: 0.05,
    });
    const mattress = new THREE.Mesh(matGeo, matMaterial);
    mattress.position.set(0, 5, 0);
    bedGroup.add(mattress);

    // Headrest Cushion at X = -140
    const pillowGeo = new THREE.BoxGeometry(45, 10, 55);
    const pillowMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.7 });
    const pillow = new THREE.Mesh(pillowGeo, pillowMat);
    pillow.position.set(-135, 12, 0);
    bedGroup.add(pillow);

    scene.add(bedGroup);

    // ==========================================
    // 2. PATIENT HOLOGRAPHIC BODY (SUPINE / LYING DOWN)
    // Patient orientation: Head at X = -135, Feet at X = +140
    // ==========================================
    const patientGroup = new THREE.Group();
    const patientMat = new THREE.MeshStandardMaterial({
      color: 0x93b4c9,
      transparent: true,
      opacity: 0.18,
      roughness: 0.2,
      metalness: 0.1,
      depthWrite: false,
    });

    // Cranium / Head
    const pHeadGeo = new THREE.SphereGeometry(22, 24, 20);
    const pHead = new THREE.Mesh(pHeadGeo, patientMat);
    pHead.position.set(-135, 24, 0);
    pHead.scale.set(1.1, 0.9, 0.95);
    patientGroup.add(pHead);

    // Neck
    const pNeckGeo = new THREE.CylinderGeometry(11, 13, 16, 16);
    const pNeck = new THREE.Mesh(pNeckGeo, patientMat);
    pNeck.rotation.z = Math.PI / 2;
    pNeck.position.set(-112, 20, 0);
    patientGroup.add(pNeck);

    // Torso (Chest & Abdomen)
    const pTorsoGeo = new THREE.CylinderGeometry(28, 26, 110, 24);
    const pTorso = new THREE.Mesh(pTorsoGeo, patientMat);
    pTorso.rotation.z = Math.PI / 2;
    pTorso.scale.set(0.75, 1.0, 1.15); // Flattened on bed
    pTorso.position.set(-50, 23, 0);
    patientGroup.add(pTorso);

    // Pelvis
    const pPelvisGeo = new THREE.CylinderGeometry(26, 24, 45, 20);
    const pPelvis = new THREE.Mesh(pPelvisGeo, patientMat);
    pPelvis.rotation.z = Math.PI / 2;
    pPelvis.scale.set(0.75, 1.0, 1.12);
    pPelvis.position.set(25, 22, 0);
    patientGroup.add(pPelvis);

    // Left & Right Thighs
    const pThighGeo = new THREE.CapsuleGeometry(12, 65, 12, 16);
    const pThighL = new THREE.Mesh(pThighGeo, patientMat);
    pThighL.rotation.z = Math.PI / 2;
    pThighL.position.set(75, 20, 14);
    patientGroup.add(pThighL);

    const pThighR = new THREE.Mesh(pThighGeo, patientMat);
    pThighR.rotation.z = Math.PI / 2;
    pThighR.position.set(75, 20, -14);
    patientGroup.add(pThighR);

    // Calves
    const pCalfGeo = new THREE.CapsuleGeometry(9, 60, 12, 16);
    const pCalfL = new THREE.Mesh(pCalfGeo, patientMat);
    pCalfL.rotation.z = Math.PI / 2;
    pCalfL.position.set(135, 17, 14);
    patientGroup.add(pCalfL);

    const pCalfR = new THREE.Mesh(pCalfGeo, patientMat);
    pCalfR.rotation.z = Math.PI / 2;
    pCalfR.position.set(135, 17, -14);
    patientGroup.add(pCalfR);

    // Internal Holographic Organ Centroids (Inside Patient Body)
    const organs = [
      { id: "brain", pos: [-135, 24, 0], color: 0x06b6d4, name: "Brain" },
      { id: "heart", pos: [-80, 24, -5], color: 0xf43f5e, name: "Heart" },
      { id: "liver", pos: [-45, 23, 10], color: 0x10b981, name: "Liver" },
      { id: "kidney_left", pos: [-35, 17, -14], color: 0x10b981, name: "Left Kidney" },
      { id: "kidney_right", pos: [-35, 17, 14], color: 0x10b981, name: "Right Kidney" },
      { id: "bladder", pos: [20, 18, 0], color: 0x8b5cf6, name: "Urinary Bladder" },
    ];

    const organMeshes: Record<string, THREE.Mesh> = {};
    organs.forEach((org) => {
      const geo = new THREE.SphereGeometry(4.5, 16, 16);
      const mat = new THREE.MeshStandardMaterial({
        color: org.color,
        emissive: org.color,
        emissiveIntensity: 0.6,
        roughness: 0.2,
      });
      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(org.pos[0], org.pos[1], org.pos[2]);
      patientGroup.add(mesh);
      organMeshes[org.id] = mesh;
    });
    organMeshesRef.current = organMeshes;

    scene.add(patientGroup);

    // ==========================================
    // 3. ARTICULATED 6-DOF ROBOTIC SCANNER ARM (CAIR IIT MANDI)
    // Mounted at Z = -75 beside the bed
    // ==========================================
    const robotGroup = new THREE.Group();
    robotGroup.position.set(-50, -65, -70); // Base position

    // Pedestal Base
    const rBaseGeo = new THREE.CylinderGeometry(28, 35, 25, 24);
    const rBaseMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.25, metalness: 0.7 });
    const rBase = new THREE.Mesh(rBaseGeo, rBaseMat);
    rBase.position.y = 12.5;
    robotGroup.add(rBase);
    robotBaseRef.current = robotGroup;

    // Joint 1: Shoulder Turntable
    const shoulderGroup = new THREE.Group();
    shoulderGroup.position.set(0, 25, 0);
    robotGroup.add(shoulderGroup);
    armShoulderRef.current = shoulderGroup;

    const shoulderTurntableGeo = new THREE.CylinderGeometry(20, 20, 18, 20);
    const rAccentMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8, roughness: 0.2 });
    const shoulderTurntable = new THREE.Mesh(shoulderTurntableGeo, rAccentMat);
    shoulderTurntable.position.y = 9;
    shoulderGroup.add(shoulderTurntable);

    // Link 1: Upper Arm (Height ~110mm)
    const upperArmGeo = new THREE.CylinderGeometry(12, 14, 110, 16);
    const rArmMat = new THREE.MeshStandardMaterial({ color: 0x334155, metalness: 0.5, roughness: 0.3 });
    const upperArm = new THREE.Mesh(upperArmGeo, rArmMat);
    upperArm.position.set(0, 65, 0);
    upperArm.rotation.z = -0.35; // Leaning over patient
    shoulderGroup.add(upperArm);

    // Joint 2: Elbow
    const elbowGroup = new THREE.Group();
    elbowGroup.position.set(35, 115, 0);
    shoulderGroup.add(elbowGroup);
    armElbowRef.current = elbowGroup;

    const elbowBallGeo = new THREE.SphereGeometry(15, 16, 16);
    const elbowBall = new THREE.Mesh(elbowBallGeo, rAccentMat);
    elbowGroup.add(elbowBall);

    // Link 2: Forearm (Length ~95mm)
    const foreArmGeo = new THREE.CylinderGeometry(9, 11, 95, 16);
    const foreArm = new THREE.Mesh(foreArmGeo, rArmMat);
    foreArm.position.set(30, -35, 20);
    foreArm.rotation.x = 0.55;
    foreArm.rotation.z = 0.85;
    elbowGroup.add(foreArm);

    // Joint 3: Wrist & Optical Scanner Head
    const wristGroup = new THREE.Group();
    wristGroup.position.set(60, -70, 42);
    elbowGroup.add(wristGroup);
    armWristRef.current = wristGroup;

    // Optical Scanner End-Effector Head
    const headGroup = new THREE.Group();
    const headBoxGeo = new THREE.BoxGeometry(28, 22, 36);
    const scannerMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.2, metalness: 0.8 });
    const headBox = new THREE.Mesh(headBoxGeo, scannerMat);
    headGroup.add(headBox);

    // Optical Lens / Depth Sensor Ring (Glowing Cyan)
    const lensGeo = new THREE.CylinderGeometry(8, 8, 4, 20);
    const lensMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
    const lens = new THREE.Mesh(lensGeo, lensMat);
    lens.position.y = -12;
    headGroup.add(lens);

    wristGroup.add(headGroup);
    scannerHeadRef.current = headGroup;

    // ==========================================
    // 4. ANIMATED HOLOGRAPHIC SCANNING BEAM & LASER FAN
    // ==========================================
    const beamGeo = new THREE.ConeGeometry(38, 70, 24, 1, true);
    const beamMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.28,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const scanBeam = new THREE.Mesh(beamGeo, beamMat);
    scanBeam.rotation.x = Math.PI;
    scanBeam.position.y = -45;
    headGroup.add(scanBeam);
    scanBeamRef.current = scanBeam;

    // Laser scanning line on body surface
    const lineGeo = new THREE.RingGeometry(2, 36, 32);
    const lineMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.75,
    });
    const scanLine = new THREE.Mesh(lineGeo, lineMat);
    scanLine.rotation.x = Math.PI / 2;
    scanLine.position.y = -78;
    headGroup.add(scanLine);
    scanLineRef.current = scanLine;

    scene.add(robotGroup);

    // ==========================================
    // 5. ANIMATION LOOP & KINEMATICS
    // ==========================================
    let scanT = 0.2;
    let scanDirection = 1;

    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);

      if (isAutoScanning) {
        scanT += 0.0035 * scanDirection;
        if (scanT >= 0.85) {
          scanT = 0.85;
          scanDirection = -1;
        } else if (scanT <= 0.05) {
          scanT = 0.05;
          scanDirection = 1;
        }
        setScanProgress(scanT);
      }

      // Update Kinematic Position based on scanT
      // Patient span: X = -135 (head) to X = +40 (pelvis)
      const targetX = -140 + scanT * 180;
      if (robotGroup) {
        robotGroup.position.x = targetX * 0.75; // Robot tracks along bed
      }

      // Rotate scanner toolhead downward with slight organic breathing motion
      if (headGroup) {
        headGroup.rotation.z = Math.sin(scanT * Math.PI) * 0.15;
      }

      // Pulse scan beam opacity
      if (beamMat) {
        beamMat.opacity = 0.2 + 0.12 * Math.sin(Date.now() * 0.008);
      }

      // Light up organ centroids when scanner beam is over them
      const beamX = targetX;
      Object.entries(organMeshesRef.current).forEach(([orgId, mesh]) => {
        const orgX = mesh.position.x;
        const dist = Math.abs(beamX - orgX);
        const mat = mesh.material as THREE.MeshStandardMaterial;

        if (dist < 28) {
          mat.emissiveIntensity = 1.6;
          mesh.scale.set(1.35, 1.35, 1.35);
        } else {
          mat.emissiveIntensity = 0.45;
          mesh.scale.set(1.0, 1.0, 1.0);
        }
      });

      // Update zone label
      if (scanT < 0.2) setActiveZone("Cranial Vault (Brain & Skull)");
      else if (scanT < 0.45) setActiveZone("Thoracic Cavity (Heart & Lungs)");
      else if (scanT < 0.7) setActiveZone("Abdominal Viscera (Liver, Spleen & Kidneys)");
      else setActiveZone("Pelvic Basin (Urinary Bladder)");

      renderer.render(scene, camera);
    };
    animate();

    // Mouse Navigation Controls
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      cameraSphericalRef.current.theta -= deltaX * 0.007;
      cameraSphericalRef.current.phi = Math.max(
        0.1,
        Math.min(Math.PI / 2.05, cameraSphericalRef.current.phi - deltaY * 0.007)
      );

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      updateCamera();
    };

    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraSphericalRef.current.radius = Math.max(
        300,
        Math.min(1200, cameraSphericalRef.current.radius + e.deltaY * 0.5)
      );
      updateCamera();
    };

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    container.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("wheel", onWheel);
      renderer.dispose();
    };
  }, [isAutoScanning]);

  const setPresetZone = (zone: "head" | "chest" | "abdomen" | "pelvis") => {
    setIsAutoScanning(false);
    if (zone === "head") setScanProgress(0.1);
    else if (zone === "chest") setScanProgress(0.35);
    else if (zone === "abdomen") setScanProgress(0.58);
    else setScanProgress(0.8);
  };

  return (
    <div className="relative w-full h-[480px] lg:h-[540px] rounded-3xl overflow-hidden border border-slate-200 bg-slate-50/50 shadow-lg">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Overlay: Live Telemetry & CAIR Medical Robotics HUD */}
      <div className="absolute top-4 left-4 flex flex-col gap-1.5 bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl border border-slate-200 shadow-sm z-10 max-w-sm">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-900 uppercase tracking-wide">
            CAIR Autonomous Robotic Scanner
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] text-slate-500 font-mono">
          <Cpu className="w-3.5 h-3.5 text-sky-600 shrink-0" />
          <span>6-DOF Articulated Kinematic Pose</span>
        </div>
        <div className="text-xs font-semibold text-slate-800 mt-1 flex items-center gap-1.5">
          <Activity className="w-3.5 h-3.5 text-primary shrink-0" />
          <span>Active Scan Zone:</span>
          <span className="text-primary-dark font-bold">{activeZone}</span>
        </div>
      </div>

      {/* Top Right: Interactive Robotic Arm Controls */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-2 rounded-2xl border border-slate-200 shadow-sm z-10 text-xs font-medium text-slate-700">
        <button
          onClick={() => setIsAutoScanning(!isAutoScanning)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold transition-all ${
            isAutoScanning
              ? "bg-primary text-white shadow-xs"
              : "bg-slate-100 hover:bg-slate-200 text-slate-800"
          }`}
        >
          {isAutoScanning ? (
            <>
              <Pause className="w-3.5 h-3.5" />
              <span>Scanning</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5" />
              <span>Auto Sweep</span>
            </>
          )}
        </button>

        <div className="h-4 w-px bg-slate-200 mx-1" />

        {/* Anatomical Zone Preset Jump Buttons */}
        <button
          onClick={() => setPresetZone("head")}
          className="px-2 py-1 rounded-lg hover:bg-slate-100 text-[11px] transition-colors"
        >
          Head (Brain)
        </button>
        <button
          onClick={() => setPresetZone("chest")}
          className="px-2 py-1 rounded-lg hover:bg-slate-100 text-[11px] transition-colors"
        >
          Chest (Heart)
        </button>
        <button
          onClick={() => setPresetZone("abdomen")}
          className="px-2 py-1 rounded-lg hover:bg-slate-100 text-[11px] transition-colors"
        >
          Abdomen (Liver)
        </button>
        <button
          onClick={() => setPresetZone("pelvis")}
          className="px-2 py-1 rounded-lg hover:bg-slate-100 text-[11px] transition-colors"
        >
          Pelvis
        </button>
      </div>

      {/* Bottom Overlay: Zero-Radiation Optical Scanning Callout */}
      <div className="absolute bottom-4 left-4 right-4 flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-200 shadow-sm z-10 text-xs text-slate-600">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            <strong>Zero Ionizing Radiation:</strong> Optical laser & depth scanning replaces ionizing CT/X-ray scans with non-invasive surface geometry photogrammetry.
          </span>
        </div>
        <div className="flex items-center gap-2 text-[11px] font-mono text-slate-500 whitespace-nowrap">
          <span>Centre for AI & Robotics (CAIR) &bull; IIT Mandi</span>
        </div>
      </div>
    </div>
  );
}
