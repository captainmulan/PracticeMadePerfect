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

Page title: **Sentences**. One word group per screen on the whiteboard (title + 3 sentences):

| UI | Content |
|----|---------|
| **Progress** | Group X of N |
| **Whiteboard title** | Key word centered (e.g. MOTHER) |
| **3 sentence pairs** | English + Myanmar, left-aligned, 🔊 beside each |
| **Between pairs** | Dashed break line |
| **Practice strip** | 🗣️ Tap 🔊 · Read aloud · Next → when ready (compact) |
| **Navigation** | ← Back · Next → (between word groups) |

Data: `explainedGroups: [{ title, sentences: [{ en, mm }, ×3] }]` in `_mmwords-data.js`. Other chapters fall back to auto-generated groups from word cards.

Optional per sentence: `pyramid: ["Mother.", "My mother.", "This is my mother."]` in `_mmwords-data.js`.

### Quiz — `{num+2}-{Topic}-Quiz.html`

**Word + sentence quiz (10 questions, 70/30):** 7 **Hear & Pick** words + 3 **Hear & Pick** sentences (Myanmar sentence plays → pick *“This is about Mom / Aunt / …”* in English). No Myanmar script on screen. Perfect score → quiz badge.

Regenerate quizzes only: `node _generate-book.cjs quiz`

---

## Chapters (38 files)

| # | Topic | Notes |
|---|--------|--------|
| 001–004 | Intro | Briefing, Index, Character, Build Myanmar Village |
| 005–034 | 10 topics × 3 | Family, Food, Animals, Colors, Numbers, Body, Home, School, Feelings, Festivals |
| 035–038 | End | Conclusion, Overall Quiz, Outro, Congrats |

---

## Images

| Slot | File | Used on |
|------|------|---------|
| Main part 1–3 | `{id}-seg1.png` … `seg3.png` | Activity page, each story block |
| Explained 1–3 | `{id}-exp1.png` … `exp3.png` | Explained page (optional — falls back to seg) |
| Family legacy | `family-photo.png` | Also used as `family-seg1` |

```bash
node scripts/gen_pyramid_mm.cjs       # → _mmwords-pyramid-mm.js (EN/MM pyramid pairs)
node _generate-book.cjs                # rebuild 005–034 (embeds assets/*.png into each HTML)
```

See `assets/README.md` for naming.

---

## Shared engine

| File | Purpose |
|------|---------|
| `_mmwords-theme.css` | Shared parabaik manuscript styles (all 38 HTML pages) |
| `_mmwords-pyramid-mm.js` | Step 1–3 Myanmar text for explained pyramids *(generated)* |
| `_mmwords-data.js` | Words, moral stories, heritage, tips, `quizQuestions` |
| `_mmwords-player.js` | Speech, badges, localStorage |
| `_mmwords-games.js` | Catch game + hybrid quiz (Hear & Pick) |
| `_generate-book.cjs` | Builds 005–034 — **inlines** `assets/*.png` into each HTML |
| `scripts/merge_quiz_data.cjs` | Refresh story quiz questions in data |

---

## Edit content

| What | Where |
|------|--------|
| Stories, words, quiz Q&A | `_mmwords-data.js` |
| Layout / chapter HTML | `_generate-book.cjs` (links `_mmwords-theme.css`) |
| Global look & feel | `_mmwords-theme.css` |
| Chapter pictures | `assets/{id}-seg1.png` … |

---

## Audio

- **English button** → speaks English  
- **Myanmar Hear button** → speaks Myanmar (no script shown)  
- Browser `my-MM` voice or Google TTS fallback  

---

## Try it

Open **`005-Family.html`** — three illustrated tales, hear-only Myanmar words, catch game.
