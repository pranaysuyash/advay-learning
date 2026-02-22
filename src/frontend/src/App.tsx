import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/ui/Layout';
import { ProtectedRoute } from './components/ui/ProtectedRoute';
import { ToastProvider } from './components/ui/Toast';
import { ConfirmProvider } from './components/ui/ConfirmDialog';
import { ItemDropToast } from './components/inventory/ItemDropToast';
import { BackpackButton } from './components/inventory/BackpackButton';
import { Suspense, lazy, useState, type ReactNode } from 'react';
import { CameraErrorBoundary } from './components/errors/CameraErrorBoundary';
import { CameraCrashFallback } from './components/errors/CameraCrashFallback';

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
const VirtualChemistryLab = lazy(() =>
  import('./pages/VirtualChemistryLab').then((module) => ({
    default: module.VirtualChemistryLab,
  })),
);
const WordBuilder = lazy(() =>
  import('./pages/WordBuilder').then((module) => ({
    default: module.WordBuilder,
  })),
);
const EmojiMatch = lazy(() =>
  import('./pages/EmojiMatch').then((module) => ({
    default: module.EmojiMatch,
  })),
);
const MediaPipeTest = lazy(() =>
  import('./pages/MediaPipeTest').then((module) => ({
    default: module.MediaPipeTest,
  })),
);
const AirCanvas = lazy(() =>
  import('./pages/AirCanvas').then((module) => ({
    default: module.AirCanvas,
  })),
);
const MirrorDraw = lazy(() =>
  import('./pages/MirrorDraw').then((module) => ({
    default: module.MirrorDraw,
  })),
);
const PhonicsSounds = lazy(() =>
  import('./pages/PhonicsSounds').then((module) => ({
    default: module.PhonicsSounds,
  })),
);
const BubblePopSymphony = lazy(() =>
  import('./pages/BubblePopSymphony').then((module) => ({
    default: module.default,
  })),
);
const DressForWeather = lazy(() =>
  import('./pages/DressForWeather').then((module) => ({
    default: module.default,
  })),
);
const StorySequence = lazy(() =>
  import('./pages/StorySequence').then((module) => ({
    default: module.default,
  })),
);
const ShapeSafari = lazy(() =>
  import('./pages/ShapeSafari').then((module) => ({
    default: module.default,
  })),
);
const FreeDraw = lazy(() =>
  import('./pages/FreeDraw').then((module) => ({
    default: module.default,
  })),
);
const MathMonsters = lazy(() =>
  import('./pages/MathMonsters').then((module) => ({
    default: module.default,
  })),
);
const BubblePop = lazy(() =>
  import('./pages/BubblePop').then((module) => ({
    default: module.default,
  })),
);
const PhysicsDemo = lazy(() =>
  import('./pages/PhysicsDemo').then((module) => ({
    default: module.default,
  })),
);
const InventoryPage = lazy(() =>
  import('./pages/Inventory').then((module) => ({
    default: module.Inventory,
  })),
);
const DiscoveryLab = lazy(() =>
  import('./pages/DiscoveryLab').then((module) => ({
    default: module.DiscoveryLab,
  })),
);

// Loading component for suspense boundaries
const PageLoader = () => (
  <div className='flex items-center justify-center min-h-screen'>
    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-500'></div>
  </div>
);

interface CameraSafeRouteProps {
  gameName: string;
  children: ReactNode;
}

function CameraSafeRoute({ gameName, children }: CameraSafeRouteProps) {
  const [renderKey, setRenderKey] = useState(0);
  const [fallbackMode, setFallbackMode] = useState(false);

  if (fallbackMode) {
    return (
      <CameraCrashFallback
        gameName={gameName}
        errorKind='runtime'
        message='This game can continue with touch or mouse controls while camera tracking is unavailable.'
        onRetry={() => {
          setFallbackMode(false);
          setRenderKey((prev) => prev + 1);
        }}
        showHomeAction
      />
    );
  }

  return (
    <CameraErrorBoundary
      gameName={gameName}
      onRetry={() => setRenderKey((prev) => prev + 1)}
      onFallbackMode={() => setFallbackMode(true)}
      onErrorClassified={(kind, error) => {
        console.error(`[CameraBoundary:${gameName}] ${kind}`, error);
      }}
      showHomeAction
    >
      <div key={renderKey}>{children}</div>
    </CameraErrorBoundary>
  );
}

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
                  <CameraSafeRoute gameName='Alphabet Tracing'>
                    <AlphabetGame />
                  </CameraSafeRoute>
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
                  <CameraSafeRoute gameName='Finger Number Show'>
                    <FingerNumberShow />
                  </CameraSafeRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path='/games/connect-the-dots'
              element={
                <ProtectedRoute>
                  <CameraSafeRoute gameName='Connect The Dots'>
                    <ConnectTheDots />
                  </CameraSafeRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path='/games/letter-hunt'
              element={
                <ProtectedRoute>
                  <CameraSafeRoute gameName='Letter Hunt'>
                    <LetterHunt />
                  </CameraSafeRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path='/games/music-pinch-beat'
              element={
                <ProtectedRoute>
                  <CameraSafeRoute gameName='Music Pinch Beat'>
                    <MusicPinchBeat />
                  </CameraSafeRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path='/games/steady-hand-lab'
              element={
                <ProtectedRoute>
                  <CameraSafeRoute gameName='Steady Hand Lab'>
                    <SteadyHandLab />
                  </CameraSafeRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path='/games/shape-pop'
              element={
                <ProtectedRoute>
                  <CameraSafeRoute gameName='Shape Pop'>
                    <ShapePop />
                  </CameraSafeRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path='/games/color-match-garden'
              element={
                <ProtectedRoute>
                  <CameraSafeRoute gameName='Color Match Garden'>
                    <ColorMatchGarden />
                  </CameraSafeRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path='/games/number-tap-trail'
              element={
                <ProtectedRoute>
                  <CameraSafeRoute gameName='Number Tap Trail'>
                    <NumberTapTrail />
                  </CameraSafeRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path='/games/shape-sequence'
              element={
                <ProtectedRoute>
                  <CameraSafeRoute gameName='Shape Sequence'>
                    <ShapeSequence />
                  </CameraSafeRoute>
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
                  <CameraSafeRoute gameName='Freeze Dance'>
                    <FreezeDance />
                  </CameraSafeRoute>
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
              path='/games/chemistry-lab'
              element={
                <ProtectedRoute>
                  <CameraSafeRoute gameName='Virtual Chemistry Lab'>
                    <VirtualChemistryLab />
                  </CameraSafeRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path='/games/word-builder'
              element={
                <ProtectedRoute>
                  <CameraSafeRoute gameName='Word Builder'>
                    <WordBuilder />
                  </CameraSafeRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path='/games/emoji-match'
              element={
                <ProtectedRoute>
                  <CameraSafeRoute gameName='Emoji Match'>
                    <EmojiMatch />
                  </CameraSafeRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path='/games/air-canvas'
              element={
                <ProtectedRoute>
                  <CameraSafeRoute gameName='Air Canvas'>
                    <AirCanvas />
                  </CameraSafeRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path='/games/mirror-draw'
              element={
                <ProtectedRoute>
                  <CameraSafeRoute gameName='Mirror Draw'>
                    <MirrorDraw />
                  </CameraSafeRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path='/games/phonics-sounds'
              element={
                <ProtectedRoute>
                  <CameraSafeRoute gameName='Phonics Sounds'>
                    <PhonicsSounds />
                  </CameraSafeRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path='/games/bubble-pop-symphony'
              element={
                <ProtectedRoute>
                  <CameraSafeRoute gameName='Bubble Pop Symphony'>
                    <BubblePopSymphony />
                  </CameraSafeRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path='/games/dress-for-weather'
              element={
                <ProtectedRoute>
                  <CameraSafeRoute gameName='Dress For Weather'>
                    <DressForWeather />
                  </CameraSafeRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path='/games/story-sequence'
              element={
                <ProtectedRoute>
                  <CameraSafeRoute gameName='Story Sequence'>
                    <StorySequence />
                  </CameraSafeRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path='/games/shape-safari'
              element={
                <ProtectedRoute>
                  <CameraSafeRoute gameName='Shape Safari'>
                    <ShapeSafari />
                  </CameraSafeRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path='/games/free-draw'
              element={
                <ProtectedRoute>
                  <CameraSafeRoute gameName='Free Draw'>
                    <FreeDraw />
                  </CameraSafeRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path='/games/math-monsters'
              element={
                <ProtectedRoute>
                  <CameraSafeRoute gameName='Math Monsters'>
                    <MathMonsters />
                  </CameraSafeRoute>
                </ProtectedRoute>
              }
            />
            <Route
              path='/games/bubble-pop'
              element={
                <ProtectedRoute>
                  <BubblePop />
                </ProtectedRoute>
              }
            />
            <Route
              path='/games/physics-demo'
              element={
                <ProtectedRoute>
                  <PhysicsDemo />
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
            <Route
              path='/inventory'
              element={
                <ProtectedRoute>
                  <Layout>
                    <InventoryPage />
                  </Layout>
                </ProtectedRoute>
              }
            />
            <Route
              path='/discovery-lab'
              element={
                <ProtectedRoute>
                  <Layout>
                    <DiscoveryLab />
                  </Layout>
                </ProtectedRoute>
              }
            />
          </Routes>
          <BackpackButton />
          <ItemDropToast />
        </Suspense>
      </ConfirmProvider>
    </ToastProvider>
  );
}

export default App;
