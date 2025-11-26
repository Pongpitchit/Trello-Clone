.PHONY: build run stop clean logs shell restart dev

# Variables
IMAGE_NAME=trello-clone-app
CONTAINER_NAME=trello-clone-app
PORT=3000

# Build the Docker image
build:
	docker build -t $(IMAGE_NAME) .

# Run the container
run:
	docker run -d \
		--name $(CONTAINER_NAME) \
		-p $(PORT):3000 \
		--env-file .env \
		$(IMAGE_NAME)

# Run with docker-compose
up:
	docker-compose up -d

# Stop docker-compose
down:
	docker-compose down

# Stop the container
stop:
	docker stop $(CONTAINER_NAME)
	docker rm $(CONTAINER_NAME)

# Clean up containers and images
clean:
	docker stop $(CONTAINER_NAME) || true
	docker rm $(CONTAINER_NAME) || true
	docker rmi $(IMAGE_NAME) || true

# View container logs
logs:
	docker logs -f $(CONTAINER_NAME)

# Access container shell
shell:
	docker exec -it $(CONTAINER_NAME) /bin/sh

# Restart the container
restart: stop run

# Development mode (run with volume mount)
dev:
	docker run -d \
		--name $(CONTAINER_NAME) \
		-p $(PORT):3000 \
		--env-file .env \
		-v $(PWD):/app \
		-v /app/node_modules \
		$(IMAGE_NAME) \
		bun run dev

# Rebuild and run
rebuild: clean build run

# Database migrations
migrate:
	docker-compose exec app bunx prisma migrate deploy

# Generate Prisma client
generate:
	docker-compose exec app bunx prisma generate

# Open Prisma Studio
studio:
	docker-compose exec app bunx prisma studio

# Database seed (if you have a seed script)
seed:
	docker-compose exec app bunx prisma db seed

# View app logs specifically
logs-app:
	docker-compose logs -f app

# View postgres logs
logs-db:
	docker-compose logs -f postgres

# Help command
help:
	@echo "Available commands:"
	@echo "  make build       - Build the Docker image"
	@echo "  make run         - Run the container"
	@echo "  make up          - Start with docker-compose"
	@echo "  make down        - Stop docker-compose"
	@echo "  make stop        - Stop and remove the container"
	@echo "  make clean       - Clean up containers and images"
	@echo "  make logs        - View container logs"
	@echo "  make logs-app    - View app logs"
	@echo "  make logs-db     - View postgres logs"
	@echo "  make shell       - Access container shell"
	@echo "  make restart     - Restart the container"
	@echo "  make dev         - Run in development mode"
	@echo "  make rebuild     - Rebuild and run the container"
	@echo "  make migrate     - Run database migrations"
	@echo "  make generate    - Generate Prisma client"
	@echo "  make studio      - Open Prisma Studio"
	@echo "  make seed        - Seed the database"
