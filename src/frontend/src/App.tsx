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
import { trackPageView } from './analytics/launch';

import * as lazyPages from './routes/lazyPages';
import { VerifyEmail } from './routes/lazyPages';

const {
  Home,
  Login,
  Register,
  ForgotPassword,
  ResetPassword,
  Pricing,
  PrivacyPolicy,
  TermsOfPlay,
  Support,
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
  NasaSkyHunt,
  PlanetSandbox,
  EarthTimeMachine,
  ISSDocking,
  BridgeBuilder,
  LogicBoxPush,
  CatchSort,
  WeatherLab,
  LanguagePuppet,
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
  TidyUpTime,
  VirtualArchery,
  DigitalJenga3D,
  DressForWeather3D,
  ObstacleCourse3D,
  FeedTheMonster3D,
  VirtualBubbles3D,
  FingerPaintingMadness,
} = lazyPages;

// Loading component for suspense boundaries
const PageLoader = () => (
  <div className='flex items-center justify-center min-h-screen'>
    <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-red-500'></div>
  </div>
);


export type AppRoute = {
  path: string;
  element: React.ReactNode;
  protected?: boolean;
  layout?: boolean;
  cameraSafe?: boolean;
  gameName?: string;
  cameraRequiredMessage?: string;
  devOnly?: boolean;
  redirectTo?: string;
};

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

const appRoutes: AppRoute[] = [
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  { path: '/forgot-password', element: <ForgotPassword /> },
  { path: '/reset-password', element: <ResetPassword /> },
  { path: '/verify-email', element: <VerifyEmail /> },
  { path: '/pricing', element: <Pricing />, layout: true },
  { path: '/privacy', element: <PrivacyPolicy />, layout: true },
  { path: '/terms', element: <TermsOfPlay />, layout: true },
  { path: '/support', element: <Support />, layout: true },
  { path: '/game-selection', element: <GameSelection />, protected: true, layout: true },
  { path: '/', element: <Home />, layout: true },
  { path: '/dashboard', element: <Dashboard />, protected: true, layout: true },
  { path: '/games/alphabet-tracing', element: <AlphabetGame />, protected: true, cameraSafe: true, gameName: 'Alphabet Tracing' },
  { path: '/game', element: null, redirectTo: '/games/alphabet-tracing' },
  { path: '/games/target-practice', element: <TargetPractice />, protected: true, cameraSafe: true, gameName: 'Target Practice' },
  { path: '/games', element: <Games />, protected: true, layout: true },
  { path: '/games/finger-number-show', element: <FingerNumberShow />, protected: true, cameraSafe: true, gameName: 'Finger Number Show' },
  { path: '/games/connect-the-dots', element: <ConnectTheDots />, protected: true, cameraSafe: true, gameName: 'Connect The Dots' },
  { path: '/games/letter-hunt', element: <LetterHunt />, protected: true, cameraSafe: true, gameName: 'Letter Hunt' },
  { path: '/games/music-pinch-beat', element: <MusicPinchBeat />, protected: true, cameraSafe: true, gameName: 'Music Pinch Beat' },
  { path: '/games/steady-hand-lab', element: <SteadyHandLab />, protected: true, cameraSafe: true, gameName: 'Steady Hand Lab' },
  { path: '/games/shape-pop', element: <ShapePop />, protected: true, cameraSafe: true, gameName: 'Shape Pop' },
  { path: '/games/color-match-garden', element: <ColorMatchGarden />, protected: true, cameraSafe: true, gameName: 'Color Match Garden' },
  { path: '/games/color-by-number', element: <ColorByNumber />, protected: true, cameraSafe: true, gameName: 'Color By Number' },
  { path: '/games/color-potions', element: <ColorPotions />, protected: true, cameraSafe: true, gameName: 'Color Potions' },
  { path: '/games/memory-match', element: <MemoryMatch />, protected: true, cameraSafe: true, gameName: 'Memory Match' },
  { path: '/games/number-tracing', element: <NumberTracing />, protected: true, cameraSafe: true, gameName: 'Number Tracing' },
  { path: '/games/number-tap-trail', element: <NumberTapTrail />, protected: true, cameraSafe: true, gameName: 'Number Tap Trail' },
  { path: '/games/number-sequence', element: <NumberSequence />, protected: true, cameraSafe: true, gameName: 'Number Sequence' },
  { path: '/games/shape-sequence', element: <ShapeSequence />, protected: true, cameraSafe: true, gameName: 'Shape Sequence' },
  { path: '/games/yoga-animals', element: <YogaAnimals />, protected: true, cameraSafe: true, gameName: 'Yoga Animals' },
  { path: '/games/balloon-pop-fitness', element: <BalloonPopFitness />, protected: true, cameraSafe: true, gameName: 'Balloon Pop Fitness' },
  { path: '/games/obstacle-course', element: <ObstacleCourse />, protected: true, cameraSafe: true, gameName: 'Obstacle Course' },
  { path: '/games/follow-the-leader', element: <FollowTheLeader />, protected: true, cameraSafe: true, gameName: 'Follow the Leader' },
  { path: '/games/musical-statues', element: <MusicalStatues />, protected: true, cameraSafe: true, gameName: 'Musical Statues' },
  { path: '/games/balance-beam', element: <BalanceBeam />, protected: true, cameraSafe: true, gameName: 'Balance Beam' },
  { path: '/games/virtual-archery', element: <VirtualArchery />, protected: true, cameraSafe: true, gameName: 'Virtual Archery' },
  { path: '/games/freeze-dance', element: <FreezeDance />, protected: true, cameraSafe: true, gameName: 'Freeze Dance' },
  { path: '/games/simon-says', element: <SimonSays />, protected: true, cameraSafe: true, gameName: 'Simon Says' },
  { path: '/games/chemistry-lab', element: <VirtualChemistryLab />, protected: true, cameraSafe: true, gameName: 'Virtual Chemistry Lab' },
  { path: '/games/word-builder', element: <WordBuilder />, protected: true, cameraSafe: true, gameName: 'Word Builder' },
  { path: '/games/emoji-match', element: <EmojiMatch />, protected: true, cameraSafe: true, gameName: 'Emoji Match' },
  { path: '/games/air-canvas', element: <AirCanvas />, protected: true, cameraSafe: true, gameName: 'Air Canvas' },
  { path: '/games/mirror-draw', element: <MirrorDraw />, protected: true, cameraSafe: true, gameName: 'Mirror Draw' },
  { path: '/games/phonics-sounds', element: <PhonicsSounds />, protected: true, cameraSafe: true, gameName: 'Phonics Sounds' },
  { path: '/games/phonics-tracing', element: <PhonicsTracing />, protected: true, cameraSafe: true, gameName: 'Phonics Tracing' },
  { path: '/games/beginning-sounds', element: <BeginningSounds />, protected: true, cameraSafe: true, gameName: 'Beginning Sounds' },
  { path: '/games/ending-sounds', element: <EndingSounds />, protected: true, cameraSafe: true, gameName: 'Ending Sounds' },
  { path: '/games/odd-one-out', element: <OddOneOut />, protected: true, cameraSafe: true, gameName: 'Odd One Out' },
  { path: '/games/same-and-different', element: <SameAndDifferent />, protected: true, cameraSafe: true, gameName: 'Same And Different' },
  { path: '/games/shadow-match', element: <ShadowMatch />, protected: true, cameraSafe: true, gameName: 'Shadow Match' },
  { path: '/games/shadow-puppet-theater', element: <ShadowPuppetTheater />, protected: true, cameraSafe: true, gameName: 'Shadow Puppet Theater' },
  { path: '/games/virtual-bubbles', element: <VirtualBubbles />, protected: true, cameraSafe: true, gameName: 'Virtual Bubbles' },
  { path: '/games/kaleidoscope-hands', element: <KaleidoscopeHands />, protected: true, cameraSafe: true, gameName: 'Kaleidoscope Hands' },
  { path: '/games/shadow-portal', element: <ShadowPortal />, protected: true, cameraSafe: true, gameName: 'Shadow Portal' },
  { path: '/games/air-guitar-hero', element: <AirGuitarHero />, protected: true, cameraSafe: true, gameName: 'Air Guitar Hero' },
  { path: '/games/fruit-ninja-air', element: <FruitNinjaAir />, protected: true, cameraSafe: true, gameName: 'Fruit Ninja Air' },
  { path: '/games/counting-objects', element: <CountingObjects />, protected: true, cameraSafe: true, gameName: 'Counting Objects' },
  { path: '/games/more-or-less', element: <MoreOrLess />, protected: true, cameraSafe: true, gameName: 'More Or Less' },
  { path: '/games/blend-builder', element: <BlendBuilder />, protected: true, cameraSafe: true, gameName: 'Blend Builder' },
  { path: '/games/syllable-clap', element: <SyllableClap />, protected: true, cameraSafe: true, gameName: 'Syllable Clap' },
  { path: '/games/sight-word-flash', element: <SightWordFlash />, protected: true, cameraSafe: true, gameName: 'Sight Word Flash' },
  { path: '/games/path-following', element: <PathFollowing />, protected: true, cameraSafe: true, gameName: 'Path Following' },
  { path: '/games/rhythm-tap', element: <RhythmTap />, protected: true, cameraSafe: true, gameName: 'Rhythm Tap' },
  { path: '/games/animal-sounds', element: <AnimalSounds />, protected: true, cameraSafe: true, gameName: 'Animal Sounds' },
  { path: '/games/body-parts', element: <BodyParts />, protected: true, cameraSafe: true, gameName: 'Body Parts' },
  { path: '/games/voice-stories', element: <VoiceStories />, protected: true, cameraSafe: true, gameName: 'Voice Stories' },
  { path: '/games/reading-along', element: <ReadingAlong />, protected: true, cameraSafe: true, gameName: 'Reading Along' },
  { path: '/games/math-smash', element: <MathSmash />, protected: true, cameraSafe: true, gameName: 'Math Smash' },
  { path: '/games/color-sort', element: <ColorSortGame />, protected: true, cameraSafe: true, gameName: 'Color Sort' },
  { path: '/games/letter-catcher', element: <LetterCatcher />, protected: true, cameraSafe: true, gameName: 'Letter Catcher' },
  { path: '/games/number-bubble-pop', element: <NumberBubblePop />, protected: true, cameraSafe: true, gameName: 'Number Bubble Pop' },
  { path: '/games/weather-lab', element: <WeatherLab />, protected: true, cameraSafe: true, gameName: 'Weather Lab' },
  { path: '/games/nasa-sky-hunt', element: <NasaSkyHunt />, protected: true, cameraSafe: true, gameName: 'NASA Sky Hunt' },
  { path: '/games/mirror-duel', element: <MirrorDuel />, protected: true, cameraSafe: true, gameName: 'Mirror Duel' },
  { path: '/games/language-puppet', element: <LanguagePuppet />, protected: true, cameraSafe: true, gameName: 'Language Puppet' },
  { path: '/games/planet-sandbox', element: <PlanetSandbox />, protected: true, cameraSafe: true, gameName: 'Planet Sandbox' },
  { path: '/games/earth-time-machine', element: <EarthTimeMachine />, protected: true, cameraSafe: true, gameName: 'Earth Time Machine' },
  { path: '/games/iss-docking', element: <ISSDocking />, protected: true, cameraSafe: true, gameName: 'ISS Docking' },
  { path: '/games/bridge-builder', element: <BridgeBuilder />, protected: true, cameraSafe: true, gameName: 'Bridge Builder' },
  { path: '/games/logic-box-push', element: <LogicBoxPush />, protected: true, cameraSafe: true, gameName: 'Logic Box Push' },
  { path: '/games/catch-sort', element: <CatchSort />, protected: true, cameraSafe: true, gameName: 'Catch Sort' },
  { path: '/games/pop-the-number', element: <PopTheNumber />, protected: true, cameraSafe: true, gameName: 'Pop The Number' },
  { path: '/games/color-splash', element: <ColorSplash />, protected: true, cameraSafe: true, gameName: 'Color Splash' },
  { path: '/games/color-mixing', element: <ColorMixing />, protected: true, cameraSafe: true, gameName: 'Color Mixing' },
  { path: '/games/rainbow-bridge', element: <RainbowBridge />, protected: true, cameraSafe: true, gameName: 'Rainbow Bridge' },
  { path: '/games/beat-bounce', element: <BeatBounce />, protected: true, cameraSafe: true, gameName: 'Beat Bounce' },
  { path: '/games/bubble-count', element: <BubbleCount />, protected: true, cameraSafe: true, gameName: 'Bubble Count' },
  { path: '/games/feed-the-monster', element: <FeedTheMonster />, protected: true, cameraSafe: true, gameName: 'Feed The Monster' },
  { path: '/games/shape-stacker', element: <ShapeStacker />, protected: true, cameraSafe: true, gameName: 'Shape Stacker' },
  { path: '/games/size-sorting', element: <SizeSorting />, protected: true, cameraSafe: true, gameName: 'Size Sorting' },
  { path: '/games/digital-jenga', element: <DigitalJenga />, protected: true, cameraSafe: true, gameName: 'Digital Jenga' },
  { path: '/games/weather-match', element: <WeatherMatch />, protected: true, cameraSafe: true, gameName: 'Weather Match' },
  { path: '/games/fraction-pizza', element: <FractionPizza />, protected: true, cameraSafe: true, gameName: 'Fraction Pizza' },
  { path: '/games/time-tell', element: <TimeTell />, protected: true, cameraSafe: true, gameName: 'Time Tell' },
  { path: '/games/money-match', element: <MoneyMatch />, protected: true, cameraSafe: true, gameName: 'Money Match' },
  { path: '/games/pattern-play', element: <PatternPlay />, protected: true, cameraSafe: true, gameName: 'Pattern Play' },
  { path: '/games/word-search', element: <WordSearch />, protected: true, cameraSafe: true, gameName: 'Word Search' },
  { path: '/games/letter-sound-match', element: <LetterSoundMatch />, protected: true, cameraSafe: true, gameName: 'Letter Sound Match' },
  { path: '/games/story-builder', element: <StoryBuilder />, protected: true, cameraSafe: true, gameName: 'Story Builder' },
  { path: '/games/bubble-pop-symphony', element: <BubblePopSymphony />, protected: true, cameraSafe: true, gameName: 'Bubble Pop Symphony' },
  { path: '/games/dress-for-weather', element: <DressForWeather />, protected: true, cameraSafe: true, gameName: 'Dress For Weather' },
  { path: '/games/story-sequence', element: <StorySequence />, protected: true, cameraSafe: true, gameName: 'Story Sequence' },
  { path: '/games/shape-safari', element: <ShapeSafari />, protected: true, cameraSafe: true, gameName: 'Shape Safari' },
  { path: '/games/free-draw', element: <FreeDraw />, protected: true, cameraSafe: true, gameName: 'Free Draw' },
  { path: '/games/math-monsters', element: <MathMonsters />, protected: true, cameraSafe: true, gameName: 'Math Monsters' },
  { path: '/games/platformer-runner', element: <PlatformerRunner />, protected: true, cameraSafe: true, gameName: 'Platform Runner' },
  { path: '/games/counting-collectathon', element: <CountingCollectathon />, protected: true, cameraSafe: true, gameName: 'Counting Collect-a-thon' },
  { path: '/games/math-jumpers', element: <MathJumpers />, protected: true, cameraSafe: true, gameName: 'Math Jumpers' },
  { path: '/games/simple-addition', element: <SimpleAddition />, protected: true, cameraSafe: true, gameName: 'Simple Addition' },
  { path: '/games/maze-runner', element: <MazeRunner />, protected: true, cameraSafe: true, gameName: 'Maze Runner' },
  { path: '/games/bubble-pop', element: <BubblePop />, protected: true, cameraSafe: true, gameName: 'Bubble Pop' },
  { path: '/games/rhyme-time', element: <RhymeTime />, protected: true, cameraSafe: true, gameName: 'Rhyme Time' },
  { path: '/games/physics-playground', element: <PhysicsPlayground />, protected: true, cameraSafe: true, gameName: 'Physics Playground' },
  { path: '/games/physics-demo', element: <PhysicsPlayground />, protected: true, cameraSafe: true, gameName: 'Physics Demo' },
  { path: '/games/circuit-builder', element: <CircuitBuilder />, protected: true, cameraSafe: true, gameName: 'Circuit Builder' },
  { path: '/games/cutting-practice', element: <CuttingPractice />, protected: true, cameraSafe: true, gameName: 'Cutting Practice' },
  { path: '/games/pinch-practice', element: <PinchPractice />, protected: true, cameraSafe: true, gameName: 'Pinch Practice' },
  { path: '/games/circle-drawing', element: <CircleDrawing />, protected: true, cameraSafe: true, gameName: 'Circle Drawing' },
  { path: '/games/spelling-run', element: <SpellingRun />, protected: true, cameraSafe: true, gameName: 'Spelling Run' },
  { path: '/games/vowel-valley', element: <VowelValley />, protected: true, cameraSafe: true, gameName: 'Vowel Valley' },
  { path: '/games/wash-hands-dance', element: <WashHandsDance />, protected: true, cameraSafe: true, gameName: 'Wash Hands Dance' },
  { path: '/games/pack-lunchbox', element: <PackLunchbox />, protected: true, cameraSafe: true, gameName: 'Pack Lunchbox' },
  { path: '/games/set-the-table', element: <SetTheTable />, protected: true, cameraSafe: true, gameName: 'Set The Table' },
  { path: '/games/temperature-sort', element: <TemperatureSort />, protected: true, cameraSafe: true, gameName: 'Temperature Sort' },
  { path: '/games/plant-garden', element: <PlantGarden />, protected: true, cameraSafe: true, gameName: 'Plant Garden' },
  { path: '/games/sound-garden', element: <SoundGarden />, protected: true, cameraSafe: true, gameName: 'Sound Garden' },
  { path: '/games/taste-match', element: <TasteMatch />, protected: true, cameraSafe: true, gameName: 'Taste Match' },
  { path: '/games/farm-friends', element: <FarmFriends />, protected: true, cameraSafe: true, gameName: 'Farm Friends' },
  { path: '/games/texture-explorer', element: <TextureExplorer />, protected: true, cameraSafe: true, gameName: 'Texture Explorer' },
  { path: '/games/dinosaur-dig', element: <DinosaurDig />, protected: true, cameraSafe: true, gameName: 'Dinosaur Dig' },
  { path: '/games/light-painter', element: <LightPainter />, protected: true, cameraSafe: true, gameName: 'Light Painter' },
  { path: '/games/tidy-up-time', element: <TidyUpTime />, protected: true, cameraSafe: true, gameName: 'Tidy Up Time' },
  { path: '/games/digital-jenga-3d', element: <DigitalJenga3D />, protected: true, cameraSafe: true, gameName: 'Digital Jenga 3D' },
  { path: '/games/dress-for-weather-3d', element: <DressForWeather3D />, protected: true, cameraSafe: true, gameName: 'Dress For Weather 3D' },
  { path: '/games/obstacle-course-3d', element: <ObstacleCourse3D />, protected: true, cameraSafe: true, gameName: 'Obstacle Course 3D' },
  { path: '/games/feed-the-monster-3d', element: <FeedTheMonster3D />, protected: true, cameraSafe: true, gameName: 'Feed The Monster 3D' },
  { path: '/games/virtual-bubbles-3d', element: <VirtualBubbles3D />, protected: true, cameraSafe: true, gameName: 'Virtual Bubbles 3D' },
  { path: '/progress', element: <Progress />, protected: true, layout: true },
  { path: '/settings', element: <Settings />, protected: true, layout: true },
  { path: '/style-test', element: <StyleTest />, layout: true, devOnly: true },
  { path: '/test/mediapipe', element: <MediaPipeTest />, layout: true, devOnly: true },
  { path: '/inventory', element: <InventoryPage />, protected: true, layout: true },
  { path: '/discovery-lab', element: <DiscoveryLab />, protected: true, layout: true },
  { path: '/games/spell-painter', element: <SpellPainter />, protected: true, cameraSafe: true, gameName: 'Spell Painter' },
  { path: '/games/music-conductor', element: <MusicConductor />, protected: true, cameraSafe: true, gameName: 'Music Conductor' },
  { path: '/games/bubble-biology', element: <BubbleBiology />, protected: true, cameraSafe: true, gameName: 'Bubble Biology' },
  { path: '/games/mirror-maze', element: <MirrorMaze />, protected: true, cameraSafe: true, gameName: 'Mirror Maze' },
  { path: '/games/finger-painting-madness', element: <FingerPaintingMadness />, protected: true, cameraSafe: true, gameName: 'Finger Painting Madness' },
];

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
                          route.redirectTo
                            ? <Navigate to={route.redirectTo} replace />
                            : wrapRoute(route)
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
  );
}

export default App;
