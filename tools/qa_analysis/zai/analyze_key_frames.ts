import ZAI from 'z-ai-web-dev-sdk';
import * as fs from 'fs';
import * as path from 'path';

const ANALYSIS_PROMPT = `You are a brutally honest UI/UX + QA reviewer for a TODDLER (ages 2-4) learning game.

VIDEO SPECS: 1280x908, 60fps, 1 frame ≈ 16.67ms

This is frame {TIMESTAMP} of the gameplay recording.

ANALYZE AND REPORT:
1) CURSOR: Find the hand-tracking indicator. Describe size (~pixels), color, visibility against background. Rate 1-10 for toddler visibility.
2) TARGETS: List interactive elements. Are they large enough for toddler fingers? Minimum should be ~80-100px for this resolution.
3) CLARITY: What is the ONE thing a child should do? Is it obvious without reading?
4) FEEDBACK: Any success/failure visual cues visible?
5) ISSUES: Any visible problems (low contrast, confusing elements, visual clutter)?

Be specific and quantitative.`;

type KeyFrameResult = {
  frame: number;
  timestamp: string;
  analysis: string;
};

function parseArgs() {
  const args = process.argv.slice(2);
  const framesDir = args[0] || 'evaluations/emoji_match_frames';
  const outputFile = args[1] || 'evaluations/key_frame_analysis.json';
  return { framesDir, outputFile };
}

function formatTimestamp(seconds: number): string {
  const mm = Math.floor(seconds / 60);
  const ss = String(seconds % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

async function analyzeKeyFrames() {
  const { framesDir, outputFile } = parseArgs();

  const keyFrames = [
    1, 2, 5,
    10, 15, 20,
    30, 40, 50,
    60, 70, 80,
    90, 100, 110,
    120, 130, 140,
    150, 160, 180,
    200, 220, 240,
  ];

  const zai = await ZAI.create();
  const results: KeyFrameResult[] = [];

  console.log(`Analyzing ${keyFrames.length} strategic key frames...`);

  for (const frameIdx of keyFrames) {
    const frameFile = `frame_${String(frameIdx).padStart(4, '0')}.png`;
    const framePath = path.join(framesDir, frameFile);

    if (!fs.existsSync(framePath)) {
      console.log(`Skipping missing frame: ${framePath}`);
      continue;
    }

    const timestamp = formatTimestamp(frameIdx);

    try {
      const imageBuffer = fs.readFileSync(framePath);
      const base64Image = imageBuffer.toString('base64');

      console.log(`[${timestamp}] analyzing frame ${frameIdx}`);
      const prompt = ANALYSIS_PROMPT.replace('{TIMESTAMP}', timestamp);

      const response = await zai.chat.completions.createVision({
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { type: 'image_url', image_url: { url: `data:image/png;base64,${base64Image}` } },
            ],
          },
        ],
        thinking: { type: 'disabled' },
      });

      const analysis = response.choices[0]?.message?.content || 'No analysis';
      results.push({ frame: frameIdx, timestamp, analysis });
    } catch (error: any) {
      results.push({ frame: frameIdx, timestamp, analysis: `Error: ${error?.message || error}` });
      console.error(`Error on frame ${frameIdx}:`, error?.message || error);
    }
  }

  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
  console.log(`Done. Saved ${results.length} analyses to ${outputFile}`);
}

analyzeKeyFrames().catch((err) => {
  console.error(err);
  process.exit(1);
});
