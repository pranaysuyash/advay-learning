import os
import glob

pages_dir = "/Users/pranay/Projects/learning_for_kids/src/frontend/src/pages"
files = glob.glob(pages_dir + "/*.tsx")

missing_start = []
missing_hud = []
total_games = 0

for f in files:
    with open(f, "r") as file:
        content = file.read()
        is_game = "GameShell" in content or "GameContainer" in content
        if is_game:
            total_games += 1
            if "GameStartButton" not in content:
                missing_start.append(os.path.basename(f))
            if "GameHUD" not in content:
                missing_hud.append(os.path.basename(f))

print("Total games:", total_games)
print()
print("Missing GameStartButton (", len(missing_start), ")")
print(", ".join(missing_start))
print()
print("Missing GameHUD (", len(missing_hud), ")")
print(", ".join(missing_hud))
