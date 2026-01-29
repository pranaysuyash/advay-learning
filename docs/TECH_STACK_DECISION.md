# Tech Stack Decision Guide

## The Choice

You need to decide between:

### Option A: Web-First (Browser) ⭐ Recommended
```
Frontend: Vite + React + TypeScript
Vision: MediaPipe @mediapipe/tasks-vision (WebAssembly)
Storage: IndexedDB
Build: Local-only, no server needed
```

**Pros:**
- Easiest for you to maintain (no Python environment)
- Advay just opens a browser
- Rich UI ecosystem
- Can package as desktop app later (Tauri)
- Easier to share with others

**Cons:**
- Browser camera permissions can be tricky
- Need to learn TypeScript/React if unfamiliar
- Slightly less CV control than Python

### Option C: Python Desktop (Not Chosen)
```
Language: Python 3.13+
UI: PyQt6
Vision: MediaPipe Python + OpenCV
Storage: PostgreSQL
Build: PyInstaller executable
```

**Pros:**
- Full control over CV pipeline
- Direct camera access (no browser permissions)
- Easier to add custom ML models later
- Python is familiar

**Cons:**
- Harder to distribute (Python environment)
- UI development slower
- Harder for non-technical parent to maintain

## My Recommendation

**Start with Web (Option A)** because:

1. **Your maintenance burden matters** - Web apps are easier to keep running
2. **Advay's experience** - Opens instantly in browser
3. **MediaPipe Web is excellent** - Google's official web support
4. **Future flexibility** - Can add Python tooling later for content generation

## If You Choose Web

I've prepared the web structure in `app/` directory with:
- Engine module for camera + tracking
- Games module for activities
- Storage module for IndexedDB
- Proper TypeScript setup

## If You Choose Python

The existing Python structure in `src/` is ready with:
- Hand tracking module
- Face tracking module
- PyQt6 UI scaffold
- SQLite storage

## Next Step

**Tell me which option you prefer**, and I'll:

1. Set up the complete project for that stack
2. Create the initial MVP (camera + hand tracking + basic drawing)
3. Write the first feature spec
4. Get you to something Advay can use ASAP

## Questions to Help Decide

1. **Are you comfortable with TypeScript/React?** 
   - If yes → Web is great
   - If no → Python might be faster for you

2. **Is this primarily for Advay or do you want to share with others?**
   - Just Advay → Either works
   - Share with others → Web is easier

3. **Do you want to add custom ML models later?**
   - Yes, complex models → Python has advantage
   - No, MediaPipe is enough → Web is fine

4. **Browser vs Desktop app preference?**
   - Browser is fine → Web
   - Want a "real app" feeling → Python or Web+Tauri later

**What's your preference?**
