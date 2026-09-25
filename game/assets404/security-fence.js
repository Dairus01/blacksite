export default function generate(THREE, width = 4) {
  const root = new THREE.Group();
  const steel = new THREE.MeshStandardMaterial({ color: 0x20292e, roughness: 0.52, metalness: 0.68 });
  const wire = new THREE.MeshStandardMaterial({ color: 0x7b898b, roughness: 0.58, metalness: 0.62 });
  const matrix = new THREE.Matrix4();
  const posts = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.055, 0.065, 2.7, 8), steel, 3);
  [-width / 2, 0, width / 2].forEach((x, index) => posts.setMatrixAt(index, matrix.makeTranslation(x, 1.35, 0)));
  root.add(posts);

  const verticalCount = Math.floor((width - 0.36) / 0.26) + 1;
  const verticals = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.009, 0.009, 2.32, 5), wire, verticalCount);
  for (let i = 0; i < verticalCount; i += 1) {
    verticals.setMatrixAt(i, matrix.makeTranslation(-width / 2 + 0.18 + i * 0.26, 1.28, 0));
  }
  root.add(verticals);

  const horizontalCount = 9;
  const horizontals = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.009, 0.009, width, 5), wire, horizontalCount);
  const rotation = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, 0, Math.PI / 2));
  for (let i = 0; i < horizontalCount; i += 1) {
    matrix.compose(new THREE.Vector3(0, 0.14 + i * 0.26, 0), rotation, new THREE.Vector3(1, 1, 1));
    horizontals.setMatrixAt(i, matrix);
  }
  root.add(horizontals);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.028, width, 7), steel);
  top.rotation.z = Math.PI / 2;
  top.position.y = 2.62;
  root.add(top);
  return root;
}
