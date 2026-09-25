export const WEAPONS = Object.freeze([
  { id: 'arx7', name: 'ARX-7', role: 'ASSAULT RIFLE', capacity: 30, reserve: 150, damage: 34, interval: 0.105, reload: 1.8, spread: 0.0038, adsSpread: 0.0012, pellets: 1, range: 31, recoil: 0.58, color: 0x39473e },
  { id: 'kestrel', name: 'KESTREL-9', role: 'SUBMACHINE GUN', capacity: 36, reserve: 180, damage: 22, interval: 0.067, reload: 1.45, spread: 0.006, adsSpread: 0.002, pellets: 1, range: 23, recoil: 0.42, color: 0x2e3c42 },
  { id: 'breacher', name: 'BR-12', role: 'COMBAT SHOTGUN', capacity: 8, reserve: 48, damage: 15, interval: 0.58, reload: 2.1, spread: 0.040, adsSpread: 0.021, pellets: 8, range: 16, recoil: 1.0, color: 0x443a30 },
  { id: 'vesper', name: 'VESPER', role: 'MARKSMAN RIFLE', capacity: 16, reserve: 80, damage: 68, interval: 0.34, reload: 2.2, spread: 0.0025, adsSpread: 0.00045, pellets: 1, range: 55, recoil: 0.86, color: 0x363c37 },
  { id: 'sentinel', name: 'SENTINEL-45', role: 'SIDEARM', capacity: 12, reserve: 72, damage: 42, interval: 0.19, reload: 1.35, spread: 0.005, adsSpread: 0.0015, pellets: 1, range: 27, recoil: 0.62, color: 0x41453d },
]);

export const UPGRADES = Object.freeze([
  { id: 'quick', name: 'QUICK HANDS', effect: 'Reload 22% faster' },
  { id: 'runner', name: 'RUNNER', effect: 'Move 12% faster' },
  { id: 'hollow', name: 'HOLLOW POINT', effect: 'Deal 15% more damage' },
  { id: 'extended', name: 'EXTENDED MAG', effect: 'Magazine capacity +35%' },
  { id: 'adrenaline', name: 'ADRENALINE', effect: 'Recover 8 health on a kill' },
  { id: 'armor', name: 'ARMOR PLATE', effect: 'Maximum health +20' },
]);

export function weaponById(id) { return WEAPONS.find((weapon) => weapon.id === id) ?? WEAPONS[0]; }

export function capacityFor(spec, upgrades) { return Math.round(spec.capacity * (upgrades.extended ? 1.35 : 1)); }
export function reloadFor(spec, upgrades) { return spec.reload * (upgrades.quick ? 0.78 : 1); }
export function damageFor(spec, upgrades) { return spec.damage * (upgrades.hollow ? 1.15 : 1); }
