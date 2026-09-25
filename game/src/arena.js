import makeCrate from '../assets404/crate.js';
import makeBarrier from '../assets404/barrier.js';
import makeLight from '../assets404/light-fixture.js';
import makeBeacon from '../assets404/extraction-beacon.js';
import makeBuilding from '../assets404/operations-building.js';
import makeFence from '../assets404/security-fence.js';
import makeBooth from '../assets404/guard-booth.js';
import { makeSurfaceTexture } from '../assets404/surface-texture.js';

function addBox(THREE, parent, size, position, material, rotationY = 0) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size, 2, 2, 2), material);
  mesh.position.set(...position);
  mesh.rotation.y = rotationY;
  parent.add(mesh);
  return mesh;
}

export function buildArena(THREE, scene) {
  const world = new THREE.Group();
  world.name = 'blacksiteVerticalSlice';
  scene.add(world);
  const colliders = [];
  const addCollider = (x, z, halfX, halfZ, vision = true) => colliders.push({ x, z, halfX, halfZ, vision });
  const asphalt = new THREE.MeshStandardMaterial({ color: 0x8d9493, map: makeSurfaceTexture(THREE, 'asphalt'), roughness: 0.98 });
  const concrete = new THREE.MeshStandardMaterial({ color: 0xa9afae, map: makeSurfaceTexture(THREE, 'concrete'), roughness: 0.96 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x10171b, roughness: 0.56, metalness: 0.48 });
  const steel = new THREE.MeshStandardMaterial({ color: 0x29343a, roughness: 0.52, metalness: 0.58 });
  const amber = new THREE.MeshStandardMaterial({ color: 0xb9742e, emissive: 0x4f2408, emissiveIntensity: 0.45, roughness: 0.62 });
  const red = new THREE.MeshStandardMaterial({ color: 0x74231e, emissive: 0x4a0d08, emissiveIntensity: 0.55, roughness: 0.62 });

  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(72, 20, 12),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        topColor: { value: new THREE.Color(0x102338) },
        horizonColor: { value: new THREE.Color(0x7b4038) },
        groundColor: { value: new THREE.Color(0x0b1219) },
      },
      vertexShader: 'varying vec3 vWorld; void main(){ vec4 w=modelMatrix*vec4(position,1.0); vWorld=w.xyz; gl_Position=projectionMatrix*viewMatrix*w; }',
      fragmentShader: 'uniform vec3 topColor; uniform vec3 horizonColor; uniform vec3 groundColor; varying vec3 vWorld; void main(){ float h=normalize(vWorld).y; vec3 c=mix(horizonColor,topColor,smoothstep(0.0,0.55,h)); c=mix(groundColor,c,smoothstep(-0.18,0.02,h)); gl_FragColor=vec4(c,1.0); }',
    }),
  );
  sky.name = 'proceduralDuskSky';
  world.add(sky);

  addBox(THREE, world, [32, 0.24, 44], [0, -0.12, 0], asphalt).receiveShadow = true;
  addBox(THREE, world, [7.2, 0.035, 43], [0, 0.02, 0], new THREE.MeshStandardMaterial({ color: 0x394143, roughness: 0.98 }));
  for (const x of [-3.7, 3.7]) addBox(THREE, world, [0.18, 0.045, 43], [x, 0.032, 0], amber);
  for (let z = -19; z <= 19; z += 4) addBox(THREE, world, [0.12, 0.05, 1.7], [0, 0.04, z], amber);
  for (const x of [-14.5, 14.5]) addBox(THREE, world, [2.5, 0.20, 44], [x, 0.02, 0], concrete);

  // Perimeter fence and open vehicle gate establish a believable first threshold.
  for (const [x, width] of [[-9, 12], [9, 12]]) {
    const fence = makeFence(THREE, width);
    fence.position.set(x, 0, 8.5);
    world.add(fence);
    addCollider(x, 8.5, width / 2, 0.12);
  }
  for (const x of [-2.15, 2.15]) {
    addBox(THREE, world, [0.38, 3.2, 0.55], [x, 1.6, 8.5], steel);
    addCollider(x, 8.5, 0.20, 0.30);
    const lamp = makeLight(THREE);
    lamp.position.set(x, 3.25, 8.5);
    lamp.rotation.z = Math.PI;
    world.add(lamp);
  }
  // A layered portal and road grates make the checkpoint read as a built threshold.
  addBox(THREE, world, [4.8, 0.28, 0.42], [0, 3.05, 8.5], dark);
  addBox(THREE, world, [3.9, 0.07, 0.46], [0, 2.86, 8.5], amber);
  const gateRibs = new THREE.InstancedMesh(new THREE.BoxGeometry(0.055, 0.62, 0.5), steel, 9);
  for (let i = 0; i < 9; i += 1) gateRibs.setMatrixAt(i, new THREE.Matrix4().makeTranslation(-1.8 + i * 0.45, 3.28, 8.5));
  world.add(gateRibs);
  const drainGrates = new THREE.InstancedMesh(new THREE.BoxGeometry(0.18, 0.035, 3.5), dark, 10);
  for (let i = 0; i < 10; i += 1) drainGrates.setMatrixAt(i, new THREE.Matrix4().makeTranslation(-1.72 + i * 0.38, 0.055, 10.0));
  world.add(drainGrates);
  const portalGlow = new THREE.PointLight(0xffa54d, 7, 7, 2);
  portalGlow.position.set(0, 2.65, 8.0);
  world.add(portalGlow);
  const gateLight = new THREE.PointLight(0xffc17a, 15, 10, 2);
  gateLight.position.set(0, 3.0, 7.6);
  world.add(gateLight);

  const booth = makeBooth(THREE);
  booth.position.set(5.1, 0, 10.5);
  booth.rotation.y = Math.PI;
  world.add(booth);
  addCollider(5.1, 10.5, 1.55, 1.35);
  const barrierArm = addBox(THREE, world, [3.4, 0.12, 0.12], [3.0, 1.0, 9.0], red, 0.12);
  barrierArm.name = 'checkpointArm';
  addBox(THREE, world, [0.24, 1.1, 0.24], [1.35, 0.55, 9.0], steel);

  const buildingPosition = new THREE.Vector3(-6.5, 0, -5);
  const building = makeBuilding(THREE);
  building.position.copy(buildingPosition);
  world.add(building);
  addCollider(-11.83, -5, 0.20, 7.5);
  addCollider(-1.17, -5, 0.20, 7.5);
  addCollider(-6.5, -12.33, 5.5, 0.20);
  addCollider(-10.05, 2.33, 1.95, 0.20);
  addCollider(-2.95, 2.33, 1.95, 0.20);
  addCollider(-6.5, 1.1 - 5, 3.4, 0.15);
  addCollider(-10.95, 1.1 - 5, 0.85, 0.15);
  for (const z of [-10.7, -9.6, -8.5]) addCollider(-2.6, z, 0.65, 0.34);
  addCollider(-4.05, -0.75, 1.3, 0.46);

  // Yard cover is composed into crossfire lanes instead of scattered randomly.
  const cover = [
    [4.4, 4.2, 0],
    [-0.2, -0.4, Math.PI / 2],
    [5.6, -7.5, Math.PI / 2],
  ];
  for (const [x, z, ry] of cover) {
    const barrier = makeBarrier(THREE);
    barrier.position.set(x, 0, z);
    barrier.rotation.y = ry;
    world.add(barrier);
    const turned = Math.abs(Math.sin(ry)) > 0.5;
    addCollider(x, z, turned ? 0.48 : 1.22, turned ? 1.22 : 0.48, false);
  }
  for (const [x, z, ry] of [[5.2, 1.1, 0.2], [10.3, -4.2, -0.08], [10.1, -9.2, 0.1]]) {
    const crate = makeCrate(THREE);
    crate.position.set(x, 0, z);
    crate.rotation.y = ry;
    crate.scale.set(1.3, 1.3, 1.3);
    world.add(crate);
    addCollider(x, z, 0.8, 0.70, false);
  }
  // Container massing creates a distinct security yard landmark.
  for (const [x, z, color] of [[10.1, 2.5, steel], [10.1, -2.0, dark]]) {
    addBox(THREE, world, [3.1, 2.65, 4.0], [x, 1.325, z], color);
    for (let i = -2; i <= 2; i += 1) addBox(THREE, world, [0.045, 2.38, 0.08], [x - 1.38 + i * 0.69, 1.35, z + 2.04], amber);
    addCollider(x, z, 1.62, 2.05);
  }

  // Sparse poles, tower silhouettes, and antennas build depth without expensive detail.
  for (const [x, z] of [[-14, 15], [13, 12], [13, -12], [-14, -16]]) {
    addBox(THREE, world, [0.18, 5.8, 0.18], [x, 2.9, z], steel);
    const fixture = makeLight(THREE);
    fixture.position.set(x, 5.75, z);
    fixture.rotation.z = Math.PI;
    world.add(fixture);
  }
  for (const [x, z, height] of [[-18, -19, 10], [17, -23, 13], [-20, 3, 7]]) {
    addBox(THREE, world, [1.2, height, 1.2], [x, height / 2, z], dark);
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.11, 5, 8), steel);
    mast.position.set(x, height + 2.5, z);
    world.add(mast);
  }

  const extraction = makeBeacon(THREE);
  extraction.position.set(7.6, 0, -15.6);
  extraction.traverse((node) => {
    if (node.material?.emissive) node.material.emissiveIntensity *= 0.12;
  });
  world.add(extraction);
  const extractionPad = new THREE.Mesh(new THREE.RingGeometry(1.6, 2.1, 24), new THREE.MeshBasicMaterial({ color: 0xffb23e, transparent: true, opacity: 0.10, side: THREE.DoubleSide }));
  extractionPad.rotation.x = -Math.PI / 2;
  extractionPad.position.set(7.6, 0.035, -15.6);
  world.add(extractionPad);
  const extractionLight = new THREE.PointLight(0xffa238, 0, 10, 2);
  extractionLight.position.set(7.6, 1.4, -15.6);
  world.add(extractionLight);

  const activateExtraction = () => {
    extraction.traverse((node) => { if (node.material?.emissive) node.material.emissiveIntensity = 3.0; });
    extractionLight.intensity = 28;
    extractionPad.material.opacity = 0.55;
  };
  const resetExtraction = () => {
    extraction.traverse((node) => { if (node.material?.emissive) node.material.emissiveIntensity = 0.34; });
    extractionLight.intensity = 0;
    extractionPad.material.opacity = 0.10;
  };

  const stair = building.userData.stairs;
  const stairX = buildingPosition.x + stair.x;
  const stairZ = buildingPosition.z + stair.centerZ;
  const stairHalfRun = stair.count * stair.run / 2;
  const floorHeightAt = (x, z) => {
    if (Math.abs(x - stairX) <= stair.width / 2 && z <= stairZ + stairHalfRun && z >= stairZ - stairHalfRun) {
      const fromBottom = stairZ + stairHalfRun - z;
      const step = Math.min(stair.count - 1, Math.max(0, Math.floor(fromBottom / stair.run)));
      return (step + 1) * stair.rise;
    }
    if (x >= buildingPosition.x - 5.1 && x <= buildingPosition.x - 0.6 && z >= buildingPosition.z - 7 && z <= buildingPosition.z - 1) {
      return stair.count * stair.rise;
    }
    return 0;
  };
  const blocked = (x, z, radius = 0.34) => {
    if (x < -15.4 + radius || x > 15.4 - radius || z < -21.4 + radius || z > 21.4 - radius) return true;
    return colliders.some((c) => Math.abs(x - c.x) < c.halfX + radius && Math.abs(z - c.z) < c.halfZ + radius);
  };
  const lineBlocked = (x1, z1, x2, z2) => {
    const steps = Math.max(4, Math.ceil(Math.hypot(x2 - x1, z2 - z1) * 2));
    for (let i = 1; i < steps; i += 1) {
      const t = i / steps;
      const x = x1 + (x2 - x1) * t;
      const z = z1 + (z2 - z1) * t;
      if (colliders.some((c) => c.vision && Math.abs(x - c.x) < c.halfX && Math.abs(z - c.z) < c.halfZ)) return true;
    }
    return false;
  };

  world.traverse((node) => {
    if (!node.isMesh) return;
    node.castShadow = false;
    node.receiveShadow = true;
  });
  return {
    world,
    building,
    extraction,
    extractionPosition: extraction.position,
    spawns: { player: [0, 16.5], enemy: [0, 5.6] },
    activateExtraction,
    resetExtraction,
    floorHeightAt,
    blocked,
    lineBlocked,
    stair: { x: stairX, z: stairZ, ...stair },
  };
}
