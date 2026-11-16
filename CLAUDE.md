# unDraw SVG Integration for Claude Code

When the user asks for illustrations, empty states, 404 pages, hero graphics, or icons:

- Search unDraw: `python scripts/undraw_search.py -q "<keyword>" -l 3 --download -o ./public/illustrations`
- Colorize to match brand: `python scripts/undraw_colorize.py -i <path_to_svg> -c "#HEX_COLOR"`
- Create clean React / Next.js / HTML components wrapping the SVG.
