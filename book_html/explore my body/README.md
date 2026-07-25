# Explore My Body — Book Structure

**Author:** Jimmy Cooper  
**Target age:** 7–8  
**Chapters:** 25+ standalone HTML files (8 body topics complete)

Master template: [../README.md](../README.md)

---

## Chapter template (every body topic)

### 1. Activity — `{num}-{Topic}-Activity.html`

| Section | Content |
|---------|---------|
| **Picture 1** | Embedded PNG (`{id}-main-1.png`) |
| **Story 1** | Maya's short story |
| **Explanation 1** | Kid-friendly science |
| **Picture 2** | `{id}-main-2.png` |
| **Story 2** | … |
| **Explanation 2** | … |
| **Picture 3** | `{id}-main-3.png` |
| **Story 3** | … |
| **Explanation 3** | … |
| **Mini game** | Canvas game at bottom |

### 2. Explained — `{num+1}-{Topic}-Explained.html`

Three cycles of **picture · story · explanation** using `{id}-exp-1` … `{id}-exp-3` PNGs.

### 3. Quiz — `{num+2}-{Topic}-QuizTime.html`

Solar System style: VS bar, one question at a time, podium score card.

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

Intro pages: `001` Briefing · `002` Index · `003` Character Selection

---

## Images (PNG embedded — no emoji/SVG heroes)

**Quality target:** same as [MyFirst100MMWords](../MyFirst100MMWords/) — rich AI-generated scene illustrations (`family-photo.png` style), embedded as base64 in `_body-chapter-images.js`.

### Generate new images

1. Edit prompts in `scripts/body-image-prompts.cjs`
2. Generate PNGs (1600×900 or 16:9) into `assets/` — e.g. `heart-main-1.png`
3. Re-embed and rebuild:

```bash
node scripts/gen_chapter_images.cjs
node _generate-book.cjs
```

> Do **not** use `scripts/gen_body_art.py` for production art — that was a placeholder. Use AI scene illustrations like MM Words.

### Naming

| File | Used on |
|------|---------|
| `{id}-main-1.png` | Activity segment 1 |
| `{id}-main-2.png` | Activity segment 2 |
| `{id}-main-3.png` | Activity segment 3 |
| `{id}-exp-1.png` | Explained segment 1 |
| `{id}-exp-2.png` | Explained segment 2 |
| `{id}-exp-3.png` | Explained segment 3 |

**IDs:** `heart` · `brain` · `bones` · `muscles` · `lungs` · `stomach` · `eyes` · `ears`

Replace any PNG with your own 960×540 (16:9) artwork — re-run embed + generate.

---

## Shared engine

| File | Purpose |
|------|---------|
| `_body-data.js` | Stories, explanations, quiz questions |
| `_body-chapter-images.js` | Embedded PNG data URIs *(generated)* |
| `_body-scenes.js` | Loads images into scene slots |
| `_body-games.js` | Canvas minigames |
| `_body-player.js` | Character / localStorage |
| `_generate-book.cjs` | Builds activity + explained + quiz HTML |
| `scripts/gen_body_art.py` | PIL illustration generator |
| `scripts/gen_chapter_images.cjs` | PNG → base64 embed |

---

## Edit content

| What | Where |
|------|--------|
| Stories, explanations, quiz | `_body-data.js` |
| Layout / CSS | `_generate-book.cjs` |
| Chapter PNGs | `assets/{id}-{slot}.png` |
