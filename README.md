# Writespace

A full-stack social writing app — share posts, follow users, like, save, and comment.

**Stack:** React · Vite · Tailwind · Node.js · Express · MongoDB · Cloudinary

**Live demo:** _(add your Vercel URL after deploy)_  
**Portfolio:** [ayushkoli.vercel.app](https://ayushkoli.vercel.app/) · **GitHub:** [github.com/ayushkoli](https://github.com/ayushkoli)

---

## Local development

### 1. MongoDB Atlas (free)

1. Create a cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas) (M0 free tier).
2. Database Access → create a user with password.
3. Network Access → add your IP (or `0.0.0.0/0` for development).
4. Connect → Drivers → copy the connection string.

### 2. Cloudinary (free)

1. Sign up at [cloudinary.com](https://cloudinary.com).
2. Dashboard → copy **Cloud name**, **API Key**, **API Secret**.
3. Upload a default avatar image and copy its URL for `DEFAULTPHOTO`.

### 3. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your values
npm install
npm run dev
```

Server runs on **http://localhost:3000** (or whatever `PORT` is in `backend/.env` — frontend proxy must match)

### 4. Frontend

```bash
cd frontend
npm install
npm run dev
```

App runs on **http://localhost:5173** (API proxied to backend).

---

## Deploy (recommended: Vercel + Render)

This setup stays on **free tiers** and keeps auth cookies working via Vercel API rewrites.

| Part | Host | Free tier |
|------|------|-----------|
| Frontend | [Vercel](https://vercel.com) | Hobby |
| Backend | [Render](https://render.com) | Web service (sleeps when idle) |
| Database | MongoDB Atlas M0 | 512 MB |
| Images | Cloudinary | 25 credits/month |

---

### Step 1 — Push code to GitHub

```bash
git init
git add .
git commit -m "Prepare Writespace for deploy"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git push -u origin main
```

---

### Step 2 — Deploy backend on Render

1. Go to [render.com](https://render.com) → **New → Web Service**.
2. Connect your GitHub repo.
3. Settings:
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance type:** Free
4. **Environment variables** (Environment tab):

   | Key | Value |
   |-----|--------|
   | `NODE_ENV` | `production` |
   | `MONGODB_URL` | Your Atlas connection string (no trailing slash) |
   | `ACCESS_TOKEN_SECRET` | Long random string (32+ chars) |
   | `REFRESH_TOKEN_SECRET` | Different long random string |
   | `ACCESS_TOKEN_EXPIRY` | `1d` |
   | `REFRESH_TOKEN_EXPIRY` | `10d` |
   | `CORS_ORIGIN` | Your Vercel URL (set after Step 3, e.g. `https://writespace.vercel.app`) |
   | `CLOUDINARY_CLOUD_NAME` | From Cloudinary |
   | `CLOUDINARY_API_KEY` | From Cloudinary |
   | `CLOUDINARY_API_SECRET` | From Cloudinary |
   | `DEFAULTPHOTO` | Default avatar URL on Cloudinary |

5. Click **Create Web Service** and wait for deploy.
6. Copy your backend URL, e.g. `https://writespace-api.onrender.com`

> **Note:** Free Render services sleep after ~15 minutes idle. The first request after sleep takes 30–60 seconds.

---

### Step 3 — Deploy frontend on Vercel

1. Open `frontend/vercel.json` and replace the placeholder:

   ```json
   "destination": "https://YOUR-RENDER-URL.onrender.com/api/:path*"
   ```

   Example: `https://writespace-api.onrender.com/api/:path*`

2. Go to [vercel.com](https://vercel.com) → **Add New → Project** → import your repo.
3. Settings:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Deploy. Copy your Vercel URL, e.g. `https://writespace.vercel.app`

---

### Step 4 — Finish CORS on Render

1. Render dashboard → your backend → **Environment**.
2. Set `CORS_ORIGIN` to your exact Vercel URL (no trailing slash):
   ```
   https://writespace.vercel.app
   ```
3. Save — Render will redeploy automatically.

---

### Step 5 — Test the live app

1. Open your Vercel URL.
2. Register a new account (skip profile photo to save Cloudinary credits).
3. Create a text post.
4. Refresh the page — you should stay logged in.
5. Click the logo → About page with your links.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| Login works locally but not on Vercel | Check `CORS_ORIGIN` matches Vercel URL exactly; `vercel.json` backend URL is correct |
| API returns 404 on Vercel | Rewrite destination must include `/api/:path*` |
| First request very slow | Render free tier waking up — normal |
| Image upload fails | Check Cloudinary env vars; ensure `public/temp` exists (created on server start) |
| Cookies not saved | Backend must have `NODE_ENV=production` on Render |

---

## Project structure

```
Twitter/
├── backend/          Express API
│   └── src/
├── frontend/         React app
│   └── src/
└── README.md
```

---

## Author

**Ayush Koli**  
[Portfolio](https://ayushkoli.vercel.app/) · [GitHub](https://github.com/ayushkoli)
