# 🌙 Ramadan Tracker 1447

A shared Ramadan tracker for Yusra & Zaminah — tracks daily zikr, Quran, surahs recited, surahs memorized, and Names of Allah learned. Live syncs between both users via Firebase.

Live site: **https://yrasool.github.io/ramadan-tracker/**

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

The Firebase config is read from environment variables at build time. Add each value as a [repository secret](https://docs.github.com/en/actions/security-guides/encrypted-secrets) in **Settings → Secrets and variables → Actions → New repository secret**:

| Secret name | Where to find it |
|---|---|
| `VITE_FIREBASE_API_KEY` | Firebase Console → Project settings → Your apps → Web app config |
| `VITE_FIREBASE_AUTH_DOMAIN` | same |
| `VITE_FIREBASE_DATABASE_URL` | Firebase Console → Realtime Database → Data tab |
| `VITE_FIREBASE_PROJECT_ID` | Firebase Console → Project settings |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase Console → Project settings → Your apps |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | same |
| `VITE_FIREBASE_APP_ID` | same |

> **Note:** Firebase web config values (apiKey, projectId, etc.) are client-side credentials — they are intentionally public and visible in the browser. They do not grant admin access to your project; access is controlled by Firebase Security Rules. Using GitHub Secrets here is optional but keeps the values out of your source code.

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
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_DATABASE_URL=https://your_project-default-rtdb.firebaseio.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

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
