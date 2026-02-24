# Kenney Assets - Download Instructions

**Status:** Placeholder folders created - assets need manual download  
**Source:** https://kenney.nl/assets  
**License:** CC0 (Public Domain)  
**Total Available:** 60,000+ assets (All-in-1) / Individual packs FREE

---

## 📥 How to Download

Since Kenney's assets require manual download from the website (CDN links are session-based), follow these steps:

### Method 1: Individual Pack Download (Recommended)

1. Visit https://kenney.nl/assets
2. Click on each asset pack you want
3. Click the **"Download"** button
4. Extract the ZIP to the corresponding folder below

### Method 2: All-in-1 Bundle (Paid - $19.95)

1. Visit https://kenney.itch.io/kenney-game-assets
2. Purchase supports Kenney's work (includes free updates)
3. **60,000+ assets** (~2-3 GB) - everything in one download
4. Extract to `assets/kenney/`

**Alternative:** Download individual packs for free from https://kenney.nl/assets

---

## 📁 Folder Structure

```
assets/kenney/
├── README.md              # This file
├── ui-pack/               # 430+ UI elements (buttons, panels, sliders)
├── platformer-kit/        # 2D platformer assets
├── nature-kit/            # Trees, rocks, grass
├── space-kit/             # Rockets, planets, sci-fi
├── dungeon-kit/           # Medieval dungeon assets
├── monster-kit/           # Enemy characters
└── food-kit/              # Food items for games
```

---

## 🎯 Priority Downloads for This Project

### Essential (Download First)

| Pack | URL | Use For |
|------|-----|---------|
| **UI Pack** | https://kenney.nl/assets/ui-pack | All game UIs, buttons, panels |
| **Platformer Kit** | https://kenney.nl/assets/platformer-kit | 2D characters, items |
| **Nature Kit** | https://kenney.nl/assets/nature-kit | Backgrounds, environments |

### For Specific Games

| Game | Recommended Packs |
|------|-------------------|
| **Math Monsters** | Monster Kit, Food Kit |
| **Yoga Animals** | Animal Kit, Nature Kit |
| **Space Games** | Space Kit, Sci-Fi Kit |
| **Adventure Games** | Dungeon Kit, RPG Kit |

---

## 📋 Available Asset Packs (Selection)

### UI & Interface
- [UI Pack](https://kenney.nl/assets/ui-pack) - 430+ elements ⭐ PRIORITY
- [UI Space Pack](https://kenney.nl/assets/ui-space-pack)
- [UI RPG Pack](https://kenney.nl/assets/ui-rpg-pack)

### Characters & Creatures
- [Platformer Kit](https://kenney.nl/assets/platformer-kit) ⭐ PRIORITY
- [Monster Kit](https://kenney.nl/assets/monster-kit)
- [Animal Kit](https://kenney.nl/assets/animal-kit)
- [RPG Characters](https://kenney.nl/assets/rpg-characters)

### Environment & Props
- [Nature Kit](https://kenney.nl/assets/nature-kit) ⭐ PRIORITY
- [Space Kit](https://kenney.nl/assets/space-kit)
- [Dungeon Kit](https://kenney.nl/assets/dungeon-kit)
- [Medieval Village Kit](https://kenney.nl/assets/medieval-village)

### Items & Objects
- [Food Kit](https://kenney.nl/assets/food-kit)
- [Furniture Kit](https://kenney.nl/assets/furniture-kit)
- [Vehicle Kit](https://kenney.nl/assets/car-kit)

### Full Game Kits
- [Pirate Kit](https://kenney.nl/assets/pirate-kit)
- [Sci-Fi Kit](https://kenney.nl/assets/sci-fi-kit)
- [RPG Kit](https://kenney.nl/assets/rpg-kit)

**Full list:** https://kenney.nl/assets

---

## 📊 Asset Pack Sizes

| Pack | Size (Approx) | Contents |
|------|---------------|----------|
| **UI Pack** | ~1.1 MB | 430+ UI elements ⭐ |
| **Platformer Kit** | ~5-10 MB | Characters, tiles, items |
| **Nature Kit** | ~15-20 MB | Trees, rocks, grass |
| **Space Kit** | ~10-15 MB | Rockets, planets, sci-fi |
| **Dungeon Kit** | ~10-15 MB | Walls, floors, doors |
| **Monster Kit** | ~5-10 MB | Enemy characters |
| **Food Kit** | ~2-5 MB | Food items |
| **Animal Kit** | ~5-10 MB | Animals, pets |
| **RPG Kit** | ~10-15 MB | Characters, weapons |

**Total (Essential Packs):** ~50-75 MB

**All-in-1 Bundle:** ~2-3 GB (60,000+ assets)

---

## ⚙️ Setup Script

After downloading, run this to organize assets:

```bash
# Extract all zips (if not already extracted)
cd assets/kenney
for zip in *.zip; do
    folder="${zip%.zip}"
    mkdir -p "$folder"
    unzip -q "$zip" -d "$folder"
    rm "$zip"
done

echo "Assets organized!"
```

---

## 🚀 Usage in Project

### 1. Import Assets

When you want to use an asset in the project, copy it from here to the appropriate location:

```bash
# Example: Copy a UI button to the project
cp assets/kenney/ui-pack/PNG/green_button.png src/frontend/public/assets/ui/
```

### 2. Track in Git

Only commit assets that are actually used:

```bash
# Add specific assets to git (NOT the whole kenney folder)
git add src/frontend/public/assets/ui/green_button.png
git commit -m "Add Kenney UI button asset"
```

### 3. Reference in Code

```typescript
// Use in React component
<img src="/assets/ui/green_button.png" alt="Start" />
```

---

## 📊 Asset Stats (All-in-1 Bundle)

| Category | Count | Formats |
|----------|-------|---------|
| 3D Models | 3,000+ | OBJ, FBX, glTF |
| 2D Sprites | 20,000+ | PNG, SVG |
| UI Elements | 430+ | PNG |
| Audio | 1,200+ | WAV, OGG |
| Fonts | 20+ | TTF |
| **Total** | **60,000+** | ~2-3 GB |

### Individual Packs (Free)
All packs listed above are also available **individually for free** at https://kenney.nl/assets

---

## ⚠️ Important Notes

1. **GitIgnore:** The entire `assets/kenney/` folder is in `.gitignore` - assets must be manually copied to `src/frontend/public/assets/` to be tracked

2. **License:** All Kenney assets are CC0 (Public Domain) - free for commercial use, no attribution required

3. **Consistency:** All assets share the same art style - mix and match freely

4. **Updates:** New packs released regularly - check https://kenney.nl/assets for updates

---

## 🔗 Links

- **Main Site:** https://kenney.nl
- **Assets Page:** https://kenney.nl/assets
- **Twitter:** https://twitter.com/kenneynl
- **Support:** Consider donating at https://kenney.nl/donate

---

**Last Updated:** 2026-02-24  
**Document Version:** 1.0
