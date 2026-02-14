import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client.js";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const parent = await prisma.parent.upsert({
    where: { email: "parent@test.com" },
    update: {},
    create: {
      id: "test-parent-1",
      email: "parent@test.com",
      name: "Test Parent",
    },
  });

  const child = await prisma.child.upsert({
    where: { id: "test-child-1" },
    update: {},
    create: {
      id: "test-child-1",
      name: "Noa",
      age: 7,
      nativeLanguage: "he",
      currentLevel: "BEGINNER",
      parentId: parent.id,
    },
  });

  console.log("Seeded:", { parent: parent.id, child: child.id });
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
