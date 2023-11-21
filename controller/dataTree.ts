import { type Request, type Response } from "express";
import service from "../service/dataTree";

const getDirectories = (req: Request, res: Response): void => {
    (async () => {
        const { id: userId } = req.user!;
        let { "0": slug } = req.params;
        slug = slug !== undefined ? "/" + slug : userId;

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
const getFiles = (req: Request, res: Response): void => {
    (async () => {
        const { id: userId } = req.user!;
        let { "0": slug } = req.params;
        slug = slug !== undefined ? "/" + slug : userId;

        const files = await service.getFiles(userId, slug);
        if (files !== false) {
            res.status(200).json(files);
        } else {
            res.status(404).json({ message: "Files Not Found" });
        }
    })().catch((error) => {
        console.log(error);
    });
};

const createDirectory = (req: Request, res: Response): void => {
    (async () => {
        const { id: userId } = req.user!;
        const params = req.params;
        const directoryPath =
            params[0] !== undefined
                ? !params[0].startsWith("/")
                    ? "/" + params[0]
                    : params[0]
                : userId;
        await service.createDirectory(userId, directoryPath);
        res.status(201).json({
            message: "Directory created",
        });
    })().catch((error) => {
        console.log(error);
        throw new Error("Directory Creation error");
    });
};

const getDirectoryInfo = (req: Request, res: Response): void => {
    (async () => {
        const { params } = req;
        const { id: userId } = req.user!;
        const baseSlug = params["0"] !== undefined ? "/" + params[0] : userId;
        const result = await service.getDirectoryInfo(userId, baseSlug);
        if (typeof result === "boolean") {
            return res.status(404).json({
                message: "Directory not found",
            });
        }
        res.status(200).json({
            ...result,
        });
    })().catch((error) => {
        console.log(error);
    });
};

const deleteItem = (req: Request, res: Response): void => {
    (async () => {
        const { id: userId } = req.user!;
        const { id: itemId } = req.params;
        // await service.deleteItem(userId, itemId);
    })().catch((error) => {
        console.log(error);
    });
};

export default {
    getDirectories,
    getFiles,
    createDirectory,
    getDirectoryInfo,
    deleteItem,
};
