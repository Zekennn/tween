import React from "react";
import {AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig} from "remotion";

export type LowerThirdProps = {
  name: string;
  role: string;
  accent: string;
  panel: string;
  color: string;
  transparent: boolean; // true = no background, render as ProRes 4444 for editors
};

export const lowerThirdDefaults: LowerThirdProps = {
  name: "Senura Perera",
  role: "Software Engineer",
  accent: "#FF4D6D",
  panel: "#111318",
  color: "#FFFFFF",
  transparent: false,
};

const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;

// Accent bar wipes in, panel wipes after it, text slides in, then everything wipes out in reverse.
export const LowerThird: React.FC<LowerThirdProps> = ({name, role, accent, panel, color, transparent}) => {
  const frame = useCurrentFrame();
  const {width, height, durationInFrames} = useVideoConfig();
  const unit = Math.min(width, height) / 1080;
  const ease = Easing.inOut(Easing.cubic);

  const barIn = interpolate(frame, [0, 14], [0, 1], {...clamp, easing: ease});
  const panelIn = interpolate(frame, [6, 24], [0, 1], {...clamp, easing: ease});
  const nameIn = interpolate(frame, [14, 30], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const roleIn = interpolate(frame, [20, 36], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const out = interpolate(frame, [durationInFrames - 20, durationInFrames - 4], [0, 1], {...clamp, easing: ease});

  const reveal = Math.min(panelIn, 1 - out);

  return (
    <AbsoluteFill style={{background: transparent ? "transparent" : "#2A2F3A"}}>
      <div
        style={{
          position: "absolute",
          left: width * 0.07,
          bottom: height * 0.12,
          display: "flex",
          alignItems: "stretch",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            width: 12 * unit,
            background: accent,
            transform: `scaleY(${Math.min(barIn, 1 - out)})`,
            transformOrigin: "bottom",
          }}
        />
        <div
          style={{
            background: panel,
            padding: `${22 * unit}px ${40 * unit}px`,
            clipPath: `inset(0 ${(1 - reveal) * 100}% 0 0)`,
          }}
        >
          <div
            style={{
              fontSize: 56 * unit,
              fontWeight: 700,
              color,
              opacity: nameIn,
              transform: `translateX(${(1 - nameIn) * -30 * unit}px)`,
              whiteSpace: "nowrap",
            }}
          >
            {name}
          </div>
          <div
            style={{
              fontSize: 34 * unit,
              fontWeight: 500,
              color: accent,
              opacity: roleIn,
              transform: `translateX(${(1 - roleIn) * -30 * unit}px)`,
              whiteSpace: "nowrap",
              marginTop: 6 * unit,
            }}
          >
            {role}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
