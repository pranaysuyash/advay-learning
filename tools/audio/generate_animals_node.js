import { HfInference } from "@huggingface/inference";
import fs from "fs";

const hf = new HfInference(process.env.HF_TOKEN || process.env.HUGGINGFACE_API_KEY || "");

const ANIMALS = {
  dog: "A dog barking loudly",
  cat: "A cat meowing",
  cow: "A cow mooing loudly",
  pig: "A pig oinking",
  duck: "A duck quacking",
  sheep: "A sheep baaing",
  lion: "A lion roaring",
  elephant: "An elephant trumpeting",
  monkey: "A monkey making sounds",
  frog: "A frog ribbiting",
  horse: "A horse neighing",
  snake: "A snake hissing",
};

async function main() {
  for (const [animal, prompt] of Object.entries(ANIMALS)) {
    console.log(`Generating ${animal}...`);
    try {
      const audioBlob = await hf.textToAudio({
        model: "cvssp/audioldm2",
        inputs: prompt,
      });
      const buffer = Buffer.from(await audioBlob.arrayBuffer());
      fs.writeFileSync(`src/frontend/public/assets/sounds/animals/${animal}.flac`, buffer);
      console.log(`Saved ${animal}.flac`);
      await new Promise((r) => setTimeout(r, 2000));
    } catch (e) {
      console.error(`Error on ${animal}:`, e);
    }
  }
}

main();
