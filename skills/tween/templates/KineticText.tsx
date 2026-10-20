import React from "react";
import {AbsoluteFill, Easing, Sequence, interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";

export type KineticTextProps = {
  lines: string[];        // each line gets its own beat
  framesPerLine: number;  // how long each beat lasts
  background: string;
  color: string;
  accent: string;         // colour for words wrapped in *asterisks*
};

export const kineticTextDefaults: KineticTextProps = {
  lines: ["Stop scrolling.", "Start *building*.", "Ship it *today*."],
  framesPerLine: 45,
  background: "#FFD23F",
  color: "#111111",
  accent: "#E63946",
};

const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;

const Line: React.FC<{text: string; color: string; accent: string; length: number}> = ({text, color, accent, length}) => {
  const frame = useCurrentFrame(); // starts at 0 inside each Sequence
  const {fps, width, height} = useVideoConfig();
  const unit = Math.min(width, height) / 1080;
  const words = text.split(" ");

  const out = interpolate(frame, [length - 8, length], [0, 1], {...clamp, easing: Easing.in(Easing.cubic)});

  return (
    <AbsoluteFill style={{justifyContent: "center", alignItems: "center", padding: 80 * unit}}>
      <div
        style={{
          fontSize: 150 * unit,
          fontWeight: 900,
          lineHeight: 1,
          letterSpacing: "-0.04em",
          textAlign: "center",
          fontFamily: "Inter, system-ui, sans-serif",
          transform: `scale(${1 - out * 0.15})`,
          opacity: 1 - out,
        }}
      >
        {words.map((raw, i) => {
          const emphasis = raw.startsWith("*") && raw.replace(/[.,!?]$/, "").endsWith("*");
          const word = raw.replace(/\*/g, "");
          const p = spring({frame: frame - i * 3, fps, config: {damping: 11, stiffness: 160, mass: 0.6}});
          return (
            <span
              key={i}
              style={{
                display: "inline-block",
                marginRight: "0.22em",
                color: emphasis ? accent : color,
                transform: `translateY(${(1 - p) * 80 * unit}px) rotate(${(1 - p) * (i % 2 ? 6 : -6)}deg)`,
                opacity: Math.min(1, p * 2),
              }}
            >
              {word}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// Punchy social-style typography: one line per beat, words spring in, emphasised words in accent colour.
export const KineticText: React.FC<KineticTextProps> = ({lines, framesPerLine, background, color, accent}) => {
  return (
    <AbsoluteFill style={{background}}>
      {lines.map((line, i) => (
        <Sequence key={i} from={i * framesPerLine} durationInFrames={framesPerLine}>
          <Line text={line} color={color} accent={accent} length={framesPerLine} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

// Composition length helper: lines.length * framesPerLine
export const kineticTextDuration = (p: KineticTextProps) => p.lines.length * p.framesPerLine;
