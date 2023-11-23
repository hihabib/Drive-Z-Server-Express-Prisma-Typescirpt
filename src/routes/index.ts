import authRoute from './auth'
import structuresRoute from './structures'
import userDataRoute from './user'
import downloadRoute from './download'
import optionsRoute from './options'
import {Router} from 'express';
import {authenticate} from "../middleware/authenticate";

const router = Router();

router.use("/api/v1/auth", authRoute)
router.use("/api/v1/user", userDataRoute)
router.use("/api/v1/structures", authenticate, structuresRoute)
router.use("/api/v1/download", authenticate, downloadRoute)
router.use("/api/v1/options", authenticate, optionsRoute)

export default router;