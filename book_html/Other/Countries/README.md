# Countries Adventure

**Author:** Jimmy Cooper | **Age:** 7–8 | **Pages:** 35 HTML files

An interactive geography book following the Ocean Adventure structure.

## Chapter Map

| # | File | Type |
|---|------|------|
| 01 | `001-Book-Briefing.html` | Briefing |
| 02 | `002-Index.html` | Table of contents |
| 03 | `003-Character-Selection.html` | Choose traveler |
| 04 | `004-Intro-WorldMapMaker.html` | Intro sandbox game |
| 05 | `005-World-Overview.html` | Overview activity (4-view explorer) |
| 06–07 | World Explained + Quiz | |
| 08–10 | Asia | Activity → Explained → Quiz |
| 11–13 | Europe | Activity → Explained → Quiz |
| 14–16 | Africa | Activity → Explained → Quiz |
| 17–19 | North America | Activity → Explained → Quiz |
| 20–22 | South America | Activity → Explained → Quiz |
| 23–25 | Australia & Oceania | Activity → Explained → Quiz |
| 26–28 | Antarctica | Activity → Explained → Quiz |
| 29–31 | Famous Landmarks | Activity → Explained → Quiz |
| 32 | `032-Conclusion.html` | Summary |
| 33 | `033-Countries-Overall-Quiz.html` | Final quiz |
| 34 | `034-Outro-GlobeRush.html` | Outro game |
| 35 | `035-Congratulations.html` | Certificate |

## Build Pipeline

```bash
node book_html/Countries/scripts/sync_ai_images.cjs
node book_html/Countries/scripts/gen_chapter_images.cjs
node book_html/Countries/_generate-book.cjs
node book_html/Countries/_gen-index-grid.cjs
```

## Key Files

- `_countries-data.js` — chapter content (stories, quizzes, games)
- `_countries-chapter-images.js` — embedded PNG data URIs (generated)
- `_countries-games.js` — shared canvas minigame engine
- `_generate-book.cjs` — regenerates activity / explained / quiz pages

## Image Naming

```
{chapter-id}-{slot}.png
```

Slots: `main-1`…`main-3`, `explain-1`…`explain-3`, `view-1`…`view-4` (overview only)

Chapter IDs: `overview`, `asia`, `europe`, `africa`, `north-america`, `south-america`, `australia-oceania`, `antarctica`, `landmarks`
