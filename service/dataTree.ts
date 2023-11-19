import FakeDB from "../fakeDB";
import { type FileAndDirectoryStructures } from "../model/model";
import { getDirectoryList, getFileList } from "../utils/fileSystem";
import { type IFileAndDirectory } from "../utils/fileSystem";
import fs from "fs/promises";
import path from "path";
import { PrismaClient } from "@prisma/client";

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
        }
        await fs.mkdir(`userData/${id}/${directoryPath}`, {
            recursive: true,
        });
        const newDirectoryName = path.basename(directoryPath);
        const mainPathName = path.dirname(directoryPath);
        const parentFolderName = path.basename(mainPathName);
        console.log(newDirectoryName, mainPathName, parentFolderName);

        await prisma.directory.create({
            data: {
                directoryName: newDirectoryName,
            },
        });

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
};
