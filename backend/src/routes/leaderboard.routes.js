import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";
import { getLeaderboard } from "../controllers/leaderboard.controller";

const router = Router();

router.route("/leaderboard").get(verifyJWT, getLeaderboard);

export default router;