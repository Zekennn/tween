import React from "react";
import {AbsoluteFill, Easing, Img, interpolate, random, spring, staticFile, useCurrentFrame, useVideoConfig} from "remotion";

export type LogoRevealProps = {
  logo: string;       // file name inside public/, e.g. "logo.png". Empty string = use brand initial.
  brand: string;
  tagline: string;
  background: string;
  color: string;
  accent: string;
};

export const logoRevealDefaults: LogoRevealProps = {
  logo: "",
  brand: "Zekennn",
  tagline: "Code. Physics. Motion.",
  background: "#05060A",
  color: "#FFFFFF",
  accent: "#7C5CFF",
};

const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;

// Particles converge, a ring draws, the logo springs in, brand name tracks in, tagline fades up.
export const LogoReveal: React.FC<LogoRevealProps> = ({logo, brand, tagline, background, color, accent}) => {
  const frame = useCurrentFrame();
  const {fps, width, height, durationInFrames} = useVideoConfig();
  const unit = Math.min(width, height) / 1080;
  const cx = width / 2;
  const cy = height / 2 - 60 * unit;

  const converge = interpolate(frame, [0, 30], [1, 0], {...clamp, easing: Easing.in(Easing.cubic)});
  const ring = interpolate(frame, [18, 45], [0, 1], {...clamp, easing: Easing.inOut(Easing.cubic)});
  const logoP = spring({frame: frame - 28, fps, config: {damping: 9, stiffness: 120, mass: 0.7}});
  const brandP = interpolate(frame, [42, 70], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const tagP = interpolate(frame, [58, 80], [0, 1], {...clamp, easing: Easing.out(Easing.cubic)});
  const exit = interpolate(frame, [durationInFrames - 15, durationInFrames - 1], [1, 0], clamp);

  const radius = 150 * unit;
  const circumference = 2 * Math.PI * radius;

  const particles = new Array(36).fill(0).map((_, i) => {
    const angle = random(`a-${i}`) * Math.PI * 2;
    const dist = (300 + random(`d-${i}`) * 700) * unit;
    return {
      x: cx + Math.cos(angle) * dist * converge,
      y: cy + Math.sin(angle) * dist * converge,
      size: (4 + random(`s-${i}`) * 8) * unit,
    };
  });

  return (
    <AbsoluteFill style={{background, opacity: exit, fontFamily: "Inter, system-ui, sans-serif"}}>
      {converge > 0 &&
        particles.map((p, i) => (
          <div
            key={i}
            style={{
              position: "absolute",
              left: p.x - p.size / 2,
              top: p.y - p.size / 2,
              width: p.size,
              height: p.size,
              borderRadius: "50%",
              background: accent,
              opacity: converge,
            }}
          />
        ))}
      <svg width={width} height={height} style={{position: "absolute"}}>
        <circle
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={accent}
          strokeWidth={6 * unit}
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - ring)}
          transform={`rotate(-90 ${cx} ${cy})`}
          strokeLinecap="round"
        />
      </svg>
      <div
        style={{
          position: "absolute",
          left: cx - radius,
          top: cy - radius,
          width: radius * 2,
          height: radius * 2,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          transform: `scale(${logoP})`,
        }}
      >
        {logo ? (
          <Img src={staticFile(logo)} style={{width: radius * 1.2, height: radius * 1.2, objectFit: "contain"}} />
        ) : (
          <span style={{fontSize: 150 * unit, fontWeight: 900, color}}>{brand.charAt(0)}</span>
        )}
      </div>
      <div
        style={{
          position: "absolute",
          top: cy + radius + 50 * unit,
          width: "100%",
          textAlign: "center",
          color,
          fontSize: 84 * unit,
          fontWeight: 800,
          letterSpacing: `${interpolate(brandP, [0, 1], [0.5, 0.02])}em`,
          opacity: brandP,
        }}
      >
        {brand}
      </div>
      <div
        style={{
          position: "absolute",
          top: cy + radius + 160 * unit,
          width: "100%",
          textAlign: "center",
          color,
          fontSize: 40 * unit,
          opacity: tagP * 0.7,
          transform: `translateY(${(1 - tagP) * 20 * unit}px)`,
        }}
      >
        {tagline}
      </div>
    </AbsoluteFill>
  );
};
