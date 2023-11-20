import { Router } from "express";
import controller from "../controller/dataTree";
import { authenticate } from "../middleware/authenticate";

const router = Router();

// get directory list
router.get("/get-directories", authenticate, controller.getDirectories);
router.get("/get-directories/*", authenticate, controller.getDirectories);

// get folder info
router.get("/get-directory-info", authenticate, controller.getDirectoryInfo);
router.get("/get-directory-info/*", authenticate, controller.getDirectoryInfo);

// get file list
router.get("/get-files", authenticate, controller.getFiles);
router.get("/get-files/*", authenticate, controller.getFiles);

// create folder
router.get("/create-folder", authenticate, controller.createFolder);
router.get("/create-folder/*", authenticate, controller.createFolder);

// delete file and folder
router.get("/delete", authenticate, controller.deleteItem);
router.get("/delete/*", authenticate, controller.deleteItem);

export default router;
