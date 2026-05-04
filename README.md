# Ramadan Tracker 1447

A shared Ramadan tracker for Yusra and Zaminah. The app tracks daily zikr, Quran reading, surahs recited, surahs memorized, and Names of Allah learned. Data syncs live through Firebase Realtime Database.

Live site: https://yrasool.github.io/ramadan-tracker/

## CIS 4930 Cumulative Project

This repository has been extended into a small DevOps workflow project using:

| Tool | Role |
|---|---|
| GitHub | Source control, contribution history, and GitHub Pages deployment |
| Jenkins | Required automation pipeline |
| Docker | Reproducible container image for the built app |
| Nginx | Static production server inside the Docker image |
| Firebase | Realtime database for tracker data |
| GitHub Actions | Existing production deployment to GitHub Pages |

The Jenkins pipeline does real automation: it checks out the repo, installs dependencies, verifies required build configuration, builds the Vite app, builds a Docker image, runs the container, smoke-tests the running site, archives the static build, and cleans up the test container.

## Architecture

See [docs/architecture.md](docs/architecture.md) for the workflow diagram and tool responsibilities.

Short version:

1. Developers push code to GitHub.
2. Jenkins checks out the repository.
3. Jenkins runs `npm ci`, configuration checks, and `npm run build`.
4. Jenkins builds a Docker image with Nginx serving the Vite output.
5. Jenkins runs the container and verifies the app is reachable at `http://localhost:8080/ramadan-tracker/`.
6. GitHub Actions can still deploy the same app to GitHub Pages.
7. The browser app talks directly to Firebase Realtime Database.

## Required Environment Variables

The app needs these Vite variables at build time:

```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Do not commit real values. Use `.env.local` for local development, GitHub repository secrets for GitHub Actions, and Jenkins credentials/environment variables for Jenkins.

## Local Development

```bash
npm install
npm run dev
```

The Vite dev server opens at `http://localhost:5173`.

## Verify And Build

```bash
npm ci
npm run check
npm run build
npm run smoke
```

`npm run check` confirms the Firebase build variables are present. `npm run smoke` confirms the built static output exists and uses the expected GitHub Pages base path.

## Docker Demo

Create `.env` with real Firebase values or export the required variables in your shell, then run:

```bash
docker compose up --build
```

If you prefer `.env.local`, pass it explicitly:

```bash
docker compose --env-file .env.local up --build
```

Open:

```text
http://localhost:8080/ramadan-tracker/
```

Stop the container:

```bash
docker compose down
```

## Jenkins Setup

The repository ships a custom Jenkins image (`jenkins/Dockerfile`) that bundles **Node.js 20** and the **Docker CLI** so the pipeline works inside a Jenkins-in-Docker environment without any extra manual setup.

### 1 — Build the custom Jenkins image

Open a terminal (PowerShell on Windows) in the repository root and run:

```powershell
docker build -t jenkins-node-docker ./jenkins
```

### 2 — Start Jenkins

**PowerShell** (use backtick `` ` `` for line continuation):

```powershell
docker run -d --name jenkins `
  -p 8081:8080 -p 50000:50000 `
  -v jenkins_home:/var/jenkins_home `
  -v /var/run/docker.sock:/var/run/docker.sock `
  jenkins-node-docker
```

> Port `8081` is used here to avoid conflicts with other services on `8080`.
> The `-v /var/run/docker.sock:/var/run/docker.sock` mount gives Jenkins access to
> the host Docker daemon so it can run `docker build` and `docker run`.

Open Jenkins in your browser:

```text
http://localhost:8081
```

Because the image sets `JAVA_OPTS=-Djenkins.install.runSetupWizard=false` the
setup wizard is skipped. Log in with the initial admin password:

```powershell
docker exec jenkins cat /var/jenkins_home/secrets/initialAdminPassword
```

### 3 — Install required plugins

In **Manage Jenkins → Plugins → Available**, install:

- **Git** (usually pre-installed)
- **Pipeline** (usually pre-installed)

### 4 — Configure Firebase credentials

In **Manage Jenkins → System → Global properties → Environment variables**, add:

| Name | Value |
|---|---|
| `VITE_FIREBASE_API_KEY` | your Firebase API key |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | your Firebase sender ID |
| `VITE_FIREBASE_APP_ID` | your Firebase app ID |

### 5 — Create the Pipeline job

1. **New Item** → enter a name → select **Pipeline** → OK.
2. Under **Pipeline**, set **Definition** to `Pipeline script from SCM`.
3. Set **SCM** to `Git`, **Repository URL** to `https://github.com/yrasool/ramadan-tracker`.
4. Set **Script Path** to `Jenkinsfile`.
5. Save and click **Build Now**.

### Pipeline stages

| Stage | What it does |
|---|---|
| Checkout | Pulls the latest source from GitHub |
| Install | `npm ci` — reproducible dependency install |
| Verify | `npm run check` — confirms Firebase build variables are set |
| Build | `npm run build` and `npm run smoke` — produces `dist/` |
| Docker Build | Builds the Docker image with Vite build arguments |
| Run Container | Starts the image; app is reachable on port `8090` |
| Smoke Test | Curls the running container and checks for the React root element |
| Health Check | Checks that Nginx `/health` returns HTTP 200 |
| Archive Artifacts | Saves `dist/` in Jenkins for download |
| Cleanup | Removes the temporary container in the `post` block |

### Stop and remove Jenkins

```powershell
docker stop jenkins
docker rm jenkins
```

To also remove all Jenkins data:

```powershell
docker volume rm jenkins_home
```

## GitHub Pages Deployment

The existing `.github/workflows/deploy.yml` workflow deploys the app to GitHub Pages on pushes to `main`.

Required GitHub settings:

1. Repository Settings -> Pages -> Source: GitHub Actions.
2. Repository Settings -> Secrets and variables -> Actions:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`

## Project Deliverables

The class report and contribution materials are in `docs/`:

- [docs/project-report docs/project-report
- [docs/architecturedocs/architecture
- [docs/contribution-template.docs/contribution-template
- [docs/collaborationdocs/collaboration
- [docs/individual-contribution-yusradocs/individual-contribution-yusra
- [docs/individual-contribution-sanaandocs/individual-contribution-sanaan



## File Structure

```text
ramadan-tracker/
  .github/workflows/deploy.yml
  docs/
    architecture
    contribution-template
    project-report
  scripts/
    check-build-config.mjs
    smoke-dist.mjs
  src/
    App.jsx
    firebase.js
    main.jsx
  Dockerfile
  Jenkinsfile
  docker-compose.yml
  nginx.conf
  package.json
  vite.config.js
```
