# PROJECT BLACKSITE

PROJECT BLACKSITE is an original browser-based tactical FPS built in Three.js
for the 404 Game Jam.

**TACTICAL OPERATIONS**
**INFILTRATE. SURVIVE. EXTRACT.**

## The game

The classified AEGIS autonomous communications network has gone offline after
coordinated attacks on multiple facilities. As Echo One, a covert response
operator, the player follows stolen command-protocol fragments through a
100-mission campaign and discovers that restoring the network may be more
dangerous than leaving it dark.

The current game includes campaign progression, mission selection, four
operation types, five fictional weapons, procedural enemies and a Commander,
upgrades, checkpoints, first- and third-person cameras, desktop and touch
input, pause/restart/respawn, and the official 404 runtime state contract.

## Original environments

- **BLACKSITE** — industrial coastal communications compound.
- **DESERT COMMS** — remote desert communications installation.
- **FROZEN OUTPOST** — snowbound high-altitude military station.
- **HARBOR DISTRICT** — nighttime container port and industrial dockyard.

Every environment is assembled at runtime from Three.js primitives. The game
ships no imported 3D map, weapon, player, or enemy models.

## Modes

- **CAMPAIGN** — the complete AEGIS incident storyline.
- **SURVIVAL** — hold an objective against escalating pressure.
- **EXTRACTION** — recover intelligence and reach the extraction beacon.
- **TEAM BATTLE** — an architectural target for future squad combat.

Current mission protocols rotate through RECON, ASSAULT, HOLD, and HUNT.

## Weapons

- ARX-7 assault rifle
- KESTREL-9 submachine gun
- VESPER marksman rifle
- BR-12 combat shotgun
- SENTINEL-45 sidearm

All weapon geometry and effects are generated in code.

## Controls

| Action | Desktop | Touch |
| --- | --- | --- |
| Move | WASD / arrows | Left stick |
| Look | Mouse | Drag right side |
| Fire | Left mouse | FIRE |
| Aim | Right mouse | AIM |
| Reload | R | RLD |
| Jump | Space | JUMP |
| Switch weapon | 1–5 / Q | SWAP |
| Camera | C | CAM |
| Pause | Escape | MENU |

## Project structure

- `game/` — canonical static game and deploy root.
- `game/src/` — campaign, runtime, input, arenas, configuration, and arsenal.
- `game/assets404/` — procedural Three.js asset modules.
- `tests/` — focused tests for current game systems.
- `.tools/` — official 404 gate/ship recipe and current browser/performance tools.
- `docs/` — story, architecture, compliance, and cleanup records.

There is one game source and one deployment root: `game/`.

## Development

Requires Node.js 22 or newer.

```bash
npm install
npm start
```

Open `http://127.0.0.1:8080/`.

## Verification

```bash
npm test
npm run test:browser
npm run jam:campaign
npm run jam:milestone
npm run jam:ship
```

To run the official 404 mobile gate against a deployed or local URL:

```bash
npm run jam:gate -- http://127.0.0.1:8080/
```

The public competition contract is `window.__READY__` and `window.__GAME__`.
Safe diagnostics are available at `window.game.debug`.

## Deployment

Deploy the contents of `game/` as a static site. The game has no server API,
database, play counter, or required same-origin endpoint. The only runtime
library request is Three.js from the jsDelivr CDN, which the official 404 gate
recognizes as an allowed CDN dependency.

## Credits and licensing

Created by **Dairus Okoh** for the 404 Game Jam. Barlow Condensed is included
under its OFL license in `game/fonts/OFL.txt`. The official 404 recipe retains
its own license in `.tools/404-game-recipe.LICENSE`.

Copyright (c) 2026 Dairus Okoh. See [LICENSE](LICENSE).
