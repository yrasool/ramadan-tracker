# Individual Contribution Statement

## Student

Name: Yusra Rasool

GitHub username: `yrasool`

## Project Role

I implemented the DevOps workflow for the Ramadan Tracker cumulative project. My work connected the existing React/Vite/Firebase app to Jenkins, Docker, Nginx, GitHub, and GitHub Pages so the project can be built, containerized, run, tested, and demonstrated by the grader.

## Contributions

- Added the `Jenkinsfile` pipeline with checkout, install, verify, build, Docker build, container run, smoke test, artifact archive, and cleanup stages.
- Added Docker support with `Dockerfile`, `docker-compose.yml`, `.dockerignore`, and `nginx.conf`.
- Added verification scripts for Firebase build configuration and static build output.
- Updated the README with local setup, Docker setup, Jenkins setup, GitHub Pages notes, and demo instructions.
- Added project documentation, architecture diagram, report draft, and contribution evidence.

## Evidence

- Repository: `https://github.com/yrasool/ramadan-tracker`
- Implementation commit: `b1af493 Add Jenkins Docker cumulative project workflow`
- Feature branch: `cis4930-jenkins-docker-project`
- Key files: `Jenkinsfile`, `Dockerfile`, `docker-compose.yml`, `docs/project-report.md`, `docs/architecture.md`

## Jenkins Contribution

I created the Jenkins pipeline so Jenkins performs meaningful automation instead of only printing messages. The pipeline installs dependencies, validates required build variables, builds the Vite app, verifies static output, builds the Docker image, runs the image, smoke-tests the served app, archives build artifacts, and cleans up the temporary container.

## Other Tool Contribution

I added Docker and Nginx support so the final system can be run locally by the grader with Docker Compose. I also documented how Firebase and GitHub Pages fit into the workflow without committing secrets.

## Verification

The following commands were verified locally with placeholder Firebase build values:

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

## Reflection

This project helped me connect a frontend app to a realistic delivery workflow. Jenkins handled automated validation, Docker made the app reproducible, Nginx served the production build, GitHub preserved the contribution history, and Firebase remained the live data layer.
