import React from "react";
import {AbsoluteFill, Easing, Img, interpolate, staticFile, useCurrentFrame, useVideoConfig} from "remotion";

export type AppleProductRevealProps = {
  image: string;          // product image (transparent PNG) inside public/, e.g. "phone.png". Empty = built-in placeholder device.
  name: string;           // product name, large
  tagline: string;        // one short line under the name
  footnote: string;       // small grey line, e.g. "Available now". Empty = none.
  background: string;
  color: string;
  muted: string;
  gradient: [string, string]; // used for the glow and the placeholder screen
};

export const appleProductRevealDefaults: AppleProductRevealProps = {
  image: "",
  name: "Nova One",
  tagline: "Power that fits in your pocket.",
  footnote: "Available this fall",
  background: "#000000",
  color: "#F5F5F7",
  muted: "#86868B",
  gradient: ["#FF6A3D", "#A970FF"],
};

const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const appleOut = Easing.bezier(0.16, 1, 0.3, 1);
const appleInOut = Easing.bezier(0.65, 0, 0.35, 1);
const appleIn = Easing.bezier(0.7, 0, 0.84, 0);

// Product film opener: name and tagline blur in at the top, the product rises from below the
// frame tilted back and settles flat, a light sweep crosses it, a soft glow blooms behind it.
export const AppleProductReveal: React.FC<AppleProductRevealProps> = ({
  image,
  name,
  tagline,
  footnote,
  background,
  color,
  muted,
  gradient,
}) => {
  const frame = useCurrentFrame();
  const {width, height, durationInFrames} = useVideoConfig();
  const unit = Math.min(width, height) / 1080;
  const isVertical = height > width;

  const enter = (start: number, len = 32) =>
    interpolate(frame, [start, start + len], [0, 1], {...clamp, easing: appleOut});
  const blurIn = (p: number, travel: number): React.CSSProperties => ({
    opacity: p,
    filter: `blur(${(1 - p) * 20 * unit}px)`,
    transform: `translateY(${(1 - p) * travel * unit}px)`,
  });

  const push = interpolate(frame, [0, durationInFrames], [1, 1.03], {...clamp, easing: appleInOut});
  const exit = interpolate(frame, [durationInFrames - 18, durationInFrames - 2], [0, 1], {
    ...clamp,
    easing: appleIn,
  });

  const rise = enter(6, 50);
  const glow = enter(20, 50);
  const shine = interpolate(frame, [48, 88], [-0.6, 1.6], {...clamp, easing: appleInOut});

  // Device sits lower on the frame and is partly cropped by the bottom edge, keynote style.
  const deviceH = height * (isVertical ? 0.62 : 0.78);
  const deviceW = deviceH * 0.49;
  const deviceTop = height * (isVertical ? 0.42 : 0.4);
  const radius = deviceW * 0.16;

  const nameSize = (isVertical ? 128 : 120) * unit;

  return (
    <AbsoluteFill style={{background, fontFamily: "Inter, system-ui, sans-serif", overflow: "hidden"}}>
      <AbsoluteFill style={{transform: `scale(${push})`, opacity: 1 - exit}}>
        {/* Glow behind the product */}
        <AbsoluteFill
          style={{
            background: `radial-gradient(ellipse ${deviceW * 1.6}px ${deviceH * 0.7}px at 50% ${
              deviceTop + deviceH * 0.45
            }px, ${gradient[0]}40, ${gradient[1]}1A 45%, transparent 75%)`,
            opacity: glow,
          }}
        />

        {/* Headline block */}
        <div
          style={{
            position: "absolute",
            top: height * (isVertical ? 0.1 : 0.08),
            left: 0,
            right: 0,
            textAlign: "center",
            padding: `0 ${width * 0.08}px`,
            filter: `blur(${exit * 12 * unit}px)`,
          }}
        >
          <div
            style={{
              fontSize: nameSize,
              fontWeight: 700,
              letterSpacing: "-0.045em",
              lineHeight: 1.02,
              color,
              ...blurIn(enter(14), 36),
            }}
          >
            {name}
          </div>
          <div
            style={{
              fontSize: 46 * unit,
              fontWeight: 600,
              letterSpacing: "-0.02em",
              color,
              marginTop: 18 * unit,
              ...blurIn(enter(24), 28),
            }}
          >
            {tagline}
          </div>
          {footnote ? (
            <div
              style={{
                fontSize: 30 * unit,
                fontWeight: 500,
                color: muted,
                marginTop: 16 * unit,
                ...blurIn(enter(34), 20),
              }}
            >
              {footnote}
            </div>
          ) : null}
        </div>

        {/* Product */}
        <div
          style={{
            position: "absolute",
            left: (width - deviceW) / 2,
            top: deviceTop,
            width: deviceW,
            height: deviceH,
            opacity: interpolate(rise, [0, 0.3], [0, 1], clamp),
            transform: `perspective(${1600 * unit}px) translateY(${(1 - rise) * height * 0.25}px) rotateX(${
              (1 - rise) * 18
            }deg) scale(${0.94 + rise * 0.06})`,
            transformOrigin: "50% 100%",
            filter: `drop-shadow(0 ${(60 - rise * 30) * unit}px ${(90 - rise * 40) * unit}px rgba(0,0,0,0.6))`,
          }}
        >
          {image ? (
            <Img src={staticFile(image)} style={{width: "100%", height: "100%", objectFit: "contain"}} />
          ) : (
            <div
              style={{
                width: "100%",
                height: "100%",
                borderRadius: radius,
                background: "linear-gradient(145deg, #3A3A3C, #121214 60%, #2C2C2E)",
                padding: deviceW * 0.035,
                boxShadow: `inset 0 0 0 ${2 * unit}px rgba(255,255,255,0.12)`,
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: radius * 0.8,
                  overflow: "hidden",
                  background: `linear-gradient(160deg, ${gradient[0]}, ${gradient[1]} 70%, #0A0A12)`,
                  position: "relative",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    top: deviceH * 0.022,
                    left: "50%",
                    width: deviceW * 0.3,
                    height: deviceH * 0.03,
                    marginLeft: -deviceW * 0.15,
                    borderRadius: 999,
                    background: "#000",
                  }}
                />
              </div>
            </div>
          )}
          {/* Light sweep, clipped to the product's shape (the image's alpha, or the device outline) */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: image ? 0 : radius,
              overflow: "hidden",
              pointerEvents: "none",
              ...(image
                ? {
                    WebkitMaskImage: `url(${staticFile(image)})`,
                    maskImage: `url(${staticFile(image)})`,
                    WebkitMaskSize: "contain",
                    maskSize: "contain",
                    WebkitMaskRepeat: "no-repeat",
                    maskRepeat: "no-repeat",
                    WebkitMaskPosition: "center",
                    maskPosition: "center",
                  }
                : {}),
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-20%",
                bottom: "-20%",
                width: "45%",
                left: `${shine * 100}%`,
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)",
                transform: "skewX(-18deg)",
                mixBlendMode: "screen",
              }}
            />
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
