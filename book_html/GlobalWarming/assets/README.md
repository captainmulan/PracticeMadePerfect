# Global Warming — Chapter Images

PNG/JPG scenes loaded directly from `assets/` (no runtime JS embed required).

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
| Overview views | `overview-view-1.png` … `overview-view-4.png` | Overview page |

## Chapter IDs

`overview`, `greenhouse`, `carbon-dioxide`, `fossil-fuels`, `renewable-energy`, `melting-ice`, `rising-seas`, `wildlife`, `green-future`

## Image quality

Use **rich illustrated PNGs** — AI or hand-painted 16:9 scenes. Recommended size: **1600×900** or larger.

Optional compress to JPG:

```bash
node scripts/compress_assets.cjs
```

Scenes load via `_global-scenes.js` (tries `.jpg` first, falls back to `.png`).
