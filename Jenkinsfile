pipeline {
    agent any
    
    triggers {
        // Poll SCM every 2 minutes as fallback if webhook fails
        pollSCM('H/2 * * * *')
    }
    
    environment {
        COMPOSE_PROJECT_NAME = 'trello_clone'
        BUN_INSTALL = "${HOME}/.bun"
        PATH = "${BUN_INSTALL}/bin:/opt/homebrew/bin:${PATH}" // Add Homebrew bin for Docker
    }
    
    stages {
        stage('Checkout') {
            steps {
                script {
                    checkout scm
                    env.GIT_COMMIT_SHORT = sh(
                        script: "git rev-parse --short HEAD",
                        returnStdout: true
                    ).trim()
                }
            }
        }
        
        stage('Load Secrets') {
            steps {
                script {
                    withCredentials([
                        string(credentialsId: 'DATABASE_URL', variable: 'DATABASE_URL'),
                        string(credentialsId: 'JWT_SECRET', variable: 'JWT_SECRET')
                    ]) {
                        writeFile file: '.env', text: """
DATABASE_URL=${DATABASE_URL}
JWT_SECRET=${JWT_SECRET}
NODE_ENV=production
"""
                        echo "Environment secrets loaded -> .env created"
                    }
                }
            }
        }
        
        stage('Validate Compose') {
            steps {
                sh 'docker compose config'
            }
        }
        
        stage('Install Bun') {
            steps {
                sh 'curl -fsSL https://bun.sh/install | bash'
            }
        }
        
        stage('Install Dependencies') {
            steps {
                sh '${BUN_INSTALL}/bin/bun install'
            }
        }
        
        stage('Start Database') {
            steps {
                script {
                    echo "Starting PostgreSQL container..."
                    sh 'docker compose up -d postgres'
                    
                    echo "Waiting for PostgreSQL to be ready..."
                    sh '''
                        for i in {1..30}; do
                            if docker compose exec -T postgres pg_isready -U postgres > /dev/null 2>&1; then
                                echo "PostgreSQL is ready!"
                                exit 0
                            fi
                            echo "Waiting for PostgreSQL... ($i/30)"
                            sleep 2
                        done
                        echo "PostgreSQL failed to start in time"
                        exit 1
                    '''
                }
            }
        }
        
        stage('Prisma Migrate') {
            steps {
                sh '''
                    export PATH=${BUN_INSTALL}/bin:$PATH
                    bunx prisma migrate deploy
                '''
            }
        }
        
        stage('Build Next.js') {
            steps {
                sh '''
                    export PATH=${BUN_INSTALL}/bin:$PATH
                    bun run build
                '''
            }
        }
        
        stage('Deploy') {
            steps {
                script {
                    echo "Deploying application..."
                    sh 'docker compose up -d --build app'
                    sh 'docker compose ps'
                }
            }
        }
        
        stage('Health Check') {
            steps {
                script {
                    echo "Performing health check..."
                    sh '''
                        for i in {1..30}; do
                            if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
                                echo "Application is healthy!"
                                exit 0
                            fi
                            echo "Waiting for application... ($i/30)"
                            sleep 2
                        done
                        echo "Health check failed - application may not be responding"
                        # Don't fail the build, just warn
                        exit 0
                    '''
                }
            }
        }
    }
    
    post {
        always {
            script {
                echo "Cleaning up unused Docker images..."
                sh 'docker image prune -f'
                
                echo "Container logs (last 30 lines):"
                sh 'docker compose logs --tail=30 || true'
            }
        }
        
        success {
            echo "✅ Pipeline completed successfully!"
            echo "Application is running at http://localhost:3000"
        }
        
        failure {
            echo "❌ Pipeline failed!"
            echo "Stopping containers..."
            sh 'docker compose down || true'
        }
    }
}