# Animation patterns

All snippets assume:

```tsx
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame,
  useVideoConfig, random} from "remotion";

const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
```

## Fade + rise (the default entrance)

```tsx
const frame = useCurrentFrame();
const progress = interpolate(frame, [0, 20], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
<div style={{opacity: progress, transform: `translateY(${(1 - progress) * 60}px)`}} />
```

## Spring pop

```tsx
const {fps} = useVideoConfig();
const s = spring({frame, fps, config: {damping: 10, stiffness: 140, mass: 0.6}});
<div style={{transform: `scale(${s})`}} />
```

Damping guide: 200 = no overshoot (smooth), 15-20 = gentle bounce, 8-12 = playful.

## Staggered words

```tsx
const words = text.split(" ");
{words.map((w, i) => {
  const p = spring({frame: frame - i * 4, fps, config: {damping: 200}});
  return (
    <span key={i} style={{display: "inline-block", marginRight: "0.25em",
      opacity: p, transform: `translateY(${(1 - p) * 40}px)`}}>{w}</span>
  );
})}
```

Letters: same idea with `text.split("")`, delay 1-2 frames each. Preserve spaces with
`whiteSpace: "pre"`.

## Mask reveal (text slides up from behind a line)

```tsx
<div style={{overflow: "hidden", lineHeight: 1.1}}>
  <div style={{transform: `translateY(${(1 - p) * 110}%)`}}>{text}</div>
</div>
```

## Wipe with clip-path

```tsx
const w = interpolate(frame, [0, 25], [0, 100], {...clamp, easing: Easing.inOut(Easing.cubic)});
<div style={{clipPath: `inset(0 ${100 - w}% 0 0)`}} />
```

## Number counter

```tsx
const value = interpolate(frame, [0, 45], [0, target], {...clamp, easing: Easing.out(Easing.quad)});
<span style={{fontVariantNumeric: "tabular-nums"}}>{Math.round(value).toLocaleString("en-US")}</span>
```

Always use `tabular-nums` so digits don't jitter in width.

## Typewriter

```tsx
const chars = Math.floor(interpolate(frame, [0, text.length * 2], [0, text.length], clamp));
const cursorOn = Math.floor(frame / 15) % 2 === 0;
<span>{text.slice(0, chars)}<span style={{opacity: cursorOn ? 1 : 0}}>|</span></span>
```

## SVG path drawing

```tsx
import {evolvePath} from "@remotion/paths"; // npm i @remotion/paths
const p = interpolate(frame, [0, 40], [0, 1], clamp);
const {strokeDasharray, strokeDashoffset} = evolvePath(p, d);
<path d={d} fill="none" stroke="white" strokeWidth={6}
  strokeDasharray={strokeDasharray} strokeDashoffset={strokeDashoffset} />
```

Without the package: set `strokeDasharray={len}` and
`strokeDashoffset={len * (1 - p)}` where `len` is the path length.

## Parallax background

Move layers at different speeds from the same frame:

```tsx
const drift = frame * 0.4;  // far layer
const near = frame * 1.2;   // near layer
```

## Seamless loop

Use `durationInFrames` as the period so the last frame matches the first:

```tsx
const {durationInFrames} = useVideoConfig();
const t = (frame / durationInFrames) * Math.PI * 2;
const y = Math.sin(t) * 20;
```

## Deterministic particles / noise

```tsx
const dots = new Array(40).fill(0).map((_, i) => ({
  x: random(`x-${i}`) * width,
  y: random(`y-${i}`) * height,
  speed: 0.3 + random(`s-${i}`) * 1.2,
}));
```

For smooth organic motion use `@remotion/noise` (`noise2D("seed", x, y)`).

## Camera shake (subtle impact)

```tsx
const amount = interpolate(frame, [0, 10], [12, 0], clamp);
const dx = (random(`sx-${frame}`) - 0.5) * amount;
const dy = (random(`sy-${frame}`) - 0.5) * amount;
```

## Scene transitions

Simple: overlap two `<Sequence>`s and fade one out while the next fades in.

Better: `@remotion/transitions` (`npm i @remotion/transitions`):

```tsx
import {TransitionSeries, linearTiming, springTiming} from "@remotion/transitions";
import {fade} from "@remotion/transitions/fade";
import {slide} from "@remotion/transitions/slide";
import {wipe} from "@remotion/transitions/wipe";

<TransitionSeries>
  <TransitionSeries.Sequence durationInFrames={90}><SceneA /></TransitionSeries.Sequence>
  <TransitionSeries.Transition presentation={fade()} timing={linearTiming({durationInFrames: 15})} />
  <TransitionSeries.Sequence durationInFrames={90}><SceneB /></TransitionSeries.Sequence>
  <TransitionSeries.Transition presentation={slide({direction: "from-right"})}
    timing={springTiming({config: {damping: 200}})} />
  <TransitionSeries.Sequence durationInFrames={90}><SceneC /></TransitionSeries.Sequence>
</TransitionSeries>
```

Transitions overlap scenes, so total length = sum of sequences minus sum of
transition durations. Set the composition's `durationInFrames` to match.

## Timeline helper

For multi-beat scenes, name the beats once:

```tsx
const beats = {bgIn: 0, titleIn: 12, subIn: 28, holdEnd: 100, out: 110};
const titleP = spring({frame: frame - beats.titleIn, fps, config: {damping: 200}});
```
