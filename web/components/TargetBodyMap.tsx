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
  { id: "all", label: "All 121 Targets", count: 121, color: "#475569" },
  { id: "cranial", label: "Cranial", count: 2, color: "#06b6d4" },
  { id: "thoracic", label: "Thorax", count: 9, color: "#f43f5e" },
  { id: "vascular", label: "Vascular", count: 17, color: "#ef4444" },
  { id: "abdominal", label: "Abdomen", count: 14, color: "#10b981" },
  { id: "pelvis", label: "Pelvis & Reproductive", count: 19, color: "#d946ef" },
  { id: "spine", label: "Spine & Vertebrae", count: 28, color: "#f59e0b" },
  { id: "ribs", label: "Ribs & Skeleton", count: 32, color: "#14b8a6" },
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
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [hoveredPin, setHoveredPin] = useState<AtlasTargetDef | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);
  const autoRotateRef = useRef(true);
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

    // Add Pedestal Floor Turntable Disc
    const discGeo = new THREE.CylinderGeometry(280, 290, 8, 48);
    const discMat = new THREE.MeshStandardMaterial({
      color: 0xe2e8f0,
      roughness: 0.3,
      metalness: 0.2,
    });
    const turntableDisc = new THREE.Mesh(discGeo, discMat);
    turntableDisc.position.set(0, -525, 0);
    scene.add(turntableDisc);

    // Add 3D Landmark Pin Spheres
    const pinMeshes: THREE.Mesh[] = [];
    ALL_ATLAS_TARGETS.forEach((pin) => {
      // Map coordinates: [X, Y, Z] -> Three.js [X, Z, Y]
      const tx = pin.coords[0];
      const ty = pin.coords[2];
      const tz = pin.coords[1];

      const isSel = selectedTarget === pin.id;
      const isFilteredOut = systemFilter !== null && pin.system !== systemFilter;

      const sphereGeo = new THREE.SphereGeometry(isSel ? 7.5 : 5.0, 16, 16);
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
      if (autoRotateRef.current && !isDraggingRef.current) {
        cameraSphericalRef.current.theta += 0.0035;
        updateCamera();
      }
      renderer.render(scene, camera);
    };
    animate();


    // Mouse Controls
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      // Pause rotation while dragging; clear any pending resume timer
      autoRotateRef.current = false;
      setAutoRotate(false);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
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

      // Auto-resume rotation after 8 seconds of inactivity
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      resumeTimerRef.current = setTimeout(() => {
        autoRotateRef.current = true;
        setAutoRotate(true);
      }, 8000);
    };


    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraSphericalRef.current.radius = Math.max(
        320,
        Math.min(1800, cameraSphericalRef.current.radius + e.deltaY * 0.6)
      );
      updateCamera();
    };

    // Touch Controls for Mobile Devices
    let initialPinchDist = 0;
    const onTouchStart = (e: TouchEvent) => {
      autoRotateRef.current = false;
      setAutoRotate(false);
      if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
      if (e.touches.length === 1) {
        isDraggingRef.current = true;
        previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      } else if (e.touches.length === 2) {
        isDraggingRef.current = false;
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        initialPinchDist = Math.hypot(dx, dy);
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1 && isDraggingRef.current) {
        const deltaX = e.touches[0].clientX - previousMousePositionRef.current.x;
        const deltaY = e.touches[0].clientY - previousMousePositionRef.current.y;

        cameraSphericalRef.current.theta -= deltaX * 0.008;
        cameraSphericalRef.current.phi = Math.max(
          0.05,
          Math.min(Math.PI - 0.05, cameraSphericalRef.current.phi - deltaY * 0.008)
        );

        previousMousePositionRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        updateCamera();
      } else if (e.touches.length === 2) {
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const currentDist = Math.hypot(dx, dy);
        const pinchDelta = initialPinchDist - currentDist;

        cameraSphericalRef.current.radius = Math.max(
          350,
          Math.min(1800, cameraSphericalRef.current.radius + pinchDelta * 1.2)
        );
        initialPinchDist = currentDist;
        updateCamera();
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      isDraggingRef.current = false;
      if (e.changedTouches.length > 0) {
        const touch = e.changedTouches[0];
        const rect = container.getBoundingClientRect();
        const mouseX = ((touch.clientX - rect.left) / container.clientWidth) * 2 - 1;
        const mouseY = -((touch.clientY - rect.top) / container.clientHeight) * 2 + 1;

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);
        const intersects = raycaster.intersectObjects(pinMeshesRef.current);

        if (intersects.length > 0) {
          const hit = intersects[0].object as any;
          const pin = hit.userData.pinData as AtlasTargetDef;
          onSelectTarget(pin.id);
        }
      }
    };

    // Resize Handler
    const handleResize = () => {
      if (!container || !camera || !renderer) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener("resize", handleResize);

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    container.addEventListener("wheel", onWheel, { passive: false });

    container.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("wheel", onWheel);

      container.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("resize", handleResize);

      renderer.dispose();
    };
  }, [selectedTarget, systemFilter]);

  const setView = (view: "front" | "back" | "side" | "top") => {
    // Freeze rotation and snap to view angle
    autoRotateRef.current = false;
    setAutoRotate(false);
    if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);

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

    // Auto-resume rotation after 30 seconds
    resumeTimerRef.current = setTimeout(() => {
      autoRotateRef.current = true;
      setAutoRotate(true);
    }, 30000);
  };


  const handleFilterClick = (sysId: string) => {
    const next = sysId === "all" ? null : sysId;
    setSystemFilter(next);
    if (onSelectSystemFilter) onSelectSystemFilter(next);
  };

  return (
    <div className="flex flex-col gap-3 w-full">
      {/* System Filter Tabs Bar above 3D Viewer - Horizontally Scrollable on Mobile */}
      <div className="flex items-center gap-1.5 bg-white p-2 rounded-2xl border border-border shadow-xs overflow-x-auto no-scrollbar">
        <span className="text-xs font-semibold text-text-muted px-2 flex items-center gap-1.5 shrink-0">
          <Layers className="w-3.5 h-3.5 text-primary" />
          <span className="hidden sm:inline">Filter 3D System:</span>
        </span>
        {SYSTEM_OPTIONS.map((sys) => {
          const isActive = (systemFilter === null && sys.id === "all") || systemFilter === sys.id;
          return (
            <button
              key={sys.id}
              onClick={() => handleFilterClick(sys.id)}
              className={`px-2.5 py-1 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 shrink-0 ${
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
      <div className="relative w-full h-[400px] sm:h-[500px] lg:h-[540px] rounded-3xl overflow-hidden border border-border bg-[#F8FAFC] shadow-sm select-none">
        <div
          ref={mountRef}
          className="w-full h-full cursor-grab active:cursor-grabbing touch-none"
        />

        {/* Viewport Presets Top-Right — click to freeze for 30s then auto-resume */}
        <div className="absolute top-3 right-3 flex items-center gap-0.5 bg-white/95 backdrop-blur px-2 py-1.5 rounded-2xl border border-border shadow-xs text-xs font-medium text-slate-700 z-10">
          {(["front","back","side","top"] as const).map((v) => {
            const labels: Record<string, string> = { front: "Anterior", back: "Posterior", side: "Lateral", top: "Superior" };
            return (
              <button
                key={v}
                onClick={() => setView(v)}
                className="px-2 py-0.5 rounded-lg hover:bg-slate-100 active:bg-primary/20 transition-colors text-[11px]"
                title={`Snap to ${labels[v]} view · Freezes for 30s then resumes orbit`}
              >
                {labels[v]}
              </button>
            );
          })}
          {/* Subtle orbit status indicator */}
          <span
            className={`w-1.5 h-1.5 rounded-full ml-1 shrink-0 transition-colors ${autoRotate ? "bg-primary animate-pulse" : "bg-slate-300"}`}
            title={autoRotate ? "Orbiting" : "Frozen — auto-resumes soon"}
          />
        </div>

        {/* Floating Hover Card Top-Left */}
        {hoveredPin && (
          <div className="absolute top-3 left-3 bg-white/95 backdrop-blur px-3 py-2 sm:px-4 sm:py-3 rounded-2xl border border-slate-200 shadow-lg text-xs flex flex-col gap-1 z-10 pointer-events-none animate-fadeIn max-w-[240px] sm:max-w-sm">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: hoveredPin.hex }} />
              <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">{hoveredPin.name}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                #{hoveredPin.slot}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-500 text-[10px] sm:text-[11px]">
              <span className="truncate">{hoveredPin.category}</span>
              <span className="font-mono text-slate-700 font-medium ml-1">
                [{hoveredPin.coords[0].toFixed(0)}, {hoveredPin.coords[1].toFixed(0)}, {hoveredPin.coords[2].toFixed(0)}]
              </span>
            </div>
            <span className="text-[10px] text-primary font-mono">
              Tap sphere to inspect &darr;
            </span>
          </div>
        )}

        {/* Informative Footer Badge */}
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto bg-white/95 backdrop-blur px-3 py-1.5 rounded-2xl border border-slate-200 shadow-xs text-[11px] sm:text-xs text-slate-600 z-10 flex items-center gap-2">
          <Compass className="w-4 h-4 text-primary shrink-0" />
          <span>
            <strong>121 Anatomical Targets:</strong> 3D pins show canonical coordinates including female reproductive structures. Drag to orbit 360°.
          </span>
        </div>
      </div>
    </div>
  );
}
