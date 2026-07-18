import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Nullifying legacy Wix userId values in Repository table...");
  const updateResult = await prisma.$executeRawUnsafe(
    `UPDATE "Repository" SET "userId" = NULL;`,
  );
  console.log("Update executed successfully. Result code:", updateResult);
}

main()
  .catch((e) => {
    console.error("Error executing script:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
