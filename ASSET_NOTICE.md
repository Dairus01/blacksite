# Asset notice

PROJECT BLACKSITE uses original procedural Three.js geometry for its maps,
soldiers, weapons, pickups, and environmental props. The competition build
contains no imported 3D models.

The Blacksite briefing image is original project artwork. Barlow Condensed is
included under the SIL Open Font License in `game/fonts/OFL.txt`. Three.js is
used under its MIT license. The official 404 recipe license is preserved at
`.tools/404-game-recipe.LICENSE`.

## Rebuild media, 2026-09-25

Six source memory clips were generated for PROJECT BLACKSITE in Google Flow, and
sixteen generated reference images were used during development. Exact originals,
hashes, and technical metadata are recorded in `docs/MEDIA_MANIFEST.json`.

`.tools/encode-memory.py` derives the shipped 15-second 1280×720 H.264 memory
montage from those six source clips. The current build preserves the original
scene audio from the selected Flow clips—including their dialogue, environmental
sound, action, and other scene-specific audio—and does not replace that soundtrack
with the separate generic ambience track. The same media pipeline also derives
small WebP character portraits. These are 2D presentation media only; they are
never imported as geometry or used as a substitute for the playable Three.js
scene.

A separate industrial ambience track was generated for this project through
Runway (task `0be2f9de-470c-4d2c-9dcc-eba75549dfc6`). It is retained as a
project-generated audio asset but is not mixed into the current memory montage.

Six distinct one-shot weapon reports were generated through Runway and shipped at
approximately one second each:

- ARX-7 assault rifle: `9f8794cf-acb1-4297-91a8-ffbc8524b6dd`
- Kestrel SMG: `33e8c04f-cdfa-4556-aeee-239455a56acb`
- Breacher shotgun: `12d63ef6-eb2b-4866-9fb3-09f51cd3978d`
- Vesper marksman rifle: `88838811-9e33-4bab-8846-7601a8dcbfd3`
- Sentinel pistol: `f8adf73d-989d-4565-8b04-bdcd66be8818`
- Bastion LMG: `d8e213da-1871-4b51-97e1-3d3abb4f840b`

No third-party franchise audio or third-party voice recording was added to the
competition build.
