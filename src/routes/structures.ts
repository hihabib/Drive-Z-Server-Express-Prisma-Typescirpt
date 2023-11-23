import { Router } from "express";
import * as controller from "../controller/structures";
import * as middleware from "../middleware/authenticate";

const router = Router();

// get directory list
router.get(
    "/get-directories",
    middleware.authenticate,
    controller.getDirectories,
);
router.get(
    "/get-directories/*",
    middleware.authenticate,
    controller.getDirectories,
);

// get directory info
router.get(
    "/get-directory-info",
    middleware.authenticate,
    controller.getDirectoryInfo,
);
router.get(
    "/get-directory-info/*",
    middleware.authenticate,
    controller.getDirectoryInfo,
);

// get file list
router.get("/get-files", middleware.authenticate, controller.getFiles);
router.get("/get-files/*", middleware.authenticate, controller.getFiles);

// create directory
router.get(
    "/create-directory",
    middleware.authenticate,
    controller.createDirectory,
);
router.get(
    "/create-directory/*",
    middleware.authenticate,
    controller.createDirectory,
);

// delete file and directory
router.get("/delete/:id", middleware.authenticate, controller.deleteItem);

export default router;
