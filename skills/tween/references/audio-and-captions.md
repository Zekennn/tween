# Audio and captions

## Background music

Put the file in `public/` and use Remotion's audio component:

```tsx
import {Audio, staticFile, interpolate, useVideoConfig} from "remotion";
// In newer projects you may also use: import {Audio} from "@remotion/media";

const {durationInFrames} = useVideoConfig();
<Audio
  src={staticFile("music.mp3")}
  volume={(f) =>
    interpolate(f, [0, 20, durationInFrames - 30, durationInFrames], [0, 0.8, 0.8, 0], {
      extrapolateLeft: "clamp", extrapolateRight: "clamp",
    })
  }
/>
```

`volume` as a function receives the frame, so fades are frame-accurate.

Trim with `trimBefore` / `trimAfter` (in frames) on newer versions, or
`startFrom` / `endAt` on older ones. Check the installed version's types before
using either.

## Sound effects on a beat

Wrap a short audio in a `<Sequence from={frame}>` at the moment of impact:

```tsx
<Sequence from={45}><Audio src={staticFile("whoosh.mp3")} /></Sequence>
```

## Sync animation to music

If the user gives BPM: `framesPerBeat = (60 / bpm) * fps`. Put key entrances on
`Math.round(n * framesPerBeat)`.

For automatic beat/visual sync, `@remotion/media-utils` has `useAudioData` and
`visualizeAudio` to build waveform/spectrum visuals from the actual audio.

## Captions

For speech-to-text captions use `@remotion/captions` (caption data structures and
`createTikTokStyleCaptions`) together with a transcription tool such as
`@remotion/install-whisper-cpp`. Typical flow:

1. Transcribe audio to JSON word timings.
2. Group words into pages with `createTikTokStyleCaptions`.
3. Render each page in a `<Sequence>` from its start time (`ms / 1000 * fps`),
   highlighting the active word.

Keep captions in the lower-middle third, 50-70 px at 1080 wide, with a solid or
outlined background for contrast.
