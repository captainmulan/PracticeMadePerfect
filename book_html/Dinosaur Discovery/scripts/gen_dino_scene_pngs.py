#!/usr/bin/env python3
"""
DEPRECATED — do not use for final art.

Chapter images must be rich AI illustrations (same quality as
MyFirst100MMWords/assets/overview-story1.png), then embedded via:

  node scripts/gen_chapter_images.cjs
  node _generate-book.cjs

Drop PNG/JPG files into assets/ named:
  {chapter-id}-main-1.png … main-3.png, explain-1.png … explain-3.png

See assets/README.md for chapter IDs.
"""
import sys

print(__doc__)
sys.exit(1)
