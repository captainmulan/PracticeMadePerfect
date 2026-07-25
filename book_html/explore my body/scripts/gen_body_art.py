#!/usr/bin/env python3
"""Generate kid-friendly body chapter PNG illustrations (960x540, 16:9)."""
from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageFont

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
W, H = 960, 540

CHAPTERS = [
    "heart",
    "brain",
    "bones",
    "muscles",
    "lungs",
    "stomach",
    "eyes",
    "ears",
]
SLOTS = ["main-1", "main-2", "main-3", "exp-1", "exp-2", "exp-3"]


def lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t


def gradient_bg(draw: ImageDraw.ImageDraw, c1, c2, c3=None) -> None:
    for y in range(H):
        t = y / H
        if c3 and t > 0.5:
            tt = (t - 0.5) * 2
            r = int(lerp(c2[0], c3[0], tt))
            g = int(lerp(c2[1], c3[1], tt))
            b = int(lerp(c2[2], c3[2], tt))
        else:
            tt = t * 2 if c3 else t
            r = int(lerp(c1[0], c2[0], tt))
            g = int(lerp(c1[1], c2[1], tt))
            b = int(lerp(c1[2], c2[2], tt))
        draw.line([(0, y), (W, y)], fill=(r, g, b))


def add_noise(img: Image.Image, amount: int = 8) -> Image.Image:
    px = img.load()
    rng = random.Random(42)
    for y in range(H):
        for x in range(W):
            r, g, b = px[x, y][:3]
            n = rng.randint(-amount, amount)
            px[x, y] = (
                max(0, min(255, r + n)),
                max(0, min(255, g + n)),
                max(0, min(255, b + n)),
            )
    return img.filter(ImageFilter.GaussianBlur(radius=0.6))


def font(size: int):
    for name in ("arial.ttf", "Arial.ttf", "segoeui.ttf", "DejaVuSans.ttf"):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            continue
    return ImageFont.load_default()


def draw_heart(draw, cx, cy, scale, color=(220, 50, 70)):
    s = scale
    draw.polygon(
        [
            (cx, cy + 0.35 * s),
            (cx - 0.95 * s, cy - 0.15 * s),
            (cx - 0.2 * s, cy - 0.85 * s),
            (cx, cy - 0.35 * s),
            (cx + 0.2 * s, cy - 0.85 * s),
            (cx + 0.95 * s, cy - 0.15 * s),
        ],
        fill=color,
    )
    draw.ellipse(
        [cx - 0.55 * s, cy - 0.75 * s, cx - 0.05 * s, cy - 0.25 * s],
        fill=(240, 90, 100),
    )
    draw.ellipse(
        [cx + 0.05 * s, cy - 0.75 * s, cx + 0.55 * s, cy - 0.25 * s],
        fill=(240, 90, 100),
    )


def draw_brain(draw, cx, cy, scale):
    s = scale
    draw.ellipse([cx - s, cy - s * 0.8, cx + s, cy + s * 0.9], fill=(200, 120, 160))
    for i in range(-3, 4):
        draw.arc(
            [cx - s + i * 18, cy - s, cx + s + i * 18, cy + s],
            200,
            340,
            fill=(160, 80, 120),
            width=4,
        )
    draw.line([(cx, cy - s * 0.7), (cx, cy + s * 0.7)], fill=(150, 70, 110), width=3)


def draw_skeleton_torso(draw, cx, cy, scale):
    s = scale
    draw.ellipse([cx - s * 0.35, cy - s, cx + s * 0.35, cy - s * 0.55], fill=(240, 235, 220))
    for i in range(5):
        y = cy - s * 0.35 + i * s * 0.12
        draw.arc([cx - s * 0.5, y, cx + s * 0.5, y + s * 0.18], 0, 180, fill=(230, 225, 210), width=6)
    draw.line([(cx, cy - s * 0.35), (cx, cy + s * 0.55)], fill=(230, 225, 210), width=8)


def draw_muscle_arm(draw, cx, cy, scale):
    s = scale
    draw.rounded_rectangle([cx - s * 0.25, cy - s * 0.6, cx + s * 0.25, cy + s * 0.5], 20, fill=(180, 60, 80))
    for i in range(4):
        y = cy - s * 0.4 + i * s * 0.22
        draw.arc([cx - s * 0.35, y, cx + s * 0.35, y + s * 0.2], 200, 340, fill=(140, 40, 60), width=3)


def draw_lungs(draw, cx, cy, scale):
    s = scale
    draw.ellipse([cx - s * 0.95, cy - s * 0.7, cx - s * 0.05, cy + s * 0.75], fill=(220, 100, 120))
    draw.ellipse([cx + s * 0.05, cy - s * 0.65, cx + s * 0.95, cy + s * 0.7], fill=(210, 95, 115))
    draw.rectangle([cx - s * 0.08, cy - s * 0.5, cx + s * 0.08, cy + s * 0.5], fill=(180, 60, 70))


def draw_stomach(draw, cx, cy, scale):
    s = scale
    draw.pieslice([cx - s, cy - s * 0.6, cx + s, cy + s * 0.8], 200, 340, fill=(220, 160, 100))
    draw.ellipse([cx - s * 0.7, cy - s * 0.2, cx + s * 0.3, cy + s * 0.5], fill=(200, 140, 80))


def draw_eye(draw, cx, cy, scale):
    s = scale
    draw.ellipse([cx - s, cy - s * 0.55, cx + s, cy + s * 0.55], fill=(255, 255, 255))
    draw.ellipse([cx - s * 0.35, cy - s * 0.35, cx + s * 0.35, cy + s * 0.35], fill=(80, 160, 220))
    draw.ellipse([cx - s * 0.12, cy - s * 0.12, cx + s * 0.12, cy + s * 0.12], fill=(20, 20, 30))
    draw.ellipse([cx - s * 0.05, cy - s * 0.18, cx + s * 0.02, cy - s * 0.08], fill=(255, 255, 255))


def draw_ear(draw, cx, cy, scale):
    s = scale
    draw.arc([cx - s * 0.6, cy - s, cx + s * 0.5, cy + s], 300, 80, fill=(240, 190, 160), width=int(s * 0.35))
    draw.arc([cx - s * 0.35, cy - s * 0.5, cx + s * 0.2, cy + s * 0.6], 300, 80, fill=(220, 170, 140), width=int(s * 0.2))


def caption(draw, title: str, subtitle: str = "") -> None:
    f1 = font(28)
    f2 = font(18)
    draw.rounded_rectangle([24, H - 88, W - 24, H - 24], 12, fill=(0, 0, 0, 140))
    draw.text((40, H - 78), title, fill=(255, 255, 255), font=f1)
    if subtitle:
        draw.text((40, H - 44), subtitle, fill=(200, 220, 255), font=f2)


def render(chapter: str, slot: str) -> Image.Image:
    img = Image.new("RGB", (W, H))
    draw = ImageDraw.Draw(img)
    rng = random.Random(hash((chapter, slot)) & 0xFFFFFFFF)

    themes = {
        "heart": ([40, 10, 30], [120, 20, 50], [60, 15, 40]),
        "brain": ([25, 15, 60], [80, 40, 120], [50, 30, 90]),
        "bones": ([35, 45, 55], [90, 100, 110], [60, 70, 80]),
        "muscles": ([60, 15, 35], [140, 40, 70], [90, 25, 50]),
        "lungs": ([10, 40, 70], [40, 120, 180], [20, 80, 130]),
        "stomach": ([50, 35, 15], [120, 90, 40], [80, 55, 25]),
        "eyes": ([15, 25, 70], [50, 80, 160], [30, 50, 110]),
        "ears": ([45, 20, 70], [100, 50, 140], [70, 35, 100]),
    }
    gradient_bg(draw, *themes[chapter])

    cx, cy = W // 2, H // 2 - 20
    idx = SLOTS.index(slot)

    if chapter == "heart":
        draw_heart(draw, cx, cy, 120 + idx * 8)
        titles = [
            ("Your Amazing Heart", "Maya feels her pulse"),
            ("Blood Delivery", "Oxygen to every cell"),
            ("Four Chambers", "Atria and ventricles"),
            ("Heart Valves", "One-way doors"),
            ("Blood Vessels", "Arteries and veins"),
            ("Strong Heart", "Exercise and rest"),
        ]
    elif chapter == "brain":
        draw_brain(draw, cx, cy, 130)
        titles = [
            ("Your Brain", "Body command centre"),
            ("Left & Right", "Two halves, one team"),
            ("Memory Library", "Learning and sleep"),
            ("Neurons", "Tiny messengers"),
            ("Protected Brain", "Skull and fluid"),
            ("Brain Fuel", "Food and oxygen"),
        ]
    elif chapter == "bones":
        draw_skeleton_torso(draw, cx, cy, 140)
        titles = [
            ("Your Bones", "206 bones support you"),
            ("Living Bones", "Growing and healing"),
            ("Joints", "Where bones meet"),
            ("Bone Structure", "Hard outside, spongy inside"),
            ("Your Spine", "Stack of vertebrae"),
            ("Calcium Power", "Milk, sun, exercise"),
        ]
    elif chapter == "muscles":
        draw_muscle_arm(draw, cx - 40, cy, 130)
        draw_muscle_arm(draw, cx + 80, cy - 30, 100)
        titles = [
            ("Your Muscles", "Pull to move bones"),
            ("Three Types", "Skeletal, smooth, cardiac"),
            ("Warm Up", "Ready for action"),
            ("Fast & Slow", "Sprinters vs marathoners"),
            ("Protein Repair", "After exercise"),
            ("Strongest Muscles", "Jaw and glutes"),
        ]
    elif chapter == "lungs":
        draw_lungs(draw, cx, cy, 130)
        titles = [
            ("Your Lungs", "Breath of life"),
            ("Two Spongy Lungs", "Room for the heart"),
            ("Diaphragm", "Muscle of breathing"),
            ("Alveoli", "Millions of tiny sacs"),
            ("Clean Airways", "Mucus and cilia"),
            ("Deep Breaths", "Calm and focus"),
        ]
    elif chapter == "stomach":
        draw_stomach(draw, cx, cy, 120)
        titles = [
            ("Your Stomach", "Food mixer"),
            ("Stomach Acid", "Strong but protected"),
            ("Small Intestine", "Nutrient absorption"),
            ("Brain-Gut Link", "Butterflies feeling"),
            ("Chew Well", "Digestion starts early"),
            ("Gut Bacteria", "Helpful microbiome"),
        ]
    elif chapter == "eyes":
        draw_eye(draw, cx - 100, cy, 90)
        draw_eye(draw, cx + 100, cy, 90)
        titles = [
            ("Your Eyes", "Windows to the world"),
            ("Rods & Cones", "Night and colour"),
            ("Blink Shield", "Tears and lashes"),
            ("Upside Down", "Brain flips the image"),
            ("Pupil Power", "Iris opens and closes"),
            ("Screen Break", "Rest your focus"),
        ]
    else:  # ears
        draw_ear(draw, cx - 80, cy, 110)
        draw_ear(draw, cx + 80, cy, 110)
        titles = [
            ("Your Ears", "Catch the vibration"),
            ("Tiny Bones", "Hammer, anvil, stirrup"),
            ("Balance", "Inner ear sensors"),
            ("Hair Cells", "Hearing in the cochlea"),
            ("Volume Safety", "Protect your hearing"),
            ("Sound Location", "Left vs right ear"),
        ]

    title, sub = titles[idx]
    caption(draw, title, sub)

    # decorative particles
    for _ in range(40):
        x = rng.randint(0, W)
        y = rng.randint(0, H - 100)
        r = rng.randint(1, 3)
        draw.ellipse([x, y, x + r, y + r], fill=(255, 255, 255, 80))

    return add_noise(img)


def main() -> None:
    ASSETS.mkdir(parents=True, exist_ok=True)
    count = 0
    for chapter in CHAPTERS:
        for slot in SLOTS:
            out = ASSETS / f"{chapter}-{slot}.png"
            render(chapter, slot).save(out, optimize=True)
            count += 1
            print("Wrote", out.name)
    print(f"Done — {count} PNG files in assets/")


if __name__ == "__main__":
    main()
