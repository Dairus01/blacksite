export default function generate(THREE) {
  const g = new THREE.Group();
  const steel = new THREE.MeshStandardMaterial({ color: 0x171d22, roughness: 0.4, metalness: 0.76 });
  const glow = new THREE.MeshStandardMaterial({ color: 0x9eb1b2, emissive: 0x73aeb8, emissiveIntensity: 0.72, roughness: 0.38 });
  const hood = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.24, 0.22, 14, 2, true), steel);
  hood.position.y = 0.68;
  g.add(hood);
  const lamp = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.08, 14), glow);
  lamp.position.y = 0.53;
  g.add(lamp);
  const ribs = new THREE.InstancedMesh(new THREE.BoxGeometry(0.025, 0.34, 0.025, 2, 3, 2), steel, 8);
  const matrix = new THREE.Matrix4();
  const quaternion = new THREE.Quaternion();
  for (let i = 0; i < 8; i += 1) {
    const a = i * Math.PI / 4;
    quaternion.setFromEuler(new THREE.Euler(0, a, Math.sin(a) * 0.2));
    matrix.compose(new THREE.Vector3(Math.cos(a) * 0.25, 0.43, Math.sin(a) * 0.25), quaternion, new THREE.Vector3(1, 1, 1));
    ribs.setMatrixAt(i, matrix);
  }
  g.add(ribs);
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.42, 10), steel);
  stem.position.y = 1.0;
  g.add(stem);
  g.userData.mounts = 'top';
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
