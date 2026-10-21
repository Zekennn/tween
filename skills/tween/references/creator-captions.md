# Creator captions (talking-head tutorial look)

Use when the brief says "captions", "subtitles", "TikTok style", "Reels", "talking head",
"tutorial", "split screen", "reaction", "before and after", or the user brings their own
footage of someone speaking. The look is fast, clear and native to short-form apps: real
footage, one caption word at a time, and a few bold labels that frame the hook.

Templates that already follow this guide: `WordCaptions.tsx`, `SplitCompare.tsx`. Start from
one of them when it fits.

## The feel in one paragraph

The footage is the content; graphics only make it easier to follow with the sound off. One
word sits on screen at a time, exactly when it is spoken, in a bold sans on a see-through
dark box placed on the seam between the two halves of the frame. A red title banner states
the promise of the video. Cuts are hard and frequent, and every shot pushes in very slightly
so nothing ever feels frozen.

## Easing

```tsx
import {Easing} from "remotion";

export const snapOut = Easing.bezier(0.22, 1, 0.36, 1);
export const snapIn = Easing.bezier(0.64, 0, 0.78, 0);
```

- Caption word: pops in over 4 frames (`scale 0.85 -> 1`), replaced hard on the next word. No exit.
- Panels: 14 frames, 5 frames apart. Labels pop 8 frames after their panel.
- Banner lines: wipe in left to right over 10 frames (`clipPath: inset(0 X% 0 0)`), 4 frames
  apart; wipe out to the right over 8 frames at the end.
- Footage push-in: `scale 1 -> 1.05` linear over the whole shot. Linear is fine here: it is a
  drift, not an entrance.

## Signature moves

**Word-by-word captions from a transcript**: transcribe with `@remotion/install-whisper-cpp`
(or any tool that returns word timings) and pass the words straight in. `WordCaptions` takes
the same `{text, startMs, endMs}` shape as `Caption` from `@remotion/captions`.

```tsx
const ms = (frame / fps) * 1000;
const active = captions.find((c) => ms >= c.startMs && ms < c.endMs);
```

No transcript yet? Space the words evenly to test the layout:

```tsx
const captions = "Here's how to turn one prompt into a full motion graphic".split(" ")
  .map((text, i) => ({text, startMs: i * 300, endMs: (i + 1) * 300}));
```

**Caption box**: `background: rgba(28,28,32,0.72)`, padding `0.08em 0.3em`, radius `0.14em`,
`Inter` 800, 60-70px at 1080 wide, white. Use an `rgba()` colour for the box, not a hex with
appended alpha.

**Split screen**: on 9:16 the top half shows the screen recording or the clips being
compared and the bottom half the presenter. On 16:9 put them side by side. The caption or
the banner sits on the seam, which is where the eye already is.

**Before / after pair**: two rounded panels side by side, label under each ("2 hours" left
aligned, "10 minutes" right aligned), clips muted so only the presenter's audio plays.

**Title banner**: 1-2 lines in capitals, `Inter` 800, white on red (`#E5243B`), each line its
own box hugging the text, no gap between them.

**Media in templates**: images with `<Img src={staticFile(...)}>`, video with
`<OffthreadVideo src={staticFile(...)}>` (or `<Video>` from `@remotion/media` in newer projects).
Mute every clip except the one carrying the voice.

## Type

- `Inter` 800 for captions and banners, 700 for labels. One typeface.
- Captions 60-70px, labels 36-44px, banner 46-54px, all at 1080 short side.
- Keep captions out of the bottom 22% on 9:16; the app's buttons and its own caption cover it.

## Colour

| Role | Value |
|---|---|
| Caption text | `#FFFFFF` |
| Caption box | `rgba(28,28,32,0.72)` |
| Banner | `#E5243B` with white text |
| Labels | `#FFFFFF` |
| Background behind footage | `#0B0B0D` |

## Timing template (30 fps, split-screen hook, 5 s)

```
0-14     left panel rises; 5-19 right panel rises
8-12     left label pops; 13-17 right label pops
16-26    banner line 1 wipes in; 20-30 line 2
0-150    presenter pushes in 1 -> 1.05, captions follow the voice
138-148  banner wipes out; 142-149 frame fades
```

## What breaks the look

- Full sentences on screen at once, or captions that drift out of sync with the voice.
- Fancy fonts, gradients, glows or 3D on the captions.
- Captions in the bottom 22% on vertical video.
- Unmuted comparison clips fighting the presenter's audio.
- Using someone else's face, footage, channel name or tool logos from a reference video. The
  footage must be the user's own.
