import React from "react";
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from "remotion";

export type AppleHeadlineProps = {
  eyebrow: string;        // small grey line above the headline. Empty string = none.
  lines: string[];        // 1-3 short lines. Each line blurs in on its own beat.
  highlight: number;      // index of the line drawn in gradient text. -1 = none.
  background: string;
  color: string;
  muted: string;
  gradient: [string, string];
};

export const appleHeadlineDefaults: AppleHeadlineProps = {
  eyebrow: "Introducing",
  lines: ["Faster.", "Lighter.", "Smarter than ever."],
  highlight: 2,
  background: "#000000",
  color: "#F5F5F7",
  muted: "#86868B",
  gradient: ["#2997FF", "#A970FF"],
};

const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const appleOut = Easing.bezier(0.16, 1, 0.3, 1);
const appleInOut = Easing.bezier(0.65, 0, 0.35, 1);
const appleIn = Easing.bezier(0.7, 0, 0.84, 0);

// Keynote-style headline: eyebrow and lines blur in one after another on a long ease-out,
// one line carries a slowly sweeping gradient, the camera pushes in, everything blurs out.
export const AppleHeadline: React.FC<AppleHeadlineProps> = ({
  eyebrow,
  lines,
  highlight,
  background,
  color,
  muted,
  gradient,
}) => {
  const frame = useCurrentFrame();
  const {width, height, durationInFrames} = useVideoConfig();
  const unit = Math.min(width, height) / 1080;
  const isVertical = height > width;

  const push = interpolate(frame, [0, durationInFrames], [1, 1.04], {...clamp, easing: appleInOut});
  const exit = interpolate(frame, [durationInFrames - 18, durationInFrames - 2], [0, 1], {
    ...clamp,
    easing: appleIn,
  });
  const sweep = interpolate(frame, [0, durationInFrames], [0, 100], clamp);
  const glow = interpolate(frame, [0, 40], [0, 1], {...clamp, easing: appleOut});

  const enter = (start: number) => interpolate(frame, [start, start + 32], [0, 1], {...clamp, easing: appleOut});
  const blurIn = (p: number, travel: number): React.CSSProperties => ({
    opacity: p,
    filter: `blur(${(1 - p) * 20 * unit}px)`,
    transform: `translateY(${(1 - p) * travel * unit}px) scale(${1.04 - p * 0.04})`,
  });

  const eyebrowStart = 8;
  const firstLine = eyebrow ? 16 : 8;
  const longest = Math.max(...lines.map((l) => l.length), 1);
  // Shrink the headline when lines are long so they never touch the frame edges.
  const maxSize = isVertical ? 150 : 180;
  const fitSize = ((width * 0.84) / (longest * 0.52)) / unit;
  const fontSize = Math.min(maxSize, fitSize) * unit;

  return (
    <AbsoluteFill style={{background, fontFamily: "Inter, system-ui, sans-serif", overflow: "hidden"}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse 60% 45% at 50% 55%, ${gradient[0]}26, transparent 70%)`,
          opacity: glow * (1 - exit),
        }}
      />
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          padding: `0 ${width * 0.08}px`,
          transform: `scale(${push})`,
        }}
      >
        <div
          style={{
            opacity: 1 - exit,
            filter: `blur(${exit * 14 * unit}px)`,
            transform: `translateY(${-exit * 20 * unit}px)`,
          }}
        >
          {eyebrow ? (
            <div
              style={{
                fontSize: 40 * unit,
                fontWeight: 600,
                color: muted,
                letterSpacing: "-0.01em",
                marginBottom: 28 * unit,
                ...blurIn(enter(eyebrowStart), 24),
              }}
            >
              {eyebrow}
            </div>
          ) : null}
          {lines.map((line, i) => {
            const p = enter(firstLine + i * 8);
            const isGradient = i === highlight;
            return (
              <div
                key={i}
                style={{
                  fontSize,
                  fontWeight: 700,
                  letterSpacing: "-0.045em",
                  lineHeight: 1.04,
                  color,
                  paddingBottom: 0.06 * fontSize, // room for descenders under background-clip text
                  ...blurIn(p, 44),
                }}
              >
                {isGradient ? (
                  <span
                    style={{
                      backgroundImage: `linear-gradient(90deg, ${gradient[0]}, ${gradient[1]}, ${gradient[0]})`,
                      backgroundSize: "200% 100%",
                      backgroundPosition: `${sweep}% 50%`,
                      WebkitBackgroundClip: "text",
                      backgroundClip: "text",
                      color: "transparent",
                    }}
                  >
                    {line}
                  </span>
                ) : (
                  line
                )}
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
