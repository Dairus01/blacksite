import makeCrate from '../assets404/crate.js';
import makeBarrier from '../assets404/barrier.js';
import makeStairs, { STAIR_SPEC } from '../assets404/stairs.js';
import makeBeacon from '../assets404/extraction-beacon.js';
import { makeSurfaceTexture } from '../assets404/surface-texture.js';

const THEMES = {
  'desert-comms': { ground: 0xad7860, wall: 0x694b3c, accent: 0xffbf69, sky: 0x704335, fog: 0x76503f, type: 'rock' },
  'frozen-outpost': { ground: 0x8b9da3, wall: 0x43555e, accent: 0x9be9ff, sky: 0x263d50, fog: 0x637984, type: 'grid' },
  'harbor-district': { ground: 0x687981, wall: 0x384e5a, accent: 0xf49b4c, sky: 0x10283a, fog: 0x263b48, type: 'port' },
};

export function buildVariantArena(THREE, scene, mapId) {
  const theme = THEMES[mapId] ?? THEMES['harbor-district'];
  const world = new THREE.Group();
  world.name = `arena-${mapId}`;
  scene.add(world);
  const colliders = [];
  const mat = (color, metalness = 0.1) => new THREE.MeshStandardMaterial({ color, roughness: 0.78, metalness });
  const ground = mat(theme.ground);
  ground.map = makeSurfaceTexture(THREE, mapId === 'desert-comms' ? 'concrete' : 'asphalt');
  const wall = mat(theme.wall, 0.35);
  const trim = mat(theme.accent, 0.55);
  const dark = mat(0x172125, 0.38);
  const add = (size, pos, material, collider = null) => {
    const object = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
    object.position.set(...pos);
    object.receiveShadow = true;
    world.add(object);
    if (collider) colliders.push({ x: pos[0], z: pos[2], hx: collider[0], hz: collider[1] });
    return object;
  };

  scene.background = new THREE.Color(theme.sky);
  scene.fog = new THREE.FogExp2(theme.fog, mapId === 'desert-comms' ? 0.012 : 0.016);
  add([40, 0.2, 50], [0, -0.1, 0], ground);
  for (const x of [-18, 18]) add([0.5, 3.0, 48], [x, 1.5, 0], wall, [0.25, 24]);
  for (const z of [-23, 23]) add([36, 3.0, 0.5], [0, 1.5, z], wall, [18, 0.25]);
  const path = add([5.8, 0.035, 45], [0, 0.025, 0], dark);
  path.material = mat(mapId === 'desert-comms' ? 0x554b42 : 0x354247);
  for (const x of [-3.1, 3.1]) add([0.075, 0.02, 43], [x, 0.07, 0], trim);

  // Each site uses an unmistakably different structural skyline and cover plan.
  if (theme.type === 'port') {
    for (const [x, z, length, color] of [[-10, 6, 5, 0x365262], [10, 2, 6, 0x79533d], [-11, -7, 6, 0x384950], [10, -11, 5, 0x3d6369]]) {
      const container = add([4, 2.8, length], [x, 1.4, z], mat(color, 0.48), [2.1, length / 2]);
      const ribs = new THREE.InstancedMesh(new THREE.BoxGeometry(0.045, 2.55, 0.13), dark, 10);
      for (let i = 0; i < 10; i += 1) ribs.setMatrixAt(i, new THREE.Matrix4().makeTranslation(x - 1.75 + i * 0.39, 1.4, z + length / 2 + 0.09));
      world.add(ribs);
      container.castShadow = true;
    }
    add([0.6, 9, 0.6], [-15, 4.5, -16], dark);
    add([10, 0.55, 0.6], [-10, 8.8, -16], trim);
    add([0.18, 3.2, 0.18], [-5.4, 7.2, -16], dark);
    const water = new THREE.Mesh(new THREE.PlaneGeometry(9, 41), new THREE.MeshStandardMaterial({ color: 0x193644, metalness: 0.43, roughness: 0.31 }));
    water.rotation.x = -Math.PI / 2; water.position.set(13.6, 0.02, 0); world.add(water);
  } else if (theme.type === 'rock') {
    for (const [x, z, scale] of [[-12, 8, 2.8], [11, 4, 3.5], [-12, -5, 4], [12, -12, 3.2], [-7, -18, 2.4]]) {
      const rock = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), mat(0x755647));
      rock.scale.set(scale, scale * 0.8, scale * 1.25);
      rock.position.set(x, scale * 0.37, z);
      rock.rotation.y = x * 0.09;
      world.add(rock);
      colliders.push({ x, z, hx: scale * 0.65, hz: scale * 0.65 });
    }
    add([8, 0.35, 2.1], [9, 2.5, -4], dark);
    for (const z of [-9, -3, 3, 9]) add([0.3, 4.3, 0.3], [7.6, 2.15, z], wall);
  } else {
    for (const x of [-12, -6, 6, 12]) {
      add([0.32, 6, 0.32], [x, 3, -9], dark);
      add([0.32, 6, 0.32], [x, 3, 4], dark);
      add([0.22, 0.22, 13], [x, 5.5, -2.5], trim);
    }
    for (const [x, z] of [[-10, -3], [10, -1], [-9, 10], [9, -12]]) {
      add([3.2, 2.1, 2.3], [x, 1.05, z], wall, [1.65, 1.2]);
      const coils = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.16, 0.16, 0.6, 12), trim, 4);
      for (let i = 0; i < 4; i += 1) coils.setMatrixAt(i, new THREE.Matrix4().makeTranslation(x - 1.1 + i * 0.7, 2.4, z));
      world.add(coils);
    }
  }

  const coverLayouts = {
    'desert-comms': [[-5, 10], [4.5, 7], [-4, 0], [5.5, -6], [-3, -13]],
    'frozen-outpost': [[-4, 11], [4, 7], [-3.9, 0], [4.5, -6], [-4.1, -13]],
    'harbor-district': [[-4.3, 10], [5.1, 6], [-4.5, -2], [4.8, -7], [-3.8, -13]],
  };
  for (const [x, z] of coverLayouts[mapId] ?? coverLayouts['harbor-district']) {
    const cover = mapId === 'desert-comms' ? makeCrate(THREE) : makeBarrier(THREE);
    cover.position.set(x, 0, z);
    world.add(cover);
    colliders.push({ x, z, hx: 1.2, hz: 0.6 });
  }

  // A real authored staircase and elevated objective platform on every map.
  const stairX = -6.4, stairZ = -9;
  const stairs = makeStairs(THREE);
  stairs.position.set(stairX, 0, stairZ);
  world.add(stairs);
  const deckHeight = STAIR_SPEC.count * STAIR_SPEC.rise;
  add([5.0, 0.22, 6.2], [stairX, deckHeight - 0.11, -14], dark);
  for (const x of [stairX - 2.35, stairX + 2.35]) add([0.09, 1.1, 6.2], [x, deckHeight + 0.45, -14], trim);
  const tower = add([4.8, 4.1, 3.6], [stairX, 2.05, -18], wall, [2.45, 1.85]);
  tower.castShadow = true;
  for (const x of [stairX - 1.1, stairX + 1.1]) add([0.65, 0.35, 0.08], [x, 2.5, -16.15], trim);

  const extraction = makeBeacon(THREE);
  extraction.position.set(7.5, 0, -17.5);
  world.add(extraction);
  const extractionLight = new THREE.PointLight(0xffaa50, 0, 8, 2);
  extractionLight.position.set(7.5, 1.2, -17.5);
  world.add(extractionLight);
  const pad = new THREE.Mesh(new THREE.RingGeometry(1.5, 2.0, 24), new THREE.MeshBasicMaterial({ color: 0xffae4c, transparent: true, opacity: 0.15, side: THREE.DoubleSide }));
  pad.rotation.x = -Math.PI / 2; pad.position.set(7.5, 0.035, -17.5); world.add(pad);
  const practicals = [[-13, 14], [13, 12], [-11, -12], [11, -14]];
  for (const [x, z] of practicals) {
    add([0.12, 5.2, 0.12], [x, 2.6, z], dark);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.13, 8, 6), new THREE.MeshBasicMaterial({ color: theme.accent }));
    bulb.position.set(x, 5.1, z); world.add(bulb);
    const light = new THREE.PointLight(theme.accent, 3.5, 8, 2);
    light.position.set(x, 5, z); world.add(light);
  }
  const floorHeightAt = (x, z) => {
    const half = STAIR_SPEC.count * STAIR_SPEC.run / 2;
    if (Math.abs(x - stairX) < STAIR_SPEC.width / 2 && z <= stairZ + half && z >= stairZ - half) {
      const step = Math.floor((stairZ + half - z) / STAIR_SPEC.run);
      return (Math.min(STAIR_SPEC.count - 1, Math.max(0, step)) + 1) * STAIR_SPEC.rise;
    }
    if (Math.abs(x - stairX) < 2.45 && z < -11 && z > -17) return deckHeight;
    return 0;
  };
  const blocked = (x, z, radius = 0.34) => x < -17.5 + radius || x > 17.5 - radius || z < -22.5 + radius || z > 22.5 - radius || colliders.some((c) => Math.abs(x - c.x) < c.hx + radius && Math.abs(z - c.z) < c.hz + radius);
  const lineBlocked = (x1, z1, x2, z2) => {
    const steps = Math.ceil(Math.hypot(x2 - x1, z2 - z1) * 2);
    for (let i = 1; i < steps; i += 1) {
      const x = x1 + (x2 - x1) * i / steps, z = z1 + (z2 - z1) * i / steps;
      if (colliders.some((c) => Math.abs(x - c.x) < c.hx && Math.abs(z - c.z) < c.hz)) return true;
    }
    return false;
  };
  return {
    world, building: tower, extraction, extractionPosition: extraction.position,
    spawns: { player: [0, 18], enemy: [0, 7], enemies: [[0, 7], [-5, 3], [5, 1], [-4, -6], [4, -8], [0, -12]] },
    stair: { x: stairX, z: stairZ, ...STAIR_SPEC }, floorHeightAt, blocked, lineBlocked,
    activateExtraction() { extractionLight.intensity = 18; pad.material.opacity = 0.7; },
    resetExtraction() { extractionLight.intensity = 0; pad.material.opacity = 0.15; },
  };
}
