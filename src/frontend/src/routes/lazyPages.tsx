import { lazy, type ComponentType } from 'react';
declare const __BETA_3D_GAMES_ENABLED__: boolean;

const loadThreeDPage = (
  enabledLoader: () => Promise<{ default: ComponentType<any> }>,
) =>
  __BETA_3D_GAMES_ENABLED__
    ? enabledLoader()
    : import('../pages/BetaThreeDHoldback').then((module) => ({
        default: module.default,
      }));

// Lazy load pages for code splitting

function lazyNamed<T extends Record<string, any>>(
  importer: () => Promise<T>,
  name: keyof T
) {
  return lazy(() =>
    importer().then((module) => ({ default: module[name] as React.ComponentType<any> }))
  );
}

export const Home = lazy(() =>
  import('../pages/Home').then((module) => ({ default: module.Home })),
);
export const Login = lazy(() =>
  import('../pages/Login').then((module) => ({ default: module.Login })),
);
export const Register = lazy(() =>
  import('../pages/Register').then((module) => ({ default: module.Register })),
);
export const ForgotPassword = lazyNamed(() => import('../pages/ForgotPassword'), 'ForgotPassword');
export const ResetPassword = lazyNamed(() => import('../pages/ResetPassword'), 'ResetPassword');
export const VerifyEmail = lazyNamed(() => import('../pages/VerifyEmail'), 'VerifyEmail');
export const Pricing = lazy(() =>
  import('../pages/Pricing').then((module) => ({ default: module.Pricing })),
);
export const PrivacyPolicy = lazyNamed(() => import('../pages/PrivacyPolicy'), 'PrivacyPolicy');
export const TermsOfPlay = lazyNamed(() => import('../pages/TermsOfPlay'), 'TermsOfPlay');
export const Support = lazy(() =>
  import('../pages/Support').then((module) => ({ default: module.Support })),
);
export const GameSelection = lazyNamed(() => import('../pages/GameSelection'), 'GameSelection');
export const Dashboard = lazy(() =>
  import('../pages/Dashboard').then((module) => ({ default: module.Dashboard })),
);
export const AlphabetGame = lazyNamed(() => import('../pages/AlphabetGame'), 'default');
export const Games = lazy(() =>
  import('../pages/Games').then((module) => ({ default: module.Games })),
);
export const ConnectTheDots = lazyNamed(() => import('../pages/ConnectTheDots'), 'ConnectTheDots');
export const LetterHunt = lazyNamed(() => import('../pages/LetterHunt'), 'LetterHunt');
export const MusicPinchBeat = lazyNamed(() => import('../pages/MusicPinchBeat'), 'MusicPinchBeat');
export const SteadyHandLab = lazyNamed(() => import('../pages/SteadyHandLab'), 'SteadyHandLab');
export const ShapePop = lazy(() =>
  import('../pages/ShapePop').then((module) => ({ default: module.ShapePop })),
);
export const ColorMatchGarden = lazyNamed(() => import('../pages/ColorMatchGarden'), 'ColorMatchGarden');
export const ColorByNumber = lazyNamed(() => import('../pages/ColorByNumber'), 'ColorByNumber');
export const ColorPotions = lazyNamed(() => import('../pages/ColorPotions'), 'ColorPotions');
export const MemoryMatch = lazyNamed(() => import('../pages/MemoryMatch'), 'MemoryMatch');
export const NumberTracing = lazyNamed(() => import('../pages/NumberTracing'), 'NumberTracing');
export const NumberTapTrail = lazyNamed(() => import('../pages/NumberTapTrail'), 'NumberTapTrail');
export const NumberSequence = lazyNamed(() => import('../pages/NumberSequence'), 'NumberSequence');
export const ShapeSequence = lazyNamed(() => import('../pages/ShapeSequence'), 'ShapeSequence');
export const YogaAnimals = lazyNamed(() => import('../pages/YogaAnimals'), 'YogaAnimals');
export const BalloonPopFitness = lazyNamed(() => import('../pages/BalloonPopFitness'), 'BalloonPopFitness');
export const ObstacleCourse = lazyNamed(() => import('../pages/ObstacleCourse'), 'ObstacleCourse');
export const FollowTheLeader = lazyNamed(() => import('../pages/FollowTheLeader'), 'FollowTheLeader');
export const MusicalStatues = lazyNamed(() => import('../pages/MusicalStatues'), 'MusicalStatues');
export const BalanceBeam = lazy(() =>
  import('../pages/BalanceBeam').then((module) => ({ default: module.default })),
);
export const FreezeDance = lazyNamed(() => import('../pages/FreezeDance'), 'FreezeDance');
export const SimonSays = lazyNamed(() => import('../pages/SimonSays'), 'SimonSays');
export const Progress = lazy(() =>
  import('../pages/Progress').then((module) => ({ default: module.Progress })),
);
export const Settings = lazy(() =>
  import('../pages/Settings').then((module) => ({ default: module.Settings })),
);
export const StyleTest = lazyNamed(() => import('../components/StyleTest'), 'StyleTest');
export const FingerNumberShow = lazyNamed(() => import('../games/FingerNumberShow'), 'FingerNumberShow');
export const VirtualChemistryLab = lazyNamed(() => import('../pages/VirtualChemistryLab'), 'VirtualChemistryLab');
export const WordBuilder = lazyNamed(() => import('../pages/WordBuilder'), 'WordBuilder');
export const EmojiMatch = lazyNamed(() => import('../pages/EmojiMatch'), 'EmojiMatch');
export const MediaPipeTest = lazyNamed(() => import('../pages/MediaPipeTest'), 'MediaPipeTest');
export const AirCanvas = lazyNamed(() => import('../pages/AirCanvas'), 'AirCanvas');
export const MirrorDraw = lazyNamed(() => import('../pages/MirrorDraw'), 'MirrorDraw');
export const PhonicsSounds = lazyNamed(() => import('../pages/PhonicsSounds'), 'PhonicsSounds');
export const PhonicsTracing = lazyNamed(() => import('../pages/PhonicsTracing'), 'PhonicsTracing');
export const BeginningSounds = lazyNamed(() => import('../pages/BeginningSounds'), 'BeginningSounds');
export const EndingSounds = lazyNamed(() => import('../pages/EndingSounds'), 'EndingSounds');
export const OddOneOut = lazyNamed(() => import('../pages/OddOneOut'), 'OddOneOut');
export const SameAndDifferent = lazyNamed(() => import('../pages/SameAndDifferent'), 'SameAndDifferent');
export const ShadowMatch = lazyNamed(() => import('../pages/ShadowMatch'), 'ShadowMatch');
export const ShadowPuppetTheater = lazyNamed(() => import('../pages/ShadowPuppetTheater'), 'ShadowPuppetTheater');
export const VirtualBubbles = lazyNamed(() => import('../pages/VirtualBubbles'), 'VirtualBubbles');
export const KaleidoscopeHands = lazyNamed(() => import('../pages/KaleidoscopeHands'), 'KaleidoscopeHands');
export const ShadowPortal = lazyNamed(() => import('../pages/ShadowPortal'), 'default');
export const AirGuitarHero = lazyNamed(() => import('../pages/AirGuitarHero'), 'AirGuitarHero');
export const FruitNinjaAir = lazyNamed(() => import('../pages/FruitNinjaAir'), 'FruitNinjaAir');
export const CountingObjects = lazyNamed(() => import('../pages/CountingObjects'), 'CountingObjects');
export const MoreOrLess = lazyNamed(() => import('../pages/MoreOrLess'), 'MoreOrLess');
export const BlendBuilder = lazyNamed(() => import('../pages/BlendBuilder'), 'BlendBuilder');
export const SyllableClap = lazyNamed(() => import('../pages/SyllableClap'), 'SyllableClap');
export const SightWordFlash = lazyNamed(() => import('../pages/SightWordFlash'), 'SightWordFlash');
export const MazeRunner = lazyNamed(() => import('../pages/MazeRunner'), 'MazeRunner');
export const PathFollowing = lazyNamed(() => import('../pages/PathFollowing'), 'PathFollowing');
export const RhythmTap = lazyNamed(() => import('../pages/RhythmTap'), 'RhythmTap');
export const AnimalSounds = lazyNamed(() => import('../pages/AnimalSounds'), 'AnimalSounds');
export const BodyParts = lazyNamed(() => import('../pages/BodyParts'), 'BodyParts');
export const VoiceStories = lazyNamed(() => import('../pages/VoiceStories'), 'VoiceStories');
export const ReadingAlong = lazyNamed(() => import('../pages/ReadingAlong'), 'ReadingAlong');
export const WordSearch = lazyNamed(() => import('../pages/WordSearch'), 'WordSearch');
export const LetterSoundMatch = lazyNamed(() => import('../pages/LetterSoundMatch'), 'LetterSoundMatch');
export const StoryBuilder = lazyNamed(() => import('../pages/StoryBuilder'), 'StoryBuilder');
export const MathSmash = lazyNamed(() => import('../pages/MathSmash'), 'MathSmash');
export const ColorSortGame = lazyNamed(() => import('../pages/ColorSortGame'), 'ColorSortGame');
export const LetterCatcher = lazyNamed(() => import('../pages/LetterCatcher'), 'LetterCatcher');
export const LanguagePuppet = lazyNamed(() => import('../pages/LanguagePuppet'), 'LanguagePuppet');
export const SpellPainter = lazyNamed(() => import('../pages/SpellPainter'), 'SpellPainter');
export const MusicConductor = lazyNamed(() => import('../pages/MusicConductor'), 'MusicConductor');
export const BubbleBiology = lazyNamed(() => import('../pages/BubbleBiology'), 'BubbleBiology');
export const MirrorMaze = lazyNamed(() => import('../pages/MirrorMaze'), 'MirrorMaze');
export const CircuitBuilder = lazyNamed(() => import('../pages/CircuitBuilder'), 'default');
export const NasaSkyHunt = lazyNamed(() => import('../pages/NasaSkyHunt'), 'default');
export const PlanetSandbox = lazyNamed(() => import('../pages/PlanetSandbox'), 'default');
export const ISSDocking = lazyNamed(() => import('../pages/ISSDocking'), 'default');
export const BridgeBuilder = lazyNamed(() => import('../pages/BridgeBuilder'), 'default');
export const LogicBoxPush = lazyNamed(() => import('../pages/LogicBoxPush'), 'default');
export const CatchSort = lazyNamed(() => import('../pages/CatchSort'), 'default');
export const WeatherLab = lazyNamed(() => import('../pages/WeatherLab'), 'default');
export const MirrorDuel = lazyNamed(() => import('../pages/MirrorDuel'), 'default');
export const PopTheNumber = lazyNamed(() => import('../pages/PopTheNumber'), 'PopTheNumber');
export const ColorSplash = lazyNamed(() => import('../pages/ColorSplash'), 'ColorSplash');
export const ColorMixing = lazyNamed(() => import('../pages/ColorMixing'), 'ColorMixing');
export const RainbowBridge = lazyNamed(() => import('../pages/RainbowBridge'), 'RainbowBridge');
export const BeatBounce = lazyNamed(() => import('../pages/BeatBounce'), 'BeatBounce');
export const BubbleCount = lazyNamed(() => import('../pages/BubbleCount'), 'BubbleCount');
export const FeedTheMonster = lazyNamed(() => import('../pages/FeedTheMonster'), 'FeedTheMonster');
export const ShapeStacker = lazyNamed(() => import('../pages/ShapeStacker'), 'ShapeStacker');
export const SizeSorting = lazyNamed(() => import('../pages/SizeSorting'), 'SizeSorting');
export const NumberBubblePop = lazyNamed(() => import('../pages/NumberBubblePop'), 'NumberBubblePop');

export const WeatherMatch = lazyNamed(() => import('../pages/WeatherMatch'), 'WeatherMatch');
export const FractionPizza = lazyNamed(() => import('../pages/FractionPizza'), 'FractionPizza');
export const TimeTell = lazyNamed(() => import('../pages/TimeTell'), 'TimeTell');
export const MoneyMatch = lazyNamed(() => import('../pages/MoneyMatch'), 'MoneyMatch');
export const PatternPlay = lazyNamed(() => import('../pages/PatternPlay'), 'PatternPlay');
export const BubblePopSymphony = lazyNamed(() => import('../pages/BubblePopSymphony'), 'default');
export const DressForWeather = lazyNamed(() => import('../pages/DressForWeather'), 'default');
export const StorySequence = lazyNamed(() => import('../pages/StorySequence'), 'default');
export const ShapeSafari = lazyNamed(() => import('../pages/ShapeSafari'), 'default');
export const FreeDraw = lazyNamed(() => import('../pages/FreeDraw'), 'FreeDraw');
export const MathMonsters = lazyNamed(() => import('../pages/MathMonsters'), 'default');
export const BubblePop = lazyNamed(() => import('../pages/BubblePop'), 'BubblePop');
export const RhymeTime = lazyNamed(() => import('../pages/RhymeTime'), 'default');
export const PhysicsPlayground = lazyNamed(() => import('../pages/PhysicsPlayground'), 'default');
export const InventoryPage = lazyNamed(() => import('../pages/Inventory'), 'Inventory');
export const DiscoveryLab = lazyNamed(() => import('../pages/DiscoveryLab'), 'DiscoveryLab');
export const PlatformerRunner = lazyNamed(() => import('../pages/PlatformerRunner'), 'PlatformerRunner');
export const CountingCollectathon = lazyNamed(() => import('../pages/CountingCollectathon'), 'CountingCollectathon');
export const MathJumpers = lazyNamed(() => import('../pages/MathJumpers'), 'MathJumpers');
export const SimpleAddition = lazyNamed(() => import('../pages/SimpleAddition'), 'SimpleAddition');
export const TargetPractice = lazyNamed(() => import('../pages/TargetPractice'), 'default');
export const CuttingPractice = lazyNamed(() => import('../pages/CuttingPractice'), 'default');
export const PinchPractice = lazyNamed(() => import('../pages/PinchPractice'), 'PinchPractice');
export const CircleDrawing = lazyNamed(() => import('../pages/CircleDrawing'), 'default');
export const SpellingRun = lazyNamed(() => import('../pages/SpellingRun'), 'default');
export const WashHandsDance = lazyNamed(() => import('../pages/WashHandsDance'), 'default');
export const PackLunchbox = lazyNamed(() => import('../pages/PackLunchbox'), 'default');
export const SetTheTable = lazyNamed(() => import('../pages/SetTheTable'), 'default');
export const TemperatureSort = lazyNamed(() => import('../pages/TemperatureSort'), 'default');
export const PlantGarden = lazyNamed(() => import('../pages/PlantGarden'), 'default');
export const SoundGarden = lazyNamed(() => import('../pages/SoundGarden'), 'default');
export const TasteMatch = lazyNamed(() => import('../pages/TasteMatch'), 'default');
export const FarmFriends = lazy(() =>
  import('../pages/FarmFriends').then((module) => ({ default: module.default })),
);
export const VowelValley = lazy(() =>
  import('../pages/VowelValley').then((module) => ({ default: module.default })),
);
export const TextureExplorer = lazyNamed(() => import('../pages/TextureExplorer'), 'default');
export const DinosaurDig = lazyNamed(() => import('../pages/DinosaurDig'), 'default');
export const LightPainter = lazyNamed(() => import('../pages/LightPainter'), 'default');
export const EarthTimeMachine = lazyNamed(() => import('../pages/EarthTimeMachine'), 'EarthTimeMachine');
export const TidyUpTime = lazyNamed(() => import('../pages/TidyUpTime'), 'default');
export const VirtualArchery = lazyNamed(() => import('../pages/VirtualArchery'), 'default');
export const FingerPaintingMadness = lazyNamed(() => import('../pages/FingerPaintingMadness'), 'default');

// 3D Games (Three.js)
export const DigitalJenga3D = lazy(() =>
  loadThreeDPage(() => import('../pages/three/DigitalJenga3D').then((module) => ({
    default: module.default,
  }))),
);
export const DigitalJenga = DigitalJenga3D;
export const DressForWeather3D = lazy(() =>
  loadThreeDPage(() => import('../pages/three/DressForWeather3D').then((module) => ({
    default: module.default,
  }))),
);
export const ObstacleCourse3D = lazy(() =>
  loadThreeDPage(() => import('../pages/three/ObstacleCourse3D').then((module) => ({
    default: module.default,
  }))),
);
export const FeedTheMonster3D = lazy(() =>
  loadThreeDPage(() => import('../pages/three/FeedTheMonster3D').then((module) => ({
    default: module.default,
  }))),
);
export const VirtualBubbles3D = lazy(() =>
  loadThreeDPage(() => import('../pages/three/VirtualBubbles3D').then((module) => ({
    default: module.default,
  }))),
);

// Additional 3D Games
export const CuttingPractice3D = lazy(() =>
  loadThreeDPage(() => import("../pages/three/CuttingPractice3D").then((module) => ({
    default: module.default,
  }))),
);
export const ShapePop3D = lazy(() =>
  loadThreeDPage(() => import("../pages/three/ShapePop3D").then((module) => ({
    default: module.default,
  }))),
);
export const CountingCollectathon3D = lazy(() =>
  loadThreeDPage(() => import("../pages/three/CountingCollectathon3D").then((module) => ({
    default: module.default,
  }))),
);
export const ISSDocking3D = lazy(() =>
  loadThreeDPage(() => import("../pages/three/ISSDocking3D").then((module) => ({
    default: module.default,
  }))),
);
