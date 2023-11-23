import { Router } from "express";
import * as controller from "../controller/options";

const router = Router();
router.post("/rename/:itemId", controller.rename);

export default router;
