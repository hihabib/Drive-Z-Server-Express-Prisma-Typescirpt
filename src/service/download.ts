import { PrismaClient } from "@prisma/client";
import path from "path";
import { compressFolder as compressDirectory } from "qiao-compress";
import fs from "fs";

const prisma = new PrismaClient();
const getFilePath = async (
    userId: string,
    fileId: string,
): Promise<false | string> => {
    const baseSlugContainer = await prisma.file.findUnique({
        where: {
            id: fileId,
        },
        select: {
            baseSlug: true,
        },
    });
    if (baseSlugContainer === null || baseSlugContainer.baseSlug === null) {
        return false;
    }
    const { baseSlug } = baseSlugContainer;
    const baseSlugArr = baseSlug.split("/");

    return path.join("userData", ...baseSlugArr);
};

const downloadDirectory = async (
    userId: string,
    folderId: string,
    success: (downloadLink: string) => void,
    failed: (e: Error) => void,
): Promise<boolean | undefined> => {
    const baseSlugContainer = await prisma.directory.findUnique({
        where: {
            id: folderId,
        },
        select: {
            baseSlug: true,
        },
    });
    if (baseSlugContainer === null) {
        return false;
    }
    const { baseSlug } = baseSlugContainer;
    if (baseSlug === null) {
        return false;
    }
    const baseSlugArr = baseSlug.split("/");
    const compressionDirectoryPath = path.join("userData", ...baseSlugArr);

    // create _download folder if not exist
    if (!fs.existsSync(path.join("userData", "_download"))) {
        fs.mkdir(path.join("userData", "_download"), (err) => {
            if (err != null) {
                throw new Error("Can't create _download Folder");
            }
        });
    }
    const downloadLink = path.join("userData", "_download", `${folderId}.zip`);
    console.log(compressionDirectoryPath);
    compressDirectory(
        "zip",
        compressionDirectoryPath,
        downloadLink,
        function () {
            success(downloadLink);
        },
        failed,
    );
};
export default {
    getFilePath,
    downloadDirectory,
};
