import { Router } from "express";
import * as controller from "../controller/download";

const router = Router();

router.get("/file/:fileId", controller.fileDownload);
router.get("/directory/:folderId", controller.directoryDownload);

export default router;
