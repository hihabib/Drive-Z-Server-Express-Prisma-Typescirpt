import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

(async (): Promise<void> => {})().catch((error) => {
    console.log(error);
});
