# My First 100 Myanmar Words

Interactive HTML book for Myanmar diaspora families — kids aged **4–10** who read English and learn first Myanmar words by **hearing**, not by reading Myanmar script.

**Tagline:** Ancient stories, gentle morals, and tap-to-hear words — for English-reading children everywhere.

**Author:** Jimmy Cooper

---

## Design

**Parabaik manuscript theme** (lacquer red, gold border, palm-paper scroll) — same look as `002-Index.html`.

**Audience:** English-reading children overseas. Stories and quizzes are **English only**. Myanmar appears only as **spoken audio** when tapping 🔊 Hear on word cards — **no Myanmar script on screen**.

---

## Page structure

### Main — `{num}-{Topic}.html`

Three repeating blocks, then a mini game:

| Block | Content |
|-------|---------|
| **Picture** | Embedded PNG/JPG (`{id}-seg1.png` … `seg3.png`) — Solar System style, no external fetch |
| **Story** | Medium-long **moral / ancient Myanmar tale** in English |
| **Explanation** | Tradition, custom, or moral — English |
| **Press words to hear** | English labels only · 🇬🇧 / 🔊 Hear Myanmar (audio only) |

→ **Mini game** at bottom (catch words → earn badge)

### Explained — `{num+1}-{Topic}-Explained.html`

Three blocks (no word cards):

| Block | Content |
|-------|---------|
| **Picture** | `{id}-exp1.png` … `exp3.png` (falls back to matching `seg` image) |
| **Story** | Deeper tale in English |
| **Explanation** | Tradition / moral in English |

### Quiz — `{num+2}-{Topic}-Quiz.html`

**Solar System style:** one question at a time, English multiple choice about the **story and tradition** (not Myanmar script matching). Perfect score → quiz badge.

### Overview — `005-First-Words-Overview.html`

Three picture · story chapters + how-to card. Images: `overview-story1.png` … `3.png` embedded via `_mmwords-overview-art.js`.

---

## Chapters (41 files)

| # | Topic | Notes |
|---|--------|--------|
| 001–004 | Intro | Briefing, Index, Character, Word Bridge |
| 005–007 | First Words | Overview (3 tales), Explained, Quiz |
| 008–037 | 10 topics × 3 | Family, Food, Animals, Colors, Numbers, Body, Home, School, Feelings, Festivals |
| 038–041 | End | Conclusion, Overall Quiz, Outro, Congrats |

---

## Images

| Slot | File | Used on |
|------|------|---------|
| Main part 1–3 | `{id}-seg1.png` … `seg3.png` | Activity page, each story block |
| Explained 1–3 | `{id}-exp1.png` … `exp3.png` | Explained page (optional — falls back to seg) |
| Overview | `overview-story1.png` … `3.png` | 005 overview |
| Family legacy | `family-photo.png` | Also used as `family-seg1` |

```bash
node _generate-book.cjs                # rebuild 008–037 (embeds assets/*.png into each HTML)
node scripts/gen_overview_images.cjs   # → _mmwords-overview-art.js for 005
```

See `assets/README.md` for naming.

---

## Shared engine

| File | Purpose |
|------|---------|
| `_mmwords-data.js` | Words, moral stories, heritage, tips, `quizQuestions` |
| `_mmwords-overview-art.js` | Overview PNG embeds for 005 *(generated)* |
| `_mmwords-player.js` | Speech, badges, localStorage |
| `_mmwords-games.js` | Catch game |
| `_generate-book.cjs` | Builds 008–037 — **inlines** `assets/*.png` into each HTML |
| `scripts/merge_quiz_data.cjs` | Refresh story quiz questions in data |

---

## Edit content

| What | Where |
|------|--------|
| Stories, words, quiz Q&A | `_mmwords-data.js` |
| Layout / CSS | `_generate-book.cjs` |
| Chapter pictures | `assets/{id}-seg1.png` … |

---

## Audio

- **English button** → speaks English  
- **Myanmar Hear button** → speaks Myanmar (no script shown)  
- Browser `my-MM` voice or Google TTS fallback  

---

## Try it

Open **`008-Family.html`** — three illustrated tales, hear-only Myanmar words, catch game.  
Open **`005-First-Words-Overview.html`** — welcome + three ancient-style intro stories.
