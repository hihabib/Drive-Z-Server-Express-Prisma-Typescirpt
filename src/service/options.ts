import * as fs from "fs-extra";
import * as path from "path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const renameFileOrDirectory = async (
    userId: string,
    itemId: string,
    newName: string,
): Promise<boolean> => {
    try {
        let isDir: boolean = false;
        let isFile: boolean = false;
        let item: null | { baseSlug: string | null };
        item = await prisma.file.findUnique({
            where: {
                id: itemId,
            },
            select: {
                baseSlug: true,
            },
        });
        if (item !== null) {
            isFile = true;
        } else {
            item = await prisma.directory.findUnique({
                where: {
                    id: itemId,
                },
                select: {
                    baseSlug: true,
                },
            });
            if (item !== null) {
                isDir = true;
            } else {
                return false;
            }
        }

        const { baseSlug } = item;
        if (baseSlug !== null) {
            const filePath = path.join("userData", userId) + baseSlug;
            // Check if the provided path exists
            if (!fs.existsSync(filePath)) {
                console.error(
                    `Error: The specified path does not exist - ${filePath}`,
                );
                return false;
            }

            // Extract the directory and file/directory name from the path
            const parentDirectory = path.dirname(filePath);

            // Construct the new path with the new name
            const newPath = path.join(parentDirectory, newName);
            const oldBaseSlugArr = baseSlug.split("/");
            oldBaseSlugArr.pop();
            oldBaseSlugArr.push(newName);
            const newBaseSlug = oldBaseSlugArr.join("/");

            const updateObj = {
                where: {
                    id: itemId,
                },
                data: {
                    [isDir ? "directoryName" : "fileName"]: newName,
                    baseSlug: newBaseSlug,
                },
            };
            // Rename the file or directory using fs-extra's move method
            if (isDir) {
                fs.copySync(filePath, newPath);
                fs.removeSync(filePath);
                await prisma.directory.update(updateObj);
            } else if (isFile) {
                fs.renameSync(filePath, newPath);
                await prisma.file.update(updateObj);
            } else {
                return false;
            }

            return true;
        } else {
            return false;
        }
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
