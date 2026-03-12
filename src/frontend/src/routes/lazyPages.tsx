import { lazy } from 'react';

// Lazy load pages for code splitting
export const Home = lazy(() =>
  import('../pages/Home').then((module) => ({ default: module.Home })),
);
export const Login = lazy(() =>
  import('../pages/Login').then((module) => ({ default: module.Login })),
);
export const Register = lazy(() =>
  import('../pages/Register').then((module) => ({ default: module.Register })),
);
export const ForgotPassword = lazy(() =>
  import('../pages/ForgotPassword').then((module) => ({
    default: module.ForgotPassword,
  })),
);
export const ResetPassword = lazy(() =>
  import('../pages/ResetPassword').then((module) => ({
    default: module.ResetPassword,
  })),
);
export const VerifyEmail = lazy(() =>
  import('../pages/VerifyEmail').then((module) => ({
    default: module.VerifyEmail,
  })),
);
export const Pricing = lazy(() =>
  import('../pages/Pricing').then((module) => ({ default: module.Pricing })),
);
export const GameSelection = lazy(() =>
  import('../pages/GameSelection').then((module) => ({
    default: module.GameSelection,
  })),
);
export const Dashboard = lazy(() =>
  import('../pages/Dashboard').then((module) => ({ default: module.Dashboard })),
);
export const AlphabetGame = lazy(() =>
  import('../pages/AlphabetGame').then((module) => ({
    default: module.default,
  })),
);
export const Games = lazy(() =>
  import('../pages/Games').then((module) => ({ default: module.Games })),
);
export const ConnectTheDots = lazy(() =>
  import('../pages/ConnectTheDots').then((module) => ({
    default: module.ConnectTheDots,
  })),
);
export const LetterHunt = lazy(() =>
  import('../pages/LetterHunt').then((module) => ({
    default: module.LetterHunt,
  })),
);
export const MusicPinchBeat = lazy(() =>
  import('../pages/MusicPinchBeat').then((module) => ({
    default: module.MusicPinchBeat,
  })),
);
export const SteadyHandLab = lazy(() =>
  import('../pages/SteadyHandLab').then((module) => ({
    default: module.SteadyHandLab,
  })),
);
export const ShapePop = lazy(() =>
  import('../pages/ShapePop').then((module) => ({ default: module.ShapePop })),
);
export const ColorMatchGarden = lazy(() =>
  import('../pages/ColorMatchGarden').then((module) => ({
    default: module.ColorMatchGarden,
  })),
);
export const ColorByNumber = lazy(() =>
  import('../pages/ColorByNumber').then((module) => ({
    default: module.ColorByNumber,
  })),
);
export const ColorPotions = lazy(() =>
  import('../pages/ColorPotions').then((module) => ({
    default: module.ColorPotions,
  })),
);
export const MemoryMatch = lazy(() =>
  import('../pages/MemoryMatch').then((module) => ({
    default: module.MemoryMatch,
  })),
);
export const NumberTracing = lazy(() =>
  import('../pages/NumberTracing').then((module) => ({
    default: module.NumberTracing,
  })),
);
export const NumberTapTrail = lazy(() =>
  import('../pages/NumberTapTrail').then((module) => ({
    default: module.NumberTapTrail,
  })),
);
export const NumberSequence = lazy(() =>
  import('../pages/NumberSequence').then((module) => ({
    default: module.NumberSequence,
  })),
);
export const ShapeSequence = lazy(() =>
  import('../pages/ShapeSequence').then((module) => ({
    default: module.ShapeSequence,
  })),
);
export const YogaAnimals = lazy(() =>
  import('../pages/YogaAnimals').then((module) => ({
    default: module.YogaAnimals,
  })),
);
export const BalloonPopFitness = lazy(() =>
  import('../pages/BalloonPopFitness').then((module) => ({
    default: module.BalloonPopFitness,
  })),
);
export const ObstacleCourse = lazy(() =>
  import('../pages/ObstacleCourse').then((module) => ({
    default: module.ObstacleCourse,
  })),
);
export const FollowTheLeader = lazy(() =>
  import('../pages/FollowTheLeader').then((module) => ({
    default: module.FollowTheLeader,
  })),
);
export const MusicalStatues = lazy(() =>
  import('../pages/MusicalStatues').then((module) => ({
    default: module.MusicalStatues,
  })),
);
export const BalanceBeam = lazy(() =>
  import('../pages/BalanceBeam').then((module) => ({ default: module.default })),
);
export const FreezeDance = lazy(() =>
  import('../pages/FreezeDance').then((module) => ({
    default: module.FreezeDance,
  })),
);
export const SimonSays = lazy(() =>
  import('../pages/SimonSays').then((module) => ({
    default: module.SimonSays,
  })),
);
export const Progress = lazy(() =>
  import('../pages/Progress').then((module) => ({ default: module.Progress })),
);
export const Settings = lazy(() =>
  import('../pages/Settings').then((module) => ({ default: module.Settings })),
);
export const StyleTest = lazy(() =>
  import('../components/StyleTest').then((module) => ({
    default: module.StyleTest,
  })),
);
export const FingerNumberShow = lazy(() =>
  import('../games/FingerNumberShow').then((module) => ({
    default: module.FingerNumberShow,
  })),
);
export const VirtualChemistryLab = lazy(() =>
  import('../pages/VirtualChemistryLab').then((module) => ({
    default: module.VirtualChemistryLab,
  })),
);
export const WordBuilder = lazy(() =>
  import('../pages/WordBuilder').then((module) => ({
    default: module.WordBuilder,
  })),
);
export const EmojiMatch = lazy(() =>
  import('../pages/EmojiMatch').then((module) => ({
    default: module.EmojiMatch,
  })),
);
export const MediaPipeTest = lazy(() =>
  import('../pages/MediaPipeTest').then((module) => ({
    default: module.MediaPipeTest,
  })),
);
export const AirCanvas = lazy(() =>
  import('../pages/AirCanvas').then((module) => ({
    default: module.AirCanvas,
  })),
);
export const MirrorDraw = lazy(() =>
  import('../pages/MirrorDraw').then((module) => ({
    default: module.MirrorDraw,
  })),
);
export const PhonicsSounds = lazy(() =>
  import('../pages/PhonicsSounds').then((module) => ({
    default: module.PhonicsSounds,
  })),
);
export const PhonicsTracing = lazy(() =>
  import('../pages/PhonicsTracing').then((module) => ({
    default: module.PhonicsTracing,
  })),
);
export const BeginningSounds = lazy(() =>
  import('../pages/BeginningSounds').then((module) => ({
    default: module.BeginningSounds,
  })),
);
export const EndingSounds = lazy(() =>
  import('../pages/EndingSounds').then((module) => ({
    default: module.EndingSounds,
  })),
);
export const OddOneOut = lazy(() =>
  import('../pages/OddOneOut').then((module) => ({
    default: module.OddOneOut,
  })),
);
export const SameAndDifferent = lazy(() =>
  import('../pages/SameAndDifferent').then((module) => ({
    default: module.SameAndDifferent,
  })),
);
export const ShadowMatch = lazy(() =>
  import('../pages/ShadowMatch').then((module) => ({
    default: module.ShadowMatch,
  })),
);
export const ShadowPuppetTheater = lazy(() =>
  import('../pages/ShadowPuppetTheater').then((module) => ({
    default: module.ShadowPuppetTheater,
  })),
);
export const VirtualBubbles = lazy(() =>
  import('../pages/VirtualBubbles').then((module) => ({
    default: module.VirtualBubbles,
  })),
);
export const KaleidoscopeHands = lazy(() =>
  import('../pages/KaleidoscopeHands').then((module) => ({
    default: module.KaleidoscopeHands,
  })),
);
export const ShadowPortal = lazy(() =>
  import('../pages/ShadowPortal').then((module) => ({
    default: module.default,
  })),
);
export const AirGuitarHero = lazy(() =>
  import('../pages/AirGuitarHero').then((module) => ({
    default: module.AirGuitarHero,
  })),
);
export const FruitNinjaAir = lazy(() =>
  import('../pages/FruitNinjaAir').then((module) => ({
    default: module.FruitNinjaAir,
  })),
);
export const CountingObjects = lazy(() =>
  import('../pages/CountingObjects').then((module) => ({
    default: module.CountingObjects,
  })),
);
export const MoreOrLess = lazy(() =>
  import('../pages/MoreOrLess').then((module) => ({
    default: module.MoreOrLess,
  })),
);
export const BlendBuilder = lazy(() =>
  import('../pages/BlendBuilder').then((module) => ({
    default: module.BlendBuilder,
  })),
);
export const SyllableClap = lazy(() =>
  import('../pages/SyllableClap').then((module) => ({
    default: module.SyllableClap,
  })),
);
export const SightWordFlash = lazy(() =>
  import('../pages/SightWordFlash').then((module) => ({
    default: module.SightWordFlash,
  })),
);
export const MazeRunner = lazy(() =>
  import('../pages/MazeRunner').then((module) => ({
    default: module.MazeRunner,
  })),
);
export const PathFollowing = lazy(() =>
  import('../pages/PathFollowing').then((module) => ({
    default: module.PathFollowing,
  })),
);
export const RhythmTap = lazy(() =>
  import('../pages/RhythmTap').then((module) => ({
    default: module.RhythmTap,
  })),
);
export const AnimalSounds = lazy(() =>
  import('../pages/AnimalSounds').then((module) => ({
    default: module.AnimalSounds,
  })),
);
export const BodyParts = lazy(() =>
  import('../pages/BodyParts').then((module) => ({
    default: module.BodyParts,
  })),
);
export const VoiceStories = lazy(() =>
  import('../pages/VoiceStories').then((module) => ({
    default: module.VoiceStories,
  })),
);
export const ReadingAlong = lazy(() =>
  import('../pages/ReadingAlong').then((module) => ({
    default: module.ReadingAlong,
  })),
);
export const WordSearch = lazy(() =>
  import('../pages/WordSearch').then((module) => ({
    default: module.WordSearch,
  })),
);
export const LetterSoundMatch = lazy(() =>
  import('../pages/LetterSoundMatch').then((module) => ({
    default: module.LetterSoundMatch,
  })),
);
export const StoryBuilder = lazy(() =>
  import('../pages/StoryBuilder').then((module) => ({
    default: module.StoryBuilder,
  })),
);
export const MathSmash = lazy(() =>
  import('../pages/MathSmash').then((module) => ({
    default: module.MathSmash,
  })),
);
export const ColorSortGame = lazy(() =>
  import('../pages/ColorSortGame').then((module) => ({
    default: module.ColorSortGame,
  })),
);
export const LetterCatcher = lazy(() =>
  import('../pages/LetterCatcher').then((module) => ({
    default: module.LetterCatcher,
  })),
);
export const SpellPainter = lazy(() =>
  import('../pages/SpellPainter').then((module) => ({
    default: module.SpellPainter,
  })),
);
export const MusicConductor = lazy(() =>
  import('../pages/MusicConductor').then((module) => ({
    default: module.MusicConductor,
  })),
);
export const BubbleBiology = lazy(() =>
  import('../pages/BubbleBiology').then((module) => ({
    default: module.BubbleBiology,
  })),
);
export const MirrorMaze = lazy(() =>
  import('../pages/MirrorMaze').then((module) => ({
    default: module.MirrorMaze,
  })),
);
export const CircuitBuilder = lazy(() =>
  import('../pages/CircuitBuilder').then((module) => ({
    default: module.default,
  })),
);
export const WeatherLab = lazy(() =>
  import('../pages/WeatherLab').then((module) => ({
    default: module.default,
  })),
);
export const MirrorDuel = lazy(() =>
  import('../pages/MirrorDuel').then((module) => ({
    default: module.default,
  })),
);
export const PopTheNumber = lazy(() =>
  import('../pages/PopTheNumber').then((module) => ({
    default: module.PopTheNumber,
  })),
);
export const ColorSplash = lazy(() =>
  import('../pages/ColorSplash').then((module) => ({
    default: module.ColorSplash,
  })),
);
export const ColorMixing = lazy(() =>
  import('../pages/ColorMixing').then((module) => ({
    default: module.ColorMixing,
  })),
);
export const RainbowBridge = lazy(() =>
  import('../pages/RainbowBridge').then((module) => ({
    default: module.RainbowBridge,
  })),
);
export const BeatBounce = lazy(() =>
  import('../pages/BeatBounce').then((module) => ({
    default: module.BeatBounce,
  })),
);
export const BubbleCount = lazy(() =>
  import('../pages/BubbleCount').then((module) => ({
    default: module.BubbleCount,
  })),
);
export const FeedTheMonster = lazy(() =>
  import('../pages/FeedTheMonster').then((module) => ({
    default: module.FeedTheMonster,
  })),
);
export const ShapeStacker = lazy(() =>
  import('../pages/ShapeStacker').then((module) => ({
    default: module.ShapeStacker,
  })),
);
export const SizeSorting = lazy(() =>
  import('../pages/SizeSorting').then((module) => ({
    default: module.SizeSorting,
  })),
);
export const NumberBubblePop = lazy(() =>
  import('../pages/NumberBubblePop').then((module) => ({
    default: module.NumberBubblePop,
  })),
);
export const DigitalJenga = lazy(() =>
  import('../pages/DigitalJenga').then((module) => ({
    default: module.DigitalJenga,
  })),
);
export const WeatherMatch = lazy(() =>
  import('../pages/WeatherMatch').then((module) => ({
    default: module.WeatherMatch,
  })),
);
export const FractionPizza = lazy(() =>
  import('../pages/FractionPizza').then((module) => ({
    default: module.FractionPizza,
  })),
);
export const TimeTell = lazy(() =>
  import('../pages/TimeTell').then((module) => ({
    default: module.TimeTell,
  })),
);
export const MoneyMatch = lazy(() =>
  import('../pages/MoneyMatch').then((module) => ({
    default: module.MoneyMatch,
  })),
);
export const PatternPlay = lazy(() =>
  import('../pages/PatternPlay').then((module) => ({
    default: module.PatternPlay,
  })),
);
export const BubblePopSymphony = lazy(() =>
  import('../pages/BubblePopSymphony').then((module) => ({
    default: module.default,
  })),
);
export const DressForWeather = lazy(() =>
  import('../pages/DressForWeather').then((module) => ({
    default: module.default,
  })),
);
export const StorySequence = lazy(() =>
  import('../pages/StorySequence').then((module) => ({
    default: module.default,
  })),
);
export const ShapeSafari = lazy(() =>
  import('../pages/ShapeSafari').then((module) => ({
    default: module.default,
  })),
);
export const FreeDraw = lazy(() =>
  import('../pages/FreeDraw').then((module) => ({
    default: module.FreeDraw,
  })),
);
export const MathMonsters = lazy(() =>
  import('../pages/MathMonsters').then((module) => ({
    default: module.default,
  })),
);
export const BubblePop = lazy(() =>
  import('../pages/BubblePop').then((module) => ({
    default: module.BubblePop,
  })),
);
export const RhymeTime = lazy(() =>
  import('../pages/RhymeTime').then((module) => ({
    default: module.default,
  })),
);
export const PhysicsPlayground = lazy(() =>
  import('../pages/PhysicsPlayground').then((module) => ({
    default: module.default,
  })),
);
export const InventoryPage = lazy(() =>
  import('../pages/Inventory').then((module) => ({
    default: module.Inventory,
  })),
);
export const DiscoveryLab = lazy(() =>
  import('../pages/DiscoveryLab').then((module) => ({
    default: module.DiscoveryLab,
  })),
);
export const PlatformerRunner = lazy(() =>
  import('../pages/PlatformerRunner').then((module) => ({
    default: module.PlatformerRunner,
  })),
);
export const CountingCollectathon = lazy(() =>
  import('../pages/CountingCollectathon').then((module) => ({
    default: module.CountingCollectathon,
  })),
);
export const MathJumpers = lazy(() =>
  import('../pages/MathJumpers').then((module) => ({
    default: module.MathJumpers,
  })),
);
export const SimpleAddition = lazy(() =>
  import('../pages/SimpleAddition').then((module) => ({
    default: module.SimpleAddition,
  })),
);
export const TargetPractice = lazy(() =>
  import('../pages/TargetPractice').then((module) => ({
    default: module.default,
  })),
);
export const CuttingPractice = lazy(() =>
  import('../pages/CuttingPractice').then((module) => ({
    default: module.default,
  })),
);
export const PinchPractice = lazy(() =>
  import('../pages/PinchPractice').then((module) => ({
    default: module.PinchPractice,
  })),
);
export const CircleDrawing = lazy(() =>
  import('../pages/CircleDrawing').then((module) => ({
    default: module.default,
  })),
);
export const SpellingRun = lazy(() =>
  import('../pages/SpellingRun').then((module) => ({
    default: module.default,
  })),
);
export const WashHandsDance = lazy(() =>
  import('../pages/WashHandsDance').then((module) => ({
    default: module.default,
  })),
);
export const PackLunchbox = lazy(() =>
  import('../pages/PackLunchbox').then((module) => ({
    default: module.default,
  })),
);
export const SetTheTable = lazy(() =>
  import('../pages/SetTheTable').then((module) => ({
    default: module.default,
  })),
);
export const TemperatureSort = lazy(() =>
  import('../pages/TemperatureSort').then((module) => ({
    default: module.default,
  })),
);
export const PlantGarden = lazy(() =>
  import('../pages/PlantGarden').then((module) => ({
    default: module.default,
  })),
);
export const SoundGarden = lazy(() =>
  import('../pages/SoundGarden').then((module) => ({
    default: module.default,
  })),
);
export const TasteMatch = lazy(() =>
  import('../pages/TasteMatch').then((module) => ({
    default: module.default,
  })),
);
export const FarmFriends = lazy(() =>
  import('../pages/FarmFriends').then((module) => ({ default: module.default })),
);
export const VowelValley = lazy(() =>
  import('../pages/VowelValley').then((module) => ({ default: module.default })),
);
export const TextureExplorer = lazy(() =>
  import('../pages/TextureExplorer').then((module) => ({
    default: module.default,
  })),
);
export const DinosaurDig = lazy(() =>
  import('../pages/DinosaurDig').then((module) => ({
    default: module.default,
  })),
);
export const LightPainter = lazy(() =>
  import('../pages/LightPainter').then((module) => ({
    default: module.default,
  })),
);
export const TidyUpTime = lazy(() =>
  import('../pages/TidyUpTime').then((module) => ({
    default: module.default,
  })),
);
