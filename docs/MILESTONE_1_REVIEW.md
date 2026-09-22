# Milestone 1 Engineering Review

Date: 2026-09-22  
Judged entry: `export/web/jam/`  
Disposition: **SHIP**

## Implemented scope

Milestone 1 turns the original firing-range proof into a complete BLACKSITE vertical slice. It adds an authored approach, security gate, checkpoint, operations building, service stair, upper deck, and extraction lane; a dusk sky and warm/cool practical-light hierarchy; a rebuilt soldier and ARX-7 viewmodel; hostile perception, movement, burst fire, tracers, hit reactions, and death; player health, damage direction, death, checkpoint restart, acceleration, gravity, jump, step-accurate stairs, ADS, recoil, reload, and finite reserve ammunition; objective, threat, waypoint, radio, status, death, and results UI; and equivalent touch actions for move, look, fire, ADS, reload, and jump.

## Before and after

| Area | Before (`docs/GAMEPLAY_VISUAL_AUDIT.md`) | Milestone 1 result |
| --- | --- | --- |
| World | Flat boxed lane, black sky, repeated grid, no credible facility | Distinct approach, gate, crossfire yard, operations structure, interior stair, upper deck, and extraction, staged by a procedural dusk sky and route/work lighting |
| Enemy | Stationary block mannequin that only faced the player | Layered procedural soldier with idle/alert/aim/recoil/hit/death poses, line-of-sight detection, range management, strafing, three-shot bursts, tracers, and real damage |
| Weapon | Dark prop, decorative reserve count, no reload or ADS | Articulated ARX-7 with hands, optic, muzzle flash, bolt/recoil response, ADS, animated reload, 30-round magazine, and consumed reserve ammunition |
| Player | Planar instant movement and an invisible stair ramp; health could not change | Accelerated walk/sprint, gravity, jump/landing, authored step heights, health/damage/death, directional feedback, and restart |
| Mission/UI | Thin test copy, no route marker or consequences | Briefing, radio beats, semantic objective/threat states, projected distance waypoint, intel recovery, extraction, failure, replay, and scored completion |
| Mobile | Move, look, and fire only | Real simultaneous touch input plus ADS, reload, and jump; all mobile milestone assertions pass |
| Verification | Passive happy path could pass without threat | Reproducible combat, death/restart, weapon-state, stair, and mobile assertions plus the official throttled gate |

The result remains deliberately stylized and primitive-built, but it now reads and behaves as a small tactical encounter rather than a telemetry demonstration.

## Architecture and assets

- `index.html` owns semantic screens, HUD, and controls; `style.css` owns the responsive operational overlay and locally hosted Barlow Condensed typography.
- `src/main.js` owns rendering, mission orchestration, player and enemy simulation, weapon state, effects, UI synchronization, and telemetry. `src/input.js` normalizes keyboard, mouse, pointer lock, and multi-pointer touch. `src/arena.js` composes the world, collision/visibility rectangles, extraction state, and step-based floor heights.
- Runtime scene assets are authored Three.js modules: the operations building, service stairs, security fence, guard booth, lighting, surface textures, barriers, crates, intel, extraction beacon, soldier, and rifle. Repeated structural detail uses instancing where useful.
- The judged build loads no legacy GLB/model content, literal vertex dumps, base64 geometry, or runtime API endpoints. Three.js remains the CDN dependency; the two Barlow Condensed font files are local and covered by `fonts/OFL.txt`.

## Controls and gameplay loop

Desktop: WASD/arrow movement, mouse aim, left-click fire, right-click ADS, `R` reload, `Space` jump, and `Shift` sprint. Touch: left stick movement, right-side drag aim, and dedicated FIRE, AIM, RLD, and JUMP controls.

The phase loop is `deploy -> active -> intel -> extract -> complete`. During `active`, the checkpoint hostile detects and engages the player. Killing it exposes the uplink key and advances to `intel`; proximity collection activates extraction; entering the beacon completes the mission. Player death changes the phase to `failed`, disables play input, and exposes a real restart that resets the encounter.

## Truthful runtime state contract

- `window.__READY__` becomes true only after the scene, renderer, UI, assets, input, and resize state are initialized.
- `window.__START__` invokes the same `startGame()` path as the visible deploy button.
- `window.__GAME__` is refreshed after every render with compact serializable observations: `pos`, `elevation`, `velocity`, `fps`, `speed`, `draws`, `tris`, `started`, `over`, `score`, `alive`, `health`, `damageTaken`, `deaths`, `weapon`, `ammo`, `reserveAmmo`, `reloading`, `ads`, `grounded`, `enemyCount`, `enemyState`, `enemyHealth`, `enemyShots`, `missionPhase`, `intelCount`, `extractionActive`, `shots`, `hits`, and `headshots`.

The contract reports the simulation used by players: ammunition transfers only when reload completes, damage and deaths come from hostile fire, stair elevation comes from authored step heights, `over` becomes true only on extraction, and render counts come from the rendered frame. No test-only completion or invulnerability path is exposed.

## Final verification and gate metrics

`artifacts/milestone-1/report.json` passed all 15 behavioral assertions: enemy detection/fire, player damage/death, checkpoint restart, reload, reserve consumption, ADS, stair traversal, grounded stair settling, mobile start/movement/ADS/fire/reload. It recorded **0 console errors** and **0 missing responses**.

| Milestone snapshot | Exact recorded state |
| --- | --- |
| Combat | 60 fps, 363 draws, 28,254 triangles; health 45 after 55 damage and 9 enemy shots; ammo 30 / reserve 118 after a verified reload |
| Stairs/extract | 38 fps, 153 draws, 11,620 triangles; position `[-9.537, -3.398]`, elevation 0.72, grounded true, vertical velocity 0; enemy dead, intel 1, extraction active |
| Mobile | 16 fps at the captured instant, 255 draws, 18,518 triangles; real movement completed, health 78 after 22 damage and 3 enemy shots; ammo 28 and reload active |

The official mobile gate in `artifacts/404-milestone1-final/verdict.json` returned **PASS** under a 390x844 viewport at 3x density, mobile/touch emulation, simulated 4G, and 2x CPU slowdown:

- Ready: **3.876 s** (20 s hard budget; 8 s working target).
- Response bodies: **2,235,059 bytes / 2.24 MB**; compressed wire transfer: **541,165 bytes** (10 MB hard budget; 3 MB working target).
- Real held-stick movement: **15.34 m** (1 m minimum).
- Peak render cost: **322 draws** and **25,882 triangles** (900 / 1,500,000 hard budgets; 400 / 500,000 working targets).
- Median frame rate: **60 fps**; hardware ANGLE renderer, WebGPU available, software rendering false.
- Requests: **21**; errors **0**; missing responses **0**; external hosts **0**; files outside judged folder **0**. The Three.js CDN host was classified separately as `cdn.jsdelivr.net`.
- The real `#startb` control was tapped, `started` became true, and the start overlay disappeared.

## Evidence

- Behavioral report: `artifacts/milestone-1/report.json`
- Desktop captures: `artifacts/milestone-1/title.png`, `spawn.png`, `combat.png`, `soldier-close.png`, `ads.png`, `enemy-death.png`, `interior.png`, `stairs.png`, and `death.png`
- Official gate verdict: `artifacts/404-milestone1-final/verdict.json`
- Official mobile captures: `artifacts/404-milestone1-final/loaded.png`, `started.png`, and `moving.png`
- Direction and baseline: `docs/MILESTONE_1_DIRECTION.md` and `docs/GAMEPLAY_VISUAL_AUDIT.md`

## Known remaining weaknesses

- The 390x844 combat view is functionally complete but visually dense. The objective, threat label, waypoint, transient radio, vitals, ammunition, large viewmodel, movement stick, and four action buttons compete for a narrow central column. A later mobile pass should reduce or sequence secondary information without shrinking critical touch targets.
- This is intentionally one compact map and one enemy type. Perception and navigation are lightweight, collision is authored from simple rectangles plus step-height sampling, and the opponent does not yet investigate, coordinate, use cover tactically, or recover from loss of sight as a production enemy system would.
- The scene favors readable procedural construction over high-detail art. Environmental variety, animation breadth, and sound remain sufficient for the milestone rather than final-production depth.

## Explicitly deferred

Advanced campaign breadth, additional weapons, additional enemy archetypes, upgrades/progression, Commander logic, and Mission 2 remain outside Milestone 1. They should not be inferred from the completed vertical slice or added before the existing performance and truthful-state margins are preserved.
