import fs from "fs/promises";
import path from "path";
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
        console.log(slug);
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
    id: string,
    directoryPath: string,
): Promise<boolean> => {
    try {
        let createdDirectory: {
            id: string;
            parentDirId: string | null;
            directoryName: string;
            baseSlug: string | null;
            directorySizeKB: number | null;
            renamedAt: Date | null;
            copiedAt: Date | null;
            editedAt: Date | null;
            changedAccessAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
        if (directoryPath === "/") {
            await fs.mkdir(`userData/${id}`, {
                recursive: true,
            });
            createdDirectory = await prisma.directory.create({
                data: {
                    directoryName: id,
                },
            });
        } else {
            await fs.mkdir(`userData/${id}/${directoryPath}`, {
                recursive: true,
            });
            const { id: parentId } = (await getDirectoryInfo(
                id,
                path.dirname(directoryPath) === "/"
                    ? ""
                    : path.dirname(directoryPath),
            )) as DirectoryInformation;

            createdDirectory = await prisma.directory.create({
                data: {
                    directoryName: path.basename(directoryPath),
                    parentDir: {
                        connect: {
                            id: parentId,
                        },
                    },
                },
            });
        }

        const baseSlug = await getDirectorySlugByDBChain(createdDirectory.id);
        const updated = await prisma.directory.update({
            where: {
                id: createdDirectory.id,
            },
            data: {
                baseSlug,
            },
        });
        console.log(updated);
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
};
