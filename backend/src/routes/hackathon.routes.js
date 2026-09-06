import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createHackathon } from "../controllers/hackathon.controller.js";

const router = Router();

router.route("/").post(verifyJWT, createHackathon);

export default router