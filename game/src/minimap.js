export function floorName(height,upperHeight){return height>upperHeight*.65?'UPPER':'GROUND';}
export function enemyRevealed({distance,facing,lineBlocked,awareness,lastFireAt,now}){
 return distance<22&&facing>.55&&!lineBlocked || lastFireAt!=null&&now-lastFireAt<3 || awareness>=1&&distance<12;
}
export function mapPoint(x,z,originX,originZ,yaw,scale,cx,cy){
 const dx=x-originX,dz=z-originZ,c=Math.cos(yaw),s=Math.sin(yaw);
 return [cx+(dx*c-dz*s)*scale,cy+(dx*s+dz*c)*scale];
}
function polygon(ctx,points,fill,stroke){ctx.beginPath();ctx.moveTo(...points[0]);for(const p of points.slice(1))ctx.lineTo(...p);ctx.closePath();if(fill){ctx.fillStyle=fill;ctx.fill();}if(stroke){ctx.strokeStyle=stroke;ctx.stroke();}}
function rect(ctx,project,x,z,hx,hz,fill,stroke){polygon(ctx,[project(x-hx,z-hz),project(x+hx,z-hz),project(x+hx,z+hz),project(x-hx,z+hz)],fill,stroke);}
function dot(ctx,point,color,r=4){ctx.beginPath();ctx.arc(point[0],point[1],r,0,Math.PI*2);ctx.fillStyle=color;ctx.fill();}
export function drawMap(canvas,state,{large=false}={}){
 if(!canvas||!state?.mapData)return;
 const dpr=Math.min(window.devicePixelRatio||1,1.5),width=Math.round(canvas.clientWidth*dpr),height=Math.round(canvas.clientHeight*dpr);
 if(!width||!height)return;
 if(canvas.width!==width||canvas.height!==height){canvas.width=width;canvas.height=height;}
 const ctx=canvas.getContext('2d');ctx.setTransform(dpr,0,0,dpr,0,0);
 const w=canvas.clientWidth,h=canvas.clientHeight,cx=w/2,cy=h/2;
 ctx.clearRect(0,0,w,h);ctx.fillStyle='#08151b';ctx.fillRect(0,0,w,h);
 const bounds=state.mapData.bounds,yaw=large||!state.rotate?0:state.yaw;
 const spanX=bounds.maxX-bounds.minX,spanZ=bounds.maxZ-bounds.minZ;
 const scale=large?Math.min((w-48)/spanX,(h-48)/spanZ):w/32;
 const ox=large?(bounds.minX+bounds.maxX)/2:state.player.x,oz=large?(bounds.minZ+bounds.maxZ)/2:state.player.z;
 const project=(x,z)=>mapPoint(x,z,ox,oz,yaw,scale,cx,cy);
 const marker=(x,z)=>{const p=project(x,z);return large?p:[Math.max(10,Math.min(w-10,p[0])),Math.max(10,Math.min(h-10,p[1]))];};
 ctx.save();ctx.beginPath();ctx.rect(0,0,w,h);ctx.clip();
 rect(ctx,project,(bounds.minX+bounds.maxX)/2,(bounds.minZ+bounds.maxZ)/2,spanX/2,spanZ/2,'#172a32','#63808b');
 ctx.lineWidth=1;
 for(const o of state.mapData.obstacles)rect(ctx,project,o.x,o.z,o.hx,o.hz,state.floor==='UPPER'?'#41525a88':'#667980','#a8bec555');
 const upper=state.mapData.upper;
 if(upper){rect(ctx,project,upper.x,upper.z,upper.hx,upper.hz,state.floor==='UPPER'?'#49656e':'#294149','#86bec6');
  const stair=state.stair;if(stair){const run=stair.count*stair.run/2;rect(ctx,project,stair.x,stair.z,stair.width/2,run,'#30454d','#8dbac3');for(let i=0;i<stair.count;i++){const z=stair.z+run-i*stair.run;const a=project(stair.x-stair.width/2,z),b=project(stair.x+stair.width/2,z);ctx.beginPath();ctx.moveTo(...a);ctx.lineTo(...b);ctx.strokeStyle='#9bc6c777';ctx.stroke();}}}
 for(const place of state.discovered){const p=project(place.x,place.z);dot(ctx,p,'#87b5bb',large?4:2.5);if(large){ctx.fillStyle='#bdd0d0';ctx.font='11px sans-serif';ctx.fillText(place.label,p[0]+7,p[1]-6);}}
 if(state.extraction){const p=marker(state.extraction.x,state.extraction.z);polygon(ctx,[[p[0],p[1]-7],[p[0]+7,p[1]],[p[0],p[1]+7],[p[0]-7,p[1]]],state.extractionActive?'#70e1d9':'#396d73','#9beae3');if(large){ctx.fillStyle='#c4e7e3';ctx.font='11px sans-serif';ctx.fillText('EXTRACTION',p[0]+10,p[1]+4);}}
 if(state.objective&&state.showObjectives){const p=marker(state.objective.x,state.objective.z);dot(ctx,p,'#ffce85',large?7:5);ctx.strokeStyle='#ffce85';ctx.beginPath();ctx.arc(...p,large?11:8,0,Math.PI*2);ctx.stroke();if(large){ctx.fillStyle='#ffe0a9';ctx.font='bold 12px sans-serif';ctx.fillText('OBJECTIVE',p[0]+13,p[1]-8);}}
 for(const mate of state.teammates)dot(ctx,project(mate.x,mate.z),'#78e1d2',large?6:4);
 for(const enemy of state.enemies)dot(ctx,project(enemy.x,enemy.z),'#ef655f',large?6:4);
 const p=project(state.player.x,state.player.z),angle=state.rotate&&!large?0:state.yaw;
 const f=[-Math.sin(angle),-Math.cos(angle)],side=[-f[1],f[0]],radius=large?10:8;
 polygon(ctx,[[p[0]+f[0]*radius,p[1]+f[1]*radius],[p[0]-f[0]*radius*.65+side[0]*radius*.6,p[1]-f[1]*radius*.65+side[1]*radius*.6],[p[0]-f[0]*radius*.65-side[0]*radius*.6,p[1]-f[1]*radius*.65-side[1]*radius*.6]],'#f4f2dc','#ffffff');
 ctx.restore();
}
