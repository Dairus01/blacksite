import {chromium} from 'playwright-core';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const browser=await chromium.launch({executablePath:'C:/Program Files/Google/Chrome/Application/chrome.exe',headless:true});
const results=[],errors=[];
try{
 for(const mode of ['walk','sprint','crouch','diagonal','stop','mobile']){
  const mobile=mode==='mobile',page=await browser.newPage({viewport:mobile?{width:390,height:844}:{width:1280,height:720},isMobile:mobile,hasTouch:mobile,deviceScaleFactor:mobile?3:1});
  page.on('pageerror',e=>errors.push(e.message));await page.goto('http://127.0.0.1:8080');await page.waitForFunction(()=>window.__READY__);await page.click('#skip-memory');await page.click('#startb');
  await page.evaluate(()=>{window.game.debug.teleportPlayer([-9.55,0,-1.7]);window.game.debug.lookAt([-9.55,1.66,-10]);});
  if(mode==='sprint')await page.keyboard.down('ShiftLeft');if(mode==='crouch')await page.keyboard.press('KeyC');
  if(mobile){const cdp=await page.context().newCDPSession(page),r=await page.locator('#stick').boundingBox();await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:r.x+r.width/2,y:r.y+r.height/2-44,id:1}]});await page.waitForTimeout(1150);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});}
  else{
   await page.keyboard.down('KeyW');
   if(mode==='diagonal'){await page.keyboard.down('KeyD');await page.waitForTimeout(80);await page.keyboard.up('KeyD');}
   if(mode==='stop'){await page.waitForTimeout(500);await page.keyboard.up('KeyW');await page.waitForTimeout(250);const a=await page.evaluate(()=>window.__GAME__.elevation);await page.waitForTimeout(350);const b=await page.evaluate(()=>window.__GAME__.elevation);assert.ok(a>.3&&a<2.1);assert.ok(Math.abs(a-b)<.03,'stable on a tread');await page.keyboard.down('KeyW');}
   await page.waitForTimeout(mode==='crouch'?2600:mode==='sprint'?800:1100);await page.keyboard.up('KeyW');await page.keyboard.up('ShiftLeft');
  }
  await page.waitForTimeout(150);const top=await page.evaluate(()=>window.__GAME__);assert.ok(top.elevation>=2.1,`${mode} reaches landing: ${top.elevation}`);
  await page.keyboard.down('KeyS');await page.waitForTimeout(mode==='crouch'?3200:1700);await page.keyboard.up('KeyS');await page.waitForTimeout(200);assert.ok((await page.evaluate(()=>window.__GAME__.elevation))<.2,`${mode} descends`);
  results.push({mode,landing:top.elevation});await page.close();console.log(`${mode} stairs passed`);
 }
 assert.deepEqual(errors,[]);fs.writeFileSync('artifacts/rebuild/stairs.json',JSON.stringify({passed:true,results,errors},null,2));
}finally{await browser.close();}
