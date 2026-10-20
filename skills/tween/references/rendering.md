# Rendering

## Preview

```
npx remotion studio
```

Opens Remotion Studio in the browser. Scrub the timeline, edit props on the right.

## Render a video

```
npx remotion render <CompositionId> out/<name>.mp4
```

Useful flags:

| Flag | Use |
|---|---|
| `--codec=h264` | Default MP4, works everywhere |
| `--codec=vp9` / `--codec=prores --prores-profile=4444` | Transparent video (also set `--pixel-format=yuva420p` for vp9, `yuva444p10le` for ProRes) |
| `--crf=18` | Higher quality (lower number = better, bigger file) |
| `--scale=2` | Render at 2x the composition size |
| `--frames=0-59` | Render part of the video |
| `--props='{"title":"Hi"}'` or `--props=./props.json` | Override props |
| `--concurrency=50%` | Use half the CPU cores |

On Windows Command Prompt, JSON quotes get mangled. Prefer `--props=./props.json`.

## Stills and thumbnails

```
npx remotion still <CompositionId> out/thumb.png --frame=45
```

## GIF

```
npx remotion render <CompositionId> out/clip.gif --codec=gif --every-nth-frame=2
```

## Transparent overlays (lower thirds for editors)

Don't paint a background in the component, then render with ProRes 4444 so it can
be dropped onto footage in Premiere/DaVinci/CapCut:

```
npx remotion render LowerThird out/lower-third.mov --codec=prores --prores-profile=4444 --pixel-format=yuva444p10le
```

## Common errors

| Symptom | Cause / fix |
|---|---|
| Flicker or elements in wrong place in render but fine in Studio | Something isn't driven by `useCurrentFrame` (CSS transition, timer, random). |
| Wrong font in first frames | Font not loaded via `@remotion/google-fonts` / `@remotion/fonts`. |
| "No composition with the ID" | ID in the command doesn't match `<Composition id>` exactly (case-sensitive). |
| Image missing in render | Used `<img>` or a relative path; use `<Img src={staticFile("x.png")}>`. |
| Render very slow | Heavy blur/box-shadow on large areas; reduce, or use `--concurrency`. |
| Video ends early | Composition `durationInFrames` shorter than your sequences. |
