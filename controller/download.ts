import { type Request, type Response } from "express";
import { isEmptyObj } from "../utils/objectUtil";
import { isFileAvailable } from "../utils/fileSystem";
import path from "path";
import { compressFolder } from "qiao-compress";

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

export const folderDownload = (req: Request, res: Response): void => {
    (async () => {
        const pathObject = req.params;
        let folderPath = "";
        if (!isEmptyObj(pathObject)) {
            folderPath = pathObject[0];
        }
        const { username } = req.user!;
        // const username = "habibulislam";
        const sourceFolder = path.join("userData", username, folderPath);
        const destPath = `userData/${username}/_download/compressed.zip`;
        compressFolder(
            "zip",
            sourceFolder,
            destPath,
            function () {
                // success
                res.status(200).download(destPath, (error) => {
                    console.log(error);
                });
            },
            function (e) {
                // fail
                console.log(`compress folder fail`);
                console.log(`   source folder:  ${sourceFolder}`);
                console.log(`   error:          ${e.toString()}`);
                res.status(200).json({});
            },
        );
    })().catch((error) => {
        console.log(error);
    });
};
