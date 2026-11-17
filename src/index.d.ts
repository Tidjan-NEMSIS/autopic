export type LicenseStatus = 'approved' | 'manual_only' | 'blocked';
export type FrameworkType = 'next' | 'react' | 'vue' | 'svelte' | 'flutter' | 'html';

export interface ProviderCapabilities {
  search: boolean;
  download: boolean;
  colorCustomization: boolean;
  gradientCustomization: boolean;
  componentComposition: boolean;
  rateLimitPerMinute?: number;
}

export interface Illustration {
  id: string;
  title: string;
  slug: string;
  provider: string;
  previewUrl: string;
  downloadUrl?: string;
  tags?: string[];
  license: string;
  style?: 'flat' | 'gradient' | 'avatar' | 'isometric' | 'handdrawn';
  colors?: string[];
}

export interface IllustrationResult extends Illustration {
  score: number;
  scoreBreakdown?: {
    semantic: number;
    component: number;
    style: number;
    color: number;
    format: number;
    license: number;
  };
}

export interface IllustrationAsset {
  content: string;
  mimeType: string;
  format: 'svg' | 'png';
  license: string;
  provider: string;
  attributionRequired: boolean;
  attributionText?: string;
}

export interface SearchOptions {
  cwd?: string;
  providers?: string[];
  includeManual?: boolean;
  limit?: number;
}

export interface DownloadOptions {
  primaryColor?: string;
  accentColor?: string;
  isDarkMode?: boolean;
  title?: string;
}

export interface IntegrateOptions extends DownloadOptions {
  providerId?: string;
  id?: string;
  slug?: string;
  title?: string;
  svgContent?: string;
  framework?: FrameworkType;
  cwd?: string;
  force?: boolean;
}

export interface IntegrationResult {
  framework: FrameworkType;
  compName: string;
  assetPath: string;
  svgResult: { written: boolean; existed: boolean; identical: boolean; path: string };
  componentResult: { written: boolean; existed: boolean; identical: boolean; path: string };
  attribution?: { required: boolean; notice: string; htmlSnippet: string; markdownSnippet: string } | null;
}

export function searchIllustrations(promptOrQuery: string | any, options?: SearchOptions): Promise<IllustrationResult[]>;
export function getIllustrationDetails(providerId: string, id: string): Promise<any>;
export function downloadIllustration(providerId: string, id: string, options?: DownloadOptions): Promise<IllustrationAsset>;
export function customizeIllustration(svgContent: string, options?: DownloadOptions): string;
export function integrateIllustration(params: IntegrateOptions): Promise<IntegrationResult>;
export function getProviders(filter?: any): any[];
export function auditLicenses(): any[];
