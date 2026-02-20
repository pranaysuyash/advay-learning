import ZAI from 'z-ai-web-dev-sdk';
import * as fs from 'fs';
import * as path from 'path';

interface VideoMetadata {
  width: number;
  height: number;
  duration: number;
  frameRate: number;
  msPerFrame: number;
}

const FIRST_PASS_PROMPT = `You are analyzing a toddler learning game recording. PASS 1: Map the experience.

Identify game loop states (intro, instructions, detect hand, active play, success, failure, level end, retry), with timestamps.
Report hand-tracking visibility, core mechanics, pacing observations, and instruction/feedback clarity.`;

const SECOND_PASS_PROMPT = `You are analyzing a toddler learning game recording. PASS 2: Frame-level audit.

Focus on timestamped evidence for: latency/stutter, cursor legibility, target sizing, pacing issues, clarity issues, and feedback loops.
Use MM:SS timestamps and frame counts where possible.`;

const THIRD_PASS_PROMPT = `You are analyzing a toddler learning game recording. PASS 3: What broke trust?

Find moments where a child/parent would think broken/unfair/confusing/too intense.
For each moment: timestamp, what happened, why it breaks trust, severity S1/S2/S3.`;

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    videoPath: args[0] || 'tools/emoji_match.mov',
    outputFile: args[1] || 'evaluations/video_analysis_raw.json',
    width: Number(args[2] || 1280),
    height: Number(args[3] || 908),
    duration: Number(args[4] || 119.95),
    frameRate: Number(args[5] || 60),
  };
}

async function runPass(zai: any, prompt: string, videoPath: string, passNumber: number) {
  console.log(`=== PASS ${passNumber} ===`);
  try {
    const response = await zai.chat.completions.createVision({
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'video_url', video_url: { url: `file://${path.resolve(videoPath)}` } },
          ],
        },
      ],
      thinking: { type: 'enabled' },
    });

    const analysis = response.choices[0]?.message?.content || 'No analysis returned';
    console.log(`PASS ${passNumber} complete`);
    return analysis;
  } catch (error: any) {
    const message = `Error: ${error?.message || error}`;
    console.error(`PASS ${passNumber} failed: ${message}`);
    return message;
  }
}

async function analyzeVideo() {
  const { videoPath, outputFile, width, height, duration, frameRate } = parseArgs();

  if (!fs.existsSync(videoPath)) {
    throw new Error(`Video file not found: ${videoPath}`);
  }

  const metadata: VideoMetadata = {
    width,
    height,
    duration,
    frameRate,
    msPerFrame: 1000 / frameRate,
  };

  const zai = await ZAI.create();

  const pass1 = await runPass(zai, FIRST_PASS_PROMPT, videoPath, 1);
  const pass2 = await runPass(zai, SECOND_PASS_PROMPT, videoPath, 2);
  const pass3 = await runPass(zai, THIRD_PASS_PROMPT, videoPath, 3);

  const payload = {
    metadata,
    videoPath,
    generatedAt: new Date().toISOString(),
    results: [
      { pass: 1, prompt: FIRST_PASS_PROMPT, analysis: pass1 },
      { pass: 2, prompt: SECOND_PASS_PROMPT, analysis: pass2 },
      { pass: 3, prompt: THIRD_PASS_PROMPT, analysis: pass3 },
    ],
  };

  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, JSON.stringify(payload, null, 2));
  console.log(`Saved analysis to ${outputFile}`);
}

analyzeVideo().catch((err) => {
  console.error(err);
  process.exit(1);
});
