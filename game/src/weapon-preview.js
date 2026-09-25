import makeRifle from '../assets404/rifle.js';
import {weaponById} from './arsenal.js';

const cache=new Map();
// Render the same procedural model used in play, only when the arsenal opens.
export function populateWeaponPreviews(container,T){
 const pending=[...container.querySelectorAll('[data-weapon]')];
 if(!pending.length)return;
 let renderer;
 for(const image of pending){
  const id=image.dataset.weapon;
  if(!cache.has(id)){
   renderer??=new T.WebGLRenderer({antialias:true,alpha:true});renderer.setSize(360,160);renderer.setPixelRatio(1);
   const scene=new T.Scene(),model=makeRifle(T,weaponById(id));
   // Hands belong in the first-person presentation, not the inventory photograph.
   for(const child of [...model.children])if(child!==model.userData.parts.gun)model.remove(child);
   scene.add(model,new T.HemisphereLight(0xe5f5ff,0x5e5042,3));
   const key=new T.DirectionalLight(0xffead0,4);key.position.set(2,4,3);scene.add(key);
   const bounds=new T.Box3().setFromObject(model),center=bounds.getCenter(new T.Vector3()),size=bounds.getSize(new T.Vector3());
   const camera=new T.PerspectiveCamera(30,360/160,.01,20);camera.position.copy(center).add(new T.Vector3(Math.max(size.z,1)*1.2,.55,.35));camera.lookAt(center);
   renderer.render(scene,camera);cache.set(id,renderer.domElement.toDataURL('image/webp'));
   const geometries=new Set(),materials=new Set();model.traverse(o=>{if(o.geometry)geometries.add(o.geometry);if(o.material)materials.add(o.material);});
   for(const g of geometries)g.dispose();for(const m of materials)m.dispose();
  }
  image.src=cache.get(id);
 }
 renderer?.dispose();renderer?.forceContextLoss();
}
