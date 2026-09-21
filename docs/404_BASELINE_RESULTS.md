# 404 Game Jam baseline results

Measured: 2026-09-21
Source baseline: `afe6412e5ea0f89cdc258dc7c3b80f664dbfd08f`
Official recipe gate: `4effad311c5e137bca316257259fe5bffd6737de`

## Outcome

The copied baseline does not pass the official 404 gate and is not content-eligible under the hard 3D-as-code rule. This is not an optimization-only gap: content provenance/format, runtime state, startup interaction, payload, draw calls, and deployment behavior all require work before a valid submission.

## Official gate runs

The exact vendored gate was run against the normal local URL and again with the project's automation-only `?autostart=1` query to expose more of the payload. The plain Python server was the requested `python -m http.server 8000 --directory export/web`.

| Gate | Normal URL | Autostart diagnostic | Official budget |
|---|---:|---:|---:|
| Ready | none within 60 s | none within 60 s; screen at 8% map geometry | <= 20 s |
| Body weight | 9.7 MB, incomplete run | 20.0 MB, incomplete run | <= 10 MB |
| Wire bytes | 7.1 MB | 26.3 MB | reported only |
| Start | no `#startb` | selected `#blocker` was loading/non-interactive | real visible tap |
| Movement | unknown; no `__GAME__.pos` | unknown; no `__GAME__.pos` | >= 1 m |
| Peak draws | not exposed | not exposed | <= 900 |
| Peak triangles | not exposed | not exposed | <= 1,500,000 |
| Console errors | 0 | 0 | 0 |
| 404 responses | 1 (`/api/plays`) | 1 (`/api/plays`) | 0 |
| Result | FAIL | FAIL | PASS required |

The normal run's 9.7 MB is not a successful size result: after the missing start control, the gate's key fallback itself triggered the project's early-input loader near the end of the run. The browser closed while the game was still loading. Likewise, 20.0 MB is a lower bound, not the complete game payload.

Artifacts are local and ignored by Git:

- `artifacts/404-baseline/default/verdict.json`
- `artifacts/404-baseline/autostart/verdict.json`
- their `loaded.png`, `started.png`, and `moving.png` evidence

## Supplementary truthful runtime measurement

Because the baseline does not implement the official state contract, a read-only Playwright probe used the existing `hijacked.debug` surface and renderer directly. It loaded the same unmodified game at 390x844, 3x mobile/touch, used real runtime state, activated play, and measured one complete world/post-processing frame with renderer auto-reset temporarily disabled.

| Measurement | Actual baseline | Gate |
|---|---:|---:|
| Time to ready, local unshaped network | 14.214 s | official profile requires <= 20 s under shaped 4G + 2x CPU |
| Time to ready, official profile | > 60 s (not reached) | <= 20 s |
| Resource requests shortly after deployment | 779 | no fixed request-count limit |
| Decoded response bodies | 168,838,053 bytes (168.84 MB decimal) | <= 10 MB |
| Browser transfer entries | 165,669,075 bytes | body bytes are the official criterion |
| Full-frame draw calls | 1,544 | <= 900: FAIL |
| Full-frame triangles | 1,141,865 | <= 1,500,000: PASS |
| Drawing buffer | 585x1266 (Auto at 1.5x) | no direct buffer-size gate |
| Player/enemies | real player plus six enemies | functional evidence only |
| Console/page errors | 0 | PASS |

The existing debug API appeared to report one draw call and two triangles after rendering. That number is the final full-screen post-process pass because Three.js resets `renderer.info` per render. It must not be mapped directly into `window.__GAME__`; doing so would be false state reporting. The diagnostic 1,544/1,141,865 values accumulate the world, viewmodel, and post pass for one real frame.

Largest observed response bodies:

| Request | Bytes |
|---|---:|
| `hijacked_optimized.glb` | 24,235,556 |
| `hijacked_collision_bvh.bin` | 6,552,484 |
| `audio/world/amb_wind_musky.wav` | 5,664,010 |
| `audio/world/mus_mp_timer_01.flac` | 3,995,780 |
| `audio/world/water_ocean_open_r.flac` | 3,820,156 |
| `audio/world/water_ocean_open_l.flac` | 3,647,280 |
| `audio/world/boat_side_creak_r.flac` | 3,325,271 |
| `audio/world/mus_mp_timer_00.flac` | 3,228,496 |
| `audio/world/boat_side_creak_l.flac` | 3,169,869 |
| `audio/world/wind_whispy_st_lp.flac` | 2,733,922 |

The first map asset alone is 2.42 times the complete official body budget. The audio loader is the other immediate hotspot and fetched multi-megabyte material that is not necessary to become playable.

## Gate-by-gate classification

| Requirement | Baseline | Classification |
|---|---|---|
| Every 3D object is recipe-authored Three.js code | Exported GLBs and source-game assets | FAIL; fundamental content incompatibility |
| No trademarked characters/names/logos | Call of Duty/Claude branding and T6 content are visible | FAIL |
| Public entry repository | Only a local new repository is in scope | Not yet satisfied |
| First commit after 11 Sep 2026 00:00 UTC | 21 Sep 2026 13:39:40 UTC | Date passes |
| Real development history | One initial snapshot plus current local work | Not submission-ready yet |
| Self-contained deployed folder | Runtime files are under `export/web`; Three.js comes from allowed jsDelivr | Mostly compatible, but Python `/api/plays` returns 404 |
| `window.__READY__` | Missing | FAIL |
| `window.__START__` | Missing | FAIL recipe contract |
| Continuously refreshed `window.__GAME__` | Missing | FAIL |
| Ready <= 20 s under official profile | Not ready by 60 s | FAIL |
| <= 10 MB body bytes | At least 20.0 MB before ready; full local run about 168.84 MB | FAIL |
| Real visible touch start | Existing two-stage touch UI works conceptually, but not through gate selector/timing | FAIL official gate |
| Mobile movement >= 1 m | Not judgeable without `__GAME__.pos`; own mobile harness timed out at startup | FAIL/unknown |
| Peak draw calls <= 900 | 1,544 | FAIL |
| Peak triangles <= 1.5M | 1,141,865 | PASS in sampled frame |
| No console errors | 0 in official and runtime probes | PASS |
| No 404s | `/api/plays` returns 404 on the required plain server | FAIL |

## Existing mobile test result

`npm run ai:mobile` was run at the project's required 390x844 viewport. It failed before interaction coverage because `runMobileStartup` did not observe `hijacked.debug.getState().ready` within 180 seconds. Early-touch evidence confirmed the welcome prompt was tappable and transitioned to loading, with no browser console error, but the full movement/fire/ADS/restart checks did not execute. A separate mobile runtime screenshot from the supplementary probe shows that the HUD and controls fit once loaded; that visual success does not override the automated startup failure.

## Rule incompatibilities to resolve before gameplay expansion

1. Decide whether to rebuild all 3D content as recipe-authored Three.js code. Without that decision, this project cannot be a valid 404 entry regardless of performance.
2. Replace all old/trademarked branding and any disallowed source-game content.
3. Add truthful `__READY__`, real-start, and per-frame `__GAME__` adapters. Convert the engine's player units to metres.
4. Fix render accounting before exposing draw/triangle state.
5. Redesign startup so the official gate can load to a startable state within 20 seconds and 10 MB, then tap a visible control once.
6. Stop loading the full world-audio set and unused map/weapon/UI resources during the judged path.
7. Reduce full-frame draw calls by at least 645 while preserving the essential FPS systems.
8. Make `/api/plays` absent without a failing request in static deployments, or provide a valid endpoint for the judged URL.

No gameplay transformation should begin until the 3D-as-code/content-rights decision is resolved, because it changes the feasible competition architecture.
