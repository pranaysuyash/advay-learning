// Temporary stub to satisfy TypeScript references in the project.
// A real game registry is maintained elsewhere; this placeholder exists
// to keep the build clean while unrelated errors are being fixed.

export interface GameInfo {
  id: string;
  name: string;
  description?: string;
}

// Minimal API used by tests or components that imported this file.
export function getGameInfo(_id: string): GameInfo | undefined {
  // return undefined until real implementation arrives
  return undefined;
}
