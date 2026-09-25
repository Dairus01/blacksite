function part(THREE, parent, size, position, material, rotation = null, name = '') {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size, 2, 2, 2), material);
  mesh.position.set(...position);
  if (rotation) mesh.rotation.set(...rotation);
  mesh.name = name;
  parent.add(mesh);
  return mesh;
}

export default function generate(THREE, profile = { id: 'arx7', color: 0x35443c }) {
  const root = new THREE.Group();
  root.name = `${profile.id ?? 'arx7'}Viewmodel`;
  const gun = new THREE.Group();
  root.add(gun);
  const graphite = new THREE.MeshStandardMaterial({ color: 0x252e32, roughness: 0.34, metalness: 0.76 });
  const black = new THREE.MeshStandardMaterial({ color: 0x050708, roughness: 0.70, metalness: 0.24 });
  const polymer = new THREE.MeshStandardMaterial({ color: profile.color ?? 0x35443c, roughness: 0.82, metalness: 0.08 });
  const brass = new THREE.MeshStandardMaterial({ color: 0x8a6237, roughness: 0.42, metalness: 0.68 });
  const glow = new THREE.MeshBasicMaterial({ color: 0xffc46c, transparent: true, opacity: 0, depthWrite: false });

  part(THREE, gun, [0.22, 0.23, 0.43], [0, 0.02, -0.20], polymer);
  part(THREE, gun, [0.27, 0.27, 0.52], [0, 0.06, 0.24], graphite);
  part(THREE, gun, [0.24, 0.20, 0.48], [0, 0.08, 0.70], polymer);
  for (const side of [-1, 1]) {
    part(THREE, gun, [0.024, 0.12, 0.42], [side * 0.13, 0.08, 0.70], black);
    for (let i = 0; i < 4; i += 1) part(THREE, gun, [0.026, 0.045, 0.055], [side * 0.145, 0.08, 0.55 + i * 0.12], brass);
  }
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, 0.58, 12), graphite);
  barrel.rotation.x = Math.PI / 2;
  barrel.position.set(0, 0.08, 1.18);
  gun.add(barrel);
  const brake = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.045, 0.18, 12), black);
  brake.rotation.x = Math.PI / 2;
  brake.position.set(0, 0.08, 1.55);
  gun.add(brake);
  for (const x of [-0.04, 0.04]) part(THREE, gun, [0.025, 0.05, 0.07], [x, 0.08, 1.57], graphite);
  const magazine = part(THREE, gun, [0.18, 0.40, 0.22], [0, -0.27, 0.23], black, [-0.13, 0, 0], 'magazine');
  part(THREE, gun, [0.16, 0.31, 0.14], [0, -0.22, -0.12], polymer, [-0.18, 0, 0]);
  part(THREE, gun, [0.16, 0.08, 0.48], [0, 0.22, 0.28], black);
  part(THREE, gun, [0.018, 0.10, 0.24], [0.145, 0.10, 0.20], brass);
  const bolt = part(THREE, gun, [0.028, 0.055, 0.19], [-0.15, 0.12, 0.17], graphite);
  part(THREE, gun, [0.055, 0.025, 0.07], [-0.18, 0.14, 0.08], black);
  for (let i = 0; i < 8; i += 1) part(THREE, gun, [0.15, 0.022, 0.045], [0, 0.275, 0.02 + i * 0.095], graphite);
  part(THREE, gun, [0.18, 0.075, 0.22], [0, 0.34, 0.28], graphite);
  for (const x of [-0.055, 0.055]) part(THREE, gun, [0.025, 0.11, 0.08], [x, 0.405, 0.37], black);
  const opticRing = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.010, 7, 18), black);
  opticRing.position.set(0, 0.455, 0.41);
  gun.add(opticRing);
  const redDot = new THREE.Mesh(new THREE.CircleGeometry(0.010, 10), new THREE.MeshBasicMaterial({ color: 0xff5c3f, side: THREE.DoubleSide, depthTest: false }));
  redDot.position.set(0, 0.455, 0.422);
  gun.add(redDot);
  let reloadShell = null;
  part(THREE, gun, [0.035, 0.14, 0.035], [0, 0.33, 1.05], black);
  part(THREE, gun, [0.12, 0.035, 0.035], [0, 0.40, 1.05], black);
  const flash = new THREE.Mesh(new THREE.OctahedronGeometry(0.13, 0), glow);
  flash.scale.set(0.65, 0.65, 1.7);
  flash.position.set(0, 0.08, 1.70);
  gun.add(flash);

  // Receiver families share controls and rigging while keeping distinct silhouettes.
  if (profile.id === 'kestrel') {
    gun.scale.set(0.86, 0.92, 0.72);
    part(THREE, gun, [0.23, 0.17, 0.30], [0, 0.10, -0.46], black);
    part(THREE, gun, [0.26, 0.22, 0.33], [0, 0.06, 0.61], polymer);
    const suppressor = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.35, 14), black);
    suppressor.rotation.x = Math.PI / 2; suppressor.position.set(0, 0.08, 1.54); gun.add(suppressor);
    for (const x of [-0.11, 0.11]) part(THREE, gun, [0.035, 0.13, 0.32], [x, 0.15, -0.42], graphite);
    magazine.scale.set(0.72, 1.28, 0.76);
  } else if (profile.id === 'breacher') {
    gun.scale.set(1.10, 1.06, 0.92);
    const tube = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 0.90, 14), graphite);
    tube.rotation.x = Math.PI / 2;
    tube.position.set(0, -0.06, 1.06);
    gun.add(tube);
    part(THREE, gun, [0.27, 0.24, 0.48], [0, 0.08, 0.78], polymer);
    for (let i = 0; i < 5; i += 1) part(THREE, gun, [0.275, 0.025, 0.025], [0, -0.032, 0.58 + i * 0.085], black);
    for (let i = 0; i < 4; i += 1) {
      const shell = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.19, 9), brass);
      shell.rotation.x = Math.PI / 2; shell.position.set(0.155, 0.11, -0.07 + i * 0.12); gun.add(shell);
    }
    reloadShell = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.18, 10), brass);
    reloadShell.rotation.x = Math.PI / 2; reloadShell.visible = false; gun.add(reloadShell);
    magazine.visible = false;
    opticRing.visible = false; redDot.visible = false;
  } else if (profile.id === 'vesper') {
    gun.scale.set(0.94, 0.96, 1.24);
    const optic = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.075, 0.46, 16), black);
    optic.rotation.x = Math.PI / 2; optic.position.set(0, 0.46, 0.35); gun.add(optic);
    for (const z of [0.15, 0.51]) {
      const glass = new THREE.Mesh(new THREE.CylinderGeometry(0.068, 0.068, 0.012, 16), new THREE.MeshStandardMaterial({ color: 0x1f3a42, metalness: 0.5, roughness: 0.18 }));
      glass.rotation.x = Math.PI / 2; glass.position.set(0, 0.46, z); gun.add(glass);
    }
    part(THREE, gun, [0.12, 0.13, 0.32], [0, 0.33, 0.35], graphite);
    part(THREE, gun, [0.24, 0.17, 0.37], [0, 0.03, -0.46], polymer);
    magazine.scale.set(0.82, 0.76, 0.85);
    opticRing.visible = false; redDot.visible = false;
  } else if (profile.id === 'sentinel') {
    gun.scale.set(1.20, 1.04, 1.13);
    magazine.scale.set(1.9, 1.05, 1.9);
    part(THREE, gun, [0.31, 0.25, 0.49], [0, 0.06, 0.77], graphite);
    part(THREE, gun, [0.29, 0.16, 0.33], [0, 0.07, -0.43], polymer);
    for (const x of [-0.13, 0.13]) {
      part(THREE, gun, [0.035, 0.40, 0.035], [x, -0.16, 1.23], black, [x < 0 ? 0.28 : -0.28, 0, 0]);
    }
    for (let i = 0; i < 6; i += 1) part(THREE, gun, [0.025, 0.038, 0.038], [0.17, -0.08, 0.05 + i * 0.06], brass);
    opticRing.visible = false; redDot.visible = false;
  }

  const gloveMat = new THREE.MeshStandardMaterial({ color: 0x101613, roughness: 0.92 });
  const sleeveMat = new THREE.MeshStandardMaterial({ color: 0x2b3932, roughness: 0.96 });
  const up = new THREE.Vector3(0, 1, 0);
  const addArm = (from, to) => {
    const arm = new THREE.Mesh(new THREE.CapsuleGeometry(0.075, 0.74, 4, 8), sleeveMat);
    const delta = new THREE.Vector3().subVectors(to, from);
    arm.position.copy(from).add(to).multiplyScalar(0.5);
    arm.scale.y = delta.length();
    arm.quaternion.setFromUnitVectors(up, delta.normalize());
    root.add(arm);
    const glove = new THREE.Mesh(new THREE.SphereGeometry(0.072, 9, 7), gloveMat);
    glove.position.copy(to);
    root.add(glove);
    return { arm, glove };
  };
  const rightArm = addArm(new THREE.Vector3(0.34, -0.74, -0.24), new THREE.Vector3(0.10, -0.18, -0.02));
  const leftArm = addArm(new THREE.Vector3(-0.36, -0.68, 0.40), new THREE.Vector3(-0.13, -0.08, 0.68));
  root.userData.parts = { gun, magazine, flash, bolt, rightArm, leftArm, reloadShell };
  root.userData.muzzle = flash;
  return root;
}
