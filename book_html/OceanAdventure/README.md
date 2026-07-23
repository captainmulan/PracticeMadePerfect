# Ocean Adventure — Book Structure Guide

**Author:** Jimmy Cooper  
**Target age:** 7–8  
**Chapters:** 32 standalone HTML files  

Follows the same flow as **Solar System Adventure** (reference: [../SolarSystem/README.md](../SolarSystem/README.md)), with **Dinosaur Discovery**–style painted PNG scenes embedded in each HTML file (Solar System data-URI pattern — no external image fetch).

Master template: [../README.md](../README.md)

---

## Page structure (2026 refresh)

### Activity pages (`008`, `011`, … + overview `005`)

Each topic activity follows:

**picture → story → explanation → press words to hear** (×3) → **mini-game**

| Block | What it shows |
|-------|----------------|
| **Picture** | 16:9 painted PNG scene (`<img class="chapter-hero-img">` from embedded data URI) |
| **Story** | Kai + guide narrative in `.story-box` |
| **Explanation** | Factual summary in `.explain-box` |
| **Press words to hear** | `.speak-chip` buttons → `OceanSpeak.chip()` (Web Speech API) |
| **Mini-game** | Canvas game via `OceanGame.boot()` at bottom |

### Explained pages (`006`, `009`, …)

**picture → story → explanation** (×3) — deeper content, no vocabulary chips, no game.

### Quiz pages (`007`, `010`, …)

Solar System VS bar + 5 questions + podium finish. Uses `OceanPlayer` for name/avatar.

### Overview (`005-Ocean-Overview.html`)

**Four painted views** (embedded PNG, no canvas/SVG heroes):

| View | Image slot | Concept |
|------|------------|---------|
| View1 | `overview-view-1` | Depth chart — five ocean zones |
| View2 | `overview-view-2` | Surface & depth split |
| View3 | `overview-view-3` | Sonar depth rings |
| View4 | `overview-view-4` | Submarine porthole |

Tap the view to learn zone facts. Scroll down for **Zone Sort** mini-game.

---

## Chapter flow

| # | File | Type |
|---|------|------|
| 01 | `001-Book-Briefing.html` | Briefing + author speech |
| 02 | `002-Index.html` | Table of contents |
| 03 | `003-Character-Selection.html` | Choose diver name + avatar |
| 04 | `004-Intro-OceanReefDefender.html` | Intro game — reef sandbox |
| 05 | `005-Ocean-Overview.html` | Overview — 4 PNG views + Zone Sort |
| 06 | `006-Ocean-Explained.html` | Overview explained (×3 scenes) |
| 07 | `007-Ocean-Quiz.html` | Overview quiz |
| 08–10 | Sunlight Zone | Activity → Explained → Quiz |
| 11–13 | Twilight Zone | Activity → Explained → Quiz |
| 14–16 | Midnight Zone | Activity → Explained → Quiz |
| 17–19 | Abyss Zone | Activity → Explained → Quiz |
| 20–22 | Coral Reefs | Activity → Explained → Quiz |
| 23–25 | Marine Mammals | Activity → Explained → Quiz |
| 26–28 | Fish | Activity → Explained → Quiz |
| 29 | `029-Conclusion.html` | Conclusion |
| 30 | `030-Ocean-Overall-Quiz.html` | Overall quiz |
| 31 | `031-Outro-OceanTreasureRush.html` | Outro game |
| 32 | `032-Congratulations.html` | Congratulations |

---

## Chapter minigames

| File | Game | Mechanic |
|------|------|----------|
| `005-Ocean-Overview.html` | Zone Sort | Catch ☀️→🌅→🌙→🕳️→⛰️ in order |
| `008-Sunlight-Zone.html` | Sunbeam Snap | Tap fish in the sunbeam |
| `011-Twilight-Zone.html` | Glow Rhythm | Tap on pulse beat |
| `014-Midnight-Zone.html` | Sonar Ping | Tap when sonar reveals creatures |
| `017-Abyss-Zone.html` | Trench Pilot | ⬆️⬇️ steer through gaps |
| `020-Coral-Reefs.html` | Reef Match | Memory card pairs |
| `023-Marine-Mammals.html` | Breath Dive | O₂ bar + surface to breathe |
| `026-Fish.html` | School Run | 3-lane dodge runner |

---

## Design concept

| Principle | Implementation |
|-----------|----------------|
| Theme | Deep ocean gradient, `.bubbles` animated background |
| Accents | Teal `#64ffda`, yellow `#ffeb3b`, light blue `#80deea` |
| Illustrations | **Painted PNG** embedded as base64 in `_ocean-chapter-images.js` |
| Vocabulary | **Press words to hear** via `_ocean-speak.js` |
| Structure | One standalone HTML file per chapter |
| Learning loop | Activity → Explained → Quiz (×8 topics including overview) |

---

## Shared files

```
OceanAdventure/
  _ocean-data.js                # Chapter stories, words, quiz Q&A, game configs
  _ocean-chapter-images.js      # ~52 embedded PNG scenes (generated)
  _ocean-scenes.js              # OceanScene.boot() — injects <img> into scene slots
  _ocean-speak.js               # OceanSpeak — press words to hear (TTS)
  _ocean-player.js              # OceanPlayer localStorage helper
  _ocean-games.js               # Shared minigame engine (8 game types)
  _ocean-draw.js                # Canvas emoji helpers (minigames only)
  _generate-book.cjs            # Regenerate activity / explained / quiz HTML
  scripts/
    gen_ocean_art.py            # Generate source PNGs (PIL)
    gen_chapter_images.cjs      # PNG → _ocean-chapter-images.js
  assets/                       # Source PNGs ({chapter}-{slot}.png)
  *.html                        # Standalone chapters
```

### Build pipeline

```bash
# 1. Generate / refresh source PNG illustrations
python book_html/OceanAdventure/scripts/gen_ocean_art.py

# 2. Embed all PNGs as data URIs (single-file, no fetch)
node book_html/OceanAdventure/scripts/gen_chapter_images.cjs

# 3. Regenerate activity, explained, and quiz HTML from _ocean-data.js
node book_html/OceanAdventure/_generate-book.cjs
```

Replace a hero illustration: edit PNG in `assets/`, re-run steps 2–3.

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
| Marine Mammals | Whale Wilma 🐋 |
| Fish | Finn Fish |
| Overall (030) | Professor Pearl 🐚 |

---

## Related

- Reference structure: [../SolarSystem/README.md](../SolarSystem/README.md)
- Scene pattern: [../Dinosaur Discovery/README.md](../Dinosaur%20Discovery/README.md)
- Master guide: [../README.md](../README.md)
