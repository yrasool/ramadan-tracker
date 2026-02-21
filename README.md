# 🌙 Ramadan Tracker 1447

A shared Ramadan tracker for Yusra & Zaminah — tracks daily zikr, Quran, surahs recited, surahs memorized, and Names of Allah learned. Live syncs between both users via Firebase.

---

## 🚀 Deploy to GitHub Pages (Step-by-Step)

### Step 1 — Enable Firebase Realtime Database
1. Go to [Firebase Console](https://console.firebase.google.com/project/ramadan-74897)
2. Left sidebar → **Build** → **Realtime Database**
3. Click **Create database** → **Start in test mode** → **Enable**
4. Copy the database URL (looks like `https://ramadan-74897-default-rtdb.firebaseio.com`)
5. It's already in `src/firebase.js` — confirm it matches!

### Step 2 — Update vite.config.js with your GitHub username
Open `vite.config.js` and update the base:
```js
base: '/ramadan-tracker/',  // keep this as-is
```

### Step 3 — Update package.json homepage
Open `package.json` and add your GitHub username in the deploy script. Also add this line:
```json
"homepage": "https://YOUR_GITHUB_USERNAME.github.io/ramadan-tracker"
```

### Step 4 — Push to GitHub
```bash
# In your terminal, inside this folder:
git init
git add .
git commit -m "initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_GITHUB_USERNAME/ramadan-tracker.git
git push -u origin main
```

### Step 5 — Install dependencies & deploy
```bash
npm install
npm run deploy
```

### Step 6 — Enable GitHub Pages
1. Go to your repo on GitHub
2. Settings → Pages
3. Source: **Deploy from a branch**
4. Branch: **gh-pages** → **/ (root)** → Save

### Step 7 — Share with Zaminah!
Your site will be live at:
```
https://YOUR_GITHUB_USERNAME.github.io/ramadan-tracker
```
Send that link to Zaminah — she opens it, picks "Zaminah", and her data syncs live with yours! 🌙

---

## 🛠 Local Development
```bash
npm install
npm run dev
```
Opens at `http://localhost:5173`

---

## 📁 File Structure
```
ramadan-tracker/
├── src/
│   ├── App.jsx          # Main app component
│   ├── firebase.js      # Firebase config (already filled!)
│   ├── main.jsx         # Entry point
│   └── index.css        # Global styles
├── index.html
├── vite.config.js
└── package.json
```

Ramadan Mubarak! 🤍
