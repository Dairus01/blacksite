# Campaign redesign and process evidence

## Why the one-level slice was replaced

The previous jam build proved the asset contract and official gate but offered one small arena, one rifle, one enemy, and one objective. It was useful as a performance baseline, not as a compelling game. We kept its procedural 3D contract, mobile input, movement, renderer telemetry, static deployment, and first mission's combat path. We did not reintroduce the incompatible legacy GLB assets.

## Current structure

- `src/campaign.js` defines four acts, four sites, four modes, and 100 distinct operations. It keeps selected mission, selected weapon, and highest completion in local storage. Field upgrades remain run-only.
- `src/arsenal.js` defines five weapon stat profiles and six upgrade modifiers without modifying shared weapon definitions.
- `game/src/variant-arena.js` adds DESERT COMMS, FROZEN OUTPOST, and HARBOR DISTRICT to BLACKSITE. Every solid 3D item is composed from Three.js geometry. Each site provides terrain, cover, spawns, collision, a twelve-tread staircase, a raised deck, and extraction.
- `game/src/main.js` owns the runtime simulation: input, camera, enemy wave pressure, hits, intel, Commander, extraction, scoring, results, restart, and truthful `__GAME__` telemetry.
- `game/assets404/rifle.js` shares a procedural firing rig across five weapon variants, with code-authored suppressor, shotgun tube/shell loading, marksman optic, and sidearm details. `game/assets404/soldier.js` provides articulated hostile and player-avatar figures with speed-driven gait and human facial features.
- `index.html` and `style.css` provide the narrative briefing, level/loadout selector, field guide, pause menu, HUD, touch controls, boss bar, results, and upgrades. The briefing background is original AI-generated 2D art, compressed to WebP. It is not a 3D asset.

## Discarded approaches

- Converting the old GLB scene in place: it risks retaining mesh-derived judged geometry and loading unused multi-megabyte assets. The separate jam entry remains the safer compliant architecture.
- Treating the 2.3 MB prototype as a target rather than a measurement: low transfer alone did not make it fun. The hard rule is **under** 10 MB, not near 10 MB; extra bytes should improve gameplay or presentation.
- Giving HUNT a required intel pickup: this obscured the Commander trigger and contradicted the mode briefing, so HUNT is now a kill-and-boss objective. RECON retains the intel loop.
- Persisting upgrades across browser sessions: the design calls for run-only upgrades. Campaign progress persists, but upgrades do not.
- Disabling the previous acceptance test because its one-enemy assertion became stale: it was updated to verify a genuine two-kill mission, intel collection, extraction, upgrade choice, and next-level advancement.

## Measured verification

The official mobile gate on 2026-09-22 passed with a real tap on `#startb` and a real held movement stick: 8.0 s ready, 2.4 MB response-body transfer, 15.3 m movement, 342 peak draws, 27,942 peak triangles, zero console errors and zero non-favicon 404s. The first human-face/gait pass increased draw calls to 428; limiting soldier shadow casting to major body forms brought draw calls below the 400 stretch target without removing visible soldier geometry. Observed median FPS has varied from 28 to 46 on this host across gate runs, so stable frame pacing still needs targeted profiling.

The first-mission browser acceptance passed real deploy → two kills → dropped intel pickup → extraction → upgrade choice → next-level advancement, with `__GAME__` reporting four hits, 1005 score, and no browser errors. The campaign playtest loaded four maps and modes, switched guns and cameras, paused/resumed, walked up a staircase to 2.16 m elevation, and defeated the level-4 Commander with real firing and reloading. Screenshots and state are in ignored local `artifacts/` folders.

## Known limitations and next polish work

The 100 operations are parameterized missions, not 100 bespoke levels. The procedural characters are clearly human-shaped but still visibly stylized, and the soundscape uses synthetic cues rather than full recorded weapon/voice audio. Site dressing, combat animation, accessibility, balance at high levels, mobile upgrade/result layouts, and a full 100-level playthrough remain to be validated. The official gate checks technical compliance, not whether the game is subjectively addictive or visually photorealistic; those qualities should not be claimed as verified.
