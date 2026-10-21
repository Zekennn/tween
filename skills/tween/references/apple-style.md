# Apple-style motion (keynote / product film look)

Use when the brief says "Apple style", "Apple keynote", "like an Apple ad", "premium
product reveal", "clean minimal launch video", or similar. The look is calm, expensive and
confident: few elements, huge type, slow ease, lots of black (or white) space.

Templates that already follow this guide: `AppleHeadline.tsx`, `AppleProductReveal.tsx`,
`AppleBento.tsx`. Start from one of them when it fits.

## The feel in one paragraph

Nothing bounces. Things arrive out of a soft blur, settle with a long, slow ease-out, then
hold still long enough to be read twice. The camera is never fully static: a slow push-in
(1-4% over the whole shot) keeps the frame alive. One idea per screen. Cuts are fades
through black, not slides or wipes.

## Easing (the most important part)

Apple-style motion is mostly about the curve, not the movement.

```tsx
import {Easing} from "remotion";

// Entrances: fast start, very long gentle settle (expo-out family)
export const appleOut = Easing.bezier(0.16, 1, 0.3, 1);
// Moves across the frame / camera: smooth both ends
export const appleInOut = Easing.bezier(0.65, 0, 0.35, 1);
// Exits: quick and quiet
export const appleIn = Easing.bezier(0.7, 0, 0.84, 0);
```

- Springs: only with `damping: 200` (no overshoot). Never a playful bounce.
- Entrance length: 24-40 frames at 30 fps (longer than the Tween default).
- Exit length: 12-18 frames. Exits are shorter than entrances.
- Stagger: 6-10 frames between lines, 3-5 between tiles. Slower than kinetic social.

## Signature moves

**Blur-in (the default entrance)**: opacity 0 -> 1, blur 16-24px -> 0, scale 1.06 -> 1 or
translateY 30-50px -> 0, all on `appleOut`.

```tsx
const p = interpolate(frame, [start, start + 32], [0, 1], {...clamp, easing: appleOut});
style={{
  opacity: p,
  filter: `blur(${(1 - p) * 20 * unit}px)`,
  transform: `translateY(${(1 - p) * 40 * unit}px) scale(${1.04 - p * 0.04})`,
}}
```

**Blur-out (exit)**: reverse it with `appleIn`, slightly less travel, upward (-20px).

**Slow push-in (camera)**: wrap the whole scene.

```tsx
const push = interpolate(frame, [0, durationInFrames], [1, 1.04], {...clamp, easing: appleInOut});
<AbsoluteFill style={{transform: `scale(${push})`}}>...</AbsoluteFill>
```

**Gradient text with a slow sweep**: one highlighted word or line per scene, never all text.

```tsx
const sweep = interpolate(frame, [0, durationInFrames], [0, 100], clamp);
<span style={{
  backgroundImage: `linear-gradient(90deg, ${from}, ${to}, ${from})`,
  backgroundSize: "200% 100%",
  backgroundPosition: `${sweep}% 50%`,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
}}>{word}</span>
```

**Light sweep (shine across text or a device)**: a narrow, soft white diagonal band moving
across once, with `mixBlendMode: "overlay"` or low opacity, over 30-45 frames.

**Spotlight background**: pure black plus one soft radial glow behind the subject, low
opacity (`${accent}33` or less). No busy gradients, no particles, no grid lines.

**Product rise with perspective**: the object starts 15-25% lower, tilted back
(`perspective(1600px) rotateX(18deg)`), and settles flat over 40-50 frames on `appleOut`,
with a soft shadow that tightens as it lands.

**Bento grid**: rounded tiles (radius ~28px at 1080), dark grey (`#1C1C1E`) on black,
staggered blur-in, numbers count up, one tile uses gradient text.

**Scene cuts**: `fade()` from `@remotion/transitions` with `linearTiming({durationInFrames: 12})`
over a black background, or simply fade each scene out and the next one in. Avoid slide,
wipe, flip, zoom-through, glitch.

## Type

- Big, bold, tight: weight 600-700, `letterSpacing: "-0.04em"` on headlines, `lineHeight: 1.02`.
- Hero headline 140-200px at 1080 short side; it's fine for 2-4 words to fill the frame width.
- Small grey "eyebrow" above headlines: 32-40px, weight 600, colour `#86868B`.
- Body/subhead in grey (`#A1A1A6` on black, `#6E6E73` on white), never pure white.
- Typeface: Inter is the closest freely licensed choice (`@remotion/google-fonts/Inter`).
  Do **not** bundle SF Pro: its licence only allows use in mock-ups of Apple platforms.

## Colour

| Role | Dark (default) | Light |
|---|---|---|
| Background | `#000000` | `#FFFFFF` or `#F5F5F7` |
| Primary text | `#F5F5F7` | `#1D1D1F` |
| Secondary text | `#86868B` | `#6E6E73` |
| Tile / card | `#1C1C1E` | `#FFFFFF` with soft shadow on `#F5F5F7` |
| Gradient accents | `#2997FF -> #A970FF`, `#FF6A3D -> #FFB443`, `#5AC8FA -> #34C759` | same |

One gradient per video. Don't mix three accent colours.

## Timing template (30 fps, single headline shot, 4 s)

```
0-10    black, push-in already running
8-40    eyebrow blur-in
14-46   line 1 blur-in
22-54   line 2 (gradient) blur-in, sweep starts
54-102  hold, gentle push only
102-120 everything blur-out together
```

## What breaks the look (avoid)

- Bounce, overshoot, elastic, wiggle, rotation, camera shake.
- More than ~8 words on screen at once, or more than 2 weights.
- Fast cuts (< 2 s per shot) unless the brief is a hype montage.
- Drop shadows on text, outlines, emoji, stock icons.
- Using Apple's logo, product names, product photos or "Apple" in the video. This
  is a *style*; the content must be the user's own brand and product.
