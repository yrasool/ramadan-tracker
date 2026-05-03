# Collaboration Evidence

This project currently documents the implementation work completed for the CIS 4930 cumulative project. If additional group members join later, they should add their own commits, screenshots, and completed contribution statements.

## Repository Evidence

Repository:

```text
https://github.com/yrasool/ramadan-tracker
```

Implementation commit:

```text
b1af493 Add Jenkins Docker cumulative project workflow
```

Feature branch preserved for review evidence:

```text
cis4930-jenkins-docker-project
```

## Implemented Work

| Area | Evidence |
|---|---|
| Jenkins | `Jenkinsfile` with checkout, install, verify, build, Docker build, container run, smoke test, artifact archive, and cleanup |
| Docker | `Dockerfile`, `docker-compose.yml`, `.dockerignore`, and `nginx.conf` |
| Verification | `scripts/check-build-config.mjs` and `scripts/smoke-dist.mjs` |
| Documentation | `README.md`, `docs/project-report.md`, `docs/architecture.md`, and this file |

## Local Verification Evidence

The following commands were run successfully during implementation with placeholder Firebase build values:

```bash
npm ci
npm run check
npm run build
npm run smoke
npm run ci
docker compose build
docker compose up -d
```

The Docker-served app returned HTTP 200 at:

```text
http://localhost:8080/ramadan-tracker/
```

## Screenshots To Capture Before Submission

- GitHub repository page.
- Git commit history showing `b1af493`.
- Jenkins successful stage view.
- Jenkins console output showing Docker build and smoke test.
- Docker Desktop showing the running `ramadan-tracker` container.
- Browser at `http://localhost:8080/ramadan-tracker/`.
- GitHub Pages live app.
