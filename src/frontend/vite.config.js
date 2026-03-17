import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { readFileSync } from 'fs';
import { execSync } from 'child_process';
import { visualizer } from 'rollup-plugin-visualizer';

// Get version from package.json
const packageJson = JSON.parse(readFileSync('./package.json', 'utf-8'));

// Get git SHA (short)
let gitSha = 'unknown';
try {
  gitSha = execSync('git rev-parse --short HEAD').toString().trim();
} catch {
  // Git not available (e.g., CI without git, or shallow clone)
}

const getPackageName = (id) => {
  const match = id.match(/node_modules\/((?:@[^/]+\/)?[^/]+)/);
  return match ? match[1] : null;
};

// Note: Env vars are loaded inside the config function below using loadEnv

const getAppChunk = (id, betaThreeDGamesEnabled = false) => {
  if (id.includes('/src/services/ai/')) {
    return 'app-ai';
  }
  if (id.includes('/src/workers/')) {
    return 'app-workers';
  }
  if (
    betaThreeDGamesEnabled &&
    (id.includes('/src/components/game/three/') ||
      id.includes('/src/hooks/use3DGameAudio.ts') ||
      id.includes('/src/hooks/usePerformanceMonitor.ts'))
  ) {
    return 'app-3d';
  }
  if (
    id.includes('/src/components/ui/') ||
    id.includes('/src/components/routing/') ||
    id.includes('/src/store/')
  ) {
    return 'app-shell';
  }
  return undefined;
};

// Base vendor chunks - 3D chunks added dynamically based on env
const getVendorChunks = (betaThreeDGamesEnabled = false) => {
  const chunks = {
    '@huggingface/transformers': 'transformers-runtime',
    'onnxruntime-web': 'onnx-runtime',
    'onnxruntime-common': 'onnx-runtime',
    'kokoro-js': 'kokoro-runtime',
    '@mediapipe/tasks-vision': 'vision-runtime',
    '@tensorflow/tfjs': 'tfjs-runtime',
    'framer-motion': 'motion-runtime',
    'react-router-dom': 'router-runtime',
    'chart.js': 'charts-runtime',
    'react-chartjs-2': 'charts-runtime',
    react: 'react-core',
    'react-dom': 'react-core',
    scheduler: 'react-core',
    zustand: 'state-runtime',
    '@tanstack/react-query': 'query-runtime',
    axios: 'network-runtime',
    'lucide-react': 'icons-runtime',
    i18next: 'i18n-runtime',
    'react-i18next': 'i18n-runtime',
    'i18next-browser-languagedetector': 'i18n-runtime',
    'i18next-http-backend': 'i18n-runtime',
  };

  if (betaThreeDGamesEnabled) {
    Object.assign(chunks, {
      three: 'three-core',
      'three-stdlib': 'three-stdlib-runtime',
      'camera-controls': 'three-stdlib-runtime',
      maath: 'three-helpers-runtime',
      meshline: 'three-helpers-runtime',
      'troika-three-text': 'three-text-runtime',
      'troika-three-utils': 'three-text-runtime',
      'troika-worker-utils': 'three-text-runtime',
      'stats.js': 'three-helpers-runtime',
      '@react-three/fiber': 'r3f-runtime',
      '@react-three/drei': 'drei-runtime',
      '@react-three/cannon': 'react-cannon-runtime',
      '@pmndrs/cannon-worker-api': 'cannon-runtime',
      'cannon-es': 'cannon-runtime',
      'cannon-es-debugger': 'cannon-runtime',
      '@react-spring/three': 'spring-3d-runtime',
    });
  }

  return chunks;
};

export default defineConfig(({ mode }) => {
  // Load env variables from .env files
  const env = loadEnv(mode, process.cwd(), '');

  // Default to enabled for launch builds unless explicitly disabled.
  const betaLocalAIEnabled =
    String(env.VITE_BETA_LOCAL_AI_ENABLED).toLowerCase() !== 'false';
  const betaThreeDGamesEnabled =
    String(env.VITE_BETA_3D_GAMES_ENABLED).toLowerCase() !== 'false';

  return {
    cacheDir: '.vite_cache_new',
    plugins: [
      react(),
      // Bundle analysis - run with: npm run build:analyze
      mode === 'analyze' &&
        visualizer({
          open: true,
          gzipSize: true,
          brotliSize: true,
          filename: 'dist/stats.html',
          title: 'Advay Vision - Bundle Analysis',
          template: 'treemap',
        }),
    ],
    define: {
      __APP_VERSION__: JSON.stringify(packageJson.version),
      __GIT_SHA__: JSON.stringify(gitSha),
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
      __BETA_LOCAL_AI_ENABLED__: JSON.stringify(betaLocalAIEnabled),
      __BETA_3D_GAMES_ENABLED__: JSON.stringify(betaThreeDGamesEnabled),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    worker: {
      format: 'es',
    },
    optimizeDeps: {
      exclude: ['kokoro-js'],
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              const packageName = getPackageName(id);
              const vendorChunks = getVendorChunks(betaThreeDGamesEnabled);
              const vendorChunk = packageName
                ? vendorChunks[packageName]
                : null;
              if (vendorChunk) {
                return vendorChunk;
              }
            }

            return getAppChunk(id, betaThreeDGamesEnabled);
          },
        },
      },
    },
    server: {
      port: 6173,
      proxy: {
        '/api': {
          target: 'http://localhost:8001',
          changeOrigin: true,
        },
      },
    },
  };
});
