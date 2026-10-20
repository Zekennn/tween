---
name: tween
description: Use when the user wants motion graphics, an animated video, intro, outro, title card, lower third, kinetic typography, animated stats or chart, logo reveal, social clip or promo video, or is working in a Remotion project (files importing from "remotion", a Root.tsx with <Composition>).
---

# Tween: motion graphics with Remotion

You write motion graphics as React components rendered by Remotion. A video is a
function of the frame number: given frame N, the component returns exactly what
that frame looks like. Everything below follows from that one rule.

## Workflow

1. **Understand the brief.** Format (16:9 1920x1080, 9:16 1080x1920, 1:1 1080x1080),
   length in seconds, fps (default 30), text content, brand colours, mood.
   If the user gives none of this, pick sensible defaults and say which you picked.
   Do not interrogate them.
2. **Find or create the project.** Look for `remotion` in `package.json`. If there
   is none, scaffold one (see `/tween-new`). Never scaffold inside a folder that
   already has unrelated code without asking.
3. **Plan the timeline in frames before writing code.** Write a short beat sheet:
   `0-20 bg fades in · 15-45 title rises · 45-90 hold · 90-110 everything out`.
   Convert seconds with `frames = seconds * fps`.
4. **Build one component per scene** in `src/scenes/`, compose them in a main
   composition with `<Sequence>` or `<TransitionSeries>`, register it in
   `src/Root.tsx`.
5. **Expose editable content as props** (text, colours, numbers) with a zod
   schema when the project has `@remotion/zod-types` or `zod`, so users can edit in
   Studio's right panel.
6. **Preview** with `npx remotion studio`, then **render** with
   `npx remotion render <CompositionId> out/<name>.mp4`.
7. **Self-check** against the checklist at the bottom before saying you're done.

## The non-negotiable rules

These break renders or make them flicker. Never violate them.

- **All motion comes from `useCurrentFrame()`.** No CSS `transition`, no CSS
  `@keyframes`, no `setTimeout`, no `requestAnimationFrame`, no animation
  libraries that run on wall-clock time (framer-motion's `animate`, GSAP timelines
  playing on their own). Remotion renders frames out of order and in parallel, so
  anything time-based desyncs.
- **No `Math.random()`.** Use `random("seed-string")` from `remotion`, which is
  deterministic per seed.
- **Clamp interpolations.** `interpolate()` extrapolates past its input range by
  default. Almost always pass
  `{extrapolateLeft: "clamp", extrapolateRight: "clamp"}`.
- **Load assets with `staticFile()`** from the `public/` folder, and use Remotion's
  `<Img>`, `<Audio>`, `<OffthreadVideo>` (or `<Video>` from `@remotion/media` in newer
  projects) so the renderer waits for them to load. Never a bare `<img>`.
- **Load fonts with `@remotion/google-fonts`** (`import {loadFont} from
  "@remotion/google-fonts/Inter"`) or `@remotion/fonts` for local files. A font
  that loads late renders the first frames in a fallback font.
- **Size with the composition, not the window.** Read `width`, `height`, `fps`,
  `durationInFrames` from `useVideoConfig()`. Don't use `vw`/`vh` or media queries.
- **Inside a `<Sequence from={X}>`, `useCurrentFrame()` starts again at 0.** Write
  each scene as if it begins at frame 0.

## Core API (memorise)

```tsx
import {AbsoluteFill, Sequence, interpolate, spring, useCurrentFrame,
  useVideoConfig, Easing, random, staticFile, Img} from "remotion";

const frame = useCurrentFrame();
const {fps, width, height, durationInFrames} = useVideoConfig();

// Linear map frame -> value
const opacity = interpolate(frame, [0, 20], [0, 1], {
  extrapolateLeft: "clamp", extrapolateRight: "clamp",
});

// Eased map
const y = interpolate(frame, [0, 30], [80, 0], {
  easing: Easing.out(Easing.cubic),
  extrapolateLeft: "clamp", extrapolateRight: "clamp",
});

// Physics spring, 0 -> 1 (can overshoot unless damping is high)
const pop = spring({frame, fps, config: {damping: 12, stiffness: 120}});
const delayed = spring({frame: frame - 10, fps, config: {damping: 200}});

// Exit animation: count from the end
const out = interpolate(frame, [durationInFrames - 15, durationInFrames], [1, 0], {
  extrapolateLeft: "clamp", extrapolateRight: "clamp",
});
```

Composition registration (`src/Root.tsx`):

```tsx
<Composition
  id="Promo"
  component={Promo}
  durationInFrames={150}
  fps={30}
  width={1920}
  height={1080}
  defaultProps={{title: "Hello"}}
/>
```

## Motion design principles (what makes it look professional)

- **Ease everything.** Linear motion looks robotic. Entrances use ease-out
  (`Easing.out(Easing.cubic)` or a spring), exits use ease-in, moves across the
  screen use ease-in-out (`Easing.inOut(Easing.cubic)`). Use `Easing.bezier(...)`
  for custom curves.
- **Stagger, don't sync.** When several elements enter, delay each by 3-6 frames.
  Words in a headline, list items, bars in a chart.
- **Overlap actions.** The next element starts before the previous one finishes.
  Dead air between beats feels slow.
- **Hold long enough to read.** Roughly 1 second per 3 words of on-screen text at
  minimum, plus the entrance.
- **Move less than you think.** Entrances travel 40-120 px, not across the screen.
  Combine a small translate with opacity and maybe a slight scale (0.95 -> 1) or blur
  (8px -> 0).
- **One focal point per moment.** Dim, shrink or remove what isn't the point.
- **Safe areas.** Keep text 5-10% inside the frame edges; on 9:16 keep the bottom
  20% clear of key text (platform UI covers it).
- **Type.** Headlines large (desktop video: 80-160 px; vertical: 90-140 px), tight
  letter-spacing on big text, max 2 typefaces, high contrast against the
  background.
- **Colour.** One background, one primary, one accent. Define them once as props.
- **Exit cleanly.** Every element either leaves or the scene cuts/transitions. Never
  end on a hard cut mid-motion unless that's the intent.

## Building blocks

Read the reference that matches the job, only when needed:

- `references/animation-patterns.md`: fades, slides, text reveals word-by-word and
  letter-by-letter, masks/wipes, counters, typewriter, path drawing, parallax,
  looping, camera shake, scene transitions with `@remotion/transitions`.
- `references/layouts-and-formats.md`: aspect ratios, safe areas, responsive sizing
  for multiple formats from one component, type scale.
- `references/audio-and-captions.md`: background music, fading audio, syncing beats
  to frames, captions.
- `references/rendering.md`: render commands, codecs, quality, transparent video,
  stills/thumbnails, GIFs, rendering on Windows, common errors.
- `templates/`: ready components you can copy into `src/` and adapt:
  `TitleReveal.tsx`, `LowerThird.tsx`, `StatCounter.tsx`, `KineticText.tsx`,
  `LogoReveal.tsx`, `BarChart.tsx`. Each is self-contained and prop-driven. Prefer
  adapting a template over writing from scratch when one fits.

## Self-check before you finish

- [ ] Every animated value derives from `useCurrentFrame()`; no CSS animations/transitions.
- [ ] Every `interpolate()` is clamped (or deliberately not, with a reason).
- [ ] No `Math.random`, `Date.now`, `new Date()` in render.
- [ ] Assets use `staticFile()` + Remotion media components; fonts loaded via Remotion font packages.
- [ ] Composition `durationInFrames` covers all sequences; nothing cut off at the end.
- [ ] Text readable: size, contrast, on screen long enough.
- [ ] Editable content is in props, not hard-coded deep inside components.
- [ ] `npx tsc --noEmit` passes, if the project has TypeScript.
- [ ] Tell the user the exact command to preview and to render.
