import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { createProject } from "../controllers/project.controller";

const router = Router();

router.route("/").post(verifyJWT, createProject);

export default router