import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright-core';

const root = path.resolve('game');
const out = path.resolve('artifacts/jam-acceptance');
fs.mkdirSync(out, { recursive: true });
const mime = new Map([
  ['.html', 'text/html; charset=utf-8'], ['.js', 'text/javascript; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'], ['.png', 'image/png'], ['.json', 'application/json'],
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

const browserPath = [
  process.env.BROWSER_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].filter(Boolean).find((candidate) => fs.existsSync(candidate));
assert.ok(browserPath, 'Chrome or Edge is required');
const browser = await chromium.launch({ executablePath: browserPath, headless: true, args: ['--enable-webgl', '--ignore-gpu-blocklist'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
const missing = [];
page.on('pageerror', (error) => errors.push(error.message));
page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
page.on('response', (response) => { if (response.status() === 404 && !response.url().endsWith('/favicon.ico')) missing.push(response.url()); });

try {
  await page.goto(`http://127.0.0.1:${server.address().port}/`, { waitUntil: 'load', timeout: 30_000 });
  await page.waitForFunction(() => window.__READY__ === true, null, { timeout: 10_000 });
  const initial = await page.evaluate(() => window.__GAME__);
  assert.equal(initial.missionPhase, 'deploy');
  assert.equal(initial.level, 1);
  assert.equal(initial.enemyCount, 0);
  assert.ok(initial.draws > 0 && initial.tris > 0);

  await page.locator('#startb').click();
  await page.waitForFunction(() => window.__GAME__.started && window.__GAME__.missionPhase === 'active');
  await page.mouse.down({ button: 'left' });
  await page.waitForTimeout(1400);
  await page.mouse.up({ button: 'left' });
  await page.waitForFunction(() => window.__GAME__.kills >= 2, null, { timeout: 5_000 });

  await page.keyboard.down('KeyW');
  await page.waitForFunction(() => window.__GAME__.intelCount === 1 && window.__GAME__.extractionActive, null, { timeout: 7_000 });
  await page.keyboard.up('KeyW');

  await page.keyboard.down('KeyD');
  await page.waitForFunction(() => window.__GAME__.pos[0] >= 7.1, null, { timeout: 4_000 });
  await page.keyboard.up('KeyD');
  await page.keyboard.down('KeyW');
  // BLACKSITE's authored approach is longer than the original test range.
  // Keep driving the real forward key long enough to reach the actual beacon.
  await page.waitForFunction(() => window.__GAME__.over === true && window.__GAME__.missionPhase === 'complete', null, { timeout: 7_000 });
  await page.keyboard.up('KeyW');

  const final = await page.evaluate(() => window.__GAME__);
  assert.equal(final.kills, 2);
  assert.equal(final.intelCount, 1);
  assert.equal(final.over, true);
  assert.ok(final.score >= 775);
  assert.ok(final.shots >= 2 && final.hits >= 2);
  assert.ok(final.draws < 900 && final.tris < 1_500_000);
  assert.deepEqual(errors, []);
  assert.deepEqual(missing, []);
  await page.screenshot({ path: path.join(out, 'complete.png') });
  fs.writeFileSync(path.join(out, 'state.json'), JSON.stringify(final, null, 2));
  assert.equal(await page.locator('#upgrade-choices button').count(), 3);
  await page.locator('#upgrade-choices button').first().click();
  await page.locator('#again').click();
  await page.waitForFunction(() => window.__GAME__.level === 2 && window.__GAME__.missionPhase === 'active');
  const next = await page.evaluate(() => window.__GAME__);
  assert.equal(next.mode, 'assault');
  assert.equal(next.kills, 0);
  assert.equal(Object.keys(next.upgrades).length, 1);
  console.log(JSON.stringify({ passed: true, checks: { started: true, killed: true, intel: true, extracted: true, errors: 0, missing: 0 }, state: final }, null, 2));
} finally {
  await browser.close();
  server.closeAllConnections?.();
  await new Promise((resolve) => server.close(resolve));
}
