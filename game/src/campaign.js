import { STORAGE_KEYS } from './config/game-config.js';

export const MAPS = Object.freeze([
  { id: 'blacksite', name: 'BLACKSITE', region: 'Aegis relay', description: 'Breach the communications compound and recover the missing uplink.' },
  { id: 'desert-comms', name: 'DESERT COMMS', region: 'Red Mesa', description: 'Trace the stolen signal through a remote desert communications installation.' },
  { id: 'frozen-outpost', name: 'FROZEN OUTPOST', region: 'North range', description: 'Retake a snowbound high-altitude station before its archive is erased.' },
  { id: 'harbor-district', name: 'HARBOR DISTRICT', region: 'Greywater port', description: 'Intercept a protocol transfer moving through the nighttime container docks.' },
]);

export const MODES = Object.freeze([
  { id: 'recon', name: 'RECON', verb: 'Recover intelligence and extract' },
  { id: 'assault', name: 'ASSAULT', verb: 'Eliminate the hostile force and extract' },
  { id: 'hold', name: 'HOLD', verb: 'Survive the defense window and extract' },
  { id: 'hunt', name: 'HUNT', verb: 'Find and defeat the Commander' },
]);

const ACTS = Object.freeze([
  { name: 'THE BLACKOUT', incident: 'The Aegis relay vanished from the network. A hostile cell has replaced its security team.', order: 'Trace their uplink, identify the cell, and recover the stolen key.' },
  { name: 'THE TRANSFER', incident: 'Intercepts show the key moving through a covert supply chain.', order: 'Break each transfer route and follow the signal back to its source.' },
  { name: 'THE FALSE SIGNAL', incident: 'The enemy is broadcasting counterfeit orders across the region.', order: 'Secure the relay nodes and isolate their command channel.' },
  { name: 'THE LAST TRANSMISSION', incident: 'The network is closing. Their remaining commanders are burning the evidence.', order: 'Clear the final sites and extract the complete cipher before dawn.' },
]);

const OPERATIONS = ['FIRST LIGHT', 'COLD CIRCUIT', 'OPEN CHANNEL', 'NIGHT SHIFT', 'STATIC LINE', 'GHOST SIGNAL', 'HARD RESET', 'SHADOW ROUTE', 'LAST MILE', 'BREACH POINT'];
const TARGETS = ['relay', 'courier', 'archive', 'transmitter', 'intercept', 'cipher', 'convoy', 'switchboard', 'dead drop', 'command post'];

export function getLevel(number) {
  const id = Math.max(1, Math.min(100, Math.trunc(Number(number) || 1)));
  const actIndex = Math.floor((id - 1) / 25);
  const act = ACTS[actIndex];
  const actLevel = (id - 1) % 25;
  const mode = MODES[(id - 1) % MODES.length];
  const map = MAPS[Math.floor((id - 1) / 2) % MAPS.length];
  const operation = OPERATIONS[(id - 1) % OPERATIONS.length];
  const target = TARGETS[Math.floor((id - 1) / 10) % TARGETS.length];
  const commander = mode.id === 'hunt' || id % 10 === 0;
  const requiredKills = Math.min(13, 2 + Math.floor((id - 1) / 4) + (mode.id === 'assault' ? 2 : 0));
  const intelRequired = mode.id === 'recon' ? Math.min(5, 1 + Math.floor((id - 1) / 16)) : 0;
  return Object.freeze({
    id,
    title: `${operation} // ${target.toUpperCase()}`,
    act: actIndex + 1,
    actName: act.name,
    actLevel: actLevel + 1,
    map,
    mode,
    commander,
    requiredKills,
    intelRequired,
    holdSeconds: mode.id === 'hold' ? Math.min(85, 24 + Math.floor(id / 3)) : 0,
    maxAlive: Math.min(6, 2 + Math.floor(id / 18)),
    enemyHealth: Math.min(145, 65 + Math.floor(id / 5) * 4),
    enemyDamage: Math.min(15, 5 + Math.floor(id / 14)),
    briefing: `${act.incident} ${act.order} Operation ${operation.toLowerCase()} targets the ${target} at ${map.region}. ${mode.verb}. ${commander ? 'A field Commander is coordinating the cell; defeat them before extraction.' : 'Recover evidence and follow the trail to the next operation.'}`,
  });
}

export const LEVELS = Object.freeze(Array.from({ length: 100 }, (_, index) => getLevel(index + 1)));

export function createCampaignProgress(storage = globalThis.localStorage) {
  const key = STORAGE_KEYS.progress;
  let data = { highestCompleted: 0, selectedLevel: 1, selectedWeapon: 'arx7', upgrades: {} };
  try {
    const parsed = JSON.parse(storage?.getItem(key) ?? 'null');
    if (parsed && typeof parsed === 'object') {
      data = {
        highestCompleted: Math.max(0, Math.min(100, Math.trunc(parsed.highestCompleted || 0))),
        selectedLevel: Math.max(1, Math.min(100, Math.trunc(parsed.selectedLevel || 1))),
        selectedWeapon: typeof parsed.selectedWeapon === 'string' ? parsed.selectedWeapon : 'arx7',
        upgrades: {},
      };
    }
  } catch { /* Storage is optional; gameplay remains available. */ }
  const persist = () => { try { const { upgrades: _runOnly, ...saved } = data; storage?.setItem(key, JSON.stringify(saved)); } catch { /* private mode */ } };
  return {
    get state() { return { ...data, upgrades: { ...data.upgrades } }; },
    selectLevel(id) { data.selectedLevel = getLevel(id).id; persist(); return data.selectedLevel; },
    selectWeapon(id) { data.selectedWeapon = id; persist(); },
    complete(id) { data.highestCompleted = Math.max(data.highestCompleted, getLevel(id).id); data.selectedLevel = Math.min(100, getLevel(id).id + 1); persist(); },
    setUpgrade(id, value) { data.upgrades[id] = value; },
    resetRun() { data.upgrades = {}; },
  };
}
