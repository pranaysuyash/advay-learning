type Webcam = import('react-webcam').default;

declare module 'react-scan' {
  export interface ScanOptions {
    enabled?: boolean;
    trackUnnecessaryRenders?: boolean;
    trackComplexity?: boolean;
    animationSpeed?: 'slow' | 'medium' | 'fast';
    showToolbar?: boolean;
    toolbarPosition?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    log?: boolean;
    include?: string[];
    exclude?: string[];
  }

  export function scan(options: ScanOptions): void;
}
