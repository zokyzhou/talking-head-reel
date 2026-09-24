---
name: talking-head-reel
description: Edit multi-take portrait talking-head recordings into vertical reels for X, Xiaohongshu (RedNote), TikTok, Instagram, or YouTube Shorts. Select natural takes, cut on word boundaries, sync readable phrase captions, and add purposeful explanatory visuals using a clear, expressive style. Use for reel creation and recuts; not for landscape screen walkthroughs.
---

# Talking-head reel

Turn a portrait recording into a clear 1080x1920 reel while preserving the
speaker's personality. Read [references/editing-style.md](references/editing-style.md)
before planning: it defines the creator's voice, visual defaults, platform
adaptations, and outline/preview review process. Honor existing approvals;
a skill update alone does not authorize editing or publishing a video.

Select the most communicative takes, cut on word boundaries, and time
visuals to the idea they explain. Captions transcribe the actual speech;
explanatory cards may summarize it and add verified attribution. Never
invent testimony, quotes, results, or unsupported claims.

`assets/Reel.example.tsx` and `assets/reel-segments.example.json` are a
placeholder timeline built on the timings of a fictional recording, so
they compile and show the wiring and restrained pacing; read them
once before planning a new reel. `overlays.tsx` holds the shared `Card`,
`Big`, `LogoRow` and `Word`; `reel-overlays.tsx` holds the vertical
grammar.

The Remotion project is `remotion/` next to this file (`cd remotion &&
npm install` once). Every path below that says `src/`, `public/` or
`out/` is inside it, and the scripts are run from inside it. In command examples,
`scripts/` means `../scripts/` relative to `remotion/`.

## What "good" looks like

The speaker leads. Keep expressive gestures and smiles, readable phrase
captions, and space between useful visuals. Warm white type, charcoal
backing where needed, and one yellow accent are the initial palette.
Use a few purposeful framing changes, no automatic cut sounds, no memes
by default, and an optional end card. Details live in the style reference.

## The pipeline

```
prep.sh       -> public/talk/ig1080.mp4           (portrait 1080x1920, 30 fps, cheap to seek)
transcribe.py -> words.whisper.json + segment table   (the WHOLE recording, all takes)
choose takes  -> reel-segments.json                 (original seconds, best take per sentence)
cut.py        -> reel-words.json + edit timeline    (captions in edit time, frames per take)
plan          -> beats: original second -> overlay
Reel.tsx      -> Remotion composition (copy assets/reel-overlays.tsx)
stills.sh     -> tiled portrait grids at the key seconds, fix layout
preview       -> 10–15 s representative excerpt for review before full edit
render.sh     -> detached full render (~10 min for 80 s)
QA            -> probe, contact sheet, audio check, deliver to agreed folder
```

The scripts do the boring steps the same way every time. The creative
work is choosing takes and planning beats.

### 1. Ingest

Probe first, with per-stream (never per-frame) side data: `ffprobe -v
error -select_streams v:0 -show_entries stream_side_data=rotation -of
csv=p=0 <mov> | head -1`. A portrait phone file is a 1920x1080 HEVC stream
with `rotation=90`; ffmpeg rotates before the filter graph, so the scale
target is `1080:1920`. Asking ffprobe for `side_data=rotation` on the
stream entries prints one line per frame forever.

```bash
scripts/prep.sh <IMG_xxxx.MOV> public/talk
```

While it runs, make a contact sheet (`scripts/sheet.sh <mov> 10`) and look
at it for the geometry: where the face sits (the zoom origin), where the
chin is (the top of the card band), where the hands reach (preserve expressive
gestures and move or omit overlays that hide them), and how bright the wall is (dark cards on a bright
wall). The reel is portrait, so `sheet.sh`'s 5-column tiling is fine at
10 s per tile.

### 2. Transcribe everything

```bash
scripts/transcribe.py <IMG_xxxx.MOV> --out <scratch>/words_all.json \
  --fix "Cloud=Claude" --fix "cloud=Claude"
```

Transcribe the whole file, not a cut of it; the segment table it prints
is the take map. Its suggested cut/end are meaningless here (they assume
one take), ignore them. The raw whisper json it keeps next to the output
is what `cut.py` reads. Whisper mangles product names; fix words with
`--fix` and phrases later with `cut.py --phrase "Claude code=Claude Code"`.

### 3. Choose the takes

Read `references/take-selection.md` the first time. The short version:

- Walk the segment table against the script the speaker meant to say (ask
  for it; people usually have one). Group the lines by sentence; each
  sentence appears two to four times.
- Prefer the take that preserves meaning, sounds natural, and communicates
  the feeling clearly. Listen to candidates; chronology and transcript
  fluency alone cannot determine the best delivery.
- A stretch where several sentences are said in a row without a restart
  can stay one segment; keep meaningful pauses inside it. Cut restarts
  and empty waiting without mechanically removing breathing space.
- One-liners from an earlier take can be spliced in (a joke that landed
  only once) when the framing matches; check in stills.
- Cut points come from word times: start 0.10 to 0.15 s before the first
  word, end 0.20 to 0.30 s after the last word. A whisper word that spans
  a pause (a "but" that lasts three seconds) hides where the sound is; run
  `silencedetect` on that window and start the take just before the sound.
- Do not add undelivered script lines as captions or new claims. Cards
  may summarize the spoken point and provide verified attribution.
- Follow the requested duration and scope. Do not pad a useful shorter
  edit or impose a universal duration limit.

Write them into `src/talk/reel-segments.json` (`a`, `b`, `note` per take,
`outro` seconds, default 0; positive only for an approved end card), then:

```bash
scripts/cut.py <scratch>/words_all.whisper.json src/talk/reel-segments.json \
  --words-out src/talk/reel-words.json --fix "cloud=Claude" --phrase "Claude code=Claude Code"
```

It prints the edit timeline (edit start, original a-b, duration, text per
take), rewrites segments.json with frame counts, and writes the captions in
edit seconds. Read the caption text at the bottom; a missing word means a
cut point is inside it.

### 4. Plan the beats

Use only visuals that help the viewer follow the idea. Leave other lines
on the speaker. Plan the outline before editing and follow the preview
review process in `references/editing-style.md`.

| Spoken idea | Useful visual when needed |
|---|---|
| a key number | `SimpleCard` with the number and enough context to interpret it |
| a quotation | short exact excerpt with verified speaker/source attribution |
| a framework or question | a concise card, simple diagram, or survey illustration |
| an actual result or workflow | a legible screenshot or example, cleared of private information |
| a personal reflection or close | the speaker, often with no extra overlay |

The existing logo, meme, stamp, typing, and reaction components remain
available for an explicitly requested or approved treatment; their presence
in the library is not a requirement to use them. Some include sounds or
large motion: inspect and quiet them before using them in this preset.

Every beat time is an
ORIGINAL-recording second. `E(t)` in `Reel.tsx` maps it to an edit frame
through the takes and throws if `t` was cut, so a beat can never point at
material that is not in the video. A card may span a cut (`from` in one
take, `to` in the next) as long as the takes are in edit order.

### 5. Zoom grammar

`SNAPS` changes base framing; `PUSHES` adds a slow emphasis. Both use
original-recording seconds through `E()`. Start with two or three purposeful
changes for a one-minute reel, not one at every cut. Avoid stacked pushes
or crops that lose gestures. No automatic sound effects on framing changes.
Measure the face origin from the actual recording; `50% 29%` is only the
example. See `references/layout.md` for controls and preview checks.

### 6. Layout (1080x1920)

Use the actual recording and destination preview to place cards and
captions. `CARD_X=60`, `CARD_Y=990`, and `CAP_BOTTOM=450` are starting
coordinates from one recording, not universal platform safe zones.
`ReelCaptions` defaults to steady phrase captions with selected emphasis;
`SimpleCard` uses a quiet fade without sound. Keep one explanatory visual
at a time and captions in one or two readable lines. Protect the face,
hands, and platform controls. Read `references/layout.md` before layout QA.

### 7. Check stills and preview, then render

```bash
scripts/stills.sh TalkReel src/talk/reel-segments.json 12.7 14.8 22.6 25.9 58.3
```

One original second per beat (its landing moment), plus one per cut
(first frame of the new take) to inspect continuity. If an end card is used, add
`npx remotion still src/index.ts TalkReel out/reel/f_outro.png
--frame=<last-10>` for the end card. Look for: a card on the chin or hands, a row
wider than 870 px, a caption group colliding with the polaroids, a badge
wrapping to two lines, a chip label that should be empty, a beat that
lands after the sentence.

After still checks, render a representative 10–15 second excerpt using
Remotion's `--frames=<start>-<end>` flag (edit frames). Review according to
the style guide before the full render. An outline already approved by the
user does not need to be approved again.

```bash
scripts/render.sh TalkReel out/talk-reel.mp4
```

Detached, log in `out/reel/render.log`; 2500 portrait frames with one
OffthreadVideo source render at about 4 fps, 10 minutes. Watch the log
for `Rendered N/M`, any `error`, and the process going away
(`pgrep -f "[r]emotion render"`, the bracket keeps the pattern from
matching itself).

If the log says `ENOSPC: no space left on device` in
`/var/folders/.../react-motion-render*`, the disk is not full of frames:
the machine is swapping (check `sysctl vm.swapusage`) and eight headless
Chromes push the swap files onto the last gigabyte. Check `df -h /` before
every render; under 2 GB free, use

```bash
scripts/render-chunked.sh TalkReel out/talk-reel.mp4 420 2
```

which renders muted 420-frame chunks with two browser tabs, renders the
audio on its own, and joins them with ffmpeg (same log). Your own
leftovers to clear first: `out/reel/f_*.png`, whisper's `thead-*` temp
dirs, and headless Chrome processes older than the session
(`pgrep -fl chrome-headless-shell`). Anything else on the disk belongs to
the user; ask, with sizes, before removing it.

### 8. QA and deliver

Probe (duration = speech + outro, aac stream present), measure loudness
(`ebur128`; speech from a phone lands around -27 LUFS, lift it to about
-16 LUFS with `volume` plus `alimiter`, video stream copied), a contact
sheet at 4 s tiles, and a `silencedetect` pass over the whole output: a
silence longer than 0.8 s is a review cue, not an automatic deletion.
Listen for meaningful pauses, cut clicks, and over-loud effects. Check the
opening and ending, captions at phone size, truthful visual claims, and
current destination UI overlap. Deliver the MP4 and a 720p preview under
30 MB to the agreed output folder. In the handover, summarize take choices,
visual beats, and any unresolved limitations. Do not publish automatically.

## Rules that came from getting it wrong

- Transcribe the whole recording. Use its table to locate candidates,
  then listen/watch to judge expression and continuity.
- Cut on word times, never on whisper segment times; segments absorb the
  pause before a sentence.
- A word is kept when at least 0.1 s of it (or half of a short word) is
  inside the take. Keeping only words that start inside the take drops
  every "one", "of", "to" near a cut.
- Capitalise the first word of a take only when the previous kept word
  ended a sentence; a sentence can continue across a cut.
- Prefer clean cuts between takes; change framing only when it improves
  continuity or emphasis. Avoid distracting dissolves between repeated lines.
- Keep visuals readable and aligned with the spoken idea. Do not impose
  a reaction slot or fill every sentence with an overlay.
- When cutting a line, remove dependent text and visuals too. Do not move
  the removed claim onto an end card unless the user asks to retain it.
- Real numbers, real quotes, the speaker's words. The prompt card shows
  what they actually typed, shortened, not a better prompt.
- No em dashes anywhere in on-screen text.
- `public/talk/` and `public/memes/` are gitignored. Rendering needs the
  transcoded recording and whichever optional media the approved edit uses.

## Files

- `scripts/prep.sh` portrait transcode for Remotion
- `scripts/sheet.sh` timestamped contact sheet of any video
- `scripts/transcribe.py` whisper turbo to words json, with word fixes
- `scripts/cut.py` takes + whisper json to captions and the edit timeline
- `scripts/stills.sh` render and tile portrait check frames at original seconds, through the takes
- `scripts/render.sh` detached render with log
- `scripts/render-chunked.sh` the same in frame-range chunks with two browser tabs, for a swapping machine
- `assets/reel-overlays.tsx` the vertical components (captions, stamp list, quote card, strike, tree, prompt, REC, polaroids, GitHub card, end card, big logo, big emoji, meme, hero chips), copy into `src/talk/`
- `assets/Reel.example.tsx` a placeholder timeline on fictional timings, the reference for the wiring and pacing
- `assets/reel-segments.example.json` its placeholder cut
- `references/take-selection.md` how to choose takes, with a worked example on a fictional recording
- `references/layout.md` recording geometry, destination preview checks, and framing controls
- `references/editing-style.md` the creator's voice, defaults, adaptations, and outline/preview workflow
