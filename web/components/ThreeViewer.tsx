"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

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
  coordinateFrame?: "canonical" | "world";
}

export function ThreeViewer({
  surfacePoints,
  predictions,
  selectedTarget,
  onSelectTarget,
  coordinateFrame = "canonical",
}: ThreeViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const pointsMeshRef = useRef<THREE.Points | null>(null);
  const targetGroupRef = useRef<THREE.Group | null>(null);
  const reqIdRef = useRef<number | null>(null);

  const [hoveredPin, setHoveredPin] = useState<string | null>(null);

  // Manual orbit controls variables
  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const cameraSphericalRef = useRef({ radius: 800, theta: Math.PI / 4, phi: Math.PI / 3 });
  const targetCenterRef = useRef(new THREE.Vector3(0, 0, 0));

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
    scene.background = new THREE.Color(0xf5f5f0);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 1, 5000);
    cameraRef.current = camera;
    updateCamera();

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    rendererRef.current = renderer;

    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
    dirLight.position.set(200, 500, 300);
    scene.add(dirLight);

    // Grid Floor
    const gridHelper = new THREE.GridHelper(800, 20, 0xc4cabe, 0xe2e5dc);
    gridHelper.position.y = -350;
    scene.add(gridHelper);

    // Group for target pins
    const targetGroup = new THREE.Group();
    scene.add(targetGroup);
    targetGroupRef.current = targetGroup;

    // Animation Loop
    const animate = () => {
      reqIdRef.current = requestAnimationFrame(animate);
      renderer.render(scene, camera);
    };
    animate();

    // Mouse Controls
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      previousMousePositionRef.current = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const deltaX = e.clientX - previousMousePositionRef.current.x;
      const deltaY = e.clientY - previousMousePositionRef.current.y;

      cameraSphericalRef.current.theta -= deltaX * 0.008;
      cameraSphericalRef.current.phi = Math.max(
        0.05,
        Math.min(Math.PI - 0.05, cameraSphericalRef.current.phi - deltaY * 0.008)
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
        100,
        Math.min(2500, cameraSphericalRef.current.radius + e.deltaY * 0.6)
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

    container.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    container.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("resize", handleResize);

    return () => {
      if (reqIdRef.current) cancelAnimationFrame(reqIdRef.current);
      container.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      container.removeEventListener("wheel", onWheel);
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
    };
  }, []);

  // Update Surface Point Cloud
  useEffect(() => {
    if (!sceneRef.current) return;
    const scene = sceneRef.current;

    if (pointsMeshRef.current) {
      scene.remove(pointsMeshRef.current);
      pointsMeshRef.current.geometry.dispose();
      (pointsMeshRef.current.material as THREE.Material).dispose();
      pointsMeshRef.current = null;
    }

    if (!surfacePoints || surfacePoints.length === 0) return;

    const count = surfacePoints.length;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    // Compute bounding box to center target camera
    let minZ = Infinity, maxZ = -Infinity;
    for (let i = 0; i < count; i++) {
      const p = surfacePoints[i];
      positions[i * 3 + 0] = p[0];
      positions[i * 3 + 1] = p[1];
      positions[i * 3 + 2] = p[2];

      if (p[2] < minZ) minZ = p[2];
      if (p[2] > maxZ) maxZ = p[2];

      // Sage/Olive gradient depending on Z height
      colors[i * 3 + 0] = 0.42; // R
      colors[i * 3 + 1] = 0.48; // G
      colors[i * 3 + 2] = 0.38; // B
    }

    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({
      size: 3.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
    });

    const pointsMesh = new THREE.Points(geometry, material);
    scene.add(pointsMesh);
    pointsMeshRef.current = pointsMesh;
  }, [surfacePoints]);

  // Update Anatomical Target Pins & Uncertainty Halos
  useEffect(() => {
    if (!targetGroupRef.current) return;
    const group = targetGroupRef.current;

    // Clear old pins
    while (group.children.length > 0) {
      const child = group.children[0] as any;
      if (child.geometry) child.geometry.dispose();
      if (child.material) child.material.dispose();
      group.remove(child);
    }

    if (!predictions) return;

    Object.entries(predictions).forEach(([name, pred]) => {
      const coords = coordinateFrame === "world" ? pred.centroid_input_world_mm : pred.centroid_canonical_mm;
      const isSelected = selectedTarget === name;

      // Color scheme based on uncertainty level
      let pinColor = 0x4e774a; // Low uncertainty (green)
      if (pred.uncertainty_level === "moderate") pinColor = 0xc88a2d; // Amber
      if (pred.uncertainty_level === "high") pinColor = 0xb34a3e; // Red

      if (isSelected) pinColor = 0x1f241b; // Highlight selected

      // 1. Target Core Sphere
      const sphereGeo = new THREE.SphereGeometry(isSelected ? 9 : 6, 24, 24);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: pinColor,
        roughness: 0.2,
        metalness: 0.5,
      });
      const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
      sphereMesh.position.set(coords[0], coords[1], coords[2]);
      sphereMesh.userData = { targetName: name };
      group.add(sphereMesh);

      // 2. Uncertainty Radius Halo (Wireframe Sphere)
      const radius = Math.max(8, pred.uncertainty_mm);
      const haloGeo = new THREE.SphereGeometry(radius, 16, 16);
      const haloMat = new THREE.MeshBasicMaterial({
        color: pinColor,
        wireframe: true,
        transparent: true,
        opacity: isSelected ? 0.45 : 0.2,
      });
      const haloMesh = new THREE.Mesh(haloGeo, haloMat);
      haloMesh.position.set(coords[0], coords[1], coords[2]);
      group.add(haloMesh);

      // 3. Drop indicator line to bottom plane
      const lineMat = new THREE.LineBasicMaterial({
        color: pinColor,
        transparent: true,
        opacity: 0.4,
      });
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(coords[0], coords[1], coords[2]),
        new THREE.Vector3(coords[0], -350, coords[2]),
      ]);
      const line = new THREE.Line(lineGeo, lineMat);
      group.add(line);
    });
  }, [predictions, selectedTarget, coordinateFrame]);

  const resetView = (preset: "front" | "side" | "top" | "iso") => {
    if (preset === "front") {
      cameraSphericalRef.current = { radius: 800, theta: 0, phi: Math.PI / 2 };
    } else if (preset === "side") {
      cameraSphericalRef.current = { radius: 800, theta: Math.PI / 2, phi: Math.PI / 2 };
    } else if (preset === "top") {
      cameraSphericalRef.current = { radius: 800, theta: 0, phi: 0.05 };
    } else {
      cameraSphericalRef.current = { radius: 800, theta: Math.PI / 4, phi: Math.PI / 3 };
    }
    updateCamera();
  };

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-xl overflow-hidden border border-border bg-[#F5F5F0]">
      {/* 3D Canvas Mounting Element */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Preset Viewport Buttons */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/90 backdrop-blur px-2 py-1.5 rounded-lg border border-border shadow-sm text-xs font-medium text-text-muted z-10">
        <span className="text-[10px] uppercase font-mono px-1">View:</span>
        <button
          onClick={() => resetView("iso")}
          className="px-2 py-1 rounded hover:bg-background hover:text-text-main transition-colors"
        >
          Perspective
        </button>
        <button
          onClick={() => resetView("front")}
          className="px-2 py-1 rounded hover:bg-background hover:text-text-main transition-colors"
        >
          Coronal (AP)
        </button>
        <button
          onClick={() => resetView("side")}
          className="px-2 py-1 rounded hover:bg-background hover:text-text-main transition-colors"
        >
          Sagittal
        </button>
        <button
          onClick={() => resetView("top")}
          className="px-2 py-1 rounded hover:bg-background hover:text-text-main transition-colors"
        >
          Axial
        </button>
      </div>

      {/* Legend & Navigation Helper */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur px-3 py-2 rounded-lg border border-border shadow-sm text-xs text-text-muted flex flex-col gap-1 z-10">
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
          Rotate: Drag left-click | Zoom: Mouse wheel | Scale: mm
        </span>
      </div>
    </div>
  );
}
