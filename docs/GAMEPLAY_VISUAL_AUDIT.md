# Gameplay and Visual Audit

Date: 2026-09-22  
Judged entry: `export/web/jam/` at commit `30c2f49`

## Evidence reviewed

- Played the complete start → kill → intel → extraction path through `.tools/jam-acceptance.mjs`.
- Inspected the official-gate captures at 390 × 844 @3x: `loaded.png`, `started.png`, and `moving.png`.
- Inspected the desktop completion capture and the serialized `window.__GAME__` state.
- Read the procedural arena, input, soldier, rifle, stairs, HUD, and mission orchestration source.
- Re-ran `npm run jam:test` and `npm run jam:ship`; both passed before this audit.

## Honest assessment

The current build proves the 404 asset and runtime contract, but it does not yet feel like a competitive FPS. Its strongest element is the restrained start-screen typography. Almost every in-world element is still visibly a proof of concept.

### Start screen

- The information hierarchy and large deployment action are clear on mobile.
- The live scene is too dark to establish place, threat, or anticipation.
- The copy describes a test sequence (“neutralize the sentinel”) rather than a mission with stakes.
- There is no briefing voice, operator identity, insertion context, or sense of an unfolding incident.

### Spawn and environment

- Spawn opens directly onto a flat rectangular firing lane. There is no outer approach, perimeter, checkpoint, recognizable building, or distant focal point.
- Repeated wall panels and floor seams expose the construction grid instead of implying believable architecture.
- Cover objects are isolated props rather than a designed defensive position.
- The sky is effectively black. Fog erases depth rather than creating dusk atmosphere.
- The same materials, lighting, and density are used everywhere, so the arena has no distinct areas or navigation landmarks.
- The level boundary is an obvious enclosing box. It does not read as fencing, terrain, or facility mass.

### Building and stairs

- There is no convincing building: no façade hierarchy, entrance, interior rooms, ceiling, doorway construction, windows, equipment, or practical-light rhythm.
- The staircase has visible treads, but player height is derived from a continuous invisible ramp volume. Movement therefore glides upward and cannot stop naturally on a real step.
- Stair railings and supports are too thin and sparse to read as safe industrial access.

### Soldier

- The hostile silhouette reads as a block mannequin/scarecrow. The torso, arms, and legs are isolated boxes with weak anatomical relationships.
- The weapon floats at the torso and the arms do not form a credible two-handed firing pose.
- Armour layering, pouches, gloves, boots, backpack, neck, and face protection are either missing or visually underdeveloped.
- The only animation is tiny opposing arm rotation. There is no patrol, walk, aim, recoil, hit reaction, search, or authored death motion.

### Enemy behavior and danger

- The enemy is passive. It only rotates toward the player.
- There is no detection cone, line of sight, investigation, pursuit, cover use, burst cadence, projectile/tracer, accuracy model, or loss-of-sight state.
- The player cannot take damage or die. The 100 health readout is decorative and the damage overlay is never activated.
- Because the target remains centered and stationary, combat is a shooting-range check rather than an encounter.

### Rifle and combat feel

- The view weapon is recognizable only as a long dark object with a copper muzzle. Its receiver, stock, magazine, handguard, sights, and grip lack convincing proportion and layering.
- It has no visible hands, muzzle flash, chamber/ejection cue, reload animation, empty state, ADS transition, or impact effect.
- Ammunition decrements, but there is no reload input or behavior. Reserve ammunition is decorative.
- Recoil is a small camera/weapon offset. There is no spread recovery, shot cadence feedback, firing animation, or audio synthesis.
- Hit feedback is limited to a short red reticle state and a status line on death.

### Objective, intel, and extraction

- The sequence is understandable, but it is mechanically thin: one stationary enemy drops one pickup, which unlocks one beacon.
- The intel appears directly on the fallen target and is collected by proximity with little contextual meaning.
- Extraction is a prop in the same small arena, not the culmination of a dangerous route.
- Wayfinding relies on memorizing the arena; there is no directional objective marker.

### Movement, collision, and mobile

- Desktop and touch movement both work and the official mobile gate records real displacement.
- Movement is purely planar with instant speed changes. There is no grounded acceleration, gravity, jump, landing, or vertical collision model.
- Collision uses a small set of 2D rectangles and does not correspond to most rendered architecture.
- Mobile has only move, look, and fire. ADS, reload, jump, and contextual actions are absent.
- Large mobile controls are usable, but the weapon/ammo HUD competes with them and important combat state has not been tested because no enemy attacks.

### Lighting and composition

- The palette is coherent, but the render is underexposed. “Dark” is substituting for authored environmental detail.
- The camera faces a centered target on a centered grid, producing a static range composition rather than a facility approach.
- Point lights and emissive accents exist, but they do not establish layered exterior/interior focal points.
- Enemy readability depends on standing against a blank wall, not on controlled key/rim lighting.

### Runtime state and tests

- `window.__READY__`, real `#startb` interaction, movement telemetry, draw calls, triangles, and the minimum mission state are truthful.
- The acceptance test validates only the passive happy path. It does not validate enemy detection, enemy fire, player damage/death, reload, ADS, stair traversal, collision integrity, or mobile combat actions.
- Baseline automated completion ended at 100 health, confirming that the enemy creates no danger.

## Prototype signals to remove in Milestone 1

1. Empty boxed arena and black sky.
2. Block-man soldier and floating gun.
3. Passive target behavior and decorative health.
4. Invisible-ramp stair physics.
5. Flat movement without gravity, jump, or grounded acceleration.
6. Decorative reserve ammunition with no reload.
7. Missing ADS and incomplete mobile control parity.
8. No believable building section or purposeful encounter composition.
9. No radio/story context beyond menu copy.
10. Automation that can pass without ever being threatened.

## Milestone 1 scope

The next slice will remain one map and one enemy type. It will replace the firing-range presentation with a readable BLACKSITE approach/checkpoint/operations section; rebuild the soldier, rifle, and stairs; add lightweight hostile perception and burst fire; make health, damage, death, reload, reserve ammo, ADS, jump, and stair traversal real; add dusk sky, practical lighting, a waypoint, and concise radio delivery; and preserve truthful 404 telemetry and both real input paths. Advanced campaign breadth, additional weapons, archetypes, upgrades, Commander logic, and Mission 2 remain explicitly out of scope.
