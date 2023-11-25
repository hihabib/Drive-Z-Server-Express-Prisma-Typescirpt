import * as fs from "fs-extra";
import * as path from "path";
import { PrismaClient } from "@prisma/client";
import { getUser } from "../utils/user";
import {
    getDirectoryInfoById,
    getFileInfoById,
    isDirectoryId,
    isFileId,
} from "../utils/structures";
import {
    type DirectoryInformation,
    type FileInformation,
} from "../model/structure";
import {
    getAllChildDirectoriesId,
    getAllChildFilesId,
    getDirectoryBaseSlug,
    getFileBaseSlug,
    moveItem,
    trashDirectory,
    trashFile,
} from "../utils/options";

const prisma = new PrismaClient();

export const renameFileOrDirectory = async (
    userId: string,
    itemId: string,
    newName: string,
): Promise<boolean> => {
    try {
        // get username by userId
        const user = await getUser(userId);
        if (user === null) {
            return false;
        }
        const { username } = user;

        // initialize detector variable if it is file or directory or nothing
        const isDir: boolean = await isDirectoryId(itemId);
        const isFile: boolean = await isFileId(itemId);

        // if not file and not item
        if (!isFile && !isDir) {
            return false;
        }

        let item: null | { baseSlug: string | null } = null;
        if (isFile) {
            item = await prisma.file.findUnique({
                where: {
                    id: itemId,
                    owner: username,
                },
                select: {
                    baseSlug: true,
                },
            });
        }
        if (isDir) {
            item = await prisma.directory.findUnique({
                where: {
                    id: itemId,
                    owner: username,
                },
                select: {
                    baseSlug: true,
                },
            });
        }

        // if item not found
        if (item === null) {
            return false;
        }
        // get baseSlug of item
        const { baseSlug } = item;

        // if baseSlug not found
        if (baseSlug === null) {
            return false;
        }
        const oldBaseSlug = baseSlug;

        const baseSlugArr = oldBaseSlug.split("/");
        const filePath = path.join("userData", ...baseSlugArr);
        // Check if the provided path exists
        if (!fs.existsSync(filePath)) {
            console.error(
                `Error: The specified path does not exist - ${filePath}`,
            );
            return false;
        }

        // Extract the parent directory names from the path and construct the new path with the new name
        const parentDirectory = path.dirname(filePath);
        const newPath = path.join(parentDirectory, newName);

        // remove item's old name from baseSlugArr and push new name to construct newBaseSlug
        console.log("before pop", baseSlugArr);
        baseSlugArr.pop();
        console.log("after pop, before push", baseSlugArr);
        baseSlugArr.push(newName);
        console.log("after push", baseSlugArr);
        const newBaseSlug = baseSlugArr.join("/");
        console.log("newBaseSlug after joining /", newBaseSlug);

        const updateObj = {
            where: {
                id: itemId,
                owner: username,
            },
            data: {
                [isDir ? "directoryName" : "fileName"]: newName,
                baseSlug: newBaseSlug,
            },
        };
        // Rename the file or directory using fs-extra's move method
        if (isDir) {
            // copy old directory to new path
            fs.copySync(filePath, newPath);
            // delete old directory
            fs.removeSync(filePath);
            // update directory info in DB
            await prisma.directory.update(updateObj);

            // update baseSlugs of all children (files + directories)

            // update baseSlugs of all children files
            const allChildFilesId = await getAllChildFilesId(itemId);
            for (let i = 0; i < allChildFilesId.length; i++) {
                const fileId = allChildFilesId[i];
                const childFileBaseSlug = await getFileBaseSlug(fileId);
                if (childFileBaseSlug === null) {
                    console.log(`baseURL of ${fileId} - file is null`);
                    return false;
                }

                // split file's baseSlug with the oldBaseSlug of the directory which is renaming
                const childFileBaseSlugArr =
                    childFileBaseSlug.split(oldBaseSlug);
                // remove old base slug and add new slug in the array
                childFileBaseSlugArr.splice(0, 1, newBaseSlug);
                // construct new baseSlug for child file.
                const newChildFileBaseSlug = childFileBaseSlugArr.join("");

                // update file
                await prisma.file.update({
                    where: {
                        id: fileId,
                    },
                    data: {
                        baseSlug: newChildFileBaseSlug,
                    },
                });
            }

            // update baseSlugs of all children directories
            const allChildDirectoriesId =
                await getAllChildDirectoriesId(itemId);
            // remove current editing directory from allChildDirectoriesId as it is updated above. the current directoryId is in first position in the allChildDirectoriesId array.
            allChildDirectoriesId.shift();

            for (let i = 0; i < allChildDirectoriesId.length; i++) {
                const directoryId = allChildDirectoriesId[i];
                const childDirectoryBaseSlug =
                    await getDirectoryBaseSlug(directoryId);
                if (childDirectoryBaseSlug === null) {
                    console.log(
                        `baseURL of ${directoryId} - directory is null`,
                    );
                    return false;
                }

                // split directory's baseSlug with the oldBaseSlug of the directory which is renaming
                const childDirectoryBaseSlugArr =
                    childDirectoryBaseSlug.split(oldBaseSlug);
                // remove old base slug and add new slug in the array
                childDirectoryBaseSlugArr.splice(0, 1, newBaseSlug);
                // construct new baseSlug for child directory.
                const newChildDirectoryBaseSlug =
                    childDirectoryBaseSlugArr.join("");

                // update directory
                await prisma.directory.update({
                    where: {
                        id: directoryId,
                    },
                    data: {
                        baseSlug: newChildDirectoryBaseSlug,
                    },
                });
            }
        } else if (isFile) {
            // rename file
            fs.renameSync(filePath, newPath);
            // update file info in DB
            await prisma.file.update(updateObj);
        } else {
            return false;
        }
        return true;
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error(`Error renaming item: ${itemId} - ${error.message}`);
        } else {
            console.error(
                `Unknown error occurred while renaming item: ${itemId}`,
            );
        }
        return false;
    }
};

export const trashItem = async (
    userId: string,
    itemId: string,
): Promise<boolean> => {
    try {
        const user = await getUser(userId);

        // if user not found
        if (user === null) {
            console.error("User not found");
            return false;
        }
        // check the item is file or directory

        const isFile = await isFileId(itemId);
        const isDir = await isDirectoryId(itemId);

        // it the item is not item and not directory
        if (!isDir && !isFile) {
            return false;
        }

        // initialize item to store file or directory information
        let item: FileInformation | DirectoryInformation | null = null;

        // store item data in item variable
        if (isFile) {
            item = await getFileInfoById(itemId);
        } else if (isDir) {
            item = await getDirectoryInfoById(itemId);
        }

        // if file or directory not found
        if (item === null) {
            return false;
        }

        // get baseSlug from item
        const { baseSlug } = item;

        // if baseSlug not found
        if (baseSlug === null) {
            return false;
        }

        // item old path (original path)
        const baseSlugArr = baseSlug.split("/");
        const itemOldPath = path.join("userData", ...baseSlugArr);

        // item new path (trash path)
        const trashBaseSlugArr = [...baseSlugArr];
        trashBaseSlugArr.splice(1, 0, "__trash__");

        // create directories for trash
        if (isFile) {
            // file name has to be removed because filename need not create a directory
            const fileName = trashBaseSlugArr.pop();
            // if fileName is undefined, that means the trashBaseSlugArr is empty
            if (fileName === undefined) {
                return false;
            }
            // create directories
            await fs.mkdir(path.join("userData", ...trashBaseSlugArr), {
                recursive: true,
            });
            // restore the filename after creating directory is done.
            trashBaseSlugArr.push(fileName);
        } else if (isDir) {
            // create directories
            await fs.mkdir(path.join("userData", ...trashBaseSlugArr), {
                recursive: true,
            });
        }

        const itemNewPath = path.join("userData", ...trashBaseSlugArr);

        // move to trash (in file system - files and directories)
        const isMoved = await moveItem(itemOldPath, itemNewPath);
        // move to trash (in Database - directories)
        if (isMoved && isDir) {
            // make all child files to trashItem in DB (Recursively)
            const allChildFiles = await getAllChildFilesId(itemId);
            for (let i = 0; i < allChildFiles.length; i++) {
                await trashFile(allChildFiles[i], true);
            }

            // make all child directories to trashItem in DB (Recursively)
            const allChildDirectories = await getAllChildDirectoriesId(itemId);
            for (let i = 0; i < allChildDirectories.length; i++) {
                await trashDirectory(allChildDirectories[i], true);
            }
        }

        // move to trash (in Database - file)
        if (isMoved && isFile) {
            await trashFile(itemId, true);
        }
        return isMoved;
    } catch (error) {
        console.error(error);
        return false;
    }
};
