import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createHackathon, getAllHackathons, getHackathonById } from "../controllers/hackathon.controller.js";

const router = Router();

router.route("/").get(getAllHackathons).post(verifyJWT, createHackathon);
router.route("/:hackathonId").get(getHackathonById);


export default router