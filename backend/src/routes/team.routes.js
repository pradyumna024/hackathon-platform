import Router from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { createTeam } from "../controllers/team.controller.js"

const router = Router()

router.route("/create-team").post(verifyJWT, createTeam)

export default router