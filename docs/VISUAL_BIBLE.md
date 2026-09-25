# PROJECT BLACKSITE visual bible

Style: grounded human operators in wet, layered industrial facilities; cold ambient light broken by practical work lights and emergency red. Original procedural Three.js geometry only.

## Evidence and identity
All 16 images and all six video contact sheets were visually inspected before runtime changes. Exact source names, hashes, dimensions, purposes and frame selections are in MEDIA_MANIFEST.json. Board numbers here follow its image order. Crops and annotated frames remain in ignored `.work/` folders.

Daniel Vale (boards 2, 11–14): 1.83 m, athletic, dark short hair, stubble, dark shirt, tan plate carrier, compact assault pack, gloves, knee pads and boots. Head approximately 1/7.5 of total height; shoulders approximately 0.48 m without gear. Avoid the previous oversized helmet and rectangular chest plate.

Maya Reyes (3, 11–13, 16): 1.70 m, athletic, tied dark hair, headset, dark uniform, tan medical pack. Controlled low ready and deliberate hand signals. Medical role is equipment and behavior, not a different species of body rig.

Elias Kane (4, 11–13, 15): 1.80 m, short brown hair and stubble. Earlier teammate and later Sentinel commander are both canon. Red angular faction patch replaces friendly markings; posture becomes more commanding. Never reveal this transformation on Mission 1's menu.

Sentinel (5): humans with gloves, exposed or covered faces, practical joint articulation. Rifleman standard carrier; Heavy broader armor/ammunition belt; Scout hood and smaller rig; Shock red shoulder details and breaching armor; Captain command antenna and reinforced plates; Commander unhelmeted Kane. Different silhouettes, not merely different colors.

## Materials and palette
Charcoal cloth #182126; worn steel #36434a; tan webbing #76644b; wet concrete #48545c; cold sky #142632; cyan monitor #75cfdf; emergency red #d1473b; warm lamp #e8b676; interface white #e5e9e6. Cloth roughness ~0.9, worn armor ~0.6, damp ground ~0.35. Reuse materials and procedural canvas textures; no imported mesh data.

## Weapons and gear
Board 6 supplies proportions, not trademark names. ARX-7: stock, receiver, curved magazine, ventilated fore-end and optic. Kestrel: short barrel, compact receiver. Vesper: long barrel and scope. BR-12: tubular magazine and pump. Sentinel-45: compact slide and grip. Later LMG: box ammunition and bipod. Rifle length ~0.8–1.0 m; grip must meet dominant hand and support hand must meet fore-end. ADS aligns the sight rather than shrinking the whole weapon. Reload separates magazine withdrawal, replacement and return; pistol and shotgun differ.

## Architecture and maps
Board 7: coastal Blacksite has sea, perimeter, docks, tower, research/operations building, service road and extraction pad. Refineries use cylindrical process towers, overhead pipe routes, containers and tanks; warmer and more open. Command building uses partitioned rooms, server aisles, consoles and stairs; cool screens and warmer ceiling strips. Underground lab uses central cylindrical AEGIS core, radial access, tunnels, catwalk and secure vault; red emergency illumination. Four distinct navigable layouts are mandatory.

Props use plausible dimensions: door 1.1 × 2.2 m, corridor 2.5–4 m, railing 1.05 m, stair rise 0.18 m/run 0.30 m, console ~1 m high. Visible stair treads and collision use the same specification. No hidden lift volume.

## Animation and cinematography
Video firefight frames 1/13 show stock at shoulder and support elbow under rifle. Approach 61/85 shows bent knees and low cover posture. Friendship 109/133 shows opposed arm/leg motion and relaxed shoulders. Use hierarchical pelvis/spine/chest/head and two-bone limbs. Advance gait by actual distance, plant stance feet, lift swing toes and bend knees. Blend poses; do not drive all limbs from one pendulum.

Gameplay camera eye ~1.66 m, crouch ~1.12 m. ADS reduces FOV; movement bob and recoil remain subtle and adjustable. Reference focal lengths cannot be recovered exactly: wide environmental shots appear ~24–35 mm equivalent and portraits ~50–85 mm; these are artistic estimates. Memory edit uses warm friendship → cyan command → wet approach → red attack → loss → cold awakening. It must be immediately skippable once the game is startable.

## Interface and effects
Boards 1, 8, 9: condensed uppercase headings, generous black/blue negative space, fine rules, cyan selection, restrained amber rewards and red danger. Rebuild in DOM/CSS; boards are not clickable menu backgrounds. Show one current objective, direction/distance, health/armor and ammunition. Secondary lore belongs in dossier screens. Rain, sparks, tracers and smoke use pooled/instanced geometry with bounded lifetime. Never obscure target silhouettes with full-screen effects.

## Acceptance loop
For each major asset: inspect named reference → build → render → inspect proportion, silhouette, pose, material and scene composition → revise → capture evidence. Successful JavaScript execution is not visual acceptance. Record unfinished comparisons honestly in REFERENCE_TRACEABILITY.md.
