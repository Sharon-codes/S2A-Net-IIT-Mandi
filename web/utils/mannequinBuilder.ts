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

/**
 * Creates an Intel RealSense / Azure Kinect 3D Depth Sensor representation:
 * Camera enclosure at [0, 80, 750], optical cone ray frustum pointing to patient,
 * and calibrated depth range bounds.
 */
export function createDepthSensorRig(): THREE.Group {
  const group = new THREE.Group();

  // 1. Depth Camera Sensor Body (Intel RealSense D435) mounted at [0, 100, 720]
  const bodyGeo = new THREE.BoxGeometry(150, 36, 28);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x465133,
    roughness: 0.4,
    metalness: 0.6,
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.set(0, 100, 720);
  group.add(body);

  // 2. Optical Lenses (IR projector + stereo depth sensors)
  const lensGeo = new THREE.CylinderGeometry(8, 8, 6, 20);
  const lensMat = new THREE.MeshStandardMaterial({
    color: 0x8b9a6d,
    roughness: 0.2,
    metalness: 0.7,
    emissive: 0x8b9a6d,
    emissiveIntensity: 0.3,
  });

  const lensLeft = new THREE.Mesh(lensGeo, lensMat);
  lensLeft.rotation.x = Math.PI / 2;
  lensLeft.position.set(-42, 100, 705);
  group.add(lensLeft);

  const lensRight = new THREE.Mesh(lensGeo, lensMat);
  lensRight.rotation.x = Math.PI / 2;
  lensRight.position.set(42, 100, 705);
  group.add(lensRight);

  // 3. Subtle Optical Ray Frustum Pyramid (Soft olive lines, zero occlusion)
  const frustumPoints = [
    new THREE.Vector3(0, 100, 700),
    new THREE.Vector3(-160, 360, 90),
    new THREE.Vector3(0, 100, 700),
    new THREE.Vector3(160, 360, 90),
    new THREE.Vector3(0, 100, 700),
    new THREE.Vector3(160, -320, 90),
    new THREE.Vector3(0, 100, 700),
    new THREE.Vector3(-160, -320, 90),
    // Patient plane perimeter guide
    new THREE.Vector3(-160, 360, 90),
    new THREE.Vector3(160, 360, 90),
    new THREE.Vector3(160, 360, 90),
    new THREE.Vector3(160, -320, 90),
    new THREE.Vector3(160, -320, 90),
    new THREE.Vector3(-160, -320, 90),
    new THREE.Vector3(-160, -320, 90),
    new THREE.Vector3(-160, 360, 90),
  ];

  const frustumGeo = new THREE.BufferGeometry().setFromPoints(frustumPoints);
  const frustumMat = new THREE.LineBasicMaterial({
    color: 0x8b9a6d,
    transparent: true,
    opacity: 0.22,
  });
  const frustum = new THREE.LineSegments(frustumGeo, frustumMat);
  group.add(frustum);

  return group;
}

/**
 * Creates a Clinical Photographic Backdrop Frame for RGB photos:
 * Vertical measurement grid billboard showing clinical studio calibration.
 */
export function createPhotoBillboardRig(): THREE.Group {
  const group = new THREE.Group();

  // 1. Clinical Calibration Grid Plane (Backing board)
  const boardGeo = new THREE.PlaneGeometry(420, 760);
  const boardMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.7,
    metalness: 0.05,
  });
  const board = new THREE.Mesh(boardGeo, boardMat);
  board.position.set(0, 20, -50);
  group.add(board);

  // 2. Medical Grid Lines
  const gridHelper = new THREE.GridHelper(700, 35, 0x94a3b8, 0xe2e8f0);
  gridHelper.rotation.x = Math.PI / 2;
  gridHelper.position.set(0, 20, -48);
  group.add(gridHelper);

  // 3. Clinical Camera Tripod / Lighting Guide Stand
  const standMat = new THREE.MeshBasicMaterial({
    color: 0xd97706,
    transparent: true,
    opacity: 0.4,
  });
  const guidePoints = [
    new THREE.Vector3(-210, 400, -46),
    new THREE.Vector3(210, 400, -46),
    new THREE.Vector3(210, -360, -46),
    new THREE.Vector3(-210, -360, -46),
    new THREE.Vector3(-210, 400, -46),
  ];
  const guideGeo = new THREE.BufferGeometry().setFromPoints(guidePoints);
  const guideLine = new THREE.Line(guideGeo, standMat);
  group.add(guideLine);

  return group;
}

