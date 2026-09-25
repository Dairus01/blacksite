# Reference-to-code ledger

Image identifiers refer to MEDIA_MANIFEST.json order (exact names retained there). Video frame numbers are 1-based at 24 fps. This is an implementation ledger, not a claim that all visual loops have passed.

| Asset | Reference | Implementation / required comparison |
|---|---|---|
| Daniel | board 2; friendship 109, aircraft 49 | assets404/soldier.js, player avatar; dark hair/tan carrier |
| Maya | board 3; approach 43, loss 55 | assets404/soldier.js medic variant; proportions/headset |
| Kane | board 4 and earlier 15; friendship 73 | assets404/soldier.js commander; delayed story reveal |
| Rifleman | board 5 col 1; approach 61 | assets404/soldier.js; human stance |
| Heavy | board 5 col 2 | assets404/soldier.js; armor/ammunition silhouette |
| Scout | board 5 col 3 | assets404/soldier.js; hood/light rig |
| Shock | board 5 col 4 | assets404/soldier.js; breaching armor/red shoulders |
| Captain | board 5 col 5 | assets404/soldier.js; command antenna/plates |
| Five guns / LMG | board 6; firefight 1/13, aircraft 49 | assets404/rifle.js; silhouette, shoulder and grip alignment |
| Coastal map | board 7 top-left; approach 1/139/187 | src/arena.js; wet layered industrial depth |
| Refinery | board 7 top-right; firefight 79 | src/mission-arena.js; pipe/tank topology |
| Command | board 7 bottom-left; AEGIS 1/73 | src/mission-arena.js; consoles, server aisles |
| Lab | board 7 bottom-right | src/mission-arena.js; core/catwalk/tunnels |
| Stairs/railings/doors | board 7 and 10; firefight 37/55 | assets404/stairs.js, operations-building.js |
| Consoles/server racks | board 7; AEGIS 1 | operations-building.js, mission-arena.js |
| Guard/comms towers | board 7; approach 187 | arena.js, facility-detail.js |
| Industrial structures/extraction equipment | board 7; aircraft 85 | facility-detail.js, extraction-beacon.js |
| Menus/store/HUD | board 9; loading board 1 | index.html, style.css, src/interface.js |
| Memory | all six videos; VIDEO_ANALYSIS.md | media/memory.mp4, src/memory.js; 15s skippable edit |

Development crops: .work/reference-crops. Annotated poses: .work/pose-analysis. Runtime screenshots and visual verdicts belong under artifacts and in the final rebuild report. Assets listed with future file paths are pending until those files exist and are verified.
