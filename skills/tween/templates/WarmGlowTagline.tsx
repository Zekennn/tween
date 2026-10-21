import React from "react";
import {AbsoluteFill, Easing, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import {loadFont} from "@remotion/google-fonts/PlayfairDisplay";

const {fontFamily} = loadFont("italic", {weights: ["700"], subsets: ["latin"]});

export type WarmGlowTaglineProps = {
  lines: string[];     // 1-2 short lines in italic serif. The last line is drawn in the accent colour.
  images: string[];    // up to 4 images in public/ shown on the floating cards. Empty = placeholder cards.
  background: string;  // edge colour of the vignette
  glow: string;        // warm light behind the burst
  color: string;       // burst rays and first line
  accent: string;      // burst halo and last line
  card: string;        // light placeholder card
  cardDark: string;    // dark placeholder card
};

export const warmGlowTaglineDefaults: WarmGlowTaglineProps = {
  lines: ["sketch in.", "motion out."],
  images: [],
  background: "#0D0705",
  glow: "#7A3D24",
  color: "#FFF4E8",
  accent: "#F2A27A",
  card: "#F4EFE6",
  cardDark: "#221713",
};

const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const warmOut = Easing.bezier(0.25, 1, 0.5, 1);
const warmIn = Easing.bezier(0.5, 0, 0.75, 0);

type Pt = [number, number];
const lerp = (a: Pt, b: Pt, t: number): Pt => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];

// Warm studio end card: a glowing starburst grows and turns slowly, dashed connectors reach out to
// floating cards that pop in, then an italic serif tagline arrives letter by letter out of a blur.
export const WarmGlowTagline: React.FC<WarmGlowTaglineProps> = ({
  lines,
  images,
  background,
  glow,
  color,
  accent,
  card,
  cardDark,
}) => {
  const frame = useCurrentFrame();
  const {fps, width, height, durationInFrames} = useVideoConfig();
  const unit = Math.min(width, height) / 1080;
  const isVertical = height > width;
  const text = lines.slice(0, 2);

  const center: Pt = [width / 2, height * (isVertical ? 0.38 : 0.34)];
  const R = 120 * unit;
  const exit = interpolate(frame, [durationInFrames - 16, durationInFrames - 2], [0, 1], {...clamp, easing: warmIn});

  // Cards sit left and right of the burst; dark ones on the left, light ones on the right.
  const spread = isVertical ? width * 0.33 : Math.min(width * 0.24, 460 * unit);
  const cardSlots: Pt[] = [
    [-spread, -R * 0.55],
    [-spread * 0.9, R * 0.75],
    [spread, -R * 0.85],
    [spread * 0.95, R * 0.45],
  ];
  const cardW = 120 * unit;
  const cardH = 150 * unit;

  const rays = 18;
  const spin = frame * 0.25;
  const pulse = 0.88 + 0.12 * Math.sin(frame / 9);

  // Tagline: fit the longest line, ~0.5em per character for bold italic serif.
  const longest = Math.max(...text.map((l) => l.length), 1);
  const fontSize = Math.min(124 * unit, (width * 0.84) / (longest * 0.5));
  const tagTop = center[1] + R * 1.45;
  let charIndex = 0;

  return (
    <AbsoluteFill style={{background, overflow: "hidden"}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(circle ${Math.max(width, height) * 0.55}px at ${center[0]}px ${center[1]}px, ${glow}, ${background})`,
          opacity: interpolate(frame, [0, 24], [0, 1], clamp) * (1 - exit * 0.6),
        }}
      />

      {/* Dashed connectors from the burst to each card, drawn outward and marching slowly */}
      <svg width={width} height={height} style={{position: "absolute", inset: 0, opacity: 1 - exit}}>
        {cardSlots.map((slot, i) => {
          const end: Pt = [center[0] + slot[0], center[1] + slot[1]];
          const mid = lerp(center, end, 0.5);
          const bend = (i % 2 === 0 ? 1 : -1) * 0.18;
          const ctrl: Pt = [mid[0] - (end[1] - center[1]) * bend, mid[1] + (end[0] - center[0]) * bend];
          const t = interpolate(frame, [8 + i * 4, 32 + i * 4], [0, 1], {...clamp, easing: warmOut});
          // Partial quadratic curve (de Casteljau): the first t of the way from the burst.
          const a = lerp(center, ctrl, t);
          const tip = lerp(a, lerp(ctrl, end, t), t);
          return (
            <path
              key={i}
              d={`M ${center[0]} ${center[1]} Q ${a[0]} ${a[1]} ${tip[0]} ${tip[1]}`}
              fill="none"
              stroke={color}
              strokeOpacity={0.4}
              strokeWidth={2 * unit}
              strokeDasharray={`${6 * unit} ${10 * unit}`}
              strokeDashoffset={-frame * 0.6 * unit}
            />
          );
        })}
      </svg>

      {/* Floating cards */}
      {cardSlots.map((slot, i) => {
        const p = spring({frame: frame - 14 - i * 5, fps, config: {damping: 12, stiffness: 150}});
        const float = Math.sin((frame + i * 23) / 22) * 6 * unit;
        const tilt = (random(`warm-card-tilt-${i}`) - 0.5) * 10;
        const dark = i < 2;
        const img = images[i];
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: center[0] + slot[0] - cardW / 2,
              top: center[1] + slot[1] - cardH / 2 + float,
              width: cardW,
              height: cardH,
              borderRadius: 8 * unit,
              overflow: "hidden",
              background: dark ? cardDark : card,
              boxShadow: `0 ${16 * unit}px ${40 * unit}px rgba(0,0,0,0.5)`,
              opacity: Math.min(1, p * 1.5) * (1 - exit),
              filter: `blur(${Math.max(0, 1 - p) * 8 * unit}px)`,
              transform: `rotate(${tilt}deg) scale(${(0.6 + 0.4 * p) * (1 - exit * 0.3)})`,
            }}
          >
            {img ? (
              <Img src={staticFile(img)} style={{width: "100%", height: "100%", objectFit: "cover"}} />
            ) : dark ? (
              <div
                style={{
                  position: "absolute",
                  left: "50%",
                  top: "42%",
                  width: cardW * 0.3,
                  height: cardW * 0.3,
                  marginLeft: -cardW * 0.15,
                  borderRadius: "50%",
                  background: accent,
                  boxShadow: `0 0 ${14 * unit}px ${accent}`,
                }}
              />
            ) : (
              <div style={{padding: cardW * 0.14, display: "flex", flexDirection: "column", gap: cardH * 0.07}}>
                {[0.9, 0.7, 0.85, 0.5, 0.75].map((w, j) => (
                  <div key={j} style={{height: 5 * unit, width: `${w * 100}%`, background: "rgba(0,0,0,0.18)", borderRadius: 3}} />
                ))}
              </div>
            )}
          </div>
        );
      })}

      {/* Starburst */}
      <svg
        width={width}
        height={height}
        style={{
          position: "absolute",
          inset: 0,
          overflow: "visible",
          filter: `drop-shadow(0 0 ${8 * unit}px ${accent}) drop-shadow(0 0 ${28 * unit * pulse}px ${accent})`,
          opacity: 1 - exit,
          transform: `scale(${1 + exit * 0.25})`,
          transformOrigin: `${center[0]}px ${center[1]}px`,
        }}
      >
        <g transform={`rotate(${spin} ${center[0]} ${center[1]})`}>
          {new Array(rays).fill(0).map((_, i) => {
            const a = (i / rays) * Math.PI * 2;
            const len = 0.6 + random(`warm-ray-${i}`) * 0.4;
            const g = spring({frame: frame - 4 - i * 0.6, fps, config: {damping: 15, stiffness: 110}});
            const r0 = R * 0.16;
            const r1 = r0 + (R * len - r0) * g;
            return (
              <line
                key={i}
                x1={center[0] + Math.cos(a) * r0}
                y1={center[1] + Math.sin(a) * r0}
                x2={center[0] + Math.cos(a) * r1}
                y2={center[1] + Math.sin(a) * r1}
                stroke={color}
                strokeWidth={7 * unit}
                strokeLinecap="round"
                opacity={g > 0.01 ? 1 : 0}
              />
            );
          })}
        </g>
      </svg>

      {/* Tagline */}
      <div
        style={{
          position: "absolute",
          top: tagTop,
          left: 0,
          right: 0,
          textAlign: "center",
          fontFamily,
          fontStyle: "italic",
          fontWeight: 700,
          fontSize,
          lineHeight: 1.08,
          letterSpacing: "-0.01em",
          opacity: 1 - exit,
          filter: `blur(${exit * 12 * unit}px)`,
        }}
      >
        {text.map((line, li) => (
          <div key={li} style={{color: li === text.length - 1 && text.length > 1 ? accent : color, whiteSpace: "pre"}}>
            {line.split("").map((ch, j) => {
              const start = 34 + charIndex++ * 1.2 + li * 6;
              const p = interpolate(frame, [start, start + 16], [0, 1], {...clamp, easing: warmOut});
              return (
                <span
                  key={j}
                  style={{
                    display: "inline-block",
                    opacity: p,
                    filter: `blur(${(1 - p) * 12 * unit}px)`,
                    transform: `translateY(${(1 - p) * 0.14}em)`,
                  }}
                >
                  {ch}
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};
