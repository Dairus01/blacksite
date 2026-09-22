---
name: Breach Zero
description: Industrial blacksite interfaces built as terse operational overlays.
colors:
  void: "#080b0e"
  panel: "#11171b"
  steel: "#303b42"
  chalk: "#e4e9e6"
  muted: "#aab5b3"
  extraction-amber: "#ffb23e"
  intel-cyan: "#55d9d0"
  hostile-red: "#ff463d"
typography:
  display:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "clamp(76px, 10vw, 146px)"
    fontWeight: 800
    lineHeight: 0.76
    letterSpacing: "-.035em"
  body:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
    fontSize: "17px"
    fontWeight: 500
    lineHeight: 1.45
  label:
    fontFamily: "Barlow Condensed, Arial Narrow, sans-serif"
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

The world extends that status-board discipline into night-flight-line marshaling: long low service masses, hard thresholds, ribbed equipment, warm approach lights, and cool maintenance pools. The route becomes legible through light, enclosure, and silhouette before the HUD explains it.

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

Display, body, and labels use the locally hosted Barlow Condensed family. Display type is dense and oversized; labels are compact, uppercase, and heavily tracked; body copy is sentence case and keeps a short measure. The two shipped weights preserve a clear hierarchy without adding a network dependency.

**The Command Voice Rule.** Objectives and buttons use verbs—Deploy, Neutralize, Recover, Reach, Run Again—and avoid decorative technical jargon.

## Layout

Gameplay overlays occupy corners and preserve the center for aiming. Desktop deployment copy shifts left of center; mobile copy anchors above the safe-area bottom and uses almost the full width. At coarse-pointer or sub-800px viewports, the 122px movement stick occupies the lower left and the 88px fire control occupies the lower right, while vitals move above them.

World layout follows authored thresholds rather than an open prop field: approach, security gate, checkpoint crossfire, operations entrance, service stair, upper deck, and extraction. Each threshold changes enclosure, light, and cover density while retaining a single forward read.

Spacing groups control internals tightly at 12–22px and separates narrative blocks at 36px. Critical touch targets exceed 64px.

## Elevation & Depth

The 3D world supplies most depth. Interface surfaces use a single soft, downward ambient shadow; they do not combine wide shadows with visible borders. The start and results actions carry an amber-tinted lift because they are the only actionable controls in those states.

Environmental depth comes from a warm/cool lighting hierarchy: amber approach and extraction signals guide movement, while cool work light reveals usable structure. Darkness frames authored detail; it must not replace it.

**The Overlay Restraint Rule.** Gameplay panels may darken the scene for legibility but never become translucent glass or blur the action behind them.

## Shapes

Operational panels and primary actions are square with only a 3px manufacturing tolerance. Touch controls are circular because they represent continuous direction and pressure. Objective accents are short horizontal signal bars, not decorative side tabs.

World silhouettes use long service masses, inset access panels, ribs, rails, conduit, vents, fasteners, and anti-slip treads. Repeated primitives should read as construction systems, not as a visible generation grid.

## Components

### Primary Action

Amber fill, Void text, 3px corners, 64px height, and a label/action pair aligned to opposite edges. Hover adds brightness, a 2px lift, and a larger soft amber shadow. Keyboard focus uses a 3px cyan ring with a 5px offset.

### Objective Readout

A compact near-black block with a short amber top signal, three typographic levels, and cyan progress. It never covers the reticle and contracts to the available mobile width.

### Waypoint and Radio

The waypoint inherits the active semantic signal and reports distance without becoming a minimap. Radio appears as a short, transient command strip; it supplies context and then yields the combat view.

### Touch Controls

Movement is a translucent concentric circle with a movable center. Fire is a red circular control with a visible stroke and direct verb. Controls disappear outside play and on desktop pointer devices.

## Do's and Don'ts

### Do:

- **Do** keep the reticle and central enemy silhouette unobstructed.
- **Do** make state understandable from wording and silhouette as well as color.
- **Do** retain one dominant action per non-gameplay screen.
- **Do** test at 390x844 with safe-area spacing and real simultaneous pointers.
- **Do** treat 390x844 as a distinct density tier: objective, radio, vitals, weapon, and action controls must leave a usable central combat column.
- **Do** use authored light and threshold changes as primary wayfinding, with the waypoint as confirmation.

### Don't:

- **Don't** introduce legacy game branding, imported imagery, or decorative logos.
- **Don't** add cyan, amber, or red merely to balance a composition.
- **Don't** add glass cards, rounded dashboard tiles, or technical filler copy.
- **Don't** place printed text inside the procedural 3D world; keep glyphs in HTML.
