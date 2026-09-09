import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { getSubmissionByProject, getSubmissionsByHackathon, submission } from "../controllers/submission.controller.js";

const router = Router();

router.route("/").post(verifyJWT, submission);
router.route("/hackathon/:hackathonId").get(verifyJWT, getSubmissionsByHackathon)
router.route("/project/:projectId").get(verifyJWT, getSubmissionByProject)

export default router;