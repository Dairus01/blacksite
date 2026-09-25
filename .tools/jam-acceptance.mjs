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
  ['.mp4','video/mp4'], ['.css', 'text/css; charset=utf-8'], ['.png', 'image/png'], ['.json', 'application/json'],
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
  await page.goto(`http://127.0.0.1:${server.address().port}/`, {waitUntil:'load'});
  await page.waitForFunction(()=>window.__READY__);
  await page.locator('#skip-memory').click();
  assert.equal(await page.locator('#mission-cards button:disabled').count(),3);
  await page.locator('#startb').click();
  const state=()=>page.evaluate(()=>window.__GAME__);
  const tp=async(pos)=>{assert.ok(await page.evaluate(pos=>window.game.debug.teleportPlayer(pos),pos));await page.waitForTimeout(100);};
  const movementStart=(await state()).pos;
  await page.keyboard.down('KeyW');await page.waitForTimeout(900);await page.keyboard.up('KeyW');
  const movementEnd=(await state()).pos;
  assert.ok(Math.hypot(movementEnd[0]-movementStart[0],movementEnd[1]-movementStart[1])>.5,'keyboard input moves the operator');
  await page.keyboard.press('Space');await page.waitForTimeout(160);assert.ok(!(await state()).grounded);await page.waitForTimeout(900);
  await page.mouse.down({button:'right'});await page.waitForTimeout(250);assert.ok((await state()).ads);await page.mouse.up({button:'right'});
  await page.keyboard.press('KeyC');assert.ok(await page.waitForFunction(()=>window.__GAME__.crouch));await page.keyboard.press('KeyC');
  await tp([0,0,10]);
  for(let n=0;n<100;n++){
    const st=await state();if(st.over)break;assert.ok(st.alive,'operator survived controlled acceptance encounter');
    if(st.enemyCount){const e=st.enemies[0];await page.evaluate(e=>{const [x,z]=e.pos;for(const [dx,dz] of [[0,4],[4,0],[-4,0],[0,-4]])if(window.game.debug.teleportPlayer([x+dx,e.elevation,z+dz])&&window.game.debug.hasLineOfSight([x,0,z]))break;window.game.debug.lookAt([x,e.elevation+1.3,z]);},e);await page.waitForTimeout(80);await page.mouse.down();await page.waitForTimeout(400);await page.mouse.up();}
    else if(st.stage===2){
      // Walk through the actual operations doorway. The terminal must trigger
      // and show all four attackers without E or an idle defense timer.
      await tp([-6.5,0,3.4]);
      await page.evaluate(()=>window.game.debug.lookAt([-6.5,1.66,-.7]));
      await page.keyboard.down('KeyW');
      await page.waitForFunction(()=>window.__GAME__.stage===3,null,{timeout:3000});
      await page.keyboard.up('KeyW');
      const wave=await state();assert.equal(wave.enemyCount,4);assert.match(wave.objective,/COUNTERATTACK/);
      await page.screenshot({path:path.join(out,'terminal-counterattack.png')});
      await page.keyboard.press('Escape');await page.locator('#pause').getByRole('button',{name:'RESTART CHECKPOINT'}).click();
      await page.waitForFunction(()=>window.__GAME__.stage===3&&window.__GAME__.enemyCount===4);
    }
    else if(st.stage===4){await tp([7.6,0,-15.6]);}
    if(st.ammo<5){await page.keyboard.press('KeyR');await page.waitForTimeout(2100);}
    await page.waitForTimeout(100);
  }
  const final=await state();assert.ok(final.over);assert.equal(final.kills,6);assert.ok(final.credits>=700);assert.ok(final.shots>0&&final.hits>0);
  await page.screenshot({path:path.join(out,'complete.png')});fs.writeFileSync(path.join(out,'state.json'),JSON.stringify(final,null,2));
  await page.click('#results-menu');await page.getByRole('button',{name:'ARSENAL / STORE',exact:true}).click();
  await page.locator('#arsenal .shop-item').filter({hasText:'KESTREL'}).getByRole('button').click();await page.locator('#arsenal .shop-item').filter({hasText:'KESTREL'}).getByRole('button').click();
  await page.reload();await page.waitForFunction(()=>window.__READY__);await page.click('#skip-memory');assert.equal(await page.locator('#weapon-select').inputValue(),'kestrel');
  assert.equal(await page.locator('#mission-cards button:disabled').count(),2);
  await page.selectOption('#level-select','1');await page.click('#startb');
  await tp([-9.55,0,-1.7]);await page.evaluate(()=>window.game.debug.lookAt([-9.55,1.66,-10]));
  await page.keyboard.down('KeyW');await page.waitForTimeout(1100);await page.keyboard.up('KeyW');await page.waitForTimeout(200);assert.ok((await state()).elevation>=2.1,'all twelve visible stairs climbable');
  await page.screenshot({path:path.join(out,'stairs.png')});
  await page.keyboard.down('KeyS');await page.waitForTimeout(1300);await page.keyboard.up('KeyS');assert.ok((await state()).elevation<.2);
  await page.keyboard.press('Escape');await page.click('#respawn');assert.equal((await state()).kills,0);
  const phone=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true});
  phone.on('pageerror',e=>errors.push(e.message));phone.on('response',r=>{if(r.status()>=400)missing.push(r.url())});
  await phone.goto(`http://127.0.0.1:${server.address().port}/`);await phone.waitForFunction(()=>window.__READY__);await phone.tap('#skip-memory');await phone.tap('#startb');
  const cdp=await phone.context().newCDPSession(phone),stick=await phone.locator('#stick').boundingBox();
  const point={x:stick.x+stick.width/2,y:stick.y+stick.height/2-40,id:1};
  await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[point]});await phone.waitForTimeout(1100);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});
  assert.ok((await phone.evaluate(()=>window.__GAME__.pos))[1]<14);
  await phone.tap('#crouch');await phone.waitForFunction(()=>window.__GAME__.crouch);await phone.tap('#frag');await phone.waitForFunction(()=>window.__GAME__.equipment.frag===1);
  await phone.screenshot({path:path.join(out,'mobile.png')});
  assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);
  console.log(JSON.stringify({passed:true,checks:['boot','locked missions','movement','jump','ADS','crouch','combat','terminal','counterattack','completion','credits','purchase','equip','save reload','stairs up/down','checkpoint','mobile touch','equipment'],errors,missing,state:final},null,2));
} finally {
  await browser.close();
  server.closeAllConnections?.();
  await new Promise((resolve) => server.close(resolve));
}
