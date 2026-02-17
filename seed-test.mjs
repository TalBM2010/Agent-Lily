import { PrismaClient } from './src/generated/prisma/index.js';
const prisma = new PrismaClient();

async function main() {
  // Create test parent
  const parent = await prisma.parent.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      id: 'test-parent-1',
      email: 'test@example.com',
      name: 'Test Parent',
    },
  });
  console.log('Created parent:', parent.id);

  // Create test child
  const child = await prisma.child.upsert({
    where: { id: 'test-child-1' },
    update: {},
    create: {
      id: 'test-child-1',
      name: 'ילד טסט',
      age: 7,
      parentId: parent.id,
      nativeLanguage: 'he',
      currentLevel: 'BEGINNER',
    },
  });
  console.log('Created child:', child.id);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
