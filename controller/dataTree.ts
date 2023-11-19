import { type Request, type Response } from "express";
import service from "../service/dataTree";
import { isEmptyObj } from "../utils/objectUtil";

const fullTree = async (req: Request, res: Response): Promise<void> => {
    const { username } = req.params;
    const fullTreeStructures = await service.fullTree(username);
    res.status(200).json(fullTreeStructures);
};
const getDirectories = (req: Request, res: Response): void => {
    (async () => {
        const pathObject = req.params;
        let nestedPath = "";
        if (!isEmptyObj(pathObject)) {
            nestedPath = pathObject[0];
        }
        const { id } = req.user!;
        const directories = await service.getDirectories(id, nestedPath);
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
        const pathObject = req.params;
        const nestedPath = pathObject[0] ?? "";

        const { id } = req.user!;
        const files = await service.getFiles(id, nestedPath);
        if (files != null) {
            res.status(200).json(files);
        } else {
            res.status(404).json({ message: "Files Not Found" });
        }
    })().catch((error) => {
        console.log(error);
    });
};

const createFolder = (req: Request, res: Response): void => {
    (async () => {
        const params = req.params;
        const path = params[0] ?? "";
        const { id } = req.user!;
        await service.createFolder(id, path);
        res.status(201).json({
            message: "Folder created",
        });
    })().catch((error) => {
        console.log(error);
        throw new Error("Folder Creation error");
    });
};

export default {
    fullTree,
    getDirectories,
    getFiles,
    createFolder,
};
