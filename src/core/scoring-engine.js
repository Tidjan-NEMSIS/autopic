/**
 * Multi-criteria Scoring Engine
 * Evaluates semantic relevance, component match, style alignment, color compatibility and licensing.
 * @module core/scoring-engine
 */

class ScoringEngine {
  /**
   * Score an individual illustration result against query and context
   * @param {import('./types').IllustrationResult} illustration
   * @param {import('./types').IllustrationQuery} query
   * @param {import('./types').ProjectContext} context
   * @returns {{ total: number, breakdown: import('./types').ScoreBreakdown }}
   */
  static score(illustration, query, context) {
    const prompt = (query.prompt || '').toLowerCase();
    const promptWords = prompt.split(/\s+/).filter((w) => w.length > 2);
    const haystack = `${illustration.title} ${illustration.slug} ${(illustration.tags || []).join(' ')}`.toLowerCase();

    // 1. Semantic Relevance (Max 30)
    let matchedWords = 0;
    for (const w of promptWords) {
      if (haystack.includes(w)) matchedWords++;
    }
    const semanticScore = promptWords.length > 0
      ? Math.min(30, Math.round((matchedWords / promptWords.length) * 30))
      : 15;

    // 2. Component Match (Max 25)
    let componentScore = 10;
    if (context && context.component && context.component !== 'general') {
      const comp = context.component.toLowerCase();
      if (haystack.includes(comp)) {
        componentScore = 25;
      } else {
        const compSynonyms = {
          '404': ['not found', 'error', 'lost', 'confused', 'missing'],
          'auth': ['login', 'security', 'password', 'door', 'key'],
          'dashboard': ['analytics', 'charts', 'data', 'stats'],
          'empty-state': ['empty', 'inbox', 'blank', 'search', 'void'],
          'checkout': ['payment', 'card', 'finance', 'cart'],
          'team': ['collaborate', 'coworkers', 'people', 'meeting'],
          'hero': ['launch', 'rocket', 'future', 'startup', 'standing'],
        };
        const syns = compSynonyms[comp] || [];
        if (syns.some((s) => haystack.includes(s))) {
          componentScore = 22;
        }
      }
    }

    // 3. Style & Provider Alignment (Max 15)
    let styleScore = 10;
    if (context && context.style) {
      if (context.style === 'avatar' && illustration.providerId === 'openpeeps') {
        styleScore = 15;
      } else if (context.style === 'gradient' && illustration.providerId === 'iradesign') {
        styleScore = 15;
      } else if (context.style === 'flat' && illustration.providerId === 'undraw') {
        styleScore = 15;
      }
    }

    // 4. Color Customization (Max 10)
    let colorScore = 8;
    if (illustration.providerId === 'iradesign' || illustration.providerId === 'undraw' || illustration.providerId === 'openpeeps') {
      colorScore = 10;
    }

    // 5. Format & Vector Quality (Max 10)
    const formatScore = 10; // All approved providers output scalable SVG

    // 6. License Permissiveness & Automation (Max 10)
    let licenseScore = 5;
    if (illustration.status === 'approved') {
      if (illustration.license.type === 'CC0-1.0') licenseScore = 10;
      else if (illustration.license.type === 'MIT') licenseScore = 9;
      else licenseScore = 8; // unDraw
    } else if (illustration.status === 'manual_only') {
      licenseScore = 4;
    }

    const total = Math.min(100, semanticScore + componentScore + styleScore + colorScore + formatScore + licenseScore);

    return {
      total,
      breakdown: {
        semantic: semanticScore,
        component: componentScore,
        style: styleScore,
        color: colorScore,
        format: formatScore,
        license: licenseScore,
      },
    };
  }

  /**
   * Score and rank an array of illustrations descending
   * @param {import('./types').IllustrationResult[]} illustrations
   * @param {import('./types').IllustrationQuery} query
   * @param {import('./types').ProjectContext} context
   * @returns {import('./types').IllustrationResult[]}
   */
  static rank(illustrations, query, context) {
    return illustrations
      .map((item) => {
        const { total, breakdown } = this.score(item, query, context);
        return {
          ...item,
          score: total,
          relevanceScore: total,
          scoreBreakdown: breakdown,
        };
      })
      .sort((a, b) => (b.relevanceScore || 0) - (a.relevanceScore || 0));
  }
}

module.exports = {
  ScoringEngine,
};
