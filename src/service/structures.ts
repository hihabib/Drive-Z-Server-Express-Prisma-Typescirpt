import fs from "fs/promises";
import { PrismaClient } from "@prisma/client";
import {
    type DirectoryBasicInfo,
    type FileBasicInfo,
} from "../model/structure";
import path from "path";
import { getUser } from "../utils/user";

const prisma = new PrismaClient();

export const getDirectories = async (
    userId: string,
    slug: string,
): Promise<DirectoryBasicInfo[] | null> => {
    try {
        const user = await getUser(userId);
        if (user === null) {
            return null;
        }

        const currentDirCheck = await prisma.directory.findUnique({
            where: {
                baseSlug: slug,
                owner: user.username,
                isTrashed: {
                    not: true,
                },
            },
            select: {
                id: true,
            },
        });

        if (currentDirCheck === null) {
            return null;
        }
        const childDirectoriesContainer = await prisma.directory.findMany({
            where: {
                baseSlug: slug,
                owner: user.username,
            },
            select: {
                childDir: {
                    where: {
                        isTrashed: false,
                    },
                    select: {
                        id: true,
                        directoryName: true,
                        baseSlug: true,
                        owner: true,
                    },
                },
            },
        });

        if (childDirectoriesContainer[0] !== undefined) {
            return childDirectoriesContainer[0].childDir ?? [];
        } else {
            return [];
        }
    } catch (error) {
        console.log(error);
        return [];
    }
};

export const getFiles = async (
    userId: string,
    slug: string,
): Promise<FileBasicInfo[] | null> => {
    try {
        // check user
        const user = await getUser(userId);
        if (user === null) {
            return null;
        }

        const baseSlug = userId + slug;
        const filesContainer = await prisma.directory.findMany({
            where: {
                baseSlug,
                owner: user.username,
            },
            select: {
                file: {
                    where: {
                        isTrashed: {
                            not: true,
                        },
                    },
                    select: {
                        id: true,
                        fileName: true,
                        fileSizeKB: true,
                        baseSlug: true,
                        owner: true,
                    },
                },
            },
        });

        if (
            filesContainer[0] !== undefined &&
            filesContainer[0].file !== undefined
        ) {
            const { file: files } = filesContainer[0];
            return files;
        }
        return [];
    } catch (error) {
        console.log(error);
        return null;
    }
};

export const createDirectory = async (
    userId: string,
    ...foldersName: string[]
): Promise<boolean> => {
    // get directory creator's username
    const directoryCreator = await prisma.user.findUnique({
        where: {
            id: userId,
        },
        select: {
            username: true,
        },
    });
    // throw error if user not found
    if (directoryCreator === null) {
        throw new Error("Directory creator (by id) not found");
    }

    // create baseSlug for saving at database
    let baseSlug =
        userId +
        foldersName.reduce((current, next) => {
            current += "/" + next;
            return current;
        }, "");
    // make baseSlug as userID for root directory
    if (foldersName.length === 1 && foldersName[0] === "") {
        baseSlug = userId;
    }
    // create directory in inside userData folder by file system
    const directoryPath = path.join("userData", userId, ...foldersName);
    await fs.mkdir(directoryPath, {
        recursive: true,
    });

    // get parent directory slug
    const parentSlugArr = baseSlug.split("/");
    parentSlugArr.pop();
    let parentSlug: string | null = parentSlugArr.join("/");
    if (parentSlug === "") {
        parentSlug = null;
    }

    // get parent directory id by parentSlug
    let parentDirectoryId: null | { id: string } = null;
    if (parentSlug !== null) {
        parentDirectoryId = await prisma.directory.findUnique({
            where: {
                baseSlug: parentSlug,
            },
            select: {
                id: true,
            },
        });
    }
    if (parentDirectoryId !== null) {
        // create directory with the reference of parent directory
        const directoryName = foldersName[foldersName.length - 1];
        await prisma.directory.create({
            data: {
                directoryName,
                baseSlug,
                owner: directoryCreator.username,
                parentDir: {
                    connect: {
                        id: parentDirectoryId.id,
                    },
                },
            },
        });
    } else {
        // create directory without parent directory
        // useful for making root directory at the time of user signup
        const directoryName = userId;
        await prisma.directory.create({
            data: {
                directoryName,
                baseSlug,
                owner: directoryCreator.username,
            },
        });
    }
    return true;
};
