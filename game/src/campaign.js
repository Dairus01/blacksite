export const MAPS=Object.freeze([
 {id:'blacksite',name:'COASTAL BLACKSITE',region:'Greywater coast'},
 {id:'refinery',name:'REFINERY YARD',region:'Relay Nine'},
 {id:'command',name:'COMMAND BUILDING',region:'Sentinel district'},
 {id:'lab',name:'UNDERGROUND LAB',region:'AEGIS vault'}
]);
export const MODES=Object.freeze([{id:'campaign',name:'CAMPAIGN'},{id:'survival',name:'SURVIVAL'},{id:'extraction',name:'EXTRACTION'},{id:'team',name:'TEAM BATTLE'}]);
const definitions=[
 ['BLACKSITE BREACH','THE BLACKOUT','Several AEGIS facilities have stopped responding. Return to Blacksite, recover its access log and survive extraction. Maya disappeared here. Kane never came home.',6,1,0,false,'E. KANE // credential accepted. Daniel: No. Kane is dead.'],
 ['BURNING SIGNAL','THE TRANSFER','Sentinel is moving AEGIS fragments through a refinery relay. Disable both transmitters, sabotage the fuel controls and escape.',6,2,0,false,'Recovered command fragment: Hold the line, Echo. Daniel recognizes the cadence.'],
 ['GHOST PROTOCOL','THE RECORD','An AEGIS engineer is held inside the command building. Rescue the engineer, defend decryption and recover the Reyes file.',7,2,18,false,'Security recording confirmed: ELIAS KANE. Reyes status: transferred, destination encrypted.'],
 ['BELOW ZERO','THE CORE','Restore power beneath Blacksite. Shut down security, reach the AEGIS core and confront the commander before the vault seals.',8,2,0,true,'Kane: AEGIS does not relay orders. It writes them. Maya found the override. Her signal is still out there.']
];
export const LEVELS=Object.freeze(definitions.map((d,i)=>Object.freeze({id:i+1,title:d[0],act:i+1,actName:d[1],briefing:d[2],map:MAPS[i],mode:MODES[0],requiredKills:d[3],intelRequired:d[4],holdSeconds:d[5],commander:d[6],reveal:d[7],maxAlive:3+(i>1?1:0),enemyHealth:65+i*7,enemyDamage:5+i,verb:'Complete the mission and extract'})));
export function getLevel(id){return LEVELS[Math.max(0,Math.min(3,(Math.trunc(Number(id))||1)-1))];}
export const SHOP=Object.freeze([
 ...[['reddot','REFLEX SIGHT',250,0,'ADS spread -20%'],['magnifier','3× OPTIC',650,2,'Narrower ADS field of view'],['suppressor','SUPPRESSOR',450,1,'Reduced gunshot detection radius'],['vertical','VERTICAL GRIP',300,1,'Recoil -20%'],['angled','ANGLED GRIP',300,1,'Faster sight alignment'],['light','TACTICAL LIGHT',250,1,'Illuminates the sight line'],['laser','LASER MODULE',350,2,'Hip spread -25%'],['compensator','COMPENSATOR',450,2,'Recoil -25%'],['stock','TACTICAL STOCK',400,2,'Less weapon sway'],['medical','MEDICAL PACK',300,1,'One extra medkit per deployment'],['grenadier','GRENADE POUCH',350,2,'One extra frag per deployment']].map(([id,name,cost,unlock,effect])=>({id,name,cost,unlock,effect,category:['medical','grenadier'].includes(id)?'EQUIPMENT':'ATTACHMENTS'})),
 {id:'bastion',name:'BASTION-60',category:'WEAPONS',cost:1200,unlock:4,effect:'60 rounds / sustained fire / heavy field load'},
 {id:'kestrel',name:'KESTREL-9',category:'WEAPONS',cost:500,unlock:1,effect:'36 rounds · compact · high fire rate'},
 {id:'breacher',name:'BR-12',category:'WEAPONS',cost:650,unlock:2,effect:'8 shells · close range · eight pellets'},
 {id:'vesper',name:'VESPER',category:'WEAPONS',cost:850,unlock:3,effect:'16 rounds · 55m · precision'},
 ...[['extended','EXTENDED MAG',350,1,'Magazine capacity +35%'],['quick','TACTICAL MAGWELL',300,1,'Reload 22% faster'],['hollow','MATCH AMMUNITION',600,2,'Damage +15%'],['runner','LIGHT FIELD RIG',400,2,'Movement +12%'],['armor','ARMOR CARRIER',450,1,'Starting armor +30'],['adrenaline','TRAUMA KIT',500,3,'Heal 8 on a kill']].map(([id,name,cost,unlock,effect])=>({id,name,cost,unlock,effect,category:'ATTACHMENTS'}))
]);
export const DEFAULT_SETTINGS=Object.freeze({sensitivity:1,master:.7,music:.4,sfx:.8,quality:'medium',resolution:1,hudScale:1,shake:.4,subtitles:true,crosshair:true,aimAssist:true,difficulty:'regular'});
const KEY='project-blacksite:save:v1';
const fresh=()=>({version:1,highestCompleted:0,selectedLevel:1,selectedWeapon:'arx7',credits:0,xp:0,owned:['arx7','sentinel'],upgrades:{},settings:{...DEFAULT_SETTINGS},best:{},intel:[]});
const finite=(v,lo,hi)=>Number.isFinite(Number(v))?Math.max(lo,Math.min(hi,Number(v))):lo;
const freeze=value=>{if(value&&typeof value==='object'){for(const child of Object.values(value))freeze(child);Object.freeze(value);}return value;};
export function createCampaignProgress(storage=globalThis.localStorage){
 let data=fresh();
 try{const p=JSON.parse(storage?.getItem(KEY)||'null');if(p?.version===1){data={...data,highestCompleted:Math.trunc(finite(p.highestCompleted,0,4)),credits:Math.trunc(finite(p.credits,0,1e7)),xp:Math.trunc(finite(p.xp,0,1e8))};
 data.owned=[...new Set(['arx7','sentinel',...(Array.isArray(p.owned)?p.owned:[]).filter(id=>SHOP.some(i=>i.id===id))])];
 data.selectedLevel=Math.min(getLevel(p.selectedLevel).id,data.highestCompleted+1);data.selectedWeapon=data.owned.includes(p.selectedWeapon)?p.selectedWeapon:'arx7';
 data.upgrades=Object.fromEntries(SHOP.filter(i=>i.category!=='WEAPONS'&&data.owned.includes(i.id)).map(i=>[i.id,true]));
 if(p.settings&&typeof p.settings==='object')for(const k of Object.keys(DEFAULT_SETTINGS)){const v=p.settings[k];if(typeof v===typeof DEFAULT_SETTINGS[k])data.settings[k]=v;}
 for(const k of ['sensitivity','master','music','sfx','resolution','hudScale','shake']) data.settings[k]=finite(data.settings[k],k==='sensitivity'?.2:k==='resolution'?.5:k==='hudScale'?.7:0,k==='sensitivity'?3:k==='hudScale'?1.5:1);
 data.best=p.best&&typeof p.best==='object'?p.best:{};data.intel=Array.isArray(p.intel)?p.intel.filter(v=>typeof v==='string').slice(0,30):[];
 }}catch{}
 // Publish one immutable snapshot per mutation, never a deep copy per frame read.
 let snapshot=freeze(structuredClone(data));
 const persist=()=>{snapshot=freeze(structuredClone(data));try{storage?.setItem(KEY,JSON.stringify(data));}catch{}};
 return {
 get state(){return snapshot;}, unlocked(id){return getLevel(id).id<=Math.min(4,data.highestCompleted+1);}, owns(id){return data.owned.includes(id);},
 selectLevel(id){const n=getLevel(id).id;if(n<=data.highestCompleted+1)data.selectedLevel=n;persist();return data.selectedLevel;},
 selectWeapon(id){if(data.owned.includes(id)&&['arx7','sentinel','kestrel','breacher','vesper','bastion'].includes(id))data.selectedWeapon=id;persist();return data.selectedWeapon;},
 complete(id,stats={}){const n=getLevel(id).id;if(n>data.highestCompleted+1)return null;const replay=n<=data.highestCompleted;
 const base=500+n*100,objective=100,accuracy=stats.shots>0?Math.round(100*Math.min(1,(stats.hits||0)/stats.shots)):0,headshot=Math.min(150,(stats.headshots||0)*20),difficulty=data.settings.difficulty==='veteran'?150:0;
 const credits=Math.round((base+objective+accuracy+headshot+difficulty)*(replay?.3:1)),xp=Math.round((500+(stats.kills||0)*50+objective)*(replay?.5:1));
 data.credits+=credits;data.xp+=xp;data.highestCompleted=Math.max(data.highestCompleted,n);data.selectedLevel=Math.min(4,n+1);data.best[n]=Math.max(Number(data.best[n])||0,stats.score||0);persist();return{base,objective,accuracy,headshot,difficulty,credits,xp,replay};},
 rewardMode(kills,waves=0){const credits=Math.min(500,Math.max(0,kills)*12+waves*25),xp=credits*2;data.credits+=credits;data.xp+=xp;persist();return{credits,xp};},
 purchase(id){const item=SHOP.find(i=>i.id===id);if(!item||data.owned.includes(id)||data.highestCompleted<item.unlock||data.credits<item.cost)return false;data.credits-=item.cost;data.owned.push(id);if(item.category!=='WEAPONS')data.upgrades[id]=true;persist();return true;},
 setUpgrade(id){if(data.owned.includes(id))data.upgrades[id]=true;persist();},resetRun(){},
 settings(next){for(const k of Object.keys(DEFAULT_SETTINGS))if(k in next)data.settings[k]=next[k];persist();},
 addIntel(text){if(data.intel.includes(text))return false;data.intel.push(text);persist();return true;},
 intelReward(text){if(data.intel.includes(text))return false;data.intel.push(text);data.credits+=50;data.xp+=75;persist();return true;},
 reset(){data=fresh();persist();}
 };
}
