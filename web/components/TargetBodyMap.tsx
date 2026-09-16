"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { createHumanMannequin } from "@/utils/mannequinBuilder";
import { ALL_ATLAS_TARGETS, AtlasTargetDef } from "@/data/atlasTargets";
import { RotateCcw, Compass, Layers, CheckCircle2 } from "lucide-react";

interface TargetBodyMapProps {
  onSelectTarget: (targetName: string) => void;
  selectedTarget: string | null;
  activeSystemFilter?: string | null;
  onSelectSystemFilter?: (system: string | null) => void;
}

const SYSTEM_OPTIONS = [
  { id: "all", label: "All 107 Targets", count: 107, color: "#475569" },
  { id: "cranial", label: "Cranial", count: 2, color: "#06b6d4" },
  { id: "thoracic", label: "Thorax", count: 9, color: "#f43f5e" },
  { id: "vascular", label: "Vascular", count: 17, color: "#ef4444" },
  { id: "abdominal", label: "Abdomen", count: 14, color: "#10b981" },
  { id: "spine", label: "Spine & Vertebrae", count: 28, color: "#f59e0b" },
  { id: "pelvis", label: "Pelvis & Muscles", count: 15, color: "#8b5cf6" },
  { id: "ribs", label: "Ribs & Skeleton", count: 22, color: "#14b8a6" },
];

export function TargetBodyMap({
  onSelectTarget,
  selectedTarget,
  activeSystemFilter = null,
  onSelectSystemFilter,
}: TargetBodyMapProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const pinMeshesRef = useRef<THREE.Mesh[]>([]);
  const reqIdRef = useRef<number | null>(null);

  const [hoveredPin, setHoveredPin] = useState<AtlasTargetDef | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const [systemFilter, setSystemFilter] = useState<string | null>(activeSystemFilter || null);

  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const cameraSphericalRef = useRef({ radius: 920, theta: 0.25, phi: Math.PI / 2.3 });
  const targetCenterRef = useRef(new THREE.Vector3(0, 70, 40));

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
    if (activeSystemFilter !== undefined) {
      setSystemFilter(activeSystemFilter);
    }
  }, [activeSystemFilter]);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 4000);
    camera.up.set(0, 1, 0);
    cameraRef.current = camera;
    updateCamera();

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Studio Lighting
    const ambLight = new THREE.AmbientLight(0xffffff, 0.95);
    scene.add(ambLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight1.position.set(250, 550, 350);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xcde1f2, 0.45);
    dirLight2.position.set(-250, 200, -300);
    scene.add(dirLight2);

    // Add Translucent Holographic Mannequin Silhouette
    const mannequin = createHumanMannequin();
    scene.add(mannequin);

    // Create Interactive Organ Landmark Pins for ALL 107 Targets
    const pinMeshes: THREE.Mesh[] = [];

    ALL_ATLAS_TARGETS.forEach((pin) => {
      // Map medical [X, Y, Z] to Three.js [X, Z, Y]
      const tx = pin.coords[0];
      const ty = pin.coords[2]; // Medical Z -> Three Y
      const tz = pin.coords[1]; // Medical Y -> Three Z

      const isSel = selectedTarget === pin.id;
      const isFilteredOut = systemFilter && systemFilter !== "all" && pin.system !== systemFilter;

      const radius = isSel ? 7.5 : isFilteredOut ? 2.0 : 3.8;
      const sphereGeo = new THREE.SphereGeometry(radius, 16, 16);

      const sphereMat = new THREE.MeshStandardMaterial({
        color: isSel ? 0xffffff : pin.color,
        emissive: isSel ? 0x38bdf8 : pin.color,
        emissiveIntensity: isSel ? 1.0 : isFilteredOut ? 0.08 : 0.65,
        roughness: 0.15,
        metalness: 0.4,
        transparent: true,
        opacity: isFilteredOut ? 0.2 : 0.95,
      });

      const mesh = new THREE.Mesh(sphereGeo, sphereMat);
      mesh.position.set(tx, ty, tz);
      mesh.userData = { pinData: pin };
      scene.add(mesh);
      pinMeshes.push(mesh);

      // Selected organ highlight halo
      if (isSel) {
        const haloGeo = new THREE.RingGeometry(9, 12, 24);
        const haloMat = new THREE.MeshBasicMaterial({
          color: 0x38bdf8,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.8,
        });
        const halo = new THREE.Mesh(haloGeo, haloMat);
        halo.position.set(tx, ty, tz);
        scene.add(halo);
      }
    });
    pinMeshesRef.current = pinMeshes;

    // Animation Loop
    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      if (autoRotate && !isDraggingRef.current) {
        cameraSphericalRef.current.theta += 0.0035;
        updateCamera();
      }
      renderer.render(scene, camera);
    };
    animate();

    // Mouse Controls
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      setAutoRotate(false);
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) {
        // Raycast for pin hovering
        const rect = container.getBoundingClientRect();
        const mouseX = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1;
        const mouseY = -((e.clientY - rect.top) / container.clientHeight) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);
        const intersects = raycaster.intersectObjects(pinMeshesRef.current);

        if (intersects.length > 0) {
          const hit = intersects[0].object as any;
          setHoveredPin(hit.userData.pinData);
          container.style.cursor = "pointer";
        } else {
          setHoveredPin(null);
          container.style.cursor = "grab";
        }
        return;
      }

      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      cameraSphericalRef.current.theta -= deltaX * 0.007;
      cameraSphericalRef.current.phi = Math.max(
        0.05,
        Math.min(Math.PI - 0.05, cameraSphericalRef.current.phi - deltaY * 0.007)
      );

      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
      updateCamera();
    };

    const onMouseUp = (e: MouseEvent) => {
      isDraggingRef.current = false;
      const rect = container.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / container.clientHeight) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);
      const intersects = raycaster.intersectObjects(pinMeshesRef.current);

      if (intersects.length > 0) {
        const hit = intersects[0].object as any;
        const pin = hit.userData.pinData as AtlasTargetDef;
        onSelectTarget(pin.id);
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraSphericalRef.current.radius = Math.max(
        320,
        Math.min(1800, cameraSphericalRef.current.radius + e.deltaY * 0.6)
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
  }, [selectedTarget, systemFilter]);

  const setView = (view: "front" | "back" | "side" | "top") => {
    setAutoRotate(false);
    if (view === "front") {
      cameraSphericalRef.current = { radius: 920, theta: 0, phi: Math.PI / 2 };
    } else if (view === "back") {
      cameraSphericalRef.current = { radius: 920, theta: Math.PI, phi: Math.PI / 2 };
    } else if (view === "side") {
      cameraSphericalRef.current = { radius: 920, theta: Math.PI / 2, phi: Math.PI / 2 };
    } else {
      cameraSphericalRef.current = { radius: 920, theta: 0, phi: 0.15 };
    }
    updateCamera();
  };

  const handleFilterClick = (sysId: string) => {
    const next = sysId === "all" ? null : sysId;
    setSystemFilter(next);
    if (onSelectSystemFilter) onSelectSystemFilter(next);
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* System Filter Tabs Bar above 3D Viewer */}
      <div className="flex flex-wrap items-center gap-1.5 bg-white p-2 rounded-xl border border-border shadow-xs">
        <span className="text-xs font-semibold text-text-muted px-2 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-primary" />
          <span>Filter 3D Anatomical System:</span>
        </span>
        {SYSTEM_OPTIONS.map((sys) => {
          const isActive = (systemFilter === null && sys.id === "all") || systemFilter === sys.id;
          return (
            <button
              key={sys.id}
              onClick={() => handleFilterClick(sys.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                isActive
                  ? "bg-slate-900 text-white font-semibold shadow-xs"
                  : "bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200"
              }`}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: sys.color }}
              />
              <span>{sys.label}</span>
              <span className="text-[10px] opacity-70">({sys.count})</span>
            </button>
          );
        })}
      </div>

      {/* 3D Viewer Canvas Container */}
      <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-border bg-[#F8FAFC] shadow-sm">
        <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

        {/* Viewport Presets & Rotation Controls Top-Right */}
        <div className="absolute top-4 right-4 flex items-center gap-1 bg-white/95 backdrop-blur px-2.5 py-1.5 rounded-xl border border-border shadow-xs text-xs font-medium text-slate-700 z-10">
          <button
            onClick={() => setView("front")}
            className="px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Anterior (Front)
          </button>
          <button
            onClick={() => setView("back")}
            className="px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Posterior (Spine & Kidneys)
          </button>
          <button
            onClick={() => setView("side")}
            className="px-2.5 py-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            Lateral
          </button>
          <button
            onClick={() => setAutoRotate(!autoRotate)}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              autoRotate ? "bg-primary text-white font-semibold shadow-xs" : "hover:bg-slate-100 text-slate-600"
            }`}
          >
            {autoRotate ? "Turntable Active" : "Pause Orbit"}
          </button>
        </div>

        {/* Floating Hover Card Top-Left */}
        {hoveredPin && (
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-4 py-3 rounded-xl border border-slate-200 shadow-lg text-xs flex flex-col gap-1.5 z-10 pointer-events-none animate-fadeIn max-w-sm">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: hoveredPin.hex }} />
              <span className="font-bold text-sm text-slate-900">{hoveredPin.name}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                Slot #{hoveredPin.slot}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-500 text-[11px]">
              <span>{hoveredPin.category}</span>
              <span className="font-mono text-slate-700 font-medium">
                [{hoveredPin.coords[0].toFixed(1)}, {hoveredPin.coords[1].toFixed(1)}, {hoveredPin.coords[2].toFixed(1)}] mm
              </span>
            </div>
            <span className="text-[10px] text-primary-dark font-mono font-medium">
              Click landmark sphere to filter organ card below &darr;
            </span>
          </div>
        )}

        {/* Informative Footer Badge */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur px-3.5 py-1.5 rounded-xl border border-slate-200 shadow-xs text-xs text-slate-600 z-10 flex items-center gap-2">
          <Compass className="w-4 h-4 text-primary shrink-0" />
          <span>
            <strong>107 Anatomical Targets:</strong> Spheres show true canonical 3D coordinates. Rotate 360° to inspect anterior, posterior, cranial, and pelvic structures.
          </span>
        </div>
      </div>
    </div>
  );
}

