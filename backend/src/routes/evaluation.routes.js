import { Router } from "express";
import { createEvaluation, getEvaluationByAssignment, getEvaluationsByHackathon } from "../controllers/evaluation.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").post(verifyJWT, createEvaluation);
router.route("/assignment/:judgeAssignmentId").get(verifyJWT, getEvaluationByAssignment);
router.route("/hackathon/:hackathonId").get(verifyJWT, getEvaluationsByHackathon)

export default router