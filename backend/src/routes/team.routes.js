import Router from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { createTeam, respondToInvitation, sendInvitation } from "../controllers/team.controller.js"

const router = Router()

router.route("/create-team").post(verifyJWT, createTeam)
router.route("/:teamId/invite").post(verifyJWT, sendInvitation)
router.route("/:teamId/invitation/:invitationId").patch(verifyJWT, respondToInvitation)

export default router