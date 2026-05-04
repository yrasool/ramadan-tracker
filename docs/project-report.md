# CIS 4930 Cumulative Project Report

## Project Overview

Ramadan Tracker is a small React/Vite web application for tracking daily Ramadan activities for two users. It records zikr, Quran reading, surahs recited, memorization, and Names of Allah learned. The app syncs entries through Firebase Realtime Database.

For the cumulative project, the repository was extended into a practical DevOps workflow using GitHub, Jenkins, Docker, Nginx, Firebase, and GitHub Pages.

Repository:

```text
https://github.com/yrasool/ramadan-tracker
```

Live site:

```text
https://yrasool.github.io/ramadan-tracker/
```

## Tools Used

| Tool | How it is used |
|---|---|
| GitHub | Source control, repository history, and contribution evidence |
| Jenkins | Required automation pipeline |
| Docker | Builds a reproducible runtime image |
| Nginx | Serves the production static app inside Docker |
| Firebase | Realtime database for tracker data |
| GitHub Actions | Deploys the app to GitHub Pages |

## Architecture

The application is a static React/Vite frontend. The frontend is served either by GitHub Pages or by Nginx inside a Docker container. The browser connects directly to Firebase Realtime Database for live data sync.

See [architecture.md](architecture.md) for the Mermaid architecture diagram.

## Jenkins Pipeline

The Jenkins pipeline is defined in `Jenkinsfile`.

Stages:

| Stage | Purpose |
|---|---|
| Checkout | Pulls the latest project source from GitHub |
| Install | Runs `npm ci` for reproducible dependency installation |
| Verify | Runs `npm run check` to confirm required Firebase build variables exist |
| Build | Runs `npm run build` and `npm run smoke` |
| Docker Build | Builds the Docker image with Vite build arguments |
| Run Container | Starts the built image on port `8080` |
| Smoke Test | Requests the running app and fails if it is not served |
| Health Check | Verifies the Nginx `/health` endpoint returns HTTP 200 |
| Archive Artifacts | Saves the built `dist/` output in Jenkins |
| Cleanup | Removes the temporary Docker container |

The pipeline also includes a 15-minute timeout, automatic build log rotation, and post-build handlers that capture Docker logs on failure and print a summary on success.

This satisfies the Jenkins requirement because Jenkins performs meaningful automation beyond printing messages. It validates configuration, builds real project code, packages it, runs it, and verifies the running system.

## Setup Steps

### Local Build

```bash
npm ci
npm run check
npm run build
npm run smoke
```

### Docker Run

Set the Firebase build variables:

```bash
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

Run:

```bash
docker compose up --build
```

Open:

```text
http://localhost:8080/ramadan-tracker/
```

### Jenkins

1. Build the custom Jenkins image (includes Node.js 20 and Docker CLI):

   ```powershell
   docker build -t jenkins-node-docker ./jenkins
   ```

2. Run Jenkins with the host Docker socket mounted (PowerShell backtick continuation):

   ```powershell
   docker run -d --name jenkins `
     -p 8081:8080 -p 50000:50000 `
     -v jenkins_home:/var/jenkins_home `
     -v /var/run/docker.sock:/var/run/docker.sock `
     jenkins-node-docker
   ```

3. Open `http://localhost:8081`, log in, and configure the three Firebase environment variables in **Manage Jenkins → System → Global properties → Environment variables**.
4. Create a Pipeline job pointing to `https://github.com/yrasool/ramadan-tracker` and run it from `Jenkinsfile`.
5. Confirm the `Smoke Test` and `Health Check` stages pass.

## Demonstration Plan

The final demo s

1. GitHub repository and commit history.
2. Jenkins successful stage view.
3. Jenkins console output for install, build, Docker build, and smoke test.
4. Docker-served app at `http://localhost:8080/ramadan-tracker/`.
5. GitHub Pages live app at `https://yrasool.github.io/ramadan-tracker/`.
6. Firebase-backed tracker interaction in the browser.

## Screenshots 

- [ ] GitHub repository main page.
- [ ] Commit history or pull request showing project work.
- [ ] Jenkins pipeline successful stage view.
- [ ] Jenkins console output with Docker build and smoke test.
- [x] Browser showing Docker-served app returning HTTP 200 locally.
- [ ] Browser showing GitHub Pages deployment.
- [ ] Firebase console or app interaction evidenc

## Collaboration Evidence

 contributed to Jenkins and at least one other tool:

| Student | Jenkins Contribution | Other Contributions |
|---|---|---|
| Yusra Rasool | Created the full Jenkins pipeline with all stages | Docker, Nginx, verification scripts, documentation, Firebase integration |
| Sanaan | Added pipeline timeout, log rotation, post-build handlers, and Health Check stage | Docker image labels, Nginx security headers, gzip compression, documentation |

Full evidence is in documents submitted on Canvas.

## Individual Contribution Statement

Use [contribution-template.md](contribution-template.md) for each student. The statement should explain exactly what the student did and include evidence such as commits, PRs, screenshots, logs, or documentation.

## Rubric Mapping

| Requirement | Evidence |
|---|---|
| Working GitHub repository | `https://github.com/yrasool/ramadan-tracker` |
| Jenkins implementation | `Jenkinsfile` with build, Docker, run, and smoke-test stages |
| At least three tools | GitHub, Jenkins, Docker, Nginx, Firebase, GitHub Pages |
| Working final system | `docker compose up --build` serves the app locally |
| Contribution evidence | GitHub commits/PRs and contribution template |
| Documentation and reproducibility | README, project report, architecture diagram, setup steps |

## Notes On Secrets

Firebase web configuration values are public client-side app settings, but the project still avoids committing real values. Jenkins and GitHub Actions should receive them through environment variables or secrets.
