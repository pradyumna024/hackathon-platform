import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { createProject, getProject, updateProject } from "../controllers/project.controller";

const router = Router();

router.route("/").post(verifyJWT, createProject);
router.route("/team/:teamId").get(verifyJWT, getProjectByTeamId);
router.route("/:projectId").patch(verifyJWT, updateProject)

export default router