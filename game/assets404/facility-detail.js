// Procedural architecture from board 7 and approach frames 1/187.
export function addFacilityDetail(T,world){
 const materials={steel:new T.MeshStandardMaterial({color:0x39474e,roughness:.55,metalness:.65}),dark:new T.MeshStandardMaterial({color:0x141f27,roughness:.8}),concrete:new T.MeshStandardMaterial({color:0x617078,roughness:.85}),yellow:new T.MeshStandardMaterial({color:0xb39a60,roughness:.65}),light:new T.MeshBasicMaterial({color:0xc9e6ef}),red:new T.MeshBasicMaterial({color:0xf34c3f})};
 const batches={};
 const box=(size,pos,type='steel',rot=0)=>{const m=new T.Matrix4().compose(new T.Vector3(...pos),new T.Quaternion().setFromEuler(new T.Euler(0,0,rot)),new T.Vector3(...size));(batches[type]??=[]).push(m);};
 const tube=(radius,length,pos,rx=0)=>{const o=new T.Mesh(new T.CylinderGeometry(radius,radius,length,12),materials.steel);o.position.set(...pos);o.rotation.x=rx;world.add(o);return o;};
 for(const [x,z,h] of [[-17,-14,11],[18,-20,15],[18,8,8]]){
  for(const dx of [-.65,.65])for(const dz of [-.65,.65])box([.12,h,.12],[x+dx,h/2,z+dz]);
  for(let y=1;y<h;y+=1.6){for(const dz of [-.65,.65]){box([1.4,.08,.08],[x,y,z+dz]);box([.07,2,.07],[x,y+.6,z+dz],'steel',.67);}for(const dx of [-.65,.65])box([.08,.08,1.4],[x+dx,y,z]);}
  box([.25,.25,.25],[x,h+.15,z],'red');tube(.04,3,[x,h+1.5,z]);
 }
 // Guard observation cabin with glazing, railings and distinct roof overhang.
 const gx=-14,gz=4;
 for(const dx of [-1,1])for(const dz of [-1,1])box([.2,4.5,.2],[gx+dx,2.25,gz+dz]);
 box([3,.2,3],[gx,4.3,gz]);box([2.5,.8,2.5],[gx,4.8,gz],'concrete');box([3.2,.18,3.2],[gx,6.5,gz],'dark');
 for(const dx of [-1.15,1.15])for(const dz of [-1.15,1.15])box([.1,1.3,.1],[gx+dx,5.75,gz+dz]);
 const glass=new T.Mesh(new T.BoxGeometry(2.3,1.1,2.3),new T.MeshStandardMaterial({color:0x2b566d,metalness:.4,roughness:.15,transparent:true,opacity:.65}));glass.position.set(gx,5.8,gz);world.add(glass);
 // Research buildings and rooftop service machinery beyond the combat court.
 for(const [x,z,w,h] of [[-23,-9,9,8],[21,-10,8,6],[-13,-27,15,7],[5,-29,13,10]]){
  box([w,h,9],[x,h/2,z],'concrete');box([w+.5,.25,9.5],[x,h,z],'dark');
  for(let y=1.8;y<h;y+=2.3)for(let dx=-w/2+1;dx<w/2;dx+=1.5){box([.8,.9,.04],[x+dx,y,z+4.52],'dark');box([.7,.04,.045],[x+dx,y+.35,z+4.55],'light');}
  for(let j=0;j<3;j++){box([1.2,.8,1.6],[x-2+j*2,h+.4,z]);for(let k=0;k<5;k++)box([1.1,.035,.04],[x-2+j*2,h+.2+k*.1,z+.82],'dark');}
 }
 // Pipe gantry and service conduits.
 for(const z of [-14,-8]){box([.25,5,.25],[13,2.5,z]);box([.25,5,.25],[5,2.5,z]);box([8.5,.25,.4],[9,4.9,z]);}
 for(const x of [8,8.45,8.9])tube(.13,17,[x,5.2,-7],Math.PI/2);
 for(const x of [11,13]){const tank=tube(.9,3.4,[x,1.7,-16]);for(const y of [.3,2.9]){const ring=new T.Mesh(new T.TorusGeometry(.92,.045,6,16),materials.steel);ring.rotation.x=Math.PI/2;ring.position.set(x,y,-16);world.add(ring);}box([1.9,.1,.4],[x,3.55,-16],'yellow');}
 // Sea and dock beyond west perimeter; wet surfaces stay geometrically authored.
 const water=new T.Mesh(new T.PlaneGeometry(90,120,1,1),new T.MeshStandardMaterial({color:0x17333f,roughness:.24,metalness:.6}));water.rotation.x=-Math.PI/2;water.position.set(-63,-.45,-5);world.add(water);
 for(let z=-20;z<20;z+=4){box([8,.2,2],[ -19,-.05,z],'dark');box([.15,1.1,.15],[-22,.5,z],'yellow');}
 // Rooftop helipad and extraction approach bollards.
 for(let z=-18;z<-12;z+=1.2){box([.16,.6,.16],[5.4,.3,z],'yellow');box([.16,.6,.16],[9.8,.3,z],'yellow');}
 // Small service vehicle: wheels, chassis, cabin; no imported models.
 box([1.8,.45,3.3],[12,.6,13],'dark');box([1.7,.95,1.45],[12,1.15,12.35],'steel');box([1.45,.55,.025],[12,1.3,11.61],'light');
 for(const x of [11.08,12.92])for(const z of [11.9,14.1]){const o=new T.Mesh(new T.CylinderGeometry(.37,.37,.2,12),materials.dark);o.rotation.z=Math.PI/2;o.position.set(x,.4,z);world.add(o);}
 for(const [kind,list] of Object.entries(batches)){const batch=new T.InstancedMesh(new T.BoxGeometry(1,1,1),materials[kind],list.length);list.forEach((m,i)=>batch.setMatrixAt(i,m));world.add(batch);}
 const rain=new T.InstancedMesh(new T.CylinderGeometry(.007,.007,.35,3),new T.MeshBasicMaterial({color:0xaac3cf,transparent:true,opacity:.24}),350);const matrix=new T.Matrix4();
 for(let i=0;i<350;i++){matrix.makeTranslation(Math.sin(i*127.1)*18,(i*1.37)%14,Math.cos(i*91.7)*24);rain.setMatrixAt(i,matrix);}world.add(rain);
 return dt=>{rain.position.y-=dt*9;if(rain.position.y< -7)rain.position.y=0;};
}
export function makeTerminal(T,label='AEGIS // SECURE ACCESS'){
 const root=new T.Group(),mat=new T.MeshStandardMaterial({color:0x273944,metalness:.4,roughness:.6});
 const base=new T.Mesh(new T.BoxGeometry(.8,1,.5),mat);base.position.y=.5;root.add(base);
 const canvas=document.createElement('canvas');canvas.width=512;canvas.height=256;const c=canvas.getContext('2d');c.fillStyle='#071924';c.fillRect(0,0,512,256);c.strokeStyle='#3c889e';for(let x=0;x<512;x+=32){c.beginPath();c.moveTo(x,0);c.lineTo(x,256);c.stroke();}c.fillStyle='#91e3ef';c.font='bold 24px monospace';c.fillText('AEGIS',22,44);c.font='16px monospace';c.fillText(label,22,100);c.fillText('ACCESS LOG // ENCRYPTED',22,145);c.fillText('LINK ESTABLISHED',22,205);
 const tex=new T.CanvasTexture(canvas);tex.colorSpace=T.SRGBColorSpace;const screen=new T.Mesh(new T.PlaneGeometry(.76,.43),new T.MeshBasicMaterial({map:tex}));screen.position.set(0,1.18,.08);screen.rotation.x=-.15;root.add(screen);return root;
}
