# Docker Setup

This project includes Docker configuration for running the Next.js application with Bun, PostgreSQL, and Redis.

## Prerequisites

- Docker
- Docker Compose
- Make (optional, but recommended)

## Quick Start

### Using Make (Recommended)

1. **Start all services:**
   ```bash
   make up
   ```

2. **Run database migrations:**
   ```bash
   make migrate
   ```

3. **View logs:**
   ```bash
   make logs-app    # App logs
   make logs-db     # PostgreSQL logs
   make logs-redis  # Redis logs
   ```

4. **Stop all services:**
   ```bash
   make down
   ```

### Using Docker Compose

1. **Start all services:**
   ```bash
   docker-compose up -d
   ```

2. **View logs:**
   ```bash
   docker-compose logs -f app
   ```

3. **Stop all services:**
   ```bash
   docker-compose down
   ```

## Services

### App (Next.js with Bun)
- **Port:** 3000
- **URL:** http://localhost:3000
- **Container:** trello_clone_app

### PostgreSQL
- **Port:** 5432
- **Database:** trello_clone
- **User:** postgres
- **Password:** postgres
- **Container:** trello_clone_postgres

### Redis
- **Port:** 6379
- **Container:** trello_clone_redis

## Available Make Commands

```bash
make help         # Show all available commands
make build        # Build the Docker image
make up           # Start with docker-compose
make down         # Stop docker-compose
make logs-app     # View app logs
make logs-db      # View postgres logs
make logs-redis   # View redis logs
make shell        # Access container shell
make migrate      # Run database migrations
make generate     # Generate Prisma client
make studio       # Open Prisma Studio
make rebuild      # Rebuild and run the container
```

## Environment Variables

Make sure you have a `.env` file in the root directory with the necessary environment variables. The docker-compose will use these variables.

Example `.env`:
```env
DATABASE_URL=postgresql://postgres:postgres@postgres:5432/trello_clone
JWT_SECRET=your-secret-key
# Add other environment variables as needed
```

## Development

For development with hot-reload, you can use:
```bash
make dev
```

This will mount your local directory into the container and run the development server.

## Troubleshooting

### Port already in use
If you get an error that ports are already in use, stop any local PostgreSQL, Redis, or Next.js instances:
```bash
# Check what's using port 3000
lsof -i :3000

# Check what's using port 5432
lsof -i :5432

# Check what's using port 6379
lsof -i :6379
```

### Database connection issues
Make sure the app service waits for PostgreSQL to be ready. The `depends_on` in docker-compose ensures this.

### Rebuilding after changes
If you make changes to the Dockerfile or dependencies:
```bash
make down
make rebuild
make up
```

## Production Deployment

The Dockerfile is optimized for production with:
- Multi-stage build for smaller image size
- Standalone Next.js output
- Non-root user for security
- Bun runtime for better performance

## Data Persistence

Data is persisted using Docker volumes:
- `postgres_data` - PostgreSQL data

This volume persists even when containers are stopped or removed.
