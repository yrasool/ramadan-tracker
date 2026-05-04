# Custom Jenkins image with Node.js 20 and Docker CLI pre-installed.
#
# This image is used for local development on Windows (Docker Desktop) or Linux.
# Mount the host Docker socket so the pipeline can build and run containers
# without a Docker daemon inside Jenkins itself.
#
# Build:
#   docker build -t jenkins-node-docker ./jenkins
#
# Run (PowerShell):
#   docker run -d --name jenkins `
#     -p 8081:8080 -p 50000:50000 `
#     -v jenkins_home:/var/jenkins_home `
#     -v /var/run/docker.sock:/var/run/docker.sock `
#     jenkins-node-docker

FROM jenkins/jenkins:lts-jdk17

USER root

# --- Docker CLI (official Docker apt repo, CLI package only) ---
RUN apt-get update -y && \
    apt-get install -y --no-install-recommends \
        ca-certificates \
        curl \
        gnupg && \
    install -m 0755 -d /etc/apt/keyrings && \
    curl -fsSL https://download.docker.com/linux/debian/gpg \
        -o /etc/apt/keyrings/docker.asc && \
    chmod a+r /etc/apt/keyrings/docker.asc && \
    echo \
        "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] \
        https://download.docker.com/linux/debian \
        $(. /etc/os-release && echo "$VERSION_CODENAME") stable" \
        | tee /etc/apt/sources.list.d/docker.list > /dev/null && \
    apt-get update -y && \
    apt-get install -y --no-install-recommends docker-ce-cli && \
    apt-get clean -y && \
    rm -rf /var/lib/apt/lists/*

# --- Node.js 20 (official tarball — avoids piping an installer script to bash) ---
ARG NODE_VERSION=20.19.2
RUN curl -fsSL "https://nodejs.org/dist/v${NODE_VERSION}/node-v${NODE_VERSION}-linux-x64.tar.xz" \
        | tar -xJ --strip-components=1 -C /usr/local

# Allow the jenkins user to run docker via the mounted socket.
# On Docker Desktop (Windows/Mac) the socket is world-readable; on native
# Linux you may need to pass --group-add $(stat -c %g /var/run/docker.sock)
# to docker run instead.
RUN groupadd -f docker && usermod -aG docker jenkins

USER jenkins

# Skip the setup wizard for automated / classroom use.
# Remove this line if you want the full first-run wizard.
ENV JAVA_OPTS="-Djenkins.install.runSetupWizard=false"
