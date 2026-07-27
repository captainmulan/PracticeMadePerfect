# Chapter image assets

Drop PNG or JPG files here, then run:

```bash
node scripts/gen_chapter_images.cjs
node _generate-book.cjs
```

## Main activity page (3 story blocks)

| File | Part |
|------|------|
| `{id}-seg1.png` | Picture for story part 1 |
| `{id}-seg2.png` | Picture for story part 2 |
| `{id}-seg3.png` | Picture for story part 3 |

## Sentences page (unique realistic art — PNG only)

1. `node scripts/gen_sentence_prompts.cjs` — writes `scripts/sentence-image-prompts.json` (30 scene prompts).
2. Generate each `{id}-sent1.png` … `sent3.png` from those prompts (unique scenes — **do not** copy `seg*`).
3. `node _generate-book.cjs explained`

| File | Part |
|------|------|
| `{id}-sent1.png` | Sentences section 1 |
| `{id}-sent2.png` | Sentences section 2 |
| `{id}-sent3.png` | Sentences section 3 |

Generator uses `{id}-sent*.png` only (no SVG, no `seg*` fallback).

## Explained page (optional — falls back to seg images)

| File | Part |
|------|------|
| `{id}-exp1.png` | Deeper tale part 1 |
| `{id}-exp2.png` | Deeper tale part 2 |
| `{id}-exp3.png` | Deeper tale part 3 |

## Chapter IDs

`family` · `food` · `animals` · `colors` · `numbers` · `body` · `home` · `school` · `feelings` · `festivals`

## Legacy

- `family-photo.png` → used as `family-seg1` if `family-seg1.png` missing

Recommended size: **1600×900** (16:9). Embedded in HTML via generated JS — standalone like Solar System textures.
