import React, {useId} from "react";
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from "remotion";
import {loadFont as loadDisplay} from "@remotion/google-fonts/ArchivoBlack";
import {loadFont as loadMono} from "@remotion/google-fonts/JetBrainsMono";

const {fontFamily: display} = loadDisplay("normal", {weights: ["400"], subsets: ["latin"]});
const {fontFamily: mono} = loadMono("normal", {weights: ["500"], subsets: ["latin"]});

export type EditorialStat = {
  value: string; // "900", "1,440", "98%", "$2M". Each digit rolls like a slot machine, other characters slide in.
  label: string; // short mono label on the right
};

export type EditorialStatsProps = {
  stats: EditorialStat[]; // 1-5 rows
  accentIndex: number;    // row whose number is drawn in the accent colour. -1 = none.
  background: string;
  color: string;
  accent: string;
};

export const editorialStatsDefaults: EditorialStatsProps = {
  stats: [
    {value: "900", label: "Frames"},
    {value: "60", label: "FPS"},
    {value: "0", label: "Keyframes"},
    {value: "1", label: "Function"},
  ],
  accentIndex: 2,
  background: "#F0ECE1",
  color: "#14130E",
  accent: "#FF4F1F",
};

const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const snapOut = Easing.bezier(0.22, 1, 0.36, 1);
const snapIn = Easing.bezier(0.64, 0, 0.78, 0);

const VBlur: React.FC<{id: string; amount: number}> = ({id, amount}) => (
  <svg width={0} height={0} style={{position: "absolute"}}>
    <filter id={id} x="-5%" y="-20%" width="110%" height="140%">
      <feGaussianBlur stdDeviation={`0 ${amount}`} />
    </filter>
  </svg>
);

// One digit column: a strip "blank, 0-9, 0-digit" scrolls up so the digit spins once and lands.
const Roller: React.FC<{digit: number; p: number; prev: number; size: number; id: string; maxBlur: number}> = ({
  digit,
  p,
  prev,
  size,
  id,
  maxBlur,
}) => {
  const steps = 11 + digit;
  const blur = Math.min(Math.abs(p - prev) * steps * size * 0.3, maxBlur);
  return (
    <span style={{display: "inline-block", overflow: "hidden", height: "1em", verticalAlign: "top"}}>
      {blur > 0.3 ? <VBlur id={id} amount={blur} /> : null}
      <span
        style={{
          display: "block",
          transform: `translateY(${-p * steps}em)`,
          filter: blur > 0.3 ? `url(#${id})` : undefined,
        }}
      >
        {new Array(steps + 1).fill(0).map((_, n) => (
          <span key={n} style={{display: "block", height: "1em", textAlign: "center"}}>
            {n === 0 ? " " : (n - 1) % 10}
          </span>
        ))}
      </span>
    </span>
  );
};

// Editorial "by the numbers": rows of huge numbers with mono labels on hairline rules.
// Rules draw left to right, digits roll in with motion blur, labels type on, rows exit upward.
export const EditorialStats: React.FC<EditorialStatsProps> = ({stats, accentIndex, background, color, accent}) => {
  const frame = useCurrentFrame();
  const {width, height, durationInFrames} = useVideoConfig();
  const unit = Math.min(width, height) / 1080;
  const isVertical = height > width;
  const uid = useId().replace(/:/g, "");
  const rows = stats.slice(0, 5);

  const safeL = width * 0.08;
  const safeR = width * (isVertical ? 0.12 : 0.08);
  const blockW = Math.min(width - safeL - safeR, 1400 * unit);
  const longest = Math.max(...rows.map((s) => s.value.length), 1);
  const availH = height * (isVertical ? 0.6 : 0.78);
  // Number column takes ~half the row; Archivo Black digits are ~0.75em wide.
  const size = Math.min(170 * unit, availH / (rows.length * 1.4), (blockW * 0.5) / (longest * 0.75));
  const labelSize = Math.max(28 * unit, Math.min(34 * unit, size * 0.3));
  const rule = Math.max(2, 3 * unit);

  const rowStart = (i: number) => 6 + i * 10;
  const exitStart = durationInFrames - 14 - rows.length * 2;
  const roll = (f: number, start: number) => interpolate(f, [start, start + 22], [0, 1], {...clamp, easing: snapOut});

  return (
    <AbsoluteFill style={{background, justifyContent: "center", alignItems: "center", paddingBottom: isVertical ? height * 0.1 : 0}}>
      <div style={{width: blockW, color}}>
        {rows.map((stat, i) => {
          const s = rowStart(i);
          const ruleIn = interpolate(frame, [s, s + 14], [0, 1], {...clamp, easing: snapOut});
          const out = interpolate(frame, [exitStart + i * 2, exitStart + i * 2 + 10], [0, 1], {...clamp, easing: snapIn});
          const typed = Math.floor(interpolate(frame, [s + 6, s + 6 + Math.max(1, stat.label.length)], [0, stat.label.length], clamp));
          const slide = roll(frame, s + 2);
          let digitIndex = -1;
          return (
            <div key={i} style={{position: "relative", marginBottom: size * 0.22}}>
              <div style={{overflow: "hidden", display: "flex", alignItems: "flex-end", paddingBottom: size * 0.1}}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "flex-end",
                    width: "50%",
                    transform: `translateY(${-out * 110}%)`,
                  }}
                >
                  <div
                    style={{
                      fontFamily: display,
                      fontSize: size,
                      lineHeight: 1,
                      height: size,
                      letterSpacing: "-0.03em",
                      color: i === accentIndex ? accent : color,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {stat.value.split("").map((ch, j) => {
                      if (/\d/.test(ch)) {
                        digitIndex += 1;
                        const start = s + 2 + digitIndex * 2;
                        return (
                          <Roller
                            key={j}
                            digit={Number(ch)}
                            p={roll(frame, start)}
                            prev={roll(frame - 1, start)}
                            size={size}
                            id={`${uid}-r${i}-${j}`}
                            maxBlur={30 * unit}
                          />
                        );
                      }
                      return (
                        <span key={j} style={{display: "inline-block", overflow: "hidden", height: "1em", verticalAlign: "top"}}>
                          <span style={{display: "inline-block", transform: `translateY(${(1 - slide) * 105}%)`}}>
                            {ch === " " ? " " : ch}
                          </span>
                        </span>
                      );
                    })}
                  </div>
                </div>
                <div
                  style={{
                    fontFamily: mono,
                    fontSize: labelSize,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    whiteSpace: "nowrap",
                    flex: 1,
                    minWidth: 0,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    paddingBottom: size * 0.04,
                    transform: `translateY(${-out * 300}%)`,
                  }}
                >
                  {stat.label.slice(0, typed)}
                </div>
              </div>
              <div
                style={{
                  height: rule,
                  background: color,
                  transform: `scaleX(${ruleIn * (1 - out)})`,
                  transformOrigin: out > 0 ? "right" : "left",
                }}
              />
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
