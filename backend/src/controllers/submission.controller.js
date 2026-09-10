import mongoose from "mongoose";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Project } from "../models/project.model.js";
import { Submission } from "../models/Submission.model.js";
import { Hackathon } from "../models/hackathon.model.js";

const submission = asyncHandler(async(req, res)=>{
    const { projectId } = req.body;

    if(!projectId){
        throw new ApiError(400, "Project id is required");
    }

    if(!mongoose.Types.ObjectId.isValid(projectId)){
        throw new ApiError(400, "Invalid project id")
    }

    const project = await Project.findById(projectId)

    if(!project){
        throw new ApiError(404, "Project not found")
    }

    const team = await Team.findById(project.teamId)
    
    if(!team){
        throw new ApiError(404, "Team not found")
    }

    const member = team.members.find(
        (member)=>
            member.userId.toString() === req.user._id.toString()
    )

    if(!member){
        throw new ApiError(403, "User does not belong to this team")
    }

    if(member.role !== "leader"){
        throw new ApiError(403, "Only the leader can submit the project");
    }

    const existingSubmission = await Submission.findOne({
        projectId
    });

    if(existingSubmission){
        throw new ApiError(409, "Final submission already exists for this project");
    }

    const hackathon = await Hackathon.findById(project.hackathonId)

    if(!hackathon){
        throw new ApiError(404, "Hackathon not found");
    }

    if(new Date() > hackathon.endTime){
        throw new ApiError(400, "Cannot submit after the hackathon end time")
    }

    if (!["ongoing"].includes(hackathon.status)) {
        throw new ApiError(
            400,
            "Project can only be submitted while the hackathon is ongoing"
        );
    }

    const finalSubmission = await Submission.create({
        projectId: project._id,
        hackathonId: project.hackathonId,
        submittedBy: req.user._id
    })

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                finalSubmission,
                "Project submitted successfully"
            )
        );
})

const getSubmissionsByHackathon = asyncHandler(async(req, res)=>{
    const { hackathonId } = req.params;

    if(!hackathonId){
        throw new ApiError(400, "Hackathon id is required")
    }

    if(!mongoose.Types.ObjectId.isValid(hackathonId)){
        throw new ApiError(400, "Invalid hackathon id")
    }

    const hackathon = await Hackathon.findById(hackathonId)

    if(!hackathon){
        throw new ApiError(404, "Hackathon not found");
    }

    const submissions = await Submission.find({ hackathonId })
        .populate({
            path: "projectId",
            select: "title description repositoryUrl demoUrl teamId"
        })
        .populate("submittedBy", "name email avatar");

    return res.status(200).json(
        new ApiResponse(
            200,
            submissions,
            "Submissions fetched successfully"
        )
    );

    
    
})

const getSubmissionByProject = asyncHandler(async (req, res) => {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
        throw new ApiError(400, "Invalid project id");
    }

    const submission = await Submission.findOne({ projectId })
        .populate("submittedBy", "name email avatar");

    if (!submission) {
        throw new ApiError(404, "Submission not found");
    }

    return res.status(200).json(
        new ApiResponse(
            200,
            submission,
            "Submission fetched successfully"
        )
    );
});

export { submission, getSubmissionsByHackathon, getSubmissionByProject }