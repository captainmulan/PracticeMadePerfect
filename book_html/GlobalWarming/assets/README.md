# Global Warming — Chapter Images

PNG scenes embedded in HTML (Solar System / Dinosaur Discovery style — no external fetch).

## Naming

For each chapter `id` from `_global-data.js`:

| Slot | File | Used on |
|------|------|---------|
| Main block 1 | `{id}-main-1.png` | Activity page |
| Main block 2 | `{id}-main-2.png` | Activity page |
| Main block 3 | `{id}-main-3.png` | Activity page |
| Explain block 1 | `{id}-explain-1.png` | Explained page |
| Explain block 2 | `{id}-explain-2.png` | Explained page |
| Explain block 3 | `{id}-explain-3.png` | Explained page |

## Chapter IDs

`overview`, `greenhouse`, `carbon-dioxide`, `fossil-fuels`, `renewable-energy`, `melting-ice`, `rising-seas`, `wildlife`, `green-future`

## Example filenames

```
overview-main-1.png
overview-main-2.png
overview-main-3.png
overview-explain-1.png
overview-explain-2.png
overview-explain-3.png
greenhouse-main-1.png
carbon-dioxide-explain-3.png
green-future-main-2.png
```

## Image quality

Use **rich illustrated PNGs** — AI or hand-painted 16:9 scenes with Maya, Professor Leaf, and climate themes (forests, ice, oceans, clean energy, wildlife).

Recommended size: **1600×900** or larger, PNG/JPG.

## Embed after adding/replacing art

```bash
node scripts/gen_chapter_images.cjs
node ../_generate-book.cjs
```

## Overview page (`005-Climate-Overview.html`)

The overview page uses **hand-maintained canvas views** — it does not require overview PNG slots unless you add optional hero images later.

## Theme notes

Match the earth-green palette when commissioning art:

- Background tones: `#1a2e1a`, `#2d5016`, `#1b4332`
- Accent greens: `#81c784`, `#a5d6a7`
- Subjects: Earth, atmosphere, greenhouse, CO₂, fossil fuels, solar/wind, melting ice, rising seas, wildlife, green cities
