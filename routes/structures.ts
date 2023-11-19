import { Router } from "express";
import controller from "../controller/dataTree";
import { authenticate } from "../middleware/authenticate";

const router = Router();

router.get("/get-directories", authenticate, controller.getDirectories);
router.get("/get-directories/*", authenticate, controller.getDirectories);

router.get("/get-files", authenticate, controller.getFiles);
router.get("/get-files/*", authenticate, controller.getFiles);

router.get("/create-folder", authenticate, controller.createFolder);
router.get("/create-folder/*", authenticate, controller.createFolder);
export default router;
