# Dinosaur Discovery — Book Structure

**Author:** Jimmy Cooper  
**Target age:** 7–8  
**Chapters:** 41 standalone HTML files  

Aligned with [Ocean Adventure](../OceanAdventure/README.md) and [My First 100 Myanmar Words](../MyFirst100MMWords/README.md).

Master template: [../README.md](../README.md)

---

## Page structure (2026 refresh)

### Activity pages (`004`, `007`, …)

**picture → story → explanation → press words to hear** (×3) → **parent tip**

| Block | Content |
|-------|---------|
| **Picture** | 16:9 PNG from `assets/{id}-main-N.png` |
| **Story** | Kai + Dr. Mara narrative in `.story-box` |
| **Explanation** | Facts in `.explain-box` |
| **Press words to hear** | `.speak-chip` → `DinoSpeak.chip()` (Web Speech API) |
| **Parent tip** | MMWords-style `.tip-card` at bottom |

### Explained pages (`005`, `008`, …)

**picture → story → explanation** (×3) — deeper reading, no vocabulary chips.

### Quiz pages (`006`, `009`, …)

Solar System / Ocean VS bar + questions + podium. Uses `DinoPlayer` for name/avatar.

---

## Shared files

```
Dinosaur Discovery/
  _dino-data.js           # Stories, words, quiz Q&A, parent tips
  _dino-scenes.js         # DinoScene.boot() — loads assets/*.png
  _dino-speak.js          # DinoSpeak — press words to hear
  _dino-player.js         # Character localStorage
  _generate-book.cjs      # Regenerate activity / explained / quiz HTML
  _patch-dino-data.cjs    # Add words, segments, opponent fields
  assets/                 # Source PNGs ({id}-main-1.png, {id}-explain-1.png, …)
  scripts/
    gen_chapter_images.cjs  # Optional: embed PNGs for offline single-file mode
```

Images load from **`assets/`** directly (Ocean pattern) — no 280 MB JS embed required.

---

## Build pipeline

```bash
cd "book_html/Dinosaur Discovery"

# 1. Add/replace PNGs in assets/ (AI illustrated 16:9 scenes)

# 2. Patch data if needed (words, segments)
node _patch-dino-data.cjs

# 3. Regenerate chapter HTML
node _generate-book.cjs

# Optional — embed all PNGs for offline (large _dino-chapter-images.js):
node scripts/gen_chapter_images.cjs
```

---

## Chapter map

| # | Topic | Activity · Explained · Quiz |
|---|--------|------------------------------|
| 001–003 | Intro | Briefing, Index, Character |
| 004–006 | What are Dinosaurs | ✅ |
| 007–009 | Triassic Period | ✅ |
| 010–012 | Jurassic Period | ✅ |
| 013–015 | Cretaceous Period | ✅ |
| 016–018 | Fossils | ✅ |
| 019–021 | Paleontology | ✅ |
| 022–024 | Dinosaur Eggs | ✅ |
| 025–027 | Plant Eaters | ✅ |
| 028–030 | Meat Eaters | ✅ |
| 031–033 | Extinction | ✅ |
| 034–036 | Famous Dinosaurs | ✅ |
| 037–038 | Prehistoric World | Activity + Explained only |
| 039–041 | End | Conclusion, Overall Quiz, Congratulations |

---

## Try it

Open **`004-What-are-Dinosaurs-Activity.html`** — three painted scenes, tap-to-hear vocabulary, parent tip.
