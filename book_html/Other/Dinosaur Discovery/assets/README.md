# Dinosaur Discovery — Chapter Images

PNG scenes embedded in HTML (Solar System style — no external fetch).

## Naming

For each chapter `id` from `_dino-data.js`:

| Slot | File | Used on |
|------|------|---------|
| Main block 1 | `{id}-main-1.png` | Activity page |
| Main block 2 | `{id}-main-2.png` | Activity page |
| Main block 3 | `{id}-main-3.png` | Activity page |
| Explain block 1 | `{id}-explain-1.png` | Explained page |
| Explain block 2 | `{id}-explain-2.png` | Explained page |
| Explain block 3 | `{id}-explain-3.png` | Explained page |

## Chapter IDs

`what-are-dinosaurs`, `triassic`, `jurassic`, `cretaceous`, `fossils`, `paleontology`, `dinosaur-eggs`, `plant-eaters`, `meat-eaters`, `extinction`, `famous-dinosaurs`, `prehistoric-world`

## Image quality

Use **rich illustrated PNGs** (same approach as `MyFirst100MMWords/assets/overview-story1.png`) — AI or hand-painted 16:9 scenes. **Do not** use the old PIL shape script.

Recommended size: **1600×900** or larger, PNG/JPG.

## Embed after adding/replacing art

```bash
node scripts/gen_chapter_images.cjs
node _generate-book.cjs
```
