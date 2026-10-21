import React from "react";
import {AbsoluteFill, Easing, interpolate, interpolateColors, random, spring, useCurrentFrame, useVideoConfig} from "remotion";
import {loadFont} from "@remotion/google-fonts/Inter";

const {fontFamily} = loadFont("normal", {weights: ["600"], subsets: ["latin"]});

export type WarmPathDemoProps = {
  sketchLabel: string; // label above the small sketch card
  finalLabel: string;  // label above the large panel
  points: number[];    // 3-9 keyframe heights, 0 = top, 1 = bottom. The sketch zig-zags through them; the panel smooths them.
  background: string;  // edge colour of the vignette
  glow: string;        // warm light behind the panels
  card: string;        // sketch card paper
  panel: string;       // large panel paper (grid is drawn on top)
  ink: string;         // sketch lines and keyframe diamonds
  accent: string;      // motion line, orb and settled keyframes
  labelColor: string;
};

export const warmPathDemoDefaults: WarmPathDemoProps = {
  sketchLabel: "Sketch",
  finalLabel: "Motion",
  points: [0.62, 0.3, 0.72, 0.28, 0.7, 0.34, 0.66],
  background: "#0D0705",
  glow: "#7A3D24",
  card: "#FCFBF7",
  panel: "#EEECE7",
  ink: "#1C1A18",
  accent: "#E8743B",
  labelColor: "#F5EFE8",
};

const clamp = {extrapolateLeft: "clamp", extrapolateRight: "clamp"} as const;
const warmOut = Easing.bezier(0.25, 1, 0.5, 1);
const warmIn = Easing.bezier(0.5, 0, 0.75, 0);
const warmInOut = Easing.bezier(0.65, 0, 0.35, 1);

type Pt = [number, number];
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

// Bezier segments through the points. t = 0 gives straight lines, t = 1 a smooth Catmull-Rom curve.
const segments = (p: Pt[], t: number) =>
  p.slice(0, -1).map((p1, i) => {
    const p0 = p[Math.max(i - 1, 0)];
    const p2 = p[i + 1];
    const p3 = p[Math.min(i + 2, p.length - 1)];
    const c1: Pt = [p1[0] + ((p2[0] - p0[0]) / 6) * t, p1[1] + ((p2[1] - p0[1]) / 6) * t];
    const c2: Pt = [p2[0] - ((p3[0] - p1[0]) / 6) * t, p2[1] - ((p3[1] - p1[1]) / 6) * t];
    return [p1, c1, c2, p2] as const;
  });

const toPath = (segs: ReturnType<typeof segments>) =>
  segs.length === 0
    ? ""
    : `M ${segs[0][0][0]} ${segs[0][0][1]} ` + segs.map(([, c1, c2, e]) => `C ${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${e[0]} ${e[1]}`).join(" ");

// Point at u (0-1) along the whole curve, one equal share per segment.
const pointAt = (segs: ReturnType<typeof segments>, u: number): Pt => {
  const x = Math.min(Math.max(u, 0), 1) * segs.length;
  const i = Math.min(Math.floor(x), segs.length - 1);
  const s = x - i;
  const [a, b, c, d] = segs[i];
  const m = 1 - s;
  return [
    m * m * m * a[0] + 3 * m * m * s * b[0] + 3 * m * s * s * c[0] + s * s * s * d[0],
    m * m * m * a[1] + 3 * m * m * s * b[1] + 3 * m * s * s * c[1] + s * s * s * d[1],
  ];
};

// Warm studio demo: a rough sketch draws itself on a paper card, then the same path appears clean on a
// grid panel and a glowing orb travels it; each keyframe it passes relaxes into a smooth curve and turns accent.
export const WarmPathDemo: React.FC<WarmPathDemoProps> = ({
  sketchLabel,
  finalLabel,
  points,
  background,
  glow,
  card,
  panel,
  ink,
  accent,
  labelColor,
}) => {
  const frame = useCurrentFrame();
  const {fps, width, height, durationInFrames} = useVideoConfig();
  const unit = Math.min(width, height) / 1080;
  const isVertical = height > width;
  const pts = points.length >= 2 ? points.slice(0, 9) : [0.5, 0.5];
  const n = pts.length;

  // Layout: small card left, big panel right; shrink everything if the pair is wider than the frame.
  let panelH = height * (isVertical ? 0.46 : 0.62);
  let panelW = panelH * (isVertical ? 0.56 : 1.3);
  const gap0 = 28 * unit;
  const s = Math.min(1, (width * 0.88) / (panelW * 1.55 + gap0));
  panelH *= s;
  panelW *= s;
  const cardW = panelW * 0.55;
  const cardH = panelH * 0.55;
  const gap = gap0 * s;
  const left = (width - (cardW + gap + panelW)) / 2;
  const panelTop = (height - panelH) / 2 - (isVertical ? height * 0.03 : 0);
  const cardTop = panelTop + (panelH - cardH) / 2;
  const labelSize = Math.max(28 * unit, 30 * unit * s);

  // Beats (30 fps).
  const pop = (start: number) => spring({frame: frame - start, fps, config: {damping: 14, stiffness: 140}});
  const cardP = pop(4);
  const panelP = pop(10);
  const sketchDraw = interpolate(frame, [14, 42], [0, 1], {...clamp, easing: warmInOut});
  const lineDraw = interpolate(frame, [30, 52], [0, 1], {...clamp, easing: warmInOut});
  const travelStart = 54;
  const travelEnd = Math.max(travelStart + 30, durationInFrames - 46);
  const travel = (f: number) => interpolate(f, [travelStart, travelEnd], [0, 1], {...clamp, easing: warmInOut});
  const exit = interpolate(frame, [durationInFrames - 16, durationInFrames - 2], [0, 1], {...clamp, easing: warmIn});

  // Curve on the panel: each keyframe relaxes toward a gentle wave once the orb has passed it.
  const curveAt = (f: number) => {
    const t = travel(f);
    const p = pts.map((y, k): Pt => {
      const pass = k / (n - 1);
      const relax = interpolate(t, [pass - 0.02, pass + 0.1], [0, 1], {...clamp, easing: warmOut});
      const yy = lerp(y, 0.5 + (y - 0.5) * 0.25, f < travelStart ? 0 : relax);
      return [panelW * (0.08 + (0.84 * k) / (n - 1)), panelH * (0.25 + 0.5 * yy)];
    });
    return {segs: segments(p, t), t, p};
  };
  const now = curveAt(frame);
  const orbSize = 30 * unit * s;
  const orbOn = frame >= travelStart - 4 ? interpolate(frame, [travelStart - 4, travelStart + 4], [0, 1], {...clamp, easing: warmOut}) : 0;

  // Sketch: the raw keyframes with a little deterministic hand wobble.
  const sk = pts.map((y, k): Pt => [
    cardW * (0.1 + (0.8 * k) / (n - 1)) + (random(`warm-sketch-x-${k}`) - 0.5) * 6 * unit * s,
    cardH * (0.3 + 0.45 * y) + (random(`warm-sketch-y-${k}`) - 0.5) * 8 * unit * s,
  ]);
  const skPath = toPath(segments(sk, 0));

  const enterStyle = (p: number): React.CSSProperties => ({
    opacity: Math.min(1, p * 1.4),
    filter: `blur(${Math.max(0, 1 - p) * 12 * unit}px)`,
    transform: `translateY(${(1 - p) * 40 * unit}px) scale(${0.94 + 0.06 * p})`,
  });
  const label: React.CSSProperties = {
    position: "absolute",
    fontFamily,
    fontWeight: 600,
    fontSize: labelSize,
    color: labelColor,
    letterSpacing: "-0.01em",
    whiteSpace: "nowrap",
  };

  return (
    <AbsoluteFill style={{background, overflow: "hidden"}}>
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse ${width * 0.7}px ${height * 0.55}px at 50% 50%, ${glow}, ${background})`,
          opacity: interpolate(frame, [0, 20], [0, 1], clamp) * (1 - exit),
        }}
      />
      <AbsoluteFill style={{opacity: 1 - exit, filter: `blur(${exit * 14 * unit}px)`}}>
        {/* Sketch card */}
        <div style={{position: "absolute", left, top: cardTop - labelSize * 1.6, ...enterStyle(cardP)}}>
          <div style={{...label, position: "relative", textAlign: "center", width: cardW, marginBottom: labelSize * 0.5}}>
            {sketchLabel}
          </div>
          <div
            style={{
              width: cardW,
              height: cardH,
              background: card,
              borderRadius: 6 * unit,
              boxShadow: `0 ${24 * unit}px ${70 * unit}px rgba(0,0,0,0.45)`,
            }}
          >
            <svg width={cardW} height={cardH} style={{overflow: "visible"}}>
              <circle
                cx={sk[0][0]}
                cy={sk[0][1] - 26 * unit * s}
                r={10 * unit * s}
                fill="none"
                stroke={ink}
                strokeWidth={2.4 * unit * s}
                opacity={interpolate(frame, [12, 18], [0, 1], clamp)}
              />
              {[0, 1].map((pass) => (
                <path
                  key={pass}
                  d={skPath}
                  pathLength={1}
                  fill="none"
                  stroke={ink}
                  strokeWidth={(pass ? 1.4 : 2.6) * unit * s}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="1 1"
                  strokeDashoffset={1 - sketchDraw}
                  opacity={pass ? 0.35 : 0.9}
                  transform={pass ? `translate(${1.5 * unit} ${-1.5 * unit})` : undefined}
                />
              ))}
            </svg>
          </div>
        </div>

        {/* Final panel */}
        <div style={{position: "absolute", left: left + cardW + gap, top: panelTop - labelSize * 1.6, ...enterStyle(panelP)}}>
          <div
            style={{
              ...label,
              position: "relative",
              width: panelW,
              marginBottom: labelSize * 0.5,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              gap: labelSize * 0.35,
            }}
          >
            <span style={{width: labelSize * 0.45, height: labelSize * 0.45, borderRadius: "50%", background: accent}} />
            {finalLabel}
          </div>
          <div
            style={{
              position: "relative",
              width: panelW,
              height: panelH,
              backgroundColor: panel,
              backgroundImage:
                "linear-gradient(rgba(0,0,0,0.09) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.09) 1px, transparent 1px)",
              backgroundSize: `${28 * unit * s}px ${28 * unit * s}px`,
              borderRadius: 6 * unit,
              overflow: "hidden",
              boxShadow: `0 ${30 * unit}px ${90 * unit}px rgba(0,0,0,0.5)`,
            }}
          >
            <svg width={panelW} height={panelH} style={{position: "absolute", inset: 0}}>
              <path
                d={toPath(now.segs)}
                pathLength={1}
                fill="none"
                stroke={accent}
                strokeWidth={3.2 * unit * s}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray="1 1"
                strokeDashoffset={1 - lineDraw}
              />
            </svg>
            {/* Keyframes: ink diamonds that pop in, then turn into accent dots once the orb passes */}
            {now.p.map(([x, y], k) => {
              const p = pop(28 + k * 3);
              const pass = k / (n - 1);
              const done = frame < travelStart ? 0 : interpolate(now.t, [pass - 0.02, pass + 0.06], [0, 1], clamp);
              const size = 16 * unit * s;
              return (
                <div
                  key={k}
                  style={{
                    position: "absolute",
                    left: x - size / 2,
                    top: y - size / 2,
                    width: size,
                    height: size,
                    background: interpolateColors(done, [0, 1], [ink, accent]),
                    borderRadius: `${done * 50}%`,
                    transform: `rotate(${45 * (1 - done)}deg) scale(${p * (1 + 0.5 * Math.sin(Math.PI * done))})`,
                  }}
                />
              );
            })}
            {/* Orb with a short trail of ghosts behind it */}
            {[5, 4, 3, 2, 1, 0].map((j) => {
              const ghost = pointAt(now.segs, travel(frame - j));
              return (
                <div
                  key={j}
                  style={{
                    position: "absolute",
                    left: ghost[0] - orbSize / 2,
                    top: ghost[1] - orbSize / 2,
                    width: orbSize,
                    height: orbSize,
                    borderRadius: "50%",
                    background: `radial-gradient(circle at 38% 35%, #FFE3D1, ${accent} 62%)`,
                    boxShadow: j === 0 ? `0 0 ${18 * unit * s}px ${accent}, 0 0 ${50 * unit * s}px ${accent}` : undefined,
                    opacity: orbOn * (j === 0 ? 1 : 0.32 * (1 - j / 6)) * (1 - exit),
                  }}
                />
              );
            })}
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
