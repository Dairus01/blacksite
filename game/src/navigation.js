// Bounded grid search for authored static architecture; no navigation meshes.
export function findPath(start,goal,blocked,limit=1800){
 const key=(x,z)=>`${x},${z}`,sx=Math.round(start[0]),sz=Math.round(start[1]),gx=Math.round(goal[0]),gz=Math.round(goal[1]);
 const q=[[sx,sz]],seen=new Map([[key(sx,sz),null]]);let found=null;
 for(let i=0;i<q.length&&i<limit;i++){
  const [x,z]=q[i];if(Math.hypot(x-gx,z-gz)<1.5){found=[x,z];break;}
  for(const [dx,dz] of [[0,-1],[1,0],[0,1],[-1,0]]){const nx=x+dx,nz=z+dz,k=key(nx,nz);if(seen.has(k)||blocked(nx,nz,.4))continue;seen.set(k,[x,z]);q.push([nx,nz]);}
 }
 if(!found)return[];const path=[];while(found){path.unshift(found);found=seen.get(key(...found));}return path.slice(1);
}
