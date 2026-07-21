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
| 04 | `004-Intro-OceanReefDefender.html` | **Intro game** — relaxing aquarium sandbox (paint fish, coral & rocks) |
| 05 | `005-Ocean-Overview.html` | Overview **activity** — multi-view zone explorer + Zone Collector game |
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

Each chapter has a **unique** game mechanic via `_ocean-games.js`:

| File | Game | Mechanic |
|------|------|----------|
| `005-Ocean-Overview.html` | Zone Sort | Catch ☀️→🌅→🌙→🕳️ in order |
| `008-Sunlight-Zone.html` | Sunbeam Snap | Tap fish only in the sunbeam |
| `011-Twilight-Zone.html` | Glow Rhythm | Tap on pulse beat |
| `014-Midnight-Zone.html` | Sonar Ping | Tap when sonar reveals creatures |
| `017-Abyss-Zone.html` | Trench Pilot | ⬆️⬇️ steer through gaps |
| `020-Coral-Reefs.html` | Reef Match | Memory card pairs |
| `023-Marine-Mammals.html` | Breath Dive | O₂ bar + surface to breathe |
| `026-Fish.html` | School Run | 3-lane dodge runner |

Install / refresh: `node _replace-ocean-minigames.cjs`

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
  _ocean-player.js              # OceanPlayer localStorage helper
  _shared-ocean-ui-blocks.mjs   # Shared audit CSS / body-class helpers
  _apply-ocean-fixes.cjs        # Align all chapters with Solar System UI structure
  _apply-ocean-games.cjs        # Inject canvas minigames into activity pages
  _fix-ocean-game-visibility.cjs # DPR canvas + emoji halos for minigames
  _gen-index-grid.cjs           # Regenerate 002 index badges from chapter list
  *.html                        # Chapters — no build step
```

### Maintenance scripts

```bash
node book_html/OceanAdventure/_apply-ocean-fixes.cjs
node book_html/OceanAdventure/_fix-ocean-game-visibility.cjs
node book_html/OceanAdventure/_patch-ocean-facing.cjs
```

`_apply-ocean-fixes.cjs` adds Solar System–style body classes (`reading-page`, `big-planet-page`, `big-game-page`), mobile audit CSS, `OceanPlayer` on every page, quiz DOM/player fixes, scroll cues, and intro/outro game polish.

`_patch-ocean-facing.cjs` flips fish/animal emoji sprites to face their movement direction in canvas mini-games. Shared helper: `_ocean-draw.js` (`OceanDraw.drawEmoji`).

---

## Page types (Solar System parity)

| Type | Body class | Examples |
|------|------------|----------|
| Reading / explained / quiz | `reading-page` | 001, 006–007, 009–010, … |
| Character select | `reading-page character-select-page` | 003 |
| Activity + minigame | `big-planet-page` or `all-zones-page` | 005 (multi-view), 008, 011, … |
| Intro / outro arcade | `big-game-page` | 004, 031 |

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
