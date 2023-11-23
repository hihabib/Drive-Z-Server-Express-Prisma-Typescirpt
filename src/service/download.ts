import { PrismaClient } from "@prisma/client";
import path from "path";
import { compressFolder as compressDirectory } from "qiao-compress";

const prisma = new PrismaClient();
const getFilePath = async (
    userId: string,
    fileId: string,
): Promise<false | string> => {
    const filePath = await prisma.file.findUnique({
        where: {
            id: fileId,
        },
        select: {
            baseSlug: true,
        },
    });
    if (filePath === null || filePath.baseSlug === null) {
        return false;
    }
    const { baseSlug } = filePath;
    return path.join("userData", userId) + baseSlug;
};

const downloadFolder = async (
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
    const compressionDirectoryPath = `userData/${userId}${baseSlug}`;
    const downloadLink = `userData/_download/${folderId}.zip`;
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
export default { getFilePath, downloadFolder };
