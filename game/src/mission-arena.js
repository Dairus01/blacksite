import makeStairs,{STAIR_SPEC} from '../assets404/stairs.js';
import makeBeacon from '../assets404/extraction-beacon.js';
import {makeTerminal} from '../assets404/facility-detail.js';
import {makeSurfaceTexture} from '../assets404/surface-texture.js';
import {ROUTES} from './missions.js';
// Board 7: distinct process yard, partitioned command interior, radial underground core.
export function buildMissionArena(T,scene,id){
 const world=new T.Group();world.name=id;scene.add(world);const colliders=[],batches={};
 const indoor=id!=='refinery';
 const mat=(color,roughness=.7,metalness=.25)=>new T.MeshStandardMaterial({color,roughness,metalness});
 const materials={wall:mat(id==='refinery'?0x786451:0x495e68),dark:mat(0x17232c),steel:mat(0x61727a,.45,.7),floor:mat(0x53636c,.45),yellow:mat(0xb9a371),red:new T.MeshBasicMaterial({color:0xd5574c}),blue:new T.MeshBasicMaterial({color:0x72bfd6}),light:new T.MeshBasicMaterial({color:0xc9e0df})};
 materials.floor.map=makeSurfaceTexture(T,'concrete');materials.wall.map=makeSurfaceTexture(T,'concrete');
 const box=(size,pos,type='wall',solid=false)=>{(batches[type]??=[]).push(new T.Matrix4().compose(new T.Vector3(...pos),new T.Quaternion(),new T.Vector3(...size)));if(solid)colliders.push({x:pos[0],z:pos[2],hx:size[0]/2,hz:size[2]/2});};
 const cylinder=(r,h,pos,type='steel',solid=false)=>{const o=new T.Mesh(new T.CylinderGeometry(r,r,h,20),materials[type]);o.position.set(...pos);world.add(o);if(solid)colliders.push({x:pos[0],z:pos[2],hx:r,hz:r});return o;};
 const ring=(r,pos)=>{const o=new T.Mesh(new T.TorusGeometry(r,.06,6,24),materials.yellow);o.rotation.x=Math.PI/2;o.position.set(...pos);world.add(o);};
 scene.background=new T.Color(id==='refinery'?0x805b44:0x0c1a24);scene.fog=new T.FogExp2(id==='refinery'?0x805b44:0x1a303d,.013);
 box([36,.2,46],[0,-.1,0],'floor');
 for(const x of [-18,18])box([.5,indoor?6:2,46],[x,indoor?3:1,0],'wall',true);
 for(const z of [-23,23])box([36,indoor?6:2,.5],[0,indoor?3:1,z],'wall',true);
 if(indoor){box([36,.25,46],[0,6,0],'dark');for(let z=-20;z<22;z+=5){box([35,.25,.25],[0,5.7,z],'steel');for(const x of [-10,0,10]){box([2,.06,.3],[x,5.55,z],id==='lab'?'red':'light');const l=new T.PointLight(id==='lab'?0xf06b53:0xb9dbed,8,10,2);l.position.set(x,4.7,z);world.add(l);}}}
 if(id==='refinery'){
  for(const [x,z,r,h] of [[-12,9,2,7],[12,8,2.2,9],[-12,-9,2.3,11],[12,-14,2,8]]){cylinder(r,h,[x,h/2,z],'steel',true);for(let y=1;y<h;y+=2)ring(r+.1,[x,y,z]);box([.2,h,.2],[x+r+.25,h/2,z],'yellow');for(let y=.4;y<h;y+=.4)box([.7,.045,.06],[x+r+.25,y,z],'steel');}
  for(const z of [4,-6,-15]){box([.3,5,.3],[-7,2.5,z],'steel');box([.3,5,.3],[7,2.5,z],'steel');box([15,.3,.7],[0,5,z],'steel');for(const dz of [-.3,.3]){const pipe=cylinder(.14,14,[0,5.35,z+dz]);pipe.rotation.z=Math.PI/2;}}
  for(const [x,z] of [[-9,15],[8,0],[-10,-16]]){box([4,2.5,4],[x,1.25,z],'dark',true);for(let d=-1.8;d<2;d+=.3)box([.035,2.3,.06],[x+d,1.25,z+2.02],'steel');}
  box([.5,13,.5],[16,6.5,-19],'yellow');box([13,.45,.5],[10,12.7,-19],'yellow');box([.04,5,.04],[4,10,-19],'steel');
  for(const x of [-15,15])for(const z of [-18,0,18]){box([.1,5,.1],[x,2.5,z],'steel');box([1,.2,.3],[x,5,z],'light');}
 }else if(id==='command'){
  // Three floor zones connected by offset doorways and perimeter corridors.
  for(const z of [10,-7]){box([11,4,.3],[-12.5,2,z],'wall',true);box([10,4,.3],[1,2,z],'wall',true);box([6,4,.3],[15,2,z],'wall',true);}
  for(const x of [-6,7]){box([.3,4,6],[x,2,3],'wall',true);box([.3,4,7],[x,2,-16],'wall',true);}
  for(const [x,z] of [[11,3],[14,3],[11,-1],[14,-1],[-12,-12],[-12,-16]]){box([1.1,2.5,1],[x,1.25,z],'dark',true);for(let y=.25;y<2.4;y+=.3){box([.9,.16,.02],[x,y,z+.51],'steel');box([.14,.045,.023],[x+.3,y,z+.53],'blue');}}
  for(const [x,z] of [[-11,1],[-11,6],[0,-12],[3,-12]]){box([2.4,.15,1],[x,.9,z],'dark',true);box([.1,.9,.8],[x-1,.45,z],'steel');box([.1,.9,.8],[x+1,.45,z],'steel');box([1,.65,.1],[x,1.4,z-.3],'blue');}
  box([8,3,.15],[0,3,-22.6],'dark');for(const x of [-2.7,0,2.7])box([2.5,1.7,.17],[x,3,-22.48],'blue');
  box([4,.15,2],[0,.8,17],'dark',true);
 }else{
  // Core forces two flanking routes; outer rooms and access tunnels provide cover.
  cylinder(3.1,6,[0,3,-5],'dark',true);cylinder(2.6,5.5,[0,2.75,-5],'steel');
  for(const y of [.4,1.5,3.5,5.4])ring(3.25,[0,y,-5]);
  for(let i=0;i<12;i++){const a=i*Math.PI/6;box([.14,4.6,.14],[Math.cos(a)*3.18,2.9,-5+Math.sin(a)*3.18],i%3===0?'blue':'steel');}
  for(const x of [-8,8]){box([.3,4,8],[x,2,12],'wall',true);box([.3,4,8],[x,2,-16],'wall',true);}
  for(const [x,z] of [[-12,13],[12,13],[-13,-2],[13,-11]]){box([2.6,1.1,1.3],[x,.55,z],'steel',true);box([2.4,.05,1.1],[x,1.15,z],'light');}
  for(const z of [16,11,6]){box([14,.2,.3],[0,4,z],'steel');for(const x of [-6,6])box([.25,4,.25],[x,2,z],'steel');}
  box([6,4,.35],[0,2,-22.5],'steel');box([.1,3,.4],[0,1.5,-22.25],'red');
 }
 const stairX=id==='lab'?11:-4.5,stairZ=id==='lab'?0:-10;
 const stairs=makeStairs(T);stairs.position.set(stairX,0,stairZ);world.add(stairs);
 const top=STAIR_SPEC.count*STAIR_SPEC.rise,end=stairZ-STAIR_SPEC.count*STAIR_SPEC.run/2;
 box([4,.2,4],[stairX,top-.1,end-2],'steel');
 for(const x of [stairX-1.9,stairX+1.9]){box([.055,.06,4],[x,top+1,end-2],'yellow');for(let z=end-3.8;z<end;z+=.7)box([.05,1,.05],[x,top+.5,z],'steel');}
 for(const node of ROUTES[id])if(node.kind==='interact'){const terminal=makeTerminal(T,node.title);terminal.position.set(node.pos[0],0,node.pos[2]-.8);world.add(terminal);}
 for(const [x,z] of [[-3,13],[4,5],[-3,-3],[4,-13]]){if(id==='lab'&&z===-3)continue;box([1.7,.85,.65],[x,.425,z],'dark',true);box([1.8,.06,.7],[x,.88,z],'yellow');}
 for(const [type,list] of Object.entries(batches)){const o=new T.InstancedMesh(new T.BoxGeometry(1,1,1),materials[type],list.length);list.forEach((m,i)=>o.setMatrixAt(i,m));world.add(o);}
 const extraction=makeBeacon(T);extraction.position.set(7.5,0,-20);world.add(extraction);const light=new T.PointLight(0x79dcef,0,9);light.position.copy(extraction.position).y=1;world.add(light);
 const blocked=(x,z,r=.34)=>x< -17.4+r||x>17.4-r||z< -22.4+r||z>22.4-r||colliders.some(c=>Math.abs(x-c.x)<c.hx+r&&Math.abs(z-c.z)<c.hz+r);
 const lineBlocked=(x,z,tx,tz)=>{const n=Math.ceil(Math.hypot(tx-x,tz-z)*4);for(let i=1;i<n;i++)if(colliders.some(c=>Math.abs(x+(tx-x)*i/n-c.x)<c.hx&&Math.abs(z+(tz-z)*i/n-c.z)<c.hz))return true;return false;};
 const floorHeightAt=(x,z)=>{const half=STAIR_SPEC.count*STAIR_SPEC.run/2;if(Math.abs(x-stairX)<STAIR_SPEC.width/2&&z<=stairZ+half&&z>=end)return Math.min(STAIR_SPEC.count,Math.floor((stairZ+half-z)/STAIR_SPEC.run)+1)*STAIR_SPEC.rise;if(Math.abs(x-stairX)<2&&z<end&&z>end-4)return top;return 0;};
 const candidates=[[0,12],[-4,6],[4,0],[-10,-4],[10,-9],[0,-17],[5,15],[-10,16]].filter(p=>!blocked(...p));
 return {world,extraction,extractionPosition:extraction.position,blocked,lineBlocked,floorHeightAt,stair:{...STAIR_SPEC,x:stairX,z:stairZ},mapData:{bounds:{minX:-17.4,maxX:17.4,minZ:-22.4,maxZ:22.4},obstacles:colliders.map(c=>({x:c.x,z:c.z,hx:c.hx,hz:c.hz})),landmarks:ROUTES[id].filter(n=>n.kind==='interact').map(n=>({x:n.pos[0],z:n.pos[2],label:n.title})),upper:{x:stairX,z:end-2,hx:2,hz:2,height:top}},spawns:{player:[0,20],enemy:candidates[0],enemies:candidates},cachePositions:[[-10,0,5],[10,0,-5],[0,0,-15]],activateExtraction(){light.intensity=15;},resetExtraction(){light.intensity=0;}};
}
