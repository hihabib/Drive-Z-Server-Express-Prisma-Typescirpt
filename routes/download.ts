import {Router} from 'express';
import * as controller from '../controller/download'
const router = Router();

router.get("/file/*", controller.fileDownload);
router.get("/folder/*", controller.folderDownload);

export default router;