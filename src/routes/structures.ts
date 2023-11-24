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

export default router;
