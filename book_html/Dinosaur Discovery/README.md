# Dinosaur Discovery — Book Structure

**Author:** Jimmy Cooper  
**Target age:** 7–8  
**Chapters:** 41 standalone HTML files  

Master template: [../README.md](../README.md)

---

## Chapter template (all 12 topics)

Every topic uses the **same three-page pattern**:

### 1. Activity — `{num}-{Topic}-Activity.html`

| Section | Content |
|---------|---------|
| **Picture 1** | Embedded PNG (`{id}-main-1.png`) |
| **Story 1** | Short tale |
| **Explanation 1** | Kid-friendly facts |
| **Picture 2–3** | Same pattern |
| **Mini game** | Tap-the-true-fact canvas game |

### 2. Explained — `{num+1}-{Topic}-Explained.html`

| Section | Content |
|---------|---------|
| **Picture 1–3** | `{id}-explain-1/2/3.png` |
| **Story + explanation** | Deeper reading per block |

### 3. Quiz — `{num+2}-{Topic}-QuizTime.html`

Solar System style: VS bar, one `.quiz-card.active` at a time, podium `.score-card`.

---

## Chapters (41 files)

| # | Topic | Activity · Explained · Quiz |
|---|--------|------------------------------|
| 001–003 | Book intro | Briefing, Index, Character |
| 004–006 | What are Dinosaurs | ✅ PNG scenes |
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
| 039–041 | Book end | Conclusion, Overall Quiz, Congratulations |

---

## Shared engine

| File | Purpose |
|------|---------|
| `_dino-data.js` | Stories, explanations, quiz questions |
| `_dino-chapter-images.js` | Embedded PNG data URIs *(generated)* |
| `_dino-scenes.js` | Loads images into page blocks |
| `_dino-player.js` | Character / localStorage |
| `_dino-games.js` | Tap-fact minigame |
| `_generate-book.cjs` | Builds 004–038 topic files |
| `scripts/gen_chapter_images.cjs` | PNG → base64 embed (Solar System style) |

---

## Regenerate

```bash
cd "book_html/Dinosaur Discovery"
# Add/replace PNGs in assets/ (AI illustrated scenes, 16:9)
node scripts/gen_chapter_images.cjs
node _generate-book.cjs
```

---

## Try it

Open **`004-What-are-Dinosaurs-Activity.html`** — three picture/story/explanation blocks + minigame.

Images are embedded in `_dino-chapter-images.js` like Solar System planet JPGs — no external fetch required.
