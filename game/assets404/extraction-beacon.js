export default function generate(THREE) {
  const g = new THREE.Group();
  const dark = new THREE.MeshStandardMaterial({ color: 0x171d22, roughness: 0.44, metalness: 0.72 });
  const copper = new THREE.MeshStandardMaterial({ color: 0x8f5a3c, roughness: 0.48, metalness: 0.58 });
  const glow = new THREE.MeshStandardMaterial({ color: 0xffb23e, emissive: 0xff8a16, emissiveIntensity: 2.8, roughness: 0.3 });
  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.72, 0.88, 0.24, 12), dark);
  base.position.y = 0.12;
  g.add(base);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.56, 0.065, 8, 24), copper);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.29;
  g.add(ring);
  for (let i = 0; i < 6; i += 1) {
    const a = i * Math.PI / 3;
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.09, 1.65, 0.09, 2, 4, 2), dark);
    post.position.set(Math.cos(a) * 0.48, 1.08, Math.sin(a) * 0.48);
    post.rotation.y = -a;
    g.add(post);
  }
  const core = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.20, 1.25, 12), glow);
  core.position.y = 1.0;
  core.name = 'beaconCore';
  g.add(core);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(0.50, 0.38, 0.22, 12), dark);
  cap.position.y = 1.92;
  g.add(cap);
  g.userData.core = core;
  return g;
}
