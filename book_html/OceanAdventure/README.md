# Ocean Adventure — Book Structure Guide

Interactive ocean ebook for ages 7–8. Follows the same conventions as **Solar System Adventure** (see `../SolarSystem/README.md`).

---

## Design concept

| Principle | Implementation |
|-----------|----------------|
| Theme | Deep ocean gradient, `.bubbles` animated background |
| Accents | Teal `#64ffda`, yellow `#ffeb3b`, light blue `#80deea` |
| Structure | Standalone HTML, one chapter per file |
| Learning loop | Zone intro → Explained → Quiz (×8 topics) |

---

## Chapter map (28 files)

| # | File | Type |
|---|------|------|
| 01 | `001-Book-Briefing.html` | Introduction |
| 02 | `002-Index.html` | Chapter index |
| 03 | `003-Ocean-Overview.html` | Overview + interaction |
| 04 | `004-Ocean-Explained.html` | Reading |
| 05 | `005-Ocean-Quiz.html` | Quiz (VS Captain Coral) |
| 06–08 | Sunlight Zone | Intro / Explained / Quiz |
| 09–11 | Twilight Zone | |
| 12–14 | Midnight Zone | |
| 15–17 | Abyss Zone | |
| 18–20 | Coral Reefs | |
| 21–23 | Marine Mammals | |
| 24–26 | Fish | |
| 27 | `027-Conclusion.html` | Summary |
| 28 | `028-Congratulations.html` | Celebration |

Each **zone triplet** mirrors Solar System planet triplets: activity page → explained → competitive quiz.

---

## Quiz UI (aligned with Solar System)

All `*-Quiz.html` files include:

- **VS competition bar** — player (from `localStorage` if set) vs themed ocean opponent
- **One question at a time** — `quizCard-N` with `.active`
- **Podium finish** — 🥇 🥈 with retry + continue
- **`.nav-hint`** — shell navigation reminder

Opponents: Captain Coral, Sunny Ray, Dusk Diver, Midnight Molly, Abyss Ace, Reef Rex, Whale Wilma, Finn Fish.

---

## Differences from Solar System

| Feature | Solar System | Ocean Adventure |
|---------|--------------|-----------------|
| Background | `.stars` on `#0f0c29` | `.bubbles` on blue gradient |
| Character select | `003-Character-Selection.html` | Uses defaults (`Explorer` / 🧑‍🚀) |
| Intro arcade | `004-Intro-SolarSystemDefender.html` | Not yet — add when expanding |
| Planet/zone viewer | Texture-mapped SVG planets | Tap-to-fact sun/creatures on zone pages |
| Minigames | Canvas games on planet pages | Room to add per-zone canvas games |

When extending Ocean Adventure, copy minigame patterns from Solar System (`game-overlay`, time/lives HUD, `drawStarfield` → `drawBubbles`).

---

## Adding content

1. Keep filename prefix in sync with index badges.
2. Match card layout: `.header`, `.card`, `.fact-box`, `.nav-hint`.
3. Upgrade new quizzes using `010-The-Sun-Quiz.html` or an existing Ocean quiz as template.
4. Update this README chapter table when adding files.

---

## Related

- Master guide: `../SolarSystem/README.md`
- Root index: `../README.md`
