# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Players judging a short browser FPS on desktop or a 390x844 touch device. They need to understand the objective, deploy, move, aim, shoot, collect intel, and extract without prior instruction.

## Product Purpose

Deliver a compact, original, code-generated first-person mission that becomes playable quickly and demonstrates a complete tactical loop within a few minutes.

## Positioning

The judged build is a self-contained blacksite breach assembled entirely from authored Three.js code, with truthful runtime telemetry and the same real controls used by players and automation.

## Operating Context

The game is loaded from a static folder and evaluated under simulated mobile 4G, 2x CPU slowdown, a 390x844 viewport at 3x density, and real tap/drag input. Desktop keyboard, mouse, and pointer lock remain first-class.

## Capabilities and Constraints

- Judged entry point: `export/web/jam/`; legacy GLB content remains outside it and is never imported.
- Every judged 3D object is constructed in JavaScript from Three.js geometry.
- No imported models, mesh files, literal vertex dumps, base64 geometry, or runtime API endpoints.
- Milestone 1 loop: deploy, breach the checkpoint, survive an armed hostile, recover the uplink key, and extract; health, death, checkpoint restart, reserve ammunition, reload, ADS, jumping, and authored stair traversal are real gameplay states.
- Desktop and touch controls drive the same simulation. Touch provides simultaneous move, look, fire, ADS, reload, and jump input rather than a reduced test path.
- Hard budgets: ready within 20 seconds, at most 10 MB response bodies, at most 900 draws, at most 1.5 million triangles, at least one metre of real movement, and zero non-favicon 404s or console errors.
- Working targets: ready within 8 seconds, at most 3 MB initial transfer, at most 400 draws, and at most 500,000 triangles.
- Required truthful globals: `window.__READY__`, `window.__START__`, and continuously refreshed `window.__GAME__`; telemetry must report actual motion, render cost, combat, weapon, enemy, survival, and mission state.

## Brand Commitments

The temporary internal identifier is `breach-zero`. The final public title remains undecided. The judged visual world is a compact industrial blacksite with no legacy Claude, Call of Duty, T6, Hijacked, or Nuketown branding.

## Evidence on Hand

- Official recipe checkout: `.work/404-game-recipe` at commit `4effad311c5e137bca316257259fe5bffd6737de`.
- Official gate vendored at `.tools/404-jam.mjs`.
- Baseline architecture and measurements in `docs/BASELINE_AUDIT.md`, `docs/404_GAME_JAM_REQUIREMENTS.md`, and `docs/404_BASELINE_RESULTS.md`.
- No external claims, testimonials, or commercial assets should be invented.

## Product Principles

- Real interaction and truthful state over test-only shortcuts.
- A visible mechanic is not complete until gameplay, feedback, telemetry, and an automated assertion all agree on its state.
- One legible objective at a time.
- Procedural silhouettes with disciplined material and scale consistency.
- Preserve reusable engineering concepts, not incompatible content.
- Stay comfortably below the gate before adding breadth.

## Accessibility & Inclusion

Critical controls must be large enough for touch, objective state must not rely on color alone, focus must remain visible, and reduced-motion preferences must remove nonessential interface animation.
