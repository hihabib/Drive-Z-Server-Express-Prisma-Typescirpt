import { type Request, type Response } from "express";
import { isEmptyObj } from "../utils/objectUtil";
import { isFileAvailable } from "../utils/fileSystem";
import path from "path";
import { compressDirectory } from "qiao-compress";

export const fileDownload = (req: Request, res: Response): void => {
    (async () => {
        const pathObject = req.params;
        let filePath = "";
        if (!isEmptyObj(pathObject)) {
            filePath = pathObject[0];
        }

        const { username } = req.user!;
        filePath = `userData/${username}/${filePath}`;
        const isFile = await isFileAvailable(filePath);
        if (isFile) {
            res.status(200).download(filePath, (error) => {
                console.log(error);
            });
        } else {
            res.status(401).json({ message: "File Not found" });
        }
    })().catch((error) => {
        console.log(error);
    });
};

export const directoryDownload = (req: Request, res: Response): void => {
    (async () => {
        const pathObject = req.params;
        let directoryPath = "";
        if (!isEmptyObj(pathObject)) {
            directoryPath = pathObject[0];
        }
        const { username } = req.user!;
        // const username = "habibulislam";
        const sourceDirectory = path.join("userData", username, directoryPath);
        const destPath = `userData/${username}/_download/compressed.zip`;
        compressDirectory(
            "zip",
            sourceDirectory,
            destPath,
            function () {
                // success
                res.status(200).download(destPath, (error) => {
                    console.log(error);
                });
            },
            function (e) {
                // fail
                console.log(`compress directory fail`);
                console.log(`   source directory:  ${sourceDirectory}`);
                console.log(`   error:          ${e.toString()}`);
                res.status(200).json({});
            },
        );
    })().catch((error) => {
        console.log(error);
    });
};
