import { createSoundscape } from './audio.js';
import { findPath } from './navigation.js';
import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.185.0/build/three.module.js';
import makeRifle from '../assets404/rifle.js';
import makeSoldier from '../assets404/soldier.js';
import makeIntel from '../assets404/intel-pickup.js';
import { createInput } from './input.js';
import { buildArena } from './arena.js';
import { buildMissionArena } from './mission-arena.js';
import { ROUTES, TRAINING } from './missions.js';
import { setupMemory } from './memory.js';
import { setupInterface } from './interface.js';
import { LEVELS, SHOP, getLevel, createCampaignProgress } from './campaign.js';
import { WEAPONS, UPGRADES, weaponById, capacityFor, reloadFor, damageFor } from './arsenal.js';
import { GAME_CONFIG } from './config/game-config.js';

const memory = setupMemory();
let interfaceUI = null, playMode = 'campaign', checkpoint = null, training = -1;
let stageTime = 0, interaction = false, wave = 1, waveTarget = 4;
const equipment = { frag: 2, smoke: 1, medkit: 2, plate: 1 };
const effects = [];let optionalIntel=null;
const $ = (id) => document.getElementById(id);
document.title = `${GAME_CONFIG.title} — ${GAME_CONFIG.subtitle}`;
const ui = Object.fromEntries(['start','tutorial','hud','touch','pause','death','complete','objective-main','objective-sub','objective-tag','mission-progress','threat','threat-text','waypoint','waypoint-label','waypoint-distance','radio','radio-text','mag','reserve','weapon-name','reload-state','health','health-fill','status-message','reticle','damage','damage-direction','commander-hud','commander-fill','complete-stats','upgrade-choices','pause-detail','level-select','weapon-select','mission-detail','brief-title','brief-text'].map((id) => [id, $(id)]));
window.__READY__ = false;
window.__GAME__ = { pos: [0, 16.5], draws: 0, tris: 0, fps: 0, started: false, missionPhase: 'deploy', enemyCount: 0, intelCount: 0 };

const renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, innerWidth < 900 ? 1.25 : 1.5));
renderer.setSize(innerWidth, innerHeight, false);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.06;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
$('game').append(renderer.domElement);
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x132132);
scene.fog = new THREE.FogExp2(0x1b2730, 0.018);
const camera = new THREE.PerspectiveCamera(72, innerWidth / innerHeight, 0.05, 120);
scene.add(camera);
const tacticalLight=new THREE.SpotLight(0xc5e5ff,0,20,.35,.5,1.6);camera.add(tacticalLight);tacticalLight.target.position.set(0,0,-10);camera.add(tacticalLight.target);
scene.add(new THREE.HemisphereLight(0xa7c9da, 0x251913, 2.15));
const sun = new THREE.DirectionalLight(0xffc59a, 2.8);
sun.position.set(10, 18, 12);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.left = -23; sun.shadow.camera.right = 23;
sun.shadow.camera.top = 26; sun.shadow.camera.bottom = -26;
sun.shadow.bias = -0.0007;
scene.add(sun);
const rim = new THREE.DirectionalLight(0x668fb5, 1.25);
rim.position.set(-10, 8, -18); scene.add(rim);
const input = createInput(renderer.domElement);
const progress = createCampaignProgress();
let level = getLevel(progress.state.selectedLevel);
let arena = null;
let audio = null, soundscape = null, footstepClock=0;
let last = performance.now(), fpsClock = 0, fpsFrames = 0, fps = 60, statusTimer = 0, radioTimer = 0, hitTimer = 0, damageTimer = 0;
const raycaster = new THREE.Raycaster();
const aim = new THREE.Vector2();
const worldTarget = new THREE.Vector3();
const tmp = new THREE.Vector3();
const hip = new THREE.Vector3(0.31, -0.42, -0.63);
const sight = new THREE.Vector3(0, -0.24, -0.32);
const camModes = ['FIRST PERSON', 'LEFT SHOULDER', 'RIGHT SHOULDER'];
let camMode = 0;
const player = { armor: 30, crouch: false, eyeHeight: 1.66, position: new THREE.Vector3(), velocity: new THREE.Vector3(), yaw: 0, pitch: 0, verticalVelocity: 0, grounded: true, speed: 0, health: 100, alive: true, damageTaken: 0, deaths: 0 };
const mission = { stage: 0, reward: null, started: false, paused: false, phase: 'deploy', kills: 0, headshots: 0, intel: 0, score: 0, shots: 0, hits: 0, elapsed: 0, objectiveClear: false, commanderSpawned: false, commanderDefeated: false };
const inventory = new Map(WEAPONS.map((spec) => [spec.id, { magazine: spec.capacity, reserve: spec.reserve }]));
let spec = weaponById(progress.state.selectedWeapon);
const weapon = { cooldown: 0, recoil: 0, reloadRemaining: 0, reloadDuration: 0, adsBlend: 0, flashTimer: 0, emptyNotified: false };
const models = new Map();
for (const item of WEAPONS) {
  const model = makeRifle(THREE, item);
  model.scale.setScalar(0.44);
  model.rotation.y = Math.PI;
  model.traverse((node) => { if (node.isMesh) { node.castShadow = false; node.receiveShadow = false; node.renderOrder = 5; node.material.depthTest = false; node.material.depthWrite = false; } });
  model.visible = false;
  camera.add(model);
  models.set(item.id, model);
}
const avatar = makeSoldier(THREE, { role: 'daniel', armor: 0x76644b });
avatar.visible = false;
const avatarShadows = new Set([avatar.userData.joints.body.children[0], avatar.userData.joints.body.children[1], avatar.userData.joints.head.children[0]]);
avatar.traverse((node) => { if (node.isMesh) { node.castShadow = avatarShadows.has(node); node.receiveShadow = true; } });
scene.add(avatar);
const enemies = [];
const allies=[];let teamLosses=0;
const pickups = [];
const tracerMaterial = new THREE.MeshBasicMaterial({ color: 0xffa142, transparent: true, opacity: 0.82, depthWrite: false });
const tracers = Array.from({ length: 18 }, () => { const o = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1, 5), tracerMaterial.clone()); o.visible = false; o.userData.life = 0; scene.add(o); return o; });

function sound(f, duration, volume, type = 'square', slide = 0.65) {
  if (!audio) return;
  const osc = audio.createOscillator(), gain = audio.createGain();
  osc.type = type; osc.frequency.setValueAtTime(f, audio.currentTime);
  osc.frequency.exponentialRampToValueAtTime(Math.max(24, f * slide), audio.currentTime + duration);
  gain.gain.setValueAtTime(Math.max(.0001, volume * progress.state.settings.master * progress.state.settings.sfx), audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + duration);
  osc.connect(gain).connect(audio.destination); osc.start(); osc.stop(audio.currentTime + duration);
}
function status(text, color = 'var(--cyan)', duration = 1.7) { ui['status-message'].textContent = text; ui['status-message'].style.color = color; ui['status-message'].classList.add('on'); statusTimer = duration; }
function radio(speaker, text, duration = 4.3) { ui.radio.querySelector('b').textContent = speaker; ui['radio-text'].textContent = text; if (progress.state.settings.subtitles) ui.radio.classList.add('on'); radioTimer = duration; sound(780, 0.045, 0.025, 'sine', 1.2); }
function objective(title, sub, target, label, signal = 'route') { ui['objective-main'].textContent = title; ui['objective-sub'].textContent = sub; ui['objective-main'].parentElement.dataset.signal = signal; ui.waypoint.dataset.signal = signal; if (target) worldTarget.copy(target); ui['waypoint-label'].textContent = label; }
function selectedModel() { return models.get(spec.id); }
function ammo() { return inventory.get(spec.id); }
function updateAmmo() { ui.mag.textContent = String(ammo().magazine).padStart(2, '0'); ui.reserve.textContent = String(ammo().reserve).padStart(3, '0'); ui['weapon-name'].textContent = `${spec.name} // ${spec.role}`; ui['reload-state'].textContent = weapon.reloadRemaining > 0 ? 'RELOADING' : ''; }
function updateHealth() { const max = 100; ui.health.textContent = String(Math.ceil(player.health)); ui['health-fill'].style.transform = `scaleX(${player.health / max})`; ui['health-fill'].style.background = player.health < 30 ? 'var(--red)' : 'var(--cyan)'; }
function disposeGroup(group) { if (!group) return; group.traverse((node) => { node.geometry?.dispose?.(); const mats = Array.isArray(node.material) ? node.material : [node.material]; mats.forEach((m) => { m?.map?.dispose?.(); m?.dispose?.(); }); }); group.removeFromParent(); }
function clearActors() {if(optionalIntel){disposeGroup(optionalIntel);optionalIntel=null;} for(const a of allies)disposeGroup(a.object);allies.length=0; for(const e of effects) disposeGroup(e.object); effects.length=0; for (const enemy of enemies) disposeGroup(enemy.object); enemies.length = 0; for (const pickup of pickups) disposeGroup(pickup.object); pickups.length = 0; }
function spawnPoints() { return arena.spawns.enemies ?? [arena.spawns.enemy, [0, 1.8], [-5, 1], [5, 0], [-5, -7], [5, -8], [0, -12]]; }
function spawnEnemy(commander = false, pointOverride = null) {
  const spots = spawnPoints();
  const index = (mission.kills + enemies.length) % spots.length;
  const point = pointOverride ?? spots[index];
  const role = commander ? 'commander' : ['rifleman','scout','rifleman','heavy','shock','captain'][(enemies.length + level.id - 1) % 6];
  const actor = makeSoldier(THREE, {role,floorHeight:(x,z)=>arena.floorHeightAt(x,z)});
  actor.position.set(point[0], arena.floorHeightAt(...point) + 0.02, point[1]);
  const bossHealth = 210;
  const enemy = { role, path:[],pathTime:0, anchor:point.slice(), awareness: 0, lastSeen: null, phase: 1, rounds: 0, object: actor, commander, maxHealth: commander ? bossHealth : level.enemyHealth+(playMode==='survival'?(wave-1)*6:0), health: commander ? bossHealth : level.enemyHealth+(playMode==='survival'?(wave-1)*6:0), alive: true, state: 'patrol', shots: 0, cooldown: 1.1 + enemies.length * 0.22, hitTimer: 0, recoilTimer: 0, deathTimer: 0, strafe: index % 2 ? 1 : -1, speed: commander ? 1.8 : role === 'scout' ? 2.3 : role === 'heavy' ? .8 : 1.45 };
  const shadowCasters = new Set([actor.userData.joints.body.children[0], actor.userData.joints.body.children[1], actor.userData.joints.head.children[0]]);
  actor.traverse((node) => { if (!node.isMesh) return; node.castShadow = shadowCasters.has(node); node.receiveShadow = true; node.userData.enemy = enemy; if (node.name === 'head_hit') node.userData.hitZone = 'head'; else if (node.name === 'body_hit') node.userData.hitZone = 'body'; });
  scene.add(actor); enemies.push(enemy);
  if (commander) { mission.commanderSpawned = true; ui['commander-hud'].classList.add('on'); radio('COMMAND', 'Kane is at the core. Watch his flank and the reinforcement doors.'); status('COMMANDER INBOUND', 'var(--red)', 2.7); sound(168, 0.65, 0.055, 'sawtooth', 0.35); }
  return enemy;
}
function refreshMenu() {
  for(const o of ui['level-select'].options) o.disabled=!progress.unlocked(o.value);
  for(const o of ui['weapon-select'].options) o.disabled=!progress.owns(o.value);
  ui['weapon-select'].value=progress.state.selectedWeapon;
  interfaceUI?.refresh();
  const chosen = getLevel(ui['level-select'].value || progress.state.selectedLevel);
  ui['brief-title'].textContent = `ACT ${chosen.act} // ${chosen.actName}`;
  ui['brief-text'].textContent = chosen.briefing;
  ui['mission-detail'].textContent = `SITE ${chosen.map.name}  ·  MODE ${chosen.mode.name}  ·  TARGET ${chosen.requiredKills} HOSTILES${chosen.intelRequired ? `  ·  ${chosen.intelRequired} INTEL` : ''}${chosen.commander ? '  ·  COMMANDER' : ''}`;
  $('start-title').innerHTML = 'PROJECT<br>BLACKSITE';
}
for (const item of LEVELS) { const option = document.createElement('option'); option.value = item.id; option.textContent = `${String(item.id).padStart(3, '0')} · ${item.title} · ${item.map.name} / ${item.mode.name}`; ui['level-select'].append(option); }
for (const item of WEAPONS) { const option = document.createElement('option'); option.value = item.id; option.textContent = `${item.name} · ${item.role}`; ui['weapon-select'].append(option); }
ui['level-select'].value = progress.state.selectedLevel;
ui['weapon-select'].value = spec.id;
ui['level-select'].addEventListener('change', () => { progress.selectLevel(ui['level-select'].value); refreshMenu(); });
ui['weapon-select'].addEventListener('change', () => progress.selectWeapon(ui['weapon-select'].value));
refreshMenu();

function loadArena() {
  clearActors(); disposeGroup(arena?.world);
  scene.background = new THREE.Color(0x132132); scene.fog = new THREE.FogExp2(0x1b2730, 0.018);
  arena = !mission.started || level.map.id === 'blacksite' ? buildArena(THREE, scene) : buildMissionArena(THREE, scene, level.map.id);
  arena.cachePositions ??= [[-6.5,0,.3],[7,0,-5],[7.6,0,-14]];
  arena.resetExtraction();
  if(playMode==='extraction')for(let i=arena.cachePositions.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[arena.cachePositions[i],arena.cachePositions[j]]=[arena.cachePositions[j],arena.cachePositions[i]];}
  arena.cachePositions ??= [[-6.5,0,.3],[7,0,-5],[7.6,0,-14]];
  player.position.set(arena.spawns.player[0], 0, arena.spawns.player[1]);
  worldTarget.set(arena.spawns.enemy[0], 1.5, arena.spawns.enemy[1]);
}
function chooseWeapon(id, save = true, announce = true) {
  if (!progress.owns(id)) return;
  train('SWITCH WEAPON');
  spec = weaponById(id);
  if (save) { progress.selectWeapon(spec.id); ui['weapon-select'].value = spec.id; }
  weapon.reloadRemaining = 0; weapon.cooldown = 0; weapon.recoil = 0;
  for (const [name, model] of models) model.visible = mission.started && !mission.paused && player.alive && camMode === 0 && name === spec.id;
  updateAmmo(); if (mission.started && announce) status(`${spec.name} // ${spec.role}`, 'var(--amber)', 1.1);
}
function setCameraMode(index) {
  camMode = (index + camModes.length) % camModes.length;
  avatar.visible = mission.started && !mission.paused && player.alive && camMode !== 0;
  for (const [name, model] of models) model.visible = mission.started && !mission.paused && player.alive && camMode === 0 && name === spec.id;
  status(`CAMERA // ${camModes[camMode]}`, 'var(--amber)', 1.2);
}
function resetMission() {
  player.crouch=false;player.eyeHeight=1.66;
  mission.stage=0; mission.reward=null;teamLosses=0; stageTime=0; checkpoint=null; wave=1;waveTarget=4;
  Object.assign(equipment,{frag:progress.owns('grenadier')?3:2,smoke:1,medkit:progress.owns('medical')?3:2,plate:1}); player.armor=progress.state.upgrades.armor?60:30;
  mission.phase = 'active'; mission.paused = false; mission.started = true; mission.kills = 0; mission.headshots = 0; mission.intel = 0; mission.score = 0; mission.shots = 0; mission.hits = 0; mission.elapsed = 0; mission.objectiveClear = false; mission.commanderSpawned = false; mission.commanderDefeated = false;
  player.velocity.set(0, 0, 0); player.yaw = 0; player.pitch = 0; player.verticalVelocity = 0; player.grounded = true; player.health = 100; player.alive = true; player.damageTaken = 0; player.deaths = 0;
  for (const item of WEAPONS) inventory.set(item.id, { magazine: capacityFor(item, progress.state.upgrades), reserve: item.reserve });
  weapon.cooldown = 0; weapon.recoil = 0; weapon.reloadRemaining = 0; weapon.adsBlend = 0; weapon.flashTimer = 0; weapon.emptyNotified = false;
  for (const o of tracers) { o.visible = false; o.userData.life = 0; }
  ui['status-message'].classList.remove('on'); ui.radio.classList.remove('on');
  statusTimer = 0; radioTimer = 0; hitTimer = 0; damageTimer = 0; ui.damage.style.opacity = '0';
  loadArena(); chooseWeapon(ui['weapon-select'].value || spec.id, true, false); updateHealth();
  for (let i = 0; i < 2; i += 1) spawnEnemy();
  optionalIntel=makeIntel(THREE);optionalIntel.position.set(6.8,.25,12.5);scene.add(optionalIntel);
  if(level.map.id==='command'&&playMode==='campaign'){const engineer=makeSoldier(THREE,{role:'engineer',cloth:0x415765,armor:0x303b41});engineer.position.set(-10,0,5.8);engineer.rotation.y=Math.PI;engineer.userData.pose('idle',1);arena.world.add(engineer);}
  if(playMode==='extraction')for(const pos of arena.cachePositions){const object=makeIntel(THREE);object.position.set(pos[0],.3,pos[2]);scene.add(object);pickups.push({object,collected:false});}
  if(playMode==='team')for(const x of [-2,2]){const object=makeSoldier(THREE,{role:'ally',armor:0x536a73});object.position.set(x,0,arena.spawns.player[1]-2);scene.add(object);allies.push({object,health:100,cooldown:0});}
  saveCheckpoint();
  ui['objective-tag'].textContent = `LEVEL ${String(level.id).padStart(3, '0')} // ${level.map.name} // ${level.mode.name}`;
  ui['mission-progress'].textContent = '';
  ui['commander-hud'].classList.remove('on');
  ui['threat-text'].textContent = 'HOSTILES ACTIVE'; ui.threat.classList.add('alert');
  ui.complete.classList.remove('on'); ui.death.classList.remove('on'); ui.pause.classList.remove('on');
  updateObjective();
}
function startGame() {
  if(!progress.unlocked(ui['level-select'].value))return;
  memory.close();
  level = getLevel(ui['level-select'].value || progress.state.selectedLevel);
  if (!audio) { const Context = window.AudioContext || window.webkitAudioContext; if (Context) audio = new Context(); }
  audio?.resume?.();if(audio&&!soundscape){soundscape=createSoundscape(audio,()=>progress.state.settings);soundscape.ambient();} resetMission();
  ui.start.classList.remove('on'); ui.tutorial.classList.remove('on'); ui.hud.classList.add('on'); ui.touch.classList.add('on');
  input.setEnabled(true); input.requestPointerLock();
  radio('COMMAND', level.id === 1 ? 'Echo One, you are approaching the perimeter. Sentinel patrols are inside. Recover the access log.' : level.briefing, 5.5);
}
window.__START__ = startGame;
window.game = { debug: {
  getState: () => ({ ...window.__GAME__ }),
  hasLineOfSight([x,y,z]) {return !arena.lineBlocked(player.position.x,player.position.z,x,z);},
  teleportPlayer([x, y, z]) {
    if (!mission.started || !Number.isFinite(x) || !Number.isFinite(z) || arena.blocked(x, z)) return false;
    player.position.set(x, Math.max(arena.floorHeightAt(x, z), Number.isFinite(y) ? y : 0), z);
    player.velocity.set(0, 0, 0); player.verticalVelocity = 0; player.grounded = true;
    return true;
  },
  lookAt([x, y, z]) {
    input.consumeLook();
    const dx = x - player.position.x, dz = z - player.position.z;
    player.yaw = -Math.atan2(dx, -dz);
    player.pitch = THREE.MathUtils.clamp(Math.atan2(y - player.position.y - player.eyeHeight, Math.hypot(dx, dz)), -1.25, 1.25);
  },
} };
function menu() { train('PAUSE');if(!mission.started)return; mission.paused = true; player.velocity.set(0, 0, 0); player.speed = 0; input.setEnabled(false); ui.touch.classList.remove('on'); ui.pause.classList.add('on'); ui['pause-detail'].textContent = `LEVEL ${level.id} · ${level.map.name} · ${level.mode.name} · ${mission.kills} KILLS`; if (document.pointerLockElement) document.exitPointerLock(); }
function resume() { mission.paused = false; input.setEnabled(true); ui.pause.classList.remove('on'); ui.touch.classList.add('on'); input.requestPointerLock(); }
function returnToMenu() { training=-1; mission.started = false; mission.paused = false; mission.phase = 'deploy'; progress.resetRun(); input.setEnabled(false); ui.hud.classList.remove('on'); ui.touch.classList.remove('on'); ui.pause.classList.remove('on'); ui.death.classList.remove('on'); ui.complete.classList.remove('on'); ui.tutorial.classList.remove('on'); ui.start.classList.add('on'); avatar.visible = false; for (const model of models.values()) model.visible = false; ui['level-select'].value = level.id; refreshMenu(); if (document.pointerLockElement) document.exitPointerLock(); }
function saveCheckpoint() {
 checkpoint={stage:mission.stage,kills:mission.kills,intel:mission.intel,score:mission.score,headshots:mission.headshots,shots:mission.shots,hits:mission.hits,elapsed:mission.elapsed,pos:player.position.toArray()};
}
function respawn() {
 const saved=checkpoint?structuredClone(checkpoint):null,deaths=player.deaths;
 resetMission();
 if(saved&&playMode==='campaign'){Object.assign(mission,{elapsed:saved.elapsed||0,stage:saved.stage,kills:saved.kills,intel:saved.intel,score:saved.score,headshots:saved.headshots,shots:saved.shots,hits:saved.hits});for(const enemy of enemies)disposeGroup(enemy.object);enemies.length=0;player.position.fromArray(saved.pos);checkpoint=saved;if(level.map.id==='blacksite'&&routeNode().kind==='combat'&&mission.stage===3)spawnBlacksiteCounterattack();}
 player.deaths=deaths;stageTime=0;ui.hud.classList.add('on');resume();updateObjective();status('CHECKPOINT RESTORED');
}
function showTutorial() { ui.tutorial.classList.add('on'); if (mission.started) { mission.paused = true; input.setEnabled(false); ui.touch.classList.remove('on'); ui.pause.classList.remove('on'); if (document.pointerLockElement) document.exitPointerLock(); } }
function hideTutorial() { ui.tutorial.classList.remove('on'); if (mission.started && mission.paused) ui.pause.classList.add('on'); }
function routeNode(){return ROUTES[level.map.id][mission.stage] ?? {kind:'extract',title:'REACH EXTRACTION'};}
function spawnBlacksiteCounterattack(){
 const positions=[[-4.9,-2.9],[-6,-3],[-7.2,-2.6],[-8.3,-2.4]];
 for(let i=0;i<Math.max(0,6-mission.kills);i++){
  const enemy=spawnEnemy(false,positions[i]);enemy.awareness=2;enemy.state='engage';enemy.cooldown=.85;
 }
}
function advanceStage(){
 const old=routeNode();if(old.text){if(!old.counterattack)radio('RECOVERED COMMS',old.text,7);progress.addIntel(old.text);mission.intel++;}
 mission.stage++;stageTime=0;mission.score+=100;saveCheckpoint();updateObjective();sound(720,.16,.03,'sine',1.3);
 if(playMode==='campaign'&&old.counterattack){
  // This is the encounter trigger: make the whole counterattack present now.
  spawnBlacksiteCounterattack();
  radio('COMMAND','E. Kane credential recognized. Four Sentinel contacts inside operations. Clear them, then reach extraction.',7);
  status('COUNTERATTACK · 4 HOSTILES', 'var(--red)',3);
 }
}
function updateObjective(){
 if(training>=0){objective(`TRAINING: ${TRAINING[training]}`,'COMPLETE THE ACTION TO CONTINUE',null,'TRAINING');return;}
 if(playMode==='survival'){objective(`SURVIVE WAVE ${wave}`,`${mission.kills}/${waveTarget} HOSTILES · E AT BEACON TO BANK REWARDS`,arena.extractionPosition,'EXTRACT');return;}
 if(playMode==='team'){objective('TEAM BATTLE',`${mission.kills}/12 ECHO · ${teamLosses}/12 SENTINEL`,enemies.find(e=>e.alive)?.object.position,'HOSTILE');return;}
 if(playMode==='extraction'){const target=arena.cachePositions[mission.intel%arena.cachePositions.length];objective(mission.intel<3?'RECOVER FIELD CACHE':'REACH EXTRACTION',mission.intel<3?`${mission.intel}/3 CACHES · E / USE TO RECOVER`:'BANK YOUR INTELLIGENCE',mission.intel<3?new THREE.Vector3(...target):arena.extractionPosition,'CACHE');return;}
 const node=routeNode();const target=node.pos?new THREE.Vector3(...node.pos):node.kind==='extract'?arena.extractionPosition:enemies.find(e=>e.alive)?.object.position;
 objective(node.title,node.kind==='interact'?(node.autoRange?'APPROACH TERMINAL / E TO ACCESS':'E / USE TO INTERACT'):node.kind==='hold'?`HOLD POSITION · ${Math.max(0,Math.ceil(node.seconds-stageTime))}s`:node.kills?`${mission.kills}/${node.kills} HOSTILES`:node.deadline?`${Math.max(0,Math.ceil(node.deadline-stageTime))}s TO DETONATION`:'FOLLOW THE WAYPOINT',target,node.kind==='extract'?'EXTRACT':node.kind==='interact'?'TERMINAL':'OBJECTIVE');
 ui['mission-progress'].textContent=`${level.title} · ${mission.stage+1}/${ROUTES[level.map.id].length}`;
}
function evaluateObjective(){
 if(playMode!=='campaign'||training>=0)return;
 const node=routeNode();
 if(node.kind==='combat'&&mission.kills>=node.kills)advanceStage();
 if(node.kind==='boss'&&!mission.commanderSpawned){spawnEnemy(true);mission.phase='commander';}
 if(node.kind==='boss'&&mission.commanderDefeated)advanceStage();
 if(routeNode().kind==='extract'&&!mission.objectiveClear){mission.objectiveClear=true;mission.phase='extract';arena.activateExtraction();}
}
function dropIntel(enemy) { if (mission.intel + pickups.length >= level.intelRequired) return; const object = makeIntel(THREE); object.position.set(enemy.object.position.x, 0.18, enemy.object.position.z); object.userData.baseY = object.position.y; scene.add(object); pickups.push({ object, collected: false }); status('INTEL DROPPED', 'var(--cyan)'); }
function killEnemy(enemy, headshot) {
  enemy.alive = false; enemy.state = 'dead'; enemy.deathTimer = 0; mission.kills += 1; if (headshot) mission.headshots += 1;
  mission.score += 100 + (headshot ? 50 : 0) + (enemy.commander ? 400 : 0);
  if (progress.state.upgrades.adrenaline) { player.health = Math.min(100, player.health + 8); updateHealth(); }
  if (enemy.commander) { mission.commanderDefeated = true; ui['commander-hud'].classList.remove('on'); radio('COMMAND', 'Commander neutralized. The uplink channel is clear.'); status('COMMANDER DOWN +400', 'var(--amber)', 2.5); }
  else if (false) dropIntel(enemy);
  else status(headshot ? 'HEADSHOT +150' : 'HOSTILE DOWN +100', 'var(--amber)');
  sound(96, 0.20, 0.045, 'sawtooth', 0.45); evaluateObjective(); updateObjective();
}
function tracer(from, to, color = 0xffa142) { const o = tracers.find((item) => item.userData.life <= 0) ?? tracers[0]; const direction = to.clone().sub(from); const len = direction.length(); o.material.color.setHex(color); o.material.opacity = 0.82; o.position.copy(from).addScaledVector(direction, 0.5); o.scale.set(1, len, 1); o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize()); o.visible = true; o.userData.life = 0.07; }
function beginReload() { train('RELOAD'); if (!player.alive || weapon.reloadRemaining > 0 || ammo().magazine >= capacityFor(spec, progress.state.upgrades) || ammo().reserve <= 0) return; weapon.reloadDuration = reloadFor(spec, progress.state.upgrades); weapon.reloadRemaining = weapon.reloadDuration; input.state.fire = false; updateAmmo(); sound(185, 0.1, 0.025, 'triangle', 0.72); }
function finishReload() { const pack = ammo(); const loaded = Math.min(capacityFor(spec, progress.state.upgrades) - pack.magazine, pack.reserve); pack.magazine += loaded; pack.reserve -= loaded; weapon.reloadRemaining = 0; weapon.emptyNotified = false; updateAmmo(); sound(410, 0.07, 0.024, 'square', 0.75); }
function fireWeapon() {
  if (!player.alive || mission.paused || weapon.cooldown > 0 || weapon.reloadRemaining > 0) return;
  const pack = ammo();
  if (pack.magazine <= 0) { if (!weapon.emptyNotified) { sound(125, 0.05, 0.02); status('MAGAZINE EMPTY // RELOAD', 'var(--amber)'); weapon.emptyNotified = true; } weapon.cooldown = 0.2; return; }
  train('FIRE'); pack.magazine -= 1; mission.shots += 1; weapon.cooldown = spec.interval; weapon.recoil = Math.min(1.5, weapon.recoil + spec.recoil*(progress.owns('vertical')?.8:1)*(progress.owns('compensator')?.75:1)); weapon.flashTimer = 0.045; updateAmmo(); if(!soundscape?.shot(spec.id))sound(spec.id === 'breacher' ? 62 : 88, 0.075, 0.045, 'sawtooth', 0.32);
  const spread = input.state.ads ? spec.adsSpread*(progress.owns('reddot')?.8:1) : spec.spread*(progress.owns('laser')?.75:1);
  if(input.state.ads&&progress.state.settings.aimAssist&&matchMedia('(pointer:coarse)').matches){const forward=new THREE.Vector3();camera.getWorldDirection(forward);const target=enemies.filter(e=>e.alive).find(e=>{const d=e.object.position.clone().add(new THREE.Vector3(0,1.25,0)).sub(camera.position).normalize();return forward.dot(d)>.998&&!arena.lineBlocked(player.position.x,player.position.z,e.object.position.x,e.object.position.z);});if(target){const d=target.object.position.clone().add(new THREE.Vector3(0,1.25,0)).sub(camera.position);player.yaw=THREE.MathUtils.lerp(player.yaw,-Math.atan2(d.x,-d.z),.15);}}
  let endpoint = null, hitAny = false;
  for (let pellet = 0; pellet < spec.pellets; pellet += 1) {
    const pattern = mission.shots * 13 + pellet * 17;
    aim.set(Math.sin(pattern * 1.27) * spread, Math.cos(pattern * 1.89) * spread);
    raycaster.setFromCamera(aim, camera); raycaster.far = spec.range;
    const hits = enemies.filter((enemy) => enemy.alive).flatMap((enemy) => raycaster.intersectObject(enemy.object, true)).sort((a, b) => a.distance - b.distance);
    const hit = hits[0];
    if (hit && !arena.lineBlocked(player.position.x, player.position.z, hit.point.x, hit.point.z)) {
      const enemy = hit.object.userData.enemy; const headshot = hit.object.userData.hitZone === 'head';
      enemy.health -= damageFor(spec, progress.state.upgrades) * (headshot ? 1.8 : 1);
      enemy.hitTimer = 0.2; if (!hitAny) mission.hits += 1; hitAny = true; endpoint = hit.point;
      ui.reticle.classList.toggle('headshot', headshot); ui.reticle.classList.add('hit'); hitTimer = 0.11;
      sound(headshot ? 720 : 520, 0.035, 0.016, 'sine', 0.8);
      if (enemy.health <= 0 && enemy.alive) killEnemy(enemy, headshot);
    } else if (!endpoint) endpoint = raycaster.ray.origin.clone().addScaledVector(raycaster.ray.direction, spec.range);
  }
  selectedModel().updateWorldMatrix(true, true);
  tracer(selectedModel().userData.muzzle.getWorldPosition(new THREE.Vector3()), endpoint ?? raycaster.ray.origin.clone().addScaledVector(raycaster.ray.direction, spec.range));
}
function damagePlayer(amount, source) {
  if (!player.alive || training>=0) return; const absorbed=Math.min(player.armor,amount*.65);player.armor-=absorbed;amount-=absorbed; player.health = Math.max(0, player.health - amount); player.damageTaken += amount; updateHealth();
  ui.damage.style.opacity = String(Math.min(0.8, 0.3 + amount / 45)); damageTimer = 0.24;
  ui['damage-direction'].style.transform = `rotate(${Math.atan2(source.x - player.position.x, source.z - player.position.z) - player.yaw}rad)`; ui['damage-direction'].classList.add('on');
  sound(58, 0.14, 0.05, 'sawtooth', 0.5);
  if (player.health <= 0) { player.alive = false; player.deaths += 1; player.velocity.set(0, 0, 0); player.speed = 0; mission.phase = 'failed'; input.setEnabled(false); ui.touch.classList.remove('on'); ui.hud.classList.remove('on'); ui.death.classList.add('on'); if (document.pointerLockElement) document.exitPointerLock(); }
}
function movement(dt) {
  const axes = input.movement(); if(Math.hypot(axes.x,axes.y)>.1)train('MOVE');if(input.state.sprint)train('SPRINT');if(input.state.ads)train('AIM'); const upgrades = progress.state.upgrades; const magnitude = Math.min(1, Math.hypot(axes.x, axes.y));
  const maxSpeed = (player.crouch ? 1.8 : input.state.sprint && !input.state.ads ? 6.4 : input.state.ads ? 2.8 : 4.5) * (upgrades.runner ? 1.12 : 1)*(spec.movement||1);
  const sin = Math.sin(player.yaw), cos = Math.cos(player.yaw);
  const goalX = (axes.x * cos - axes.y * sin) * maxSpeed, goalZ = (-axes.x * sin - axes.y * cos) * maxSpeed;
  const accel = player.grounded ? (magnitude ? 22 : 30) : 7;
  player.velocity.x = THREE.MathUtils.damp(player.velocity.x, goalX, accel, dt); player.velocity.z = THREE.MathUtils.damp(player.velocity.z, goalZ, accel, dt);
  const axis = (key, delta) => { const x = key === 'x' ? player.position.x + delta : player.position.x; const z = key === 'z' ? player.position.z + delta : player.position.z; const nextFloor = arena.floorHeightAt(x, z); if (arena.blocked(x, z) || (player.grounded && nextFloor - player.position.y > 0.27)) { player.velocity[key] = 0; return; } player.position[key] += delta; if (player.grounded && nextFloor > player.position.y) player.position.y = nextFloor; };
  axis('x', player.velocity.x * dt); axis('z', player.velocity.z * dt);
  const ground = arena.floorHeightAt(player.position.x, player.position.z);
  if (input.consumeJump() && player.grounded) { train('JUMP'); player.verticalVelocity = 5.25; player.grounded = false; sound(120, 0.05, 0.012, 'triangle'); }
  if (!player.grounded || player.position.y > ground + 0.002) { player.verticalVelocity -= 14.5 * dt; player.position.y += player.verticalVelocity * dt; if (player.position.y <= ground) { player.position.y = ground; player.verticalVelocity = 0; player.grounded = true; } }
  else { player.position.y = ground; player.verticalVelocity = 0; player.grounded = true; }
  player.speed = Math.hypot(player.velocity.x, player.velocity.z);
  footstepClock+=dt*player.speed;if(footstepClock>1.8&&player.grounded){footstepClock=0;soundscape?.noise(.12,.045,500);}
  const look = input.consumeLook(); const sensitivity = (input.state.ads ? 0.00145 : 0.00235)*progress.state.settings.sensitivity; if(Math.abs(look.x)+Math.abs(look.y)>1)train('LOOK');
  player.yaw -= look.x * sensitivity; player.pitch = THREE.MathUtils.clamp(player.pitch - look.y * sensitivity, -1.25, 1.25);
}
function updateEnemies(dt) {
  // Retire bodies after the reaction has played; endless waves must stay bounded.
  for(let i=enemies.length-1;i>=0;i--)if(!enemies[i].alive&&enemies[i].deathTimer>8){disposeGroup(enemies[i].object);enemies.splice(i,1);}
  const bodies=enemies.filter(e=>!e.alive);for(const e of bodies.slice(0,-2)){disposeGroup(e.object);enemies.splice(enemies.indexOf(e),1);}
  for (const enemy of enemies) {
    if (!enemy.alive) { enemy.deathTimer += dt; enemy.object.userData.pose('dead', mission.elapsed, 0, 0); enemy.object.rotation.z = THREE.MathUtils.damp(enemy.object.rotation.z, -1.38, 8, dt); continue; }
    const alliedTarget=playMode==='team'?allies.filter(a=>a.health>0).sort((a,b)=>a.object.position.distanceTo(enemy.object.position)-b.object.position.distanceTo(enemy.object.position))[0]:null;
    const targetActor=alliedTarget&&alliedTarget.object.position.distanceTo(enemy.object.position)<player.position.distanceTo(enemy.object.position)?alliedTarget:null;
    const targetPos=targetActor?targetActor.object.position:player.position;
    const dx = targetPos.x - enemy.object.position.x, dz = targetPos.z - enemy.object.position.z, distance = Math.max(0.01, Math.hypot(dx, dz));
    const visible = !effects.some(e=>e.kind==='smoke'&&e.object.position.distanceTo(player.position)<5)&&!arena.lineBlocked(enemy.object.position.x, enemy.object.position.z, targetPos.x, targetPos.z);
    enemy.object.rotation.y=Math.atan2(dx,dz);
    enemy.awareness=Math.max(0,enemy.awareness+dt*(visible&&distance<23?1:-.2));
    if(mission.shots>0&&distance<(progress.owns('suppressor')?7:18))enemy.awareness=Math.max(.65,enemy.awareness);
    if(enemies.some(e=>e!==enemy&&e.awareness>1.4&&e.object.position.distanceTo(enemy.object.position)<12))enemy.awareness+=dt*.5;
    enemy.state=enemy.awareness<.5?'patrol':enemy.awareness<1?'investigate':visible?'engage':'search';
    if(enemy.awareness<.5){const walk=Math.sin(mission.elapsed*.5+enemies.indexOf(enemy))*.45;const z=enemy.anchor[1]+walk;if(!arena.blocked(enemy.anchor[0],z,.36))enemy.object.position.z=z;enemy.object.userData.pose('walk',mission.elapsed,0,0,.2);continue;}
    if(enemy.commander){const phase=enemy.health<70?3:enemy.health<140?2:1;if(phase>enemy.phase){enemy.phase=phase;spawnEnemy();radio('KANE',phase===2?'Seal the exits. Reinforcements to the core.':'AEGIS is already awake.');}enemy.speed=phase===3?2.5:1.8;}
    enemy.hitTimer = Math.max(0, enemy.hitTimer - dt); enemy.recoilTimer = Math.max(0, enemy.recoilTimer - dt);
    const forwardX = dx / distance, forwardZ = dz / distance;
    let mx = 0, mz = 0;
    if (distance > (enemy.commander ? 7 : 9)) { mx = forwardX; mz = forwardZ; }
    else if (distance < 4) { mx = -forwardX; mz = -forwardZ; }
    else { mx = -forwardZ * enemy.strafe; mz = forwardX * enemy.strafe; }
    const prevX = enemy.object.position.x, prevZ = enemy.object.position.z;
    enemy.pathTime-=dt;
    if(!visible){if(enemy.pathTime<=0){enemy.path=findPath([prevX,prevZ],[targetPos.x,targetPos.z],arena.blocked);enemy.pathTime=1.2;}const next=enemy.path[0];if(next){const d=Math.hypot(next[0]-prevX,next[1]-prevZ);if(d<.3)enemy.path.shift();else{mx=(next[0]-prevX)/d;mz=(next[1]-prevZ)/d;}}}
    if(visible&&enemy.role==='scout'&&distance>6){mx=-forwardZ*enemy.strafe; mz=forwardX*enemy.strafe;enemy.state='flank';}
    if(enemy.role==='heavy'&&distance<16){mx=0;mz=0;enemy.state='suppress';}
    if(enemy.health<25&&distance<8){mx=-forwardX;mz=-forwardZ;enemy.state='retreat';}
    const nx = enemy.object.position.x + mx * enemy.speed * dt, nz = enemy.object.position.z + mz * enemy.speed * dt;
    if (!arena.blocked(nx, enemy.object.position.z, 0.36)&&arena.floorHeightAt(nx,enemy.object.position.z)-enemy.object.position.y<.27) enemy.object.position.x = nx; else enemy.strafe *= -1;
    if (!arena.blocked(enemy.object.position.x, nz, 0.36)&&arena.floorHeightAt(enemy.object.position.x,nz)-enemy.object.position.y<.27) enemy.object.position.z = nz; else enemy.strafe *= -1;
    enemy.object.position.y = arena.floorHeightAt(enemy.object.position.x, enemy.object.position.z) + 0.02;
    const motion = THREE.MathUtils.clamp(Math.hypot(enemy.object.position.x - prevX, enemy.object.position.z - prevZ) / Math.max(dt * 2, 0.001), 0, 1);
    enemy.object.userData.pose(enemy.cooldown>2?'reload':motion>.05?'aimWalk':'aim', mission.elapsed + enemies.indexOf(enemy) * 0.3, enemy.hitTimer, enemy.recoilTimer / 0.12, motion);
    enemy.cooldown -= dt;
    if (enemy.awareness<1 || !visible || distance > 24 || enemy.cooldown > 0 || !player.alive) continue;
    enemy.shots += 1; enemy.recoilTimer = 0.12;
    const muzzle = enemy.object.userData.joints.muzzle.getWorldPosition(new THREE.Vector3());
    const target = new THREE.Vector3(targetPos.x + Math.sin(enemy.shots * 12.9898) * 0.6, targetPos.y + 1.3, targetPos.z);
    tracer(muzzle, target, enemy.commander ? 0xff2c38 : 0xff573f); sound(enemy.commander ? 74 : 105, 0.075, 0.025, 'sawtooth', 0.42);
    const chance = THREE.MathUtils.clamp(0.60 - distance * 0.015 - player.speed * 0.022, 0.22, 0.58);
    if ((Math.sin(enemy.shots * 91.731 + enemies.indexOf(enemy) * 9.1) + 1) / 2 < chance) {if(targetActor){targetActor.health-=level.enemyDamage;if(targetActor.health<=0){teamLosses++;targetActor.object.rotation.z=1.4;targetActor.respawn=4;}}else damagePlayer((enemy.commander ? level.enemyDamage * 1.45 : level.enemyDamage)*(progress.state.settings.difficulty==='recruit'?.65:progress.state.settings.difficulty==='veteran'?1.5:1), enemy.object.position);}
    enemy.cooldown = (enemy.commander ? 0.55 : 0.95) + (Math.sin(enemy.shots * 3.1) + 1) * 0.25;
    if (enemy.shots % 3 === 0) enemy.strafe *= -1;
    if(enemy.shots%9===0){enemy.cooldown=2.6;enemy.state='reload';}
    if(enemy.role==='heavy')enemy.cooldown*=.7;
  }
}
function updateAllies(dt){
 for(const a of allies){
  if(a.health<=0){a.respawn-=dt;if(a.respawn<=0){a.health=100;a.object.rotation.z=0;a.object.position.set(2,0,arena.spawns.player[1]-2);}continue;}
  const target=enemies.filter(e=>e.alive).sort((x,y)=>x.object.position.distanceTo(a.object.position)-y.object.position.distanceTo(a.object.position))[0];if(!target)continue;
  const delta=target.object.position.clone().sub(a.object.position),distance=delta.length();a.object.rotation.y=Math.atan2(delta.x,delta.z);
  if(distance>8){delta.normalize().multiplyScalar(dt*1.6);if(!arena.blocked(a.object.position.x+delta.x,a.object.position.z+delta.z,.4))a.object.position.add(delta);}
  a.object.userData.pose('aimWalk',mission.elapsed,0,0,distance>8?.6:0);a.cooldown-=dt;
  if(a.cooldown<=0&&!arena.lineBlocked(a.object.position.x,a.object.position.z,target.object.position.x,target.object.position.z)){
   a.cooldown=1.3;const from=a.object.userData.joints.muzzle.getWorldPosition(new THREE.Vector3());tracer(from,target.object.position.clone().add(new THREE.Vector3(0,1.2,0)),0x75cde2);target.health-=18;if(target.health<=0)killEnemy(target,false);
  }
 }
}
function updateObjectives(dt){
 mission.elapsed+=dt;stageTime+=dt;updateEffects(dt);
 if(optionalIntel?.visible&&interaction&&Math.hypot(player.position.x-optionalIntel.position.x,player.position.z-optionalIntel.position.z)<2){optionalIntel.visible=false;const lore=['Reyes treated three operators after the first blast. No extraction manifest lists her.','Shipping record: AEGIS fragments moved under medical transport clearance.','Encrypted message: Daniel, do not reconnect the network. — M.R.','Core log: Command authority was delegated before Sentinel arrived.'][level.id-1];const awarded=progress.intelReward(lore);radio('FIELD INTEL',lore);status(awarded?'INTEL SECURED · +50 CREDITS':'INTEL ALREADY ARCHIVED');}
 if(training>=0){updateObjective();interaction=false;return;}
 const node=routeNode();
 let targetKills=playMode==='survival'?waveTarget:playMode==='team'?12:playMode==='extraction'?8:node.kills??(mission.stage===0?2:mission.kills);
 const alive=enemies.filter(e=>e.alive&&!e.commander).length;
 if(targetKills>mission.kills+alive&&alive<(playMode==='survival'?Math.min(6,2+Math.floor(wave/2)):level.maxAlive)&&mission.elapsed>1)spawnEnemy();
 if(playMode==='campaign'){
  if(node.kind==='reach'&&player.position.distanceTo(new THREE.Vector3(...node.pos))<2.5)advanceStage();
  if(node.kind==='interact'&&player.position.distanceTo(new THREE.Vector3(...node.pos))<(interaction?2.5:(node.autoRange??0)))advanceStage();
  if(node.kind==='hold'){if(player.position.distanceTo(new THREE.Vector3(...node.pos))>6)stageTime=Math.max(0,stageTime-dt);if(stageTime>=node.seconds&&mission.kills>=(node.kills||0))advanceStage();}
  evaluateObjective();
  if(node.deadline&&stageTime>node.deadline)damagePlayer(500,player.position);
 }else if(playMode==='survival'){
  if(mission.kills>=waveTarget){wave++;waveTarget+=3+wave;player.health=Math.min(100,player.health+20);ammo().reserve+=45;status(`WAVE ${wave} · SUPPLIES RECEIVED`);}
  if(interaction&&mission.kills>=4&&player.position.distanceTo(arena.extractionPosition)<3)completeMission();
 }else if(playMode==='team'){
  if(mission.kills>=12)completeMission();if(teamLosses>=12)damagePlayer(500,player.position);
 }else{
  if(interaction&&mission.intel<3&&player.position.distanceTo(new THREE.Vector3(...arena.cachePositions[mission.intel%arena.cachePositions.length]))<3){pickups[mission.intel].object.visible=false;mission.intel++;mission.score+=100;status('CACHE SECURED');}
  if(mission.intel>=3){mission.objectiveClear=true;arena.activateExtraction();}
 }
 if(mission.objectiveClear&&player.position.distanceTo(arena.extractionPosition)<2.5)completeMission();
 interaction=false;updateObjective();
}
function completeMission() {
  if(mission.phase==='complete')return;
  mission.phase = 'complete'; mission.score += 500 + Math.max(0, Math.round(240 - mission.elapsed)); mission.reward=playMode==='campaign'?progress.complete(level.id,{...mission}):progress.rewardMode(mission.kills,playMode==='survival'?wave-1:0);interfaceUI?.refresh();
  player.velocity.set(0, 0, 0); player.speed = 0;
  input.setEnabled(false); ui.touch.classList.remove('on'); ui.hud.classList.remove('on'); ui.complete.classList.add('on');
  const accuracy = mission.shots ? Math.round(mission.hits / mission.shots * 100) : 0;
  ui['complete-stats'].textContent = `LEVEL ${level.id} // ${level.map.name} // ${Math.round(mission.elapsed)}s // ${mission.kills} KILLS // ${mission.headshots} HEADSHOTS // ${accuracy}% ACCURACY // ${player.deaths} DEATHS // ${mission.score} SCORE`;
  ui['complete-stats'].textContent+=` · +${mission.reward?.credits||0} CREDITS · +${mission.reward?.xp||0} XP`;
  const rewards=document.createElement('div');rewards.className='reward-breakdown';for(const [key,value]of Object.entries(mission.reward||{})){if(typeof value==='number'){const row=document.createElement('span');row.textContent=`${({base:'BASE REWARD',objective:'OBJECTIVE BONUS',accuracy:'ACCURACY BONUS',headshot:'HEADSHOT BONUS',difficulty:'DIFFICULTY BONUS',credits:'TOTAL CREDITS',xp:'XP GAINED'})[key]||key.toUpperCase()} / ${value}`;rewards.append(row);}}ui['complete-stats'].append(rewards);if(playMode==='campaign'&&!mission.reward.replay){const unlocked=SHOP.filter(item=>item.unlock===level.id&&item.category==='WEAPONS').map(item=>item.name).join(' / ');const note=document.createElement('p');note.textContent=`ARSENAL UNLOCKED: ${unlocked}`;ui['complete-stats'].append(note);}
  const choices = UPGRADES.filter((upgrade) => !progress.state.upgrades[upgrade.id]).sort((a, b) => ((a.id.charCodeAt(0) + level.id * 7) % 13) - ((b.id.charCodeAt(0) + level.id * 7) % 13)).slice(0, 0);
  ui['upgrade-choices'].replaceChildren();
  for (const choice of choices) { const button = document.createElement('button'); button.type = 'button'; button.innerHTML = `<b>${choice.name}</b><small>${choice.effect}</small>`; button.addEventListener('click', () => { progress.setUpgrade(choice.id, true); ui['upgrade-choices'].replaceChildren(); status(`${choice.name} EQUIPPED`); }); ui['upgrade-choices'].append(button); }
  $('again').textContent = playMode!=='campaign'?'PLAY AGAIN':level.id >= 4 ? 'RETURN TO MAIN MENU' : `NEXT LEVEL ${String(level.id + 1).padStart(3, '0')}`;
  sound(440, 0.18, 0.035, 'sine', 1.5); if (document.pointerLockElement) document.exitPointerLock();
}
function updateWaypoint() { const target = worldTarget.clone(); const distance = Math.hypot(target.x - player.position.x, target.z - player.position.z); target.project(camera); let x = (target.x * 0.5 + 0.5) * 100, y = (-target.y * 0.5 + 0.5) * 100; if (target.z > 1) { x = 100 - x; y = 12; } ui.waypoint.style.left = `${THREE.MathUtils.clamp(x, 8, 92)}%`; ui.waypoint.style.top = `${THREE.MathUtils.clamp(y, 13, 43)}%`; ui['waypoint-distance'].textContent = `${Math.ceil(distance)}m`; }
function updateCameraAndWeapon(dt) {
  const activeModel = selectedModel(); const adsTarget = input.state.ads && !input.state.sprint && weapon.reloadRemaining <= 0 ? 1 : 0;
  weapon.adsBlend = THREE.MathUtils.damp(weapon.adsBlend, adsTarget, progress.owns('angled')?20:14, dt);
  camera.fov = THREE.MathUtils.lerp(innerWidth < innerHeight ? 86 : 72, progress.owns('magnifier')?42:innerWidth < innerHeight ? 67 : 54, weapon.adsBlend); camera.updateProjectionMatrix();
  ui.hud.classList.toggle('ads', weapon.adsBlend > 0.55);
  const bob = player.grounded ? Math.sin(mission.elapsed * 9.5) * Math.min(player.speed / 6.4, 1) : 0;
  activeModel.position.copy(tmp.copy(hip).lerp(sight, weapon.adsBlend)); activeModel.position.x += bob * 0.008 * (progress.owns('stock')?.6:1) * (1 - weapon.adsBlend); activeModel.position.y += -Math.abs(bob) * 0.006 - weapon.recoil * 0.032; activeModel.position.z += weapon.recoil * 0.045;
  activeModel.rotation.set(0, Math.PI, bob * 0.009 * (1 - weapon.adsBlend));
  const parts = activeModel.userData.parts;
  if (weapon.reloadRemaining > 0) {
    const phase = 1 - weapon.reloadRemaining / weapon.reloadDuration;
    const arc = Math.sin(phase * Math.PI);
    activeModel.rotation.z -= arc * (spec.id === 'breacher' ? 0.48 : 0.64);
    activeModel.rotation.x += arc * 0.18;
    activeModel.position.y -= arc * 0.15;
    parts.magazine.position.y = -0.27 - Math.sin(Math.min(1, phase * 2.2) * Math.PI) * 0.25;
    if (parts.reloadShell) { parts.reloadShell.visible = phase > 0.16 && phase < 0.83; parts.reloadShell.position.set(0.23 - phase * 0.15, -0.32 + phase * 0.27, 0.12); }
  } else { parts.magazine.position.y = -0.27; if (parts.reloadShell) parts.reloadShell.visible = false; }
  parts.bolt.position.z = 0.17 - weapon.recoil * 0.11; parts.flash.material.opacity = weapon.flashTimer > 0 ? Math.min(1, weapon.flashTimer * 26) : 0;
  player.eyeHeight=THREE.MathUtils.damp(player.eyeHeight,player.crouch?1.12:1.66,12,dt);
  const eye = new THREE.Vector3(player.position.x, player.position.y + player.eyeHeight + Math.abs(bob) * 0.012, player.position.z);
  camera.rotation.order = 'YXZ'; camera.rotation.set(player.pitch - weapon.recoil * 0.012*progress.state.settings.shake, player.yaw, 0);
  if (camMode === 0) camera.position.copy(eye);
  else { const side = camMode === 1 ? -1 : 1; const offset = new THREE.Vector3(side * 0.85, 0.38, 2.5).applyAxisAngle(new THREE.Vector3(0, 1, 0), player.yaw); camera.position.copy(eye).add(offset); }
  avatar.visible = camMode !== 0 && mission.started && !mission.paused && player.alive;
  if (avatar.visible) { avatar.position.copy(player.position); avatar.rotation.y = player.yaw + Math.PI; avatar.userData.pose('alert', mission.elapsed, 0, 0, Math.min(1, player.speed / 4.5)); }
  tacticalLight.intensity=progress.owns('light')?12:0;
  activeModel.visible = camMode === 0 && mission.started && !mission.paused && player.alive;
}

$('startb').addEventListener('click', startGame);
$('tutorial-open').addEventListener('click', showTutorial); $('tutorial-close').addEventListener('click', hideTutorial); $('pause-guide').addEventListener('click', showTutorial);
$('pause-settings').addEventListener('click', () => { ui.pause.classList.remove('on'); $('settings').classList.add('on'); });
for (const button of document.querySelectorAll('[data-panel]')) button.addEventListener('click', () => $(button.dataset.panel)?.classList.add('on'));
for (const button of document.querySelectorAll('[data-focus]')) button.addEventListener('click', () => $(button.dataset.focus)?.scrollIntoView({ block: 'center', behavior: 'smooth' }));
for (const button of document.querySelectorAll('.panel-close')) button.addEventListener('click', () => {
  button.closest('.screen')?.classList.remove('on');
  if (mission.started && mission.paused) ui.pause.classList.add('on');
});
$('pause-button').addEventListener('click', menu); $('menu-button').addEventListener('click', menu); $('resume').addEventListener('click', resume);
$('pause-restart').addEventListener('click', () => { resetMission(); resume(); }); $('death-restart').addEventListener('click', () => { resetMission(); ui.hud.classList.add('on'); resume(); });
$('respawn').addEventListener('click', respawn); $('retry').addEventListener('click', respawn);
$('pause-menu').addEventListener('click', () => interfaceUI.confirmQuit()); $('results-menu').addEventListener('click', returnToMenu);
$('pause-camera').addEventListener('click', () => setCameraMode(camMode + 1)); 
$('swap').addEventListener('click', () => chooseWeapon(ownedWeapons()[(ownedWeapons().findIndex(item=>item.id===spec.id)+1)%ownedWeapons().length].id));
$('again').addEventListener('click', () => { if(playMode!=='campaign'){resetMission();ui.hud.classList.add('on');ui.touch.classList.add('on');input.setEnabled(true);input.requestPointerLock();return;}if(level.id===4&&playMode==='campaign'){returnToMenu();return;} ui['level-select'].value = Math.min(4, level.id + 1); level = getLevel(ui['level-select'].value); resetMission(); ui.complete.classList.remove('on'); ui.hud.classList.add('on'); ui.touch.classList.add('on'); input.setEnabled(true); input.requestPointerLock(); radio('COMMAND', level.briefing, 5.4); });
$('replay').addEventListener('click', () => { resetMission(); ui.complete.classList.remove('on'); ui.hud.classList.add('on'); ui.touch.classList.add('on'); input.setEnabled(true); input.requestPointerLock(); });
addEventListener('keydown', (event) => { if (event.code === 'Escape' && mission.started && player.alive && !['complete','failed'].includes(mission.phase)) { if (mission.paused) resume(); else menu(); } if (!mission.started || mission.paused || !player.alive) return; if (/^Digit[1-6]$/.test(event.code) && !event.repeat) chooseWeapon(WEAPONS[Number(event.code.slice(-1)) - 1].id); if (event.code === 'KeyQ' && !event.repeat) chooseWeapon(ownedWeapons()[(ownedWeapons().findIndex(item=>item.id===spec.id)+1)%ownedWeapons().length].id); if (event.code === 'KeyC' && !event.repeat){player.crouch=!player.crouch;train('CROUCH');} if(event.code==='KeyE'){interaction=true;train('INTERACT');}if(event.code==='KeyG'&&!event.repeat)useEquipment('frag');if(event.code==='KeyH'&&!event.repeat)useEquipment('medkit');if(event.code==='KeyB'&&!event.repeat)useEquipment('plate');if(event.code==='KeyX'&&!event.repeat)useEquipment('smoke');if(event.code==='KeyM'){train('MAP / OBJECTIVE');status(routeNode().title,'var(--cyan)',4);} });
renderer.domElement.addEventListener('click', () => { if (mission.started && !mission.paused && player.alive) input.requestPointerLock(); });


function ownedWeapons(){return WEAPONS.filter(w=>progress.owns(w.id));}
function train(action){
 if(training<0||TRAINING[training]!==action)return;
 training++; if(training>=TRAINING.length){training=-1;returnToMenu();status('TRAINING COMPLETE');}else updateObjective();
}
function useEquipment(kind){
 if(!mission.started||mission.paused||!player.alive||equipment[kind]<=0)return;
 if(kind==='medkit'){if(player.health>=100&&training<0)return;player.health=Math.min(100,player.health+55);train('MEDKIT');updateHealth();}
 else if(kind==='plate'){if(player.armor>=60)return;player.armor=Math.min(60,player.armor+40);}
 else{
  const object=new THREE.Mesh(new THREE.SphereGeometry(.09,8,6),new THREE.MeshStandardMaterial({color:kind==='frag'?0x607052:0xa5aaa6}));
  object.position.copy(player.position).add(new THREE.Vector3(0,1.3,0));
  const velocity=new THREE.Vector3(0,3,-9).applyAxisAngle(new THREE.Vector3(0,1,0),player.yaw);
  effects.push({object,velocity,life:kind==='frag'?1.6:1.2,kind,active:false});scene.add(object);train('GRENADE');
 }
 equipment[kind]--;sound(200,.1,.025,'triangle');status(`${kind.toUpperCase()} · ${equipment[kind]} REMAINING`);
}
function updateEffects(dt){
 for(let i=effects.length-1;i>=0;i--){const e=effects[i];e.life-=dt;
  if(!e.active){e.velocity.y-=10*dt;const next=e.object.position.clone().addScaledVector(e.velocity,dt);if(arena.blocked(next.x,next.z,.1)){e.velocity.x*=-.4;e.velocity.z*=-.4;}else e.object.position.copy(next);const floor=arena.floorHeightAt(e.object.position.x,e.object.position.z)+.1;if(e.object.position.y<floor){e.object.position.y=floor;e.velocity.multiplyScalar(.4);e.velocity.y=Math.abs(e.velocity.y);}}
  if(e.life<=0&&!e.active){e.active=true;
   if(e.kind==='frag'){sound(45,.45,.1,'sawtooth',.4);for(const enemy of enemies){const d=enemy.object.position.distanceTo(e.object.position);if(enemy.alive&&d<6&&!arena.lineBlocked(e.object.position.x,e.object.position.z,enemy.object.position.x,enemy.object.position.z)){enemy.health-=125*(1-d/7);if(enemy.health<=0)killEnemy(enemy,false);}}e.object.material=new THREE.MeshBasicMaterial({color:0xffb466,transparent:true,opacity:.6});e.object.scale.setScalar(24);e.life=.18;}
   else{e.object.material=new THREE.MeshBasicMaterial({color:0x9ba9ad,transparent:true,opacity:.32,depthWrite:false});e.object.scale.setScalar(45);e.life=9;}
  }else if(e.active&&e.life<=0){disposeGroup(e.object);effects.splice(i,1);}
 }
}
function applySettings(){
 const st=progress.state.settings;soundscape?.update();renderer.shadowMap.enabled=st.quality!=='low';renderer.toneMappingExposure=st.quality==='high'?1.12:1.06;
 ui.reticle.style.display=st.crosshair?'':'none';document.documentElement.style.setProperty('--hud-scale',st.hudScale);resize();
}
interfaceUI=setupInterface(progress,{
 preview:async container=>(await import('./weapon-preview.js')).populateWeaponPreviews(container,THREE),
 quit:returnToMenu,continue(){ui['level-select'].value=progress.state.selectedLevel;startGame();},refresh:refreshMenu,
 mode(id){playMode=id;status(`${id.toUpperCase()} SELECTED`);ui['mission-detail'].textContent=`${id.toUpperCase()} · SELECT A SITE AND DEPLOY`;},settings:applySettings
});
refreshMenu();
for(const [id,label,action] of [
 ['crouch','LOW',()=>{player.crouch=!player.crouch;train('CROUCH');}],['use','USE',()=>{interaction=true;train('INTERACT');}],
 ['frag','FRAG',()=>useEquipment('frag')],['heal','HEAL',()=>useEquipment('medkit')],['smoke','SMOKE',()=>useEquipment('smoke')],['plate','PLATE',()=>useEquipment('plate')],
 ['map','OBJ',()=>{train('MAP / OBJECTIVE');status(routeNode().title);}]
]){const b=document.createElement('button');b.id=id;b.textContent=label;b.setAttribute('aria-label',label);b.onclick=action;ui.touch.append(b);}
const trainButton=document.createElement('button');trainButton.id='begin-training';trainButton.textContent='BEGIN INTERACTIVE TRAINING';trainButton.onclick=()=>{training=0;startGame();clearActors();updateObjective();};ui.tutorial.querySelector('.dialog').append(trainButton);
$('camera-button').textContent='RUN';$('camera-button').onclick=()=>{input.state.touchSprint=!input.state.touchSprint;};
const deathMenu=document.createElement('button');deathMenu.textContent='QUIT TO MENU';deathMenu.onclick=()=>interfaceUI.confirmQuit();ui.death.querySelector('.menu-actions').append(deathMenu);
const checkpointButton=document.createElement('button');checkpointButton.textContent='RESTART CHECKPOINT';checkpointButton.onclick=respawn;ui.pause.querySelector('.pause-actions').append(checkpointButton);

function frame(now) {
  requestAnimationFrame(frame);
  const realDt = Math.max(0.0001, (now - last) / 1000); last = now; const dt = Math.min(realDt, 0.05);
  fpsClock += realDt; fpsFrames += 1; if (fpsClock >= 0.4) { fps = Math.round(fpsFrames / fpsClock); fpsFrames = 0; fpsClock = 0; }
  if (mission.started && !mission.paused && player.alive && !['complete','failed'].includes(mission.phase)) {
    movement(dt); weapon.cooldown = Math.max(0, weapon.cooldown - dt); weapon.recoil = Math.max(0, weapon.recoil - dt * 6.2); weapon.flashTimer = Math.max(0, weapon.flashTimer - dt);
    if (input.consumeReload()) beginReload(); if (weapon.reloadRemaining > 0) { weapon.reloadRemaining -= dt; if (weapon.reloadRemaining <= 0) finishReload(); } else if (input.state.fire) fireWeapon();
    updateEnemies(dt); updateAllies(dt); updateObjectives(dt); updateCameraAndWeapon(dt); updateWaypoint();
  } else if (!mission.started) { camera.position.set(0, 2.25, 16.5); camera.rotation.set(-0.035, 0, 0); }
  if (statusTimer > 0 && (statusTimer -= dt) <= 0) ui['status-message'].classList.remove('on');
  if (radioTimer > 0 && (radioTimer -= dt) <= 0) ui.radio.classList.remove('on');
  if (hitTimer > 0 && (hitTimer -= dt) <= 0) ui.reticle.classList.remove('hit','headshot');
  if (damageTimer > 0 && (damageTimer -= dt) <= 0) { ui.damage.style.opacity = '0'; ui['damage-direction'].classList.remove('on'); }
  for (const o of tracers) { if (o.userData.life <= 0) continue; o.userData.life -= dt; o.material.opacity = Math.max(0, o.userData.life * 13); if (o.userData.life <= 0) o.visible = false; }
  arena?.updateWeather?.(dt);
  renderer.info.reset(); renderer.render(scene, camera);
  const living = enemies.filter((enemy) => enemy.alive);
  const boss = living.find((enemy) => enemy.commander);
  if (boss) ui['commander-fill'].style.transform = `scaleX(${Math.max(0, boss.health / boss.maxHealth)})`;
  Object.assign(window.__GAME__, { pos: [Number(player.position.x.toFixed(3)), Number(player.position.z.toFixed(3))], elevation: Number(player.position.y.toFixed(3)), velocity: [Number(player.velocity.x.toFixed(3)), Number(player.verticalVelocity.toFixed(3)), Number(player.velocity.z.toFixed(3))], fps, speed: Number(player.speed.toFixed(2)), stage:mission.stage, objective:ui['objective-main'].textContent, objectivePosition:worldTarget.toArray(), credits:progress.state.credits, xp:progress.state.xp, reward:mission.reward, equipment:{...equipment}, armor:Math.ceil(player.armor), crouch:player.crouch, training, wave, teamLosses, allies:allies.map(a=>({health:a.health,pos:a.object.position.toArray()})), draws: renderer.info.render.calls, tris: renderer.info.render.triangles, started: mission.started, paused: mission.paused, alive: player.alive, health: Math.ceil(player.health), weapon: spec.name, ammo: ammo().magazine, reserveAmmo: ammo().reserve, reloading: weapon.reloadRemaining > 0, ads: weapon.adsBlend > 0.55, grounded: player.grounded, enemyCount: living.length, enemies: living.map((enemy) => ({ pos: [Number(enemy.object.position.x.toFixed(2)), Number(enemy.object.position.z.toFixed(2))], health: Math.ceil(enemy.health), role:enemy.role, state:enemy.state, phase:enemy.phase, elevation:enemy.object.position.y, commander: enemy.commander })), enemyState: living[0]?.state ?? 'none', enemyHealth: living[0] ? Math.ceil(living[0].health) : 0, enemyShots: enemies.reduce((sum, enemy) => sum + enemy.shots, 0), damageTaken: player.damageTaken, deaths: player.deaths, missionPhase: mission.phase, level: level.id, map: level.map.id, mode: playMode, highestCompleted: progress.state.highestCompleted, intelCount: mission.intel, intelRequired: level.intelRequired, extractionActive: mission.objectiveClear, commanderSpawned: mission.commanderSpawned, commanderAlive: Boolean(boss), commanderHealth: boss ? Math.ceil(boss.health) : 0, kills: mission.kills, requiredKills: level.requiredKills, elapsed: Number(mission.elapsed.toFixed(2)), score: mission.score, over: mission.phase === 'complete', shots: mission.shots, hits: mission.hits, headshots: mission.headshots, cameraMode: camModes[camMode], upgrades: progress.state.upgrades, stair: arena?.stair ?? null });
}
function resize() { renderer.setPixelRatio(Math.min(devicePixelRatio || 1, innerWidth < 900 ? 1.25 : 1.5)*progress.state.settings.resolution); renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.fov = innerWidth < innerHeight ? 86 : 72; camera.updateProjectionMatrix(); for (const model of models.values()) model.scale.setScalar(innerWidth < innerHeight ? 0.32 : 0.44); }
addEventListener('resize', resize); resize(); loadArena(); camera.position.set(0, 2.25, 16.5); applySettings();memory.ready();window.__READY__ = true; requestAnimationFrame(frame);

