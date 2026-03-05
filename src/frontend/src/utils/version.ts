/**
 * Build version utilities
 * 
 * Build info is injected at build time via Vite define config.
 */

declare const __APP_VERSION__: string;
declare const __GIT_SHA__: string;

export function getVersionString(): string {
  const version = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev';
  const sha = typeof __GIT_SHA__ !== 'undefined' ? __GIT_SHA__ : 'unknown';
  return `${version}+${sha.slice(0, 7)}`;
}

export function getAppVersion(): string {
  return typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : 'dev';
}

export function getGitSha(): string {
  return typeof __GIT_SHA__ !== 'undefined' ? __GIT_SHA__ : 'unknown';
}
