# Breach Zero

Breach Zero is a self-contained, procedural Three.js tactical FPS campaign made for the 404 Game Jam. The judged build is at `export/web/jam/`. All of its 3D arenas, cover, soldiers, weapons, pickups, and extraction equipment are authored in JavaScript with Three.js geometry. It does not fetch the legacy GLB maps, characters, or weapons.

## Story and campaign

Aegis Relay 7 goes dark. Echo One discovers that a hostile cell has replaced its security force, stolen an uplink cipher, and begun broadcasting false orders across the region. The campaign follows that signal through four acts—The Blackout, The Transfer, The False Signal, and The Last Transmission—and four sites: BLACKSITE, DRYDOCK, QUARRY, and SUBSTATION.

The mission selector exposes 100 numbered operations with distinct operation/target names, briefings, objectives, and escalating enemy health, pressure, intel targets, and Commander milestones. Completing a mission advances to the next; players can also choose any level from the briefing screen. These are data-driven missions across four authored procedural arenas, not 100 separately modeled maps.

Four modes change the objective:

- RECON: eliminate carriers, collect their dropped intel, and extract.
- ASSAULT: clear the required hostile force and extract.
- HOLD: survive the defense window, meet the kill order, and extract.
- HUNT: eliminate the target force, defeat the Commander, and extract.

The field guide on the briefing screen explains the story, controls, objectives, and progression. Winning offers one of three run-only field upgrades; they carry into the next mission in that run and reset when returning to mission selection. The pause menu includes resume, restart, respawn, camera mode, field guide, and mission select.

## Play locally

From the repository root:

```powershell
npm install
python -m http.server 8000 --directory export/web
```

Open [the competition game](http://127.0.0.1:8000/jam/). The root URL is the preserved legacy implementation for engineering reference and is **not** the judged build. Deploy using the visible button; the game does not auto-start for automation.

Desktop: WASD move, mouse aim, left click fire, right click aim down sights, Shift sprint, Space jump, R reload, 1–5 choose a weapon, Q cycle weapons, C switch between first-person and two shoulder cameras, Esc pause. On mobile: use the left movement stick, drag the right side to look, and tap the visible FIRE, AIM, RLD, JUMP, SWAP, CAM, or MENU controls. Walk straight up the stair treads; no jump is required.

The five loadouts are ARX-7 assault rifle, Kestrel-9 SMG, BR-12 shotgun, Vesper marksman rifle, and Atlas-56 LMG. Each has its own capacity, reserve, damage, rate, recoil, spread, range, reload time, and procedural silhouette.

## Verification

```powershell
npm run jam:ship
npm run jam:test
node .tools/campaign-playtest.mjs
npm run jam:gate -- http://127.0.0.1:8000/jam/
node --test test/jam-campaign.test.mjs
```

`jam:ship` checks the code-authored asset workflow. `jam:test` drives the first mission from real start to real extraction and checks next-level progression. The campaign playtest verifies all four sites and modes, weapon/camera/pause behavior, actual stair climbing, Commander activation and defeat, screenshots, console errors, and missing requests. The official gate simulates a 390×844 mobile device on 4G and checks readiness, real touch start and movement, transfer size, draw calls, triangles, console errors, and missing assets. It writes local evidence to `_jam/`; browser playtests write to `artifacts/`. These directories are not committed.

The root repository retains the older FPS implementation and its test/tooling as a reference. The jam build uses separate modules in `export/web/jam/src/` for campaign data, weapon profiles, input, arena creation, and runtime; `export/web/jam/assets404/` contains reusable procedural 3D components. The static game needs no backend endpoints. The image used behind the briefing is an original AI-generated 2D image, optimized as WebP; it is not 3D content. See [asset notice](ASSET_NOTICE.md) and [campaign redesign notes](docs/CAMPAIGN_REDESIGN.md).

Copyright (c) 2026 Dairus Okoh. Licensed under [MIT](LICENSE).
