# Project Structure Guidelines for Copilot

This project uses the **Next.js App Router** structure. Please follow these rules:

- All pages, components, and logic must be inside the `/app` directory.
- Do NOT use a `/src` folder. Do NOT place components or logic in `/src`.
- Place shared React components in `/app/components`.
- Place server actions and helpers in `/app` or `/app/utils`.
- Each route/page must be in its own folder under `/app` (e.g., `/app/streaming/page.tsx`).
- Do not mix legacy `/pages` or `/src/pages` structure with App Router.
- Always update imports after moving files.

**If you see a `/src` folder — remove it!**

_This README is for Copilot and all contributors to avoid structure mistakes in the future._
