import mongoose from "mongoose";
import { Team } from "../models/team.model.js";
import { Hackathon } from "../models/hackathon.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createTeam = asyncHandler(async (req, res) => {
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



export { createTeam };