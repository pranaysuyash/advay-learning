# Global Scale & Pricing Deep Dive

**Date:** 2026-02-21
**Purpose:** Explaining the mechanics of global serverless scaling across timezones and providing a highly granular pricing breakdown for the Advay Vision platform.

---

## 1. The "2 AM Spin Down" at Global Scale
You asked a brilliant question: *If the app is global, someone is always awake. How does it ever spin down to zero?*

If you use a traditional monolithic server (e.g., one big AWS EC2 instance), it *wouldn't*. It would stay awake 24/7. But in a modern **Serverless Edge Architecture** like Google Cloud Run or Cloudflare Workers, compute is **Regional**.

### How Regional Serverless Works:
Cloud providers divide the world into regions (e.g., `asia-south1` for Mumbai, `us-east4` for New York, `europe-west1` for London). 

1.  **Distributed Instances**: When you deploy your backend, the code is distributed to all regions globally, but *instances are not kept "hot" unless there is traffic in that specific region.*
2.  **The India Midnight**: At 2:00 AM IST, the 50 instances running in the `asia-south1` (Mumbai) region spin down to 0 because no Indian kids are playing. You pay exactly $0.00 for the Indian region.
3.  **The US Afternoon**: Meanwhile, it is 4:30 PM in New York. Kids get home from school and open the app. The `us-east4` region instantly spins up 20 instances to handle the traffic. 
4.  **The Result**: You are only paying for the 20 instances in New York. The Mumbai instances are completely "cold" and cost nothing. 

This means you never pay for idle capacity anywhere in the world. You only pay for the exact millisecond a function is executed, in the exact region physical humans are located.

---

## 2. Granular Pricing Breakdown (The Stack)

Let's look at the exact pricing of the Serverless Stack we outlined in `ARCHITECTURE_DEPLOYMENT_SCALE.md`. Because we offload all heavy video/AI processing to the client's browser (WASM) and WebRTC, our backend ONLY handles tiny text JSON payloads (login auth, saving XP, fetching high scores).

### A. Frontend CDN & Media Delivery (Vercel or Cloudflare Pages)
*   **What it does:** Serves the React app, MediaPipe WASM models, and images.
*   **Pricing:** 
    *   **Cloudflare Pages:** Unbelievably, it is effectively $0. They offer Unlimited bandwidth and Unlimited requests for static assets.
    *   **Vercel:** Free tier allows 100GB bandwidth/month. Pro plan is $20/month for 1TB bandwidth.
*   **Our Cost Estimate:** $0 - $20 / month.

### B. Serverless Backend Compute (Google Cloud Run)
*   **What it does:** Runs your FastAPI Python code to save user progress and authenticate accounts.
*   **Pricing:** You pay per vCPU second and GB second, *only* during the lifecycle of a request (usually < 200 milliseconds).
*   **Free Tier:** First 2 million requests, 360,000 GB-seconds, and 180,000 vCPU-seconds per month are **100% FREE**.
*   **Our Cost Estimate:** Unless a user is making dozens of API calls per second (which a tracing game doesn't do), 10,000 kids playing daily will likely still fit within the Free Tier, or cost under $5/month.

### C. Serverless Database (Neon Postgres)
*   **What it does:** Relational DB storing user accounts, XP, and parent settings. Scales compute to zero when idle.
*   **Pricing:** 
    *   **Free Tier:** 0.5 GB storage, 1 project, shared compute. Good for testing.
    *   **Launch Plan ($19/mo):** 10 GB storage, 300 hours of dedicated compute (scales to zero).
    *   **Scale Plan ($69/mo):** 50 GB storage, 750 hours of compute.
*   **Our Cost Estimate:** We start at $0, move to $19/mo once we launch to real users, and $69/mo at immense scale.

### D. Multiplayer Signaling Server (Pusher or Custom WebSockets)
*   **What it does:** For "Grandparent Storytime", it connects the two iPads so they can begin a direct P2P WebRTC video stream.
*   **Pricing:** 
    *   **Pusher (Managed):** Free for 200,000 messages/day. $29/mo for 1 million messages/day.
    *   **Custom (Railway/Render):** You can run a tiny Node.js websocket server for exactly $5/month flat.
*   **Our Cost Estimate:** $5 - $29 / month.

---

## 3. Projected Monthly Run Rate by User Tier

Assuming a highly optimized codebase where saving progress happens once every few minutes (not every second):

### Tier 1: The Beta (1,000 Monthly Active Users)
*   **Vercel/Cloudflare (CDN)**: $0 
*   **Google Cloud Run (API)**: $0 (Well within 2 million free requests)
*   **Neon DB**: $19 (Launch Tier for reliability)
*   **WebRTC Signaling**: $5 (Tiny custom WebSocket server)
*   **Total Monthly Infrastructure Cost: \~$24.00**

### Tier 2: The Traction (10,000 Monthly Active Users)
*   **Vercel/Cloudflare (CDN)**: $20 (Vercel Pro to handle higher bandwidth of WASM files)
*   **Google Cloud Run (API)**: ~$5 - $10 (Slightly exceeding free tier)
*   **Neon DB**: $69 (Scale Tier to handle concurrent evening spikes)
*   **WebRTC Signaling**: $29 (Managed Pusher for reliability)
*   **Total Monthly Infrastructure Cost: \~$128.00**

### Tier 3: The Scale (100,000 Monthly Active Users)
*   **Vercel/Cloudflare (CDN)**: ~$50 - $100 (Bandwidth overages or Custom Enterprise caching)
*   **Google Cloud Run (API)**: ~$80 - $150 (Millions of requests per day)
*   **Neon DB / Dedicated Cloud SQL**: ~$200 - $400 (Highly available, multi-region read replicas)
*   **WebRTC Signaling**: ~$100 (Scaled websocket cluster)
*   **Total Monthly Infrastructure Cost: \~$500 - $750** *(For 100,000 active trial/paid users, an infrastructure cost of $750/mo is exceptionally low. Even assuming a highly conservative 5% conversion rate from a free trial to a blended $3/mo global+India subscription, the platform grosses $15,000/mo in revenue).*

---

## 4. Why This Architecture Defies Standard EdTech Costs
If we hosted this the "traditional" way (e.g., sending the video feed to AWS to process the hand tracking via Python):
*   Processing 30 FPS video for 10,000 concurrent users requires hundreds of massive GPU instances. 
*   AWS bandwidth costs ($0.09 per GB) for raw video streaming would run **$10,000 to $30,000+ per month**. 

Because MediaPipe runs **on the child's iPad processor (WASM)**, Apple/Google is paying the compute cost (via the device battery), not you. You are only paying to store their high score. This flips the unit economics of AI education from "Unprofitable" to "Highly Lucrative."
