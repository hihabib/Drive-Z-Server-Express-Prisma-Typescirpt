import fs from "fs/promises";
import fsExtra from "fs-extra";
import path from "path";
import { PrismaClient } from "@prisma/client";
import {
    type DirectoryBasicInfo,
    type DirectoryInformation,
    type IFileAndDirectory,
    type RouterQuery,
} from "../model/structure";

const prisma = new PrismaClient();

const getDirectorySlugByDBChain = async (
    dirId: string | undefined,
): Promise<string> => {
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

const getRootDir = async (
    userId: string,
): Promise<{
    id: string;
} | null> => {
    try {
        return await prisma.directory.findFirst({
            where: {
                directoryName: userId,
                parentDir: null,
            },
        });
    } catch (error) {
        console.log(error);
        return null;
    }
};

const createOrGetRootDir = async (
    userId: string,
): Promise<{
    id: string;
}> => {
    let rootDir = await getRootDir(userId);
    if (rootDir === null) {
        rootDir = await prisma.directory.create({
            data: {
                directoryName: userId,
            },
        });
        await fs.mkdir(path.join("userData", userId), { recursive: true });
    }
    return rootDir;
};

const getDirectoryQuery = (path: string, userId: string): RouterQuery => {
    const parts = path.split("/").filter((part) => part !== ""); // Filter out empty parts
    let result: RouterQuery | null = null;

    for (let i = 0; i < parts.length; i++) {
        const directoryName = parts[i];
        const parentDir: RouterQuery = result ?? {
            directoryName: userId,
        };
        result = {
            directoryName,
            parentDir,
        };
    }

    return result ?? { directoryName: userId };
};

const getDirId = async (
    dirPath: string,
    userId: string,
): Promise<DirectoryBasicInfo | null> => {
    const query = getDirectoryQuery(dirPath, userId);
    const data = await prisma.directory.findFirst({
        where: {
            ...query,
        },
        select: {
            id: true,
            directoryName: true,
        },
    });
    return data;
};

const getDirectories = async (
    userId: string,
    sourcePath: string = "",
): Promise<DirectoryBasicInfo[]> => {
    try {
        if (sourcePath === "") {
            const { id: rootDirId } = await createOrGetRootDir(userId);

            return await prisma.directory.findMany({
                where: {
                    parentDirId: rootDirId,
                },
                select: {
                    id: true,
                    directoryName: true,
                },
            });
        } else {
            const searchResult = await getDirId(sourcePath, userId);
            if (searchResult !== null) {
                return await prisma.directory.findMany({
                    where: {
                        parentDir: {
                            id: searchResult.id,
                        },
                    },
                    select: {
                        id: true,
                        directoryName: true,
                    },
                });
            } else {
                return [];
            }
        }
    } catch (error) {
        console.log(error);
        return [];
    }
};

const getFiles = async (
    userId: string,
    sourcePath: string = "",
): Promise<IFileAndDirectory[] | undefined> => {
    try {
        if (sourcePath === "") {
            const { id: rootDirId } = await createOrGetRootDir(userId);
            return await prisma.file.findMany({
                where: {
                    parentDir: {
                        id: rootDirId,
                    },
                },
                select: {
                    id: true,
                    fileName: true,
                },
            });
        } else {
            const searchResult = await getDirId(sourcePath, userId);
            if (searchResult !== null) {
                return await prisma.file.findMany({
                    where: {
                        parentDir: {
                            id: searchResult.id,
                        },
                    },
                    select: {
                        id: true,
                        fileName: true,
                    },
                });
            } else {
                return [];
            }
        }
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
            const { id: parentId } = await getDirectoryInfo(
                id,
                path.dirname(directoryPath) === "/"
                    ? ""
                    : path.dirname(directoryPath),
            );
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
    dirPath: string = "",
): Promise<DirectoryInformation> => {
    let searchedDir;
    if (dirPath !== "") {
        const dirName = path.basename(dirPath);
        let parentDirName = path.basename(path.dirname(dirPath));
        parentDirName = parentDirName === "." ? userId : parentDirName;
        console.log("info", dirName, parentDirName);
        searchedDir = await prisma.directory.findFirst({
            where: {
                directoryName: dirName,
                parentDir: {
                    directoryName: parentDirName,
                },
            },
            select: {
                id: true,
            },
        });
    } else {
        searchedDir = await prisma.directory.findFirst({
            where: {
                directoryName: userId,
            },
        });
    }
    // console.log(searchedDir);
    return { id: searchedDir?.id } satisfies DirectoryInformation;
};
const deleteItem = async (userId: string, itemId: string): Promise<boolean> => {
    // try {
    //     const source = path.join("userData", userId, itemPath);
    //     await fsExtra.rm(source, {
    //         recursive: true,
    //     });
    //
    //     if ((await fs.lstat(source)).isDirectory()) {
    //         const dirName = path.basename(source);
    //         const parentDirName = path.basename(path.dirname(source));
    //         await prisma.directory.delete({
    //             where: {
    //                 directoryName: dirName,
    //                 parentDir: {
    //                     directoryName: parentDirName,
    //                 },
    //             },
    //         });
    //     }
    //     return true;
    // } catch (error) {
    //     console.log(error);
    //     return false;
    // }
};
export default {
    getDirectories,
    getFiles,
    createDirectory,
    getDirectoryInfo,
    deleteItem,
    getDirectorySlugByDBChain,
};
