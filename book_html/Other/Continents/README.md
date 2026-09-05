# Continents Adventure — Book Structure Guide

**Author:** Jimmy Cooper  
**Target age:** 7–8  
**Chapters:** 35 standalone HTML files + mid-book game (`019b`)

Follows **Ocean Adventure** structure (Activity → Explained → Quiz) and **My First 100 Myanmar Words** briefing / 3-hero-games pattern.

---

## Page structure

### Activity pages

**picture → story → explanation → press words to hear** (×3) → **mini-game**

### Explained pages

**picture → story · explanation** (×3) — deeper content, no vocabulary chips, no game.

### Quiz pages

VS bar + 5 questions + podium. Uses `ContinentPlayer`.

### Overview (`005-Continents-Overview.html`)

Four painted views (World Map, Globe Spin, Plate Puzzle, Climate Zones) + **3 lesson segments** with speak chips + Continent Sort mini-game.

---

## Chapter flow

| # | File | Type |
|---|------|------|
| 01 | `001-Book-Briefing.html` | Briefing (MM-style: hero games + worlds grid) |
| 02 | `002-Index.html` | Table of contents |
| 03 | `003-Character-Selection.html` | Choose explorer |
| 04 | `004-Intro-MapExplorer.html` | **World Map Maker** stamp sandbox |
| 05–07 | Continents Overview | Views + lessons + Explained + Quiz |
| 08–16 | Africa → Europe | Activity → Explained → Quiz |
| **019b** | `019b-Continent-Trek.html` | **Mid-book action game** |
| 17–31 | N. America → Landforms | Activity → Explained → Quiz |
| 32 | `032-Conclusion.html` | Conclusion |
| 33 | `033-Continents-Overall-Quiz.html` | Overall quiz |
| 34 | `034-Outro-GlobeRush.html` | **Globe Rush** finale |
| 35 | `035-Congratulations.html` | Congratulations |

---

## Three hero games (Ocean / MM pattern)

| Game | File | Engine |
|------|------|--------|
| World Map Maker | `004` | Stamp sandbox (place continents & landmarks) |
| Continent Trek | `019b` | `ContinentActionGame` → `continent-trek` |
| Globe Rush | `034` | `ContinentActionGame` → `globe-rush` |

---

## Design

| Principle | Implementation |
|-----------|----------------|
| Theme | Earth gradient `#1a237e → #33691e → #5d4037`, `.clouds` |
| Accents | Green `#aed581`, gold `#ffe082` |
| Illustrations | PNG in `assets/` loaded by URL (Ocean style — no multi-MB embed) |
| Vocabulary | `ContinentSpeak` with EN voice scoring |
| Explorer | Maya + continent guide characters |

---

## Shared files

```
Continents/
  _continents-data.js
  _continents-scenes.js          # loads assets/{id}-{slot}.png
  _continents-speak.js
  _continents-player.js
  _continents-games.js           # chapter mini-games
  _continents-action-games.js    # mid + outro quality games
  _generate-book.cjs
  _gen-index-grid.cjs
  scripts/
    sync_ai_images.cjs
    check-images.cjs
    setup-action-games.cjs
  assets/                        # 58 chapter PNGs
```

### Build pipeline

```bash
node book_html/Continents/scripts/check-images.cjs
node book_html/Continents/_generate-book.cjs
node book_html/Continents/_gen-index-grid.cjs
```

Scenes load `assets/*.png` directly — no need to regenerate a chapter-images embed file.

---

## App registration

- `src/utils/htmlStepContent.ts` → `continents: "Continents"`
- `src/utils/bookCoverSeeds.ts` → `/book_covers/continents.webp`

---

## Quiz opponents

| Quiz | VS |
|------|-----|
| Overview | Professor Globe 🌍 |
| Africa | Savanna Sam 🦒 |
| Asia | Tiger Tia 🐯 |
| Europe | Knight Nora ⚔️ |
| North America | Bison Ben 🦬 |
| South America | Jaguar Jax 🐆 |
| Antarctica | Seal Sam 🦭 |
| Australia | Kangaroo Kate 🦘 |
| Landforms | Volcano Val 🌋 |

---

## Related

- [../OceanAdventure/README.md](../OceanAdventure/README.md)
- [../MyFirst100MMWords/README.md](../MyFirst100MMWords/README.md)
