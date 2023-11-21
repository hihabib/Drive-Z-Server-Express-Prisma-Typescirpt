import * as fs from "fs-extra";
import * as path from "path";

export const renameFileOrDirectory = (
    filePath: string,
    newName: string,
): boolean => {
    // Check if the provided path exists
    if (!fs.existsSync(filePath)) {
        console.error(`Error: The specified path does not exist - ${filePath}`);
        return false;
    }

    // Extract the directory and file/directory name from the path
    const directory = path.dirname(filePath);
    const oldName = path.basename(filePath);

    // Construct the new path with the new name
    const newPath = path.join(directory, newName);

    try {
        // Rename the file or directory using fs-extra's move method
        if (fs.lstatSync(filePath).isDirectory()) {
            fs.copySync(filePath, newPath);
            fs.removeSync(filePath);
        } else if (fs.lstatSync(filePath).isFile()) {
            fs.renameSync(filePath, newPath);
        }
        return true;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(`Error renaming item: ${oldName} - ${error.message}`);
        } else {
            console.error(
                `Unknown error occurred while renaming item: ${oldName}`,
            );
        }
        return false;
    }
};
