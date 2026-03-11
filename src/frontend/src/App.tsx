import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Layout } from './components/ui/Layout';
import { ProtectedRoute } from './components/ui/ProtectedRoute';
import { ToastProvider } from './components/ui/Toast';
import { ConfirmProvider } from './components/ui/ConfirmDialog';
import { ItemDropToast } from './components/inventory/ItemDropToast';
import { BackpackButton } from './components/inventory/BackpackButton';
import { Suspense, useEffect, useRef } from 'react';
import { CameraSafeRoute } from './components/routing/CameraSafeRoute';
import { useAudio } from './utils/hooks/useAudio';
import { GlobalErrorBoundary } from './components/errors/GlobalErrorBoundary';
import { useProgressSync } from './hooks/useProgressSync';
import { CalmModeProvider } from './components/CalmModeProvider';

import * as lazyPages from './routes/lazyPages';

const {
  Home,
  Login,
  Register,
  ForgotPassword,
  ResetPassword,
  Pricing,
  GameSelection,
  Dashboard,
  AlphabetGame,
  Games,
  ConnectTheDots,
  LetterHunt,
  MusicPinchBeat,
  SteadyHandLab,
  ShapePop,
  ColorMatchGarden,
  ColorByNumber,
  ColorPotions,
  MemoryMatch,
  NumberTracing,
  NumberTapTrail,
  NumberSequence,
  ShapeSequence,
  YogaAnimals,
  BalloonPopFitness,
  ObstacleCourse,
  FollowTheLeader,
  MusicalStatues,
  BalanceBeam,
  FreezeDance,
  SimonSays,
  Progress,
  Settings,
  StyleTest,
  FingerNumberShow,
  VirtualChemistryLab,
  WordBuilder,
  EmojiMatch,
  MediaPipeTest,
  AirCanvas,
  MirrorDraw,
  PhonicsSounds,
  PhonicsTracing,
  BeginningSounds,
  EndingSounds,
  OddOneOut,
  SameAndDifferent,
  ShadowMatch,
  ShadowPuppetTheater,
  VirtualBubbles,
  KaleidoscopeHands,
  ShadowPortal,
  AirGuitarHero,
  FruitNinjaAir,
  CountingObjects,
  MoreOrLess,
  BlendBuilder,
  SyllableClap,
  SightWordFlash,
  MazeRunner,
  PathFollowing,
  RhythmTap,
  AnimalSounds,
  BodyParts,
  VoiceStories,
  ReadingAlong,
  WordSearch,
  LetterSoundMatch,
  StoryBuilder,
  MathSmash,
  ColorSortGame,
  LetterCatcher,
  SpellPainter,
  MusicConductor,
  BubbleBiology,
  MirrorMaze,
  CircuitBuilder,
  WeatherLab,
  MirrorDuel,
  PopTheNumber,
  ColorSplash,
  ColorMixing,
  RainbowBridge,
  BeatBounce,
  BubbleCount,
  FeedTheMonster,
  ShapeStacker,
  SizeSorting,
  NumberBubblePop,
  DigitalJenga,
  WeatherMatch,
  FractionPizza,
  TimeTell,
  MoneyMatch,
  PatternPlay,
  BubblePopSymphony,
  DressForWeather,
  StorySequence,
  ShapeSafari,
  FreeDraw,
  MathMonsters,
  BubblePop,
  RhymeTime,
  PhysicsPlayground,
  InventoryPage,
  DiscoveryLab,
  PlatformerRunner,
  CountingCollectathon,
  MathJumpers,
  SimpleAddition,
  TargetPractice,
  CuttingPractice,
  PinchPractice,
  CircleDrawing,
  SpellingRun,
  WashHandsDance,
  PackLunchbox,
  SetTheTable,
  TemperatureSort,
  PlantGarden,
  SoundGarden,
  TasteMatch,
  FarmFriends,
  VowelValley,
  TextureExplorer,
  DinosaurDig,
  LightPainter,
} = lazyPages;

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
                  path='/games/target-practice'
                  element={
                    <ProtectedRoute>
                      <CameraSafeRoute gameName='Target Practice'>
                        <TargetPractice />
                      </CameraSafeRoute>
                    </ProtectedRoute>
                  }
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
                  path='/games/color-potions'
                  element={
                    <ProtectedRoute>
                      <ColorPotions />
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
                  path='/games/balance-beam'
                  element={
                    <ProtectedRoute>
                      <CameraSafeRoute gameName='Balance Beam'>
                        <BalanceBeam />
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
                  path='/games/shadow-portal'
                  element={
                    <ProtectedRoute>
                      <CameraSafeRoute gameName='Shadow Portal'>
                        <ShadowPortal />
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
                  path='/games/weather-lab'
                  element={
                    <ProtectedRoute>
                      <WeatherLab />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/mirror-duel'
                  element={
                    <ProtectedRoute>
                      <MirrorDuel />
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
                  path='/games/math-jumpers'
                  element={
                    <ProtectedRoute>
                      <CameraSafeRoute gameName='Math Jumpers'>
                        <MathJumpers />
                      </CameraSafeRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/simple-addition'
                  element={
                    <ProtectedRoute>
                      <CameraSafeRoute gameName='Simple Addition'>
                        <SimpleAddition />
                      </CameraSafeRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/maze-runner'
                  element={
                    <ProtectedRoute>
                      <CameraSafeRoute gameName='Maze Runner'>
                        <MazeRunner />
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
                  path='/games/circuit-builder'
                  element={
                    <ProtectedRoute>
                      <CircuitBuilder />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/cutting-practice'
                  element={
                    <ProtectedRoute>
                      <CameraSafeRoute gameName='Cutting Practice'>
                        <CuttingPractice />
                      </CameraSafeRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/pinch-practice'
                  element={
                    <ProtectedRoute>
                      <CameraSafeRoute gameName='Pinch Practice'>
                        <PinchPractice />
                      </CameraSafeRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/circle-drawing'
                  element={
                    <ProtectedRoute>
                      <CameraSafeRoute gameName='Circle Drawing'>
                        <CircleDrawing />
                      </CameraSafeRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/spelling-run'
                  element={
                    <ProtectedRoute>
                      <CameraSafeRoute gameName='Spelling Run'>
                        <SpellingRun />
                      </CameraSafeRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/vowel-valley'
                  element={
                    <ProtectedRoute>
                      <CameraSafeRoute gameName='Vowel Valley'>
                        <VowelValley />
                      </CameraSafeRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/wash-hands-dance'
                  element={
                    <ProtectedRoute>
                      <CameraSafeRoute
                        gameName='Wash Hands Dance'
                        cameraRequiredMessage='Wash Hands Dance uses your camera to detect hand movements. Please allow camera access to play this game.'
                      >
                        <WashHandsDance />
                      </CameraSafeRoute>
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/pack-lunchbox'
                  element={
                    <ProtectedRoute>
                      <PackLunchbox />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/set-the-table'
                  element={
                    <ProtectedRoute>
                      <SetTheTable />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/temperature-sort'
                  element={
                    <ProtectedRoute>
                      <TemperatureSort />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/plant-garden'
                  element={
                    <ProtectedRoute>
                      <PlantGarden />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/sound-garden'
                  element={
                    <ProtectedRoute>
                      <SoundGarden />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/taste-match'
                  element={
                    <ProtectedRoute>
                      <TasteMatch />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/farm-friends'
                  element={
                    <ProtectedRoute>
                      <FarmFriends />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/texture-explorer'
                  element={
                    <ProtectedRoute>
                      <TextureExplorer />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/dinosaur-dig'
                  element={
                    <ProtectedRoute>
                      <DinosaurDig />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/light-painter'
                  element={
                    <ProtectedRoute>
                      <LightPainter />
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
                <Route
                  path='/games/bubble-biology'
                  element={
                    <ProtectedRoute>
                      <BubbleBiology />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path='/games/mirror-maze'
                  element={
                    <ProtectedRoute>
                      <MirrorMaze />
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
