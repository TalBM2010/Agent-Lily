import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import bcrypt from "bcryptjs";

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create a test user (parent)
  const passwordHash = await bcrypt.hash("test123", 12);
  
  const user = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      id: "test-user-1",
      email: "test@example.com",
      name: "Test User",
      passwordHash,
    },
  });

  // Create admin user
  const adminPasswordHash = await bcrypt.hash("admin123", 12);
  
  const admin = await prisma.user.upsert({
    where: { email: "admin@lily.app" },
    update: {},
    create: {
      id: "admin-user-1",
      email: "admin@lily.app",
      name: "Admin",
      passwordHash: adminPasswordHash,
      role: "ADMIN",
    },
  });

  // Create a test child
  const child = await prisma.child.upsert({
    where: { id: "test-child-1" },
    update: {},
    create: {
      id: "test-child-1",
      name: "Noa",
      age: 7,
      avatar: "🦄",
      nativeLanguage: "he",
      currentLevel: "BEGINNER",
      userId: user.id,
    },
  });

  console.log("Seeded:", { user: user.id, admin: admin.id, child: child.id });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
