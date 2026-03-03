import urllib.request
import os
import ssl

ssl._create_default_https_context = ssl._create_unverified_context

OUT_DIR = "src/frontend/public/assets/sounds/animals"
os.makedirs(OUT_DIR, exist_ok=True)

ANIMALS = {
 "dog": "https://upload.wikimedia.org/wikipedia/commons/d/d4/Bite_dog.ogg",
 "cat": "https://upload.wikimedia.org/wikipedia/commons/5/5e/Domestic_Cat_Meow.ogg",
 "cow": "https://upload.wikimedia.org/wikipedia/commons/b/b5/Cows_in_a_pasture.ogg",
 "pig": "https://upload.wikimedia.org/wikipedia/commons/e/e0/Pigs_in_a_pen.ogg",
 "duck": "https://upload.wikimedia.org/wikipedia/commons/3/36/Mallard_Duck_Quacks.ogg",
 "sheep": "https://upload.wikimedia.org/wikipedia/commons/1/1b/Sheep_bleat.ogg",
 "lion": "https://upload.wikimedia.org/wikipedia/commons/2/23/Lion_roar.ogg",
 "elephant": "https://upload.wikimedia.org/wikipedia/commons/c/c5/Elephant_trumpet.ogg",
 "monkey": "https://upload.wikimedia.org/wikipedia/commons/8/87/Chimpanzee-pant-hoot.ogg",
 "frog": "https://upload.wikimedia.org/wikipedia/commons/6/6d/Rana_catesbeiana_calling.ogg",
 "horse": "https://upload.wikimedia.org/wikipedia/commons/f/fe/Horse_whinny_2.ogg",
 "snake": "https://upload.wikimedia.org/wikipedia/commons/c/c8/Western_Diamondback_Rattlesnake_%28Crotalus_atrox%29_rattling.ogg"
}

for animal, url in ANIMALS.items():
    out_path = os.path.join(OUT_DIR, f"{animal}.ogg")
    if not os.path.exists(out_path):
        print(f"Downloading {animal}...")
        try:
            req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response, open(out_path, 'wb') as out_file:
                out_file.write(response.read())
            print(f"Saved {animal}.ogg")
        except Exception as e:
            print(f"Failed to download {animal}: {e}")
