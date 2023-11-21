import { type Request, type Response } from "express";
import { renameFileOrDirectory } from "../service/options";
import path from "path";

export const rename = (req: Request, res: Response): void => {
    const { 0: providedPath } = req.params;
    const { newName } = req.body;
    const { username } = req.user!;
    const filePath = path.join("userData", username, providedPath);
    const isRenamed = renameFileOrDirectory(filePath, newName);
    if (isRenamed) {
        res.status(200).json({ message: "Rename successful" });
    } else {
        res.status(501).json({ message: "Rename unsuccessful" });
    }
};
