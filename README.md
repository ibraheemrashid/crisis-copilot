# Crisis Copilot

AI-powered crisis response assistant. Built at Cursor Hackathon Kashmir 2026.

## Setup (5 minutes)

### 1. Install dependencies
```bash
npm install
```

### 2. Set up Convex
```bash
npx convex dev
```
Copy the `NEXT_PUBLIC_CONVEX_URL` it gives you.

### 3. Set environment variables
```bash
cp .env.local.example .env.local
# Fill in your keys
```

**Keys needed:**
- `GROQ_API_KEY` → [console.groq.com](https://console.groq.com) (free)
- `EXA_API_KEY` → your hackathon Exa credits
- `NEXT_PUBLIC_CONVEX_URL` → from `npx convex dev`

### 4. Run
```bash
# Terminal 1 — Next.js
npm run dev

# Terminal 2 — Convex sync
npx convex dev
```

Open [http://localhost:3000](http://localhost:3000)

## Sponsor tracks targeted
- **Convex** — session storage + recovery tracking loop (`convex/sessions.ts`)
- **Exa** — doctor finder powered by neural search (`app/api/doctors/route.ts`)
- **Cursor** — built with Cursor
- **v0 by Vercel** — deployed on Vercel

## Architecture
```
Landing page (Next.js)
  └── TriageTool component
        ├── Crisis type selector
        ├── Situation description
        ├── Adaptive follow-up questions
        ├── AI analysis (Groq llama-3.3-70b)
        └── ActionPlan component
              ├── Urgency banner (LOW/MODERATE/EMERGENCY)
              ├── Checkable action steps
              ├── Doctor finder (Exa search)
              └── Recovery loop (Convex session update)
```

## Deploy to Vercel
```bash
vercel deploy
```
Add env vars in Vercel dashboard.
