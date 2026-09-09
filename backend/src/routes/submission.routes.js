import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { getSubmissionByProject, getSubmissionsByHackathon, submission } from "../controllers/submission.controller";

const router = Router();

router.route("/").post(verifyJWT, submission);
router.route("/hackathon/:hackathonId").get(verifyJWT, getSubmissionsByHackathon)
router.route("/project/:projectId").get(verifyJWT, getSubmissionByProject)

export default router;