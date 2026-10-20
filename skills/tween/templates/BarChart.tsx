import React from "react";
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";

export type Bar = {label: string; value: number};

export type BarChartProps = {
  title: string;
  unitLabel: string;
  bars: Bar[];
  background: string;
  color: string;
  accent: string;
  highlightIndex: number; // -1 for none
};

export const barChartDefaults: BarChartProps = {
  title: "Constructor points",
  unitLabel: "",
  bars: [
    {label: "MCL", value: 612},
    {label: "FER", value: 498},
    {label: "RED", value: 455},
    {label: "MER", value: 389},
    {label: "AST", value: 164},
  ],
  background: "#0F1115",
  color: "#FFFFFF",
  accent: "#F59E0B",
  highlightIndex: 0,
};

const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;

// Animated vertical bar chart: axis line draws, bars grow staggered with values counting, one bar highlighted.
export const BarChart: React.FC<BarChartProps> = ({title, unitLabel, bars, background, color, accent, highlightIndex}) => {
  const frame = useCurrentFrame();
  const {fps, width, height, durationInFrames} = useVideoConfig();
  const unit = Math.min(width, height) / 1080;

  const chartW = width * 0.75;
  const chartH = height * 0.5;
  const left = (width - chartW) / 2;
  const baseY = height * 0.78;
  const max = Math.max(...bars.map((b) => b.value), 1);
  const slot = chartW / bars.length;
  const barW = slot * 0.6;

  const titleP = spring({frame, fps, config: {damping: 200}});
  const axisP = interpolate(frame, [5, 25], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const exit = interpolate(frame, [durationInFrames - 15, durationInFrames - 1], [1, 0], clamp);

  return (
    <AbsoluteFill style={{background, opacity: exit, fontFamily: "Inter, system-ui, sans-serif"}}>
      <div
        style={{
          position: "absolute",
          top: height * 0.1,
          width: "100%",
          textAlign: "center",
          color,
          fontSize: 64 * unit,
          fontWeight: 700,
          opacity: titleP,
          transform: `translateY(${(1 - titleP) * -30 * unit}px)`,
        }}
      >
        {title}
      </div>
      <div
        style={{
          position: "absolute",
          left,
          top: baseY,
          height: 3 * unit,
          width: chartW * axisP,
          background: color,
          opacity: 0.4,
        }}
      />
      {bars.map((bar, i) => {
        const start = 18 + i * 5;
        const grow = spring({frame: frame - start, fps, config: {damping: 18, stiffness: 90}});
        const h = (bar.value / max) * chartH * grow;
        const shown = interpolate(frame, [start, start + 30], [0, bar.value], {...clamp, easing: Easing.out(Easing.quad)});
        const highlighted = i === highlightIndex;
        const x = left + slot * i + (slot - barW) / 2;
        return (
          <React.Fragment key={i}>
            <div
              style={{
                position: "absolute",
                left: x,
                top: baseY - h,
                width: barW,
                height: h,
                borderRadius: `${12 * unit}px ${12 * unit}px 0 0`,
                background: highlighted ? accent : `${color}33`,
              }}
            />
            <div
              style={{
                position: "absolute",
                left: x,
                width: barW,
                top: baseY - h - 60 * unit,
                textAlign: "center",
                color: highlighted ? accent : color,
                fontSize: 36 * unit,
                fontWeight: 700,
                fontVariantNumeric: "tabular-nums",
                opacity: grow,
              }}
            >
              {shown.toFixed(Number.isInteger(bar.value) ? 0 : 1)}
              {unitLabel}
            </div>
            <div
              style={{
                position: "absolute",
                left: x,
                width: barW,
                top: baseY + 20 * unit,
                textAlign: "center",
                color,
                opacity: 0.7,
                fontSize: 32 * unit,
                fontWeight: 600,
              }}
            >
              {bar.label}
            </div>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
