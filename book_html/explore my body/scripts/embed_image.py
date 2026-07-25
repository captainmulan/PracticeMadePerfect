#!/usr/bin/env python3
"""Resize PNG to JPEG data-uri payload for embed script."""
import base64
import io
import sys
from pathlib import Path

from PIL import Image

path = Path(sys.argv[1])
img = Image.open(path).convert("RGB")
img = img.resize((640, 360), Image.Resampling.LANCZOS)
buf = io.BytesIO()
img.save(buf, format="JPEG", quality=82, optimize=True)
print(base64.b64encode(buf.getvalue()).decode("ascii"))
