import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { createProject, getProjectByTeamId, getProjectsByHackathonId, updateProject } from "../controllers/project.controller";

const router = Router();

router.route("/").post(verifyJWT, createProject);
router.route("/team/:teamId").get(verifyJWT, getProjectByTeamId);
router.route("/:projectId").patch(verifyJWT, updateProject)
router.route("/:hackathon/:hackathonId").get(getProjectsByHackathonId)

export default router