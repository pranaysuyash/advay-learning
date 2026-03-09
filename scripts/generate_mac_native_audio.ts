/**
 * generate_mac_native_audio.ts
 *
 * Pre-generates high-quality TTS audio clips for ALL statically-known spoken
 * text across every game. 
 *
 * This version uses the built in macOS `say` command with the "Samantha" voice
 * to guarantee 100% offline generation without complex Node/Python API
 * dependencies or token expirations.
 *
 * It generates an AIFF file and then uses `ffmpeg` to compress it to WAV.
 *
 * Usage:
 *   npx tsx scripts/generate_mac_native_audio.ts
 */

import { writeFile, mkdir, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { createHash } from 'crypto';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = path.resolve(__dirname, '../src/frontend/public/audio/pregen/en');
const MANIFEST_PATH = path.join(OUTPUT_DIR, 'manifest.json');
const FORCE = process.argv.includes('--force');

// ---------------------------------------------------------------------------
// Normalizer + hasher
// ---------------------------------------------------------------------------

function normalizeText(text: string): string {
    return text.toLowerCase().replace(/\s+/g, ' ').trim();
}

function hashText(text: string): string {
    return createHash('sha256').update(text).digest('hex').slice(0, 8);
}

// ---------------------------------------------------------------------------
// CORPUS — embedded directly so no frontend imports are needed
// ---------------------------------------------------------------------------

const PHONEME_CORPUS = [
    { letter: 'B', ttsText: 'Buh! Like in Ball!', exampleWord: 'Ball' },
    { letter: 'C', ttsText: 'Kuh! Like in Cat!', exampleWord: 'Cat' },
    { letter: 'D', ttsText: 'Duh! Like in Dog!', exampleWord: 'Dog' },
    { letter: 'F', ttsText: 'Fuh! Like in Fish!', exampleWord: 'Fish' },
    { letter: 'G', ttsText: 'Guh! Like in Goat!', exampleWord: 'Goat' },
    { letter: 'H', ttsText: 'Huh! Like in Hat!', exampleWord: 'Hat' },
    { letter: 'J', ttsText: 'Juh! Like in Jam!', exampleWord: 'Jam' },
    { letter: 'K', ttsText: 'Kuh! Like in Kite!', exampleWord: 'Kite' },
    { letter: 'L', ttsText: 'Luh! Like in Lion!', exampleWord: 'Lion' },
    { letter: 'M', ttsText: 'Muh! Like in Moon!', exampleWord: 'Moon' },
    { letter: 'N', ttsText: 'Nuh! Like in Nest!', exampleWord: 'Nest' },
    { letter: 'P', ttsText: 'Puh! Like in Pig!', exampleWord: 'Pig' },
    { letter: 'R', ttsText: 'Ruh! Like in Rain!', exampleWord: 'Rain' },
    { letter: 'S', ttsText: 'Sss! Like in Sun!', exampleWord: 'Sun' },
    { letter: 'T', ttsText: 'Tuh! Like in Tree!', exampleWord: 'Tree' },
    { letter: 'A', ttsText: 'Ah! Like in Apple!', exampleWord: 'Apple' },
    { letter: 'E', ttsText: 'Eh! Like in Egg!', exampleWord: 'Egg' },
    { letter: 'I', ttsText: 'Ih! Like in Igloo!', exampleWord: 'Igloo' },
    { letter: 'O', ttsText: 'Oh! Like in Octopus!', exampleWord: 'Octopus' },
    { letter: 'U', ttsText: 'Uh! Like in Umbrella!', exampleWord: 'Umbrella' },
    { letter: 'BL', ttsText: 'Bluh! Like in Block!', exampleWord: 'Block' },
    { letter: 'BR', ttsText: 'Bruh! Like in Brush!', exampleWord: 'Brush' },
    { letter: 'CL', ttsText: 'Cluh! Like in Clock!', exampleWord: 'Clock' },
    { letter: 'CR', ttsText: 'Cruh! Like in Crab!', exampleWord: 'Crab' },
    { letter: 'DR', ttsText: 'Druh! Like in Drum!', exampleWord: 'Drum' },
    { letter: 'FL', ttsText: 'Fluh! Like in Flag!', exampleWord: 'Flag' },
    { letter: 'FR', ttsText: 'Fruh! Like in Frog!', exampleWord: 'Frog' },
    { letter: 'GR', ttsText: 'Gruh! Like in Grape!', exampleWord: 'Grape' },
];

const phonemePhrases = PHONEME_CORPUS.map((p) => p.ttsText);
const phonemeConfirmPhrases = PHONEME_CORPUS.map((p) => `Yes! ${p.letter} as in ${p.exampleWord}!`);

const PIP_RESPONSES_FLAT = [
    "Amazing! You're a superstar!", "Wow! Perfect! I'm so proud of you!", "You did it! Fantastic!",
    "Brilliant! You're getting so good!", "Yay! That was wonderful!", "Incredible! You're amazing!",
    "Perfect! Give yourself a hug!", "Woohoo! You nailed it!",
    "Great job! Keep going!", "Nice work! You're learning!", "Good try! Almost perfect!",
    "Well done! Practice makes perfect!", "You're doing great! Keep it up!", "Awesome effort! So close!",
    "I can see you're trying hard!", "That's the spirit! One more time!",
    "Oops! Let's try again!", "Almost! One more time!", "That's okay! You can do it!",
    "Keep trying! I believe in you!", "No worries! Let's do it together!", "You've got this! Try again!",
    "Every try makes you better!", "Don't give up! You're learning!",
    "This is the letter", "Let's learn", "Here comes", "Time to meet", "Say hello to",
    "Hi friend! Ready to learn?", "Hello! Let's have fun!", "Yay! You're here! Let's play!",
    "Welcome back! I missed you!", "Hi there! Let's learn together!", "Hello friend! Ready for adventure?",
    "You're doing great!", "Keep going! You've got this!", "I believe in you!", "You're so smart!",
    "You make me so happy!", "I love learning with you!", "You're my favorite friend!",
    "Woohoo! Party time!", "Let's celebrate!", "You're a champion!", "Time to dance!",
    "Hip hip hooray!", "You're incredible!",
    "Bye bye! See you soon!", "Great job today! Come back soon!", "Bye friend! You did amazing!",
    "See you later, superstar!", "Goodbye! I'll miss you!",
    "Hmm, let me think...", "One moment...", "Let me see...", "Thinking...",
    "Go ahead, try it!", "Your turn!", "I'm watching! Show me!", "Ready when you are!", "Take your time!",
    "Wow! You're on fire!", "Amazing streak! Keep going!", "You're unstoppable!",
    "What a run! Incredible!", "Super streak! You're awesome!",
];

const RHYME_WORDS = [
    'cat', 'bat', 'hat', 'mat', 'rat', 'sat',
    'can', 'fan', 'man', 'pan', 'van', 'ran',
    'big', 'dig', 'fig', 'pig', 'wig',
    'cop', 'hop', 'mop', 'pop', 'top',
    'bug', 'hug', 'jug', 'mug', 'rug',
    'bet', 'get', 'jet', 'net', 'pet', 'wet',
    'den', 'hen', 'men', 'pen', 'ten',
    'bit', 'hit', 'kit', 'lit', 'sit',
    'bog', 'dog', 'fog', 'hog', 'log',
    'bun', 'fun', 'run', 'sun',
];
const rhymeWordPhrases = RHYME_WORDS;
const rhymePromptPhrases = RHYME_WORDS.map((w) => `Find the word that rhymes with ${w}!`);

const ANIMALS = [
    { name: 'Dog', sound: 'Woof woof!' },
    { name: 'Cat', sound: 'Meow!' },
    { name: 'Cow', sound: 'Moo!' },
    { name: 'Pig', sound: 'Oink oink!' },
    { name: 'Bird', sound: 'Chirp chirp!' },
    { name: 'Rooster', sound: 'Cock-a-doodle-doo!' },
    { name: 'Sheep', sound: 'Baa baa!' },
    { name: 'Horse', sound: 'Neigh!' },
    { name: 'Lion', sound: 'Roar!' },
    { name: 'Elephant', sound: 'Trumpet!' },
    { name: 'Monkey', sound: 'Ooh ooh ah ah!' },
    { name: 'Frog', sound: 'Ribbit ribbit!' },
];
const animalSounds = ANIMALS.map((a) => a.sound);
const animalCorrectPhrases = ANIMALS.map((a) => `Correct! The ${a.name} says ${a.sound}`);
const animalWrongPhrases = ANIMALS.map((a) => `Oops! Look for the ${a.name}. It says ${a.sound}`);

const STATIC_GAME_PHRASES = [
    'Congratulations! You are a phonics pro!',
    'Level complete! Great job!',
    'Pinch the shapes in the shown order!',
    "You finished all levels! You're a shape expert!",
    'Pinch a shape!',
    'Oops! Start again from the first shape!',
    'Great! Next shape!',
    'Find the numbers in order. Start with one!',
    'Amazing! You completed all levels!',
    'Level complete! Great counting!',
    'Pinch the numbers in order from one to ten!',
    'Great job! That rhymes!',
    'Try again! Listen for the rhyme!',
    "You're an emotion expert! Amazing job!",
    'Amazing! Five in a row!',
    "Let's play Emoji Match! Show me your hand!",
    "Let's build words together! Show me your hand!",
    'Amazing! You completed all phonics stages! Keep practicing!',
    'Dance dance dance!',
    'Great freeze! You held so still!',
    'Good try! Hold even stiller next time!',
    'You moved! Try to hold super still next time!',
    'Here is a hint!',
    'Great match!',
    'Great! That is the right spot!',
    'Try a different spot!',
    'Great rhythm! Keep going!',
    'Move to the glowing lane and pinch!',
    'Yum! Correct answer!',
    'Correct! Great job!',
    'Level complete! Next level!',
    'Keep trying! Trace the shape more carefully!',
    'Amazing! You completed all the mirror drawings!',
    'Level complete! Great mirror drawing!',
    'Keep going! Trace the whole letter!',
    'Great job! You held steady!',
    'Amazing! You are doing great!',
    'Keep your finger inside the ring!',
    'Connect the dots in order! Pinch each number!',
    'Great job! You connected all the dots!',
    'Wow! You popped a lot!',
    'Oops! Streak lost! Try again!',
    'Pinch when you are inside the target!',
    'Great! Now try to pop as many shapes as you can!',
    'Which animal makes this sound?',
    "Let's play! Show me your hand!",
    'Great! I can see your hand!',
    "I can't see your hand! Show it to the camera!",
    'Make a pinch to grab!',
    'Wave your hand to begin!',
    'Point at what you want!',
    'Open your hand wide!',
    'Make a fist!',
    'Amazing! You did it!',
    'Not quite! Try again!',
    'Great job! Keep going!',
    'So close! One more try!',
    "You finished! Let's try the next one!",
    "You're amazing! You finished all the levels!",
    "Here's a new challenge!",
    'Pop the bubbles by pinching them!',
    'Find the matching emoji!',
    'Paint with your finger!',
    'Dress them for the weather!',
    'Amazing! New bubbles are ready!',
    'Pop the bubbles by pinching them! Each one makes a musical note!',
    "You finished all the weather! You're a weather expert!",
    "Amazing! Let's try the next weather!",
    'Dress the character for different weather! Drag the right clothes!',
    'Great job! You popped a bubble!',
    'Look at the pizza! Drag the right fraction label to the tray!',
    'Pinch the food and drag it to the monster to feed it!',
    'Pinch to smash the correct answer!',
    'Smashing! You got it!',
    'What time is shown on the clock?',
    'Yuck! I do not want that!',
    'Yummy! That was delicious!',
    'Amazing! You found it!',
    'I see your hand! Keep conducting!',
    'I see your hand! Keep slicing!',
    'Incredible! You are a master conductor!',
    'Incredible! You are a master fruit ninja!',
    'Oh no, you hit a slime! Good run!',
    'Show your hand to the camera!',
    'Try again!',
    'Try blowing gently into the microphone to pop bubbles!',
    'Wave your hands to slice the flying fruit!',
    "Let's go! Raise your hand high to jump over the slimes and grab the coins!",
];

// ---------------------------------------------------------------------------
// Build deduplicated corpus
// ---------------------------------------------------------------------------

function buildCorpus(): Map<string, string> {
    const allPhrases = [
        ...phonemePhrases,
        ...phonemeConfirmPhrases,
        ...PIP_RESPONSES_FLAT,
        ...rhymeWordPhrases,
        ...rhymePromptPhrases,
        ...animalSounds,
        ...animalCorrectPhrases,
        ...animalWrongPhrases,
        ...STATIC_GAME_PHRASES,
    ];

    const corpus = new Map<string, string>();
    for (const phrase of allPhrases) {
        const norm = normalizeText(phrase);
        if (!corpus.has(norm)) {
            corpus.set(norm, phrase);
        }
    }
    return corpus;
}

// ---------------------------------------------------------------------------
// MacOS Native generation
// ---------------------------------------------------------------------------

async function generateAudioMac(text: string, wavPath: string): Promise<void> {
    const tempAiff = `/tmp/say_temp_${Date.now()}.aiff`;

    // 1. Generate Voice with Samantha (child-friendly default)
    // -r 150 slows her down slightly for kids
    await execAsync(`say -v "Samantha" -r 150 -o "${tempAiff}" "${text}"`);

    // 2. Convert to crisp Mono WAV using ffmpeg 
    await execAsync(`ffmpeg -y -i "${tempAiff}" -ar 24000 -ac 1 "${wavPath}" -loglevel error`);

    // 3. Cleanup tmp
    await execAsync(`rm "${tempAiff}"`);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
    console.log('🎵  generate_mac_native_audio — Pre-generate Audio via macOS native TTS');
    console.log(`📁  Output: ${OUTPUT_DIR}`);

    if (!existsSync(OUTPUT_DIR)) {
        await mkdir(OUTPUT_DIR, { recursive: true });
    }

    let existingManifest: Record<string, string> = {};
    if (existsSync(MANIFEST_PATH) && !FORCE) {
        try {
            existingManifest = JSON.parse(await readFile(MANIFEST_PATH, 'utf-8'));
            console.log(`📋  Existing manifest: ${Object.keys(existingManifest).length} entries`);
        } catch {
            console.warn('⚠️   Could not parse existing manifest — starting fresh');
        }
    }

    const corpus = buildCorpus();
    console.log(`📝  Corpus: ${corpus.size} unique phrases\n`);

    const manifest: Record<string, string> = { ...existingManifest };
    let generated = 0;
    let skipped = 0;

    for (const [normalized, original] of corpus.entries()) {
        const hash = hashText(normalized);
        const filename = `${hash}.wav`;
        const filepath = path.join(OUTPUT_DIR, filename);
        const webPath = `/audio/pregen/en/${filename}`;

        if (!FORCE && manifest[normalized] && existsSync(filepath)) {
            skipped++;
            continue;
        }

        const preview = original.length > 55 ? original.slice(0, 52) + '...' : original;
        process.stdout.write(`🔊  "${preview}"  → `);

        await generateAudioMac(original, filepath);

        manifest[normalized] = webPath;
        generated++;
        console.log(`✅  ${filename}`);
    }

    // Write manifest
    await writeFile(MANIFEST_PATH, JSON.stringify(manifest, null, 2));

    console.log('\n─────────────────────────────────');
    console.log(`✅  Generated:  ${generated}`);
    console.log(`⏭️   Skipped:    ${skipped} (already existed)`);
    console.log(`📋  Manifest:   ${Object.keys(manifest).length} total entries`);
    console.log(`📁  ${MANIFEST_PATH}`);
}

main().catch((err) => {
    console.error('Fatal:', err);
    process.exit(1);
});
