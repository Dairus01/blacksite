# PROJECT BLACKSITE game design

Daniel Vale returns to the distributed AEGIS network after a disastrous Blacksite incident. Maya is missing; Kane was presumed dead. Sentinel occupies the facilities. The campaign asks who controls Sentinel and what AEGIS can do, without resolving Maya prematurely.

Four authored missions replace the earlier 100 generated variations:
1. BLACKSITE BREACH: perimeter, patrol, operations terminal, data, counterattack, coastal extraction. Kane credentials are evidence, not a visual reveal.
2. BURNING SIGNAL: refinery relays and fuel sabotage, heavy encounter, timed escape. Recovered command fragment suggests a familiar voice.
3. GHOST PROTOCOL: captive engineer, command floor, defend decryption, Maya record and visual confirmation of Kane.
4. BELOW ZERO: restore lab power, disable security, core, three-phase Kane confrontation and escape. Maya remains unresolved.

Campaign unlocks sequentially. Replays remain available. Persistent credits/XP buy weapons and attachments, with unlock requirements checked in the data model. Starter ARX-7 and pistol; mission completions unlock SMG, shotgun, marksman and later LMG. No real money. Corrupt or unavailable localStorage must not prevent play.

Campaign, escalating survival, randomized extraction and allied team battle share combat, characters, maps and reward logic. Reward scaling distinguishes first completion and replay; failed extraction does not grant its success bonus. Save schema is versioned under project-blacksite.

Combat: acceleration/friction, sprint, crouch, jump/gravity, actual stair treads, finite magazines/reserves, ADS, recoil, reload, equipment and health/armor. Enemy classes use different engagement ranges, reactions, movement and fire cadence. Squad alert propagates with delay; cover and line of sight must matter.

Flow: memory preparation → menu → mission/briefing → loadout → deploy → checkpoints/objectives → results/rewards → arsenal/next mission. Pause and death restore checkpoint encounter state. Return-to-menu confirms progress loss. Tutorial advances on actions, not a wall of text. Touch controls cover all required actions at 390×844 / DPR 3.

Truthful readiness after renderer/input/world preparation; memory duration does not gate readiness. __GAME__ reports actual render counters and simulation. Preserve official gate and ship tools. Runtime assets only under game; originals, frames, contact sheets and QA captures excluded. Hard gate: 20s ready, 10 MB body transfer, 900 draws, 1.5M triangles, real tap/movement, no errors/missing resources. Desired budget is useful media quality, never artificial padding.
