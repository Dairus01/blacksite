# Asset rights and project status

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

The jam interface embeds Barlow Condensed, Copyright 2017 The Barlow Project
Authors, licensed under the SIL Open Font License 1.1. The license text is in
`export/web/jam/fonts/OFL.txt`; source files are published by Google Fonts at
https://github.com/google/fonts/tree/main/ofl/barlowcondensed.
