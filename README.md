# PROJECT BLACKSITE

**TACTICAL OPERATIONS — INFILTRATE. SURVIVE. EXTRACT.**

An original procedural Three.js tactical FPS for the 404 Game Jam. Daniel Vale returns to Blacksite to investigate AEGIS, missing medic Maya Reyes, and the credentials of his presumed-dead teammate Elias Kane.

## Run

Requires Node.js 22 or newer. Run `npm install`, then `npm start`. Open http://127.0.0.1:8080/. The canonical static deployment root is `game/`.

## Current playable build

- Four sequential campaign operations: Coastal Blacksite, Refinery Yard, Command Building, Underground Lab.
- Campaign, escalating Survival, randomized-cache Extraction, and allied-AI Team Battle.
- ARX-7 rifle, Kestrel SMG, BR-12 shotgun, Vesper marksman rifle, Sentinel-45 pistol, and post-campaign Bastion LMG.
- Finite ammunition, ADS, reloads, health/armor, frag/smoke grenades, medkits and plates.
- Checkpoints, mission rewards, credits/XP, progression-gated arsenal and versioned local saves.
- A skippable 15-second memory edit, action-driven tutorial, settings, pause and touch controls.

This is a playable rebuild milestone. See `docs/REBUILD_STATUS.md` for verification and remaining visual/gameplay work; the reference-fidelity target is not yet fully accepted.

## Controls

| Action | Desktop | Touch |
|---|---|---|
| Move / look | WASD / mouse | Left stick / right drag |
| Fire / aim | Left / right mouse | FIRE / AIM |
| Reload / switch | R / Q or 1–6 | RLD / SWAP |
| Sprint / crouch | Shift / C | RUN / LOW |
| Jump / interact | Space / E | JUMP / USE |
| Frag / smoke | G / X | FRAG / SMOKE |
| Medkit / plate | H / B | HEAL / PLATE |
| Objective / pause | M / Escape | OBJ / MENU |

## Verification

Run `npm test`, `npm run test:browser`, `npm run jam:campaign`, and `npm run jam:ship`.

With `npm start` running, also run `npm run test:systems`, `node .tools/stair-playtest.mjs`, and `npm run jam:gate -- http://127.0.0.1:8080/`.

`window.__READY__` and `window.__GAME__` report runtime state. Safe deterministic inspection is exposed through `window.game.debug`; browser playtests use real firing, interaction and movement inputs with debug positioning.

## Media and compliance

Every 3D asset is constructed in Three.js code. No imported 3D models are shipped. Original media stays in `Sep 25 - 01_14/`; all 1,152 decoded video frames and analysis crops stay in ignored `.work/` folders. Only the optimized memory edit, small portraits, audio and used presentation assets belong in `game/`.

The official gate and ship tools are preserved. Deploy only `game/`, never the repository root. Nothing has been pushed or published by this rebuild.

Created by Dairus Okoh. See `ASSET_NOTICE.md`, `LICENSE`, and the retained font/recipe licenses.
