import { type Request, type Response } from "express";
import { renameFileOrDirectory } from "../service/options";

export const rename = (req: Request, res: Response): void => {
    (async (): Promise<void> => {
        const { itemId } = req.params;
        const { newName } = req.body;
        const { id: userId } = req.user!;
        const isRenamed = await renameFileOrDirectory(userId, itemId, newName);
        if (isRenamed) {
            res.status(200).json({ message: "Rename successful" });
        } else {
            res.status(501).json({ message: "Rename unsuccessful" });
        }
    })().catch((error) => {
        console.log(error);
    });
};
