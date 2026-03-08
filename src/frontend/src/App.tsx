import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/ui/Layout';
import { ProtectedRoute } from './components/ui/ProtectedRoute';
import { ToastProvider } from './components/ui/Toast';
import { ConfirmProvider } from './components/ui/ConfirmDialog';
import { ItemDropToast } from './components/inventory/ItemDropToast';
import { BackpackButton } from './components/inventory/BackpackButton';
import { Suspense, lazy, useEffect, useRef } from 'react';
import { CameraSafeRoute } from './components/routing/CameraSafeRoute';
import { useAudio } from './utils/hooks/useAudio';
import { GlobalErrorBoundary } from './components/errors/GlobalErrorBoundary';
import { useProgressSync } from './hooks/useProgressSync';
import { CalmModeProvider } from './components/CalmModeProvider';

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
const Pricing = lazy(() =>
  import('./pages/Pricing').then((module) => ({ default: module.Pricing })),
);
const GameSelection = lazy(() =>
  import('./pages/GameSelection').then((module) => ({
    default: module.GameSelection,
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
const ColorByNumber = lazy(() =>
  import('./pages/ColorByNumber').then((module) => ({
    default: module.ColorByNumber,
  })),
);
const MemoryMatch = lazy(() =>
  import('./pages/MemoryMatch').then((module) => ({
    default: module.MemoryMatch,
  })),
);
const NumberTracing = lazy(() =>
  import('./pages/NumberTracing').then((module) => ({
    default: module.NumberTracing,
  })),
);
const NumberTapTrail = lazy(() =>
  import('./pages/NumberTapTrail').then((module) => ({
    default: module.NumberTapTrail,
  })),
);
const NumberSequence = lazy(() =>
  import('./pages/NumberSequence').then((module) => ({
    default: module.NumberSequence,
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
const BalloonPopFitness = lazy(() =>
  import('./pages/BalloonPopFitness').then((module) => ({
    default: module.BalloonPopFitness,
  })),
);
const ObstacleCourse = lazy(() =>
  import('./pages/ObstacleCourse').then((module) => ({
    default: module.ObstacleCourse,
  })),
);
const FollowTheLeader = lazy(() =>
  import('./pages/FollowTheLeader').then((module) => ({
    default: module.FollowTheLeader,
  })),
);
const MusicalStatues = lazy(() =>
  import('./pages/MusicalStatues').then((module) => ({
    default: module.MusicalStatues,
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
const PhonicsTracing = lazy(() =>
  import('./pages/PhonicsTracing').then((module) => ({
    default: module.PhonicsTracing,
  })),
);
const BeginningSounds = lazy(() =>
  import('./pages/BeginningSounds').then((module) => ({
    default: module.BeginningSounds,
  })),
);
const EndingSounds = lazy(() =>
  import('./pages/EndingSounds').then((module) => ({
    default: module.EndingSounds,
  })),
);
const OddOneOut = lazy(() =>
  import('./pages/OddOneOut').then((module) => ({
    default: module.OddOneOut,
  })),
);
const SameAndDifferent = lazy(() =>
  import('./pages/SameAndDifferent').then((module) => ({
    default: module.SameAndDifferent,
  })),
);
const ShadowMatch = lazy(() =>
  import('./pages/ShadowMatch').then((module) => ({
    default: module.ShadowMatch,
  })),
);
const ShadowPuppetTheater = lazy(() =>
  import('./pages/ShadowPuppetTheater').then((module) => ({
    default: module.ShadowPuppetTheater,
  })),
);
const VirtualBubbles = lazy(() =>
  import('./pages/VirtualBubbles').then((module) => ({
    default: module.VirtualBubbles,
  })),
);
const KaleidoscopeHands = lazy(() =>
  import('./pages/KaleidoscopeHands').then((module) => ({
    default: module.KaleidoscopeHands,
  })),
);
const AirGuitarHero = lazy(() =>
  import('./pages/AirGuitarHero').then((module) => ({
    default: module.AirGuitarHero,
  })),
);
const FruitNinjaAir = lazy(() =>
  import('./pages/FruitNinjaAir').then((module) => ({
    default: module.FruitNinjaAir,
  })),
);
const CountingObjects = lazy(() =>
  import('./pages/CountingObjects').then((module) => ({
    default: module.CountingObjects,
  })),
);
const MoreOrLess = lazy(() =>
  import('./pages/MoreOrLess').then((module) => ({
    default: module.MoreOrLess,
  })),
);
const BlendBuilder = lazy(() =>
  import('./pages/BlendBuilder').then((module) => ({
    default: module.BlendBuilder,
  })),
);
const SyllableClap = lazy(() =>
  import('./pages/SyllableClap').then((module) => ({
    default: module.SyllableClap,
  })),
);
const SightWordFlash = lazy(() =>
  import('./pages/SightWordFlash').then((module) => ({
    default: module.SightWordFlash,
  })),
);
const MazeRunner = lazy(() =>
  import('./pages/MazeRunner').then((module) => ({
    default: module.MazeRunner,
  })),
);
const PathFollowing = lazy(() =>
  import('./pages/PathFollowing').then((module) => ({
    default: module.PathFollowing,
  })),
);
const RhythmTap = lazy(() =>
  import('./pages/RhythmTap').then((module) => ({
    default: module.RhythmTap,
  })),
);
const AnimalSounds = lazy(() =>
  import('./pages/AnimalSounds').then((module) => ({
    default: module.AnimalSounds,
  })),
);
const BodyParts = lazy(() =>
  import('./pages/BodyParts').then((module) => ({
    default: module.BodyParts,
  })),
);
const VoiceStories = lazy(() =>
  import('./pages/VoiceStories').then((module) => ({
    default: module.VoiceStories,
  })),
);
const ReadingAlong = lazy(() =>
  import('./pages/ReadingAlong').then((module) => ({
    default: module.ReadingAlong,
  })),
);
const WordSearch = lazy(() =>
  import('./pages/WordSearch').then((module) => ({
    default: module.WordSearch,
  })),
);
const LetterSoundMatch = lazy(() =>
  import('./pages/LetterSoundMatch').then((module) => ({
    default: module.LetterSoundMatch,
  })),
);
const StoryBuilder = lazy(() =>
  import('./pages/StoryBuilder').then((module) => ({
    default: module.StoryBuilder,
  })),
);
const MathSmash = lazy(() =>
  import('./pages/MathSmash').then((module) => ({
    default: module.MathSmash,
  })),
);
const ColorSortGame = lazy(() =>
  import('./pages/ColorSortGame').then((module) => ({
    default: module.ColorSortGame,
  })),
);
const LetterCatcher = lazy(() =>
  import('./pages/LetterCatcher').then((module) => ({
    default: module.LetterCatcher,
  })),
);
const SpellPainter = lazy(() =>
  import('./pages/SpellPainter').then((module) => ({
    default: module.SpellPainter,
  })),
);
const MusicConductor = lazy(() =>
  import('./pages/MusicConductor').then((module) => ({
    default: module.MusicConductor,
  })),
);
const PopTheNumber = lazy(() =>
  import('./pages/PopTheNumber').then((module) => ({
    default: module.PopTheNumber,
  })),
);
const ColorSplash = lazy(() =>
  import('./pages/ColorSplash').then((module) => ({
    default: module.ColorSplash,
  })),
);
const ColorMixing = lazy(() =>
  import('./pages/ColorMixing').then((module) => ({
    default: module.ColorMixing,
  })),
);
const RainbowBridge = lazy(() =>
  import('./pages/RainbowBridge').then((module) => ({
    default: module.RainbowBridge,
  })),
);
const BeatBounce = lazy(() =>
  import('./pages/BeatBounce').then((module) => ({
    default: module.BeatBounce,
  })),
);
const BubbleCount = lazy(() =>
  import('./pages/BubbleCount').then((module) => ({
    default: module.BubbleCount,
  })),
);
const FeedTheMonster = lazy(() =>
  import('./pages/FeedTheMonster').then((module) => ({
    default: module.FeedTheMonster,
  })),
);
const ShapeStacker = lazy(() =>
  import('./pages/ShapeStacker').then((module) => ({
    default: module.ShapeStacker,
  })),
);
const SizeSorting = lazy(() =>
  import('./pages/SizeSorting').then((module) => ({
    default: module.SizeSorting,
  })),
);
const NumberBubblePop = lazy(() =>
  import('./pages/NumberBubblePop').then((module) => ({
    default: module.NumberBubblePop,
  })),
);
const DigitalJenga = lazy(() =>
  import('./pages/DigitalJenga').then((module) => ({
    default: module.DigitalJenga,
  })),
);
const WeatherMatch = lazy(() =>
  import('./pages/WeatherMatch').then((module) => ({
    default: module.WeatherMatch,
  })),
);
const FractionPizza = lazy(() =>
  import('./pages/FractionPizza').then((module) => ({
    default: module.FractionPizza,
  })),
);
const TimeTell = lazy(() =>
  import('./pages/TimeTell').then((module) => ({
    default: module.TimeTell,
  })),
);
const MoneyMatch = lazy(() =>
  import('./pages/MoneyMatch').then((module) => ({
    default: module.MoneyMatch,
  })),
);
const PatternPlay = lazy(() =>
  import('./pages/PatternPlay').then((module) => ({
    default: module.PatternPlay,
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
    default: module.FreeDraw,
  })),
);
const MathMonsters = lazy(() =>
  import('./pages/MathMonsters').then((module) => ({
    default: module.default,
  })),
);
const BubblePop = lazy(() =>
  import('./pages/BubblePop').then((module) => ({
    default: module.BubblePop,
  })),
);
const RhymeTime = lazy(() =>
  import('./pages/RhymeTime').then((module) => ({
    default: module.default,
  })),
);
const PhysicsPlayground = lazy(() =>
  import('./pages/PhysicsPlayground').then((module) => ({
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
const PlatformerRunner = lazy(() =>
  import('./pages/PlatformerRunner').then((module) => ({
    default: module.PlatformerRunner,
  })),
);
const CountingCollectathon = lazy(() =>
  import('./pages/CountingCollectathon').then((module) => ({
    default: module.CountingCollectathon,
  })),
);

// Loading component for suspense boundaries
const PageLoader = () => (
  <div className='flex items-center justify-center min-h-screen'>
    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-500'></div>
  </div>
);

function App() {
  useProgressSync();
  const location = useLocation();
  const { playFlip } = useAudio();
  const prevPathName = useRef(location.pathname);

  useEffect(() => {
    if (location.pathname !== prevPathName.current) {
      // Don't play flip sound on initial render
      playFlip();
      prevPathName.current = location.pathname;
    }
  }, [location.pathname, playFlip]);

  return (
    <ToastProvider>
      <ConfirmProvider>
        <CalmModeProvider>
          <GlobalErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                {/* Auth pages - no Layout wrapper (minimal UI for trust) */}
                <Route path='/login' element={<Login />} />
                <Route path='/register' element={<Register />} />
                <Route path='/forgot-password' element={<ForgotPassword />} />
                <Route path='/reset-password' element={<ResetPassword />} />

                {/* All other pages use Layout */}
                <Route
                  path='/pricing'
                  element={
                    <Layout>
                      <Pricing />
                    </Layout>
                  }
                />
                <Route
                  path='/game-selection'
                  element={
                    <ProtectedRoute>
                      <Layout>
                        <GameSelection />
                      </Layout>
                    </ProtectedRoute>
                  }
                />
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
                  path='/games/color-by-number'
                  element={
                    <ProtectedRoute>
                      <ColorByNumber />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/memory-match'
                  element={
                    <ProtectedRoute>
                      <MemoryMatch />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/number-tracing'
                  element={
                    <ProtectedRoute>
                      <NumberTracing />
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
                  path='/games/number-sequence'
                  element={
                    <ProtectedRoute>
                      <NumberSequence />
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
                  path='/games/balloon-pop-fitness'
                  element={
                    <ProtectedRoute>
                      <CameraSafeRoute gameName='Balloon Pop Fitness'>
                        <BalloonPopFitness />
                      </CameraSafeRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/obstacle-course'
                  element={
                    <ProtectedRoute>
                      <CameraSafeRoute gameName='Obstacle Course'>
                        <ObstacleCourse />
                      </CameraSafeRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/follow-the-leader'
                  element={
                    <ProtectedRoute>
                      <CameraSafeRoute gameName='Follow the Leader'>
                        <FollowTheLeader />
                      </CameraSafeRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/musical-statues'
                  element={
                    <ProtectedRoute>
                      <CameraSafeRoute gameName='Musical Statues'>
                        <MusicalStatues />
                      </CameraSafeRoute>
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
                      <CameraSafeRoute gameName='Simon Says'>
                        <SimonSays />
                      </CameraSafeRoute>
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
                  path='/games/phonics-tracing'
                  element={
                    <ProtectedRoute>
                      <CameraSafeRoute gameName='Phonics Tracing'>
                        <PhonicsTracing />
                      </CameraSafeRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/beginning-sounds'
                  element={
                    <ProtectedRoute>
                      <BeginningSounds />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/ending-sounds'
                  element={
                    <ProtectedRoute>
                      <EndingSounds />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/odd-one-out'
                  element={
                    <ProtectedRoute>
                      <OddOneOut />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/same-and-different'
                  element={
                    <ProtectedRoute>
                      <SameAndDifferent />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/shadow-match'
                  element={
                    <ProtectedRoute>
                      <ShadowMatch />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/shadow-puppet-theater'
                  element={
                    <ProtectedRoute>
                      <CameraSafeRoute gameName='Shadow Puppet Theater'>
                        <ShadowPuppetTheater />
                      </CameraSafeRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/virtual-bubbles'
                  element={
                    <ProtectedRoute>
                      <CameraSafeRoute gameName='Virtual Bubbles'>
                        <VirtualBubbles />
                      </CameraSafeRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/kaleidoscope-hands'
                  element={
                    <ProtectedRoute>
                      <CameraSafeRoute gameName='Kaleidoscope Hands'>
                        <KaleidoscopeHands />
                      </CameraSafeRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/air-guitar-hero'
                  element={
                    <ProtectedRoute>
                      <CameraSafeRoute gameName='Air Guitar Hero'>
                        <AirGuitarHero />
                      </CameraSafeRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/fruit-ninja-air'
                  element={
                    <ProtectedRoute>
                      <CameraSafeRoute gameName='Fruit Ninja Air'>
                        <FruitNinjaAir />
                      </CameraSafeRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/counting-objects'
                  element={
                    <ProtectedRoute>
                      <CountingObjects />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/more-or-less'
                  element={
                    <ProtectedRoute>
                      <MoreOrLess />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/blend-builder'
                  element={
                    <ProtectedRoute>
                      <BlendBuilder />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/syllable-clap'
                  element={
                    <ProtectedRoute>
                      <SyllableClap />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/sight-word-flash'
                  element={
                    <ProtectedRoute>
                      <SightWordFlash />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/maze-runner'
                  element={
                    <ProtectedRoute>
                      <MazeRunner />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/path-following'
                  element={
                    <ProtectedRoute>
                      <PathFollowing />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/rhythm-tap'
                  element={
                    <ProtectedRoute>
                      <RhythmTap />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/animal-sounds'
                  element={
                    <ProtectedRoute>
                      <AnimalSounds />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/body-parts'
                  element={
                    <ProtectedRoute>
                      <BodyParts />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/voice-stories'
                  element={
                    <ProtectedRoute>
                      <VoiceStories />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/reading-along'
                  element={
                    <ProtectedRoute>
                      <ReadingAlong />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/math-smash'
                  element={
                    <ProtectedRoute>
                      <MathSmash />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/color-sort'
                  element={
                    <ProtectedRoute>
                      <ColorSortGame />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/letter-catcher'
                  element={
                    <ProtectedRoute>
                      <LetterCatcher />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/number-bubble-pop'
                  element={
                    <ProtectedRoute>
                      <NumberBubblePop />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/pop-the-number'
                  element={
                    <ProtectedRoute>
                      <PopTheNumber />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/color-splash'
                  element={
                    <ProtectedRoute>
                      <ColorSplash />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/color-mixing'
                  element={
                    <ProtectedRoute>
                      <ColorMixing />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/rainbow-bridge'
                  element={
                    <ProtectedRoute>
                      <RainbowBridge />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/beat-bounce'
                  element={
                    <ProtectedRoute>
                      <BeatBounce />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/bubble-count'
                  element={
                    <ProtectedRoute>
                      <BubbleCount />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/feed-the-monster'
                  element={
                    <ProtectedRoute>
                      <FeedTheMonster />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/shape-stacker'
                  element={
                    <ProtectedRoute>
                      <ShapeStacker />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/size-sorting'
                  element={
                    <ProtectedRoute>
                      <SizeSorting />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/digital-jenga'
                  element={
                    <ProtectedRoute>
                      <DigitalJenga />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/weather-match'
                  element={
                    <ProtectedRoute>
                      <WeatherMatch />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/fraction-pizza'
                  element={
                    <ProtectedRoute>
                      <FractionPizza />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/time-tell'
                  element={
                    <ProtectedRoute>
                      <TimeTell />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/money-match'
                  element={
                    <ProtectedRoute>
                      <MoneyMatch />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/pattern-play'
                  element={
                    <ProtectedRoute>
                      <PatternPlay />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/word-search'
                  element={
                    <ProtectedRoute>
                      <WordSearch />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/letter-sound-match'
                  element={
                    <ProtectedRoute>
                      <LetterSoundMatch />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/story-builder'
                  element={
                    <ProtectedRoute>
                      <StoryBuilder />
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
                  path='/games/platformer-runner'
                  element={
                    <ProtectedRoute>
                      <CameraSafeRoute gameName='Platform Runner'>
                        <PlatformerRunner />
                      </CameraSafeRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/counting-collectathon'
                  element={
                    <ProtectedRoute>
                      <CameraSafeRoute gameName='Counting Collect-a-thon'>
                        <CountingCollectathon />
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
                  path='/games/rhyme-time'
                  element={
                    <ProtectedRoute>
                      <CameraSafeRoute gameName='Rhyme Time'>
                        <RhymeTime />
                      </CameraSafeRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/physics-playground'
                  element={
                    <ProtectedRoute>
                      <PhysicsPlayground />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/physics-demo'
                  element={
                    <ProtectedRoute>
                      <PhysicsPlayground />
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
                {import.meta.env.DEV && (
                  <>
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
                  </>
                )}
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
                <Route
                  path='/games/spell-painter'
                  element={
                    <ProtectedRoute>
                      <CameraSafeRoute gameName='Spell Painter'>
                        <SpellPainter />
                      </CameraSafeRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/music-conductor'
                  element={
                    <ProtectedRoute>
                      <MusicConductor />
                    </ProtectedRoute>
                  }
                />
              </Routes>
              <BackpackButton />
              <ItemDropToast />
            </Suspense>
          </GlobalErrorBoundary>
        </CalmModeProvider>
      </ConfirmProvider>
    </ToastProvider>
  );
}

export default App;
