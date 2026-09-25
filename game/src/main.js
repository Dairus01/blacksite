import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.185.0/build/three.module.js';
import makeRifle from '../assets404/rifle.js';
import makeSoldier from '../assets404/soldier.js';
import makeIntel from '../assets404/intel-pickup.js';
import { createInput } from './input.js';
import { buildArena } from './arena.js';
import { buildVariantArena } from './variant-arena.js';
import { LEVELS, getLevel, createCampaignProgress } from './campaign.js';
import { WEAPONS, UPGRADES, weaponById, capacityFor, reloadFor, damageFor } from './arsenal.js';
import { GAME_CONFIG } from './config/game-config.js';

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
let audio = null;
let last = performance.now(), fpsClock = 0, fpsFrames = 0, fps = 60, statusTimer = 0, radioTimer = 0, hitTimer = 0, damageTimer = 0;
const raycaster = new THREE.Raycaster();
const aim = new THREE.Vector2();
const worldTarget = new THREE.Vector3();
const tmp = new THREE.Vector3();
const hip = new THREE.Vector3(0.31, -0.42, -0.63);
const sight = new THREE.Vector3(0, -0.24, -0.32);
const camModes = ['FIRST PERSON', 'LEFT SHOULDER', 'RIGHT SHOULDER'];
let camMode = 0;
const player = { position: new THREE.Vector3(), velocity: new THREE.Vector3(), yaw: 0, pitch: 0, verticalVelocity: 0, grounded: true, speed: 0, health: 100, alive: true, damageTaken: 0, deaths: 0 };
const mission = { started: false, paused: false, phase: 'deploy', kills: 0, headshots: 0, intel: 0, score: 0, shots: 0, hits: 0, elapsed: 0, objectiveClear: false, commanderSpawned: false, commanderDefeated: false };
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
const avatar = makeSoldier(THREE, { cloth: 0x21313b, armor: 0x537283 });
avatar.visible = false;
const avatarShadows = new Set([avatar.userData.joints.body.children[0], avatar.userData.joints.body.children[1], avatar.userData.joints.head.children[0]]);
avatar.traverse((node) => { if (node.isMesh) { node.castShadow = avatarShadows.has(node); node.receiveShadow = true; } });
scene.add(avatar);
const enemies = [];
const pickups = [];
const tracerMaterial = new THREE.MeshBasicMaterial({ color: 0xffa142, transparent: true, opacity: 0.82, depthWrite: false });
const tracers = Array.from({ length: 18 }, () => { const o = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 1, 5), tracerMaterial.clone()); o.visible = false; o.userData.life = 0; scene.add(o); return o; });

function sound(f, duration, volume, type = 'square', slide = 0.65) {
  if (!audio) return;
  const osc = audio.createOscillator(), gain = audio.createGain();
  osc.type = type; osc.frequency.setValueAtTime(f, audio.currentTime);
  osc.frequency.exponentialRampToValueAtTime(Math.max(24, f * slide), audio.currentTime + duration);
  gain.gain.setValueAtTime(volume, audio.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + duration);
  osc.connect(gain).connect(audio.destination); osc.start(); osc.stop(audio.currentTime + duration);
}
function status(text, color = 'var(--cyan)', duration = 1.7) { ui['status-message'].textContent = text; ui['status-message'].style.color = color; ui['status-message'].classList.add('on'); statusTimer = duration; }
function radio(speaker, text, duration = 4.3) { ui.radio.querySelector('b').textContent = speaker; ui['radio-text'].textContent = text; ui.radio.classList.add('on'); radioTimer = duration; sound(780, 0.045, 0.025, 'sine', 1.2); }
function objective(title, sub, target, label, signal = 'route') { ui['objective-main'].textContent = title; ui['objective-sub'].textContent = sub; ui['objective-main'].parentElement.dataset.signal = signal; ui.waypoint.dataset.signal = signal; if (target) worldTarget.copy(target); ui['waypoint-label'].textContent = label; }
function selectedModel() { return models.get(spec.id); }
function ammo() { return inventory.get(spec.id); }
function updateAmmo() { ui.mag.textContent = String(ammo().magazine).padStart(2, '0'); ui.reserve.textContent = String(ammo().reserve).padStart(3, '0'); ui['weapon-name'].textContent = `${spec.name} // ${spec.role}`; ui['reload-state'].textContent = weapon.reloadRemaining > 0 ? 'RELOADING' : ''; }
function updateHealth() { const max = progress.state.upgrades.armor ? 120 : 100; ui.health.textContent = String(Math.ceil(player.health)); ui['health-fill'].style.transform = `scaleX(${player.health / max})`; ui['health-fill'].style.background = player.health < 30 ? 'var(--red)' : 'var(--cyan)'; }
function disposeGroup(group) { if (!group) return; group.traverse((node) => { node.geometry?.dispose?.(); const mats = Array.isArray(node.material) ? node.material : [node.material]; mats.forEach((m) => { m?.map?.dispose?.(); m?.dispose?.(); }); }); group.removeFromParent(); }
function clearActors() { for (const enemy of enemies) disposeGroup(enemy.object); enemies.length = 0; for (const pickup of pickups) disposeGroup(pickup.object); pickups.length = 0; }
function spawnPoints() { return arena.spawns.enemies ?? [arena.spawns.enemy, [0, 1.8], [-5, 1], [5, 0], [-5, -7], [5, -8], [0, -12]]; }
function spawnEnemy(commander = false) {
  const spots = spawnPoints();
  const index = (mission.kills + enemies.length) % spots.length;
  const point = spots[index];
  const actor = makeSoldier(THREE, commander ? { cloth: 0x372324, armor: 0x993e31 } : { cloth: 0x17231f, armor: 0x405248 });
  actor.scale.setScalar(commander ? 1.18 : 1);
  actor.position.set(point[0], arena.floorHeightAt(...point) + 0.02, point[1]);
  const bossHealth = Math.min(440, 230 + level.id * 2);
  const enemy = { object: actor, commander, maxHealth: commander ? bossHealth : level.enemyHealth, health: commander ? bossHealth : level.enemyHealth, alive: true, state: 'alert', shots: 0, cooldown: 1.1 + enemies.length * 0.22, hitTimer: 0, recoilTimer: 0, deathTimer: 0, strafe: index % 2 ? 1 : -1, speed: commander ? 2.0 : 1.45 + level.id * 0.004 };
  const shadowCasters = new Set([actor.userData.joints.body.children[0], actor.userData.joints.body.children[1], actor.userData.joints.head.children[0]]);
  actor.traverse((node) => { if (!node.isMesh) return; node.castShadow = shadowCasters.has(node); node.receiveShadow = true; node.userData.enemy = enemy; if (node.name === 'head_hit') node.userData.hitZone = 'head'; else if (node.name === 'body_hit') node.userData.hitZone = 'body'; });
  scene.add(actor); enemies.push(enemy);
  if (commander) { mission.commanderSpawned = true; ui['commander-hud'].classList.add('on'); radio('COMMAND', 'High-threat Commander on site. Eliminate the target before extraction.'); status('COMMANDER INBOUND', 'var(--red)', 2.7); sound(168, 0.65, 0.055, 'sawtooth', 0.35); }
  return enemy;
}
function refreshMenu() {
  const chosen = getLevel(ui['level-select'].value || progress.state.selectedLevel);
  ui['brief-title'].textContent = `ACT ${chosen.act} // ${chosen.actName}`;
  ui['brief-text'].textContent = chosen.briefing;
  ui['mission-detail'].textContent = `SITE ${chosen.map.name}  ·  MODE ${chosen.mode.name}  ·  TARGET ${chosen.requiredKills} HOSTILES${chosen.intelRequired ? `  ·  ${chosen.intelRequired} INTEL` : ''}${chosen.commander ? '  ·  COMMANDER' : ''}`;
  $('start-title').innerHTML = `${chosen.map.name}<br><span>LEVEL ${String(chosen.id).padStart(3, '0')}</span>`;
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
  arena = level.map.id === 'blacksite' ? buildArena(THREE, scene) : buildVariantArena(THREE, scene, level.map.id);
  arena.resetExtraction();
  player.position.set(arena.spawns.player[0], 0, arena.spawns.player[1]);
  worldTarget.set(arena.spawns.enemy[0], 1.5, arena.spawns.enemy[1]);
}
function chooseWeapon(id, save = true, announce = true) {
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
  mission.phase = 'active'; mission.paused = false; mission.started = true; mission.kills = 0; mission.headshots = 0; mission.intel = 0; mission.score = 0; mission.shots = 0; mission.hits = 0; mission.elapsed = 0; mission.objectiveClear = false; mission.commanderSpawned = false; mission.commanderDefeated = false;
  player.velocity.set(0, 0, 0); player.yaw = 0; player.pitch = 0; player.verticalVelocity = 0; player.grounded = true; player.health = progress.state.upgrades.armor ? 120 : 100; player.alive = true; player.damageTaken = 0; player.deaths = 0;
  for (const item of WEAPONS) inventory.set(item.id, { magazine: capacityFor(item, progress.state.upgrades), reserve: item.reserve });
  weapon.cooldown = 0; weapon.recoil = 0; weapon.reloadRemaining = 0; weapon.adsBlend = 0; weapon.flashTimer = 0; weapon.emptyNotified = false;
  for (const o of tracers) { o.visible = false; o.userData.life = 0; }
  ui['status-message'].classList.remove('on'); ui.radio.classList.remove('on');
  statusTimer = 0; radioTimer = 0; hitTimer = 0; damageTimer = 0; ui.damage.style.opacity = '0';
  loadArena(); chooseWeapon(ui['weapon-select'].value || spec.id, true, false); updateHealth();
  for (let i = 0; i < Math.min(2, level.maxAlive, level.requiredKills); i += 1) spawnEnemy();
  ui['objective-tag'].textContent = `LEVEL ${String(level.id).padStart(3, '0')} // ${level.map.name} // ${level.mode.name}`;
  ui['mission-progress'].textContent = '';
  ui['commander-hud'].classList.remove('on');
  ui['threat-text'].textContent = 'HOSTILES ACTIVE'; ui.threat.classList.add('alert');
  ui.complete.classList.remove('on'); ui.death.classList.remove('on'); ui.pause.classList.remove('on');
  updateObjective();
}
function startGame() {
  level = getLevel(ui['level-select'].value || progress.state.selectedLevel);
  if (!audio) { const Context = window.AudioContext || window.webkitAudioContext; if (Context) audio = new Context(); }
  audio?.resume?.(); resetMission();
  ui.start.classList.remove('on'); ui.tutorial.classList.remove('on'); ui.hud.classList.add('on'); ui.touch.classList.add('on');
  input.setEnabled(true); input.requestPointerLock();
  radio('COMMAND', level.id === 1 ? 'Echo One, Aegis Relay 7 went dark. Breach the site and recover the uplink.' : level.briefing, 5.5);
}
window.__START__ = startGame;
window.game = { debug: {
  getState: () => ({ ...window.__GAME__ }),
  teleportPlayer([x, y, z]) {
    if (!mission.started || !Number.isFinite(x) || !Number.isFinite(z) || arena.blocked(x, z)) return false;
    player.position.set(x, Math.max(arena.floorHeightAt(x, z), Number.isFinite(y) ? y : 0), z);
    player.velocity.set(0, 0, 0); player.verticalVelocity = 0; player.grounded = true;
    return true;
  },
  lookAt([x, y, z]) {
    const dx = x - player.position.x, dz = z - player.position.z;
    player.yaw = -Math.atan2(dx, -dz);
    player.pitch = THREE.MathUtils.clamp(Math.atan2(y - player.position.y - 1.66, Math.hypot(dx, dz)), -1.25, 1.25);
  },
} };
function menu() { mission.paused = true; player.velocity.set(0, 0, 0); player.speed = 0; input.setEnabled(false); ui.touch.classList.remove('on'); ui.pause.classList.add('on'); ui['pause-detail'].textContent = `LEVEL ${level.id} · ${level.map.name} · ${level.mode.name} · ${mission.kills} KILLS`; if (document.pointerLockElement) document.exitPointerLock(); }
function resume() { mission.paused = false; input.setEnabled(true); ui.pause.classList.remove('on'); ui.touch.classList.add('on'); input.requestPointerLock(); }
function returnToMenu() { mission.started = false; mission.paused = false; mission.phase = 'deploy'; progress.resetRun(); input.setEnabled(false); ui.hud.classList.remove('on'); ui.touch.classList.remove('on'); ui.pause.classList.remove('on'); ui.death.classList.remove('on'); ui.complete.classList.remove('on'); ui.tutorial.classList.remove('on'); ui.start.classList.add('on'); avatar.visible = false; for (const model of models.values()) model.visible = false; ui['level-select'].value = level.id; refreshMenu(); if (document.pointerLockElement) document.exitPointerLock(); }
function respawn() { const alreadyCounted = !player.alive; player.position.set(arena.spawns.player[0], 0, arena.spawns.player[1]); player.velocity.set(0, 0, 0); player.verticalVelocity = 0; player.grounded = true; player.health = progress.state.upgrades.armor ? 120 : 100; player.alive = true; if (!alreadyCounted) player.deaths += 1; mission.paused = false; mission.phase = mission.objectiveClear ? 'extract' : 'active'; ui.death.classList.remove('on'); ui.pause.classList.remove('on'); ui.hud.classList.add('on'); ui.touch.classList.add('on'); input.setEnabled(true); input.requestPointerLock(); updateHealth(); status('REINSERTED AT CHECKPOINT'); }
function showTutorial() { ui.tutorial.classList.add('on'); if (mission.started) { mission.paused = true; input.setEnabled(false); ui.touch.classList.remove('on'); ui.pause.classList.remove('on'); if (document.pointerLockElement) document.exitPointerLock(); } }
function hideTutorial() { ui.tutorial.classList.remove('on'); if (mission.started && mission.paused) ui.pause.classList.add('on'); }
function updateObjective() {
  const alive = enemies.filter((enemy) => enemy.alive);
  const pendingIntel = pickups.find((item) => item.object.visible);
  const progressText = `${mission.kills}/${level.requiredKills} HOSTILES${level.intelRequired ? `  ·  ${mission.intel}/${level.intelRequired} INTEL` : ''}${level.holdSeconds ? `  ·  ${Math.max(0, Math.ceil(level.holdSeconds - mission.elapsed))}s` : ''}`;
  ui['mission-progress'].textContent = progressText;
  if (mission.objectiveClear) { objective('REACH EXTRACTION', 'OBJECTIVE SECURED', arena.extractionPosition, 'EXTRACT'); return; }
  if (mission.commanderSpawned && !mission.commanderDefeated) { const boss = alive.find((enemy) => enemy.commander); objective('DEFEAT COMMANDER', progressText, boss?.object.position ?? arena.extractionPosition, 'COMMANDER', 'threat'); return; }
  if (pendingIntel && level.mode.id === 'recon') { objective('RECOVER INTEL', 'COLLECT THE DROPPED DATA', pendingIntel.object.position, 'INTEL', 'intel'); return; }
  if (level.mode.id === 'hold') objective('HOLD THE POSITION', 'SURVIVE THE DEFENSE WINDOW', arena.extractionPosition, 'HOLD');
  else objective(level.mode.id === 'hunt' ? 'HUNT THE COMMANDER' : level.mode.id === 'recon' ? 'RECOVER THE CIPHER' : 'CLEAR HOSTILES', level.mode.verb.toUpperCase(), alive[0]?.object.position ?? arena.extractionPosition, 'HOSTILE', 'threat');
}
function evaluateObjective() {
  const killsReady = mission.kills >= level.requiredKills;
  const intelReady = mission.intel >= level.intelRequired;
  const holdReady = mission.elapsed >= level.holdSeconds;
  if (killsReady && intelReady && holdReady && level.commander && !mission.commanderSpawned) { spawnEnemy(true); mission.phase = 'commander'; updateObjective(); return; }
  if (!killsReady || !intelReady || !holdReady || (level.commander && !mission.commanderDefeated) || mission.objectiveClear) return;
  mission.objectiveClear = true; mission.phase = 'extract'; arena.activateExtraction(); updateObjective();
  radio('COMMAND', 'Objective confirmed. Extraction is live. Move to the marked beacon.'); status('EXTRACTION AVAILABLE', 'var(--cyan)', 3); sound(920, 0.18, 0.032, 'sine', 1.45);
}
function dropIntel(enemy) { if (mission.intel + pickups.length >= level.intelRequired) return; const object = makeIntel(THREE); object.position.set(enemy.object.position.x, 0.18, enemy.object.position.z); object.userData.baseY = object.position.y; scene.add(object); pickups.push({ object, collected: false }); status('INTEL DROPPED', 'var(--cyan)'); }
function killEnemy(enemy, headshot) {
  enemy.alive = false; enemy.state = 'dead'; enemy.deathTimer = 0; mission.kills += 1; if (headshot) mission.headshots += 1;
  mission.score += 100 + (headshot ? 50 : 0) + (enemy.commander ? 400 : 0);
  if (progress.state.upgrades.adrenaline) { player.health = Math.min(progress.state.upgrades.armor ? 120 : 100, player.health + 8); updateHealth(); }
  if (enemy.commander) { mission.commanderDefeated = true; ui['commander-hud'].classList.remove('on'); radio('COMMAND', 'Commander neutralized. The uplink channel is clear.'); status('COMMANDER DOWN +400', 'var(--amber)', 2.5); }
  else if (level.intelRequired && mission.intel + pickups.length < level.intelRequired) dropIntel(enemy);
  else status(headshot ? 'HEADSHOT +150' : 'HOSTILE DOWN +100', 'var(--amber)');
  sound(96, 0.20, 0.045, 'sawtooth', 0.45); evaluateObjective(); updateObjective();
}
function tracer(from, to, color = 0xffa142) { const o = tracers.find((item) => item.userData.life <= 0) ?? tracers[0]; const direction = to.clone().sub(from); const len = direction.length(); o.material.color.setHex(color); o.material.opacity = 0.82; o.position.copy(from).addScaledVector(direction, 0.5); o.scale.set(1, len, 1); o.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize()); o.visible = true; o.userData.life = 0.07; }
function beginReload() { if (!player.alive || weapon.reloadRemaining > 0 || ammo().magazine >= capacityFor(spec, progress.state.upgrades) || ammo().reserve <= 0) return; weapon.reloadDuration = reloadFor(spec, progress.state.upgrades); weapon.reloadRemaining = weapon.reloadDuration; input.state.fire = false; updateAmmo(); sound(185, 0.1, 0.025, 'triangle', 0.72); }
function finishReload() { const pack = ammo(); const loaded = Math.min(capacityFor(spec, progress.state.upgrades) - pack.magazine, pack.reserve); pack.magazine += loaded; pack.reserve -= loaded; weapon.reloadRemaining = 0; weapon.emptyNotified = false; updateAmmo(); sound(410, 0.07, 0.024, 'square', 0.75); }
function fireWeapon() {
  if (!player.alive || mission.paused || weapon.cooldown > 0 || weapon.reloadRemaining > 0) return;
  const pack = ammo();
  if (pack.magazine <= 0) { if (!weapon.emptyNotified) { sound(125, 0.05, 0.02); status('MAGAZINE EMPTY // RELOAD', 'var(--amber)'); weapon.emptyNotified = true; } weapon.cooldown = 0.2; return; }
  pack.magazine -= 1; mission.shots += 1; weapon.cooldown = spec.interval; weapon.recoil = Math.min(1.5, weapon.recoil + spec.recoil); weapon.flashTimer = 0.045; updateAmmo(); sound(spec.id === 'breacher' ? 62 : 88, 0.075, 0.045, 'sawtooth', 0.32);
  const spread = input.state.ads ? spec.adsSpread : spec.spread;
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
  if (!player.alive) return; player.health = Math.max(0, player.health - amount); player.damageTaken += amount; updateHealth();
  ui.damage.style.opacity = String(Math.min(0.8, 0.3 + amount / 45)); damageTimer = 0.24;
  ui['damage-direction'].style.transform = `rotate(${Math.atan2(source.x - player.position.x, source.z - player.position.z) - player.yaw}rad)`; ui['damage-direction'].classList.add('on');
  sound(58, 0.14, 0.05, 'sawtooth', 0.5);
  if (player.health <= 0) { player.alive = false; player.deaths += 1; player.velocity.set(0, 0, 0); player.speed = 0; mission.phase = 'failed'; input.setEnabled(false); ui.touch.classList.remove('on'); ui.hud.classList.remove('on'); ui.death.classList.add('on'); if (document.pointerLockElement) document.exitPointerLock(); }
}
function movement(dt) {
  const axes = input.movement(); const upgrades = progress.state.upgrades; const magnitude = Math.min(1, Math.hypot(axes.x, axes.y));
  const maxSpeed = (input.state.sprint && !input.state.ads ? 6.4 : input.state.ads ? 2.8 : 4.5) * (upgrades.runner ? 1.12 : 1);
  const sin = Math.sin(player.yaw), cos = Math.cos(player.yaw);
  const goalX = (axes.x * cos - axes.y * sin) * maxSpeed, goalZ = (-axes.x * sin - axes.y * cos) * maxSpeed;
  const accel = player.grounded ? (magnitude ? 22 : 30) : 7;
  player.velocity.x = THREE.MathUtils.damp(player.velocity.x, goalX, accel, dt); player.velocity.z = THREE.MathUtils.damp(player.velocity.z, goalZ, accel, dt);
  const axis = (key, delta) => { const x = key === 'x' ? player.position.x + delta : player.position.x; const z = key === 'z' ? player.position.z + delta : player.position.z; const nextFloor = arena.floorHeightAt(x, z); if (arena.blocked(x, z) || (player.grounded && nextFloor - player.position.y > 0.27)) { player.velocity[key] = 0; return; } player.position[key] += delta; if (player.grounded && nextFloor > player.position.y) player.position.y = nextFloor; };
  axis('x', player.velocity.x * dt); axis('z', player.velocity.z * dt);
  const ground = arena.floorHeightAt(player.position.x, player.position.z);
  if (input.consumeJump() && player.grounded) { player.verticalVelocity = 5.25; player.grounded = false; sound(120, 0.05, 0.012, 'triangle'); }
  if (!player.grounded || player.position.y > ground + 0.002) { player.verticalVelocity -= 14.5 * dt; player.position.y += player.verticalVelocity * dt; if (player.position.y <= ground) { player.position.y = ground; player.verticalVelocity = 0; player.grounded = true; } }
  else { player.position.y = ground; player.verticalVelocity = 0; player.grounded = true; }
  player.speed = Math.hypot(player.velocity.x, player.velocity.z);
  const look = input.consumeLook(); const sensitivity = input.state.ads ? 0.00145 : 0.00235;
  player.yaw -= look.x * sensitivity; player.pitch = THREE.MathUtils.clamp(player.pitch - look.y * sensitivity, -1.25, 1.25);
}
function updateEnemies(dt) {
  for (const enemy of enemies) {
    if (!enemy.alive) { enemy.deathTimer += dt; enemy.object.userData.pose('alert', mission.elapsed, 0, 0); enemy.object.rotation.z = THREE.MathUtils.damp(enemy.object.rotation.z, -1.38, 8, dt); continue; }
    const dx = player.position.x - enemy.object.position.x, dz = player.position.z - enemy.object.position.z, distance = Math.max(0.01, Math.hypot(dx, dz));
    const visible = !arena.lineBlocked(enemy.object.position.x, enemy.object.position.z, player.position.x, player.position.z);
    enemy.object.lookAt(player.position.x, enemy.object.position.y + 1.2, player.position.z);
    enemy.hitTimer = Math.max(0, enemy.hitTimer - dt); enemy.recoilTimer = Math.max(0, enemy.recoilTimer - dt);
    const forwardX = dx / distance, forwardZ = dz / distance;
    let mx = 0, mz = 0;
    if (distance > (enemy.commander ? 7 : 9)) { mx = forwardX; mz = forwardZ; }
    else if (distance < 4) { mx = -forwardX; mz = -forwardZ; }
    else { mx = -forwardZ * enemy.strafe; mz = forwardX * enemy.strafe; }
    const prevX = enemy.object.position.x, prevZ = enemy.object.position.z;
    const nx = enemy.object.position.x + mx * enemy.speed * dt, nz = enemy.object.position.z + mz * enemy.speed * dt;
    if (!arena.blocked(nx, enemy.object.position.z, 0.36)) enemy.object.position.x = nx; else enemy.strafe *= -1;
    if (!arena.blocked(enemy.object.position.x, nz, 0.36)) enemy.object.position.z = nz; else enemy.strafe *= -1;
    enemy.object.position.y = arena.floorHeightAt(enemy.object.position.x, enemy.object.position.z) + 0.02;
    const motion = THREE.MathUtils.clamp(Math.hypot(enemy.object.position.x - prevX, enemy.object.position.z - prevZ) / Math.max(dt * 2, 0.001), 0, 1);
    enemy.object.userData.pose('alert', mission.elapsed + enemies.indexOf(enemy) * 0.3, enemy.hitTimer, enemy.recoilTimer / 0.12, motion);
    enemy.cooldown -= dt;
    if (!visible || distance > 24 || enemy.cooldown > 0 || !player.alive) continue;
    enemy.shots += 1; enemy.recoilTimer = 0.12;
    const muzzle = enemy.object.userData.joints.muzzle.getWorldPosition(new THREE.Vector3());
    const target = new THREE.Vector3(player.position.x + Math.sin(enemy.shots * 12.9898) * 0.6, player.position.y + 1.3, player.position.z);
    tracer(muzzle, target, enemy.commander ? 0xff2c38 : 0xff573f); sound(enemy.commander ? 74 : 105, 0.075, 0.025, 'sawtooth', 0.42);
    const chance = THREE.MathUtils.clamp(0.60 - distance * 0.015 - player.speed * 0.022, 0.22, 0.58);
    if ((Math.sin(enemy.shots * 91.731 + enemies.indexOf(enemy) * 9.1) + 1) / 2 < chance) damagePlayer(enemy.commander ? level.enemyDamage * 1.45 : level.enemyDamage, enemy.object.position);
    enemy.cooldown = (enemy.commander ? 0.55 : 0.95) + (Math.sin(enemy.shots * 3.1) + 1) * 0.25;
    if (enemy.shots % 3 === 0) enemy.strafe *= -1;
  }
}
function updateObjectives(dt) {
  mission.elapsed += dt;
  const desired = mission.kills < level.requiredKills ? Math.min(level.maxAlive, level.requiredKills - mission.kills) : level.mode.id === 'hold' && mission.elapsed < level.holdSeconds ? level.maxAlive : 0;
  const aliveOrdinary = enemies.filter((enemy) => enemy.alive && !enemy.commander).length;
  if (desired > aliveOrdinary && mission.elapsed > 1.0) spawnEnemy();
  for (const item of pickups) { if (item.collected) continue; item.object.rotation.y += dt * 1.8; item.object.position.y = 0.18 + Math.sin(mission.elapsed * 3) * 0.08; if (Math.hypot(item.object.position.x - player.position.x, item.object.position.z - player.position.z) < 1.75) { item.collected = true; item.object.visible = false; mission.intel += 1; mission.score += 75; sound(920, 0.16, 0.026, 'sine', 1.45); status(`INTEL ${mission.intel}/${level.intelRequired} +75`); updateObjective(); } }
  evaluateObjective();
  if (mission.objectiveClear) { const d = Math.hypot(player.position.x - arena.extractionPosition.x, player.position.z - arena.extractionPosition.z); ui['objective-sub'].textContent = `BEACON ${Math.ceil(d)}m`; if (d < 2.25) completeMission(); }
  else if (level.mode.id === 'hold') updateObjective();
}
function completeMission() {
  mission.phase = 'complete'; mission.score += 500 + Math.max(0, Math.round(240 - mission.elapsed)); progress.complete(level.id);
  player.velocity.set(0, 0, 0); player.speed = 0;
  input.setEnabled(false); ui.touch.classList.remove('on'); ui.hud.classList.remove('on'); ui.complete.classList.add('on');
  const accuracy = mission.shots ? Math.round(mission.hits / mission.shots * 100) : 0;
  ui['complete-stats'].textContent = `LEVEL ${level.id} // ${level.map.name} // ${Math.round(mission.elapsed)}s // ${mission.kills} KILLS // ${mission.headshots} HEADSHOTS // ${accuracy}% ACCURACY // ${player.deaths} DEATHS // ${mission.score} SCORE`;
  const choices = UPGRADES.filter((upgrade) => !progress.state.upgrades[upgrade.id]).sort((a, b) => ((a.id.charCodeAt(0) + level.id * 7) % 13) - ((b.id.charCodeAt(0) + level.id * 7) % 13)).slice(0, 3);
  ui['upgrade-choices'].replaceChildren();
  for (const choice of choices) { const button = document.createElement('button'); button.type = 'button'; button.innerHTML = `<b>${choice.name}</b><small>${choice.effect}</small>`; button.addEventListener('click', () => { progress.setUpgrade(choice.id, true); ui['upgrade-choices'].replaceChildren(); status(`${choice.name} EQUIPPED`); }); ui['upgrade-choices'].append(button); }
  $('again').textContent = level.id >= 100 ? 'CAMPAIGN COMPLETE' : `NEXT LEVEL ${String(level.id + 1).padStart(3, '0')}`;
  sound(440, 0.18, 0.035, 'sine', 1.5); if (document.pointerLockElement) document.exitPointerLock();
}
function updateWaypoint() { const target = worldTarget.clone(); const distance = Math.hypot(target.x - player.position.x, target.z - player.position.z); target.project(camera); let x = (target.x * 0.5 + 0.5) * 100, y = (-target.y * 0.5 + 0.5) * 100; if (target.z > 1) { x = 100 - x; y = 12; } ui.waypoint.style.left = `${THREE.MathUtils.clamp(x, 8, 92)}%`; ui.waypoint.style.top = `${THREE.MathUtils.clamp(y, 13, 43)}%`; ui['waypoint-distance'].textContent = `${Math.ceil(distance)}m`; }
function updateCameraAndWeapon(dt) {
  const activeModel = selectedModel(); const adsTarget = input.state.ads && !input.state.sprint && weapon.reloadRemaining <= 0 ? 1 : 0;
  weapon.adsBlend = THREE.MathUtils.damp(weapon.adsBlend, adsTarget, 14, dt);
  camera.fov = THREE.MathUtils.lerp(innerWidth < innerHeight ? 86 : 72, innerWidth < innerHeight ? 67 : 54, weapon.adsBlend); camera.updateProjectionMatrix();
  ui.hud.classList.toggle('ads', weapon.adsBlend > 0.55);
  const bob = player.grounded ? Math.sin(mission.elapsed * 9.5) * Math.min(player.speed / 6.4, 1) : 0;
  activeModel.position.copy(tmp.copy(hip).lerp(sight, weapon.adsBlend)); activeModel.position.x += bob * 0.008 * (1 - weapon.adsBlend); activeModel.position.y += -Math.abs(bob) * 0.006 - weapon.recoil * 0.032; activeModel.position.z += weapon.recoil * 0.045;
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
  const eye = new THREE.Vector3(player.position.x, player.position.y + 1.66 + Math.abs(bob) * 0.012, player.position.z);
  camera.rotation.order = 'YXZ'; camera.rotation.set(player.pitch - weapon.recoil * 0.012, player.yaw, 0);
  if (camMode === 0) camera.position.copy(eye);
  else { const side = camMode === 1 ? -1 : 1; const offset = new THREE.Vector3(side * 0.85, 0.38, 2.5).applyAxisAngle(new THREE.Vector3(0, 1, 0), player.yaw); camera.position.copy(eye).add(offset); }
  avatar.visible = camMode !== 0 && mission.started && !mission.paused && player.alive;
  if (avatar.visible) { avatar.position.copy(player.position); avatar.rotation.y = player.yaw + Math.PI; avatar.userData.pose('alert', mission.elapsed, 0, 0, Math.min(1, player.speed / 4.5)); }
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
$('pause-menu').addEventListener('click', returnToMenu); $('results-menu').addEventListener('click', returnToMenu);
$('pause-camera').addEventListener('click', () => setCameraMode(camMode + 1)); $('camera-button').addEventListener('click', () => setCameraMode(camMode + 1));
$('swap').addEventListener('click', () => chooseWeapon(WEAPONS[(WEAPONS.findIndex((item) => item.id === spec.id) + 1) % WEAPONS.length].id));
$('again').addEventListener('click', () => { ui['level-select'].value = Math.min(100, level.id + 1); level = getLevel(ui['level-select'].value); resetMission(); ui.complete.classList.remove('on'); ui.hud.classList.add('on'); ui.touch.classList.add('on'); input.setEnabled(true); input.requestPointerLock(); radio('COMMAND', level.briefing, 5.4); });
$('replay').addEventListener('click', () => { resetMission(); ui.complete.classList.remove('on'); ui.hud.classList.add('on'); ui.touch.classList.add('on'); input.setEnabled(true); input.requestPointerLock(); });
addEventListener('keydown', (event) => { if (event.code === 'Escape' && mission.started && player.alive && !['complete','failed'].includes(mission.phase)) { if (mission.paused) resume(); else menu(); } if (!mission.started || mission.paused || !player.alive) return; if (/^Digit[1-5]$/.test(event.code) && !event.repeat) chooseWeapon(WEAPONS[Number(event.code.slice(-1)) - 1].id); if (event.code === 'KeyQ' && !event.repeat) chooseWeapon(WEAPONS[(WEAPONS.findIndex((item) => item.id === spec.id) + 1) % WEAPONS.length].id); if (event.code === 'KeyC' && !event.repeat) setCameraMode(camMode + 1); });
renderer.domElement.addEventListener('click', () => { if (mission.started && !mission.paused && player.alive) input.requestPointerLock(); });

function frame(now) {
  requestAnimationFrame(frame);
  const realDt = Math.max(0.0001, (now - last) / 1000); last = now; const dt = Math.min(realDt, 0.05);
  fpsClock += realDt; fpsFrames += 1; if (fpsClock >= 0.4) { fps = Math.round(fpsFrames / fpsClock); fpsFrames = 0; fpsClock = 0; }
  if (mission.started && !mission.paused && player.alive && !['complete','failed'].includes(mission.phase)) {
    movement(dt); weapon.cooldown = Math.max(0, weapon.cooldown - dt); weapon.recoil = Math.max(0, weapon.recoil - dt * 6.2); weapon.flashTimer = Math.max(0, weapon.flashTimer - dt);
    if (input.consumeReload()) beginReload(); if (weapon.reloadRemaining > 0) { weapon.reloadRemaining -= dt; if (weapon.reloadRemaining <= 0) finishReload(); } else if (input.state.fire) fireWeapon();
    updateEnemies(dt); updateObjectives(dt); updateCameraAndWeapon(dt); updateWaypoint();
  } else if (!mission.started) { camera.position.set(0, 2.25, 16.5); camera.rotation.set(-0.035, 0, 0); }
  if (statusTimer > 0 && (statusTimer -= dt) <= 0) ui['status-message'].classList.remove('on');
  if (radioTimer > 0 && (radioTimer -= dt) <= 0) ui.radio.classList.remove('on');
  if (hitTimer > 0 && (hitTimer -= dt) <= 0) ui.reticle.classList.remove('hit','headshot');
  if (damageTimer > 0 && (damageTimer -= dt) <= 0) { ui.damage.style.opacity = '0'; ui['damage-direction'].classList.remove('on'); }
  for (const o of tracers) { if (o.userData.life <= 0) continue; o.userData.life -= dt; o.material.opacity = Math.max(0, o.userData.life * 13); if (o.userData.life <= 0) o.visible = false; }
  renderer.info.reset(); renderer.render(scene, camera);
  const living = enemies.filter((enemy) => enemy.alive);
  const boss = living.find((enemy) => enemy.commander);
  if (boss) ui['commander-fill'].style.transform = `scaleX(${Math.max(0, boss.health / boss.maxHealth)})`;
  Object.assign(window.__GAME__, { pos: [Number(player.position.x.toFixed(3)), Number(player.position.z.toFixed(3))], elevation: Number(player.position.y.toFixed(3)), velocity: [Number(player.velocity.x.toFixed(3)), Number(player.verticalVelocity.toFixed(3)), Number(player.velocity.z.toFixed(3))], fps, speed: Number(player.speed.toFixed(2)), draws: renderer.info.render.calls, tris: renderer.info.render.triangles, started: mission.started, paused: mission.paused, alive: player.alive, health: Math.ceil(player.health), weapon: spec.name, ammo: ammo().magazine, reserveAmmo: ammo().reserve, reloading: weapon.reloadRemaining > 0, ads: weapon.adsBlend > 0.55, grounded: player.grounded, enemyCount: living.length, enemies: living.map((enemy) => ({ pos: [Number(enemy.object.position.x.toFixed(2)), Number(enemy.object.position.z.toFixed(2))], health: Math.ceil(enemy.health), commander: enemy.commander })), enemyState: living[0]?.state ?? 'none', enemyHealth: living[0] ? Math.ceil(living[0].health) : 0, enemyShots: enemies.reduce((sum, enemy) => sum + enemy.shots, 0), damageTaken: player.damageTaken, deaths: player.deaths, missionPhase: mission.phase, level: level.id, map: level.map.id, mode: level.mode.id, highestCompleted: progress.state.highestCompleted, intelCount: mission.intel, intelRequired: level.intelRequired, extractionActive: mission.objectiveClear, commanderSpawned: mission.commanderSpawned, commanderAlive: Boolean(boss), commanderHealth: boss ? Math.ceil(boss.health) : 0, kills: mission.kills, requiredKills: level.requiredKills, elapsed: Number(mission.elapsed.toFixed(2)), score: mission.score, over: mission.phase === 'complete', shots: mission.shots, hits: mission.hits, headshots: mission.headshots, cameraMode: camModes[camMode], upgrades: progress.state.upgrades, stair: arena?.stair ?? null });
}
function resize() { renderer.setPixelRatio(Math.min(devicePixelRatio || 1, innerWidth < 900 ? 1.25 : 1.5)); renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.fov = innerWidth < innerHeight ? 86 : 72; camera.updateProjectionMatrix(); for (const model of models.values()) model.scale.setScalar(innerWidth < innerHeight ? 0.32 : 0.44); }
addEventListener('resize', resize); resize(); loadArena(); camera.position.set(0, 2.25, 16.5); window.__READY__ = true; requestAnimationFrame(frame);
