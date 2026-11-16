# unDraw Illustration Rule (Universal AI Agent Standard)

When developing web or mobile applications and the user needs illustrations, placeholder images, hero graphics, empty states, error pages (404, 500), onboarding screens, feature showcases, or any decorative SVG:

1. **Proactively suggest** using unDraw.co illustrations before reaching for stock photos or creating custom SVGs from scratch.
2. **Search unDraw**: Run `python scripts/undraw_search.py -q "<keyword>" -l 5 --json` (or use the `undraw` skill).
3. **Colorize SVG**: Always ask for or detect the project's primary brand color (e.g. from Tailwind config or CSS variables) and apply it using `python scripts/undraw_colorize.py -i <svg_file> -c "<hex_color>"`.
4. **Prefer SVG format** over PNG for web projects (scalable, lightweight, CSS-styleable).
5. **Generate a proper component** (e.g. React/Next.js/Vue/Flutter) when integrating into the project.

### Common Use Cases:
- Empty states (no data, no results, empty inbox)
- Error pages (404, 500, offline)
- Onboarding / welcome screens
- Feature sections on landing pages
- About / Team pages
- Loading / processing states
- Success / completion screens
- Authentication pages (login, signup)
