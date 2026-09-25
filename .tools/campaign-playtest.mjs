import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { chromium } from 'playwright-core';

const root = path.resolve('game');
const out = path.resolve('artifacts/campaign-playtest');
fs.mkdirSync(out, { recursive: true });
const mime = new Map([['.html','text/html; charset=utf-8'],['.js','text/javascript; charset=utf-8'],['.css','text/css; charset=utf-8'],['.mp4','video/mp4'],['.webp','image/webp'],['.woff2','font/woff2']]);
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
 await page.goto(url);await page.waitForFunction(()=>window.__READY__);await page.click('#skip-memory');await page.click('#startb');
 const results=[];
 for(let mission=1;mission<=4;mission++){
  await page.waitForFunction(id=>window.__GAME__.level===id,mission);
  await page.screenshot({path:path.join(out,`mission-${mission}-spawn.png`)});
  for(let n=0;n<160;n++){
   const st=await state();if(st.over)break;assert.ok(st.alive,`mission ${mission} operator alive`);
   if(n%10===0)console.log(`Mission ${mission} stage ${st.stage}: ${st.kills} kills, ${st.enemyCount} alive`);
   if(st.enemyCount){const e=st.enemies.find(e=>e.commander)??st.enemies[0];await page.evaluate(e=>{const [x,z]=e.pos;for(const [dx,dz]of [[0,3],[3,0],[-3,0],[0,-3],[2,2],[-2,-2]])if(window.game.debug.teleportPlayer([x+dx,e.elevation,z+dz])&&window.game.debug.hasLineOfSight([x,0,z]))break;window.game.debug.lookAt([x,e.elevation+1.3,z]);},e);await page.waitForTimeout(80);await page.mouse.down();await page.waitForTimeout(320);await page.mouse.up();}
   else {const target=st.objectivePosition;const ok=await page.evaluate(pos=>window.game.debug.teleportPlayer(pos),target);assert.ok(ok,`objective ${st.objective} reachable at ${target}`);await page.keyboard.press('KeyE');await page.waitForTimeout(350);}
   if(st.ammo<5){await page.keyboard.press('KeyR');await page.waitForTimeout(2300);}
   await page.waitForTimeout(100);
  }
  const st=await state();assert.ok(st.over,`mission ${mission} completes`);assert.equal(st.highestCompleted,mission);results.push(st);await page.screenshot({path:path.join(out,`mission-${mission}-complete.png`)});
  if(mission<4)await page.click('#again');
 }
 assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);fs.writeFileSync(path.join(out,'report.json'),JSON.stringify({passed:true,results,errors,missing},null,2));console.log('All four authored missions completed; progression and boss verified.');
} finally {await browser.close();server.closeAllConnections?.();await new Promise(r=>server.close(r));}
