# Asset rights and project status

The active judged game is **Breach Zero** at `export/web/jam/`. The legacy FPS in the repository root is retained only as an engineering reference and is not part of the judged static folder. Its historical third-party material must not be confused with the assets used by Breach Zero.

Claude of Duty is an unofficial, non-commercial fan project. It is not
affiliated with, endorsed by, or sponsored by Activision, Treyarch, Microsoft,
Anthropic, or any of their subsidiaries or partners.

The repository's MIT license applies only to original code and documentation
whose copyright is held by the project's contributors. It does **not** grant a
license to third-party material, including exported or derived maps, models,
textures, artwork, animation, audio, fonts, names, logos, or other game assets.
Those materials remain subject to their owners' rights and any terms that
apply to the source game.

You are responsible for determining whether you have the rights required to
download, use, modify, host, or redistribute any third-party material in your
jurisdiction. A public repository is not evidence that an asset is freely
licensed. If you redistribute the original MIT-licensed code without these
assets, preserve the copyright and permission notice as required by the
license.

Rights holders can request review or removal through a private GitHub security
advisory or the contact options on
[the maintainer's GitHub profile](https://github.com/luckeyfaraday).

## Procedural jam build

The `export/web/jam` judged build does not load the legacy third-party 3D game
assets described above. Its environment, characters, weapons, props, and effects
are constructed at runtime from authored Three.js primitives.

`export/web/jam/briefing-blacksite.webp` is an original AI-generated 2D mission-briefing illustration created for this project and converted to WebP. It is used only as interface artwork; no image-derived mesh or geometry is loaded. The other game audio effects are synthesized at runtime through Web Audio oscillators.

The jam interface embeds Barlow Condensed, Copyright 2017 The Barlow Project
Authors, licensed under the SIL Open Font License 1.1. The license text is in
`export/web/jam/fonts/OFL.txt`; source files are published by Google Fonts at
https://github.com/google/fonts/tree/main/ofl/barlowcondensed.
