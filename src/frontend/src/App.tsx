import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/ui/Layout';
import { ProtectedRoute } from './components/ui/ProtectedRoute';
import { ToastProvider } from './components/ui/Toast';
import { ConfirmProvider } from './components/ui/ConfirmDialog';
import { Suspense, lazy } from 'react';

// Lazy load pages for code splitting
const Home = lazy(() =>
  import('./pages/Home').then((module) => ({ default: module.Home })),
);
const Login = lazy(() =>
  import('./pages/Login').then((module) => ({ default: module.Login })),
);
const Register = lazy(() =>
  import('./pages/Register').then((module) => ({ default: module.Register })),
);
const ForgotPassword = lazy(() =>
  import('./pages/ForgotPassword').then((module) => ({
    default: module.ForgotPassword,
  })),
);
const ResetPassword = lazy(() =>
  import('./pages/ResetPassword').then((module) => ({
    default: module.ResetPassword,
  })),
);
const Dashboard = lazy(() =>
  import('./pages/Dashboard').then((module) => ({ default: module.Dashboard })),
);
const AlphabetGame = lazy(() =>
  import('./pages/AlphabetGame').then((module) => ({
    default: module.default,
  })),
);
const Games = lazy(() =>
  import('./pages/Games').then((module) => ({ default: module.Games })),
);
const ConnectTheDots = lazy(() =>
  import('./pages/ConnectTheDots').then((module) => ({
    default: module.ConnectTheDots,
  })),
);
const LetterHunt = lazy(() =>
  import('./pages/LetterHunt').then((module) => ({
    default: module.LetterHunt,
  })),
);
const MusicPinchBeat = lazy(() =>
  import('./pages/MusicPinchBeat').then((module) => ({
    default: module.MusicPinchBeat,
  })),
);
const SteadyHandLab = lazy(() =>
  import('./pages/SteadyHandLab').then((module) => ({
    default: module.SteadyHandLab,
  })),
);
const ShapePop = lazy(() =>
  import('./pages/ShapePop').then((module) => ({ default: module.ShapePop })),
);
const ColorMatchGarden = lazy(() =>
  import('./pages/ColorMatchGarden').then((module) => ({
    default: module.ColorMatchGarden,
  })),
);
const NumberTapTrail = lazy(() =>
  import('./pages/NumberTapTrail').then((module) => ({
    default: module.NumberTapTrail,
  })),
);
const ShapeSequence = lazy(() =>
  import('./pages/ShapeSequence').then((module) => ({
    default: module.ShapeSequence,
  })),
);
const YogaAnimals = lazy(() =>
  import('./pages/YogaAnimals').then((module) => ({
    default: module.YogaAnimals,
  })),
);
const FreezeDance = lazy(() =>
  import('./pages/FreezeDance').then((module) => ({
    default: module.FreezeDance,
  })),
);
const SimonSays = lazy(() =>
  import('./pages/SimonSays').then((module) => ({
    default: module.SimonSays,
  })),
);
const Progress = lazy(() =>
  import('./pages/Progress').then((module) => ({ default: module.Progress })),
);
const Settings = lazy(() =>
  import('./pages/Settings').then((module) => ({ default: module.Settings })),
);
const StyleTest = lazy(() =>
  import('./components/StyleTest').then((module) => ({
    default: module.StyleTest,
  })),
);
const FingerNumberShow = lazy(() =>
  import('./games/FingerNumberShow').then((module) => ({
    default: module.FingerNumberShow,
  })),
);
const MediaPipeTest = lazy(() =>
  import('./pages/MediaPipeTest').then((module) => ({
    default: module.MediaPipeTest,
  })),
);

// Loading component for suspense boundaries
const PageLoader = () => (
  <div className='flex items-center justify-center min-h-screen'>
    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-500'></div>
  </div>
);

function App() {
  return (
    <ToastProvider>
      <ConfirmProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Auth pages - no Layout wrapper (minimal UI for trust) */}
            <Route path='/login' element={<Login />} />
            <Route path='/register' element={<Register />} />
            <Route path='/forgot-password' element={<ForgotPassword />} />
            <Route path='/reset-password' element={<ResetPassword />} />

            {/* All other pages use Layout */}
            <Route
              path='/'
              element={
                <Layout>
                  <Home />
                </Layout>
              }
            />
            <Route
              path='/dashboard'
              element={
                <ProtectedRoute>
                  <Layout>
                    <Dashboard />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path='/games/alphabet-tracing'
              element={
                <ProtectedRoute>
                  <AlphabetGame />
                </ProtectedRoute>
              }
            />
            {/* Redirect from old route to new route for backward compatibility */}
            <Route
              path='/game'
              element={<Navigate to='/games/alphabet-tracing' replace />}
            />
            <Route
              path='/games'
              element={
                <ProtectedRoute>
                  <Layout>
                    <Games />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path='/games/finger-number-show'
              element={
                <ProtectedRoute>
                  <FingerNumberShow />
                </ProtectedRoute>
              }
            />
            <Route
              path='/games/connect-the-dots'
              element={
                <ProtectedRoute>
                  <ConnectTheDots />
                </ProtectedRoute>
              }
            />
            <Route
              path='/games/letter-hunt'
              element={
                <ProtectedRoute>
                  <LetterHunt />
                </ProtectedRoute>
              }
            />
            <Route
              path='/games/music-pinch-beat'
              element={
                <ProtectedRoute>
                  <MusicPinchBeat />
                </ProtectedRoute>
              }
            />
            <Route
              path='/games/steady-hand-lab'
              element={
                <ProtectedRoute>
                  <SteadyHandLab />
                </ProtectedRoute>
              }
            />
            <Route
              path='/games/shape-pop'
              element={
                <ProtectedRoute>
                  <ShapePop />
                </ProtectedRoute>
              }
            />
            <Route
              path='/games/color-match-garden'
              element={
                <ProtectedRoute>
                  <ColorMatchGarden />
                </ProtectedRoute>
              }
            />
            <Route
              path='/games/number-tap-trail'
              element={
                <ProtectedRoute>
                  <NumberTapTrail />
                </ProtectedRoute>
              }
            />
            <Route
              path='/games/shape-sequence'
              element={
                <ProtectedRoute>
                  <ShapeSequence />
                </ProtectedRoute>
              }
            />
            <Route
              path='/games/yoga-animals'
              element={
                <ProtectedRoute>
                  <YogaAnimals />
                </ProtectedRoute>
              }
            />
            <Route
              path='/games/freeze-dance'
              element={
                <ProtectedRoute>
                  <FreezeDance />
                </ProtectedRoute>
              }
            />
            <Route
              path='/games/simon-says'
              element={
                <ProtectedRoute>
                  <SimonSays />
                </ProtectedRoute>
              }
            />
            <Route
              path='/progress'
              element={
                <ProtectedRoute>
                  <Layout>
                    <Progress />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path='/settings'
              element={
                <ProtectedRoute>
                  <Layout>
                    <Settings />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path='/style-test'
              element={
                <Layout>
                  <StyleTest />
                </Layout>
              }
            />
            <Route
              path='/test/mediapipe'
              element={
                <Layout>
                  <MediaPipeTest />
                </Layout>
              }
            />
          </Routes>
        </Suspense>
      </ConfirmProvider>
    </ToastProvider>
  );
}

export default App;
