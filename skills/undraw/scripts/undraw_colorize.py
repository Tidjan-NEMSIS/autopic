"""
unDraw SVG Colorizer
Replaces the default primary color (#6c63ff) in an unDraw SVG with a custom color.

Usage:
    python undraw_colorize.py --input illustration.svg --color "#FF6B6B" [--output colored.svg]
    python undraw_colorize.py --input ./illustrations/ --color "#FF6B6B"  # batch mode on directory
"""

import argparse
import os
import re
import sys


# unDraw's default primary color (case-insensitive variants)
DEFAULT_COLORS = [
    "#6c63ff",
    "#6C63FF",
    "#6c63FF",
    "#6C63ff",
]


def colorize_svg(svg_content: str, new_color: str) -> str:
    """Replace unDraw's default primary color with a custom one."""
    result = svg_content
    for default in DEFAULT_COLORS:
        result = result.replace(default, new_color)
    # Also handle rgb() and fill/stroke attributes with the color
    result = re.sub(
        r'rgb\(108\s*,\s*99\s*,\s*255\s*\)',
        new_color,
        result,
        flags=re.IGNORECASE
    )
    return result


def process_file(input_path: str, new_color: str, output_path: str = None) -> str:
    """Process a single SVG file."""
    with open(input_path, "r", encoding="utf-8") as f:
        content = f.read()

    colored = colorize_svg(content, new_color)

    out = output_path or input_path
    with open(out, "w", encoding="utf-8") as f:
        f.write(colored)

    return out


def main():
    parser = argparse.ArgumentParser(description="Colorize unDraw SVG illustrations")
    parser.add_argument("--input", "-i", required=True, help="SVG file or directory path")
    parser.add_argument("--color", "-c", required=True, help="New primary color (hex, e.g., #FF6B6B)")
    parser.add_argument("--output", "-o", help="Output file/dir (defaults to overwriting input)")
    args = parser.parse_args()

    # Validate hex color
    if not re.match(r'^#[0-9a-fA-F]{6}$', args.color):
        print(f"[error] Invalid hex color: {args.color}. Use format #RRGGBB", file=sys.stderr)
        sys.exit(1)

    if os.path.isdir(args.input):
        # Batch mode
        out_dir = args.output or args.input
        os.makedirs(out_dir, exist_ok=True)
        count = 0
        for filename in os.listdir(args.input):
            if filename.endswith(".svg"):
                in_path = os.path.join(args.input, filename)
                out_path = os.path.join(out_dir, filename)
                process_file(in_path, args.color, out_path)
                count += 1
                print(f"  Colorized: {filename}")
        print(f"\n[info] Colorized {count} SVG files with {args.color}")
    else:
        out = process_file(args.input, args.color, args.output)
        print(f"Colorized: {out}")


if __name__ == "__main__":
    main()
