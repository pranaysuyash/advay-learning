/**
 * generate_tts_assets.ts
 *
 * Pre-generates high-quality TTS audio clips using HF Inference API.
 * Uses Parler-TTS for prompt-based voice control (child-friendly enthusiastic voice).
 *
 * Prerequisites:
 *   export HF_TOKEN="hf_..."
 *   npx tsx scripts/generate_tts_assets.ts
 *
 * Output: src/frontend/public/audio/tts/*.mp3
 */

import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import path from 'path';

const HF_TOKEN = process.env.HF_TOKEN;
if (!HF_TOKEN) {
    console.error('❌ Set HF_TOKEN environment variable first');
    process.exit(1);
}

// Output directory
const OUTPUT_DIR = path.resolve(__dirname, '../src/frontend/public/audio/tts');

// Voice description for Parler-TTS
const VOICE_DESCRIPTION =
    "A cheerful, enthusiastic young woman narrating a children's game. " +
    "Her voice is warm, clear, and slightly high-pitched. " +
    "She speaks at a moderate pace with expressive intonation.";

// All static phrases to pre-generate
// Key = filename (without extension), Value = text to speak
const PHRASES: Record<string, string> = {
    // GAME_INSTRUCTIONS from VoiceInstructions.tsx
    game_start: "Let's play! Show me your hand!",
    hand_detected: 'Great! I can see your hand!',
    hand_lost: "I can't see your hand! Show it to the camera!",
    pinch_to_select: 'Make a pinch to grab!',
    wave_to_start: 'Wave your hand to begin!',
    point_to_choose: 'Point at what you want!',
    open_hand: 'Open your hand wide!',
    close_hand: 'Make a fist!',
    success: 'Amazing! You did it!',
    try_again: 'Not quite! Try again!',
    great_job: 'Great job! Keep going!',
    almost: 'So close! One more try!',
    level_complete: "You finished! Let's try the next one!",
    game_complete: "You're amazing! You finished all the levels!",
    new_level: "Here's a new challenge!",
    bubble_pop: 'Pop the bubbles by pinching them!',
    emoji_match: 'Find the matching emoji!',
    color_splash: 'Paint with your finger!',
    dress_weather: 'Dress them for the weather!',

    // Additional common phrases from game components
    bubbles_ready: 'Amazing! New bubbles are ready!',
    bubble_pop_long: 'Pop the bubbles by pinching them! Each one makes a musical note!',
    weather_expert: "You finished all the weather! You're a weather expert!",
    next_weather: "Amazing! Let's try the next weather!",
    dress_instructions: 'Dress the character for different weather! Drag the right clothes!',
    hand_lost_long: "I can't see your hand! Show it to the camera!",
};

/**
 * Call HF Inference API with Parler-TTS
 */
async function generateAudio(text: string): Promise<ArrayBuffer> {
    // Try parler-tts first, fall back to facebook/mms-tts-eng
    const models = [
        'parler-tts/parler-tts-mini-v1',
        'facebook/mms-tts-eng',
    ];

    for (const model of models) {
        try {
            const isParler = model.includes('parler');
            const body = isParler
                ? JSON.stringify({ inputs: text, parameters: { description: VOICE_DESCRIPTION } })
                : JSON.stringify({ inputs: text });

            const response = await fetch(
                `https://api-inference.huggingface.co/models/${model}`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${HF_TOKEN}`,
                        'Content-Type': 'application/json',
                    },
                    body,
                },
            );

            if (!response.ok) {
                const errText = await response.text();
                console.warn(`⚠️  ${model} returned ${response.status}: ${errText}`);
                continue;
            }

            const audioBuffer = await response.arrayBuffer();
            if (audioBuffer.byteLength < 1000) {
                console.warn(`⚠️  ${model} returned suspiciously small audio (${audioBuffer.byteLength} bytes)`);
                continue;
            }

            console.log(`  ✅ Generated with ${model} (${(audioBuffer.byteLength / 1024).toFixed(1)} KB)`);
            return audioBuffer;
        } catch (err) {
            console.warn(`⚠️  ${model} failed:`, (err as Error).message);
            continue;
        }
    }

    throw new Error(`All models failed for: "${text}"`);
}

async function main() {
    console.log('🎤 TTS Asset Pre-Generation');
    console.log(`📁 Output: ${OUTPUT_DIR}`);
    console.log(`📝 Phrases: ${Object.keys(PHRASES).length}\n`);

    if (!existsSync(OUTPUT_DIR)) {
        await mkdir(OUTPUT_DIR, { recursive: true });
    }

    let success = 0;
    let failed = 0;

    for (const [key, text] of Object.entries(PHRASES)) {
        const outputPath = path.join(OUTPUT_DIR, `${key}.wav`);

        // Skip if already generated
        if (existsSync(outputPath)) {
            console.log(`⏭️  ${key} — already exists, skipping`);
            success++;
            continue;
        }

        console.log(`🔊 Generating: "${text}"`);

        try {
            const audioData = await generateAudio(text);
            await writeFile(outputPath, Buffer.from(audioData));
            success++;

            // Rate limit: 1 request per second for free tier
            await new Promise((r) => setTimeout(r, 1500));
        } catch (err) {
            console.error(`❌ Failed: ${key} — ${(err as Error).message}`);
            failed++;
        }
    }

    console.log(`\n✅ Done! ${success} generated, ${failed} failed`);

    // Generate manifest for the PregenAudioCache
    const manifest = Object.entries(PHRASES).reduce(
        (acc, [key, text]) => {
            acc[text] = `/audio/tts/${key}.wav`;
            return acc;
        },
        {} as Record<string, string>,
    );

    const manifestPath = path.join(OUTPUT_DIR, 'manifest.json');
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`📄 Manifest written to ${manifestPath}`);
}

main().catch(console.error);
