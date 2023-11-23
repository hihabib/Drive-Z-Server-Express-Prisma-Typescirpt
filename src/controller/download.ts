import { type Request, type Response } from "express";
import service from "../service/download";

export const fileDownload = (req: Request, res: Response): void => {
    (async () => {
        const { fileId } = req.params;
        const { id: userId } = req.user!;

        const filePath = await service.getFilePath(userId, fileId);
        if (filePath !== false) {
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
        const { folderId } = req.params;
        const { id: userId } = req.user!;
        await service.downloadFolder(
            userId,
            folderId,
            (downloadLink) => {
                res.status(200).download(downloadLink, (error) => {
                    if (error !== undefined) {
                        console.log(error);
                    }
                });
            },
            (e) => {
                console.log(e);
            },
        );
    })().catch((error) => {
        console.log(error);
    });
};
