import { Router } from "express";
import controller from "../controller/dataTree";
import { authenticate } from "../middleware/authenticate";

const router = Router();

// get directory list
router.get("/get-directories/", authenticate, controller.getDirectories);
router.get("/get-directories/*", authenticate, controller.getDirectories);

// get directory info
router.get("/get-directory-info", authenticate, controller.getDirectoryInfo);
router.get("/get-directory-info/*", authenticate, controller.getDirectoryInfo);

// get file list
router.get("/get-files", authenticate, controller.getFiles);
router.get("/get-files/*", authenticate, controller.getFiles);

// create directory
router.get("/create-directory", authenticate, controller.createDirectory);
router.get("/create-directory/*", authenticate, controller.createDirectory);

// delete file and directory
router.get("/delete/:id", authenticate, controller.deleteItem);

export default router;
