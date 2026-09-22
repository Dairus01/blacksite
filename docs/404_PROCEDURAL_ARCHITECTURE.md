# 404 procedural architecture

Date: 2026-09-22

## Split

The judged build is a self-contained static game under `export/web/jam/`. It does not import from the legacy `export/web` runtime, request `/api/plays`, or reference any GLB, glTF, image texture, baked collision file, navmesh, audio file, or mesh-derived asset.

The old implementation remains intact as an engineering reference. Concepts retained in the new implementation include stable keyboard/mouse/touch ownership, meter-based player movement, FPS yaw/pitch camera behavior, weapon cadence and recoil, health/state observations, HUD separation, browser automation, renderer instrumentation, and state-driven mission phases.

## Judged modules

- `index.html` and `style.css`: static shell, visible `#startb`, HUD, results, and responsive touch controls.
- `src/input.js`: keyboard, pointer-lock mouse, multi-pointer touch movement/look/fire, and the official gate's draggable `#stick` contract.
- `src/arena.js`: arena composition, lightweight collision boxes, accessible ramp/platform height, cover, lighting, extraction placement, and static-shadow policy.
- `src/main.js`: scene, player, truthful runtime globals, raycast combat, intel pickup, extraction, results, and renderer metrics.
- `assets404/*.js`: one default function per asset returning a `THREE.Group`, with geometry and materials authored through Three.js constructors only.

## Runtime contract

`window.__READY__` becomes true after the complete procedural scene exists and the game is startable. The real `#startb` click/tap and `window.__START__` both call the same start function. `window.__GAME__` is refreshed after every rendered frame with real meter-space position, real-time FPS, speed, score, completion, render calls, triangles, health, weapon/ammo, enemy count, mission phase, intel, extraction, shots, and hits.

The renderer is reset immediately before the actual frame render and measured immediately afterward. Metrics are not copied from the legacy post-processing debug surface.

## Minimum mission

The first scope is intentionally narrow:

1. Deploy through a real control.
2. Move and aim with desktop or touch input.
3. Fire the BR-4 procedural rifle.
4. Kill one procedural sentinel.
5. Collect its cyan intel capsule.
6. Reach the amber extraction beacon.
7. Receive a results screen and restart control.

Commander logic, archetypes, upgrades, grenades, and emergency events remain out of scope until this version is stable against the official gate.

## Asset workflow evidence

The shared visual reference is `docs/references/blacksite-reference.png`; it is process evidence and is not loaded by the game. `docs/JAM_STYLE_LOCK.md` fixes materials, colors, scale, silhouettes, and the no-glyph rule.

The official four-sided verifier initially rejected four otherwise plausible assets:

- rifle and soldier: forward geometry moved the measured center;
- intel and light fixture: the visible base floated above `y=0`.

The recipe's vertex-measured placement normalization fixed those contract failures. The second verifier run reported 10/10 assets clean. Generated `_verify` output remains local evidence and is excluded from the shipped/committed game.

## Discarded approach

The first arena pass allowed every static wall, floor seam, prop, stair, and catwalk part to cast into the shadow map. It passed the official limit at 706 draws but missed the project's 400-draw working target. Static geometry now receives light and shadows without being redrawn into the shadow pass; the hostile retains a live shadow. The measured phone result fell to 245 peak draws and 17,928 triangles without deleting scene content.

## Current measurements

Official phone profile: 390x844 at 3x, Android Chrome user agent, 4 Mbps down, 1 Mbps up, 60 ms latency, and 2x CPU slowdown.

| Measurement | Current | Working target | Official limit |
|---|---:|---:|---:|
| Ready | 3.6 s | <= 8 s | <= 20 s |
| Response bodies | 2.1 MB | <= 3 MB | <= 10 MB |
| Peak draws | 245 | <= 400 | <= 900 |
| Peak triangles | 17,928 | <= 500,000 | <= 1,500,000 |
| Real touch movement | 24.6 m | >= 1 m | >= 1 m |
| Console errors | 0 | 0 | 0 |
| Non-favicon 404s | 0 | 0 | 0 |

The official verdict is PASS. The separate desktop acceptance uses real mouse and keyboard events and completes start, firing, enemy death, intel collection, extraction, and results with no console errors or missing requests.
