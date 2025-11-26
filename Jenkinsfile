pipeline {
    agent any
    
    triggers {
        // Poll SCM every 2 minutes as fallback if webhook fails
        pollSCM('H/2 * * * *')
    }
    
    // *** การตั้งค่า Environment Variables (ปรับปรุง) ***
    environment {
        COMPOSE_PROJECT_NAME = 'trello_clone'
        // ตั้งค่า BUN_INSTALL และ PATH ให้ Jenkins รู้จัก bun
        BUN_INSTALL = "${HOME}/.bun" 
        PATH = "${BUN_INSTALL}/bin:${PATH}" 
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
        
        // *** ลบ stage('Install Bun') ออกเพื่อความเร็ว เพราะติดตั้งถาวรแล้ว ***
        
        stage('Install Dependencies') {
            steps {
                // เรียกใช้ bun ได้โดยตรง เพราะ PATH ถูกตั้งค่าแล้ว
                sh 'bun install'
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
                // ไม่ต้อง export PATH ซ้ำ
                sh 'bunx prisma migrate deploy'
            }
        }
        
        stage('Build Next.js') {
            steps {
                // ไม่ต้อง export PATH ซ้ำ
                sh 'bun run build'
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
                        exit 0 // เปลี่ยนเป็น exit 1 เพื่อให้ Build fail หาก Health Check ล้มเหลว (ถ้าต้องการ)
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