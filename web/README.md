# Receipt Extractor: web frontend

The standalone frontend for the fine-tuned receipt extractor. It's a Vite + React +
TypeScript single-page app that calls the model API (`POST /extract`) and rolls the
results into a small spend dashboard. Deployed as static files; the API lives on a
Hugging Face Space.

## Local dev

```bash
npm install
cp .env.example .env.local   # points at the live HF Space by default
npm run dev                  # http://localhost:5173
```

`VITE_API_BASE` sets which backend the app calls. It defaults to the live Space, so
you can run the frontend locally against the real model with no extra setup. Point it
at `http://localhost:7860` to develop against a locally-served model instead.

## Deploy (Vercel)

The app is static, so any static host works; these steps are for Vercel.

```bash
npm i -g vercel      # once
vercel               # first run: link/create the project, accept the Vite defaults
vercel --prod        # promote to the production URL
```

- **Framework preset:** Vite (auto-detected). Build command `npm run build`, output `dist`.
- **Environment variable:** set `VITE_API_BASE` to the Space URL
  (`https://ouvrahul-receipt-extractor.hf.space`) in the Vercel dashboard.

Netlify is identical: build `npm run build`, publish `dist`, same env var.

## Notes

- The dashboard seeds with receipts the model already extracted, so the page is
  populated instantly. A live extraction appends to it; the run itself takes about
  2-3 minutes because the model is a 7B served on a free CPU Space.
- Cross-origin calls work because the API sends permissive CORS headers (it's a
  public, read-only demo endpoint with no auth).
