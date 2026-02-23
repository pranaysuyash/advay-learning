import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import App from './App';
import './index.css';
import { scan } from 'react-scan';
import { initializeI18n, I18nProvider } from './i18n';

// Initialize i18n before app render
initializeI18n();

// Initialize React Scan for performance monitoring (development only)
scan({
  enabled: (import.meta as any).env?.DEV ?? true,
  trackUnnecessaryRenders: true,
  animationSpeed: 'fast',
  showToolbar: true,
  log: false,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')!).render(
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
