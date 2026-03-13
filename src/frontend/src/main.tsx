import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { scan } from 'react-scan';
import { initializeI18n, I18nProvider } from './i18n';
import { preloadItemsManifest } from './utils/itemsManifest';
import { registerServiceWorker } from './pwa/registerServiceWorker';

// Initialize i18n before app render
initializeI18n();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

async function bootstrap() {
  // Initialize React Scan for performance monitoring (development only)
  if (import.meta.env.DEV) {
    scan({
      enabled: true,
      animationSpeed: 'fast',
      showToolbar: true,
      log: false,
    });
  }

  void preloadItemsManifest().catch((error) => {
    console.error('Failed to preload items manifest:', error);
  });

  if (import.meta.env.PROD) {
    void registerServiceWorker();
  }

  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element #root not found');
  }

  ReactDOM.createRoot(rootElement).render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <I18nProvider>
            <App />
          </I18nProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </StrictMode>
  );
}

void bootstrap();
