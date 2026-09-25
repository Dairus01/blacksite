# PROJECT BLACKSITE — locked style

> Near-future blacksite hardware is fabricated from charcoal powder-coated steel, oxidized copper conduit, pale poured concrete, and restrained amber safety lighting, with crisp chamfers and no printed glyphs.

| role | hex | where it belongs |
|---|---:|---|
| void | `0x080b0e` | sky, deep recesses, weapon cavities |
| gunmetal | `0x171d22` | walls, rifle receiver, structural frames |
| steel | `0x303b42` | catwalks, barriers, machinery |
| concrete | `0x697078` | ground slabs and heavy cover |
| chalk | `0xc8d0cc` | small sight and fixture details |
| copper | `0x8f5a3c` | pipes, brackets, warm material punctuation |
| hazard amber | `0xffb23e` | objective light, extraction, safe guidance |
| hostile red | `0xff463d` | enemy optics, damage, hostile identification |
| signal cyan | `0x55d9d0` | intel pickup and confirmed interaction |
| moss | `0x57624d` | enemy armor and field fabric |

## Fixed decisions

- Metres. A soldier is 1.82 m tall, a rifle is 0.82 m long, a crate is 1.1 m wide, a barrier is 1.0 m high, and a wall bay is 4 m wide by 3.2 m high.
- Base at y = 0, centred on x and z, front faces +Z.
- Flat colors with explicit `MeshStandardMaterial` roughness and metalness; no image textures in the minimum build.
- Silhouette carries identification: amber open-frame beacon for extraction, cyan faceted capsule for intel, red mono-optic and squared armor for the hostile.
- No printed glyphs in the 3D scene. HUD text is HTML and stays functional, terse, and high-contrast.
- Asset material names and placement follow the official 404 asset contract.
- One authored interface motion: the start shutter opens vertically into play. Reduced motion disables it.
