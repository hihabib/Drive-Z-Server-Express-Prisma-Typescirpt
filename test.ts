import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

(async (): Promise<void> => {
    const test = await prisma.directory.findMany({
        where: {
            id: "655f6fa407be4f78bbff0b33",
        },
    });
    console.log(test);
})().catch((error) => {
    console.log(error);
});
