import mongoose from "mongoose";
import { User } from "../models/user.model.js";
import { Team } from "../models/team.model.js";
import { Hackathon } from "../models/hackathon.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTeam = asyncHandler( async(req, res) => {
    const { hackathonId, name } = req.body;

    if (!hackathonId) {
        throw new ApiError(400, "Hackathon id is required");
    }

    if (!mongoose.Types.ObjectId.isValid(hackathonId)) {
        throw new ApiError(400, "Invalid hackathon id");
    }

    if (!name || name.trim() === "") {
        throw new ApiError(400, "Team name is required");
    }

    const hackathon = await Hackathon.findById(hackathonId);

    if (!hackathon) {
        throw new ApiError(404, "Hackathon not found");
    }

    if (new Date() > hackathon.registrationDeadline) {
        throw new ApiError(
            400,
            "Team registration is closed for this hackathon"
        );
    }

    const existingTeam = await Team.findOne({
        hackathonId,
        "members.userId": req.user._id
    });

    if (existingTeam) {
        throw new ApiError(
            409,
            "You are already part of a team in this hackathon"
        );
    }

    const team = await Team.create({
        hackathonId,
        name: name.trim(),
        createdBy: req.user._id,
        members: [
            {
                userId: req.user._id,
                role: "leader"
            }
        ]
    });

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                team,
                "Team created successfully"
            )
        );
});

const sendInvitation = asyncHandler(async(req, res)=>{
    const {teamId} = req.params;

    if(!teamId){
        throw new ApiError(400, "Team id is required");
    }

    if(!mongoose.Types.ObjectId.isValid(teamId)){
        throw new ApiError(400, "Invalid team id");
    }

    const team = await Team.findById(teamId);

    if(!team){
        throw new ApiError(404, "Team not found");
    }

    const leader = team.members.find(
        (member)=>
            member.userId.toString() === req.user._id.toString() &&
            member.role === "leader"
    );

    if(!leader){
        throw new ApiError(403, "Only the team leader can invite members");
    }

    const { inviteeId } = req.body;

    if (!inviteeId) {
        throw new ApiError(400, "Invitee id is required");
    }

    if (!mongoose.Types.ObjectId.isValid(inviteeId)) {
        throw new ApiError(400, "Invalid invitee id");
    }

    const invitee = await User.findById(inviteeId);

    if (!invitee) {
        throw new ApiError(404, "Invitee not found");
    }

    if (inviteeId.toString() === req.user._id.toString()) {
        throw new ApiError(400, "You cannot invite yourself");
    }


    const alreadyMember = team.members.some(
        (member) =>
            member.userId.toString() === inviteeId.toString()
    );

    if (alreadyMember) {
        throw new ApiError(
            409,
            "User is already a member of this team"
        );
    }

    const existingTeam = await Team.findOne({
        hackathonId: team.hackathonId,
        "members.userId": inviteeId
    });

    if(existingTeam){
        throw new ApiError(
            409,
            "User is already part of another team in this hackathon"
        );
    }

    const existingInvitation = team.invitations.find(
        (invitation) =>
            invitation.inviteeId.toString() === inviteeId.toString() &&
            invitation.status === "pending"
    );

    if (existingInvitation) {
        throw new ApiError(
            409,
            "Invitation already sent to this user"
        );
    }

    const hackathon = await Hackathon.findById(team.hackathonId);

    if (!hackathon) {
        throw new ApiError(404, "Hackathon not found");
    }

    if (team.members.length >= hackathon.maxTeamSize) {
        throw new ApiError(
            400,
            "Team is already full"
        );
    }

    team.invitations.push({
        inviterId: req.user._id,
        inviteeId,
        status: "pending",
        expiresAt: new Date(
            Date.now() + 24 * 60 * 60 * 1000
        )
    });

    await team.save();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                team,
                "Invitation sent successfully"
            )
        );


})

const respondToInvitation = asyncHandler(async(req, res)=>{
    const {action} = req.body;

    if (!["accept", "reject"].includes(action)) {
        throw new ApiError(
            400,
            "Action must be either accept or reject"
        );
    }

    const {teamId, invitationId} = req.params;
    if(!teamId){
        throw new ApiError(400, "Team id is required")
    }
    if(!invitationId){
        throw new ApiError(400, "Invitation id is required")
    }

    if (!mongoose.Types.ObjectId.isValid(teamId)) {
        throw new ApiError(400, "Invalid team id");
    }

    if (!mongoose.Types.ObjectId.isValid(invitationId)) {
        throw new ApiError(400, "Invalid invitation id");
    }

    const team = await Team.findById(teamId);
    if(!team){
        throw new ApiError(404, "Team not found")
    }

    const invitation = team.invitations.id(invitationId);

    if(!invitation){
        throw new ApiError(404, "Invitation not found")
    }

    if(invitation.inviteeId.toString() !== req.user._id.toString()){
        throw new ApiError(
            403,
            "You are not allowed to respond to this invitation"
        );
    }

    if (invitation.status !== "pending") {
        throw new ApiError(
            400,
            "Invitation has already been processed"
        );
    }

    if(invitation.expiresAt && invitation.expiresAt < new Date()){
        invitation.status = "expired";
        await team.save();
        throw new ApiError(
            400,
            "Invitation has expired"
        );
    }

    if(action === "reject"){
        invitation.status = "rejected";
        await team.save();

        return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {},
                    "Invitation rejected successfully"
                )
            );
    }

    const existingTeam = await Team.findOne({
        hackathonId: team.hackathonId,
        "members.userId": req.user._id,
        _id: { $ne: team._id }
    });

    if (existingTeam) {
        throw new ApiError(
            409,
            "You are already part of a team in this hackathon"
        );
    }

    const hackathon = await Hackathon.findById(team.hackathonId);

    if(!hackathon){
        throw new ApiError(404, "Hackathon not found");
    }

    if(team.members.length >= hackathon.maxTeamSize){
        throw new ApiError(
            400,
            "Team is already full"
        );
    }

    team.members.push({
        userId: req.user._id,
        role: "member"
    });

    invitation.status = "accepted";

    await team.save();

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            team,
            "Invitation accepted successfully"
        )
    );

})



export { createTeam, sendInvitation, respondToInvitation };