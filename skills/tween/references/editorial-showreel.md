# Editorial showreel motion (Swiss / designer reel look)

Use when the brief says "showreel", "editorial", "Swiss style", "brutalist type", "designer
portfolio", "bold typographic", "kinetic type poster", or similar. The look is graphic and
confident: heavy capitals, tiny mono labels, one hot accent colour, hard cuts and fast,
snappy moves with real motion blur.

Templates that already follow this guide: `EditorialTitle.tsx`, `EditorialStats.tsx`,
`TypeStack.tsx`. Start from one of them when it fits.

## The feel in one paragraph

Everything snaps. Elements arrive fast out of a mask or a slot, travel almost all the way in
the first few frames, then settle hard; the in-between frames are smeared with vertical motion
blur, so the eye reads speed rather than an object sliding. Layout is a strict grid: left
aligned, hairline rules, mono labels in the corners. Each shot does one trick and then the
video hard-cuts to the next one, often from cream to black and back.

## Easing

```tsx
import {Easing} from "remotion";

// Entrances: very fast start, short hard settle
export const snapOut = Easing.bezier(0.22, 1, 0.36, 1);
// Exits: accelerate away
export const snapIn = Easing.bezier(0.64, 0, 0.78, 0);
```

- Entrance length: 10-14 frames at 30 fps. Exit: 8-12 frames. Faster than the Tween default.
- Stagger: 6-8 frames between words, 2 frames between digits, 10 frames between rows.
- Springs only for the one playful accent (the full stop dropping in): `damping: 9, stiffness: 170, mass: 0.6`.
- Hold each shot 15-30 frames after it lands, then cut. Showreels move on before you're bored.

## Signature moves

**Mask rise**: a word sits in an `overflow: hidden` box and slides up from 105% to 0. Words
exit the same way, upward, 1 frame apart.

```tsx
<span style={{display: "inline-block", overflow: "hidden", height: lineH, verticalAlign: "top"}}>
  <span style={{display: "inline-block", transform: `translateY(${(1 - p) * 105}%)`}}>{word}</span>
</span>
```

**Motion blur from speed**: compute the value at `frame` and `frame - 1`, turn the difference
into pixels, and feed it to an SVG blur on the moving axis only. CSS `blur()` blurs in every
direction and looks soft instead of fast.

```tsx
const VBlur = ({id, amount}) => (
  <svg width={0} height={0} style={{position: "absolute"}}>
    <filter id={id} x="-5%" y="-60%" width="110%" height="220%">
      <feGaussianBlur stdDeviation={`0 ${amount}`} />
    </filter>
  </svg>
);
const speedPx = Math.abs(y(frame) - y(frame - 1));
const amount = Math.min(speedPx * 0.35, 40 * unit);
// style={{filter: amount > 0.3 ? `url(#${id})` : undefined}}
```

Use `useId()` for the filter id so two copies of a scene in a `<TransitionSeries>` don't share one.

**Accent full stop**: the last line ends in a dot in the accent colour that drops from above
the frame and bounces once. It is the only bouncy thing in the video.

**Slot-machine digits**: each digit is a column `blank, 0-9, 0..digit` that scrolls up so it
spins once and lands, with the motion blur above. Non-digit characters (`,` `%` `$`) mask-rise.

**Hairline rows**: big number on the left, mono label at ~50%, a 2-3px rule under the row that
draws left to right on entrance and retracts to the right on exit.

**Type stack**: one word repeated in rows that alternate solid and outline
(`WebkitTextStroke`), rows drift in opposite directions at slightly different speeds, an
accent band steps up one row every 8 frames. Start the stack tilted (-7deg, scale 1.25) and
straighten it in 30 frames.

**Corner HUD**: a mono chip `(01) SECTION NAME` top-left and a running timecode
`mm:ss:ff` top-right, 22px at 1080, on a small background-coloured box so they stay legible.

**Typed mono line**: subtitles and labels type on at ~1 character per frame, no cursor.

**Scene cuts**: hard cuts. To change colour, cut from cream to near-black on a beat. Avoid
cross-fades, slides and wipes between shots.

## Type

- Display: a heavy grotesk in capitals. `Archivo Black` (wide) for titles and numbers,
  `Anton` (condensed) for repeated stacks. Load them from `@remotion/google-fonts`.
- Labels: `JetBrains Mono` 500, capitals, `letterSpacing: "0.06em"`, 28-34px at 1080.
- Display line height 0.95-1.0, `letterSpacing: "-0.02em"`. Titles can fill 70-85% of the frame width.
- Lines may step right a little (0.12em per line) instead of aligning flush; it reads as designed.

## Colour

| Role | Light shot | Dark shot |
|---|---|---|
| Background | `#F0ECE1` (warm paper) | `#0A0A0C` / `#14130E` |
| Primary | `#14130E` | `#F0ECE1` |
| Accent | `#FF4F1F` (hot orange-red) | same |
| Optional second field | `#2937E6` (electric blue) | — |

One accent per frame. Mix light and dark shots in one reel for rhythm, but never on screen together.

## Timing template (30 fps, title card, 4 s)

```
0-4      blank paper
4-37     words mask-rise, one every 7 frames, motion blur on each
35-55    accent dot drops and bounces
41-67    mono subtitle types on (~1.2 characters per frame)
67-104   hold
104-120  words exit upward through the mask, 1 frame apart
```

## Beyond the templates

Shots like a 3D dot sphere, liquid chrome blobs, particle swirls or voxel landscapes need
WebGL (`@remotion/three`). Halftone and dot-grid shots can be done in plain React: a grid of
`<div>` dots whose size comes from a function of `(x, y, frame)`, e.g. a ripple
`size = base * (0.5 + 0.5 * Math.sin(dist / 40 - frame / 4))`.

## What breaks the look

- Soft fades, long ease-ins, cross-dissolves.
- Blur-in entrances (that's the Apple look); here things are sharp at rest and smeared only while moving.
- More than one accent colour on screen, gradients, drop shadows, rounded friendly type.
- Centred everything. This style is left-aligned on a grid.
- Copying another designer's reel content, name or logo; recreate the style with the user's own.
