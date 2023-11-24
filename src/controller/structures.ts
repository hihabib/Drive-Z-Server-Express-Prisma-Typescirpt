import { type Request, type Response } from "express";
import * as service from "../service/structures";

export const getDirectories = (req: Request, res: Response): void => {
    (async () => {
        const { id: userId } = req.user!;
        let { "0": slug } = req.params;
        slug = slug !== undefined ? userId + "/" + slug : userId;

        const directories = await service.getDirectories(userId, slug);
        if (directories != null) {
            res.status(200).json(directories);
        } else {
            res.status(404).json({ message: "Directories Not Found" });
        }
    })().catch((error) => {
        console.log(error);
    });
};
export const getFiles = (req: Request, res: Response): void => {
    (async () => {
        const { id: userId } = req.user!;
        let { "0": slug } = req.params;
        slug = slug !== undefined ? "/" + slug : userId;

        const files = await service.getFiles(userId, slug);
        if (files !== null) {
            res.status(200).json(files);
        } else {
            res.status(404).json({ message: "Files Not Found" });
        }
    })().catch((error) => {
        console.log(error);
    });
};

export const createDirectory = (req: Request, res: Response): void => {
    (async () => {
        const { id: userId } = req.user ?? {};
        if (userId === undefined) {
            throw new Error("userID not found. May be authentication failed");
        }
        const { "0": directoryPath = userId } = req.params;
        const directoriesName = directoryPath.split("/");
        const isCreated = await service.createDirectory(
            userId,
            ...directoriesName,
        );
        if (!isCreated) {
            throw new Error("Directory creation failed");
        }
        res.status(201).json({
            message: "Directory created",
        });
    })().catch((error) => {
        console.log(error);
        throw new Error("Directory Creation error");
    });
};
