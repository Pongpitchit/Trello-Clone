import { prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";

async function main() {
  console.log("🌱 Starting database seed...");

  // Clear existing data
  console.log("🗑️  Clearing existing data...");
  await prisma.tasks.deleteMany();
  await prisma.lists.deleteMany();
  await prisma.boards.deleteMany();
  await prisma.board_members.deleteMany();
  await prisma.comments.deleteMany();
  await prisma.users.deleteMany();

  // Create users
  console.log("👥 Creating users...");
  const hashedPassword = await bcrypt.hash("Password123!", 10);

  const user1 = await prisma.users.create({
    data: {
      email: "john@example.com",
      name: "John Doe",
      password_hash: hashedPassword,
    },
  });

  const user2 = await prisma.users.create({
    data: {
      email: "jane@example.com",
      name: "Jane Smith",
      password_hash: hashedPassword,
    },
  });

  const user3 = await prisma.users.create({
    data: {
      email: "admin@example.com",
      name: "Admin User",
      password_hash: hashedPassword,
    },
  });

  console.log(`✅ Created ${3} users`);

  // Create boards
  console.log("📋 Creating boards...");

  const board1 = await prisma.boards.create({
    data: {
      title: "Product Development",
      owner_id: user1.id,
      backgroundColor: "#0079bf",
    },
  });

  const board2 = await prisma.boards.create({
    data: {
      title: "Marketing Campaign",
      owner_id: user2.id,
      backgroundColor: "#d29034",
    },
  });

  const board3 = await prisma.boards.create({
    data: {
      title: "Personal Tasks",
      owner_id: user3.id,
      backgroundColor: "#519839",
    },
  });

  console.log(`✅ Created ${3} boards`);

  // Create board members
  console.log("👤 Adding board members...");

  await prisma.board_members.createMany({
    data: [
      { board_id: board1.id, user_id: user1.id, role: "owner" },
      { board_id: board1.id, user_id: user2.id, role: "member" },
      { board_id: board2.id, user_id: user2.id, role: "owner" },
      { board_id: board2.id, user_id: user3.id, role: "member" },
      { board_id: board3.id, user_id: user3.id, role: "owner" },
    ],
  });

  console.log(`✅ Added board members`);

  // Create lists for Board 1
  console.log("📝 Creating lists...");

  const list1 = await prisma.lists.create({
    data: {
      title: "To Do",
      board_id: board1.id,
      position: 0,
    },
  });

  const list2 = await prisma.lists.create({
    data: {
      title: "In Progress",
      board_id: board1.id,
      position: 1,
    },
  });

  const list3 = await prisma.lists.create({
    data: {
      title: "Done",
      board_id: board1.id,
      position: 2,
    },
  });

  // Create lists for Board 2
  const list4 = await prisma.lists.create({
    data: {
      title: "Ideas",
      board_id: board2.id,
      position: 0,
    },
  });

  const list5 = await prisma.lists.create({
    data: {
      title: "Planning",
      board_id: board2.id,
      position: 1,
    },
  });

  // Create lists for Board 3
  const list6 = await prisma.lists.create({
    data: {
      title: "Today",
      board_id: board3.id,
      position: 0,
    },
  });

  const list7 = await prisma.lists.create({
    data: {
      title: "This Week",
      board_id: board3.id,
      position: 1,
    },
  });

  console.log(`✅ Created ${7} lists`);

  // Create tasks
  console.log("✅ Creating tasks...");

  // Tasks for list1 (To Do)
  await prisma.tasks.createMany({
    data: [
      {
        title: "Design new landing page",
        description: "Create mockups for the new landing page design",
        list_id: list1.id,
        position: 0,
        completed: false,
      },
      {
        title: "Set up authentication",
        description: "Implement JWT authentication with refresh tokens",
        list_id: list1.id,
        position: 1,
        completed: false,
      },
      {
        title: "Write API documentation",
        description: "Document all API endpoints using OpenAPI/Swagger",
        list_id: list1.id,
        position: 2,
        completed: false,
      },
    ],
  });

  // Tasks for list2 (In Progress)
  await prisma.tasks.createMany({
    data: [
      {
        title: "Implement drag and drop",
        description: "Add drag and drop functionality for tasks",
        list_id: list2.id,
        position: 0,
        completed: false,
      },
      {
        title: "Add real-time updates",
        description: "Implement WebSocket for real-time board updates",
        list_id: list2.id,
        position: 1,
        completed: false,
      },
    ],
  });

  // Tasks for list3 (Done)
  await prisma.tasks.createMany({
    data: [
      {
        title: "Set up project structure",
        description: "Initialize Next.js project with TypeScript",
        list_id: list3.id,
        position: 0,
        completed: true,
      },
      {
        title: "Configure Prisma",
        description: "Set up Prisma ORM with PostgreSQL",
        list_id: list3.id,
        position: 1,
        completed: true,
      },
      {
        title: "Create database schema",
        description: "Design and implement database schema",
        list_id: list3.id,
        position: 2,
        completed: true,
      },
    ],
  });

  // Tasks for list4 (Ideas)
  await prisma.tasks.createMany({
    data: [
      {
        title: "Social media campaign",
        description: "Launch a social media campaign for Q4",
        list_id: list4.id,
        position: 0,
        completed: false,
      },
      {
        title: "Email newsletter",
        description: "Create weekly email newsletter template",
        list_id: list4.id,
        position: 1,
        completed: false,
      },
    ],
  });

  // Tasks for list5 (Planning)
  await prisma.tasks.createMany({
    data: [
      {
        title: "Content calendar",
        description: "Plan content calendar for next month",
        list_id: list5.id,
        position: 0,
        completed: false,
      },
    ],
  });

  // Tasks for list6 (Today)
  await prisma.tasks.createMany({
    data: [
      {
        title: "Review pull requests",
        description: "Review and merge pending PRs",
        list_id: list6.id,
        position: 0,
        completed: false,
      },
      {
        title: "Team standup meeting",
        description: "Daily standup at 10 AM",
        list_id: list6.id,
        position: 1,
        completed: true,
      },
    ],
  });

  // Tasks for list7 (This Week)
  await prisma.tasks.createMany({
    data: [
      {
        title: "Plan sprint",
        description: "Plan tasks for next sprint",
        list_id: list7.id,
        position: 0,
        completed: false,
      },
      {
        title: "Code review workshop",
        description: "Host code review best practices workshop",
        list_id: list7.id,
        position: 1,
        completed: false,
      },
    ],
  });

  console.log(`✅ Created tasks`);

  console.log("\n🎉 Database seeding completed successfully!");
  console.log("\n📊 Summary:");
  console.log(`   - Users: 3`);
  console.log(`   - Boards: 3`);
  console.log(`   - Lists: 7`);
  console.log(`   - Tasks: 18`);
  console.log("\n🔐 Test credentials:");
  console.log(`   Email: john@example.com`);
  console.log(`   Email: jane@example.com`);
  console.log(`   Email: admin@example.com`);
  console.log(`   Password: Password123!`);
}

main()
  .catch((e) => {
    console.error("❌ Error seeding database:");
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
