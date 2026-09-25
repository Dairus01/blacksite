export default function generate(THREE) {
  const g = new THREE.Group();
  const dark = new THREE.MeshStandardMaterial({ color: 0x171d22, roughness: 0.42, metalness: 0.7 });
  const glow = new THREE.MeshStandardMaterial({ color: 0x55d9d0, emissive: 0x1daaa5, emissiveIntensity: 3.2, roughness: 0.22 });
  const core = new THREE.Mesh(new THREE.OctahedronGeometry(0.20, 1), glow);
  core.position.y = 0.50;
  core.name = 'intelCore';
  g.add(core);
  for (const y of [0.16, 0.84]) {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.29, 0.035, 8, 20), dark);
    ring.rotation.x = Math.PI / 2;
    ring.position.y = y;
    g.add(ring);
  }
  for (let i = 0; i < 4; i += 1) {
    const a = i * Math.PI / 2;
    const rail = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.66, 0.045, 2, 3, 2), dark);
    rail.position.set(Math.cos(a) * 0.25, 0.50, Math.sin(a) * 0.25);
    g.add(rail);
  }
  g.userData.core = core;
  const box = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((node) => {
    const p = node.isMesh && node.geometry.attributes.position;
    if (!p) return;
    for (let i = 0; i < p.count; i += 1) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(node.matrixWorld));
  });
  const center = box.getCenter(new THREE.Vector3());
  g.children.forEach((node) => node.position.add(new THREE.Vector3(-center.x, -box.min.y, -center.z)));
  return g;
}
