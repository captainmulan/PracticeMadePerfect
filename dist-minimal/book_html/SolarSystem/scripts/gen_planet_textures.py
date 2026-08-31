"""Generate embedded NASA-style planet texture data for standalone book HTML."""
from __future__ import annotations

import base64
import io
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets" / "planets"
OUT = ROOT / "_planet-texture-art.js"
SIZE = 384
JPEG_QUALITY = 82


def to_data_uri(path: Path) -> str:
    img = Image.open(path).convert("RGBA" if path.suffix.lower() == ".png" else "RGB")
    img = img.resize((SIZE, SIZE), Image.Resampling.LANCZOS)
    buf = io.BytesIO()
    if path.suffix.lower() == ".png":
        img.save(buf, format="PNG", optimize=True)
        mime = "image/png"
    else:
        if img.mode == "RGBA":
            bg = Image.new("RGB", img.size, (0, 0, 0))
            bg.paste(img, mask=img.split()[3])
            img = bg
        img.save(buf, format="JPEG", quality=JPEG_QUALITY, optimize=True)
        mime = "image/jpeg"
    encoded = base64.b64encode(buf.getvalue()).decode("ascii")
    return f"data:{mime};base64,{encoded}"


def main() -> None:
    mapping = {
        "sun": ASSETS / "sun.jpg",
        "mercury": ASSETS / "mercury.jpg",
        "venus": ASSETS / "venus.jpg",
        "earth": ASSETS / "earth.jpg",
        "mars": ASSETS / "mars.jpg",
        "jupiter": ASSETS / "jupiter.jpg",
        "saturn": ASSETS / "saturn.jpg",
        "uranus": ASSETS / "uranus.jpg",
        "neptune": ASSETS / "neptune.jpg",
    }
    lines = ['/* Planet texture art — NASA maps embedded as data URIs (no external assets) */']
    lines.append("const PLANET_TEXTURE_DATA = {")
    for key, path in mapping.items():
        uri = to_data_uri(path)
        lines.append(f'  {key}: "{uri}",')
    lines.append("};")
    lines.append("")
    lines.append(Path(ROOT / "_planet-texture-art.stub.js").read_text(encoding="utf-8"))
    OUT.write_text("\n".join(lines), encoding="utf-8")
    kb = OUT.stat().st_size / 1024
    print(f"Wrote {OUT.name} ({kb:.1f} KB)")


if __name__ == "__main__":
    main()
