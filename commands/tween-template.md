---
description: Add a ready-made motion graphics template (title, lower third, stats, kinetic text, logo, bar chart, Apple-style, editorial showreel, warm studio, creator captions)
argument-hint: "<title|lowerthird|stats|kinetic|logo|chart|apple-headline|apple-product|apple-bento|editorial-title|editorial-stats|type-stack|warm-path|warm-tagline|captions|split-compare> [your text, colours, format]"
---

Add a Tween template to the current Remotion project. Follow the tween skill.

Request: $ARGUMENTS

Templates (in the tween skill's `templates/` folder):

| Keyword | File | Good for |
|---|---|---|
| title | TitleReveal.tsx | Intros, chapter cards |
| lowerthird | LowerThird.tsx | Name/role overlays on footage |
| stats | StatCounter.tsx | Animated numbers, year-in-review |
| kinetic | KineticText.tsx | Punchy social text, ads |
| logo | LogoReveal.tsx | Brand intros/outros |
| chart | BarChart.tsx | Data stories |
| apple-headline | AppleHeadline.tsx | Keynote-style statement, 1-3 lines with gradient highlight |
| apple-product | AppleProductReveal.tsx | Product launch opener (uses a PNG from public/, or a placeholder device) |
| apple-bento | AppleBento.tsx | "By the numbers" bento grid with counting values |
| editorial-title | EditorialTitle.tsx | Showreel title / end card: capitals rise with motion blur, accent dot drops in |
| editorial-stats | EditorialStats.tsx | Big numbers on hairline rows, digits roll like a slot machine |
| type-stack | TypeStack.tsx | Section opener: one word repeated in solid/outline rows with corner HUD |
| warm-path | WarmPathDemo.tsx | Sketch vs final: rough path draws, glowing orb smooths it on a grid panel |
| warm-tagline | WarmGlowTagline.tsx | Warm end card: glowing starburst, floating cards, italic serif tagline |
| captions | WordCaptions.tsx | One caption word at a time over the user's video (takes @remotion/captions data) |
| split-compare | SplitCompare.tsx | Split-screen tutorial: before/after clips, red banner, presenter video |

Steps:
1. Confirm this is a Remotion project (`remotion` in package.json). If not, suggest `/tween-new` and stop.
2. If no keyword was given or it's unclear, list the table above and ask which one.
3. Copy the template into `src/templates/` (keep the file name), unchanged except for imports that need adjusting.
4. Fill its props from the user's request (text, colours, numbers). Keep the template's exported defaults as the fallback.
5. Register a `<Composition>` in `src/Root.tsx`. Defaults: 1920x1080, 30 fps. Pick a duration that gives the text time to read (title ~4 s, lower third ~5 s, stats ~5 s, logo ~4 s, chart ~6 s, apple-headline ~4 s, apple-product ~5 s, apple-bento ~5 s, editorial-title ~4 s, editorial-stats ~5 s, type-stack ~4 s, warm-path ~6 s, warm-tagline ~5 s, split-compare = length of the presenter clip, kinetic = lines x framesPerLine, captions = `wordCaptionsDuration(props, fps)`). If they asked for vertical/square, register that size; the templates scale automatically.
6. For an `apple-*` template, also read the skill's `references/apple-style.md` and keep its rules (no bounce, one gradient, Inter not SF Pro, no Apple logos or product names). For `editorial-*` and `type-stack` read `references/editorial-showreel.md`, for `warm-*` read `references/warm-studio.md`, for `captions` and `split-compare` read `references/creator-captions.md`. These templates load their fonts from `@remotion/google-fonts`; install it if the project lacks it (`npm i @remotion/google-fonts`). For `captions` and `split-compare`, put the user's media in `public/` and pass the file names.
7. For a lower third meant for editing software, set `transparent: true` and give the ProRes 4444 render command from the skill's `references/rendering.md`.
8. Type-check, then give the preview and render commands.
