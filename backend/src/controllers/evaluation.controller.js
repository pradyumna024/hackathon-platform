import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Hackathon } from "../models/hackathon.model.js";
import { Evaluation} from "../models/evaluation.model.js"
import { JudgeAssignment } from "../models/judgeAssignment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const createEvaluation = asyncHandler(async(req, res)=>{
    const {judgeAssignmentId, scores, feedback} = req.body;

    if (!judgeAssignmentId) {
        throw new ApiError(
            400,
            "Judge assignment id is required"
        );
    }

    if (!mongoose.Types.ObjectId.isValid(judgeAssignmentId)) {
        throw new ApiError(
            400,
            "Invalid judge assignment id"
        );
    }

    if(!Array.isArray(scores) || scores.length === 0){
        throw new ApiError(
            400,
            "Scores are required"
        );
    }

    const assignment = await JudgeAssignment.findById(
        judgeAssignmentId
    );

    if (!assignment) {
        throw new ApiError(
            404,
            "Judge assignment not found"
        );
    }

    if(assignment.judgeId.toString() !== req.user._id.toString()) {
        throw new ApiError(
            403,
            "You are not authorized to evaluate this submission"
        );
    }

    const existingEvaluation = await Evaluation.findOne({
        judgeAssignmentId
    })

    if (existingEvaluation) {
        throw new ApiError(
            409,
            "Evaluation already submitted for this assignment"
        );
    }

    const hackathon = await Hackathon.findById(assignment.hackathonId);

    if (!hackathon) {
        throw new ApiError(
            404,
            "Hackathon not found"
        );
    }

    for(const scoreItem of scores){
        const criterion = hackathon.judgingCriteria.id(
            scoreItem.criteriaId
        )

        if (!criterion) {
            throw new ApiError(
                400,
                "Invalid judging criteria"
            );
        }

        if (typeof scoreItem.score !== "number") {
        throw new ApiError(
            400,
            `Score for ${criterion.name} must be a number`
        );
    }

        if (
            scoreItem.score < 0 ||
            scoreItem.score > criterion.maxScore
        ) {
            throw new ApiError(
                400,
                `Score for ${criterion.name} must be between 0 and ${criterion.maxScore}`
            );
        }
    }

    if (scores.length !== hackathon.judgingCriteria.length) {
        throw new ApiError(
            400,
            "Scores must be provided for all judging criteria"
        );
    }

    const criteriaIds = scores.map(
        (item) => item.criteriaId.toString()
    );

    const uniqueCriteriaIds = new Set(criteriaIds);

    if (uniqueCriteriaIds.size !== criteriaIds.length) {
        throw new ApiError(
            400,
            "Duplicate judging criteria are not allowed"
        );
    }

    let totalScore = 0;

    for (const scoreItem of scores) {
        const criterion = hackathon.judgingCriteria.id(
            scoreItem.criteriaId
        );

        const normalizedScore =
            scoreItem.score / criterion.maxScore;

        totalScore += normalizedScore * criterion.weight;
    }
    totalScore = Number(totalScore.toFixed(2));

    const evaluation = await Evaluation.create({
        judgeAssignmentId,
        scores,
        totalScore,
        feedback
    });

    assignment.status = "completed";
    await assignment.save();

    return res.status(201).json(
        new ApiResponse(
            201,
            evaluation,
            "Evaluation submitted successfully"
        )
    );
})

const getEvaluationByAssignment = asyncHandler(async(req, res)=>{
    const { judgeAssignmentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(judgeAssignmentId)) {
        throw new ApiError(
            400,
            "Invalid judge assignment id"
        );
    }

    const assignment = await JudgeAssignment.findById(
        judgeAssignmentId
    );

    if (!assignment) {
        throw new ApiError(
            404,
            "Judge assignment not found"
        );
    }

    const hackathon = await Hackathon.findById(
        assignment.hackathonId
    );

    if (!hackathon) {
        throw new ApiError(
            404,
            "Hackathon not found"
        );
    }

    const isJudge =
        assignment.judgeId.toString() ===
        req.user._id.toString();

    const isOrganiser =
        hackathon.organiserId.toString() ===
        req.user._id.toString();

    if (!isJudge && !isOrganiser) {
        throw new ApiError(
            403,
            "You are not authorized to view this evaluation"
        );
    }

    const evaluation = await Evaluation.findOne({
        judgeAssignmentId
    });

    if (!evaluation) {
        throw new ApiError(
            404,
            "Evaluation not found"
        );
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            evaluation,
            "Evaluation fetched successfully"
        )
    );
})

const getEvaluationsByHackathon = asyncHandler(async (req, res) => {
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
            "Only the hackathon organiser can view all evaluations"
        );
    }

    const assignments = await JudgeAssignment.find({
        hackathonId
    }).select("_id");

    const assignmentIds = assignments.map(
        (assignment) => assignment._id
    );

    const evaluations = await Evaluation.find({
        judgeAssignmentId: {
            $in: assignmentIds
        }
    }).populate("judgeAssignmentId");

    return res.status(200).json(
        new ApiResponse(
            200,
            evaluations,
            "Evaluations fetched successfully"
        )
    );
});

export { createEvaluation, getEvaluationByAssignment, getEvaluationsByHackathon }