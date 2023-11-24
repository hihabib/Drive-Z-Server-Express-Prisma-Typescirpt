import { Router } from "express";
import * as controller from "../controller/options";
import * as middleware from "../middleware/authenticate";

const router = Router();
router.post("/rename/:itemId", middleware.authenticate, controller.rename);

// trash and delete file and directory
router.get("/trash/:itemId", middleware.authenticate, controller.trashItem);
export default router;
