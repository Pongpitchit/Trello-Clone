# Trello Clone

A full-stack Trello clone built with Next.js 16, Prisma, PostgreSQL, and Bun runtime. Features include drag-and-drop task management, user authentication, and real-time board updates.

## ✨ Features

- 🔐 **Authentication** - JWT-based authentication with secure password hashing
- 📋 **Board Management** - Create, edit, and delete boards
- 📝 **Lists & Tasks** - Organize tasks in lists with drag-and-drop
- 👥 **Collaboration** - Share boards with team members
- 🎨 **Customization** - Custom board backgrounds
- 🌙 **Dark Mode** - Theme toggle support
- 🐳 **Docker Ready** - Full Docker and Docker Compose setup

## 🛠️ Tech Stack

- **Framework:** [Next.js 16](https://nextjs.org/) with App Router
- **Runtime:** [Bun](https://bun.sh/)
- **Database:** [PostgreSQL 15](https://www.postgresql.org/)
- **ORM:** [Prisma](https://www.prisma.io/)
- **UI Components:** [Radix UI](https://www.radix-ui.com/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/)
- **State Management:** [TanStack Query](https://tanstack.com/query)
- **Authentication:** JWT with bcrypt
- **Validation:** [Zod](https://zod.dev/)

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- [Bun](https://bun.sh/) (v1.0 or higher)
- [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
- [Git](https://git-scm.com/)

Alternatively, you can use [Node.js](https://nodejs.org/) (v18 or higher) instead of Bun.

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/trello-clone.git
cd trello-clone
```

### 2. Install Dependencies

```bash
bun install
```

Or with npm:

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Update the \`.env\` file with your configuration:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/trello_clone?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

```

### 4. Start the Database

**Option A: Using Docker (Recommended)**

```bash
make up
```

Or:

```bash
docker-compose up -d
```

**Option B: Local PostgreSQL**

Make sure PostgreSQL is running locally on port 5432.

### 5. Set Up the Database

Run migrations:

```bash
bun prisma:migrate
```

Seed the database with sample data:

```bash
bun prisma:seed
```

### 6. Start the Development Server

```bash
bun dev
```

The app will be available at [http://localhost:3000](http://localhost:3000)

## 🔐 Test Credentials

After seeding the database, you can log in with:

| Email             | Password     | Role  |
| ----------------- | ------------ | ----- |
| john@example.com  | Password123! | User  |
| jane@example.com  | Password123! | User  |
| admin@example.com | Password123! | Admin |

## 🐳 Docker Setup

### Start All Services

```bash
make up
```

This will start:

- Next.js app on port 3000
- PostgreSQL on port 5432

### Other Docker Commands

```bash
make build      # Build Docker images
make down       # Stop all services
make logs-app   # View app logs
make logs-db    # View database logs
make shell      # Access app container shell
make migrate    # Run database migrations
make seed       # Seed the database
make studio     # Open Prisma Studio
make rebuild    # Rebuild and restart
```

For more Docker commands, see [DOCKER.md](./DOCKER.md)

## 📜 Available Scripts

| Command                 | Description              |
| ----------------------- | ------------------------ |
| \`bun dev\`             | Start development server |
| \`bun build\`           | Build for production     |
| \`bun start\`           | Start production server  |
| \`bun lint\`            | Run ESLint               |
| \`bun prisma:generate\` | Generate Prisma client   |
| \`bun prisma:migrate\`  | Run database migrations  |
| \`bun prisma:studio\`   | Open Prisma Studio       |
| \`bun prisma:seed\`     | Seed the database        |

## 📂 Project Structure

```
trello-clone/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── boards/            # Board pages
│   ├── sign-in/           # Auth pages
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # UI components (Radix)
│   └── Navbar.tsx        # Navigation
├── lib/                   # Utility functions
├── prisma/               # Database schema & migrations
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Database seed
├── public/               # Static assets
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Docker Compose setup
├── Makefile             # Make commands
└── README.md            # This file
```

## 🗄️ Database Schema

The application uses the following main models:

- **users** - User accounts with authentication
- **boards** - Project boards
- **board_members** - Board access control
- **lists** - Task lists within boards
- **tasks** - Individual tasks
- **comments** - Task comments

## 🔧 Development

### Run Database Migrations

```bash
bun prisma:migrate
```

### View Database with Prisma Studio

```bash
bun prisma:studio
```

This opens a GUI at [http://localhost:5555](http://localhost:5555) to view and edit your database.

### Reset Database

```bash
bun prisma migrate reset
```

This will:

1. Drop the database
2. Create a new database
3. Run all migrations
4. Run seed script

## 🏗️ Building for Production

```bash
bun build
bun start
```

Or with Docker:

```bash
docker-compose up -d --build
```

## 🧪 Testing

The database seed creates sample data for testing:

- 3 users
- 3 boards with different themes
- 7 lists across boards
- 18 tasks with various states

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: \`git checkout -b feature/your-feature\`
3. Commit your changes: \`git commit -m 'Add some feature'\`
4. Push to the branch: \`git push origin feature/your-feature\`
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - The React Framework
- [Prisma](https://www.prisma.io/) - Next-generation ORM
- [Radix UI](https://www.radix-ui.com/) - Unstyled, accessible UI components
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [dnd-kit](https://dndkit.com/) - Modern drag and drop toolkit

## 📞 Support

If you have any questions or run into issues, please open an issue on GitHub.

---

Made with ❤️ using Next.js and Bun
