import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/ui/Layout';
import { ProtectedRoute } from './components/ui/ProtectedRoute';
import { ToastProvider } from './components/ui/Toast';
import { ConfirmProvider } from './components/ui/ConfirmDialog';
import { ItemDropToast } from './components/inventory/ItemDropToast';
import { BackpackButton } from './components/inventory/BackpackButton';
import { Suspense, useEffect, useRef } from 'react';
import { CameraSafeRoute } from './components/routing/CameraSafeRoute';
import type { AppRoute } from './routes/appRoutes';
import { useAudio } from './utils/hooks/useAudio';
import { GlobalErrorBoundary } from './components/errors/GlobalErrorBoundary';
import { useProgressSync } from './hooks/useProgressSync';
import { CalmModeProvider } from './components/CalmModeProvider';
import { SpatialInputProvider } from './context/SpatialInputContext';
import { GlobalCVCursor } from './components/game/GlobalCVCursor';
import { trackPageView } from './analytics/launch';
import './styles/cv-cursor.css';

import { appRoutes } from './routes/appRoutes';

/** Only mount GlobalCVCursor on game routes to avoid heavy CV init on non-game pages */
function GlobalCVCursorGate() {
  const location = useLocation();
  if (!location.pathname.startsWith('/games/')) return null;
  return <GlobalCVCursor />;
}

// Loading component for suspense boundaries
const PageLoader = () => (
  <div className='flex items-center justify-center min-h-screen'>
    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-500'></div>
  </div>
);

function wrapRoute(route: AppRoute) {
  let element = route.element;

  if (route.cameraSafe) {
    element = (
      <CameraSafeRoute
        gameName={route.gameName ?? 'Game'}
        cameraRequiredMessage={route.cameraRequiredMessage}
      >
        {element}
      </CameraSafeRoute>
    );
  }

  if (route.layout) {
    element = <Layout>{element}</Layout>;
  }

  if (route.protected) {
    element = <ProtectedRoute>{element}</ProtectedRoute>;
  }

  return element;
}

function App() {
  useProgressSync();
  const location = useLocation();
  const { playFlip } = useAudio();
  const prevPathName = useRef(location.pathname);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      prevPathName.current = location.pathname;
      return;
    }
    if (location.pathname !== prevPathName.current) {
      trackPageView(location.pathname);
      playFlip();
      prevPathName.current = location.pathname;
    }
  }, [location.pathname, playFlip]);

  return (
    <SpatialInputProvider>
      <ToastProvider>
        <ConfirmProvider>
          <CalmModeProvider>
            <GlobalErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                  {appRoutes
                    .filter((route) => !route.devOnly || import.meta.env.DEV)
                    .map((route) => (
                      <Route
                        key={route.path}
                        path={route.path}
                        element={
                          route.redirectTo ? (
                            <Navigate to={route.redirectTo} replace />
                          ) : (
                            wrapRoute(route)
                          )
                        }
                      />
                    ))}
                </Routes>

                <BackpackButton />
                <ItemDropToast />
              </Suspense>
            </GlobalErrorBoundary>
          </CalmModeProvider>
        </ConfirmProvider>
      </ToastProvider>
      <GlobalCVCursorGate />
    </SpatialInputProvider>
  );
}

export default App;
