# Layouts and formats

## Common formats

| Use | Size | fps |
|---|---|---|
| YouTube, presentations | 1920x1080 (16:9) | 30 or 60 |
| Reels, TikTok, Shorts | 1080x1920 (9:16) | 30 |
| Instagram feed | 1080x1080 (1:1) or 1080x1350 (4:5) | 30 |
| 4K | 3840x2160 | 30 |

Register one composition per format, pointing at the same component:

```tsx
<Composition id="Promo-16x9" component={Promo} width={1920} height={1080} fps={30} durationInFrames={300} defaultProps={props} />
<Composition id="Promo-9x16" component={Promo} width={1080} height={1920} fps={30} durationInFrames={300} defaultProps={props} />
```

## Responsive sizing from one component

Scale from the short side so text stays proportional in every format:

```tsx
const {width, height} = useVideoConfig();
const unit = Math.min(width, height) / 1080;   // 1 at 1080p
const isVertical = height > width;

const titleSize = 120 * unit;
const padding = 80 * unit;
```

Switch layout (side-by-side vs stacked) with `isVertical`, never with CSS media queries.

## Safe areas

- Title-safe: keep text at least 5% from every edge (10% for broadcast).
- 9:16 social: keep the bottom ~20% and right ~12% free of important text; the app's
  buttons and caption cover them.

```tsx
const safe = {top: height * 0.08, bottom: height * (isVertical ? 0.22 : 0.08),
  left: width * 0.07, right: width * (isVertical ? 0.12 : 0.07)};
```

## Type scale (at 1080 short side)

| Role | Size | Weight |
|---|---|---|
| Hero headline | 120-160 px | 700-900 |
| Headline | 80-100 px | 700 |
| Subhead | 44-56 px | 500 |
| Body / labels | 32-40 px | 400-500 |
| Minimum on-screen | 28 px | — |

Big type: `letterSpacing: "-0.02em"`, `lineHeight: 1.05`.

## Layering

`<AbsoluteFill>` stacks children on top of each other, full-frame. Order = z-order
(later is on top). Use one `<AbsoluteFill>` per layer: background, midground,
text, overlays.

Centre anything:

```tsx
<AbsoluteFill style={{justifyContent: "center", alignItems: "center"}}>...</AbsoluteFill>
```

## Backgrounds that don't look flat

- Two-stop gradient that slowly rotates: `linear-gradient(${120 + frame * 0.2}deg, a, b)`.
- A large blurred circle drifting with `Math.sin(frame / 60)`.
- Subtle grain: an SVG `feTurbulence` filter at 4-8% opacity.
