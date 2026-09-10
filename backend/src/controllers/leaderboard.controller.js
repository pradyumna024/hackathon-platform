import mongoose from "mongoose";

import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { Hackathon } from "../models/hackathon.model.js";
import { Submission } from "../models/submission.model.js";
import { JudgeAssignment } from "../models/judgeAssignment.model.js";
import { Evaluation } from "../models/evaluation.model.js";
import { Project } from "../models/project.model.js";
import { Team } from "../models/team.model.js";

const getLeaderboard = asyncHandler(async (req, res) => {
    const { hackathonId } = req.params;

    if (!hackathonId) {
        throw new ApiError(
            400,
            "Hackathon id is required"
        );
    }

    if (!mongoose.Types.ObjectId.isValid(hackathonId)) {
        throw new ApiError(
            400,
            "Invalid hackathon id"
        );
    }

    const hackathon = await Hackathon.findById(hackathonId);

    if (!hackathon) {
        throw new ApiError(
            404,
            "Hackathon not found"
        );
    }

    const submissions = await Submission.find({
        hackathonId
    });

    const leaderboard = [];

    for (const submission of submissions) {

        const assignments = await JudgeAssignment.find({
            submissionId: submission._id
        });

        const assignmentIds = assignments.map(
            (assignment) => assignment._id
        );

        const evaluations = await Evaluation.find({
            judgeAssignmentId: {
                $in: assignmentIds
            }
        });

        let total = 0;

        for (const evaluation of evaluations) {
            total += evaluation.totalScore;
        }

        const averageScore =
            evaluations.length > 0
                ? total / evaluations.length
                : 0;

        const project = await Project.findById(
            submission.projectId
        );

        if (!project) {
            continue;
        }

        const team = await Team.findById(
            project.teamId
        );

        if (!team) {
            continue;
        }

        leaderboard.push({
            submissionId: submission._id,
            projectId: project._id,
            projectTitle: project.title,
            teamId: team._id,
            teamName: team.name,
            averageScore: Number(
                averageScore.toFixed(2)
            ),
            judgeCount: evaluations.length
        });
    }

    leaderboard.sort(
        (a, b) =>
            b.averageScore - a.averageScore
    );

    const rankedLeaderboard = leaderboard.map(
        (item, index) => ({
            rank: index + 1,
            ...item
        })
    );

    return res.status(200).json(
        new ApiResponse(
            200,
            rankedLeaderboard,
            "Leaderboard fetched successfully"
        )
    );
});

export { getLeaderboard };