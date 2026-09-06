import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { createHackathon, deleteHackathon, getAllHackathons, getHackathonById, updateHackathon } from "../controllers/hackathon.controller.js";

const router = Router();

router.route("/").get(getAllHackathons).post(verifyJWT, createHackathon);
router.route("/:hackathonId").get(getHackathonById).patch(verifyJWT, updateHackathon).delete(verifyJWT, deleteHackathon);


export default router