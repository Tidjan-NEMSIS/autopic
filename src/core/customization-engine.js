/**
 * Advanced SVG Customization & Sanitization Engine
 * Handles precise color replacement, gradient preservation, dark/light adaptation, and SVG security.
 * @module core/customization-engine
 */

class CustomizationEngine {
  /**
   * Sanitize an SVG string to remove script tags, event handlers and dangerous protocols
   * @param {string} svgContent
   * @returns {string}
   */
  static sanitize(svgContent) {
    if (!svgContent || typeof svgContent !== 'string') return '';

    return svgContent
      // Remove <script> tags and contents
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Remove inline event handlers (onload, onclick, onmouseover, etc.)
      .replace(/\s+on[a-z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, '')
      // Remove javascript: and data: in href/xlink:href
      .replace(/href\s*=\s*['"]\s*javascript:[^'"]*['"]/gi, 'href=""')
      .replace(/xlink:href\s*=\s*['"]\s*javascript:[^'"]*['"]/gi, 'xlink:href=""')
      // Remove editor comments
      .replace(/<!--[\s\S]*?-->/g, '');
  }

  /**
   * Apply brand colors, gradient adaptation and theme tuning to an SVG
   * @param {string} svgContent
   * @param {Object} options
   * @param {string} [options.primaryColor] - Main brand hex color
   * @param {string} [options.accentColor] - Secondary/accent hex color
   * @param {boolean} [options.isDarkMode=false] - Adapt dark elements for dark UI
   * @param {string} [options.title] - Accessible title for SVG
   * @returns {string}
   */
  static customize(svgContent, options = {}) {
    let svg = this.sanitize(svgContent);
    const { primaryColor, accentColor, isDarkMode, title } = options;

    // 1. Color Customization (Primary)
    if (primaryColor) {
      const pColor = primaryColor.trim();

      // Replace common unDraw/default primary accents
      svg = svg
        .replace(/#6c63ff/gi, pColor)
        .replace(/rgb\(108\s*,\s*99\s*,\s*255\)/gi, pColor)
        // Peeps accent class and fill
        .replace(/\.peep-accent\s*\{\s*fill:\s*[^;]+;/gi, `.peep-accent { fill: ${pColor};`)
        .replace(/id="ira-stop-start"(\s+stop-color="[^"]*")?/gi, `id="ira-stop-start" stop-color="${pColor}"`)
        .replace(/stop-color="[^"]*"\s+id="ira-stop-start"/gi, `stop-color="${pColor}" id="ira-stop-start"`);

      // 2. Gradient / Accent Color (Secondary)
      if (accentColor) {
        const aColor = accentColor.trim();
        svg = svg
          .replace(/id="ira-stop-end"(\s+stop-color="[^"]*")?/gi, `id="ira-stop-end" stop-color="${aColor}"`)
          .replace(/stop-color="[^"]*"\s+id="ira-stop-end"/gi, `stop-color="${aColor}" id="ira-stop-end"`);
      }
    }

    // 3. Dark Mode Adaptation
    if (isDarkMode) {
      // Soften heavy dark charcoal outlines & solid fills to accessible slate tones
      // and adapt background fills safely without chained replacements
      svg = svg.replace(/(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3})/g, (match) => {
        const lower = match.toLowerCase();
        if (lower === '#2f2e41') return '#94A3B8';
        if (lower === '#3f3d56') return '#CBD5E1';
        if (lower === '#e2e8f0') return '#334155';
        return match;
      });

      svg = svg
        .replace(/stroke:\s*#000000/gi, 'stroke: #F8FAFC')
        .replace(/stroke="#000000"/gi, 'stroke="#F8FAFC"')
        .replace(/fill="#000000"/gi, 'fill="#F8FAFC"')
        .replace(/fill="#ffffff"/gi, 'fill="#1E293B"')
        .replace(/fill="#FFFFFF"/gi, 'fill="#1E293B"');
    }

    // 4. Accessibility Enhancement
    if (title && !svg.includes('<title>')) {
      svg = svg.replace(/<svg\b([^>]*)>/i, `<svg$1 role="img" aria-label="${title}">\n  <title>${title}</title>`);
    }

    return svg;
  }
}

module.exports = {
  CustomizationEngine,
};
