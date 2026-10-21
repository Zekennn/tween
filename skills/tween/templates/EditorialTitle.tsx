import React, {useId} from "react";
import {AbsoluteFill, Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from "remotion";
import {loadFont as loadDisplay} from "@remotion/google-fonts/ArchivoBlack";
import {loadFont as loadMono} from "@remotion/google-fonts/JetBrainsMono";

const {fontFamily: display} = loadDisplay("normal", {weights: ["400"], subsets: ["latin"]});
const {fontFamily: mono} = loadMono("normal", {weights: ["500"], subsets: ["latin"]});

export type EditorialTitleProps = {
  lines: string[];    // 1-4 short lines, set in capitals. End the last line with "." to get the dropping accent dot.
  subtitle: string;   // small mono line typed on underneath. Empty string = none.
  background: string;
  color: string;
  accent: string;
};

export const editorialTitleDefaults: EditorialTitleProps = {
  lines: ["I make", "things", "move."],
  subtitle: "Motion designer — Showreel 2026",
  background: "#F0ECE1",
  color: "#14130E",
  accent: "#FF4F1F",
};

const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const snapOut = Easing.bezier(0.22, 1, 0.36, 1);
const snapIn = Easing.bezier(0.64, 0, 0.78, 0);

// Vertical motion blur: an SVG blur whose strength follows how fast the element moves this frame.
const VBlur: React.FC<{id: string; amount: number}> = ({id, amount}) => (
  <svg width={0} height={0} style={{position: "absolute"}}>
    <filter id={id} x="-5%" y="-60%" width="110%" height="220%">
      <feGaussianBlur stdDeviation={`0 ${amount}`} />
    </filter>
  </svg>
);

// Editorial showreel title: heavy capitals rise word by word out of a mask with motion blur,
// the full stop drops in as an accent dot and bounces, a mono subtitle types on, words exit upward.
export const EditorialTitle: React.FC<EditorialTitleProps> = ({lines, subtitle, background, color, accent}) => {
  const frame = useCurrentFrame();
  const {fps, width, height, durationInFrames} = useVideoConfig();
  const unit = Math.min(width, height) / 1080;
  const isVertical = height > width;
  const uid = useId().replace(/:/g, "");

  const dotted = lines.length > 0 && lines.slice(0, 4)[Math.min(lines.length, 4) - 1].trim().endsWith(".");
  const rows = lines.slice(0, 4).map((l, i, all) => {
    const text = dotted && i === all.length - 1 ? l.trim().slice(0, -1) : l.trim();
    return text.toUpperCase().split(/\s+/).filter(Boolean);
  });
  const total = rows.reduce((n, r) => n + r.length, 0);

  // Beats (30 fps): a word every 7 frames (tighter for long titles), each lands in 12; dot and subtitle follow.
  const stagger = Math.min(7, 60 / Math.max(total, 1));
  const wordStart = (k: number) => 4 + k * stagger;
  const lastLand = wordStart(Math.max(total - 1, 0)) + 12;
  const dotStart = lastLand - 2;
  const subStart = lastLand + 4;
  const exitStart = durationInFrames - 12 - total;

  // Percent of the line height the word sits below its resting place (+) or above it (-).
  const wordY = (f: number, k: number) => {
    const inP = interpolate(f, [wordStart(k), wordStart(k) + 12], [0, 1], {...clamp, easing: snapOut});
    const outP = interpolate(f, [exitStart + k, exitStart + k + 10], [0, 1], {...clamp, easing: snapIn});
    return (1 - inP) * 105 - outP * 105;
  };

  const safeL = width * 0.08;
  const safeR = width * (isVertical ? 0.12 : 0.08);
  const indent = 0.12; // em, each line steps right a little
  const longest = Math.max(...rows.map((r, i) => r.join(" ").length + i * indent + (dotted && i === rows.length - 1 ? 0.3 : 0)), 1);
  // Archivo Black capitals average ~0.7em wide; fit the longest line inside the safe area.
  const fontSize = Math.min(240 * unit, (width - safeL - safeR) / (longest * 0.7));
  const subSize = Math.max(28 * unit, fontSize * 0.17);
  const lineH = fontSize * 0.98;

  const dotP = frame < dotStart ? 0 : spring({frame: frame - dotStart, fps, config: {damping: 9, stiffness: 170, mass: 0.6}});
  const dotPrev = frame - 1 < dotStart ? 0 : spring({frame: frame - 1 - dotStart, fps, config: {damping: 9, stiffness: 170, mass: 0.6}});
  const dropDist = height * 0.4;
  const dotOut = interpolate(frame, [exitStart + total, exitStart + total + 8], [1, 0], {...clamp, easing: snapIn});

  const typed = Math.floor(interpolate(frame, [subStart, subStart + Math.max(1, subtitle.length / 1.2)], [0, subtitle.length], clamp));
  const subOut = interpolate(frame, [exitStart, exitStart + 8], [1, 0], {...clamp, easing: snapIn});

  let k = -1;
  return (
    <AbsoluteFill style={{background, overflow: "hidden"}}>
      <AbsoluteFill
        style={{
          justifyContent: "center",
          alignItems: "flex-start",
          paddingLeft: safeL,
          paddingRight: safeR,
          paddingBottom: isVertical ? height * 0.12 : 0,
        }}
      >
        <div style={{fontFamily: display, fontSize, lineHeight: 0.98, letterSpacing: "-0.02em", color}}>
          {rows.map((row, i) => (
            <div key={i} style={{whiteSpace: "nowrap", marginLeft: `${i * indent}em`, height: lineH}}>
              {row.map((word, j) => {
                k += 1;
                const y = wordY(frame, k);
                const blur = Math.min(Math.abs(y - wordY(frame - 1, k)) * lineH * 0.0035, 40 * unit);
                const id = `${uid}-w${k}`;
                return (
                  <span
                    key={j}
                    style={{
                      display: "inline-block",
                      overflow: "hidden",
                      verticalAlign: "top",
                      height: lineH,
                      marginRight: j < row.length - 1 ? "0.24em" : 0,
                    }}
                  >
                    {blur > 0.3 ? <VBlur id={id} amount={blur} /> : null}
                    <span
                      style={{
                        display: "inline-block",
                        transform: `translateY(${y}%)`,
                        filter: blur > 0.3 ? `url(#${id})` : undefined,
                      }}
                    >
                      {word}
                    </span>
                  </span>
                );
              })}
              {dotted && i === rows.length - 1 ? (
                <span
                  style={{
                    display: "inline-block",
                    width: "0.2em",
                    height: "0.2em",
                    marginLeft: "0.05em",
                    borderRadius: "50%",
                    background: accent,
                    verticalAlign: "top",
                    marginTop: lineH * 0.62,
                    opacity: frame < dotStart ? 0 : 1,
                    transform: `translateY(${-(1 - dotP) * dropDist}px) scale(${dotOut}) scaleY(${
                      1 + Math.min(Math.abs(dotP - dotPrev) * 6, 0.8)
                    })`,
                  }}
                />
              ) : null}
            </div>
          ))}
          {subtitle ? (
            <div
              style={{
                fontFamily: mono,
                fontSize: subSize,
                lineHeight: 1.35,
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                marginTop: 0.18 * fontSize,
                marginLeft: `${0.04 * fontSize}px`,
                maxWidth: Math.max(fontSize * 4, 520 * unit),
                minHeight: subSize * 1.35,
                opacity: subOut,
              }}
            >
              {subtitle.slice(0, typed)}
            </div>
          ) : null}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
