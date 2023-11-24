import * as fs from "fs-extra";
import * as path from "path";
import { PrismaClient } from "@prisma/client";
import { getUser } from "../utils/user";

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
        let isDir: boolean = false;
        let isFile: boolean = false;
        let item: null | { baseSlug: string | null };

        // is file or not
        item = await prisma.file.findUnique({
            where: {
                id: itemId,
                owner: username,
            },
            select: {
                baseSlug: true,
            },
        });
        if (item !== null) {
            isFile = true;
        } else {
            // if not file, then check is directory or not
            item = await prisma.directory.findUnique({
                where: {
                    id: itemId,
                    owner: username,
                },
                select: {
                    baseSlug: true,
                },
            });
            if (item !== null) {
                isDir = true;
            } else {
                // not file and not directory
                return false;
            }
        }
        // get baseSlug of item
        const { baseSlug } = item;
        // if baseSlug not found
        if (baseSlug === null) {
            return false;
        }

        const baseSlugArr = baseSlug.split("/");
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
        baseSlugArr.pop();
        baseSlugArr.push(newName);
        const newBaseSlug = baseSlugArr.join("/");

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
