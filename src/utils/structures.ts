import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getDirectorySlugByDBChain = async (
    dirId: string,
): Promise<string> => {
    try {
        // Initialize an empty array to store directory names
        const dirList: string[] = [];

        // Initialize an empty string to store the current directory name
        let dirName: string = "";

        // Recursive function to get the parent directories
        await (async function getParents(dirId: string): Promise<void> {
            // Fetch the directory details from the database
            const dir = await prisma.directory.findUnique({
                where: {
                    id: dirId,
                },
                select: {
                    directoryName: true,
                    parentDir: {
                        select: {
                            id: true,
                            directoryName: true,
                        },
                    },
                },
            });

            // If the directory doesn't exist, exit the function
            if (dir === null) {
                return;
            } else {
                // If dirName is not set, set it to the current directory's name
                if (dirName.length === 0) {
                    dirName = dir.directoryName;
                }
            }

            // If the directory has a parent, get its details
            if (dir.parentDir === null) {
                return;
            }

            // Get the parent directory's name and ID
            const parentDirName = dir.parentDir.directoryName;
            const parentDirId = dir.parentDir.id;

            // Add the parent directory's name to the dirList array
            dirList.push(parentDirName);

            // Recursively call the function for the parent directory
            await getParents(parentDirId);
        })(dirId);

        // Remove the last element from dirList (the top-level parent directory)
        // dirList.pop();

        // Check if the current directory is the main (top-level) directory
        const isMain = await prisma.directory.findUnique({
            where: {
                id: dirId,
            },
            select: {
                parentDirId: true,
            },
        });

        // Add the current directory's name to the beginning of dirList
        dirList.unshift(dirName);

        // If it's the main directory, return the reversed dirList as a string
        if (isMain?.parentDirId === null) {
            return dirList.reverse().join("/");
        }

        // If it's not the main directory, return dirList as a string with a leading "/"
        return "/" + dirList.reverse().join("/");
    } catch (error) {
        // Log any errors and return an empty string
        console.log(error);
        return "";
    }
};

export const getFileSlugByDBChain = async (
    fileId: string,
): Promise<string | boolean> => {
    const fileParentDirId = await prisma.file.findUnique({
        where: {
            id: fileId,
        },
        select: {
            fileName: true,
            parentDirId: true,
        },
    });
    if (fileParentDirId !== null) {
        const { parentDirId, fileName } = fileParentDirId;
        let dirSlug = await getDirectorySlugByDBChain(parentDirId);
        if (!dirSlug.startsWith("/")) {
            const dirSlugArr = dirSlug.split("/");
            dirSlugArr.shift();
            dirSlug = dirSlugArr.join("/");
        }
        return dirSlug + "/" + fileName;
    } else {
        return false;
    }
};
