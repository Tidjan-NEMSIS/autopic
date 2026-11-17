/**
 * Centralized License and Legal Compliance Manager
 * Enforces terms of service, attribution requirements, and automation gates.
 * @module core/license-manager
 */

/** @type {Record<string, import('./types').ProviderLicense>} */
const PROVIDER_LICENSES = {
  openpeeps: {
    type: 'CC0-1.0',
    name: 'Creative Commons Zero 1.0 Universal (Public Domain)',
    commercialUse: true,
    attributionRequired: false,
    modificationAllowed: true,
    redistributionAllowed: true,
    automatedDownloadAllowed: true,
    thirdPartyToolIntegrationAllowed: true,
    licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
    lastVerified: '2026-11-17',
    attributionSnippet: 'Open Peeps by Pablo Stanley (CC0 1.0)',
  },
  iradesign: {
    type: 'MIT',
    name: 'MIT License (Creative Tim)',
    commercialUse: true,
    attributionRequired: true,
    modificationAllowed: true,
    redistributionAllowed: true,
    automatedDownloadAllowed: true,
    thirdPartyToolIntegrationAllowed: true,
    licenseUrl: 'https://github.com/creativetimofficial/ira-design/blob/master/LICENSE',
    lastVerified: '2026-11-17',
    attributionSnippet: 'Illustrations by IRA Design / Creative Tim (MIT License)',
  },
  undraw: {
    type: 'unDraw-License',
    name: 'unDraw Open License',
    commercialUse: true,
    attributionRequired: false,
    modificationAllowed: true,
    redistributionAllowed: false, // Cannot compile/mirror as a competing archive
    automatedDownloadAllowed: true, // Internal API querying authorized for personal/commercial builds
    thirdPartyToolIntegrationAllowed: true,
    licenseUrl: 'https://undraw.co/license',
    lastVerified: '2026-11-17',
    attributionSnippet: 'Illustrations by unDraw (Katerina Limpitsouni)',
  },
  storyset: {
    type: 'Freepik-Storyset-License',
    name: 'Storyset License (Freepik Company)',
    commercialUse: true,
    attributionRequired: true, // Mandatory attribution for free tier
    modificationAllowed: true,
    redistributionAllowed: false,
    automatedDownloadAllowed: false, // Direct automated scraping is strictly prohibited by Freepik terms
    thirdPartyToolIntegrationAllowed: false, // Requires official partner API or manual download
    licenseUrl: 'https://storyset.com/terms-of-use',
    lastVerified: '2026-11-17',
    attributionSnippet: 'Illustration by Storyset - https://storyset.com',
  },
  drawkit: {
    type: 'DrawKit-Free-License',
    name: 'DrawKit Free License',
    commercialUse: true,
    attributionRequired: false,
    modificationAllowed: true,
    redistributionAllowed: false, // No standalone redistribution or pack archiving
    automatedDownloadAllowed: false, // No official free search API
    thirdPartyToolIntegrationAllowed: false,
    licenseUrl: 'https://www.drawkit.com/license',
    lastVerified: '2026-11-17',
    attributionSnippet: 'Illustration from DrawKit (https://drawkit.com)',
  },
  manypixels: {
    type: 'ManyPixels-Free-License',
    name: 'ManyPixels Royalty-Free License',
    commercialUse: true,
    attributionRequired: false,
    modificationAllowed: true,
    redistributionAllowed: false, // Sublicensing and compiling forbidden
    automatedDownloadAllowed: false, // Scraping and automated mass downloading explicitly forbidden
    thirdPartyToolIntegrationAllowed: false,
    licenseUrl: 'https://www.manypixels.co/license',
    lastVerified: '2026-11-17',
    attributionSnippet: 'Illustration by ManyPixels (https://manypixels.co)',
  },
};

class LicenseManager {
  /**
   * Get provider license definition
   * @param {string} providerId
   * @returns {import('./types').ProviderLicense}
   */
  static getLicense(providerId) {
    const key = providerId.toLowerCase().trim();
    if (!PROVIDER_LICENSES[key]) {
      // Default fail-safe: unknown providers are treated as blocked
      return {
        type: 'UNKNOWN',
        name: 'Unknown License - Not Verified',
        commercialUse: false,
        attributionRequired: true,
        modificationAllowed: false,
        redistributionAllowed: false,
        automatedDownloadAllowed: false,
        thirdPartyToolIntegrationAllowed: false,
        licenseUrl: '',
        lastVerified: 'never',
      };
    }
    return { ...PROVIDER_LICENSES[key] };
  }

  /**
   * Determine authorization status of a provider
   * @param {string} providerId
   * @returns {import('./types').ProviderStatus}
   */
  static getStatus(providerId) {
    const lic = this.getLicense(providerId);
    if (!lic || lic.type === 'UNKNOWN') return 'blocked';
    if (lic.automatedDownloadAllowed && lic.commercialUse) return 'approved';
    return 'manual_only';
  }

  /**
   * Check if automated integration is approved
   * @param {string} providerId
   * @returns {boolean}
   */
  static isApproved(providerId) {
    return this.getStatus(providerId) === 'approved';
  }

  /**
   * Check if attribution is strictly mandatory
   * @param {string} providerId
   * @returns {boolean}
   */
  static isAttributionRequired(providerId) {
    return this.getLicense(providerId).attributionRequired;
  }

  /**
   * Get legal attribution statement for an illustration
   * @param {string} providerId
   * @param {string} [title]
   * @returns {string}
   */
  static getAttributionText(providerId, title = '') {
    const lic = this.getLicense(providerId);
    if (!lic.attributionSnippet) return '';
    return title ? `${title} — ${lic.attributionSnippet}` : lic.attributionSnippet;
  }

  /**
   * Get structured attribution details
   * @param {string|Object} providerOrLicense
   * @param {string} [name]
   * @returns {{ required: boolean, notice: string, htmlSnippet: string, markdownSnippet: string }}
   */
  static getAttribution(providerOrLicense, name = '') {
    const providerId = typeof providerOrLicense === 'string'
      ? providerOrLicense
      : (providerOrLicense?.id || '');
    const lic = providerId ? this.getLicense(providerId) : (providerOrLicense || {});
    const required = Boolean(lic.attributionRequired);
    const notice = lic.attributionSnippet || (required ? `Illustration provided by ${name || 'author'}` : '');

    return {
      required,
      notice,
      htmlSnippet: notice ? `<!-- Attribution: ${notice} -->` : '',
      markdownSnippet: notice ? `*Attribution: ${notice}*` : '',
    };
  }

  /**
   * Return a full compliance audit of all providers
   * @returns {Array<{ providerId: string, status: import('./types').ProviderStatus, license: string, automated: boolean, attribution: boolean }>}
   */
  static auditAll() {
    return Object.keys(PROVIDER_LICENSES).map((id) => {
      const lic = PROVIDER_LICENSES[id];
      return {
        providerId: id,
        status: this.getStatus(id),
        license: lic.name,
        automated: lic.automatedDownloadAllowed,
        attribution: lic.attributionRequired,
        url: lic.licenseUrl,
      };
    });
  }
}

module.exports = {
  LicenseManager,
  PROVIDER_LICENSES,
};
