import authRoute from "./auth";
import userDataRoute from "./user";
import structuresRoute from "./structures";
import downloadRoute from "./download";
import optionsRoute from "./options";
import { Router } from "express";
import * as middleware from "../middleware/authenticate";

const router = Router();
router.use("/api/v1/auth", authRoute);
router.use("/api/v1/user", userDataRoute);
router.use("/api/v1/structures", middleware.authenticate, structuresRoute);
router.use("/api/v1/download", middleware.authenticate, downloadRoute);
router.use("/api/v1/options", middleware.authenticate, optionsRoute);

export default router;
