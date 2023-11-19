import {Router} from 'express'
import * as controller from '../controller/options'

const router = Router();
router.post("/rename/*", controller.rename);

export default router;