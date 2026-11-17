/**
 * tidjan-undraw — Universal Multi-Provider Illustration Platform for AI Agents & Developers
 * @module tidjan-undraw
 */

const { registry, ProviderRegistry } = require('./core/registry');
const { LicenseManager } = require('./core/license-manager');
const { SearchEngine } = require('./core/search-engine');
const { ScoringEngine } = require('./core/scoring-engine');
const { CustomizationEngine } = require('./core/customization-engine');
const { IntegrationEngine } = require('./core/integration-engine');
const { CacheManager, defaultCache } = require('./core/cache-manager');
const { FallbackManager } = require('./core/fallback-manager');

// Built-in Providers
const { UndrawProvider } = require('./providers/undraw.provider');
const { OpenPeepsProvider } = require('./providers/openpeeps.provider');
const { IraDesignProvider } = require('./providers/iradesign.provider');
const { StorysetProvider } = require('./providers/storyset.provider');
const { DrawKitProvider } = require('./providers/drawkit.provider');
const { ManyPixelsProvider } = require('./providers/manypixels.provider');

/**
 * Register default built-in providers into the given registry
 * @param {ProviderRegistry} [reg=registry]
 * @returns {ProviderRegistry}
 */
function registerDefaultProviders(reg = registry) {
  if (!reg.has('undraw')) reg.register(new UndrawProvider());
  if (!reg.has('openpeeps')) reg.register(new OpenPeepsProvider());
  if (!reg.has('iradesign')) reg.register(new IraDesignProvider());
  if (!reg.has('storyset')) reg.register(new StorysetProvider());
  if (!reg.has('drawkit')) reg.register(new DrawKitProvider());
  if (!reg.has('manypixels')) reg.register(new ManyPixelsProvider());
  return reg;
}

// Ensure default providers are registered on the global singleton
registerDefaultProviders(registry);

const defaultFallbackManager = new FallbackManager({
  registry,
  cache: defaultCache,
  defaultPriority: ['undraw', 'openpeeps', 'iradesign'],
});

/**
 * High-level search for illustrations with context analysis and multi-criteria scoring
 * @param {string|import('./core/types').IllustrationQuery} promptOrQuery
 * @param {Object} [options]
 * @param {string} [options.cwd]
 * @param {string[]} [options.providers]
 * @param {boolean} [options.includeManual=false]
 * @returns {Promise<import('./core/types').IllustrationResult[]>}
 */
async function searchIllustrations(promptOrQuery, options = {}) {
  const query = typeof promptOrQuery === 'string'
    ? { prompt: promptOrQuery, providerIds: options.providers }
    : { ...promptOrQuery, providerIds: options.providers || promptOrQuery.providerIds };

  return SearchEngine.search(query, options);
}

/**
 * Get details and legal requirements for an illustration
 * @param {string} providerId
 * @param {string} id
 * @returns {Promise<import('./core/types').IllustrationDetails>}
 */
async function getIllustrationDetails(providerId, id) {
  const provider = registry.get(providerId);
  if (!provider) {
    throw new Error(`Provider "${providerId}" not found in registry`);
  }
  return provider.getIllustration(id);
}

/**
 * Download and optionally customize an illustration
 * @param {string} providerId
 * @param {string} id
 * @param {Object} [options]
 * @param {string} [options.primaryColor]
 * @param {string} [options.accentColor]
 * @param {boolean} [options.isDarkMode]
 * @param {string} [options.title]
 * @returns {Promise<import('./core/types').IllustrationAsset>}
 */
async function downloadIllustration(providerId, id, options = {}) {
  const asset = await defaultFallbackManager.download(providerId, id, options);

  if (options.primaryColor || options.accentColor || options.isDarkMode || options.title) {
    const customized = CustomizationEngine.customize(asset.content, options);
    return {
      ...asset,
      content: customized,
    };
  }

  return asset;
}

/**
 * Sanitize and customize an SVG string
 * @param {string} svgContent
 * @param {Object} options
 * @returns {string}
 */
function customizeIllustration(svgContent, options = {}) {
  return CustomizationEngine.customize(svgContent, options);
}

/**
 * End-to-end integration: downloads/customizes SVG and writes framework component
 * @param {Object} params
 * @param {string} [params.providerId]
 * @param {string} [params.id]
 * @param {string} [params.slug]
 * @param {string} [params.title]
 * @param {string} [params.svgContent]
 * @param {string} [params.framework]
 * @param {string} [params.primaryColor]
 * @param {string} [params.accentColor]
 * @param {boolean} [params.isDarkMode]
 * @param {string} [params.cwd]
 * @param {boolean} [params.force=false]
 */
async function integrateIllustration(params) {
  let content = params.svgContent;
  let title = params.title;
  let slug = params.slug;

  if (!content && params.providerId && params.id) {
    const asset = await downloadIllustration(params.providerId, params.id, {
      primaryColor: params.primaryColor,
      accentColor: params.accentColor,
      isDarkMode: params.isDarkMode,
      title: params.title,
      url: params.url || params.svgUrl,
    });
    content = asset.content;
    if (!slug) slug = `${params.providerId}-${params.id}`;
    if (!title) title = slug;
  }

  if (!content) {
    throw new Error('Either svgContent or (providerId and id) must be provided');
  }

  const integration = IntegrationEngine.integrate({
    slug: slug || 'illustration',
    title: title || 'Illustration',
    svgContent: content,
    framework: params.framework,
    cwd: params.cwd,
    force: params.force,
  });

  const provider = params.providerId ? registry.get(params.providerId) : null;
  const attribution = provider ? LicenseManager.getAttribution(provider.license, provider.name) : null;

  return {
    ...integration,
    attribution,
  };
}

/**
 * List registered providers
 * @param {Object} [filter]
 */
function getProviders(filter) {
  return registry.list(filter);
}

/**
 * Audit all registered providers for legal compliance and capabilities
 */
function auditLicenses() {
  const audits = LicenseManager.auditAll();
  return audits.map((audit) => {
    const provider = registry.get(audit.providerId);
    return {
      id: audit.providerId,
      name: provider ? provider.name : audit.providerId,
      status: audit.status,
      license: audit.license,
      automatedDownloadAllowed: audit.automated,
      attributionRequired: audit.attribution,
      url: audit.url,
      compliance: {
        allowedForAutomatedDownload: audit.automated,
        attributionMandatory: audit.attribution,
      },
      capabilities: provider ? provider.getCapabilities() : null,
    };
  });
}

module.exports = {
  // Functional API
  searchIllustrations,
  getIllustrationDetails,
  downloadIllustration,
  customizeIllustration,
  integrateIllustration,
  getProviders,
  auditLicenses,
  registerDefaultProviders,

  // Core Engines & Singletons
  registry,
  ProviderRegistry,
  LicenseManager,
  SearchEngine,
  ScoringEngine,
  CustomizationEngine,
  IntegrationEngine,
  CacheManager,
  FallbackManager,
  defaultCache,
  defaultFallbackManager,

  // Providers
  UndrawProvider,
  OpenPeepsProvider,
  IraDesignProvider,
  StorysetProvider,
  DrawKitProvider,
  ManyPixelsProvider,
};
