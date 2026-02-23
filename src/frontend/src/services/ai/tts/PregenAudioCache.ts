/**
 * PregenAudioCache — Pre-generated Audio Lookup & Playback
 *
 * Maps known static phrases (e.g. GAME_INSTRUCTIONS) to pre-generated
 * .wav files in /audio/tts/. These are generated via HF Inference API
 * (see scripts/generate_tts_assets.ts) for zero-latency, high-quality
 * TTS playback without any model loading.
 *
 * This is Tier 1 of the three-tier TTS strategy:
 *   1. PregenAudioCache (instant .wav playback)
 *   2. Kokoro-82M in-browser (neural TTS for dynamic text)
 *   3. Web Speech API (fallback)
 */

/** Normalize text for matching: lowercase, collapse whitespace, strip trailing punctuation */
function normalizeText(text: string): string {
    return text
        .toLowerCase()
        .replace(/\s+/g, ' ')
        .trim();
}

/**
 * Static phrase → audio file mapping
 * Generated from GAME_INSTRUCTIONS and common game phrases.
 * Keys are normalized lowercase text, values are paths relative to public/.
 */
const PHRASE_MAP: Record<string, string> = {
    // GAME_INSTRUCTIONS
    "let's play! show me your hand!": '/audio/tts/game_start.wav',
    'great! i can see your hand!': '/audio/tts/hand_detected.wav',
    "i can't see your hand! show it to the camera!": '/audio/tts/hand_lost.wav',
    'make a pinch to grab!': '/audio/tts/pinch_to_select.wav',
    'wave your hand to begin!': '/audio/tts/wave_to_start.wav',
    'point at what you want!': '/audio/tts/point_to_choose.wav',
    'open your hand wide!': '/audio/tts/open_hand.wav',
    'make a fist!': '/audio/tts/close_hand.wav',
    'amazing! you did it!': '/audio/tts/success.wav',
    'not quite! try again!': '/audio/tts/try_again.wav',
    'great job! keep going!': '/audio/tts/great_job.wav',
    'so close! one more try!': '/audio/tts/almost.wav',
    "you finished! let's try the next one!": '/audio/tts/level_complete.wav',
    "you're amazing! you finished all the levels!": '/audio/tts/game_complete.wav',
    "here's a new challenge!": '/audio/tts/new_level.wav',
    'pop the bubbles by pinching them!': '/audio/tts/bubble_pop.wav',
    'find the matching emoji!': '/audio/tts/emoji_match.wav',
    'paint with your finger!': '/audio/tts/color_splash.wav',
    'dress them for the weather!': '/audio/tts/dress_weather.wav',

    // Additional common phrases
    'amazing! new bubbles are ready!': '/audio/tts/bubbles_ready.wav',
    'pop the bubbles by pinching them! each one makes a musical note!': '/audio/tts/bubble_pop_long.wav',
    "you finished all the weather! you're a weather expert!": '/audio/tts/weather_expert.wav',
    "amazing! let's try the next weather!": '/audio/tts/next_weather.wav',
    'dress the character for different weather! drag the right clothes!': '/audio/tts/dress_instructions.wav',
};

// Cache of Audio elements to avoid re-creating them
const audioCache = new Map<string, HTMLAudioElement>();

export class PregenAudioCache {
    /**
     * Check if a phrase has a pre-generated audio file.
     */
    static has(text: string): boolean {
        return normalizeText(text) in PHRASE_MAP;
    }

    /**
     * Play a pre-generated audio file for the given text.
     * Returns a promise that resolves when playback completes.
     * Throws if the phrase is not in the cache.
     */
    static async play(text: string, volume: number = 1.0): Promise<void> {
        const normalized = normalizeText(text);
        const path = PHRASE_MAP[normalized];

        if (!path) {
            throw new Error(`[PregenAudioCache] No pre-generated audio for: "${text}"`);
        }

        let audio = audioCache.get(path);
        if (!audio) {
            audio = new Audio(path);
            audio.preload = 'auto';
            audioCache.set(path, audio);
        }

        audio.volume = Math.max(0, Math.min(1, volume));
        audio.currentTime = 0;

        return new Promise<void>((resolve, reject) => {
            audio!.onended = () => resolve();
            audio!.onerror = () => reject(new Error(`[PregenAudioCache] Failed to play: ${path}`));
            audio!.play().catch(reject);
        });
    }

    /**
     * Stop any currently playing pre-generated audio.
     */
    static stop(): void {
        for (const audio of audioCache.values()) {
            audio.pause();
            audio.currentTime = 0;
        }
    }

    /**
     * Preload all audio files (call on app init for instant playback).
     */
    static preloadAll(): void {
        for (const path of Object.values(PHRASE_MAP)) {
            if (!audioCache.has(path)) {
                const audio = new Audio(path);
                audio.preload = 'auto';
                audioCache.set(path, audio);
            }
        }
        console.log(`[PregenAudioCache] Preloaded ${audioCache.size} audio clips`);
    }

    /**
     * Get count of cached phrases.
     */
    static get phraseCount(): number {
        return Object.keys(PHRASE_MAP).length;
    }
}

export default PregenAudioCache;
