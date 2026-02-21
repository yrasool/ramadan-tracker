# 🌙 Ramadan Tracker 1447

A shared Ramadan tracker for Yusra & Zaminah — tracks daily zikr, Quran, surahs recited, surahs memorized, and Names of Allah learned. Live syncs between both users via Firebase.

Live site: **https://yrasool.github.io/ramadan-tracker/**

---

## 🏗 Architecture: GitHub Pages + Firebase

> **Short answer: the app is hosted on GitHub Pages. Firebase is only used as the database.**

| Role | Service | What it does |
|---|---|---|
| **Hosting** (website files) | **GitHub Pages** | Serves the built HTML/JS/CSS at `https://yrasool.github.io/ramadan-tracker/`. Deployed automatically by GitHub Actions on every push to `main`. |
| **Database** (tracker data) | **Firebase Realtime Database** | Stores and live-syncs daily tracker entries between Yusra and Zaminah. The browser talks directly to Firebase — no server needed. |

Firebase is **not** used for hosting. GitHub is **not** used for the database. They each do one job.

---

## 🚀 GitHub Pages Deployment

Deployment is handled automatically by the `.github/workflows/deploy.yml` GitHub Actions workflow. Every push to `main` triggers a build and deploys the `dist/` folder to GitHub Pages.

### How it works
1. The workflow checks out the code, installs dependencies with `npm ci`, and runs `npm run build` (Vite).
2. The built `dist/` folder is uploaded as a Pages artifact via `actions/upload-pages-artifact`.
3. The `actions/deploy-pages` action publishes the artifact to `https://yrasool.github.io/ramadan-tracker/`.
4. `vite.config.js` sets `base: '/ramadan-tracker/'` so all asset paths resolve correctly under the subpath.

### Required GitHub settings

**Enable GitHub Pages via GitHub Actions:**
1. Go to your repo → **Settings** → **Pages**
2. Under **Source**, select **GitHub Actions**
3. Save — the next push to `main` will deploy the site

**Add Firebase config as Repository Secrets:**

Four of the seven Firebase config values are already embedded in the code (they're public and tied to the project ID). You only need to add these three secrets — find them in **Firebase Console → Project settings → Your apps → Web app config**:

| Secret name | Where to find it |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase Console → Project settings → Your apps → Web app config |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | same |
| `VITE_FIREBASE_APP_ID` | same |

Go to **Settings → Secrets and variables → Actions → New repository secret** to add each one.

> **Note:** Firebase web config values are client-side credentials — intentionally public and visible in the browser. They do not grant admin access; access is controlled by Firebase Security Rules. The values already in the code (`databaseURL`, `projectId`, `authDomain`, `storageBucket`) are safe to commit.

### Firebase console setup

**Realtime Database:**
1. Go to [Firebase Console](https://console.firebase.google.com/project/ramadan-74897)
2. Left sidebar → **Build** → **Realtime Database** → **Create database** → **Start in test mode** → **Enable**

**Authorized domains (if using Firebase Authentication):**
1. Firebase Console → **Authentication** → **Settings** → **Authorized domains**
2. Add `yrasool.github.io` to the list so sign-in redirects work from the deployed site

---

## 🛠 Local Development
```bash
npm install
npm run dev
```
Opens at `http://localhost:5173`

Create a `.env.local` file in the project root with your Firebase config for local development:
```
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```
The other Firebase values (`databaseURL`, `projectId`, `authDomain`, `storageBucket`) are already hardcoded in `src/firebase.js`.

---

## 📁 File Structure
```
ramadan-tracker/
├── .github/workflows/
│   └── deploy.yml       # GitHub Actions: build & deploy to Pages
├── src/
│   ├── App.jsx          # Main app component
│   ├── firebase.js      # Firebase config (reads from env vars)
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── index.html
├── vite.config.js       # base: '/ramadan-tracker/' for GitHub Pages subpath
└── package.json
```

Ramadan Mubarak! 🤍
