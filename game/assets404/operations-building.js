import makeStairs, { STAIR_SPEC } from './stairs.js';
import makeLight from './light-fixture.js';
import { makeSurfaceTexture } from './surface-texture.js';

function mesh(THREE, group, size, position, material, name = '') {
  const item = new THREE.Mesh(new THREE.BoxGeometry(...size, 2, 2, 2), material);
  item.position.set(...position);
  item.name = name;
  group.add(item);
  return item;
}

export default function generate(THREE) {
  const root = new THREE.Group();
  root.name = 'operationsBuilding';
  const concreteMap = makeSurfaceTexture(THREE, 'concrete');
  const concrete = new THREE.MeshStandardMaterial({ color: 0xb3bab9, map: concreteMap, roughness: 0.94, metalness: 0.01 });
  const concreteDark = new THREE.MeshStandardMaterial({ color: 0x737d80, map: concreteMap, roughness: 0.92, metalness: 0.03 });
  const steel = new THREE.MeshStandardMaterial({ color: 0x11181d, roughness: 0.43, metalness: 0.72 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x17313a, emissive: 0x17313a, emissiveIntensity: 0.42, roughness: 0.18, metalness: 0.35 });
  const amber = new THREE.MeshStandardMaterial({ color: 0xc47c2d, emissive: 0x6e3511, emissiveIntensity: 0.45, roughness: 0.55, metalness: 0.28 });
  const inset = new THREE.MeshStandardMaterial({ color: 0x344248, roughness: 0.70, metalness: 0.34 });

  mesh(THREE, root, [11.0, 0.22, 15.0], [0, -0.11, 0], concreteDark, 'floor');
  mesh(THREE, root, [0.34, 4.2, 15.0], [-5.33, 2.1, 0], concrete, 'wall');
  mesh(THREE, root, [0.34, 4.2, 15.0], [5.33, 2.1, 0], concrete, 'wall');
  mesh(THREE, root, [11.0, 4.2, 0.34], [0, 2.1, -7.33], concrete, 'wall');
  // Front wall has a proper recessed doorway and two observation windows.
  mesh(THREE, root, [3.9, 4.2, 0.34], [-3.55, 2.1, 7.33], concrete, 'wall');
  mesh(THREE, root, [3.9, 4.2, 0.34], [3.55, 2.1, 7.33], concrete, 'wall');
  mesh(THREE, root, [3.2, 1.0, 0.34], [0, 3.7, 7.33], concrete, 'wall');
  for (const x of [-1.62, 1.62]) mesh(THREE, root, [0.18, 3.25, 0.58], [x, 1.62, 7.18], steel);
  mesh(THREE, root, [3.42, 0.18, 0.58], [0, 3.22, 7.18], steel);
  for (const x of [-3.55, 3.55]) {
    mesh(THREE, root, [2.15, 1.25, 0.08], [x, 2.25, 7.13], glass);
    for (const dx of [-1.12, 1.12]) mesh(THREE, root, [0.09, 1.52, 0.52], [x + dx, 2.25, 7.18], steel);
    mesh(THREE, root, [2.42, 0.09, 0.52], [x, 1.53, 7.18], steel);
    mesh(THREE, root, [2.42, 0.09, 0.52], [x, 2.97, 7.18], steel);
  }
  // Deep canopy, roof lip, columns, and service conduits add exterior hierarchy.
  mesh(THREE, root, [4.6, 0.20, 1.6], [0, 3.35, 7.8], steel);
  for (const x of [-2.05, 2.05]) mesh(THREE, root, [0.18, 3.35, 0.18], [x, 1.68, 8.35], steel);
  mesh(THREE, root, [11.5, 0.28, 15.5], [0, 4.15, 0], steel);
  mesh(THREE, root, [11.9, 0.18, 0.55], [0, 4.30, 7.55], amber);

  // Shared façade kit: expansion joints, inset access panels, vents, and a layered threshold.
  const facadeJoints = new THREE.InstancedMesh(new THREE.BoxGeometry(0.055, 3.75, 0.055), steel, 6);
  [-5.0, -2.35, -1.82, 1.82, 2.35, 5.0].forEach((x, i) => facadeJoints.setMatrixAt(i, new THREE.Matrix4().makeTranslation(x, 2.08, 7.515)));
  root.add(facadeJoints);
  const accessPanels = new THREE.InstancedMesh(new THREE.BoxGeometry(1.45, 0.76, 0.075), inset, 2);
  const panelFrames = new THREE.InstancedMesh(new THREE.BoxGeometry(1.66, 0.92, 0.035), steel, 2);
  [-3.55, 3.55].forEach((x, i) => {
    panelFrames.setMatrixAt(i, new THREE.Matrix4().makeTranslation(x, 0.68, 7.525));
    accessPanels.setMatrixAt(i, new THREE.Matrix4().makeTranslation(x, 0.68, 7.57));
  });
  root.add(panelFrames, accessPanels);
  const louvers = new THREE.InstancedMesh(new THREE.BoxGeometry(1.08, 0.045, 0.075), amber, 10);
  for (let i = 0; i < 10; i += 1) {
    const side = i < 5 ? -1 : 1;
    louvers.setMatrixAt(i, new THREE.Matrix4().makeTranslation(side * 3.55, 0.49 + (i % 5) * 0.095, 7.62));
  }
  root.add(louvers);
  mesh(THREE, root, [3.55, 0.13, 0.82], [0, 0.065, 7.69], steel);
  for (const x of [-1.85, 1.85]) {
    const bollard = new THREE.Mesh(new THREE.CylinderGeometry(0.09, 0.11, 0.88, 10), amber);
    bollard.position.set(x, 0.44, 7.82);
    root.add(bollard);
  }
  const sideWindowZ = [5.2, 2.6, 0, -2.6, -5.2];
  const sideGlass = new THREE.InstancedMesh(new THREE.BoxGeometry(0.09, 1.35, 1.72), glass, 5);
  const sideVerticals = new THREE.InstancedMesh(new THREE.BoxGeometry(0.14, 1.62, 0.10), steel, 10);
  const sideHorizontals = new THREE.InstancedMesh(new THREE.BoxGeometry(0.14, 0.10, 1.92), steel, 10);
  const matrix = new THREE.Matrix4();
  sideWindowZ.forEach((z, i) => {
    sideGlass.setMatrixAt(i, matrix.makeTranslation(5.52, 2.25, z));
    sideVerticals.setMatrixAt(i * 2, matrix.makeTranslation(5.59, 2.25, z - 0.91));
    sideVerticals.setMatrixAt(i * 2 + 1, matrix.makeTranslation(5.59, 2.25, z + 0.91));
    sideHorizontals.setMatrixAt(i * 2, matrix.makeTranslation(5.59, 1.49, z));
    sideHorizontals.setMatrixAt(i * 2 + 1, matrix.makeTranslation(5.59, 3.01, z));
  });
  root.add(sideGlass, sideVerticals, sideHorizontals);
  for (const x of [-4.55, 4.55]) {
    const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 3.6, 10), steel);
    pipe.position.set(x, 2.0, -5.7);
    root.add(pipe);
  }

  // Interior corridor, service room, upper deck, and actual stepped staircase.
  mesh(THREE, root, [6.8, 3.4, 0.24], [1.7, 1.7, 1.1], concreteDark, 'wall');
  mesh(THREE, root, [1.7, 3.4, 0.24], [-4.45, 1.7, 1.1], concreteDark, 'wall');
  mesh(THREE, root, [1.4, 0.72, 0.24], [-3.0, 3.04, 1.1], concreteDark, 'wall');
  for (const x of [-3.75, -2.25]) mesh(THREE, root, [0.16, 3.25, 0.42], [x, 1.62, 1.1], steel);
  mesh(THREE, root, [4.5, 0.22, 6.0], [-2.85, STAIR_SPEC.count * STAIR_SPEC.rise - .11, -4.0], steel, 'upperFloor');
  const stairs = makeStairs(THREE);
  stairs.position.set(-3.05, 0, 0.92);
  root.add(stairs);

  // Modular acoustic/control panels and exposed services break up the corridor wall.
  const panels = new THREE.InstancedMesh(new THREE.BoxGeometry(1.62, 1.12, 0.07), steel, 3);
  const statusStrips = new THREE.InstancedMesh(new THREE.BoxGeometry(1.30, 0.06, 0.035), amber, 3);
  [-0.65, 1.30, 3.25].forEach((x, i) => {
    panels.setMatrixAt(i, matrix.makeTranslation(x, 1.82, 1.24));
    statusStrips.setMatrixAt(i, matrix.makeTranslation(x, 2.20, 1.285));
  });
  root.add(panels, statusStrips);
  const panelRibs = new THREE.InstancedMesh(new THREE.BoxGeometry(0.055, 0.78, 0.035), concrete, 15);
  let ribIndex = 0;
  for (const x of [-0.65, 1.30, 3.25]) {
    for (let i = -2; i <= 2; i += 1) panelRibs.setMatrixAt(ribIndex++, matrix.makeTranslation(x + i * 0.25, 1.72, 1.30));
  }
  root.add(panelRibs);
  mesh(THREE, root, [7.3, 0.16, 0.20], [1.45, 3.20, 1.26], steel);
  const floorSeams = new THREE.InstancedMesh(new THREE.BoxGeometry(10.0, 0.018, 0.035), steel, 7);
  for (let i = 0; i < 7; i += 1) floorSeams.setMatrixAt(i, matrix.makeTranslation(0, 0.018, 5.4 - i * 1.75));
  root.add(floorSeams);
  const conduit = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.035, 0.035, 6.8, 8), amber, 3);
  const conduitRotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, Math.PI / 2));
  [-0.45, 0, 0.45].forEach((z, i) => {
    matrix.compose(new THREE.Vector3(1.45, 3.28, z), conduitRotation, new THREE.Vector3(1, 1, 1));
    conduit.setMatrixAt(i, matrix);
  });
  root.add(conduit);
  const trayBrackets = new THREE.InstancedMesh(new THREE.BoxGeometry(0.10, 0.42, 1.18), steel, 5);
  for (let i = 0; i < 5; i += 1) trayBrackets.setMatrixAt(i, matrix.makeTranslation(-4.55 + i * 2.2, 3.18, -1.6));
  root.add(trayBrackets);

  // The stair landing terminates at a serviced rear wall instead of a blank plane.
  const rearFrames = new THREE.InstancedMesh(new THREE.BoxGeometry(2.45, 1.55, 0.055), steel, 3);
  const rearInsets = new THREE.InstancedMesh(new THREE.BoxGeometry(2.20, 1.30, 0.055), inset, 3);
  [-3.45, 0, 3.45].forEach((x, i) => {
    rearFrames.setMatrixAt(i, matrix.makeTranslation(x, 2.05, -7.145));
    rearInsets.setMatrixAt(i, matrix.makeTranslation(x, 2.05, -7.09));
  });
  root.add(rearFrames, rearInsets);
  const rearLouvers = new THREE.InstancedMesh(new THREE.BoxGeometry(1.72, 0.045, 0.035), amber, 12);
  let rearIndex = 0;
  for (const x of [-3.45, 0, 3.45]) {
    for (let i = 0; i < 4; i += 1) rearLouvers.setMatrixAt(rearIndex++, matrix.makeTranslation(x, 1.76 + i * 0.18, -7.02));
  }
  root.add(rearLouvers);

  // Consoles and rack banks make the room read as operations rather than a shell.
  for (const z of [-5.7, -4.6, -3.5]) {
    const rack = new THREE.Group();
    rack.position.set(3.9, 0, z);
    mesh(THREE, rack, [1.25, 2.05, 0.58], [0, 1.025, 0], steel);
    for (let i = 0; i < 5; i += 1) {
      mesh(THREE, rack, [0.98, 0.22, 0.035], [0, 0.35 + i * 0.34, 0.31], i === 2 ? glass : concreteDark);
    }
    root.add(rack);
  }
  const desk = new THREE.Group();
  desk.position.set(2.45, 0, 4.25);
  mesh(THREE, desk, [2.5, 0.12, 0.82], [0, 0.95, 0], steel);
  for (const x of [-1.05, 1.05]) mesh(THREE, desk, [0.12, 0.95, 0.65], [x, 0.475, 0], steel);
  for (const x of [-0.65, 0.65]) {
    const screen = mesh(THREE, desk, [0.72, 0.46, 0.06], [x, 1.30, -0.18], glass);
    screen.rotation.x = -0.13;
  }
  root.add(desk);
  for (const z of [5.0, 0.0, -5.3]) {
    const fixture = makeLight(THREE);
    fixture.position.set(0, 3.72, z);
    fixture.rotation.z = Math.PI;
    root.add(fixture);
    const practical = new THREE.PointLight(0xbdefff, 4.2, 6.5, 2);
    practical.position.set(0, 3.45, z);
    root.add(practical);
  }
  const entranceLight = new THREE.PointLight(0xffbd72, 5.5, 7, 2);
  entranceLight.position.set(0, 3.1, 6.2);
  root.add(entranceLight);

  root.userData.stairs = {
    x: -3.05,
    centerZ: 0.92,
    width: STAIR_SPEC.width,
    run: STAIR_SPEC.run,
    rise: STAIR_SPEC.rise,
    count: STAIR_SPEC.count,
  };
  return root;
}
