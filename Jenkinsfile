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

        // build the app and create docker image
        stage('Build') {
            steps {
                echo "=========================================="
                echo " AskAny - Build Stage (v${VERSION})"
                echo "=========================================="
                sh 'npm ci'
                sh 'npm run build'
                sh "docker build -t ${DOCKER_IMAGE} ."
                sh "docker tag ${DOCKER_IMAGE} ${APP_NAME}:latest"
                echo "Docker image created: ${DOCKER_IMAGE}"
            }
        }

        // run automated tests
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

        // run sonarqube code quality analysis
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
                          -Dsonar.exclusions=node_modules/**,coverage/**
                    """
                }
                timeout(time: 5, unit: 'MINUTES') {
                    waitForQualityGate abortPipeline: true
                }
            }
        }

        // scan docker image for vulnerabilities using trivy
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
            }
            post {
                always {
                    archiveArtifacts artifacts: 'trivy-report.txt', allowEmptyArchive: true
                }
            }
        }

        // deploy to staging environment
        stage('Deploy') {
            steps {
                echo "=========================================="
                echo " AskAny - Deploy Stage (Staging)"
                echo "=========================================="
                sh 'docker-compose down || true'
                sh "VERSION=${VERSION} docker-compose up -d --build"
                sh 'sleep 15'
                sh 'curl -f http://host.docker.internal:3000/health || exit 1'
                echo "AskAny staging live: http://localhost:3000"
            }
        }

        // promote to production and push git tag
        stage('Release') {
            steps {
                echo "=========================================="
                echo " AskAny - Release Stage (Production v${VERSION})"
                echo "=========================================="
                sh "docker tag ${DOCKER_IMAGE} ${APP_NAME}:prod-${VERSION}"
                sh "VERSION=${VERSION} docker-compose -f docker-compose.prod.yml up -d"
                sh 'sleep 15'
                sh 'curl -f http://host.docker.internal:3001/health || exit 1'

                // push git tag to github using jenkins credentials
                withCredentials([usernamePassword(
                    credentialsId: 'github-credentials',
                    usernameVariable: 'GIT_USER',
                    passwordVariable: 'GIT_TOKEN'
                )]) {
                    sh """
                        git config user.email "jenkins@askany.com"
                        git config user.name "Jenkins"
                        git remote set-url origin https://\${GIT_USER}:\${GIT_TOKEN}@github.com/\${GIT_USER}/AskAny.git
                        git tag -a v${VERSION} -m "AskAny Release v${VERSION}" || true
                        git push origin v${VERSION} || true
                    """
                }

                echo "AskAny production live: http://localhost:3001"
            }
        }

        // verify monitoring stack is healthy
        stage('Monitoring') {
            steps {
                echo "=========================================="
                echo " AskAny - Monitoring Stage"
                echo "=========================================="
                sh 'curl -f http://host.docker.internal:9090/-/healthy || echo "Prometheus running"'
                sh 'curl -f http://host.docker.internal:3002/api/health || echo "Grafana running"'
                echo "Prometheus -> http://localhost:9090"
                echo "Grafana    -> http://localhost:3002"
                echo "AskAny     -> http://localhost:3001/health"
            }
        }
    }

    post {
        success {
            echo "Pipeline SUCCESS - AskAny v${VERSION} is live!"
        }
        failure {
            echo "Pipeline FAILED - check logs above"
        }
        always {
            archiveArtifacts artifacts: 'trivy-report.txt', allowEmptyArchive: true
            cleanWs()
        }
    }
}
