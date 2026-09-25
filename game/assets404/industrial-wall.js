export default function generate(THREE) {
  const g = new THREE.Group();
  const concrete = new THREE.MeshStandardMaterial({ color: 0x4f575d, roughness: 0.94, metalness: 0.01 });
  const frame = new THREE.MeshStandardMaterial({ color: 0x171d22, roughness: 0.45, metalness: 0.72 });
  const copper = new THREE.MeshStandardMaterial({ color: 0x8f5a3c, roughness: 0.54, metalness: 0.48 });
  const add = (size, pos, mat) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(...size, 4, 4, 2), mat);
    m.position.set(...pos);
    g.add(m);
  };
  add([3.76, 3.0, 0.22], [0, 1.50, 0], concrete);
  for (const x of [-1.94, 1.94]) add([0.12, 3.2, 0.34], [x, 1.60, 0], frame);
  for (const y of [0.10, 1.60, 3.10]) add([4.0, 0.10, 0.34], [0, y, 0], frame);
  for (const x of [-1.25, 0, 1.25]) add([0.05, 2.72, 0.25], [x, 1.55, 0.04], copper);
  const pipe = new THREE.Mesh(new THREE.CylinderGeometry(0.055, 0.055, 2.7, 10), copper);
  pipe.position.set(1.52, 1.55, 0.22);
  g.add(pipe);
  g.userData.mounts = 'back';
  return g;
}
