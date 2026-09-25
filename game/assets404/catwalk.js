export default function generate(THREE) {
  const g = new THREE.Group();
  const steel = new THREE.MeshStandardMaterial({ color: 0x303b42, roughness: 0.48, metalness: 0.68 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x171d22, roughness: 0.52, metalness: 0.62 });
  const copper = new THREE.MeshStandardMaterial({ color: 0x8f5a3c, roughness: 0.46, metalness: 0.62 });
  const deck = new THREE.Mesh(new THREE.BoxGeometry(4.0, 0.18, 1.8, 8, 1, 4), steel);
  deck.position.y = 0.09;
  g.add(deck);
  for (let i = -4; i <= 4; i += 1) {
    const slat = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.025, 1.68), dark);
    slat.position.set(i * 0.44, 0.195, 0);
    g.add(slat);
  }
  for (const z of [-0.84, 0.84]) {
    for (const x of [-1.9, -0.95, 0, 0.95, 1.9]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, 0.82, 8), copper);
      post.position.set(x, 0.58, z);
      g.add(post);
    }
    for (const y of [0.50, 0.90]) {
      const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.024, 0.024, 3.84, 8), copper);
      rail.rotation.z = Math.PI / 2;
      rail.position.set(0, y, z);
      g.add(rail);
    }
  }
  return g;
}
