# Mudra holiday trip to Myanmar (Story)

Junior-novel Myanmar storybook for **Magic Library** (upload via admin).  
Static HTML only — not a standalone npm/Vite app.

This folder is meant for its **own git repo**, so large HTML/assets stay out of the main Magic Library / PracticeMadePerfect repo.

## Use

1. Edit data → `node _generate-book.cjs` (optional)
2. Upload this folder from Magic Library **admin**
3. Test inside the library app

## Today’s fix

- Resolved raw HTML upload issue by removing duplicate old chapter files and keeping only one canonical file per page number.
- Kept the app-facing folder path alive by adding a shim folder named `Mudra goes to Grandma's Village` with redirect stubs to `MudraGoesToGrandmaVillage`.
- Moved `TEMPLATE-UNIFORM.html` into the `Template/` subfolder so it is not treated as a root-level book page.
- Lesson: when updating book HTML, match the expected iframe folder name exactly and do not keep legacy page files with the same numeric prefixes.

## Novel arc

| Ch | Title | Beat |
|----|-------|------|
| 1 | Mudra Arrives | Intro |
| 2 | Grandma's House | Character & world |
| 3 | Tea Shop Morning | Rising action |
| 4 | Market Basket | Rising action |
| 5 | Farm Friends | Belonging |
| 6 | School Morning | Challenge |
| 7 | Playground Friends | Friendship warmth |
| 8 | Pagoda Visit | Quiet climax |
| 9 | Festival Night | Peak & ending |

## Art

- `assets/{id}-learn.jpg` — story session  
- `assets/{id}-sent.jpg` — sentences session (unique, no reuse)  
- Style: paper craft / stop-motion layered diorama  
- **Mudra signature:** pink hair clip with a clearly visible capital **M** (every Mudra portrait)

## Related

- `Mudra holiday trip to Myanmar_GameMap` — earlier RPG/map experiment (separate)  
