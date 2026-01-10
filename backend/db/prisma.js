import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient({
  log: ["error"], // optional: logs DB errors
});

export default prisma;
