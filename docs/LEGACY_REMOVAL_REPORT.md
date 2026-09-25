# Legacy Removal Report

This report records the controlled separation of PROJECT BLACKSITE from the
legacy game that previously occupied this repository. Git history and the
backup branch are the recovery mechanism; legacy content is not retained in
the active project as a fallback.

## Recovery point

- Backup branch: `pre-cleanup-backup`
- Recovery commit: `de6edfe7731d32f9f77f7a9213fc5e14fbb2f8ab`
- Working branch during cleanup: `master`
- Pre-cleanup worktree state: clean

## Pre-removal inventory

### A. Legacy branding

- Root project metadata and community files described Claude of Duty and its
  former owner/project URLs: `README.md`, `PRODUCT.md`, `DESIGN.md`,
  `CITATION.cff`, `SECURITY.md`, `CONTRIBUTING.md`, GitHub templates, and
  deployment configuration.
- `export/web/index.html` contained the Claude of Duty: Vibe Slops II title,
  OpenGraph/Twitter metadata, old domain references, menu copy, and the legacy
  public shell.
- Legacy identifiers were also present in storage keys, debug APIs, comments,
  package scripts, and test fixtures.

### B. Legacy map assets

- Extracted T6 map data under `export/maps/`, including `mp_hijacked` and
  `mp_nuketown_2020` entity, gfxworld, vertex, and index data.
- Shipped Hijacked/Nuketown render meshes, collision meshes, BVHs, navmeshes,
  navigation hints, ladders, probes, vision data, environment maps, LUTs,
  radar images, load screens, and map cards under `export/web/`.
- Large extracted model/source catalogs under `export/xmodel/` and related
  export directories were inputs for the legacy map pipeline.

### C. Legacy weapon assets

- Imported T6 weapon/viewmodel GLBs, magazines, scopes, hands, world models,
  weapon definitions, animations, camos, cards, textures, and weapon audio
  under `export/web/`, `export/xmodel/`, and related extracted-data folders.
- The legacy runtime weapon registry, GLTF viewmodel loader, attachment/camo
  system, and weapon-specific tests depended on those assets.

### D. Legacy player/enemy assets

- Imported T6 enemy/player meshes, hands, rigs, animation data, and world-gun
  models under `export/web/enemies/`, `export/web/viewmodel/`, and extracted
  source folders.
- The original game instead uses the procedural soldier module in the current
  404 game.

### E. Legacy UI assets

- COD-style frontend plates, HUD textures, medal art, map-select cards, lobby
  and loading art, bundled legacy fonts, and the monolithic legacy menu/HUD in
  `export/web/`.
- The original game has its own DOM UI and stylesheet in the current 404 game.

### F. Legacy audio

- Extracted T6 weapon, foley, announcer, ambience, movement, UI, and world
  audio under `export/web/audio/`, plus manifests and extraction inputs.
- The current procedural game does not request those files.

### G. Legacy textures

- Extracted map, prop, character, weapon, camo, sky, environment, UI, and
  material textures under `export/web/textures/`, `export/web/images/`, and
  related export source directories.
- The current game creates its gameplay materials and surface details in code;
  its only current authored image is the original Blacksite briefing image.

### H. Legacy map baking tools

- `.tools/bake_map.mjs`, `bake_collision_bvh.mjs`, `bake_navmesh.mjs`,
  `bake_env.mjs`, `bake_probes.mjs`, `compose_scene.py`,
  `export_collision.py`, texture converters, extractors, model importers, OAT
  patches, and other T6-specific pipeline scripts.

### I. Legacy deployment infrastructure

- Cloudflare/Netlify play-counter functions, migrations, Wrangler config,
  staging scripts, and old deployment names/domains.
- The original 404 game is a static deployment and does not require an API.

### J. Legacy tests

- Tests for Hijacked/Nuketown maps, GLTF loading, imported viewmodels,
  extracted weapons/audio/textures, old menus/HUD, play counters, legacy
  renderer settings, and T6-specific physics/navigation behavior.
- These tests validate removed systems and are not applicable to PROJECT
  BLACKSITE.

### K. Potentially reusable generic engine code

- Concepts for input, touch controls, collision, shooting, AI, camera motion,
  browser smoke testing, screenshots, and performance measurement were
  reviewed for reuse.
- Useful behavior has already been independently implemented in the current
  procedural game. Generic browser verification remains useful, but must target
  the canonical PROJECT BLACKSITE root and its public state contract.

### L. Current original game code

- Pre-cleanup location: `export/web/jam/` (migrated to `game/`).
- Entry point after migration: `game/index.html` loading `src/main.js`.
- Original modules: campaign/story progression, procedural arenas, five-weapon
  arsenal, input/mobile controls, procedural soldiers, procedural guns,
  objectives, Commander encounter, upgrades, pause/restart/respawn, first/third
  person cameras, physics, stairs, and truthful `window.__READY__` /
  `window.__GAME__` state.
- Original procedural assets live in `game/assets404/`.

### M. 404 Game Jam tooling

- Official gate: `.tools/404-jam.mjs` and its license.
- Ship/staging validation: `.tools/404-ship.mjs`.
- Current original-game verification: `.tools/jam-acceptance.mjs`,
  `.tools/campaign-playtest.mjs`, `.tools/milestone1-review.mjs`, and
  `.tools/perf_probe.mjs`.
- Current compliance documentation: `docs/404_GAME_JAM_REQUIREMENTS.md`,
  `docs/404_BASELINE_RESULTS.md`, `docs/404_PROCEDURAL_ARCHITECTURE.md`, and
  current campaign/style/milestone documents.

## Canonical game decision

The self-contained procedural game is the only runtime to preserve. During
cleanup it will move from the ambiguous `export/web/jam/` nesting to `game/`.
The canonical commands and deploy output will be documented in the README and
package scripts. A generated submission folder may be created by the ship
command, but it is not a second source tree.

## Removed

- Extracted Hijacked/Nuketown map sources and all render, collision, BVH,
  navmesh, probe, LUT, radar, environment, and card assets.
- Every imported map, weapon, viewmodel, hand, character, enemy, attachment,
  animation, GLB/glTF, and extracted model catalog.
- Legacy weapon definitions, camos, cards, textures, frontend plates, HUD art,
  loading art, social previews, icons, fonts, audio, and world sound banks.
- The complete legacy browser runtime, including its map registry, GLTF loader,
  old debug namespace, menus, HUD, weapons, AI adapters, and play counter.
- T6 extraction, conversion, baking, import, audio, texture, and OAT tools.
- Cloudflare/Netlify functions, migrations, Wrangler configuration, and old
  deployment staging logic. PROJECT BLACKSITE is static.
- Tests that exercised only removed maps, assets, loaders, server endpoints,
  and game systems.
- Duplicate community configuration and obsolete generated verification files.

## Migrated

- Canonical game root: `export/web/jam/` → `game/`.
- Runtime entry: experimental `src/main-v2.js` → canonical `game/src/main.js`.
- Campaign and mission progression → `game/src/campaign.js`.
- Input and simultaneous touch controls → `game/src/input.js`.
- Original procedural maps → `game/src/arena.js` and
  `game/src/variant-arena.js`, with canonical BLACKSITE, DESERT COMMS, FROZEN
  OUTPOST, and HARBOR DISTRICT identities.
- Original weapon data → `game/src/arsenal.js`; procedural weapon geometry →
  `game/assets404/rifle.js`.
- Procedural characters → `game/assets404/soldier.js`.
- Public identity and storage namespace → `game/src/config/game-config.js`.
- Safe diagnostics → `window.game.debug`; competition telemetry remains
  `window.__READY__` and `window.__GAME__`.
- Browser gameplay, campaign, milestone/mobile, performance, official gate,
  and ship verification remain under `.tools/`.

## Remaining external dependencies

- `three@0.185.1`: core 3D renderer; the static game imports the matching ESM
  build from jsDelivr.
- `playwright-core`: local browser acceptance, campaign, milestone, and
  performance automation.
- `puppeteer`: official 404 mobile gate.
- Barlow Condensed font files under their preserved OFL license.
- The official 404 recipe under `.tools/404-game-recipe.LICENSE`.

## Final search results

- Active source, configuration, documentation, and game files: zero matches for
  the legacy names, domains, map identifiers, and branding terms listed in the
  cleanup request.
- This report contains the only remaining legacy-name matches. They are the
  required historical inventory of what was removed and have no runtime use.
- `game/` contains zero `.glb`, `.gltf`, `.fbx`, or `.obj` files.
- The source worktree outside Git history/dependencies/artifacts is 2.85 MiB.
  The canonical static game folder is 0.26 MiB. The backup branch's tracked
  tree was 571.07 MiB.
- The recovery branch necessarily keeps deleted blobs in `.git` (461.17 MiB
  locally); this is recovery history, not active or deployed content.
- Official 404 mobile gate: PASS at 2.4 MB transferred, 6.1 s ready, 342 peak
  draws, 27,942 peak triangles, 15.3 m real-touch movement, zero console
  errors, and zero missing responses.
- Largest shipped files: `briefing-blacksite.webp` (85,806 bytes),
  `src/main.js` (42,995 bytes), the two licensed font files (22,464 and 21,424
  bytes), and `style.css` (16,874 bytes).

## Verification summary

- `npm test`: PASS.
- `npm run test:browser`: PASS; complete mission, zero errors/missing files.
- `npm run jam:campaign`: PASS; 100 levels, four maps, four modes, five
  weapons, stairs, and Commander defeat.
- `npm run jam:milestone`: PASS; combat, damage/death, reload, ADS, stairs,
  checkpoint respawn, and real mobile touch actions.
- `npm run perf:probe`: PASS; current runtime state and no browser errors.
- `npm run jam:ship`: PASS; every module parses and every path stays inside
  `game/`.
- Official `npm run jam:gate -- http://127.0.0.1:8080/`: PASS.
