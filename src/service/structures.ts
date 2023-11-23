import fs from "fs/promises";
import { PrismaClient } from "@prisma/client";
import {
    type DirectoryBasicInfo,
    type DirectoryInformation,
    type FileBasicInfo,
} from "../model/structure";
import { getDirectorySlugByDBChain } from "../utils/structures";

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

const getFiles = async (
    userId: string,
    slug: string,
): Promise<FileBasicInfo[] | boolean> => {
    try {
        const filesContainer = await prisma.directory.findMany({
            where: {
                baseSlug: slug,
            },
            select: {
                file: {
                    select: {
                        id: true,
                        fileName: true,
                        fileSizeKB: true,
                        baseSlug: true,
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
        return [];
    }
};

const createDirectory = async (
    userId: string,
    directoryPath: string,
): Promise<boolean> => {
    try {
        if (userId !== directoryPath) {
            const splitedDirectoryPath = directoryPath.split("/");
            const directoryName =
                splitedDirectoryPath[splitedDirectoryPath.length - 1];

            const parentDirectoryPathStr = [...splitedDirectoryPath];
            parentDirectoryPathStr.pop();
            let parentDirectoryPath = parentDirectoryPathStr.join("/");
            parentDirectoryPath =
                parentDirectoryPath.trim() !== ""
                    ? parentDirectoryPath
                    : userId;

            console.log(parentDirectoryPath);
            const parentDirectoryIdContainer =
                await prisma.directory.findUnique({
                    where: {
                        baseSlug: parentDirectoryPath,
                    },
                    select: {
                        id: true,
                    },
                });
            if (parentDirectoryIdContainer !== null) {
                const { id: parentDirectoryId } = parentDirectoryIdContainer;

                await prisma.directory.create({
                    data: {
                        directoryName,
                        parentDirId: parentDirectoryId,
                        baseSlug:
                            parentDirectoryPath !== userId
                                ? parentDirectoryPath + "/" + directoryName
                                : "/" + directoryName,
                    },
                });
            } else {
                return false;
            }
        } else {
            await prisma.directory.create({
                data: {
                    directoryName: userId,
                    baseSlug: userId,
                },
            });
        }
        const explicitDirectoryPath =
            userId === directoryPath
                ? `userData/${userId}`
                : `userData/${userId}${directoryPath}`;
        // create directory in file system
        await fs.mkdir(explicitDirectoryPath, {
            recursive: true,
        });
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
};
const getDirectoryInfo = async (
    userId: string,
    baseSlug: string,
): Promise<DirectoryInformation | boolean> => {
    console.log(baseSlug);
    const directoryInfo = await prisma.directory.findUnique({
        where: {
            baseSlug,
        },
    });
    if (directoryInfo === null) {
        return false;
    }
    return { ...directoryInfo } satisfies DirectoryInformation;
};

export default {
    getDirectories,
    getFiles,
    createDirectory,
    getDirectoryInfo,
};
