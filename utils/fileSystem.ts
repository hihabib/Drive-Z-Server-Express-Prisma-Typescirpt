import fs from "fs/promises";

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
