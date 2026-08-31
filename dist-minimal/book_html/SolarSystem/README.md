# Solar System Adventure — Book Structure Guide

**Author:** Jimmy Cooper  
**Target age:** 7–8  
**Chapters:** 43 standalone HTML files  

This folder is the **reference implementation** for all Magic Library interactive books. Copy this structure when creating a new title under `book_html/`.

Master template: [../README.md](../README.md)

---

## Canonical chapter flow

Every book should follow this order:

| # | Type | Solar System file | Purpose |
|---|------|-------------------|---------|
| 01 | Briefing | `001-Book-Briefing.html` | About book, author **Jimmy Cooper**, author speech |
| 02 | Index | `002-Index.html` | Table of contents (numbers match filenames) |
| 03 | Character | `003-Character-Selection.html` | Name + avatar → `localStorage` |
| 04 | **Intro game** | `004-Intro-SolarSystemDefender.html` | High-quality arcade hook |
| 05–07 | Overview triplet | `005` activity → `006` Explained → `007` Quiz | First topic block |
| 08–40 | Topic triplets | Sun, planets, meteors, black holes | Activity → Explained → Quiz |
| 41 | Conclusion | `041-Conclusion.html` | Summary |
| 42 | **Outro game** | `042-Outtro-SpaceMissionSurvival.html` | Unique finale (not a repeat minigame) |
| 43 | Congratulations | `043-Congratulations.html` | Celebration / certificate tone |

> **Pattern for other books:** use `050-*-Congratulations.html` if you need more than 43 chapters (Ocean uses `032`).

### Topic triplet (repeat)

1. **`NNN-Topic.html`** — Brief explain + **mini game** (planet viewer SVG, canvas game)
2. **`NNN-Topic-Explained.html`** — Detailed reading
3. **`NNN-Topic-Quiz.html`** — Quiz time (VS opponent, podium)

---

## Design concept

| Principle | What it means |
|-----------|----------------|
| **One file = one chapter** | Easy to reorder, replace, or open alone in a browser |
| **Kid-first UX** | Comic Sans MS, emoji icons, short sentences, touch-friendly buttons |
| **Learn → Play → Test** | Activity → Explained → Quiz per topic |
| **Visual identity** | Dark space background (`.stars`, `#0f0c29`), purple/gold accents |
| **Bookends** | Strong **intro game** (004) and **outro game** before Congratulations |

---

## Filename convention

```
NNN-Slug.html
```

- **NNN** — Three-digit order (`001`–`043`). Shell sorts by this prefix.
- **Slug** — Pascal-Case words separated by hyphens.

Examples:
- `004-Intro-SolarSystemDefender.html` — intro arcade
- `008-The-Sun.html` — activity + minigame
- `010-The-Sun-Quiz.html` — quiz for that topic

---

## Full chapter map (43 files)

| # | File | Type |
|---|------|------|
| 01 | `001-Book-Briefing.html` | Briefing + author message |
| 02 | `002-Index.html` | Index |
| 03 | `003-Character-Selection.html` | Character select |
| 04 | `004-Intro-SolarSystemDefender.html` | **Intro game** |
| 05 | `005-OurSolarSystem-AllPlanets.html` | Overview activity (orbital SVG) |
| 06 | `006-OurSolarSystem-Explained.html` | Overview reading |
| 07 | `007-OurSolarSystem-Quiz.html` | Overview quiz |
| 08–10 | Sun | Activity → Explained → Quiz |
| 11–13 | Mercury | |
| 14–16 | Venus | |
| 17–19 | Earth | |
| 20–22 | Mars | |
| 23–25 | Jupiter | |
| 26–28 | Saturn | |
| 29–31 | Uranus | |
| 32–34 | Neptune | |
| 35–37 | Meteors | Shield tap game |
| 38–40 | Black Holes | Orbit escape game |
| 41 | `041-Conclusion.html` | Conclusion |
| 42 | `042-Outtro-SpaceMissionSurvival.html` | **Outro game** |
| 43 | `043-Congratulations.html` | Congratulations |

---

## Page anatomy

```html
<body>
  <div class="stars"></div>
  <div class="container">
    <div class="header">…</div>
    <!-- topic content -->
    <div class="nav-hint">…</div>
  </div>
  <script>…</script>
</body>
```

### Required UI blocks

- **`.nav-hint`** — ← → and 🏠 reminder on every page
- **Quiz pages** — `.competition-bar`, one `.quiz-card.active`, podium `.score-card`
- **Minigames** — start/end overlays, `⏱ Xs | ❤️❤️❤️` HUD

---

## Character / progress (`localStorage`)

| Key | Example | Set in |
|-----|---------|--------|
| `userName` | Ariel | `003-Character-Selection.html` |
| `userCharacter` | 👨‍🚀 | same |
| `characterName` | Astronaut | same |

Quizzes call `loadPlayerInfo()` on load.

---

## Shared assets & tooling

```
SolarSystem/
  assets/planets/          # JPG textures (CC BY 4.0)
  _planet-texture-art.js   # StylizedPlanet SVG art (embedded into HTML)
  _apply-solar-fixes.cjs   # Bulk patcher for mobile/quiz/game fixes
  scripts/gen_planet_textures.py
  *.html                   # Chapters only — no build required
```

### Planet viewer (`StylizedPlanet`)

- Spin / zoom / rotate; `defaultPlanetZoom(svg, planetType)` fits Sun rings / Saturn on load
- NASA-style textures via `_planet-texture-art.js`

### Minigame conventions

| Topic | Game | Timer | Lives |
|-------|------|-------|-------|
| Sun | Solar Climb (platforms) | 90s | 3 |
| Earth | Space station builder | 90s | 3 |
| Mars | Rover explore | 75s | 3 |
| Jupiter | Storm escape | 30s | 3 |
| Saturn | Ring dodge | 60s | 3 |
| Uranus | Ice maze | 60s | 3 |
| Neptune | Deep dive | 90s | 3 |
| Meteors | Meteor Shield (tap) | 60s | 3 |
| Black Holes | Orbit Escape | 60s | 3 |

**Platform camera:** keep player in world coordinates; subtract `camY` only when drawing.

---

## Adding a new book (checklist)

1. Copy this flow: Briefing → Index → Character → **Intro game**
2. Add overview triplet (optional) then topic triplets
3. End with Conclusion → **Overall quiz** (optional) → **Outro game** → Congratulations
4. Swap `.stars` for book theme (e.g. `.bubbles` for ocean)
5. Document chapter map in `YourBook/README.md`

---

## Related books

- **Ocean Adventure** — Same structure; 32 chapters. See [../OceanAdventure/README.md](../OceanAdventure/README.md).
