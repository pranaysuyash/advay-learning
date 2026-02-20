/* eslint-disable no-console */
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
  Header,
  Footer,
  PageNumber,
} = require('docx');
const fs = require('fs');
const path = require('path');

/**
 * Lightweight DOCX generator preserving the external agent workflow.
 *
 * Usage:
 *   node tools/qa_analysis/zai/generate_emoji_match_docx_report.js \
 *     evaluations/video_analysis_raw.json \
 *     evaluations/Toddler_Game_QA_Report_EmojiMatch.docx
 */

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    inputJson: args[0] || 'evaluations/video_analysis_raw.json',
    outputDocx: args[1] || 'evaluations/Toddler_Game_QA_Report_EmojiMatch.docx',
  };
}

function safeReadJson(filePath) {
  if (!fs.existsSync(filePath)) return null;
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch {
    return null;
  }
}

async function main() {
  const { inputJson, outputDocx } = parseArgs();
  const payload = safeReadJson(inputJson);

  const metadata = payload?.metadata || {
    width: 1280,
    height: 908,
    duration: 119.95,
    frameRate: 60,
  };

  const results = payload?.results || [];

  const doc = new Document({
    sections: [
      {
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [new TextRun({ text: 'Toddler Game QA Report - Emoji Match', size: 18 })],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: 'Page ', size: 18 }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 18 }),
                  new TextRun({ text: ' of ', size: 18 }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18 }),
                ],
              }),
            ],
          }),
        },
        children: [
          new Paragraph({
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            children: [new TextRun('Toddler Game QA Review Report')],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [new TextRun('Emoji Match - Hand-Tracking Learning Game')],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun(
                `Video: ${metadata.width}x${metadata.height}, ${metadata.frameRate}fps, ~${metadata.duration}s`
              ),
            ],
          }),
          new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun('Analysis Results')] }),
          ...(results.length
            ? results.flatMap((r) => [
                new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun(`Pass ${r.pass}`)] }),
                new Paragraph({ children: [new TextRun(r.analysis || 'No analysis returned')] }),
              ])
            : [new Paragraph({ children: [new TextRun('No analysis results found in input JSON.')] })]),
        ],
      },
    ],
  });

  const outPath = path.resolve(outputDocx);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  const buffer = await Packer.toBuffer(doc);
  fs.writeFileSync(outPath, buffer);
  console.log(`Report saved to: ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
