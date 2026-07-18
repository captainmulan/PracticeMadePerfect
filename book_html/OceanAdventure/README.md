# Ocean Adventure — Book Structure Guide

**Author:** Jimmy Cooper  
**Target age:** 7–8  
**Chapters:** 32 standalone HTML files  

Follows the same flow as **Solar System Adventure** (reference: [../SolarSystem/README.md](../SolarSystem/README.md)).

Master template: [../README.md](../README.md)

---

## Chapter flow (aligned with Solar System)

| # | File | Type |
|---|------|------|
| 01 | `001-Book-Briefing.html` | Briefing + Jimmy Cooper author speech |
| 02 | `002-Index.html` | Table of contents |
| 03 | `003-Character-Selection.html` | Choose diver name + avatar |
| 04 | `004-Intro-OceanReefDefender.html` | **Intro game** — tap trash to save the reef |
| 05 | `005-Ocean-Overview.html` | Overview **activity** |
| 06 | `006-Ocean-Explained.html` | Overview **explained** |
| 07 | `007-Ocean-Quiz.html` | Overview **quiz** |
| 08–10 | Sunlight Zone | Activity → Explained → Quiz |
| 11–13 | Twilight Zone | Activity → Explained → Quiz |
| 14–16 | Midnight Zone | Activity → Explained → Quiz |
| 17–19 | Abyss Zone | Activity → Explained → Quiz |
| 20–22 | Coral Reefs | Activity → Explained → Quiz |
| 23–25 | Marine Mammals | Activity → Explained → Quiz |
| 26–28 | Fish | Activity → Explained → Quiz |
| 29 | `029-Conclusion.html` | Conclusion |
| 30 | `030-Ocean-Overall-Quiz.html` | **Overall quiz** (whole book) |
| 31 | `031-Outro-OceanTreasureRush.html` | **Outro game** — collect treasures, dodge jellyfish |
| 32 | `032-Congratulations.html` | Congratulations |

Each **topic triplet** = brief activity page (with **canvas minigame**) → detailed explained page → competitive quiz.

### Chapter minigames (activity pages)

| File | Game |
|------|------|
| `005-Ocean-Overview.html` | Zone Collector — catch ☀️🌅🌙🕳️, dodge trash |
| `008-Sunlight-Zone.html` | Sunshine Catch — catch 🐠🦀, dodge pollution |
| `011-Twilight-Zone.html` | Glow Hunt — tap ✨🦑 before they fade |
| `014-Midnight-Zone.html` | Biolume Blink — tap stars in the dark |
| `017-Abyss-Zone.html` | Abyss Dodge — survive 45s dodging debris |
| `020-Coral-Reefs.html` | Reef Rescue — tap 🪸, avoid 🗑️ |
| `023-Marine-Mammals.html` | Dolphin Dash — catch 🐟, avoid 🪼 |
| `026-Fish.html` | Plankton Feast — catch 🫧🦐, dodge 🦈 |

Regenerate with: `node _apply-ocean-games.cjs` (skips files that already have `.planet-game`).

---

## Design concept

| Principle | Implementation |
|-----------|----------------|
| Theme | Deep ocean gradient, `.bubbles` animated background |
| Accents | Teal `#64ffda`, yellow `#ffeb3b`, light blue `#80deea` |
| Structure | One standalone HTML file per chapter |
| Learning loop | Activity → Explained → Quiz (×9 topics including overview) |
| Bookends | Intro Reef Defender (004) + Outro Treasure Rush (031) |

---

## Filename convention

```
NNN-Slug.html
```

Same rules as Solar System: zero-padded `NNN`, Pascal-Case slug, suffixes `-Explained`, `-Quiz`.

---

## Page anatomy

- `.bubbles` background (not `.stars`)
- `.container` → `.header` → content → `.nav-hint`
- Quiz pages: VS bar, `quizCard-N` + `.active`, podium finish
- Games: overlay start/end, score + time + lives HUD

---

## Character / progress

Uses `OceanPlayer` in `003-Character-Selection.html` and `_ocean-player.js`:

| Key | Example |
|-----|---------|
| `userName` | Explorer |
| `userCharacter` | 🤿 |
| `characterName` | Diver |

Also mirrored to global `userName` / `userCharacter` for quiz pages.

---

## Quiz opponents

| Quiz | VS character |
|------|----------------|
| Ocean overview | Captain Coral 🪸 |
| Sunlight | Sunny Ray |
| Twilight | Dusk Diver |
| Midnight | Midnight Molly |
| Abyss | Abyss Ace |
| Coral | Reef Rex |
| Marine Mammals | Whale Wilma |
| Fish | Finn Fish |
| Overall (030) | Professor Pearl 🐚 |

---

## Shared files

```
OceanAdventure/
  _ocean-player.js           # localStorage helper
  _gen-index-grid.cjs        # Regenerate 002 index badges from chapter list
  *.html                     # Chapters — no build step
```

When extending zone activity pages, copy minigame patterns from Solar System (`game-overlay`, HUD, canvas loop) and theme with `drawBubbles` instead of `drawStarfield`.

---

## Adding a new topic

1. Insert three files at the next free `NNN` block (Activity → Explained → Quiz)
2. Shift Conclusion / Overall / Outro / Congratulations numbers if needed
3. Update `002-Index.html` (run `_gen-index-grid.cjs` after editing chapter list)
4. Update this README chapter table

---

## Related

- Reference structure: [../SolarSystem/README.md](../SolarSystem/README.md)
- Master guide: [../README.md](../README.md)
