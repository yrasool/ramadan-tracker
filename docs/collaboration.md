# Collaboration Evidence

This document summarizes the collaboration evidence for the CIS 4930 cumulative project. Both team members contributed through commits, pull requests, and documentation.

## Repository Evidence

Repository:

```text
https://github.com/yrasool/ramadan-tracker
```

Feature branch:

```text
cis4930-jenkins-docker-project
```

## Team Members

| Name | GitHub Username |
|---|---|
| Yusra Rasool | `yrasool` |
| Sanaan | `sanaan` |

## Contribution Summary

| Area | Yusra | Sanaan |
|---|---|---|
| Jenkins | Created the full pipeline (checkout, install, verify, build, Docker build, run, smoke test, archive, cleanup) | Added pipeline timeout, build log rotation, and post-build failure/success handlers |
| Docker | Created `Dockerfile`, `docker-compose.yml`, `.dockerignore` | Added image metadata labels (maintainer, description, version) |
| Nginx | Created `nginx.conf` with routing and health check | Added security headers (X-Content-Type-Options, X-Frame-Options, Referrer-Policy) |
| Verification | Created `scripts/check-build-config.mjs` and `scripts/smoke-dist.mjs` | |
| Documentation | README, project report, architecture diagram | Updated collaboration evidence, project report, individual contribution statement |

## Key Commits

### Yusra

```text
b1af493 Add Jenkins Docker cumulative project workflow
215defe Add submission evidence docs and env loading
ac6848c Address final project review findings
```

### Sanaan

```text
7295c4a Add pipeline timeout, build log rotation, and post-build handlers
1c5f35e Add container metadata labels to Dockerfile
7b310bd Add security headers to Nginx configuration
```

## Pull Requests

- `sanaan/pipeline-hardening` into `cis4930-jenkins-docker-project` — pipeline hardening, Docker labels, Nginx security headers

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
