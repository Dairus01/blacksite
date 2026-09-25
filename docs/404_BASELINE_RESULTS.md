# 404 baseline results

The current PROJECT BLACKSITE baseline uses `game/` as the canonical static
root. The browser acceptance suite starts Mission 1, fires the selected weapon,
defeats hostiles, collects intelligence, reaches extraction, validates the
next mission, captures rendered evidence, and rejects console errors or missing
resources.

The official gate checks mobile startup, real touch input, movement, transfer
weight, draw calls, triangles, missing resources, and the public state contract.
Cleanup baseline measurements on a 390×844, 3× mobile viewport with real touch,
4 Mbps down / 1 Mbps up, 60 ms latency, and 2× CPU slowdown:

- Ready: 6.1 seconds (20 second budget).
- Transfer: 2.4 MB (10 MB budget).
- Movement: 15.3 metres (1 metre requirement).
- Peak draws: 342 (900 budget).
- Peak triangles: 27,942 (1,500,000 budget).
- Console errors: 0.
- Missing responses: 0.
- External runtime dependency: jsDelivr Three.js CDN only; no request escapes
  the game folder on the local origin.

The official verdict was PASS. Full cleanup measurements and recovery details
are recorded in `docs/LEGACY_REMOVAL_REPORT.md`.
