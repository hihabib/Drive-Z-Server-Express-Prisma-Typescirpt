import FakeDB from "../fakeDB";
import { type FileAndDirectoryStructures } from "../model/model";
import { getDirectoryList, getFileList } from "../utils/fileSystem";
import { type IFileAndDirectory } from "../utils/fileSystem";
import fs from "fs/promises";
import path from "path";
import { PrismaClient } from "@prisma/client";
import { type FolderInformation } from "../model/structure";

const prisma = new PrismaClient();

const fullTree = async (
    username: string,
): Promise<FileAndDirectoryStructures> => {
    const fakeDB = new FakeDB(username);
    return await fakeDB.getFullTreeStructure();
};

const getDirectories = async (
    id: string,
    path: string = "",
): Promise<IFileAndDirectory[] | undefined> => {
    return await getDirectoryList(`userData/${id}/${path}`);
};
const getFiles = async (
    id: string,
    path: string = "",
): Promise<IFileAndDirectory[] | undefined> => {
    return await getFileList(`userData/${id}/${path}`);
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
