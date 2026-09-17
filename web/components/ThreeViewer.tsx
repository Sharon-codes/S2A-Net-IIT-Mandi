"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { createHumanMannequin } from "@/utils/mannequinBuilder";
import { Eye, EyeOff, Layers, RotateCcw } from "lucide-react";

export interface TargetPrediction {
  target: string;
  target_index: number;
  centroid_canonical_mm: [number, number, number];
  centroid_input_world_mm: [number, number, number];
  uncertainty_mm: number;
  uncertainty_level: "low" | "moderate" | "high";
  seed_predictions_mm: Record<string, [number, number, number]>;
}

interface ThreeViewerProps {
  surfacePoints: number[][] | null; // (N, 3) in mm
  predictions: Record<string, TargetPrediction> | null;
  selectedTarget: string | null;
  onSelectTarget?: (target: string) => void;
  coordinateFrame?: string;
}

/**
 * Maps medical CT coordinates (X: Lat, Y: AP, Z: Height)
 * to standard Three.js upright coordinates:
 * - Three.js X = med[0] (Right + / Left -)
 * - Three.js Y = med[2] (Height: Head + / Feet -)
 * - Three.js Z = med[1] (Anterior + / Posterior -)
 */
function toThreeCoord(med: [number, number, number]): [number, number, number] {
  return [med[0], med[2], med[1]];
}

export function ThreeViewer({
  surfacePoints,
  predictions,
  selectedTarget,
  onSelectTarget,
}: ThreeViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const pointsMeshRef = useRef<THREE.Points | null>(null);
  const targetGroupRef = useRef<THREE.Group | null>(null);
  const mannequinGroupRef = useRef<THREE.Group | null>(null);
  const reqIdRef = useRef<number | null>(null);

  const [showMannequin, setShowMannequin] = useState(true);
  const [showPoints, setShowPoints] = useState(true);
  const [activePinHover, setActivePinHover] = useState<string | null>(null);

  // Manual orbit controls variables (Spherical coordinates)
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const cameraSphericalRef = useRef({ radius: 950, theta: Math.PI / 4, phi: Math.PI / 2.3 });
  const targetCenterRef = useRef(new THREE.Vector3(0, 100, 0)); // Center camera on mid-torso

  const updateCamera = () => {
    if (!cameraRef.current) return;
    const { radius, theta, phi } = cameraSphericalRef.current;
    const x = targetCenterRef.current.x + radius * Math.sin(phi) * Math.sin(theta);
    const y = targetCenterRef.current.y + radius * Math.cos(phi);
    const z = targetCenterRef.current.z + radius * Math.sin(phi) * Math.cos(theta);
    cameraRef.current.position.set(x, y, z);
    cameraRef.current.lookAt(targetCenterRef.current);
  };

  // Initialize Scene
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf6f7f2);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 5000);
    camera.up.set(0, 1, 0); // Y is UP
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
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.65);
    dirLight1.position.set(300, 600, 400);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xced8c6, 0.4);
    dirLight2.position.set(-300, -200, -300);
    scene.add(dirLight2);

    // Grid Floor below feet
    const gridHelper = new THREE.GridHelper(1000, 24, 0xb8c2ad, 0xdce2d5);
    gridHelper.position.y = -520;
    scene.add(gridHelper);

    // 1. Mannequin Group
    const mannequin = createHumanMannequin();
    scene.add(mannequin);
    mannequinGroupRef.current = mannequin;

    // 2. Anatomical Target Pins Group
    const targetGroup = new THREE.Group();
    scene.add(targetGroup);
    targetGroupRef.current = targetGroup;

    // Animation Loop
    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
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
        0.05,
        Math.min(Math.PI - 0.05, cameraSphericalRef.current.phi - deltaY * 0.007)
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
        200,
        Math.min(2200, cameraSphericalRef.current.radius + e.deltaY * 0.75)
      );
      updateCamera();
    };

    const handleResize = () => {
      if (!container || !renderer || !camera) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    // Touch Navigation Controls for Mobile Devices
    let initialPinchDist = 0;
    const onTouchStart = (e: TouchEvent) => {
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
          250,
          Math.min(2200, cameraSphericalRef.current.radius + pinchDelta * 1.2)
        );
        initialPinchDist = currentDist;
        updateCamera();
      }
    };

    const onTouchEnd = () => {
      isDraggingRef.current = false;
    };

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    container.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("resize", handleResize);

    container.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", handleResize);

      container.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      renderer.dispose();
    };
  }, []);

  // Toggle Mannequin visibility
  useEffect(() => {
    if (mannequinGroupRef.current) {
      mannequinGroupRef.current.visible = showMannequin;
    }
  }, [showMannequin]);

  // Update Surface Point Cloud (Floating points around mannequin)
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    if (pointsMeshRef.current) {
      scene.remove(pointsMeshRef.current);
      pointsMeshRef.current.geometry.dispose();
      (pointsMeshRef.current.material as THREE.Material).dispose();
      pointsMeshRef.current = null;
    }

    if (!surfacePoints || surfacePoints.length === 0 || !showPoints) return;

    const count = surfacePoints.length;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    // Check bounding box to ensure point cloud is aligned with canonical frame
    let minX = Infinity, maxX = -Infinity;
    let minY = Infinity, maxY = -Infinity;
    let minZ = Infinity, maxZ = -Infinity;

    for (let i = 0; i < count; i++) {
      const p = surfacePoints[i];
      if (p[0] < minX) minX = p[0];
      if (p[0] > maxX) maxX = p[0];
      if (p[1] < minY) minY = p[1];
      if (p[1] > maxY) maxY = p[1];
      if (p[2] < minZ) minZ = p[2];
      if (p[2] > maxZ) maxZ = p[2];
    }

    const midX = (minX + maxX) / 2;
    const midY = (minY + maxY) / 2; // Medical AP
    const midZ = (minZ + maxZ) / 2; // Medical SI

    // Anatomical alignment: lock skull apex at +375mm to align cleanly with mannequin
    let shiftX = 0;
    let shiftY = 0;
    let shiftZ = 0;

    if (Math.abs(midX) > 30) shiftX = midX;
    if (Math.abs(midY - 48) > 30) shiftY = midY - 48;
    if (maxZ > 385) {
      shiftZ = maxZ - 375;
    }

    for (let i = 0; i < count; i++) {
      const p = surfacePoints[i];
      const cx = p[0] - shiftX;
      const cy = p[1] - shiftY;
      const cz = p[2] - shiftZ;

      // Map medical (X, Y, Z) to Three.js upright (X: X, Y: Z, Z: Y)
      const [tx, ty, tz] = toThreeCoord([cx, cy, cz]);
      positions[i * 3 + 0] = tx;
      positions[i * 3 + 1] = ty;
      positions[i * 3 + 2] = tz;

      // Luminous scientific gradient: Head (bright cyan) -> Torso (sky blue) -> Lower (slate)
      if (ty > 260) {
        // Head / Brain / Cranium region
        colors[i * 3 + 0] = 0.22; // R
        colors[i * 3 + 1] = 0.74; // G
        colors[i * 3 + 2] = 0.97; // B (Bright Cyan #38bdf8)
      } else if (ty > 60) {
        // Thorax & Upper Abdomen
        colors[i * 3 + 0] = 0.35;
        colors[i * 3 + 1] = 0.65;
        colors[i * 3 + 2] = 0.85;
      } else {
        // Pelvis & Lower Extremities
        colors[i * 3 + 0] = 0.45;
        colors[i * 3 + 1] = 0.58;
        colors[i * 3 + 2] = 0.72;
      }
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 3.2,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });

    const pointsMesh = new THREE.Points(geometry, material);
    scene.add(pointsMesh);
    pointsMeshRef.current = pointsMesh;
  }, [surfacePoints, showPoints]);

  // Update Target Centroid Pins & Uncertainty Halos
  useEffect(() => {
    if (!targetGroupRef.current) return;
    const group = targetGroupRef.current;

    while (group.children.length > 0) {
      const child = group.children[0] as any;
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
      group.remove(child);
    }

    if (!predictions) return;

    Object.entries(predictions).forEach(([name, pred]) => {
      const rawCoords = pred.centroid_canonical_mm ?? pred.centroid_input_world_mm;
      const [tx, ty, tz] = toThreeCoord(rawCoords);
      const isSelected = selectedTarget === name;

      let pinColor = 0x4e774a; // Low unc
      if (pred.uncertainty_level === "moderate") pinColor = 0xc88a2d;
      if (pred.uncertainty_level === "high") pinColor = 0xb34a3e;
      if (isSelected) pinColor = 0x1f241b;

      // 1. Organ Centroid Glowing Sphere
      const sphereGeo = new THREE.SphereGeometry(isSelected ? 11 : 8, 24, 24);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: pinColor,
        roughness: 0.15,
        metalness: 0.6,
        emissive: pinColor,
        emissiveIntensity: isSelected ? 0.4 : 0.15,
      });
      const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
      sphereMesh.position.set(tx, ty, tz);
      group.add(sphereMesh);

      // 2. Wireframe Uncertainty Radius Sphere
      const radius = Math.max(9, pred.uncertainty_mm);
      const haloGeo = new THREE.SphereGeometry(radius, 16, 16);
      const haloMat = new THREE.MeshBasicMaterial({
        color: pinColor,
        wireframe: true,
        transparent: true,
        opacity: isSelected ? 0.5 : 0.25,
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      haloMesh.position.set(tx, ty, tz);
      group.add(haloMesh);

      // 3. Drop Indicator Stalk to Base Plane
      const lineMat = new THREE.LineBasicMaterial({
        color: pinColor,
        transparent: true,
        opacity: 0.35,
      });
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(tx, ty, tz),
        new THREE.Vector3(tx, -520, tz),
      ]);
      const line = new THREE.Line(lineGeo, lineMat);
      group.add(line);
    });
  }, [predictions, selectedTarget]);

  const setViewPreset = (preset: "iso" | "coronal_front" | "coronal_back" | "sagittal" | "axial") => {
    if (preset === "coronal_front") {
      // Front AP: theta = 0, phi = 90 deg
      cameraSphericalRef.current = { radius: 950, theta: 0, phi: Math.PI / 2 };
    } else if (preset === "coronal_back") {
      // Back PA: theta = 180 deg, phi = 90 deg
      cameraSphericalRef.current = { radius: 950, theta: Math.PI, phi: Math.PI / 2 };
    } else if (preset === "sagittal") {
      // Side: theta = 90 deg, phi = 90 deg
      cameraSphericalRef.current = { radius: 950, theta: Math.PI / 2, phi: Math.PI / 2 };
    } else if (preset === "axial") {
      // Top down: phi = small
      cameraSphericalRef.current = { radius: 1050, theta: 0, phi: 0.08 };
    } else {
      // Perspective
      cameraSphericalRef.current = { radius: 950, theta: Math.PI / 4, phi: Math.PI / 2.4 };
    }
    updateCamera();
  };

  return (
    <div className="relative w-full h-full min-h-[520px] rounded-xl overflow-hidden border border-border bg-[#F6F7F2] shadow-inner">
      {/* 3D Canvas Mounting Element */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing touch-none" />

      {/* Preset Viewport Buttons Top Bar */}
      <div className="absolute top-3 right-3 flex flex-wrap max-w-[210px] sm:max-w-none justify-end items-center gap-1 bg-white/95 backdrop-blur px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-border shadow-xs text-xs font-medium text-text-muted z-10">
        <span className="text-[10px] uppercase font-mono px-1 hidden sm:inline">View:</span>
        <button
          onClick={() => setViewPreset("iso")}
          className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[11px] rounded hover:bg-background hover:text-text-main transition-colors"
        >
          Perspective
        </button>
        <button
          onClick={() => setViewPreset("coronal_front")}
          className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[11px] rounded hover:bg-background hover:text-text-main transition-colors"
        >
          Front
        </button>
        <button
          onClick={() => setViewPreset("coronal_back")}
          className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[11px] rounded hover:bg-background hover:text-text-main transition-colors"
        >
          Back
        </button>
        <button
          onClick={() => setViewPreset("sagittal")}
          className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[11px] rounded hover:bg-background hover:text-text-main transition-colors"
        >
          Side
        </button>
        <button
          onClick={() => setViewPreset("axial")}
          className="px-1.5 sm:px-2 py-0.5 sm:py-1 text-[11px] rounded hover:bg-background hover:text-text-main transition-colors"
        >
          Top
        </button>
      </div>

      {/* Visibility Toggles Top-Left */}
      <div className="absolute top-3 left-3 flex items-center gap-1 bg-white/95 backdrop-blur px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-xl border border-border shadow-xs text-[11px] sm:text-xs font-medium text-text-muted z-10">
        <button
          onClick={() => setShowMannequin(!showMannequin)}
          className={`flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded transition-colors ${
            showMannequin ? "bg-primary text-white font-semibold" : "hover:bg-background text-text-muted"
          }`}
        >
          <span>🧍 Mannequin</span>
        </button>
        <button
          onClick={() => setShowPoints(!showPoints)}
          className={`flex items-center gap-1 px-1.5 sm:px-2 py-0.5 sm:py-1 rounded transition-colors ${
            showPoints ? "bg-primary text-white font-semibold" : "hover:bg-background text-text-muted"
          }`}
        >
          <span>✨ Cloud</span>
        </button>
      </div>

      {/* Legend Bottom-Left */}
      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur px-3 py-2 rounded-lg border border-border shadow-xs text-xs text-text-muted flex flex-col gap-1 z-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-green" />
            <span>Low Unc (&le; 5mm)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-amber" />
            <span>Moderate (5-15mm)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-accent-red" />
            <span>High (&gt; 15mm)</span>
          </div>
        </div>
        <span className="text-[10px] text-text-muted/80">
          Interactive 3D: Drag to rotate &bull; Scroll to zoom &bull; Standard anatomical coordinates (mm)
        </span>
      </div>
    </div>
  );
}
