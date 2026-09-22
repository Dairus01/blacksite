import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright-core';

const root = path.resolve('export/web/jam');
const out = path.resolve('artifacts/campaign-playtest');
fs.mkdirSync(out, { recursive: true });
const mime = new Map([['.html','text/html; charset=utf-8'],['.js','text/javascript; charset=utf-8'],['.css','text/css; charset=utf-8'],['.webp','image/webp'],['.woff2','font/woff2']]);
const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? '/', 'http://127.0.0.1');
    const file = path.resolve(root, `.${decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname)}`);
    if (file !== root && !file.startsWith(`${root}${path.sep}`)) throw new Error('outside root');
    const stat = await fs.promises.stat(file);
    if (!stat.isFile()) throw new Error('not file');
    response.writeHead(200, { 'Content-Type': mime.get(path.extname(file)) ?? 'application/octet-stream', 'Content-Length': stat.size });
    fs.createReadStream(file).pipe(response);
  } catch { response.writeHead(404).end('not found'); }
});
await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const executablePath = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].find((item) => fs.existsSync(item));
assert.ok(executablePath);
const browser = await chromium.launch({ executablePath, headless: true, args: ['--enable-webgl','--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [], missing = [];
page.on('pageerror', (error) => errors.push(error.message));
page.on('console', (entry) => { if (entry.type() === 'error') errors.push(entry.text()); });
page.on('response', (response) => { if (response.status() === 404 && !response.url().endsWith('/favicon.ico')) missing.push(response.url()); });
const url = `http://127.0.0.1:${server.address().port}/`;
const state = () => page.evaluate(() => window.__GAME__);
try {
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForFunction(() => window.__READY__);
  assert.equal(await page.locator('#level-select option').count(), 100);
  assert.equal(await page.locator('#weapon-select option').count(), 5);
  await page.locator('#tutorial-open').click();
  assert.equal(await page.locator('#tutorial').isVisible(), true);
  await page.locator('#tutorial-close').click();
  await page.locator('#level-select').selectOption('3');
  await page.locator('#weapon-select').selectOption('kestrel');
  await page.locator('#startb').click();
  await page.waitForFunction(() => window.__GAME__.started && window.__GAME__.level === 3);
  let snapshot = await state();
  assert.equal(snapshot.map, 'drydock');
  assert.equal(snapshot.mode, 'hold');
  assert.equal(snapshot.weapon, 'KESTREL-9');
  await page.screenshot({ path: path.join(out, 'drydock.png') });
  await page.keyboard.press('Digit5');
  await page.waitForFunction(() => window.__GAME__.weapon === 'ATLAS-56');
  await page.keyboard.press('KeyC');
  await page.waitForFunction(() => window.__GAME__.cameraMode === 'LEFT SHOULDER');
  await page.screenshot({ path: path.join(out, 'shoulder-camera.png') });
  await page.keyboard.press('Escape');
  await page.waitForFunction(() => window.__GAME__.paused);
  assert.equal(await page.locator('#pause').isVisible(), true);
  await page.locator('#resume').click();
  await page.waitForFunction(() => !window.__GAME__.paused);
  const startStair = await page.evaluate(() => {
    const stair = window.__GAME__.stair;
    const z = stair.z + stair.count * stair.run / 2 + 0.7;
    const moved = window.game.debug.teleportPlayer([stair.x, 0, z]);
    window.game.debug.lookAt([stair.x, 1.66, stair.z - stair.count * stair.run / 2 - 2]);
    return moved;
  });
  assert.equal(startStair, true, 'Stair bottom must be reachable');
  await page.keyboard.down('KeyW');
  await page.waitForTimeout(1350);
  await page.keyboard.up('KeyW');
  snapshot = await state();
  assert.ok(snapshot.elevation >= 1.8, `Player must walk up stairs; elevation=${snapshot.elevation}`);
  const stairElevation = snapshot.elevation;
  await page.screenshot({ path: path.join(out, 'stair-top.png') });
  await page.keyboard.press('Escape');
  await page.locator('#pause-menu').click();
  for (const [id, map, mode] of [['4','drydock','hunt'],['5','quarry','recon'],['7','substation','hold'],['100','drydock','hunt']]) {
    await page.locator('#level-select').selectOption(id);
    await page.locator('#startb').click();
    await page.waitForFunction((number) => window.__GAME__.level === number, Number(id));
    snapshot = await state();
    assert.equal(snapshot.map, map);
    assert.equal(snapshot.mode, mode);
    await page.screenshot({ path: path.join(out, `level-${id}.png`) });
    await page.keyboard.press('Escape');
    await page.locator('#pause-menu').click();
  }
  await page.locator('#level-select').selectOption('4');
  await page.locator('#weapon-select').selectOption('vesper');
  await page.locator('#startb').click();
  await page.waitForFunction(() => window.__GAME__.level === 4);
  await page.keyboard.press('KeyC');
  await page.keyboard.press('KeyC');
  await page.waitForFunction(() => window.__GAME__.cameraMode === 'FIRST PERSON');
  async function shootAt(target, duration) {
    const positioned = await page.evaluate(([x, z]) => {
      const moved = window.game.debug.teleportPlayer([x, 0, z + 4.5]);
      window.game.debug.lookAt([x, 1.3, z]);
      return moved;
    }, target);
    assert.equal(positioned, true, `Target setup must be traversable: ${target}`);
    await page.waitForTimeout(100);
    await page.mouse.down({ button: 'left' });
    await page.waitForTimeout(duration);
    await page.mouse.up({ button: 'left' });
  }
  for (let attempt = 0; attempt < 8 && (await state()).kills < 2; attempt += 1) {
    const target = (await state()).enemies.find((enemy) => !enemy.commander)?.pos;
    assert.ok(target, 'Ordinary target should remain until kill count is met');
    await shootAt(target, 390);
  }
  await page.waitForFunction(() => window.__GAME__.commanderSpawned, null, { timeout: 5000 });
  assert.equal((await state()).commanderAlive, true);
  await page.screenshot({ path: path.join(out, 'commander.png') });
  for (let attempt = 0; attempt < 10 && (await state()).commanderAlive; attempt += 1) {
    if ((await state()).ammo === 0) {
      await page.keyboard.press('KeyR');
      await page.waitForFunction(() => !window.__GAME__.reloading && window.__GAME__.ammo > 0, null, { timeout: 5000 });
    }
    const target = (await state()).enemies.find((enemy) => enemy.commander)?.pos;
    assert.ok(target);
    await shootAt(target, 400);
  }
  snapshot = await state();
  assert.equal(snapshot.commanderAlive, false);
  assert.equal(snapshot.extractionActive, true);
  await page.screenshot({ path: path.join(out, 'commander-down.png') });
  assert.deepEqual(errors, []);
  assert.deepEqual(missing, []);
  fs.writeFileSync(path.join(out, 'state.json'), JSON.stringify(snapshot, null, 2));
  console.log(JSON.stringify({ passed: true, levels: 100, weapons: 5, maps: 4, modes: 4, stairElevation, commander: 'defeated', errors, missing }, null, 2));
} finally {
  await browser.close(); server.closeAllConnections?.(); await new Promise((resolve) => server.close(resolve));
}
