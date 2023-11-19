import FakeDB from "../fakeDB";
import { type FileAndDirectoryStructures } from "../model/model";
import { type IFileAndDirectory } from "../utils/fileSystem";
import fs, { readdir } from "fs/promises";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { type FolderInformation } from "../model/structure";
import { type Dirent } from "fs";
import { v4 as uuidV4 } from "uuid";

const prisma = new PrismaClient();

const fullTree = async (
    username: string,
): Promise<FileAndDirectoryStructures> => {
    const fakeDB = new FakeDB(username);
    return await fakeDB.getFullTreeStructure();
};

const getDirectories = async (
    id: string,
    sourcePath: string = "",
): Promise<IFileAndDirectory[] | undefined> => {
    try {
        const source = `userData/${id}${sourcePath}`;
        const dirents: Dirent[] = await readdir(source, {
            withFileTypes: true,
        });
        let directories = await Promise.all(
            dirents
                .filter((dirent: Dirent) => dirent.isDirectory())
                .map(async (dirent: Dirent) => {
                    const { id: dirId } = await getDirectoryInfo(
                        id,
                        source + "/" + dirent.name,
                    );
                    return {
                        id: dirId!,
                        name: dirent.name,
                    };
                }),
        );
        directories = directories.filter(
            (directory) => directory.name !== "_download",
        );
        return directories;
    } catch (error) {}
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
export default {
    fullTree,
    getDirectories,
    getFiles,
    createFolder,
    getDirectoryInfo,
};
