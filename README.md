# AI Design Assistant

Generate complete design packages (text workstreams, visual mockups, and PDF exports) for apps, websites, products, and interiors by describing your concept and optionally uploading a reference image.

## Key capabilities

- **Multiphase design workflow:** The app streams a design process, identifies the three most important screens/rooms/views, and generates mockups or renderings for each concept.
- **Flexible inputs:** Describe any idea in the prompt area, drag-and-drop or click to upload an image/sketch/logo, and let the Google Gemini models use that as inspiration.
- **Presentation assistant:** A lightweight chatbot (the Presentation Assistant) riffs on the same prompt using `gemini-2.5-flash` to help you ideate slide content.
- **PDF delivery:** When the design package is ready, export the combined text and imagery into a downloadable PDF powered by `jsPDF` + the `NotoSansCJKjp` custom font bundle.
- **Responsive UI:** Styled with Tailwind (via CDN) and React 19, the interface shows loading states, errors, preview cards, and a floating chatbot toggle.

## How it works

- `services/geminiService.ts` is a streaming generator that:
  - Classifies the prompt (app, website, interior, industrial, other) using `gemini-2.5-flash`.
  - Generates the design process text with `gemini-2.5-pro` (Markdown output).
  - Identifies the top three screens/rooms/views in parallel.
  - Encourages prompts destined for the drawing/image-generation flow to already be written in English (the service can still translate non-English drafts as a fallback, but English prompts avoid extra language hops); compresses uploaded images (`browser-image-compression`) and dispatches `gemini-2.5-flash-image` requests (with a sequential pipeline for industrial/product design variations).
  - Emits `ResultItem` texts/images that `ResultsDisplay` renders with a lightweight Markdown parser.
- `services/pdfService.ts` consumes the streamed results, measures image dimensions, handles headers/lists, and uses `jsPDF` (global `jspdf` object + CJK font) to produce a polished design package PDF.
- `components/` hosts the UI: `InputForm` (brief + image upload), `ResultsDisplay`, `Chatbot`, spinner, and icons. `App.tsx` orchestrates the generation flow, error handling, and PDF export trigger.

## Project layout

- `App.tsx`: state machine for prompts, loading, errors, results, and modal toggles.
- `components/`: reusable display pieces (header, inputs, results, chatbot, icons).
- `services/`: API bindings for Gemini and PDF export.
- `types.ts`: shared `ResultItem` + `ChatMessage` definitions.
- `index.html`: loads Tailwind via CDN plus the global scripts for `browser-image-compression`, `jspdf`, and the `NotoSansCJKjp` font.
- `vite.config.ts`, `tsconfig.json`: standard Vite + TypeScript setup.

## Getting started

### Prerequisites

- Node.js 18+ (or the latest LTS) and npm 10+.
- A Google Gemini API key with access to the `gemini-2.5-pro`, `gemini-2.5-flash`, and `gemini-2.5-flash-image` models.

### Setup

1. Clone the repo and install dependencies:

   ```bash
   npm install
   ```

2. Set your Gemini API key so `services/geminiService.ts` can instantiate `GoogleGenAI`. Because the module reads `process.env.API_KEY`, export it before running (or add it to your shell profile):

   ```bash
   export API_KEY="your-real-gemini-key"
   npm run dev
   ```

   > NOTE: Vite does not automatically expose `process.env.*` values without a build plugin, so keep the env variable available whenever you run any npm script.

3. (Optional) Create `index.css` next to `index.html` if you want to override the base styles; `index.html` already links to `/index.css`.

### Development commands

- `npm run dev`: start Vite in dev mode (automatic hot reload).
- `npm run build`: bundle assets for production (`dist/` output).
- `npm run preview`: serve the production build locally for verification.

## Environment & runtime notes

- **Tailwind CSS** is pulled from the CDN in `index.html`, so you can use its utility classes without a PostCSS pipeline.
- **Global scripts**:
  - `browser-image-compression` exposes `imageCompression`, used when the user uploads an image.
  - `jspdf` exposes `jspdf.jsPDF`, and a custom font loader registers `NotoSansCJKjp-Regular`.
- **PDF exports** rely on `ResultItem` metadata (`type`, `content`, optional `alt`).
- **Chatbot** uses the same `GoogleGenAI` client but stays in `gemini-2.5-flash` with a system instruction for presentation help.

## Deployment tips

1. Ensure `API_KEY` is defined in your deployment environment before running `npm run build` / `npm run preview`.
2. Since the app relies on CDN-loaded globals, double-check your hosting service allows those script URLs (Tailwind + compression + jsPDF). If you need to bundle them, switch to npm packages and import them via ESM.
3. Customize prompts or add new styles by editing `services/geminiService.ts` (prompts, translation, style constants) and `components/`.

## Troubleshooting

- If the generator stalls, check the browser console for errors thrown by `generateDesignAssets` (it logs translation/compression/image failures).
- When `process.env.API_KEY` is missing, the build throws immediately—set the variable before running any command.
- For PDF issues, open the browser console to see logs from `pdfService`; it gracefully falls back to a text notice when images fail to load.
