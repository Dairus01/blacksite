import test from 'node:test';
import assert from 'node:assert/strict';
import {mapPoint,floorName,enemyRevealed} from '../game/src/minimap.js';

test('map projection follows world coordinates and rotates around the player',()=>{
 assert.deepEqual(mapPoint(4,-3,0,0,0,10,50,50),[90,20]);
 const rotated=mapPoint(-3,0,0,0,Math.PI/2,10,50,50);
 assert.ok(Math.abs(rotated[0]-50)<1e-9);
 assert.ok(Math.abs(rotated[1]-20)<1e-9);
});
test('floor indicator transitions at upper landing height',()=>{
 assert.equal(floorName(0,2.16),'GROUND');
 assert.equal(floorName(2.16,2.16),'UPPER');
});

test('hostile contacts require sight, awareness, or recent fire',()=>{
 const hidden={distance:16,facing:-1,lineBlocked:true,awareness:0,lastFireAt:null,now:10};
 assert.equal(enemyRevealed(hidden),false);
 assert.equal(enemyRevealed({...hidden,facing:1,lineBlocked:false}),true);
 assert.equal(enemyRevealed({...hidden,lastFireAt:8}),true);
 assert.equal(enemyRevealed({...hidden,distance:8,awareness:1}),true);
 assert.equal(enemyRevealed({...hidden,lastFireAt:2}),false);
});
