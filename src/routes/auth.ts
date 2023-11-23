import {Router} from 'express'
import controller from "../controller/auth";

const router = Router();

router.post('/signup', controller.signup)
router.post('/signin', controller.signin)


export default router;