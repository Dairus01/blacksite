# Asset notice

PROJECT BLACKSITE uses original procedural Three.js geometry for its maps,
soldiers, weapons, pickups, and environmental props. The competition build
contains no imported 3D models.

The Blacksite briefing image is original project artwork. Barlow Condensed is
included under the SIL Open Font License in `game/fonts/OFL.txt`. Three.js is
used under its MIT license. The official 404 recipe license is preserved at
`.tools/404-game-recipe.LICENSE`.

## Rebuild media, 2026-09-25

The user supplied six generated memory clips and sixteen generated reference images. Exact originals, hashes and technical metadata are recorded in `docs/MEDIA_MANIFEST.json`. `.tools/encode-memory.py` derives a 15-second 1280×720 H.264 memory edit and small WebP character portraits. These are 2D presentation media, never imported geometry or a replacement for the playable scene.

Two sound effects were generated through the connected Runway service for this project:

- `game/media/rifle.mp3`: rifle report, task `513cedd4-2d64-4062-9de7-24c116555b2a`.
- `game/media/ambience.mp3`: industrial cinematic ambience, task `0be2f9de-470c-4d2c-9dcc-eba75549dfc6`.

The memory edit uses the ambience as its optional soundtrack. Weapon variations combine playback-rate changes with procedural Web Audio cues. No third-party voice recording or franchise audio was added.
