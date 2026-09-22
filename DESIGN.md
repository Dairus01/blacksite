---
name: Breach Zero
description: Industrial blacksite interfaces built as terse operational overlays.
colors:
  void: "#080b0e"
  panel: "#11171b"
  steel: "#303b42"
  chalk: "#dbe1dd"
  muted: "#9da9a7"
  extraction-amber: "#ffb23e"
  intel-cyan: "#55d9d0"
  hostile-red: "#ff463d"
typography:
  body:
    fontFamily: "DIN Condensed, Bahnschrift Condensed, Aptos Narrow, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.45
  label:
    fontFamily: "DIN Condensed, Bahnschrift Condensed, Aptos Narrow, sans-serif"
    fontSize: "10px"
    fontWeight: 800
    letterSpacing: ".14em"
rounded:
  control: "3px"
  circular: "50%"
spacing:
  tight: "12px"
  control: "22px"
  section: "36px"
components:
  button-primary:
    backgroundColor: "{colors.extraction-amber}"
    textColor: "{colors.void}"
    rounded: "{rounded.control}"
    padding: "0 22px"
    height: "64px"
---

# Design System: Breach Zero

## Overview

**Creative North Star: "The Blacksite Status Board"**

The interface behaves like an operational layer placed over a physical training site: nearly black until a task, threat, or extraction signal earns color. Information is sparse, aligned to viewport edges, and phrased as commands rather than commentary. The 3D scene carries material detail; HTML carries every glyph.

The first surface is deliberately asymmetric. Large condensed deployment type owns the lower mobile viewport while gameplay reduces to a compact objective block, reticle, health, ammunition, and controls.

**Key Characteristics:**

- Near-black field with chalk-white operational text.
- Amber means route or extraction, cyan means collected intelligence, and red means hostility or damage.
- Rectilinear information surfaces contrast with circular touch controls and cylindrical objective objects.
- One prominent action per screen.

## Colors

The palette is mostly neutral, with three semantic signals that never substitute for one another.

**The Signal Ownership Rule.** Amber guides, cyan confirms intelligence, and red identifies danger; do not exchange those roles for variety.

**The Dark Field Rule.** Neutral surfaces establish hierarchy through value steps between Void, Panel, and Steel. Accent color remains scarce enough to be directional.

## Typography

Body and labels use the narrow industrial stack already shipped without a font download. Labels are compact, uppercase, heavily tracked measurements; body copy is sentence case and keeps a short measure.

The current oversized deployment display uses the same local condensed stack for transfer-budget reasons. This is a provisional implementation constraint, not a durable display-font commitment; future work may self-host a distinctive face only if the measured 3 MB target remains green.

**The Command Voice Rule.** Objectives and buttons use verbs—Deploy, Neutralize, Recover, Reach, Run Again—and avoid decorative technical jargon.

## Layout

Gameplay overlays occupy corners and preserve the center for aiming. Desktop deployment copy shifts left of center; mobile copy anchors above the safe-area bottom and uses almost the full width. At coarse-pointer or sub-800px viewports, the 122px movement stick occupies the lower left and the 88px fire control occupies the lower right, while vitals move above them.

Spacing groups control internals tightly at 12–22px and separates narrative blocks at 36px. Critical touch targets exceed 64px.

## Elevation & Depth

The 3D world supplies most depth. Interface surfaces use a single soft, downward ambient shadow; they do not combine wide shadows with visible borders. The start and results actions carry an amber-tinted lift because they are the only actionable controls in those states.

**The Overlay Restraint Rule.** Gameplay panels may darken the scene for legibility but never become translucent glass or blur the action behind them.

## Shapes

Operational panels and primary actions are square with only a 3px manufacturing tolerance. Touch controls are circular because they represent continuous direction and pressure. Objective accents are short horizontal signal bars, not decorative side tabs.

## Components

### Primary Action

Amber fill, Void text, 3px corners, 64px height, and a label/action pair aligned to opposite edges. Hover adds brightness, a 2px lift, and a larger soft amber shadow. Keyboard focus uses a 3px cyan ring with a 5px offset.

### Objective Readout

A compact near-black block with a short amber top signal, three typographic levels, and cyan progress. It never covers the reticle and contracts to the available mobile width.

### Touch Controls

Movement is a translucent concentric circle with a movable center. Fire is a red circular control with a visible stroke and direct verb. Controls disappear outside play and on desktop pointer devices.

## Do's and Don'ts

### Do:

- **Do** keep the reticle and central enemy silhouette unobstructed.
- **Do** make state understandable from wording and silhouette as well as color.
- **Do** retain one dominant action per non-gameplay screen.
- **Do** test at 390x844 with safe-area spacing and real simultaneous pointers.

### Don't:

- **Don't** introduce legacy game branding, imported imagery, or decorative logos.
- **Don't** add cyan, amber, or red merely to balance a composition.
- **Don't** add glass cards, rounded dashboard tiles, or technical filler copy.
- **Don't** place printed text inside the procedural 3D world; keep glyphs in HTML.
