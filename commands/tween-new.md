---
description: Create a new Remotion motion graphics project, ready to preview
argument-hint: "[project-name] [what the video is about]"
---

Create a new Remotion project for motion graphics. Follow the tween skill.

Arguments: $ARGUMENTS
(First word is the project name if it looks like one; default `my-motion`. The rest is the brief.)

Steps:
1. Check Node.js is installed (`node --version`, need 18+). If not, tell the user to install the LTS from nodejs.org and stop.
2. Make sure the current folder is a sensible place (not a home directory full of unrelated files, not inside another project). If unsure, ask once.
3. Scaffold a blank project:
   `npx create-video@latest --yes --blank --no-tailwind <project-name>`
   then `cd <project-name>` and `npm i`.
4. Install the packages motion graphics usually need:
   `npm i @remotion/transitions @remotion/google-fonts @remotion/paths`
5. Create `src/theme.ts` with background, primary, accent colours and one font loaded through `@remotion/google-fonts` (Inter by default).
6. If the user gave a brief, plan the beat sheet in frames and build the first composition in `src/scenes/` + `src/Root.tsx`. If not, copy the TitleReveal template from the tween skill's `templates/` folder as a starting point and register it.
7. Run `npx tsc --noEmit` if TypeScript is set up and fix any errors.
8. Finish by telling the user exactly:
   - `cd <project-name>`
   - `npx remotion studio` to preview
   - `npx remotion render <CompositionId> out/video.mp4` to export
