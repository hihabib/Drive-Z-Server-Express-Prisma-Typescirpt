import fs from "fs/promises";
import { PrismaClient } from "@prisma/client";
import {
    type DirectoryBasicInfo,
    type DirectoryInformation,
    type FileBasicInfo,
} from "../model/structure";

const prisma = new PrismaClient();

const getDirectorySlugByDBChain = async (dirId: string): Promise<string> => {
    try {
        const dirList: string[] = [];
        let dirName: string = "";

        await (async function getParents(dirId: string): Promise<void> {
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

            if (dir === null) {
                return;
            } else {
                if (dirName.length === 0) {
                    dirName = dir.directoryName;
                }
            }

            if (dir.parentDir === null) {
                return;
            }
            const parentDirName = dir.parentDir.directoryName;
            const parentDirId = dir.parentDir.id;

            dirList.push(parentDirName);
            await getParents(parentDirId);
        })(dirId);
        dirList.pop();
        const isMain = await prisma.directory.findUnique({
            where: {
                id: dirId,
            },
            select: {
                parentDirId: true,
            },
        });
        dirList.unshift(dirName);
        if (isMain?.parentDirId === null) {
            return dirList.reverse().join("/");
        }
        return "/" + dirList.reverse().join("/");
    } catch (error) {
        console.log(error);
        return "";
    }
};

const getFileSlugByDBChain = async (
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
        const { file: files } = filesContainer[0];
        return files;
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
    getDirectorySlugByDBChain,
    getFileSlugByDBChain,
};
