import { type Request, type Response } from "express";
import * as service from "../service/options";

export const rename = (req: Request, res: Response): void => {
    (async (): Promise<void> => {
        const { itemId } = req.params;
        const { newName } = req.body;
        const { user } = req;
        if (user === undefined) {
            return;
        }
        const { id: userId } = user;
        const isRenamed = await service.renameFileOrDirectory(
            userId,
            itemId,
            newName,
        );
        if (isRenamed) {
            res.status(200).json({ message: "Rename successful" });
        } else {
            res.status(501).json({ message: "Rename unsuccessful" });
        }
    })().catch((error) => {
        console.log(error);
    });
};
export const trashItem = (req: Request, res: Response): void => {
    (async () => {
        const { user } = req;
        if (user === undefined) {
            return;
        }
        const { id: userId } = user;
        const { itemId } = req.params;
        const isMovedToTrash = await service.trashItem(userId, itemId);
        if (isMovedToTrash) {
            res.status(200).json({
                message: "Moving to trash is successful",
            });
        } else {
            res.status(501).json({
                message: "Moving to trash is failed",
            });
        }
    })().catch((error) => {
        console.log(error);
    });
};
