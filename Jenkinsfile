pipeline {
  agent any

  environment {
    IMAGE_NAME = 'ramadan-tracker:jenkins'
    CONTAINER_NAME = 'ramadan-tracker-jenkins'
    APP_PORT = '8090'
    APP_URL = 'http://localhost:8090/ramadan-tracker/'
  }

  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Install') {
      steps {
        sh 'npm ci'
      }
    }

    stage('Verify') {
      steps {
        sh 'npm run check'
      }
    }

    stage('Build') {
      steps {
        sh 'npm run build'
        sh 'npm run smoke'
      }
    }

    stage('Docker Build') {
      steps {
        sh '''
          docker build \
            --build-arg VITE_FIREBASE_API_KEY="$VITE_FIREBASE_API_KEY" \
            --build-arg VITE_FIREBASE_MESSAGING_SENDER_ID="$VITE_FIREBASE_MESSAGING_SENDER_ID" \
            --build-arg VITE_FIREBASE_APP_ID="$VITE_FIREBASE_APP_ID" \
            -t "$IMAGE_NAME" .
        '''
      }
    }

    stage('Run Container') {
      steps {
        sh '''
          docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true
          docker run -d --name "$CONTAINER_NAME" -p "$APP_PORT":80 "$IMAGE_NAME"
        '''
      }
    }

    stage('Smoke Test') {
      steps {
        sh '''
          for attempt in 1 2 3 4 5; do
            if curl -fsS "$APP_URL" | grep -q '<div id="root"></div>'; then
              echo "Application smoke test passed at $APP_URL"
              exit 0
            fi
            echo "Waiting for app to become available..."
            sleep 2
          done

          echo "Application smoke test failed."
          docker logs "$CONTAINER_NAME" || true
          exit 1
        '''
      }
    }

    stage('Archive Artifacts') {
      steps {
        archiveArtifacts artifacts: 'dist/**', fingerprint: true
      }
    }
  }

  post {
    always {
      sh 'docker rm -f "$CONTAINER_NAME" >/dev/null 2>&1 || true'
    }
  }
}
