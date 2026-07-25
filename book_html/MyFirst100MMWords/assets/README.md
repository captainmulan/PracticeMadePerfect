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
