import ZAI from 'z-ai-web-dev-sdk';
import * as fs from 'fs';
import * as path from 'path';

const QUICK_PROMPT = `Analyze this toddler game screenshot. Report in JSON format:
{
  "timestamp": "time shown",
  "level": "level number or 'complete'",
  "gameState": "intro/playing/level_complete/game_over",
  "cursor": {
    "visible": true/false,
    "type": "mouse/hand_dot/other",
    "size_px": estimate,
    "color": "color",
    "visibility_rating": "1-10"
  },
  "target": {
    "name": "target emoji name",
    "count": number_of_targets
  },
  "timer": {
    "value": "timer value",
    "warning": true/false
  },
  "issues": ["issue1", "issue2"]
}`;

type QuickResult = {
  frame: number;
  timestamp: string;
  rawAnalysis: string;
};

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    framesDir: args[0] || 'evaluations/emoji_match_frames',
    outputFile: args[1] || 'evaluations/frame_analysis_summary.json',
    delayMs: Number(args[2] || 1000),
  };
}

function toTimestamp(frameIdx: number): string {
  const mm = Math.floor(frameIdx / 60);
  const ss = String(frameIdx % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

async function quickAnalysis() {
  const { framesDir, outputFile, delayMs } = parseArgs();
  const zai = await ZAI.create();

  const keyFrames = [1, 5, 10, 20, 30, 50, 70, 90, 100, 120, 150, 180, 200, 220, 240];
  const results: QuickResult[] = [];

  for (const frameIdx of keyFrames) {
    const frameFile = `frame_${String(frameIdx).padStart(4, '0')}.png`;
    const framePath = path.join(framesDir, frameFile);

    if (!fs.existsSync(framePath)) {
      console.log(`Frame not found: ${framePath}`);
      continue;
    }

    try {
      const imageBuffer = fs.readFileSync(framePath);
      const base64Image = imageBuffer.toString('base64');

      console.log(`Analyzing frame ${frameIdx}...`);
      const response = await zai.chat.completions.createVision({
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: QUICK_PROMPT },
              { type: 'image_url', image_url: { url: `data:image/png;base64,${base64Image}` } },
            ],
          },
        ],
        thinking: { type: 'disabled' },
      });

      const content = response.choices[0]?.message?.content || '{}';
      results.push({ frame: frameIdx, timestamp: toTimestamp(frameIdx), rawAnalysis: content });

      console.log(`  ✓ Frame ${frameIdx} done`);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    } catch (error: any) {
      console.error(`  ✗ Frame ${frameIdx} error: ${error?.message || error}`);
    }
  }

  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
  console.log(`\nResults saved to: ${outputFile}`);

  return results;
}

quickAnalysis().catch((error) => {
  console.error(error);
  process.exit(1);
});
