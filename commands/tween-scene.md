---
description: Design and build a custom motion graphics scene or full video from a brief
argument-hint: "<describe the video: content, length, format, style>"
---

Build a custom motion graphics piece in the current Remotion project. Follow the tween skill, including its motion design principles and self-check.

Brief: $ARGUMENTS

Steps:
1. Confirm this is a Remotion project. If not, offer `/tween-new` first.
2. Fill gaps in the brief with defaults instead of asking many questions: 1920x1080, 30 fps, the length implied by the content, the project's `src/theme.ts` if it exists. State the assumptions in one line.
3. Write a beat sheet in frames and show it to the user before coding, as a short table: frame range, what happens, easing. For a one-scene piece, keep going without waiting. For a multi-scene video (3+ scenes), wait for a quick OK.
4. Build each scene as its own component in `src/scenes/`, composed with `<TransitionSeries>` (or `<Sequence>`s) in one main component. Reuse templates from the skill's `templates/` folder where they fit.
5. Put all user-facing text, numbers and colours in props with defaults.
6. Register the composition in `src/Root.tsx` with the correct total `durationInFrames` (remember transitions overlap).
7. Run `npx tsc --noEmit` and fix errors. Run the skill's self-check list.
8. Give the preview and render commands. Offer one concrete improvement they could ask for next (sound, a vertical version, a different colour scheme).
