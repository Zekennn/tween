import React from "react";
import {AbsoluteFill, Easing, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import {loadFont} from "@remotion/google-fonts/Inter";

const {fontFamily} = loadFont("normal", {weights: ["800"], subsets: ["latin"]});

// Same shape as `Caption` from @remotion/captions, so transcripts can be passed straight in (extra fields are ignored).
export type CaptionWord = {text: string; startMs: number; endMs: number};

export type WordCaptionsProps = {
  video: string;           // video in public/, e.g. "talk.mp4". Empty string = placeholder background.
  captions: CaptionWord[]; // one entry per word, in order
  y: number;               // vertical centre of the caption, 0 = top, 1 = bottom. 0.5 = the seam of a split screen.
  color: string;
  box: string;             // caption box colour; use a see-through rgba so the video shows through
  background: string;      // shown behind the video and as the placeholder
};

const word = (text: string, startMs: number, endMs: number): CaptionWord => ({text, startMs, endMs});

export const wordCaptionsDefaults: WordCaptionsProps = {
  video: "",
  captions: [
    word("Here's", 0, 320),
    word("how", 320, 560),
    word("to", 560, 720),
    word("turn", 720, 1000),
    word("one", 1000, 1260),
    word("prompt", 1260, 1640),
    word("into", 1640, 1900),
    word("a", 1900, 2020),
    word("full", 2020, 2300),
    word("motion", 2300, 2640),
    word("graphic", 2640, 3200),
  ],
  y: 0.5,
  color: "#FFFFFF",
  box: "rgba(28,28,32,0.72)",
  background: "#101014",
};

const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const snapOut = Easing.bezier(0.22, 1, 0.36, 1);

// Creator-style captions: one word at a time in a bold sans on a see-through box, each word pops in
// over 4 frames and stays until the next word starts (or 0.5 s after it ends in a pause), over full-bleed footage with a slow push-in.
export const WordCaptions: React.FC<WordCaptionsProps> = ({video, captions, y, color, box, background}) => {
  const frame = useCurrentFrame();
  const {fps, width, height, durationInFrames} = useVideoConfig();
  const unit = Math.min(width, height) / 1080;
  const isVertical = height > width;

  const ms = (frame / fps) * 1000;
  // Hold each word until the next one starts (transcripts leave small gaps), but clear it in long pauses.
  const idx = captions.findIndex((c, i) => ms >= c.startMs && (i === captions.length - 1 || ms < captions[i + 1].startMs));
  const active = idx >= 0 && ms < captions[idx].endMs + 500 ? captions[idx] : undefined;
  const local = active ? frame - (active.startMs / 1000) * fps : 0;
  // Starts part-way so a word is already visible on its first frame (short words may last only 3-4 frames).
  const pop = interpolate(local, [0, 4], [0.4, 1], {...clamp, easing: snapOut});

  const push = interpolate(frame, [0, durationInFrames], [1, 1.06], clamp);
  // Keep the caption out of the edges, and above the bottom 22% that app buttons cover on 9:16.
  const cy = height * Math.min(Math.max(y, 0.08), isVertical ? 0.78 : 0.9);

  return (
    <AbsoluteFill style={{background, overflow: "hidden"}}>
      <AbsoluteFill style={{transform: `scale(${push})`}}>
        {video ? (
          <OffthreadVideo src={staticFile(video)} style={{width: "100%", height: "100%", objectFit: "cover"}} />
        ) : (
          <AbsoluteFill style={{background: `radial-gradient(circle at 50% 35%, #2C2C38, ${background} 70%)`}} />
        )}
      </AbsoluteFill>
      {active ? (
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            top: cy,
            display: "flex",
            justifyContent: "center",
            transform: "translateY(-50%)",
          }}
        >
          <div
            style={{
              fontFamily,
              fontWeight: 800,
              fontSize: 64 * unit,
              lineHeight: 1.1,
              letterSpacing: "-0.01em",
              color,
              background: box,
              padding: "0.08em 0.3em 0.12em",
              borderRadius: "0.14em",
              whiteSpace: "nowrap",
              opacity: Math.min(1, pop * 2),
              transform: `scale(${0.85 + 0.15 * pop})`,
            }}
          >
            {active.text.trim()}
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// Composition length helper: until the last word ends, plus a short tail.
export const wordCaptionsDuration = (p: WordCaptionsProps, fps: number) =>
  Math.ceil((Math.max(0, ...p.captions.map((c) => c.endMs)) / 1000) * fps) + 15;
