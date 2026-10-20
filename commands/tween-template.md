---
description: Add a ready-made motion graphics template (title, lower third, stats, kinetic text, logo, bar chart)
argument-hint: "<title|lowerthird|stats|kinetic|logo|chart> [your text, colours, format]"
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

Steps:
1. Confirm this is a Remotion project (`remotion` in package.json). If not, suggest `/tween-new` and stop.
2. If no keyword was given or it's unclear, list the table above and ask which one.
3. Copy the template into `src/templates/` (keep the file name), unchanged except for imports that need adjusting.
4. Fill its props from the user's request (text, colours, numbers). Keep the template's exported defaults as the fallback.
5. Register a `<Composition>` in `src/Root.tsx`. Defaults: 1920x1080, 30 fps. Pick a duration that gives the text time to read (title ~4 s, lower third ~5 s, stats ~5 s, logo ~4 s, chart ~6 s, kinetic = lines x framesPerLine). If they asked for vertical/square, register that size; the templates scale automatically.
6. For a lower third meant for editing software, set `transparent: true` and give the ProRes 4444 render command from the skill's `references/rendering.md`.
7. Type-check, then give the preview and render commands.
