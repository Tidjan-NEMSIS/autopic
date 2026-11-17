/**
 * Core type definitions for tidjan-undraw platform
 * @module core/types
 */

/**
 * @typedef {'approved' | 'manual_only' | 'blocked'} ProviderStatus
 */

/**
 * @typedef {Object} ProviderLicense
 * @property {string} type - Identifier of the license (e.g. 'CC0-1.0', 'MIT')
 * @property {string} name - Human readable license name
 * @property {boolean} commercialUse - Whether commercial use is granted
 * @property {boolean} attributionRequired - Whether attribution/credit is mandatory
 * @property {boolean} modificationAllowed - Whether modifying colors/vectors is allowed
 * @property {boolean} redistributionAllowed - Whether redistribution in standalone packs is allowed
 * @property {boolean} automatedDownloadAllowed - Whether automated download via API is officially authorized
 * @property {boolean} thirdPartyToolIntegrationAllowed - Whether AI/IDE tool integration is authorized
 * @property {string} licenseUrl - Official license terms URL
 * @property {string} lastVerified - ISO date string of last legal verification
 * @property {string} [attributionSnippet] - Pre-formatted attribution text/HTML
 */

/**
 * @typedef {Object} ProviderCapabilities
 * @property {boolean} search - Supports querying by keyword/concept
 * @property {boolean} directDownload - Supports downloading raw SVG directly
 * @property {boolean} colorCustomization - Supports primary color recoloring
 * @property {boolean} gradientCustomization - Supports gradient adjustments
 * @property {boolean} composition - Supports assembling multiple character parts
 * @property {boolean} darkLightAdaptation - Supports dark mode color tuning
 * @property {string[]} formats - Formats provided (e.g. ['svg'])
 */

/**
 * @typedef {Object} ProjectContext
 * @property {string} [component] - Target component type ('404', 'login', 'empty-state', 'hero', 'onboarding', etc.)
 * @property {string} [mood] - Visual tone ('professional', 'playful', 'minimalist', 'tech')
 * @property {string} [style] - Preferred illustration style ('flat', 'hand-drawn', 'gradient', 'avatar')
 * @property {string} [framework] - Project framework ('nextjs' | 'react' | 'vue' | 'svelte' | 'flutter' | 'html')
 * @property {'light' | 'dark' | 'auto'} [theme] - Theme preference
 * @property {string} [primaryColor] - Detected or specified primary hex color
 * @property {string} [accentColor] - Detected or specified accent hex color
 * @property {string} [colorSource] - Where the color was found ('tailwind.config', 'globals.css', etc.)
 */

/**
 * @typedef {Object} IllustrationQuery
 * @property {string} prompt - Free-form search prompt or concept
 * @property {string[]} [keywords] - Specific keywords
 * @property {ProjectContext} [context] - Project visual context
 * @property {number} [limit] - Max items per provider (default: 5)
 * @property {string[]} [providerIds] - Restrict search to specific provider IDs
 * @property {ProviderStatus[]} [allowedStatuses] - Allowed provider statuses (default: ['approved'])
 */

/**
 * @typedef {Object} ScoreBreakdown
 * @property {number} semantic - Semantic/keyword relevance (0-100)
 * @property {number} component - Fit with component type (0-100)
 * @property {number} style - Alignment with requested visual style (0-100)
 * @property {number} color - Color compatibility (0-100)
 * @property {number} format - SVG/Vector compatibility (0-100)
 * @property {number} license - Licensing permissiveness (0-100)
 */

/**
 * @typedef {Object} IllustrationResult
 * @property {string} id - Unique identifier (scoped: e.g. 'undraw:server-error_syuz')
 * @property {string} title - Illustration title
 * @property {string} slug - Filesystem-safe slug
 * @property {string} providerId - Provider identifier ('undraw', 'openpeeps', etc.)
 * @property {string} providerName - Provider human name
 * @property {string} [thumbnailUrl] - Preview URL
 * @property {string} [svgUrl] - Direct SVG asset URL
 * @property {string} [manualUrl] - Official web page for manual download
 * @property {ProviderLicense} license - Licensing metadata
 * @property {ProviderStatus} status - Status ('approved', 'manual_only', 'blocked')
 * @property {string[]} tags - Associated semantic tags
 * @property {number} [relevanceScore] - Composite score (0-100)
 * @property {ScoreBreakdown} [scoreBreakdown] - Detailed breakdown of score
 */

/**
 * @typedef {IllustrationResult & {
 *   rawSvg?: string,
 *   dimensions?: { width: number, height: number, viewBox?: string },
 *   defaultPrimaryColor?: string,
 *   attributionRequired: boolean,
 *   attributionSnippet?: string
 * }} IllustrationDetails
 */

/**
 * @typedef {Object} DownloadOptions
 * @property {string} [outputDir] - Destination folder
 * @property {string} [primaryColor] - Hex color to apply
 * @property {string} [accentColor] - Accent color to apply
 * @property {boolean} [isDarkMode] - Adapt for dark background
 * @property {boolean} [force] - Overwrite existing file
 * @property {string} [customFileName] - Custom file name
 */

/**
 * @typedef {Object} IllustrationAsset
 * @property {string} id - Illustration ID
 * @property {string} providerId - Provider ID
 * @property {string} fileName - File name saved on disk
 * @property {string} filePath - Absolute or relative file path
 * @property {string} content - SVG content
 * @property {'svg' | 'png'} format - File format
 * @property {boolean} cached - Whether file was loaded from local cache
 * @property {ProviderLicense} license - License details
 * @property {string} [attributionText] - Mandatory attribution statement if applicable
 * @property {Object} [appliedColors] - Applied colors metadata
 */

module.exports = {};
