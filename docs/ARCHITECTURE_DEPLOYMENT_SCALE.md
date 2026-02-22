# Scalable Deployment Architecture: Low Cost, High Availability

**Date:** 2026-02-21
**Purpose:** Defining a deployment strategy for the Advay Vision platform that prioritizes $0 to low initial costs, instant scalability for media-heavy payloads, and low-latency infrastructure for future WebRTC / AI features.

---

## 1. The Core Challenge: Distributing "Heavy" AI to the Edge
Traditional SPAs just serve HTML, CSS, and JS logic. Advay Vision must serve:
*   **MediaPipe WASM Binaries**: ~4-8 MB per load.
*   **Machine Learning Models**: ~5-15 MB per task (Hands, Pose, FaceMesh).
*   **Audio Assets**: High-quality SFX and voiceovers.

If we serve these from a traditional backend (like Heroku or an EC2 instance), we will incur massive bandwidth costs, and users in remote areas will experience 10+ second load times before a game starts.

### The Solution: Aggressive Edge Caching
*   **Frontend & Media**: Deployed on **Vercel** or **Cloudflare Pages** (Free Tier).
*   **The Strategy**: The WASM binaries and AI models are placed in the `public/` directory and served directly via the Edge CDN. 
*   **Why it works**: Cloudflare/Vercel caches these static files instantly at nodes closest to the user (e.g., a node in Mumbai). The user downloads the 10MB AI model at local broadband speeds, bypassing our servers entirely.
*   **Cost**: $0. Bandwidth on these free tiers is extremely generous (100GB to Unlimited for static assets).

---

## 2. Backend Architecture: Serverless API First
We currently have a FastAPI backend. Running a dedicated VM 24/7 costs money (even when no kids are playing). 

### The Solution: Serverless Containers (Cloud Run or Neon)
*   **Compute**: Migrate the FastAPI backend to run as a **Serverless Container** (e.g., Google Cloud Run, AWS App Runner). 
*   **Database**: Use **Neon (Serverless Postgres)** or **Supabase**.
*   **Why it works**: The backend "scales to zero." At 2:00 AM when everyone is asleep, we pay exactly $0.00. When a classroom of 30 kids logs on at 9:00 AM, it spins up instantly to handle the traffic, then spins back down.
*   **Cost**: $0 for the first few thousand users (Cloud Run provides 2 million free requests/month).

---

## 3. Multiplayer & WebRTC (Deferred to Phase 4 / Post-Revenue)
*Note: As per product strategy, all multiplayer/remote features are deferred until the core single-player application has achieved scale and is generating sustainable revenue. The infrastructure below represents the future state.*

For our proposed "Grandparent Storytime" or "Hand Pong" games, we will eventually need real-time video/data streaming between devices. Doing this through our own server would bankrupt us in bandwidth costs.

### The Solution: Peer-to-Peer (P2P) WebRTC with Managed Signaling
*   **Architecture**: The video and game state (e.g., the position of the Pong ball) is transmitted *directly* from Child's iPad to Grandparent's laptop using the **WebRTC Data Channel** and **Video Channel**.
*   **Signaling Server**: We only need a lightweight WebSocket server (can run on Render/Railway for <$5/mo) or a managed service like **Pusher / Firebase Realtime DB** just to exchange the initial IP addresses (the "Handshake").
*   **Why it works**: Once the handshake is made, the heavy video data flows directly between the two users. Our central servers never touch the video stream, meaning 0 latency added by us, and 0 bandwidth cost for us.
*   **Cost**: Practically $0.

---

## 4. Automation & "Ease of Doing" (CI/CD)
To keep the engineering team small and agile, deployment must be invisible.

*   **GitHub Actions**: 
    1.  **PR Check**: Lints code, runs TypeScript compiler, verifies MediaPipe imports are correct.
    2.  **Preview Environments**: Every Pull Request automatically generates a unique Vercel URL. You can test a new game tracking logic on your phone without merging it.
    3.  **Production Deploy**: Pushing to `main` automatically builds the React app, pushes to Vercel global CDN, containerizes the FastAPI code, and deploys to Cloud Run.
*   **Effort**: Zero-touch deployments. A developer pushes code, and 3 minutes later it is globally available.

---

## 5. Security & Privacy at the Edge
Because we are processing children's faces and hands, security is paramount.

*   **100% Client-Side Vision**: MediaPipe runs entirely in the browser (WASM). No image frames are **ever** sent to a server. This instantly nullifies 90% of COPPA/GDPR risk.
*   **Telemetry Only**: The only data sent to the Serverless Backend is JSON metadata (`xpEarned=50`, `gameID=letter_trace`, `struggleIndex=0.2`).
*   **Database**: Neon/Supabase provides built-in Row Level Security (RLS) ensuring Parents can only query data matching their own `parent_id`.

---

## 🚀 Summary of the "Lean & Fast" Stack
By adopting this architecture, we achieve infinite scalability and sub-second load times while keeping our monthly burn rate as close to $0.00 as physically possible until we hit massive traction.

| Component | Technology Choice | Immediate Cost | Scaling Cost |
| :--- | :--- | :--- | :--- |
| **Frontend CDN** | Vercel / Cloudflare Pages | $0 | Low / Capped |
| **Backend API** | FastAPI on Google Cloud Run | $0 | Usage Based (Pennies) |
| **Database** | Neon Serverless Postgres | $0 | Usage Based |
| **WebRTC / Multiplayer** | P2P + Lightweight Signaling | $0 | Very Low |
| **AI Models** | Browser WASM + CDN | $0 | $0 |
