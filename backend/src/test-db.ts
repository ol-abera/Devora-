import { prisma } from "./lib/prisma";

async function main() {
  await prisma.$connect();

  const result = await prisma.$queryRaw<Array<{ now: Date }>>`
    SELECT NOW() AS now
  `;

  console.log("Database connection successful!");
  console.log("Database time:", result[0]?.now);
}

main()
  .catch((error) => {
    console.error("Database connection failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });