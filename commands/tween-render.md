---
description: Render a Remotion composition to MP4, GIF, PNG still or transparent video
argument-hint: "[CompositionId] [mp4|gif|still|transparent|4k] [output-name]"
---

Render a composition from the current Remotion project. Use the tween skill's `references/rendering.md`.

Request: $ARGUMENTS

Steps:
1. Read `src/Root.tsx` (or wherever compositions are registered) and list the composition IDs.
2. If no ID was given and there is more than one, ask which. If there is exactly one, use it.
3. Choose the command from the requested format (default mp4):
   - mp4: `npx remotion render <id> out/<name>.mp4`
   - 4k: add `--scale=2` to a 1080p composition
   - gif: `npx remotion render <id> out/<name>.gif --codec=gif --every-nth-frame=2`
   - still: `npx remotion still <id> out/<name>.png --frame=<a frame where everything is visible>`
   - transparent: `npx remotion render <id> out/<name>.mov --codec=prores --prores-profile=4444 --pixel-format=yuva444p10le` (warn if the component paints a background)
4. Run the render. If it fails, read the error, match it against the "Common errors" table in the reference, fix the code, and retry once.
5. Report the output path and file size.
