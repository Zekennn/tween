import React from "react";
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from "remotion";

export type BentoTile = {
  value: string;   // "2x", "38%", "$1.2B", "24 hrs", or plain words. Leading number counts up.
  label: string;   // short line under the value
};

export type AppleBentoProps = {
  title: string;        // headline above the grid. Empty = none.
  tiles: BentoTile[];   // up to 5. Tile 0 is the large hero tile with gradient text.
  background: string;
  tile: string;
  color: string;
  muted: string;
  gradient: [string, string];
};

export const appleBentoDefaults: AppleBentoProps = {
  title: "Built for speed.",
  tiles: [
    {value: "3x", label: "faster builds"},
    {value: "40%", label: "less memory"},
    {value: "22 hrs", label: "battery life"},
    {value: "120 Hz", label: "display"},
    {value: "1.2M", label: "happy users"},
  ],
  background: "#000000",
  tile: "#1C1C1E",
  color: "#F5F5F7",
  muted: "#86868B",
  gradient: ["#5AC8FA", "#34C759"],
};

const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const appleOut = Easing.bezier(0.16, 1, 0.3, 1);
const appleInOut = Easing.bezier(0.65, 0, 0.35, 1);
const appleIn = Easing.bezier(0.7, 0, 0.84, 0);

// Split "$1.2B" into {prefix: "$", num: 1.2, decimals: 1, suffix: "B"} so the number can count up.
const parseValue = (value: string) => {
  const m = value.match(/^([^\d]*)(\d[\d,]*(?:\.\d+)?)(.*)$/);
  if (!m) return null;
  const raw = m[2].replace(/,/g, "");
  const decimals = raw.includes(".") ? raw.split(".")[1].length : 0;
  return {prefix: m[1], num: parseFloat(raw), decimals, suffix: m[3], grouped: m[2].includes(",")};
};

const CountUp: React.FC<{value: string; progress: number}> = ({value, progress}) => {
  const parsed = parseValue(value);
  if (!parsed) return <>{value}</>;
  const n = parsed.num * progress;
  const text = parsed.grouped
    ? n.toLocaleString("en-US", {minimumFractionDigits: parsed.decimals, maximumFractionDigits: parsed.decimals})
    : n.toFixed(parsed.decimals);
  return (
    <>
      {parsed.prefix}
      {text}
      {parsed.suffix}
    </>
  );
};

// Keynote "by the numbers" slide: title blurs in, rounded tiles blur in one by one,
// values count up, the hero tile uses gradient text, the camera drifts in slowly.
export const AppleBento: React.FC<AppleBentoProps> = ({title, tiles, background, tile, color, muted, gradient}) => {
  const frame = useCurrentFrame();
  const {width, height, durationInFrames} = useVideoConfig();
  const unit = Math.min(width, height) / 1080;
  const isWide = width > height * 1.2;
  const items = tiles.slice(0, 5);

  const push = interpolate(frame, [0, durationInFrames], [1, 1.03], {...clamp, easing: appleInOut});
  const exit = interpolate(frame, [durationInFrames - 18, durationInFrames - 2], [0, 1], {
    ...clamp,
    easing: appleIn,
  });
  const enter = (start: number, len = 30) =>
    interpolate(frame, [start, start + len], [0, 1], {...clamp, easing: appleOut});

  const titleStart = 6;
  const gridStart = title ? 20 : 8;

  // Wide: 4 columns x 2 rows, hero tile spans 2x2. Tall/square: 2 columns, hero spans the full first row.
  const columns = isWide ? 4 : 2;
  const gap = 20 * unit;
  const pad = isWide ? width * 0.07 : width * 0.08;
  const heroArea = (i: number): React.CSSProperties =>
    i === 0 ? (isWide ? {gridColumn: "1 / span 2", gridRow: "1 / span 2"} : {gridColumn: "1 / span 2"}) : {};

  return (
    <AbsoluteFill style={{background, fontFamily: "Inter, system-ui, sans-serif", overflow: "hidden"}}>
      <AbsoluteFill
        style={{
          padding: `${height * (isWide ? 0.09 : 0.1)}px ${pad}px ${height * (isWide ? 0.09 : 0.16)}px`,
          display: "flex",
          flexDirection: "column",
          gap: 44 * unit,
          transform: `scale(${push})`,
          opacity: 1 - exit,
          filter: `blur(${exit * 12 * unit}px)`,
        }}
      >
        {title ? (
          <div
            style={{
              fontSize: (isWide ? 96 : 104) * unit,
              fontWeight: 700,
              letterSpacing: "-0.045em",
              lineHeight: 1.02,
              color,
              textAlign: isWide ? "left" : "center",
              opacity: enter(titleStart),
              filter: `blur(${(1 - enter(titleStart)) * 20 * unit}px)`,
              transform: `translateY(${(1 - enter(titleStart)) * 36 * unit}px)`,
            }}
          >
            {title}
          </div>
        ) : null}
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: `repeat(${columns}, 1fr)`,
            gridAutoRows: "1fr",
            gap,
            minHeight: 0,
          }}
        >
          {items.map((t, i) => {
            const p = enter(gridStart + i * 5);
            const count = interpolate(frame, [gridStart + i * 5 + 6, gridStart + i * 5 + 50], [0, 1], {
              ...clamp,
              easing: appleOut,
            });
            const hero = i === 0;
            const valueSize = (hero ? (isWide ? 200 : 150) : isWide ? 84 : 76) * unit;
            return (
              <div
                key={i}
                style={{
                  ...heroArea(i),
                  background: tile,
                  borderRadius: 28 * unit,
                  padding: `${(hero ? 44 : 30) * unit}px`,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "flex-end",
                  overflow: "hidden",
                  position: "relative",
                  opacity: p,
                  filter: `blur(${(1 - p) * 18 * unit}px)`,
                  transform: `translateY(${(1 - p) * 40 * unit}px) scale(${1.03 - p * 0.03})`,
                }}
              >
                {hero ? (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: `radial-gradient(circle at 20% 110%, ${gradient[0]}33, transparent 60%)`,
                    }}
                  />
                ) : null}
                <div
                  style={{
                    position: "relative",
                    fontSize: valueSize,
                    fontWeight: 700,
                    letterSpacing: "-0.05em",
                    lineHeight: 1,
                    fontVariantNumeric: "tabular-nums",
                    whiteSpace: "nowrap",
                    paddingBottom: 0.06 * valueSize,
                    ...(hero
                      ? {
                          backgroundImage: `linear-gradient(90deg, ${gradient[0]}, ${gradient[1]})`,
                          WebkitBackgroundClip: "text",
                          backgroundClip: "text",
                          color: "transparent",
                        }
                      : {color}),
                  }}
                >
                  <CountUp value={t.value} progress={count} />
                </div>
                <div
                  style={{
                    position: "relative",
                    fontSize: (hero ? 40 : 30) * unit,
                    fontWeight: 600,
                    letterSpacing: "-0.01em",
                    color: muted,
                    marginTop: 8 * unit,
                  }}
                >
                  {t.label}
                </div>
              </div>
            );
          })}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
