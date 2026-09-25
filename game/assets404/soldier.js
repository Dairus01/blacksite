// Reference: VISUAL_BIBLE.md; Sentinel board 5, approach 61/85, firefight 13.
// Hierarchical transform skeleton; gait phase advances with distance travelled.
export default function generate(T, options = {}) {
  const root = new T.Group(); root.name = options.role || 'rifleman';
  const role = options.role || 'rifleman', friendly = ['daniel','maya','ally'].includes(role);
  const mat = (color, roughness=.86, metalness=.05) => new T.MeshStandardMaterial({color,roughness,metalness});
  const cloth=mat(options.cloth ?? 0x20282b), armor=mat(options.armor ?? 0x615b4b,.65,.15), web=mat(0x282723), skin=mat(role==='maya'?0xa87958:0x98705a), black=mat(0x121719), steel=mat(0x3b4548,.4,.65), red=mat(friendly?0x809990:0xb74639);
  const joint=(parent,name,x,y,z)=>{const g=new T.Group();g.name=name;g.position.set(x,y,z);parent.add(g);return g;};
  const mesh=(parent,geo,m,x,y,z,name='body_hit')=>{const o=new T.Mesh(geo,m);o.position.set(x,y,z);o.name=name;parent.add(o);return o;};
  const box=(p,s,m,x,y,z)=>mesh(p,new T.BoxGeometry(...s),m,x,y,z);
  const round=(p,r,scale,m,x,y,z,name)=>{const o=mesh(p,new T.SphereGeometry(r,12,8),m,x,y,z,name);o.scale.set(...scale);return o;};
  const capsule=(p,r,l,m,x,y,z)=>mesh(p,new T.CapsuleGeometry(r,Math.max(.01,l-2*r),4,10),m,x,y,z);
  const pelvis=joint(root,'pelvis',0,.91,0), spine=joint(pelvis,'spine',0,.12,0), chest=joint(spine,'chest',0,.15,0);
  round(pelvis,.23,[1,.55,.63],cloth,0,0,0);
  round(chest,.25,[.98,1.16,.61],cloth,0,.15,0);
  // Clipped shoulder corners and a flat front read as a plate carrier, not a shell.
  const carrier=new T.Shape();carrier.moveTo(-.17,-.12);carrier.lineTo(.17,-.12);carrier.lineTo(.19,.15);carrier.lineTo(.12,.25);carrier.lineTo(-.12,.25);carrier.lineTo(-.19,.15);carrier.closePath();
  mesh(chest,new T.ExtrudeGeometry(carrier,{depth:.065,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.012,bevelThickness:.008}),armor,0,.06,.12);
  round(chest,.23,[.93,1.12,.47],web,0,.12,-.18);
  for(const x of [-.16,0,.16]) box(chest,[.13,.17,.085],armor,x,.02,.205);
  for(const x of [-.19,.19]) {box(chest,[.07,.32,.04],armor,x,.27,.155);box(pelvis,[.12,.14,.1],web,x,-.02,.13);}
  box(pelvis,[.40,.065,.28],web,0,.035,0);box(pelvis,[.055,.045,.025],steel,0,.035,.152);
  for(const y of [.09,.15,.21])box(chest,[.30,.014,.016],web,0,y,.201);
  box(chest,[.11,.14,.08],black,-.20,.23,.14);
  for(const x of [-.17,.17])box(chest,[.075,.28,.04],web,x,.15,-.285);
  const neck=joint(chest,'neck',0,.43,0);capsule(neck,.066,.12,skin,0,.015,0);
  const head=joint(neck,'head',0,.15,0);
  round(head,.12,[.88,1.2,.93],skin,0,0,0,'head_hit');
  round(head,.087,[1,.7,.9],skin,0,-.075,.025,'head_hit');
  round(head,.025,[.7,1.3,1],skin,0,-.01,.112,'head_hit');
  for(const x of [-.042,.042]) {box(head,[.043,.009,.016],black,x,.025,.108);box(head,[.037,.011,.018],web,x,.043,.103);}
  box(head,[.055,.008,.013],web,0,-.074,.109);
  const bare=['daniel','maya','commander','engineer'].includes(role);
  if(bare){const hair=mesh(head,new T.SphereGeometry(.126,12,8,0,Math.PI*2,0,Math.PI*.55),mat(role==='commander'?0x44372d:0x221f1d),0,.024,-.008,'head_hit');hair.scale.set(.95,1.03,1);
    if(role==='maya') capsule(head,.048,.21,black,0,-.10,-.12);
    else round(head,.104,[1,.53,.9],mat(0x433a32),0,-.068,.008,'head_hit');
  } else {
    const helmet=mesh(head,new T.SphereGeometry(.147,14,8,0,Math.PI*2,0,Math.PI*.62),role==='scout'?cloth:armor,0,.036,0,'head_hit');helmet.scale.z=1.04;
    box(head,[.23,.05,.045],black,0,.012,.12);
    round(head,.1,[1,.53,.7],cloth,0,-.062,.06,'head_hit');
    box(head,[.044,.047,.019],red,0,.137,.095);
  }
  for(const x of [-.137,.137]) round(head,.036,[.48,1,1],black,x,.006,0);
  if(role==='scout'){
    // Open-faced cloth hood: partial lathe leaves the face exposed.
    const points=[new T.Vector2(.20,-.18),new T.Vector2(.165,-.08),new T.Vector2(.16,.06),new T.Vector2(.10,.18),new T.Vector2(.015,.205)];
    mesh(head,new T.LatheGeometry(points,16,.65,Math.PI*2-1.3),cloth,0,0,-.025,'head_hit');
  }
  const limbs={};
  for(const side of [-1,1]){
    const label=side<0?'left':'right';
    const thigh=joint(pelvis,label+'Thigh',side*.135,-.045,0);capsule(thigh,.108,.46,cloth,0,-.19,0);
    box(thigh,[.065,.16,.13],web,side*.085,-.16,.005);
    const shin=joint(thigh,label+'Knee',0,-.41,0);capsule(shin,.083,.43,cloth,0,-.18,0);
    round(shin,.089,[1,.82,.55],armor,0,-.018,.064);
    const ankle=joint(shin,label+'Ankle',0,-.36,0);const boot=round(ankle,.11,[.78,.65,1.4],black,0,-.03,.045);
    box(ankle,[.15,.03,.25],web,0,-.085,.045);
    const shoulder=joint(chest,label+'Shoulder',side*.25,.31,0);capsule(shoulder,.083,.33,cloth,0,-.14,0);
    round(shoulder,.097,[1,.8,.92],role==='shock'?red:armor,side*.015,-.03,0);
    const elbow=joint(shoulder,label+'Elbow',0,-.28,0);capsule(elbow,.065,.30,cloth,0,-.125,0);
    const wrist=joint(elbow,label+'Wrist',0,-.255,0);round(wrist,.058,[.8,1.2,.72],black,0,-.02,0);
    limbs[label]={thigh,shin,ankle,shoulder,elbow,wrist,boot};
  }
  box(chest,[.02,.085,.07],red,-.32,.28,.015);
  if(['heavy','captain','commander'].includes(role)){
    box(chest,[.35,.34,.16],armor,0,.16,-.26);
    const brass=mat(0x9f8255,.4,.55);
    for(let i=0;i<9;i++){const link=box(chest,[.035,.065,.035],brass,-.18+i*.045,.35-i*.037,.23);link.rotation.z=-.65;}
  }
  if(['captain','commander','maya'].includes(role))capsule(chest,.012,.38,black,.23,.45,-.15);
  if(role==='maya') {box(chest,[.07,.14,.025],red,0,.15,-.3);box(chest,[.14,.05,.027],red,0,.15,-.3);}
  const rifle=joint(chest,'rifle',.10,.22,.23);
  box(rifle,[.075,.11,.30],steel,0,0,0);box(rifle,[.065,.08,.22],armor,0,0,-.22);
  box(rifle,[.068,.085,.29],web,0,.005,.27);box(rifle,[.052,.18,.085],black,0,-.10,.04);
  const barrel=mesh(rifle,new T.CylinderGeometry(.015,.015,.27,10),steel,0,0,.51);barrel.rotation.x=Math.PI/2;
  box(rifle,[.05,.055,.075],black,0,.073,.02);
  const muzzle=joint(rifle,'muzzle',0,0,.66);
  const down=new T.Vector3(0,-1,0);
  function solve(upper,lower,target,pole,l1,l2){
    const delta=target.clone().sub(upper.position),dist=Math.max(.02,Math.min(l1+l2-.005,delta.length())),axis=delta.normalize();
    const bend=pole.clone().addScaledVector(axis,-pole.dot(axis)).normalize();
    const along=(l1*l1-l2*l2+dist*dist)/(2*dist),height=Math.sqrt(Math.max(0,l1*l1-along*along));
    const knee=axis.clone().multiplyScalar(along).addScaledVector(bend,height);
    upper.quaternion.setFromUnitVectors(down,knee.clone().normalize());
    const shin=axis.multiplyScalar(dist).sub(knee).normalize().applyQuaternion(upper.quaternion.clone().invert());
    lower.quaternion.setFromUnitVectors(down,shin);
  }
  let gait=0, prevTime=0, blend=0;
  const prevPosition=new T.Vector3(),travel=new T.Vector3(0,0,1); let initialized=false;
  const pose=(mode='idle',time=0,hit=0,recoil=0,motion=0)=>{
    const dt=Math.max(0,Math.min(.05,time-prevTime));prevTime=time;
    const displacement=root.position.clone().sub(prevPosition);displacement.y=0;
    const moved=initialized?displacement.length():0;
    if(moved>.0001)travel.copy(displacement).applyQuaternion(root.quaternion.clone().invert()).normalize();
    initialized=true;prevPosition.copy(root.position);
    gait+=Math.min(moved,.3)*(Math.PI*2/.74);
    const moving=motion>0.02; const aim=['alert','aim','aimWalk','fire','recoil','reload','cover','crouchWalk'].includes(mode);
    blend=T.MathUtils.damp(blend,aim?1:0,12,dt||.016);
    const crouch=['crouch','crouchWalk','cover'].includes(mode)?1:0;
    pelvis.position.y=.91-crouch*.24+Math.cos(gait*2)*.012*(moving?1:0);
    spine.rotation.set(-.04-crouch*.18-hit*.4,Math.sin(gait)*.045*(moving?1:0),hit*.2);
    head.rotation.y=-spine.rotation.y;head.rotation.x=-spine.rotation.x*.35;
    for(const [idx,l] of Object.values(limbs).entries()){
      const phase=gait+idx*Math.PI; const swing=Math.sin(phase), lift=Math.max(0,swing);
      l.thigh.rotation.x=(moving?swing*.48:0)-crouch*.62;
      l.shin.rotation.x=(moving?lift*.8:0)+crouch*1.12+.08;
      l.ankle.rotation.x=-l.thigh.rotation.x-l.shin.rotation.x;
      l.shoulder.rotation.x=-blend*1.15+(1-blend)*(moving?-swing*.28:0);
      l.shoulder.rotation.z=(idx===0?-.18:.15)*blend;
      l.elbow.rotation.x=-.18-blend*.68;
      l.elbow.rotation.z=(idx===0?-.42:.12)*blend;
    }
    rifle.position.set(.10,.06+blend*.16,.20+blend*.03-recoil*.018);rifle.rotation.x=.38*(1-blend)-recoil*.035;
    for(const [idx,l] of Object.values(limbs).entries()){
      const phase=gait+idx*Math.PI,cycle=(phase%(Math.PI*2))/(Math.PI*2),swing=cycle>.6;
      const z=moving?(swing?-.22+(cycle-.6)/.4*.44:.22-cycle/.6*.44):idx===0?.07:-.09;
      let y=-.81+crouch*.23+(moving&&swing?Math.sin((cycle-.6)/.4*Math.PI)*.12:0);
      const foot=new T.Vector3((idx===0?-.135:.135)+(moving?travel.x*z:0),0,moving?travel.z*z:z);
      if(options.floorHeight){const world=foot.clone().applyQuaternion(root.quaternion).add(root.position);y+=T.MathUtils.clamp(options.floorHeight(world.x,world.z)-root.position.y,-.18,.25);}
      solve(l.thigh,l.shin,new T.Vector3(foot.x,y,foot.z),new T.Vector3(0,0,1),.41,.36);
      l.ankle.quaternion.copy(l.thigh.quaternion).multiply(l.shin.quaternion).invert();
      const target=idx===0?new T.Vector3(.06,.03+blend*.17,.49):new T.Vector3(.10,-.09+blend*.17,.19);
      solve(l.shoulder,l.elbow,target,new T.Vector3(idx===0?-1:1,-.65,-.1),.28,.255);
    }
    if(mode==='reload'){limbs.left.shoulder.rotation.x=-.6;limbs.left.elbow.rotation.x=-1.6;rifle.rotation.z=-.22;}
    else rifle.rotation.z=0;
    if(mode==='grenade'||mode==='melee'){limbs.right.shoulder.rotation.x=-2.4;limbs.right.elbow.rotation.x=-.8;}
    if(mode==='dead'){pelvis.position.y=.35;spine.rotation.x=-.55;limbs.left.thigh.rotation.x=-1.2;}
    if(role==='engineer'){rifle.visible=false;for(const l of Object.values(limbs)){l.shoulder.rotation.x=-.6;l.elbow.rotation.x=-.8;}spine.rotation.x=-.12;}
    root.userData.animation={mode,gait,moved};
  };
  root.scale.setScalar(role==='maya'?1.70/1.83:role==='commander'?1.80/1.83:1);
  pose();root.userData.pose=pose;root.userData.joints={pelvis,spine,chest,body:chest,neck,head,rifle,muzzle,...limbs};
  root.userData.materials={cloth,armor,web,skin,steel};return root;
}
