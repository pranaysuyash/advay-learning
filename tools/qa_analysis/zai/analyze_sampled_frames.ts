import ZAI from 'z-ai-web-dev-sdk';
import * as fs from 'fs';
import * as path from 'path';

const FRAME_ANALYSIS_PROMPT = `You are a UI/UX + QA reviewer analyzing a TODDLER learning game screenshot.

CRITICAL CONTEXT:
- Game for children ages 2-4 years
- Toddlers: low working memory, poor motor precision, short attention spans
- Hand-tracking based interaction

VIDEO SPECS: 1280x908, 60fps, 1 frame ≈ 16.67ms

ANALYZE FOR THESE SPECIFIC ISSUES:
1) CURSOR/DOT VISIBILITY (size, contrast, clarity)
2) TARGET SIZING (sufficient size/spacing for toddlers)
3) VISUAL HIERARCHY & CLARITY (one obvious next action)
4) FEEDBACK VISIBILITY (success/failure clarity)
5) BACKGROUND/UI ISSUES (clutter, contrast, color-only cues)
6) COGNITIVE LOAD (too many moving/changing elements)

Provide specific observations with pixel estimates where relevant. Be brutally honest.`;

type FrameAnalysis = {
  frameNumber: number;
  timestamp: string;
  analysis: string;
};

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    framesDir: args[0] || 'evaluations/emoji_match_frames',
    outputFile: args[1] || 'evaluations/frame_analysis_results.json',
    batchSize: Number(args[2] || 5),
    sampleEvery: Number(args[3] || 10),
  };
}

function toTimestamp(frameIdx: number): string {
  const minutes = Math.floor(frameIdx / 60);
  const seconds = frameIdx % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

async function analyzeFrames() {
  const { framesDir, outputFile, batchSize, sampleEvery } = parseArgs();

  const frameFiles = fs.readdirSync(framesDir).filter((f) => f.endsWith('.png')).sort();
  console.log(`Found ${frameFiles.length} PNG frames in ${framesDir}`);

  const keyFrameIndices: number[] = [];
  for (let i = 1; i <= Math.min(5, frameFiles.length); i++) keyFrameIndices.push(i);
  for (let i = sampleEvery; i <= frameFiles.length; i += sampleEvery) keyFrameIndices.push(i);
  for (let i = Math.max(1, frameFiles.length - 5); i <= frameFiles.length; i++) keyFrameIndices.push(i);

  const uniqueIndices = [...new Set(keyFrameIndices)].sort((a, b) => a - b);
  console.log(`Analyzing ${uniqueIndices.length} sampled frames...`);

  const zai = await ZAI.create();
  const results: FrameAnalysis[] = [];

  for (let i = 0; i < uniqueIndices.length; i += batchSize) {
    const batch = uniqueIndices.slice(i, i + batchSize);

    for (const frameIdx of batch) {
      const frameFile = `frame_${String(frameIdx).padStart(4, '0')}.png`;
      const framePath = path.join(framesDir, frameFile);

      if (!fs.existsSync(framePath)) {
        console.log(`Skipping missing frame: ${framePath}`);
        continue;
      }

      try {
        const imageBuffer = fs.readFileSync(framePath);
        const base64Image = imageBuffer.toString('base64');
        const timestamp = toTimestamp(frameIdx);

        console.log(`Analyzing frame ${frameIdx}/${frameFiles.length} (${timestamp})...`);

        const response = await zai.chat.completions.createVision({
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: FRAME_ANALYSIS_PROMPT },
                { type: 'image_url', image_url: { url: `data:image/png;base64,${base64Image}` } },
              ],
            },
          ],
          thinking: { type: 'disabled' },
        });

        const analysis = response.choices[0]?.message?.content || 'No analysis returned';
        results.push({ frameNumber: frameIdx, timestamp, analysis });

        await new Promise((resolve) => setTimeout(resolve, 500));
      } catch (error: any) {
        results.push({ frameNumber: frameIdx, timestamp: toTimestamp(frameIdx), analysis: `Error: ${error?.message || error}` });
        console.error(`Error analyzing frame ${frameIdx}:`, error?.message || error);
      }
    }
  }

  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, JSON.stringify(results, null, 2));
  console.log(`Analysis complete. Saved ${results.length} items to ${outputFile}`);
}

analyzeFrames().catch((err) => {
  console.error(err);
  process.exit(1);
});
