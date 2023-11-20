import FakeDB from "../fakeDB";
import { type FileAndDirectoryStructures } from "../model/model";
import { type IFileAndDirectory } from "../utils/fileSystem";
import fs, { readdir } from "fs/promises";
import fsExtra from "fs-extra";
import path from "path";
import { PrismaClient } from "@prisma/client";
import {
    type DirectoryBasicInfo,
    type FolderInformation,
    type RouterQuery,
} from "../model/structure";
import { type Dirent } from "fs";
import { v4 as uuidV4 } from "uuid";

const prisma = new PrismaClient();

const fullTree = async (
    username: string,
): Promise<FileAndDirectoryStructures> => {
    const fakeDB = new FakeDB(username);
    return await fakeDB.getFullTreeStructure();
};

const getRootDir = async (userId: string): Promise<{ id: string } | null> => {
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

const createOrGetRootDir = async (userId: string): Promise<{ id: string }> => {
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

const createDirectoryStructure = (
    path: string,
    userId: string,
): RouterQuery => {
    const parts = path.split("/").filter((part) => part !== ""); // Filter out empty parts
    let result: RouterQuery | null = null;

    for (let i = 0; i < parts.length; i++) {
        const directoryName = parts[i];
        const parentDir: RouterQuery = result ?? {
            directoryName: userId,
        };
        result = { directoryName, parentDir };
    }

    return result ?? { directoryName: userId };
};

const getDirId = async (
    dirPath: string,
    userId: string,
): Promise<DirectoryBasicInfo | null> => {
    const query = createDirectoryStructure(dirPath, userId);
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
    id: string,
    path: string = "",
): Promise<IFileAndDirectory[] | undefined> => {
    try {
        const source = `userData/${id}/${path}`;
        const dirents: Dirent[] = await readdir(source, {
            withFileTypes: true,
        });
        const files: IFileAndDirectory[] = [];

        for (const dirent of dirents) {
            if (dirent.isFile()) {
                files.push({
                    id: uuidV4(),
                    name: dirent.name,
                });
            }
        }

        return files;
    } catch (error) {}
};

const createFolder = async (
    id: string,
    directoryPath: string,
): Promise<boolean> => {
    try {
        if (directoryPath === "/") {
            await fs.mkdir(`userData/${id}`, {
                recursive: true,
            });
            await prisma.directory.create({
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
            console.log(parentId, path.basename(directoryPath));
            await prisma.directory.create({
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

        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
};
const getDirectoryInfo = async (
    userId: string,
    dirPath: string = "",
): Promise<FolderInformation> => {
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
    return { id: searchedDir?.id } satisfies FolderInformation;
};
const deleteItem = async (
    userId: string,
    itemPath: string,
): Promise<boolean> => {
    try {
        const source = path.join("userData", userId, itemPath);
        await fsExtra.rm(source, {
            recursive: true,
        });

        if ((await fs.lstat(source)).isDirectory()) {
            // const dirName = path.basename(source);
            // const parentDirName = path.basename(path.dirname(source));
            // await prisma.directory.delete({
            //     where: {
            //         directoryName: dirName,
            //         parentDir: {
            //             directoryName: parentDirName,
            //         },
            //     },
            // });
        }
        return true;
    } catch (error) {
        console.log(error);
        return false;
    }
};
export default {
    fullTree,
    getDirectories,
    getFiles,
    createFolder,
    getDirectoryInfo,
    deleteItem,
};
