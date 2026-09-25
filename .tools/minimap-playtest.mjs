import assert from 'node:assert/strict';
import fs from 'node:fs';
import {chromium} from 'playwright-core';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist']});
const out='artifacts/minimap-playtest';fs.mkdirSync(out,{recursive:true});
const page=await browser.newPage({viewport:{width:1280,height:720}}),errors=[],missing=[];
page.on('pageerror',e=>errors.push(e.message));page.on('console',e=>{if(e.type()==='error')errors.push(e.text());});page.on('response',r=>{if(r.status()===404&&!r.url().endsWith('favicon.ico'))missing.push(r.url());});
await page.addInitScript(()=>{const key='project-blacksite:save:v1';let save;try{save=JSON.parse(localStorage.getItem(key)||'null');}catch{};localStorage.setItem(key,JSON.stringify({...save,version:1,highestCompleted:4,selectedLevel:1,selectedWeapon:'arx7',credits:1000,xp:0,owned:['arx7','sentinel'],upgrades:{},settings:{...save?.settings,minimap:true,mapRotate:true,mapObjectives:true},best:{},intel:[]}));});
const state=()=>page.evaluate(()=>window.__GAME__);
try{
 for(let level=1;level<=4;level++){
  await page.goto('http://127.0.0.1:8080/');await page.waitForFunction(()=>window.__READY__);await page.click('#skip-memory');await page.selectOption('#level-select',String(level));await page.click('#startb');await page.waitForFunction(()=>window.__GAME__.mapFloor);
  let st=await state();assert.equal(st.level,level);assert.equal(st.mapFloor,'GROUND');assert.ok(st.mapObjectiveDistance>=0);
  assert.equal(await page.locator('#minimap').isVisible(),true);assert.ok(await page.evaluate(()=>document.querySelector('#minimap-canvas').width>0));
  const before=await page.evaluate(()=>document.querySelector('#minimap-canvas').toDataURL());
  const moved=await page.evaluate(()=>window.game.debug.teleportPlayer([2,0,14]));assert.equal(moved,true);await page.waitForTimeout(200);st=await state();assert.ok(Math.abs(st.pos[0]-2)<.1&&Math.abs(st.pos[1]-14)<.1);assert.notEqual(await page.evaluate(()=>document.querySelector('#minimap-canvas').toDataURL()),before,'map responds to movement');
  await page.keyboard.press('KeyM');await page.waitForFunction(()=>window.__GAME__.tacticalMapOpen);assert.equal(await page.locator('#tactical-map').isVisible(),true);await page.screenshot({path:`${out}/level-${level}-tactical.png`});await page.keyboard.press('KeyM');await page.waitForFunction(()=>!window.__GAME__.tacticalMapOpen);
  const stair=st.stair;let upper=false;for(const z of [stair.z-3,stair.centerZ-3,stair.z-5]){const result=await page.evaluate(([x,z])=>window.game.debug.teleportPlayer([x,3,z]),[stair.x,z]);if(result){upper=true;break;}}if(upper){await page.waitForTimeout(200);assert.equal((await state()).mapFloor,'UPPER');}
  await page.screenshot({path:`${out}/level-${level}-hud.png`});
 }
 await page.goto('http://127.0.0.1:8080/');await page.waitForFunction(()=>window.__READY__);await page.click('#skip-memory');await page.click('#startb');await page.keyboard.press('Escape');await page.click('#pause-settings');await page.locator('#setting-minimap').uncheck();await page.locator('#setting-mapRotate').uncheck();await page.locator('#setting-mapObjectives').uncheck();assert.equal(await page.evaluate(()=>getComputedStyle(document.querySelector('#minimap')).display),'none');assert.ok((await page.evaluate(()=>JSON.parse(localStorage.getItem('project-blacksite:save:v1')).settings)).minimap===false);
 const mobile=await browser.newPage({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true});await mobile.addInitScript(()=>localStorage.setItem('project-blacksite:save:v1',JSON.stringify({version:1,highestCompleted:4,selectedLevel:1,selectedWeapon:'arx7',credits:0,xp:0,owned:['arx7','sentinel'],upgrades:{},settings:{minimap:true,mapRotate:true,mapObjectives:true},best:{},intel:[]})));await mobile.goto('http://127.0.0.1:8080/');await mobile.waitForFunction(()=>window.__READY__);await mobile.click('#skip-memory');await mobile.click('#startb');await mobile.waitForFunction(()=>window.__GAME__.mapFloor);await mobile.screenshot({path:`${out}/mobile-hud.png`});await mobile.click('#map');await mobile.waitForFunction(()=>window.__GAME__.tacticalMapOpen);await mobile.screenshot({path:`${out}/mobile-tactical.png`});await mobile.click('#tactical-close');await mobile.waitForFunction(()=>window.__GAME__.tacticalMapOpen===false);await mobile.close();
 assert.deepEqual(errors,[]);assert.deepEqual(missing,[]);console.log('Minimap live on four maps; tactical map, floors, persistence, mobile tap passed.');
}finally{await browser.close();}
