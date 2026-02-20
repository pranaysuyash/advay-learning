import ZAI from 'z-ai-web-dev-sdk';
import * as fs from 'fs';
import * as path from 'path';

const FINAL_PROMPT = `You are analyzing the FINAL frame of a toddler (2-4 years) hand-tracking game called "Emoji Match".

Provide a comprehensive analysis of:
1) END SCREEN ANALYSIS
2) OVERALL GAME ASSESSMENT
3) TODDLER-FRIENDLINESS ISSUES

Be specific and critical.`;

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    framesDir: args[0] || 'evaluations/emoji_match_frames',
    finalFrameFile: args[1] || 'frame_0240.png',
    outputFile: args[2] || 'evaluations/final_frame_analysis.txt',
  };
}

async function finalAnalysis() {
  const { framesDir, finalFrameFile, outputFile } = parseArgs();
  const framePath = path.join(framesDir, finalFrameFile);

  if (!fs.existsSync(framePath)) {
    throw new Error(`Final frame not found: ${framePath}`);
  }

  const zai = await ZAI.create();
  const imageBuffer = fs.readFileSync(framePath);
  const base64Image = imageBuffer.toString('base64');

  console.log(`Analyzing final frame: ${framePath}`);

  const response = await zai.chat.completions.createVision({
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: FINAL_PROMPT },
          { type: 'image_url', image_url: { url: `data:image/png;base64,${base64Image}` } },
        ],
      },
    ],
    thinking: { type: 'disabled' },
  });

  const content = response.choices[0]?.message?.content || '{}';

  fs.mkdirSync(path.dirname(outputFile), { recursive: true });
  fs.writeFileSync(outputFile, content, 'utf-8');

  console.log('\n=== FINAL FRAME ANALYSIS ===\n');
  console.log(content);
  console.log(`\nSaved to: ${outputFile}`);

  return content;
}

finalAnalysis().catch((error) => {
  console.error(error);
  process.exit(1);
});
