import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Static SPA. Vercel/Netlify auto-detect this: build with `npm run build`,
// serve the `dist/` folder. The API it talks to is set via VITE_API_BASE.
export default defineConfig({
  plugins: [react()],
});
