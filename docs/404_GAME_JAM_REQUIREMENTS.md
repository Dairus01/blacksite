# Official 404 Game Jam requirements

Verified: 2026-09-21

## Authoritative sources

- Official site: <https://game.404.xyz/>
- Submission repository: <https://github.com/404-Repo/404-game-jam>
- Game recipe and harness: <https://github.com/404-Repo/404-game-recipe>
- Recipe instructions: <https://github.com/404-Repo/404-game-recipe/blob/4effad311c5e137bca316257259fe5bffd6737de/GAME.md>
- Official jam gate: <https://github.com/404-Repo/404-game-recipe/blob/4effad311c5e137bca316257259fe5bffd6737de/harness/jam.mjs>
- Binding rules and submission workflow: <https://github.com/404-Repo/404-game-jam/blob/cef9c34754ec0109cb23a404343bf6bb1ddb50dd/README.md>
- Entry schema: <https://github.com/404-Repo/404-game-jam/blob/cef9c34754ec0109cb23a404343bf6bb1ddb50dd/entries/_template.json>

This project vendors `harness/jam.mjs` unchanged at recipe commit `4effad311c5e137bca316257259fe5bffd6737de` as `.tools/404-jam.mjs`. The package wrapper is:

```bash
npm run jam:gate -- <live-url> --commit=<sha>
```

The organizer's required command remains:

```bash
git clone https://github.com/404-Repo/404-game-recipe
cd 404-game-recipe
npm install
node harness/jam.mjs https://you.github.io/yourgame/game/ --commit=<sha>
```

## Dates and eligibility

- Opens: 11 September 2026, 12:00 UTC.
- The first commit of the entry repository must be on or after 11 September 2026, 00:00 UTC.
- Closes: 25 September 2026, 23:59 UTC. At that point the PR must be open, the jam gate passed, and the play link working.
- Team size: one to four people; one entry per person.
- Entrants must be 18 or the age of majority where they live and otherwise eligible under the official rules.

## The hard content rule

Every 3D object must be Three.js code written through the 404 recipe. Downloaded meshes, asset-store imports, hand-modelled meshes, literal vertex-array payloads, and base64-smuggled mesh data are prohibited. `harness/ship.mjs` flags asset modules containing more than 64 numeric literals in one array or base64 data, and judges inspect flagged files.

Textures, skies, sprites, sound, and music may be files if the entrant has rights to them and declares them. They may be generated through Atlas or supplied by the entrant. Trademarked characters, names, and logos are prohibited. Copying 404 reference-game assets or code is disqualifying.

This rule is a fundamental incompatibility with the copied baseline: its maps, weapons, enemies, animations, UI, textures, and audio are exported binary/source-game assets. Passing the performance harness alone would not make the current content eligible.

## Required source and deployment format

- The entry source repository must be public.
- Git history must be real, with work represented in commits rather than one upload at the end.
- The game must deploy at a working public URL.
- The recipe requires a self-contained game folder: `index.html` and assets inside that directory, relative paths that remain inside it, and no domain-root paths that break under a repository subpath.
- `harness/ship.mjs <game-dir> --stamp` parses modules, rejects escaping/absolute paths, flags suspect encoded geometry, and stamps relative module imports against stale static-host caches.
- `harness/live.mjs <url>` verifies the deployed URL on a phone viewport with a real touch and movement.

## Runtime state contract

The recipe requires:

```js
window.__READY__ = true;               // loaded and startable
window.__START__ = () => { /* play */ };
window.__GAME__ = {                    // refreshed every frame
  pos: [x, z],                         // player position in metres
  fps,                                 // real elapsed time, not clamped delta
  speed,
  score,
  over,
  draws: renderer.info.render.calls,
  tris: renderer.info.render.triangles,
};
```

The jam gate directly reads `__READY__` and `__GAME__.pos`, `fps`, `speed`, `draws`, and `tris`. `__START__` is part of the recipe/playtest contract, but the jam gate deliberately presses a real visible start control and does not call the hook. State must describe real game behavior continuously; fake movement/state would not satisfy the rules.

## Official automated gate

The phone run is the verdict. `--desktop` is secondary and cannot produce a jam pass.

| Item | Exact official setting or threshold |
|---|---|
| Viewport | 390x844 CSS pixels |
| Device scale factor | 3x |
| Browser profile | Mobile, touch-enabled, Android Chrome user agent |
| Network | 4 Mbps down, 1 Mbps up, 60 ms latency |
| CPU | 2x slowdown |
| Ready budget | `window.__READY__ === true` within 20 s |
| Harness ready timeout | 60 s |
| Transfer budget | <= 10 MB response-body bytes over load and play (`bodyBytes / 1e6`) |
| Start | Visible real control, default selector `#startb`; a real tap must start play |
| Movement | >= 1 metre displacement in `__GAME__.pos` during a six-second hold |
| Touch control selection | `--hold=<selector>` or first visible `#stick`, `#steerR`, `#steerL`, `#bgas`, `#look`; key fallback is not a valid substitute for a proper phone design |
| Draw calls | Peak <= 900 |
| Triangles | Peak <= 1,500,000 |
| Sampling | Every 250 ms through the interaction, plus 1.5 s after |
| 404s | Zero, except an absent `/favicon.ico` is ignored |
| Console/page errors | Zero |
| FPS | Median is reported but is not a pass/fail criterion |
| External dependencies | Non-approved external hosts are warnings, not automatic failures; jsDelivr, cdnjs, unpkg, and Google Fonts are allowed CDNs |
| Folder reach | Same-origin files above the game folder are warnings because subpath deployment may break |

The gate writes `loaded.png`, `started.png`, `moving.png`, and `verdict.json`, then prints a bounded `=== 404 JAM VERDICT ===` block. The unedited block must be pasted into the submission pull request. Organizers rerun it against the same live URL and commit before merging.

## Submission workflow and metadata

1. Fork `404-Repo/404-game-jam` for submission purposes.
2. Copy `entries/_template.json` to `entries/<your-slug>.json`.
3. Fill in: `title`, `slug`, one-to-four-person `team`, `play_url`, public `source_url`, tested `commit`, `genre`, build `agent`, all `models`, `own_art`, `own_art_list`, a maximum-three-sentence `what_i_found`, Bittensor SS58 `wallet` (or `later`), and `contact`.
4. Open one PR containing that one entry file and the unedited verdict block requested by the PR template.
5. The entry appears on the site after the organizer's gate rerun agrees and the PR is merged.

The current local project must not fork or push anywhere without explicit user instruction. Integration here is limited to preparing the project; final submission remains a separate authorized action.

## Judging and process evidence

Stage one is blind comparison of in-motion frames. Stage two gives shortlisted games 40% for play, 30% for visual finish, 20% for a distinctive mechanic/rule/look/control, and 10% for build process with receipts. The source repository, commit history, gate runs, discarded work, named agent, and named models are explicit evidence. The recipe also recommends a style lock, visual critic rounds against real reference frames, a one-pass floor build, machine-checkable visual claims, and motion captures; these are process guidance rather than automated jam-gate thresholds.
