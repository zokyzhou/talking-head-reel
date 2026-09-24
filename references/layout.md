# Vertical layout and framing

Read `editing-style.md` for the creative direction. The stage is 1080x1920;
placement depends on the recording and destination, not just its size.

## Measure the recording

Inspect a frame with `ffmpeg -vf drawgrid=width=108:height=192`. Locate the
face, chin, expressive hand movements, and available space. Inspect again
at the strongest crop. Move, resize, shorten, or omit cards that obscure
expressions or gestures. Do not reserve a permanent reaction slot.

The included fictional template uses these starting values:

| Control | Starting value | Purpose |
|---|---|---|
| Zoom origin | `50% 29%` | Face position in the example, remeasure for real footage |
| Card | x 60, y 990, width 870 | Below the example face; includes padding in its width |
| Captions | left 60, right 150, bottom 450 | Inset example caption area; verify current platform controls |
| Caption type | 58 px, warm white, weight 700 | Readable phrases; adjust after phone-size inspection |
| Accent | `#FFD166` | Selected important words or a key number |

These values are not certified safe zones. UI overlays vary with platform,
posting context, device, and caption length. For X, Xiaohongshu/RedNote,
TikTok, YouTube Shorts, or Instagram, inspect the current destination
preview when available. Keep critical text away from controls and expanded
captions. If no preview is available, use conservative insets and report
that the destination UI check remains outstanding; do not claim verification.

## Captions and explanatory visuals

`ReelCaptions` groups on punctuation, pauses, six words, or a 32-character
budget by default. All words in a phrase remain steady and readable;
`emphasisWords` selectively colors chosen terms, without word-by-word motion.
Adjust `groupSize`, `maxCharacters`, `size`, and `bottom` for the recording
and language. Chinese tokenization may require manually divided phrases;
inspect mixed-language and long words rather than assuming word count
ensures two lines. Never hide or truncate spoken words to make them fit.

Use one or two caption lines. Check every phrase, especially the longest,
at phone size. Maintain a gap between captions and cards. `SimpleCard`
fades quietly, contains no sound, and accepts `text`, optional source
`label`, position, width, size, and accent. Use short cards with enough time
to read them; show verified quotation excerpts with attribution. Screenshots
and diagrams should explain the spoken point rather than add new claims.

Legacy components remain available, but some bounce or include embedded
sound (`LogoRow`, `PromptCard`, `Takes`, and others). Inspect their behavior
before choosing them; they are not part of the default template.

## Framing

`useZoom` multiplies base framing (`SNAPS`) and emphasis (`PUSHES`):

- `SNAPS`: `[originalSecond, baseZoom][]`. Set the initial scale, then
  change it only for continuity or a change of thought. No cut sound.
- `PUSHES`: `{at, z, up, until, down}` with original seconds for `at` and
  `until`, frame counts for `up` and `down`, and relative multiplier `z`.
  A gentle example is 1.0 to 1.06 over 24 frames, then release over 18.

All original times go through `E()`. It throws for removed material. Avoid
stacking pushes and inspect the final multiplied crop. Two or three changes
per minute are a starting point, not a quota. Clean cuts can stand alone.

## Sound and ending

Retain short audio fades at take boundaries to prevent clicks. Listen to
the actual transitions. Keep voice clear and avoid automatic taps, pops,
or typing ticks. Occasional quiet effects and music are optional; verify
usage rights for the chosen track and destinations.

Set `outro` to 0 for the natural ending. A positive value enables the
optional freeze/end card in the template; replace its example labels and
URL only when that treatment is approved. Review the closing frame and
make sure it neither clips the last word nor adds empty waiting.

## Preview checks

Check the opening, strongest crop, each card, longest caption, every cut,
and final frame. Review the representative 10–15 second preview for rhythm,
voice, caption readability, gestures, and sound before completing the reel
as described in `editing-style.md`. A code build cannot validate these choices.
