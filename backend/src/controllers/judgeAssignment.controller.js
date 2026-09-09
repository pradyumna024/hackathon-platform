import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/user.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Submission } from "../models/submission.model.js";
import { Hackathon } from "../models/hackathon.model.js";
import { JudgeAssignment } from "../models/judgeAssignment.model.js"

const createJudgeAssignment = asyncHandler(async(req, res)=>{
    const { judgeId, submissionId} = req.body;

    if(!judgeId || !submissionId){
        throw new ApiError(400, "Judge id and submission id are required");
    }

    if(!mongoose.Types.ObjectId.isValid(judgeId)){
        throw new ApiError(400, "Invalid judge id")
    }

    if(!mongoose.Types.ObjectId.isValid(submissionId)){
        throw new ApiError(400, "Invalid submission id")
    }

    const submission = await Submission.findById(submissionId)

    if(!submission){
        throw new ApiError(404, "Submission not found")
    }

    const hackathon = await Hackathon.findById(submission.hackathonId)

    if(!hackathon){
        throw new ApiError(404, "Hackathon not found")
    }

    if(hackathon.organiserId.toString() !== req.user._id.toString()){
        throw new ApiError(403, "Only the hackathon organiser can assign judges")
    }

    const judge = await User.findById(judgeId);

    if (!judge) {
        throw new ApiError(404, "Judge user not found");
    }

    const existingAssignment = await JudgeAssignment.findOne({
        judgeId,
        submissionId
    })

    if(existingAssignment){
        throw new ApiError(409, "Judge is already assigned to this submission")
    }

    const assignment = await JudgeAssignment.create({
        judgeId,
        submissionId,
        hackathonId: submission.hackathonId
    });

    return res.status(201).json(
        new ApiResponse(
            201,
            assignment,
            "Judge assigned successfully"
        )
    );
})

const getMyJudgeAssignments = asyncHandler(async (req, res) => {
    const assignments = await JudgeAssignment.find({
        judgeId: req.user._id
    })
    .populate("submissionId");

    return res.status(200).json(
        new ApiResponse(
            200,
            assignments,
            "Judge assignments fetched successfully"
        )
    );
});

const getAssignmentsByHackathon = asyncHandler(async (req, res) => {
    const { hackathonId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(hackathonId)) {
        throw new ApiError(400, "Invalid hackathon id");
    }

    const hackathon = await Hackathon.findById(hackathonId);

    if (!hackathon) {
        throw new ApiError(404, "Hackathon not found");
    }

    if (hackathon.organiserId.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "Only the hackathon organiser can view judge assignments"
        );
    }

    const assignments = await JudgeAssignment.find({
        hackathonId
    })
        .populate("judgeId", "name email avatar")
        .populate("submissionId");

    return res.status(200).json(
        new ApiResponse(
            200,
            assignments,
            "Judge assignments fetched successfully"
        )
    );
});



export { createJudgeAssignment, getMyJudgeAssignments, getAssignmentsByHackathon }