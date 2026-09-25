export default function generate(THREE) {
  const g = new THREE.Group();
  const shell = new THREE.MeshStandardMaterial({ color: 0x303b42, roughness: 0.62, metalness: 0.42 });
  const frame = new THREE.MeshStandardMaterial({ color: 0x171d22, roughness: 0.48, metalness: 0.68 });
  const copper = new THREE.MeshStandardMaterial({ color: 0x8f5a3c, roughness: 0.5, metalness: 0.5 });
  const add = (size, pos, mat) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(...size, 2, 2, 2), mat);
    m.position.set(...pos);
    g.add(m);
  };
  add([1.00, 0.78, 0.82], [0, 0.42, 0], shell);
  for (const x of [-0.52, 0.52]) for (const z of [-0.43, 0.43]) add([0.09, 0.90, 0.09], [x, 0.45, z], frame);
  for (const y of [0.08, 0.82]) {
    add([1.12, 0.08, 0.08], [0, y, -0.44], frame);
    add([1.12, 0.08, 0.08], [0, y, 0.44], frame);
    add([0.08, 0.08, 0.90], [-0.54, y, 0], frame);
    add([0.08, 0.08, 0.90], [0.54, y, 0], frame);
  }
  for (const x of [-0.28, 0.28]) add([0.07, 0.58, 0.05], [x, 0.43, 0.43], copper);
  return g;
}
