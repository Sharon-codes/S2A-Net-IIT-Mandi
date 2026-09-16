"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { createHumanMannequin } from "@/utils/mannequinBuilder";
import { RotateCcw, Compass, CheckCircle } from "lucide-react";

interface TargetPinDef {
  name: string;
  label: string;
  slot: number;
  medCoords: [number, number, number]; // [X, Y, Z] in medical canonical mm
  category: string;
  side?: "front" | "back" | "lateral" | "all";
}

const BODY_TARGET_PINS: TargetPinDef[] = [
  // Cranial
  { name: "brain", label: "Brain", slot: 89, medCoords: [0, -15, 412], category: "Head & Cranial" },
  { name: "skull", label: "Skull / Cranium", slot: 90, medCoords: [0, 5, 425], category: "Head & Cranial" },

  // Thoracic / Respiratory
  { name: "trachea", label: "Trachea", slot: 48, medCoords: [0, 50, 255], category: "Thoracic & Respiratory" },
  { name: "lung_upper_lobe_left", label: "Left Lung (Upper)", slot: 9, medCoords: [-65, 40, 210], category: "Thoracic & Respiratory" },
  { name: "lung_upper_lobe_right", label: "Right Lung (Upper)", slot: 11, medCoords: [65, 40, 210], category: "Thoracic & Respiratory" },
  { name: "lung_lower_lobe_left", label: "Left Lung (Lower)", slot: 10, medCoords: [-75, 10, 110], category: "Thoracic & Respiratory" },
  { name: "lung_lower_lobe_right", label: "Right Lung (Lower)", slot: 13, medCoords: [75, 10, 110], category: "Thoracic & Respiratory" },

  // Cardiovascular
  { name: "heart", label: "Heart", slot: 49, medCoords: [-25, 113, 34], category: "Cardiovascular & Major Vessels" },
  { name: "aorta", label: "Aorta", slot: 50, medCoords: [-7, 62, -24], category: "Cardiovascular & Major Vessels" },
  { name: "inferior_vena_cava", label: "IVC", slot: 62, medCoords: [20, 55, -45], category: "Cardiovascular & Major Vessels" },

  // Abdominal
  { name: "liver", label: "Liver", slot: 4, medCoords: [77, 91, -10], category: "Abdominal & Digestive" },
  { name: "spleen", label: "Spleen", slot: 3, medCoords: [-101, 33, 9], category: "Abdominal & Digestive" },
  { name: "stomach", label: "Stomach", slot: 15, medCoords: [-40, 75, 20], category: "Abdominal & Digestive" },
  { name: "gallbladder", label: "Gallbladder", slot: 5, medCoords: [48, 80, -25], category: "Abdominal & Digestive" },
  { name: "pancreas", label: "Pancreas", slot: 6, medCoords: [-15, 60, -15], category: "Abdominal & Digestive" },
  { name: "duodenum", label: "Duodenum", slot: 16, medCoords: [18, 65, -55], category: "Abdominal & Digestive" },
  { name: "colon", label: "Colon", slot: 53, medCoords: [-60, 60, -90], category: "Abdominal & Digestive" },

  // Retroperitoneal (Visible from Back/Posterior)
  { name: "kidney_left", label: "Left Kidney", slot: 2, medCoords: [-75, 34, -31], category: "Abdominal & Digestive", side: "back" },
  { name: "kidney_right", label: "Right Kidney", slot: 1, medCoords: [72, 34, -37], category: "Abdominal & Digestive", side: "back" },

  // Spine & Vertebrae (Back)
  { name: "vertebrae_C3", label: "Vertebra C3 (Neck)", slot: 44, medCoords: [0, -10, 320], category: "Spine & Deep Paravertebral", side: "back" },
  { name: "vertebrae_T4", label: "Vertebra T4 (Mid-Thorax)", slot: 36, medCoords: [0, -12, 190], category: "Spine & Deep Paravertebral", side: "back" },
  { name: "vertebrae_T10", label: "Vertebra T10 (Lower Thorax)", slot: 30, medCoords: [0, -8, 60], category: "Spine & Deep Paravertebral", side: "back" },
  { name: "vertebrae_L3", label: "Vertebra L3 (Lumbar Spine)", slot: 25, medCoords: [0, -4, -65], category: "Spine & Deep Paravertebral", side: "back" },
  { name: "sacrum", label: "Sacrum", slot: 24, medCoords: [0, -5, -165], category: "Pelvis, Urinary & Musculature", side: "back" },

  // Pelvic
  { name: "urinary_bladder", label: "Urinary Bladder", slot: 20, medCoords: [-2, 67, -225], category: "Pelvis, Urinary & Musculature" },
  { name: "prostate", label: "Prostate Gland", slot: 21, medCoords: [0, 50, -250], category: "Pelvis, Urinary & Musculature" },
  { name: "hip_left", label: "Left Hip Joint", slot: 76, medCoords: [-110, 10, -180], category: "Pelvis, Urinary & Musculature" },
  { name: "hip_right", label: "Right Hip Joint", slot: 77, medCoords: [110, 10, -180], category: "Pelvis, Urinary & Musculature" },
];

interface TargetBodyMapProps {
  onSelectTarget: (targetName: string) => void;
  selectedTarget: string | null;
}

export function TargetBodyMap({ onSelectTarget, selectedTarget }: TargetBodyMapProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const pinMeshesRef = useRef<THREE.Mesh[]>([]);
  const reqIdRef = useRef<number | null>(null);

  const [hoveredPin, setHoveredPin] = useState<TargetPinDef | null>(null);
  const [autoRotate, setAutoRotate] = useState(true);

  const isDraggingRef = useRef(false);
  const previousMousePositionRef = useRef({ x: 0, y: 0 });
  const cameraSphericalRef = useRef({ radius: 950, theta: 0.2, phi: Math.PI / 2.3 });
  const targetCenterRef = useRef(new THREE.Vector3(0, 80, 0));

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
    scene.background = new THREE.Color(0xf6f7f2);
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

    // Lighting
    const ambLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.7);
    dirLight1.position.set(200, 500, 300);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xbcc9b3, 0.45);
    dirLight2.position.set(-200, 200, -300);
    scene.add(dirLight2);

    // Floor Circle
    const floorGeo = new THREE.RingGeometry(20, 280, 32);
    const floorMat = new THREE.MeshBasicMaterial({ color: 0xdae0d4, side: THREE.DoubleSide });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -520;
    scene.add(floor);

    // Add Translucent Mannequin Silhouette
    const mannequin = createHumanMannequin();
    scene.add(mannequin);

    // Create Interactive Organ Landmark Pins
    const pinMeshes: THREE.Mesh[] = [];
    BODY_TARGET_PINS.forEach((pin) => {
      const tx = pin.medCoords[0];
      const ty = pin.medCoords[2]; // Med Z -> Three Y
      const tz = pin.medCoords[1]; // Med Y -> Three Z

      const isSel = selectedTarget === pin.name;

      const sphereGeo = new THREE.SphereGeometry(isSel ? 10 : 7, 20, 20);
      const sphereMat = new THREE.MeshStandardMaterial({
        color: isSel ? 0x1f241b : 0x66734b,
        emissive: isSel ? 0x66734b : 0x465133,
        emissiveIntensity: 0.35,
        roughness: 0.2,
        metalness: 0.5,
      });

      const mesh = new THREE.Mesh(sphereGeo, sphereMat);
      mesh.position.set(tx, ty, tz);
      mesh.userData = { pinData: pin };
      scene.add(mesh);
      pinMeshes.push(mesh);

      // Subtle pulse ring
      const ringGeo = new THREE.RingGeometry(9, 11, 16);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x66734b,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(tx, ty, tz);
      scene.add(ring);
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
      // Click selection on raycast hit
      const rect = container.getBoundingClientRect();
      const mouseX = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1;
      const mouseY = -((e.clientY - rect.top) / container.clientHeight) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(mouseX, mouseY), camera);
      const intersects = raycaster.intersectObjects(pinMeshesRef.current);

      if (intersects.length > 0) {
        const hit = intersects[0].object as any;
        const pin = hit.userData.pinData as TargetPinDef;
        onSelectTarget(pin.name);
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraSphericalRef.current.radius = Math.max(
        350,
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
  }, [selectedTarget]);

  const setView = (view: "front" | "back" | "side") => {
    setAutoRotate(false);
    if (view === "front") {
      cameraSphericalRef.current = { radius: 950, theta: 0, phi: Math.PI / 2 };
    } else if (view === "back") {
      cameraSphericalRef.current = { radius: 950, theta: Math.PI, phi: Math.PI / 2 };
    } else {
      cameraSphericalRef.current = { radius: 950, theta: Math.PI / 2, phi: Math.PI / 2 };
    }
    updateCamera();
  };

  return (
    <div className="relative w-full h-[460px] rounded-2xl overflow-hidden border border-border bg-[#F6F7F2] shadow-xs">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Viewport & Rotation Controls Top-Right */}
      <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-white/95 backdrop-blur px-2.5 py-1.5 rounded-lg border border-border shadow-xs text-xs font-medium text-text-muted z-10">
        <button
          onClick={() => setView("front")}
          className="px-2 py-1 rounded hover:bg-background hover:text-text-main transition-colors"
        >
          Front
        </button>
        <button
          onClick={() => setView("back")}
          className="px-2 py-1 rounded hover:bg-background hover:text-text-main transition-colors"
        >
          Back (Spine)
        </button>
        <button
          onClick={() => setView("side")}
          className="px-2 py-1 rounded hover:bg-background hover:text-text-main transition-colors"
        >
          Side
        </button>
        <button
          onClick={() => setAutoRotate(!autoRotate)}
          className={`px-2 py-1 rounded transition-colors ${
            autoRotate ? "bg-primary text-white font-semibold" : "hover:bg-background text-text-muted"
          }`}
        >
          {autoRotate ? "Spinning" : "Orbit"}
        </button>
      </div>

      {/* Floating Hover Card Top-Left */}
      {hoveredPin && (
        <div className="absolute top-4 left-4 bg-white/95 backdrop-blur px-3.5 py-2.5 rounded-xl border border-border shadow-md text-xs flex flex-col gap-1 z-10 pointer-events-none animate-fadeIn">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-text-main">{hoveredPin.label}</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary-dark border border-primary/20">
              Slot #{hoveredPin.slot}
            </span>
          </div>
          <span className="text-text-muted text-[11px]">{hoveredPin.category}</span>
          <span className="text-[10px] text-primary-dark font-mono font-medium mt-0.5">
            Click pin to filter in catalog below &darr;
          </span>
        </div>
      )}

      {/* Helper Footer Notice */}
      <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur px-3 py-1.5 rounded-lg border border-border shadow-xs text-[11px] text-text-muted z-10 flex items-center gap-2">
        <Compass className="w-3.5 h-3.5 text-primary" />
        <span>
          <strong>Interactive 3D Body Map:</strong> Click any glowing landmark pin to inspect that organ below. Rotate 360° to view spine, thoracic, and pelvic targets.
        </span>
      </div>
    </div>
  );
}
