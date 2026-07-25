# Continents Adventure — Book Structure Guide

**Author:** Jimmy Cooper  
**Target age:** 7–8  
**Chapters:** 35 standalone HTML files  

Follows the same flow as **Ocean Adventure** ([../OceanAdventure/README.md](../OceanAdventure/README.md)), with painted PNG scenes embedded in each HTML file (Solar System data-URI pattern — no external image fetch).

Master template: [../README.md](../README.md)

---

## Page structure

### Activity pages (`008`, `011`, … + overview `005`)

Each topic activity follows:

**picture → story → explanation → press words to hear** (×3) → **mini-game**

### Explained pages (`006`, `009`, …)

**picture → story → explanation** (×3) — deeper content, no vocabulary chips, no game.

### Quiz pages (`007`, `010`, …)

VS bar + 5 questions + podium finish. Uses `ContinentPlayer` for name/avatar.

### Overview (`005-Continents-Overview.html`)

Four interactive views (World Map, Globe Spin, Plate Puzzle, Climate Zones) plus Continent Sort mini-game.

---

## Chapter flow

| # | File | Type |
|---|------|------|
| 01 | `001-Book-Briefing.html` | Briefing + author speech |
| 02 | `002-Index.html` | Table of contents |
| 03 | `003-Character-Selection.html` | Choose explorer name + avatar |
| 04 | `004-Intro-MapExplorer.html` | Intro game — catch continent emojis |
| 05 | `005-Continents-Overview.html` | Overview — 4 views + Continent Sort |
| 06–07 | Continents Overview | Explained + Quiz |
| 08–10 | Africa | Activity → Explained → Quiz |
| 11–13 | Asia | Activity → Explained → Quiz |
| 14–16 | Europe | Activity → Explained → Quiz |
| 17–19 | North America | Activity → Explained → Quiz |
| 20–22 | South America | Activity → Explained → Quiz |
| 23–25 | Antarctica | Activity → Explained → Quiz |
| 26–28 | Australia | Activity → Explained → Quiz |
| 29–31 | Landforms | Activity → Explained → Quiz |
| 32 | `032-Conclusion.html` | Conclusion |
| 33 | `033-Continents-Overall-Quiz.html` | Overall quiz |
| 34 | `034-Outro-GlobeRush.html` | Outro game |
| 35 | `035-Congratulations.html` | Congratulations |

---

## Design concept

| Principle | Implementation |
|-----------|----------------|
| Theme | Earth gradient (sky → forest → earth), `.clouds` animated background |
| Accents | Green `#aed581`, gold `#ffe082` |
| Illustrations | Quality PNG embedded as base64 in `_continents-chapter-images.js` |
| Vocabulary | **Press words to hear** via `_continents-speak.js` |
| Explorer | Maya + continent guide characters |

---

## Shared files

```
Continents/
  _continents-data.js                # Chapter stories, words, quiz Q&A, game configs
  _continents-chapter-images.js      # Embedded PNG scenes (generated)
  _continents-scenes.js              # ContinentScene.boot()
  _continents-speak.js               # ContinentSpeak — TTS vocabulary
  _continents-player.js              # ContinentPlayer localStorage helper
  _continents-games.js               # Shared minigame engine
  _generate-book.cjs                 # Regenerate activity / explained / quiz HTML
  _gen-index-grid.cjs                # Refresh index grid
  scripts/
    sync_ai_images.cjs               # Copy AI chapter PNGs into assets/
    gen_chapter_images.cjs           # PNG → _continents-chapter-images.js
  assets/                            # Source PNGs ({chapter}-{slot}.png)
  *.html                             # Standalone chapters
```

### Build pipeline

```bash
# 1. Place / sync quality chapter PNGs
node book_html/Continents/scripts/sync_ai_images.cjs

# 2. Embed all PNGs as data URIs
node book_html/Continents/scripts/gen_chapter_images.cjs

# 3. Regenerate activity, explained, and quiz HTML
node book_html/Continents/_generate-book.cjs

# 4. Refresh index grid
node book_html/Continents/_gen-index-grid.cjs
```

**Chapter art (58 images):** overview (10 slots) + 8 chapters × 6 slots (`main-1`…`main-3`, `explain-1`…`explain-3`).

---

## Related

- Reference structure: [../OceanAdventure/README.md](../OceanAdventure/README.md)
- Scene pattern: [../Dinosaur Discovery/README.md](../Dinosaur%20Discovery/README.md)
