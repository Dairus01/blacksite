export default function generate(THREE) {
  const root = new THREE.Group();
  const concrete = new THREE.MeshStandardMaterial({ color: 0x566168, roughness: 0.92 });
  const steel = new THREE.MeshStandardMaterial({ color: 0x151d21, roughness: 0.45, metalness: 0.7 });
  const glass = new THREE.MeshStandardMaterial({ color: 0x19353d, emissive: 0x19353d, emissiveIntensity: 0.55, roughness: 0.16, metalness: 0.28 });
  const add = (size, pos, mat) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(...size, 2, 2, 2), mat);
    m.position.set(...pos);
    root.add(m);
  };
  add([3.0, 0.18, 2.6], [0, 0.09, 0], concrete);
  add([3.2, 0.22, 2.8], [0, 2.65, 0], steel);
  for (const x of [-1.42, 1.42]) add([0.18, 2.5, 2.5], [x, 1.3, 0], concrete);
  add([2.7, 2.5, 0.18], [0, 1.3, -1.2], concrete);
  add([0.65, 2.5, 0.18], [-1.02, 1.3, 1.2], concrete);
  add([0.65, 2.5, 0.18], [1.02, 1.3, 1.2], concrete);
  add([1.42, 0.65, 0.18], [0, 0.34, 1.2], concrete);
  add([1.42, 0.38, 0.18], [0, 2.31, 1.2], concrete);
  add([1.40, 1.30, 0.07], [0, 1.45, 1.11], glass);
  for (const x of [-0.73, 0.73]) add([0.08, 1.45, 0.32], [x, 1.45, 1.16], steel);
  return root;
}
