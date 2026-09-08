import Router from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { createTeam, getMyTeam, getTeamDetails, leaveTeam, removeMember, respondToInvitation, sendInvitation } from "../controllers/team.controller.js"

const router = Router()

router.route("/create-team").post(verifyJWT, createTeam)
router.route("/:teamId/invite").post(verifyJWT, sendInvitation)
router.route("/:teamId/invitation/:invitationId").patch(verifyJWT, respondToInvitation)
router.route("/:teamId").get(getTeamDetails)
router.route("/my-team/:hackathonId").get(verifyJWT, getMyTeam)
router.route("/:teamId/leave").patch(verifyJWT, leaveTeam)
router.route("/:teamId/remove-member/:memberId").patch(verifyJWT, removeMember)

export default router