# Rebuild checkpoint — 25 September 2026

## Recovery and evidence

The untouched baseline is on `recovery/pre-media-rebuild-20260925` at `974a7cd`. Media analysis is committed at `636056e`. All 22 original media files remain untouched and outside the deploy root. All six videos were fully decoded into 1,152 frames; all sixteen stills and all six temporal contact sheets were visually inspected before implementation.

## Verified playable milestone

- Four authored campaign routes complete through actual weapon fire, terminal interaction, defense timers, extraction and the phased Kane encounter. Sequential unlocks and rewards persist.
- Interactive tutorial completes all fourteen actions.
- Team Battle has two allied operators, hostile attacks, a score target and rewards. Survival advances waves and can bank rewards at extraction. Extraction randomizes cache order and completes after three recoveries.
- Hostile fire causes armor/health damage and death. Respawn restores a playable encounter. Checkpoint restoration retains mission objective state; alternate-mode restarts retain their necessary allies/pickups.
- Six weapon profiles, procedural models, finite ammo/reload/ADS, gated purchases, loadout persistence and an on-demand procedural arsenal preview.
- Stairs pass walking, sprinting, crouching, diagonal approach, stopping halfway, descent and touch ascent at 390×844 DPR 3.
- The 15-second memory edit is skippable as soon as technical preparation finishes. It uses all six source clips; the original full videos and design boards are excluded from deployment.

## Checks and artifacts

- `npm test`: 8 passing tests covering save/economy/unlocks, procedural rig and navigation.
- `npm run test:browser`: passing; zero captured console errors or missing resources. Inspect `artifacts/jam-acceptance/complete.png`, `mobile.png`, `stairs.png`, `state.json`.
- `npm run jam:campaign`: all four missions passing; `artifacts/campaign-playtest/report.json` and mission screenshots.
- `npm run test:systems`: tutorial, three alternate modes, hostile death and respawn passed; `artifacts/rebuild/systems.json`.
- `node .tools/stair-playtest.mjs`: all six movement cases passed; `artifacts/rebuild/stairs.json`.
- `npm run jam:ship`: 29 modules and one page parse; paths stay inside the game root.
- Official gate evidence is recorded separately after the final code checkpoint. The earlier local gate passed at 8.8 MB, 4.9 seconds ready, 367 peak draws and 41,262 peak triangles. These are local measurements, not a claim about a deployed site.

Browser completion tests use safe debug positioning and aiming, then real inputs and ordinary combat/objective code. They establish mechanics and progression, not normal mission duration, encounter balance, or uninterrupted human playability.

## Visual iteration verdict

The latest character pass replaces rounded chest shells with clipped plate carriers, adds belt/pouches/boot soles, ammunition belts and an open scout hood, and corrects hair intersection. Gait phase follows distance traveled, follows lateral movement and samples tread height. Two-bone hand/foot solving connects the rig. Defeated actors are bounded and disposed so endless waves cannot accumulate unlimited bodies.

The lineup in `artifacts/rebuild/character-lineup.png` still reads as stylized procedural infantry, rather than matching the realism of the supplied boards. That reference-fidelity gate remains open. The four maps have different topology and landmarks but need further dressing, material detail and normal-route playtesting. The engineering pass must not be presented as complete visual acceptance.

## Remaining work toward the full brief

1. Refine anatomy, clothing surfaces, facial identity and close-up first-person hand/reload work. Finish and verify the full requested animation state set, including directional hit reactions, cover transitions and varied deaths.
2. Deepen squad cover selection, command coordination, grenades and difficulty-specific reaction/accuracy behavior. Current AI has awareness sharing, pathfinding, flanking, suppression, retreat and reload, but not every requested behavior.
3. Expand the four encounters beyond their compact authored routes; improve facility composition, decryption/rescue presentation and Kane's environmental phase mechanics. Run continuous, non-teleport human-style playthroughs for balance.
4. Add more distinct audio recordings and radio performances. Current weapon variants share a generated report with pitch variation plus procedural cues.
5. Complete attachment-specific visible geometry, equipment/store presentation, pause loadout behavior and further accessibility tuning.
6. Split additional-map construction code on demand; currently only the selected map is instantiated, but its small construction module is imported with the core.
7. Rerun final reference comparisons and the unmodified official gate against the actual submission URL. No push, deployment or submission has occurred.

Next work should start here, preserve the passing mechanics, and improve the open visual/behavioral gates. Do not repeat media extraction or replace the game with imported models.
