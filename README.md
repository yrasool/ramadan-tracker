# Ramadan Tracker 1447

A shared Ramadan tracker for Yusra and Zaminah. The app tracks daily zikr, Quran reading, surahs recited, surahs memorized, and Names of Allah learned. Data syncs live through Firebase Realtime Database.

Live site: https://yrasool.github.io/ramadan-tracker/

## CIS 4930 Cumulative Project

This repository has been extended into a small DevOps workflow project using:

| Tool | Role |
|---|---|
| GitHub | Source control, collaboration evidence, and GitHub Pages deployment |
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

Create `.env.local`, copy `.env.example` to `.env`, or export the required variables in your shell, then run:

```bash
docker compose up --build
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

1. Install Jenkins on a machine that also has Node.js, npm, Docker, and Git.
2. Create a Jenkins Pipeline job that points to this GitHub repository.
3. Configure these Jenkins environment variables or credentials:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
4. Run the pipeline from the repository `Jenkinsfile`.
5. Capture screenshots of the successful stages and console output for the project report.

Pipeline stages:

- Checkout
- Install
- Verify
- Build
- Docker Build
- Run Container
- Smoke Test
- Archive Artifacts
- Cleanup

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

- [docs/project-report.md](docs/project-report.md)
- [docs/architecture.md](docs/architecture.md)
- [docs/contribution-template.md](docs/contribution-template.md)
- [docs/collaboration.md](docs/collaboration.md)
- [docs/individual-contribution-yusra.md](docs/individual-contribution-yusra.md)

Recommended screenshots for submission:

- GitHub repository with commits or pull request evidence.
- Jenkins stage view after a successful run.
- Jenkins console output showing Docker build and smoke test.
- Docker-served app at `http://localhost:8080/ramadan-tracker/`.
- GitHub Pages live app.

## File Structure

```text
ramadan-tracker/
  .github/workflows/deploy.yml
  docs/
    architecture.md
    contribution-template.md
    project-report.md
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
