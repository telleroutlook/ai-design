# Repository Guidelines

## Project Structure & Module Organization
- The SPA entry point is `index.tsx`/`App.tsx` and it wires together the `components/` UI blocks, the `services/` API helpers, and the shared types in `types.ts`.
- Keep UI-focused pieces inside `components/` (cards, chatbot, results) and place streaming or PDF logic under `services/` so side effects stay separate from render code.
- Static assets live near `index.html` (Tailwind CDN + global scripts). TypeScript configuration lives in `tsconfig.json`, and Vite stays in `vite.config.ts`.

## Build, Test, and Development Commands
- `npm run dev`: launches Vite with hot reload for iterative UI work.
- `npm run build`: compiles and bundles for production to `dist/`; run before merging UI changes to catch TypeScript/asset regressions.
- `npm run preview`: serves the production bundle locally so you can verify the generated PDF/export scripts behave as expected.

## Coding Style & Naming Conventions
- Follow TypeScript + React best practices: prefer function components/hooks, keep JSX declarative, and split logic into `services/` when not tied to rendering.
- Use two-space indentation (Vite default) and keep lines under ~100 characters for readability.
- Name components/ files in PascalCase (`ResultsDisplay.tsx`), keep helper functions/variables in camelCase, and keep domain models (`ResultItem`, `ChatMessage`) in `types.ts`.

## Prompt Language Expectations
- Prompts destined for the drawing/image-generation flow must be written entirely in English so the Gemini models see a single source language and we avoid translation side effects.
- If you need to clarify the prompt for non-English users, capture the localized draft elsewhere and only submit the English text to the app before triggering generation.

## Testing Guidelines
- There is no automated test suite yet; rely on `npm run dev` + manual walks through the UI to ensure prompts, uploads, and PDF exports behave.
- When you add tests, house them beside the code they cover or under a future `tests/` folder and name files to reflect the component or service (e.g., `geminiService.test.ts`).

## Commit & Pull Request Guidelines
- Keep commit messages short, imperative, and descriptive—`feat: add chatbot modal` or `fix: debounce upload handler` are preferred; mention the affected area if it helps reviewers.
- Open PRs with a clear summary, steps to reproduce any manual behavior (PDF export, chatbot prompt), and link any related issue or design doc. Attach screenshots when UI changes.

## Security & Configuration Tips
- `services/geminiService.ts` reads `process.env.API_KEY`, so export the Gemini API key before running scripts (`export API_KEY="your-key" npm run dev`).
- Tailwind, `browser-image-compression`, and `jspdf` load from CDN in `index.html`; document any host restrictions before deploying and keep `index.css` beside the HTML if you override defaults.
