#!/usr/bin/env python3
"""Apply PPP brand colors to public/logo-mark-source.svg -> public/logo-mark.svg."""

from __future__ import annotations

import re
from collections.abc import Callable
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public" / "logo-mark-source.svg"
OUTPUT = ROOT / "public" / "logo-mark.svg"

COLORS = {
    "fruit": "#d4a853",
    "leaf": "#4a8f55",
    "trunk": "#1e3a2f",
    "root": "#6b4423",
}

ICON_BG = "#f5f0e6"


def start_y(d: str) -> float:
    m = re.match(r"M\s*(-?\d+(?:\.\d+)?)\s+(-?\d+(?:\.\d+)?)", d)
    return float(m.group(2)) if m else 0.0


def classify(d: str) -> str:
    sy = start_y(d)
    if sy >= 4500 and len(d) < 120:
        return "fruit"
    if sy >= 3600:
        return "leaf"
    if sy >= 2300:
        return "trunk"
    return "root"


def build_svg(paths: list[str], fill_for: str | Callable[[str], str]) -> str:
    if callable(fill_for):
        lines = [f'    <path d="{d}" fill="{fill_for(d)}"/>' for d in paths]
    else:
        lines = [f'    <path d="{d}" fill="{fill_for}"/>' for d in paths]
    return (
        '<svg viewBox="0 0 600 608" fill="none" xmlns="http://www.w3.org/2000/svg">\n'
        '  <g transform="translate(0,608) scale(0.1,-0.1)">\n'
        + "\n".join(lines)
        + "\n  </g>\n</svg>\n"
    )


def build_favicon(paths: list[str]) -> str:
    lines = [f'    <path d="{d}" fill="{COLORS[classify(d)]}"/>' for d in paths]
    return (
        '<svg viewBox="0 0 600 608" fill="none" xmlns="http://www.w3.org/2000/svg">\n'
        f'  <circle cx="300" cy="304" r="286" fill="{ICON_BG}"/>\n'
        '  <g transform="translate(0,608) scale(0.1,-0.1)">\n'
        + "\n".join(lines)
        + "\n  </g>\n</svg>\n"
    )


def main() -> None:
    src = SOURCE.read_text()
    paths = re.findall(r'<path d="([^"]+)"\/>', src)
    colored = build_svg(paths, lambda d: COLORS[classify(d)])
    favicon = build_favicon(paths)

    gold = build_svg(paths, "#f0c84a")

    OUTPUT.write_text(colored)
    (ROOT / "public" / "logo.svg").write_text(colored)
    (ROOT / "public" / "logo-mark-gold.svg").write_text(gold)
    (ROOT / "public" / "favicon.svg").write_text(favicon)
    print(f"Recolored {len(paths)} paths -> {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
