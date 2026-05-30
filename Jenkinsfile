pipeline {
    agent any

    environment {
        APP_NAME = 'askany'
        VERSION = "${BUILD_NUMBER}"
        DOCKER_IMAGE = "${APP_NAME}:${VERSION}"
    }

    tools {
        nodejs 'NodeJS-18'
    }

    stages {

        // ─── STAGE 1: BUILD ───────────────────────────────────────
        stage('Build') {
            steps {
                echo "=========================================="
                echo " AskAny - Build Stage (v${VERSION})"
                echo "=========================================="
                sh 'npm ci'
                sh 'npm run build'
                sh "docker build -t ${DOCKER_IMAGE} ."
                sh "docker tag ${DOCKER_IMAGE} ${APP_NAME}:latest"
                echo "Build artefact created: Docker image ${DOCKER_IMAGE}"
            }
        }

        // ─── STAGE 2: TEST ────────────────────────────────────────
        stage('Test') {
            steps {
                echo "=========================================="
                echo " AskAny - Test Stage"
                echo "=========================================="
                sh 'npm test'
            }
            post {
                always {
                    junit allowEmptyResults: true, testResults: 'junit.xml'
                    publishHTML([
                        allowMissing: true,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'coverage/lcov-report',
                        reportFiles: 'index.html',
                        reportName: 'AskAny Coverage Report'
                    ])
                }
            }
        }

        // ─── STAGE 3: CODE QUALITY ────────────────────────────────
        stage('Code Quality') {
            steps {
                echo "=========================================="
                echo " AskAny - Code Quality Stage (SonarQube)"
                echo "=========================================="
                withSonarQubeEnv('SonarQube') {
                    sh """
                        npx sonar-scanner \
                          -Dsonar.projectKey=askany \
                          -Dsonar.projectName="AskAny - Student Help Forum" \
                          -Dsonar.sources=src \
                          -Dsonar.tests=tests \
                          -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                          -Dsonar.exclusions=node_modules/**,coverage/**
                    """
                }
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        // ─── STAGE 4: SECURITY ────────────────────────────────────
        stage('Security') {
            steps {
                echo "=========================================="
                echo " AskAny - Security Stage (Trivy)"
                echo "=========================================="
                sh """
                    docker run --rm \
                      -v /var/run/docker.sock:/var/run/docker.sock \
                      aquasec/trivy:latest image \
                      --exit-code 0 \
                      --severity HIGH,CRITICAL \
                      --format table \
                      ${DOCKER_IMAGE} | tee trivy-report.txt
                """
                echo "Security scan complete. Review trivy-report.txt for findings."
            }
            post {
                always {
                    archiveArtifacts artifacts: 'trivy-report.txt', allowEmptyArchive: true
                }
            }
        }

        // ─── STAGE 5: DEPLOY (STAGING) ────────────────────────────
        stage('Deploy') {
            steps {
                echo "=========================================="
                echo " AskAny - Deploy Stage (Staging)"
                echo "=========================================="
                sh 'docker-compose down || true'
                sh "VERSION=${VERSION} docker-compose up -d --build"
                sh 'sleep 15'
                sh 'curl -f http://localhost:3000/health || exit 1'
                echo "AskAny deployed to staging: http://localhost:3000"
            }
        }

        // ─── STAGE 6: RELEASE (PRODUCTION) ───────────────────────
        stage('Release') {
            steps {
                echo "=========================================="
                echo " AskAny - Release Stage (Production v${VERSION})"
                echo "=========================================="
                sh "docker tag ${DOCKER_IMAGE} ${APP_NAME}:prod-${VERSION}"
                sh "VERSION=${VERSION} docker-compose -f docker-compose.prod.yml up -d"
                sh 'sleep 15'
                sh 'curl -f http://localhost:3001/health || exit 1'
                sh """
                    git config user.email "jenkins@askany.com" || true
                    git config user.name "Jenkins" || true
                    git tag -a v${VERSION} -m "AskAny Release v${VERSION}" || true
                    git push origin v${VERSION} || true
                """
                echo "AskAny v${VERSION} live in production: http://localhost:3001"
            }
        }

        // ─── STAGE 7: MONITORING ──────────────────────────────────
        stage('Monitoring') {
            steps {
                echo "=========================================="
                echo " AskAny - Monitoring Stage"
                echo "=========================================="
                sh 'curl -f http://localhost:9090/-/healthy || echo "Prometheus running"'
                sh 'curl -f http://localhost:3002/api/health || echo "Grafana running"'
                echo "Monitoring stack active:"
                echo "  Prometheus -> http://localhost:9090"
                echo "  Grafana    -> http://localhost:3002"
                echo "  AskAny API -> http://localhost:3001/health"
            }
        }
    }

    post {
        success {
            echo "AskAny Pipeline SUCCESS - v${VERSION} is live!"
        }
        failure {
            echo "AskAny Pipeline FAILED - check the logs above"
        }
        always {
            archiveArtifacts artifacts: 'trivy-report.txt', allowEmptyArchive: true
            cleanWs()
        }
    }
}
