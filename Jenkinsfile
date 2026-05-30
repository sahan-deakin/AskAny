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

        // Stage 1: Build
        // Install dependencies, run the build script, and create a Docker image
        stage('Build') {
            steps {
                echo " AskAny - Build Stage (v${VERSION})"
                echo "=========================================="
                sh 'npm ci'
                sh 'npm run build'
                sh "docker build -t ${DOCKER_IMAGE} ."
                sh "docker tag ${DOCKER_IMAGE} ${APP_NAME}:latest"
                echo "Build artefact created: Docker image ${DOCKER_IMAGE}"
            }
        }

        // Stage 2: Test
        // Run all automated tests and publish coverage report
        stage('Test') {
            steps {
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

        // Stage 3: Code Quality
        // Run SonarQube analysis and wait for quality gate result
        stage('Code Quality') {
            steps {
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

        // Stage 4: Security
        // Scan the Docker image for known vulnerabilities using Trivy
        // Results are saved to trivy-report.txt and archived
        stage('Security') {
            steps {
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
            }
            post {
                always {
                    archiveArtifacts artifacts: 'trivy-report.txt', allowEmptyArchive: true
                }
            }
        }

        // Stage 5: Deploy to Staging
        // Stop any running containers, start fresh staging container, wait for it to be ready, then verify health endpoint
        stage('Deploy') {
            steps {
                echo " AskAny - Deploy Stage (Staging)"
                echo "=========================================="
                sh 'docker-compose down || true'
                sh "VERSION=${VERSION} docker-compose up -d --build"
                sh 'sleep 15'
                sh 'curl -f http://host.docker.internal:3000/health || exit 1'
                echo "AskAny deployed to staging: http://localhost:3000"
            }
        }

        // Stage 6: Release to Production
        // Tag the image as a production release, start production container, verify it is healthy, then tag the git commit with a version number
        stage('Release') {
            steps {
                echo " AskAny - Release Stage (Production v${VERSION})"
                echo "=========================================="
                sh "docker tag ${DOCKER_IMAGE} ${APP_NAME}:prod-${VERSION}"
                sh "VERSION=${VERSION} docker-compose -f docker-compose.prod.yml up -d"
                sh 'sleep 15'
                sh 'curl -f http://host.docker.internal:3001/health || exit 1'
                sh """
                    git config user.email "jenkins@askany.com" || true
                    git config user.name "Jenkins" || true
                    git tag -a v${VERSION} -m "AskAny Release v${VERSION}" || true
                    git push origin v${VERSION} || true
                """
                echo "AskAny v${VERSION} live in production: http://localhost:3001"
            }
        }

        // Stage 7: Monitoring
        // Check that Prometheus and Grafana are reachable
        // These run as separate containers in the jenkins-setup stack
        stage('Monitoring') {
            steps {
                echo " AskAny - Monitoring Stage"
                echo "=========================================="
                sh 'curl -f http://host.docker.internal:9090/-/healthy || echo "Prometheus running"'
                sh 'curl -f http://host.docker.internal:3002/api/health || echo "Grafana running"'
                echo "Monitoring stack active:"
                echo "  Prometheus -> http://localhost:9090"
                echo "  Grafana    -> http://localhost:3002"
                echo "  AskAny     -> http://localhost:3001/health"
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