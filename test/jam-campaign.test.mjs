import test from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS, MAPS, MODES, getLevel, createCampaignProgress } from '../export/web/jam/src/campaign.js';
import { WEAPONS, UPGRADES, capacityFor, reloadFor, damageFor } from '../export/web/jam/src/arsenal.js';

test('campaign has 100 selectable levels across four maps and four modes', () => {
  assert.equal(LEVELS.length, 100);
  assert.equal(new Set(LEVELS.map((level) => level.id)).size, 100);
  assert.equal(new Set(LEVELS.map((level) => level.title)).size, 100);
  assert.deepEqual(new Set(LEVELS.map((level) => level.map.id)), new Set(MAPS.map((map) => map.id)));
  assert.deepEqual(new Set(LEVELS.map((level) => level.mode.id)), new Set(MODES.map((mode) => mode.id)));
  assert.equal(getLevel(1).intelRequired, 1);
  assert.equal(getLevel(4).commander, true);
  assert.equal(getLevel(100).commander, true);
  assert.ok(getLevel(100).enemyHealth > getLevel(1).enemyHealth);
  assert.equal(getLevel(999).id, 100);
});

test('campaign progress saves selection and completion but not run upgrades', () => {
  const map = new Map();
  const storage = { getItem: (key) => map.get(key), setItem: (key, value) => map.set(key, value) };
  const progress = createCampaignProgress(storage);
  progress.selectLevel(57);
  progress.selectWeapon('vesper');
  progress.setUpgrade('runner', true);
  progress.complete(57);
  assert.equal(progress.state.selectedLevel, 58);
  assert.equal(progress.state.highestCompleted, 57);
  assert.equal(progress.state.upgrades.runner, true);
  const nextRun = createCampaignProgress(storage);
  assert.equal(nextRun.state.selectedLevel, 58);
  assert.equal(nextRun.state.selectedWeapon, 'vesper');
  assert.deepEqual(nextRun.state.upgrades, {});
  progress.resetRun();
  assert.deepEqual(progress.state.upgrades, {});
});

test('five weapon profiles and six upgrades modify copies of run stats', () => {
  assert.equal(WEAPONS.length, 5);
  assert.equal(UPGRADES.length, 6);
  assert.equal(new Set(WEAPONS.map((item) => item.id)).size, 5);
  const rifle = WEAPONS[0];
  const boosted = { extended: true, quick: true, hollow: true };
  assert.ok(capacityFor(rifle, boosted) > rifle.capacity);
  assert.ok(reloadFor(rifle, boosted) < rifle.reload);
  assert.ok(damageFor(rifle, boosted) > rifle.damage);
  assert.equal(rifle.capacity, 30);
});
