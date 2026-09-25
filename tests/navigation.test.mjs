import test from 'node:test';
import assert from 'node:assert/strict';
import {findPath} from '../game/src/navigation.js';
test('squad path goes around architecture and terminates when enclosed',()=>{
 const blocked=(x,z)=>Math.abs(x)>7||Math.abs(z)>7||(x===0&&Math.abs(z)<3);
 const route=findPath([-3,0],[3,0],blocked);
 assert.ok(route.length>6);assert.ok(route.every(([x,z])=>!blocked(x,z)));
 assert.ok(route.some(([,z])=>Math.abs(z)>=3));
 assert.deepEqual(findPath([0,0],[5,5],()=>true),[]);
});
