/**
 * WebGPU Detection and Feature Utility
 * 
 * Provides runtime detection of WebGPU support with fallback to WebGL.
 * WebGPU offers 2-10x performance improvement for draw-call-heavy scenes.
 * 
 * @see https://developer.mozilla.org/en-US/docs/Web/API/WebGPU_API
 * @see https://threejs.org/docs/#api/en/renderers/WebGPURenderer
 */

export interface WebGPUSupport {
  available: boolean;
  adapter: GPUAdapter | null;
  features: string[];
  limits: GPUSupportedLimits | null;
  isMobile: boolean;
  browser: string;
}

/**
 * Detect WebGPU support in the current browser
 */
export async function detectWebGPU(): Promise<WebGPUSupport> {
  // Check if navigator.gpu exists
  if (!navigator.gpu) {
    return {
      available: false,
      adapter: null,
      features: [],
      limits: null,
      isMobile: isMobileDevice(),
      browser: getBrowserInfo(),
    };
  }

  try {
    // Request adapter (required to confirm WebGPU works)
    const adapter = await navigator.gpu.requestAdapter();
    
    if (!adapter) {
      return {
        available: false,
        adapter: null,
        features: [],
        limits: null,
        isMobile: isMobileDevice(),
        browser: getBrowserInfo(),
      };
    }

    // Get supported features and limits
    const features: string[] = Array.from(adapter.features);
    const limits = adapter.limits;

    return {
      available: true,
      adapter,
      features,
      limits,
      isMobile: isMobileDevice(),
      browser: getBrowserInfo(),
    };
  } catch (error) {
    console.warn('WebGPU detection failed:', error);
    return {
      available: false,
      adapter: null,
      features: [],
      limits: null,
      isMobile: isMobileDevice(),
      browser: getBrowserInfo(),
    };
  }
}

/**
 * Check if device is mobile (affects WebGPU performance expectations)
 */
function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Get browser information
 */
function getBrowserInfo(): string {
  if (typeof navigator === 'undefined') return 'unknown';
  
  const ua = navigator.userAgent;
  
  if (ua.includes('Chrome')) return 'Chrome';
  if (ua.includes('Safari')) return 'Safari';
  if (ua.includes('Firefox')) return 'Firefox';
  if (ua.includes('Edge')) return 'Edge';
  
  return 'Unknown';
}

/**
 * Get recommended quality settings based on WebGPU support and device
 */
export function getRecommendedQuality(webgpuSupport: WebGPUSupport): 'high' | 'medium' | 'low' {
  // WebGPU available on desktop = high quality
  if (webgpuSupport.available && !webgpuSupport.isMobile) {
    return 'high';
  }
  
  // WebGPU on mobile or powerful desktop GPU = medium-high
  if (webgpuSupport.available && webgpuSupport.isMobile) {
    return 'medium';
  }
  
  // WebGL fallback = conservative settings
  return 'low';
}

/**
 * Log WebGPU capabilities for debugging
 */
export function logWebGPUCapabilities(support: WebGPUSupport): void {
  if (!support.available) {
    console.log('🎮 WebGPU: Not available (using WebGL fallback)');
    console.log(`   Browser: ${support.browser}`);
    console.log(`   Mobile: ${support.isMobile}`);
    return;
  }

  console.log('🎮 WebGPU: Available ✅');
  console.log(`   Browser: ${support.browser}`);
  console.log(`   Mobile: ${support.isMobile}`);
  console.log(`   Features: ${support.features.length} supported`);
  
  if (support.limits) {
    console.log(`   Max Texture Dimension 2D: ${support.limits.maxTextureDimension2D}`);
    console.log(`   Max Storage Buffer Binding Size: ${support.limits.maxStorageBufferBindingSize}`);
    console.log(`   Max Compute Workgroup Size X: ${support.limits.maxComputeWorkgroupSizeX}`);
  }
}

/**
 * Hook for React components to get WebGPU support status
 * 
 * @example
 * ```tsx
 * function GameCanvas() {
 *   const { available, isMobile } = useWebGPUSupport();
 *   
 *   return (
 *     <Canvas
 *       gl={{ powerPreference: available ? 'high-performance' : 'low-power' }}
 *     >
 *       {/* WebGPU available: {available ? 'Yes' : 'No'} * /}
 *     </Canvas>
 *   );
 * }
 * ```
 */
export async function useWebGPUSupport() {
  // This is a utility function, not a React hook
  // Use detectWebGPU() in useEffect or similar
  return await detectWebGPU();
}

// Export for convenience
export default {
  detectWebGPU,
  getRecommendedQuality,
  logWebGPUCapabilities,
  isMobileDevice,
  getBrowserInfo,
};
