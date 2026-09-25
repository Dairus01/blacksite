export default function generate(THREE) {
  const g = new THREE.Group();
  const concrete = new THREE.MeshStandardMaterial({ color: 0x697078, roughness: 0.92, metalness: 0.02 });
  const steel = new THREE.MeshStandardMaterial({ color: 0x171d22, roughness: 0.46, metalness: 0.68 });
  const amber = new THREE.MeshStandardMaterial({ color: 0xffb23e, roughness: 0.52, metalness: 0.22 });
  const base = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.18, 0.72, 4, 1, 2), concrete);
  base.position.y = 0.09;
  g.add(base);
  const body = new THREE.Mesh(new THREE.BoxGeometry(1.78, 0.72, 0.45, 6, 3, 2), concrete);
  body.position.y = 0.52;
  g.add(body);
  for (const x of [-0.88, 0.88]) {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.10, 0.96, 0.10, 2, 3, 2), steel);
    post.position.set(x, 0.48, 0);
    g.add(post);
  }
  for (const x of [-0.55, 0, 0.55]) {
    const band = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.07, 0.48), amber);
    band.position.set(x, 0.68, 0);
    g.add(band);
  }
  return g;
}
