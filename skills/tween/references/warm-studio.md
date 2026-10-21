# Warm studio motion (sketch-to-motion product film look)

Use when the brief says "warm", "cosy", "crafted", "sketch to final", "before and after",
"hand-drawn to polished", "AI product demo", "studio glow", or similar. The look is soft and
premium but human: paper cards floating in warm dark light, a rough sketch next to its
finished version, glowing accents, italic serif type.

Templates that already follow this guide: `WarmPathDemo.tsx`, `WarmGlowTagline.tsx`. Start
from one of them when it fits.

## The feel in one paragraph

The frame is a dark room lit by one warm lamp. Cards and panels drift up out of a slight
blur and land with a small, friendly overshoot. The story is always "rough in, polished out":
a sketch on the left draws itself, and the same idea plays out clean and alive on the right.
Light is the focal point: whatever matters glows. Beats are slower than a social edit, about
1.5-2 seconds each, and the camera never moves.

## Easing

```tsx
import {Easing, spring} from "remotion";

// Entrances and reveals: smooth start, long soft settle
export const warmOut = Easing.bezier(0.25, 1, 0.5, 1);
// Travel along a path, draw-ons: smooth both ends
export const warmInOut = Easing.bezier(0.65, 0, 0.35, 1);
// Exits
export const warmIn = Easing.bezier(0.5, 0, 0.75, 0);

// Cards, tiles, keyframe markers: a small overshoot, never a wobble
const pop = spring({frame: frame - start, fps, config: {damping: 14, stiffness: 140}});
```

- Entrances: 15-25 frames. Exits: 14-16 frames, everything blurs out together.
- Stagger: 5-6 frames between cards, 3 frames between small markers, 1-1.5 frames between letters.
- Damping 12-15 on springs. Under 10 starts to look like a cartoon.

## Signature moves

**Soft float-in**: `opacity`, `blur(12px -> 0)`, `translateY(40px -> 0)`, `scale(0.94 -> 1)` on a
`damping: 14` spring.

**Self-drawing sketch**: an SVG path with `pathLength={1}`, `strokeDasharray="1 1"` and
`strokeDashoffset={1 - p}`. Draw it twice, the second copy thinner, lighter and offset by
1-2px, so it reads as pencil rather than vector. Add a little deterministic wobble to the
points with `random("seed-" + i)`.

**Orb on a path**: a glowing dot (`radial-gradient` core plus two `boxShadow`s in the accent)
travels the curve on `warmInOut`. Fake motion blur with 4-6 ghost copies at earlier positions
on the same curve, fading out behind it.

**Rough to smooth**: keyframe diamonds (ink squares rotated 45deg) sit on the sketch's peaks.
As the orb passes each one, its point relaxes toward a gentle wave, the diamond turns into an
accent dot (`interpolateColors` for the fill, `borderRadius 0 -> 50%`), and the curve's
Catmull-Rom smoothing goes from 0 (straight lines) to 1.

**Grid paper**: two `linear-gradient` backgrounds at ~9% black on the light panel, 28px at 1080.

**Starburst glow**: 16-20 rounded strokes radiating from a point, lengths varied with
`random()`, growing out on staggered springs, turning ~0.25deg per frame. Glow comes from
`filter: drop-shadow(0 0 8px accent) drop-shadow(0 0 28px accent)` on the SVG.

**Dashed connectors**: quadratic curves from the burst to floating cards, drawn outward by
cutting the curve at `t` (de Casteljau), with the dash offset marching slowly
(`strokeDashoffset={-frame * 0.6}`).

**Letter-by-letter serif**: each character fades and un-blurs (`blur(12px -> 0)`, rise 0.14em)
1.2 frames after the previous one. The last line is in the accent colour.

**Vignette light**: `radial-gradient(ellipse at 50% 50%, glow, background)` with glow a warm
brown and background near-black. The room never goes flat black behind the subject.

## Type

- Headlines: `Playfair Display` italic 700 (`@remotion/google-fonts/PlayfairDisplay`, style
  `"italic"`), lowercase, short, ending in a full stop: "sketch in." / "motion out.".
- Labels: `Inter` 600, 28-32px at 1080, warm off-white, sitting just above their card.
- Max two typefaces. Never use the serif for UI labels.

## Colour

| Role | Value |
|---|---|
| Background (vignette edge) | `#0D0705` |
| Glow (vignette centre) | `#6B3522` to `#7A3D24` |
| Paper card / panel | `#FCFBF7` / `#EEECE7` |
| Ink | `#1C1A18` |
| Accent (orb, motion line) | `#E8743B` coral |
| Highlight text | `#F2A27A` peach |
| Labels | `#F5EFE8` |

Warm only. A cold blue anywhere breaks it.

## Timing template (30 fps, sketch-to-motion demo, 6 s)

```
0-20     warm light fades up
4-25     sketch card floats in; 10-30 panel floats in
14-42    sketch path draws itself
28-52    clean line draws on the panel, keyframe diamonds pop in 3 frames apart
54-134   orb travels the path; each keyframe it passes relaxes and turns accent
134-164  hold on the smooth result
164-178  everything blurs out
```

## What breaks the look

- Hard cuts every half second, glitch, shake, whip pans.
- Pure black backgrounds with no warm light, neon colours, cold greys.
- Heavy bounce (damping under 10), spinning, 3D flips.
- Sans-serif headlines, all caps, or long sentences.
- Copying the reference brand's logo, product name or asterisk mark. Use the user's own mark,
  or a plain accent dot.
