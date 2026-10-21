import React from "react";
import {AbsoluteFill, Easing, Img, OffthreadVideo, interpolate, staticFile, useCurrentFrame, useVideoConfig} from "remotion";
import {loadFont} from "@remotion/google-fonts/Inter";

const {fontFamily} = loadFont("normal", {weights: ["700", "800"], subsets: ["latin"]});

export type ComparePanel = {
  label: string; // shown under the panel, e.g. "2 hours"
  media: string; // image or video in public/ (videos should last as long as the composition). Empty string = placeholder.
};

export type SplitCompareProps = {
  left: ComparePanel;
  right: ComparePanel;
  presenter: string;  // talking-head video in public/ (its audio plays). Empty string = placeholder.
  banner: string[];   // 1-2 short lines on the red title banner
  background: string;
  color: string;
  accent: string;     // banner colour
};

export const splitCompareDefaults: SplitCompareProps = {
  left: {label: "2 hours", media: ""},
  right: {label: "10 minutes", media: ""},
  presenter: "",
  banner: ["Create motion graphics", "in 10 minutes"],
  background: "#0B0B0D",
  color: "#FFFFFF",
  accent: "#E5243B",
};

const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const snapOut = Easing.bezier(0.22, 1, 0.36, 1);
const snapIn = Easing.bezier(0.64, 0, 0.78, 0);

const isVideo = (src: string) => /\.(mp4|mov|webm|m4v|mkv)$/i.test(src);

const Media: React.FC<{src: string; muted: boolean; hint: string}> = ({src, muted, hint}) => {
  const fill: React.CSSProperties = {width: "100%", height: "100%", objectFit: "cover"};
  if (!src) {
    return (
      <AbsoluteFill
        style={{
          background: "linear-gradient(160deg, #2B2B36, #121216)",
          justifyContent: "center",
          alignItems: "center",
          color: "rgba(255,255,255,0.35)",
          fontSize: "0.5em",
          fontWeight: 700,
        }}
      >
        {hint}
      </AbsoluteFill>
    );
  }
  return isVideo(src) ? <OffthreadVideo src={staticFile(src)} muted={muted} style={fill} /> : <Img src={staticFile(src)} style={fill} />;
};

// Creator tutorial layout: a before/after pair of clips with labels, a red title banner on the seam,
// and the presenter filling the other half. Vertical and square stack the halves, wide puts them side by side.
export const SplitCompare: React.FC<SplitCompareProps> = ({left, right, presenter, banner, background, color, accent}) => {
  const frame = useCurrentFrame();
  const {width, height, durationInFrames} = useVideoConfig();
  const unit = Math.min(width, height) / 1080;
  const stacked = height >= width; // 9:16 and 1:1 stack the halves; 16:9 puts them side by side

  // The compare half: top half on 9:16, left half on 16:9 and 1:1.
  const half = stacked ? {w: width, h: height / 2} : {w: width / 2, h: height};
  const gap = 24 * unit;
  const labelSize = 40 * unit;
  const panelW = (half.w - gap * 3) / 2;
  // Leave room for the labels and for the banner below them.
  const panelH = Math.min(half.h * (height > width ? 0.72 : 0.6), panelW * 1.78);
  const panelTop = stacked ? (half.h - panelH - labelSize * 1.6) / 2 : height * 0.1;

  const exitStart = durationInFrames - 12;
  const fadeOut = interpolate(frame, [durationInFrames - 8, durationInFrames - 1], [1, 0], {...clamp, easing: snapIn});
  const push = interpolate(frame, [0, durationInFrames], [1, 1.05], clamp);

  const panelIn = (i: number) => interpolate(frame, [i * 5, i * 5 + 14], [0, 1], {...clamp, easing: snapOut});
  const labelIn = (i: number) => interpolate(frame, [8 + i * 5, 12 + i * 5], [0, 1], {...clamp, easing: snapOut});

  // Banner sits on the seam on 9:16; on wide formats, low in the compare half.
  const bannerCenter = stacked ? {x: width / 2, y: height / 2} : {x: width / 4, y: height * 0.86};
  const bannerSize = 50 * unit;
  const bannerW = (stacked ? width : width / 2) * 0.9;

  return (
    <AbsoluteFill style={{background, fontFamily, overflow: "hidden", opacity: fadeOut}}>
      {/* Presenter half */}
      <div
        style={{
          position: "absolute",
          left: stacked ? 0 : width / 2,
          top: stacked ? height / 2 : 0,
          width: half.w,
          height: half.h,
          overflow: "hidden",
          fontSize: 80 * unit,
        }}
      >
        <AbsoluteFill style={{transform: `scale(${push})`}}>
          <Media src={presenter} muted={false} hint="presenter" />
        </AbsoluteFill>
      </div>

      {/* Compare half */}
      {[left, right].map((panel, i) => {
        const p = panelIn(i);
        const x = gap + i * (panelW + gap);
        return (
          <div key={i} style={{position: "absolute", left: x, top: panelTop, width: panelW}}>
            <div
              style={{
                position: "relative",
                width: panelW,
                height: panelH,
                borderRadius: 18 * unit,
                overflow: "hidden",
                fontSize: 80 * unit,
                opacity: p,
                transform: `translateY(${(1 - p) * 60 * unit}px) scale(${0.96 + 0.04 * p})`,
                boxShadow: `0 ${12 * unit}px ${40 * unit}px rgba(0,0,0,0.45)`,
              }}
            >
              <Media src={panel.media} muted hint={i === 0 ? "before" : "after"} />
            </div>
            <div
              style={{
                marginTop: labelSize * 0.4,
                fontSize: labelSize,
                fontWeight: 700,
                letterSpacing: "-0.01em",
                color,
                textAlign: i === 0 ? "left" : "right",
                opacity: labelIn(i),
                transform: `scale(${0.85 + 0.15 * labelIn(i)})`,
                transformOrigin: i === 0 ? "left" : "right",
              }}
            >
              {panel.label}
            </div>
          </div>
        );
      })}

      {/* Banner */}
      <div
        style={{
          position: "absolute",
          left: bannerCenter.x - bannerW / 2,
          top: bannerCenter.y,
          width: bannerW,
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        {banner.slice(0, 2).map((line, i) => {
          const inP = interpolate(frame, [16 + i * 4, 26 + i * 4], [0, 1], {...clamp, easing: snapOut});
          const outP = interpolate(frame, [exitStart + i * 2, exitStart + i * 2 + 8], [0, 1], {...clamp, easing: snapIn});
          return (
            <div
              key={i}
              style={{
                background: accent,
                color,
                fontSize: bannerSize,
                fontWeight: 800,
                lineHeight: 1.12,
                letterSpacing: "-0.005em",
                textTransform: "uppercase",
                textAlign: "center",
                padding: "0.06em 0.3em",
                clipPath: `inset(0 ${(1 - inP) * 100}% 0 ${outP * 100}%)`,
              }}
            >
              {line}
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
