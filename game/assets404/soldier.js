function box(THREE, parent, size, position, material, name = '') {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size, 2, 2, 2), material);
  mesh.position.set(...position);
  mesh.name = name;
  parent.add(mesh);
  return mesh;
}

function segment(THREE, radius, material, name = 'body_hit') {
  const mesh = new THREE.Mesh(new THREE.CapsuleGeometry(radius, 0.74, 4, 8), material);
  mesh.name = name;
  return mesh;
}

export default function generate(THREE, options = {}) {
  const root = new THREE.Group();
  root.name = 'blacksiteAssault';
  const cloth = new THREE.MeshStandardMaterial({ color: options.cloth ?? 0x17231f, roughness: 0.92, metalness: 0.02 });
  const armor = new THREE.MeshStandardMaterial({ color: options.armor ?? 0x405248, roughness: 0.58, metalness: 0.20 });
  const armorEdge = new THREE.MeshStandardMaterial({ color: 0x687568, roughness: 0.52, metalness: 0.20 });
  const webbing = new THREE.MeshStandardMaterial({ color: 0x0b1111, roughness: 0.78, metalness: 0.12 });
  const boot = new THREE.MeshStandardMaterial({ color: 0x060909, roughness: 0.72, metalness: 0.20 });
  const steel = new THREE.MeshStandardMaterial({ color: 0x151d20, roughness: 0.34, metalness: 0.74 });
  const lens = new THREE.MeshStandardMaterial({ color: 0x171718, roughness: 0.37, metalness: 0.04 });
  const skin = new THREE.MeshStandardMaterial({ color: 0x735241, roughness: 0.94 });
  const skinShade = new THREE.MeshStandardMaterial({ color: 0x543729, roughness: 0.97 });
  const insignia = new THREE.MeshStandardMaterial({ color: options.armor === 0x993e31 ? 0xd8917b : 0x9b4c3d, roughness: 0.78 });

  const pelvis = box(THREE, root, [0.42, 0.23, 0.27], [0, 0.91, 0], webbing, 'body_hit');
  const body = new THREE.Group();
  body.position.y = 1.04;
  root.add(body);
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.23, 0.30, 4, 10), cloth);
  torso.scale.set(1.13, 1, 0.78);
  torso.position.y = 0.28;
  torso.name = 'body_hit';
  body.add(torso);
  const plate = box(THREE, body, [0.48, 0.43, 0.115], [0, 0.28, 0.205], armor, 'body_hit');
  box(THREE, body, [0.34, 0.055, 0.025], [0, 0.45, 0.272], armorEdge);
  box(THREE, body, [0.38, 0.47, 0.18], [0, 0.28, -0.22], webbing, 'body_hit');
  for (const x of [-0.15, 0, 0.15]) box(THREE, body, [0.12, 0.16, 0.09], [x, 0.02, 0.245], webbing, 'body_hit');
  for (const x of [-0.22, 0.22]) box(THREE, body, [0.08, 0.23, 0.10], [x, 0.12, 0.235], armorEdge, 'body_hit');

  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.13, 9), skin);
  neck.position.set(0, 0.69, 0);
  body.add(neck);
  const head = new THREE.Group();
  head.position.set(0, 0.81, 0);
  body.add(head);
  const face = new THREE.Mesh(new THREE.CapsuleGeometry(0.14, 0.09, 4, 10), skin);
  face.scale.z = 0.88;
  face.name = 'head_hit';
  head.add(face);
  const helmet = new THREE.Mesh(new THREE.SphereGeometry(0.205, 14, 9, 0, Math.PI * 2, 0, Math.PI * 0.69), armor);
  helmet.scale.set(1, 0.84, 1.06);
  helmet.position.y = 0.07;
  helmet.name = 'head_hit';
  head.add(helmet);
  box(THREE, head, [0.39, 0.055, 0.22], [0, -0.005, 0.025], webbing, 'head_hit');
  for (const side of [-1, 1]) {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.024, 9, 7), lens);
    eye.position.set(side * 0.065, -0.008, 0.133);
    head.add(eye);
    box(THREE, head, [0.08, 0.018, 0.025], [side * 0.064, 0.032, 0.137], skinShade);
    const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.064, 9, 7), skin);
    cheek.scale.set(0.85, 0.56, 0.43);
    cheek.position.set(side * 0.079, -0.083, 0.123);
    head.add(cheek);
  }
  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.038, 10, 8), skin);
  nose.scale.set(0.72, 1.2, 1.15);
  nose.position.set(0, -0.060, 0.169);
  head.add(nose);
  const mouth = box(THREE, head, [0.085, 0.013, 0.014], [0, -0.142, 0.140], skinShade, 'head_hit');
  mouth.rotation.x = -0.08;
  for (const side of [-1, 1]) {
    const ear = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.052, 0.045, 9), webbing);
    ear.rotation.z = Math.PI / 2;
    ear.position.set(side * 0.19, -0.015, 0);
    head.add(ear);
  }

  const limbs = {
    leftUpperArm: segment(THREE, 0.092, cloth),
    leftForearm: segment(THREE, 0.078, cloth),
    rightUpperArm: segment(THREE, 0.092, cloth),
    rightForearm: segment(THREE, 0.078, cloth),
    leftThigh: segment(THREE, 0.115, cloth),
    leftShin: segment(THREE, 0.10, cloth),
    rightThigh: segment(THREE, 0.115, cloth),
    rightShin: segment(THREE, 0.10, cloth),
  };
  Object.values(limbs).forEach((mesh) => root.add(mesh));
  const pads = {
    leftShoulder: new THREE.Mesh(new THREE.SphereGeometry(0.14, 9, 7), armor),
    rightShoulder: new THREE.Mesh(new THREE.SphereGeometry(0.14, 9, 7), armor),
    leftKnee: box(THREE, root, [0.20, 0.13, 0.12], [0, 0, 0], armor, 'body_hit'),
    rightKnee: box(THREE, root, [0.20, 0.13, 0.12], [0, 0, 0], armor, 'body_hit'),
  };
  pads.leftShoulder.name = 'body_hit';
  pads.rightShoulder.name = 'body_hit';
  root.add(pads.leftShoulder, pads.rightShoulder);
  const patch = new THREE.Mesh(new THREE.PlaneGeometry(0.09, 0.11), insignia);
  patch.rotation.y = -Math.PI / 2;
  patch.position.set(-0.449, 1.43, 0.015);
  root.add(patch);
  const hands = {
    left: new THREE.Mesh(new THREE.SphereGeometry(0.085, 9, 7), boot),
    right: new THREE.Mesh(new THREE.SphereGeometry(0.085, 9, 7), boot),
  };
  hands.left.name = 'body_hit';
  hands.right.name = 'body_hit';
  root.add(hands.left, hands.right);
  const boots = {
    left: box(THREE, root, [0.22, 0.17, 0.35], [0, 0, 0], boot, 'body_hit'),
    right: box(THREE, root, [0.22, 0.17, 0.35], [0, 0, 0], boot, 'body_hit'),
  };

  const rifle = new THREE.Group();
  rifle.name = 'enemyRifle';
  root.add(rifle);
  box(THREE, rifle, [0.16, 0.18, 0.52], [0, 0, 0], steel, 'body_hit');
  box(THREE, rifle, [0.15, 0.17, 0.27], [0, 0, -0.34], webbing, 'body_hit');
  const mag = box(THREE, rifle, [0.115, 0.27, 0.16], [0, -0.18, 0.08], webbing, 'body_hit');
  mag.rotation.x = -0.18;
  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.56, 10), steel);
  barrel.rotation.x = Math.PI / 2;
  barrel.position.z = 0.52;
  rifle.add(barrel);
  box(THREE, rifle, [0.05, 0.10, 0.05], [0, 0.13, 0.20], armorEdge);
  const muzzle = new THREE.Object3D();
  muzzle.position.set(0, 0, 0.84);
  rifle.add(muzzle);

  const up = new THREE.Vector3(0, 1, 0);
  const midpoint = new THREE.Vector3();
  const delta = new THREE.Vector3();
  const placeSegment = (mesh, a, b) => {
    midpoint.copy(a).add(b).multiplyScalar(0.5);
    delta.subVectors(b, a);
    mesh.position.copy(midpoint);
    mesh.scale.set(1, delta.length(), 1);
    mesh.quaternion.setFromUnitVectors(up, delta.normalize());
  };
  const v = (x, y, z) => new THREE.Vector3(x, y, z);
  const pose = (mode = 'idle', time = 0, hit = 0, recoil = 0, motion = 0) => {
    const stride = Math.min(1, Math.max(0, motion));
    const walk = Math.sin(time * (7 + stride * 2)) * 0.32 * stride;
    const alert = mode === 'alert';
    const shoulderL = v(-0.32, 1.49, 0.01);
    const shoulderR = v(0.32, 1.49, 0.01);
    const elbowL = alert ? v(-0.29, 1.27, 0.25) : v(-0.38, 1.19, 0.08);
    const elbowR = alert ? v(0.27, 1.31, 0.19) : v(0.38, 1.18, 0.07);
    const handL = alert ? v(-0.11, 1.25, 0.53) : v(-0.14, 1.03, 0.28);
    const handR = alert ? v(0.10, 1.22, 0.38) : v(0.13, 1.02, 0.24);
    placeSegment(limbs.leftUpperArm, shoulderL, elbowL);
    placeSegment(limbs.leftForearm, elbowL, handL);
    placeSegment(limbs.rightUpperArm, shoulderR, elbowR);
    placeSegment(limbs.rightForearm, elbowR, handR);
    pads.leftShoulder.position.copy(shoulderL);
    pads.rightShoulder.position.copy(shoulderR);
    pads.leftShoulder.scale.set(1, 0.72, 0.92);
    pads.rightShoulder.scale.set(1, 0.72, 0.92);
    hands.left.position.copy(handL);
    hands.right.position.copy(handR);

    const hipL = v(-0.15, 0.82, 0);
    const hipR = v(0.15, 0.82, 0);
    const kneeL = v(-0.15, 0.47 + Math.max(0, -walk) * 0.13, walk * 0.55 + Math.max(0, -walk) * 0.32);
    const kneeR = v(0.15, 0.47 + Math.max(0, walk) * 0.13, -walk * 0.55 + Math.max(0, walk) * 0.32);
    const ankleL = v(-0.15, 0.13 + Math.max(0, -walk) * 0.10, -walk);
    const ankleR = v(0.15, 0.13 + Math.max(0, walk) * 0.10, walk);
    placeSegment(limbs.leftThigh, hipL, kneeL);
    placeSegment(limbs.leftShin, kneeL, ankleL);
    placeSegment(limbs.rightThigh, hipR, kneeR);
    placeSegment(limbs.rightShin, kneeR, ankleR);
    pads.leftKnee.position.copy(kneeL).add(v(0, 0, 0.075));
    pads.rightKnee.position.copy(kneeR).add(v(0, 0, 0.075));
    boots.left.position.copy(ankleL).add(v(0, -0.06, 0.08));
    boots.right.position.copy(ankleR).add(v(0, -0.06, 0.08));
    rifle.position.set(0, alert ? 1.27 : 1.04, alert ? 0.42 : 0.30);
    rifle.rotation.set(alert ? -0.03 + recoil * 0.12 : 0.28, 0, alert ? -0.015 : 0.03);
    body.rotation.x = hit > 0 ? 0.11 : -0.02 - stride * 0.045;
    body.rotation.z = hit > 0 ? -0.07 : 0;
    head.rotation.z = hit > 0 ? 0.10 : 0;
    plate.position.z = 0.205;
  };
  pose('idle', 0, 0, 0);
  root.userData.pose = pose;
  root.userData.joints = { body, head, rifle, muzzle };
  root.userData.materials = { cloth, armor, armorEdge, webbing, steel, lens };
  return root;
}
