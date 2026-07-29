# Global Warming — Book Structure Guide

**Author:** Jimmy Cooper  
**Target age:** 7–8  
**Chapters:** 35 + mid-book (`019b`) standalone HTML files  

Follows the same flow as **Ocean Adventure** and **My First 100 Myanmar Words** — lean reading pages plus **3 hero action games**.

Master template: [../README.md](../README.md)

---

## Page structure (2026 refresh)

### Activity pages (`008`, `011`, …)

Each topic activity follows:

**picture → story → explanation → press words to hear** (×3)

No per-chapter mini-games — quality action games live at intro / mid-book / outro only (Ocean/MMWords pattern).

| Block | What it shows |
|-------|----------------|
| **Picture** | 16:9 painted scene (`<img class="chapter-hero-img">` from `assets/` via `_global-scenes.js`) |
| **Story** | Maya + Professor Leaf narrative in `.story-box` |
| **Explanation** | Factual summary in `.explain-box` |
| **Press words to hear** | `.speak-chip` buttons → `GlobalSpeak.chip()` (Web Speech API) |

### Explained pages (`006`, `009`, …)

**picture → story → explanation** (×3) — deeper content, no vocabulary chips, no game.

### Quiz pages (`007`, `010`, …)

VS bar + 5 questions + podium finish. Uses `GlobalPlayer` for name/avatar.

### Overview (`005-Climate-Overview.html`)

**Hand-maintained** — four painted view slots (tap to learn climate topics) plus **3 lesson segments** with vocabulary chips. No mini-game on overview.

---

## Three hero games

| Page | Game | Badge |
|------|------|-------|
| `004-Intro-EcoGarden.html` | Eco Garden sandbox (stamp + eraser) | Eco Garden Builder |
| `019b-Climate-Rescue-Run.html` | Climate Rescue Run (stomp runner) | Mid-Book Climate Hero |
| `034-Outro-EcoPlanetRush.html` | Eco Planet Rush (lane collect-a-thon) | Eco Planet Master |

---

## Chapter flow

| # | File | Type |
|---|------|------|
| 01 | `001-Book-Briefing.html` | Briefing + author speech |
| 02 | `002-Index.html` | Table of contents |
| 03 | `003-Character-Selection.html` | Choose eco hero name + avatar |
| 04 | `004-Intro-EcoGarden.html` | Intro game — eco garden sandbox |
| 05 | `005-Climate-Overview.html` | Overview — 4 views + 3 lesson segments |
| 06–07 | Climate Overview | Explained → Quiz |
| 08–31 | 8 topics | Activity → Explained → Quiz each |
| 19b | `019b-Climate-Rescue-Run.html` | Mid-book action game |
| 32 | `032-Conclusion.html` | Conclusion + badges |
| 33 | `033-Global-Overall-Quiz.html` | Overall quiz |
| 34 | `034-Outro-EcoPlanetRush.html` | Outro action game |
| 35 | `035-Congratulations.html` | Congratulations |

---

## Shared files

```
GlobalWarming/
  _global-data.js                # Chapter stories, words, quiz Q&A
  _global-scenes.js              # Asset-path scene loader (jpg/png fallback)
  _global-speak.js               # Press words to hear (TTS)
  _global-player.js              # Player + badge localStorage
  _global-action-games.js        # Mid-book + outro action engines
  _global-games.js               # Legacy chapter games (unused in activity pages)
  _generate-book.cjs             # Regenerate activity / explained / quiz HTML
  _gen-index-grid.cjs            # Refresh index grid
  scripts/
    sync_ai_images.cjs           # Copy AI PNGs into assets/
    compress_assets.cjs          # PNG → JPG (optional, max 1280px)
    gen_chapter_images.cjs         # Legacy embed script (optional)
  assets/                        # Source PNG/JPG ({chapter}-{slot}.png)
  *.html                         # Standalone chapters
```

### Build pipeline

```bash
# 1. Sync AI-generated PNGs (if regenerating art)
node book_html/GlobalWarming/scripts/sync_ai_images.cjs

# 2. Optional: compress to JPG for faster loads
node book_html/GlobalWarming/scripts/compress_assets.cjs

# 3. Regenerate activity, explained, and quiz HTML
node book_html/GlobalWarming/_generate-book.cjs

# 4. Refresh index grid
node book_html/GlobalWarming/_gen-index-grid.cjs
```

Images load directly from `assets/` — no multi-MB JS embed required at runtime.

---

## Quiz opponents

| Quiz | VS character |
|------|----------------|
| Climate overview | Professor Leaf 🍃 |
| Greenhouse | Sunny Sam ☀️ |
| Carbon Dioxide | Carbon Carl 💨 |
| Fossil Fuels | Coal Casey ⛏️ |
| Renewable Energy | Windy Wren 💨 |
| Melting Ice | Polar Pete 🐧 |
| Rising Seas | Tide Tara 🌊 |
| Wildlife | Bear Bella 🐻 |
| Green Future | Sprout Sam 🌱 |
| Overall (033) | Professor Leaf 🍃 |

---

## Related

- Reference structure: [../OceanAdventure/README.md](../OceanAdventure/README.md)
- MMWords hero-game pattern: [../MyFirst100MMWords/README.md](../MyFirst100MMWords/README.md)
- Master guide: [../README.md](../README.md)
