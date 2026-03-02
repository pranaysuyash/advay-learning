import os
import requests
import json
import time

def get_hf_token():
    token = os.getenv("HF_TOKEN") or os.getenv("HUGGINGFACE_API_KEY")
    if token: return token
    
    # Check common env files
    for env_path in [".env", "src/backend/.env", "src/frontend/.env"]:
        try:
            with open(env_path, "r") as f:
                for line in f:
                    if line.startswith("HF_TOKEN=") or line.startswith("HUGGINGFACE_API_KEY="):
                        return line.split("=", 1)[1].strip().strip('"').strip("'")
        except FileNotFoundError:
            pass
    return None

HF_TOKEN = get_hf_token()

API_URL = "https://api-inference.huggingface.co/models/cvssp/audioldm2"
headers = {"Authorization": f"Bearer {HF_TOKEN}"} if HF_TOKEN else {}

ANIMALS = {
    "dog": "A dog barking loudly",
    "cat": "A cat meowing",
    "cow": "A cow mooing loudly",
    "pig": "A pig oinking",
    "duck": "A duck quacking",
    "sheep": "A sheep baaing",
    "lion": "A lion roaring",
    "elephant": "An elephant trumpeting",
    "monkey": "A monkey making sounds",
    "frog": "A frog ribbiting",
    "horse": "A horse neighing",
    "snake": "A snake hissing"
}

OUT_DIR = "src/frontend/public/assets/sounds/animals"

def query(payload):
    response = requests.post(API_URL, headers=headers, json=payload)
    if response.status_code != 200:
        raise Exception(f"Failed to generate: {response.text}")
    return response.content

def main():
    if not HF_TOKEN:
        print("ERROR: HF_TOKEN or HUGGINGFACE_API_KEY environment variable not set.")
        return
        
    os.makedirs(OUT_DIR, exist_ok=True)
    
    for animal, prompt in ANIMALS.items():
        out_path = os.path.join(OUT_DIR, f"{animal}.flac")
        if os.path.exists(out_path):
            print(f"Skipping {animal}, already exists.")
            continue
            
        print(f"Generating sound for {animal}: '{prompt}'...")
        try:
            audio_bytes = query({"inputs": prompt})
            with open(out_path, "wb") as f:
                f.write(audio_bytes)
            print(f"Saved {animal}.flac")
            time.sleep(2) # rate limit prevention
        except Exception as e:
            print(f"Error generating {animal}: {e}")

if __name__ == "__main__":
    main()
