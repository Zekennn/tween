import React from "react";
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";

export type TitleRevealProps = {
  title: string;
  subtitle: string;
  background: string;
  color: string;
  accent: string;
};

export const titleRevealDefaults: TitleRevealProps = {
  title: "Build Something Bold",
  subtitle: "A Tween title reveal",
  background: "#0B0D17",
  color: "#FFFFFF",
  accent: "#5B8CFF",
};

const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;

// Words rise from behind a mask one by one, an accent line grows, subtitle fades in, all exit together.
export const TitleReveal: React.FC<TitleRevealProps> = ({title, subtitle, background, color, accent}) => {
  const frame = useCurrentFrame();
  const {fps, width, height, durationInFrames} = useVideoConfig();
  const unit = Math.min(width, height) / 1080;

  const words = title.split(" ");
  const lineP = interpolate(frame, [10, 35], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const subP = interpolate(frame, [12 + words.length * 4, 32 + words.length * 4], [0, 1], {
    ...clamp,
    easing: Easing.out(Easing.cubic),
  });
  const exit = interpolate(frame, [durationInFrames - 18, durationInFrames - 2], [0, 1], {
    ...clamp,
    easing: Easing.in(Easing.cubic),
  });

  return (
    <AbsoluteFill
      style={{
        background: `radial-gradient(circle at 30% 20%, ${accent}22, transparent 55%), ${background}`,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Inter, system-ui, sans-serif",
      }}
    >
      <div style={{opacity: 1 - exit, transform: `translateY(${-exit * 40 * unit}px)`, textAlign: "center"}}>
        <div
          style={{
            fontSize: 140 * unit,
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
            color,
            padding: `0 ${80 * unit}px`,
          }}
        >
          {words.map((word, i) => {
            const p = spring({frame: frame - i * 4, fps, config: {damping: 200}});
            return (
              <span key={i} style={{display: "inline-block", overflow: "hidden", verticalAlign: "bottom"}}>
                <span style={{display: "inline-block", transform: `translateY(${(1 - p) * 110}%)`}}>
                  {word}
                  {i < words.length - 1 ? " " : ""}
                </span>
              </span>
            );
          })}
        </div>
        <div
          style={{
            height: 8 * unit,
            width: 220 * unit * lineP,
            background: accent,
            borderRadius: 999,
            margin: `${36 * unit}px auto`,
          }}
        />
        <div
          style={{
            fontSize: 48 * unit,
            fontWeight: 500,
            color,
            opacity: subP * 0.75,
            transform: `translateY(${(1 - subP) * 24 * unit}px)`,
          }}
        >
          {subtitle}
        </div>
      </div>
    </AbsoluteFill>
  );
};
