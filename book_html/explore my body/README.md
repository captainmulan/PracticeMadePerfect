# Explore My Body — Book Structure

**Author:** Jimmy Cooper  
**Target age:** 7–8  
**Chapters:** 27+ standalone HTML files (8 body topics complete)

Aligned with [Ocean Adventure](../OceanAdventure/README.md) and [My First 100 MM Words](../MyFirst100MMWords/README.md).

Master template: [../README.md](../README.md)

---

## Page structure (2026 refresh)

### Activity pages (`004`, `007`, …)

**picture → story → explanation → press words to hear** (×3) + **parent tip**

| Block | What it shows |
|-------|----------------|
| **Picture** | 16:9 AI scene PNG (`assets/{id}-{slot}.png`) |
| **Story** | Maya's narrative in `.story-box` |
| **Explanation** | Science summary in `.explain-box` |
| **Press words to hear** | `.speak-chip` buttons → `BodySpeak.chip()` |
| **Parent tip** | `.tip-card` — try-at-home advice (MM Words style) |

> Chapter activity pages have **no** embedded canvas minigames (matches Ocean 2026 refresh).

### Explained pages (`005`, `008`, …)

**picture → story → explanation** (×3) — deeper content, no vocabulary chips.

### Quiz pages (`006`, `009`, …)

Solar System VS bar · **5 questions** · dynamic podium · `BodyPlayer` for name/avatar.

---

## Topics (8 complete triplets)

| # | Topic | Activity | Explained | Quiz |
|---|--------|----------|-----------|------|
| 004–006 | Heart | ✅ | ✅ | ✅ |
| 007–009 | Brain | ✅ | ✅ | ✅ |
| 010–012 | Bones | ✅ | ✅ | ✅ |
| 013–015 | Muscles | ✅ | ✅ | ✅ |
| 016–018 | Lungs | ✅ | ✅ | ✅ |
| 019–021 | Stomach | ✅ | ✅ | ✅ |
| 022–024 | Eyes | ✅ | ✅ | ✅ |
| 025–027 | Ears | ✅ | ✅ | ✅ |

Intro: `001` Briefing · `002` Index · `003` Character Selection

---

## Shared engine

```
explore my body/
  _body-data.js           # Stories, explanations, quiz Q&A
  _body-scenes.js         # BodyScene.boot() — loads assets/*.png directly
  _body-speak.js          # BodySpeak — press words to hear (TTS)
  _body-player.js         # Character / localStorage
  _generate-book.cjs      # Regenerate activity / explained / quiz HTML
  assets/                 # Source PNGs ({id}-main-1.png … {id}-exp-3.png)
  scripts/
    body-image-prompts.cjs  # AI generation prompts
    gen_chapter_images.cjs  # Optional: embed PNGs as base64 (legacy)
  *.html
```

### Build pipeline

```bash
cd "book_html/explore my body"

# 1. Add/replace PNGs in assets/ (AI scenes, 16:9)
#    heart-main-1.png … heart-exp-3.png per chapter

# 2. Regenerate HTML from data + vocabulary map
node _generate-book.cjs
```

Images load from `assets/` at runtime (Ocean pattern) — **no 150 MB JS embed required**.

Optional embed (offline single-file): `node scripts/gen_chapter_images.cjs`

---

## Edit content

| What | Where |
|------|--------|
| Stories, explanations, quiz | `_body-data.js` |
| Vocabulary chips (activity) | `_generate-book.cjs` → `BODY_WORDS` |
| Parent tips | `_generate-book.cjs` → `BODY_TIPS` or `ch.tip` in data |
| Layout / CSS | `_generate-book.cjs` |
| Chapter PNGs | `assets/{id}-{slot}.png` |

---

## Quiz opponents

| Topic | VS character |
|-------|----------------|
| Heart | Dr. Pulse 🩺 |
| Brain | Professor Cortex 🔬 |
| Bones | Skeletal Sam 💀 |
| Muscles | Flex Fiona 🏋️ |
| Lungs | Captain Air 🌬️ |
| Stomach | Chef Digest 👨‍🍳 |
| Eyes | Optic Ollie 👓 |
| Ears | Sound Wave Sue 🎵 |
