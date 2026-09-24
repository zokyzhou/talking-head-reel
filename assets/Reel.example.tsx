import React from "react";
import { AbsoluteFill, Easing, Freeze, OffthreadVideo, Sequence, interpolate, staticFile, useCurrentFrame } from "remotion";
import segSpec from "./reel-segments.json";
import wordsRaw from "./reel-words.json";
import { FONT, Word } from "./overlays";
import { EndCard, ReelCaptions, SimpleCard } from "./reel-overlays";

// EXAMPLE timeline for a vertical talking-head reel. The timings below
// belong to a FICTIONAL recording (see reel-segments.json and
// reel-words.json, both placeholders written by hand) so that the file
// compiles and shows the default preset: steady phrase captions,
// a few explanatory cards, and purposeful framing. No default memes,
// reaction slot, cut sounds, or frozen outro. These fictional claims are
// not the creator's experiences. Replace data AND visual beats for real footage.
//
// Every time in this file is a second of the ORIGINAL recording. E() maps
// it to an edit frame through the takes and throws when the second was
// cut, so a beat can never point at material that is not in the video.

const FPS = 30;
const SRC = "talk/ig1080.mp4"; // prep.sh writes it; gitignored
const REPO = "github.com/you/your-repo";
type Seg = { a: number; b: number; frames: number; note?: string };
const SEGS = segSpec.segments as Seg[];
const SPEECH_FRAMES = SEGS.reduce((n, s) => n + s.frames, 0);
const OUTRO_FRAMES = Math.round(segSpec.outro * FPS);
export const REEL_DURATION = SPEECH_FRAMES + OUTRO_FRAMES;
const words = wordsRaw as Word[];

const segStart = (i: number) => SEGS.slice(0, i).reduce((n, s) => n + s.frames, 0);

export const E = (t: number): number => {
  for (let i = 0; i < SEGS.length; i++) {
    const s = SEGS[i];
    if (t >= s.a - 1e-6 && t <= s.b + 1e-6) return segStart(i) + Math.round((t - s.a) * FPS);
  }
  throw new Error(`E(${t}): not inside any take in reel-segments.json`);
};
const life = (from: number, to: number) => E(to) - E(from);

const At: React.FC<{ from: number; to: number; children: React.ReactNode; name?: string }> = ({ from, to, children, name }) => (
  <Sequence from={E(from)} durationInFrames={E(to) - E(from)} name={name} layout="none">
    {children}
  </Sequence>
);

// A single crop change at a change of thought, not every cut.
const SNAPS: [number, number][] = [[10.0, 1.0], [48.0, 1.06]];
const SNAP_FRAMES = SNAPS.map(([t, z]) => [E(t), z] as [number, number]).sort((p, q) => p[0] - q[0]);

// Slow push-ins on the emphasis, multiplied onto the base framing.
type Push = { at: number; z: number; up?: number; until: number | "end"; down?: number };
const PUSHES: Push[] = [
  { at: 24.0, z: 1.06, up: 24, until: 27.2, down: 18 },
];

const useZoom = () => {
  const f = useCurrentFrame();
  let base = 1;
  for (const [fr, z] of SNAP_FRAMES) if (f >= fr) base = z;
  let push = 1;
  for (const p of PUSHES) {
    const a = E(p.at);
    const b = p.until === "end" ? REEL_DURATION : E(p.until);
    const up = p.up ?? 12;
    const down = p.down ?? 0;
    if (f < a || f >= b + down) continue;
    const rise = interpolate(f, [a, a + up], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.cubic) });
    const fall = down > 0 ? interpolate(f, [b, b + down], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }) : f < b ? 1 : 0;
    push *= 1 + (p.z - 1) * rise * fall;
  }
  return base * push;
};

export const TalkReel: React.FC = () => {
  const zoom = useZoom();
  const last = SEGS[SEGS.length - 1];
  return (
    <AbsoluteFill style={{ background: "#000", fontFamily: FONT }}>
      {/* Preserve the speaker; framing changes follow meaning. */}
      <AbsoluteFill style={{ transform: `scale(${zoom})`, transformOrigin: "50% 29%" }}>
        {SEGS.map((s, i) => {
          const from = Math.round(s.a * FPS);
          return (
            <Sequence key={i} from={segStart(i)} durationInFrames={s.frames} layout="none" name={`take ${i + 1}`}>
              <OffthreadVideo
                src={staticFile(SRC)}
                startFrom={from}
                endAt={from + s.frames}
                volume={(f) => interpolate(f, [0, 2, s.frames - 3, s.frames - 1], [0, 1, 1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
                style={{ width: "100%", height: "100%" }}
              />
            </Sequence>
          );
        })}
        {OUTRO_FRAMES > 0 && <Sequence from={SPEECH_FRAMES} durationInFrames={OUTRO_FRAMES} layout="none" name="outro freeze">
          <Freeze frame={last.frames - 1}>
            <OffthreadVideo src={staticFile(SRC)} startFrom={Math.round(last.a * FPS)} muted style={{ width: "100%", height: "100%" }} />
          </Freeze>
        </Sequence>}
      </AbsoluteFill>

      {/* A few factual callouts, with space between them. */}
      <At from={13.8} to={16.0} name="duration">
        <SimpleCard life={life(13.8, 16.0)} text="3 weeks" accent />
      </At>
      <At from={24.1} to={27.4} name="signups">
        <SimpleCard life={life(24.1, 27.4)} text="50 people" label="on day one" accent />
      </At>
      <At from={56.8} to={60.0} name="takeaway">
        <SimpleCard life={life(56.8, 60.0)} text="Ship the boring version first." size={58} />
      </At>

      {/* Set outro > 0 only when an end card is part of the approved plan. */}
      {OUTRO_FRAMES > 0 && <Sequence from={SPEECH_FRAMES} durationInFrames={OUTRO_FRAMES} layout="none" name="end card">
        <EndCard life={OUTRO_FRAMES} name="your-repo" line="one line about what it is" repo={REPO} url="yoursite.com" />
      </Sequence>}
      <ReelCaptions words={words} emphasisWords={["fifty"]} />
    </AbsoluteFill>
  );
};
