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

## Sentences page (realistic scene art — PNG only)

Run `node scripts/sync_sentence_images.cjs` to build `{id}-sent1.png` … `sent3.png` from **different** seg slots than the matching Words section (sent1←seg2, sent2←seg3, sent3←seg1), then `node _generate-book.cjs explained`.

Drop custom `{id}-sent*.png` files here to override. Generator never falls back to the same-index seg image.

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
