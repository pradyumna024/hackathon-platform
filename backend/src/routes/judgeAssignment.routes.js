import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createJudgeAssignment, getAssignmentsByHackathon, getMyJudgeAssignments } from "../controllers/judgeAssignment.controller.js";

const router = Router();

router.route("/").post(verifyJWT, createJudgeAssignment)
router.route("/my-assignments").get(verifyJWT, getMyJudgeAssignments)
router.route("/hackathon/:hackathonId").get(verifyJWT, getAssignmentsByHackathon);

export default router