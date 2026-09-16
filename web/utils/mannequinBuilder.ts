import * as THREE from "three";

/**
 * Creates an upright, anatomically proportioned human body mannequin
 * with smooth holographic glass styling, aligned with canonical medical coordinates:
 * - Three.js Y: Superior (+) to Inferior (-) [Cranium: +380mm, Feet: -470mm]
 * - Three.js X: Anatomical Right (+) to Left (-)
 * - Three.js Z: Anterior (+) to Posterior (-) [Chest: +85mm, Spine: +15mm]
 */
export function createHumanMannequin(): THREE.Group {
  const group = new THREE.Group();

  // Premium holographic frosted glass material
  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x94b4c7, // Elegant ice-blue translucent tint
    transparent: true,
    opacity: 0.13,
    roughness: 0.2,
    metalness: 0.12,
    depthWrite: false,
    side: THREE.FrontSide, // Clear transparency without dark back-face disc artifacts
  });

  // Subtle accent contour line material
  const edgeMaterial = new THREE.LineBasicMaterial({
    color: 0x608aa8,
    transparent: true,
    opacity: 0.22,
    depthWrite: false,
  });

  function addSmoothPart(
    geo: THREE.BufferGeometry,
    pos: [number, number, number],
    scale: [number, number, number] = [1, 1, 1],
    rot: [number, number, number] = [0, 0, 0]
  ) {
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, bodyMaterial);
    mesh.position.set(...pos);
    mesh.scale.set(...scale);
    mesh.rotation.set(...rot);
    group.add(mesh);
  }

  // 1. Head & Cranial Vault (Y: ~320 to 410mm, Z: ~45mm)
  // Cranium
  const craniumGeo = new THREE.SphereGeometry(66, 32, 24);
  addSmoothPart(craniumGeo, [0, 360, 48], [1.0, 1.15, 1.12]);

  // Jaw / Chin contour
  const jawGeo = new THREE.CylinderGeometry(38, 26, 48, 24);
  addSmoothPart(jawGeo, [0, 308, 52], [1.0, 1.0, 1.08]);

  // 2. Cervical Neck (Y: 250 - 290mm)
  const neckGeo = new THREE.CylinderGeometry(34, 42, 50, 24);
  addSmoothPart(neckGeo, [0, 268, 48], [1.0, 1.0, 0.95]);

  // 3. Clavicles / Shoulder Girdle Bridge (Y: ~240mm)
  const shoulderGeo = new THREE.CapsuleGeometry(28, 240, 16, 24);
  addSmoothPart(shoulderGeo, [0, 240, 45], [1.0, 0.75, 0.85], [0, 0, Math.PI / 2]);

  // 4. Thorax & Ribcage (Y: 100 - 230mm)
  const thoraxGeo = new THREE.CylinderGeometry(136, 118, 140, 32);
  addSmoothPart(thoraxGeo, [0, 160, 50], [1.1, 1.0, 0.88]);

  // 5. Abdomen & Waist (Y: -10 to 100mm)
  const abdomenGeo = new THREE.CylinderGeometry(116, 124, 120, 32);
  addSmoothPart(abdomenGeo, [0, 45, 46], [1.05, 1.0, 0.88]);

  // 6. Pelvis & Lower Abdomen (Y: -140 to -10mm)
  const pelvisGeo = new THREE.CylinderGeometry(124, 108, 120, 32);
  addSmoothPart(pelvisGeo, [0, -75, 42], [1.14, 1.0, 0.95]);

  // 7. Upper Arms (Left & Right)
  const armGeo = new THREE.CapsuleGeometry(19, 160, 12, 16);
  addSmoothPart(armGeo, [-162, 140, 40], [1.0, 1.0, 0.9], [0, 0, 0.1]);
  addSmoothPart(armGeo, [162, 140, 40], [1.0, 1.0, 0.9], [0, 0, -0.1]);

  // 8. Forearms
  const forearmGeo = new THREE.CapsuleGeometry(16, 150, 12, 16);
  addSmoothPart(forearmGeo, [-180, 0, 42], [1.0, 1.0, 0.9], [0, 0, 0.05]);
  addSmoothPart(forearmGeo, [180, 0, 42], [1.0, 1.0, 0.9], [0, 0, -0.05]);

  // 9. Thighs (Left & Right)
  const thighGeo = new THREE.CapsuleGeometry(40, 190, 16, 20);
  addSmoothPart(thighGeo, [-66, -220, 42], [1.0, 1.0, 0.95], [0, 0, -0.04]);
  addSmoothPart(thighGeo, [66, -220, 42], [1.0, 1.0, 0.95], [0, 0, 0.04]);

  // 10. Lower Legs (Calves)
  const calfGeo = new THREE.CapsuleGeometry(30, 180, 16, 20);
  addSmoothPart(calfGeo, [-70, -375, 40], [0.95, 1.0, 0.9]);
  addSmoothPart(calfGeo, [70, -375, 40], [0.95, 1.0, 0.9]);

  // 11. Sleek Turntable Pedestal Base
  const pedestalGeo = new THREE.CylinderGeometry(190, 200, 8, 36);
  const pedestalMat = new THREE.MeshStandardMaterial({
    color: 0xd9e2ec,
    roughness: 0.4,
    metalness: 0.3,
  });
  const pedestal = new THREE.Mesh(pedestalGeo, pedestalMat);
  pedestal.position.set(0, -470, 40);
  group.add(pedestal);

  // Pedestal glowing ring
  const ringGeo = new THREE.RingGeometry(182, 186, 48);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.6,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.set(0, -465, 40);
  group.add(ring);

  return group;
}

