import * as THREE from "three";

/**
 * Creates an upright, anatomically proportioned human body mannequin mesh
 * aligned with the canonical coordinate system:
 * - Y axis: Superior (+) to Inferior (-) [Head: +420mm, Feet: -450mm]
 * - X axis: Right (+) to Left (-)
 * - Z axis: Anterior (+) to Posterior (-)
 */
export function createHumanMannequin(): THREE.Group {
  const group = new THREE.Group();

  const bodyMaterial = new THREE.MeshStandardMaterial({
    color: 0x768761,
    transparent: true,
    opacity: 0.16,
    roughness: 0.35,
    metalness: 0.15,
    depthWrite: false,
    side: THREE.DoubleSide,
  });

  const wireMaterial = new THREE.MeshBasicMaterial({
    color: 0x465133,
    wireframe: true,
    transparent: true,
    opacity: 0.07,
    depthWrite: false,
  });

  function addPart(geo: THREE.BufferGeometry, pos: [number, number, number], scale: [number, number, number] = [1, 1, 1], rot: [number, number, number] = [0, 0, 0]) {
    const mesh = new THREE.Mesh(geo, bodyMaterial);
    mesh.position.set(...pos);
    mesh.scale.set(...scale);
    mesh.rotation.set(...rot);
    group.add(mesh);

    const wire = new THREE.Mesh(geo, wireMaterial);
    wire.position.set(...pos);
    wire.scale.set(...scale);
    wire.rotation.set(...rot);
    group.add(wire);
  }

  // 1. Head / Cranial Vault (Y: ~410mm)
  const headGeo = new THREE.SphereGeometry(75, 32, 24);
  addPart(headGeo, [0, 410, 10], [1.0, 1.22, 1.15]);

  // 2. Neck (Y: 310 - 350mm)
  const neckGeo = new THREE.CylinderGeometry(42, 48, 60, 24);
  addPart(neckGeo, [0, 325, 5], [1.0, 1.0, 0.95]);

  // 3. Clavicles / Shoulders Bar (Y: ~295mm)
  const shoulderGeo = new THREE.CapsuleGeometry(35, 290, 16, 24);
  addPart(shoulderGeo, [0, 295, 0], [1.0, 0.75, 0.85], [0, 0, Math.PI / 2]);

  // 4. Thorax / Chest & Ribcage (Y: 120 - 280mm)
  const thoraxGeo = new THREE.CylinderGeometry(145, 130, 165, 32);
  addPart(thoraxGeo, [0, 205, 10], [1.12, 1.0, 0.85]);

  // 5. Abdomen & Waist (Y: -30 to 120mm)
  const abdomenGeo = new THREE.CylinderGeometry(130, 140, 150, 32);
  addPart(abdomenGeo, [0, 50, 8], [1.05, 1.0, 0.86]);

  // 6. Pelvis & Lower Abdomen (Y: -180 to -30mm)
  const pelvisGeo = new THREE.CylinderGeometry(140, 125, 140, 32);
  addPart(pelvisGeo, [0, -95, 0], [1.16, 1.0, 0.95]);

  // 7. Upper Arms (Left & Right)
  const armGeo = new THREE.CapsuleGeometry(24, 180, 12, 16);
  addPart(armGeo, [-185, 185, -5], [1.0, 1.0, 0.9], [0, 0, 0.12]);
  addPart(armGeo, [185, 185, -5], [1.0, 1.0, 0.9], [0, 0, -0.12]);

  // 8. Forearms
  const forearmGeo = new THREE.CapsuleGeometry(20, 160, 12, 16);
  addPart(forearmGeo, [-205, 30, 0], [1.0, 1.0, 0.9], [0, 0, 0.08]);
  addPart(forearmGeo, [205, 30, 0], [1.0, 1.0, 0.9], [0, 0, -0.08]);

  // 9. Upper Thighs (Left & Right)
  const legGeo = new THREE.CapsuleGeometry(46, 210, 16, 20);
  addPart(legGeo, [-78, -255, 0], [1.0, 1.0, 0.95], [0, 0, -0.05]);
  addPart(legGeo, [78, -255, 0], [1.0, 1.0, 0.95], [0, 0, 0.05]);

  // 10. Lower Legs (Calves)
  const calfGeo = new THREE.CapsuleGeometry(36, 190, 16, 20);
  addPart(calfGeo, [-84, -420, -5], [0.95, 1.0, 0.9]);
  addPart(calfGeo, [84, -420, -5], [0.95, 1.0, 0.9]);

  return group;
}
