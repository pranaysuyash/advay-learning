import os
import json
import urllib.request
import glob
import time

API_KEY = os.environ.get("GEMINI_API_KEY", "")
if not API_KEY:
    raise SystemExit("Error: GEMINI_API_KEY environment variable is not set.")
URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={API_KEY}"

def call_gemini(prompt, content):
    data = {"contents": [{"parts": [{"text": prompt + "\n\n" + content}]}]}
    req = urllib.request.Request(URL, data=json.dumps(data).encode("utf-8"), headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req) as response:
            res = json.loads(response.read().decode())
            text = res.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "")
            return text
    except Exception as e:
        print(f"Error calling Gemini: {e}")
        return None

pages_dir = "/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages"
files_to_check = ["FreeDraw.tsx", "StorySequence.tsx", "MathMonsters.tsx"]

PROMPT = """You are a TypeScript React engineer refactoring a children's educational game component.
    
Goal:
1) Replace any generic "Start", "Play", or "Start Game" buttons with the <GameStartButton onClick={handleStart} ... /> component. Be sure to import it from '../components/game/GameStartButton'.
2) Replace any manual HUDs (score, streak, right-header info, or level trackers) with the <GameHUD score={score} streak={streak} levelInfo={...} /> component. Be sure to import it from '../components/game/GameHUD'.

Important guidelines:
- Output ONLY the fully refactored, valid TypeScript code.
- Do NOT include any markdown formatting or codeblocks like ```tsx in your final output, just raw code.
- Maintain all existing logic.

Here is the file content:"""

for fname in files_to_check:
    fpath = os.path.join(pages_dir, fname)
    if not os.path.exists(fpath):
        continue
    with open(fpath, "r") as f:
         orig_content = f.read()
    
    print(f"Refactoring {fname}...")
    new_content = call_gemini(PROMPT, orig_content)
    
    if new_content:
        # Clean up in case model ignored the "no markdown" rule
        if new_content.startswith("```"):
            new_content = new_content.split("\n", 1)[-1]
            if new_content.endswith("```"):
                new_content = new_content[:-3]
            if new_content.endswith("```\n"):
                new_content = new_content[:-4]
                
        with open(fpath, "w") as f:
            f.write(new_content)
        print(f"Updated {fname}")
    else:
        print(f"Failed to update {fname}")
    
    time.sleep(1)
