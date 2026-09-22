import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright-core';

const root = path.resolve('export/web/jam');
const out = path.resolve('artifacts/milestone-1');
fs.mkdirSync(out, { recursive: true });
const mime = new Map([
  ['.html', 'text/html; charset=utf-8'], ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'], ['.png', 'image/png'], ['.json', 'application/json'],
  ['.woff2', 'font/woff2'],
]);
const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url ?? '/', 'http://127.0.0.1');
    const rel = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
    const file = path.resolve(root, `.${rel}`);
    if (file !== root && !file.startsWith(`${root}${path.sep}`)) throw new Error('outside root');
    const stat = await fs.promises.stat(file);
    if (!stat.isFile()) throw new Error('not a file');
    response.writeHead(200, { 'Content-Type': mime.get(path.extname(file)) ?? 'application/octet-stream', 'Content-Length': stat.size });
    fs.createReadStream(file).pipe(response);
  } catch {
    response.writeHead(404).end('not found');
  }
});
await new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(0, '127.0.0.1', resolve);
});

const executablePath = [
  process.env.BROWSER_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].filter(Boolean).find((candidate) => fs.existsSync(candidate));
assert.ok(executablePath, 'Chrome or Edge is required');
const browser = await chromium.launch({ executablePath, headless: true, args: ['--enable-webgl', '--ignore-gpu-blocklist'] });
const baseURL = `http://127.0.0.1:${server.address().port}/`;
const errors = [];
const missing = [];
const watch = (page) => {
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('response', (response) => {
    if (response.status() >= 400 && !response.url().endsWith('/favicon.ico')) missing.push(`${response.status()} ${response.url()}`);
  });
};
const boot = async (page) => {
  watch(page);
  await page.goto(baseURL, { waitUntil: 'load', timeout: 30_000 });
  await page.waitForFunction(() => window.__READY__ === true, null, { timeout: 10_000 });
};
const fire = async (page, shots) => {
  for (let i = 0; i < shots; i += 1) {
    await page.mouse.down({ button: 'left' });
    await page.waitForTimeout(75);
    await page.mouse.up({ button: 'left' });
    await page.waitForTimeout(90);
  }
};
const holdKey = async (page, key, ms) => {
  await page.keyboard.down(key);
  await page.waitForTimeout(ms);
  await page.keyboard.up(key);
};

const desktop = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const combat = await desktop.newPage();
await boot(combat);
await combat.screenshot({ path: path.join(out, 'title.png') });
await combat.locator('#startb').click();
await combat.waitForFunction(() => window.__GAME__.started && window.__GAME__.missionPhase === 'active');
await combat.screenshot({ path: path.join(out, 'spawn.png') });
await combat.waitForFunction(() => window.__GAME__.enemyState === 'alert', null, { timeout: 4_000 });
await combat.waitForFunction(() => window.__GAME__.enemyShots > 0, null, { timeout: 5_000 });
await combat.screenshot({ path: path.join(out, 'combat.png') });
await holdKey(combat, 'KeyW', 900);
await combat.screenshot({ path: path.join(out, 'soldier-close.png') });
await combat.mouse.down({ button: 'right' });
await combat.waitForFunction(() => window.__GAME__.ads === true);
await combat.waitForTimeout(260);
await combat.screenshot({ path: path.join(out, 'ads.png') });
await combat.mouse.up({ button: 'right' });
await fire(combat, 2);
await combat.keyboard.press('KeyR');
await combat.waitForFunction(() => window.__GAME__.reloading === true);
await combat.waitForFunction(() => window.__GAME__.reloading === false && window.__GAME__.ammo === 30, null, { timeout: 3_000 });
const afterReload = await combat.evaluate(() => window.__GAME__);
assert.ok(afterReload.reserveAmmo < 120, 'reload must consume reserve ammunition');
await combat.waitForFunction(() => window.__GAME__.damageTaken > 0, null, { timeout: 8_000 });
await combat.waitForFunction(() => window.__GAME__.alive === false && window.__GAME__.missionPhase === 'failed', null, { timeout: 24_000 });
await combat.screenshot({ path: path.join(out, 'death.png') });
await combat.locator('#retry').click();
await combat.waitForFunction(() => window.__GAME__.alive && window.__GAME__.health === 100 && window.__GAME__.missionPhase === 'active');

const traversal = await desktop.newPage();
await boot(traversal);
await traversal.locator('#startb').click();
await traversal.waitForFunction(() => window.__GAME__.missionPhase === 'active');
await fire(traversal, 4);
await traversal.waitForFunction(() => window.__GAME__.enemyCount === 0);
await traversal.waitForTimeout(420);
await traversal.screenshot({ path: path.join(out, 'enemy-death.png') });
await holdKey(traversal, 'KeyW', 2500);
await holdKey(traversal, 'KeyA', 1450);
await holdKey(traversal, 'KeyW', 1120);
await traversal.screenshot({ path: path.join(out, 'interior.png') });
await holdKey(traversal, 'KeyA', 680);
await traversal.keyboard.down('KeyW');
await traversal.waitForFunction(() => window.__GAME__.pos[1] < -3.2 && window.__GAME__.grounded, null, { timeout: 3_000 });
await traversal.screenshot({ path: path.join(out, 'stairs.png') });
await traversal.keyboard.up('KeyW');
const stairState = await traversal.evaluate(() => window.__GAME__);
assert.ok(stairState.pos[1] < -3.2, 'player must traverse into the staircase');
assert.ok(stairState.grounded, 'player must remain grounded on staircase steps');
assert.ok(stairState.velocity[1] === 0, 'stopping on a step must settle vertical velocity');
assert.ok(stairState.elevation >= 0.36, 'stair traversal must stand on authored step heights');

const mobile = await browser.newContext({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
  userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/124 Mobile Safari/537.36',
});
const phone = await mobile.newPage();
await boot(phone);
const start = await phone.locator('#startb').boundingBox();
assert.ok(start, 'mobile start button must be visible');
await phone.touchscreen.tap(start.x + start.width / 2, start.y + start.height / 2);
await phone.waitForFunction(() => window.__GAME__.started);
const cdp = await phone.context().newCDPSession(phone);
const stick = await phone.locator('#stick').boundingBox();
assert.ok(stick, 'movement stick must be visible');
const sx = stick.x + stick.width / 2;
const sy = stick.y + stick.height / 2;
await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: sx, y: sy, id: 1, radiusX: 8, radiusY: 8, force: 1 }] });
await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: sx, y: sy - 42, id: 1, radiusX: 8, radiusY: 8, force: 1 }] });
await phone.waitForTimeout(1100);
await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
const moved = await phone.evaluate(() => window.__GAME__.pos);
assert.ok(moved[1] < 14, 'real touch movement must move the player forward');
const aim = await phone.locator('#ads').boundingBox();
assert.ok(aim, 'mobile ADS must be visible');
await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: aim.x + aim.width / 2, y: aim.y + aim.height / 2, id: 2, radiusX: 7, radiusY: 7, force: 1 }] });
await phone.waitForFunction(() => window.__GAME__.ads === true);
await phone.screenshot({ path: path.join(out, 'mobile.png') });
await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
const fireButton = await phone.locator('#fire').boundingBox();
await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: fireButton.x + fireButton.width / 2, y: fireButton.y + fireButton.height / 2, id: 3, radiusX: 8, radiusY: 8, force: 1 }] });
await phone.waitForTimeout(160);
await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
await phone.waitForFunction(() => window.__GAME__.ammo < 30);
const reloadButton = await phone.locator('#reload').boundingBox();
await phone.touchscreen.tap(reloadButton.x + reloadButton.width / 2, reloadButton.y + reloadButton.height / 2);
await phone.waitForFunction(() => window.__GAME__.reloading === true);

const report = {
  passed: true,
  checks: {
    enemyDetection: true,
    enemyFire: true,
    playerDamage: true,
    playerDeath: true,
    checkpointRestart: true,
    reload: true,
    reserveAmmo: true,
    ads: true,
    stairTraversal: true,
    groundedOnStairs: true,
    mobileStart: true,
    mobileMovement: true,
    mobileAds: true,
    mobileFire: true,
    mobileReload: true,
    consoleErrors: errors.length,
    missingResponses: missing.length,
  },
  combatState: afterReload,
  stairState,
  mobileState: await phone.evaluate(() => window.__GAME__),
};
assert.deepEqual(errors, []);
assert.deepEqual(missing, []);
fs.writeFileSync(path.join(out, 'report.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));

await browser.close();
server.closeAllConnections?.();
await new Promise((resolve) => server.close(resolve));
