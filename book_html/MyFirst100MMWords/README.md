# My First 100 Myanmar Words

Interactive HTML book for Myanmar diaspora families — kids aged 4–10 learning their first 100 words overseas.

**Tagline:** Keep your child connected to Myanmar — even while growing up overseas.

## Author
Jimmy Cooper

## Chapters (41)

| # | File | Type |
|---|------|------|
| 001 | Book Briefing | Welcome + learning path |
| 002 | Index | Chapter grid |
| 003 | Character Selection | Name + avatar |
| 004 | Intro Word Bridge | Apple → ပန်းသီး demo |
| 005–007 | First Words | Overview, Explained, Quiz |
| 008–010 | Family | Activity, Explained, Quiz |
| 011–013 | Food | Activity, Explained, Quiz |
| 014–016 | Animals | Activity, Explained, Quiz |
| 017–019 | Colors | Activity, Explained, Quiz |
| 020–022 | Numbers | Activity, Explained, Quiz |
| 023–025 | Body Parts | Activity, Explained, Quiz |
| 026–028 | Home | Activity, Explained, Quiz |
| 029–031 | School | Activity, Explained, Quiz |
| 032–034 | Feelings | Activity, Explained, Quiz |
| 035–037 | Myanmar Festivals | Activity, Explained, Quiz |
| 038 | Conclusion | Summary + badges |
| 039 | Overall Quiz | All chapters |
| 040 | Outro Word Catch | Finale game |
| 041 | Congratulations | Completion |

## Shared Engine

- `_mmwords-data.js` — chapter word lists
- `_mmwords-player.js` — localStorage, badges, Web Speech API
- `_mmwords-games.js` — catch game, quiz builder, intro bridge
- `_generate-book.cjs` — regenerate chapter HTML from data

## Each Chapter Includes

1. **Mini story** (1-minute read)
2. **Word cards** — English → Myanmar bridge, tap to hear
3. **Parent phrase card** — dinner-table practice
4. **Catch game** — earn topic badge
5. **Explained** — word list + parent tips
6. **Quiz** — match English to Myanmar

## Learning Path

👂 Hear → 👀 Recognize → 🗣 Speak → 📖 Read → ✍ Write

Writing Myanmar letters comes **after** words — not first.

## Regenerate Chapters

```bash
node _generate-book.cjs
```

## Audio Note

Uses browser speech when a Myanmar voice is installed; otherwise **Google Translate TTS** (requires internet). Falls back to romanized hint if both fail. Tap speaks **Myanmar first**, then English.
