# MELOMOTION AI – Universal AI Music Video Creator

> **Transform any song and photo into cinematic music videos with facial identity consistency, AI lip-sync, and beat-synchronized scene directing across all world languages.**

---

## 🌟 Key Features

### 1. 🎵 Upload Your Own Music (Universal Language Engine)
- Supports **MP3, WAV, and M4A** files.
- Accepts original recordings as well as AI-generated songs (Suno, Udio, etc.).
- **Automatic Language Detection**: Accurately recognizes Tagalog (Filipino), Spanish, Korean, Japanese, English, French, and all other languages.
- **Strict Non-Translation Guarantee**: Preserves original lyrics, native scripts, vocal rhythm, and pronunciation without forcing English translations.
- Preloaded with multilingual demo songs (OPM, Latin Trap, K-Pop, City Pop, Neo-Soul).

### 2. 📸 Upload Your Own Picture (Identity Consistency)
- Supports **JPG, PNG, and WEBP** portrait uploads.
- The uploaded person becomes the protagonist/star across all music video scenes.
- **Identity Lock Technology**: Preserves authentic facial bone structure, hairstyle, skin tone, and distinct features.
- Supports multi-angle reference photos for maximum consistency.

### 3. 🎬 12 Cinematic Music Video Styles
1. **Realistic Cinematic** – 35mm anamorphic film look & natural depth
2. **Hip-hop / Rap** – Gritty textures, low-key lighting & fisheye angles
3. **Pop Music Video** – Glossy high-fashion lighting & vibrant neon pastels
4. **R&B / Love Story** – Warm candlelight, rain reflections & intimate slow-mo
5. **Rock Music Video** – Stage smoke, strobe lighting & vintage grain
6. **K-pop Style** – High-concept visual choreography & pristine color palettes
7. **Anime Music Video** – Cel-shaded aesthetic, dusk horizons & celestial speedlines
8. **Fantasy Cinematic** – Mystical ruins, bioluminescent glow & epic atmospheres
9. **Emotional Storytelling** – Documentary realism & narrative close-ups
10. **Concert Performance** – 50,000-seat stadium lasers, crowd ocean & pyrotechnics
11. **Street Music Video** – Shinjuku & Brooklyn rain-soaked neon pavement
12. **Luxury Lifestyle** – Monaco penthouses, superyacht sunsets & golden hour vistas

### 4. 🎤 AI Lip-Sync & Dynamic Visuals
- Dynamic HTML5 Canvas rendering engine matching mouth movement shapes to vocal amplitude in real time.
- Beat-synchronized camera moves (dolly push, 360 orbits, bass punch shakes).
- Synchronized subtitles in original native language or selectable translated languages.

### 5. 📹 Multiformat Video Export
- **9:16** – TikTok, Facebook Reels, YouTube Shorts
- **16:9** – YouTube Official Music Videos
- **1:1** – Instagram & Social Media Feeds
- **Direct Video Export**: Built-in `MediaRecorder` + Web Audio mixer exporting `.webm` / `.mp4` video files directly in your browser.

### 6. 💎 Free Plan & Pro (PHP Plan) Architecture
| Feature | Free Tier (Libre) | Pro / Paid Tier (PHP Plan) |
|---|---|---|
| **Daily Takes** | 3 Takes bawat araw | Unlimited Generations (Fair Use) |
| **Max Video Length** | 5 minutes | Up to 10 - 15 minutes per video |
| **Watermark** | Subtle corner watermark | **HD / 4K, WALANG watermark** |
| **Queue Speed** | Standard queue | **Priority Fast Queue** |
| **Monetization** | Personal use only | **Commercial Use / Puwedeng gamitin pampatubo** |
| **Payment Options** | Always Free | **GCash (QR/Number), PayPal, Maya / Cards** |
| **Pricing** | ₱0 | ₱199/week · ₱499/month · ₱3,999/year |

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS v4, Lucide Icons, Canvas Confetti
- **Audio & Video Engine**: Web Audio API (Oscillators, AnalyserNode, AudioBuffer), HTML5 Canvas 2D, MediaStream Recording API
- **Backend**: Express (Node.js/tsx)
- **AI Core**: Google GenAI SDK (`@google/genai`) using Gemini 3.8 Flash (`gemini-3.8-flash`)

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or higher recommended)
- Gemini API Key from [Google AI Studio](https://aistudio.google.com/)

### 1. Clone the repository
```bash
git clone <your-github-repo-url>
cd melomotion-ai
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Add your Gemini API Key in `.env`:
```env
GEMINI_API_KEY="your_gemini_api_key_here"
PORT=3000
```

### 4. Run the Development Server
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

### 5. Build for Production
```bash
npm run build
npm start
```

---

## 🚀 Deploying to Vercel (with Custom Domain)

1. Log in to [vercel.com](https://vercel.com/) with your GitHub account.
2. Click **"Add New Project"** and select **`moody83977-oss/MUSIC-VIDEO`**.
3. Under **Environment Variables**, add:
   - `GEMINI_API_KEY`: *(Your Google AI Studio Gemini API Key)*
4. Click **"Deploy"**. Vercel will build and host your app in seconds!
5. **Add Your Custom Domain**:
   - Go to your project **Settings > Domains** in Vercel.
   - Enter your domain (e.g. `yourmusicvideo.com` or `melomotion.com`).
   - Add the simple DNS CNAME or A-record provided by Vercel in your domain registrar (GoDaddy, Namecheap, Cloudflare, etc.).

---

## 🔒 Privacy & Security

- **Zero Public Model Training**: User photos and original audio are strictly processed for private music video creation and are never used to train public face models.
- **One-Click File Deletion**: Instant client-side erase button to clear all session caches and uploaded files.

---

## 📄 License
Apache-2.0 License.
