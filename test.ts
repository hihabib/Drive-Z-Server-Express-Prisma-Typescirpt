import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

(async () => {
    await prisma.directory.create({
        data: {
            directoryName: "saikat",
            parentDir: {
                connect: {
                    id: "6559a25ad4c192318c4f6d96",
                },
            },
        },
    });
})().catch((error) => {
    console.log(error);
});
