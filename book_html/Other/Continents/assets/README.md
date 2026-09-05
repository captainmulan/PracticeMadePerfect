# Continents Adventure — Chapter Art

Source PNGs for embedded scenes. Naming: `{chapter-id}-{slot}.png`

| Chapter ID | Slots |
|------------|-------|
| `overview` | `main-1`…`main-3`, `explain-1`…`explain-3`, `view-1`…`view-4` |
| `africa`, `asia`, `europe`, `north-america`, `south-america`, `antarctica`, `australia`, `landforms` | `main-1`…`main-3`, `explain-1`…`explain-3` |

**58 images total** — kid-friendly painted 16:9 educational illustrations.

Rebuild embedded file after changes:

```bash
node scripts/sync_ai_images.cjs
node scripts/gen_chapter_images.cjs
node ../_generate-book.cjs
```
