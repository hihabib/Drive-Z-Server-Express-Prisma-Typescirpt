import fs, { readdir } from "fs/promises";
import { type Dirent } from "fs";
import { v4 as uuidV4 } from "uuid";

export interface IFileAndDirectory {
    id: string;
    name: string;
}

export const getDirectoryList = async (
    source: string,
): Promise<IFileAndDirectory[] | undefined> => {
    try {
        const dirents: Dirent[] = await readdir(source, {
            withFileTypes: true,
        });
        let directories = dirents
            .filter((dirent: Dirent) => dirent.isDirectory())
            .map((dirent: Dirent) => ({
                id: uuidV4(),
                name: dirent.name,
            }));
        directories = directories.filter(
            (directory) => directory.name !== "_download",
        );
        return directories;
    } catch (error) {}
};

export const getFileList = async (
    source: string,
): Promise<IFileAndDirectory[] | undefined> => {
    try {
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

export const isFileAvailable = async (filePath: string): Promise<boolean> => {
    try {
        // Use fs.access to check if the file exists
        await fs.access(filePath, fs.constants.F_OK);
        return true;
    } catch (err) {
        // File does not exist
        return false;
    }
};
