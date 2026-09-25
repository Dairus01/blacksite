# 404 procedural architecture

## Canonical runtime

The judged static game is `game/`. It has no server API, imported 3D models,
baked collision data, navmesh files, or runtime audio assets. The authored
briefing image is presentation art; every gameplay object is procedural
Three.js geometry.

## Modules

- `src/main.js` — renderer, simulation loop, player, combat, enemies, Commander,
  objectives, camera, UI synchronization, and public telemetry.
- `src/config/game-config.js` — public identity and storage namespace.
- `src/campaign.js` — four maps, four mission protocols, 100 levels, story
  briefings, and campaign persistence.
- `src/arena.js` — BLACKSITE construction, collision, authored stairs, spawns,
  and extraction.
- `src/variant-arena.js` — DESERT COMMS, FROZEN OUTPOST, and HARBOR DISTRICT.
- `src/arsenal.js` — five fictional weapons and run upgrades.
- `src/input.js` — keyboard, pointer-lock mouse, and simultaneous touch input.
- `assets404/*.js` — procedural structures, props, soldiers, weapons, pickups,
  surface textures, and extraction equipment.

Only the selected mission's arena is constructed. Simulation state is exposed
as serializable data rather than Three.js objects.

## Runtime contract

`window.__READY__` becomes true after the startable procedural scene exists.
The visible `#startb` is the real start control. `window.__GAME__` reports
position, velocity, FPS, draw calls, triangles, mission state, health, weapon,
ammo, enemies, progress, objectives, Commander state, and staircase metadata.
Safe deterministic test controls live at `window.game.debug`.

## Verification

The official phone profile (390×844 at 3×, real touch, shaped 4G, 2× CPU
slowdown) passes at 6.1 seconds ready, 2.4 MB transferred, 342 peak draws,
27,942 peak triangles, 15.3 metres moved, zero console errors, and zero missing
responses. Browser acceptance also completes combat, intel recovery, extraction,
results, Commander combat, stairs, reload, ADS, death/respawn, and mobile input.

Generated verifier output is local evidence under ignored artifact directories;
it is not committed or deployed.
