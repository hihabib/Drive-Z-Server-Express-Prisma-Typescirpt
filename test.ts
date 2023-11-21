import { type DirectoryBasicInfo } from "./model/structure";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const getDirectories = async (
    userId: string,
    slug: string,
): Promise<DirectoryBasicInfo[]> => {
    try {
        const childDirectoriesContainer = await prisma.directory.findMany({
            where: {
                baseSlug: slug,
            },
            select: {
                childDir: {
                    select: {
                        id: true,
                        directoryName: true,
                        baseSlug: true,
                    },
                },
            },
        });

        return childDirectoriesContainer[0].childDir;
    } catch (error) {
        console.log(error);
        return [];
    }
};
(async () => {
    const test = await getDirectories("", "/test");
    console.log(test);
})().catch((error) => {
    console.log(error);
});
