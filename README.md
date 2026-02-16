# Travel App — Next.js AI Demo

This project demonstrates a modern Next.js App Router application with AI-powered features:

- **AI Chat (useChat):** Main page with a chat interface powered by Vercel AI SDK and OpenAI.
- **Streaming Completion:** Separate page showing real-time text generation using server actions and streaming.
- **App Router structure:** All logic and components live in the `/app` directory (no `/src`).
- **Reusable components:** Shared UI in `/app/components`.
- **Header navigation:** Persistent navigation between chat and streaming pages.

## Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

- `/app` — all routes, pages, and components
  - `/app/page.tsx` — main chat page (useChat)
  - `/app/streaming/page.tsx` — streaming completion demo
  - `/app/components/` — shared React components
  - `/app/layout.tsx` — root layout with header
- `.github/README_COPILOT_STRUCTURE.md` — Copilot/project structure guidelines

## Features

- Modern Next.js App Router (no legacy `/pages` or `/src`)
- AI chat and streaming text generation
- Clean, maintainable structure for scalable apps

## Notes

- Do not use `/src` or `/pages` folders.
- All project instructions for Copilot are in `.github/`.

---

_Built with Next.js, Vercel AI SDK, and OpenAI._
