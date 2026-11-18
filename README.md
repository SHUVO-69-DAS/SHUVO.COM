# SHUVO DAS — Portfolio Website (Production & Security Hardened)

Complete production-ready portfolio build with updated SEO services (`AEO & GEO`), `gemini-3.8-flash` serverless AI assistant (`ব্যক্তিগত কামলা` in Bangla / `Personal AI Assistant` in other languages), built-in Web Audio piano background synthesizer, and GitHub/Vercel security hardening.

## Project Structure
- `index.html` — Main entry point with strict Content Security Policy (CSP), preconnect hints, and audio unlock handler.
- `assets/index-DMVZa_Hg.js` — Production application bundle (updated with `AEO & GEO`).
- `assets/index-axDYoM6S.css` — Production stylesheet.
- `api/chat.js` — Serverless API route for Shuvo AI assistant using `gemini-3.8-flash` and server-side `GEMINI_API_KEY`.
- `vercel.json` — Production HTTP security headers (`HSTS`, `X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`).
- `.gitignore` — Prevents accidental commit of `.env` files or secret keys to GitHub.
- `.env.example` — Safe template showing required environment variables without exposing real keys.
- `.nojekyll` — Ensures clean static asset serving without Jekyll filtering.

## How to Push Safely to GitHub & Deploy on Vercel
1. **Never put your real API key in any file.** Keep `.env` out of GitHub (`.gitignore` already blocks `.env` files automatically).
2. Push all files in this folder to your GitHub repository (`main` branch).
3. Go to **Vercel Dashboard → Your Project → Settings → Environment Variables**.
4. Add a new variable:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** *(Paste your real Gemini API key here)*
5. Redeploy your project on Vercel so the serverless `/api/chat` route picks up `GEMINI_API_KEY` securely.
