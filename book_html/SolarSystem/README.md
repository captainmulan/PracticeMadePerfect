# Solar System Adventure — Book Structure Guide

This folder contains **37 standalone HTML chapters** for an interactive space ebook aimed at ages 7–8. Each file is self-contained (embedded CSS + JavaScript). Navigation between chapters is handled by the **parent ebook shell** using the numeric prefix in each filename (`001`, `002`, …).

Use this document as the blueprint when creating the next book in `book_html/`.

---

## Design concept

| Principle | What it means |
|-----------|----------------|
| **One file = one chapter** | Easy to reorder, replace, or open in the browser alone. |
| **Kid-first UX** | Comic Sans MS, emoji icons, short sentences, touch-friendly buttons. |
| **Learn → Play → Test** | Each topic: interactive intro, explained reading, competitive quiz. |
| **Visual identity** | Dark space background (`#0f0c29`), twinkling `.stars`, purple/gold accents. |
| **Progressive games** | Intro arcade → planet minigames → unique finale (no repeated “move left/right” for the last chapter). |

---

## Filename convention

```
NNN-Slug.html
```

- **NNN** — Three-digit order (001–037). The shell sorts chapters by this number.
- **Slug** — Human-readable topic, Pascal-Case words separated by hyphens.

Examples:
- `004-Intro-SolarSystemDefender.html` — intro arcade game
- `008-The-Sun.html` — planet chapter with viewer + minigame
- `010-The-Sun-Quiz.html` — quiz for that topic

---

## Chapter map (37 files)

| # | File | Type | Purpose |
|---|------|------|---------|
| 01 | `001-Book-Briefing.html` | Intro | Cover, learning goals, how to use the book |
| 02 | `002-Index.html` | Index | Chapter list with badges (matches file numbers) |
| 03 | `003-Character-Selection.html` | Setup | Name + avatar → `localStorage` → start adventure |
| 04 | `004-Intro-SolarSystemDefender.html` | **Intro game** | Arcade hook before main content |
| 05 | `005-OurSolarSystem-AllPlanets.html` | Animation | All planets SVG / orbital view |
| 06 | `006-OurSolarSystem-Explained.html` | Reading | System overview text |
| 07 | `007-OurSolarSystem-Quiz.html` | Quiz | Competitive quiz + podium |
| 08–10 | `008`–`010` | Sun trio | Planet page, Explained, Quiz |
| 11–13 | Mercury | | |
| 14–16 | Venus | | |
| 17–19 | Earth | | |
| 20–22 | Mars | | |
| 23–25 | Jupiter | | |
| 26–28 | Saturn | | |
| 29–31 | Uranus | | |
| 32–34 | Neptune | | |
| 35 | `035-Conclusion.html` | Reading | Summary |
| 36 | `036-Outtro-*.html` | **Finale action game** | Defend the Sun — aim and blast (e.g. Solar Core Blitz) |
| 37 | `037-Congratulations.html` | End | Celebration / certificate tone |

**Planet trio pattern** (repeat for Sun + 8 planets):

1. **NNN-Topic.html** — Interactive planet viewer (`StylizedPlanet` / texture art), fun facts, **canvas minigame**
2. **NNN-Topic-Explained.html** — Reading cards, stats, missions
3. **NNN-Topic-Quiz.html** — VS quiz with computer opponent + podium

---

## Page anatomy (standard chapter)

```html
<!DOCTYPE html>
<html>
<head>
  <!-- title, viewport, embedded <style> -->
</head>
<body>
  <div class="stars"></div>           <!-- theme background -->
  <div class="container">
    <div class="header">...</div>       <!-- h1 + subtitle -->
    <!-- topic-specific content -->
    <div class="nav-hint">...</div>     <!-- shell navigation reminder -->
  </div>
  <script>...</script>                <!-- embedded JS only -->
</body>
</html>
```

### Required UI blocks

- **`.nav-hint`** — Reminds kids to use ← → and 🏠 in the shell (every chapter).
- **Quiz pages** — `.competition-bar` (player vs bot), one `.quiz-card.active` at a time, `.score-card` with **podium**.
- **Minigames** — `#startScreen` / `#endScreen` overlays, HUD: `⏱ Xs | ❤️❤️❤️`, starfield canvas background.

---

## Character / progress (`localStorage`)

Set in `003-Character-Selection.html`:

| Key | Example | Used in |
|-----|---------|---------|
| `userName` | Ariel | Quiz headers, podium |
| `userCharacter` | 👨‍🚀 | Quiz player icon |
| `characterName` | Astronaut | Optional label |

Quizzes read these on load (`loadPlayerInfo()`).

---

## Planet viewer (`StylizedPlanet`)

Shared logic lives in `_planet-texture-art.js` (source) and is **embedded** in planet HTML files via `_apply-art.cjs` when bulk-updating.

Features:
- NASA-style texture maps in `assets/planets/`
- Spin / zoom / rotate controls; button shows **Stop** when spinning
- Saturn: back ring → sphere → front ring (`ensureSaturnRingClips`)

---

## Minigame conventions

| Planet | Game style | Timer | Lives |
|--------|------------|-------|-------|
| Sun | Solar Climb (platform jump) | 90s | 3 |
| Earth | Space station builder | 90s | 3 |
| Mars | Rover explore | 75s | 3 |
| Jupiter | Storm escape (vertical) | 30s | 3 |
| Saturn | Ring dodge | 60s | 3 |
| Uranus | Ice maze | 60s | 3 |
| Neptune | Deep dive | 90s | 3 |

Shared helpers (copy into each game script):
- `drawStarfield()`, `formatHudTimeLives()`, `startHudTimer()`, `loseLife()`

**Camera note (platform games):** Keep player position in **world coordinates**; only subtract `camY` when drawing. Never assign screen coordinates back to the player after collision.

---

## Quiz conventions

Reference: `010-The-Sun-Quiz.html`

- 5–6 questions per quiz
- One question visible at a time (`quizCard-N` + `.active`)
- Computer opponent scores ~70% random correct
- End screen: Olympic-style **podium** (🥇 🥈), retry + continue buttons
- Ocean-themed books: swap `.stars` for `.bubbles`, adjust accent colors

---

## Assets

```
SolarSystem/
  assets/planets/     # JPG textures (Solar System Scope, CC BY 4.0)
  _planet-texture-art.js
  *.html              # chapters only — no build step required
```

---

## Adding a new book (checklist)

1. Create folder under `book_html/YourBook/`
2. Copy `001-Book-Briefing.html` + `002-Index.html` structure; retitle theme (colors, background class)
3. Number files `001` … `NNN`; keep slugs descriptive
4. Add **intro game** early (004) and **unique finale** before Congratulations
5. Use **triplets** for each topic: Activity → Explained → Quiz
6. Embed all CSS/JS; no external bundler
7. Add `README.md` in the book folder documenting your chapter map
8. Update root `book_html/README.md` with one summary section

---

## Presenting to kids

- Start with **Briefing → Index → Character → Intro game** so the first screen is playful, not text-heavy.
- Alternate **reading** and **doing** every few chapters.
- Quizzes use friendly competition (VS a named character, not harsh failure).
- Finale game should feel **different** from chapter minigames — memory, puzzle, or sequence beats another shooter.
- End on **Congratulations** with positive, certificate-style copy.

---

## Related books

- **Ocean Adventure** — Same triplet + quiz pattern; ocean palette (`.bubbles`, teal accents). See `../OceanAdventure/README.md`.
