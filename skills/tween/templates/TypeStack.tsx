import React from "react";
import {AbsoluteFill, Easing, interpolate, random, useCurrentFrame, useVideoConfig} from "remotion";
import {loadFont as loadDisplay} from "@remotion/google-fonts/Anton";
import {loadFont as loadMono} from "@remotion/google-fonts/JetBrainsMono";

const {fontFamily: display} = loadDisplay("normal", {weights: ["400"], subsets: ["latin"]});
const {fontFamily: mono} = loadMono("normal", {weights: ["500"], subsets: ["latin"]});

export type TypeStackProps = {
  word: string;       // one short word, repeated to fill the frame. Set in capitals.
  index: string;      // section number in the corner chip, e.g. "01". Empty string = no corner labels.
  label: string;      // section name next to the number, e.g. "Kinetic type"
  background: string;
  color: string;
  accent: string;     // the highlight band that steps up through the rows
};

export const typeStackDefaults: TypeStackProps = {
  word: "Motion",
  index: "01",
  label: "Kinetic type",
  background: "#0A0A0C",
  color: "#F0ECE1",
  accent: "#FF4F1F",
};

const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const snapOut = Easing.bezier(0.22, 1, 0.36, 1);
const snapIn = Easing.bezier(0.64, 0, 0.78, 0);

const pad = (n: number) => String(Math.floor(n)).padStart(2, "0");

// Showreel section opener: one word repeated in rows that alternate solid and outline, slide in from
// alternating sides on a tilt, drift in opposite directions, an accent band steps up the stack,
// a mono chip and running timecode sit in the corners, and the stack wipes out upward.
export const TypeStack: React.FC<TypeStackProps> = ({word, index, label, background, color, accent}) => {
  const frame = useCurrentFrame();
  const {fps, width, height, durationInFrames} = useVideoConfig();
  const unit = Math.min(width, height) / 1080;
  const isVertical = height > width;
  const text = word.trim().toUpperCase() || " ";

  const rowH = height / (isVertical ? 7.5 : 5.5);
  const fontSize = rowH / 0.9;
  const rows = Math.ceil(height / rowH) + 3; // extra rows cover the tilt at the start
  const stroke = Math.max(1.5, 2.5 * unit);

  // Rows must stay wider than the frame for the whole shot, so size them from the longest drift.
  const maxSpeed = 3 * unit;
  const enterDist = width * 0.7;
  const maxTravel = maxSpeed * durationInFrames + enterDist;
  // Anton capitals average ~0.5em wide.
  const copyW = (text.length * 0.5 + 0.12) * fontSize;
  const copies = Math.ceil((width + 2 * maxTravel) / copyW) + 2; // +2 covers narrow-letter words

  const settle = interpolate(frame, [0, 30], [0, 1], {...clamp, easing: snapOut});
  const exitStart = durationInFrames - 12 - Math.ceil(rows * 0.6);
  const band = frame < 14 ? -1 : (rows - 3 - (Math.floor((frame - 14) / 8) % rows) + rows) % rows;
  const flip = Math.floor(frame / 15) % 2;

  const hudOut = interpolate(frame, [exitStart, exitStart + 8], [1, 0], {...clamp, easing: snapIn});
  const hudIn = interpolate(frame, [10, 22], [0, 1], {...clamp, easing: snapOut});
  const secs = frame / fps;
  const timecode = `${pad(secs / 60)}:${pad(secs % 60)}:${pad(frame % fps)}`;
  const hudSize = 28 * unit;

  return (
    <AbsoluteFill style={{background, overflow: "hidden"}}>
      <AbsoluteFill
        style={{
          transform: `rotate(${(1 - settle) * -7}deg) scale(${1.25 - settle * 0.25})`,
          top: -rowH * 1.5,
        }}
      >
        {new Array(rows).fill(0).map((_, i) => {
          const dir = i % 2 === 0 ? -1 : 1;
          const speed = (1.2 + random(`type-stack-speed-${i}`) * 1.8) * unit;
          const enter = interpolate(frame, [i * 1.5, i * 1.5 + 22], [0, 1], {...clamp, easing: snapOut});
          const out = interpolate(frame, [exitStart + i * 0.6, exitStart + i * 0.6 + 12], [0, 1], {...clamp, easing: snapIn});
          const x = -maxTravel + dir * speed * frame + (1 - enter) * enterDist * -dir;
          const highlighted = i === band;
          const solid = (i + flip) % 2 === 0;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                top: i * rowH,
                left: 0,
                height: rowH,
                width,
                overflow: "hidden",
                background: highlighted ? accent : "transparent",
                transform: `translateY(${-out * height * 1.1}px)`,
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: x,
                  top: 0,
                  whiteSpace: "nowrap",
                  fontFamily: display,
                  fontSize,
                  lineHeight: `${rowH}px`,
                  letterSpacing: "-0.01em",
                  color: highlighted ? background : solid ? color : "transparent",
                  WebkitTextStroke: highlighted || solid ? undefined : `${stroke}px ${color}`,
                }}
              >
                {new Array(copies).fill(0).map((__, j) => (
                  <span key={j} style={{marginRight: "0.12em"}}>
                    {text}
                  </span>
                ))}
              </div>
            </div>
          );
        })}
      </AbsoluteFill>

      {index ? (
        <div
          style={{
            position: "absolute",
            top: height * 0.05,
            left: width * 0.06,
            right: width * 0.06,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: mono,
            fontSize: hudSize,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color,
            opacity: hudIn * hudOut,
          }}
        >
          <div style={{display: "flex", alignItems: "center", gap: 10 * unit, background, padding: `${6 * unit}px ${10 * unit}px`}}>
            <span style={{border: `${stroke}px solid ${color}`, borderRadius: 999, padding: `${2 * unit}px ${10 * unit}px`}}>
              {index}
            </span>
            {label}
          </div>
          <div style={{background, padding: `${6 * unit}px ${10 * unit}px`, fontVariantNumeric: "tabular-nums"}}>{timecode}</div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
