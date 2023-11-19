import fs, { readdir } from "fs/promises";
import { type Dirent } from "fs";
import { v4 as uuidV4 } from "uuid";

export interface IFileAndDirectory {
    id: string;
    name: string;
}

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
