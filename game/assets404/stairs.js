export const STAIR_SPEC = Object.freeze({ count: 12, rise: 0.18, run: 0.32, width: 1.65 });

export default function generate(THREE) {
  const g = new THREE.Group();
  g.name = 'serviceStairs';
  const treadMat = new THREE.MeshStandardMaterial({ color: 0x3d484d, roughness: 0.60, metalness: 0.48 });
  const edgeMat = new THREE.MeshStandardMaterial({ color: 0xb5793f, roughness: 0.48, metalness: 0.50 });
  const frameMat = new THREE.MeshStandardMaterial({ color: 0x11171b, roughness: 0.46, metalness: 0.74 });
  const { count, rise, run, width } = STAIR_SPEC;
  const startZ = (count * run) / 2 - run / 2;
  const matrix = new THREE.Matrix4();
  const quaternion = new THREE.Quaternion();
  const scale = new THREE.Vector3();
  const steps = new THREE.InstancedMesh(new THREE.BoxGeometry(width, 1, run, 2, 1, 2), treadMat, count);
  const edges = new THREE.InstancedMesh(new THREE.BoxGeometry(width + 0.04, 0.035, 0.055), edgeMat, count);
  for (let i = 0; i < count; i += 1) {
    const height = (i + 1) * rise;
    matrix.compose(new THREE.Vector3(0, height / 2, startZ - i * run), quaternion, scale.set(1, height, 1));
    steps.setMatrixAt(i, matrix);
    edges.setMatrixAt(i, matrix.makeTranslation(0, height + 0.018, startZ - i * run + run / 2 - 0.027));
  }
  g.add(steps, edges);
  const totalRun = count * run;
  const totalRise = count * rise;
  const postGeometry = new THREE.CylinderGeometry(0.026, 0.026, 0.88, 8);
  const posts = new THREE.InstancedMesh(postGeometry, frameMat, 14);
  let postIndex = 0;
  for (const x of [-width / 2 - 0.06, width / 2 + 0.06]) {
    const stringer = new THREE.Mesh(new THREE.BoxGeometry(0.11, 0.16, totalRun + 0.18), frameMat);
    stringer.position.set(x, totalRise / 2 - 0.04, 0);
    stringer.rotation.x = -Math.atan2(totalRise, totalRun);
    g.add(stringer);
    for (let i = 0; i <= 6; i += 1) {
      const t = i / 6;
      posts.setMatrixAt(postIndex++, matrix.makeTranslation(x, t * totalRise + 0.48, startZ + run / 2 - t * totalRun));
    }
    const railLength = Math.hypot(totalRun, totalRise);
    const rail = new THREE.Mesh(new THREE.CylinderGeometry(0.032, 0.032, railLength, 9), edgeMat);
    rail.rotation.x = Math.PI / 2 + Math.atan2(totalRise, totalRun);
    rail.position.set(x, totalRise / 2 + 0.91, 0);
    g.add(rail);
  }
  g.add(posts);
  g.userData.spec = STAIR_SPEC;
  return g;
}
