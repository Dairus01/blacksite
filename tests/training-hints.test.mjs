import test from 'node:test';
import assert from 'node:assert/strict';
import {TRAINING,TRAINING_HINTS} from '../game/src/missions.js';

test('each interactive training step names its actual desktop and mobile control',()=>{
 assert.equal(Object.keys(TRAINING_HINTS).length,TRAINING.length);
 for(const step of TRAINING){assert.ok(TRAINING_HINTS[step],`Missing hint for ${step}`);assert.match(TRAINING_HINTS[step],/ \/ /,`${step} needs a mobile alternative`);}
 assert.match(TRAINING_HINTS.AIM,/RIGHT MOUSE BUTTON/);
 assert.match(TRAINING_HINTS.AIM,/HOLD AIM/);
 assert.match(TRAINING_HINTS.LOOK,/MOVE MOUSE/);
});
