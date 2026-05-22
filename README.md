# ✒️ Writespace

A high-fidelity, distraction-free social writing platform designed for sharing posts, building followings, and engaging with creators. Built with a premium, responsive dark glassmorphism theme, secure authentication, and a robust Node.js/MongoDB backend.

**Live Demo:** [writespace-black.vercel.app](https://writespace-black.vercel.app)  
**Developer Portfolio:** [ayushkoli.vercel.app](https://ayushkoli.vercel.app/) · **GitHub:** [@ayushkoli](https://github.com/ayushkoli)

---

## ✨ Features

- **Premium Dark Glassmorphic Design:** Elegant UI featuring tinted translucent borders, high-density backdrop blur (`backdrop-blur-xl`), smooth hover states, and dynamic shadow glow halos tailored for different post types.
- **Rich Post Customization:** Support for dynamic grid layouts, custom background gradients, image uploads via Cloudinary, and titles.
- **Social Engagement Loop:**
  - Double-tap and button-triggered post likes.
  - Interactive reply threads on post detail views, featuring direct clickable profile navigation.
  - Profile following & unfollowing, complete with real-time follow count updates.
  - Persistent post saving / bookmarking.
- **Robust Security & JWT Authentication:** Full authentication lifecycle using access and refresh JSON Web Tokens (JWT) stored securely in `httpOnly` cookies, preventing XSS and CSRF attacks. Includes automated background token refreshing.
- **Mobile-First Responsiveness:** Strict typography scale optimization (`text-5xl` brand header on mobile), prevention of input auto-zoom on iOS/Android, and fluid layouts for all viewport sizes.
- **Production Grade Quality:** Built on React 19 and TypeScript, maintaining absolute rendering purity (zero `Date.now()` side effects in render flows) and zero compiler/ESLint warnings.

---

## 🛠️ Technology Stack

| Component | Technologies Used |
| :--- | :--- |
| **Frontend** | React 19 · Vite · TypeScript · Tailwind CSS · React Router 7 · Lucide Icons · Axios |
| **Backend** | Node.js · Express · MongoDB (Mongoose ORM) · Cloudinary API (Media storage) · Multer |
| **Hosting** | Vercel (Frontend + Proxy rules) · Render (Backend Web Service) · MongoDB Atlas (Cloud Database) |

---

## 📂 Project Structure

```text
Twitter/
├── backend/                  # Node.js + Express API
│   ├── docs/                 # Developer onboarding documentation
│   ├── public/               # Upload temporary files directory
│   └── src/                  # Controllers, models, routes, and middlewares
├── frontend/                 # React 19 SPA
│   ├── public/               # Static public assets
│   └── src/                  # App components, pages, contexts, styles, and hooks
└── README.md                 # Project summary and setup guide
```

> [!NOTE]
> Detailed developers documentation can be found in the [backend/docs](file:///c:/Users/Ayush/Downloads/practice/Twitter/backend/docs) directory:
> - [Routes & Controllers](file:///c:/Users/Ayush/Downloads/practice/Twitter/backend/docs/7-routesControllers.md) — Routing structure, controllers, API routing versioning, and URL mapping.
> - [Middlewares](file:///c:/Users/Ayush/Downloads/practice/Twitter/backend/docs/8-middlewares.md) — JWT protection middleware (`verifyJWT`), token extraction, and response helpers.
> - [User Management](file:///c:/Users/Ayush/Downloads/practice/Twitter/backend/docs/9-userControllers.md) — Auth state lifecycle, cookie security, and aggregation pipelines for profile counts.
> - [Post Controllers](file:///c:/Users/Ayush/Downloads/practice/Twitter/backend/docs/10-postControllers.md) — Post CRUD, chronological home/following feed querying, and comments as embedded documents.

---

## 🚀 Local Development Setup

Follow these steps to run the application locally on your machine.

### Prerequisites
- Node.js installed (v18+ recommended)
- A free account on [MongoDB Atlas](https://www.mongodb.com/atlas)
- A free account on [Cloudinary](https://cloudinary.com)

### 1. MongoDB Setup
1. Create a cluster at MongoDB Atlas (choose the M0 free tier).
2. Go to **Database Access** and create a user with a read-write password.
3. Go to **Network Access** and add your IP (or `0.0.0.0/0` to allow access from anywhere during development).
4. Go to **Database → Connect → Drivers** and copy your MongoDB connection string.

### 2. Cloudinary Setup
1. Log in to your Cloudinary dashboard.
2. Copy your **Cloud name**, **API Key**, and **API Secret**.
3. Upload a default profile placeholder image to your Cloudinary media library and copy its URL (this will serve as `DEFAULTPHOTO`).

### 3. Backend Configuration
Navigate to the backend directory, clone the template environment file, and fill in the values:

```bash
cd backend
cp .env.example .env
```

Your `.env` file should look like this:
```env
PORT=3000
MONGODB_URL=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/writespace
ACCESS_TOKEN_SECRET=your_super_secret_access_key_here
ACCESS_TOKEN_EXPIRY=1d
REFRESH_TOKEN_SECRET=your_super_secret_refresh_key_here
REFRESH_TOKEN_EXPIRY=10d
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
DEFAULTPHOTO=https://res.cloudinary.com/your_cloud/image/upload/v1/default_avatar.png
NODE_ENV=development
```

Now, install dependencies and start the backend development server:
```bash
npm install
npm run dev
```
The backend server runs at `http://localhost:3000`.

### 4. Frontend Configuration
Navigate to the frontend directory, install dependencies, and start the Vite dev server:

```bash
cd ../frontend
npm install
npm run dev
```
The application runs at `http://localhost:5173`. Frontend API calls are automatically proxied to port 3000.

---

## 🌐 Deployment (Render + Vercel)

This application is configured to run entirely on **free tiers** with active session storage. Since web browsers block third-party cookies by default, we configure Vercel rewrite rules to proxy API requests, presenting the frontend and backend under the same origin.

### Step 1 — Deploy the Backend on Render
1. Create a new **Web Service** on [Render](https://render.com) and link your GitHub repository.
2. Configure the following service settings:
   - **Root Directory:** `backend`
   - **Runtime:** Node
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance type:** Free
3. Add the following keys under the **Environment** tab:
   - `NODE_ENV` = `production`
   - `MONGODB_URL` = (Your MongoDB connection string)
   - `ACCESS_TOKEN_SECRET` = (Long random string)
   - `REFRESH_TOKEN_SECRET` = (Another long random string)
   - `ACCESS_TOKEN_EXPIRY` = `1d`
   - `REFRESH_TOKEN_EXPIRY` = `10d`
   - `CLOUDINARY_CLOUD_NAME` = (Your Cloudinary cloud name)
   - `CLOUDINARY_API_KEY` = (Your Cloudinary API key)
   - `CLOUDINARY_API_SECRET` = (Your Cloudinary API secret)
   - `DEFAULTPHOTO` = (Default profile placeholder URL)
   - `CORS_ORIGIN` = (Your upcoming Vercel deployment URL, e.g. `https://writespace.vercel.app`)
4. Trigger the deploy and copy the generated service URL (e.g., `https://writespace-api.onrender.com`).

> [!WARNING]
> Render free-tier instances spin down when inactive for 15 minutes. The initial request to wake the backend container can take between 30 to 60 seconds.

### Step 2 — Deploy the Frontend on Vercel
1. In the root of your frontend code, open `frontend/vercel.json` and replace the placeholder Render URL with your live service URL:
   ```json
   {
     "rewrites": [
       {
         "source": "/api/:path*",
         "destination": "https://YOUR-RENDER-URL.onrender.com/api/:path*"
       }
     ]
   }
   ```
2. Import your GitHub repository to [Vercel](https://vercel.com).
3. Configure the following project parameters:
   - **Root Directory:** `frontend`
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Deploy the project and copy your live URL.
5. Head back to your **Render Environment Settings** and update `CORS_ORIGIN` to match your Vercel URL exactly (no trailing slash). Render will redeploy automatically to apply the new CORS policy.

---

## 🛠️ Troubleshooting

| Issue | Potential Cause / Resolution |
| :--- | :--- |
| **Session resets on refresh** | Ensure your Render backend has `NODE_ENV` set to `production` so it secures cookies correctly. |
| **API requests return `404` on Vercel** | Confirm that `vercel.json` rewrite destinations point exactly to your Render API route, matching `/api/:path*`. |
| **Initial request is very slow** | Normal behavior due to Render's free tier instance spin-up delay. Subsequent actions will be fast. |
| **Image uploads fail** | Verify that your Cloudinary credentials are correct and that the `public/temp` directory exists in the backend root. |
| **Authentication fails with `CORS` errors** | Confirm that your `CORS_ORIGIN` environment variable on Render matches your Vercel project URL exactly, without a trailing slash. |

---

## ✍️ Author

Developed and maintained by **Ayush Koli**.  
Connect on [Portfolio](https://ayushkoli.vercel.app/) or follow updates on [GitHub](https://github.com/ayushkoli).
