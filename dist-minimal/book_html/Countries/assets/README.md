# Chapter Image Assets

Drop AI-generated PNG files here named:

```
{chapter-id}-{slot}.png
```

## Chapter IDs

- `overview` — World Overview (+ view-1 … view-4 for 4-view explorer)
- `asia`
- `europe`
- `africa`
- `north-america`
- `south-america`
- `australia-oceania`
- `antarctica`
- `landmarks`

## Slots

| Slot | Used on |
|------|---------|
| main-1, main-2, main-3 | Activity pages |
| explain-1, explain-2, explain-3 | Explained pages |
| view-1 … view-4 | Overview 4-view explorer only |

## Build

```bash
node scripts/gen_chapter_images.cjs
node ../_generate-book.cjs
```
