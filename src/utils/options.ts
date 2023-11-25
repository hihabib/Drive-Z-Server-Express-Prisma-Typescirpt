import { promisify } from "util";
import fsExtra from "fs-extra";
import ncpModule from "ncp";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const ncp = promisify(ncpModule);

export const moveItem = async (
    source: string,
    destination: string,
): Promise<boolean> => {
    try {
        await ncp(source, destination, {
            clobber: true,
        });
        await fsExtra.remove(source);
        return true;
    } catch (error) {
        console.error(error);
        return false;
    }
};

export const getAllChildDirectoriesId = async (
    dirId: string,
): Promise<string[]> => {
    try {
        // Initialize an empty array to store directory names
        const dirIdList: string[] = [dirId];

        // Recursive function to get the child directories
        await (async function getChild(dirId: string): Promise<void> {
            // Fetch the directory details from the database
            const dir = await prisma.directory.findUnique({
                where: {
                    id: dirId,
                },
                select: {
                    directoryName: true,
                    childDir: {
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
            }
            // if there is no childDir
            if (dir.childDir === null) {
                return;
            }

            // If the directory has a child, get its details
            for (let i = 0; i < dir.childDir.length; i++) {
                // Get the child directory's  ID
                const childDirId = dir.childDir[i].id;

                // Add the child directory's name to the dirIdList array
                dirIdList.push(childDirId);

                // Recursively call the function for the child directory
                await getChild(childDirId);
            }
        })(dirId);

        return dirIdList;
    } catch (error) {
        // Log any errors and return an empty string
        console.log(error);
        return [];
    }
};

export const getAllChildFilesId = async (dirId: string): Promise<string[]> => {
    try {
        // Initialize an empty array to store file names
        const fileIdList: string[] = [];

        // Recursive function to get the child files
        await (async function getChild(dirId: string): Promise<void> {
            // Fetch the directory details from the database to get files inside it
            const fileContainer = await prisma.directory.findUnique({
                where: {
                    id: dirId,
                },
                select: {
                    directoryName: true,
                    file: {
                        select: {
                            id: true,
                            fileName: true,
                        },
                    },
                    childDir: {
                        select: {
                            id: true,
                            directoryName: true,
                        },
                    },
                },
            });

            // If the fileContainer doesn't exist, exit the function
            if (fileContainer === null) {
                return;
            }

            // Get the files' details and childDir details
            // const parentDirName = file.parentDir[i].fileName;
            const { file: files, childDir: childDirs } = fileContainer;

            // Add the child file's name to the fileIdList array
            for (let i = 0; i < files.length; i++) {
                const fileId = files[i].id;
                fileIdList.push(fileId);
            }
            // Recursively call the function for getting files inside child directories
            for (let i = 0; i < childDirs.length; i++) {
                await getChild(childDirs[i].id);
            }
        })(dirId);

        return fileIdList;
    } catch (error) {
        // Log any errors and return an empty string
        console.log(error);
        return [];
    }
};

export const trashFile = async (
    fileId: string,
    status: boolean,
): Promise<boolean> => {
    try {
        await prisma.file.update({
            where: {
                id: fileId,
            },
            data: {
                isTrashed: status,
            },
        });
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
};

export const trashDirectory = async (
    directoryId: string,
    status: boolean,
): Promise<boolean> => {
    try {
        await prisma.directory.update({
            where: {
                id: directoryId,
            },
            data: {
                isTrashed: status,
            },
        });
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
};
export const getFileBaseSlug = async (
    fileId: string,
): Promise<string | null> => {
    try {
        const baseSlugContainer = await prisma.file.findUnique({
            where: {
                id: fileId,
            },
            select: {
                baseSlug: true,
            },
        });
        if (baseSlugContainer === null || baseSlugContainer.baseSlug === null) {
            return null;
        }
        const { baseSlug } = baseSlugContainer;

        return baseSlug;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const getDirectoryBaseSlug = async (
    directoryId: string,
): Promise<string | null> => {
    try {
        const baseSlugContainer = await prisma.directory.findUnique({
            where: {
                id: directoryId,
            },
            select: {
                baseSlug: true,
            },
        });
        if (baseSlugContainer === null || baseSlugContainer.baseSlug === null) {
            return null;
        }
        const { baseSlug } = baseSlugContainer;

        return baseSlug;
    } catch (error) {
        console.error(error);
        return null;
    }
};
