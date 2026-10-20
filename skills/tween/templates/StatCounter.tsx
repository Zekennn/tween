import React from "react";
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";

export type Stat = {value: number; prefix?: string; suffix?: string; label: string};

export type StatCounterProps = {
  heading: string;
  stats: Stat[];
  background: string;
  color: string;
  accent: string;
};

export const statCounterDefaults: StatCounterProps = {
  heading: "This year in numbers",
  stats: [
    {value: 12500, suffix: "+", label: "Users"},
    {value: 98, suffix: "%", label: "Uptime"},
    {value: 4.9, label: "Rating"},
  ],
  background: "#0E1116",
  color: "#FFFFFF",
  accent: "#22C55E",
};

const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;

const format = (n: number, target: number) => {
  const decimals = Number.isInteger(target) ? 0 : 1;
  return n.toLocaleString("en-US", {minimumFractionDigits: decimals, maximumFractionDigits: decimals});
};

// Heading drops in, stat cards pop in staggered, numbers count up with ease-out, cards exit together.
export const StatCounter: React.FC<StatCounterProps> = ({heading, stats, background, color, accent}) => {
  const frame = useCurrentFrame();
  const {fps, width, height, durationInFrames} = useVideoConfig();
  const unit = Math.min(width, height) / 1080;
  const vertical = height > width;

  const headP = spring({frame, fps, config: {damping: 200}});
  const exit = interpolate(frame, [durationInFrames - 15, durationInFrames - 1], [1, 0], clamp);

  return (
    <AbsoluteFill
      style={{
        background,
        justifyContent: "center",
        alignItems: "center",
        gap: 70 * unit,
        fontFamily: "Inter, system-ui, sans-serif",
        opacity: exit,
      }}
    >
      <div
        style={{
          fontSize: 64 * unit,
          fontWeight: 700,
          color,
          opacity: headP,
          transform: `translateY(${(1 - headP) * -40 * unit}px)`,
        }}
      >
        {heading}
      </div>
      <div style={{display: "flex", flexDirection: vertical ? "column" : "row", gap: 48 * unit}}>
        {stats.map((stat, i) => {
          const start = 12 + i * 8;
          const pop = spring({frame: frame - start, fps, config: {damping: 14, stiffness: 120}});
          const count = interpolate(frame, [start, start + 45], [0, stat.value], {
            ...clamp,
            easing: Easing.out(Easing.quad),
          });
          return (
            <div
              key={i}
              style={{
                minWidth: 420 * unit,
                padding: `${44 * unit}px ${36 * unit}px`,
                boxSizing: "border-box",
                borderRadius: 28 * unit,
                background: "rgba(255,255,255,0.05)",
                border: `2px solid ${accent}55`,
                textAlign: "center",
                transform: `scale(${0.6 + pop * 0.4})`,
                opacity: Math.min(1, pop * 1.5),
              }}
            >
              <div
                style={{
                  fontSize: 100 * unit,
                  whiteSpace: "nowrap",
                  fontWeight: 800,
                  color: accent,
                  fontVariantNumeric: "tabular-nums",
                  letterSpacing: "-0.03em",
                }}
              >
                {stat.prefix ?? ""}
                {format(count, stat.value)}
                {stat.suffix ?? ""}
              </div>
              <div style={{fontSize: 38 * unit, color, opacity: 0.7, marginTop: 8 * unit}}>{stat.label}</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
