# Baseline engineering audit

Date: 2026-09-21
Baseline commit: `afe6412e5ea0f89cdc258dc7c3b80f664dbfd08f`

## Architecture summary

The project is a static Three.js first-person shooter. `export/web/index.html` is both the HTML shell and the runtime composition root: it imports the gameplay modules, creates the renderer, camera, scene, HUD, input, weapons, enemy manager, collision world, navigation, audio, lighting, post-processing, match state, and automation API. Most reusable behavior is already separated into dependency-light ES modules, but orchestration and cross-system state still live in the large inline module in `index.html`.

The runtime uses baked map geometry, a serialized BVH collision mesh, a Recast navmesh, baked light probes, authored weapon/enemy GLBs and animation JSON, extracted UI art, and extracted audio. The existing FPS foundation is broad and should be preserved.

## Runtime entry points and boot flow

- `export/web/index.html` is the browser entry point. A small non-module script creates `globalThis.hijackedStartup` before module downloads finish.
- Unless `?autostart=1` is present, the first pointer, keyboard, wheel, touch, or click gesture resolves that promise. The module calls `start()` only after it resolves.
- `maps.js` resolves `?map=`, then the `vibeslops:map` local-storage value, then `mp_hijacked`. Selecting another title-card map reloads the page with a new query string.
- `start()` begins environment, navigation, equipped primary/secondary viewmodels, render-map, BVH, nav hints, ladders, medals, enemies, audio, and lighting work. It builds the player only after the render map and collision data resolve.
- The title screen appears only after the enemy load, equipped viewmodels, weapon effects audio, lighting, shader compilation, enemy pose warm-up, and a post-processing warm-up frame complete.
- Actual play starts through pointer lock on desktop or the frontend/touch path on mobile. Automation uses `hijacked.debug.setActive(true)` without pointer lock and intentionally does not increment the play counter.

The central loading shell uses weighted stages in `frontend.js`. The early-input gate is effective for ordinary visitors, but the official 404 gate expects the game to become ready before it taps the start control, so the two contracts currently conflict.

## Main game loop

`tick()` in `index.html` is the request-animation-frame loop. It samples keyboard/touch input, updates player physics, weapon/controller state, viewmodel actions, grenades, enemies, health, match timers, medals, audio, lighting probes, HUD, adaptive graphics, and rendering. The world and weapon use an HDR scene target and a final grade/FXAA pass through `graphics-renderer.js`.

`free-for-all-match.js` owns the current five-minute, 30-kill match state, combatants, standings, kill feed, winner, and reset. Enemy deaths and player deaths feed that object from callbacks wired in `index.html`.

## Weapons and enemies

- `weapons.js` is the immutable registry for 13 primary weapons, four pistols, frag/smoke equipment, aliases, defaults, and loadout ordering.
- Only the equipped primary and secondary load on boot. Opening create-a-class or calling `hijacked.debug.loadAllWeapons()` requests the remaining viewmodels.
- `enemy-system.js` creates six parameterized enemies over one tactical/navigation implementation. It bakes enemy pose frames and body atlases, assigns randomized loadouts/camos/skins, handles visibility, target selection, firing, damage, death, respawn, and crowd movement.
- `enemy-tactics.js` supplies engagement offsets and shot-spread calculations. It is the right extension point for archetype parameters; four independent AI engines would be unnecessary.

## Collision, navigation, and player movement

`player-controller.js` owns fixed-step capsule movement, sprint, crouch, jump, ladders, collision resolution, slope handling, and camera synchronization. `collision-world.js` loads the serialized BVH. `navigation.js` loads Recast data for enemies and debug overlays. These systems are heavily exercised and are high-risk rewrite targets.

## Runtime debug API

After startup, `globalThis.hijacked` exposes selected runtime objects plus `hijacked.debug`. `getState()` serializes ready/active flags, touch input, player state, current weapon/ammo, loadout/equipment, six enemies, lighting, overlays, renderer data, menu, free-for-all state, medals, and a text HUD snapshot. Safe controls cover pause/resume, menu visibility, graphics preset, teleports, looking, player damage/respawn, enemy reset/alert, weapon selection/ammo/camo, grenades, medals, and forced match completion.

The API is the correct base for future jam state, but it is not the official contract. There is no `window.__READY__`, `window.__START__`, or continuously refreshed `window.__GAME__`. Its current `performance.drawCalls`/`triangles` values are also not reliable after the final post-process render resets `renderer.info`; a one-frame diagnostic measured the actual full render separately.

## Test architecture

- `npm test` runs Node unit tests and the browser smoke file.
- `npm run test:unit` runs the focused module suite without the browser smoke case.
- `test/browser-smoke.mjs` performs a long integration pass through Playwright and a second bandwidth-gate case. It now owns a local static server by default; `BROWSER_TEST_URL` still selects an external server.
- `.tools/ai-game.mjs` owns a static server and produces JSON state, screenshots, console logs, traces, and optional recordings. It dispatches to focused mobile, graphics, ADS, sniper, life, and enemy scenarios.
- `.tools/mobile-game.mjs` uses trusted simultaneous touch contacts at 390x844 and checks startup, movement, look, fire, ADS, crouch, reload, weapon switching, grenades, pause, rotation, death, and restart.
- `.tools/graphics-game.mjs` checks presets, render-buffer sizing, AA fallback, filtering, and touch preservation across a resize.
- `.tools/perf_probe.mjs` measures startup, five-second idle/encounter samples, heap, requests, and resources. Its current URL omits `?autostart=1`, so it is stale against the input-gated boot unless the gate is otherwise triggered.

Source inspection alone is insufficient. The project-level `AGENTS.md` correctly requires structured state plus screenshots, recordings for motion/timing, the staged six-enemy scenario for combat, and separate mobile/graphics evidence.

## Asset loading architecture

Map selection is centralized in `maps.js`, which derives render GLB, collision BVH, navmesh, hints, ladders, and probes from a map prefix. Runtime loaders use native fetch/streams and Three.js loaders. Environment cube faces, probes, grade LUTs, world audio, weapon audio, viewmodels, enemy bodies/weapons, UI art, camos, and effects are separate requests.

The deployment tree contains 2,825 files and 552.99 MiB. The largest relevant files are:

| asset | size |
|---|---:|
| `hijacked_optimized.glb` | 23.11 MiB |
| `hijacked_collision_bvh.bin` | 6.25 MiB |
| `nuketown_2020_optimized.glb` | 34.59 MiB |
| `nuketown_2020_collision_bvh.bin` | 12.71 MiB |
| `audio/` tree | 95.62 MiB |
| `textures/` tree | 260.97 MiB |

The second map is not fetched by the normal Hijacked boot, but title/class UI eagerly assigns image sources. More importantly, `WorldAudio.load()` is started after the map is built and is not awaited for title readiness; the mobile runtime probe observed 779 requests and about 168.84 MB of decoded response bodies shortly after deployment. This is substantially above the README's older approximate 47 MB statement.

## Mobile architecture

`touch-controls.js` assigns each pointer a stable role and supports simultaneous movement/look/fire. A coarse-pointer media query enables touch mode, with runtime promotion on the first touch. Rotation and viewport changes clear captures to prevent stuck movement or fire. CSS supplies portrait and landscape layouts. At 390x844 the current HUD and controls render on-screen, but the project mobile harness timed out waiting 180 seconds for readiness during this audit; the official 4G run was still on the loading screen.

## Baseline AN-94 failure

The assertion at `test/browser-smoke.mjs:152` checks the return value of `hijacked.debug.selectWeapon('an94')` after awaiting `hijacked.debug.loadAllWeapons()`. The expectation is current: AN-94 exists, its assets load, and the focused AI screenshot run selected and rendered it successfully.

The fault was the debug loading contract. `loadWeaponSlot()` intentionally catches an individual viewmodel failure so the class screen can retry later, but `loadAllWeaponSlots()` previously wrapped those promises in `Promise.all()` and therefore resolved even when a slot had caught an error and remained not ready. The immediately following synchronous selection correctly returned `false`. The fix retries failed slots once, verifies every `viewmodel.ready`, and rejects with the unavailable weapon IDs instead of reporting false success. The smoke harness also now owns its server and waits on readiness with the same cold-start allowance as the AI harness.

Observed verification is recorded rather than hidden: the focused `ai:screenshot -- an94` run passed and visibly rendered AN-94. After the loader fix and deterministic live-animation synchronization, `npm run test:browser` passed 2/2 and the complete `npm test` run passed 243 tests with 17 environment-dependent skips and no failures. `npm run ai:test` also passed readiness, real movement, firing/ammo, six-enemy, and browser-error checks. Cold software-rendered startup remains slow (the AI run measured about 154 seconds), which is a performance baseline rather than an AN-94 correctness failure.

## Current likely bandwidth bottlenecks

1. The 23.11 MiB Hijacked render GLB already exceeds the 404 gate's entire 10 MB body budget.
2. The 6.25 MiB collision BVH and 1.13 MiB probe volume are mandatory startup payloads.
3. `WorldAudio.load()` requests a very large audio manifest, including multi-megabyte ambience/music files and content not needed for the judged opening minute.
4. Enemy bodies, randomized enemy weapons, many textures/camos, both equipped viewmodels, UI card art, environment cubes, and probe cubes add hundreds of requests.
5. The class screen constructs `<img>` elements for all available weapon cards during module initialization, even though weapon models themselves are deferred.
6. The deployment includes the second map and large bake intermediates. They are not all fetched at runtime, but deployment size and accidental-load risk are high.

## Files not to modify casually

- `export/web/index.html`: composition root, boot gate, input, combat callbacks, renderer loop, and debug API are tightly coupled.
- `player-controller.js`, `collision-world.js`, `navigation.js`: player/world correctness and baked-data contracts.
- `enemy-system.js`, `enemy-tactics.js`: six-enemy coordination, nav/collision, pose baking, combat, and respawn.
- `viewmodel.js`, `weapon-controller.js`, `weapon-effects.js`, `weapons.js`, `weapon-ballistics.js`: authored rigs/animations, selection, hit detection, recoil, audio, and reload behavior.
- `graphics-renderer.js`, `graphics-settings.js`, `lighting.js`, `light-probes.js`: multi-pass rendering, truthful metrics, mobile buffers, and expensive shader paths.
- `touch-controls.js` and `touch-controls.css`: multi-pointer semantics and responsive layouts.
- `maps.js` plus all bake/deploy tools: runtime filename contracts must stay synchronized.
- `test/browser-smoke.mjs` and `.tools/ai-game.mjs`: broad regression coverage; changes must preserve real input and rendered evidence.
