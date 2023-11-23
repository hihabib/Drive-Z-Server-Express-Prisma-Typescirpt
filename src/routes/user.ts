import { Router } from "express";
import { authenticate } from "../middleware/authenticate";
import controller from "../controller/user";

const router = Router();

router.get("/", authenticate, controller.getUser);
export default router;
