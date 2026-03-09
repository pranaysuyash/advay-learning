import { KokoroTTS } from 'kokoro-js';

async function main() {
  console.log("Loading Kokoro...");
  const tts = await KokoroTTS.from_pretrained('onnx-community/Kokoro-82M-v1.0-ONNX', {
    dtype: 'fp32',
  });
  console.log("Kokoro loaded!");
  console.log(tts);
}
main().catch(console.error);
